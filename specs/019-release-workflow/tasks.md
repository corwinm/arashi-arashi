# Tasks: GitHub Actions Release Workflow

**Input**: Design documents from `/specs/019-release-workflow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/workflow-interface.md, quickstart.md

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Repository root: `/Users/corwin/Documents/GitHub/arashi-arashi.git/main-publishing`
- Workflow location: `.github/workflows/`
- Configuration location: repository root
- Source code: `repos/arashi/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and configuration files

- [X] T001 Create `.releaserc.json` configuration file in repository root with semantic-release plugins
- [X] T002 Add semantic-release dependencies to `package.json` (@semantic-release/git, @semantic-release/changelog, @semantic-release/npm, @semantic-release/github)
- [X] T003 [P] Create initial `CHANGELOG.md` file in repository root (will be auto-populated on first release)
- [X] T004 [P] Verify NPM_TOKEN secret setup documentation in repository settings instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core workflow structure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create `.github/workflows/release.yml` file with basic workflow structure (name, trigger, permissions)
- [X] T006 Define workflow trigger as `workflow_dispatch` with optional `dry_run` input in `.github/workflows/release.yml`
- [X] T007 Configure workflow permissions (contents: write, pull-requests: write, issues: write) in `.github/workflows/release.yml`
- [X] T008 Define build job structure with matrix strategy for 3 platforms (bun-linux-x64, bun-darwin-arm64, bun-windows-x64) in `.github/workflows/release.yml`
- [X] T009 Configure release job dependency on build job completion in `.github/workflows/release.yml`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automated Release Creation (Priority: P1) 🎯 MVP

**Goal**: Enable maintainers to trigger a workflow that builds binaries for all platforms, creates a Git tag, creates a GitHub release with binaries attached, and generates release notes from commit history.

**Independent Test**: Trigger the workflow manually from GitHub Actions UI and verify that: (1) all 3 platform binaries are built and uploaded as artifacts, (2) a Git tag is created with the new version, (3) a GitHub release is created with the tag, (4) all 3 binaries are attached to the release, (5) release notes are generated from commits.

### Implementation for User Story 1

- [X] T010 [P] [US1] Add checkout step to build job in `.github/workflows/release.yml`
- [X] T011 [P] [US1] Add setup-bun step (oven-sh/setup-bun@v2) to build job in `.github/workflows/release.yml`
- [X] T012 [US1] Add dependency installation step (`bun install`) to build job in `.github/workflows/release.yml`
- [X] T013 [US1] Add build step with Bun cross-compilation command for matrix.target in `.github/workflows/release.yml`
- [X] T014 [US1] Configure build step flags (--compile, --target, --minify, --sourcemap, --bytecode, --production) in `.github/workflows/release.yml`
- [X] T015 [US1] Add artifact upload step (actions/upload-artifact@v4) with 1-day retention for each platform binary in `.github/workflows/release.yml`
- [X] T016 [P] [US1] Add checkout step with full history (fetch-depth: 0) to release job in `.github/workflows/release.yml`
- [X] T017 [P] [US1] Add setup-node step (actions/setup-node@v4) to release job in `.github/workflows/release.yml`
- [X] T018 [US1] Add semantic-release installation step (`npm install semantic-release @semantic-release/git @semantic-release/changelog`) to release job in `.github/workflows/release.yml`
- [X] T019 [US1] Add artifact download step (actions/download-artifact@v4) with merge-multiple: true to release job in `.github/workflows/release.yml`
- [X] T020 [US1] Add semantic-release execution step with GITHUB_TOKEN to release job in `.github/workflows/release.yml`
- [X] T021 [US1] Configure semantic-release to create Git tag and commit version bump in `.releaserc.json`
- [X] T022 [US1] Configure semantic-release to create GitHub release with changelog in `.releaserc.json`
- [X] T023 [US1] Add step to attach downloaded binaries to GitHub release in `.github/workflows/release.yml`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - manual trigger creates complete release with binaries

---

## Phase 4: User Story 2 - Version Management (Priority: P2)

**Goal**: Automatically parse commit messages using conventional commit format (feat:, fix:, BREAKING CHANGE:) and determine the correct semantic version bump (major.minor.patch) based on commit types.

**Independent Test**: Create test commits with different conventional commit prefixes (feat:, fix:, BREAKING CHANGE:) and trigger the workflow to verify: (1) patch version bump for fix: commits, (2) minor version bump for feat: commits, (3) major version bump for BREAKING CHANGE: commits, (4) highest priority bump when multiple types exist.

### Implementation for User Story 2

- [X] T024 [P] [US2] Configure commit-analyzer plugin in `.releaserc.json` with conventional commit parsing rules
- [X] T025 [P] [US2] Configure release-notes-generator plugin in `.releaserc.json` to group changes by type (Features, Bug Fixes, Breaking Changes)
- [X] T026 [US2] Configure version bump rules for conventional commit types (feat → minor, fix → patch, BREAKING CHANGE → major) in `.releaserc.json`
- [X] T027 [US2] Configure pre-1.0.0 special handling (breaking changes bump minor, not major) in `.releaserc.json`
- [X] T028 [US2] Add validation to skip release when no conventional commits are found since last tag in `.releaserc.json`
- [X] T029 [US2] Configure changelog plugin to update `CHANGELOG.md` with grouped changes in `.releaserc.json`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - workflow correctly calculates versions and generates changelogs

---

## Phase 5: User Story 3 - NPM Package Publishing (Priority: P3)

**Goal**: Automatically publish the package to npm registry after successful GitHub release creation, with graceful degradation if NPM_TOKEN is not configured.

**Independent Test**: Trigger workflow with NPM_TOKEN configured and verify package is published to npmjs.com with correct version. Then trigger workflow without NPM_TOKEN and verify GitHub release succeeds but npm publish is skipped with warning.

### Implementation for User Story 3

- [X] T030 [P] [US3] Configure npm plugin in `.releaserc.json` to publish package to npm registry
- [X] T031 [P] [US3] Add NPM_TOKEN environment variable to semantic-release step in `.github/workflows/release.yml`
- [X] T032 [US3] Configure graceful degradation for missing NPM_TOKEN in semantic-release configuration in `.releaserc.json`
- [X] T033 [US3] Add conditional logic to skip npm publish step if NPM_TOKEN secret is not available in `.github/workflows/release.yml`
- [X] T034 [US3] Add warning log message when npm publishing is skipped due to missing token in `.github/workflows/release.yml`
- [X] T035 [US3] Verify npm plugin handles version conflicts (409 errors) gracefully without failing workflow in `.releaserc.json`

**Checkpoint**: All user stories should now be independently functional - complete release automation with optional npm publishing

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T036 [P] Add workflow comments documenting version (v1.0.0) and contract reference in `.github/workflows/release.yml`
- [X] T037 [P] Add error handling for build failures with clear error messages in `.github/workflows/release.yml`
- [X] T038 [P] Add error handling for release job failures with rollback instructions in `.github/workflows/release.yml`
- [X] T039 [P] Verify binary size optimization meets 50-60MB target with flags (--minify, --bytecode) in build step
- [X] T040 [P] Add dry-run mode support to skip tag/release creation when dry_run input is true in `.github/workflows/release.yml`
- [X] T041 [P] Add step summaries and status messages for better GitHub Actions UI visibility in `.github/workflows/release.yml`
- [X] T042 [P] Verify atomic two-job pattern prevents partial releases (release job only runs if all builds succeed)
- [X] T043 [P] Update repository README.md with release workflow documentation and maintainer instructions
- [X] T044 Validate workflow against quickstart.md scenarios (manual trigger, version bump verification, npm publish)
- [X] T045 Test workflow on test repository before production deployment (per quickstart.md recommendations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - This is the MVP - delivers core release automation functionality
  - Blocks: US2 (version management builds on US1's workflow structure)
  - Blocks: US3 (npm publishing builds on US1's release creation)
  
- **User Story 2 (P2)**: Can start after User Story 1 completion
  - Extends US1's workflow with intelligent version calculation
  - Independently testable by verifying version bump logic
  - Does not block US3 (npm publishing can work with any version)
  
- **User Story 3 (P3)**: Can start after User Story 1 completion
  - Extends US1's workflow with npm distribution channel
  - Independently testable by verifying npm publish (with/without token)
  - Does not block any other stories

### Within Each User Story

**User Story 1 (Automated Release Creation)**:
1. Build job steps (T010-T015): Can proceed mostly in parallel
   - Checkout and setup steps can be parallel (T010, T011)
   - Install → Build → Upload must be sequential (T012 → T013-T014 → T015)
2. Release job steps (T016-T023): Must proceed sequentially
   - Setup steps can be parallel (T016, T017)
   - Then: Install (T018) → Download (T019) → Execute (T020-T023)

**User Story 2 (Version Management)**:
- Configuration tasks (T024-T029): All can run in parallel (different configuration sections)

**User Story 3 (NPM Publishing)**:
- Configuration tasks (T030-T035): Can run in parallel initially (T030, T031)
- Logic tasks must follow (T032-T035 sequential)

### Parallel Opportunities

- **Phase 1 Setup**: All tasks marked [P] can run in parallel (T003, T004)
- **Phase 2 Foundational**: Tasks T005-T007 sequential (build workflow structure), then T008-T009 can be parallel
- **Within User Story 1**: T010, T011 parallel; T016, T017 parallel
- **Within User Story 2**: T024, T025 parallel
- **Within User Story 3**: T030, T031 parallel
- **Phase 6 Polish**: All tasks marked [P] can run in parallel (T036-T042)

---

## Parallel Example: User Story 1 Build Job Setup

```bash
# Launch setup steps together:
Task: "Add checkout step to build job in .github/workflows/release.yml"
Task: "Add setup-bun step (oven-sh/setup-bun@v2) to build job in .github/workflows/release.yml"

# Then sequentially:
# Task: "Add dependency installation step (bun install)"
# Task: "Add build step with cross-compilation"
# Task: "Add artifact upload step"
```

## Parallel Example: User Story 2 Configuration

```bash
# Launch all configuration tasks together:
Task: "Configure commit-analyzer plugin in .releaserc.json"
Task: "Configure release-notes-generator plugin in .releaserc.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T010-T023)
4. **STOP and VALIDATE**: 
   - Trigger workflow manually from GitHub Actions
   - Verify all 3 binaries build successfully
   - Verify Git tag is created
   - Verify GitHub release is created with binaries
   - Verify release notes are generated
5. Deploy/demo if ready - **This is a complete, valuable release automation system**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **Deploy/Demo (MVP!)** 
   - Value: Automated release creation with binaries
3. Add User Story 2 → Test independently → Deploy/Demo
   - Value: Intelligent version calculation from commits
4. Add User Story 3 → Test independently → Deploy/Demo
   - Value: Automatic npm distribution
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2)
2. **Once Foundational is done**:
   - **Developer A**: User Story 1 (T010-T023) - Core workflow
   - **Wait for US1 completion, then**:
     - **Developer B**: User Story 2 (T024-T029) - Version logic
     - **Developer C**: User Story 3 (T030-T035) - NPM publishing
3. Stories 2 and 3 can proceed in parallel after Story 1 completes
4. **Together**: Polish phase (T036-T045)

**Rationale**: US1 establishes the workflow structure that US2 and US3 extend. US2 and US3 are independent of each other and can be developed in parallel.

---

## Notes

- [P] tasks = different files or independent configuration sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Constitution compliance**: Atomic two-job pattern ensures no partial releases (Principle III - Error Recovery)
- **Performance target**: Complete workflow in under 10 minutes (Success Criteria SC-001) - actual expected: 3-5 minutes
- **Binary size target**: 50-60MB per platform (Constitution Principle I) with optimization flags
- **No tests included**: Feature specification does not request test coverage; workflow testing via dry-run mode and test repository (per quickstart.md)
