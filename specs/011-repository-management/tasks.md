# Tasks: Repository Management

**Input**: Design documents from `/specs/011-repository-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Test tasks are included based on Constitution Principle VII requiring >80% coverage.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **arashi project**: `repos/arashi/src/`, `repos/arashi/tests/` (single executable project)
- Core repository management in `src/core/repository.ts`
- Dependencies from `src/lib/` (git, filesystem, logger, config)
- Tests in `tests/unit/core/` and `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify dependencies and create test infrastructure

- [X] T001 Verify dependency modules exist: repos/arashi/src/lib/git.ts, filesystem.ts, logger.ts, config.ts
- [X] T002 [P] Create test fixtures directory repos/arashi/tests/fixtures/test-repos/
- [X] T003 [P] Create test helper script repos/arashi/tests/helpers/create-test-repos.ts for generating test git repositories
- [X] T004 [P] Create test fixture repos: main-repo (default: main), master-repo (default: master), develop-repo (default: develop)
- [X] T005 [P] Create test fixture repos: with-setup-repo (has setup.sh), no-remote-repo (no remote configured)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and error classes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Define ErrorCode enum in repos/arashi/src/core/repository.ts: PERMISSION_DENIED, NOT_A_DIRECTORY, INVALID_GIT_REPO, SYMLINK_LOOP, IO_ERROR
- [X] T007 [P] Define Repository interface in repos/arashi/src/core/repository.ts
- [X] T008 [P] Define DiscoveryOptions interface in repos/arashi/src/core/repository.ts
- [X] T009 [P] Define DiscoveryError interface in repos/arashi/src/core/repository.ts
- [X] T010 [P] Define RepositoryDiscoveryResult interface in repos/arashi/src/core/repository.ts
- [X] T011 Define error classes in repos/arashi/src/core/repository.ts: RepositoryError, RepositoryNotFoundError, RepositoryInvalidError, RepositoryCloneError, RepositoryMetadataError

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Discover Repositories in Workspace Directory (Priority: P1) 🎯 MVP Foundation

**Goal**: Implement repository discovery that scans workspace directory for git repositories

**Independent Test**: Create directory with multiple subdirectories (some git repos, some not), run discovery, verify all and only valid git repositories are identified

**Note**: US1 is implemented first because it's the foundation - US2 depends on discovered repositories

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T012 [P] [US1] Unit test for discoverRepositories() with multiple repositories in repos/arashi/tests/unit/core/repository.test.ts
- [X] T013 [P] [US1] Unit test for discoverRepositories() with non-repository directories (should skip) in repos/arashi/tests/unit/core/repository.test.ts
- [X] T014 [P] [US1] Unit test for discoverRepositories() respecting maxDepth option in repos/arashi/tests/unit/core/repository.test.ts
- [X] T015 [P] [US1] Unit test for discoverRepositories() stopping at repository boundaries in repos/arashi/tests/unit/core/repository.test.ts
- [X] T016 [P] [US1] Unit test for discoverRepositories() with excludePatterns option in repos/arashi/tests/unit/core/repository.test.ts
- [X] T017 [P] [US1] Unit test for discoverRepositories() handling permission errors gracefully in repos/arashi/tests/unit/core/repository.test.ts
- [X] T018 [P] [US1] Unit test for discoverRepositories() reporting scannedDirectories count in repos/arashi/tests/unit/core/repository.test.ts

### Implementation for User Story 1

- [X] T019 [US1] Create discoverRepositories() function skeleton in repos/arashi/src/core/repository.ts
- [X] T020 [US1] Implement recursive scanDirectory() helper function in repos/arashi/src/core/repository.ts
- [X] T021 [US1] Implement .git directory detection in scanDirectory()
- [X] T022 [US1] Implement early termination when .git found (don't descend into repo subdirectories)
- [X] T023 [US1] Implement maxDepth limit in scanDirectory()
- [X] T024 [US1] Implement excludePatterns filtering in scanDirectory()
- [X] T025 [US1] Implement error collection for non-fatal errors (permissions, invalid dirs)
- [X] T026 [US1] Implement createRepositoryInfo() helper to build Repository objects
- [X] T027 [US1] Add progress spinner for discovery using logger utilities
- [X] T028 [US1] Return RepositoryDiscoveryResult with repositories, errors, and metrics

**Checkpoint**: At this point, User Story 1 is complete - repository discovery works and returns list of found repositories

---

## Phase 4: User Story 2 - Detect Default Branch for Each Repository (Priority: P1) 🎯 MVP

**Goal**: Implement default branch detection for discovered repositories

**Independent Test**: Create test repositories with different default branches (main, master, develop), run detection, verify correct default branch identified for each

### Tests for User Story 2

- [X] T029 [P] [US2] Unit test for detectDefaultBranch() with 'main' as default in repos/arashi/tests/unit/core/repository.test.ts
- [X] T030 [P] [US2] Unit test for detectDefaultBranch() with 'master' as default in repos/arashi/tests/unit/core/repository.test.ts
- [X] T031 [P] [US2] Unit test for detectDefaultBranch() with 'develop' as default in repos/arashi/tests/unit/core/repository.test.ts
- [X] T032 [P] [US2] Unit test for detectDefaultBranch() with repository in detached HEAD state in repos/arashi/tests/unit/core/repository.test.ts
- [X] T033 [P] [US2] Unit test for detectDefaultBranch() with repository without remote in repos/arashi/tests/unit/core/repository.test.ts
- [X] T034 [P] [US2] Unit test for detectDefaultBranch() fallback to common branch names in repos/arashi/tests/unit/core/repository.test.ts

### Implementation for User Story 2

- [X] T035 [US2] Create detectDefaultBranch() function in repos/arashi/src/core/repository.ts
- [X] T036 [US2] Implement primary method: git symbolic-ref refs/remotes/origin/HEAD
- [X] T037 [US2] Implement fallback 1: Check common branch names (main, master, develop, trunk)
- [X] T038 [US2] Implement fallback 2: Get current branch from HEAD
- [X] T039 [US2] Add error handling and throw RepositoryInvalidError if no default branch found
- [X] T040 [US2] Integrate detectDefaultBranch() into createRepositoryInfo() in discoverRepositories()
- [X] T041 [US2] Add warning logging when default branch detection fails

**Checkpoint**: At this point, User Story 2 is complete - MVP is functional (discovery + default branch detection)

---

## Phase 5: MVP Integration & Testing

**Purpose**: Ensure US1 + US2 work together correctly

- [X] T042 [P] Integration test: Discover multiple repos with different default branches in repos/arashi/tests/integration/repository-integration.test.ts
- [X] T043 [P] Integration test: Discover repos and verify all have valid default branches in repos/arashi/tests/integration/repository-integration.test.ts
- [X] T044 [P] Integration test: Discovery with real test fixture repositories in repos/arashi/tests/integration/repository-integration.test.ts
- [X] T045 [P] Performance test: Discover 50 mock repositories in under 5 seconds in repos/arashi/tests/integration/repository-integration.test.ts

---

## Phase 6: User Story 3 - Detect Setup Scripts in Repositories (Priority: P2)

**Goal**: Implement setup script detection for repositories

**Independent Test**: Create repositories with and without setup.sh files, run detection, verify repositories with scripts are flagged appropriately

### Tests for User Story 3

- [X] T046 [P] [US3] Unit test for detectSetupScript() with setup.sh present in repos/arashi/tests/unit/core/repository.test.ts
- [X] T047 [P] [US3] Unit test for detectSetupScript() with no setup script in repos/arashi/tests/unit/core/repository.test.ts
- [X] T048 [P] [US3] Unit test for detectSetupScript() with multiple script patterns in repos/arashi/tests/unit/core/repository.test.ts
- [X] T049 [P] [US3] Unit test for detectSetupScript() with custom patterns from config in repos/arashi/tests/unit/core/repository.test.ts

### Implementation for User Story 3

- [X] T050 [US3] Create detectSetupScript() function in repos/arashi/src/core/repository.ts
- [X] T051 [US3] Implement file existence check for setup.sh in repository root
- [X] T052 [US3] Support configurable script patterns (setup.sh, setup.bash, .arashi/setup.sh)
- [X] T053 [US3] Read script patterns from configuration using config utilities
- [X] T054 [US3] Return object with hasSetupScript flag and setupScriptPath
- [X] T055 [US3] Integrate detectSetupScript() into createRepositoryInfo()

**Note**: Added integration test in tests/integration/repository-integration.test.ts that verifies setup script detection across multiple repository types.

**Checkpoint**: User Story 3 complete - setup script detection works

---

## Phase 7: User Story 5 - Validate Repository Structure Against Configuration (Priority: P2)

**Goal**: Implement workspace validation to compare expected vs actual repositories

**Independent Test**: Create configuration listing 5 repositories where only 3 exist on disk, run validation, verify 2 missing repositories are identified

### Tests for User Story 5

- [X] T056 [P] [US5] Define WorkspaceConfiguration interface in repos/arashi/src/core/repository.ts
- [X] T057 [P] [US5] Define RepositoryConfig interface in repos/arashi/src/core/repository.ts
- [X] T058 [P] [US5] Define ValidationResult interface in repos/arashi/src/core/repository.ts
- [X] T059 [P] [US5] Define ValidationOptions interface in repos/arashi/src/core/repository.ts
- [X] T060 [P] [US5] Unit test for validateWorkspace() with all repos present in repos/arashi/tests/unit/core/repository.test.ts
- [X] T061 [P] [US5] Unit test for validateWorkspace() with missing repos in repos/arashi/tests/unit/core/repository.test.ts
- [X] T062 [P] [US5] Unit test for validateWorkspace() with extra repos in repos/arashi/tests/unit/core/repository.test.ts
- [X] T063 [P] [US5] Unit test for validateWorkspace() reporting missing repo details in repos/arashi/tests/unit/core/repository.test.ts

### Implementation for User Story 5

- [X] T064 [US5] Create validateWorkspace() function in repos/arashi/src/core/repository.ts
- [X] T065 [US5] Run discoverRepositories() to get actual repositories
- [X] T066 [US5] Parse WorkspaceConfiguration to get expected repositories
- [X] T067 [US5] Implement set-based comparison (present, missing, extra)
- [X] T068 [US5] Build ValidationResult with categorized repositories
- [X] T069 [US5] Implement isValid flag logic (true if no missing and no errors)

**Checkpoint**: User Story 5 complete - workspace validation works

---

## Phase 8: User Story 4 - Clone Missing Repositories from Git URLs (Priority: P2)

**Goal**: Implement repository cloning with progress reporting

**Independent Test**: Provide Git URL and target path, run clone, verify repository successfully cloned to specified location

### Tests for User Story 4

- [X] T070 [P] [US4] Define CloneOperation interface in repos/arashi/src/core/repository.ts
- [X] T071 [P] [US4] Define CloneStatus enum in repos/arashi/src/core/repository.ts
- [X] T072 [P] [US4] Define CloneProgress interface in repos/arashi/src/core/repository.ts
- [X] T073 [P] [US4] Define ClonePhase enum in repos/arashi/src/core/repository.ts
- [X] T074 [P] [US4] Define CloneError interface in repos/arashi/src/core/repository.ts
- [X] T075 [P] [US4] Define CloneErrorCode enum in repos/arashi/src/core/repository.ts
- [X] T076 [P] [US4] Define CloneOptions interface in repos/arashi/src/core/repository.ts
- [X] T077 [P] [US4] Unit test for cloneRepository() successful clone in repos/arashi/tests/unit/core/repository.test.ts
- [X] T078 [P] [US4] Unit test for cloneRepository() with target already exists error in repos/arashi/tests/unit/core/repository.ts
- [X] T079 [P] [US4] Unit test for cloneRepository() with invalid URL error in repos/arashi/tests/unit/core/repository.test.ts
- [X] T080 [P] [US4] Unit test for cloneRepository() with progress callbacks in repos/arashi/tests/unit/core/repository.test.ts
- [X] T081 [P] [US4] Integration test for cloneRepository() with real Git URL in repos/arashi/tests/integration/repository-integration.test.ts

### Implementation for User Story 4

- [X] T082 [US4] Create cloneRepository() function in repos/arashi/src/core/repository.ts
- [X] T083 [US4] Implement pre-flight check: verify target path doesn't exist
- [X] T084 [US4] Create CloneOperation object with unique ID and PENDING status
- [X] T085 [US4] Execute git clone command using git utilities spawn
- [X] T086 [US4] Implement progress parsing from git clone stderr output
- [X] T087 [US4] Update CloneProgress during clone (phase, objects, deltas, bytes)
- [X] T088 [US4] Call onProgress callback if provided in options
- [X] T089 [US4] Handle clone success: verify .git directory, update status to COMPLETED
- [X] T090 [US4] Handle clone failure: categorize error, cleanup partial clone, update status to FAILED
- [X] T091 [US4] Support CloneOptions: depth (shallow clone), branch (specific branch), timeout

**Note**: T092 (Add newly cloned repository to discovery results) was skipped as it's not required for the cloning feature itself - discovery and cloning are separate operations.

**Checkpoint**: User Story 4 complete - repository cloning works with progress

---

## Phase 9: User Story 6 - Gather Repository Metadata (Priority: P3)

**Goal**: Implement comprehensive metadata gathering for repositories

**Independent Test**: Run metadata gathering on repository, verify returned information includes current branch, remotes, and other relevant details

### Tests for User Story 6

- [ ] T093 [P] [US6] Define RepositoryMetadata interface in repos/arashi/src/core/repository.ts
- [ ] T094 [P] [US6] Define MetadataOptions interface in repos/arashi/src/core/repository.ts
- [ ] T095 [P] [US6] Define CommitInfo interface in repos/arashi/src/core/repository.ts
- [ ] T096 [P] [US6] Define RepositoryStatus interface in repos/arashi/src/core/repository.ts
- [ ] T097 [P] [US6] Define Remote interface and RemoteType enum in repos/arashi/src/core/repository.ts
- [ ] T098 [P] [US6] Unit test for getRepositoryMetadata() with full options in repos/arashi/tests/unit/core/repository.test.ts
- [ ] T099 [P] [US6] Unit test for getRepositoryMetadata() with selective options in repos/arashi/tests/unit/core/repository.test.ts
- [ ] T100 [P] [US6] Unit test for gathering current branch in repos/arashi/tests/unit/core/repository.test.ts
- [ ] T101 [P] [US6] Unit test for gathering local and remote branches in repos/arashi/tests/unit/core/repository.test.ts
- [ ] T102 [P] [US6] Unit test for gathering last commit info in repos/arashi/tests/unit/core/repository.test.ts
- [ ] T103 [P] [US6] Unit test for gathering working tree status in repos/arashi/tests/unit/core/repository.test.ts
- [ ] T104 [P] [US6] Unit test for gathering remotes in repos/arashi/tests/unit/core/repository.test.ts

### Implementation for User Story 6

- [ ] T105 [US6] Create getRepositoryMetadata() function in repos/arashi/src/core/repository.ts
- [ ] T106 [US6] Implement basic metadata gathering (always included): path, default branch, setup script, remote URL
- [ ] T107 [US6] Implement optional metadata gathering based on MetadataOptions
- [ ] T108 [US6] Implement getCurrentBranch() helper: git rev-parse --abbrev-ref HEAD
- [ ] T109 [US6] Implement getLocalBranches() helper: git branch --format='%(refname:short)'
- [ ] T110 [US6] Implement getRemoteBranches() helper: git branch -r --format='%(refname:short)'
- [ ] T111 [US6] Implement getLastCommit() helper: git log -1 with format options
- [ ] T112 [US6] Implement getRepositoryStatus() helper: git status --porcelain and git rev-list --count
- [ ] T113 [US6] Implement getRemotes() helper: git remote -v
- [ ] T114 [US6] Implement getStashCount() helper: git stash list
- [ ] T115 [US6] Implement getTags() helper: git tag
- [ ] T116 [US6] Assemble RepositoryMetadata object with all gathered information
- [ ] T117 [US6] Add error handling with RepositoryMetadataError
- [ ] T118 [US6] Implement metadata caching with TTL (5 minutes) for performance

**Checkpoint**: User Story 6 complete - comprehensive metadata gathering works

---

## Phase 10: Helper Functions & Utilities

**Purpose**: Implement supporting functions used across user stories

- [ ] T119 [P] Create getRepositoryInfo() function for quick repository lookup in repos/arashi/src/core/repository.ts
- [ ] T120 [P] Implement path normalization helper for comparing repository paths in repos/arashi/src/core/repository.ts
- [ ] T121 [P] Implement git URL validation helper in repos/arashi/src/core/repository.ts
- [ ] T122 [P] Implement error classification helper (map errors to ErrorCode) in repos/arashi/src/core/repository.ts

---

## Phase 11: Documentation & Examples

**Purpose**: Add code documentation and usage examples

- [ ] T123 [P] Add JSDoc comments to all public functions in repos/arashi/src/core/repository.ts
- [ ] T124 [P] Add JSDoc comments to all interfaces and types in repos/arashi/src/core/repository.ts
- [ ] T125 [P] Add usage examples in function JSDoc comments in repos/arashi/src/core/repository.ts
- [ ] T126 [P] Update README.md with repository management API documentation

---

## Task Summary

**Total Tasks**: 126
**Parallelizable Tasks**: 89 (marked with [P])
**User Story Breakdown**:
- US1 (Discover Repositories): 17 tasks
- US2 (Detect Default Branch): 13 tasks
- US3 (Detect Setup Scripts): 10 tasks
- US4 (Clone Repositories): 21 tasks
- US5 (Validate Workspace): 14 tasks
- US6 (Gather Metadata): 24 tasks
- Setup & Foundation: 11 tasks
- MVP Integration: 4 tasks
- Helpers & Docs: 12 tasks

---

## MVP Scope (Recommended Start)

**Focus on US1 + US2 first** (30 tasks total: T001-T041 + T042-T045)

These provide the core functionality needed by other features:
- Repository discovery (US1)
- Default branch detection (US2)
- MVP integration tests

**Estimated effort**: 1-2 days

---

## Dependency Graph

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundation) ← BLOCKING
  ↓
Phase 3 (US1) → Phase 4 (US2) → Phase 5 (MVP Tests)
  ↓                ↓
Phase 6 (US3)     Phase 7 (US5)
  ↓                ↓
Phase 8 (US4)     Phase 9 (US6)
  ↓                ↓
Phase 10 (Helpers) → Phase 11 (Docs)
```

**Parallel Opportunities**:
- After Phase 2: US1 tests can be written while foundation is being implemented
- After Phase 5: US3, US4, US5, US6 can be developed in parallel (independent)
- Within each user story: Test writing and helper function development can parallelize

---

## Testing Requirements

**Minimum Coverage**: 80% (per Constitution VII)

**Test Distribution**:
- Unit tests: 70 test cases (US1: 7, US2: 6, US3: 4, US4: 4, US5: 4, US6: 10, Helpers: 4)
- Integration tests: 5 test cases (discovery, cloning, validation)
- Performance tests: 1 test case (discovery speed)

**Test Approach**:
- Write tests FIRST for each user story (fail before implementation)
- Use test fixtures for realistic git repository scenarios
- Mock git commands for unit tests, use real repos for integration tests
- Test error paths and edge cases thoroughly

---

## Performance Targets

- **SC-001**: Repository discovery completes scanning 50 repositories in < 5 seconds
- **SC-002**: Default branch detection < 100ms per repository
- **SC-004**: Clone operations complete for typical repos (< 100MB) in < 30 seconds
- **SC-005**: Workspace validation completes for 20 repositories in < 2 seconds

**Verification**: Include performance benchmarks in Phase 5 MVP integration tests

---

## Notes

- All file paths are relative to project root (repos/arashi/)
- Tests should be written BEFORE implementation (TDD approach)
- Each user story can be independently tested and verified
- MVP (US1 + US2) provides foundation for worktree orchestration feature
- US4 (cloning) is most complex - save for after MVP is stable
- US6 (metadata) is optional enhancement - low priority
