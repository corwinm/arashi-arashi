## MODIFIED Requirements

### Requirement: Configured create JSON reports the authoritative destination plan

Configured `create --json` success, dry-run, invalid-naming-configuration, and destination-collision failure envelopes SHALL preserve the established one-document stdout-isolation contract while reflecting the effective configured naming policy. Success, dry-run, and collision destinations MUST come from the same immutable authoritative configured plan used by human output, collision preflight, and execution. The plan order SHALL be the configured parent first when selected, followed by selected child repositories in deterministic discovery/filter order; excluding the parent SHALL leave selected children in that same relative order. Successful execution SHALL preserve that order and the existing `data.repositories[]` record shape, reporting each destination at `data.repositories[].worktreePath`. Dry-run SHALL preserve `data.repositories` as the execution-result list and report prospective records in that same order at `data.dryRunOutcome.plannedWorktrees[]`, where every record contains `branchName`, `planStatus`, `repositoryName`, and `worktreePath`; `worktreePath` is an absolute string or `null` only when planning cannot resolve one. Destination preflight SHALL traverse this order. A resolved collision SHALL use error code `WORKTREE_DESTINATION_COLLISION` and report exactly the first colliding plan record at `error.details.conflict` with `repositoryName` and absolute `worktreePath`; later collisions SHALL NOT replace or reorder that record. Invalid `worktreeNaming` SHALL instead use the established invalid-configuration envelope before a destination plan exists and SHALL NOT be mislabeled as a collision. No replacement destination field or duplicate plan is introduced. Destination values SHALL follow omission/default corrected topology, `branch`, or `repo-branch` style plus `preserve` or `flatten` slash policy exactly, while `branchName` continues reporting the unmodified Git branch.

#### Scenario: Bare create JSON reports corrected destination

- **WHEN** configured bare create for repository component `example` and branch `feature/auth` succeeds with `--json` under omitted policy or explicit `default` and `preserve`
- **THEN** `data.repositories[].worktreePath` reports the parent destination beneath the effective base as `example/feature/auth`
- **AND** `branchName` remains `feature/auth`
- **AND** child records in `data.repositories[]` report destinations rooted at that exact parent destination plus each configured child path

#### Scenario: Non-bare dry-run JSON matches human preview

- **WHEN** configured non-bare create for branch `feature/auth` is previewed in human and `--dry-run --json` modes under omitted policy or explicit `default` and `preserve`
- **THEN** human preview and `data.dryRunOutcome.plannedWorktrees[].worktreePath` report the same parent destination ending in `feature/auth`
- **AND** neither reports a repository-prefixed destination
- **AND** each prospective JSON record contains exact `branchName: "feature/auth"`, `planStatus`, `repositoryName`, and `worktreePath`, while `data.repositories` remains the execution-result list
- **AND** dry-run performs no mutation

#### Scenario: Every configured naming policy changes values but not shape

- **WHEN** configured create success and dry-run render the same repository `example` and Git branch `feature/auth` under every supported style and slash-policy combination
- **THEN** destination values are respectively `feature/auth` or `example/feature/auth` for compatibility topology as applicable, `feature/auth` for `branch` preserve, `feature-auth` for `branch` flatten, `example-feature/auth` for `repo-branch` preserve, and `example-feature-auth` for `repo-branch` flatten
- **AND** the existing envelope, record field names, record order, omission/null rules, and exact `branchName: "feature/auth"` remain unchanged
- **AND** human preview, JSON dry-run, JSON success, and execution consume the same policy-specific plan

#### Scenario: JSON collision result uses the planned destination

- **WHEN** configured create JSON mode detects a parent or child destination collision, including a flattened-slash alias
- **THEN** stdout contains exactly one failure envelope with code `WORKTREE_DESTINATION_COLLISION`
- **AND** `error.details.conflict.repositoryName` and `error.details.conflict.worktreePath` identify the same resolved destination used by preflight
- **AND** stderr is empty and tests confirm that managed-ignore files, hooks, branches, worktrees, directories, and other filesystem state were not mutated

#### Scenario: Invalid naming config is distinct from collision JSON

- **WHEN** configured create JSON loads malformed `worktreeNaming` or an unsupported nested value
- **THEN** stdout contains exactly one established invalid-configuration failure envelope
- **AND** the code is not `WORKTREE_DESTINATION_COLLISION` and `error.details.conflict` is absent
- **AND** stderr is empty and no destination plan or mutation is produced

#### Scenario: JSON ordering and multi-collision selection are deterministic

- **WHEN** the configured parent and multiple selected child repositories are planned for JSON create under any supported naming policy
- **THEN** success `data.repositories[]` and dry-run `data.dryRunOutcome.plannedWorktrees[]` place the selected parent first and preserve deterministic selected-child discovery/filter order
- **AND WHEN** more than one destination in that ordered plan collides
- **THEN** `error.details.conflict` identifies the first colliding plan record and later collisions do not change the reported record

#### Scenario: Existing worktree JSON preserves registered path

- **WHEN** a JSON-capable lifecycle command reports an existing worktree created under a prior layout or a different configured naming policy
- **THEN** it reports the exact Git-registered path without rewriting it according to the current effective policy
- **AND** the envelope does not claim migration or rename activity
