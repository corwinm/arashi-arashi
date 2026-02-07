# Tasks: Worktree Orchestration

**Input**: Design documents from `/specs/013-worktree-orchestration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test tasks are included based on Constitution Principle VII requiring >80% coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **arashi project**: `repos/arashi/src/`, `repos/arashi/tests/` (single executable project)
- Core orchestration in `src/core/worktree.ts`
- Dependencies from `src/lib/` (git, logger, prompts, config, hooks, filesystem)
- Tests in `tests/unit/core/` and `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and create test infrastructure

- [X] T001 Verify dependency modules exist: repos/arashi/src/lib/git.ts, logger.ts, prompts.ts, config.ts, hooks.ts, filesystem.ts
- [X] T002 Verify core modules exist: repos/arashi/src/core/rollback.ts, repository.ts
- [X] T003 [P] Create test fixtures directory repos/arashi/tests/fixtures/worktree-tests/
- [X] T004 [P] Create test helper script repos/arashi/tests/helpers/create-test-workspace.ts for generating temporary git repositories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Define core types in repos/arashi/src/core/worktree.ts: RepositoryFilterMode, ConflictResolutionStrategy, HookType, RepositoryResultStatus, OperationState
- [X] T006 [P] Define WorktreeOperationOptions interface in repos/arashi/src/core/worktree.ts
- [X] T007 [P] Define RepositoryFilter interface in repos/arashi/src/core/worktree.ts
- [X] T008 [P] Define BranchConflict interface in repos/arashi/src/core/worktree.ts
- [X] T009 [P] Define RepositoryResult interface in repos/arashi/src/core/worktree.ts
- [X] T010 [P] Define OperationSummary interface in repos/arashi/src/core/worktree.ts
- [X] T011 [P] Define HookExecutionContext interface in repos/arashi/src/core/worktree.ts
- [X] T012 Define error classes in repos/arashi/src/core/worktree.ts: RepositoryValidationError, GitOperationError, HookExecutionError, ConflictAbortedError, InvalidBranchNameError, InsufficientPermissionsError
- [X] T013 Implement isValidBranchName() helper function in repos/arashi/src/core/worktree.ts (validates git branch name rules)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Coordinated Worktrees Across All Repositories (Priority: P1) 🎯 MVP

**Goal**: Enable coordinated worktree creation across multiple repositories from a single command

**Independent Test**: Run worktree creation with branch name against 5 test repositories, verify worktrees created with correct branch in each repo

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US1] Unit test for branch name validation in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T015 [P] [US1] Unit test for createCoordinatedWorktrees() success case (5 repos, all succeed) in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T016 [P] [US1] Unit test for createCoordinatedWorktrees() with different default branches (main, master, develop) in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T017 [P] [US1] Integration test for basic coordinated worktree creation in repos/arashi/tests/integration/worktree-integration.test.ts (creates 3 real test repos)

### Implementation for User Story 1

- [X] T018 [US1] Implement createCoordinatedWorktrees() function skeleton in repos/arashi/src/core/worktree.ts (entry point with operation log initialization)
- [X] T019 [US1] Implement processRepository() helper function in repos/arashi/src/core/worktree.ts (handles single repository worktree creation with operation logging)
- [X] T020 [US1] Add branch creation logic in processRepository() using git.createBranch() from repos/arashi/src/lib/git.ts
- [X] T021 [US1] Add worktree creation logic in processRepository() using git.addWorktree() from repos/arashi/src/lib/git.ts
- [X] T022 [US1] Add operation logging after each successful git operation (branch_created, worktree_created entries)
- [X] T023 [US1] Implement error handling and rollback trigger in createCoordinatedWorktrees() (catch errors, call operationLog.rollback())
- [X] T024 [US1] Build OperationSummary result object with counts, durations, and repository results

**Checkpoint**: At this point, User Story 1 should be fully functional - basic coordinated worktree creation works

---

## Phase 4: User Story 5 - Automatic Rollback on Partial Failure (Priority: P1)

**Goal**: Ensure automatic cleanup when operations fail, preventing partial state

**Independent Test**: Simulate failure in 3rd of 5 repos, verify first 2 worktrees are automatically rolled back

**Note**: US5 is implemented before US2-4 because it's P1 and integrates directly with US1

### Tests for User Story 5

- [X] T025 [P] [US5] Unit test for rollback trigger on failure in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T026 [P] [US5] Integration test for rollback on simulated failure in repos/arashi/tests/integration/worktree-integration.test.ts (mark 3rd repo read-only to trigger failure)
- [X] T027 [US5] Verify rollback mechanism integration in processRepository() error handling (already implemented in T023, verify it works correctly)
- [X] T028 [US5] Add detailed error messages with repository context in GitOperationError
- [X] T029 [US5] Test rollback scenarios: verify worktrees removed, branches deleted, operation log captured correctly

**Checkpoint**: At this point, User Stories 1 AND 5 work together - coordinated creation with automatic rollback on failure

---

## Phase 5: User Story 2 - Handle Branch Conflicts with User Choice (Priority: P2)

**Goal**: Detect branch conflicts and present resolution options to user

**Independent Test**: Create branch manually in 1 repo, attempt coordinated creation, verify conflict dialog appears with options

### Tests for User Story 2

- [X] T030 [P] [US2] Unit test for checkBranchConflicts() with no conflicts in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T031 [P] [US2] Unit test for checkBranchConflicts() with partial conflicts (2 of 5 repos) in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T032 [P] [US2] Unit test for resolveConflicts() with ABORT strategy in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T033 [P] [US2] Unit test for resolveConflicts() with REUSE_EXISTING strategy in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T034 [P] [US2] Integration test for conflict detection and resolution in repos/arashi/tests/integration/worktree-integration.test.ts (pre-create branch in 1 repo)
- [X] T035 [P] [US2] Implement checkBranchConflicts() function in repos/arashi/src/core/worktree.ts (parallel checks using git.branchExists and git.remoteBranchExists)
- [X] T036 [US2] Define ConflictCheckResult interface in repos/arashi/src/core/worktree.ts
- [X] T037 [US2] Implement resolveConflicts() function in repos/arashi/src/core/worktree.ts (prompts user with select() from prompts utility)
- [X] T038 [US2] Build conflict resolution dialog message showing all conflicting repositories
- [X] T039 [US2] Integrate checkBranchConflicts() into createCoordinatedWorktrees() as pre-flight check (after repository filtering, before processing)
- [X] T040 [US2] Handle ABORT strategy in resolveConflicts() (throw ConflictAbortedError)
- [X] T041 [US2] Handle REUSE_EXISTING strategy in processRepository() (check if branch exists, skip branch creation if it does)

**Checkpoint**: At this point, User Stories 1, 2, and 5 work together - conflict detection with automatic rollback

---

## Phase 6: User Story 3 - Filter Repositories for Selective Worktree Creation (Priority: P2)

**Goal**: Support filtering repositories via command-line flag or interactive selection

**Independent Test**: Run with --only flag specifying 3 of 10 repos, verify worktrees created only in those 3

### Tests for User Story 3

- [X] T042 [P] [US3] Unit test for applyRepositoryFilter() with mode='all' in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T043 [P] [US3] Unit test for applyRepositoryFilter() with mode='explicit' and valid names in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T044 [P] [US3] Unit test for applyRepositoryFilter() with mode='explicit' and unknown repository name (should throw RepositoryValidationError) in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T045 [P] [US3] Unit test for applyRepositoryFilter() with mode='interactive' (mock checkbox prompt) in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T046 [P] [US3] Integration test for explicit filtering with real repositories in repos/arashi/tests/integration/worktree-integration.test.ts
- [X] T047 [P] [US3] Implement applyRepositoryFilter() function in repos/arashi/src/core/worktree.ts
- [X] T048 [US3] Implement 'all' mode in applyRepositoryFilter() (return all repositories)
- [X] T049 [US3] Implement 'explicit' mode in applyRepositoryFilter() (validate names, return matching repositories)
- [X] T050 [US3] Implement 'interactive' mode in applyRepositoryFilter() (use checkbox() from prompts utility)
- [X] T051 [US3] Build checkbox choices with repository metadata (name, path, default branch)
- [X] T052 [US3] Integrate applyRepositoryFilter() into createCoordinatedWorktrees() (after loading repositories, before conflict checking)
- [X] T053 [US3] Add validation for empty repository list after filtering

**Checkpoint**: At this point, User Stories 1, 2, 3, and 5 work together - filtering with conflict detection and rollback

---

## Phase 7: User Story 4 - Track Progress During Multi-Repository Operations (Priority: P3)

**Goal**: Display real-time progress indicators during multi-repo operations

**Independent Test**: Run worktree creation against 5 repos, observe console output for spinners and status updates

### Tests for User Story 4

- [X] T054 [P] [US4] Unit test verifying spinner creation for each repository in repos/arashi/tests/unit/core/worktree.test.ts (mock logger.spinner)
- [X] T055 [P] [US4] Unit test verifying spinner success/failure state updates in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T056 [P] [US4] Add spinner initialization in processRepository() using logger.spinner() from repos/arashi/src/lib/logger.ts
- [X] T057 [US4] Add spinner.start() at beginning of processRepository()
- [X] T058 [US4] Add spinner.succeed() on successful worktree creation with path information
- [X] T059 [US4] Add spinner.fail() on error with error message
- [X] T060 [US4] Add showProgress option check (only create spinners if options.showProgress is true)
- [X] T061 [US4] Build operation summary output at end of createCoordinatedWorktrees() (success count, failure count, total duration)

**Checkpoint**: At this point, User Stories 1-5 work together with progress display

---

## Phase 8: User Story 6 - Execute Hooks at Key Points (Priority: P3)

**Goal**: Execute pre-create and post-create hooks at appropriate lifecycle points

**Independent Test**: Configure test hooks, run worktree creation, verify hooks executed with correct environment variables

### Tests for User Story 6

- [X] T062 [P] [US6] Unit test for executeHook() with successful hook execution in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T063 [P] [US6] Unit test for executeHook() with hook failure (non-zero exit code) in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T064 [P] [US6] Unit test for executeHook() with hook timeout in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T065 [P] [US6] Integration test for hook execution with real test hook scripts in repos/arashi/tests/integration/worktree-integration.test.ts
- [X] T066 [P] [US6] Implement executeHook() function in repos/arashi/src/core/worktree.ts (calls hooks.executeHook() from hooks utility)
- [X] T067 [P] [US6] Implement buildHookEnvironment() helper function in repos/arashi/src/core/worktree.ts (builds env vars: ARASHI_BRANCH, ARASHI_REPO_PATH, ARASHI_REPO_NAME, ARASHI_WORKTREE_PATH)
- [X] T068 [US6] Add pre-create hook execution in processRepository() before branch creation
- [X] T069 [US6] Build HookExecutionContext for pre-create hook (worktreePath=null)
- [X] T070 [US6] Add pre-create hook failure handling (throw HookExecutionError, triggers rollback)
- [X] T071 [US6] Add post-create hook execution in processRepository() after worktree creation
- [X] T072 [US6] Build HookExecutionContext for post-create hook (worktreePath populated)
- [X] T073 [US6] Add post-create hook failure handling (log as warning, don't fail operation)
- [X] T074 [US6] Add executeHooks option check (skip hook execution if options.executeHooks is false)
- [X] T075 [US6] Add hook timeout enforcement using options.hookTimeout

**Checkpoint**: All user stories (1-6) now complete and functional - full worktree orchestration feature

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T076 [P] Add comprehensive JSDoc comments to all public functions in repos/arashi/src/core/worktree.ts
- [X] T077 [P] Add edge case tests for detached HEAD state in repos/arashi/tests/integration/worktree-integration.test.ts
- [X] T078 [P] Add edge case tests for insufficient disk space in repos/arashi/tests/integration/worktree-integration.test.ts
- [X] T079 [P] Add edge case tests for paths with spaces and special characters in repos/arashi/tests/integration/worktree-integration.test.ts
- [X] T080 [P] Add edge case tests for concurrent rollback prevention in repos/arashi/tests/unit/core/worktree.test.ts
- [X] T081 Code review and refactoring for repos/arashi/src/core/worktree.ts
- [X] T082 Run Bun test coverage report, verify >80% coverage for repos/arashi/src/core/worktree.ts
- [X] T083 Performance testing with 50 repositories, verify <30 second completion time
- [X] T084 Cross-platform testing on macOS, Linux, Windows
- [X] T085 Run quickstart.md validation (follow implementation examples, verify they work)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) - Core coordinated worktree creation
- **User Story 5 (Phase 4)**: Depends on User Story 1 (Phase 3) - Integrates rollback with US1
- **User Story 2 (Phase 5)**: Depends on Foundational (Phase 2) - Can start after foundation, integrates with US1 in pre-flight check
- **User Story 3 (Phase 6)**: Depends on Foundational (Phase 2) - Can start after foundation, integrates with US1 for filtering
- **User Story 4 (Phase 7)**: Depends on User Story 1 (Phase 3) - Adds progress display to US1
- **User Story 6 (Phase 8)**: Depends on User Story 1 (Phase 3) - Adds hook execution to US1
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Core functionality - BLOCKS US4, US5, US6 (they enhance it)
- **User Story 2 (P2)**: Independent - can start after Foundational, integrates as pre-flight check
- **User Story 3 (P2)**: Independent - can start after Foundational, integrates as filter step
- **User Story 4 (P3)**: Depends on US1 - adds progress display to processRepository()
- **User Story 5 (P1)**: Depends on US1 - integrates rollback into createCoordinatedWorktrees()
- **User Story 6 (P3)**: Depends on US1 - adds hook execution to processRepository()

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Types and interfaces before implementation
- Helper functions before main orchestration logic
- Core implementation before integration with other stories
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 and T004 can run in parallel (different directories)

**Phase 2 (Foundational)**:
- T006, T007, T008, T009, T010, T011 can all run in parallel (different interfaces)

**Phase 3 (US1) - Tests**:
- T014, T015, T016, T017 can run in parallel (different test files or test cases)

**Phase 3 (US1) - Implementation**:
- After T018 completes, T019-T024 must be sequential (all modify same file)

**Phase 4 (US5) - Tests**:
- T025, T026 can run in parallel

**Phase 5 (US2) - Tests**:
- T030, T031, T032, T033, T034 can run in parallel

**Phase 5 (US2) - Implementation**:
- T035, T036 can run in parallel
- After T037 completes, T038-T041 must be sequential

**Phase 6 (US3) - Tests**:
- T042, T043, T044, T045, T046 can run in parallel

**Phase 6 (US3) - Implementation**:
- T047, T048 can run in parallel initially
- T049, T050, T051 must be sequential (build on T048)
- T052, T053 integrate into main flow

**Phase 7 (US4) - Tests**:
- T054, T055 can run in parallel

**Phase 7 (US4) - Implementation**:
- T056, T057, T058, T059, T060 modify same function, must be sequential
- T061 is separate, can run in parallel

**Phase 8 (US6) - Tests**:
- T062, T063, T064, T065 can run in parallel

**Phase 8 (US6) - Implementation**:
- T066, T067 can run in parallel
- T068-T075 modify processRepository(), must be sequential

**Phase 9 (Polish)**:
- T076, T077, T078, T079, T080 can all run in parallel (different concerns)

---

## Parallel Example: User Story 1 (Core Functionality)

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for branch name validation in repos/arashi/tests/unit/core/worktree.test.ts"
Task: "Unit test for createCoordinatedWorktrees() success case in repos/arashi/tests/unit/core/worktree.test.ts"
Task: "Unit test for different default branches in repos/arashi/tests/unit/core/worktree.test.ts"
Task: "Integration test for basic coordinated worktree creation in repos/arashi/tests/integration/worktree-integration.test.ts"

# Implementation tasks must be sequential (same file):
# T018 → T019 → T020 → T021 → T022 → T023 → T024
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 5 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013) - CRITICAL: blocks all stories
3. Complete Phase 3: User Story 1 (T014-T024) - Core coordinated worktree creation
4. Complete Phase 4: User Story 5 (T025-T029) - Automatic rollback on failure
5. **STOP and VALIDATE**: Test US1 + US5 independently with 5 test repos
6. Deploy/demo if ready - **This is a working MVP!**

**MVP Deliverables**:
- ✅ Coordinated worktree creation across multiple repos
- ✅ Automatic rollback on failure
- ✅ Basic error handling and reporting
- ❌ No conflict detection (US2)
- ❌ No repository filtering (US3)  
- ❌ No progress indicators (US4)
- ❌ No hooks support (US6)

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Foundational → Foundation ready
2. **MVP** (Phases 3-4): US1 + US5 → Test independently → Deploy/Demo
   - *Can create coordinated worktrees with automatic rollback*
3. **Conflict Handling** (Phase 5): Add US2 → Test independently → Deploy/Demo
   - *Now handles branch conflicts gracefully*
4. **Filtering** (Phase 6): Add US3 → Test independently → Deploy/Demo
   - *Now supports selective repository filtering*
5. **UX Polish** (Phases 7-8): Add US4 + US6 → Test independently → Deploy/Demo
   - *Now has progress indicators and hooks support*
6. **Production Ready** (Phase 9): Polish → Final testing → Production release

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (Phase 3) - Core implementation
   - Developer B: User Story 2 (Phase 5) - Conflict detection (can start early, integrates later)
   - Developer C: User Story 3 (Phase 6) - Repository filtering (can start early, integrates later)
3. **After US1 completes**:
   - Developer A: User Story 5 (Phase 4) - Rollback integration
   - Developer B: Continue US2
   - Developer C: Continue US3
4. **Final polish**:
   - Developer A: User Story 4 (Phase 7) - Progress indicators
   - Developer B: User Story 6 (Phase 8) - Hooks integration
   - Developer C: Polish tasks (Phase 9)

---

## Task Summary

**Total Tasks**: 85 tasks

**Tasks per User Story**:
- Setup: 4 tasks
- Foundational: 9 tasks (BLOCKS all user stories)
- User Story 1 (P1): 11 tasks (4 tests + 7 implementation)
- User Story 5 (P1): 5 tasks (2 tests + 3 implementation)
- User Story 2 (P2): 12 tasks (5 tests + 7 implementation)
- User Story 3 (P2): 12 tasks (5 tests + 7 implementation)
- User Story 4 (P3): 8 tasks (2 tests + 6 implementation)
- User Story 6 (P3): 14 tasks (4 tests + 10 implementation)
- Polish: 10 tasks

**Parallel Opportunities**: 42 tasks marked [P] can run in parallel within their phase

**Independent Test Criteria**:
- **US1**: Create worktrees across 5 test repos, verify all created with correct branches
- **US2**: Pre-create branch in 1 repo, verify conflict dialog, test abort and reuse strategies
- **US3**: Filter to 3 of 10 repos, verify only those 3 receive worktrees
- **US4**: Observe console output during creation, verify spinners and status updates appear
- **US5**: Simulate failure in 3rd repo, verify first 2 worktrees are rolled back
- **US6**: Configure test hooks, verify pre-create runs before worktree, post-create runs after

**MVP Scope**: User Story 1 + User Story 5 (Core coordinated worktree creation with automatic rollback)
- MVP tasks: T001-T029 (38 tasks total)
- Estimated effort: 2-3 days for experienced developer
- Delivers core value: multi-repo worktree management with error recovery

**Format Validation**: ✅ All tasks follow required format:
- ✅ All tasks start with `- [ ]` checkbox
- ✅ All tasks have sequential IDs (T001-T085)
- ✅ Parallelizable tasks marked with [P]
- ✅ User story tasks marked with [US1] through [US6]
- ✅ All tasks include exact file paths in descriptions
- ✅ Setup/Foundational/Polish tasks have NO story labels (correct)
