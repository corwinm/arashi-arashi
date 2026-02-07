# Tasks: Status Command

**Input**: Design documents from `/specs/020-status-command/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included per Constitution Principle VII (>80% coverage required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `repos/arashi/` (main arashi implementation repository)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify existing project structure matches plan.md expectations (src/commands/, src/lib/, tests/)
- [X] T002 Study existing command patterns in repos/arashi/src/commands/list.ts and repos/arashi/src/commands/add.ts

**Checkpoint**: Development environment ready ✓

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core git status utility that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Add GitStatusResult interface to repos/arashi/src/lib/git.ts (output: string, error: string | null)
- [X] T004 Implement getGitStatus() function in repos/arashi/src/lib/git.ts using Bun.spawn with 'git status --porcelain=v1 --branch'
- [X] T005 Add StatusOptions, GitFileStatus, BranchTrackingInfo, RepoStatus interfaces to repos/arashi/src/commands/status.ts based on data-model.md
- [X] T006 Implement parseGitStatus() function in repos/arashi/src/commands/status.ts to parse porcelain output into GitFileStatus[] and BranchTrackingInfo
- [X] T007 Implement parseBranchLine() helper function in repos/arashi/src/commands/status.ts to extract branch tracking info from ## lines
- [X] T008 Implement checkRepoStatus() function in repos/arashi/src/commands/status.ts to get and parse status for single repository
- [X] T009 Implement checkAllRepos() function in repos/arashi/src/commands/status.ts using Promise.all for parallel execution

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Check Repository Status at a Glance (Priority: P1) 🎯 MVP

**Goal**: Users can run `arashi status` and see default output with color-coded indicators for all repositories

**Independent Test**: Run `arashi status` in a workspace with multiple repositories and verify it displays status with green (clean) and yellow (dirty) indicators plus summary

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [P] [US1] Create repos/arashi/tests/unit/status.test.ts with test for parseGitStatus() handling clean repository output
- [X] T011 [P] [US1] Add unit test in repos/arashi/tests/unit/status.test.ts for parseGitStatus() handling dirty repository with modified files
- [X] T012 [P] [US1] Add unit test in repos/arashi/tests/unit/status.test.ts for parseGitStatus() handling untracked files
- [X] T013 [P] [US1] Add unit test in repos/arashi/tests/unit/status.test.ts for parseBranchLine() handling various branch formats
- [X] T014 [P] [US1] Add unit test in repos/arashi/tests/unit/status.test.ts for parseBranchLine() handling detached HEAD state
- [ ] T015 [P] [US1] Create repos/arashi/tests/integration/status.test.ts with test for clean workspace scenario (acceptance scenario 2)
- [ ] T016 [P] [US1] Add integration test in repos/arashi/tests/integration/status.test.ts for dirty workspace scenario (acceptance scenario 1)
- [ ] T017 [P] [US1] Add integration test in repos/arashi/tests/integration/status.test.ts for workspace with main repo and sub-repos (acceptance scenario 3)

### Implementation for User Story 1

- [X] T018 [P] [US1] Implement formatRepoSection() helper in repos/arashi/src/commands/status.ts for default output mode with chalk colors
- [X] T019 [P] [US1] Implement formatSummary() helper in repos/arashi/src/commands/status.ts to show clean/dirty counts
- [X] T020 [US1] Implement formatDefaultOutput() function in repos/arashi/src/commands/status.ts combining formatRepoSection() and formatSummary()
- [X] T021 [US1] Implement main statusCommand() function in repos/arashi/src/commands/status.ts with config loading, progress spinner, and default output
- [X] T022 [US1] Register status command in repos/arashi/src/commands/status.ts with commander using .command('status').description().action()
- [X] T023 [US1] Add error handling for "not in workspace" case in repos/arashi/src/commands/status.ts with exit code 2
- [X] T024 [US1] Add error handling for individual repo failures in checkRepoStatus() with continue-on-error logic
- [X] T025 [US1] Implement exit code logic in statusCommand() (0 for success, 1 for partial failures)

**Checkpoint**: At this point, User Story 1 should be fully functional - `arashi status` works with default output

---

## Phase 4: User Story 2 - View Detailed Status Information (Priority: P2)

**Goal**: Users can run `arashi status --verbose` to see full git status output for each repository

**Independent Test**: Run `arashi status --verbose` in a workspace and verify it shows complete git status output including staged/unstaged changes and branch tracking

### Tests for User Story 2

- [ ] T026 [P] [US2] Add integration test in repos/arashi/tests/integration/status.test.ts for --verbose mode showing full git output (acceptance scenario 1)
- [ ] T027 [P] [US2] Add integration test in repos/arashi/tests/integration/status.test.ts for --verbose mode showing ahead/behind tracking (acceptance scenario 2)
- [ ] T028 [P] [US2] Add integration test in repos/arashi/tests/integration/status.test.ts for --verbose mode showing staged and unstaged changes (acceptance scenario 3)

### Implementation for User Story 2

- [X] T029 [P] [US2] Add getFullGitStatus() function in repos/arashi/src/lib/git.ts to execute 'git status' (human-readable) for verbose mode
- [X] T030 [US2] Implement formatVerboseOutput() function in repos/arashi/src/commands/status.ts showing full git status per repo
- [X] T031 [US2] Add --verbose/-v option handling in statusCommand() in repos/arashi/src/commands/status.ts
- [X] T032 [US2] Update command registration in repos/arashi/src/index.ts to add .option('-v, --verbose', 'Show full git status output')

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - both `arashi status` and `arashi status --verbose` work

---

## Phase 5: User Story 3 - View Compact Status Summary (Priority: P3)

**Goal**: Users can run `arashi status --short` to see one-line summary per repository

**Independent Test**: Run `arashi status --short` and verify each repository is represented by exactly one line with indicators

### Tests for User Story 3

- [ ] T033 [P] [US3] Add integration test in repos/arashi/tests/integration/status.test.ts for --short mode with multiple repos (acceptance scenario 1)
- [ ] T034 [P] [US3] Add integration test in repos/arashi/tests/integration/status.test.ts for --short mode showing ahead/behind tracking (acceptance scenario 2)
- [ ] T035 [P] [US3] Add integration test in repos/arashi/tests/integration/status.test.ts for --short mode with all clean repos (acceptance scenario 3)

### Implementation for User Story 3

- [X] T036 [US3] Implement formatShortLine() helper in repos/arashi/src/commands/status.ts to format one-line repo status
- [X] T037 [US3] Implement formatShortOutput() function in repos/arashi/src/commands/status.ts using formatShortLine() for each repo
- [X] T038 [US3] Add --short/-s option handling in statusCommand() in repos/arashi/src/commands/status.ts
- [X] T039 [US3] Update command registration in repos/arashi/src/index.ts to add .option('-s, --short', 'Show one-line summary per repository')
- [X] T040 [US3] Add mutually exclusive validation in statusCommand() for --verbose and --short options with exit code 2

**Checkpoint**: All user stories should now be independently functional - default, --verbose, and --short modes all work

---

## Phase 6: Error Handling & Edge Cases

**Purpose**: Handle edge cases identified in spec.md edge cases section

- [ ] T041 [P] Add integration test in repos/arashi/tests/integration/status.test.ts for "not in workspace" error scenario
- [ ] T042 [P] Add integration test in repos/arashi/tests/integration/status.test.ts for missing repository path scenario
- [ ] T043 [P] Add integration test in repos/arashi/tests/integration/status.test.ts for git command failure scenario
- [ ] T044 [P] Add integration test in repos/arashi/tests/integration/status.test.ts for detached HEAD scenario
- [ ] T045 [P] Add integration test in repos/arashi/tests/integration/status.test.ts for no remote configured scenario
- [ ] T046 Add actionable error messages in repos/arashi/src/commands/status.ts for missing repos suggesting 'arashi remove'
- [ ] T047 Add actionable error messages in repos/arashi/src/commands/status.ts for git failures suggesting 'git fsck'
- [ ] T048 Handle detached HEAD display in formatRepoSection() showing "(detached HEAD)" instead of branch name
- [ ] T049 Handle no-remote case in formatRepoSection() by omitting tracking info rather than showing error

**Checkpoint**: All edge cases handled gracefully

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T050 [P] Add unit tests for formatDefaultOutput() in repos/arashi/tests/unit/status.test.ts
- [ ] T051 [P] Add unit tests for formatVerboseOutput() in repos/arashi/tests/unit/status.test.ts  
- [ ] T052 [P] Add unit tests for formatShortOutput() in repos/arashi/tests/unit/status.test.ts
- [ ] T053 [P] Add unit tests for helper functions (getStagedCount, getUntrackedCount, etc.) in repos/arashi/tests/unit/status.test.ts
- [X] T054 Run bun run lint and fix any TypeScript errors in repos/arashi/
- [X] T055 Run bun test and ensure all tests pass with >80% coverage
- [ ] T056 Manual testing with 10+ repositories to verify performance <3 seconds per spec SC-001
- [ ] T057 Manual testing on macOS, Linux, and Windows for cross-platform compatibility
- [ ] T058 Update repos/arashi/README.md with status command documentation and examples
- [ ] T059 Add status command to repos/arashi/README.md command reference section
- [ ] T060 Run quickstart.md validation - verify all code examples work as documented

**Checkpoint**: Feature complete, tested, and documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Error Handling (Phase 6)**: Depends on at least US1 completion (can overlap with US2/US3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Core parsing logic (in Foundational) before formatting
3. Formatting functions before main command integration
4. Command registration before manual testing
5. Story complete before moving to next priority

### Parallel Opportunities

**Within Foundational (Phase 2)**:
- T003 and T005 can run in parallel (different interfaces)

**Within User Story 1 Tests**:
- T010-T014 (unit tests) can all run in parallel
- T015-T017 (integration tests) can all run in parallel

**Within User Story 1 Implementation**:
- T018 and T019 can run in parallel (independent helper functions)

**User Stories 2 and 3**:
- US2 and US3 can be implemented in parallel by different developers after US1 is complete

**Within Polish Phase**:
- T050-T053 (unit tests) can all run in parallel
- T054-T057 (validation) can run in parallel after tests pass

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task: "Create repos/arashi/tests/unit/status.test.ts with test for parseGitStatus() handling clean repository output"
Task: "Add unit test for parseGitStatus() handling dirty repository with modified files"
Task: "Add unit test for parseGitStatus() handling untracked files"
Task: "Add unit test for parseBranchLine() handling various branch formats"
Task: "Add unit test for parseBranchLine() handling detached HEAD state"

# Launch all integration tests for User Story 1 together:
Task: "Create repos/arashi/tests/integration/status.test.ts with test for clean workspace scenario"
Task: "Add integration test for dirty workspace scenario"
Task: "Add integration test for workspace with main repo and sub-repos"

# Launch formatting helpers in parallel:
Task: "Implement formatRepoSection() helper in repos/arashi/src/commands/status.ts"
Task: "Implement formatSummary() helper in repos/arashi/src/commands/status.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T009) - CRITICAL
3. Complete Phase 3: User Story 1 (T010-T025)
4. **STOP and VALIDATE**: Test `arashi status` independently
5. Deploy/demo if ready - users can now see repository status at a glance!

**Estimated Time for MVP**: 4-6 hours (per quickstart.md)

### Incremental Delivery

1. Complete Setup + Foundational (2-3 hours) → Foundation ready
2. Add User Story 1 (2-3 hours) → Test independently → **Deploy/Demo MVP!**
   - Users can now: See all repo status with colors and summary
3. Add User Story 2 (1-2 hours) → Test independently → Deploy/Demo
   - Users can now: Use --verbose for detailed output
4. Add User Story 3 (1 hour) → Test independently → Deploy/Demo
   - Users can now: Use --short for compact output
5. Add Error Handling (1 hour) → Test edge cases → Deploy/Demo
6. Add Polish (2 hours) → Full test coverage → Final release

**Total Estimated Time**: 9-12 hours for complete feature

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (2-3 hours)
2. **Once Foundational is done:**
   - Developer A: User Story 1 (tests + implementation)
   - Developer B: User Story 2 (tests + implementation) - can start after US1 tests written
   - Developer C: User Story 3 (tests + implementation) - can start after US1 tests written
3. **Integration:**
   - Developer A reviews B and C's PRs
   - Run full test suite together
   - Complete Error Handling together
   - Complete Polish together

**Parallel Completion Time**: 5-7 hours (vs 9-12 sequential)

---

## Task Summary

- **Total Tasks**: 60
- **Setup Phase**: 2 tasks
- **Foundational Phase**: 7 tasks (BLOCKING)
- **User Story 1** (P1 - MVP): 16 tasks (8 tests + 8 implementation)
- **User Story 2** (P2): 7 tasks (3 tests + 4 implementation)
- **User Story 3** (P3): 8 tasks (3 tests + 5 implementation)
- **Error Handling**: 9 tasks (5 tests + 4 implementation)
- **Polish**: 11 tasks (4 tests + 7 validation/docs)

### Parallelizable Tasks

- **Foundational**: 2 tasks can run in parallel
- **US1 Tests**: 8 tasks can run in parallel
- **US1 Implementation**: 2 tasks can run in parallel
- **US2 Tests**: 3 tasks can run in parallel
- **US3 Tests**: 3 tasks can run in parallel
- **Error Tests**: 5 tasks can run in parallel
- **Polish Tests**: 4 tasks can run in parallel
- **Polish Validation**: 4 tasks can run in parallel

### Test Coverage

- **Unit Tests**: 13 tasks
- **Integration Tests**: 13 tasks
- **Total Test Tasks**: 26 out of 60 tasks (43%)
- **Coverage Target**: >80% per Constitution Principle VII

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `bun run lint` before committing to catch TypeScript errors
- Run `bun test` to ensure all tests pass
- Constitution Principle VII requires >80% test coverage - track with `bun test --coverage` if available

---

## Success Criteria Validation

Map tasks to success criteria from spec.md:

- **SC-001** (Performance <3s for 10 repos): T056 validates with manual testing
- **SC-002** (Visual indicators): T018-T020 implement color-coded output
- **SC-003** (Summary with clean/dirty counts): T019 implements formatSummary()
- **SC-004** (95% success with errors): T024, T041-T049 implement graceful error handling
- **SC-005** (Actionable error messages): T023, T046-T047 implement helpful error messages
- **SC-006** (Three output modes): T020 (default), T030 (verbose), T037 (short)

All success criteria addressed through tasks ✓
