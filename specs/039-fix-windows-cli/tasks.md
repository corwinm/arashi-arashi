---

description: "Task list for Windows CLI Compatibility"
---

# Tasks: Windows CLI Compatibility

**Input**: Design documents from `/specs/039-fix-windows-cli/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current entrypoints and constraints before changes

- [x] T001 Inventory current npm bin entrypoints in `repos/arashi/bin/` and `repos/arashi/package.json`
- [x] T002 Capture current CLI startup flow in `repos/arashi/src/cli/` for baseline behavior

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core launcher infrastructure required for all Windows stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Define shell detection utility in `repos/arashi/src/lib/windows-shell.ts`
- [x] T004 Implement Windows launcher selector in `repos/arashi/src/cli/windows-launcher.ts`
- [x] T005 Wire launcher selector into CLI startup path in `repos/arashi/src/cli/index.ts`
- [x] T006 Add install context resolution for global vs local npm installs in `repos/arashi/src/lib/install-context.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Run CLI in PowerShell after npm install (Priority: P1) 🎯 MVP

**Goal**: The CLI launches successfully in PowerShell after npm install.

**Independent Test**: Install via npm on Windows and run a basic command in PowerShell with successful output.

### Implementation for User Story 1

- [x] T007 [US1] Implement PowerShell launch path in `repos/arashi/src/cli/windows-launcher.ts`
- [x] T008 [US1] Ensure npm bin entrypoint invokes the Windows launcher in `repos/arashi/bin/arashi.js`
- [x] T009 [US1] Ensure PowerShell launch handles non-admin directories in `repos/arashi/src/cli/windows-launcher.ts`

**Checkpoint**: User Story 1 is functional and independently testable

---

## Phase 4: User Story 2 - Run CLI in Git Bash on Windows (Priority: P2)

**Goal**: The CLI launches successfully in Git Bash after npm install.

**Independent Test**: Install via npm on Windows and run the same command in Git Bash with successful output.

### Implementation for User Story 2

- [x] T010 [US2] Detect Git Bash environment in `repos/arashi/src/lib/windows-shell.ts`
- [x] T011 [US2] Implement Git Bash launch path in `repos/arashi/src/cli/windows-launcher.ts`
- [x] T012 [US2] Normalize path handling for Git Bash in `repos/arashi/src/lib/windows-shell.ts`

**Checkpoint**: User Story 2 is functional and independently testable

---

## Phase 5: User Story 3 - Clear guidance when execution is unsupported (Priority: P3)

**Goal**: Users receive clear, actionable messages when the CLI cannot start on Windows.

**Independent Test**: Force an unsupported context and verify the CLI returns a clear message with next steps.

### Implementation for User Story 3

- [x] T013 [US3] Define standard startup error messages in `repos/arashi/src/cli/windows-errors.ts`
- [x] T014 [US3] Map launcher failures to guidance output in `repos/arashi/src/cli/windows-launcher.ts`

**Checkpoint**: User Story 3 is functional and independently testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure cross-platform safety and operational checks

- [x] T015 Verify non-Windows startup path remains unchanged in `repos/arashi/src/cli/index.ts`
- [x] T016 [P] Update Windows troubleshooting notes in `repos/arashi/README.md`
- [ ] T017 Run quickstart validation steps from `specs/039-fix-windows-cli/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Shell detection before launcher routing
- Launcher routing before entrypoint wiring
- Guidance messages before failure mapping

### Parallel Opportunities

- T003 and T006 can run in parallel
- T010 and T013 can run in parallel after Phase 2
- T011 and T012 can run in parallel
- Documentation update (T016) can run in parallel with other polish tasks

---

## Parallel Example: User Story 2

```bash
# Run shell detection and path normalization together:
Task: "Detect Git Bash environment in repos/arashi/src/lib/windows-shell.ts"
Task: "Normalize path handling for Git Bash in repos/arashi/src/lib/windows-shell.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Validate
3. Add User Story 2 → Test independently → Validate
4. Add User Story 3 → Test independently → Validate
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
