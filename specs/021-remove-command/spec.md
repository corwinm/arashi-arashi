# Feature Specification: Remove Command

**Feature Branch**: `021-remove-command`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/27"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Remove Single Branch with All Resources (Priority: P1)

A developer has finished working on a feature branch and wants to completely clean up all related worktrees and branches across the main repository and all sub-repositories in one command.

**Why this priority**: This is the primary use case for the remove command - complete cleanup after feature work is done. It delivers immediate value by automating what would otherwise require multiple manual git commands across multiple repositories.

**Independent Test**: Can be fully tested by creating a worktree with branch across multiple repos, running `arashi remove <branch>`, and verifying all worktrees and branches are removed. Delivers value by saving time and preventing errors in manual cleanup.

**Acceptance Scenarios**:

1. **Given** a feature branch exists with worktrees in main and sub-repositories, **When** user runs `arashi remove feature-branch`, **Then** system prompts for confirmation, removes all worktrees, deletes all branches, and displays success message listing removed items
2. **Given** a feature branch has no uncommitted changes, **When** user runs `arashi remove feature-branch`, **Then** system completes removal without warnings
3. **Given** user confirms removal at the prompt, **When** system executes removal, **Then** all worktrees are deleted from disk and all branches are deleted from git history

---

### User Story 2 - Remove Multiple Branches (Priority: P1)

A developer wants to clean up several old feature branches at once without specifying each one individually.

**Why this priority**: Batch operations are essential for efficient workspace management when multiple features accumulate. This is equally critical as single-branch removal.

**Independent Test**: Can be tested by creating multiple worktrees, running `arashi remove` (no arguments), selecting multiple branches from the list, and verifying all selected branches are removed. Delivers value by enabling bulk cleanup.

**Acceptance Scenarios**:

1. **Given** multiple feature branches exist, **When** user runs `arashi remove` without arguments, **Then** system displays multi-select list of all worktrees
2. **Given** user selects multiple branches from the list, **When** user confirms selection, **Then** system removes all selected branches and their worktrees
3. **Given** interactive selection is displayed, **When** user cancels the selection, **Then** no branches are removed and system exits gracefully

---

### User Story 3 - Safe Removal with Dirty Check (Priority: P2)

A developer attempts to remove a branch but has uncommitted changes they forgot about. The system should warn them before data loss occurs.

**Why this priority**: Data protection is critical but secondary to basic functionality. Users expect warnings when operations might lose work.

**Independent Test**: Can be tested by creating a worktree with uncommitted changes, running `arashi remove <branch>`, and verifying the warning appears and removal only proceeds with explicit confirmation. Delivers value by preventing accidental data loss.

**Acceptance Scenarios**:

1. **Given** a worktree has uncommitted changes, **When** user runs `arashi remove <branch>`, **Then** system displays warning about uncommitted changes and requires explicit confirmation
2. **Given** user is warned about uncommitted changes, **When** user declines confirmation, **Then** no worktrees or branches are removed
3. **Given** user wants to skip dirty checks, **When** user runs `arashi remove <branch> --no-check-dirty`, **Then** system removes worktrees without checking for uncommitted changes

---

### User Story 4 - Selective Removal with Flags (Priority: P3)

A developer wants fine-grained control over what gets removed - sometimes keeping worktrees but deleting branches, or vice versa.

**Why this priority**: Advanced control is useful for specific workflows but not essential for the primary use case. Most users want complete cleanup.

**Independent Test**: Can be tested by running `arashi remove <branch> --keep-worktrees` and verifying only branches are deleted while worktree directories remain. Delivers value by supporting advanced workflows.

**Acceptance Scenarios**:

1. **Given** a feature branch exists, **When** user runs `arashi remove <branch> --keep-worktrees`, **Then** system deletes branches but leaves worktree directories intact
2. **Given** a feature branch exists, **When** user runs `arashi remove <branch> --keep-branches`, **Then** system removes worktrees but leaves git branches intact
3. **Given** both flags are used, **When** user runs `arashi remove <branch> --keep-worktrees --keep-branches`, **Then** system performs no removal and displays informational message

---

### Edge Cases

- What happens when the specified branch does not exist?
- What happens when a worktree is currently in use (user has it open in another terminal)?
- What happens when some sub-repositories have the branch but others don't?
- What happens when deletion fails for one repository but succeeds for others?
- What happens when user lacks permissions to delete a worktree directory?
- What happens when the branch is the currently checked out branch in the main repository?
- What happens when network issues prevent communication with remote repositories?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load workspace configuration from `.arashi/config.json` before executing any removal operations
- **FR-002**: System MUST discover all worktrees associated with the specified branch name across main and sub-repositories
- **FR-003**: System MUST check for uncommitted changes in all worktrees before removal (unless `--no-check-dirty` flag is provided)
- **FR-004**: System MUST display warning message when uncommitted changes are detected and require explicit user confirmation to proceed
- **FR-005**: System MUST prompt user for confirmation before performing any destructive operations
- **FR-006**: System MUST remove worktree directories from filesystem for all sub-repositories (unless `--keep-worktrees` flag is provided)
- **FR-007**: System MUST remove worktree directory from filesystem for main repository (unless `--keep-worktrees` flag is provided)
- **FR-008**: System MUST delete git branches from all sub-repositories (unless `--keep-branches` flag is provided)
- **FR-009**: System MUST delete git branch from main repository (unless `--keep-branches` flag is provided)
- **FR-010**: System MUST display success message listing all removed worktrees and deleted branches
- **FR-011**: System MUST display multi-select list of available worktrees when no branch argument is provided
- **FR-012**: System MUST support removal of multiple branches when selected from interactive list
- **FR-013**: System MUST handle error when specified branch does not exist and display helpful message
- **FR-014**: System MUST handle error when worktree is currently in use and cannot be removed
- **FR-015**: System MUST continue removal process even if some sub-repositories fail, reporting errors for failed operations
- **FR-016**: System MUST validate that worktree directories are safe to delete before attempting removal
- **FR-017**: System MUST use git worktree remove command rather than direct filesystem deletion when possible
- **FR-018**: System MUST support `--no-check-dirty` flag to bypass uncommitted changes check
- **FR-019**: System MUST support `--keep-worktrees` flag to preserve worktree directories
- **FR-020**: System MUST support `--keep-branches` flag to preserve git branches

### Key Entities

- **Worktree**: A git working directory associated with a branch, located on the filesystem with a specific path
- **Branch**: A git reference pointing to a commit, exists in both local and potentially remote repositories
- **Configuration**: Workspace settings stored in `.arashi/config.json` defining main repository and sub-repositories
- **Sub-repository**: A git repository managed as part of the workspace, may have its own worktrees for the same branch

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can remove a complete feature branch (all worktrees and branches) in under 30 seconds with a single command
- **SC-002**: System prevents accidental data loss by warning about uncommitted changes 100% of the time (unless explicitly bypassed)
- **SC-003**: Users can remove multiple branches in a single operation using interactive selection
- **SC-004**: System provides clear feedback about what was removed, listing all affected repositories and branches
- **SC-005**: System handles error conditions gracefully, continuing partial removal and reporting specific failures
- **SC-006**: 100% of removal operations either complete successfully or fail safely without leaving workspace in inconsistent state
