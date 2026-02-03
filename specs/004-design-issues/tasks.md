# Tasks: Complete Design Phase Documentation (D1-D7)

**Input**: Design documents from `/specs/004-design-issues/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), quickstart.md (complete)

**Tests**: Not applicable - this is a documentation feature validated through manual review checklists

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each design document set.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All deliverables go to `specs/001-git-worktree-manager/` directory (the main Arashi feature spec location).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and validation framework

- [ ] T001 Create contracts directory at specs/001-git-worktree-manager/contracts/
- [ ] T002 Create checklists directory at specs/001-git-worktree-manager/checklists/
- [ ] T003 [P] Create design-review checklist template at specs/001-git-worktree-manager/checklists/design-review.md with sections for all 7 documents (D1-D7)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data model that other contracts depend on

**⚠️ CRITICAL**: CLI contracts (D3), Git API (D4), and Orchestration (D5) all depend on these type definitions

- [ ] T004 [US1] Create data-model.md file at specs/001-git-worktree-manager/data-model.md with document header and structure
- [ ] T005 [US1] Document Configuration Schema (D1) section in data-model.md: config.json structure with fields (version, repos_dir, worktree_strategy, auto_setup, discovered_repos)
- [ ] T006 [US1] Add discovered_repos structure definition in data-model.md: { [name]: { path, default_branch, remote, has_setup_script, git_url } }
- [ ] T007 [US1] Add validation rules table in data-model.md: field | type | required | default | validation constraints
- [ ] T008 [US1] Add configuration version migration path section in data-model.md: v1.0.0 → future versions strategy
- [ ] T009 [US1] Add complete example configuration with inline comments in data-model.md
- [ ] T010 [US1] Document Type Definitions (D2) section in data-model.md: ArashiConfig interface matching config schema
- [ ] T011 [US1] Add RepoConfig interface definition in data-model.md with field descriptions
- [ ] T012 [US1] Add WorktreeInfo interface in data-model.md: path, branch, status, sub_repos fields
- [ ] T013 [US1] Add OperationLogEntry interface in data-model.md: type, data, rollback function for rollback tracking
- [ ] T014 [US1] Add command option interfaces in data-model.md: InitOptions, CreateOptions, RemoveOptions, ListOptions, StatusOptions, SetupOptions
- [ ] T015 [US1] Add ArashiError class definition in data-model.md: extends Error with exitCode property and exit codes (0, 1, 2)
- [ ] T016 [US1] Add HookContext interface definition in data-model.md: environment variables for hook execution
- [ ] T017 [US1] Add design decisions section to data-model.md: configuration versioning, type safety strategy, interface vs type choices
- [ ] T018 [US1] Review data-model.md against D1 checklist items (all fields, validation, defaults, example, migration)
- [ ] T019 [US1] Review data-model.md against D2 checklist items (all interfaces, types match schema, ArashiError, command options)

**Checkpoint**: Data model complete - contract documentation can now reference these types

---

## Phase 3: User Story 1 - Core Architecture Documentation (Priority: P1) 🎯 MVP

**Goal**: Complete D1 (Configuration Schema), D2 (Type System), and D3 (CLI Command Contracts) so developers can implement configuration loading and CLI commands

**Independent Test**: Developer can reference data-model.md and cli-commands.md to implement config loading and all 7 CLI commands without clarification questions

### Implementation for User Story 1

**Note**: D1 and D2 are already completed in Phase 2 (data-model.md). This phase adds D3.

- [ ] T020 [US1] Create cli-commands.md at specs/001-git-worktree-manager/contracts/cli-commands.md with document header
- [ ] T021 [US1] Add exit codes table to cli-commands.md: 0=success, 1=error, 2=user abort with descriptions
- [ ] T022 [P] [US1] Document arashi init command in cli-commands.md: signature, description, options (--repos-dir, --no-auto-setup), behavior, examples
- [ ] T023 [P] [US1] Document arashi add command in cli-commands.md: signature, description, arguments (git-url, name), options (--branch, --no-setup-template), behavior, examples
- [ ] T024 [P] [US1] Document arashi create command in cli-commands.md: signature, description, arguments (branch), options (-i, --only, --path, --no-setup, --no-track), behavior, examples
- [ ] T025 [P] [US1] Document arashi remove command in cli-commands.md: signature, description, arguments (branch), options (-k, -w, -f, --no-check-dirty), behavior, examples
- [ ] T026 [P] [US1] Document arashi list command in cli-commands.md: signature, description, options (-v, --json), behavior, examples
- [ ] T027 [P] [US1] Document arashi status command in cli-commands.md: signature, description, options (-v, -s), behavior, examples
- [ ] T028 [P] [US1] Document arashi setup command in cli-commands.md: signature, description, options (--only, --parallel, -v), behavior, examples
- [ ] T029 [US1] Add help text format examples for each command in cli-commands.md
- [ ] T030 [US1] Add design decisions section to cli-commands.md: POSIX conventions, flag patterns, output formats
- [ ] T031 [US1] Review cli-commands.md against D3 checklist items (all 7 commands, signatures, exit codes, help text, examples)

**Checkpoint**: Core architecture documents complete (D1, D2, D3) - developers can begin implementing configuration and CLI layer

---

## Phase 4: User Story 2 - Technical Contract Documentation (Priority: P1)

**Goal**: Complete D4 (Git Wrapper API) and D5 (Worktree Orchestration) so developers can implement git operations and multi-repo coordination

**Independent Test**: Developer can reference git-api.md and worktree-orchestration.md to implement all git operations and worktree coordination without clarification questions

### Implementation for User Story 2

- [ ] T032 [P] [US2] Create git-api.md at specs/001-git-worktree-manager/contracts/git-api.md with document header and purpose
- [ ] T033 [US2] Add git command execution wrapper design section to git-api.md: Bun.spawn approach with stdio capture
- [ ] T034 [US2] Add error handling strategy section to git-api.md: throw ArashiError with git output in message
- [ ] T035 [P] [US2] Document repository detection functions in git-api.md: isGitRepository, isGitBareRepo, findGitRoot with signatures and behavior
- [ ] T036 [P] [US2] Document worktree operation functions in git-api.md: createWorktree, removeWorktree, listWorktrees with signatures and behavior
- [ ] T037 [P] [US2] Document branch operation functions in git-api.md: branchExists, createBranch, deleteBranch with signatures and behavior
- [ ] T038 [P] [US2] Document remote operation functions in git-api.md: fetchLatest, setUpstreamTracking with signatures and behavior
- [ ] T039 [P] [US2] Document status operation functions in git-api.md: getStatus, getDefaultBranch, getCurrentBranch with signatures and behavior
- [ ] T040 [US2] Add git output parsing specifications section to git-api.md: worktree list --porcelain, status --porcelain, branch --list, show-ref formats
- [ ] T041 [US2] Add implementation notes section to git-api.md: async operations, porcelain formats, command building patterns
- [ ] T042 [US2] Review git-api.md against D4 checklist items (all functions, error handling, wrapper design, parsing strategies)
- [ ] T043 [P] [US2] Create worktree-orchestration.md at specs/001-git-worktree-manager/contracts/worktree-orchestration.md with document header
- [ ] T044 [US2] Add worktree creation flow diagram to worktree-orchestration.md: validate → fetch → create main → create sub-repos → run setup
- [ ] T045 [US2] Add step-by-step creation flow description to worktree-orchestration.md with detailed behavior for each step
- [ ] T046 [US2] Add OperationLog structure section to worktree-orchestration.md: { type, data, rollback }[] with examples
- [ ] T047 [US2] Add rollback mechanism section to worktree-orchestration.md: reverse iteration algorithm with error handling
- [ ] T048 [US2] Add branch conflict resolution section to worktree-orchestration.md: detection logic and dialog flow (use existing, create new with suffix, abort)
- [ ] T049 [US2] Add repository selection logic section to worktree-orchestration.md: all (default), --only filter, -i interactive mode
- [ ] T050 [US2] Add setup script execution section to worktree-orchestration.md: sequential vs parallel strategies with --parallel flag
- [ ] T051 [US2] Add error aggregation section to worktree-orchestration.md: collection approach, summary display, rollback trigger
- [ ] T052 [US2] Add design decisions section to worktree-orchestration.md: transaction semantics, fail fast, user control, parallel safety
- [ ] T053 [US2] Review worktree-orchestration.md against D5 checklist items (flow, OperationLog, rollback, conflict resolution, repository selection)

**Checkpoint**: Technical contracts complete (D4, D5) - developers can begin implementing git wrapper and worktree orchestration

---

## Phase 5: User Story 3 - Extensibility and Developer Onboarding (Priority: P2)

**Goal**: Complete D6 (Hook System) and D7 (Development Setup Guide) so users can extend Arashi and new contributors can onboard quickly

**Independent Test**: New contributor can follow quickstart.md to set up environment and create custom hooks using hook-system.md without external help

### Implementation for User Story 3

- [ ] T054 [P] [US3] Create hook-system.md at specs/001-git-worktree-manager/contracts/hook-system.md with document header
- [ ] T055 [US3] Add hook discovery section to hook-system.md: .arashi/hooks/ location with pre-create.sh, post-create.sh, setup.sh
- [ ] T056 [US3] Add hook validation section to hook-system.md: execute permission checking before running
- [ ] T057 [US3] Add hook execution order diagram to hook-system.md: pre-create → worktree operations → post-create → setup
- [ ] T058 [US3] Add environment variables table to hook-system.md: ARASHI_COMMAND, ARASHI_BRANCH, ARASHI_WORKTREE_PATH, ARASHI_REPOS_DIR, ARASHI_REPO_LIST with descriptions
- [ ] T059 [US3] Add timeout and failure handling section to hook-system.md: 5 minute default timeout, warn but continue (non-fatal)
- [ ] T060 [US3] Add output capture section to hook-system.md: stream to console with hook name prefix
- [ ] T061 [US3] Add --no-hooks flag section to hook-system.md: behavior when hooks are disabled
- [ ] T062 [US3] Add design decisions section to hook-system.md: convention-based locations, non-fatal failures, env var passing, security
- [ ] T063 [US3] Review hook-system.md against D6 checklist items (discovery, validation, execution order, env vars, timeout/failure)
- [ ] T064 [P] [US3] Create quickstart.md at specs/001-git-worktree-manager/quickstart.md with document header and overview
- [ ] T065 [US3] Add prerequisites section to quickstart.md: Bun, git requirements
- [ ] T066 [US3] Add Bun installation section to quickstart.md: curl -fsSL https://bun.sh/install | bash command for all platforms
- [ ] T067 [US3] Add repository structure section to quickstart.md: explain meta-repo pattern with repos/arashi/ sub-repo and diagram
- [ ] T068 [US3] Add dependency installation section to quickstart.md: cd repos/arashi && bun install workflow
- [ ] T069 [US3] Add development testing section to quickstart.md: bun run dev <command> usage with examples
- [ ] T070 [US3] Add test execution section to quickstart.md: bun test command with explanation
- [ ] T071 [US3] Add binary building section to quickstart.md: bun run build:all for cross-platform binaries
- [ ] T072 [US3] Add debugging setup section to quickstart.md: VS Code launch.json example configuration
- [ ] T073 [US3] Add contributing link section to quickstart.md: link to CONTRIBUTING.md with next steps
- [ ] T074 [US3] Add troubleshooting section to quickstart.md: common issues and solutions for new contributors
- [ ] T075 [US3] Review quickstart.md against D7 checklist items (Bun install, repo structure, dev workflow, tests, build, debugging)

**Checkpoint**: All design documents complete (D1-D7) - ready for final review and GitHub issue closure

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation completion

- [ ] T076 Update design-review.md checklist: mark all completed items based on document reviews
- [ ] T077 [P] Perform final validation of data-model.md: zero [NEEDS CLARIFICATION] markers, all FR-001 through FR-013 addressed
- [ ] T078 [P] Perform final validation of cli-commands.md: zero [NEEDS CLARIFICATION] markers, all FR-014 through FR-022 addressed
- [ ] T079 [P] Perform final validation of git-api.md: zero [NEEDS CLARIFICATION] markers, all FR-023 through FR-028 addressed
- [ ] T080 [P] Perform final validation of worktree-orchestration.md: zero [NEEDS CLARIFICATION] markers, all FR-029 through FR-035 addressed
- [ ] T081 [P] Perform final validation of hook-system.md: zero [NEEDS CLARIFICATION] markers, all FR-036 through FR-042 addressed
- [ ] T082 [P] Perform final validation of quickstart.md: zero [NEEDS CLARIFICATION] markers, all FR-043 through FR-050 addressed
- [ ] T083 Request peer review from at least one other contributor
- [ ] T084 Address review feedback and update documents as needed
- [ ] T085 [P] Close GitHub issue #7 (D1) with comment linking to data-model.md Configuration Schema section
- [ ] T086 [P] Close GitHub issue #8 (D2) with comment linking to data-model.md Type Definitions section
- [ ] T087 [P] Close GitHub issue #9 (D3) with comment linking to contracts/cli-commands.md
- [ ] T088 [P] Close GitHub issue #10 (D4) with comment linking to contracts/git-api.md
- [ ] T089 [P] Close GitHub issue #11 (D5) with comment linking to contracts/worktree-orchestration.md
- [ ] T090 [P] Close GitHub issue #12 (D6) with comment linking to contracts/hook-system.md
- [ ] T091 [P] Close GitHub issue #13 (D7) with comment linking to quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories (D1 + D2 define types needed by other docs)
- **User Story 1 (Phase 3)**: Depends on Foundational - D3 needs types from D2
- **User Story 2 (Phase 4)**: Depends on Foundational - D4 and D5 need types from D2
  - D5 also references D4 contracts
- **User Story 3 (Phase 5)**: Depends on Foundational - D6 needs HookContext from D2
  - D7 is independent and can be written anytime after Setup
- **Polish (Phase 6)**: Depends on all user story phases being complete

### User Story Dependencies

- **User Story 1 (D1, D2, D3)**: Foundation phase → US1 (sequential within US1: D1 → D2 → D3)
- **User Story 2 (D4, D5)**: Foundation phase → US2 (D4 and D5 can be done in parallel, though D5 references D4)
- **User Story 3 (D6, D7)**: Foundation phase → US3 (D6 and D7 can be done in parallel)

**Critical Path**: Setup → Foundation (D1, D2) → D3, D4, D5, D6 (all depend on types) → D7 (independent) → Polish

### Within Each User Story

**User Story 1**:
- T004-T019 must complete sequentially (building up data-model.md sections)
- T022-T028 can run in parallel ([P] marker - different command sections)
- T029-T031 must complete after command documentation

**User Story 2**:
- T032-T042 (git-api.md) can be done in parallel with T043-T053 (worktree-orchestration.md)
- Within git-api.md: T035-T039 can run in parallel ([P] marker - different function groups)
- Within worktree-orchestration.md: tasks are sequential (building up flow documentation)

**User Story 3**:
- T054-T063 (hook-system.md) can be done in parallel with T064-T075 (quickstart.md)
- Most tasks within each document are sequential (building up sections)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 can run in parallel with T001-T002 once directories exist

**Phase 2 (Foundational)**:
- Tasks are sequential (building up data-model.md)

**Phase 3 (User Story 1)**:
- T022-T028: All 7 CLI commands can be documented in parallel

**Phase 4 (User Story 2)**:
- T032-T042 and T043-T053 can run in parallel (git-api.md vs worktree-orchestration.md)
- T035-T039: Function groups within git-api.md can be documented in parallel

**Phase 5 (User Story 3)**:
- T054-T063 and T064-T075 can run in parallel (hook-system.md vs quickstart.md)

**Phase 6 (Polish)**:
- T077-T082: All validation tasks can run in parallel
- T085-T091: All GitHub issue closures can run in parallel

---

## Parallel Example: User Story 1 (D3 - CLI Commands)

```bash
# After data-model.md is complete, launch all CLI command documentation tasks together:
Task T022: "Document arashi init command in cli-commands.md"
Task T023: "Document arashi add command in cli-commands.md"
Task T024: "Document arashi create command in cli-commands.md"
Task T025: "Document arashi remove command in cli-commands.md"
Task T026: "Document arashi list command in cli-commands.md"
Task T027: "Document arashi status command in cli-commands.md"
Task T028: "Document arashi setup command in cli-commands.md"
```

## Parallel Example: User Story 2 (D4 + D5)

```bash
# Both contracts can be written in parallel (though D5 may reference D4):
Task T032-T042: "Complete git-api.md"
Task T043-T053: "Complete worktree-orchestration.md"

# Within git-api.md, function groups can be documented in parallel:
Task T035: "Document repository detection functions"
Task T036: "Document worktree operation functions"
Task T037: "Document branch operation functions"
Task T038: "Document remote operation functions"
Task T039: "Document status operation functions"
```

## Parallel Example: User Story 3 (D6 + D7)

```bash
# Both documents are independent and can be written in parallel:
Task T054-T063: "Complete hook-system.md"
Task T064-T075: "Complete quickstart.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T019) - Creates data-model.md with D1 + D2
3. Complete Phase 3: User Story 1 (T020-T031) - Creates cli-commands.md with D3
4. **STOP and VALIDATE**: Review data-model.md and cli-commands.md against checklists
5. **MVP DELIVERED**: Developers can now implement configuration loading and CLI commands

**Why this is MVP**: D1, D2, and D3 provide the foundational contracts needed for any Arashi implementation work. With these three documents, developers can:
- Set up configuration management (D1)
- Write type-safe TypeScript code (D2)
- Implement all CLI commands (D3)

### Incremental Delivery

1. **Foundation** (Setup + Phase 2): data-model.md → D1 + D2 complete
2. **+ User Story 1** (Phase 3): cli-commands.md → D1 + D2 + D3 complete → MVP delivered
3. **+ User Story 2** (Phase 4): git-api.md + worktree-orchestration.md → D1-D5 complete → Core contracts ready
4. **+ User Story 3** (Phase 5): hook-system.md + quickstart.md → D1-D7 complete → Full design documentation ready
5. Each increment adds value without breaking previous deliverables

### Parallel Team Strategy

With multiple contributors:

1. **Everyone**: Complete Setup + Foundational together (T001-T019)
2. **Once Foundational is done** (data-model.md complete):
   - **Contributor A**: User Story 1 - CLI Commands (T020-T031)
   - **Contributor B**: User Story 2 - Git API + Orchestration (T032-T053)
   - **Contributor C**: User Story 3 - Hooks + Quickstart (T054-T075)
3. All three stories can progress in parallel since they depend only on data-model.md (completed in Foundational phase)
4. **Everyone**: Polish phase together (T076-T091)

---

## Notes

- **[P] marker**: Tasks that can run in parallel (different sections/files, no sequential dependencies)
- **[US#] marker**: Maps each task to its user story (US1, US2, US3) for traceability
- **File paths**: All paths are absolute and reference the target location (specs/001-git-worktree-manager/)
- **No tests**: This is documentation work validated through manual review checklists, not automated tests
- **Validation approach**: Each document reviewed against GitHub issue acceptance criteria via design-review.md checklist
- **Commit strategy**: Commit after completing each document (e.g., after T019, T031, T042, etc.)
- **Independent deliverables**: Each user story produces complete, usable documentation that stands alone
- **Cross-references**: Documents may reference each other (e.g., D5 references D4), but each is independently readable

## Task Count Summary

- **Total Tasks**: 91
- **Setup (Phase 1)**: 3 tasks
- **Foundational (Phase 2)**: 16 tasks (D1 + D2 in data-model.md)
- **User Story 1 (Phase 3)**: 12 tasks (D3 in cli-commands.md)
- **User Story 2 (Phase 4)**: 22 tasks (D4 + D5 in git-api.md and worktree-orchestration.md)
- **User Story 3 (Phase 5)**: 22 tasks (D6 + D7 in hook-system.md and quickstart.md)
- **Polish (Phase 6)**: 16 tasks (validation and GitHub issue closure)

## Parallel Opportunities Summary

- **Phase 1**: 1 parallel opportunity (T003 with T001-T002)
- **Phase 3**: 7 parallel tasks (T022-T028 - all CLI commands)
- **Phase 4**: 2 parallel tracks (git-api.md vs worktree-orchestration.md) + 5 parallel tasks within git-api.md
- **Phase 5**: 2 parallel tracks (hook-system.md vs quickstart.md)
- **Phase 6**: 6 + 7 = 13 parallel tasks (validation + GitHub closures)

**Total parallel opportunities**: ~30 tasks can be executed in parallel given sufficient contributors

## Success Criteria Validation

Each task ensures one or more success criteria from spec.md:

- **SC-001** (All documents exist): T004, T020, T032, T043, T054, T064 create all 7 documents
- **SC-002** (100% checklist pass): T018-T019, T031, T042, T053, T063, T075 review against checklists
- **SC-003** (Zero clarifications): T077-T082 validate no [NEEDS CLARIFICATION] markers
- **SC-004** (Implementation teams can use): Validated through document completeness and examples
- **SC-005** (GitHub issues closed): T085-T091 close all 7 issues with deliverable links
- **SC-006** (Peer review): T083-T084 ensure contributor approval

---

**Format Validation**: ✅ All tasks follow the required checklist format with checkboxes, task IDs, [P] markers for parallelizable tasks, [Story] labels for user story phases, and file paths in descriptions.
