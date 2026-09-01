## ADDED Requirements

### Requirement: OpenSpec is the sole active specification workflow
The Arashi meta-repository SHALL use `openspec/changes/` for proposed change artifacts, `openspec/specs/` for canonical capability requirements, and the maintained `/opsx-*` commands and OpenSpec skills for proposal, application, exploration, and archive workflows.

#### Scenario: Contributor starts a planned change
- **WHEN** a contributor follows active repository guidance to specify a change
- **THEN** the guidance creates or updates an OpenSpec change and does not create a numbered Spec Kit directory

### Requirement: Retired Spec Kit workflow assets are absent from active tracked source
The meta-repository SHALL NOT track the retired top-level `specs/` tree, `.specify/` toolkit, or `.opencode/command/speckit.*` command definitions. Historical Git revisions and archived OpenSpec narratives MAY mention the former workflow, but active onboarding SHALL NOT require it.

#### Scenario: Repository structure is validated
- **WHEN** the tracked root and OpenCode command assets are inspected
- **THEN** the retired Spec Kit paths are absent
- **AND** canonical OpenSpec configuration, commands, and skills remain present

### Requirement: Legacy migration decisions remain reviewable
The consolidation change SHALL record one explicit disposition for every previously tracked numbered Spec Kit directory and SHALL identify each canonical capability that received retained behavior before the legacy tree is removed.

#### Scenario: Reviewer checks migration coverage
- **WHEN** a reviewer evaluates the consolidation
- **THEN** all 39 legacy directories have a documented disposition
- **AND** every ported gap maps to a capability delta that passes strict OpenSpec validation
