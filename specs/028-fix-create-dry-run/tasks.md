---

description: "Task list for fix create --dry-run"
---

# Tasks: Fix create --dry-run

**Input**: Design documents from `specs/028-fix-create-dry-run/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the specification; no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm existing command wiring and entry points

- [x] T001 Review dry-run option wiring in `repos/arashi/src/commands/create.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core dry-run planning and non-mutating behavior shared by all stories

- [x] T002 Add dry-run planning types (PlannedWorktree, Conflict, DryRunOutcome) in `repos/arashi/src/core/worktree.ts`
- [x] T003 Implement non-mutating plan builder using existing path calculation in `repos/arashi/src/core/worktree.ts`
- [x] T004 Gate hook execution and git mutations behind dry-run checks in `repos/arashi/src/core/worktree.ts`

**Checkpoint**: Dry-run can compute a plan without side effects

---

## Phase 3: User Story 1 - Preview planned changes (Priority: P1) 🎯 MVP

**Goal**: Show planned worktrees/branches without making changes.

**Independent Test**: Run `create --dry-run` and verify listed worktrees/branches match a real create plan while state remains unchanged.

### Implementation for User Story 1

- [x] T005 [US1] Expose planned worktree list from dry-run summary in `repos/arashi/src/core/worktree.ts`
- [x] T006 [US1] Render planned worktrees/branches in dry-run output in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 1 is fully functional and independently testable

---

## Phase 4: User Story 2 - Surface blocking conflicts (Priority: P2)

**Goal**: Report conflicts that would block creation in dry-run output.

**Independent Test**: Run `create --dry-run` with an existing worktree path or branch and verify conflicts are listed without changes.

### Implementation for User Story 2

- [x] T007 [US2] Attach conflict details to dry-run outcome in `repos/arashi/src/core/worktree.ts`
- [x] T008 [US2] Render conflict warnings in dry-run output in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 2 is fully functional and independently testable

---

## Phase 5: User Story 3 - Understand dry-run outcomes (Priority: P3)

**Goal**: Indicate whether the dry-run plan is actionable or blocked.

**Independent Test**: Run `create --dry-run` in clean and conflicting scenarios and verify actionable/blocked status.

### Implementation for User Story 3

- [x] T009 [US3] Add actionable/blocked status summary in `repos/arashi/src/commands/create.ts`
- [x] T010 [US3] Return blocked outcome exit code for dry-run conflicts in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 3 is fully functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and validation updates

- [x] T011 [P] Update CLI documentation for dry-run behavior in `repos/arashi/README.md`
- [x] T012 [P] Validate quickstart steps and adjust wording in `specs/028-fix-create-dry-run/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3-5)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - independent of US1
- **User Story 3 (P3)**: Can start after Foundational - independent of US1/US2

### Parallel Opportunities

- T011 and T012 can run in parallel with each other
- User Story phases can be worked in parallel after Foundational, but avoid simultaneous edits to `repos/arashi/src/commands/create.ts`

---

## Parallel Example: User Story 2

```bash
# Work in parallel on separate files:
Task: "Attach conflict details to dry-run outcome in repos/arashi/src/core/worktree.ts"
Task: "Update CLI documentation for dry-run behavior in repos/arashi/README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate dry-run preview output and no side effects

### Incremental Delivery

1. Add User Story 1 → Validate preview output
2. Add User Story 2 → Validate conflict reporting
3. Add User Story 3 → Validate actionable/blocked status
4. Finish polish tasks

---

## Notes

- [P] tasks = different files, no dependencies
- Each user story should be independently completable and testable
- Avoid simultaneous edits to `repos/arashi/src/commands/create.ts` across stories
