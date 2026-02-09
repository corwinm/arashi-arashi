# Data Model: Fix create --dry-run

## Entities

### Planned Worktree

- **Represents**: A proposed worktree and branch that would be created in a real run.
- **Fields**:
  - **Repository Name**: Identifies the repository the worktree belongs to.
  - **Worktree Path**: Target path for the worktree.
  - **Branch Name**: Target branch to be created or used.
  - **Plan Status**: Actionable or blocked for this item.
- **Validation Rules**:
  - Worktree Path and Branch Name must be non-empty.
  - Repository Name must match a configured repository.

### Conflict

- **Represents**: A detected issue that would prevent creation.
- **Fields**:
  - **Conflict Type**: Existing path, existing branch, permission issue, or invalid configuration.
  - **Scope**: Repository and target (path or branch) the conflict applies to.
  - **Message**: Human-readable explanation.
  - **Blocking**: Indicates whether the conflict blocks creation.
- **Validation Rules**:
  - Conflict Type and Scope must be present.

### Dry-run Outcome

- **Represents**: Summary of the dry-run result.
- **Fields**:
  - **Overall Status**: Actionable or blocked.
  - **Planned Worktrees**: Collection of Planned Worktree entities.
  - **Conflicts**: Collection of Conflict entities.
  - **Summary Counts**: Totals for planned items and conflicts.
- **Validation Rules**:
  - Overall Status must reflect conflicts marked as blocking.

## Relationships

- A Dry-run Outcome includes zero or more Planned Worktrees.
- A Dry-run Outcome includes zero or more Conflicts.
- Conflicts may reference a Planned Worktree by shared repository or target values.
