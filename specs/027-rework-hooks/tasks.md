---

description: "Task list for feature implementation"
---

# Tasks: Rework Hooks

**Input**: Design documents from `specs/027-rework-hooks/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish hook lifecycle structure for consistent execution

- [x] T001 Add hook lifecycle ordering constants in `repos/arashi/src/lib/hooks.ts`
- [x] T002 Add hook name parsing helpers for repo-specific hooks in `repos/arashi/src/lib/hooks.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook discovery and execution plumbing required for all stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement hook discovery for global and repo-specific hooks in `repos/arashi/src/lib/hooks.ts`
- [x] T004 Add repository context builder for main/parent/child paths in `repos/arashi/src/lib/hooks.ts`
- [x] T005 Add hook execution result handling for failures and skips in `repos/arashi/src/lib/hooks.ts`
- [x] T006 Wire hook execution results into create flow in `repos/arashi/src/core/worktree.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Run Repo-Specific Hooks (Priority: P1) 🎯 MVP

**Goal**: Repo-specific create hooks run in the child worktree context with main/parent references.

**Independent Test**: Create a single child repo with repo-specific hooks defined and verify the hooks run in the correct context with the expected repo references.

### Implementation for User Story 1

- [x] T007 [US1] Resolve `pre-create.<child-repo>.sh` hook paths in `repos/arashi/src/lib/hooks.ts`
- [x] T008 [US1] Resolve `post-create.<child-repo>.sh` hook paths in `repos/arashi/src/lib/hooks.ts`
- [x] T009 [US1] Inject main/parent repo references into hook environment in `repos/arashi/src/lib/hooks.ts`
- [x] T010 [US1] Invoke repo-specific hooks per child repo in `repos/arashi/src/core/worktree.ts`

**Checkpoint**: User Story 1 should be fully functional and independently testable

---

## Phase 4: User Story 2 - Run Global Pre-Create Hook (Priority: P2)

**Goal**: Global pre-create hook runs before any worktrees are created.

**Independent Test**: Define a global pre-create hook and attempt a create operation to confirm the hook runs before any worktree creation.

### Implementation for User Story 2

- [x] T011 [US2] Invoke global `pre-create.sh` before worktree creation in `repos/arashi/src/core/worktree.ts`
- [x] T012 [US2] Abort create flow when global pre-create fails in `repos/arashi/src/core/worktree.ts`

**Checkpoint**: User Story 2 should be functional and independently testable

---

## Phase 5: User Story 3 - Run Global Post-Create Hook (Priority: P3)

**Goal**: Global post-create hook runs once after all worktrees and hooks complete.

**Independent Test**: Create multiple child repos in one operation and verify the global post-create hook runs once after the last repo is created.

### Implementation for User Story 3

- [x] T013 [US3] Invoke global `post-create.sh` after all repo hooks in `repos/arashi/src/core/worktree.ts`
- [x] T014 [US3] Ensure global post-create runs once per operation in `repos/arashi/src/core/worktree.ts`
- [x] T015 [US3] Skip global post-create when any hook fails in `repos/arashi/src/core/worktree.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and usability updates across stories

- [x] T016 [P] Document repo-specific hook naming in `repos/arashi/docs/hooks.md`
- [x] T017 [P] Add repo-specific hook examples in `repos/arashi/README.md`
- [x] T018 [P] Validate quickstart steps against docs in `specs/027-rework-hooks/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Parallel Opportunities

- T016 and T017 can run in parallel (different documentation files)
- Once Phase 2 completes, US1–US3 phases can be worked in parallel by different owners

---

## Parallel Example: User Story 1

```bash
# Hook discovery tasks for User Story 1
Task: "Resolve pre-create.<child-repo>.sh hook paths in repos/arashi/src/lib/hooks.ts"
Task: "Resolve post-create.<child-repo>.sh hook paths in repos/arashi/src/lib/hooks.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify repo-specific hooks run in child worktree context

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Validate independently (MVP)
3. Add User Story 2 → Validate independently
4. Add User Story 3 → Validate independently

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
