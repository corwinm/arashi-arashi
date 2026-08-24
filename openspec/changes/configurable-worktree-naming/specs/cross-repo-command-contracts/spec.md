## ADDED Requirements

### Requirement: Coordinated validation enforces configured naming policy

The meta repository SHALL provide a deterministic semantic contract check that compares the CLI-generated configuration schema and maintained CLI guidance with canonical website authored/generated guidance and source/extracted packaged-skill guidance for `worktreeNaming`. The check MUST compare exact closed values, compatibility defaults, representative default/branch/repo-branch preserve/flatten destinations, unchanged Git branch identity, configured-only direct-JSON scope, collision semantics, existing-worktree compatibility, coordinated child placement, and standalone isolation rather than checking only that words or fields are present.

#### Scenario: Coordinated artifacts agree

- **WHEN** the canonical aggregate contract command validates final CLI, docs, generated exports, and packaged-skill artifacts
- **THEN** it succeeds only when every naming-policy value and semantic qualification agrees across repositories
- **AND** uses the existing aggregate workflow rather than feature-specific workflow YAML

#### Scenario: Semantic drift is detected

- **WHEN** an out-of-repository fixture changes or removes an enum value, compatibility default, representative destination, JSON-authored scope, branch-identity guarantee, collision rule, compatibility rule, coordinated-child rule, or standalone rule in one consumer
- **THEN** the focused checker and canonical aggregate fail without mutating real worktrees
