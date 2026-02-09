# Data Model: Sync Command

## Entities

### WorkspaceConfiguration

- **name**: Human-readable workspace identifier.
- **repositories**: List of managed repositories.
- **timeoutSeconds**: Maximum duration allowed per repository action.

### Repository

- **name**: Repository identifier used in output and filtering.
- **path**: Location of the repository within the workspace.
- **currentBranch**: Branch checked out at sync start.
- **targetBranch**: Parent repository branch to align to.

### SyncResult

- **repositoryName**: Repository identifier.
- **targetBranch**: Branch name used for alignment.
- **status**: One of `success`, `failure`, `timeout`.
- **durationMs**: Time taken to complete the repository action.
- **createdBranch**: Whether the target branch was created during sync.
- **errorMessage**: Reason for failure or timeout when applicable.

## Relationships

- **WorkspaceConfiguration** has many **Repository** entries.
- **Repository** has one **SyncResult** per sync run.

## State Transitions

- `pending` → `in_progress` → `success`
- `pending` → `in_progress` → `failure`
- `pending` → `in_progress` → `timeout`
