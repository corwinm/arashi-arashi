---

description: "Task list for fix create command in bare repositories"
---

# Tasks: Fix create command in bare repositories

**Input**: Design documents from `specs/032-fix-bare-create-command/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include unit and integration test tasks because this feature is a regression fix and the design requires targeted coverage for bare-repository invocation paths.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare focused test and command scaffolding for bare-context create work.

- [X] T001 Add shared bare-workspace fixture utilities in `repos/arashi/tests/helpers/create-bare-create-workspace.ts`
- [X] T002 Add create command bare-context test scaffold in `repos/arashi/tests/unit/commands/create.bare-context.test.ts`
- [X] T003 [P] Add integration harness for bare create flows in `repos/arashi/tests/integration/create.bare-context.setup.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared context/config resolution primitives used by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add create invocation context types and resolver entry point in `repos/arashi/src/commands/create.ts`
- [X] T005 [P] Add config source resolution helpers (local-file vs repository-content) in `repos/arashi/src/lib/config.ts`
- [X] T006 [P] Add git helper to read tracked file content from default branch in `repos/arashi/src/lib/git.ts`
- [X] T007 Wire create command to use resolved execution context before repository discovery in `repos/arashi/src/commands/create.ts`
- [X] T008 Add unit coverage for context/config resolver primitives in `repos/arashi/tests/unit/config.bare-context.test.ts`

**Checkpoint**: Context and config resolution are reusable and stable for all story work.

---

## Phase 3: User Story 1 - Run create from bare repo root (Priority: P1) 🎯 MVP

**Goal**: Let users run `create` from a bare repository root and get successful coordinated worktree creation.

**Independent Test**: In a bare repository with valid workspace configuration, run `arashi create <branch>` from bare root and verify worktrees are created and output matches expected success behavior.

### Tests for User Story 1

- [X] T009 [P] [US1] Add integration test for bare-root create success in `repos/arashi/tests/integration/create.bare-root-success.test.ts`
- [X] T010 [P] [US1] Add integration test for non-bare behavior parity in `repos/arashi/tests/integration/create.non-bare-parity.test.ts`

### Implementation for User Story 1

- [X] T011 [US1] Update create repository discovery to run from resolved execution path in `repos/arashi/src/commands/create.ts`
- [X] T012 [US1] Update meta-repo inclusion logic to use resolved execution path in `repos/arashi/src/commands/create.ts`
- [X] T013 [US1] Ensure create orchestration receives normalized repository paths across bare/non-bare entry points in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Resolve config in bare repo context (Priority: P2)

**Goal**: Resolve workspace configuration correctly in bare repositories, including repository-content fallback when local file lookup is unavailable.

**Independent Test**: In a bare repository where config exists in repository content but not in bare-root filesystem view, run `create` and verify command proceeds without false config-not-found failure.

### Tests for User Story 2

- [X] T014 [P] [US2] Add unit tests for repository-content config fallback loading in `repos/arashi/tests/unit/config.bare-context.test.ts`
- [X] T015 [P] [US2] Add integration test for bare-root config fallback success in `repos/arashi/tests/integration/create.bare-config-fallback.test.ts`

### Implementation for User Story 2

- [X] T016 [US2] Implement repository-content config fallback loader in `repos/arashi/src/lib/config.ts`
- [X] T017 [US2] Call fallback loader when local config resolution fails in create path in `repos/arashi/src/commands/create.ts`
- [X] T018 [US2] Validate fallback-loaded config with existing validation flow in `repos/arashi/src/lib/config.ts`

**Checkpoint**: User Story 2 is functional and independently testable.

---

## Phase 5: User Story 3 - Fail safely with actionable guidance (Priority: P3)

**Goal**: Provide actionable failure messages for missing prerequisites and preserve safe rollback behavior for failed bare-root creates.

**Independent Test**: In a bare repository with missing setup, run `create` and verify error output provides concrete next steps; in failure scenarios, verify no partial artifacts remain.

### Tests for User Story 3

- [X] T019 [P] [US3] Add integration test for missing-config guidance error in `repos/arashi/tests/integration/create.bare-missing-config-error.test.ts`
- [X] T020 [P] [US3] Add integration test for bare-root conflict reporting in `repos/arashi/tests/integration/create.bare-conflict-error.test.ts`

### Implementation for User Story 3

- [X] T021 [US3] Improve create error mapping for bare-context setup failures in `repos/arashi/src/commands/create.ts`
- [X] T022 [US3] Ensure failed bare-context create preserves rollback guarantees in `repos/arashi/src/core/worktree.ts`
- [X] T023 [US3] Standardize actionable conflict and setup guidance text in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 3 is functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs and spec artifacts spanning multiple stories.

- [X] T024 [P] Update bare-repository create usage notes in `repos/arashi/README.md`
- [X] T025 [P] Align quickstart validation steps with final behavior in `specs/032-fix-bare-create-command/quickstart.md`
- [X] T026 [P] Align contract examples and error semantics with implemented behavior in `specs/032-fix-bare-create-command/contracts/create-bare-context.openapi.yaml`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all story implementation.
- **User Story Phases (Phase 3-5)**: Depend on Phase 2 completion.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on US2 or US3.
- **US2 (P2)**: Starts after Foundational; independent, but can reuse US1 context plumbing.
- **US3 (P3)**: Starts after Foundational; independent, but validates failures from US1/US2 paths.

### Dependency Graph

- Phase 1 -> Phase 2 -> US1 (MVP)
- Phase 2 -> US2
- Phase 2 -> US3
- US1 + US2 + US3 -> Phase 6

### Parallel Opportunities

- **Setup**: T003 can run in parallel with T001-T002 after initial fixture direction is set.
- **Foundational**: T005 and T006 can run in parallel (different files).
- **US1**: T009 and T010 can run in parallel; T011-T013 remain sequential in `create.ts`.
- **US2**: T014 and T015 can run in parallel; T016 and T018 can split across `config.ts` while T017 updates `create.ts`.
- **US3**: T019 and T020 can run in parallel; T021 and T022 can run in parallel across command/core modules before T023 finalizes user messaging.

---

## Parallel Example: User Story 1

```bash
# Run independent US1 test tasks together
Task: "Add integration test for bare-root create success in repos/arashi/tests/integration/create.bare-root-success.test.ts"
Task: "Add integration test for non-bare behavior parity in repos/arashi/tests/integration/create.non-bare-parity.test.ts"
```

## Parallel Example: User Story 2

```bash
# Split US2 work between unit and integration coverage
Task: "Add unit tests for repository-content config fallback loading in repos/arashi/tests/unit/config.bare-context.test.ts"
Task: "Add integration test for bare-root config fallback success in repos/arashi/tests/integration/create.bare-config-fallback.test.ts"
```

## Parallel Example: User Story 3

```bash
# Validate independent failure paths in parallel
Task: "Add integration test for missing-config guidance error in repos/arashi/tests/integration/create.bare-missing-config-error.test.ts"
Task: "Add integration test for bare-root conflict reporting in repos/arashi/tests/integration/create.bare-conflict-error.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently using the story independent test criteria.

### Incremental Delivery

1. Deliver US1 (bare-root create success) as MVP.
2. Deliver US2 (config resolution fallback) and validate independently.
3. Deliver US3 (actionable failure guidance and safe failure handling).
4. Complete Phase 6 polish updates.

### Independent Test Criteria by Story

- **US1**: Bare-root create succeeds and produces expected worktree outputs with parity to non-bare invocation.
- **US2**: Bare-root create resolves config from repository content when local file path is unavailable.
- **US3**: Missing setup and conflict cases return actionable guidance and leave no partial artifacts.

---

## Notes

- Tasks are ordered for execution readiness and independent delivery.
- All task lines follow the required checklist format with IDs, optional `[P]`, required `[USx]` on story tasks, and explicit file paths.
- Contract mapping used: `/create/execute` -> US1, `/create/validate-context` -> US2, error response semantics -> US3.
