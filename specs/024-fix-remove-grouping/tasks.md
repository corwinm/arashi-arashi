---

description: "Task list for fix remove worktree grouping"
---

# Tasks: Fix Remove Worktree Grouping

**Input**: Design documents from `/specs/024-fix-remove-grouping/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included (integration + unit) per quickstart.md and spec testing requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and shared types

- [X] T001 Update remove workflow response types for parent/child grouping in repos/arashi/src/types/remove.ts
- [X] T002 [P] Align list worktree entry types with parentPath/childrenPaths in repos/arashi/src/types/list.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared behavior needed by all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Implement centralized WorktreeEntry builder (status, parentPath, childrenPaths) in repos/arashi/src/core/worktree.ts
- [X] T004 Re-evaluate remaining child statuses after parent removal in repos/arashi/src/core/remove.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Accurate Worktree Grouping (Priority: P1) 🎯 MVP

**Goal**: Group worktrees by parent-child relationship rather than branch name

**Independent Test**: List/remove a workspace where parent and children use different branch names and verify children group under the correct parent.

### Tests for User Story 1

- [X] T005 [P] [US1] Expand grouping coverage for mixed-branch parent/child in repos/arashi/tests/integration/remove.us1.test.ts
- [X] T006 [P] [US1] Add unit coverage for parentPath-based grouping in repos/arashi/tests/unit/core/remove.test.ts

### Implementation for User Story 1

- [X] T007 [US1] Group remove list by parentPath instead of branch name in repos/arashi/src/core/remove.ts
- [X] T008 [US1] Render grouped output with correct parent/child mapping in repos/arashi/src/commands/remove.ts

**Checkpoint**: User Story 1 fully functional and independently testable

---

## Phase 4: User Story 2 - Prunable Missing Worktrees (Priority: P2)

**Goal**: Mark missing worktree directories as prunable, not dirty

**Independent Test**: Delete a worktree directory and verify the remove list marks it prunable and still allows removal.

### Tests for User Story 2

- [X] T009 [P] [US2] Extend missing-directory scenario in repos/arashi/tests/integration/remove.us2.test.ts
- [X] T010 [P] [US2] Add unit test for missing path -> prunable in repos/arashi/tests/unit/core/worktree.test.ts

### Implementation for User Story 2

- [X] T011 [US2] Mark missing worktree directories as prunable during status resolution in repos/arashi/src/core/worktree.ts
- [X] T012 [US2] Surface prunable status in remove list output in repos/arashi/src/commands/remove.ts

**Checkpoint**: User Story 2 fully functional and independently testable

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and final checks

- [ ] T013 [P] Validate manual checklist in specs/024-fix-remove-grouping/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) or sequentially (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational - no dependency on US1

### Within Each User Story

- Tests written and failing before implementation
- Core logic before command/output wiring
- Story complete before moving to next priority

### Parallel Opportunities

- Setup: T001 and T002 can run in parallel
- US1 tests: T005 and T006 can run in parallel
- US2 tests: T009 and T010 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch tests for User Story 1 together:
Task: "Expand grouping coverage for mixed-branch parent/child in repos/arashi/tests/integration/remove.us1.test.ts"
Task: "Add unit coverage for parentPath-based grouping in repos/arashi/tests/unit/core/remove.test.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch tests for User Story 2 together:
Task: "Extend missing-directory scenario in repos/arashi/tests/integration/remove.us2.test.ts"
Task: "Add unit test for missing path -> prunable in repos/arashi/tests/unit/core/worktree.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP
3. Add User Story 2 → Test independently → Release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
