# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Git

### Safety

- **Never use `git stash`.** Use a branch or worktree instead.
- For read-only history questions, use `git show HEAD:<path>`, `git diff HEAD -- <path>`, or `git log -p <path>` — never `git reset`/`checkout --`/`clean`.
- To discard uncommitted changes, `git reset --hard HEAD` the whole project, not per-file. Confirm with the user first.
- Prefer an isolated `git worktree` for tasks independent of current uncommitted state (see Worktree workflow below). Skip this if the task needs uncommitted files that only exist in the main tree.
- `git add` a newly-created file immediately, before doing anything else with it.
- Before every commit, check `git status` and confirm every staged file is one you intend to commit — not just that your target file is staged.

### Worktree workflow

Create as a **sibling directory**, not nested inside the repo.

```bash
git worktree add ../testapp-<short-feature-name> -b <feature-branch-name> main
```

To merge back: push and open a PR (`gh pr create`) — don't merge directly into `main`.

On merge/rebase conflicts:

1. `git status` to see conflicted files.
2. Resolve conflict markers by understanding both sides' intent — never `--ours`/`--theirs` on code. Exception: regenerate `pnpm-lock.yaml` with `pnpm install` instead of hand-merging.
3. Run lint/build/test before committing. Fix failures now, don't commit broken code — if unclear how, stop and ask.
4. If both sides changed the same logic incompatibly, stop and ask — don't guess.

### Commit scope

Scope each commit to one issue/feature, ≤10 files (ideally <5). Split larger changes into multiple commits.

## Code quality

- Handle common HTTP error codes explicitly (401, 429, 5xx, etc.) — never leak raw exception/response text to the client.
- Add UI tests covering how the UI responds to each handled error case.
- Form fields: implement validation, accessibility, and security. Exception: client-only fields holding transient data (search strings, filter params).

## Repository layout

Active project: `myapp/` — see `myapp/AGENTS.md` for details, not duplicated here. `silver4/` is unrelated.

## Adding a new project to this monorepo

**Never scaffold a sub-project by hand — use `scripts/new-project.sh --name <name> --type worker|page`** (`--help` for options). `scripts/delete-project.sh --name <name>` tears down — destructive, no confirmation.
