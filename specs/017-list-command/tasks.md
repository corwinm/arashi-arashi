# Tasks: List Command

**Input**: Design documents from `/specs/017-list-command/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/list-api.ts

**Tests**: No test tasks included (not explicitly requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `repos/arashi/src/`, `repos/arashi/tests/` (per plan.md)
- Implementation must be done in `repos/arashi/` directory, not in specs/

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the list command

- [X] T001 Create type definitions in repos/arashi/src/types/list.ts based on contracts/list-api.ts
- [X] T002 Create command registration file at repos/arashi/src/commands/list.ts
- [X] T003 Create core implementation file at repos/arashi/src/core/list.ts
- [X] T004 Register list command in repos/arashi/src/index.ts

**Checkpoint**: Project structure ready - run `bun run build` to verify compilation succeeds

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Implement error classes (ListCommandError, NotInRepositoryError, ConfigurationMissingError) in repos/arashi/src/types/list.ts
- [X] T006 [P] Implement getShortCommitSha() helper function in repos/arashi/src/core/list.ts
- [X] T007 [P] Implement hasUncommittedChanges() helper function in repos/arashi/src/core/list.ts
- [X] T008 [P] Implement validateWorktreeListItem() validation function in repos/arashi/src/core/list.ts
- [X] T009 [P] Implement validateListCommandOutput() validation function in repos/arashi/src/core/list.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Worktree Overview (Priority: P1) 🎯 MVP

**Goal**: Provide comprehensive visibility into all worktrees with their paths, branches, and basic status in human-readable table format

**Independent Test**: Create multiple worktrees and run the list command to verify all worktrees display with paths, branches, and status indicators. This delivers immediate value by answering "what worktrees exist?"

**Acceptance Scenarios**:
1. Repository with 3 worktrees displays all 3 with paths and branch names
2. Repository with no worktrees (only main) shows clear informative message
3. Worktree with uncommitted changes shows status indicator

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement gatherWorktreeData() function in repos/arashi/src/core/list.ts to query git worktrees and status
- [X] T011 [P] [US1] Implement formatStatus() helper function in repos/arashi/src/core/list.ts for status indicators (✓/✗/🔒)
- [X] T012 [US1] Implement formatAsTable() function in repos/arashi/src/core/list.ts for human-readable table output with chalk colors
- [X] T013 [US1] Implement buildListOutput() orchestration function in repos/arashi/src/core/list.ts (without verbose mode support)
- [X] T014 [US1] Implement main listCommand() function in repos/arashi/src/core/list.ts with error handling and table output
- [X] T015 [US1] Update command registration in repos/arashi/src/commands/list.ts to wire up options (--verbose, --json, --max-depth)

**Checkpoint**: At this point, User Story 1 should be fully functional - `arashi list` displays all worktrees in table format

---

## Phase 4: User Story 2 - Detailed Sub-Repository Information (Priority: P2)

**Goal**: Enable users to see detailed information about nested sub-repositories within each worktree for complex nested repository setups

**Independent Test**: Create a worktree with nested sub-repositories and run `arashi list --verbose` to verify detailed sub-repository status displays. This delivers value by answering "what's inside each worktree?"

**Acceptance Scenarios**:
1. Worktree with 2 sub-repositories in verbose mode shows each sub-repo's path, branch, and status
2. Sub-repository with uncommitted changes is clearly marked

### Implementation for User Story 2

- [X] T016 [P] [US2] Implement findGitRepositories() function in repos/arashi/src/core/list.ts for recursive git directory discovery
- [X] T017 [US2] Implement discoverSubRepositories() function in repos/arashi/src/core/list.ts to query nested repo status
- [X] T018 [US2] Update formatAsTable() in repos/arashi/src/core/list.ts to support verbose mode with sub-repository tree display
- [X] T019 [US2] Update buildListOutput() in repos/arashi/src/core/list.ts to conditionally discover sub-repositories when verbose flag is true
- [X] T020 [US2] Add progress spinner in listCommand() in repos/arashi/src/core/list.ts for verbose mode operations

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - `arashi list --verbose` shows nested repos

---

## Phase 5: User Story 3 - Machine-Readable Output for Tool Integration (Priority: P2)

**Goal**: Enable integration with command-line tools (fzf, jq, tmux, sesh) by providing structured JSON output for automation and workflow building

**Independent Test**: Run `arashi list --json` and verify output is valid JSON parseable by jq/fzf. Demonstrate piping to fzf for worktree selection. This delivers value by enabling "which worktree should I work in?"

**Acceptance Scenarios**:
1. Multiple worktrees with JSON flag returns valid JSON with all worktree information
2. JSON output can be successfully parsed and filtered by jq
3. List output can be piped to fzf for interactive worktree selection
4. Compatible with tmux/sesh workflow automation

### Implementation for User Story 3

- [X] T021 [P] [US3] Implement formatAsJson() function in repos/arashi/src/core/list.ts to serialize output as pretty-printed JSON
- [X] T022 [US3] Update listCommand() in repos/arashi/src/core/list.ts to conditionally output JSON format when json flag is true
- [X] T023 [US3] Verify JSON output validates against schema from data-model.md (add inline validation check)

**Checkpoint**: All user stories (1, 2, 3) should now be independently functional - `arashi list --json` outputs valid JSON for automation

---

## Phase 6: User Story 4 - Quick Worktree Count (Priority: P3)

**Goal**: Display total count of worktrees for quick workspace scale assessment

**Independent Test**: Create known number of worktrees and verify count displays correctly in output. This delivers value by answering "how many worktrees do I have?"

**Acceptance Scenarios**:
1. 5 worktrees shows "5 worktrees found" in summary
2. No additional worktrees shows "0 additional worktrees found"

### Implementation for User Story 4

- [X] T024 [US4] Update formatAsTable() in repos/arashi/src/core/list.ts to include worktree count in header
- [X] T025 [US4] Ensure "No additional worktrees" message includes count and helpful suggestion in formatAsTable()

**Checkpoint**: All user stories complete - count summary displays in all output modes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T026 [P] Add JSDoc comments to all exported functions in repos/arashi/src/core/list.ts
- [X] T027 [P] Add help text examples to command registration in repos/arashi/src/commands/list.ts
- [X] T028 Verify performance targets: < 2 seconds for 50 worktrees, < 5 seconds verbose mode
- [X] T029 [P] Add error handling for edge cases (permission errors, corrupted worktrees, unmounted paths)
- [X] T030 Run `bun run lint` and fix any TypeScript errors
- [X] T031 Run `bun run build` and verify single-file executable builds successfully
- [X] T032 Validate against quickstart.md manual testing scenarios
- [X] T033 Run Constitution compliance check against all 10 principles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T004) - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion (T005-T009)
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
  - Tasks T010-T015 must complete for basic list functionality
  
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on US1 but independently testable
  - Requires T010 (gatherWorktreeData) and T012 (formatAsTable) from US1 to extend
  - Tasks T016-T020 add verbose mode capabilities
  
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Fully independent of US1/US2
  - Only requires buildListOutput() structure from T013
  - Tasks T021-T023 add JSON output format
  
- **User Story 4 (P3)**: Depends on US1 completion (needs formatAsTable from T012)
  - Tasks T024-T025 enhance existing output with count

### Within Each User Story

- Setup tasks before foundational tasks
- Foundational tasks before any user story implementation
- Helper functions (T006-T007) before data gathering (T010)
- Data gathering (T010) before formatting (T012)
- Core implementation (T014) before command registration wiring (T015)
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: All tasks (T001-T004) can run in parallel (different files)
- **Phase 2 Foundational**: Tasks T006-T009 can all run in parallel (helper functions in same file, different functions)
- **Phase 3 User Story 1**: Tasks T010-T011 can run in parallel (independent functions)
- **Phase 4 User Story 2**: Tasks T016-T017 can run in parallel (independent discovery functions)
- **Phase 7 Polish**: Tasks T026, T027, T029 can run in parallel (different concerns)

- **Once Foundational phase completes**: US1, US2, and US3 can start in parallel by different team members
  - US1: Developer A implements basic listing (T010-T015)
  - US2: Developer B implements sub-repo discovery (T016-T017, waits for T012 from US1 for T018)
  - US3: Developer C implements JSON output (T021-T023, waits for T013 from US1)

---

## Parallel Example: User Story 1

```bash
# After Phase 2 (Foundational) completes, launch these tasks together:

# Developer A: Core data gathering
Task: "Implement gatherWorktreeData() function in repos/arashi/src/core/list.ts"

# Developer B: Status formatting (can work independently)
Task: "Implement formatStatus() helper function in repos/arashi/src/core/list.ts"

# Once both complete, developer can continue with:
Task: "Implement formatAsTable() function..." (needs formatStatus from T011)
Task: "Implement buildListOutput() orchestration..." (needs gatherWorktreeData from T010)
```

---

## Parallel Example: Multiple User Stories

```bash
# After Foundational phase (T005-T009) completes:

# Team can split work across user stories:

# Developer A (US1 - MVP Priority):
Task: "Implement gatherWorktreeData() in repos/arashi/src/core/list.ts"
Task: "Implement formatAsTable() in repos/arashi/src/core/list.ts"
# ... continue with US1 tasks

# Developer B (US2 - Verbose Mode):
Task: "Implement findGitRepositories() in repos/arashi/src/core/list.ts"
Task: "Implement discoverSubRepositories() in repos/arashi/src/core/list.ts"
# ... waits for T012 completion, then extends formatAsTable

# Developer C (US3 - JSON Output):
Task: "Implement formatAsJson() in repos/arashi/src/core/list.ts"
# ... waits for T013 completion, then adds JSON output path
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (T010-T015)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Run `arashi list` in repository with multiple worktrees
   - Verify table output displays all worktrees correctly
   - Verify status indicators work (✓/✗/🔒)
   - Test "no worktrees" scenario
5. Deploy/demo if ready - **MVP COMPLETE!**

### Incremental Delivery

1. Complete Setup + Foundational (T001-T009) → Foundation ready
2. Add User Story 1 (T010-T015) → Test independently → Deploy/Demo (MVP!)
   - **Value delivered**: Users can see all worktrees at a glance
3. Add User Story 2 (T016-T020) → Test independently → Deploy/Demo
   - **Value delivered**: Users can understand nested repository structure
4. Add User Story 3 (T021-T023) → Test independently → Deploy/Demo
   - **Value delivered**: Automation and tool integration enabled
5. Add User Story 4 (T024-T025) → Test independently → Deploy/Demo
   - **Value delivered**: Quick workspace scale assessment
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Phase 1-2 together** (T001-T009): Team completes Setup + Foundational together
   - Critical path: Must be done sequentially or with tight coordination
   - Estimated time: 1-2 hours
   
2. **Phase 3-5 in parallel** once Foundational is done:
   - **Developer A**: User Story 1 (T010-T015) - **HIGHEST PRIORITY (MVP)**
   - **Developer B**: User Story 2 (T016-T017) in parallel, then waits for T012 to extend
   - **Developer C**: User Story 3 (T021-T023) - fully independent, waits only for T013
   
3. **Phase 6** (US4): Quick add-on after US1 completes (T024-T025)

4. **Phase 7** (Polish): Team completes together after all desired stories done

**Critical Path**: Setup → Foundational → US1 (core value) → US2/US3 (enhancements) → US4 (polish)

**Fastest Path to MVP**: Focus all resources on Setup → Foundational → User Story 1 (T001-T015)

---

## Notes

- **[P] tasks**: Different files or independent functions, no dependencies
- **[Story] label**: Maps task to specific user story for traceability
- **No tests included**: Tests not explicitly requested in spec.md
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Verify `bun run build` and `bun run lint` pass after major changes
- Follow checklist format strictly: `- [ ] [ID] [P?] [Story?] Description with file path`

---

## File Path Reference

All implementation in `repos/arashi/` directory:

- **Types**: `repos/arashi/src/types/list.ts`
- **Core Logic**: `repos/arashi/src/core/list.ts`
- **Command**: `repos/arashi/src/commands/list.ts`
- **CLI Registration**: `repos/arashi/src/index.ts`
- **Existing Libraries**: 
  - `repos/arashi/src/lib/git.ts` (listWorktrees, getStatus, getCurrentBranch)
  - `repos/arashi/src/lib/config.ts` (loadConfig)
  - `repos/arashi/src/lib/logger.ts` (log, spinner)
  - `repos/arashi/src/lib/filesystem.ts` (if needed for discovery)

---

## Task Summary

- **Total Tasks**: 33
- **Setup (Phase 1)**: 4 tasks (T001-T004)
- **Foundational (Phase 2)**: 5 tasks (T005-T009)
- **User Story 1 (P1)**: 6 tasks (T010-T015) 🎯 MVP
- **User Story 2 (P2)**: 5 tasks (T016-T020)
- **User Story 3 (P2)**: 3 tasks (T021-T023)
- **User Story 4 (P3)**: 2 tasks (T024-T025)
- **Polish (Phase 7)**: 8 tasks (T026-T033)

**Parallel Opportunities Identified**: 14 tasks marked with [P]

**MVP Scope (Recommended)**: Setup + Foundational + User Story 1 (15 tasks total)

**Independent Test Criteria**:
- **US1**: Create worktrees, run `arashi list`, verify table output
- **US2**: Create nested repos, run `arashi list --verbose`, verify sub-repo display
- **US3**: Run `arashi list --json`, verify valid JSON, pipe to jq/fzf
- **US4**: Run `arashi list`, verify count in header

---

## Format Validation ✅

All tasks follow the required checklist format:
- ✅ Checkbox (`- [ ]`) at start
- ✅ Task ID ([T001]-[T033]) in execution order
- ✅ [P] marker on parallelizable tasks (14 tasks)
- ✅ [Story] label on user story tasks ([US1], [US2], [US3], [US4])
- ✅ Clear description with exact file path
- ✅ No story label on Setup/Foundational/Polish phases (correct)

**Validation complete**: All 33 tasks conform to specification.
