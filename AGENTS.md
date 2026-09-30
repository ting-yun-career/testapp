# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Git

### Safety

- **Never use `git stash`, for any reason.** Every requested change is isolated into its own branch or `git worktree`, which removes the situations that normally call for stashing. If a task seems to need it, that's a signal to use a branch/worktree instead, not to stash.
- To answer a read-only question about git history or a file's committed state (e.g. "did this predate my change," "what did this look like before"), use scoped, read-only commands — `git show HEAD:<path>`, `git diff HEAD -- <path>`, `git log -p <path>`. Never mutate the working tree (`git reset`, `git checkout --`, `git clean`) to answer a comparison question that doesn't require it.
- To revert or discard uncommitted changes, reset the whole project to the last commit (e.g. `git reset --hard HEAD`) rather than trying to scope a reset to individual files — every task is already isolated to its own branch or worktree, so there's nothing else in that tree needing protection from a whole-tree reset. Confirm with the user before discarding uncommitted work.
- Prefer an isolated `git worktree` for tasks that are independent of the current uncommitted state, so exploratory or destructive-adjacent git commands can't reach the main working directory (see "Worktree workflow" below for how). This doesn't apply to tasks that need to read or build on files that are uncommitted only in the main tree — those necessarily happen there.

### Worktree workflow

Create a worktree as a **sibling directory**, not nested inside the main repo tree — nesting risks a dev server's file watcher recursing into it.

```bash
git worktree add ../testapp-<short-feature-name> -b <feature-branch-name> main
```

To merge back: push the branch and open a PR (`gh pr create`) rather than merging directly into `main` — matches this repo's normal PR workflow regardless of whether a worktree was used.

If a merge or rebase produces conflicts:

1. `git status` to see which files are conflicted.
2. Resolve conflict markers based on understanding both sides' intent — never resolve code conflicts with `git checkout --ours`/`--theirs`. The one exception is a pure lockfile (`pnpm-lock.yaml`): regenerate it with `pnpm install` rather than hand-merging the diff.
3. Run lint/build/test before committing the resolution. A failure here is part of the conflict, not a separate problem — fix the code until they pass rather than committing broken code and patching it up in a follow-up commit. If the failure isn't clearly fixable, stop and ask instead of forcing a commit through.
4. If a conflict is substantive (both sides changed the same logic in incompatible ways), stop and ask rather than guess at intent.

### Commit scope

Each commit should be scoped to one issue or one feature, and should touch at most 10 files (fewer than 5 is ideal). If the uncommitted changes for a task are too large to fit that, split them into multiple commits rather than one large one.

## Repository layout

The active project lives in `myapp/` — see `myapp/AGENTS.md` for its architecture, commands, and testing conventions; nothing project-specific is duplicated here. The `silver4/` directory is a separate static landing page and is not related to `myapp/`.

## Adding a new project to this monorepo

**Never scaffold a new sub-project by hand — always use `scripts/new-project.sh --name <name> --type worker|page`** (see `--help` for the full behavior and options). `scripts/delete-project.sh --name <name>` is the teardown counterpart — destructive and not reversible for the Cloudflare side, with no confirmation prompt.
