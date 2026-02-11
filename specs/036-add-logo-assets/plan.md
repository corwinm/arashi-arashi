# Implementation Plan: Unified Logo Presence

**Branch**: `036-add-logo-assets` | **Date**: 2026-02-11 | **Spec**: `specs/036-add-logo-assets/spec.md`
**Input**: Feature specification from `specs/036-add-logo-assets/spec.md`

## Summary

Deliver one cohesive Arashi logo family (full textual ASCII logo + compact icon treatment) and apply it consistently across the required brand surfaces: README top placement, CLI help output, docs site branding, and docs favicon. The implementation approach uses ASCII-safe rendering rules for terminal and markdown surfaces, compact-variant fallbacks for constrained contexts, and explicit validation criteria to keep brand consistency auditable across repositories.

## Technical Context

**Language/Version**: TypeScript 5.9 (CLI), Markdown (CommonMark), Astro config/CSS, SVG/ICO static assets  
**Primary Dependencies**: Bun runtime, commander (CLI help rendering), Astro + Starlight (docs site)  
**Storage**: Filesystem assets and source files in repository worktrees (no application database)  
**Testing**: `bun run lint`, `bun test`, `bun run build` in `repos/arashi`; `bun run validate`, `bun run build` in `repos/arashi-docs`; manual acceptance checks for README, CLI help, docs logo, and favicon  
**Target Platform**: GitHub README renderers, local terminal environments (TTY and piped output), modern desktop/mobile browsers  
**Project Type**: Multi-repository CLI + documentation branding update  
**Performance Goals**: CLI help remains readable at common terminal widths (120/100/80/60 columns) with no noticeable regression in help display latency; all required brand surfaces verifiable in a single review pass under 20 minutes  
**Constraints**: Logo assets for text surfaces use printable ASCII only; full logo target <=52 chars wide and <=6 lines; compact fallback target <=12 chars wide and <=3 lines; fallback to compact or plain text when width/TTY constraints would break readability; favicon updates must account for browser cache behavior  
**Scale/Scope**: One logo family, two presentation variants, and four required surfaces across `repos/arashi` and `repos/arashi-docs`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Single-file executable: preserved; branding changes do not alter distribution model - Pass
- II. Automatic worktree management: preserved; no change to orchestration logic - Pass
- III. Error recovery and rollback: preserved; no rollback semantics changed - Pass
- IV. User-centric interface: improved by clearer brand identity in README/help/docs - Pass
- V. Minimalist configuration: preserved; no new required configuration surfaces - Pass
- VI. Cross-platform compatibility: addressed by ASCII-first text logo policy and terminal fallback behavior - Pass
- VII. Test coverage: plan includes CLI behavior verification plus existing lint/test/build gates in implementation repos - Pass
- VIII. Semantic versioning: preserved; feature planned as additive branding update - Pass
- IX. Hook system: unaffected - Pass
- X. Performance standards: preserved; logo rendering is static/constant and constrained by readability thresholds - Pass

**Gate Result (Pre-Research)**: Pass.

**Post-Design Re-check**: Pass (research decisions, data model, contract definitions, and quickstart preserve all constitutional requirements; no exceptions required).

## Project Structure

### Documentation (this feature)

```text
specs/036-add-logo-assets/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── logo-presence.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi/
├── README.md
├── src/
│   ├── index.ts
│   └── lib/
│       └── (logo text assets or rendering helpers)
└── tests/
    ├── integration/
    └── unit/

repos/arashi-docs/
├── astro.config.mjs
├── README.md
├── docs/
│   └── index.md
└── public/
    └── (favicon and related icon assets)
```

**Structure Decision**: Keep planning artifacts in `specs/036-add-logo-assets` and implement brand placements in existing CLI/docs repositories under `repos/arashi` and `repos/arashi-docs`, where the affected README, help output, and docs branding surfaces already live.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
