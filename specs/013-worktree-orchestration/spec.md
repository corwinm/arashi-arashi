# Feature Specification: Worktree Orchestration

**Feature Branch**: `013-worktree-orchestration`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Implement worktree coordination logic that orchestrates the creation of coordinated worktrees across multiple repositories, handles branch conflicts, filters repositories, tracks progress, manages errors with rollback, and integrates with hooks system"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Coordinated Worktrees Across All Repositories (Priority: P1)

A developer wants to start work on a new feature that spans multiple repositories. They issue a single command to create worktrees with matching branch names across all configured repositories, allowing them to work on the feature holistically.

**Why this priority**: This is the core value proposition - enabling developers to work on multi-repo features without manual worktree creation in each repository. Without this, the tool has no purpose.

**Independent Test**: Can be fully tested by running the worktree creation command with a branch name against multiple test repositories, and verifying that worktrees are created with the correct branch in each repository.

**Acceptance Scenarios**:

1. **Given** a multi-repository workspace with 5 configured repositories, **When** the user initiates worktree creation for branch "feature-123", **Then** the system creates worktrees in all 5 repositories with branch "feature-123"
2. **Given** successful worktree creation across all repositories, **When** the operation completes, **Then** the system reports the paths to all created worktrees
3. **Given** repositories with different default branches (main, master, develop), **When** creating worktrees, **Then** the system correctly branches from each repository's default branch

---

### User Story 2 - Handle Branch Conflicts with User Choice (Priority: P2)

A developer attempts to create worktrees for a branch name that already exists in some repositories. The system detects the conflict and presents options to either reuse existing branches, create new unique names, or abort the operation.

**Why this priority**: Branch conflicts are a common scenario that would block the primary workflow. Handling this gracefully prevents data loss and gives users control over conflict resolution.

**Independent Test**: Can be tested by creating a branch manually in one repository, then attempting to create coordinated worktrees with that branch name, and verifying the conflict detection dialog appears with appropriate options.

**Acceptance Scenarios**:

1. **Given** branch "feature-123" exists in 2 out of 5 repositories, **When** attempting to create coordinated worktrees for "feature-123", **Then** the system detects the conflict and presents resolution options
2. **Given** a branch conflict dialog, **When** the user chooses to abort, **Then** no worktrees are created in any repository
3. **Given** a branch conflict dialog, **When** the user chooses to reuse existing branches, **Then** worktrees are created using existing branches where they exist and new branches where they don't

---

### User Story 3 - Filter Repositories for Selective Worktree Creation (Priority: P2)

A developer wants to create worktrees for a feature that only affects a subset of repositories. They use filtering options to specify which repositories should receive worktrees, avoiding clutter in unaffected repositories.

**Why this priority**: Not every feature spans all repositories. Selective creation improves efficiency and reduces noise in the workspace. This enhances usability but the tool is still functional without it.

**Independent Test**: Can be tested by running worktree creation with repository filtering (--only flag or interactive selection), and verifying that worktrees are created only in the specified repositories.

**Acceptance Scenarios**:

1. **Given** 10 configured repositories, **When** the user creates worktrees with "--only repo1,repo3,repo5" flag, **Then** worktrees are created only in the 3 specified repositories
2. **Given** interactive filtering is enabled, **When** the user is prompted to select repositories, **Then** a checkbox list of all repositories is displayed
3. **Given** interactive repository selection, **When** the user selects 3 out of 10 repositories and confirms, **Then** worktrees are created only in the selected repositories

---

### User Story 4 - Track Progress During Multi-Repository Operations (Priority: P3)

A developer initiates worktree creation across many repositories. The system displays real-time progress indicators showing which repositories are being processed, providing visibility into long-running operations.

**Why this priority**: Progress feedback improves user experience for operations that take several seconds, but the core functionality works without it. This is a polish feature.

**Independent Test**: Can be tested by running worktree creation against multiple repositories and observing the console output for progress indicators (spinners, status messages) for each repository.

**Acceptance Scenarios**:

1. **Given** worktree creation across 5 repositories, **When** the operation runs, **Then** a spinner displays for each repository being processed
2. **Given** a repository completes successfully, **When** moving to the next repository, **Then** the previous spinner updates to show success status
3. **Given** a repository fails during processing, **When** the error occurs, **Then** the spinner updates to show failure status before proceeding to rollback

---

### User Story 5 - Automatic Rollback on Partial Failure (Priority: P1)

A developer initiates worktree creation across 10 repositories. The operation succeeds for 7 repositories but fails on the 8th due to an error. The system automatically rolls back all 7 successfully created worktrees to maintain consistency, preventing partial state.

**Why this priority**: Partial failures would leave the workspace in an inconsistent state, forcing manual cleanup. Automatic rollback is essential for reliability and user trust in the tool.

**Independent Test**: Can be tested by simulating a failure condition (e.g., insufficient disk space, invalid git state) during multi-repo worktree creation, and verifying that all previously created worktrees are removed.

**Acceptance Scenarios**:

1. **Given** worktree creation fails on the 5th of 10 repositories, **When** the error is detected, **Then** the system initiates rollback for the 4 previously created worktrees
2. **Given** rollback is initiated, **When** cleanup completes, **Then** all created worktrees and branches are removed from affected repositories
3. **Given** rollback completes, **When** the operation finishes, **Then** the user receives a clear error message explaining what failed and confirming cleanup occurred

---

### User Story 6 - Execute Hooks at Key Points (Priority: P3)

A developer has configured custom hooks (pre-create, post-create) to perform setup tasks or validations. The system executes these hooks at appropriate points during worktree creation, allowing workspace customization.

**Why this priority**: Hooks enable extensibility and custom workflows, but the core worktree creation works without them. This is an advanced feature for power users.

**Independent Test**: Can be tested by configuring pre-create and post-create hooks, running worktree creation, and verifying that hooks are executed with correct context (branch name, repository path) at the appropriate times.

**Acceptance Scenarios**:

1. **Given** a pre-create hook is configured, **When** worktree creation begins for each repository, **Then** the hook executes before the worktree is created
2. **Given** a post-create hook is configured, **When** a worktree is successfully created, **Then** the hook executes with the worktree path and branch name
3. **Given** a pre-create hook fails, **When** the hook returns a non-zero exit code, **Then** worktree creation is aborted for that repository and rollback is triggered

---

### Edge Cases

- What happens when a repository is in a detached HEAD state or has uncommitted changes?
- How does the system handle repositories with insufficient disk space during worktree creation?
- What happens if the user cancels the operation mid-execution (via Ctrl+C)?
- How does the system handle repositories where the user lacks write permissions?
- What happens when a hook script hangs or times out?
- How does the system handle repository paths with special characters or spaces?
- What happens if the rollback itself fails for some worktrees?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST coordinate worktree creation across multiple repositories from a single command invocation
- **FR-002**: System MUST accept a branch name parameter for the worktrees to create
- **FR-003**: System MUST detect when the specified branch name already exists in any target repository
- **FR-004**: System MUST present conflict resolution options when branch name conflicts are detected (abort, reuse existing, create alternate name)
- **FR-005**: System MUST support filtering repositories via command-line flag (--only with comma-separated repository names)
- **FR-006**: System MUST support interactive repository selection via checkbox list
- **FR-007**: System MUST support "all repositories" mode as the default when no filter is specified
- **FR-008**: System MUST display progress indicators during multi-repository operations
- **FR-009**: System MUST execute pre-create hooks before worktree creation in each repository
- **FR-010**: System MUST execute post-create hooks after successful worktree creation in each repository
- **FR-011**: System MUST abort worktree creation for a repository if its pre-create hook fails
- **FR-012**: System MUST log each worktree creation operation with repository, branch, and worktree path
- **FR-013**: System MUST detect failures during worktree or branch creation
- **FR-014**: System MUST initiate rollback when any repository operation fails
- **FR-015**: System MUST roll back all previously created worktrees and branches when a failure occurs
- **FR-016**: System MUST continue rollback even if individual cleanup operations fail, logging failures
- **FR-017**: System MUST return detailed results including created worktree paths and any warnings
- **FR-018**: System MUST report success/failure status and error messages for each repository processed
- **FR-019**: System MUST validate that all target repositories exist and are valid git repositories before starting operations
- **FR-020**: System MUST respect hook timeout configurations when executing hook scripts

### Key Entities

- **Worktree Operation**: Represents a coordinated worktree creation operation spanning multiple repositories, including the target branch name, repository filter criteria, and operation log
- **Operation Log Entry**: Represents a single reversible action performed during the operation (worktree created, branch created, directory created), including sufficient information to undo the action
- **Repository Filter**: Represents the selection criteria for which repositories to include (all, explicit list, or interactive selection result)
- **Branch Conflict**: Represents a detected conflict where the target branch name already exists in a repository, including conflict resolution choice
- **Hook Execution Context**: Represents the environment and parameters passed to hook scripts, including branch name, repository path, and worktree path

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can create coordinated worktrees across 10 repositories with a single command in under 30 seconds
- **SC-002**: When a failure occurs during multi-repository operations, all previously created worktrees are cleaned up within 10 seconds
- **SC-003**: Branch conflict detection identifies conflicts in 100% of cases where the branch name exists in any target repository
- **SC-004**: Interactive repository filtering allows selecting any subset of repositories and completes selection in under 60 seconds for typical workspaces
- **SC-005**: Progress indicators update within 500ms of each repository status change during operations
- **SC-006**: Hook execution respects configured timeout values and terminates hung hooks appropriately
- **SC-007**: Error messages clearly identify which repository failed and why, enabling developers to resolve issues without examining logs
- **SC-008**: The operation log captures 100% of reversible actions, enabling complete rollback on failure
