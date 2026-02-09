# Feature Specification: Pull Command

**Feature Branch**: `025-pull-command`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Implement Pull Command (https://github.com/corwinm/arashi-arashi/issues/60)"

## Clarifications

### Session 2026-02-08

- Q: For acceptance scenario 2, should the system attempt a pull and revert on conflict/error while reporting the repository for manual update? → A: Attempt the pull; if there is a conflict or error, revert the pull and report the repository as needing manual update.
- Q: What should the exit status be when any repository fails or needs manual update? → A: Exit non-zero if any repository fails or needs manual update.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Update All Eligible Repositories (Priority: P1)

As a workspace user, I want a single command that pulls remote changes for all eligible repositories so I can update my workspace quickly and safely.

**Why this priority**: This is the core value of the command and enables the primary workflow.

**Independent Test**: Can be fully tested by running the command in a workspace with multiple clean repositories that have remote changes and verifying all eligible repositories are updated with a clear summary.

**Acceptance Scenarios**:

1. **Given** a workspace configuration with multiple clean repositories and remote changes, **When** I run the pull command, **Then** each eligible repository is updated and reported as successful.
2. **Given** a repository with local changes and remote changes, **When** I run the pull command, **Then** the command attempts the update, reverts it on conflict or error, and reports the repository as needing manual update.

---

### User Story 2 - Targeted Pulls (Priority: P2)

As a workspace user, I want to limit the pull command to a subset of repositories so I can update only what I care about.

**Why this priority**: Targeted updates reduce unnecessary work and time when only specific repositories matter.

**Independent Test**: Can be fully tested by running the command with a subset filter and verifying only the specified repositories are considered and updated if eligible.

**Acceptance Scenarios**:

1. **Given** a workspace with multiple repositories, **When** I run the pull command with a subset filter, **Then** only repositories in that subset are processed.
2. **Given** a repository in scope with no remote changes, **When** I run the pull command, **Then** it is skipped and reported as having no updates.

---

### User Story 3 - Clear Progress and Diagnostics (Priority: P3)

As a workspace user, I want clear progress, timing, and diagnostics so I can understand what happened during the pull operation and troubleshoot failures.

**Why this priority**: Transparency reduces confusion and speeds up recovery when issues occur.

**Independent Test**: Can be fully tested by running the command in verbose and non-verbose modes with at least one failure and verifying progress updates, timing, and error details are reported.

**Acceptance Scenarios**:

1. **Given** the pull command is running across multiple repositories, **When** it processes each repository, **Then** progress is displayed and each repository shows a completion status and elapsed time.
2. **Given** verbose mode is enabled, **When** a repository pull runs, **Then** the full output is shown for that repository and any failures include a clear reason.

---

### Edge Cases

- Workspace configuration is missing or invalid.
- No repositories are configured or none match the subset filter.
- All repositories are already up to date.
- A repository has local changes and remote changes at the same time.
- A pull produces conflicts or errors and must be rolled back.
- A repository cannot be reached due to authentication or network issues.
- A pull operation exceeds the configured timeout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load the workspace configuration before processing repositories.
- **FR-002**: System MUST allow users to limit the scope of repositories using a subset filter.
- **FR-003**: System MUST detect which in-scope repositories have remote changes before attempting to update them.
- **FR-004**: System MUST attempt to update repositories with local changes and remote changes, then revert the update and report the repository when a conflict or error occurs.
- **FR-005**: System MUST update each eligible repository that is clean and has remote changes.
- **FR-006**: System MUST display progress for each repository, including a completion status.
- **FR-007**: System MUST report the elapsed time for each repository operation.
- **FR-008**: System MUST provide a verbose mode that shows full output for each repository operation.
- **FR-009**: System MUST handle operation failures and timeouts with clear error reporting and a final summary.
- **FR-010**: System MUST exit with a non-zero status if any repository fails or requires manual update.

### Scope

- In scope: Updating repositories defined in the workspace configuration that have remote changes.
- In scope: Reporting status, timing, and errors for each repository processed.
- Out of scope: Resolving merge conflicts or modifying repository configuration.

### Assumptions

- If a repository fails to update, the command continues processing remaining repositories and reports all failures in the summary.
- If no repositories are eligible, the command completes successfully with a clear message.
- The subset filter references repositories defined in the workspace configuration.

### Dependencies

- Workspace configuration is available and readable at runtime.
- Repositories have an accessible remote source for checking and pulling updates.

### Key Entities *(include if feature involves data)*

- **Workspace Configuration**: Defines which repositories are part of the workspace and their identifiers.
- **Repository**: A local project with a corresponding remote source and a working state (clean or dirty).
- **Remote Change Status**: The result of checking whether a repository is behind its remote source.
- **Pull Result**: Outcome of an update attempt, including status, timing, and any error details.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can update all eligible repositories in a 20-repository workspace in under 5 minutes when no conflicts occur.
- **SC-002**: 100% of repositories in scope are reported as updated, skipped, or failed in the final summary.
- **SC-003**: 95% of pull runs in clean workspaces complete without requiring user intervention.
- **SC-004**: Users can identify the reason for any failure within 30 seconds by reading the command output.
