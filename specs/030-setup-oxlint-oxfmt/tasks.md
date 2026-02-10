# Tasks: Linter and Formatter Setup

**Input**: Design documents from `/specs/030-setup-oxlint-oxfmt/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce baseline tooling files and dependency pins in the implementation repository.

- [ ] T001 Add pinned Oxlint and Oxfmt dev dependencies in `repos/arashi/package.json`
- [ ] T002 Create baseline lint configuration file in `repos/arashi/oxlint.json`
- [ ] T003 Create baseline formatter configuration file in `repos/arashi/.oxfmtrc.json`
- [ ] T004 [P] Add quality tooling defaults and exclusions in `repos/arashi/.gitignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared quality command entry points and baseline behavior required by all stories.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [ ] T005 Define repository quality scripts (`lint`, `lint:fix`, `lint:ci`, `format`, `format:check`) in `repos/arashi/package.json`
- [ ] T006 [P] Align lint output format and severity defaults for actionable diagnostics in `repos/arashi/oxlint.json`
- [ ] T007 [P] Define formatter ignore patterns for generated/vendor/transient files in `repos/arashi/.oxfmtrc.json`

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Run consistent code quality checks (Priority: P1) 🎯 MVP

**Goal**: Contributors can run standard local lint and format workflows with predictable results.

**Independent Test**: From `repos/arashi/`, run `bun run lint` and `bun run format:check` on a sample change; verify both commands return clear pass/fail diagnostics and identify affected files.

### Implementation for User Story 1

- [ ] T008 [US1] Configure initial lint rule profile rollout strategy in `repos/arashi/oxlint.json`
- [ ] T009 [US1] Configure canonical formatting style rules in `repos/arashi/.oxfmtrc.json`
- [ ] T010 [US1] Add optional local autofix flow for lint and formatting in `repos/arashi/package.json`
- [ ] T011 [P] [US1] Add a changed-files quality command for faster local feedback in `repos/arashi/package.json`
- [ ] T012 [US1] Verify local quality command behavior against intentional violations via `repos/arashi/package.json`

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Enforce standards in pull request validation (Priority: P2)

**Goal**: Pull requests are blocked when lint or format requirements are not met.

**Independent Test**: Trigger CI for one compliant and one non-compliant pull request and confirm required quality checks pass/fail correctly before merge eligibility.

### Implementation for User Story 2

- [ ] T013 [US2] Add CI quality-check job scaffolding for lint and format validation in `repos/arashi/.github/workflows/ci.yml`
- [ ] T014 [P] [US2] Add lint gate step using repository quality scripts in `repos/arashi/.github/workflows/ci.yml`
- [ ] T015 [P] [US2] Add format gate step using repository quality scripts in `repos/arashi/.github/workflows/ci.yml`
- [ ] T016 [US2] Configure CI failure messaging and final gate behavior in `repos/arashi/.github/workflows/ci.yml`

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Onboard contributors quickly (Priority: P3)

**Goal**: New contributors can discover and run quality workflows without tribal knowledge.

**Independent Test**: A new contributor can follow documented instructions from a clean checkout and successfully run lint and format workflows, including remediation of one failing case.

### Implementation for User Story 3

- [ ] T017 [US3] Document local lint and format workflow commands in `repos/arashi/README.md`
- [ ] T018 [US3] Document CI quality gate expectations and failure remediation in `repos/arashi/CONTRIBUTING.md`
- [ ] T019 [P] [US3] Add troubleshooting guidance for common quality-check failures in `repos/arashi/docs/quality-checks.md`

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks and cross-story validation.

- [ ] T020 [P] Reconcile quality command references across documentation in `repos/arashi/README.md`
- [ ] T021 Run full project validation (`bun run lint`, `bun test`, `bun run build`) from `repos/arashi/package.json` and resolve findings in `repos/arashi/`
- [ ] T022 Validate quickstart workflow end-to-end and update any drift in `specs/030-setup-oxlint-oxfmt/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no dependencies and starts immediately.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Story phases (Phases 3-5) depend on Foundational completion.
- Polish (Phase 6) depends on completion of all selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2; no dependency on other stories.
- **US2 (P2)**: Starts after Phase 2 and depends on US1 command availability.
- **US3 (P3)**: Starts after Phase 2 and depends on finalized US1/US2 workflows for accurate documentation.

### Dependency Graph

- `US1 -> US2 -> US3`
- `US1 -> US3`

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallelizable local workflow tasks
Task T011: Add changed-files quality command in repos/arashi/package.json
Task T008: Configure initial lint profile in repos/arashi/oxlint.json
```

### User Story 2

```bash
# Parallelizable CI gate steps after T013
Task T014: Add lint gate step in repos/arashi/.github/workflows/ci.yml
Task T015: Add format gate step in repos/arashi/.github/workflows/ci.yml
```

### User Story 3

```bash
# Parallelizable documentation additions
Task T017: Update repos/arashi/README.md
Task T019: Add repos/arashi/docs/quality-checks.md
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) and validate local lint/format usability.
3. Pause for MVP review before CI enforcement rollout.

### Incremental Delivery

1. Add local quality workflows (US1).
2. Add pull request enforcement (US2).
3. Add contributor onboarding docs (US3).
4. Complete Polish phase for end-to-end consistency.

### Parallel Team Strategy

1. One contributor finalizes lint/format config (US1).
2. One contributor implements CI gate steps after foundations are merged (US2).
3. One contributor prepares docs once command/CI behavior stabilizes (US3).
