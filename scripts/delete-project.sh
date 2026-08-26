#!/usr/bin/env bash
#
# Delete a project folder from this monorepo, including its Cloudflare
# resource (Worker or Pages project). The counterpart to new-project.sh.
#
# This automates the teardown checklist:
#   1. delete the Worker / Pages project on Cloudflare
#   2. remove the folder under testapp/
#   3. remove it from the pnpm workspace
#   4. reconcile the root lockfile
#   5. commit (and push) the removal
#
# Usage:
#   scripts/delete-project.sh --name <project-name> [options]
#
# Run with -h/--help for the full option list.
set -euo pipefail

log()  { printf '\n\033[1;36m▶ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$1" >&2; }
die()  { printf '\033[1;31mError: %s\033[0m\n' "$1" >&2; exit 1; }

usage() {
  cat <<'USAGE'
Usage: scripts/delete-project.sh --name <project-name> [options]

Options:
  --name NAME        Folder / project name to delete                [required]
  --type TYPE        "worker" or "page" — overrides auto-detection
  --cf-name NAME      Cloudflare Worker/Pages project name, if it ever
                       diverged from the folder name (defaults to --name)
  --keep-cloudflare   Don't touch Cloudflare — local cleanup only
  --keep-local        Don't touch the repo — Cloudflare cleanup only
  --no-push           Commit locally but skip git push
  --branch NAME       Commit/push to this branch instead of the current one
  -h, --help          Show this help

This is destructive and, for the Cloudflare resource, not reversible.
It does not prompt for confirmation — double-check --name before running.

Examples:
  scripts/delete-project.sh --name booking-widget
  scripts/delete-project.sh --name docs-site --keep-cloudflare
  scripts/delete-project.sh --name old-experiment --no-push
USAGE
}

NAME=""
TYPE=""
CF_NAME=""
KEEP_CLOUDFLARE=0
KEEP_LOCAL=0
DO_PUSH=1
BRANCH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="${2:-}"; shift 2 ;;
    --type) TYPE="${2:-}"; shift 2 ;;
    --cf-name) CF_NAME="${2:-}"; shift 2 ;;
    --keep-cloudflare) KEEP_CLOUDFLARE=1; shift ;;
    --keep-local) KEEP_LOCAL=1; shift ;;
    --no-push) DO_PUSH=0; shift ;;
    --branch) BRANCH="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) die "Unknown argument: $1 (see --help)" ;;
  esac
done

[[ -n "$NAME" ]] || { usage; die "--name is required"; }
[[ -z "$TYPE" || "$TYPE" == "worker" || "$TYPE" == "page" ]] || die "--type must be 'worker' or 'page'"
[[ "$NAME" =~ ^[a-z][a-z0-9-]*$ ]] || die "--name must be lowercase kebab-case, e.g. my-old-app"
[[ "$KEEP_CLOUDFLARE" == "1" && "$KEEP_LOCAL" == "1" ]] && die "--keep-cloudflare and --keep-local together leave nothing to do"

CF_NAME="${CF_NAME:-$NAME}"

command -v pnpm >/dev/null || die "pnpm is required on PATH"
command -v git  >/dev/null || die "git is required on PATH"

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

[[ -d "$NAME" ]] || die "$ROOT/$NAME does not exist"
grep -qE "\"$NAME\"" pnpm-workspace.yaml 2>/dev/null || warn "\"$NAME\" is not listed in pnpm-workspace.yaml — continuing anyway"

[[ -n "$BRANCH" ]] || BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# ---------------------------------------------------------------------------
# Detect the project type from what's on disk, unless overridden.
# ---------------------------------------------------------------------------
if [[ -z "$TYPE" ]]; then
  if [[ -f "$NAME/wrangler.jsonc" || -f "$NAME/wrangler.toml" ]]; then
    TYPE="worker"
  elif grep -qE "wrangler pages deploy" "$NAME/package.json" 2>/dev/null; then
    TYPE="page"
  elif [[ "$KEEP_CLOUDFLARE" == "1" ]]; then
    TYPE="unknown"
  else
    die "Couldn't detect project type from $NAME (no wrangler.jsonc, no 'wrangler pages deploy' script). Pass --type or --keep-cloudflare."
  fi
fi

# ---------------------------------------------------------------------------
# No confirmation prompt — this runs immediately. This is destructive and,
# for the Cloudflare resource, not reversible.
# ---------------------------------------------------------------------------
log "Deleting: $NAME"
[[ "$KEEP_CLOUDFLARE" == "1" ]] || echo "  - Cloudflare $TYPE \"$CF_NAME\" (permanent, cannot be undone)"
[[ "$KEEP_LOCAL" == "1" ]] || echo "  - $ROOT/$NAME"
[[ "$KEEP_LOCAL" == "1" ]] || echo "  - the \"$NAME\" entry in pnpm-workspace.yaml"
[[ "$KEEP_LOCAL" == "1" ]] || echo "  - a commit on branch \"$BRANCH\"$( [[ "$DO_PUSH" == "1" ]] && echo " (pushed to origin)" )"

# ---------------------------------------------------------------------------
# 1. Delete the Cloudflare resource first — if this fails, nothing local
#    has been touched yet and the command can just be retried.
# ---------------------------------------------------------------------------
if [[ "$KEEP_CLOUDFLARE" != "1" ]]; then
  cd "$ROOT/$NAME"
  if [[ "$TYPE" == "worker" ]]; then
    log "Deleting Cloudflare Worker \"$CF_NAME\""
    pnpm exec wrangler delete "$CF_NAME" --force || \
      warn "Worker deletion failed (already deleted? not authenticated?) — continuing with local cleanup"
  else
    log "Deleting Cloudflare Pages project \"$CF_NAME\""
    pnpm exec wrangler pages project delete "$CF_NAME" --yes || \
      warn "Pages project deletion failed (already deleted? not authenticated?) — continuing with local cleanup"
  fi
  cd "$ROOT"
else
  warn "Skipping Cloudflare deletion (--keep-cloudflare)"
fi

[[ "$KEEP_LOCAL" == "1" ]] && { warn "Skipping local cleanup (--keep-local)"; log "Done: Cloudflare $TYPE \"$CF_NAME\""; exit 0; }

# ---------------------------------------------------------------------------
# 2. Local cleanup: folder, workspace entry, lockfile, commit (and push).
#    Roll back local changes if anything fails before the commit lands —
#    this can't undo the Cloudflare deletion above, only the git side.
# ---------------------------------------------------------------------------
ROLLBACK=1
cleanup() {
  if [[ "${ROLLBACK:-0}" == "1" ]]; then
    warn "Failed — restoring local files for $NAME"
    cd "$ROOT"
    git checkout -- "$NAME" pnpm-workspace.yaml pnpm-lock.yaml 2>/dev/null || true
  fi
}
trap cleanup ERR

log "Removing $NAME"
rm -rf "$NAME"

log "Removing $NAME from pnpm-workspace.yaml"
grep -vE "^\s*-\s*[\"']$NAME[\"']\s*\$" pnpm-workspace.yaml > pnpm-workspace.yaml.tmp
mv pnpm-workspace.yaml.tmp pnpm-workspace.yaml

log "Running pnpm install from repo root"
pnpm install

log "Committing removal of $NAME"
git add -A -- "$NAME" pnpm-workspace.yaml pnpm-lock.yaml
if git diff --cached --quiet; then
  warn "Nothing to commit"
else
  git commit -m "chore: remove $NAME project"
fi

# Past this point, local files are committed (or there was nothing to
# commit) — don't roll back on a later push failure.
ROLLBACK=0
trap - ERR

if [[ "$DO_PUSH" == "1" ]]; then
  log "Pushing $BRANCH to origin"
  git push origin "HEAD:$BRANCH"
else
  warn "Skipping git push (--no-push)"
fi

log "Done: $NAME removed"
