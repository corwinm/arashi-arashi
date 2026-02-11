# Tasks: Update Docs Domain Across Projects

**Input**: Design documents from `/specs/035-update-docs-domain/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated test creation was not explicitly requested in the specification; validation tasks use existing repository quality gates.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish migration artifacts and shared canonical-domain scaffolding.

- [X] T001 Create in-scope surface manifest in `repos/arashi-docs/docs/contributing/docs-domain-migration-scope.md`
- [X] T002 Create migration evidence template in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`
- [X] T003 [P] Create approved-exceptions register template in `repos/arashi-docs/docs/contributing/docs-domain-exceptions.md`
- [X] T004 [P] Create canonical docs URL constant module in `repos/arashi-docs/scripts/lib/canonical-docs-url.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared validation and baseline inventory required by all user stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

- [X] T005 Implement canonical-domain policy scanner for in-scope files in `repos/arashi-docs/scripts/check-canonical-docs-domain.ts`
- [X] T006 Update canonical README-link checker to consume shared URL constant in `repos/arashi-docs/scripts/check-readme-link.ts`
- [X] T007 Wire `validate:docs-domain` and include it in `validate` pipeline in `repos/arashi-docs/package.json`
- [X] T008 Update docs validation workflow to run canonical-domain check and include README trigger in `repos/arashi-docs/.github/workflows/docs-validate.yml`
- [X] T009 Capture baseline deprecated-domain inventory counts in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`

**Checkpoint**: Shared policy enforcement and baseline inventory are ready.

---

## Phase 3: User Story 1 - Standardize Project Documentation Links (Priority: P1) 🎯 MVP

**Goal**: Replace all in-scope deprecated-domain references with the canonical domain while preserving URL suffix semantics.

**Independent Test**: Audit each in-scope project surface for documentation URLs and confirm all deprecated default domain references are replaced by the canonical domain.

### Implementation for User Story 1

- [X] T010 [P] [US1] Replace the top-level Documentation URL in `repos/arashi/README.md`
- [X] T011 [P] [US1] Replace canonical docs URL text in `repos/arashi-docs/README.md`
- [X] T012 [P] [US1] Replace the site base URL with the canonical domain in `repos/arashi-docs/astro.config.mjs`
- [X] T013 [P] [US1] Replace deprecated-domain troubleshooting guidance in `repos/arashi-docs/docs/contributing/validation-troubleshooting.md`
- [X] T014 [US1] Set canonical fallback URL to `https://arashi.haphazard.dev` in `repos/arashi-docs/scripts/check-readme-link.ts`
- [X] T015 [US1] Record before/after URL mapping and path-query-fragment preservation notes in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`
- [X] T016 [US1] Run docs validation gates defined in `repos/arashi-docs/package.json` and log outcomes in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`

**Checkpoint**: User Story 1 delivers canonical-domain consistency across all current in-scope references.

---

## Phase 4: User Story 2 - Keep Future Links Consistent (Priority: P2)

**Goal**: Prevent future introduction of deprecated-domain references through policy checks and contributor guidance.

**Independent Test**: Add or edit representative documentation links in scope and verify review criteria require canonical-domain usage.

### Implementation for User Story 2

- [X] T017 [US2] Add deprecated-domain denylist and canonical-host allowlist rules in `repos/arashi-docs/scripts/check-canonical-docs-domain.ts`
- [X] T018 [US2] Enforce exact canonical target for `[Documentation](...)` link in `repos/arashi-docs/scripts/check-readme-link.ts`
- [X] T019 [P] [US2] Document canonical-link authoring policy and remediation steps in `repos/arashi-docs/docs/contributing/validation-troubleshooting.md`
- [X] T020 [P] [US2] Document canonical-domain validation command usage in `repos/arashi-docs/README.md`
- [X] T021 [US2] Add README docs-link drift guard to CI checks in `repos/arashi/.github/workflows/ci.yml`
- [X] T022 [US2] Execute regression-check commands and capture results in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`

**Checkpoint**: User Story 2 enforces canonical-domain policy for future edits.

---

## Phase 5: User Story 3 - Approve Migration with Evidence (Priority: P3)

**Goal**: Provide release approvers with complete, auditable migration evidence including exceptions.

**Independent Test**: Review the migration evidence and confirm it lists all updated references and any approved exceptions.

### Implementation for User Story 3

- [X] T023 [US3] Populate final updated-reference inventory by in-scope surface in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`
- [X] T024 [P] [US3] Populate approved exceptions (or explicit none) with owner and reason in `repos/arashi-docs/docs/contributing/docs-domain-exceptions.md`
- [X] T025 [US3] Add release-approver checklist and sign-off fields in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`
- [X] T026 [US3] Cross-link scope, evidence, and exceptions artifacts in `repos/arashi-docs/docs/contributing/docs-domain-migration-scope.md`
- [X] T027 [US3] Add audit-traceability pointer to evidence artifacts in `repos/arashi-docs/README.md`
- [X] T028 [US3] Verify and record closure equation (`updated + approved exceptions = total target`) in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`

**Checkpoint**: User Story 3 provides approver-ready migration evidence.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass and release-ready handoff across all stories.

- [X] T029 [P] Run final deprecated-domain sweep for touched surfaces and record outcome in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`
- [X] T030 [P] Run full docs validation suite from `repos/arashi-docs/package.json` and append final run details to `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`
- [X] T031 Update final implementation summary and handoff notes in `repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; recommended after US1 so policy rules validate migrated canonical state.
- **Phase 5 (US3)**: Depends on US1 completion and inputs from US2 checks.
- **Phase 6 (Polish)**: Depends on all selected user stories being complete.

### User Story Dependency Graph

- `US1 (P1) -> US3 (P3)`
- `US2 (P2) -> US3 (P3)`
- `US1 (P1)` and `US2 (P2)` can proceed in parallel after foundational work, but sequence `US1` then `US2` is lower risk.

### Within Each User Story

- Update core files first.
- Run story-specific validation checks.
- Record evidence for independent acceptance before moving on.

### Parallel Opportunities

- Setup: `T003`, `T004` can run in parallel.
- Foundational: `T006` and `T007` can run in parallel after `T005` scaffolding is ready.
- US1: `T010`, `T011`, `T012`, and `T013` can run in parallel.
- US2: `T019` and `T020` can run in parallel.
- US3: `T024` can run in parallel with `T023` once evidence skeleton exists.
- Polish: `T029` and `T030` can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Parallel file updates for US1
Task: "T010 [US1] Replace Documentation URL in repos/arashi/README.md"
Task: "T011 [US1] Replace canonical docs URL text in repos/arashi-docs/README.md"
Task: "T012 [US1] Replace site URL in repos/arashi-docs/astro.config.mjs"
Task: "T013 [US1] Replace troubleshooting URL in repos/arashi-docs/docs/contributing/validation-troubleshooting.md"
```

## Parallel Example: User Story 2

```bash
# Parallel policy documentation updates for US2
Task: "T019 [US2] Update contributor policy in repos/arashi-docs/docs/contributing/validation-troubleshooting.md"
Task: "T020 [US2] Update canonical-domain validation docs in repos/arashi-docs/README.md"
```

## Parallel Example: User Story 3

```bash
# Parallel evidence and exceptions updates for US3
Task: "T023 [US3] Populate updated-reference inventory in repos/arashi-docs/docs/contributing/docs-domain-migration-evidence.md"
Task: "T024 [US3] Populate approved exceptions in repos/arashi-docs/docs/contributing/docs-domain-exceptions.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate US1 independently with the spec-defined audit criteria.
4. If needed, release MVP with canonical URLs standardized.

### Incremental Delivery

1. Deliver US1 to standardize current links.
2. Deliver US2 to prevent regressions.
3. Deliver US3 to finalize auditability and release approval evidence.
4. Finish with Phase 6 polish and final validation.

### Parallel Team Strategy

1. One contributor handles enforcement scripts/workflows (`T005`-`T008`).
2. One contributor handles canonical URL content replacements (`T010`-`T014`).
3. One contributor handles audit artifacts and sign-off docs (`T023`-`T028`).

---

## Notes

- [P] tasks touch separate files and avoid incomplete-task dependencies.
- [USx] labels map each story task directly to spec scenarios for traceability.
- Each user story has independent acceptance criteria copied from `spec.md`.
- All task lines follow the required checklist format.
