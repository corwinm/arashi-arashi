# Tasks: Rollback Mechanism

**Input**: Design documents from `/specs/001-rollback-mechanism/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test tasks are included based on Constitution Principle VII requiring >80% coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **arashi project**: `repos/arashi/src/`, `repos/arashi/tests/` (single executable project)
- Core rollback in `src/core/rollback.ts`
- Dependencies from `src/lib/` (git, filesystem, logger)
- Tests in `tests/unit/core/` and `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and create test infrastructure

- [X] T001 Verify dependency modules exist: repos/arashi/src/lib/git.ts, filesystem.ts, logger.ts
- [X] T002 [P] Create test fixtures directory repos/arashi/tests/fixtures/rollback-tests/
- [X] T003 [P] Create test helper script repos/arashi/tests/helpers/create-test-resources.ts for generating temporary git repos and directories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and error classes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Define OperationType type in repos/arashi/src/core/rollback.ts: 'worktree_created' | 'branch_created' | 'directory_created'
- [X] T005 [P] Define WorktreeCreatedEntry interface in repos/arashi/src/core/rollback.ts
- [X] T006 [P] Define BranchCreatedEntry interface in repos/arashi/src/core/rollback.ts
- [X] T007 [P] Define DirectoryCreatedEntry interface in repos/arashi/src/core/rollback.ts
- [X] T008 Define LogEntry discriminated union type in repos/arashi/src/core/rollback.ts
- [X] T009 [P] Define RollbackFailure interface in repos/arashi/src/core/rollback.ts
- [X] T010 [P] Define RollbackResult interface in repos/arashi/src/core/rollback.ts
- [X] T011 Define error classes in repos/arashi/src/core/rollback.ts: RollbackInProgressError, ConcurrentRollbackError, InvalidLogEntryError

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 2 - Log Reversible Actions During Operations (Priority: P1) 🎯 MVP Foundation

**Goal**: Implement operation log to track reversible actions with complete reversal information

**Independent Test**: Execute test operations, capture log, verify each action recorded with type, timestamp, and reversal data

**Note**: US2 is implemented first because it's the foundation - US1 and US3 depend on logging capability

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T012 [P] [US2] Unit test for OperationLog.add() with valid entries in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T013 [P] [US2] Unit test for OperationLog.add() with invalid entries (should throw InvalidLogEntryError) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T014 [P] [US2] Unit test for OperationLog.add() during rollback (should throw RollbackInProgressError) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T015 [P] [US2] Unit test for OperationLog.getEntryCount() in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T016 [P] [US2] Unit test for chronological ordering of log entries in repos/arashi/tests/unit/core/rollback.test.ts

### Implementation for User Story 2

- [X] T017 [US2] Create OperationLog class skeleton in repos/arashi/src/core/rollback.ts with entries array and isRollingBack flag
- [X] T018 [US2] Implement OperationLog.add() method with validation and rollback-in-progress check
- [X] T019 [P] [US2] Implement isValidLogEntry() validation function in repos/arashi/src/core/rollback.ts
- [X] T020 [P] [US2] Implement isValidWorktreeCreatedData() in repos/arashi/src/core/rollback.ts
- [X] T021 [P] [US2] Implement isValidBranchCreatedData() in repos/arashi/src/core/rollback.ts
- [X] T022 [P] [US2] Implement isValidDirectoryCreatedData() in repos/arashi/src/core/rollback.ts
- [X] T023 [US2] Implement OperationLog helper methods: getEntryCount(), isRollbackInProgress(), clear()
- [X] T024 [US2] Add automatic timestamp to log entries in add() method

**Checkpoint**: At this point, User Story 2 is complete - operation logging works and can be consumed by orchestration layer

---

## Phase 4: User Story 3 - Handle Different Operation Types (Priority: P1)

**Goal**: Implement type-specific rollback functions for worktrees, branches, and directories

**Independent Test**: Create log with mixed operation types, trigger rollback, verify each type reversed with appropriate cleanup logic

### Tests for User Story 3

- [X] T025 [P] [US3] Unit test for rollbackWorktreeCreated() with mock git.removeWorktree in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T026 [P] [US3] Unit test for rollbackWorktreeCreated() when worktree doesn't exist (idempotent) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T027 [P] [US3] Unit test for rollbackBranchCreated() with mock git.deleteBranch in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T028 [P] [US3] Unit test for rollbackBranchCreated() when branch doesn't exist (idempotent) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T029 [P] [US3] Unit test for rollbackDirectoryCreated() with mock filesystem.removeDirectory in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T030 [P] [US3] Unit test for rollbackDirectoryCreated() when directory doesn't exist (idempotent) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T031 [P] [US3] Integration test for worktree rollback with real temporary repository in repos/arashi/tests/integration/rollback-integration.test.ts
- [X] T032 [P] [US3] Integration test for branch rollback with real temporary repository in repos/arashi/tests/integration/rollback-integration.test.ts
- [X] T033 [P] [US3] Integration test for directory rollback with real temporary directory in repos/arashi/tests/integration/rollback-integration.test.ts

### Implementation for User Story 3

- [X] T034 [P] [US3] Implement rollbackWorktreeCreated() function in repos/arashi/src/core/rollback.ts (calls git.removeWorktree)
- [X] T035 [P] [US3] Implement rollbackBranchCreated() function in repos/arashi/src/core/rollback.ts (calls git.deleteBranch with force flag)
- [X] T036 [P] [US3] Implement rollbackDirectoryCreated() function in repos/arashi/src/core/rollback.ts (calls filesystem.removeDirectory with recursive flag)
- [X] T037 [US3] Implement rollbackOperation() dispatcher function in repos/arashi/src/core/rollback.ts (routes to type-specific function based on entry.type)
- [X] T038 [US3] Add idempotent handling in rollbackWorktreeCreated() (catch 'not a working tree' error, treat as success)
- [X] T039 [US3] Add idempotent handling in rollbackBranchCreated() (catch 'not found' error, treat as success)
- [X] T040 [US3] Add idempotent handling in rollbackDirectoryCreated() (catch ENOENT error code, treat as success)

**Checkpoint**: At this point, User Stories 2 and 3 work together - logging and type-specific rollback functions ready

---

## Phase 5: User Story 1 - Automatic Cleanup on Failed Operations (Priority: P1) 🎯 MVP Complete

**Goal**: Implement OperationLog.rollback() to automatically reverse all logged operations in LIFO order

**Independent Test**: Simulate failure after 3 operations, trigger rollback, verify all 3 operations reversed

### Tests for User Story 1

- [X] T041 [P] [US1] Unit test for OperationLog.rollback() with empty log in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T042 [P] [US1] Unit test for OperationLog.rollback() with LIFO ordering (verify reverse order) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T043 [P] [US1] Unit test for OperationLog.rollback() with concurrent prevention (should throw ConcurrentRollbackError) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T044 [P] [US1] Unit test for OperationLog.rollback() result counts (successCount, failureCount, totalOperations) in repos/arashi/tests/unit/core/rollback.test.ts
- [X] T045 [P] [US1] Integration test for full rollback with mixed operation types in repos/arashi/tests/integration/rollback-integration.test.ts

### Implementation for User Story 1

- [X] T046 [US1] Implement OperationLog.rollback() method skeleton in repos/arashi/src/core/rollback.ts
- [X] T047 [US1] Add concurrent rollback prevention (check isRollingBack flag, throw if true)
- [X] T048 [US1] Set isRollingBack flag at start of rollback, clear in finally block
- [X] T049 [US1] Reverse entries array for LIFO processing (use [...entries].reverse())
- [X] T050 [US1] Implement rollback loop: iterate reversed entries, call rollbackOperation() for each
- [X] T051 [US1] Add try-catch around each operation rollback to continue despite failures
- [X] T052 [US1] Track failures array with entry, error, and operationIndex
- [X] T053 [US1] Build RollbackResult with counts, failures, and duration
- [X] T054 [US1] Return RollbackResult from rollback() method

**Checkpoint**: At this point, User Stories 1, 2, and 3 are complete - full rollback mechanism working (MVP!)

---

## Phase 6: User Story 4 - Continue Rollback Despite Individual Failures (Priority: P2)

**Goal**: Ensure rollback continues even when individual cleanup operations fail

**Independent Test**: Simulate failure in 2nd of 5 rollback operations, verify others still reversed and failure logged

### Tests for User Story 4

- [ ] T055 [P] [US4] Unit test for rollback with partial failures (verify continue-on-error) in repos/arashi/tests/unit/core/rollback.test.ts
- [ ] T056 [P] [US4] Unit test for RollbackResult.failures array populated correctly in repos/arashi/tests/unit/core/rollback.test.ts
- [ ] T057 [P] [US4] Integration test for rollback with simulated permission error in repos/arashi/tests/integration/rollback-integration.test.ts

### Implementation for User Story 4

- [ ] T058 [US4] Verify error handling in rollback loop continues despite failures (already implemented in T051, ensure it works correctly)
- [ ] T059 [US4] Enhance error capture in failures array with detailed error information
- [ ] T060 [US4] Test rollback with various failure scenarios (permission denied, file locks, etc.)

**Checkpoint**: At this point, User Stories 1-4 work together - resilient rollback that continues despite failures

---

## Phase 7: User Story 5 - Reverse Operations in Correct Order (Priority: P2)

**Goal**: Ensure LIFO order respects operation dependencies (worktree before branch)

**Independent Test**: Create operations with dependencies (branch, then worktree), verify worktree removed before branch deleted

### Tests for User Story 5

- [ ] T061 [P] [US5] Unit test for LIFO ordering with dependent operations in repos/arashi/tests/unit/core/rollback.test.ts
- [ ] T062 [P] [US5] Integration test for dependency-safe rollback order in repos/arashi/tests/integration/rollback-integration.test.ts

### Implementation for User Story 5

- [ ] T063 [US5] Verify LIFO implementation in rollback() correctly reverses order (already implemented in T049, validate it works)
- [ ] T064 [US5] Test edge case: worktree + branch operations in sequence, verify correct rollback order
- [ ] T065 [US5] Document operation ordering requirements in code comments

**Checkpoint**: All user stories (1-5) now complete - full rollback mechanism with dependency-safe ordering

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T066 [P] Add comprehensive JSDoc comments to all public functions and classes in repos/arashi/src/core/rollback.ts
- [ ] T067 [P] Add edge case test for empty log rollback in repos/arashi/tests/unit/core/rollback.test.ts
- [ ] T068 [P] Add edge case test for corrupted log entries in repos/arashi/tests/unit/core/rollback.test.ts
- [ ] T069 [P] Add edge case test for extremely large logs (50+ entries) in repos/arashi/tests/integration/rollback-integration.test.ts
- [ ] T070 [P] Add performance test: verify rollback of 20 operations completes in <15 seconds in repos/arashi/tests/integration/rollback-integration.test.ts
- [ ] T071 Code review and refactoring for repos/arashi/src/core/rollback.ts
- [ ] T072 Run Bun test coverage report, verify >80% coverage for repos/arashi/src/core/rollback.ts
- [ ] T073 Cross-platform testing on macOS, Linux, Windows
- [ ] T074 Run quickstart.md validation (follow implementation examples, verify they work)
- [ ] T075 Integration testing with worktree orchestration consumer (core/worktree.ts)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 2 (Phase 3)**: Depends on Foundational (Phase 2) - Operation logging (foundation for US1, US3)
- **User Story 3 (Phase 4)**: Depends on Foundational (Phase 2) - Type-specific rollback functions (parallel with US2)
- **User Story 1 (Phase 5)**: Depends on US2 and US3 (Phases 3-4) - Rollback orchestration uses logging + type-specific functions
- **User Story 4 (Phase 6)**: Depends on User Story 1 (Phase 5) - Enhances rollback with resilient error handling
- **User Story 5 (Phase 7)**: Depends on User Story 1 (Phase 5) - Validates rollback ordering
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 2 (P1)**: Foundation - Logging capability required by US1
- **User Story 3 (P1)**: Foundation - Rollback functions required by US1 (can develop parallel with US2)
- **User Story 1 (P1)**: Core orchestration - BLOCKS US4, US5 (they enhance it)
- **User Story 4 (P2)**: Depends on US1 - Enhances error handling
- **User Story 5 (P2)**: Depends on US1 - Validates ordering

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types and interfaces before implementation
- Validation functions before main logic
- Core implementation before enhancements
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002 and T003 can run in parallel (different directories)

**Phase 2 (Foundational)**:
- T005, T006, T007, T009, T010 can all run in parallel (different interfaces)

**Phase 3 (US2) - Tests**:
- T012, T013, T014, T015, T016 can run in parallel (different test cases)

**Phase 3 (US2) - Implementation**:
- T019, T020, T021, T022 can run in parallel (different validation functions)
- T017, T018, T023, T024 must be sequential (modify same class)

**Phase 4 (US3) - Tests**:
- T025-T033 can all run in parallel (different test files or test cases)

**Phase 4 (US3) - Implementation**:
- T034, T035, T036 can run in parallel (different rollback functions)
- T037-T040 must be sequential (build on dispatcher)

**Phase 5 (US1) - Tests**:
- T041, T042, T043, T044, T045 can run in parallel

**Phase 5 (US1) - Implementation**:
- T046-T054 must be sequential (all modify rollback() method)

**Phase 6 (US4) - Tests**:
- T055, T056, T057 can run in parallel

**Phase 7 (US5) - Tests**:
- T061, T062 can run in parallel

**Phase 8 (Polish)**:
- T066, T067, T068, T069, T070 can all run in parallel (different concerns)

---

## Parallel Example: User Story 3 (Type-Specific Rollback)

```bash
# Launch all tests for User Story 3 together:
Task: "Unit test for rollbackWorktreeCreated() in repos/arashi/tests/unit/core/rollback.test.ts"
Task: "Unit test for rollbackBranchCreated() in repos/arashi/tests/unit/core/rollback.test.ts"
Task: "Unit test for rollbackDirectoryCreated() in repos/arashi/tests/unit/core/rollback.test.ts"
Task: "Integration test for worktree rollback in repos/arashi/tests/integration/rollback-integration.test.ts"

# Launch all rollback functions together (different functions, no dependencies):
Task: "Implement rollbackWorktreeCreated() in repos/arashi/src/core/rollback.ts"
Task: "Implement rollbackBranchCreated() in repos/arashi/src/core/rollback.ts"
Task: "Implement rollbackDirectoryCreated() in repos/arashi/src/core/rollback.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 2, 3, and 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011) - CRITICAL: blocks all stories
3. Complete Phase 3: User Story 2 (T012-T024) - Operation logging
4. Complete Phase 4: User Story 3 (T025-T040) - Type-specific rollback functions
5. Complete Phase 5: User Story 1 (T041-T054) - Rollback orchestration
6. **STOP and VALIDATE**: Test with real operations, verify complete rollback
7. Deploy/demo if ready - **This is a working MVP!**

**MVP Deliverables**:
- ✅ Operation logging with validation
- ✅ Type-specific rollback for worktrees, branches, directories
- ✅ Automatic rollback in LIFO order
- ✅ Basic error handling
- ❌ No resilient error handling (US4)
- ❌ No ordering validation (US5)

**MVP Effort**: 42 tasks (T001-T042), estimated 1-2 days for experienced developer

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Foundational → Foundation ready
2. **MVP** (Phases 3-5): US2 + US3 + US1 → Test independently → Deploy/Demo
   - *Can log operations and roll them back automatically*
3. **Resilience** (Phase 6): Add US4 → Test independently → Deploy/Demo
   - *Now continues rollback despite individual failures*
4. **Validation** (Phase 7): Add US5 → Test independently → Deploy/Demo
   - *Now validates correct operation ordering*
5. **Production Ready** (Phase 8): Polish → Final testing → Production release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done**:
   - Developer A: User Story 2 (Phase 3) - Operation logging
   - Developer B: User Story 3 (Phase 4) - Rollback functions (parallel with US2)
3. **After US2 and US3 complete**:
   - Developer A: User Story 1 (Phase 5) - Rollback orchestration
   - Developer B: Start US4 tests (Phase 6)
4. **Final polish**:
   - Developer A: User Story 4 (Phase 6) - Error handling
   - Developer B: User Story 5 (Phase 7) - Ordering validation
   - Both: Polish tasks (Phase 8)

---

## Task Summary

**Total Tasks**: 75 tasks

**Tasks per User Story**:
- Setup: 3 tasks
- Foundational: 8 tasks (BLOCKS all user stories)
- User Story 2 (P1): 13 tasks (5 tests + 8 implementation) - Operation logging
- User Story 3 (P1): 16 tasks (9 tests + 7 implementation) - Type-specific rollback
- User Story 1 (P1): 14 tasks (5 tests + 9 implementation) - Rollback orchestration
- User Story 4 (P2): 6 tasks (3 tests + 3 implementation) - Error resilience
- User Story 5 (P2): 5 tasks (2 tests + 3 implementation) - Order validation
- Polish: 10 tasks

**Parallel Opportunities**: 48 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- **US1**: Simulate failure after 3 operations, verify all 3 reversed automatically
- **US2**: Execute test operations, verify each logged with type, timestamp, reversal data
- **US3**: Create log with worktree + branch + directory, trigger rollback, verify each type reversed correctly
- **US4**: Simulate permission error in 2nd of 5 operations, verify others still reversed
- **US5**: Create branch then worktree, verify rollback removes worktree before deleting branch

**MVP Scope**: User Story 2 + User Story 3 + User Story 1 (Operation logging, type-specific rollback, orchestration)
- MVP tasks: T001-T054 (54 tasks total)
- Estimated effort: 1-2 days for experienced developer
- Delivers core value: automatic rollback with operation logging

**Format Validation**: ✅ All tasks follow required format:
- ✅ All tasks start with `- [ ]` checkbox
- ✅ All tasks have sequential IDs (T001-T075)
- ✅ Parallelizable tasks marked with [P]
- ✅ User story tasks marked with [US1] through [US5]
- ✅ All tasks include exact file paths in descriptions
- ✅ Setup/Foundational/Polish tasks have NO story labels (correct)
