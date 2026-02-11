# Tasks: Unified Logo Presence

**Input**: Design documents from `/Users/corwinm/Developer/arashi-arashi.git/new-logo/specs/036-add-logo-assets/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/logo-presence.openapi.yaml`, `quickstart.md`

**Tests**: No new automated test authoring tasks are required by the feature spec; validation uses existing repo quality gates plus manual acceptance checks.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an explicit file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create canonical logo asset locations shared by all stories.

- [X] T001 Create branding asset directories at `repos/arashi/assets/logo/` and `repos/arashi-docs/public/branding/`
- [X] T002 Create canonical full ASCII logo source in `repos/arashi/assets/logo/arashi-full.txt`
- [X] T003 [P] Create canonical compact ASCII logo source in `repos/arashi/assets/logo/arashi-compact.txt`
- [X] T004 [P] Create canonical vector logo mark source in `repos/arashi/assets/logo/arashi-mark.svg`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared logo rules and reusable helpers required by all user stories.

**CRITICAL**: Complete this phase before starting user story implementation.

- [X] T005 Implement shared logo definitions and variant selection helpers in `repos/arashi/src/lib/logo.ts`
- [X] T006 [P] Implement terminal context helpers for TTY/column detection in `repos/arashi/src/lib/terminal-context.ts`
- [X] T007 Define canonical logo-family rules, ASCII limits, and fallback thresholds in `repos/arashi/docs/branding/logo-family.md`
- [X] T008 Wire shared logo helper imports into CLI bootstrap in `repos/arashi/src/index.ts`
- [X] T009 [P] Add cross-repo logo usage guidance for docs maintainers in `repos/arashi-docs/docs/contributing/logo-branding.md`

**Checkpoint**: Shared assets, fallback policy, and usage rules are defined; user stories can now proceed.

---

## Phase 3: User Story 1 - Brand visible in project README (Priority: P1) MVP

**Goal**: Show an identifiable Arashi logo at the top of the project README before core descriptive content.

**Independent Test**: Open `repos/arashi/README.md` in standard markdown renderers and verify the logo appears first and remains legible.

### Implementation for User Story 1

- [X] T010 [US1] Add the full ASCII logo block at the top of `repos/arashi/README.md`
- [X] T011 [US1] Adjust heading and opening content flow below the logo in `repos/arashi/README.md`
- [X] T012 [P] [US1] Document README rendering constraints and acceptable fallbacks in `repos/arashi/docs/branding/logo-family.md`
- [X] T013 [P] [US1] Record README acceptance verification outcomes in `specs/036-add-logo-assets/quickstart.md`

**Checkpoint**: User Story 1 is complete and independently demonstrable via README-only validation.

---

## Phase 4: User Story 2 - Brand visible in CLI help output (Priority: P2)

**Goal**: Display the Arashi logo in CLI help while preserving help readability in interactive and non-interactive contexts.

**Independent Test**: Run `arashi -h` and verify logo presence with readable command guidance at 120/100/80/60 columns and piped output behavior.

### Implementation for User Story 2

- [X] T014 [US2] Add help-banner rendering hook for global CLI help output in `repos/arashi/src/index.ts`
- [X] T015 [P] [US2] Implement full/compact/plain help-banner selection logic in `repos/arashi/src/lib/logo.ts`
- [X] T016 [P] [US2] Apply terminal-width and non-interactive fallback behavior in `repos/arashi/src/lib/terminal-context.ts`
- [X] T017 [US2] Update CLI help usage notes to mention logo behavior in `repos/arashi/README.md`
- [X] T018 [US2] Record multi-width and non-interactive help-output verification in `repos/arashi/docs/branding/logo-family.md`

**Checkpoint**: User Story 2 is complete and independently demonstrable via CLI help output checks.

---

## Phase 5: User Story 3 - Brand visible in docs site and browser tab (Priority: P3)

**Goal**: Apply cohesive logo branding to docs site chrome and browser favicon.

**Independent Test**: Open docs site pages and confirm visible logo plus browser tab icon are present and cohesive with the same logo family.

### Implementation for User Story 3

- [X] T019 [P] [US3] Create docs header logo asset in `repos/arashi-docs/src/assets/arashi-logo.svg`
- [X] T020 [P] [US3] Create docs favicon assets in `repos/arashi-docs/public/favicon.svg` and `repos/arashi-docs/public/favicon.ico`
- [X] T021 [US3] Configure docs logo and favicon references in `repos/arashi-docs/astro.config.mjs`
- [X] T022 [US3] Update docs homepage branding content to align with the logo family in `repos/arashi-docs/docs/index.md`
- [X] T023 [US3] Add favicon cache-refresh guidance for maintainers in `repos/arashi-docs/README.md`
- [X] T024 [US3] Record desktop/mobile docs branding verification outcomes in `repos/arashi-docs/docs/contributing/review-checklist.md`

**Checkpoint**: User Story 3 is complete and independently demonstrable via docs logo/favicon checks.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, cohesion sign-off, and release readiness across all stories.

- [X] T025 [P] Run CLI repository quality gates defined in `repos/arashi/package.json` (`bun run lint`, `bun test`, `bun run build`)
- [X] T026 [P] Run docs repository validation/build gates defined in `repos/arashi-docs/package.json` (`bun run validate`, `bun run build`)
- [X] T027 Consolidate four-surface acceptance evidence in `specs/036-add-logo-assets/quickstart.md`
- [X] T028 Update cross-surface cohesion sign-off criteria in `repos/arashi-docs/docs/contributing/review-checklist.md`

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

- `US1 (P1)`: Starts after Foundational; no dependency on US2/US3
- `US2 (P2)`: Starts after Foundational; no hard dependency on US1/US3
- `US3 (P3)`: Starts after Foundational; no hard dependency on US1/US2

Graph: `Setup -> Foundational -> {US1, US2, US3} -> Polish`

### Entity and Contract Mapping

- **Logo Family / Logo Variant** (`data-model.md`): Implemented in Phase 1-2 via `repos/arashi/assets/logo/*` and `repos/arashi/src/lib/logo.ts`
- **Display Surface / Brand Placement Rule** (`data-model.md`): Implemented in Phase 2 plus story phases (`repos/arashi/README.md`, `repos/arashi/src/index.ts`, `repos/arashi-docs/astro.config.mjs`)
- **Brand Verification Record** (`data-model.md`): Implemented in Phase 3-6 via verification records in `repos/arashi/docs/branding/logo-family.md`, `repos/arashi-docs/docs/contributing/review-checklist.md`, and `specs/036-add-logo-assets/quickstart.md`
- **Contract endpoints** (`contracts/logo-presence.openapi.yaml`):
  - `/surfaces/readme/header-logo` -> Phase 3 (US1)
  - `/surfaces/cli/help-logo` -> Phase 4 (US2)
  - `/surfaces/docs/header-logo`, `/surfaces/docs/favicon` -> Phase 5 (US3)
  - `/verifications/logo-presence`, `/reviews/brand-cohesion` -> Phase 6 (Polish)

---

## Parallel Execution Examples

### User Story 1

```bash
# Parallel story tasks on independent files
Task T012 in repos/arashi/docs/branding/logo-family.md
Task T013 in specs/036-add-logo-assets/quickstart.md
```

### User Story 2

```bash
# Split CLI behavior work by file
Task T015 in repos/arashi/src/lib/logo.ts
Task T016 in repos/arashi/src/lib/terminal-context.ts
```

### User Story 3

```bash
# Create docs visual assets in parallel
Task T019 in repos/arashi-docs/src/assets/arashi-logo.svg
Task T020 in repos/arashi-docs/public/favicon.svg and repos/arashi-docs/public/favicon.ico
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 and Phase 2
2. Deliver Phase 3 (US1) only
3. Validate README logo acceptance criteria
4. Demo/review MVP

### Incremental Delivery

1. Complete shared setup/foundation once
2. Deliver US1 (README branding)
3. Deliver US2 (CLI help branding)
4. Deliver US3 (docs logo + favicon)
5. Finish with Phase 6 validation/sign-off

### Parallel Team Strategy

1. Team aligns on Phase 1-2 first
2. Then split by user story owners:
   - Engineer A: US1
   - Engineer B: US2
   - Engineer C: US3
3. Rejoin for Phase 6 cross-surface validation

---

## Notes

- All tasks use the required checklist format with IDs, optional `[P]`, and `[US#]` labels for story tasks.
- User stories remain independently testable as specified in `spec.md`.
- Manual acceptance evidence is captured in explicit file paths for auditability.
