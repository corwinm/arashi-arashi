# Tasks: Safari Hero Image Visibility

**Input**: Design documents from `/Users/corwin/Documents/GitHub/arashi-arashi.git/safari-hero-bug/specs/040-fix-safari-hero-image/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/hero-visibility-checks.md`, `quickstart.md`

**Tests**: No new automated test authoring is explicitly required in the feature spec; validation uses existing docs quality gates and browser acceptance checks.

**Organization**: Tasks are grouped by user story to keep each story independently implementable and verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes at least one exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Capture baseline hero implementation details before making feature changes.

- [X] T001 [P] Review current splash hero media markup and baseline behavior notes in `repos/arashi-docs/docs/index.mdx`
- [X] T002 [P] Review current hero presentation selectors and baseline layout behavior in `repos/arashi-docs/src/styles/theme.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared hero hooks and verification scaffolding used by all user stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Add stable hero media wrapper/class hooks for sizing control in `repos/arashi-docs/docs/index.mdx`
- [X] T004 Add shared hero media baseline style block for deterministic rendering in `repos/arashi-docs/src/styles/theme.css`
- [X] T005 [P] Align required profile/check definitions for execution with implementation notes in `specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md`
- [X] T006 [P] Add verification evidence template entries for all required profiles in `specs/040-fix-safari-hero-image/quickstart.md`

**Checkpoint**: Foundation ready - user story implementation can proceed.

---

## Phase 3: User Story 1 - View Hero Content in Safari (Priority: P1) 🎯 MVP

**Goal**: Ensure Safari users always see the homepage hero media with non-zero height.

**Independent Test**: Open homepage in Safari desktop and Safari mobile viewport and confirm hero media is visible with non-zero height on initial load and reload.

### Implementation for User Story 1

- [X] T007 [US1] Update hero media markup with explicit intrinsic sizing semantics in `repos/arashi-docs/docs/index.mdx`
- [X] T008 [US1] Implement Safari-safe hero media sizing rules (responsive width, non-zero height behavior) in `repos/arashi-docs/src/styles/theme.css`
- [X] T009 [US1] Add Safari reload/cache stability adjustments for hero rendering in `repos/arashi-docs/src/styles/theme.css`
- [X] T010 [US1] Record Safari desktop and Safari mobile verification results in `specs/040-fix-safari-hero-image/quickstart.md`
- [X] T011 [P] [US1] Update Safari-specific required-check wording in `specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md`

**Checkpoint**: User Story 1 is independently functional for Safari visibility and reload stability.

---

## Phase 4: User Story 2 - Preserve Cross-Browser Consistency (Priority: P2)

**Goal**: Keep hero layout intent consistent in Chrome and Firefox while retaining Safari fix behavior.

**Independent Test**: Compare hero rendering across Safari, Chrome, and Firefox on common desktop/mobile viewports and confirm no critical regressions.

### Implementation for User Story 2

- [X] T012 [US2] Tune cross-browser hero spacing/alignment rules after Safari fix in `repos/arashi-docs/src/styles/theme.css`
- [X] T013 [P] [US2] Keep hero media/frontmatter markup browser-neutral with no Safari-only content divergence in `repos/arashi-docs/docs/index.mdx`
- [X] T014 [P] [US2] Update cross-browser acceptance criteria and expected tolerances in `specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md`
- [X] T015 [US2] Record cross-browser comparison outcomes in `specs/040-fix-safari-hero-image/quickstart.md`

**Checkpoint**: User Story 2 is independently functional with Safari fix and non-Safari parity.

---

## Phase 5: User Story 3 - Maintain Readability Without Image (Priority: P3)

**Goal**: Keep hero text and actions readable when hero media fails or is unavailable.

**Independent Test**: Simulate media load failure and confirm title, tagline, and primary action remain readable and unobstructed.

### Implementation for User Story 3

- [X] T016 [P] [US3] Implement hero media failure fallback presentation rules in `repos/arashi-docs/src/styles/theme.css`
- [X] T017 [P] [US3] Adjust hero media markup to preserve text/action readability when media is unavailable in `repos/arashi-docs/docs/index.mdx`
- [X] T018 [US3] Record media-failure and narrow-viewport acceptance outcomes in `specs/040-fix-safari-hero-image/quickstart.md`

**Checkpoint**: User Story 3 is independently functional for no-image readability scenarios.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and release-readiness checks across all stories.

- [X] T019 [P] Run docs quality gates (`bun run lint`, `bun run validate`, `bun run build`) from `repos/arashi-docs/package.json` and log outcomes in `specs/040-fix-safari-hero-image/quickstart.md`
- [X] T020 Execute full required-profile browser checklist and finalize pass/fail matrix in `specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md`
- [X] T021 Finalize end-to-end acceptance evidence and release-readiness notes in `specs/040-fix-safari-hero-image/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2
- **Phase 4 (US2)**: Depends on Phase 2; can run after US1 or in parallel if staffed
- **Phase 5 (US3)**: Depends on Phase 2; can run after US1 or in parallel if staffed
- **Phase 6 (Polish)**: Depends on completion of selected user stories

### User Story Dependency Graph

- `US1 (P1)`: Starts after Foundational; no hard dependency on US2/US3
- `US2 (P2)`: Starts after Foundational; no hard dependency on US1/US3
- `US3 (P3)`: Starts after Foundational; no hard dependency on US1/US2

Graph: `Setup -> Foundational -> {US1, US2, US3} -> Polish`

### Entity and Contract Mapping

- **Hero Section** (`data-model.md`): Implemented in Phase 2 and refined in US1/US3 via `repos/arashi-docs/docs/index.mdx`
- **Hero Media Asset** (`data-model.md`): Implemented in US1 and US3 via `repos/arashi-docs/docs/index.mdx` and `repos/arashi-docs/src/styles/theme.css`
- **Browser Render Profile** (`data-model.md`): Captured in Foundational and US2 via `specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md`
- **Hero Render Verification** (`data-model.md`): Captured in US1/US2/US3 and Polish via `specs/040-fix-safari-hero-image/quickstart.md`
- **Hero visibility checks contract** (`contracts/hero-visibility-checks.md`):
  - Required Safari visibility checks -> US1
  - Cross-browser consistency checks -> US2
  - Media-failure readability checks -> US3
  - Final pass/fail consolidation -> Polish

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallelizable US1 evidence updates after core Safari implementation
Task T010 in specs/040-fix-safari-hero-image/quickstart.md
Task T011 in specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md
```

### User Story 2

```bash
# Parallel US2 updates on separate files
Task T013 in repos/arashi-docs/docs/index.mdx
Task T014 in specs/040-fix-safari-hero-image/contracts/hero-visibility-checks.md
```

### User Story 3

```bash
# Parallel fallback updates across markup and styles
Task T016 in repos/arashi-docs/src/styles/theme.css
Task T017 in repos/arashi-docs/docs/index.mdx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1)
3. Validate Safari visibility/reload behavior independently
4. Demo/review MVP before broader cross-browser refinements

### Incremental Delivery

1. Complete Setup + Foundational once
2. Deliver US1 (Safari visibility bug fix)
3. Deliver US2 (cross-browser consistency)
4. Deliver US3 (media-failure readability)
5. Finish with Phase 6 validation and release-readiness evidence

### Parallel Team Strategy

1. Team aligns on Phase 1-2 first
2. After Foundational completion:
   - Engineer A: US1
   - Engineer B: US2
   - Engineer C: US3
3. Rejoin for Phase 6 final validation evidence

---

## Notes

- All tasks follow the required checklist format with Task ID, optional `[P]`, and `[US#]` labels for story tasks.
- Each user story remains independently testable using criteria from `spec.md` and `contracts/hero-visibility-checks.md`.
- Validation evidence is captured in explicit spec artifact files for auditability.
