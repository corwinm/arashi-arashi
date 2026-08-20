## ADDED Requirements

### Requirement: Coordinated contracts enforce interactive add onboarding semantics

Maintained CLI guidance and typed/generated command metadata SHALL be the authoritative CLI producers for optional add-onboarding eligibility and behavior; the existing generated configuration JSON Schema SHALL remain authoritative for canonical repository field shapes. Coordinated validation SHALL normalize those producers and compare them with canonical website docs, generated agent-readable exports, and authored plus extracted-package Arashi skill guidance for default-no/minimal decline, non-TTY/JSON/force suppression, repository-only copy/symlink/hooks scope, configured-versus-unset editor metadata, unselected bounded content-free suggestions, user-supplied hooks, sanitized summaries, complete-candidate validation, one final save, controlled cancellation/rollback, and #316 scope separation.

#### Scenario: Companion surfaces agree

- **WHEN** registered coordinated validation runs against current child revisions
- **THEN** CLI metadata/guidance, generated config schema, website docs/exports, and packaged skills agree on the normalized onboarding contract
- **AND** validation executes through stable CLI, docs, skills source, skills package, and meta aggregate entrypoints

#### Scenario: Controlled onboarding mismatch is rejected

- **WHEN** an out-of-repository fixture changes one eligibility, default, ownership, suggestion, validation, secrecy, persistence, cancellation, or future-scope semantic
- **THEN** focused or coordinated validation fails with a stable diagnostic naming the owning surface and mismatch
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Hook canary reaches contract validation

- **WHEN** a controlled fixture supplies a unique inline-hook command body
- **THEN** semantic contracts can verify lifecycle/interpreter presence as required
- **AND** no generated artifact, normalized diagnostic, or checker output contains the body or a derivative

### Requirement: Onboarding checker registration preserves stable workflow topology

CLI, docs, skills, and meta onboarding checkers SHALL be registered through their existing fail-closed manifests and stable aggregate entrypoints. Authoritative workflow YAML SHALL NOT add feature-specific stages unless a pre-implementation reachability RED proves the existing topology cannot execute an approved requirement.

#### Scenario: Focused checkers are registered

- **WHEN** repository-local and coordinated onboarding checks are added
- **THEN** registration self-tests and direct invocation prove they run through existing aggregates
- **AND** workflow topology, permissions, triggers, runtime, and artifact assembly remain unchanged unless separately justified

### Requirement: Interactive add delivery remains child-first and archive-safe

CLI, docs, and skills changes SHALL be delivered as separate child-repository PRs with non-closing references to #274 and explicit cross-links. The proposal/meta PR SHALL remain open, SHALL own OpenSpec artifacts and coordinated validation, and SHALL be merged last only after child PRs merge and the change is archived/synced. The sole closing reference for #274 SHALL be on the final meta/archive PR.

#### Scenario: Child delivery completes

- **WHEN** implementation is ready for closeout
- **THEN** separate CLI, docs, and skills PRs have exact-head native/applicable validation and eligible review threads resolved before dependency-safe merge
- **AND** no child PR closes #274

#### Scenario: Change is archived

- **WHEN** every pre-archive implementation, native-platform, package, coordinated, review, and child-merge gate is complete
- **THEN** the existing meta branch archives/syncs the change, validates synced specs and final child revisions, and updates its PR with the sole closing reference
- **AND** the meta PR is not merged while the OpenSpec change remains active
