# Feature Specification: Rework Hooks

**Feature Branch**: `027-rework-hooks`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Rework hooks implementation and design. Add repo-specific hooks like `pre-create.arashi.sh` and `post-create.arashi.sh` that run after the child repo is created, execute in the new worktree context, and expose main repo and parent repo references. `pre-create.sh` runs before any worktrees are created. `post-create.sh` runs after all other hooks."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run Repo-Specific Hooks (Priority: P1)

As a workspace maintainer, I can define repo-specific create hooks (e.g., for the `arashi` child repo) so they run in the new worktree context and receive references to the main repo and parent repo.

**Why this priority**: This enables per-repo setup and validation immediately after a worktree is created.

**Independent Test**: Create a single child repo with repo-specific hooks defined and verify the hooks run in the correct context with the expected repo references.

**Acceptance Scenarios**:

1. **Given** a configured repo-specific pre-create and post-create hook for a child repo, **When** the child repo is created, **Then** both hooks run in the new worktree context with access to main and parent repo references.
2. **Given** no repo-specific hooks are defined for a child repo, **When** the child repo is created, **Then** creation completes without hook-related errors.

---

### User Story 2 - Run Global Pre-Create Hook (Priority: P2)

As a workspace maintainer, I can define a global pre-create hook that runs before any worktrees are created.

**Why this priority**: This allows global setup, validation, or gating before worktree creation begins.

**Independent Test**: Define a global pre-create hook and attempt a create operation to confirm the hook runs before any worktree creation.

**Acceptance Scenarios**:

1. **Given** a global pre-create hook is defined, **When** a create operation starts, **Then** the pre-create hook runs before any worktree is created.

---

### User Story 3 - Run Global Post-Create Hook (Priority: P3)

As a workspace maintainer, I can define a global post-create hook that runs after all other hooks and after all worktrees in the operation are created.

**Why this priority**: This provides a finalization step that only runs after all child repo creation tasks complete.

**Independent Test**: Create multiple child repos in a single operation and verify the global post-create hook runs once after the last repo is created.

**Acceptance Scenarios**:

1. **Given** a global post-create hook is defined and multiple child repos are created in one operation, **When** the operation completes, **Then** the post-create hook runs once after all other hooks.

---

### Edge Cases

- A hook file is missing or not defined for the requested hook type.
- A hook fails to run or returns an error, which stops the overall create operation and skips the global post-create hook.
- Multiple child repos are created in a single operation with a mix of repo-specific hooks.
- A repo-specific hook expects main or parent repo references but they are unavailable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect and run a global pre-create hook before any worktree is created.
- **FR-002**: System MUST detect and run a repo-specific pre-create hook named `pre-create.<child-repo>.sh` after the child repo worktree exists and before any repo-specific post-create hook.
- **FR-003**: System MUST run repo-specific hooks in the context of the newly created child worktree.
- **FR-004**: System MUST provide repo-specific hooks with references to the main repo and parent repo.
- **FR-005**: System MUST run a repo-specific post-create hook named `post-create.<child-repo>.sh` after the corresponding repo-specific pre-create hook.
- **FR-006**: System MUST detect and run a global post-create hook after all other hooks finish and after all worktrees in the operation are created.
- **FR-007**: System MUST stop the create operation immediately when any hook fails and MUST NOT run the global post-create hook in that case.
- **FR-008**: System MUST ensure the global post-create hook runs at most once per create operation.

### Key Entities *(include if feature involves data)*

- **Hook Script**: A user-provided file that executes at a defined create lifecycle point and may be global or repo-specific.
- **Hook Execution**: A single invocation of a hook script with a defined lifecycle position, outcome, and associated repo context.
- **Repository Context**: References to the main repo, parent repo, and the child repo worktree associated with a hook execution.

## Assumptions

- Hook scripts are optional; missing hooks are skipped without error.
- Only one hook file is expected per hook type and repo.
- Repo-specific hooks are scoped to a single child repo name.

## Dependencies

- None identified.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In 20 consecutive create operations with all hooks defined, each expected hook runs exactly once in the documented order.
- **SC-002**: In 20 consecutive create operations with repo-specific hooks, each hook runs in the child repo context such that relative paths resolve to the child repo root.
- **SC-003**: In 20 consecutive create operations, main repo and parent repo references are available to every repo-specific hook.
- **SC-004**: For a create operation that includes multiple child repos, the global post-create hook runs once after the final child repo is created.
