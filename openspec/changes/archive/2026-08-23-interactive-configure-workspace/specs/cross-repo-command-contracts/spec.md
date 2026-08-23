## ADDED Requirements

### Requirement: Command contracts publish configure semantics

The canonical CLI command contract SHALL register `configure` and publish typed semantic policy for configured-workspace ownership, TTY-only mutation, sanitized non-mutating `--json` inspection, explicit supported scope and descriptor sets, configured/effective state, keep/edit/clear actions, exact serialized confirmation preview, separate active-file planning, one concurrency-checked save, and cancellation behavior. Companion classifications SHALL require docs and skills coverage and record the reason for VS Code representation or exclusion.

#### Scenario: Configure contract is generated

- **WHEN** CLI command contracts are regenerated
- **THEN** `configure` and its JSON option appear with normalized configure policy
- **AND** freshness validation is deterministic

#### Scenario: Unsupported mutation is advertised

- **WHEN** a companion surface claims JSON, non-TTY, or broad set/unset invocation mutates configuration
- **THEN** semantic validation identifies the owning source and mismatch
- **AND** exits unsuccessfully

### Requirement: Coordinated validation enforces configure guidance

The meta-repository SHALL compare CLI configure policy with canonical docs, generated agent-readable exports, authored skill guidance, and extracted-package guidance through stable registered aggregates. Validation SHALL compare normalized scope, state, mutation, preview, active-file, invocation, and secrecy semantics rather than command-name presence alone.

#### Scenario: Companion surfaces agree

- **WHEN** canonical CLI, docs, exports, and packaged skill surfaces publish the same configure semantics
- **THEN** coordinated contract validation succeeds
- **AND** reports exact participating child revisions

#### Scenario: Controlled configure mismatch proves enforcement

- **WHEN** an out-of-repository fixture removes or contradicts one required configure scope, state label, action, preview, transaction, invocation, or secrecy rule
- **THEN** the focused or aggregate checker exits unsuccessfully with a stable owning-source diagnostic
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Stable aggregates remain authoritative

- **WHEN** configure-focused checkers are registered in docs, skills, or meta repositories
- **THEN** existing stable source, extracted-package, and coordinated aggregate entrypoints execute them
- **AND** no feature-specific authoritative workflow stage is required unless workflow topology changes

## MODIFIED Requirements

### Requirement: Coordinated contracts enforce interactive add onboarding semantics

Maintained CLI guidance and typed/generated command metadata SHALL remain authoritative for optional `aw add` onboarding of a new repository; the existing generated configuration JSON Schema SHALL remain authoritative for canonical repository field shapes, and canonical lifecycle contracts plus the add scaffold producer SHALL remain authoritative for native active paths, safe no-op content, and permissions. Existing entries are edited through `aw configure`, not `aw add`. Coordinated validation SHALL normalize those producers and compare them with canonical website docs, generated agent-readable exports, and authored plus extracted-package Arashi skill guidance for default-no/minimal decline, non-TTY/JSON/force suppression, repository-only copy/symlink/hook scope, configured-versus-unset editor metadata, unselected bounded content-free suggestions, exclusive inline-or-file source choice, exact active paths and executable readiness without manual activation, no overwrite/ownership-safe rollback, user-supplied inline hooks, sanitized summaries, complete-candidate/script-plan validation, one final config save, controlled cancellation, and the `aw add` versus `aw configure` ownership boundary.

#### Scenario: Companion surfaces agree

- **WHEN** registered coordinated validation runs against current child revisions
- **THEN** CLI metadata/guidance, generated config schema, website docs/exports, and packaged skills agree on the normalized onboarding contract
- **AND** validation executes through stable CLI, docs, skills source, skills package, and meta aggregate entrypoints
- **AND** existing-entry editing routes to `aw configure` while `aw add` remains scoped to onboarding a new repository

#### Scenario: Controlled onboarding mismatch is rejected

- **WHEN** an out-of-repository fixture changes one eligibility, default, ownership, suggestion, inline/file, active-path/no-op/permission, validation, secrecy, persistence, cancellation, or add-versus-configure semantic
- **THEN** focused or coordinated validation fails with a stable diagnostic naming the owning surface and mismatch
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Hook canary reaches contract validation

- **WHEN** a controlled fixture supplies a unique inline-hook command body or generated-script canary
- **THEN** semantic contracts can verify inline lifecycle/interpreter presence or script lifecycle/path/executable state as required
- **AND** no generated artifact, normalized diagnostic, or checker output contains a body or derivative
