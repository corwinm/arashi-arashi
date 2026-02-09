# Feature Specification: Fix create --dry-run

**Feature Branch**: `028-fix-create-dry-run`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/65 (Bug: create --dry-run doesn't work)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preview planned changes (Priority: P1)

As a CLI user, I want `create --dry-run` to show what would be created so I can validate the plan before making changes.

**Why this priority**: This is the core value of dry-run and prevents unintended changes.

**Independent Test**: Run `create --dry-run` in a workspace with valid inputs and verify the output lists planned worktrees/branches while the filesystem and git state remain unchanged.

**Acceptance Scenarios**:

1. **Given** a valid workspace configuration and no conflicting worktrees/branches, **When** I run `create --dry-run`, **Then** it lists all planned worktrees/branches and does not create any.
2. **Given** a valid workspace configuration, **When** I run `create --dry-run`, **Then** the reported plan matches the plan that a real `create` run would execute for the same inputs.

---

### User Story 2 - Surface blocking conflicts (Priority: P2)

As a CLI user, I want `create --dry-run` to warn me about conflicts that would prevent creation so I can resolve them before a real run.

**Why this priority**: Early conflict visibility avoids failed runs and wasted time.

**Independent Test**: Run `create --dry-run` in a workspace with known conflicts (existing worktree path or branch) and confirm the output includes those conflicts without making changes.

**Acceptance Scenarios**:

1. **Given** a target worktree path already exists, **When** I run `create --dry-run`, **Then** the output flags the path conflict and no changes are made.
2. **Given** a target branch already exists, **When** I run `create --dry-run`, **Then** the output flags the branch conflict and no changes are made.

---

### User Story 3 - Understand dry-run outcomes (Priority: P3)

As a CLI user, I want a clear indication of whether the dry-run plan is actionable so I know if it is safe to proceed.

**Why this priority**: Users need a quick decision signal without parsing details.

**Independent Test**: Run `create --dry-run` in both clean and conflicting scenarios and verify the output includes an actionable or blocked status with no changes.

**Acceptance Scenarios**:

1. **Given** a conflict-free plan, **When** I run `create --dry-run`, **Then** the output indicates the plan can proceed.
2. **Given** any blocking conflict, **When** I run `create --dry-run`, **Then** the output indicates the plan is blocked.

---

### Edge Cases

- What happens when the workspace configuration is missing or invalid?
- How does the system handle a partially existing worktree (directory exists but is not a worktree)?
- What happens when multiple conflicts exist across repositories?
- How does the system handle insufficient permissions to inspect the target paths?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST perform a dry-run that makes no changes to worktrees, branches, or the filesystem.
- **FR-002**: System MUST list every worktree and branch that would be created for the given inputs.
- **FR-003**: System MUST identify and report conflicts that would block creation (e.g., existing target paths or branches).
- **FR-004**: System MUST indicate whether the overall plan is actionable or blocked.
- **FR-005**: System MUST ensure the dry-run plan aligns with the real create behavior for the same inputs.
- **FR-006**: System MUST return an error outcome for dry-runs with blocking conflicts while still making no changes.

### Key Entities *(include if feature involves data)*

- **Planned Worktree**: A proposed worktree location and branch name that would be created in a real run.
- **Conflict**: A detected condition that would prevent creation, including existing paths or branches.
- **Dry-run Outcome**: A summary indicating whether the plan is actionable or blocked.

## Assumptions

- Dry-run uses the same inputs and configuration as a normal create command.
- Output is displayed in a human-readable form suitable for quick review.
- Dry-run never prompts for additional input beyond what create already accepts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After any `create --dry-run`, zero new worktrees or branches exist compared to pre-run state.
- **SC-002**: In a test suite of at least 10 scenarios, the dry-run plan matches the real create plan 100% of the time.
- **SC-003**: 95% of users can determine whether a plan is actionable from the dry-run output without additional guidance.
- **SC-004**: Dry-run completes in under 3 seconds for a workspace with up to 10 repositories and 50 planned worktrees.
