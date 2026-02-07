# Tasks: Configuration Management

**Input**: Design documents from `/specs/006-config-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Complete unit and integration test coverage required per SC-005 (>80% coverage)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md, this is a single library project:
- Implementation: `src/lib/config.ts`
- Unit tests: `tests/unit/config.test.ts`
- Integration tests: `tests/integration/config-integration.test.ts`
- Test fixtures: `tests/fixtures/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create directory structure: src/lib/, tests/unit/, tests/integration/, tests/fixtures/
- [ ] T002 Initialize TypeScript configuration for Bun runtime in tsconfig.json
- [ ] T003 [P] Create test fixtures directory and plan fixture files per research.md testing strategy

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript interfaces and error classes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Define TypeScript interfaces in src/lib/config.ts: Config, RepoConfig, WorktreeInfo, HookConfig (per contracts/config-api.ts)
- [ ] T005 [P] Implement ConfigError base class in src/lib/config.ts (per contracts/config-api.ts lines 79-101)
- [ ] T006 [P] Implement ConfigNotFoundError class in src/lib/config.ts (per contracts/config-api.ts lines 106-115)
- [ ] T007 [P] Implement ConfigParseError class in src/lib/config.ts (per contracts/config-api.ts lines 120-129)
- [ ] T008 [P] Implement ConfigValidationError class in src/lib/config.ts (per contracts/config-api.ts lines 134-143)

**Checkpoint**: Foundation ready - type system and error handling established

---

## Phase 3: User Story 1 - Initialize Configuration (Priority: P1) 🎯 MVP

**Goal**: Enable developers to create a default configuration file for first-time setup

**Independent Test**: Run config initialization and verify `.arashi/config.json` is created with default values (version: "1.0.0", repos_dir: "./repos", auto_setup: true, discovered_repos: {})

### Implementation for User Story 1

- [ ] T009 [P] [US1] Implement getConfigPath() function in src/lib/config.ts (per contracts/config-api.ts lines 234)
- [ ] T010 [P] [US1] Implement generateDefaultConfig() function in src/lib/config.ts (per contracts/config-api.ts lines 297, research.md section 5)
- [ ] T011 [P] [US1] Implement configExists() function in src/lib/config.ts (per contracts/config-api.ts lines 249)
- [ ] T012 [US1] Implement saveConfig() function in src/lib/config.ts with directory creation (per contracts/config-api.ts lines 183, research.md section 6)

### Tests for User Story 1

- [ ] T013 [P] [US1] Unit test for getConfigPath() constructs correct path in tests/unit/config.test.ts
- [ ] T014 [P] [US1] Unit test for generateDefaultConfig() returns correct structure in tests/unit/config.test.ts
- [ ] T015 [P] [US1] Unit test for configExists() in tests/unit/config.test.ts
- [ ] T016 [US1] Integration test for saveConfig() writes pretty-printed JSON in tests/integration/config-integration.test.ts
- [ ] T017 [US1] Integration test for saveConfig() creates directory if missing in tests/integration/config-integration.test.ts
- [ ] T018 [US1] Integration test for saveConfig() handles permission errors in tests/integration/config-integration.test.ts
- [ ] T019 [US1] Create test fixture: tests/fixtures/valid-config.json (complete valid configuration)

**Checkpoint**: At this point, User Story 1 should be fully functional - can initialize config and save to filesystem

---

## Phase 4: User Story 2 - Load and Validate Configuration (Priority: P1)

**Goal**: Enable developers to load configuration reliably with clear error messages for problems

**Independent Test**: Create various config files (valid, invalid, missing, malformed) and verify system loads valid configs and provides specific error messages for problems

### Implementation for User Story 2

- [ ] T020 [US2] Implement validateConfig() function in src/lib/config.ts (per contracts/config-api.ts lines 278, research.md section 4)
- [ ] T021 [US2] Add validation for Config root fields (version, repos_dir, auto_setup, discovered_repos) in validateConfig()
- [ ] T022 [US2] Add validation for RepoConfig fields (path required, optional fields type-checked) in validateConfig()
- [ ] T023 [US2] Add validation for nested WorktreeInfo and HookConfig structures in validateConfig()
- [ ] T024 [US2] Implement loadConfig() function in src/lib/config.ts (per contracts/config-api.ts lines 164, research.md section 2)

### Tests for User Story 2

- [ ] T025 [P] [US2] Unit test for validateConfig() accepts valid configuration in tests/unit/config.test.ts
- [ ] T026 [P] [US2] Unit test for validateConfig() catches missing version field in tests/unit/config.test.ts
- [ ] T027 [P] [US2] Unit test for validateConfig() catches missing repos_dir field in tests/unit/config.test.ts
- [ ] T028 [P] [US2] Unit test for validateConfig() catches missing auto_setup field in tests/unit/config.test.ts
- [ ] T029 [P] [US2] Unit test for validateConfig() catches missing discovered_repos field in tests/unit/config.test.ts
- [ ] T030 [P] [US2] Unit test for validateConfig() catches invalid field types in tests/unit/config.test.ts
- [ ] T031 [P] [US2] Unit test for validateConfig() preserves unknown fields (forward compatibility) in tests/unit/config.test.ts
- [ ] T032 [P] [US2] Unit test for validateConfig() catches invalid RepoConfig (missing path) in tests/unit/config.test.ts
- [ ] T033 [US2] Integration test for loadConfig() reads valid file in tests/integration/config-integration.test.ts
- [ ] T034 [US2] Integration test for loadConfig() throws ConfigNotFoundError on missing file in tests/integration/config-integration.test.ts
- [ ] T035 [US2] Integration test for loadConfig() throws ConfigParseError on malformed JSON in tests/integration/config-integration.test.ts
- [ ] T036 [US2] Integration test for loadConfig() throws ConfigValidationError on invalid config in tests/integration/config-integration.test.ts
- [ ] T037 [P] [US2] Create test fixture: tests/fixtures/invalid-json.json (malformed JSON syntax error)
- [ ] T038 [P] [US2] Create test fixture: tests/fixtures/missing-version.json (missing required field)
- [ ] T039 [P] [US2] Create test fixture: tests/fixtures/missing-repos-dir.json (missing required field)
- [ ] T040 [P] [US2] Create test fixture: tests/fixtures/extra-fields.json (forward compatibility test)
- [ ] T041 [US2] Integration test for round-trip: saveConfig + loadConfig preserves data in tests/integration/config-integration.test.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - can initialize, save, load, and validate config

---

## Phase 5: User Story 3 - Manage Repository List (Priority: P2)

**Goal**: Enable developers to add and remove repositories from configuration

**Independent Test**: Add repositories to configuration, verify they appear in discovered_repos, remove repositories, and confirm deletion

### Implementation for User Story 3

- [ ] T042 [US3] Implement addRepo() function in src/lib/config.ts (per contracts/config-api.ts lines 202, research.md section 6)
- [ ] T043 [US3] Add duplicate name check in addRepo() - throw error if repo name exists (per research.md question 1)
- [ ] T044 [US3] Implement removeRepo() function in src/lib/config.ts (per contracts/config-api.ts lines 220, research.md section 6)
- [ ] T045 [US3] Make removeRepo() idempotent - succeed silently if repo doesn't exist (per research.md question 2)

### Tests for User Story 3

- [ ] T046 [P] [US3] Integration test for addRepo() adds to discovered_repos in tests/integration/config-integration.test.ts
- [ ] T047 [P] [US3] Integration test for addRepo() throws error on duplicate name in tests/integration/config-integration.test.ts
- [ ] T048 [P] [US3] Integration test for removeRepo() removes from discovered_repos in tests/integration/config-integration.test.ts
- [ ] T049 [P] [US3] Integration test for removeRepo() succeeds silently for non-existent repo in tests/integration/config-integration.test.ts

**Checkpoint**: All three user stories (US1, US2, US3) should now be independently functional

---

## Phase 6: User Story 4 - Persist Configuration Changes (Priority: P2)

**Goal**: Ensure configuration changes are saved in human-readable format for review and manual editing

**Independent Test**: Make programmatic changes, verify file is written with proper JSON formatting (indentation, line breaks), confirm file can be re-loaded

**Note**: Core saveConfig() functionality was implemented in US1 (T012). This phase adds remaining persistence features.

### Implementation for User Story 4

- [ ] T050 [US4] Add pretty-print validation to saveConfig() - ensure 2-space indentation in src/lib/config.ts
- [ ] T051 [US4] Add filesystem error handling to saveConfig() - catch and wrap disk full, permission errors in src/lib/config.ts

### Tests for User Story 4

- [ ] T052 [P] [US4] Integration test for saveConfig() preserves JSON readability (human-readable formatting) in tests/integration/config-integration.test.ts
- [ ] T053 [P] [US4] Integration test for saveConfig() handles write errors with clear messages in tests/integration/config-integration.test.ts
- [ ] T054 [US4] Integration test for round-trip with modifications: load → modify → save → load verifies persistence in tests/integration/config-integration.test.ts

**Checkpoint**: All four user stories should now be complete and independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T055 [P] Add JSDoc comments to all exported functions in src/lib/config.ts (per contracts/config-api.ts examples)
- [ ] T056 [P] Verify error messages are actionable per SC-003 (include specific details about failures)
- [ ] T057 [P] Add edge case tests from spec.md: large config files (100 repos), unknown fields preservation
- [ ] T058 [P] Performance test: verify config loading < 100ms for 100 repos (SC-002)
- [ ] T059 [P] Performance test: verify config initialization < 5s (SC-001)
- [ ] T060 Run test suite and verify >80% code coverage (SC-005)
- [ ] T061 Cross-platform path testing: verify getConfigPath() works on Windows, macOS, Linux
- [ ] T062 Manual validation: follow quickstart.md implementation guide to verify completeness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1) can start first - no dependencies on other stories
  - US2 (P1) can start after US1 T012 (saveConfig) but can run in parallel with US1 tests
  - US3 (P2) depends on US2 T024 (loadConfig) and US1 T012 (saveConfig)
  - US4 (P2) extends US1 T012 (saveConfig) - minimal dependencies
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (P1)**: Can start after US1 T012 (saveConfig) - Depends on ability to save config for testing
- **US3 (P2)**: Depends on US2 T024 (loadConfig) and US1 T012 (saveConfig) - Uses load → modify → save pattern
- **US4 (P2)**: Extends US1 T012 (saveConfig) - Minimal dependencies, mostly testing existing functionality

### Within Each User Story

- Implementation tasks before test tasks (so there's something to test)
- Test fixtures can be created in parallel with implementation
- All tests for a story can run in parallel once implementation is complete
- Unit tests don't depend on integration tests and vice versa

### Parallel Opportunities

**Phase 1 (Setup)**: All 3 tasks can run in parallel

**Phase 2 (Foundational)**: T005-T008 (error classes) can run in parallel after T004 (interfaces)

**Phase 3 (US1)**:
- T009, T010, T011 can run in parallel (different functions)
- T013, T014, T015, T019 can run in parallel (different test files/fixtures)
- T016, T017, T018 can run in parallel (different test scenarios)

**Phase 4 (US2)**:
- T025-T032 (unit tests) can run in parallel
- T037-T040 (test fixtures) can run in parallel
- T033-T036 (integration tests) can run in parallel

**Phase 5 (US3)**:
- T046-T049 (all tests) can run in parallel after implementation

**Phase 6 (US4)**:
- T052-T053 (tests) can run in parallel

**Phase 7 (Polish)**: T055-T059, T061 can run in parallel

---

## Parallel Example: User Story 1 (Initialize Configuration)

```bash
# Step 1: Launch all implementation tasks in parallel
Task T009: "Implement getConfigPath() in src/lib/config.ts"
Task T010: "Implement generateDefaultConfig() in src/lib/config.ts"
Task T011: "Implement configExists() in src/lib/config.ts"

# Step 2: After T009-T011 complete, launch T012 (depends on previous functions)
Task T012: "Implement saveConfig() in src/lib/config.ts"

# Step 3: After T012 completes, launch ALL tests in parallel
Task T013: "Unit test for getConfigPath()"
Task T014: "Unit test for generateDefaultConfig()"
Task T015: "Unit test for configExists()"
Task T016: "Integration test for saveConfig() writes JSON"
Task T017: "Integration test for saveConfig() creates directory"
Task T018: "Integration test for saveConfig() handles errors"
Task T019: "Create test fixture: valid-config.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008) - CRITICAL
3. Complete Phase 3: User Story 1 (T009-T019)
4. **STOP and VALIDATE**: Test US1 independently - can initialize and save config
5. Demo capability: "arashi can now create default configuration files"

### Incremental Delivery (Recommended)

1. **Sprint 1**: Setup + Foundational → Foundation ready
2. **Sprint 2**: Add US1 → Test independently → **MVP READY** (can initialize config)
3. **Sprint 3**: Add US2 → Test independently → **v0.2.0** (can load and validate config)
4. **Sprint 4**: Add US3 → Test independently → **v0.3.0** (can manage repository list)
5. **Sprint 5**: Add US4 → Test independently → **v0.4.0** (persistence features complete)
6. **Sprint 6**: Polish → **v1.0.0** (production-ready configuration management)

Each sprint delivers independently testable functionality that builds on previous work.

### Parallel Team Strategy

With 2 developers:

1. Both complete Setup + Foundational together (T001-T008)
2. Once Foundational is done:
   - **Developer A**: US1 (T009-T019) - Initialize configuration
   - **Developer B**: US2 (T020-T041) - Load and validate (starts after T012)
3. After US1 and US2 complete:
   - **Developer A**: US3 (T042-T049) - Manage repository list
   - **Developer B**: US4 (T050-T054) - Persist configuration
4. Both: Polish (T055-T062)

---

## Notes

### Task Format Validation
- All tasks follow format: `- [ ] [ID] [P?] [Story?] Description with file path`
- Task IDs: T001-T062 (sequential)
- [P] markers: 37 parallelizable tasks identified
- [Story] labels: US1 (11 tasks), US2 (22 tasks), US3 (8 tasks), US4 (6 tasks)
- File paths: All tasks include specific file paths

### Coverage Summary
- **Total tasks**: 62
- **Setup**: 3 tasks
- **Foundational**: 5 tasks (CRITICAL - blocks everything)
- **US1 (P1)**: 11 tasks (4 implementation, 7 tests)
- **US2 (P1)**: 22 tasks (5 implementation, 17 tests)
- **US3 (P2)**: 8 tasks (4 implementation, 4 tests)
- **US4 (P2)**: 6 tasks (2 implementation, 4 tests)
- **Polish**: 8 tasks

### Test Coverage
- **Unit tests**: 13 tasks (getConfigPath, generateDefaultConfig, configExists, validateConfig variations)
- **Integration tests**: 18 tasks (saveConfig, loadConfig, addRepo, removeRepo, error handling, round-trips)
- **Test fixtures**: 6 files (valid, invalid JSON, missing fields, extra fields)
- **Performance tests**: 2 tasks (SC-001, SC-002)
- **Coverage target**: >80% per SC-005

### Key Decisions from Research
- Duplicate repo names → throw error (T043)
- Remove non-existent repo → succeed silently (T045)
- File I/O → synchronous for reliability
- JSON formatting → 2-space indentation
- Forward compatibility → preserve unknown fields (tested in T031)

### Verification Checklist
- ✅ All tasks have checkboxes `- [ ]`
- ✅ All tasks have sequential IDs (T001-T062)
- ✅ Parallelizable tasks marked with [P] (37 total)
- ✅ User story tasks marked with [US1], [US2], [US3], [US4]
- ✅ All tasks include file paths
- ✅ Each user story has independent test criteria
- ✅ Dependencies clearly documented
- ✅ MVP scope defined (US1 only)
- ✅ Parallel execution examples provided
