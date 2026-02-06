# Tasks: Nested Worktree Paths for Multi-Repo Setup

**Input**: Design documents from `/specs/001-nested-worktree-paths/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/worktree-path-calculation.md

**Tests**: Tests are included per Constitution Principle VII (>80% code coverage requirement)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to: `repos/arashi/`

- **Source**: `src/core/`, `src/lib/`
- **Tests**: `tests/unit/`, `tests/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare development environment and verify prerequisites

- [X] T001 Verify existing project structure matches plan.md expectations
- [X] T002 [P] Review quickstart.md to understand current worktree creation flow
- [X] T003 [P] Verify Bun test runner is configured and working with `bun test`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and imports that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add repository type classification to repos/arashi/src/core/worktree.ts (RepositoryType type, RepositoryTypeInfo interface per data-model.md lines 19-57)
- [X] T005 Add required imports to repos/arashi/src/core/worktree.ts (basename, sep from 'path', Bun.file for config check)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Meta-repo Worktree Creation (Priority: P1) 🎯 MVP

**Goal**: Ensure meta-repo worktrees are correctly created as siblings, maintaining existing behavior

**Independent Test**: Create a worktree for a meta-repo and verify it appears as a sibling directory with the correct naming pattern `parent-repo-feature/`

**Success Criteria**: SC-002 from spec.md - Meta-repo worktrees are created as siblings to the original meta-repo directory 100% of the time

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T006 [P] [US1] Create unit test for detectRepositoryType() with meta-repo scenario in repos/arashi/tests/unit/repository-type-detection.test.ts
- [ ] T007 [P] [US1] Create unit test for calculateWorktreePath() with meta-repo scenario (sibling strategy) in repos/arashi/tests/unit/worktree-path-calculation.test.ts
- [ ] T008 [US1] Create integration test for meta-repo worktree creation (verify sibling path) in repos/arashi/tests/integration/nested-worktree-paths.test.ts

### Implementation for User Story 1

- [ ] T009 [US1] Implement detectRepositoryType() function in repos/arashi/src/core/worktree.ts (per contract lines 15-76, handles meta-repo detection via .arashi/config.json check)
- [ ] T010 [US1] Implement calculateWorktreePath() function in repos/arashi/src/core/worktree.ts (per contract lines 80-168, handles sibling strategy for meta-repos)
- [ ] T011 [US1] Update processRepository() signature to accept config parameter in repos/arashi/src/core/worktree.ts (line 525, add config: ArashiConfig parameter)
- [ ] T012 [US1] Update createCoordinatedWorktrees() to load config and pass to processRepository() in repos/arashi/src/core/worktree.ts (around line 421: load config, line 461: pass to processRepository)
- [ ] T013 [US1] Replace inline path calculation at line 635 in processRepository() with calculateWorktreePath() call in repos/arashi/src/core/worktree.ts
- [ ] T014 [US1] Run integration test and verify meta-repo worktree is created as sibling (SC-002)

**Checkpoint**: Meta-repo worktrees now work correctly with sibling creation. This story is independently functional.

---

## Phase 4: User Story 2 - Child Repo Worktree Nested in Parent Worktree (Priority: P1)

**Goal**: Fix the bug - child repo worktrees should be nested inside parent worktree's `repos/` folder

**Independent Test**: Create worktrees for both a meta-repo and its child repos, then verify child worktrees are nested inside parent worktree's repos folder at path `parent-repo-feature/repos/child-repo/`

**Success Criteria**: SC-001 from spec.md - Child repo worktrees are created inside parent worktree's `repos/` folder 100% of the time for multi-repo setups

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US2] Add unit test for detectRepositoryType() with child repo scenario in repos/arashi/tests/unit/repository-type-detection.test.ts
- [ ] T016 [P] [US2] Add unit test for calculateChildWorktreePath() helper function in repos/arashi/tests/unit/worktree-path-calculation.test.ts
- [ ] T017 [P] [US2] Add unit test for calculateWorktreePath() with child repo scenario (nested strategy) in repos/arashi/tests/unit/worktree-path-calculation.test.ts
- [ ] T018 [US2] Create integration test for multi-repo worktree creation (meta-repo + child repos) in repos/arashi/tests/integration/nested-worktree-paths.test.ts (verify nested structure)

### Implementation for User Story 2

- [ ] T019 [US2] Extend detectRepositoryType() to handle child repo detection in repos/arashi/src/core/worktree.ts (check for repos_dir in path, extract parentName and reposDir per data-model.md lines 214-266)
- [ ] T020 [US2] Implement calculateChildWorktreePath() helper function in repos/arashi/src/core/worktree.ts (per contract lines 172-214, implements nested path algorithm from data-model.md lines 138-177)
- [ ] T021 [US2] Extend calculateWorktreePath() to handle child repos with nested strategy in repos/arashi/src/core/worktree.ts (call calculateChildWorktreePath for type='child')
- [ ] T022 [US2] Run integration test and verify child worktrees are nested inside parent worktree (SC-001, SC-004, SC-005)

**Checkpoint**: Child repo worktrees now correctly nest inside parent worktrees. Core bug is fixed.

---

## Phase 5: User Story 3 - Preserve Existing Sibling Behavior for Non-Meta-Repos (Priority: P2)

**Goal**: Ensure backward compatibility - standalone repositories continue to create worktrees as siblings

**Independent Test**: Create a worktree for a standalone repository (without `.arashi` config or parent meta-repo) and verify it's created as a sibling at path `simple-repo-feature/`

**Success Criteria**: SC-003 from spec.md - Standalone repository worktrees maintain existing sibling creation behavior without regression

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T023 [P] [US3] Add unit test for detectRepositoryType() with standalone repo scenario in repos/arashi/tests/unit/repository-type-detection.test.ts
- [ ] T024 [P] [US3] Add unit test for calculateWorktreePath() with standalone repo scenario (sibling strategy) in repos/arashi/tests/unit/worktree-path-calculation.test.ts
- [ ] T025 [US3] Create integration test for standalone repo worktree creation in repos/arashi/tests/integration/nested-worktree-paths.test.ts (verify sibling path, backward compatibility)

### Implementation for User Story 3

- [ ] T026 [US3] Extend detectRepositoryType() to return 'standalone' as default case in repos/arashi/src/core/worktree.ts (per data-model.md lines 227-265)
- [ ] T027 [US3] Verify calculateWorktreePath() handles standalone repos correctly (should use sibling strategy, same as meta-repo) in repos/arashi/src/core/worktree.ts
- [ ] T028 [US3] Run integration test and verify standalone repo worktrees maintain sibling creation (SC-003)

**Checkpoint**: All three repository types now work correctly. Backward compatibility ensured.

---

## Phase 6: Edge Cases & Validation

**Purpose**: Handle edge cases identified in spec.md and add robustness

- [ ] T029 [P] Add unit test for null config handling in detectRepositoryType() in repos/arashi/tests/unit/repository-type-detection.test.ts
- [ ] T030 [P] Add unit test for custom repos_dir handling in calculateWorktreePath() in repos/arashi/tests/unit/worktree-path-calculation.test.ts
- [ ] T031 [P] Add unit test for child repo path validation (invalid path structure) in repos/arashi/tests/unit/worktree-path-calculation.test.ts
- [ ] T032 Add error handling for invalid child repo paths in calculateChildWorktreePath() in repos/arashi/src/core/worktree.ts (throw Error if reposIndex invalid)
- [ ] T033 Add error handling for missing parent directory segments in calculateChildWorktreePath() in repos/arashi/src/core/worktree.ts (validate parentName exists)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Finalize implementation, ensure quality, and prepare for deployment

- [ ] T034 Run full test suite with `bun test` and verify >80% code coverage for modified functions (Constitution Principle VII)
- [ ] T035 Run linting with `bun run lint` and fix any TypeScript errors
- [ ] T036 [P] Add JSDoc comments to all new functions (detectRepositoryType, calculateWorktreePath, calculateChildWorktreePath) per contract specifications
- [ ] T037 [P] Review quickstart.md debugging tips and verify implementation matches guidance
- [ ] T038 Manual testing: Create test directory structure per quickstart.md and verify all three scenarios work correctly
- [ ] T039 Update AGENTS.md context if any new technologies or patterns were introduced (run .specify/scripts/bash/update-agent-context.sh opencode)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order: US1 → US2 → US3
  - US1 and US3 could run in parallel (different code paths), but US2 depends on US1 completion
- **Edge Cases (Phase 6)**: Depends on User Story 2 completion (uses child repo path logic)
- **Polish (Phase 7)**: Depends on all user stories and edge cases being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on User Story 1 completion (extends detectRepositoryType and calculateWorktreePath)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies (validates default case)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Unit tests before integration tests
- Helper functions (calculateChildWorktreePath) before main functions (calculateWorktreePath)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase**:
- T002 and T003 can run in parallel

**Foundational Phase**:
- T004 and T005 can run in parallel (different sections of same file, non-overlapping)

**User Story 1 Tests**:
- T006 and T007 can run in parallel (different test files)

**User Story 1 Implementation**:
- T009 and T010 can be implemented in parallel (different functions in same file)
- T011, T012, T013 must run sequentially (modify same functions/lines)

**User Story 2 Tests**:
- T015, T016, T017 can run in parallel (different test files or different tests in same file)

**User Story 3 Tests**:
- T023, T024, T025 can run in parallel (different test files)

**Edge Cases**:
- T029, T030, T031 can run in parallel (different test files)
- T032, T033 can run in parallel (different error conditions)

**Polish**:
- T036, T037 can run in parallel (documentation vs. manual testing)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create unit test for detectRepositoryType() with meta-repo scenario in repos/arashi/tests/unit/repository-type-detection.test.ts"
Task: "Create unit test for calculateWorktreePath() with meta-repo scenario in repos/arashi/tests/unit/worktree-path-calculation.test.ts"

# Implement core functions in parallel:
Task: "Implement detectRepositoryType() function in repos/arashi/src/core/worktree.ts"
Task: "Implement calculateWorktreePath() function in repos/arashi/src/core/worktree.ts"
```

## Parallel Example: User Story 2

```bash
# Launch all tests for User Story 2 together:
Task: "Add unit test for detectRepositoryType() with child repo scenario in repos/arashi/tests/unit/repository-type-detection.test.ts"
Task: "Add unit test for calculateChildWorktreePath() helper function in repos/arashi/tests/unit/worktree-path-calculation.test.ts"
Task: "Add unit test for calculateWorktreePath() with child repo scenario in repos/arashi/tests/unit/worktree-path-calculation.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

Since User Story 1 and User Story 2 are both Priority P1, the MVP should include both:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (meta-repo worktrees work correctly)
4. Complete Phase 4: User Story 2 (child repo nesting bug is fixed)
5. **STOP and VALIDATE**: Test both meta-repo and multi-repo scenarios independently
6. Deploy/demo if ready

**Rationale**: User Story 2 is the core bug fix. User Story 1 ensures we don't break meta-repo behavior while fixing it. Both are essential for the fix to be complete.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Verify meta-repo worktrees still work (no regression)
3. Add User Story 2 → Test independently → Verify child repo nesting works (bug fixed!) → Deploy/Demo (MVP!)
4. Add User Story 3 → Test independently → Verify standalone repos still work (backward compatibility) → Deploy/Demo
5. Add Edge Cases (Phase 6) → Improve robustness
6. Polish (Phase 7) → Production-ready

### Sequential Strategy

This is a focused bug fix with clear dependencies:

1. Team completes Setup + Foundational together
2. Implement User Story 1 (ensures no regression)
3. Implement User Story 2 (fixes the bug, builds on US1)
4. Implement User Story 3 (validates backward compatibility)
5. Add edge case handling
6. Polish and deploy

**Note**: Parallel team strategy is not recommended for this feature since User Story 2 extends User Story 1's implementation. Sequential execution is more efficient.

---

## Notes

- [P] tasks = different files or non-overlapping sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Key files**: 
  - Primary: `repos/arashi/src/core/worktree.ts` (lines 635, 525, 421, 461 + new functions)
  - Tests: `repos/arashi/tests/unit/repository-type-detection.test.ts`, `repos/arashi/tests/unit/worktree-path-calculation.test.ts`, `repos/arashi/tests/integration/nested-worktree-paths.test.ts`

---

## Task Count Summary

- **Total Tasks**: 39
- **Setup**: 3 tasks
- **Foundational**: 2 tasks
- **User Story 1**: 9 tasks (3 tests + 6 implementation)
- **User Story 2**: 8 tasks (4 tests + 4 implementation)
- **User Story 3**: 6 tasks (3 tests + 3 implementation)
- **Edge Cases**: 5 tasks
- **Polish**: 6 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel (38% of tasks)

**Test Coverage**: 15 test tasks ensure >80% coverage per Constitution Principle VII
