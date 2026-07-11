## ADDED Requirements

### Requirement: Action dependency automation covers each child repository
Each Arashi child repository SHALL use dependency automation that monitors GitHub Actions workflow references, or SHALL document an equivalent automated mechanism that covers every workflow in that repository.

#### Scenario: GitHub Actions dependency automation is configured
- **WHEN** a child repository uses GitHub Actions workflows
- **THEN** its dependency automation scans action references under `.github/workflows` on a recurring schedule

#### Scenario: Dependabot is not the selected mechanism
- **WHEN** a child repository does not configure Dependabot for the `github-actions` ecosystem
- **THEN** the repository documents the equivalent automated mechanism, its coverage, and how maintainers receive action update notifications

## MODIFIED Requirements

### Requirement: Child workflows use supported GitHub action runtimes
Each child repository workflow SHALL use current stable major versions of JavaScript actions when the existing action major targets a deprecated GitHub Actions Node runtime, regardless of whether the action is GitHub-owned or published by a third party.

#### Scenario: Deprecated action major is discovered
- **WHEN** a child repository workflow uses a JavaScript action major that GitHub identifies as running on a deprecated Node runtime
- **THEN** the workflow is updated to the latest stable major version of that action that is designed to run on a supported Node runtime

#### Scenario: Workflow behavior is preserved after action upgrade
- **WHEN** a JavaScript action version is updated to a current stable major
- **THEN** the workflow keeps its existing triggers, jobs, permissions, step order, and action inputs unless a documented action migration note requires a targeted adjustment

### Requirement: Multi-repository workflow updates remain independently reviewable
Workflow implementation changes SHALL be made in the child repositories that own the workflow files and remain reviewable per repository.

#### Scenario: Multiple child repositories require workflow updates
- **WHEN** a deprecated action runtime sweep affects more than one child repository
- **THEN** each affected child repository receives its own implementation change, validation evidence, and reference to the issue authorizing that sweep

#### Scenario: Meta-repo planning is complete before implementation
- **WHEN** implementation begins for a coordinated multi-repository action runtime sweep
- **THEN** the proposal, design, specification delta, and tasks for that sweep exist in the meta-repo and validate successfully
