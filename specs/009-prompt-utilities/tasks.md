# Tasks: Prompt Utilities

**Input**: Design documents from `/specs/009-prompt-utilities/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included - SC-005 requires >90% test coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Paths assume single project structure per plan.md:
- Source: `repos/arashi/src/lib/prompts.ts`
- Tests: `repos/arashi/tests/unit/prompts.test.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [ ] T001 Install @inquirer/prompts dependencies (confirm, select, checkbox, input modules)
- [ ] T002 [P] Configure TypeScript for repos/arashi/src/lib/prompts.ts
- [ ] T003 [P] Setup test directory structure at repos/arashi/tests/unit/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define Choice<T> type in repos/arashi/src/lib/prompts.ts
- [ ] T005 Implement Ctrl+C handling wrapper utility in repos/arashi/src/lib/prompts.ts
- [ ] T006 Configure Bun test mocking setup for @inquirer/prompts in repos/arashi/tests/unit/prompts.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Yes/No Confirmations (Priority: P1) 🎯 MVP

**Goal**: Implement confirmation prompts with default values and Ctrl+C handling

**Independent Test**: Call confirm() with various messages and defaults, verify responses match user input, verify Ctrl+C exits with code 2

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Unit test: confirm() returns true for 'yes' input in repos/arashi/tests/unit/prompts.test.ts
- [ ] T008 [P] [US1] Unit test: confirm() returns false for 'no' input in repos/arashi/tests/unit/prompts.test.ts
- [ ] T009 [P] [US1] Unit test: confirm() uses default value when Enter pressed in repos/arashi/tests/unit/prompts.test.ts
- [ ] T010 [P] [US1] Unit test: confirm() exits code 2 on Ctrl+C in repos/arashi/tests/unit/prompts.test.ts

### Implementation for User Story 1

- [ ] T011 [US1] Implement confirm(message, defaultValue) function in repos/arashi/src/lib/prompts.ts
- [ ] T012 [US1] Add Ctrl+C handling wrapper to confirm() in repos/arashi/src/lib/prompts.ts
- [ ] T013 [US1] Export confirm function from repos/arashi/src/lib/prompts.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - confirm prompts work with defaults and handle Ctrl+C gracefully

---

## Phase 4: User Story 2 - Single Selection (Priority: P1)

**Goal**: Implement single-choice selection with keyboard navigation and descriptions

**Independent Test**: Call select() with choice lists, verify arrow key navigation works, verify selected value returned, verify empty list throws error

### Tests for User Story 2

- [ ] T014 [P] [US2] Unit test: select() returns selected choice value in repos/arashi/tests/unit/prompts.test.ts
- [ ] T015 [P] [US2] Unit test: select() displays names and descriptions in repos/arashi/tests/unit/prompts.test.ts
- [ ] T016 [P] [US2] Unit test: select() throws error for empty choices array in repos/arashi/tests/unit/prompts.test.ts
- [ ] T017 [P] [US2] Unit test: select() exits code 2 on Ctrl+C in repos/arashi/tests/unit/prompts.test.ts

### Implementation for User Story 2

- [ ] T018 [US2] Implement select<T>(message, choices) function in repos/arashi/src/lib/prompts.ts
- [ ] T019 [US2] Add empty choices validation in repos/arashi/src/lib/prompts.ts
- [ ] T020 [US2] Add Ctrl+C handling wrapper to select() in repos/arashi/src/lib/prompts.ts
- [ ] T021 [US2] Export select function from repos/arashi/src/lib/prompts.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - both confirm and select prompts functional

---

## Phase 5: User Story 5 - Graceful Interruption (Priority: P1)

**Goal**: Ensure Ctrl+C handling works consistently across all prompt types with proper terminal restoration

**Independent Test**: Press Ctrl+C during any prompt type, verify exit code 2, verify terminal state restored, verify no leftover UI elements

**Note**: This story is implemented as cross-cutting infrastructure in the Ctrl+C wrapper created in Phase 2, but needs verification tests

### Tests for User Story 5

- [ ] T022 [P] [US5] Integration test: Verify terminal restoration after Ctrl+C in repos/arashi/tests/unit/prompts.test.ts
- [ ] T023 [P] [US5] Integration test: Verify process.exit(2) called on Ctrl+C in repos/arashi/tests/unit/prompts.test.ts
- [ ] T024 [P] [US5] Integration test: Verify Ctrl+C works in nested prompts in repos/arashi/tests/unit/prompts.test.ts

### Implementation for User Story 5

- [ ] T025 [US5] Verify Ctrl+C wrapper handles all prompt types consistently in repos/arashi/src/lib/prompts.ts
- [ ] T026 [US5] Add terminal restoration check to Ctrl+C handler in repos/arashi/src/lib/prompts.ts

**Checkpoint**: All P1 user stories complete - core prompt functionality ready for production use

---

## Phase 6: User Story 3 - Multiple Selection (Priority: P2)

**Goal**: Implement checkbox-based multi-selection with spacebar toggling

**Independent Test**: Call multiSelect() with choice lists, verify spacebar toggles checkboxes, verify array of selected values returned, verify empty array when nothing selected

### Tests for User Story 3

- [ ] T027 [P] [US3] Unit test: multiSelect() returns array of selected values in repos/arashi/tests/unit/prompts.test.ts
- [ ] T028 [P] [US3] Unit test: multiSelect() returns empty array when nothing selected in repos/arashi/tests/unit/prompts.test.ts
- [ ] T029 [P] [US3] Unit test: multiSelect() allows toggling with spacebar in repos/arashi/tests/unit/prompts.test.ts
- [ ] T030 [P] [US3] Unit test: multiSelect() exits code 2 on Ctrl+C in repos/arashi/tests/unit/prompts.test.ts

### Implementation for User Story 3

- [ ] T031 [US3] Implement multiSelect<T>(message, choices) function in repos/arashi/src/lib/prompts.ts
- [ ] T032 [US3] Add Ctrl+C handling wrapper to multiSelect() in repos/arashi/src/lib/prompts.ts
- [ ] T033 [US3] Export multiSelect function from repos/arashi/src/lib/prompts.ts

**Checkpoint**: User Story 3 complete - multi-selection prompts functional alongside existing single-selection

---

## Phase 7: User Story 4 - Text Input (Priority: P2)

**Goal**: Implement free-form text input with default values

**Independent Test**: Call input() with various prompts and defaults, verify entered text returned, verify default used when Enter pressed without input, verify empty string handling

### Tests for User Story 4

- [ ] T034 [P] [US4] Unit test: input() returns entered text in repos/arashi/tests/unit/prompts.test.ts
- [ ] T035 [P] [US4] Unit test: input() uses default value when Enter pressed in repos/arashi/tests/unit/prompts.test.ts
- [ ] T036 [P] [US4] Unit test: input() allows empty string input in repos/arashi/tests/unit/prompts.test.ts
- [ ] T037 [P] [US4] Unit test: input() exits code 2 on Ctrl+C in repos/arashi/tests/unit/prompts.test.ts

### Implementation for User Story 4

- [ ] T038 [US4] Implement input(message, defaultValue) function in repos/arashi/src/lib/prompts.ts
- [ ] T039 [US4] Add Ctrl+C handling wrapper to input() in repos/arashi/src/lib/prompts.ts
- [ ] T040 [US4] Export input function from repos/arashi/src/lib/prompts.ts

**Checkpoint**: All user stories complete - full prompt library functionality available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, performance, and documentation

- [ ] T041 [P] Test edge case: Very long choice lists (1000+ items) meet SC-002 performance in repos/arashi/tests/unit/prompts.test.ts
- [ ] T042 [P] Test edge case: Unicode characters in prompts and choices in repos/arashi/tests/unit/prompts.test.ts
- [ ] T043 [P] Test edge case: Special characters and ANSI codes in choices in repos/arashi/tests/unit/prompts.test.ts
- [ ] T044 [P] Verify prompt rendering meets SC-001 (<50ms) performance target in repos/arashi/tests/unit/prompts.test.ts
- [ ] T045 [P] Verify test coverage meets SC-005 (>90%) requirement
- [ ] T046 [P] Add JSDoc comments to all exported functions in repos/arashi/src/lib/prompts.ts
- [ ] T047 Validate against quickstart.md examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US5) should complete before P2 stories (US3, US4)
  - Within same priority, can proceed in parallel
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Independent of US1
- **User Story 5 (P1)**: Can start after Foundational - Uses shared Ctrl+C wrapper
- **User Story 3 (P2)**: Can start after Foundational - Independent of other stories
- **User Story 4 (P2)**: Can start after Foundational - Independent of other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks run sequentially within story
- Tests within a story can run in parallel [P]
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks (T001-T003) can all run in parallel
- Foundational tasks (T004-T006) can run in parallel within Phase 2
- Once Foundational completes:
  - US1 tests (T007-T010) can run in parallel
  - US2 tests (T014-T017) can run in parallel
  - US3 tests (T027-T030) can run in parallel
  - US4 tests (T034-T037) can run in parallel
  - US5 tests (T022-T024) can run in parallel
- Polish tasks (T041-T046) can mostly run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test: confirm() returns true for 'yes' input"
Task: "Unit test: confirm() returns false for 'no' input"
Task: "Unit test: confirm() uses default value when Enter pressed"
Task: "Unit test: confirm() exits code 2 on Ctrl+C"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (confirm prompts)
4. Complete Phase 4: User Story 2 (select prompts)
5. Complete Phase 5: User Story 5 (Ctrl+C handling verification)
6. **STOP and VALIDATE**: Test P1 stories independently - MVP ready!

**MVP Deliverable**: Basic prompt library with confirm, select, and robust Ctrl+C handling

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Confirm prompts working
3. Add US2 → Test independently → Select prompts working
4. Add US5 → Test independently → Ctrl+C verified (MVP complete!)
5. Add US3 → Test independently → Multi-select added
6. Add US4 → Test independently → Text input added (Full feature complete!)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + US5 (related to Ctrl+C)
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files or test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail (red) before implementing (green)
- SC-005 requires >90% test coverage - all functions must be tested
- Ctrl+C handling (US5) is implemented as cross-cutting infrastructure
- @inquirer/prompts handles terminal restoration automatically
- Commit after each logical task group
- Stop at any checkpoint to validate story independently
