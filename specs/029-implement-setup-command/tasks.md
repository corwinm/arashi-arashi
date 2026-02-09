# Tasks: Setup Command

**Input**: Design documents from `/specs/029-implement-setup-command/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/setup-command.openapi.yaml, quickstart.md

**Tests**: Integration tests are required by the feature specification and included below.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Each task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Register the new command and create initial file scaffolding.

- [x] T001 Register the `setup` command in `repos/arashi/src/index.ts`
- [x] T002 Create `setup` command module scaffold and command options in `repos/arashi/src/commands/setup.ts`
- [x] T003 [P] Create setup command documentation stub in `repos/arashi/docs/commands/setup.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared setup orchestration primitives required by all user stories.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [x] T004 Create setup domain types for targets, execution results, and summary in `repos/arashi/src/lib/setup-types.ts`
- [x] T005 [P] Implement setup target discovery and ordering helpers in `repos/arashi/src/lib/setup-targets.ts`
- [x] T006 [P] Implement setup output formatting helpers for progress/result/summary in `repos/arashi/src/lib/setup-output.ts`
- [x] T007 Implement setup script runner with timeout and captured output in `repos/arashi/src/lib/setup-runner.ts`
- [x] T008 Add unit tests for setup output and summary formatting in `repos/arashi/tests/unit/setup-output.test.ts`

**Checkpoint**: Foundation ready - user story implementation can proceed.

---

## Phase 3: User Story 1 - Run setup across workspace (Priority: P1) 🎯 MVP

**Goal**: Run one command that executes main repository setup first, then all eligible sub-repository setup tasks, while skipping repos without setup tasks.

**Independent Test**: Run `arashi setup` in a workspace with main + sub-repo setup scripts and verify execution order, successful execution, and skipped repos without setup scripts.

### Tests for User Story 1

- [x] T009 [P] [US1] Add integration test for main-first then sub-repository setup execution in `repos/arashi/tests/integration/setup.test.ts`
- [x] T010 [P] [US1] Add integration test for skipping repositories without setup scripts in `repos/arashi/tests/integration/setup.test.ts`

### Implementation for User Story 1

- [x] T011 [US1] Implement full-workspace setup execution flow in `repos/arashi/src/commands/setup.ts`
- [x] T012 [US1] Wire setup target discovery and ordered execution pipeline in `repos/arashi/src/commands/setup.ts`
- [x] T013 [US1] Implement default completion summary for success and skipped outcomes in `repos/arashi/src/lib/setup-output.ts`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Target selected repositories (Priority: P2)

**Goal**: Allow users to run setup only for explicitly selected repositories.

**Independent Test**: Run `arashi setup --only <repo>` and verify only selected repositories execute; unselected repositories do not execute; unknown repositories fail validation.

### Tests for User Story 2

- [x] T014 [P] [US2] Add integration test for repository subset execution via `--only` in `repos/arashi/tests/integration/setup.test.ts`
- [x] T015 [P] [US2] Add integration test for unknown `--only` repository validation in `repos/arashi/tests/integration/setup.test.ts`

### Implementation for User Story 2

- [x] T016 [US2] Add repeatable `--only` option parsing and validation in `repos/arashi/src/commands/setup.ts`
- [x] T017 [US2] Apply repository filter selection to setup targets in `repos/arashi/src/lib/setup-targets.ts`
- [x] T018 [US2] Update filtered-run summary messaging for selected versus skipped repositories in `repos/arashi/src/lib/setup-output.ts`

**Checkpoint**: User Story 2 is independently functional and testable.

---

## Phase 5: User Story 3 - Observe progress and troubleshoot failures (Priority: P3)

**Goal**: Provide progress visibility, per-repository timing, verbose output, and clear failure/timeout reporting.

**Independent Test**: Run setup in normal and verbose modes with successful, failing, and timed-out setup scripts and verify progress output, elapsed time, classification, and exit behavior.

### Tests for User Story 3

- [x] T019 [P] [US3] Add integration test for verbose output and elapsed-time reporting in `repos/arashi/tests/integration/setup.test.ts`
- [x] T020 [P] [US3] Add integration test for failure and timeout classification in `repos/arashi/tests/integration/setup.test.ts`

### Implementation for User Story 3

- [x] T021 [US3] Implement per-repository progress indicators and elapsed-time reporting in `repos/arashi/src/commands/setup.ts`
- [x] T022 [US3] Implement verbose passthrough of full setup script output in `repos/arashi/src/lib/setup-runner.ts`
- [x] T023 [US3] Implement failure/timeout summary classification and command exit behavior in `repos/arashi/src/commands/setup.ts`

**Checkpoint**: User Story 3 is independently functional and testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and quality checks spanning all stories.

- [x] T024 [P] Finalize setup usage examples and troubleshooting notes in `repos/arashi/docs/commands/setup.md`
- [x] T025 Update command reference to include `setup` in `repos/arashi/README.md`
- [x] T026 Run lint, test, and build scripts for this feature via `repos/arashi/package.json`
- [x] T027 [P] Validate implemented behavior against quickstart scenarios in `specs/029-implement-setup-command/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5 -> Phase 6
- User story phases depend on Phase 2 completion
- Polish depends on completion of desired user stories

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on US2/US3
- **US2 (P2)**: Starts after Phase 2; builds on shared command flow from US1 but remains independently testable
- **US3 (P3)**: Starts after Phase 2; builds on shared execution pipeline and remains independently testable

### Dependency Graph

- `US1 -> US2 -> US3` for planned delivery sequence
- Independent validation possible at each story checkpoint

### Within Each User Story

- Add integration tests first and confirm they fail
- Implement command/utility logic next
- Re-run story-specific tests to verify independent completion

---

## Parallel Opportunities

- **Setup**: `T003` can run in parallel with `T001`/`T002`
- **Foundational**: `T005` and `T006` can run in parallel after `T004`; `T008` can proceed once `T006` is available
- **US1**: `T009` and `T010` can run in parallel
- **US2**: `T014` and `T015` can run in parallel
- **US3**: `T019` and `T020` can run in parallel
- **Polish**: `T024` and `T027` can run in parallel

## Parallel Example: User Story 1

```bash
Task: "T009 [US1] Add integration test for main-first then sub-repository setup execution in repos/arashi/tests/integration/setup.test.ts"
Task: "T010 [US1] Add integration test for skipping repositories without setup scripts in repos/arashi/tests/integration/setup.test.ts"
```

## Parallel Example: User Story 2

```bash
Task: "T014 [US2] Add integration test for repository subset execution via --only in repos/arashi/tests/integration/setup.test.ts"
Task: "T015 [US2] Add integration test for unknown --only repository validation in repos/arashi/tests/integration/setup.test.ts"
```

## Parallel Example: User Story 3

```bash
Task: "T019 [US3] Add integration test for verbose output and elapsed-time reporting in repos/arashi/tests/integration/setup.test.ts"
Task: "T020 [US3] Add integration test for failure and timeout classification in repos/arashi/tests/integration/setup.test.ts"
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently via `repos/arashi/tests/integration/setup.test.ts`.

### Incremental Delivery

1. Deliver US1 (full workspace setup baseline).
2. Deliver US2 (targeted setup via `--only`).
3. Deliver US3 (progress, verbose output, failure/timeout diagnostics).
4. Finish with Phase 6 polish and full quality checks.

### Parallel Team Strategy

1. One developer handles foundational libraries (`setup-types`, `setup-targets`, `setup-runner`).
2. One developer adds integration tests per story in `repos/arashi/tests/integration/setup.test.ts`.
3. One developer finalizes command wiring and docs in `repos/arashi/src/commands/setup.ts` and `repos/arashi/docs/commands/setup.md`.
