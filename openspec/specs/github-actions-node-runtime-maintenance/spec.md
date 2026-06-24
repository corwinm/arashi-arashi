# github-actions-node-runtime-maintenance Specification

## Purpose
Define requirements for keeping Arashi child repository GitHub Actions workflows on supported GitHub-owned action runtimes while preserving project runtime compatibility and reviewable multi-repository changes.

## Requirements
### Requirement: Child workflows use supported GitHub action runtimes
Each child repository workflow SHALL use current stable major versions of GitHub-owned JavaScript actions when the existing action major targets a deprecated GitHub Actions Node runtime.

#### Scenario: Deprecated action major is discovered
- **WHEN** a child repository workflow uses a GitHub-owned action major that GitHub identifies as running on a deprecated Node runtime
- **THEN** the workflow is updated to the latest stable major version of that action that runs on a supported Node runtime

#### Scenario: Workflow behavior is preserved after action upgrade
- **WHEN** a GitHub-owned action version is updated to a current stable major
- **THEN** the workflow keeps its existing triggers, jobs, permissions, step order, and action inputs unless a documented action migration note requires a targeted adjustment

### Requirement: Project Node versions are reviewed separately from action runtimes
Workflows SHALL treat the Node version used by `actions/setup-node` for project commands as separate from the Node runtime used internally by GitHub Actions.

#### Scenario: Explicit Node 20 setup pin is present
- **WHEN** a workflow explicitly configures `node-version: "20"` or `node-version: 20`
- **THEN** the implementation records whether the pin is intentional compatibility coverage or updates it to the repository's current supported CI runtime

#### Scenario: Project runtime support is unchanged
- **WHEN** an action major is updated to address the GitHub Actions Node runtime deprecation
- **THEN** package engine declarations and documented user-supported Node versions remain unchanged unless separately required by that repository

### Requirement: Multi-repository workflow updates remain independently reviewable
Workflow implementation changes SHALL be made in the child repositories that own the workflow files and remain reviewable per repository.

#### Scenario: Multiple child repositories require workflow updates
- **WHEN** the deprecated action runtime sweep affects more than one child repository
- **THEN** each affected child repository receives its own implementation change, validation evidence, and issue #164 reference

#### Scenario: Meta-repo planning is complete before implementation
- **WHEN** implementation begins for issue #164
- **THEN** the OpenSpec proposal, design, specs, and tasks for `update-actions-node-version` exist in the meta-repo and validate successfully

### Requirement: Updated workflows are validated
Each affected workflow SHALL be validated after action runtime updates with repository-appropriate checks and workflow review.

#### Scenario: Repository checks are available
- **WHEN** a child repository has local lint, test, build, docs, or security validation commands relevant to the changed workflow
- **THEN** those commands are run or an implementation note records why they could not be run

#### Scenario: Workflow YAML is reviewed
- **WHEN** a workflow file is changed to update action or Node setup versions
- **THEN** the implementation verifies the YAML remains parseable and the diff contains no unrelated trigger, permission, job, or command changes

