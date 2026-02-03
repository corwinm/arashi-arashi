# Tasks: Git Worktree API Research

**Input**: Design documents from `/specs/002-git-worktree-research/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete)

**Note**: This is a research and documentation validation task. The primary deliverable (research.md) is already complete. These tasks focus on validating the documentation through practical testing and ensuring all acceptance criteria are met.

**Organization**: Tasks are grouped by user story to validate each research area independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different areas, no dependencies)
- **[Story]**: Which user story this task validates (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Documentation in: `specs/002-git-worktree-research/`

---

## Phase 1: Setup (Documentation Validation Framework)

**Purpose**: Prepare environment for validating research findings

- [X] T001 Create validation checklist template in specs/002-git-worktree-research/checklists/validation.md
- [X] T002 Set up test repository for practical validation (create temporary git repo for testing worktree commands)
- [X] T003 [P] Document validation methodology in specs/002-git-worktree-research/validation-plan.md

---

## Phase 2: Foundational (Git Version Verification)

**Purpose**: Verify git installation and version requirements before validating commands

**⚠️ CRITICAL**: Must verify git version meets minimum requirements (2.5+) before validating any commands

- [X] T004 Verify git version meets minimum requirement (2.5+) on local system
- [X] T005 Document available git version and feature availability in specs/002-git-worktree-research/validation-plan.md

**Checkpoint**: Git version verified - command validation can now begin

---

## Phase 3: User Story 1 - Validate Git Worktree Commands (Priority: P1) 🎯 MVP

**Goal**: Verify all 7 git worktree commands are accurately documented with correct syntax and examples

**Independent Test**: Execute each command from research.md examples and verify output matches documented behavior

### Validation for User Story 1

- [X] T006 [P] [US1] Validate git worktree add command examples from research.md section 1.1
- [X] T007 [P] [US1] Validate git worktree list command examples from research.md section 1.2
- [X] T008 [P] [US1] Validate git worktree remove command examples from research.md section 1.3
- [X] T009 [P] [US1] Validate git worktree prune command examples from research.md section 1.4
- [X] T010 [P] [US1] Validate git worktree lock command examples from research.md section 1.5
- [X] T011 [P] [US1] Validate git worktree unlock command examples from research.md section 1.6
- [X] T012 [P] [US1] Validate git worktree move command examples from research.md section 1.7
- [X] T013 [US1] Document command validation results in specs/002-git-worktree-research/checklists/validation.md
- [X] T014 [US1] Update research.md with any corrections identified during validation

**Checkpoint**: All 7 commands validated - US1 acceptance criteria met (FR-001, FR-002)

---

## Phase 4: User Story 2 - Validate Version Requirements (Priority: P1)

**Goal**: Verify version requirements and feature availability documentation is accurate

**Independent Test**: Cross-reference documented version features against official git release notes

### Validation for User Story 2

- [ ] T015 [P] [US2] Verify minimum git version 2.5.0 claim against git documentation
- [ ] T016 [P] [US2] Validate version-specific features table from research.md section 2.2 against git release notes
- [ ] T017 [US2] Test version-specific features on available git installation (e.g., move command requires 2.17.0+)
- [ ] T018 [US2] Document version validation results in specs/002-git-worktree-research/checklists/validation.md
- [ ] T019 [US2] Update research.md if any version information is incorrect

**Checkpoint**: Version requirements validated - US2 acceptance criteria met (FR-003)

---

## Phase 5: User Story 3 - Validate Repository Type Behavior (Priority: P1)

**Goal**: Verify documented differences between bare and regular repositories are accurate

**Independent Test**: Create both bare and regular test repositories, create worktrees in each, and verify documented behaviors

### Validation for User Story 3

- [ ] T020 [US3] Create regular test repository and validate worktree behavior from research.md section 3.1
- [ ] T021 [US3] Create bare test repository and validate worktree behavior from research.md section 3.2
- [ ] T022 [US3] Compare directory structures and verify differences table from research.md section 3.2
- [ ] T023 [US3] Document repository type validation results in specs/002-git-worktree-research/checklists/validation.md
- [ ] T024 [US3] Update research.md with any corrections for bare/regular repository differences

**Checkpoint**: Repository type behaviors validated - US3 acceptance criteria met (FR-004)

---

## Phase 6: User Story 4 - Validate Location Strategies (Priority: P2)

**Goal**: Verify location strategies documentation is practical and pros/cons are accurate

**Independent Test**: Test each location strategy (sibling, subdirectory, centralized) and verify documented characteristics

### Validation for User Story 4

- [ ] T025 [P] [US4] Test sibling directories strategy from research.md section 4.1 and verify pros/cons
- [ ] T026 [P] [US4] Test subdirectories strategy from research.md section 4.2 and verify pros/cons
- [ ] T027 [P] [US4] Test centralized location strategy from research.md section 4.3 and verify pros/cons
- [ ] T028 [US4] Evaluate recommendation from research.md section 4.4 based on practical testing
- [ ] T029 [US4] Document location strategy validation results in specs/002-git-worktree-research/checklists/validation.md
- [ ] T030 [US4] Update research.md if any location strategy information is inaccurate

**Checkpoint**: Location strategies validated - US4 acceptance criteria met (FR-005)

---

## Phase 7: User Story 5 - Validate Error Scenarios (Priority: P2)

**Goal**: Verify documented error scenarios can be reproduced and resolutions work as described

**Independent Test**: Trigger each error scenario and verify error messages and resolutions match documentation

### Validation for User Story 5

- [ ] T031 [P] [US5] Reproduce insufficient disk space error from research.md section 5.1 (simulate or document limitation)
- [ ] T032 [P] [US5] Reproduce permission denied error from research.md section 5.2 and verify resolution
- [ ] T033 [P] [US5] Reproduce branch already checked out error from research.md section 5.3 and verify resolution
- [ ] T034 [P] [US5] Reproduce path already exists error from research.md section 5.4 and verify resolution
- [ ] T035 [P] [US5] Reproduce corrupt metadata scenario from research.md section 5.5 and verify recovery steps
- [ ] T036 [US5] Document error scenario validation results in specs/002-git-worktree-research/checklists/validation.md
- [ ] T037 [US5] Update research.md if any error scenarios or resolutions are inaccurate

**Checkpoint**: Error scenarios validated - US5 acceptance criteria met (FR-006)

---

## Phase 8: User Story 6 - Validate Remote Tracking Setup (Priority: P2)

**Goal**: Verify remote tracking documentation is accurate and examples work correctly

**Independent Test**: Create worktrees with various remote tracking scenarios and verify documented behavior

### Validation for User Story 6

- [ ] T038 [P] [US6] Test new branch from existing branch scenario from research.md section 6.1
- [ ] T039 [P] [US6] Test existing remote branch scenario from research.md section 6.2
- [ ] T040 [P] [US6] Test branch without remote scenario from research.md section 6.3
- [ ] T041 [P] [US6] Validate fetch behavior across worktrees from research.md section 6.4
- [ ] T042 [US6] Document remote tracking validation results in specs/002-git-worktree-research/checklists/validation.md
- [ ] T043 [US6] Update research.md if any remote tracking information is incorrect

**Checkpoint**: Remote tracking validated - US6 acceptance criteria met (FR-007)

---

## Phase 9: User Story 7 - Validate .git File Format (Priority: P3)

**Goal**: Verify .git file format documentation accurately describes gitlink structure

**Independent Test**: Inspect actual .git files in worktrees and verify format matches documentation

### Validation for User Story 7

- [ ] T044 [P] [US7] Create worktree and inspect .git file format from research.md section 7.1
- [ ] T045 [P] [US7] Verify metadata directory contents from research.md section 7.2
- [ ] T046 [P] [US7] Validate shared vs worktree-specific files documentation from research.md section 7.3
- [ ] T047 [US7] Test manual inspection commands from research.md section 7.4
- [ ] T048 [US7] Document .git file format validation results in specs/002-git-worktree-research/checklists/validation.md
- [ ] T049 [US7] Update research.md if any file format information is inaccurate

**Checkpoint**: .git file format validated - US7 acceptance criteria met (FR-008)

---

## Phase 10: Edge Cases & Best Practices Validation

**Goal**: Verify edge cases and best practices are practical and accurate

### Edge Cases Validation

- [ ] T050 [P] Validate symlink behavior documentation from research.md section 8.1
- [ ] T051 [P] Test moving main repository scenario from research.md section 8.2
- [ ] T052 [P] Validate locked worktree removal from research.md section 8.3
- [ ] T053 [P] Test case-insensitive filesystem behavior from research.md section 8.4 (if on macOS/Windows)
- [ ] T054 [P] Validate metadata corruption recovery from research.md section 8.5
- [ ] T055 Document edge case validation results in specs/002-git-worktree-research/checklists/validation.md

### Best Practices Review

- [ ] T056 [P] Review and validate best practices from research.md section 9.1-9.4
- [ ] T057 Update research.md with any additional best practices discovered during validation

**Checkpoint**: All edge cases and best practices validated

---

## Phase 11: Polish & Final Validation

**Purpose**: Final review and completion verification

- [ ] T058 [P] Verify all 7 commands documented with examples (Success Criteria SC-001)
- [ ] T059 [P] Verify all acceptance criteria from spec.md are met in research.md (Success Criteria SC-002)
- [ ] T060 [P] Conduct 30-minute comprehension test with fresh reader (Success Criteria SC-003)
- [ ] T061 Count and verify at least 10 practical examples are included (Success Criteria SC-004)
- [ ] T062 Verify all edge cases have documented resolutions (Success Criteria SC-005)
- [ ] T063 Update specs/002-git-worktree-research/checklists/validation.md with final completion status
- [ ] T064 [P] Add any missing references or citations in research.md section 10
- [ ] T065 Review research.md for clarity, completeness, and accuracy
- [ ] T066 Mark feature as complete in spec.md and plan.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all validation work
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (different validation areas)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Edge Cases (Phase 10)**: Can start after Foundational - independent of user stories
- **Polish (Phase 11)**: Depends on all user story validation being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Independent of US1, US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent of all other stories
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Independent of all other stories
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Independent of all other stories
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Independent of all other stories

### Within Each User Story

- Validation tasks marked [P] can run in parallel
- Documentation updates must wait for validation to complete
- Each story completes independently

### Parallel Opportunities

- All Setup tasks (Phase 1) marked [P] can run in parallel
- Once Foundational phase completes, ALL user story validations can start in parallel
- Within each user story, all [P] tasks can run in parallel
- Edge case validations (Phase 10) can run in parallel with user story validations

---

## Parallel Example: User Story 1

```bash
# Launch all command validations for User Story 1 together:
Task: "Validate git worktree add command examples from research.md section 1.1"
Task: "Validate git worktree list command examples from research.md section 1.2"
Task: "Validate git worktree remove command examples from research.md section 1.3"
Task: "Validate git worktree prune command examples from research.md section 1.4"
Task: "Validate git worktree lock command examples from research.md section 1.5"
Task: "Validate git worktree unlock command examples from research.md section 1.6"
Task: "Validate git worktree move command examples from research.md section 1.7"
```

---

## Parallel Example: All P1 User Stories

```bash
# After Foundational phase, launch all P1 story validations together:
Task: "Complete Phase 3: User Story 1 - Validate Git Worktree Commands"
Task: "Complete Phase 4: User Story 2 - Validate Version Requirements"
Task: "Complete Phase 5: User Story 3 - Validate Repository Type Behavior"
```

---

## Implementation Strategy

### MVP First (User Story 1-3 Only - All P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (git version verification)
3. Complete Phase 3: User Story 1 (command validation)
4. Complete Phase 4: User Story 2 (version validation)
5. Complete Phase 5: User Story 3 (repository type validation)
6. **STOP and VALIDATE**: Core research (all P1 stories) is validated
7. Can proceed with P2/P3 stories or mark as MVP complete

### Incremental Validation

1. Complete Setup + Foundational → Validation framework ready
2. Validate User Story 1 → Commands verified → Checkpoint
3. Validate User Story 2 → Versions verified → Checkpoint
4. Validate User Story 3 → Repository types verified → Checkpoint
5. Validate User Story 4 → Location strategies verified → Checkpoint
6. Validate User Story 5 → Error scenarios verified → Checkpoint
7. Validate User Story 6 → Remote tracking verified → Checkpoint
8. Validate User Story 7 → .git format verified → Checkpoint
9. Each validation adds confidence without breaking previous validations

### Parallel Validation Strategy

With multiple reviewers or time slots:

1. Complete Setup + Foundational together
2. Once Foundational is done, validate in parallel:
   - Reviewer A: User Stories 1-2 (commands & versions)
   - Reviewer B: User Stories 3-4 (repo types & locations)
   - Reviewer C: User Stories 5-6 (errors & remote tracking)
3. All validations complete independently

---

## Notes

- [P] tasks = different validation areas, no dependencies
- [Story] label maps task to specific user story from spec.md
- Each user story validation is independently completable
- Validation may require temporary test repositories - clean up after validation
- Document any discrepancies found during validation
- Update research.md if validation reveals inaccuracies
- All validation results tracked in checklists/validation.md
- research.md is the primary deliverable - validation ensures accuracy
