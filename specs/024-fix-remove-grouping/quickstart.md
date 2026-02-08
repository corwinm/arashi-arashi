# Phase 1 Quickstart: Fix Remove Worktree Grouping

## Prerequisites
- Bun installed
- A workspace with a meta repo and at least one child repo worktree

## Run the remove list (dev)

```bash
cd repos/arashi
bun install
bun run dev -- remove --json
```

## Manual validation checklist
- Create a parent worktree and two child worktrees with different branch names.
- Run `bun run dev -- remove --json` and verify children are grouped under the parent.
- Delete one child worktree directory on disk.
- Re-run the command and verify the missing entry is labeled `prunable`.

## Tests (when implemented)

```bash
cd repos/arashi
bun test tests/integration/remove.us1.test.ts
bun test tests/integration/remove.us2.test.ts
```
