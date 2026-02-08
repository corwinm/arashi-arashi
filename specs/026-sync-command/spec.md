# Feature Specification: Sync Command

**Feature Branch**: `026-sync-command`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Implement Sync Command"

## Clarifications

### Session 2026-02-08

- Q: For a managed repository missing the parent branch, should sync create it or fail? → A: Create the missing branch from the repository's current branch.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Synchronize Workspace Branches (Priority: P1)

As a workspace maintainer, I want a single sync action to align all managed repositories to the same branch as the parent repository so that I can keep work consistent across the workspace.

**Why this priority**: Branch alignment across repositories is the core value of the sync command and enables multi-repo development.

**Independent Test**: Can be fully tested by running sync in a workspace with multiple repositories and verifying the repositories end on the parent branch or report clear errors.

**Acceptance Scenarios**:

1. **Given** a workspace with a parent repository on branch "feature-x" and managed repositories that also have "feature-x", **When** the user runs sync, **Then** each managed repository ends on branch "feature-x" and reports success.
2. **Given** a workspace with a managed repository missing the parent branch, **When** the user runs sync, **Then** the missing branch is created from that repository's current branch and sync continues.
3. **Given** a workspace with invalid configuration, **When** the user runs sync, **Then** the run stops before any repository actions and reports a clear configuration error.
4. **Given** a repository action exceeds the configured timeout, **When** the user runs sync, **Then** that repository is reported as a timeout failure and remaining repositories continue.
5. **Given** a managed repository where branch creation fails, **When** the user runs sync, **Then** that repository is reported as a failure and remaining repositories continue.

---

### User Story 2 - Sync a Subset (Priority: P2)

As a workspace maintainer, I want to limit sync to a specified subset of repositories so that I can target only the repositories relevant to my task.

**Why this priority**: Targeted sync reduces risk and time when only a few repositories need updates.

**Independent Test**: Can be tested by specifying a subset and verifying only those repositories change while others remain untouched.

**Acceptance Scenarios**:

1. **Given** a workspace with multiple repositories and a subset specified by the user, **When** the user runs sync with a subset filter, **Then** only the specified repositories are evaluated and reported.

---

### User Story 3 - See Progress and Detailed Output (Priority: P3)

As a workspace maintainer, I want visible progress and optional detailed output so that I can understand what the sync is doing and diagnose failures.

**Why this priority**: Observability reduces confusion and supports quick troubleshooting without rerunning commands.

**Independent Test**: Can be tested by running sync in normal and verbose modes and verifying progress indicators, duration reporting, and detailed output visibility.

**Acceptance Scenarios**:

1. **Given** a sync run with multiple repositories, **When** the user runs sync in normal mode, **Then** progress is shown per repository along with its completion time and outcome.
2. **Given** a sync run with verbose output enabled, **When** the user runs sync, **Then** full script output is displayed for each repository.
3. **Given** a sync run with mixed successes and failures, **When** the run completes, **Then** a summary lists the total successes and failures.

---

### Edge Cases

- Configuration cannot be loaded or is invalid.
- The subset filter references repositories not present in the workspace.
- No managed repositories are found after filtering.
- A managed repository does not have the parent branch and branch creation fails.
- A repository operation exceeds the configured timeout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load workspace configuration before attempting any sync actions.
- **FR-002**: System MUST allow users to limit sync to a specified subset of repositories and ignore all others.
- **FR-003**: System MUST align each targeted repository to the same branch name as the parent repository, creating the branch from the repository's current branch when missing.
- **FR-004**: System MUST report a clear failure for any targeted repository that cannot be aligned or created and continue processing remaining repositories.
- **FR-005**: System MUST display per-repository progress with a final outcome (success or failure) in all runs.
- **FR-006**: System MUST display the execution time for each repository action.
- **FR-007**: System MUST provide a verbose mode that displays full output from each repository action.
- **FR-008**: System MUST detect and report script failures and timeouts as errors.
- **FR-009**: System MUST produce a final summary indicating how many repositories succeeded and failed.

### Key Entities

- **Workspace Configuration**: The defined list of managed repositories and any sync-related settings such as timeouts.
- **Repository**: A managed codebase targeted by the sync action, identified by name and location in the workspace.
- **Sync Result**: The recorded outcome for a repository, including status (success/failure), duration, and any error details.

### Assumptions

- If a repository does not contain the parent branch, the branch is created from that repository's current branch.
- A sync run continues across repositories even when individual repositories fail.

### Dependencies

- Users have an existing workspace configuration with at least one managed repository.

### Out of Scope

- Modifying the workspace configuration or repository list during sync.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a workspace of 10 repositories, users can complete a full sync run in under 2 minutes.
- **SC-002**: At least 95% of sync runs on valid configurations complete with zero failures when all repositories contain the parent branch.
- **SC-003**: 100% of failures include repository name, reason, and timing information in the final output.
- **SC-004**: In usability testing, 90% of users can correctly identify the status of every targeted repository from a single run output without re-running the command.
