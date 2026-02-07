# Feature Specification: Git Utility Library

**Feature Branch**: `005-git-utility-lib`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/14"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Execute Git Operations Safely (Priority: P1)

As a developer using the Arashi worktree manager, I need the system to safely execute version control operations with clear error reporting so that I can trust the operations will succeed or fail with helpful diagnostic information.

**Why this priority**: Core foundation for all version control operations - without this, no other functionality can work reliably. Proper error handling prevents silent failures and data loss.

**Independent Test**: Can be fully tested by performing a simple version control query in both valid and invalid repositories, and verifying that results are captured correctly and errors are clearly reported.

**Acceptance Scenarios**:

1. **Given** a valid version control repository, **When** executing a version control operation, **Then** the operation output is captured and returned
2. **Given** an invalid repository path, **When** executing an operation that fails, **Then** a clear error is reported with diagnostic information
3. **Given** an operation that produces both success output and warnings, **When** the operation executes, **Then** both information types are captured and available

---

### User Story 2 - Verify Repository Types (Priority: P1)

As a developer using the Arashi worktree manager, I need to detect whether a path is a version control repository (normal or bare) so that I can validate user inputs and prevent operations on invalid directories.

**Why this priority**: Essential for preventing errors before they occur - attempting operations on non-repositories would cause cryptic failures. This provides clear, early validation.

**Independent Test**: Can be fully tested by creating test directories with different repository structures (normal repository with metadata subdirectory, bare repository with core files, non-repository directory) and verifying correct detection results.

**Acceptance Scenarios**:

1. **Given** a path containing a normal repository structure, **When** checking if it's a repository, **Then** the check returns true
2. **Given** a path containing a linked repository reference, **When** checking if it's a repository, **Then** the check returns true
3. **Given** a path containing a bare repository structure, **When** checking if it's a bare repository, **Then** the check returns true
4. **Given** a path that is not a repository, **When** checking repository type, **Then** the checks return false

---

### User Story 3 - Manage Worktrees (Priority: P1)

As a developer using the Arashi worktree manager, I need to create, list, and remove worktrees so that I can work with multiple branches simultaneously in separate directories.

**Why this priority**: Core functionality of the worktree manager - this is the primary value proposition of the tool. Without this, the tool has no purpose.

**Independent Test**: Can be fully tested by creating a test repository, adding a worktree to a new location, listing worktrees to verify it exists, and removing it to verify cleanup.

**Acceptance Scenarios**:

1. **Given** a valid repository and a new branch name, **When** creating a worktree, **Then** a new worktree is created at the specified location with the branch checked out
2. **Given** a repository with multiple worktrees, **When** listing worktrees, **Then** all worktrees are returned with their locations, branches, and current state
3. **Given** an existing worktree location, **When** removing the worktree, **Then** the worktree is cleanly removed from the filesystem and repository tracking
4. **Given** an invalid repository path, **When** attempting to create a worktree, **Then** a clear error is reported with descriptive information

---

### User Story 4 - Manage Branches (Priority: P2)

As a developer using the Arashi worktree manager, I need to check if branches exist, create new branches, and delete branches so that I can prepare the repository state before creating worktrees.

**Why this priority**: Supporting functionality for worktree operations - branches must exist before worktrees can be created for them. Less critical than worktree operations themselves but still essential.

**Independent Test**: Can be fully tested by checking for non-existent branches, creating a new branch, verifying it exists, and deleting it.

**Acceptance Scenarios**:

1. **Given** a branch name, **When** checking if it exists, **Then** the correct existence status is returned
2. **Given** a new branch name and source branch, **When** creating a branch, **Then** the branch is created pointing to the same commit as the source
3. **Given** an existing local branch, **When** deleting with normal mode, **Then** the branch is deleted only if fully merged
4. **Given** an existing local branch, **When** deleting with force mode, **Then** the branch is deleted regardless of merge status

---

### User Story 5 - Synchronize with Remote (Priority: P2)

As a developer using the Arashi worktree manager, I need to fetch latest changes from remote and set up tracking relationships so that my local branches stay synchronized with the remote repository.

**Why this priority**: Important for team collaboration and keeping local state current, but not required for basic worktree operations. Users can work with local-only branches initially.

**Independent Test**: Can be fully tested with a test repository that has a remote, by fetching changes and verifying that new remote refs are available, and by setting tracking and verifying the relationship exists.

**Acceptance Scenarios**:

1. **Given** a repository with a configured remote, **When** fetching latest changes, **Then** all remote references are updated locally
2. **Given** a local branch and a remote branch, **When** setting upstream tracking, **Then** the local branch is configured to track the remote branch
3. **Given** a repository without a remote configured, **When** attempting to fetch, **Then** a clear error is reported explaining the issue

---

### User Story 6 - Query Repository State (Priority: P3)

As a developer using the Arashi worktree manager, I need to query the current branch, default branch, and working tree status so that I can display repository information to users and make informed decisions about operations.

**Why this priority**: Nice-to-have information for user experience and intelligent behavior, but not required for core worktree operations. Can be added later to enhance the tool.

**Independent Test**: Can be fully tested by creating a repository with known state (specific current branch, modified files) and verifying the queries return expected results.

**Acceptance Scenarios**:

1. **Given** a repository on a specific branch, **When** querying the current branch, **Then** the correct branch name is returned
2. **Given** a repository with a remote origin, **When** querying the default branch, **Then** the remote's default branch name is returned
3. **Given** a repository with modified files, **When** getting status, **Then** all changes are reported in a structured format
4. **Given** a repository not on any named branch, **When** querying the current branch, **Then** an appropriate indication is returned

---

### Edge Cases

- What happens when executing an operation that requires user input (e.g., conflict resolution)?
- How does the system handle operations that produce very large output?
- What happens when a worktree location already exists on the filesystem?
- How does the system handle concurrent operations on the same repository?
- What happens when network connectivity fails during a remote synchronization operation?
- How does the system handle symbolic link loops or permission-denied errors when checking repository types?
- What happens when version control tools are not installed or not available in the system?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide safe operation execution that captures both output and error information
- **FR-002**: System MUST detect whether a path contains a version control repository by checking for repository metadata
- **FR-003**: System MUST detect whether a path is a bare repository by checking for core repository files
- **FR-004**: System MUST create worktrees at specified locations for given branches
- **FR-005**: System MUST remove worktrees and clean up filesystem entries
- **FR-006**: System MUST list all worktrees for a repository with their locations, branches, and commit information
- **FR-007**: System MUST verify whether a branch exists in a repository
- **FR-008**: System MUST create new branches from existing branches
- **FR-009**: System MUST delete branches with both safe (merged-only) and force modes
- **FR-010**: System MUST fetch latest changes from a remote repository
- **FR-011**: System MUST configure upstream tracking relationships between local and remote branches
- **FR-012**: System MUST provide working tree status information showing all modifications
- **FR-013**: System MUST determine the default branch from the remote repository
- **FR-014**: System MUST determine the current active branch
- **FR-015**: System MUST report operation failures with clear error messages containing diagnostic information
- **FR-016**: System MUST support operations on both normal and bare repositories where applicable

### Key Entities

- **Repository**: A directory structure containing version control metadata. Has properties: filesystem path, repository type (normal/bare), default branch name.
- **Worktree**: A checked-out working directory linked to a repository. Has properties: filesystem path, associated branch name, commit identifier, locked status.
- **Branch**: A named reference to a point in version history. Has properties: name, commit identifier, upstream tracking relationship, merge status.
- **Operation Result**: The outcome of executing a repository operation. Has properties: success output, error messages, exit status, operation parameters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All repository operations complete in under 5 seconds for repositories with up to 10,000 commits
- **SC-002**: System correctly handles 100% of operation failure scenarios with clear error reporting
- **SC-003**: Repository type detection correctly identifies normal repositories, bare repositories, and non-repositories in 100% of test cases
- **SC-004**: Worktree operations (create, list, remove) work reliably on repositories with up to 50 existing worktrees
- **SC-005**: All core functionality demonstrates reliable operation in both success and failure scenarios
- **SC-006**: System correctly interprets repository information from all standard versions of the underlying version control tool (version 2.5 onwards)
- **SC-007**: Error messages contain sufficient context for developers to diagnose issues without needing access to internal logs or source code
