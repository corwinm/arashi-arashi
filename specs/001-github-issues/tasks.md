# Tasks: Hook System

**Input**: Design documents from `/specs/001-github-issues/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included to meet constitutional requirement for >80% test coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Implementation location: `repos/arashi/`
- Source: `repos/arashi/src/lib/hooks.ts`
- Tests: `repos/arashi/tests/unit/hooks.test.ts`, `repos/arashi/tests/integration/hooks-integration.test.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create basic project structure for hook system module

- [ ] T001 Create repos/arashi/src/lib/hooks.ts file with module structure and type definitions
- [ ] T002 [P] Create repos/arashi/tests/unit/hooks.test.ts file for unit tests
- [ ] T003 [P] Create repos/arashi/tests/integration/hooks-integration.test.ts file for integration tests
- [ ] T004 [P] Create test helper utilities in repos/arashi/tests/helpers/hooks.ts (createMockHook, createTestContext functions)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and helper functions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Define TypeScript interfaces in repos/arashi/src/lib/hooks.ts (Hook, HookContext, HookResult, HookExecutionOptions, ValidationResult, LifecyclePoint, HookConfig)
- [ ] T006 [P] Implement getShellCommand() helper function in repos/arashi/src/lib/hooks.ts for cross-platform shell selection
- [ ] T007 [P] Implement buildEnvironment() helper function in repos/arashi/src/lib/hooks.ts for environment variable construction
- [ ] T008 [P] Write unit tests for getShellCommand() in repos/arashi/tests/unit/hooks.test.ts (test all platforms: win32, darwin, linux)
- [ ] T009 [P] Write unit tests for buildEnvironment() in repos/arashi/tests/unit/hooks.test.ts (verify ARASHI_ prefix, merge with process.env)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 + 4 - Execute Scripts & Handle Failures (Priority: P1) 🎯 MVP

**Combined Stories**: US1 (Execute Custom Scripts) + US4 (Handle Hook Failures) are tightly coupled

**Goal**: Core hook system that discovers, validates, and executes hook scripts with non-fatal error handling, timeout enforcement, and real-time output streaming

**Independent Test**: Place an executable .sh script in `.arashi/hooks/pre-create.sh`, run a command that triggers it, verify script executes with environment variables and failures don't block execution

### Unit Tests for US1+US4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Write unit test for findHook() when hook exists in repos/arashi/tests/unit/hooks.test.ts
- [ ] T011 [P] [US1] Write unit test for findHook() when hook doesn't exist in repos/arashi/tests/unit/hooks.test.ts
- [ ] T012 [P] [US1] Write unit test for findHook() when directory doesn't exist in repos/arashi/tests/unit/hooks.test.ts
- [ ] T013 [P] [US1] Write unit test for validateHook() with executable file on Unix in repos/arashi/tests/unit/hooks.test.ts
- [ ] T014 [P] [US1] Write unit test for validateHook() with non-executable file on Unix in repos/arashi/tests/unit/hooks.test.ts
- [ ] T015 [P] [US1] Write unit test for validateHook() with directory instead of file in repos/arashi/tests/unit/hooks.test.ts
- [ ] T016 [P] [US1] Write unit test for validateHook() on Windows (.sh file) in repos/arashi/tests/unit/hooks.test.ts
- [ ] T017 [P] [US4] Write unit test for executeHook() with successful execution (exit code 0) in repos/arashi/tests/unit/hooks.test.ts
- [ ] T018 [P] [US4] Write unit test for executeHook() with non-zero exit code in repos/arashi/tests/unit/hooks.test.ts
- [ ] T019 [P] [US4] Write unit test for executeHook() with timeout enforcement in repos/arashi/tests/unit/hooks.test.ts
- [ ] T020 [P] [US4] Write unit test for executeHook() capturing stdout/stderr correctly in repos/arashi/tests/unit/hooks.test.ts
- [ ] T021 [P] [US1] Write unit test for executeHook() passing environment variables in repos/arashi/tests/unit/hooks.test.ts

### Implementation for US1+US4

- [ ] T022 [US1] Implement findHook() function in repos/arashi/src/lib/hooks.ts (discover hook scripts in .arashi/hooks/)
- [ ] T023 [US1] Implement validateHook() function in repos/arashi/src/lib/hooks.ts (check file type and execute permissions)
- [ ] T024 [US1] Implement streamOutput() helper function in repos/arashi/src/lib/hooks.ts (real-time output streaming with prefixes)
- [ ] T025 [US4] Implement executeHook() function in repos/arashi/src/lib/hooks.ts (spawn process, stream output, handle timeout, return HookResult)
- [ ] T026 [US4] Add error handling to executeHook() in repos/arashi/src/lib/hooks.ts (catch spawn failures, return error result instead of throwing)
- [ ] T027 [US1] Verify all unit tests pass for findHook(), validateHook(), executeHook() in repos/arashi/tests/unit/hooks.test.ts

### Integration Tests for US1+US4

- [ ] T028 [P] [US1] Write integration test: execute real shell script that succeeds in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T029 [P] [US4] Write integration test: execute real shell script that fails (exit 1) in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T030 [P] [US4] Write integration test: execute long-running script that times out in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T031 [P] [US1] Write integration test: execute script with large output (1000+ lines) in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T032 [P] [US1] Write integration test: execute script that reads environment variables in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T033 [US1] Run all integration tests and verify they pass

**Checkpoint**: At this point, core hook execution with error handling should be fully functional and testable independently

---

## Phase 4: User Story 2 - Skip Hooks When Needed (Priority: P2)

**Goal**: Allow users to bypass hook execution with `--no-hooks` flag for debugging or speed

**Independent Test**: Place a hook that would normally execute, run command with `--no-hooks` flag, verify hook is skipped and command completes normally

### Unit Tests for US2

- [ ] T034 [P] [US2] Write unit test for runLifecycleHook() with skipHooks=true in repos/arashi/tests/unit/hooks.test.ts
- [ ] T035 [P] [US2] Write unit test for runLifecycleHook() with skipHooks=false in repos/arashi/tests/unit/hooks.test.ts
- [ ] T036 [P] [US2] Write unit test for runLifecycleHook() when hook doesn't exist (returns null) in repos/arashi/tests/unit/hooks.test.ts
- [ ] T037 [P] [US2] Write unit test for runLifecycleHook() when validation fails (returns null) in repos/arashi/tests/unit/hooks.test.ts

### Implementation for US2

- [ ] T038 [US2] Implement runLifecycleHook() function in repos/arashi/src/lib/hooks.ts (orchestrates discover → validate → execute)
- [ ] T039 [US2] Add skipHooks parameter handling to runLifecycleHook() in repos/arashi/src/lib/hooks.ts (return null if skipHooks is true)
- [ ] T040 [US2] Add logging for skipped hooks in runLifecycleHook() in repos/arashi/src/lib/hooks.ts
- [ ] T041 [US2] Verify all unit tests pass for runLifecycleHook() in repos/arashi/tests/unit/hooks.test.ts

### Integration Test for US2

- [ ] T042 [US2] Write integration test: skip hook execution with skipHooks flag in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T043 [US2] Run integration test and verify it passes

**Checkpoint**: At this point, User Stories 1, 2, AND 4 should all work independently

---

## Phase 5: User Story 3 - Enhanced Hook Context (Priority: P3)

**Goal**: Provide comprehensive context information to hooks via environment variables (operation-specific data like branch name, worktree path)

**Independent Test**: Create a hook that echoes environment variables, run command that triggers it, verify all expected ARASHI_* variables are present with correct values

### Unit Tests for US3

- [ ] T044 [P] [US3] Write unit test for buildEnvironment() with operationData in repos/arashi/tests/unit/hooks.test.ts (verify all ARASHI_ prefixed vars)
- [ ] T045 [P] [US3] Write unit test for environment variable names in repos/arashi/tests/unit/hooks.test.ts (ARASHI_HOOK_NAME, ARASHI_REPO_PATH, ARASHI_BRANCH, etc.)
- [ ] T046 [P] [US3] Write unit test for executeHook() with complex operationData in repos/arashi/tests/unit/hooks.test.ts (multiple custom variables)

### Implementation for US3

- [ ] T047 [US3] Enhance buildEnvironment() in repos/arashi/src/lib/hooks.ts to handle all operationData fields with ARASHI_ prefix
- [ ] T048 [US3] Document environment variable conventions in repos/arashi/src/lib/hooks.ts JSDoc comments
- [ ] T049 [US3] Verify all unit tests pass for enhanced context passing in repos/arashi/tests/unit/hooks.test.ts

### Integration Test for US3

- [ ] T050 [US3] Write integration test: execute script that uses multiple environment variables in repos/arashi/tests/integration/hooks-integration.test.ts
- [ ] T051 [US3] Run integration test and verify all env vars passed correctly

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] T052 [P] Add comprehensive JSDoc comments to all public functions in repos/arashi/src/lib/hooks.ts
- [ ] T053 [P] Add type exports at end of repos/arashi/src/lib/hooks.ts (export all interfaces and functions)
- [ ] T054 Run full test suite and verify >80% code coverage in repos/arashi/tests/
- [ ] T055 [P] Add edge case handling: empty operationData, null values, long hook names in repos/arashi/src/lib/hooks.ts
- [ ] T056 [P] Add performance logging for hook discovery and execution in repos/arashi/src/lib/hooks.ts (track <50ms discovery, <100ms startup)
- [ ] T057 Verify all quickstart.md examples work correctly by running them manually
- [ ] T058 [P] Add hook execution result logging with emoji indicators (✅ success, ⚠️ failure, ⏱️ timeout) in repos/arashi/src/lib/hooks.ts
- [ ] T059 Final review: ensure non-fatal error handling is consistent across all functions in repos/arashi/src/lib/hooks.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - Phase 3 (US1+US4): Can start after Foundational - Core functionality (MVP)
  - Phase 4 (US2): Can start after Phase 3 - Adds skip functionality
  - Phase 5 (US3): Can start after Phase 3 - Enhances context (independent of US2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 + US4 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - THIS IS THE MVP
- **US2 (P2)**: Depends on US1+US4 completion (needs runLifecycleHook to integrate with findHook/validateHook/executeHook)
- **US3 (P3)**: Can start after Foundational (Phase 2) - Independent of US2, enhances existing buildEnvironment()

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Helper functions before main functions
- Core implementation before integration
- Unit tests before integration tests
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T002, T003, T004 can all run in parallel (different test files and helpers)

**Foundational Phase (Phase 2)**:
- T006, T007 can run in parallel (different helper functions)
- T008, T009 can run in parallel (different test suites)

**Phase 3 Unit Tests (US1+US4)**:
- T010-T021 can all run in parallel (different test cases in same file, non-overlapping)

**Phase 3 Integration Tests (US1+US4)**:
- T028-T032 can all run in parallel (different test scenarios)

**Phase 4 Unit Tests (US2)**:
- T034-T037 can all run in parallel (different test cases)

**Phase 5 Unit Tests (US3)**:
- T044-T046 can all run in parallel (different test cases)

**Polish Phase (Phase 6)**:
- T052, T053, T055, T056, T058 can all run in parallel (different concerns)

---

## Parallel Example: User Story 1+4

```bash
# Launch all unit tests for User Story 1+4 together (after writing them):
Task: "Write unit test for findHook() when hook exists"
Task: "Write unit test for findHook() when hook doesn't exist"
Task: "Write unit test for validateHook() with executable file"
Task: "Write unit test for executeHook() with successful execution"
# ... all T010-T021 in parallel

# Launch all integration tests for User Story 1+4 together:
Task: "Write integration test: execute real shell script that succeeds"
Task: "Write integration test: execute real shell script that fails"
Task: "Write integration test: execute long-running script that times out"
Task: "Write integration test: execute script with large output"
Task: "Write integration test: execute script that reads environment variables"
# ... all T028-T032 in parallel
```

---

## Implementation Strategy

### MVP First (US1+US4 Only)

1. Complete Phase 1: Setup → Test structure ready
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories) → Type definitions and helpers ready
3. Complete Phase 3: User Story 1+4 → Core hook execution with error handling
4. **STOP and VALIDATE**: Test US1+US4 independently with real hook scripts
5. This is a functional MVP that can execute hooks with graceful failure handling

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1+4 → Test independently → **Deploy/Demo (MVP!)**
3. Add User Story 2 → Test independently → Deploy/Demo (now with --no-hooks flag)
4. Add User Story 3 → Test independently → Deploy/Demo (now with enhanced context)
5. Add Polish → Final release ready

Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together → Foundation ready
2. Once Foundational is done:
   - Developer A: User Story 1+4 (core execution + error handling) → MVP
   - Developer B: User Story 2 (wait for US1+4 core, then add skip functionality)
   - Developer C: User Story 3 (can start in parallel with US2, enhances context)
3. Stories complete and integrate independently

---

## Implementation Target

**Primary Implementation Location**: `repos/arashi/src/lib/hooks.ts`

This single file will contain all hook system functionality:
- Type definitions (interfaces and types)
- Helper functions (getShellCommand, buildEnvironment, streamOutput)
- Public API (findHook, validateHook, executeHook, runLifecycleHook)

**Test Files**:
- Unit tests: `repos/arashi/tests/unit/hooks.test.ts`
- Integration tests: `repos/arashi/tests/integration/hooks-integration.test.ts`
- Test helpers: `repos/arashi/tests/helpers/hooks.ts`

---

## Notes

- [P] tasks = different files or non-overlapping code sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All functions use Bun built-in APIs only (no external dependencies)
- Hook failures are always non-fatal (core principle)
- Target >80% test coverage (constitutional requirement)
