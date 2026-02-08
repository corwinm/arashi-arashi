---

description: "Task list for Remove Command implementation"
---

# Tasks: Remove Command

**Input**: Design documents from `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/specs/021-remove-command/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Required (spec.md mandates user scenario testing and plan.md requires integration tests)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create command entry points and wiring

- [x] T001 Create remove command skeleton with CLI signature and options in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T002 Register remove command in CLI entrypoint `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, errors, and core helpers used by all user stories

**⚠️ CRITICAL**: Complete this phase before starting any user story

- [x] T003 [P] Add remove-specific error codes and error class in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/lib/errors.ts`
- [x] T004 [P] Define remove command types (WorktreeInfo, RemovalOperation, RemovalSummary, RemoveCommandOptions) in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/types/remove.ts`
- [x] T005 Implement worktree discovery + porcelain parsing helper in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/core/remove.ts`
- [x] T006 Implement dirty status detection utilities in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/core/remove.ts`
- [x] T007 Implement worktree removal helper (git worktree remove with force/locked retry) and branch deletion helper in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/core/remove.ts`
- [x] T008 Implement removal summary aggregation and formatter helpers (human + JSON) in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/core/remove.ts`

**Checkpoint**: Foundation ready for user story implementation

---

## Phase 3: User Story 1 - Remove Single Branch with All Resources (Priority: P1) 🎯 MVP

**Goal**: Remove all worktrees and branches for a specified branch across main and sub-repositories with confirmation and clear output.

**Independent Test**: Create a worktree for a branch across multiple repos, run `arashi remove <branch>`, verify all worktrees and branches are removed and output lists all removed items.

### Tests for User Story 1

- [x] T009 [P] [US1] Add integration test for single-branch removal flow in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us1.test.ts`

### Implementation for User Story 1

- [x] T010 [US1] Implement single-branch execution path (load config, resolve repositories, validate branch presence) in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T011 [US1] Orchestrate confirmation, worktree removal, and branch deletion using core helpers in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T012 [US1] Add human-readable success/partial-failure output listing removed worktrees/branches in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T013 [US1] Implement JSON output format for success and error cases in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`

**Checkpoint**: User Story 1 fully functional and independently testable

---

## Phase 4: User Story 2 - Remove Multiple Branches (Priority: P1)

**Goal**: Allow multi-branch selection when no branch argument is provided, including cancel handling.

**Independent Test**: Run `arashi remove` with no args, select multiple branches, confirm removal of all selected branches; cancel leaves workspace unchanged.

### Tests for User Story 2

- [x] T014 [P] [US2] Add integration test for interactive multi-select removal in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us2.test.ts`

### Implementation for User Story 2

- [x] T015 [US2] Implement no-arg checkbox selection flow using @inquirer/prompts in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T016 [US2] Handle cancel/no-selection exit path with graceful messaging in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T017 [US2] Format selection choices with repo counts and clean/dirty status in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`

**Checkpoint**: User Story 2 independently functional

---

## Phase 5: User Story 3 - Safe Removal with Dirty Check (Priority: P2)

**Goal**: Warn on uncommitted changes and allow bypass via `--no-check-dirty`.

**Independent Test**: Create a dirty worktree, run `arashi remove <branch>`, confirm warning prompt and proceed only after confirmation; verify `--no-check-dirty` skips warning.

### Tests for User Story 3

- [x] T018 [P] [US3] Add integration test for dirty warning confirmation flow in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us3.dirty.test.ts`
- [x] T019 [P] [US3] Add integration test for `--no-check-dirty` bypass in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us3.no-check.test.ts`

### Implementation for User Story 3

- [x] T020 [US3] Execute dirty checks and show warning confirmation when needed in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`
- [x] T021 [US3] Wire `--no-check-dirty` option to skip dirty checks in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`

**Checkpoint**: User Story 3 independently functional

---

## Phase 6: User Story 4 - Selective Removal with Flags (Priority: P3)

**Goal**: Support `--keep-worktrees` and `--keep-branches` for selective removal and no-op when both set.

**Independent Test**: Run `arashi remove <branch> --keep-worktrees` and verify only branches are deleted; run `--keep-branches` and verify only worktrees are removed; use both flags and verify no removal occurs.

### Tests for User Story 4

- [x] T022 [P] [US4] Add integration test for `--keep-worktrees` behavior in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us4.keep-worktrees.test.ts`
- [x] T023 [P] [US4] Add integration test for `--keep-branches` behavior in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us4.keep-branches.test.ts`
- [x] T024 [P] [US4] Add integration test for no-op when both keep flags are set in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us4.noop.test.ts`

### Implementation for User Story 4

- [x] T025 [US4] Implement keep-worktrees/keep-branches logic and no-op messaging in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`

**Checkpoint**: All user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality, docs, and edge-case handling across stories

- [x] T026 [P] Add unit tests for core remove helpers (parsing, dirty status, summary) in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/unit/remove.core.test.ts`
- [x] T027 [P] Add user-facing remove command documentation in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/docs/commands/remove.md`
- [x] T028 Add edge-case messaging (branch not found, main worktree skipped, worktree in use) in `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/src/commands/remove.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup; blocks all user stories
- **User Stories (Phase 3-6)**: Depend on Foundational
- **Polish (Phase 7)**: Depends on completion of desired user stories

### User Story Dependencies (Graph)

- **US1 (P1)** → **US2 (P1)** → **US3 (P2)** → **US4 (P3)**
- US2/US3/US4 can start after Foundational if staffed, but follow priority order for MVP delivery

### Parallel Opportunities

- Setup: none
- Foundational: T003 and T004 can run in parallel
- US1/US2/US3/US4 tests can run in parallel (distinct files)
- Polish: T026 and T027 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add integration test for single-branch removal flow in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us1.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Add integration test for interactive multi-select removal in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us2.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "Add integration test for dirty warning confirmation flow in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us3.dirty.test.ts"
Task: "Add integration test for --no-check-dirty bypass in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us3.no-check.test.ts"
```

## Parallel Example: User Story 4

```bash
Task: "Add integration test for --keep-worktrees behavior in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us4.keep-worktrees.test.ts"
Task: "Add integration test for --keep-branches behavior in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us4.keep-branches.test.ts"
Task: "Add integration test for no-op when both keep flags are set in /Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/repos/arashi/tests/integration/remove.us4.noop.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate User Story 1 independently (integration test + manual run)

### Incremental Delivery

1. Setup + Foundational
2. US1 → Test → Demo
3. US2 → Test → Demo
4. US3 → Test → Demo
5. US4 → Test → Demo

### Parallel Team Strategy

1. Team completes Setup + Foundational
2. Parallelize US2/US3/US4 implementation after MVP if needed

---

## Notes

- [P] tasks indicate safe parallel work (different files)
- All user stories are independently testable via their integration tests
- Keep CLI behavior aligned with `/Users/corwin/Documents/GitHub/arashi-arashi.git/remove-command/specs/021-remove-command/contracts/command-interface.md`
