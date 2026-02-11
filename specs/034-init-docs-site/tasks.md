# Tasks: Documentation Site Repository Initialization

**Input**: Design documents from `/Users/corwinm/Developer/arashi-arashi.git/init-docs/specs/034-init-docs-site/`  
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No standalone automated test tasks were requested in the feature spec; this plan includes required validation workflow tasks only.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps task to a user story (`[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit file path(s)

## Path Conventions

- Documentation repository: `repos/arashi-docs/`
- Main project README integration: `repos/arashi/README.md`
- Feature planning artifacts: `specs/034-init-docs-site/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the dedicated docs repository and baseline toolchain.

- [X] T001 Create docs site project manifest and scripts in `repos/arashi-docs/package.json`
- [X] T002 Create Astro/Starlight site configuration in `repos/arashi-docs/astro.config.mjs`
- [X] T003 [P] Add project TypeScript configuration in `repos/arashi-docs/tsconfig.json`
- [X] T004 [P] Add Netlify deployment configuration in `repos/arashi-docs/netlify.toml`
- [X] T005 [P] Create baseline docs structure pages in `repos/arashi-docs/docs/index.md`, `repos/arashi-docs/docs/getting-started/index.md`, `repos/arashi-docs/docs/reference/index.md`, and `repos/arashi-docs/docs/contributing/index.md`
- [X] T006 Create local setup and usage instructions in `repos/arashi-docs/README.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete shared foundations that block all user story delivery.

**⚠️ CRITICAL**: No user story work starts until this phase is complete.

- [X] T007 Configure shared navigation and site metadata in `repos/arashi-docs/astro.config.mjs`
- [X] T008 Define documentation content conventions in `repos/arashi-docs/docs/contributing/content-style.md`
- [X] T009 Add validation command definitions (build, lint, links, a11y, external-link checks) in `repos/arashi-docs/package.json`
- [X] T010 [P] Implement pull-request and default-branch validation workflow in `repos/arashi-docs/.github/workflows/docs-validate.yml`
- [X] T011 [P] Document canonical docs URL policy for README linking in `repos/arashi-docs/docs/reference/documentation-url-policy.md`

**Checkpoint**: Foundation ready - user stories can be implemented independently.

---

## Phase 3: User Story 1 - Discover and access project documentation (Priority: P1) 🎯 MVP

**Goal**: Users can discover docs from the main README and reach a clear landing page with primary navigation.

**Independent Test**: Open `repos/arashi/README.md`, follow the docs link, and verify `repos/arashi-docs/docs/index.md` exposes project overview plus links to baseline sections.

### Implementation for User Story 1

- [X] T012 [P] [US1] Create project overview landing content in `repos/arashi-docs/docs/index.md`
- [X] T013 [P] [US1] Create getting-started section entry content in `repos/arashi-docs/docs/getting-started/index.md`
- [X] T014 [P] [US1] Create reference section entry content in `repos/arashi-docs/docs/reference/index.md`
- [X] T015 [US1] Wire landing and section ordering in `repos/arashi-docs/astro.config.mjs`
- [X] T016 [US1] Add visible canonical Documentation link near top of `repos/arashi/README.md`
- [X] T017 [US1] Add README documentation-link health check step in `repos/arashi-docs/.github/workflows/docs-validate.yml`
- [X] T018 [US1] Add discoverability review checklist in `repos/arashi-docs/docs/contributing/review-checklist.md`

**Checkpoint**: User Story 1 is independently functional and demoable.

---

## Phase 4: User Story 2 - Publish documentation updates reliably (Priority: P2)

**Goal**: Maintainers can publish valid changes automatically, receive failure details, and preserve last good live content on failures.

**Independent Test**: Merge a valid docs change and confirm production deploy updates; then induce a validation/deploy failure and confirm publication is blocked or prior live version remains available with actionable failure output.

### Implementation for User Story 2

- [X] T019 [P] [US2] Configure Netlify production and preview deploy contexts in `repos/arashi-docs/netlify.toml`
- [X] T020 [US2] Implement publish-gating validation workflow with default-branch trigger in `repos/arashi-docs/.github/workflows/docs-validate.yml`
- [X] T021 [P] [US2] Add internal link and anchor validation commands in `repos/arashi-docs/package.json`
- [X] T022 [P] [US2] Add accessibility smoke-check commands for critical pages in `repos/arashi-docs/package.json`
- [X] T023 [P] [US2] Add scheduled external-link health workflow in `repos/arashi-docs/.github/workflows/docs-link-health.yml`
- [X] T024 [US2] Document publication status and failure triage process in `repos/arashi-docs/docs/reference/publishing-status.md`
- [X] T025 [US2] Document rollback procedure preserving last successful live version in `repos/arashi-docs/docs/reference/rollback-runbook.md`
- [X] T026 [US2] Document publication SLO verification checklist in `repos/arashi-docs/docs/reference/publishing-slo.md`

**Checkpoint**: User Story 2 is independently functional with operational failure handling.

---

## Phase 5: User Story 3 - Contribute new documentation content (Priority: P3)

**Goal**: Contributors can add new docs pages through a documented workflow without breaking information architecture conventions.

**Independent Test**: Follow contribution guidance to add a new page, place it in navigation correctly, and pass validation without direct maintainer intervention.

### Implementation for User Story 3

- [X] T027 [P] [US3] Create contributor workflow guide for adding pages in `repos/arashi-docs/docs/contributing/how-to-add-pages.md`
- [X] T028 [P] [US3] Define ownership and maintenance expectations in `repos/arashi-docs/docs/contributing/ownership.md`
- [X] T029 [P] [US3] Create reusable new-page template in `repos/arashi-docs/docs/contributing/page-template.md`
- [X] T030 [US3] Define navigation placement and ordering rules in `repos/arashi-docs/docs/contributing/navigation-rules.md`
- [X] T031 [US3] Add contributor entrypoint links from docs home in `repos/arashi-docs/docs/index.md`
- [X] T032 [US3] Add validation troubleshooting guide for contributors in `repos/arashi-docs/docs/contributing/validation-troubleshooting.md`

**Checkpoint**: User Story 3 is independently functional for first-time contributors.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize consistency, quality, and handoff artifacts across stories.

- [X] T033 [P] Harmonize terminology and cross-links across `repos/arashi-docs/docs/index.md`, `repos/arashi-docs/docs/getting-started/index.md`, `repos/arashi-docs/docs/reference/index.md`, and `repos/arashi-docs/docs/contributing/index.md`
- [X] T034 Validate canonical URL consistency between `repos/arashi/README.md` and `repos/arashi-docs/docs/reference/documentation-url-policy.md`
- [X] T035 [P] Add release-readiness checklist for docs maintainers in `repos/arashi-docs/docs/reference/release-readiness.md`
- [X] T036 Record quickstart validation outcomes in `specs/034-init-docs-site/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies; start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories.
- **Phases 3-5 (User Stories)**: Depend on Phase 2 completion; can run in parallel if staffed.
- **Phase 6 (Polish)**: Depends on completion of selected user stories.

### User Story Dependency Graph

- **US1 (P1)**: Starts after Phase 2; no dependency on other user stories.
- **US2 (P2)**: Starts after Phase 2; independent of US1 implementation, but validates shared URL policy from T011.
- **US3 (P3)**: Starts after Phase 2; independent of US1/US2, uses shared navigation conventions from T007.

### User Story Completion Order

`US1 (MVP) -> US2 -> US3`

### Within Each User Story

- Content/config scaffolding tasks first.
- Workflow/policy integration next.
- Story-specific operational documentation last.

### Parallel Opportunities

- Setup: T003, T004, and T005 can run in parallel after T001/T002.
- Foundational: T010 and T011 can run in parallel after T007-T009.
- US1: T012, T013, and T014 can run in parallel.
- US2: T019, T021, T022, and T023 can run in parallel.
- US3: T027, T028, and T029 can run in parallel.

---

## Parallel Example: User Story 1

```bash
Task: "T012 [US1] Create project overview landing content in repos/arashi-docs/docs/index.md"
Task: "T013 [US1] Create getting-started section entry content in repos/arashi-docs/docs/getting-started/index.md"
Task: "T014 [US1] Create reference section entry content in repos/arashi-docs/docs/reference/index.md"
```

## Parallel Example: User Story 2

```bash
Task: "T019 [US2] Configure Netlify production and preview deploy contexts in repos/arashi-docs/netlify.toml"
Task: "T021 [US2] Add internal link and anchor validation commands in repos/arashi-docs/package.json"
Task: "T023 [US2] Add scheduled external-link health workflow in repos/arashi-docs/.github/workflows/docs-link-health.yml"
```

## Parallel Example: User Story 3

```bash
Task: "T027 [US3] Create contributor workflow guide in repos/arashi-docs/docs/contributing/how-to-add-pages.md"
Task: "T028 [US3] Define ownership expectations in repos/arashi-docs/docs/contributing/ownership.md"
Task: "T029 [US3] Create new-page template in repos/arashi-docs/docs/contributing/page-template.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1).
4. Validate US1 independent test and demo discoverability flow.

### Incremental Delivery

1. Setup + Foundational creates shared base.
2. Deliver US1 for immediate user value (documentation discoverability).
3. Deliver US2 for operational reliability.
4. Deliver US3 for contributor scalability.
5. Finish with Phase 6 polish and final validation.

### Parallel Team Strategy

1. Team completes Phases 1-2 together.
2. Split by story after foundation:
   - Developer A: US1
   - Developer B: US2
   - Developer C: US3
3. Merge completed stories independently, then run polish.

---

## Notes

- Tasks are checklist-compliant and immediately executable.
- `[P]` marks tasks that can run concurrently with low file-conflict risk.
- `[US#]` labels are used only in user story phases.
- MVP scope is explicitly US1 after Setup + Foundational phases.
