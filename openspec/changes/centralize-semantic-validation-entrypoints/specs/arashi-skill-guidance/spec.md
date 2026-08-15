## ADDED Requirements

### Requirement: Skills semantic guidance uses stable fail-closed aggregates
The skill repository SHALL provide stable aggregate validation entrypoints for authored source guidance and extracted release-shaped skill packages. Maintained guidance checkers SHALL be registered explicitly in deterministic order, and registration validation SHALL fail for an omitted, stale, duplicate, malformed, or nondeterministically ordered checker entry.

#### Scenario: Maintained checker is registered
- **WHEN** a contributor adds a maintained guidance checker and registers it in the explicit manifest
- **THEN** registration validation succeeds
- **AND** source and package aggregates execute the checker in deterministic manifest order

#### Scenario: Maintained checker is omitted
- **WHEN** a maintained guidance checker exists but is absent from the explicit manifest
- **THEN** registration validation reports the omitted checker by path
- **AND** exits unsuccessfully before authoritative semantic validation can pass

#### Scenario: Registration is stale or ambiguous
- **WHEN** the manifest names a missing checker, repeats an entry, uses an invalid checker identity, or is not in canonical order
- **THEN** registration validation reports each registration defect
- **AND** exits unsuccessfully

### Requirement: Skills aggregate execution preserves focused diagnostics
The skills semantic aggregate SHALL execute each registered checker as a child process, identify the checker before execution, preserve its diagnostic output, and propagate startup failures and nonzero exit status with the checker identity. Every registered checker SHALL remain directly executable for focused TDD and diagnostics.

#### Scenario: All source checkers pass
- **WHEN** the source aggregate runs against the authored skill tree and every registered checker succeeds
- **THEN** it reports each checker in deterministic order
- **AND** exits successfully with the completed checker count

#### Scenario: One registered checker fails
- **WHEN** a registered checker exits unsuccessfully
- **THEN** the aggregate identifies that checker and preserves its diagnostic output
- **AND** exits unsuccessfully without reporting later checkers as passed

#### Scenario: Contributor runs one focused checker
- **WHEN** a contributor invokes a registered checker directly during RED/GREEN development
- **THEN** the checker validates only its maintained semantic domain using its existing focused interface
- **AND** does not require a feature-specific workflow step to prove reachability

### Requirement: Extracted package validation uses the same registration contract
The skills repository SHALL validate an already extracted release-shaped package through the same registered checker set used for source validation. Package mode SHALL pass the supplied extracted skill root to every registered checker and SHALL NOT substitute the authored source tree. The registry, runner, checker fixtures, and other maintainer-only validation assets SHALL remain outside the installable skill package.

#### Scenario: Extracted package agrees with source contracts
- **WHEN** the release-shaped archive is created, extracted, and passed to the package aggregate
- **THEN** every registered checker validates the extracted `skills/arashi` tree
- **AND** the aggregate exits successfully only after all package checks pass

#### Scenario: Extracted package drifts while source remains correct
- **WHEN** a required semantic is removed from the extracted package copy but remains present in authored source
- **THEN** package aggregate validation fails for the checker that owns that semantic
- **AND** source-tree correctness does not mask the package defect

#### Scenario: Maintainer tooling is excluded from the artifact
- **WHEN** the installable skill package contents are inspected
- **THEN** skill guidance and required references are present
- **AND** the semantic manifest, runner, checker scripts, and mutation fixtures are absent

### Requirement: Skills workflows invoke stable semantic entrypoints
Authoritative skills pull-request and release workflows SHALL invoke the stable registration, source aggregate, and extracted-package aggregate entrypoints instead of enumerating feature-specific guidance checker scripts. They SHALL preserve their existing trigger scope; this change SHALL NOT narrow an unfiltered pull-request workflow or add an inapplicable path filter to a tag-release workflow.

#### Scenario: New checker is added without workflow topology change
- **WHEN** a contributor adds and registers a semantic checker without changing runtime, permissions, triggers, package assembly, or job topology
- **THEN** authoritative workflows execute it through the stable aggregates
- **AND** no feature-specific workflow YAML step is required

#### Scenario: Workflow bypasses an aggregate
- **WHEN** workflow-composition validation finds that source registration, source aggregate validation, release-shaped package creation/extraction, or package aggregate validation is unreachable
- **THEN** validation identifies the missing stable stage
- **AND** exits unsuccessfully

#### Scenario: Existing skills trigger scope is preserved
- **WHEN** authoritative skills workflows are migrated to aggregate commands
- **THEN** the pull-request workflow remains eligible for the same changes as before
- **AND** the tag-release workflow remains eligible for the same release tags as before
