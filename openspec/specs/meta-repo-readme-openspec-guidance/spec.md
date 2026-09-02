# meta-repo-readme-openspec-guidance Specification

## Purpose
Define root README requirements that identify OpenSpec as the current Arashi planning workflow while treating SpecKit as historical context only.
## Requirements
### Requirement: Meta-repo README SHALL identify OpenSpec as the current workflow
The root `arashi-arashi` `README.md` SHALL identify OpenSpec as the current workflow used for specification and change planning in this repository.

#### Scenario: User reads the root README workflow steps
- **WHEN** a user opens the root `README.md` to understand how change planning works in this repository
- **THEN** the workflow guidance names OpenSpec as the current path used to create and apply change artifacts

### Requirement: Meta-repo README SHALL treat SpecKit as historical context only
The root `arashi-arashi` `README.md` MAY mention SpecKit as earlier project context, but it SHALL NOT present SpecKit-specific commands or assumptions as the current required workflow.

#### Scenario: User reads README historical context
- **WHEN** the root README references earlier SpecKit-oriented setup or migration history
- **THEN** the wording makes clear that SpecKit is historical context and not the active workflow for this repository

### Requirement: Meta-repo README tooling summaries SHALL reflect current project usage
The root `arashi-arashi` `README.md` SHALL keep framework matrices, contribution summaries, and other tooling overview content aligned with the repository's current OpenSpec-based workflow.

#### Scenario: User scans root README summary content
- **WHEN** a user reviews the root README framework matrix, quick path, or comparable onboarding summary
- **THEN** the current-state guidance reflects OpenSpec-based usage and does not describe SpecKit as the primary active path

### Requirement: Meta-repo README reflects the consolidated OpenSpec layout
After legacy consolidation, the root `README.md` SHALL describe `openspec/changes/` and `openspec/specs/` as the repository's specification sources and SHALL NOT claim that a tracked top-level `specs/` tree, `.specify/` toolkit, or `/speckit.*` commands remain available.

#### Scenario: User reviews repository layout
- **WHEN** a user reads the root overview, workflow, layout, framework summary, or quick path
- **THEN** those sections consistently describe the OpenSpec-only tracked workflow
- **AND** no active step points to a removed Spec Kit path or command
