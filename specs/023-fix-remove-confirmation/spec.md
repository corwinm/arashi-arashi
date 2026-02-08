# Feature Specification: Fix Remove Command Confirmation

**Feature Branch**: `023-fix-remove-confirmation`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: User description: "I am having an issue with the arashi remove command. When I run the command through the installed package, the command exits before I can select and submit the worktrees I want to remove. If I provide a branch, I don't get the ability to confirm the delete and the command exits."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select worktrees to remove (Priority: P1)

As a user running the remove command interactively, I want to select one or more worktrees and submit my selection without the command exiting early, so I can remove the intended worktrees in a single run.

**Why this priority**: This is the primary workflow for safely removing worktrees and is currently blocked by premature exit.

**Independent Test**: Can be fully tested by running the remove command interactively, selecting worktrees, submitting the selection, and verifying the command continues to the next step instead of exiting.

**Acceptance Scenarios**:

1. **Given** an interactive terminal session, **When** I open the worktree selection, choose one or more worktrees, and submit, **Then** the command proceeds to the next step without exiting early.
2. **Given** an interactive terminal session, **When** I open the worktree selection and submit without making a selection, **Then** I receive a clear message and the command remains in a controlled flow (no abrupt exit).

---

### User Story 2 - Confirm removal when a branch is provided (Priority: P2)

As a user providing a branch directly to the remove command, I want to be prompted to confirm the deletion before any removal happens, so I can avoid accidental deletes.

**Why this priority**: Direct branch removal should remain safe and consistent with interactive safeguards.

**Independent Test**: Can be fully tested by running the remove command with a branch argument and confirming that a deletion confirmation prompt appears before any removal proceeds.

**Acceptance Scenarios**:

1. **Given** an interactive terminal session and a valid branch argument, **When** I run the remove command, **Then** I am prompted to confirm deletion before any worktree is removed.
2. **Given** an interactive terminal session and a valid branch argument, **When** I decline the confirmation, **Then** no worktrees are removed and the command exits cleanly.

---

### User Story 3 - Clear behavior in non-interactive runs (Priority: P3)

As a user running the remove command in a non-interactive environment, I want a clear, immediate response that interactive input is required, so I understand why the operation cannot proceed.

**Why this priority**: Ensures predictable behavior in CI or scripted environments and prevents silent failures.

**Independent Test**: Can be fully tested by running the command with standard input not attached to a terminal and verifying a clear message and non-success exit.

**Acceptance Scenarios**:

1. **Given** a non-interactive environment, **When** I run the remove command without a way to provide interactive input, **Then** the command exits with a clear message explaining that interactive input is required.

---

### Edge Cases

- User submits a selection while the list of worktrees is empty.
- User provides a branch that does not map to any worktree.
- User cancels the selection or confirmation step.
- User provides multiple branches and one or more are invalid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST keep the interactive selection flow open until the user submits a choice or explicitly cancels.
- **FR-002**: The system MUST not exit immediately after selection submission; it must continue to the next step in the removal flow.
- **FR-003**: When a branch is provided directly, the system MUST present a deletion confirmation before any removal is performed.
- **FR-004**: If the user declines confirmation, the system MUST perform no removals and exit cleanly.
- **FR-005**: In non-interactive environments, the system MUST provide a clear message indicating that interactive input is required.
- **FR-006**: The system MUST present a clear message when no selectable worktrees are available.
- **FR-007**: The system MUST handle invalid branches with a clear error message and no removals.

### Key Entities *(include if feature involves data)*

- **Worktree Selection**: A user-chosen set of worktrees intended for removal, including zero or more entries.
- **Removal Confirmation**: The explicit user decision to proceed or cancel a deletion.
- **Branch Input**: One or more branch identifiers supplied directly to the command.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 10 consecutive interactive runs, users can submit a worktree selection without the command exiting early.
- **SC-002**: In 10 consecutive runs with a branch argument, the confirmation prompt appears before any removal is executed.
- **SC-003**: 95% of users can complete the intended removal flow on the first attempt without accidental deletions.
- **SC-004**: Non-interactive runs exit with a clear message in 100% of attempts.

## Assumptions

- The remove command is expected to run in an interactive terminal for selection and confirmation steps.
- Declining confirmation should leave all worktrees unchanged.
