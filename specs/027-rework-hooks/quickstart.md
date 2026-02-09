# Quickstart: Rework Hooks

## Goal

Define global and repo-specific create hooks that run in the correct order with access to main, parent, and child repo context.

## Hook Placement

- Place global hooks in `.arashi/hooks/`:
  - `pre-create.sh` (runs before any worktrees are created)
  - `post-create.sh` (runs after all other hooks and all worktrees are created)
- Place repo-specific hooks in `.arashi/hooks/` using the child repo name:
  - `pre-create.<child-repo>.sh`
  - `post-create.<child-repo>.sh`

## Hook Order

1. Global `pre-create.sh`
2. Repo-specific `pre-create.<child-repo>.sh` (after child worktree exists)
3. Repo-specific `post-create.<child-repo>.sh`
4. Global `post-create.sh` (once, after all repos)

## Failure Behavior

- If any hook fails, the create operation stops immediately and the global post-create hook does not run.

## Context Availability

- Hooks run in the child worktree context for repo-specific hooks.
- Hooks receive references to the main repo and parent repo via environment variables documented in the hook contract.
