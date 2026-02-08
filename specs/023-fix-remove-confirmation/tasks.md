# Tasks: Fix Remove Command Confirmation

**Input**: Design documents from `/specs/023-fix-remove-confirmation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested (no test tasks included).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared prompt infrastructure required by multiple stories

- [X] T001 Add prompt outcome types and cancellation-safe wrappers in `repos/arashi/src/lib/prompts.ts`
- [X] T002 [P] Add non-interactive remove error code in `repos/arashi/src/lib/errors.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared remove-flow handling that blocks all user stories

- [X] T003 Integrate prompt outcome handling into remove flow in `repos/arashi/src/commands/remove.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Select worktrees to remove (Priority: P1) 🎯 MVP

**Goal**: Keep interactive selection open until submit/cancel and avoid early exit.

**Independent Test**: Run `arashi remove`, select worktrees, submit, and verify the command proceeds to confirmation; submit with no selection and verify a clear message with a clean exit.

### Implementation for User Story 1

- [X] T004 [US1] Keep selection flow open after submit and avoid premature exit in `repos/arashi/src/commands/remove.ts`
- [X] T005 [US1] Emit a clear message when no selection is made and return a controlled exit in `repos/arashi/src/commands/remove.ts`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Confirm removal when a branch is provided (Priority: P2)

**Goal**: Always prompt for confirmation when a branch is provided unless forced.

**Independent Test**: Run `arashi remove <branch>`, confirm that a prompt appears before any removal; decline and verify no worktrees are removed.

### Implementation for User Story 2

- [X] T006 [US2] Ensure branch-argument removal always prompts for confirmation and respects decline in `repos/arashi/src/commands/remove.ts`

**Checkpoint**: User Story 2 is fully functional and independently testable

---

## Phase 5: User Story 3 - Clear behavior in non-interactive runs (Priority: P3)

**Goal**: Fail fast with a clear message when prompts cannot run.

**Independent Test**: Run `echo "y" | arashi remove` and verify a clear non-interactive error with non-success exit.

### Implementation for User Story 3

- [X] T007 [US3] Guard all prompt entry points with a TTY check and throw a clear error in `repos/arashi/src/commands/remove.ts`
- [X] T008 [US3] Map the non-interactive error to clean CLI output/exit codes in `repos/arashi/src/commands/remove.ts`

**Checkpoint**: User Story 3 is fully functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and cross-cutting refinements

- [X] T009 [P] Update remove command usage notes for non-interactive behavior in `repos/arashi/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other stories
- **User Story 2 (P2)**: Can start after Foundational - no dependency on other stories
- **User Story 3 (P3)**: Can start after Foundational - no dependency on other stories

### Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel
- **Polish**: T009 can run in parallel with any user story after code changes stabilize

---

## Parallel Example: User Story 1

```bash
# No parallel tasks within US1 (single file flow changes)
Task: "Keep selection flow open after submit" (repos/arashi/src/commands/remove.ts)
Task: "Emit clear message on empty selection" (repos/arashi/src/commands/remove.ts)
```

---

## Parallel Example: User Story 2

```bash
# No parallel tasks within US2 (single file flow changes)
Task: "Ensure confirmation for branch removal" (repos/arashi/src/commands/remove.ts)
```

---

## Parallel Example: User Story 3

```bash
# No parallel tasks within US3 (single file flow changes)
Task: "Guard prompts with TTY check" (repos/arashi/src/commands/remove.ts)
Task: "Map non-interactive error output" (repos/arashi/src/commands/remove.ts)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **Stop and validate**: Run the US1 independent test

### Incremental Delivery

1. Setup + Foundational
2. User Story 1 → validate
3. User Story 2 → validate
4. User Story 3 → validate
5. Polish documentation updates

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story is independently completable and testable
