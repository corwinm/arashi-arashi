# Tasks: Filesystem Utilities

**Input**: Design documents from `/specs/005-filesystem-utilities/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included - SC-005 requires >90% test coverage

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Paths assume single project structure per plan.md:
- Source: `repos/arashi/src/lib/filesystem.ts`
- Tests: `repos/arashi/tests/unit/filesystem.test.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Bun configuration

- [ ] T001 Setup Bun project configuration for repos/arashi/src/lib/filesystem.ts
- [ ] T002 [P] Configure TypeScript for filesystem module
- [ ] T003 [P] Setup test directory structure at repos/arashi/tests/unit/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core error types and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define FilesystemError base class in repos/arashi/src/lib/filesystem.ts
- [ ] T005 [P] Define PermissionError subclass in repos/arashi/src/lib/filesystem.ts
- [ ] T006 [P] Define NotFoundError subclass in repos/arashi/src/lib/filesystem.ts
- [ ] T007 [P] Define DiskFullError subclass in repos/arashi/src/lib/filesystem.ts
- [ ] T008 [P] Define InvalidPathError subclass in repos/arashi/src/lib/filesystem.ts
- [ ] T009 Setup temporary directory utilities for tests in repos/arashi/tests/unit/filesystem.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Safe Directory Operations (Priority: P1) 🎯 MVP

**Goal**: Implement ensureDir() function with recursive creation and error handling

**Independent Test**: Call ensureDir() with various paths, verify directories created recursively, verify idempotent behavior, verify permission errors

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test: ensureDir() creates directory and parents in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T011 [P] [US1] Unit test: ensureDir() succeeds if directory exists (idempotent) in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T012 [P] [US1] Unit test: ensureDir() throws PermissionError on insufficient permissions in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T013 [P] [US1] Unit test: ensureDir() handles absolute and relative paths in repos/arashi/tests/unit/filesystem.test.ts

### Implementation for User Story 1

- [ ] T014 [US1] Implement ensureDir(path) using Bun's mkdir with recursive option in repos/arashi/src/lib/filesystem.ts
- [ ] T015 [US1] Add error handling with descriptive messages in repos/arashi/src/lib/filesystem.ts
- [ ] T016 [US1] Export ensureDir function from repos/arashi/src/lib/filesystem.ts

**Checkpoint**: At this point, User Story 1 should be fully functional - safe directory creation working

---

## Phase 4: User Story 2 - File Existence and Permission Checks (Priority: P1)

**Goal**: Implement fileExists() and isExecutable() functions with cross-platform support

**Independent Test**: Call functions with various paths, verify existence checks work, verify executable detection works on Unix and Windows

### Tests for User Story 2

- [ ] T017 [P] [US2] Unit test: fileExists() returns true for existing file in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T018 [P] [US2] Unit test: fileExists() returns false for non-existent file in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T019 [P] [US2] Unit test: fileExists() returns true for directories in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T020 [P] [US2] Unit test: isExecutable() returns true for executable file in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T021 [P] [US2] Unit test: isExecutable() returns false for non-executable in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T022 [P] [US2] Unit test: isExecutable() handles Windows file extensions in repos/arashi/tests/unit/filesystem.test.ts

### Implementation for User Story 2

- [ ] T023 [P] [US2] Implement fileExists(path) using Bun's exists API in repos/arashi/src/lib/filesystem.ts
- [ ] T024 [P] [US2] Implement isExecutable(path) with cross-platform logic in repos/arashi/src/lib/filesystem.ts
- [ ] T025 [US2] Export fileExists and isExecutable functions from repos/arashi/src/lib/filesystem.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - directory ops and file checks functional

---

## Phase 5: User Story 3 - Worktree Path Calculation (Priority: P1)

**Goal**: Implement getWorktreePath() function with bare/non-bare repository support

**Independent Test**: Call getWorktreePath() with different repo types, verify correct path computation for bare/non-bare/custom paths

### Tests for User Story 3

- [ ] T026 [P] [US3] Unit test: getWorktreePath() computes path for bare repo in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T027 [P] [US3] Unit test: getWorktreePath() computes path for non-bare repo in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T028 [P] [US3] Unit test: getWorktreePath() uses custom path when provided in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T029 [P] [US3] Unit test: getWorktreePath() throws InvalidPathError for invalid repo path in repos/arashi/tests/unit/filesystem.test.ts

### Implementation for User Story 3

- [ ] T030 [US3] Implement getWorktreePath(repoPath, branch, isBare, customPath) in repos/arashi/src/lib/filesystem.ts
- [ ] T031 [US3] Add path validation logic in repos/arashi/src/lib/filesystem.ts
- [ ] T032 [US3] Export getWorktreePath function from repos/arashi/src/lib/filesystem.ts

**Checkpoint**: All P1 core functions complete - directory ops, checks, and worktree path calculation ready

---

## Phase 6: User Story 4 - File Operations (Priority: P2)

**Goal**: Implement copyFile(), readTextFile(), writeTextFile() with UTF-8 encoding and permission handling

**Independent Test**: Test file reading/writing/copying, verify UTF-8 encoding, verify permissions preserved, verify error handling

### Tests for User Story 4

- [ ] T033 [P] [US4] Unit test: copyFile() copies file with permissions in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T034 [P] [US4] Unit test: copyFile() throws NotFoundError for missing source in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T035 [P] [US4] Unit test: readTextFile() returns UTF-8 content in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T036 [P] [US4] Unit test: readTextFile() throws NotFoundError for missing file in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T037 [P] [US4] Unit test: writeTextFile() writes UTF-8 content in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T038 [P] [US4] Unit test: writeTextFile() creates parent directories in repos/arashi/tests/unit/filesystem.test.ts

### Implementation for User Story 4

- [ ] T039 [P] [US4] Implement copyFile(src, dest) using Bun's copyFile API in repos/arashi/src/lib/filesystem.ts
- [ ] T040 [P] [US4] Implement readTextFile(path) using Bun.file().text() in repos/arashi/src/lib/filesystem.ts
- [ ] T041 [P] [US4] Implement writeTextFile(path, content) using Bun.write() in repos/arashi/src/lib/filesystem.ts
- [ ] T042 [US4] Export copyFile, readTextFile, writeTextFile functions from repos/arashi/src/lib/filesystem.ts

**Checkpoint**: User Story 4 complete - file I/O operations functional alongside existing directory functions

---

## Phase 7: User Story 5 - Directory Cleanup (Priority: P3)

**Goal**: Implement removeDir() function with recursive removal and idempotent behavior

**Independent Test**: Test directory removal with contents, verify recursive deletion, verify idempotent behavior (no error if doesn't exist)

### Tests for User Story 5

- [ ] T043 [P] [US5] Unit test: removeDir() removes directory and contents recursively in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T044 [P] [US5] Unit test: removeDir() succeeds if directory doesn't exist (idempotent) in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T045 [P] [US5] Unit test: removeDir() throws PermissionError on insufficient permissions in repos/arashi/tests/unit/filesystem.test.ts

### Implementation for User Story 5

- [ ] T046 [US5] Implement removeDir(path) using Bun's rm with recursive/force options in repos/arashi/src/lib/filesystem.ts
- [ ] T047 [US5] Add error handling for permission failures in repos/arashi/src/lib/filesystem.ts
- [ ] T048 [US5] Export removeDir function from repos/arashi/src/lib/filesystem.ts

**Checkpoint**: All user stories complete - full filesystem utilities library functionality available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, performance, cross-platform validation, and documentation

- [ ] T049 [P] Test edge case: Paths with spaces and special characters in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T050 [P] Test edge case: Symbolic links handling in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T051 [P] Test edge case: Max path length handling in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T052 [P] Test edge case: Disk space exhaustion during write in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T053 [P] Verify operations meet SC-001 (<100ms) performance target in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T054 [P] Verify handling 1000+ files meets SC-002 requirement in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T055 [P] Verify all errors include path and operation (SC-003) in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T056 [P] Test cross-platform compatibility on Windows in repos/arashi/tests/unit/filesystem.test.ts
- [ ] T057 [P] Verify test coverage meets SC-005 (>90%) requirement
- [ ] T058 [P] Add JSDoc comments to all exported functions in repos/arashi/src/lib/filesystem.ts
- [ ] T059 Validate against quickstart.md examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - P1 stories (US1, US2, US3) should complete before P2/P3 stories (US4, US5)
  - Within same priority, can proceed in parallel
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Independent of US1
- **User Story 3 (P1)**: Can start after Foundational - Independent of US1/US2
- **User Story 4 (P2)**: Can start after Foundational - Independent of other stories (may use ensureDir internally)
- **User Story 5 (P3)**: Can start after Foundational - Independent of other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Implementation tasks within story can often run in parallel [P]
- Tests within a story can run in parallel [P]
- Story complete before moving to next priority

### Parallel Opportunities

- Setup tasks (T001-T003) can all run in parallel
- Foundational error classes (T005-T008) can run in parallel
- Once Foundational completes:
  - US1 tests (T010-T013) can run in parallel
  - US2 tests (T017-T022) can run in parallel
  - US2 implementations (T023-T024) can run in parallel
  - US3 tests (T026-T029) can run in parallel
  - US4 tests (T033-T038) can run in parallel
  - US4 implementations (T039-T041) can run in parallel
  - US5 tests (T043-T045) can run in parallel
- Polish tasks (T049-T058) can mostly run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Unit test: fileExists() returns true for existing file"
Task: "Unit test: fileExists() returns false for non-existent file"
Task: "Unit test: fileExists() returns true for directories"
Task: "Unit test: isExecutable() returns true for executable file"
Task: "Unit test: isExecutable() returns false for non-executable"
Task: "Unit test: isExecutable() handles Windows file extensions"

# Launch both implementations for User Story 2 together:
Task: "Implement fileExists(path) using Bun's exists API"
Task: "Implement isExecutable(path) with cross-platform logic"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (safe directory operations)
4. Complete Phase 4: User Story 2 (file checks)
5. Complete Phase 5: User Story 3 (worktree path calculation)
6. **STOP and VALIDATE**: Test P1 stories independently - MVP ready!

**MVP Deliverable**: Core filesystem utilities with directory ops, file checks, and worktree path support

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Directory operations working
3. Add US2 → Test independently → File checks working
4. Add US3 → Test independently → Worktree paths working (MVP complete!)
5. Add US4 → Test independently → File I/O operations added
6. Add US5 → Test independently → Directory cleanup added (Full feature complete!)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
   - Developer E: User Story 5
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different functions or test cases, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail (red) before implementing (green)
- SC-005 requires >90% test coverage - all functions must be tested
- Use Bun's built-in APIs exclusively (no external dependencies)
- All paths handled with Bun's path utilities for cross-platform support
- Error classes provide descriptive context (operation, path, code)
- Commit after each logical task group
- Stop at any checkpoint to validate story independently
