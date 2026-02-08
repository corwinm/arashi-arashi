# Phase 1 Data Model: Pull Command

## Entities

### WorkspaceConfiguration

- **Attributes**: repository list, repository identifiers, repository paths
- **Relationships**: 1-to-many with Repository

### Repository

- **Attributes**: identifier, local path, remote reference, working state (clean/dirty)
- **Relationships**: belongs to WorkspaceConfiguration; has many PullResults over time

### RemoteChangeStatus

- **Attributes**: repository identifier, hasRemoteChanges (yes/no), checkedAt
- **Relationships**: derived from Repository

### PullResult

- **Attributes**: repository identifier, status (updated/skipped/failed/manual-update), elapsedTime, errorMessage (optional)
- **Relationships**: derived from Repository and RemoteChangeStatus

## Validation Rules

- Repository identifiers must be unique within a WorkspaceConfiguration.
- A PullResult must include a status and elapsed time for every processed repository.
- Manual-update status must include a human-readable error reason.

## State Transitions

- Repository: clean → updated (on successful pull)
- Repository: dirty + remote changes → manual-update (on conflict/error and rollback)
- Repository: clean + no remote changes → skipped
