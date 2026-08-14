## Why

Configured `arashi remove` currently follows repository discovery order, which places the coordinated parent worktree before nested child worktrees. Removing the parent recursively deletes the child paths before their owning repositories can deregister them, so a successful-looking removal can leave prunable Git worktree registrations that require `arashi doctor` and `arashi prune` to recover.

## What Changes

- Define dependency-safe coordinated removal planning that expands any targeted ancestor to its nested child worktrees and deregisters those descendants before the ancestor.
- Require dry-run, JSON, human preview, and real execution to use the same explicit child-first worktree plan.
- Preserve truthful partial-failure reporting with repository and path attribution when an operation fails, while continuing eligible independent removals and finalization behavior.
- Add real-Git integration coverage proving parent and nested child paths and registrations are removed without newly prunable metadata.
- Preserve standalone removal and existing keep-branch, keep-worktree, hook, dirty-check, and confirmation semantics.

## Capabilities

### New Capabilities

- `coordinated-worktree-removal`: Dependency-safe planning and execution for removing configured parent and nested child worktrees, including partial-failure and post-removal registration guarantees.

### Modified Capabilities

- `remove-dry-run-preview`: Require configured dry-run previews, including JSON operation arrays, to expose the same child-first worktree ordering used by real execution.

## Impact

- Affected implementation: configured remove planning/execution in `repos/arashi/src/commands/remove.ts` and shared helpers if extracted.
- Affected tests: focused planning tests plus a real temporary configured workspace with a parent repository and nested child repositories.
- Affected output: ordering of configured `worktree_remove` operations in human and JSON dry-run/results; envelope and operation record shapes remain unchanged.
- No new CLI options, configuration fields, schema changes, dependencies, or standalone behavior changes.
