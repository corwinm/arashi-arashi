## ADDED Requirements

### Requirement: Configured create JSON reports the authoritative destination plan

Configured `create --json` success, dry-run, and destination-collision failure envelopes SHALL expose parent and child destinations from the same authoritative configured plan used by human output, collision preflight, and execution. The plan order SHALL be the configured parent first when selected, followed by selected child repositories in their deterministic discovery/filter order; excluding the parent SHALL leave the selected children in that same relative order. Successful execution SHALL preserve that order and the existing `data.repositories[]` record shape, reporting each destination at `data.repositories[].worktreePath`. Dry-run SHALL preserve `data.repositories` as the execution-result list and report prospective records in that same order at `data.dryRunOutcome.plannedWorktrees[]`, where every record contains `branchName`, `planStatus`, `repositoryName`, and `worktreePath`; `worktreePath` is an absolute string or `null` only when planning cannot resolve one. Destination preflight SHALL traverse this order. A collision SHALL use error code `WORKTREE_DESTINATION_COLLISION` and report exactly the first colliding plan record at `error.details.conflict` with `repositoryName` and absolute `worktreePath`; later collisions SHALL NOT replace or reorder that record. No replacement destination field or duplicate plan is introduced. The destination values SHALL reflect `<canonical repository naming component>/<branch>` for a configured bare parent and `<branch>` for a configured non-bare parent beneath the effective base, while preserving the standard one-document envelope and stdout-isolation contracts.

#### Scenario: Bare create JSON reports corrected destination

- **WHEN** configured bare create for repository component `example` and branch `feature/auth` succeeds with `--json`
- **THEN** `data.repositories[].worktreePath` reports the parent destination beneath the effective base as `example/feature/auth`
- **AND** child records in `data.repositories[]` report destinations rooted at that exact parent destination plus each configured child path

#### Scenario: Non-bare dry-run JSON matches human preview

- **WHEN** configured non-bare create for branch `feature/auth` is previewed in human and `--dry-run --json` modes
- **THEN** human preview and `data.dryRunOutcome.plannedWorktrees[].worktreePath` report the same parent destination ending in `feature/auth`
- **AND** neither reports a repository-prefixed destination
- **AND** each prospective JSON record contains `branchName`, `planStatus`, `repositoryName`, and `worktreePath`, while `data.repositories` remains the execution-result list
- **AND** dry-run performs no mutation

#### Scenario: JSON collision result uses the planned destination

- **WHEN** configured create JSON mode detects a parent or child destination collision
- **THEN** stdout contains exactly one failure envelope with code `WORKTREE_DESTINATION_COLLISION`
- **AND** `error.details.conflict.repositoryName` and `error.details.conflict.worktreePath` identify the same resolved destination used by preflight
- **AND** stderr is empty and tests confirm that managed-ignore files, hooks, branches, worktrees, directories, and other filesystem state were not mutated

#### Scenario: JSON ordering and multi-collision selection are deterministic

- **WHEN** the configured parent and multiple selected child repositories are planned for JSON create
- **THEN** success `data.repositories[]` and dry-run `data.dryRunOutcome.plannedWorktrees[]` place the selected parent first and preserve deterministic selected-child discovery/filter order
- **AND WHEN** more than one destination in that ordered plan collides
- **THEN** `error.details.conflict` identifies the first colliding plan record and later collisions do not change the reported record

#### Scenario: Existing worktree JSON preserves registered path

- **WHEN** a JSON-capable lifecycle command reports an existing worktree created under the prior inverted layout
- **THEN** it reports the exact Git-registered path without rewriting it according to the corrected create rule
- **AND** the envelope does not claim migration or rename activity
