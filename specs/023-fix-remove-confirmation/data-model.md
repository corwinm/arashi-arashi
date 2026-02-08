# Data Model: Fix Remove Command Confirmation

## Entities

### WorktreeSelection

- Fields:
  - `selectedWorktrees`: string[] (worktree identifiers or paths)
  - `submittedAt`: string (ISO timestamp)
  - `source`: "interactive"
- Validation rules:
  - Must be an array (may be empty if user submits without selection)
  - If empty, a clear message must be shown and the flow must remain controlled

### RemovalConfirmation

- Fields:
  - `confirmed`: boolean
  - `requestedAt`: string (ISO timestamp)
  - `context`: "selection" | "branch"
  - `targets`: string[] (worktree ids or branch inputs)
- Validation rules:
  - `confirmed` must be explicitly set by the user before any removal
  - If `confirmed` is false, no removals occur

### BranchInput

- Fields:
  - `branches`: string[]
  - `resolvedWorktrees`: string[]
  - `invalidBranches`: string[]
- Validation rules:
  - All provided branch names must resolve to a worktree; invalid entries cause an error and abort removal

## Relationships

- A `WorktreeSelection` can lead to a `RemovalConfirmation` with `context="selection"`.
- A `BranchInput` can lead to a `RemovalConfirmation` with `context="branch"`.

## State Transitions

- Worktree selection: `idle -> selecting -> submitted -> (confirmed | cancelled)`
- Confirmation: `pending -> confirmed -> removed` or `pending -> declined -> exited`
