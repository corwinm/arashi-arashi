## ADDED Requirements

### Requirement: Specification effort is proportional to contract risk
Repository guidance SHALL define direct implementation, lightweight OpenSpec, and full OpenSpec tracks.

#### Scenario: No durable product contract changes
- **WHEN** work is routine maintenance, a narrow fix to already-specified behavior, a test gap, an internal refactor, CI cleanup, or copy-only documentation
- **THEN** the change MAY proceed directly from its issue to implementation pull requests
- **AND** a meta-repository change or pull request is required only when the meta-repository itself changes

#### Scenario: A straightforward durable requirement changes
- **WHEN** the desired behavior is settled and needs a canonical capability delta
- **THEN** the change SHALL use the `lightweight` OpenSpec schema
- **AND** its required artifacts SHALL be a proposal and capability deltas

#### Scenario: A consequential contract changes
- **WHEN** a change has unresolved design alternatives or is destructive, migratory, security-sensitive, or difficult to reverse
- **THEN** the change SHALL use the full `spec-driven` OpenSpec schema

#### Scenario: A mechanical change spans repositories
- **WHEN** an issue completely specifies a mechanical coordinated change without altering a durable requirement
- **THEN** cross-repository scope alone SHALL NOT require OpenSpec

#### Scenario: Direct work reveals a contract decision
- **WHEN** implementation exposes a new or modified durable requirement or unresolved consequential design choice
- **THEN** work SHALL move to the lightweight or full OpenSpec track before delivery

### Requirement: OpenSpec artifacts contain durable specification information
OpenSpec artifacts SHALL contain durable scope, requirements, and design decisions. Implementation checklists and transient verification evidence SHALL remain in issues, pull requests, tests, and CI unless they establish a durable compatibility, migration, or operational contract.

#### Scenario: Lightweight change records implementation progress
- **WHEN** a lightweight OpenSpec change is implemented and verified
- **THEN** its issue and pull request SHALL record tasks and verification
- **AND** the OpenSpec change SHALL NOT require separate design, task, or implementation-evidence artifacts

#### Scenario: OpenSpec change is delivered
- **WHEN** a lightweight or full OpenSpec change is complete
- **THEN** its schema artifacts SHALL pass strict validation
- **AND** its capability deltas SHALL be archived into `openspec/specs/`

## MODIFIED Requirements

### Requirement: OpenSpec is the sole active specification workflow
The Arashi meta-repository SHALL use OpenSpec for changes that require durable specification artifacts and SHALL NOT require an OpenSpec change for direct implementation work that does not alter a canonical product requirement.

#### Scenario: Contributor starts a planned change
- **WHEN** a contributor confirms an issue, affected repositories, acceptance criteria, and contract impact
- **THEN** the contributor selects direct implementation, lightweight OpenSpec, or full OpenSpec before implementation
- **AND** no retired specification system is used

### Requirement: Retired Spec Kit workflow assets are absent from active tracked source
The meta-repository SHALL NOT track the retired top-level `specs/` tree, `.specify/` toolkit, or `.opencode/command/speckit.*` command definitions. Historical Git revisions and archived OpenSpec narratives MAY mention the former workflow, but active onboarding SHALL NOT require it.

#### Scenario: Repository structure is validated
- **WHEN** the tracked root and OpenCode command assets are inspected
- **THEN** the retired Spec Kit paths are absent
- **AND** canonical OpenSpec configuration, commands, skills, and project schemas remain present

### Requirement: Legacy migration decisions remain reviewable
The consolidation change SHALL record one explicit disposition for every previously tracked numbered Spec Kit directory and SHALL identify each canonical capability that received retained behavior before the legacy tree is removed.

#### Scenario: Reviewer checks migration coverage
- **WHEN** a reviewer evaluates the consolidation
- **THEN** all 39 legacy directories have a documented disposition
- **AND** every ported gap maps to a capability delta that passes strict OpenSpec validation
