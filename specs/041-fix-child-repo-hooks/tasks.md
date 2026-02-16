---

description: "Task list for fixing child-repo create hook execution"
---

# Tasks: Fix child-repo create hook execution

**Input**: Design documents from `specs/041-fix-child-repo-hooks/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include integration and unit test tasks because this is a regression fix and the design explicitly requires child-invocation hook coverage for success, failure, and parity scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare repeatable child-repository hook test fixtures and scaffolding.

- [X] T001 Create child-invocation workspace fixture helper in `repos/arashi/tests/helpers/create-child-hook-workspace.ts`
- [X] T002 Extend hook test helper utilities for repo-specific hook scripts in `repos/arashi/tests/helpers/hooks.ts`
- [X] T003 [P] Add integration test scaffold for child-repo create hook flows in `repos/arashi/tests/integration/create.child-hooks-success.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish canonical invocation context and hook outcome structures used by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add canonical workspace hook-root input to worktree orchestration options in `repos/arashi/src/core/worktree.ts`
- [X] T005 [P] Add structured hook outcome types and reason codes in `repos/arashi/src/core/worktree.ts`
- [X] T006 [P] Add hook execution result mapping helpers (success/failure/skipped/timeout) in `repos/arashi/src/lib/hooks.ts`
- [X] T007 Wire `executeCreate` to pass resolved workspace context into orchestration in `repos/arashi/src/commands/create.ts`
- [X] T008 Remove create-time `loadConfig(".")` fallback and use command-resolved config/context in `repos/arashi/src/core/worktree.ts`
- [X] T009 Add foundational unit coverage for hook outcome primitives in `repos/arashi/tests/unit/core/worktree.test.ts`

**Checkpoint**: Context propagation and hook outcome primitives are stable for all user story work.

---

## Phase 3: User Story 1 - Automatic setup from child repos (Priority: P1) 🎯 MVP

**Goal**: Running `arashi create <name>` from a managed child repository executes expected hooks and prepares worktrees without manual setup.

**Independent Test**: From a child repository path, run create with configured hooks and verify each targeted repository executes expected hooks and setup side effects are present.

### Tests for User Story 1

- [X] T010 [P] [US1] Add integration test for child-repo invocation running configured hooks in `repos/arashi/tests/integration/create.child-hooks-success.test.ts`
- [X] T011 [P] [US1] Add integration test for nested child subdirectory invocation in `repos/arashi/tests/integration/create.child-hooks-success.test.ts`

### Implementation for User Story 1

- [X] T012 [US1] Resolve hook lookup root from canonical workspace context instead of process cwd in `repos/arashi/src/core/worktree.ts`
- [X] T013 [US1] Pass canonical main/parent repository paths into hook operation data for child invocations in `repos/arashi/src/core/worktree.ts`
- [X] T014 [US1] Ensure repository-specific pre/post hooks execute from created worktree context once per repository in `repos/arashi/src/core/worktree.ts`
- [X] T015 [US1] Preserve child-invocation repository discovery and meta-repo inclusion alignment with canonical execution path in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Actionable hook failure feedback (Priority: P2)

**Goal**: Users receive explicit per-repository hook statuses and actionable recovery guidance when hooks fail or time out.

**Independent Test**: Configure one failing/timed-out hook and one missing hook, run create from child repo, and verify output includes repository-specific status and next steps.

### Tests for User Story 2

- [X] T016 [P] [US2] Add integration test for failing repo-specific hook reporting in `repos/arashi/tests/integration/create.child-hooks-failure.test.ts`
- [X] T017 [P] [US2] Add integration test for timeout and skipped hook status reporting in `repos/arashi/tests/integration/create.child-hooks-failure.test.ts`
- [X] T018 [P] [US2] Add unit tests for hook status and reason mapping in `repos/arashi/tests/unit/core/worktree.test.ts`

### Implementation for User Story 2

- [X] T019 [US2] Return structured hook outcome records from hook execution path in `repos/arashi/src/core/worktree.ts`
- [X] T020 [US2] Attach per-repository hook outcomes to operation summary results in `repos/arashi/src/core/worktree.ts`
- [X] T021 [US2] Add create command output section for per-repository hook statuses in `repos/arashi/src/commands/create.ts`
- [X] T022 [US2] Add actionable recovery guidance for hook failure and timeout cases in `repos/arashi/src/commands/create.ts`
- [X] T023 [US2] Ensure repositories without configured hooks are reported as skipped (not silent) in `repos/arashi/src/core/worktree.ts`

**Checkpoint**: User Story 2 is functional and independently testable.

---

## Phase 5: User Story 3 - Consistent behavior across invocation locations (Priority: P3)

**Goal**: Root-invoked and child-invoked create runs produce equivalent hook behavior and outcomes for identical workspace configuration.

**Independent Test**: Run create once from workspace root and once from a child repository in the same fixture; verify matching hook outcome sets.

### Tests for User Story 3

- [X] T024 [P] [US3] Add parity integration test comparing root and child hook outcomes in `repos/arashi/tests/integration/create.child-hooks-parity.test.ts`
- [X] T025 [P] [US3] Add regression assertion that existing non-bare parity coverage runs with hooks enabled in `repos/arashi/tests/integration/create.non-bare-parity.test.ts`
- [X] T026 [P] [US3] Add unit test for non-bare nested-path invocation context normalization in `repos/arashi/tests/unit/commands/create.bare-context.test.ts`

### Implementation for User Story 3

- [X] T027 [US3] Normalize non-bare invocation context to canonical workspace root for root and child parity in `repos/arashi/src/commands/create.ts`
- [X] T028 [US3] Ensure hook outcome ordering is deterministic across invocation locations in `repos/arashi/src/core/worktree.ts`
- [X] T029 [US3] Align create success/failure summaries so root and child invocations emit equivalent hook result structure in `repos/arashi/src/commands/create.ts`

**Checkpoint**: User Story 3 is functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs/contracts and run full validation across stories.

- [X] T030 [P] Update lifecycle hook behavior documentation for child invocation parity in `repos/arashi/docs/hooks.md`
- [X] T031 [P] Align CLI behavior contract with final hook status output in `specs/041-fix-child-repo-hooks/contracts/create-command-hooks.contract.md`
- [X] T032 [P] Align OpenAPI contract fields with implemented create hook outcomes in `specs/041-fix-child-repo-hooks/contracts/create-hook-context.openapi.yaml`
- [X] T033 Run quickstart validation scenario checklist in `specs/041-fix-child-repo-hooks/quickstart.md`
- [X] T034 Run lint, tests, and build validation commands defined in `repos/arashi/package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user story implementation.
- **User Story Phases (Phase 3-5)**: Depend on Phase 2 completion.
- **Polish (Phase 6)**: Depends on completion of desired user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; no dependency on US2 or US3.
- **US2 (P2)**: Starts after Foundational; can build on US1 hook plumbing but remains independently testable.
- **US3 (P3)**: Starts after Foundational; validates parity of behavior across invocation locations using the same core primitives.

### Dependency Graph

- Phase 1 -> Phase 2 -> US1 (MVP)
- Phase 2 -> US2
- Phase 2 -> US3
- US1 + US2 + US3 -> Phase 6

### Parallel Opportunities

- **Setup**: T003 can run in parallel with T001-T002 after fixture direction is set.
- **Foundational**: T005 and T006 can run in parallel; T009 can start once T005 completes.
- **US1**: T010 and T011 can run in parallel; T012-T015 are primarily sequential in core/command files.
- **US2**: T016, T017, and T018 can run in parallel; T021 and T023 can run in parallel after T019-T020.
- **US3**: T024, T025, and T026 can run in parallel; T027 and T028 can run in parallel before T029.

---

## Parallel Example: User Story 1

```bash
# Run independent US1 integration checks in parallel
Task: "Add integration test for child-repo invocation running configured hooks in repos/arashi/tests/integration/create.child-hooks-success.test.ts"
Task: "Add integration test for nested child subdirectory invocation in repos/arashi/tests/integration/create.child-hooks-success.test.ts"
```

## Parallel Example: User Story 2

```bash
# Split US2 validation across integration and unit coverage
Task: "Add integration test for failing repo-specific hook reporting in repos/arashi/tests/integration/create.child-hooks-failure.test.ts"
Task: "Add unit tests for hook status and reason mapping in repos/arashi/tests/unit/core/worktree.test.ts"
```

## Parallel Example: User Story 3

```bash
# Validate invocation parity from multiple test angles
Task: "Add parity integration test comparing root and child hook outcomes in repos/arashi/tests/integration/create.child-hooks-parity.test.ts"
Task: "Add unit test for non-bare nested-path invocation context normalization in repos/arashi/tests/unit/commands/create.bare-context.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently using the story independent test criteria.

### Incremental Delivery

1. Deliver US1 (automatic child-repo hook execution) as MVP.
2. Deliver US2 (actionable per-repository hook outcomes).
3. Deliver US3 (root vs child parity guarantees).
4. Complete Phase 6 documentation/contracts and full validation.

### Parallel Team Strategy

1. Team completes Phase 1 and Phase 2 together.
2. After Phase 2, split by story:
   - Engineer A: US1
   - Engineer B: US2
   - Engineer C: US3
3. Merge stories behind shared parity and regression test coverage.

### Independent Test Criteria by Story

- **US1**: Child-repo create run executes configured hooks and leaves worktrees ready without manual setup.
- **US2**: Failed, timed-out, and missing hooks emit explicit repository status plus recovery guidance.
- **US3**: Root and child invocations return matching hook outcome sets for identical workspace configuration.

---

## Notes

- Tasks are ordered for immediate execution with clear file-level targets.
- All task lines follow required checklist format with checkbox, ID, optional `[P]`, required `[USx]` labels for story tasks, and explicit file paths.
- Contract mapping used: context resolution endpoint -> US1/US3, create execution endpoint -> US1/US2, error response semantics -> US2.
