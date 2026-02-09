---

description: "Task list for sync command implementation"
---

# Tasks: Sync Command

**Input**: Design documents from `specs/026-sync-command/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Integration tests are REQUIRED by the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Review existing command patterns in `repos/arashi/src/commands/` for CLI conventions
- [X] T002 Review configuration loading utilities in `repos/arashi/src/lib/config/` to confirm sync inputs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Define sync result types in `repos/arashi/src/lib/git/sync-types.ts`
- [X] T004 [P] Add repository filter helper for --only in `repos/arashi/src/lib/config/filter-repos.ts`
- [X] T005 Implement branch align/create helper in `repos/arashi/src/lib/git/sync-branch.ts`
- [X] T006 Implement process execution with timeout capture in `repos/arashi/src/lib/process/run-with-timeout.ts`
- [X] T007 Implement rollback tracking for created branches in `repos/arashi/src/lib/git/sync-rollback.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Synchronize Workspace Branches (Priority: P1) 🎯 MVP

**Goal**: Align all managed repositories to the parent branch and handle failures/timeouts while continuing across repositories.

**Independent Test**: Run sync in a multi-repo workspace and verify branch alignment, branch creation when missing, and failure handling with summaries.

### Tests for User Story 1 (REQUIRED)

- [X] T008 [P] [US1] Create integration test scaffold for sync core flow in `repos/arashi/tests/integration/sync.test.ts`
- [X] T009 [P] [US1] Add integration test for branch creation when missing in `repos/arashi/tests/integration/sync.test.ts`
- [X] T010 [P] [US1] Add integration test for invalid configuration handling in `repos/arashi/tests/integration/sync.test.ts`
- [X] T011 [P] [US1] Add integration test for per-repo timeout handling in `repos/arashi/tests/integration/sync.test.ts`

### Implementation for User Story 1

- [X] T012 [US1] Implement sync command core flow in `repos/arashi/src/commands/sync.ts`
- [X] T013 [US1] Wire branch alignment and creation into sync flow in `repos/arashi/src/commands/sync.ts`
- [X] T014 [US1] Add error handling and per-repo continuation in `repos/arashi/src/commands/sync.ts`
- [X] T015 [US1] Add final summary counts (success/failure) in `repos/arashi/src/commands/sync.ts`

**Checkpoint**: User Story 1 fully functional and testable independently

---

## Phase 4: User Story 2 - Sync a Subset (Priority: P2)

**Goal**: Allow users to target only specified repositories during sync.

**Independent Test**: Run sync with `--only` and verify only listed repositories are processed.

### Tests for User Story 2 (REQUIRED)

- [X] T016 [P] [US2] Add integration test for --only filtering in `repos/arashi/tests/integration/sync.test.ts`

### Implementation for User Story 2

- [X] T017 [US2] Add --only option parsing in `repos/arashi/src/commands/sync.ts`
- [X] T018 [US2] Apply repository filtering to sync targets in `repos/arashi/src/commands/sync.ts`

**Checkpoint**: User Story 2 fully functional and testable independently

---

## Phase 5: User Story 3 - See Progress and Detailed Output (Priority: P3)

**Goal**: Provide progress indicators, per-repo timing, and verbose output for diagnostics.

**Independent Test**: Run sync in normal and verbose modes and verify spinners, durations, and output detail.

### Tests for User Story 3 (REQUIRED)

- [X] T019 [P] [US3] Add integration test for verbose output in `repos/arashi/tests/integration/sync.test.ts`
- [X] T020 [P] [US3] Add integration test for summary counts in `repos/arashi/tests/integration/sync.test.ts`

### Implementation for User Story 3

- [X] T021 [US3] Add progress spinners per repository in `repos/arashi/src/commands/sync.ts`
- [X] T022 [US3] Capture and display per-repo timing in `repos/arashi/src/commands/sync.ts`
- [X] T023 [US3] Add verbose mode output wiring in `repos/arashi/src/commands/sync.ts`

**Checkpoint**: User Story 3 fully functional and testable independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T024 [P] Update sync command documentation in `repos/arashi/README.md`
- [X] T025 Validate quickstart steps in `specs/026-sync-command/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent from US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent from US1/US2

### Parallel Opportunities

- Phase 2 tasks marked [P] can run in parallel
- Integration tests within a user story marked [P] can run in parallel
- User Story phases can run in parallel once Foundational completes

---

## Parallel Example: User Story 1

```bash
# Launch US1 integration tests together:
Task: "Create integration test scaffold for sync core flow in repos/arashi/tests/integration/sync.test.ts"
Task: "Add integration test for branch creation when missing in repos/arashi/tests/integration/sync.test.ts"
Task: "Add integration test for invalid configuration handling in repos/arashi/tests/integration/sync.test.ts"
Task: "Add integration test for per-repo timeout handling in repos/arashi/tests/integration/sync.test.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch US2 integration test while CLI parsing is implemented:
Task: "Add integration test for --only filtering in repos/arashi/tests/integration/sync.test.ts"
Task: "Add --only option parsing in repos/arashi/src/commands/sync.ts"
```

---

## Parallel Example: User Story 3

```bash
# Launch US3 integration tests together:
Task: "Add integration test for verbose output in repos/arashi/tests/integration/sync.test.ts"
Task: "Add integration test for summary counts in repos/arashi/tests/integration/sync.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate
3. Add User Story 2 → Test independently → Validate
4. Add User Story 3 → Test independently → Validate
5. Each story adds value without breaking previous stories
