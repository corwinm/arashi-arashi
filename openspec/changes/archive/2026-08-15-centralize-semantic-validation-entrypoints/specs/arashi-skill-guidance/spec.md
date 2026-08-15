## ADDED Requirements

### Requirement: Skills semantic guidance uses stable fail-closed aggregates
The skill repository SHALL provide stable aggregate validation entrypoints for authored source guidance and the extracted `skills/arashi` subtree of a canonical release archive. Every aggregate invocation SHALL execute registration validation as a mandatory preflight before any child checker. Maintained checker identities SHALL be unique repository-relative paths matching `scripts/<basename>-guidance-selftest.mjs`, where the basename uses lowercase ASCII alphanumerics and internal hyphens, and SHALL appear in ascending bytewise UTF-8 order. Identities SHALL NOT be absolute, contain `.` or `..` segments, use non-portable separators, escape the repository, resolve through a symlink, or name anything other than a regular maintained checker file.

#### Scenario: Maintained checker is registered
- **WHEN** a contributor adds a maintained guidance checker and registers its canonical identity in the explicit manifest
- **THEN** source and package aggregates first confirm exact set equality between the manifest and maintained checker inventory
- **AND** execute the checker in deterministic manifest order

#### Scenario: Maintained checker is omitted
- **WHEN** a maintained guidance checker exists but is absent from the explicit manifest
- **THEN** both source and package aggregate preflights report the omitted checker by path
- **AND** exit unsuccessfully before executing any child checker

#### Scenario: Registration is stale or ambiguous
- **WHEN** the manifest names a missing checker, repeats an entry, uses an invalid or escaping identity, resolves through a symlink, or is not in canonical bytewise order
- **THEN** both aggregate preflights report every registration defect
- **AND** exit unsuccessfully before executing any child checker

#### Scenario: Contributor diagnoses registration directly
- **WHEN** a contributor invokes the focused registration guard
- **THEN** it applies the same preflight contract used by both aggregates
- **AND** reports registration defects without executing semantic children

### Requirement: Skills aggregate execution preserves focused diagnostics
The skills semantic aggregate SHALL execute each registered checker as a child process, identify the checker before execution, preserve its diagnostic output, and report startup, signal, and nonzero-exit failures with checker identities. It SHALL attempt every registered checker after a successful preflight so one failure does not hide independent failures. Every registered checker SHALL remain directly executable for focused TDD and diagnostics.

#### Scenario: All source checkers pass
- **WHEN** the source aggregate runs against the authored skill tree and every registered checker succeeds
- **THEN** it reports each checker in deterministic order
- **AND** exits successfully with the completed checker count

#### Scenario: Registered checkers fail independently
- **WHEN** one or more registered checkers cannot start, receive a signal, or exit unsuccessfully
- **THEN** the aggregate preserves their output and reports each failure class with its checker identity
- **AND** exits unsuccessfully without reporting a false aggregate success

#### Scenario: Contributor runs one focused checker
- **WHEN** a contributor invokes a registered checker directly during RED/GREEN development
- **THEN** the checker validates its maintained semantic domain through its existing source or `--skill-root` interface
- **AND** does not require a feature-specific workflow step or meta-repository path to prove reachability

### Requirement: Extracted package validation uses the canonical release artifact
The skills repository SHALL define one canonical release-archive producer or producer-owned member policy shared by pull-request, tag-release, and coordinated meta validation. The archive SHALL contain only the top-level members `skills/`, `README.md`, `LICENSE`, and `security/`, and SHALL exclude maintainer tooling, mutation fixtures, AppleDouble metadata, and other undeclared members. Package semantic validation SHALL use the same registered checker set as source validation and pass the extracted canonical archive's `skills/arashi` subtree to every checker through `--skill-root`; it SHALL NOT substitute authored source.

#### Scenario: Canonical release package agrees with source contracts
- **WHEN** the canonical release archive is created, its exact membership is verified, and it is extracted
- **THEN** every registered checker validates the extracted `skills/arashi` subtree
- **AND** the aggregate exits successfully only after registration and all package checks pass

#### Scenario: Extracted package drifts while source remains correct
- **WHEN** a required semantic is removed from the extracted package copy but remains present in authored source
- **THEN** package aggregate validation fails for the checker that owns that semantic
- **AND** source-tree correctness does not mask the package defect

#### Scenario: Maintainer tooling or undeclared content leaks
- **WHEN** archive membership contains `scripts/`, `contracts/`, checker fixtures, platform metadata, or any undeclared top-level member
- **THEN** package-boundary validation identifies the forbidden member
- **AND** the archive is rejected before it is treated as release-shaped

#### Scenario: Package producers drift
- **WHEN** pull-request, tag-release, or coordinated meta validation bypasses the canonical producer or member policy
- **THEN** workflow-composition or package-boundary validation fails
- **AND** no weaker `skills/`-only fixture can satisfy release-package acceptance

### Requirement: Skills workflows invoke stable semantic entrypoints
Authoritative skills pull-request and release workflows SHALL invoke one stable source aggregate and one stable canonical-package aggregate instead of separately invoking registration or enumerating feature-specific guidance checker scripts. Aggregate registration preflight SHALL remain mandatory. The workflows SHALL preserve their existing trigger scope; this change SHALL NOT narrow an unfiltered pull-request workflow or add an inapplicable path filter to a tag-release workflow.

#### Scenario: New checker is added without workflow topology change
- **WHEN** a contributor adds and registers a semantic checker without changing runtime, permissions, triggers, package assembly, or job topology
- **THEN** authoritative workflows execute it through both stable aggregates
- **AND** no feature-specific workflow YAML step is required

#### Scenario: Workflow bypasses an aggregate or canonical artifact stage
- **WHEN** workflow-composition validation finds that source aggregate validation, canonical package creation/membership/extraction, or package aggregate validation is unreachable or duplicated
- **THEN** validation identifies the missing or duplicated stable stage
- **AND** exits unsuccessfully

#### Scenario: Existing skills trigger scope is preserved
- **WHEN** authoritative skills workflows are migrated to aggregate commands
- **THEN** the pull-request workflow remains eligible for the same changes as before
- **AND** the tag-release workflow remains eligible for the same release tags as before
