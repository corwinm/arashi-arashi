## ADDED Requirements

### Requirement: Prune operates on implicit standalone metadata
`arashi prune` and its dry-run mode SHALL discover and process Git-prunable worktree metadata for the resolved standalone repository without configured repository entries.

#### Scenario: Standalone stale metadata is previewed
- **WHEN** a user runs `arashi prune --dry-run` in an implicit standalone workspace with stale metadata
- **THEN** Arashi reports exact prunable entries, paths, reasons when available, and totals
- **AND** does not prune metadata

#### Scenario: Standalone metadata is pruned
- **WHEN** a user confirms mutating standalone prune behavior
- **THEN** Arashi prunes only the resolved repository's eligible Git worktree metadata
- **AND** reports success, skipped, and failure results through existing human or JSON contracts

#### Scenario: Invocation starts in linked worktree
- **WHEN** prune runs from a standalone linked worktree
- **THEN** it resolves and operates on the main repository's shared worktree metadata
