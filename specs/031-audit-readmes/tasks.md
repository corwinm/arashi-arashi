# Tasks: Audit README Documentation

**Input**: Design documents from `/specs/031-audit-readmes/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No separate automated test tasks are included; the specification requires independent validation via documentation claim review and link/badge verification.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`) for story-phase tasks only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the audit workspace artifacts used by all story phases.

- [X] T001 Create documentation claim inventory template in `specs/031-audit-readmes/claim-inventory.md`
- [X] T002 Create evidence mapping sheet in `specs/031-audit-readmes/evidence-map.md`
- [X] T003 [P] Create link and badge validation checklist in `specs/031-audit-readmes/validation-checklist.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared verification rules and baseline scope before user-story updates.

**CRITICAL**: No user story tasks should start before this phase is complete.

- [X] T004 Define claim classification rules and severity mapping in `specs/031-audit-readmes/claim-inventory.md`
- [X] T005 [P] Populate canonical evidence references from `repos/arashi/package.json`, `repos/arashi/.github/workflows/ci.yml`, and `repos/arashi/LICENSE` into `specs/031-audit-readmes/evidence-map.md`
- [X] T006 [P] Document badge applicability rules and fallback behavior in `specs/031-audit-readmes/validation-checklist.md`
- [X] T007 Record framework support taxonomy (`Native`, `Supported with modifications`, `Experimental`, `Not supported`) in `specs/031-audit-readmes/validation-checklist.md`

**Checkpoint**: Foundation complete; user stories can proceed.

---

## Phase 3: User Story 1 - Align README Content to Current Product State (Priority: P1) 🎯 MVP

**Goal**: Ensure README capability and usage claims match current implementation across in-scope repositories.

**Independent Test**: Review all updated README claims against `specs/031-audit-readmes/evidence-map.md`; every in-scope claim is verified, corrected, or removed.

### Implementation for User Story 1

- [X] T008 [P] [US1] Audit and update top-level project overview and workflow claims in `README.md`
- [X] T009 [P] [US1] Audit and update capability, status, and usage sections in `repos/arashi/README.md`
- [X] T010 [P] [US1] Replace placeholder repository description with accurate current state in `repos/arashi-skills/README.md`
- [X] T011 [US1] Record resolved outdated/missing claims and evidence links in `specs/031-audit-readmes/claim-inventory.md`
- [X] T012 [US1] Align cross-repo documentation links between `README.md` and `repos/arashi/README.md`
- [X] T013 [US1] Update completion status for US1 checks in `specs/031-audit-readmes/validation-checklist.md`

**Checkpoint**: User Story 1 is independently complete and verifiable.

---

## Phase 4: User Story 2 - Surface Key Project Status at a Glance (Priority: P2)

**Goal**: Add and validate high-signal README header badges for package, CI, and license visibility.

**Independent Test**: Open README headers and verify npm, CI, and license badges are visible (when applicable) and each link resolves to a valid destination.

### Implementation for User Story 2

- [X] T014 [US2] Add or normalize README header badges (npm, CI, license) in `README.md`
- [X] T015 [US2] Add or normalize README header badges (npm, CI, license) in `repos/arashi/README.md`
- [X] T016 [P] [US2] Validate badge target URLs against live and repository targets, then record results in `specs/031-audit-readmes/validation-checklist.md`
- [X] T017 [P] [US2] Document badge applicability caveats for unpublished or non-applicable repos in `README.md`
- [X] T018 [US2] Update completion status for US2 checks in `specs/031-audit-readmes/validation-checklist.md`

**Checkpoint**: User Story 2 is independently complete and verifiable.

---

## Phase 5: User Story 3 - Clarify Contribution Path and SDD Framework Support (Priority: P3)

**Goal**: Ensure contribution guidance is discoverable in standard files and provide a clear framework support matrix.

**Independent Test**: From each primary README, confirm contributors can reach `CONTRIBUTING.md` in one step and confirm framework support section includes Spec-Kit, OpenSpec, Kiro, and at least one additional framework with support levels/caveats.

### Implementation for User Story 3

- [X] T019 [US3] Replace long-form contribution blocks with concise canonical pointers in `README.md`
- [X] T020 [US3] Replace long-form contribution blocks with concise canonical pointers in `repos/arashi/README.md`
- [X] T021 [P] [US3] Update contributor workflow details and quality gate expectations in `CONTRIBUTING.md`
- [X] T022 [P] [US3] Update contributor workflow details and quality gate expectations in `repos/arashi/CONTRIBUTING.md`
- [X] T023 [US3] Add spec-driven framework support matrix (Spec-Kit, OpenSpec, Kiro, plus additional frameworks) with support caveats in `README.md`
- [X] T024 [US3] Update completion status for US3 checks in `specs/031-audit-readmes/validation-checklist.md`

**Checkpoint**: User Story 3 is independently complete and verifiable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency pass and release-readiness validation across all stories.

- [X] T025 [P] Run full markdown link and anchor validation pass for `README.md` and `repos/arashi/README.md`, then log outcomes in `specs/031-audit-readmes/validation-checklist.md`
- [X] T026 [P] Run terminology consistency pass across `README.md`, `CONTRIBUTING.md`, `repos/arashi/README.md`, and `repos/arashi/CONTRIBUTING.md`
- [X] T027 Resolve remaining major/minor documentation findings and mark final statuses in `specs/031-audit-readmes/claim-inventory.md`
- [X] T028 Finalize feature handoff notes and verification summary in `specs/031-audit-readmes/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; starts immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2; recommended MVP slice.
- **Phase 4 (US2)**: Depends on Phase 2; can run after/alongside US1 if staffed.
- **Phase 5 (US3)**: Depends on Phase 2; can run after/alongside US1/US2 if staffed.
- **Phase 6 (Polish)**: Depends on completion of all targeted user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after foundational completion.
- **US2 (P2)**: Independent after foundational completion; references US1-updated README structure where practical.
- **US3 (P3)**: Independent after foundational completion; benefits from US1/US2 content normalization.

### Dependency Graph

- `Setup -> Foundational -> {US1, US2, US3} -> Polish`
- `US1` is the recommended MVP.

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallelizable US1 tasks (different files)
T008 in README.md
T009 in repos/arashi/README.md
T010 in repos/arashi-skills/README.md
```

### User Story 2

```bash
# Parallelizable US2 tasks
T016 in specs/031-audit-readmes/validation-checklist.md
T017 in README.md
```

### User Story 3

```bash
# Parallelizable US3 tasks (different CONTRIBUTING files)
T021 in CONTRIBUTING.md
T022 in repos/arashi/CONTRIBUTING.md
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently using claim/evidence verification.
4. Demo or ship MVP documentation correction scope.

### Incremental Delivery

1. Deliver US1 (accuracy corrections).
2. Deliver US2 (badge visibility and validity).
3. Deliver US3 (contribution path and framework support matrix).
4. Finish with Phase 6 cross-cutting polish.

### Parallel Team Strategy

1. Team collaborates on Setup + Foundational.
2. After Phase 2:
   - Contributor A: US1 content corrections.
   - Contributor B: US2 badge updates/validation.
   - Contributor C: US3 contribution/supported-framework content.
3. Merge all story phases, then complete Polish.

---

## Notes

- `[P]` tasks target different files and can run concurrently.
- `[USx]` labels maintain strict traceability to spec user stories.
- No task omits file paths; each item is immediately actionable.
- Validate each story independently before moving to polish.
