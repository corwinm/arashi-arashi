# Tasks: GitHub Actions CI Workflow

**Input**: Design documents from `/specs/001-ci-workflow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test implementation tasks included - this is infrastructure configuration

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This feature creates CI workflow configuration in the arashi repository:
- **Workflow file**: `repos/arashi/.github/workflows/ci.yml`
- **Documentation**: `specs/001-ci-workflow/` (already created)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and prepare for workflow implementation

- [x] T001 Create `.github/workflows/` directory in repos/arashi/
- [x] T002 [P] Verify existing package.json scripts (lint, test, build:mac, build:linux, build:windows) exist in repos/arashi/package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational prerequisites required - workflow file is self-contained

**Note**: This CI workflow has no blocking prerequisites. Each user story can be implemented independently as separate jobs within the workflow file.

---

## Phase 3: User Story 1 - Automated Code Quality Checks (Priority: P1) 🎯 MVP

**Goal**: Implement lint job that runs TypeScript type checking on PRs and pushes to main

**Independent Test**: Push a commit with TypeScript errors, verify CI fails with lint error details, fix the error, verify CI passes

### Implementation for User Story 1

- [x] T003 [US1] Create initial ci.yml workflow file with name and basic trigger configuration (pull_request, push to main) in repos/arashi/.github/workflows/ci.yml
- [x] T004 [US1] Add lint job definition with ubuntu-latest runner and 5-minute timeout in repos/arashi/.github/workflows/ci.yml
- [x] T005 [US1] Add lint job steps: checkout code (actions/checkout@v4) in repos/arashi/.github/workflows/ci.yml
- [x] T006 [US1] Add lint job steps: setup Bun (oven-sh/setup-bun@v1) with latest version in repos/arashi/.github/workflows/ci.yml
- [x] T007 [US1] Add lint job steps: setup caching for Bun install (actions/cache@v4) with lockfile-based key in repos/arashi/.github/workflows/ci.yml
- [x] T008 [US1] Add lint job steps: install dependencies (bun install --frozen-lockfile) in repos/arashi/.github/workflows/ci.yml
- [x] T009 [US1] Add lint job steps: run linter (bun run lint) in repos/arashi/.github/workflows/ci.yml

**Checkpoint**: Lint job should trigger on PR/push, run TypeScript type checking, and report status

---

## Phase 4: User Story 2 - Automated Test Execution (Priority: P1)

**Goal**: Implement test job that runs the complete test suite in parallel with linting

**Independent Test**: Create PR with failing test, verify CI reports test failure details, fix test, verify CI passes

### Implementation for User Story 2

- [x] T010 [US2] Add test job definition with ubuntu-latest runner and 10-minute timeout in repos/arashi/.github/workflows/ci.yml
- [x] T011 [US2] Add test job steps: checkout code (actions/checkout@v4) in repos/arashi/.github/workflows/ci.yml
- [x] T012 [US2] Add test job steps: setup Bun (oven-sh/setup-bun@v1) with latest version in repos/arashi/.github/workflows/ci.yml
- [x] T013 [US2] Add test job steps: setup caching for Bun install (actions/cache@v4) with lockfile-based key in repos/arashi/.github/workflows/ci.yml
- [x] T014 [US2] Add test job steps: install dependencies (bun install --frozen-lockfile) in repos/arashi/.github/workflows/ci.yml
- [x] T015 [US2] Add test job steps: run tests (bun test) in repos/arashi/.github/workflows/ci.yml

**Checkpoint**: Test job should run in parallel with lint job, execute all tests, and report status

---

## Phase 5: User Story 3 - Multi-Platform Binary Building (Priority: P2)

**Goal**: Implement build job that creates binaries for Linux, macOS, and Windows using matrix strategy

**Independent Test**: Trigger build workflow, verify binaries created for all 3 platforms and uploaded as artifacts

### Implementation for User Story 3

- [x] T016 [US3] Add build job definition with 15-minute timeout and needs: [lint, test] dependency in repos/arashi/.github/workflows/ci.yml
- [x] T017 [US3] Configure matrix strategy with 3 platforms (ubuntu-latest, macos-latest, windows-latest) in repos/arashi/.github/workflows/ci.yml
- [x] T018 [US3] Define matrix variables (os, target, artifact, script) for each platform in repos/arashi/.github/workflows/ci.yml
- [x] T019 [US3] Add build job steps: checkout code (actions/checkout@v4) in repos/arashi/.github/workflows/ci.yml
- [x] T020 [US3] Add build job steps: setup Bun (oven-sh/setup-bun@v1) in repos/arashi/.github/workflows/ci.yml
- [x] T021 [US3] Add build job steps: setup caching for Bun install (actions/cache@v4) in repos/arashi/.github/workflows/ci.yml
- [x] T022 [US3] Add build job steps: install dependencies (bun install --frozen-lockfile) in repos/arashi/.github/workflows/ci.yml
- [x] T023 [US3] Add build job steps: build binary using matrix.script variable (bun run ${{ matrix.script }}) in repos/arashi/.github/workflows/ci.yml
- [x] T024 [US3] Add build job steps: upload artifact (actions/upload-artifact@v4) with platform-specific naming and 30-day retention in repos/arashi/.github/workflows/ci.yml
- [x] T025 [US3] Add validate job definition with 5-minute timeout and needs: [build] dependency in repos/arashi/.github/workflows/ci.yml
- [x] T026 [US3] Configure validate job with same matrix strategy as build job in repos/arashi/.github/workflows/ci.yml
- [x] T027 [US3] Add validate job steps: download artifact (actions/download-artifact@v4) using matrix.artifact name in repos/arashi/.github/workflows/ci.yml
- [x] T028 [US3] Add validate job steps: set executable permissions (chmod +x) for Linux/macOS in repos/arashi/.github/workflows/ci.yml
- [x] T029 [US3] Add validate job steps: run version check (./${{ matrix.artifact }} --version) in repos/arashi/.github/workflows/ci.yml

**Checkpoint**: Build jobs should run after lint/test pass, create platform-specific binaries, validate each binary, and upload artifacts

---

## Phase 6: User Story 4 - Pull Request Merge Protection (Priority: P2)

**Goal**: Document branch protection configuration and verify all checks are properly named for merge protection

**Independent Test**: Create PR with failing check, attempt to merge, verify merge is blocked with clear explanation

### Implementation for User Story 4

- [x] T030 [US4] Create branch protection setup documentation in specs/001-ci-workflow/BRANCH_PROTECTION.md
- [x] T031 [US4] Document required status checks (lint, test, build matrices, validate) in specs/001-ci-workflow/BRANCH_PROTECTION.md
- [x] T032 [US4] Add step-by-step instructions for configuring GitHub branch protection rules in specs/001-ci-workflow/BRANCH_PROTECTION.md
- [x] T033 [US4] Verify all job names in ci.yml match the required status check format expected by GitHub in repos/arashi/.github/workflows/ci.yml
- [x] T034 [US4] Add workflow permissions configuration (contents: read, statuses: write, pull-requests: read) in repos/arashi/.github/workflows/ci.yml

**Checkpoint**: Workflow complete with all jobs properly named, branch protection documentation ready for manual configuration

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation updates

- [ ] T035 [P] Validate YAML syntax of ci.yml using `gh workflow view` or YAML validator
- [ ] T036 [P] Update AGENTS.md Recent Changes section with implementation completion note
- [ ] T037 Test the workflow by creating a test branch and PR in repos/arashi/
- [ ] T038 Verify workflow appears in GitHub Actions tab in repos/arashi/
- [ ] T039 Verify all 6 status checks appear on test PR (lint, test, 3x build, validate)
- [ ] T040 [P] Add troubleshooting section to quickstart.md based on any issues found during testing
- [ ] T041 Create summary checklist in specs/001-ci-workflow/IMPLEMENTATION_CHECKLIST.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: No blocking prerequisites for this feature
- **User Stories (Phase 3-6)**: All can start after Setup
  - US1 (Lint) - No dependencies, can start first
  - US2 (Test) - No dependencies on US1, can implement in parallel
  - US3 (Build) - Should reference US1/US2 jobs in needs: clause
  - US4 (Merge Protection) - Documents the complete workflow after US1-3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Lint**: Can start immediately after Setup - No dependencies on other stories
- **User Story 2 (P1) - Test**: Can start immediately after Setup - Implements in same file as US1 but different job
- **User Story 3 (P2) - Build**: References US1+US2 in job dependencies (needs: [lint, test]) - Must verify US1/US2 job names exist
- **User Story 4 (P2) - Merge Protection**: Documents all jobs from US1-3 - Should implement after other stories complete

### Within Each User Story

- US1: Steps must be added to lint job in sequence (checkout → setup → cache → install → lint)
- US2: Steps must be added to test job in sequence (checkout → setup → cache → install → test)
- US3: Build job steps sequential, validate job steps sequential, but build matrix runs in parallel
- US4: Documentation tasks can run in any order

### Parallel Opportunities

- T001 and T002 can run in parallel
- Within US3: Matrix builds run in parallel (3 platforms simultaneously)
- Within US3: Matrix validates run in parallel (3 platforms simultaneously)
- T035, T036, T040 can run in parallel
- All documentation tasks (T030-T032) can run in parallel

---

## Parallel Example: User Story 3 Build Matrix

```yaml
# These run automatically in parallel via GitHub Actions matrix:
Build Job (ubuntu-latest) + Build Job (macos-latest) + Build Job (windows-latest)

# Then these run in parallel after builds complete:
Validate Job (ubuntu-latest) + Validate Job (macos-latest) + Validate Job (windows-latest)
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1 (Lint)
3. Complete Phase 4: User Story 2 (Test)
4. **STOP and VALIDATE**: Push test PR, verify lint and test jobs run, checks appear on PR
5. This gives you automated code quality + test validation (core CI value)

### Full Implementation

1. Complete Setup → MVP (US1 + US2) → Validate MVP
2. Add User Story 3 (Build + Validate) → Test with PR
3. Add User Story 4 (Branch Protection docs) → Configure in GitHub settings
4. Complete Polish phase → Final validation

### Incremental Delivery

Each user story adds independent value:
- **US1 complete**: Catch TypeScript errors before review
- **US2 complete**: Catch test failures before review  
- **US3 complete**: Automated binary builds for all platforms
- **US4 complete**: Merge protection enforces quality gates

---

## Notes

- All workflow configuration goes in a single file: `repos/arashi/.github/workflows/ci.yml`
- [P] tasks = independent tasks that can run in parallel
- [Story] labels track which user story each task implements
- Workflow jobs (lint, test, build, validate) run in parallel where possible via GitHub Actions
- Build and validate jobs use matrix strategy for automatic parallelization across platforms
- Branch protection (US4) requires manual configuration in GitHub repo settings after workflow is deployed
- Commit after completing each user story to enable incremental testing
- Test each user story independently by creating test PRs after implementation
