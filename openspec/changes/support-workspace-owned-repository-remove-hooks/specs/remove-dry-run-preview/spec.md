## ADDED Requirements

### Requirement: Remove dry-run previews workspace-owned repository scripts

Configured remove dry-run SHALL use the same qualified workspace repository-file candidates, compatible repository-local candidates, source collision rules, platform preflight, source metadata, and ordering as real remove without executing any hook or mutation.

#### Scenario: Qualified repository script is previewed

- **WHEN** `.arashi/hooks/pre-remove.api<ext>` is the selected repository source for target `api`
- **THEN** human and JSON dry-run identify repository scope, owner `api`, source kind `file`, and the exact qualified path
- **AND** no hook process executes

#### Scenario: Native repository forms collide during dry-run

- **WHEN** qualified workspace-owned and repository-local files claim the same lifecycle for one target
- **THEN** dry-run reports the same preflight ambiguity as real remove
- **AND** performs no worktree, branch, hook, configuration, or file mutation
