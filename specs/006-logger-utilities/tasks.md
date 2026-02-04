# Tasks: Logger Utilities

**Input**: Design documents from `/specs/006-logger-utilities/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included - SC-005 requires >90% test coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Paths assume single project structure per plan.md:
- Source: `repos/arashi/src/lib/logger.ts`
- Tests: `repos/arashi/tests/unit/logger.test.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [ ] T001 Install chalk and ora dependencies
- [ ] T002 [P] Configure TypeScript for repos/arashi/src/lib/logger.ts
- [ ] T003 [P] Setup test directory structure at repos/arashi/tests/unit/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement NO_COLOR environment variable detection in repos/arashi/src/lib/logger.ts
- [ ] T005 Create color helper functions (with NO_COLOR support) in repos/arashi/src/lib/logger.ts
- [ ] T006 Configure Bun test setup with ANSI stripping for repos/arashi/tests/unit/logger.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Message Output (Priority: P1) 🎯 MVP

**Goal**: Implement info, success, warn, error message functions with color and symbols

**Independent Test**: Call each message function, verify output format, colors, and symbols match spec

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Unit test: info() prints message in default color in repos/arashi/tests/unit/logger.test.ts
- [ ] T008 [P] [US1] Unit test: success() prints in green with checkmark in repos/arashi/tests/unit/logger.test.ts
- [ ] T009 [P] [US1] Unit test: warn() prints in yellow with warning symbol in repos/arashi/tests/unit/logger.test.ts
- [ ] T010 [P] [US1] Unit test: error() prints in red with X symbol in repos/arashi/tests/unit/logger.test.ts
- [ ] T011 [P] [US1] Unit test: NO_COLOR strips colors and replaces symbols in repos/arashi/tests/unit/logger.test.ts

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement info(message) function in repos/arashi/src/lib/logger.ts
- [ ] T013 [P] [US1] Implement success(message) function in repos/arashi/src/lib/logger.ts
- [ ] T014 [P] [US1] Implement warn(message) function in repos/arashi/src/lib/logger.ts
- [ ] T015 [P] [US1] Implement error(message) function in repos/arashi/src/lib/logger.ts
- [ ] T016 [US1] Export all message functions from repos/arashi/src/lib/logger.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - all message types working with proper styling

---

## Phase 4: User Story 2 - Progress Indication (Priority: P1)

**Goal**: Implement spinner function returning configurable ora instance

**Independent Test**: Call spinner(), verify instance returned, verify start/stop/succeed/fail methods work

### Tests for User Story 2

- [ ] T017 [P] [US2] Unit test: spinner() returns ora instance in repos/arashi/tests/unit/logger.test.ts
- [ ] T018 [P] [US2] Unit test: spinner can be started and stopped in repos/arashi/tests/unit/logger.test.ts
- [ ] T019 [P] [US2] Unit test: spinner.succeed() shows success indicator in repos/arashi/tests/unit/logger.test.ts
- [ ] T020 [P] [US2] Unit test: spinner.fail() shows error indicator in repos/arashi/tests/unit/logger.test.ts
- [ ] T021 [P] [US2] Unit test: NO_COLOR affects spinner output in repos/arashi/tests/unit/logger.test.ts

### Implementation for User Story 2

- [ ] T022 [US2] Implement spinner(text) function returning ora instance in repos/arashi/src/lib/logger.ts
- [ ] T023 [US2] Configure ora with NO_COLOR support in repos/arashi/src/lib/logger.ts
- [ ] T024 [US2] Export spinner function from repos/arashi/src/lib/logger.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - messages and spinners functional

---

## Phase 5: User Story 5 - CI Environment Support (Priority: P1)

**Goal**: Verify NO_COLOR environment variable properly disables all colors and special characters

**Independent Test**: Set NO_COLOR=1, call all functions, verify plain text output with no ANSI codes

**Note**: This story is implemented as cross-cutting infrastructure in Phase 2, but needs verification tests

### Tests for User Story 5

- [ ] T025 [P] [US5] Integration test: All message functions respect NO_COLOR in repos/arashi/tests/unit/logger.test.ts
- [ ] T026 [P] [US5] Integration test: Spinner respects NO_COLOR in repos/arashi/tests/unit/logger.test.ts
- [ ] T027 [P] [US5] Integration test: Symbols replaced with text in NO_COLOR mode in repos/arashi/tests/unit/logger.test.ts

### Implementation for User Story 5

- [ ] T028 [US5] Verify NO_COLOR handling consistent across all functions in repos/arashi/src/lib/logger.ts
- [ ] T029 [US5] Add ASCII symbol fallbacks for NO_COLOR mode in repos/arashi/src/lib/logger.ts

**Checkpoint**: All P1 user stories complete - core logger functionality ready for production use including CI environments

---

## Phase 6: User Story 3 - Structured Data Display (Priority: P2)

**Goal**: Implement table formatting with auto-sized columns and proper padding

**Independent Test**: Call table() with various data arrays, verify columns aligned and auto-sized

### Tests for User Story 3

- [ ] T030 [P] [US3] Unit test: table() formats data with aligned columns in repos/arashi/tests/unit/logger.test.ts
- [ ] T031 [P] [US3] Unit test: table() auto-sizes columns to content width in repos/arashi/tests/unit/logger.test.ts
- [ ] T032 [P] [US3] Unit test: table() handles empty data array in repos/arashi/tests/unit/logger.test.ts
- [ ] T033 [P] [US3] Unit test: table() handles varying column widths in repos/arashi/tests/unit/logger.test.ts

### Implementation for User Story 3

- [ ] T034 [US3] Implement column width calculation in repos/arashi/src/lib/logger.ts
- [ ] T035 [US3] Implement row padding and alignment in repos/arashi/src/lib/logger.ts
- [ ] T036 [US3] Implement table(data) function in repos/arashi/src/lib/logger.ts
- [ ] T037 [US3] Export table function from repos/arashi/src/lib/logger.ts

**Checkpoint**: User Story 3 complete - table formatting functional alongside existing message/spinner features

---

## Phase 7: User Story 4 - Section Headers (Priority: P3)

**Goal**: Implement section headers with visual emphasis (bold/underline)

**Independent Test**: Call section() with various titles, verify visual emphasis and clear separation

### Tests for User Story 4

- [ ] T038 [P] [US4] Unit test: section() prints title with visual emphasis in repos/arashi/tests/unit/logger.test.ts
- [ ] T039 [P] [US4] Unit test: Multiple sections are distinguishable in repos/arashi/tests/unit/logger.test.ts
- [ ] T040 [P] [US4] Unit test: section() respects NO_COLOR in repos/arashi/tests/unit/logger.test.ts

### Implementation for User Story 4

- [ ] T041 [US4] Implement section(title) function with bold/underline styling in repos/arashi/src/lib/logger.ts
- [ ] T042 [US4] Export section function from repos/arashi/src/lib/logger.ts

**Checkpoint**: All user stories complete - full logger library functionality available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, performance, and documentation

- [ ] T043 [P] Test edge case: Newlines and special characters in messages in repos/arashi/tests/unit/logger.test.ts
- [ ] T044 [P] Test edge case: Very long messages exceeding terminal width in repos/arashi/tests/unit/logger.test.ts
- [ ] T045 [P] Test edge case: Unicode characters and emoji in messages in repos/arashi/tests/unit/logger.test.ts
- [ ] T046 [P] Verify output functions meet SC-001 (<10ms for 10KB messages) in repos/arashi/tests/unit/logger.test.ts
- [ ] T047 [P] Verify table auto-sizing meets SC-004 (no manual width config) in repos/arashi/tests/unit/logger.test.ts
- [ ] T048 [P] Verify test coverage meets SC-005 (>90%) requirement
- [ ] T049 [P] Add JSDoc comments to all exported functions in repos/arashi/src/lib/logger.ts
- [ ] T050 Validate against quickstart.md examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US5) should complete before P2/P3 stories (US3, US4)
  - Within same priority, can proceed in parallel
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Independent of US1
- **User Story 5 (P1)**: Can start after Foundational - Uses shared NO_COLOR infrastructure
- **User Story 3 (P2)**: Can start after Foundational - Independent of other stories
- **User Story 4 (P3)**: Can start after Foundational - Independent of other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks within story can often run in parallel [P]
- Tests within a story can run in parallel [P]
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks (T001-T003) can all run in parallel
- Foundational tasks (T004-T006) can run in parallel within Phase 2
- Once Foundational completes:
  - US1 tests (T007-T011) can run in parallel
  - US1 implementations (T012-T015) can run in parallel
  - US2 tests (T017-T021) can run in parallel
  - US3 tests (T030-T033) can run in parallel
  - US4 tests (T038-T040) can run in parallel
  - US5 tests (T025-T027) can run in parallel
- Polish tasks (T043-T049) can mostly run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test: info() prints message in default color"
Task: "Unit test: success() prints in green with checkmark"
Task: "Unit test: warn() prints in yellow with warning symbol"
Task: "Unit test: error() prints in red with X symbol"
Task: "Unit test: NO_COLOR strips colors and replaces symbols"

# Launch all implementations for User Story 1 together:
Task: "Implement info(message) function"
Task: "Implement success(message) function"
Task: "Implement warn(message) function"
Task: "Implement error(message) function"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (message output)
4. Complete Phase 4: User Story 2 (spinners)
5. Complete Phase 5: User Story 5 (NO_COLOR verification)
6. **STOP and VALIDATE**: Test P1 stories independently - MVP ready!

**MVP Deliverable**: Core logger library with messages, spinners, and CI environment support

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Message output working
3. Add US2 → Test independently → Spinners working
4. Add US5 → Test independently → CI support verified (MVP complete!)
5. Add US3 → Test independently → Table formatting added
6. Add US4 → Test independently → Section headers added (Full feature complete!)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + US5 (related to NO_COLOR)
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different functions or test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail (red) before implementing (green)
- SC-005 requires >90% test coverage - all functions must be tested
- NO_COLOR support (US5) is implemented as cross-cutting infrastructure
- chalk and ora automatically detect terminal capabilities
- Commit after each logical task group
- Stop at any checkpoint to validate story independently
