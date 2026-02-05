# Tasks: Init Command

**Input**: Design documents from `/specs/001-init-command/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks ARE included (required by Constitution Principle VII: >80% test coverage)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `repos/arashi/src/`, `repos/arashi/tests/` (per plan.md)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and command structure

- [ ] T001 Create command file structure at repos/arashi/src/commands/init.ts
- [ ] T002 Create test directory structure at repos/arashi/tests/unit/commands/ and repos/arashi/tests/integration/
- [ ] T003 [P] Define InitOptions interface in repos/arashi/src/commands/init.ts
- [ ] T004 [P] Define InitResult interface in repos/arashi/src/commands/init.ts
- [ ] T005 [P] Define InitError and InitErrorCode enums in repos/arashi/src/commands/init.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and helper functions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Implement git repository validation function using git.exec(['rev-parse', '--git-dir']) in repos/arashi/src/commands/init.ts
- [ ] T007 [P] Implement rollback operation tracking system (InitOperation interface) in repos/arashi/src/commands/init.ts
- [ ] T008 [P] Implement .gitignore update helper with exact match checking in repos/arashi/src/commands/init.ts
- [ ] T009 [P] Create hook template content generator (3 templates: pre-create, post-create, setup) in repos/arashi/src/commands/init.ts
- [ ] T010 Implement rollback function that reverses operations in LIFO order in repos/arashi/src/commands/init.ts
- [ ] T011 [P] Create unit tests for .gitignore logic in repos/arashi/tests/unit/lib/gitignore.test.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - First-Time Setup (Priority: P1) 🎯 MVP

**Goal**: Enable developers to initialize Arashi workspace with directory structure, configuration, repository discovery, and hook templates

**Independent Test**: Run init in a new git repository and verify workspace structure, config file, discovered repos, and hook templates are all created correctly

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T012 [P] [US1] Write integration test for basic init flow (empty repos dir) in repos/arashi/tests/integration/init.test.ts
- [ ] T013 [P] [US1] Write integration test for init with existing repositories in repos/arashi/tests/integration/init.test.ts
- [ ] T014 [P] [US1] Write integration test for init with custom repos-dir option in repos/arashi/tests/integration/init.test.ts
- [ ] T015 [P] [US1] Write unit test for config generation with defaults in repos/arashi/tests/unit/commands/init.test.ts
- [ ] T016 [P] [US1] Write unit test for hook template creation in repos/arashi/tests/unit/commands/init.test.ts

### Implementation for User Story 1

- [ ] T017 [US1] Implement main executeInit function skeleton with option parsing in repos/arashi/src/commands/init.ts
- [ ] T018 [US1] Implement git repository validation step (FR-001) in repos/arashi/src/commands/init.ts
- [ ] T019 [US1] Implement .arashi directory creation (FR-002) with operation tracking in repos/arashi/src/commands/init.ts
- [ ] T020 [US1] Implement config.json generation using generateDefaultConfig() from lib/config.ts (FR-003) in repos/arashi/src/commands/init.ts
- [ ] T021 [US1] Implement repos directory creation (FR-004) with operation tracking in repos/arashi/src/commands/init.ts
- [ ] T022 [US1] Implement hooks directory and template file creation (FR-007) in repos/arashi/src/commands/init.ts
- [ ] T023 [US1] Integrate repository discovery using discoverRepositories() from core/repository.ts (FR-006) in repos/arashi/src/commands/init.ts
- [ ] T024 [US1] Update config with discovered repositories and persist using saveConfig() in repos/arashi/src/commands/init.ts
- [ ] T025 [US1] Implement success message display with discovered repo count (FR-008) in repos/arashi/src/commands/init.ts
- [ ] T026 [US1] Add progress spinners for long operations (directory creation, discovery) in repos/arashi/src/commands/init.ts
- [ ] T027 [US1] Register init command with commander in repos/arashi/src/index.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - basic init workflow works end-to-end

---

## Phase 4: User Story 2 - Automatic Workspace Protection (Priority: P2)

**Goal**: Automatically add managed repositories directory to .gitignore to prevent accidental commits

**Independent Test**: Run init in a repository and verify .gitignore is updated with repos directory entry, then run again to verify idempotency (no duplicate)

### Tests for User Story 2

- [ ] T028 [P] [US2] Write integration test for .gitignore creation when file doesn't exist in repos/arashi/tests/integration/init.test.ts
- [ ] T029 [P] [US2] Write integration test for .gitignore append when file exists in repos/arashi/tests/integration/init.test.ts
- [ ] T030 [P] [US2] Write integration test for idempotency (duplicate prevention) in repos/arashi/tests/integration/init.test.ts
- [ ] T031 [P] [US2] Write unit test for .gitignore exact match checking in repos/arashi/tests/unit/lib/gitignore.test.ts
- [ ] T032 [P] [US2] Write unit test for .gitignore formatting (newlines, comments) in repos/arashi/tests/unit/lib/gitignore.test.ts

### Implementation for User Story 2

- [ ] T033 [US2] Implement .gitignore update logic with exact match check (FR-005, FR-011) in repos/arashi/src/commands/init.ts
- [ ] T034 [US2] Add operation tracking for .gitignore updates (save original content) in repos/arashi/src/commands/init.ts
- [ ] T035 [US2] Update success message to show .gitignore update status in repos/arashi/src/commands/init.ts
- [ ] T036 [US2] Handle edge case: .gitignore doesn't exist (create new file) in repos/arashi/src/commands/init.ts
- [ ] T037 [US2] Handle edge case: .gitignore exists without trailing newline in repos/arashi/src/commands/init.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - init protects workspace with .gitignore

---

## Phase 5: User Story 3 - Error Prevention (Priority: P1)

**Goal**: Provide clear error messages for invalid scenarios (not in git repo, config exists, filesystem errors)

**Independent Test**: Attempt init in various invalid scenarios and verify appropriate error messages with correct exit codes

### Tests for User Story 3

- [ ] T038 [P] [US3] Write integration test for init in non-git directory (exit code 1) in repos/arashi/tests/integration/init.test.ts
- [ ] T039 [P] [US3] Write integration test for init when config already exists (exit code 2) in repos/arashi/tests/integration/init.test.ts
- [ ] T040 [P] [US3] Write integration test for init with --force flag (backup behavior) in repos/arashi/tests/integration/init.test.ts
- [ ] T041 [P] [US3] Write integration test for rollback on filesystem error in repos/arashi/tests/integration/init.test.ts
- [ ] T042 [P] [US3] Write unit test for error code mapping in repos/arashi/tests/unit/commands/init.test.ts

### Implementation for User Story 3

- [ ] T043 [US3] Implement config existence check with clear error message (FR-009, FR-010) in repos/arashi/src/commands/init.ts
- [ ] T044 [US3] Implement --force option with config backup logic in repos/arashi/src/commands/init.ts
- [ ] T045 [US3] Add comprehensive error handling with InitErrorCode mapping in repos/arashi/src/commands/init.ts
- [ ] T046 [US3] Implement permission error detection and messaging in repos/arashi/src/commands/init.ts
- [ ] T047 [US3] Implement disk full error detection and messaging in repos/arashi/src/commands/init.ts
- [ ] T048 [US3] Implement invalid path validation with error messaging in repos/arashi/src/commands/init.ts
- [ ] T049 [US3] Add error message formatting with guidance (multi-line, context) in repos/arashi/src/commands/init.ts
- [ ] T050 [US3] Wire up rollback function to error handler in repos/arashi/src/commands/init.ts
- [ ] T051 [US3] Add rollback progress display ("Rolling back changes...") in repos/arashi/src/commands/init.ts

**Checkpoint**: All core user stories should now be independently functional - init handles all error cases gracefully

---

## Phase 6: Additional Features & Options

**Purpose**: Optional flags and advanced features

- [ ] T052 [P] Implement --no-discover option to skip repository discovery in repos/arashi/src/commands/init.ts
- [ ] T053 [P] Implement --auto-setup option to control config.auto_setup field in repos/arashi/src/commands/init.ts
- [ ] T054 [P] Write integration test for --no-discover flag in repos/arashi/tests/integration/init.test.ts
- [ ] T055 [P] Write integration test for --auto-setup option in repos/arashi/tests/integration/init.test.ts
- [ ] T056 Add command help text and option descriptions in repos/arashi/src/commands/init.ts

---

## Phase 7: Edge Cases & Hardening

**Purpose**: Handle special scenarios and improve robustness

- [ ] T057 [P] Handle repos directory path with spaces and special characters in repos/arashi/src/commands/init.ts
- [ ] T058 [P] Handle permission errors during .arashi directory creation in repos/arashi/src/commands/init.ts
- [ ] T059 [P] Handle corrupted/invalid repositories during discovery (non-fatal) in repos/arashi/src/commands/init.ts
- [ ] T060 [P] Handle partial hook template creation failure in repos/arashi/src/commands/init.ts
- [ ] T061 [P] Write integration test for path with spaces in repos/arashi/tests/integration/init.test.ts
- [ ] T062 [P] Write integration test for permission errors in repos/arashi/tests/integration/init.test.ts
- [ ] T063 Add duration tracking and display in success message in repos/arashi/src/commands/init.ts

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect overall init command quality

- [ ] T064 [P] Add JSDoc comments to all public functions in repos/arashi/src/commands/init.ts
- [ ] T065 [P] Add type exports for InitOptions, InitResult in repos/arashi/src/commands/init.ts
- [ ] T066 Verify Constitution Principle VII compliance (>80% test coverage) for init command
- [ ] T067 [P] Add example usage to command help text in repos/arashi/src/commands/init.ts
- [ ] T068 Run full integration test suite and fix any failures
- [ ] T069 Manual testing: Run quickstart.md examples and verify all scenarios work
- [ ] T070 Code cleanup: Extract helper functions for readability in repos/arashi/src/commands/init.ts
- [ ] T071 Performance check: Verify init completes in under 30 seconds (SC-001)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User Story 1 (P1): First-Time Setup - Core functionality
  - User Story 2 (P2): Workspace Protection - Depends on US1 for init flow integration
  - User Story 3 (P1): Error Prevention - Depends on US1 for error handling integration
- **Additional Features (Phase 6)**: Depends on User Story 1 completion
- **Edge Cases (Phase 7)**: Depends on all user stories being complete
- **Polish (Phase 8)**: Depends on all previous phases

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Should start after US1 complete - Integrates with init flow established in US1
- **User Story 3 (P1)**: Should start after US1 complete - Adds error handling to init flow from US1

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Helper functions before main implementation
- Core operations before integration
- Error handling after happy path
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003, T004, T005 can run in parallel (interface definitions)

**Phase 2 (Foundational)**:
- T007, T008, T009, T011 can run in parallel (different helpers/tests)

**Phase 3 (US1 Tests)**:
- T012, T013, T014, T015, T016 can all run in parallel (independent test files)

**Phase 4 (US2 Tests)**:
- T028, T029, T030, T031, T032 can all run in parallel

**Phase 5 (US3 Tests)**:
- T038, T039, T040, T041, T042 can all run in parallel

**Phase 6 (Additional Features)**:
- T052, T053, T054, T055 can run in parallel (independent options)

**Phase 7 (Edge Cases)**:
- T057, T058, T059, T060, T061, T062 can run in parallel (independent edge cases)

**Phase 8 (Polish)**:
- T064, T065, T067 can run in parallel (documentation tasks)

---

## Parallel Example: User Story 1 Tests

```bash
# Launch all tests for User Story 1 together:
Task: "Write integration test for basic init flow in repos/arashi/tests/integration/init.test.ts"
Task: "Write integration test for init with existing repositories in repos/arashi/tests/integration/init.test.ts"
Task: "Write integration test for init with custom repos-dir option in repos/arashi/tests/integration/init.test.ts"
Task: "Write unit test for config generation in repos/arashi/tests/unit/commands/init.test.ts"
Task: "Write unit test for hook template creation in repos/arashi/tests/unit/commands/init.test.ts"
```

## Parallel Example: Foundational Helpers

```bash
# Launch all foundational helpers together (after T006 completes):
Task: "Implement rollback operation tracking system in repos/arashi/src/commands/init.ts"
Task: "Implement .gitignore update helper in repos/arashi/src/commands/init.ts"
Task: "Create hook template content generator in repos/arashi/src/commands/init.ts"
Task: "Create unit tests for .gitignore logic in repos/arashi/tests/unit/lib/gitignore.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005) - ~30 minutes
2. Complete Phase 2: Foundational (T006-T011) - ~2 hours ⚠️ CRITICAL
3. Complete Phase 3: User Story 1 (T012-T027) - ~2.5 hours
4. **STOP and VALIDATE**: Run integration tests, verify init works end-to-end
5. Deploy/demo if ready - developers can now use `arashi init`

**Estimated MVP Time**: ~5 hours

### Incremental Delivery

1. **Foundation Ready** (Phase 1 + 2): Init command structure and helpers exist
2. **MVP - User Story 1** (Phase 3): Basic init works - workspace creation, config, discovery
   - Independently testable: Run init in empty git repo, verify structure
   - Deliverable value: Developers can initialize Arashi
3. **Add User Story 2** (Phase 4): .gitignore protection added
   - Independently testable: Verify .gitignore updated, check idempotency
   - Deliverable value: Workspace automatically protected from accidental commits
4. **Add User Story 3** (Phase 5): Error handling complete
   - Independently testable: Test all error scenarios, verify clear messages
   - Deliverable value: Robust error handling with helpful guidance
5. **Feature Complete** (Phase 6-8): Options, edge cases, polish
   - Final testing and hardening
   - Production-ready command

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. Once Foundational is done:
   - **Developer A**: User Story 1 (Phase 3) - Core init flow
   - **Developer B**: User Story 2 (Phase 4) - .gitignore protection
   - **Developer C**: Write additional test cases for edge scenarios
3. After US1 complete:
   - **Developer A**: User Story 3 (Phase 5) - Error handling integration
   - **Developer B**: Additional Features (Phase 6) - Options and flags
   - **Developer C**: Edge Cases (Phase 7) - Robustness
4. All converge on Polish (Phase 8)

**Note**: US2 and US3 should ideally wait for US1 to establish the init flow, but test writing can happen in parallel.

---

## Testing Strategy

### Test Coverage Requirements

Per Constitution Principle VII, must achieve >80% code coverage with meaningful tests.

**Coverage Breakdown**:
- **Unit Tests** (~40% of coverage):
  - Config generation logic (T015, T016)
  - .gitignore update logic (T011, T031, T032)
  - Hook template generation (T016)
  - Error code mapping (T042)
  - Path validation

- **Integration Tests** (~60% of coverage):
  - End-to-end init flows (T012-T014, T028-T030, T038-T041)
  - Rollback behavior (T041)
  - Option combinations (T054, T055)
  - Edge cases (T061, T062)

**Test Execution Order**:
1. Write all tests FIRST (tests should FAIL initially)
2. Implement features to make tests pass
3. Verify tests now pass
4. Check coverage meets >80% threshold (T066)

### Independent Testing per User Story

- **US1 Independent Test**: 
  ```bash
  cd /tmp/test-repo && git init
  arashi init
  # Verify: .arashi/ exists, config.json correct, repos/ created, hooks templates present
  ```

- **US2 Independent Test**:
  ```bash
  cd /tmp/test-repo && git init
  arashi init
  # Verify: .gitignore contains repos/ entry
  arashi init --force
  # Verify: No duplicate entry in .gitignore
  ```

- **US3 Independent Test**:
  ```bash
  cd /tmp/not-a-git-repo
  arashi init
  # Verify: Error "Not a git repository" with exit code 1
  cd /tmp/test-repo && git init && arashi init
  arashi init
  # Verify: Error "Configuration already exists" with exit code 2
  ```

---

## Exit Codes Reference

Tasks must implement these exit codes per contracts/command-interface.md:

| Code | Constant | Scenario | Tasks |
|------|----------|----------|-------|
| 0 | SUCCESS | Successful initialization | All US1, US2 tasks |
| 1 | NOT_GIT_REPOSITORY | Not in git repository | T018, T043, T045 |
| 2 | CONFIG_EXISTS | Config already exists | T043, T044 |
| 3 | PERMISSION_DENIED | Insufficient permissions | T046, T058 |
| 4 | DISK_FULL | Insufficient disk space | T047 |
| 5 | INVALID_PATH | Invalid repos-dir path | T048, T057 |
| 6 | CONFIG_WRITE_FAILED | Config write failure | T020, T045 |
| 7 | DISCOVERY_FAILED | Discovery failure | T023, T059 |
| 99 | UNKNOWN | Unexpected error | T045 |

---

## Notes

- [P] tasks = different files, no dependencies (can run in parallel)
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution Principle III (Rollback) is critical - test thoroughly (T041, T050)
- Constitution Principle X (Performance) requires <30s init time (T071)

## Summary

**Total Tasks**: 71  
**Task Count by User Story**:
- Setup: 5 tasks
- Foundational: 6 tasks
- User Story 1 (P1): 16 tasks (5 tests + 11 implementation)
- User Story 2 (P2): 10 tasks (5 tests + 5 implementation)
- User Story 3 (P1): 13 tasks (5 tests + 8 implementation)
- Additional Features: 5 tasks
- Edge Cases: 7 tasks
- Polish: 8 tasks

**MVP Scope** (Suggested): Phases 1-3 only (User Story 1) = 27 tasks (~5 hours)

**Parallel Opportunities**: 34 tasks marked [P] can run concurrently with proper staffing

**Independent Test Criteria**:
- ✅ US1: Run init, verify workspace structure and config created
- ✅ US2: Run init, verify .gitignore updated without duplicates
- ✅ US3: Run init in invalid scenarios, verify error messages and exit codes
