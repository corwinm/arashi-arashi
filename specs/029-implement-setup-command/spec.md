# Feature Specification: Setup Command

**Feature Branch**: `029-implement-setup-command`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/29"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run setup across workspace (Priority: P1)

As a workspace maintainer, I can run one setup command that executes required setup steps for the main repository and each configured sub-repository so I can prepare the full workspace quickly and consistently.

**Why this priority**: This is the primary value of the feature; without end-to-end setup execution, the command does not solve the core workspace preparation problem.

**Independent Test**: Can be fully tested by running the setup command in a workspace with main and sub-repository setup tasks and verifying all applicable setup tasks run and complete in one command.

**Acceptance Scenarios**:

1. **Given** a workspace with configured setup tasks in the main repository and multiple sub-repositories, **When** the user runs the setup command, **Then** the command executes the main repository setup first and then executes setup tasks for each applicable sub-repository.
2. **Given** a workspace where some repositories do not define setup tasks, **When** the user runs the setup command, **Then** the command skips those repositories and continues with repositories that do define setup tasks.

---

### User Story 2 - Target selected repositories (Priority: P2)

As a workspace maintainer, I can limit setup execution to a chosen subset of repositories so I can run focused setup flows for only the areas I am actively working on.

**Why this priority**: Selective execution improves efficiency for daily development but is secondary to having full setup orchestration available.

**Independent Test**: Can be fully tested by running the setup command with a repository filter and verifying only selected repositories execute while non-selected repositories are not executed.

**Acceptance Scenarios**:

1. **Given** a workspace with setup tasks across multiple repositories, **When** the user runs the setup command with a repository-selection option, **Then** the command executes setup tasks only for selected repositories.
2. **Given** a repository-selection option that includes repositories without setup tasks, **When** the setup command runs, **Then** the command reports that those repositories are skipped and continues with remaining selected repositories.

---

### User Story 3 - Observe progress and troubleshoot failures (Priority: P3)

As a workspace maintainer, I can see setup progress, elapsed time per repository, and detailed output when needed so I can quickly identify and resolve setup issues.

**Why this priority**: Visibility and diagnostics improve usability and supportability, but the command still provides baseline value without advanced output controls.

**Independent Test**: Can be fully tested by running setup in normal and verbose modes with at least one failing setup task and verifying progress updates, per-task timing, detailed output visibility, and clear failure reporting.

**Acceptance Scenarios**:

1. **Given** setup tasks that complete successfully, **When** the user runs the setup command, **Then** the command displays progress feedback and reports elapsed time for each executed setup task.
2. **Given** a setup task that fails or exceeds its allowed runtime, **When** the user runs the setup command, **Then** the command reports the failure clearly, identifies the affected repository, and provides enough context for remediation.
3. **Given** the user enables verbose output, **When** the setup command runs, **Then** full setup task output is shown for each executed repository.

### Edge Cases

- A repository is selected for setup but is unavailable or inaccessible at runtime.
- The main repository has no setup task defined while sub-repositories do.
- One repository setup fails while others could still run.
- A setup task produces no output for an extended period before completion.
- A setup task exceeds the configured timeout threshold.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a setup command that executes workspace setup tasks from a single user action.
- **FR-002**: The system MUST load workspace configuration before determining which repositories are eligible for setup execution.
- **FR-003**: The system MUST discover all repositories in the workspace that define setup tasks and include them in setup execution scope.
- **FR-004**: The system MUST support a repository-selection option that restricts setup execution to only the repositories explicitly selected by the user.
- **FR-005**: The system MUST execute the main repository setup task before executing sub-repository setup tasks when both are available.
- **FR-006**: The system MUST execute setup tasks for each applicable sub-repository and complete processing for all eligible repositories unless stopped by a terminal command-level failure.
- **FR-007**: The system MUST display progress feedback during setup execution so users can track current status.
- **FR-008**: The system MUST report elapsed execution time for each setup task that is started.
- **FR-009**: The system MUST provide a verbose output mode that displays full setup task output.
- **FR-010**: The system MUST detect and report setup task failures, including the repository where the failure occurred and the failure reason when available.
- **FR-011**: The system MUST detect and report setup task timeout events according to configured timeout rules.
- **FR-012**: The system MUST provide a completion summary that distinguishes successful, skipped, failed, and timed-out setup tasks.

### Key Entities *(include if feature involves data)*

- **Repository Setup Target**: A workspace repository candidate for setup execution, including identity, selection status, and whether a setup task is defined.
- **Setup Task Execution**: A single run of a repository setup task, including start time, end time, elapsed duration, output mode, and final status.
- **Setup Run Summary**: Aggregated outcome of one setup command invocation, including counts and lists of successful, skipped, failed, and timed-out executions.

### Assumptions

- Setup tasks are optional per repository; repositories without setup tasks are expected and should be skipped.
- Timeout behavior uses existing workspace timeout configuration rules.
- Repository filtering uses repository identifiers already recognized by users in current workspace commands.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a workspace with at least five configured repositories, users can start full workspace setup with one command and receive a complete run summary in 100% of test runs.
- **SC-002**: 95% of successful setup runs present visible progress updates throughout execution and include elapsed time for every executed setup task.
- **SC-003**: In validation scenarios with injected failures and timeouts, 100% of failed or timed-out setup tasks are reported with the affected repository and outcome classification.
- **SC-004**: For selective setup runs, 100% of repositories outside the user-selected set remain unexecuted, and users can confirm this from the run summary.
