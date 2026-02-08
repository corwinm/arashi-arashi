# Phase 1 Data Model: Fix Remove Worktree Grouping

## Entities

### WorktreeEntry
- Fields
  - `id` (string): stable identifier for selection (e.g., repo + path hash).
  - `repository` (string): repository name or path label.
  - `path` (string): absolute worktree path.
  - `branch` (string | null): branch name if attached; null if detached.
  - `isMain` (boolean): true if main worktree.
  - `status` (enum): `present` | `prunable` | `dirty`.
  - `dirtyDetails` (string | null): optional details for dirty status.
  - `parentPath` (string | null): parent worktree path if this is a child.
  - `childrenPaths` (string[]): child worktree paths if this is a parent.

- Validation Rules
  - `path` must be absolute and canonical (realpath).
  - `status=prunable` if `path` does not exist on disk.
  - `status=dirty` only when `git status --porcelain` reports changes for that path.

- State Transitions
  - `present` -> `prunable` when directory removed from disk.
  - `present` -> `dirty` when uncommitted changes are detected.
  - `dirty` -> `present` when working tree becomes clean.

### WorktreeGroup
- Fields
  - `parent` (WorktreeEntry): the parent worktree entry.
  - `children` (WorktreeEntry[]): child entries grouped under the parent.
  - `orphans` (WorktreeEntry[]): entries with no detectable parent relationship.

- Validation Rules
  - Children must not be grouped by branch name alone.
  - A child with missing parent entry stays visible as orphan, not dirty.

## Relationships
- One `WorktreeEntry` (parent) can have many child `WorktreeEntry` entries.
- A `WorktreeEntry` can reference one `parentPath`.
