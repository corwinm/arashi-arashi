# Tasks: Git Utility Library

**Input**: Design documents from `/specs/005-git-utility-lib/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/git-api.ts

**Tests**: Constitution requires >80% test coverage. All core functionality must have both success and failure scenario tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create directory structure: src/lib/, src/types/, tests/unit/lib/, tests/integration/git/
- [ ] T002 Initialize TypeScript configuration in tsconfig.json with Bun-specific settings
- [ ] T003 [P] Create package.json with Bun test runner and no external dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and error handling that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define TypeScript interfaces in src/types/git.ts (CommandResult, GitErrorContext, Worktree, Branch, StatusEntry, RepositoryInfo)
- [ ] T005 Implement ArashiError class in src/lib/errors.ts with error code parsing and toJSON() method
- [ ] T006 Create test helper utilities in tests/helpers/git-test-utils.ts for creating temporary repos
- [ ] T007 Write unit tests for ArashiError in tests/unit/lib/errors.test.ts (error creation, code parsing, context preservation)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Execute Git Operations Safely (Priority: P1) 🎯 MVP

**Goal**: Implement safe git command execution with stdout/stderr capture and comprehensive error handling

**Independent Test**: Execute "git status" in valid and invalid repositories, verify output captured and errors reported with diagnostic information

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US1] Write unit tests for exec() in tests/unit/lib/git.test.ts (success case, failure case, stdout/stderr capture)
- [ ] T009 [P] [US1] Write integration test for exec() with real git commands in tests/integration/git/exec.test.ts (valid repo, invalid repo, command with warnings)

### Implementation for User Story 1

- [ ] T010 [US1] Implement exec() function in src/lib/git.ts using Bun.spawn() with stdout/stderr pipe configuration
- [ ] T011 [US1] Add error handling to exec() that throws ArashiError on non-zero exit code with full context
- [ ] T012 [US1] Add input validation to exec() for args and cwd parameters

**Checkpoint**: exec() function fully functional - can execute any git command safely with error handling

---

## Phase 4: User Story 2 - Verify Repository Types (Priority: P1)

**Goal**: Implement fast filesystem-based repository detection for normal and bare repositories

**Independent Test**: Create test directories with different structures (normal repo, bare repo, non-repo) and verify correct detection

### Tests for User Story 2

- [ ] T013 [P] [US2] Write unit tests for isGitRepository() in tests/unit/lib/git.test.ts (normal repo, submodule, worktree, non-repo)
- [ ] T014 [P] [US2] Write unit tests for isGitBareRepo() in tests/unit/lib/git.test.ts (bare repo, normal repo, non-repo)
- [ ] T015 [P] [US2] Write integration tests in tests/integration/git/detection.test.ts with real git repository structures

### Implementation for User Story 2

- [ ] T016 [P] [US2] Implement isGitRepository() in src/lib/git.ts checking for .git directory or .git file
- [ ] T017 [P] [US2] Implement isGitBareRepo() in src/lib/git.ts checking for HEAD, refs/, and objects/ directories
- [ ] T018 [US2] Add edge case handling for symbolic links, permission errors, and non-existent paths

**Checkpoint**: Repository detection functions work reliably - can validate any path < 100ms

---

## Phase 5: User Story 3 - Manage Worktrees (Priority: P1)

**Goal**: Implement worktree create, list, and remove operations with proper parsing and error handling

**Independent Test**: Create test repo, add worktree, list worktrees to verify, remove worktree to verify cleanup

### Tests for User Story 3

- [ ] T019 [P] [US3] Write unit tests for createWorktree() in tests/unit/lib/git.test.ts (success, invalid repo, path exists, invalid branch)
- [ ] T020 [P] [US3] Write unit tests for listWorktrees() in tests/unit/lib/git.test.ts (single worktree, multiple worktrees, locked worktree, detached HEAD)
- [ ] T021 [P] [US3] Write unit tests for removeWorktree() in tests/unit/lib/git.test.ts (success, force removal, locked worktree, invalid path)
- [ ] T022 [P] [US3] Write integration tests in tests/integration/git/worktree.test.ts covering full worktree lifecycle

### Implementation for User Story 3

- [ ] T023 [US3] Implement createWorktree() in src/lib/git.ts with repository validation and path conflict checking
- [ ] T024 [US3] Implement parseWorktreeList() helper function in src/lib/git.ts to parse "git worktree list --porcelain" output
- [ ] T025 [US3] Implement listWorktrees() in src/lib/git.ts using parseWorktreeList() helper
- [ ] T026 [US3] Implement removeWorktree() in src/lib/git.ts with force parameter support
- [ ] T027 [US3] Add comprehensive error handling for all worktree operations (repository validation, git command failures)

**Checkpoint**: Worktree management fully functional - can create, list, and remove worktrees reliably

---

## Phase 6: User Story 4 - Manage Branches (Priority: P2)

**Goal**: Implement branch existence checking, creation, and deletion with merge status validation

**Independent Test**: Check for non-existent branch, create new branch, verify existence, delete branch

### Tests for User Story 4

- [ ] T028 [P] [US4] Write unit tests for branchExists() in tests/unit/lib/git.test.ts (local branch, remote branch, non-existent branch)
- [ ] T029 [P] [US4] Write unit tests for createBranch() in tests/unit/lib/git.test.ts (from HEAD, from specific branch, branch exists error)
- [ ] T030 [P] [US4] Write unit tests for deleteBranch() in tests/unit/lib/git.test.ts (merged branch, unmerged branch, force delete)
- [ ] T031 [P] [US4] Write integration tests in tests/integration/git/branch.test.ts covering full branch lifecycle

### Implementation for User Story 4

- [ ] T032 [P] [US4] Implement branchExists() in src/lib/git.ts using "git show-ref --verify"
- [ ] T033 [P] [US4] Implement createBranch() in src/lib/git.ts using "git branch" with optional source branch
- [ ] T034 [US4] Implement deleteBranch() in src/lib/git.ts with safe (-d) and force (-D) modes
- [ ] T035 [US4] Add repository validation to all branch operations

**Checkpoint**: Branch management fully functional - can check, create, and delete branches with proper validation

---

## Phase 7: User Story 5 - Synchronize with Remote (Priority: P2)

**Goal**: Implement fetch and upstream tracking operations for remote repository synchronization

**Independent Test**: Create repo with remote, fetch changes, verify refs updated, set tracking and verify relationship

### Tests for User Story 5

- [ ] T036 [P] [US5] Write unit tests for fetchLatest() in tests/unit/lib/git.test.ts (success, no remote, network error)
- [ ] T037 [P] [US5] Write unit tests for setUpstreamTracking() in tests/unit/lib/git.test.ts (success, invalid branch, invalid remote)
- [ ] T038 [P] [US5] Write integration tests in tests/integration/git/remote.test.ts with mock remote repository

### Implementation for User Story 5

- [ ] T039 [P] [US5] Implement fetchLatest() in src/lib/git.ts using "git fetch" with optional remote parameter
- [ ] T040 [P] [US5] Implement setUpstreamTracking() in src/lib/git.ts using "git branch --set-upstream-to"
- [ ] T041 [US5] Add error handling for network failures and missing remotes

**Checkpoint**: Remote synchronization fully functional - can fetch and configure tracking relationships

---

## Phase 8: User Story 6 - Query Repository State (Priority: P3)

**Goal**: Implement status, current branch, and default branch query operations

**Independent Test**: Create repo with known state (specific branch, modified files), verify queries return expected results

### Tests for User Story 6

- [ ] T042 [P] [US6] Write unit tests for getStatus() in tests/unit/lib/git.test.ts (clean repo, modified files, untracked files)
- [ ] T043 [P] [US6] Write unit tests for getCurrentBranch() in tests/unit/lib/git.test.ts (normal branch, detached HEAD)
- [ ] T044 [P] [US6] Write unit tests for getDefaultBranch() in tests/unit/lib/git.test.ts (with remote, no remote)
- [ ] T045 [P] [US6] Write integration tests in tests/integration/git/status.test.ts with various repository states

### Implementation for User Story 6

- [ ] T046 [US6] Implement parseStatus() helper function in src/lib/git.ts to parse "git status --porcelain=v1" output
- [ ] T047 [P] [US6] Implement getStatus() in src/lib/git.ts using parseStatus() helper
- [ ] T048 [P] [US6] Implement getCurrentBranch() in src/lib/git.ts using "git rev-parse --abbrev-ref HEAD"
- [ ] T049 [P] [US6] Implement getDefaultBranch() in src/lib/git.ts using "git symbolic-ref refs/remotes/origin/HEAD"
- [ ] T050 [US6] Add error handling for missing remotes and detached HEAD states

**Checkpoint**: Repository state queries fully functional - can query status, branches with proper parsing

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Utilities, documentation, and improvements that affect multiple user stories

- [ ] T051 [P] Implement getGitVersion() utility function in src/lib/git.ts using "git --version"
- [ ] T052 [P] Implement getRepositoryInfo() utility function in src/lib/git.ts combining repository detection and default branch
- [ ] T053 Write unit tests for utility functions in tests/unit/lib/git.test.ts
- [ ] T054 Add JSDoc comments to all exported functions in src/lib/git.ts
- [ ] T055 [P] Create README.md in repository root with quickstart examples
- [ ] T056 Run full test suite and verify >80% coverage per constitution requirement
- [ ] T057 Validate quickstart.md examples against implemented functions
- [ ] T058 Performance testing: Verify repository detection < 100ms, worktree operations < 5 seconds, status queries < 1 second
- [ ] T059 [P] Test cross-platform compatibility on macOS, Linux, and Windows
- [ ] T060 Final code review and refactoring for consistency

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User Story 1 (US1 - P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (US2 - P1): Can start after Foundational - No dependencies (independently testable)
  - User Story 3 (US3 - P1): Can start after Foundational - Depends on US1 (uses exec()) and US2 (uses isGitRepository())
  - User Story 4 (US4 - P2): Can start after Foundational - Depends on US1 (uses exec()) and US2 (uses isGitRepository())
  - User Story 5 (US5 - P2): Can start after Foundational - Depends on US1 (uses exec()) and US2 (uses isGitRepository())
  - User Story 6 (US6 - P3): Can start after Foundational - Depends on US1 (uses exec()) and US2 (uses isGitRepository())
- **Polish (Phase 9)**: Depends on all user stories being complete

### Recommended Execution Order

**Sequential (single developer)**:
1. Phase 1: Setup (T001-T003)
2. Phase 2: Foundational (T004-T007)
3. Phase 3: User Story 1 (T008-T012) - Core execution primitive
4. Phase 4: User Story 2 (T013-T018) - Core detection primitive  
5. Phase 5: User Story 3 (T019-T027) - Main worktree functionality
6. Phase 6: User Story 4 (T028-T035) - Branch operations
7. Phase 7: User Story 5 (T036-T041) - Remote synchronization
8. Phase 8: User Story 6 (T042-T050) - Status queries
9. Phase 9: Polish (T051-T060)

**Parallel (multiple developers)**:
1. Phase 1-2: Setup + Foundational (all developers together)
2. Once Phase 2 complete:
   - Developer A: US1 (T008-T012) 
   - Developer B: US2 (T013-T018)
3. Once US1 + US2 complete:
   - Developer A: US3 (T019-T027)
   - Developer B: US4 (T028-T035)
   - Developer C: US5 (T036-T041)
4. US6 (T042-T050) after US1+US2 complete
5. Phase 9: Polish (after all stories)

### Within Each User Story

1. Write tests FIRST (ensure they FAIL)
2. Implement functions (tests should now PASS)
3. Add error handling and edge cases
4. Verify independent test criteria

### Parallel Opportunities

- **Setup (Phase 1)**: T002 and T003 can run in parallel
- **Foundational (Phase 2)**: T004, T005, T006 can run in parallel; T007 after T005
- **User Story 1**: T008 and T009 tests can run in parallel
- **User Story 2**: T013, T014, T015 tests can run in parallel; T016, T017 implementation can run in parallel
- **User Story 3**: T019, T020, T021, T022 tests can run in parallel
- **User Story 4**: T028, T029, T030, T031 tests can run in parallel; T032, T033 implementation can run in parallel
- **User Story 5**: T036, T037, T038 tests can run in parallel; T039, T040 implementation can run in parallel
- **User Story 6**: T042, T043, T044, T045 tests can run in parallel; T047, T048, T049 implementation can run in parallel
- **Polish (Phase 9)**: T051, T052, T055, T059 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit tests for exec() in tests/unit/lib/git.test.ts"
Task: "Write integration test for exec() with real git commands in tests/integration/git/exec.test.ts"

# After tests written and failing, implement:
Task: "Implement exec() function in src/lib/git.ts using Bun.spawn()"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3 Only - Core Worktree Functionality)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T012) - Command execution
4. Complete Phase 4: User Story 2 (T013-T018) - Repository detection
5. Complete Phase 5: User Story 3 (T019-T027) - Worktree operations
6. **STOP and VALIDATE**: Test worktree create/list/remove independently
7. Deploy/demo MVP

**MVP Deliverable**: Core git utility library with safe command execution, repository detection, and worktree management. This is sufficient for basic Arashi worktree manager functionality.

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Types and error handling ready
2. **+US1 +US2** → Basic git operations and validation ready
3. **+US3** → Worktree management ready → **MVP DEPLOY**
4. **+US4** → Branch management ready → Deploy
5. **+US5** → Remote sync ready → Deploy  
6. **+US6** → Full status queries ready → Deploy
7. **+Polish** → Production-ready with docs and performance validation

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With 3 developers after Phase 2 completion:

1. **Dev A**: Focuses on US1 (exec) → US3 (worktrees)
2. **Dev B**: Focuses on US2 (detection) → US4 (branches)
3. **Dev C**: Focuses on US5 (remote) → US6 (status)

Merge after each story completes and passes tests independently.

---

## Test Strategy Summary

Per constitution requirement VII (>80% coverage):

- **Unit tests**: All functions in src/lib/git.ts and src/lib/errors.ts
- **Integration tests**: Real git operations with temporary repositories
- **Success scenarios**: Each function with valid inputs
- **Failure scenarios**: Each function with invalid inputs, missing repos, git errors
- **Edge cases**: Symbolic links, permissions, concurrent operations, large output
- **Cross-platform**: Run tests on macOS, Linux, Windows

**Total test tasks**: 31 test-related tasks across all user stories
**Total implementation tasks**: 29 implementation tasks
**Test-to-code ratio**: ~1:1 (comprehensive coverage)

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label (US1-US6) maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **CRITICAL**: User Story 3 depends on US1+US2 being complete (uses exec() and isGitRepository())
- **CRITICAL**: User Stories 4, 5, 6 depend on US1+US2 being complete
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution requirement: >80% test coverage, cross-platform compatibility
- Performance targets: Detection <100ms, operations <5s, status <1s
