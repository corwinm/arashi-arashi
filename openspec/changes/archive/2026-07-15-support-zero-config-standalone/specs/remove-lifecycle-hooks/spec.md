## ADDED Requirements

### Requirement: Standalone remove preserves user-global lifecycle hooks
`arashi remove` in implicit standalone mode SHALL execute applicable user-global `pre-remove` and `post-remove` hooks with the existing destructive-operation gate, finalization, context, and failure-result contracts.

#### Scenario: Standalone pre-remove hooks succeed
- **WHEN** all applicable standalone user-global `pre-remove` hooks succeed after confirmation
- **THEN** Arashi proceeds with the planned standalone worktree and branch removals

#### Scenario: Standalone pre-remove hook fails
- **WHEN** an applicable standalone user-global `pre-remove` hook fails or times out
- **THEN** Arashi aborts before removing worktrees or deleting branches
- **AND** reports the hook source and failure

#### Scenario: Standalone removal partially fails
- **WHEN** one or more standalone remove operations fail after successful pre-remove hooks
- **THEN** applicable user-global `post-remove` hooks still run once after operation attempts complete
- **AND** the final result preserves both removal and hook failures

#### Scenario: Standalone remove hook receives context
- **WHEN** a user-global remove hook runs for an implicit standalone workspace
- **THEN** `ARASHI_*` context identifies standalone mode, main-root basename, main repository path, target branch/worktree, hook scope, and source path
