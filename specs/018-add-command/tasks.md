# Tasks: Add Command

**Input**: Design documents from `/specs/018-add-command/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `repos/arashi/` (the implementation repository):
- Source: `src/`
- Tests: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and verify existing infrastructure for add command

- [X] T001 Verify existing project structure matches plan.md requirements
- [X] T002 [P] Verify commander CLI framework is configured in src/index.ts
- [X] T003 [P] Verify existing utility libraries (config.ts, git.ts, logger.ts, prompts.ts, filesystem.ts, errors.ts) are available

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Git Operations

- [X] T004 [P] Implement clone() function in src/lib/git.ts (wrap git clone command)
- [X] T005 [P] Implement getDefaultBranch() function in src/lib/git.ts (symbolic-ref → common names → fallback per RT-003)

### URL Validation & Parsing

- [X] T006 [P] Implement Git URL validation patterns in src/commands/add.ts (5 formats: HTTPS, SSH, Git, File, SCP per RT-001)
- [X] T007 [P] Implement deriveRepoName() function in src/commands/add.ts (extract last path segment per RT-002)
- [X] T008 [P] Implement parseGitUrl() function in src/commands/add.ts (returns GitUrlInfo per data-model.md)

### Setup Script Detection

- [X] T009 [P] Implement detectSetupScript() function in src/commands/add.ts (check 10 patterns per RT-004)

### Error Types

- [X] T010 [P] Add AddCommandError class to src/lib/errors.ts (5 error codes: INVALID_URL, DUPLICATE_NAME, CLONE_FAILED, BRANCH_DETECTION_FAILED, CONFIG_UPDATE_FAILED)

### TypeScript Interfaces

- [X] T011 [P] Define AddCommandOptions interface in src/commands/add.ts (gitUrl, name?, createSetup?, force?, json?)
- [X] T012 [P] Define AddCommandResult interface in src/commands/add.ts (repositoryName, clonePath, defaultBranch, setupScript, setupScriptCreated, gitUrl)
- [X] T013 [P] Define GitUrlInfo interface in src/commands/add.ts (url, protocol, host, owner, repository, derivedName)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Repository by Git URL (Priority: P1) 🎯 MVP

**Goal**: Enable developers to add a Git repository to the workspace by providing a URL, with auto-detection of repository name, default branch, and setup scripts

**Independent Test**: Run `arashi add https://github.com/user/repo.git` against a real repository and verify it clones to repos/, detects default branch, and updates config.json

### Implementation for User Story 1

- [X] T014 [US1] Create main add command handler function in src/commands/add.ts (register with commander CLI)
- [X] T015 [US1] Implement command-line argument parsing (git-url required, --name, --create-setup, --force, --json options)
- [X] T016 [US1] Implement input validation (validate Git URL format, validate custom name if provided)
- [X] T017 [US1] Implement workspace initialization check (verify .arashi/config.json exists)
- [X] T018 [US1] Implement repository name derivation (derive from URL or use custom --name)
- [X] T019 [US1] Implement duplicate name check (load config, check if name exists in discovered_repos)
- [X] T020 [US1] Implement repos directory creation (ensure workspace/repos/ exists with proper permissions)
- [X] T021 [US1] Implement clone operation with spinner (call git.clone() with ora spinner feedback)
- [X] T022 [US1] Implement default branch detection (call git.getDefaultBranch() after clone)
- [X] T023 [US1] Implement setup script detection (call detectSetupScript() on cloned repo)
- [X] T024 [US1] Implement configuration update (call config.addRepo() with metadata per data-model.md RepoConfig)
- [X] T025 [US1] Implement success message output (display repositoryName, clonePath, defaultBranch, setupScript per contracts)
- [X] T026 [US1] Implement JSON output mode (if --json, output AddCommandResult as JSON per contracts)
- [X] T027 [US1] Wire up add command in src/index.ts (register with commander: program.command('add'))

**Checkpoint**: At this point, User Story 1 should be fully functional - can add repos with auto-detection

---

## Phase 4: User Story 2 - Handle Repository with Setup Script (Priority: P2)

**Goal**: Enhance add command to detect existing setup scripts and optionally create setup.sh templates when requested

**Independent Test**: Add a repository with setup.sh and verify detection, then add a repo without setup script using --create-setup and verify template creation

### Implementation for User Story 2

- [X] T028 [P] [US2] Create setup.sh template content in src/commands/add.ts (placeholder script with common setup steps)
- [X] T029 [US2] Implement --create-setup flag handling (parse boolean option)
- [X] T030 [US2] Implement setup script creation logic (if --create-setup and no script detected, write template to repos/<name>/setup.sh)
- [X] T031 [US2] Update AddCommandResult to include setupScriptCreated field (track whether template was created)
- [X] T032 [US2] Enhance success message to show setup script guidance (if found: "run with cd <path> && ./<script>")
- [X] T033 [US2] Enhance JSON output to include setupScriptCreated flag

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Prevent Duplicate or Invalid Additions (Priority: P1)

**Goal**: Provide robust error handling for invalid URLs, duplicate names, clone failures, and configuration corruption prevention

**Independent Test**: Attempt to add duplicate repos, invalid URLs, and trigger clone failures to verify error messages and rollback

### Error Handling Implementation for User Story 3

- [X] T034 [P] [US3] Implement invalid URL error handling (catch validation failure, throw AddCommandError with INVALID_URL code)
- [X] T035 [P] [US3] Implement duplicate name error handling (catch duplicate check failure, throw AddCommandError with DUPLICATE_NAME code)
- [X] T036 [P] [US3] Implement configuration validation error handling (load and validate config before proceeding)
- [X] T037 [US3] Implement clone failure error handling (catch git.clone errors, throw AddCommandError with CLONE_FAILED code)
- [X] T038 [US3] Implement branch detection failure handling (catch getDefaultBranch errors, throw AddCommandError with BRANCH_DETECTION_FAILED code)
- [X] T039 [US3] Implement configuration update failure handling (catch config.addRepo errors, throw AddCommandError with CONFIG_UPDATE_FAILED code)

### Rollback Implementation for User Story 3

- [X] T040 [US3] Implement operation tracking (create operations array, track clone operation per RT-005)
- [X] T041 [US3] Implement rollback on error (try-catch wrapper, reverse operations on failure, remove cloned directory)
- [X] T042 [US3] Implement cleanup failure handling (catch filesystem errors during cleanup, warn user with manual instructions)
- [X] T043 [US3] Ensure atomic configuration updates (config only updated on full success, never on partial failure)

### User-Friendly Error Messages for User Story 3

- [X] T044 [P] [US3] Implement INVALID_URL error message (show supported formats with examples per contracts)
- [X] T045 [P] [US3] Implement DUPLICATE_NAME error message (suggest --name flag with example)
- [X] T046 [P] [US3] Implement CLONE_FAILED error message (include Git error, suggest auth/network checks)
- [X] T047 [P] [US3] Implement BRANCH_DETECTION_FAILED error message (suggest empty repo solutions)
- [X] T048 [P] [US3] Implement CONFIG_UPDATE_FAILED error message (provide manual recovery steps)

**Checkpoint**: All user stories should now be independently functional with complete error handling

---

## Phase 6: Integration Tests (Per FR-015 and SC-005: >80% coverage)

**Purpose**: Verify all user stories work correctly and independently

### Integration Tests for User Story 1

- [X] T049 [P] [US1] Create add.test.ts in tests/integration/ with test fixtures (temp workspace, test Git repo)
- [X] T050 [P] [US1] Test successful add with HTTPS URL (verify clone, config update, default branch detection)
- [X] T051 [P] [US1] Test successful add with SSH URL (verify SSH format parsing and clone)
- [X] T052 [P] [US1] Test successful add with custom --name flag (verify custom name used instead of derived)
- [X] T053 [P] [US1] Test success message output (verify all fields present: name, location, branch)
- [X] T054 [P] [US1] Test JSON output mode with --json flag (verify AddCommandResult JSON format)

### Integration Tests for User Story 2

- [X] T055 [P] [US2] Test setup script detection (add repo with setup.sh, verify detection and config entry)
- [X] T056 [P] [US2] Test setup script creation with --create-setup flag (verify template written and executable)
- [X] T057 [P] [US2] Test success message includes setup script guidance (verify "run with" message)

### Integration Tests for User Story 3

- [X] T058 [P] [US3] Test invalid URL error (verify error message and no config corruption)
- [X] T059 [P] [US3] Test duplicate name error (add repo twice, verify second fails with clear message)
- [X] T060 [P] [US3] Test clone failure rollback (simulate network error, verify cleanup and config unchanged)
- [X] T061 [P] [US3] Test branch detection on empty repo (verify clear error message)
- [X] T062 [P] [US3] Test configuration corruption prevention (simulate config error, verify rollback)

### Edge Case Tests

- [X] T063 [P] Test URL with trailing slashes (verify normalized correctly)
- [X] T064 [P] Test URL without .git suffix (verify handled correctly)
- [X] T065 [P] Test repository name with special characters (verify validation catches invalid names)
- [X] T066 [P] Test file:// URL format (verify local repo cloning)
- [X] T067 [P] Test SCP-style SSH URL (verify parsing and cloning)

**Checkpoint**: All integration tests pass, coverage >80% per SC-005

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T068 [P] Add JSDoc comments to all public functions in src/commands/add.ts
- [X] T069 [P] Add JSDoc comments to new git functions in src/lib/git.ts
- [X] T070 Run bun run lint and fix any TypeScript errors
- [X] T071 Run bun test and ensure all tests pass
- [X] T072 Run bun run build and verify command compiles successfully
- [ ] T073 [P] Verify quickstart.md examples work end-to-end (manual test all examples)
- [ ] T074 [P] Verify success criteria SC-001: operation completes <30s (benchmark test)
- [ ] T075 [P] Verify success criteria SC-002: 100% duplicate prevention (test evidence)
- [ ] T076 [P] Verify success criteria SC-004: config integrity (test all error paths)
- [ ] T077 Generate test coverage report (bun test --coverage, verify >80%)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (just verification)
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3, 4, 5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order: US3 (P1) → US1 (P1) → US2 (P2)
  - **Note**: US3 (error handling) should be integrated into US1 during development
- **Integration Tests (Phase 6)**: Depends on all user stories being complete
- **Polish (Phase 7)**: Depends on all tests passing

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 but independently testable
- **User Story 3 (P1)**: Should be integrated into US1 implementation (error handling is cross-cutting)

### Within Each User Story

- **US1**: T014 (command handler) → T015-T019 (input handling) → T020-T024 (core logic) → T025-T026 (output) → T027 (wire-up)
- **US2**: T028-T029 (setup flag) → T030-T031 (creation logic) → T032-T033 (output)
- **US3**: T034-T039 (error handlers) → T040-T043 (rollback) → T044-T048 (messages)

### Parallel Opportunities

- **Phase 2 (Foundational)**: T004-T013 all marked [P] can run in parallel (different functions/files)
- **Phase 3 (US1)**: No parallel tasks (sequential command flow)
- **Phase 4 (US2)**: T028 can run parallel with other tasks (separate concern)
- **Phase 5 (US3)**: T034-T039 and T044-T048 marked [P] can run in parallel (different error types)
- **Phase 6 (Tests)**: T049-T067 all marked [P] can run in parallel (independent test cases)
- **Phase 7 (Polish)**: T068-T069, T073-T077 marked [P] can run in parallel (different areas)

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational utilities together (Phase 2):
Task: "Implement clone() function in src/lib/git.ts"
Task: "Implement getDefaultBranch() function in src/lib/git.ts"
Task: "Implement Git URL validation patterns in src/commands/add.ts"
Task: "Implement deriveRepoName() function in src/commands/add.ts"
Task: "Implement parseGitUrl() function in src/commands/add.ts"
Task: "Implement detectSetupScript() function in src/commands/add.ts"
Task: "Add AddCommandError class to src/lib/errors.ts"
Task: "Define AddCommandOptions interface in src/commands/add.ts"
Task: "Define AddCommandResult interface in src/commands/add.ts"
Task: "Define GitUrlInfo interface in src/commands/add.ts"
```

## Parallel Example: Integration Tests

```bash
# Launch all tests together (Phase 6):
Task: "Test successful add with HTTPS URL"
Task: "Test successful add with SSH URL"
Task: "Test successful add with custom --name flag"
Task: "Test setup script detection"
Task: "Test invalid URL error"
Task: "Test duplicate name error"
Task: "Test clone failure rollback"
# ... (all test tasks)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 3)

1. **Phase 1: Setup** (verify existing infrastructure)
2. **Phase 2: Foundational** (implement all core utilities) ← CRITICAL
3. **Phase 3: User Story 1** (basic add with auto-detection) ← MVP CORE
4. **Phase 5: User Story 3** (integrate error handling into US1) ← MVP ESSENTIAL
5. **STOP and VALIDATE**: Test MVP independently with real repositories
6. Demo/deploy MVP if ready

**Why combine US1 + US3?**: Error handling (US3) is essential for production use, not a separate feature. MVP must handle errors gracefully.

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 + US3 → Test → Deploy (core add functionality with error handling)
2. **Enhancement**: Add US2 → Test → Deploy (setup script detection/creation)
3. **Polish**: Integration tests + coverage → Validate → Final release

### Parallel Team Strategy

With 2+ developers:

1. **Together**: Complete Setup + Foundational (Phase 1-2)
2. **Once Foundational is done**:
   - Developer A: User Story 1 (core implementation)
   - Developer B: User Story 3 (error handling) → merge into US1
3. **After MVP**:
   - Developer A or B: User Story 2 (setup scripts)
   - Other: Integration tests (Phase 6)

---

## Task Summary

| Phase | Task Count | Parallelizable | Critical Path |
|-------|------------|----------------|---------------|
| Phase 1: Setup | 3 | 2 (67%) | Non-blocking verification |
| Phase 2: Foundational | 10 | 10 (100%) | ⚠️ BLOCKS ALL STORIES |
| Phase 3: User Story 1 (P1) | 14 | 0 | MVP Core |
| Phase 4: User Story 2 (P2) | 6 | 1 (17%) | Enhancement |
| Phase 5: User Story 3 (P1) | 15 | 7 (47%) | MVP Essential |
| Phase 6: Integration Tests | 19 | 19 (100%) | Validation |
| Phase 7: Polish | 10 | 7 (70%) | Final QA |
| **Total** | **77 tasks** | **46 (60%)** | |

### Suggested MVP Scope

**Minimum Viable Product (MVP)**:
- Phase 1: Setup (3 tasks)
- Phase 2: Foundational (10 tasks) ← MUST COMPLETE
- Phase 3: User Story 1 (14 tasks) ← Core functionality
- Phase 5: User Story 3 (15 tasks) ← Error handling
- Select Phase 6 tests: T049-T054, T058-T062 (11 tests)
- Phase 7: T070-T072, T077 (4 tasks)

**MVP Total**: ~57 tasks to functional, production-ready add command

**Post-MVP Enhancements**:
- Phase 4: User Story 2 (setup script features)
- Remaining integration tests (edge cases)
- Polish tasks (documentation, benchmarks)

---

## Notes

- [P] tasks = different files/functions, no dependencies
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Important**: User Story 3 (error handling) should be integrated into US1 during implementation, not built separately
- Existing code from config.ts, logger.ts, prompts.ts, filesystem.ts should be reused where possible
- All Git operations must use Bun.spawn (per project conventions)
