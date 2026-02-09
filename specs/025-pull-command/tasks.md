# Tasks: Pull Command

**Input**: Design documents from `/specs/025-pull-command/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Integration tests are required by the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create pull command file stub in repos/arashi/src/commands/pull.ts
- [X] T002 Add pull command registration in repos/arashi/src/commands/index.ts
- [X] T003 [P] Create integration test scaffold in repos/arashi/tests/integration/pull.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T004 Define pull result types and status enums in repos/arashi/src/lib/pull-types.ts
- [X] T005 [P] Add workspace config load helper for repositories in repos/arashi/src/lib/config.ts
- [X] T006 [P] Implement repository filtering helper for --only in repos/arashi/src/lib/repo-filter.ts
- [X] T007 [P] Implement remote change detection helper in repos/arashi/src/lib/git-remote.ts
- [X] T008 Implement pull execution and rollback helper in repos/arashi/src/lib/pull-runner.ts
- [X] T009 Implement progress and timing output helpers in repos/arashi/src/lib/pull-output.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Update All Eligible Repositories (Priority: P1) 🎯 MVP

**Goal**: Update all eligible repositories and report success or manual-update on conflict/error.

**Independent Test**: Run the pull command in a workspace with remote changes and verify each eligible repository is updated or reported as manual-update with rollback.

### Tests for User Story 1

- [X] T010 [US1] Add integration test for successful multi-repo pull in repos/arashi/tests/integration/pull.test.ts
- [X] T011 [US1] Add integration test for dirty repo rollback/manual-update in repos/arashi/tests/integration/pull.test.ts

### Implementation for User Story 1

- [X] T012 [US1] Implement core orchestration (load config, detect remote changes, invoke pull runner) in repos/arashi/src/commands/pull.ts
- [X] T013 [US1] Implement summary reporting and non-zero exit handling in repos/arashi/src/commands/pull.ts

**Checkpoint**: User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Targeted Pulls (Priority: P2)

**Goal**: Allow users to limit the pull to a subset of repositories and skip those without remote changes.

**Independent Test**: Run with --only filters and verify only those repositories are processed and no-change repos are skipped with a clear status.

### Tests for User Story 2

- [X] T014 [US2] Add integration test for --only filtering behavior in repos/arashi/tests/integration/pull.test.ts

### Implementation for User Story 2

- [X] T015 [US2] Implement --only flag parsing and filtering in repos/arashi/src/commands/pull.ts
- [X] T016 [US2] Implement skip/report flow for repositories with no remote changes in repos/arashi/src/commands/pull.ts

**Checkpoint**: User Stories 1 and 2 should both work independently

---

## Phase 5: User Story 3 - Clear Progress and Diagnostics (Priority: P3)

**Goal**: Provide progress, timing, and verbose diagnostics for each repository operation.

**Independent Test**: Run in verbose and non-verbose modes and verify progress indicators, timing output, and full command output for verbose mode.

### Tests for User Story 3

- [X] T017 [US3] Add integration test for verbose output mode in repos/arashi/tests/integration/pull.test.ts
- [X] T018 [US3] Add integration test for per-repo timing output in repos/arashi/tests/integration/pull.test.ts

### Implementation for User Story 3

- [X] T019 [US3] Implement progress indicators and per-repo timing in repos/arashi/src/commands/pull.ts
- [X] T020 [US3] Implement verbose output plumbing in repos/arashi/src/commands/pull.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T021 Add integration test for timeout/failure summary in repos/arashi/tests/integration/pull.test.ts
- [X] T022 Harden error and timeout messaging in repos/arashi/src/commands/pull.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational (Phase 2) - provides core pull flow
- **User Story 2 (P2)**: Starts after US1 for shared orchestration reuse
- **User Story 3 (P3)**: Starts after US1 for shared orchestration reuse

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core orchestration before output refinements
- Story complete before moving to next priority

### Parallel Opportunities

- T005, T006, T007 can run in parallel
- Tests within a user story can be parallelized by scenario focus
- US2 and US3 can proceed in parallel after US1 core is stable

---

## Parallel Example: User Story 1

```bash
# Run scenario-specific tests in parallel:
Task: "Add integration test for successful multi-repo pull in repos/arashi/tests/integration/pull.test.ts"
Task: "Add integration test for dirty repo rollback/manual-update in repos/arashi/tests/integration/pull.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently

### Incremental Delivery

1. Add User Story 1 → Test independently
2. Add User Story 2 → Test independently
3. Add User Story 3 → Test independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
