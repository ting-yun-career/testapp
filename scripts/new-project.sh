#!/usr/bin/env bash
#
# Scaffold a new Vite + React + TypeScript project as a folder in this
# monorepo, wire it into the pnpm workspace, commit/push it, then create
# and deploy the matching Cloudflare resource (Worker or Pages project).
#
# This automates the "every time I start something new" checklist:
#   1. new folder under testapp/
#   2. vite init (react-ts)
#   3. push to the remote repo
#   4. create the Worker/Pages project on Cloudflare
#   5. configure it to serve from the new folder
#
# Usage:
#   scripts/new-project.sh --name <project-name> --type worker|page [options]
#
# Run with -h/--help for the full option list.
set -euo pipefail

log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$1" >&2; }
die()  { printf '\033[1;31mError: %s\033[0m\n' "$1" >&2; exit 1; }

usage() {
  cat <<'USAGE'
Usage: scripts/new-project.sh --name <project-name> --type worker|page [options]

Options:
  --name NAME     Folder / project name, lowercase kebab-case      [required]
  --type TYPE     "worker" (Cloudflare Worker + SPA) or
                   "page"   (static Vite app on Cloudflare Pages)  [required]
  --no-push       Scaffold and commit locally, skip git push
  --no-deploy     Skip Cloudflare project creation/deploy (local scaffold only)
  --branch NAME   Commit/push to this branch instead of the current one
  -h, --help      Show this help

Examples:
  scripts/new-project.sh --name booking-widget --type worker
  scripts/new-project.sh --name docs-site --type page --no-deploy
USAGE
}

NAME=""
TYPE=""
DO_PUSH=1
DO_DEPLOY=1
BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="${2:-}"; shift 2 ;;
    --type) TYPE="${2:-}"; shift 2 ;;
    --no-push) DO_PUSH=0; shift ;;
    --no-deploy) DO_DEPLOY=0; shift ;;
    --branch) BRANCH="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1 (see --help)" ;;
  esac
done

[[ -n "$NAME" ]] || { usage; die "--name is required"; }
[[ "$TYPE" == "worker" || "$TYPE" == "page" ]] || { usage; die "--type must be 'worker' or 'page'"; }
[[ "$NAME" =~ ^[a-z][a-z0-9-]*$ ]] || die "--name must be lowercase kebab-case, e.g. my-new-app"

command -v pnpm >/dev/null || die "pnpm is required on PATH"
command -v git  >/dev/null || die "git is required on PATH"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

[[ -e "$NAME" ]] && die "$ROOT/$NAME already exists"
[[ -f pnpm-workspace.yaml ]] || die "pnpm-workspace.yaml not found at repo root"
grep -qE "\"$NAME\"" pnpm-workspace.yaml && die "\"$NAME\" is already listed in pnpm-workspace.yaml"

[[ -n "$BRANCH" ]] || BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# Roll back local scaffold if we fail before anything is committed. Once a
# commit lands, an automatic rm -rf is no longer clearly correct, so the
# trap is disarmed right after the commit step below.
ROLLBACK=1
cleanup() {
  if [[ "${ROLLBACK:-0}" == "1" ]]; then
    warn "Failed — rolling back local scaffold for $NAME"
    cd "$ROOT"
    rm -rf "$NAME"
    git checkout -- pnpm-workspace.yaml pnpm-lock.yaml 2>/dev/null || true
  fi
}
trap cleanup ERR

TODAY="$(date +%Y-%m-%d)"

# ---------------------------------------------------------------------------
# 1. Scaffold with Vite (React + TypeScript)
# ---------------------------------------------------------------------------
log "Scaffolding $NAME with Vite (react-ts)"
# --no-interactive: create-vite (v9+) prompts for a linter choice and
#   "install + start dev server now?" even with --template given, and
#   defaults to interactive whenever stdin is a real TTY. Force it off so
#   this always runs unattended.
# --no-immediate: don't let create-vite install deps or launch `vite dev`
#   itself — we add workspace deps and never want a dev server started
#   from a script (it would just hang, or crash on a stale global store).
# --eslint: match the rest of this monorepo (myapp uses ESLint, not the
#   Oxlint default).
pnpm create vite@latest "$NAME" --template react-ts --no-interactive --no-immediate --eslint

cd "$ROOT/$NAME"

# ---------------------------------------------------------------------------
# 2. Register the project in the pnpm workspace, then install
# ---------------------------------------------------------------------------
log "Adding $NAME to pnpm-workspace.yaml"
cd "$ROOT"
# Insert right after the "packages:" line, matching this repo's existing
# list style (one quoted entry per line).
awk -v name="$NAME" '
  { print }
  /^packages:/ && !done { print "  - \"" name "\""; done=1 }
' pnpm-workspace.yaml > pnpm-workspace.yaml.tmp
mv pnpm-workspace.yaml.tmp pnpm-workspace.yaml

cd "$ROOT/$NAME"

if [[ "$TYPE" == "worker" ]]; then
  log "Adding Cloudflare Worker dependencies"
  pnpm add -D wrangler @cloudflare/vite-plugin
else
  log "Adding wrangler (for Cloudflare Pages deploys)"
  pnpm add -D wrangler
fi

# ---------------------------------------------------------------------------
# 3. Project-type-specific files
# ---------------------------------------------------------------------------
if [[ "$TYPE" == "worker" ]]; then
  log "Writing worker/index.ts"
  mkdir -p worker
  cat > worker/index.ts <<EOF
export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return Response.json({ message: 'Hello from the $NAME worker' })
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
EOF

  log "Writing wrangler.jsonc"
  cat > wrangler.jsonc <<EOF
{
  "\$schema": "node_modules/wrangler/config-schema.json",
  "name": "$NAME",
  "main": "worker/index.ts",
  "compatibility_date": "$TODAY",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "not_found_handling": "single-page-application",
    "binding": "ASSETS",
    "run_worker_first": true
  },
  "observability": {
    "enabled": true
  }
}
EOF

  log "Wiring the Cloudflare Vite plugin into vite.config.ts"
  cat > vite.config.ts <<'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cloudflare } from '@cloudflare/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
})
EOF

  log "Adding tsconfig.worker.json"
  cat > tsconfig.worker.json <<'EOF'
{
  "extends": "./tsconfig.node.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.worker.tsbuildinfo",
    "types": ["./worker-configuration.d.ts", "vite/client"]
  },
  "include": ["worker"]
}
EOF

  log "Updating package.json scripts + tsconfig.json references"
  PROJECT_NAME="$NAME" node <<'NODE'
const fs = require('fs')

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.private = true
Object.assign(pkg.scripts, {
  prebuild: 'wrangler types',
  build: 'tsc -b && vite build',
  deploy: 'pnpm run build && wrangler deploy',
  'cf-typegen': 'wrangler types',
})
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')

const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'))
tsconfig.references ??= []
if (!tsconfig.references.some((r) => r.path === './tsconfig.worker.json')) {
  tsconfig.references.push({ path: './tsconfig.worker.json' })
}
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2) + '\n')
NODE

  log "Appending Cloudflare entries to .gitignore"
  cat >> .gitignore <<'EOF'

# wrangler
.wrangler
.dev.vars*
!.dev.vars.example
EOF

  log "Generating Worker types (wrangler types)"
  pnpm exec wrangler types || warn "wrangler types failed — run 'pnpm cf-typegen' manually after auth/setup"

else
  log "Adding Cloudflare Pages deploy script"
  PROJECT_NAME="$NAME" node <<'NODE'
const fs = require('fs')

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const name = process.env.PROJECT_NAME
Object.assign(pkg.scripts, {
  deploy: `vite build && wrangler pages deploy dist --project-name ${name}`,
})
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n')
NODE
fi

# ---------------------------------------------------------------------------
# 4. Reconcile the root lockfile (required whenever a project is added —
#    see "Adding a new project to this monorepo" in CLAUDE.md)
# ---------------------------------------------------------------------------
log "Running pnpm install from repo root"
cd "$ROOT"
pnpm install

# ---------------------------------------------------------------------------
# 5. Commit (and push)
# ---------------------------------------------------------------------------
log "Committing scaffold for $NAME"
git add "$NAME" pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "feat: scaffold $NAME ($TYPE)"

# Past this point, local files are committed — don't auto-delete on later
# failure (e.g. a deploy error). The user can fix and retry manually.
ROLLBACK=0
trap - ERR

if [[ "$DO_PUSH" == "1" ]]; then
  log "Pushing $BRANCH to origin"
  git push origin "HEAD:$BRANCH"
else
  warn "Skipping git push (--no-push)"
fi

# ---------------------------------------------------------------------------
# 6. Create + deploy the Cloudflare resource
# ---------------------------------------------------------------------------
if [[ "$DO_DEPLOY" == "1" ]]; then
  cd "$ROOT/$NAME"
  if [[ "$TYPE" == "worker" ]]; then
    log "Building and deploying the $NAME Worker"
    pnpm run build
    pnpm exec wrangler deploy
  else
    log "Creating the $NAME Pages project (no-op if it already exists)"
    pnpm exec wrangler pages project create "$NAME" --production-branch "$BRANCH" || \
      warn "Pages project create failed/already exists — continuing to deploy"
    log "Building and deploying $NAME to Cloudflare Pages"
    pnpm run build
    pnpm exec wrangler pages deploy dist --project-name "$NAME"
  fi
else
  warn "Skipping Cloudflare deploy (--no-deploy). Run 'pnpm --dir $NAME run deploy' when ready."
fi

log "Done: $ROOT/$NAME ($TYPE)"
