# Tasks: skills.sh Integration Repository

**Input**: Design documents from `/specs/033-skills-sh-integration/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/skill-integration.openapi.yaml`, `quickstart.md`

**Tests**: No mandatory TDD test tasks were explicitly requested in the specification; this task list uses executable validation checkpoints per story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- All task descriptions include explicit file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the repository structure and baseline documents for skills integration.

- [X] T001 Create skills package directory tree in `repos/arashi-skills/skills/arashi/` with `references/`, `assets/`, and `scripts/`
- [X] T002 [P] Add skills repository overview and contribution notes in `repos/arashi-skills/README.md`
- [X] T003 [P] Add skill package README stub with scope and artifact index in `repos/arashi-skills/skills/arashi/README.md`
- [X] T004 [P] Add workflow examples directory scaffold in `repos/arashi-skills/examples/README.md`
- [X] T005 [P] Add validation command placeholders in `repos/arashi-skills/skills/arashi/scripts/validate.sh`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define shared artifacts required by all user stories.

**⚠️ CRITICAL**: No user story implementation starts until this phase is complete.

- [X] T006 Author canonical skill manifest frontmatter and baseline instructions in `repos/arashi-skills/skills/arashi/SKILL.md`
- [X] T007 [P] Define preflight prerequisite matrix in `repos/arashi-skills/skills/arashi/references/prerequisites.md`
- [X] T008 [P] Define installation, verification, workflow, and publication command reference in `repos/arashi-skills/skills/arashi/references/commands.md`
- [X] T009 [P] Define troubleshooting matrix skeleton (symptom/cause/fix) in `repos/arashi-skills/skills/arashi/references/troubleshooting.md`
- [X] T010 [P] Add publication policy and discoverability criteria in `repos/arashi-skills/skills/arashi/references/publication.md`
- [X] T011 Align integration contract with final command names and payload fields in `specs/033-skills-sh-integration/contracts/skill-integration.openapi.yaml`

**Checkpoint**: Foundation complete; user stories can be implemented independently.

---

## Phase 3: User Story 1 - Install Arashi as a skill (Priority: P1) 🎯 MVP

**Goal**: Enable first-time installation and verification with no manual repository edits.

**Independent Test**: From a clean environment, run the documented install flow and confirm one verification command succeeds.

- [X] T012 [US1] Implement install flow and required metadata fields in `repos/arashi-skills/skills/arashi/SKILL.md`
- [X] T013 [P] [US1] Document preflight checks and expected outputs in `repos/arashi-skills/skills/arashi/references/prerequisites.md`
- [X] T014 [P] [US1] Implement deterministic installation and verification steps in `repos/arashi-skills/skills/arashi/references/commands.md`
- [X] T015 [US1] Implement prerequisite and install failure recovery entries in `repos/arashi-skills/skills/arashi/references/troubleshooting.md`
- [X] T016 [US1] Add first-time install walkthrough in `repos/arashi-skills/examples/install-first-run.md`
- [X] T017 [US1] Validate installation flow and sync acceptance criteria notes in `specs/033-skills-sh-integration/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and demoable as the MVP.

---

## Phase 4: User Story 2 - Use pre-configured Arashi workflows (Priority: P2)

**Goal**: Provide at least three documented, runnable workflows for common meta-repository tasks.

**Independent Test**: Execute each workflow example and confirm expected user-visible outcomes without undocumented setup.

- [X] T018 [US2] Define workflow catalog and selection guidance in `repos/arashi-skills/skills/arashi/references/workflows.md`
- [X] T019 [P] [US2] Create beginner workflow example in `repos/arashi-skills/examples/workflow-beginner.md`
- [X] T020 [P] [US2] Create intermediate workflow example in `repos/arashi-skills/examples/workflow-intermediate.md`
- [X] T021 [P] [US2] Create advanced workflow example in `repos/arashi-skills/examples/workflow-advanced.md`
- [X] T022 [US2] Wire workflow entry commands and expected outcomes in `repos/arashi-skills/skills/arashi/SKILL.md`
- [X] T023 [US2] Update verification script to check workflow readiness gates in `repos/arashi-skills/skills/arashi/scripts/validate.sh`

**Checkpoint**: User Story 2 is independently functional with three runnable examples.

---

## Phase 5: User Story 3 - Learn and troubleshoot from docs (Priority: P3)

**Goal**: Deliver a complete integration guide for onboarding and self-serve recovery.

**Independent Test**: A new user can follow docs from zero setup to one successful workflow and recover from a simulated failure using troubleshooting guidance.

- [X] T024 [US3] Create end-to-end integration tutorial in `repos/arashi-skills/skills/arashi/references/tutorial.md`
- [X] T025 [P] [US3] Expand troubleshooting matrix with network, path, and command failure cases in `repos/arashi-skills/skills/arashi/references/troubleshooting.md`
- [X] T026 [P] [US3] Add quick command cheat sheet and expected outputs in `repos/arashi-skills/skills/arashi/assets/cheatsheet.md`
- [X] T027 [US3] Add skills integration section and links in `repos/arashi/README.md`
- [X] T028 [US3] Add publication readiness and verification steps in `repos/arashi-skills/skills/arashi/references/publication.md`

**Checkpoint**: User Story 3 is independently functional with complete onboarding and troubleshooting coverage.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, quality checks, and release readiness across all stories.

- [X] T029 [P] Normalize cross-document terminology and command naming in `repos/arashi-skills/README.md`
- [X] T030 [P] Verify all skill references are linked from manifest in `repos/arashi-skills/skills/arashi/SKILL.md`
- [X] T031 Run full quickstart validation and record final outcomes in `specs/033-skills-sh-integration/quickstart.md`
- [X] T032 Validate contract-document parity and update status notes in `specs/033-skills-sh-integration/contracts/skill-integration.openapi.yaml`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2; delivers MVP.
- **Phase 4 (US2)**: Depends on Phase 2 and references US1 install flow.
- **Phase 5 (US3)**: Depends on Phase 2 and references US1/US2 outputs.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after foundational phase; no dependency on other user stories.
- **US2 (P2)**: Starts after foundational phase; depends on stable install/verify commands from US1.
- **US3 (P3)**: Starts after foundational phase; depends on finalized workflows from US2 for documentation examples.

### Dependency Graph

- `Setup -> Foundational -> US1 -> Polish`
- `Setup -> Foundational -> US2 -> Polish`
- `Setup -> Foundational -> US3 -> Polish`

---

## Parallel Execution Examples

### User Story 1

```bash
Task: "T013 [US1] Document preflight checks in repos/arashi-skills/skills/arashi/references/prerequisites.md"
Task: "T014 [US1] Implement deterministic install and verification steps in repos/arashi-skills/skills/arashi/references/commands.md"
```

### User Story 2

```bash
Task: "T019 [US2] Create beginner workflow example in repos/arashi-skills/examples/workflow-beginner.md"
Task: "T020 [US2] Create intermediate workflow example in repos/arashi-skills/examples/workflow-intermediate.md"
Task: "T021 [US2] Create advanced workflow example in repos/arashi-skills/examples/workflow-advanced.md"
```

### User Story 3

```bash
Task: "T025 [US3] Expand troubleshooting matrix in repos/arashi-skills/skills/arashi/references/troubleshooting.md"
Task: "T026 [US3] Add command cheat sheet in repos/arashi-skills/skills/arashi/assets/cheatsheet.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1) only.
3. Validate independent test for US1 from a clean environment.
4. Demo/release MVP install experience.

### Incremental Delivery

1. Deliver MVP (US1) first.
2. Add workflow coverage (US2) and validate each example.
3. Add onboarding/troubleshooting and publication guidance (US3).
4. Run Polish phase for cross-story consistency.

### Parallel Team Strategy

1. Team completes Setup + Foundational together.
2. After foundation, one owner can execute US1 while others prepare US2/US3 parallel tasks marked `[P]`.
3. Merge story outputs in priority order and finish with Polish checks.

---

## Notes

- Tasks marked `[P]` touch different files and can be run in parallel safely.
- Story labels map directly to `spec.md` user stories for traceability.
- Each user story phase includes an independent validation checkpoint.
