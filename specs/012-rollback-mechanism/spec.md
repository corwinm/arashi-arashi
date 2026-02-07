# Feature Specification: Rollback Mechanism

**Feature Branch**: `012-rollback-mechanism`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Implement operation rollback logic that maintains an operation log of reversible actions and can roll back all changes when errors occur, handling different operation types like worktree creation, branch creation, and directory creation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Cleanup on Failed Operations (Priority: P1)

A developer initiates a multi-step operation (such as creating worktrees across multiple repositories). The operation partially completes but then encounters an error. The system automatically detects the failure and reverses all changes made before the error, leaving the workspace in its original state.

**Why this priority**: This is the core purpose of the rollback mechanism - preventing partial states that would require manual cleanup. Without this, users would be left with inconsistent workspaces whenever operations fail.

**Independent Test**: Can be fully tested by simulating a failure mid-operation (e.g., triggering an error after creating 3 worktrees), and verifying that all previously created resources are removed automatically.

**Acceptance Scenarios**:

1. **Given** an operation creates 5 worktrees and fails on the 4th, **When** the error is detected, **Then** the system automatically removes the 3 successfully created worktrees
2. **Given** a rollback completes, **When** the user inspects their workspace, **Then** no trace of the failed operation remains (no worktrees, branches, or directories)
3. **Given** rollback is in progress, **When** the user is waiting, **Then** the system displays progress indicating what is being cleaned up

---

### User Story 2 - Log Reversible Actions During Operations (Priority: P1)

As operations execute, the system records each reversible action in an operation log. This log contains sufficient information to undo each action, such as worktree paths, branch names, and repository locations.

**Why this priority**: The operation log is the foundation of rollback capability. Without tracking what was done, the system cannot undo it. This is essential infrastructure for the rollback mechanism to function.

**Independent Test**: Can be tested by executing an operation, capturing the operation log, and verifying that each action performed is recorded with complete reversal information (type, location, identifiers).

**Acceptance Scenarios**:

1. **Given** a worktree is created at path "/repos/project/feature-123", **When** the operation log is examined, **Then** it contains an entry with action type "worktree_created", path "/repos/project/feature-123", and repository identifier
2. **Given** 10 actions are performed during an operation, **When** the operation completes, **Then** all 10 actions are present in the operation log in chronological order
3. **Given** multiple operation types occur (worktree, branch, directory), **When** logging each action, **Then** the log captures type-specific reversal information for each

---

### User Story 3 - Handle Different Operation Types (Priority: P1)

The rollback mechanism supports reversing different types of operations: removing created worktrees, deleting created branches, and removing created directories. Each operation type has specific cleanup logic appropriate to its nature.

**Why this priority**: Different resources require different cleanup approaches. The rollback mechanism must handle all operation types that can occur during multi-repository operations to be complete and reliable.

**Independent Test**: Can be tested by creating an operation log with mixed operation types (worktrees, branches, directories), triggering rollback, and verifying that each operation type is reversed using appropriate cleanup logic.

**Acceptance Scenarios**:

1. **Given** the operation log contains a "worktree_created" entry, **When** rollback executes, **Then** the system removes the worktree using appropriate worktree removal commands
2. **Given** the operation log contains a "branch_created" entry, **When** rollback executes, **Then** the system deletes the branch from the repository
3. **Given** the operation log contains a "directory_created" entry, **When** rollback executes, **Then** the system removes the directory and its contents

---

### User Story 4 - Continue Rollback Despite Individual Failures (Priority: P2)

During rollback, an individual cleanup operation fails (e.g., a directory cannot be removed due to permissions). The system logs the failure but continues rolling back remaining operations, ensuring maximum cleanup even when some steps fail.

**Why this priority**: Rollback failures can occur due to external factors (file locks, permissions, resource conflicts). Partial cleanup is better than no cleanup. This improves resilience but the core rollback functionality works without it.

**Independent Test**: Can be tested by simulating a cleanup failure (e.g., marking a directory as read-only), triggering rollback, and verifying that other operations are still reversed and the failure is logged.

**Acceptance Scenarios**:

1. **Given** rollback of 5 operations where the 2nd fails, **When** rollback continues, **Then** operations 1, 3, 4, and 5 are still reversed
2. **Given** a cleanup operation fails during rollback, **When** the failure occurs, **Then** the error is logged with details about what could not be cleaned up
3. **Given** rollback completes with some failures, **When** the operation finishes, **Then** the user receives a summary showing what was cleaned up and what failed

---

### User Story 5 - Reverse Operations in Correct Order (Priority: P2)

The rollback mechanism reverses operations in reverse chronological order (last action first), ensuring that dependencies between operations are respected. For example, removing a worktree before deleting the branch it references.

**Why this priority**: Operation order can matter for cleanup (e.g., worktree must be removed before branch). Reverse order is a safe default. However, if dependency tracking isn't complex, this may not be critical for initial functionality.

**Independent Test**: Can be tested by creating operations with dependencies (branch, then worktree on that branch), triggering rollback, and verifying that the worktree is removed before the branch is deleted.

**Acceptance Scenarios**:

1. **Given** operation log contains: [branch created, worktree created, directory created], **When** rollback executes, **Then** operations are reversed in order: [remove directory, remove worktree, delete branch]
2. **Given** reverse order prevents a dependency error, **When** rollback completes, **Then** all operations are reversed successfully without errors related to operation order

---

### Edge Cases

- What happens if rollback is triggered but the operation log is empty (no actions to reverse)?
- How does the system handle cleanup when a resource no longer exists (already deleted manually)?
- What happens if multiple rollbacks are triggered simultaneously for different operations?
- How does the system handle resources that have been modified after creation during rollback?
- What happens if the operation log is corrupted or incomplete?
- How does the system handle rollback when disk space is exhausted?
- What happens if the process is killed mid-rollback (partial rollback)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an operation log structure that records reversible actions
- **FR-002**: System MUST support adding entries to the operation log with action type, timestamp, and reversal information
- **FR-003**: System MUST record worktree creation operations in the log with repository path, worktree path, and branch name
- **FR-004**: System MUST record branch creation operations in the log with repository path and branch name
- **FR-005**: System MUST record directory creation operations in the log with directory path
- **FR-006**: System MUST provide a rollback function that processes the operation log
- **FR-007**: System MUST reverse operations in reverse chronological order (last in, first out)
- **FR-008**: System MUST remove worktrees when rolling back "worktree_created" operations
- **FR-009**: System MUST delete branches when rolling back "branch_created" operations
- **FR-010**: System MUST remove directories when rolling back "directory_created" operations
- **FR-011**: System MUST continue rollback execution even if individual cleanup operations fail
- **FR-012**: System MUST log each cleanup operation's success or failure during rollback
- **FR-013**: System MUST log detailed error information when a cleanup operation fails
- **FR-014**: System MUST display rollback progress to the user during execution
- **FR-015**: System MUST return a summary of rollback results indicating what was cleaned up and any failures
- **FR-016**: System MUST handle the case where a resource no longer exists during cleanup (treat as success)
- **FR-017**: System MUST validate operation log entries before attempting rollback
- **FR-018**: System MUST handle empty operation logs gracefully (no-op rollback)
- **FR-019**: System MUST prevent concurrent rollbacks for the same operation log
- **FR-020**: System MUST preserve operation log contents after rollback for audit purposes

### Key Entities

- **Operation Log**: Represents a collection of logged actions for a single multi-step operation, maintaining chronological order and providing rollback capabilities
- **Log Entry**: Represents a single reversible action with its type (worktree_created, branch_created, directory_created), timestamp, location information, and any metadata needed for reversal
- **Rollback Result**: Represents the outcome of a rollback attempt, including counts of successful reversals, failed reversals, and detailed error information for failures
- **Cleanup Operation**: Represents a single reversal action being executed during rollback, with its target resource, action type, and execution status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When an operation fails after completing 10 actions, rollback removes all 10 artifacts within 15 seconds
- **SC-002**: Operation log captures 100% of reversible actions performed during multi-step operations
- **SC-003**: Rollback continues and completes even when up to 30% of individual cleanup operations fail
- **SC-004**: Users receive clear feedback on rollback progress, with status updates visible within 1 second of each cleanup operation
- **SC-005**: Rollback handles non-existent resources gracefully without failing the entire rollback process
- **SC-006**: Operation logs preserve sufficient information to reverse operations accurately 100% of the time
- **SC-007**: Reverse-order processing prevents dependency errors in 100% of cases involving related operations (e.g., branch and worktree)
- **SC-008**: Rollback summary accurately reports both successful and failed cleanup operations with specific details
