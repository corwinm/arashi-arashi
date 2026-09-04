## MODIFIED Requirements

### Requirement: Meta-repo README SHALL identify OpenSpec as the current workflow
The root `arashi-arashi` `README.md` SHALL identify OpenSpec as the current durable specification system and SHALL distinguish direct implementation, lightweight OpenSpec, and full OpenSpec tracks.

#### Scenario: User reads the root README workflow steps
- **WHEN** a user opens the root `README.md` to understand how project work is planned
- **THEN** the guidance starts with specification-track selection
- **AND** it does not require complete OpenSpec artifacts for every change

### Requirement: Meta-repo README SHALL treat SpecKit as historical context only
The root `arashi-arashi` `README.md` MAY mention SpecKit as earlier project context, but it SHALL NOT present SpecKit-specific commands or assumptions as the current required workflow.

#### Scenario: User reads README historical context
- **WHEN** the root README references earlier SpecKit-oriented setup or migration history
- **THEN** the wording makes clear that SpecKit is historical context and not an active workflow for this repository

### Requirement: Meta-repo README tooling summaries SHALL reflect current project usage
The root `arashi-arashi` `README.md` SHALL keep framework matrices, contribution summaries, and other tooling overview content aligned with selective OpenSpec usage.

#### Scenario: User scans root README summary content
- **WHEN** a user reviews the workflow or comparable onboarding summary
- **THEN** the current-state guidance explains when OpenSpec is required and when direct implementation is sufficient

### Requirement: Meta-repo README reflects the consolidated OpenSpec layout
The root `README.md` SHALL describe `openspec/changes/`, `openspec/specs/`, and project-local schemas as the repository's specification sources and SHALL NOT claim that a tracked top-level `specs/` tree, `.specify/` toolkit, or `/speckit.*` commands remain available.

#### Scenario: User reviews repository layout
- **WHEN** a user reads the root overview, workflow, layout, framework summary, or quick path
- **THEN** those sections consistently describe the selective OpenSpec workflow
- **AND** no active step points to a removed Spec Kit path or command
