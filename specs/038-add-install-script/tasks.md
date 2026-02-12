# Tasks: Install Script and Onboarding Instructions

**Input**: Design documents from `/specs/038-add-install-script/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/install-onboarding.openapi.yaml`, `quickstart.md`

**Tests**: No new automated test files were explicitly requested in the feature spec; this plan uses required lint/build/test/validate gates plus manual acceptance checks from `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story is independently implementable and testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes exact file path(s)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared scaffolding for installer and consistency tooling.

- [X] T001 Create installer script scaffold with strict shell options in `repos/arashi/scripts/install.sh`
- [X] T002 Create checksum generation helper for release artifacts in `repos/arashi/scripts/generate-checksums.sh`
- [X] T003 [P] Create install command parity checker scaffold in `repos/arashi-docs/scripts/check-install-command-parity.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add release and validation foundations required by all user stories.

**⚠️ CRITICAL**: Complete this phase before starting user story implementation.

- [X] T004 Wire checksum artifact publishing into release config in `repos/arashi/.releaserc.json`
- [X] T005 Update release workflow to generate and publish checksum manifest in `repos/arashi/.github/workflows/release.yml`
- [X] T006 [P] Add install command parity validation script implementation in `repos/arashi-docs/scripts/check-install-command-parity.ts`
- [X] T007 Integrate install command parity check into docs validation scripts in `repos/arashi-docs/package.json`
- [X] T008 Integrate install command parity step into CI validation in `repos/arashi-docs/.github/workflows/docs-validate.yml`
- [X] T009 [P] Add install consistency review checklist items in `repos/arashi-docs/docs/contributing/review-checklist.md`

**Checkpoint**: Release + validation foundation is ready; user stories can proceed.

---

## Phase 3: User Story 1 - Install via curl command (Priority: P1) 🎯 MVP

**Goal**: Deliver a one-command curl install path with prerequisites, verification, and troubleshooting.

**Independent Test**: Follow curl install command from landing/docs path, complete install, and run verification command successfully.

### Implementation for User Story 1

- [X] T010 [US1] Implement platform detection and asset mapping logic in `repos/arashi/scripts/install.sh`
- [X] T011 [US1] Implement version selection, download, and checksum verification flow in `repos/arashi/scripts/install.sh`
- [X] T012 [US1] Implement atomic install placement and clear error/fallback messaging in `repos/arashi/scripts/install.sh`
- [X] T013 [P] [US1] Add curl install command, prerequisites, and verification steps in `repos/arashi/README.md`
- [X] T014 [P] [US1] Add curl-path troubleshooting and fallback guidance in `repos/arashi/docs/INSTALLATION.md`
- [X] T015 [US1] Document installer-release binding behavior and checksum expectations in `repos/arashi/docs/INSTALLATION.md`

**Checkpoint**: User Story 1 is independently functional and demonstrable (MVP).

---

## Phase 4: User Story 2 - Install via npm command (Priority: P2)

**Goal**: Deliver npm install guidance that is equivalent to curl path and includes fallback behavior.

**Independent Test**: Follow npm install instructions from docs, verify install, and confirm fallback guidance is actionable when npm is unavailable.

### Implementation for User Story 2

- [X] T016 [US2] Align npm install and verification command language in `repos/arashi/README.md`
- [X] T017 [US2] Update npm installation flow with fallback to curl/manual path in `repos/arashi-docs/docs/getting-started/index.md`
- [X] T018 [US2] Add prerequisites and no-account onboarding policy text in `repos/arashi-docs/docs/getting-started/index.md`
- [X] T019 [US2] Add npm failure troubleshooting paths in `repos/arashi/docs/INSTALLATION.md`
- [X] T020 [US2] Align troubleshooting and next-step wording between npm and curl methods in `repos/arashi-docs/docs/getting-started/index.md`

**Checkpoint**: User Stories 1 and 2 both work independently with consistent outcomes.

---

## Phase 5: User Story 3 - Choose install method from hero section (Priority: P3)

**Goal**: Make both install methods immediately visible and actionable from the landing hero.

**Independent Test**: Open docs landing page and confirm hero presents copy-ready curl and npm methods with links to complete guidance.

### Implementation for User Story 3

- [X] T021 [US3] Update landing hero content to show both install commands in `repos/arashi-docs/docs/index.md`
- [X] T022 [US3] Add hero actions linking to install detail anchors in `repos/arashi-docs/docs/index.md`
- [X] T023 [US3] Add/adjust install section anchors for hero links in `repos/arashi-docs/docs/getting-started/index.md`
- [X] T024 [US3] Apply hero layout styling for readable dual-command blocks in `repos/arashi-docs/src/styles/theme.css`
- [X] T025 [US3] Align hero wording with README/docs install terminology in `repos/arashi-docs/docs/index.md`

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks, quality gates, and release readiness.

- [X] T026 Run install command parity check and resolve mismatches in `repos/arashi/README.md`, `repos/arashi-docs/docs/getting-started/index.md`, and `repos/arashi-docs/docs/index.md`
- [X] T027 [P] Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi` and fix resulting issues in touched files
- [X] T028 [P] Run `bun run validate` and `bun run build` in `repos/arashi-docs` and fix resulting issues in touched files
- [X] T029 Execute manual acceptance scenarios for curl/npm/hero flows and record outcomes in `repos/arashi-docs/docs/contributing/review-checklist.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; can run after US1 MVP validation.
- **Phase 5 (US3)**: Depends on Phase 2 and should run after US2 content exists for link targets.
- **Phase 6 (Polish)**: Depends on completion of all targeted stories.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories; this is MVP scope.
- **US2 (P2)**: Depends on shared foundations only; should align command text already established by US1.
- **US3 (P3)**: Depends on US2 install-section anchors/content for final hero links.

### Contract-to-Story Mapping

- `PUT /installation/release-binding` -> US1 (`repos/arashi/scripts/install.sh`, `repos/arashi/.github/workflows/release.yml`, `repos/arashi/.releaserc.json`)
- `GET|PUT /installation/methods` -> US1 + US2 (`repos/arashi/README.md`, `repos/arashi-docs/docs/getting-started/index.md`)
- `GET|PUT /installation/surfaces/{surfaceId}/instructions` -> US2 + US3 (`repos/arashi-docs/docs/getting-started/index.md`, `repos/arashi-docs/docs/index.md`)
- `PUT /installation/access-policy` -> US2 (`repos/arashi-docs/docs/getting-started/index.md`)
- `POST /installation/consistency-checks` -> Foundational + Polish (`repos/arashi-docs/scripts/check-install-command-parity.ts`)
- `POST /installation/outcomes` -> Polish manual acceptance recording (`repos/arashi-docs/docs/contributing/review-checklist.md`)

### Data Model to Story Mapping

- **Installation Method** -> US1 (curl), US2 (npm)
- **Install Script Release Binding** -> US1
- **Installation Guidance Surface** -> US2 (getting started/readme), US3 (landing hero)
- **First-Run Outcome** -> Phase 6 validation

---

## Parallel Execution Examples

## Parallel Example: User Story 1

```bash
# After T012 finalizes installer behavior, these can run in parallel:
Task: "T013 [US1] Update curl install section in repos/arashi/README.md"
Task: "T014 [US1] Update curl troubleshooting in repos/arashi/docs/INSTALLATION.md"
```

## Parallel Example: User Story 2

```bash
# After T017 defines the npm flow, these can run in parallel:
Task: "T018 [US2] Add prerequisite/no-account policy in repos/arashi-docs/docs/getting-started/index.md"
Task: "T019 [US2] Add npm troubleshooting in repos/arashi/docs/INSTALLATION.md"
```

## Parallel Example: User Story 3

```bash
# After T023 establishes anchors, styling and terminology alignment can run in parallel:
Task: "T024 [US3] Update hero install styling in repos/arashi-docs/src/styles/theme.css"
Task: "T025 [US3] Align hero install wording in repos/arashi-docs/docs/index.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independently using the curl install independent test.
5. Demo/release MVP if ready.

### Incremental Delivery

1. Deliver US1 (curl path) as MVP.
2. Deliver US2 (npm parity + fallback) without regressing US1.
3. Deliver US3 (hero discoverability) once install flows are stable.
4. Finish with Phase 6 quality gates and consistency validation.

### Parallel Team Strategy

1. One engineer handles installer/release tasks (`repos/arashi/scripts/install.sh`, release config/workflow).
2. One engineer handles docs onboarding parity (`repos/arashi/README.md`, `repos/arashi-docs/docs/getting-started/index.md`).
3. One engineer handles landing hero presentation (`repos/arashi-docs/docs/index.md`, `repos/arashi-docs/src/styles/theme.css`).

---

## Notes

- Tasks marked `[P]` are safe parallel opportunities when listed dependencies are met.
- `[US1]`, `[US2]`, and `[US3]` labels preserve traceability to prioritized stories in `spec.md`.
- Keep command text identical across README, getting-started, and hero to satisfy FR-006 and SC-003.
