# Implementation Plan: Safari Hero Image Visibility

**Branch**: `040-fix-safari-hero-image` | **Date**: 2026-02-15 | **Spec**: `specs/040-fix-safari-hero-image/spec.md`
**Input**: Feature specification from `specs/040-fix-safari-hero-image/spec.md`

## Summary

Fix the docs homepage splash hero so Safari reliably renders the hero image with non-zero height while preserving cross-browser visual consistency and graceful fallback behavior. The approach is to define explicit hero media sizing expectations, stabilize layout behavior for Safari-specific SVG sizing edge cases, and add deterministic verification across Safari desktop/mobile plus Chromium/Firefox.

## Technical Context

**Language/Version**: Markdown (MDX frontmatter), CSS, TypeScript 5.9 toolchain via Bun, Astro 5.x site runtime  
**Primary Dependencies**: Astro, `@astrojs/starlight`, existing docs validation scripts  
**Storage**: Static documentation files on filesystem (no application database)  
**Testing**: `bun run validate`, `bun run build` in `repos/arashi-docs`, plus manual Safari desktop/mobile hero verification checklist  
**Target Platform**: Safari (macOS + iOS), Chrome, Firefox on docs homepage  
**Project Type**: Static documentation web application (single frontend repo)  
**Performance Goals**: Hero region is visibly rendered within 2 seconds for normal network conditions; no added regression to docs build/validation duration beyond 10%  
**Constraints**: Preserve existing hero copy/actions and visual direction; avoid regressions in non-Safari browsers; no backend/service changes  
**Scale/Scope**: One splash page hero media path (`docs/index.mdx`) and supporting presentation rules in docs styling/configuration with focused QA coverage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Single-file executable: unaffected because docs-site styling/content changes do not alter CLI binary distribution - Pass
- II. Automatic worktree management: unaffected; no orchestration behavior changed - Pass
- III. Error recovery and rollback: unaffected for runtime behavior; implementation remains file-level docs update - Pass
- IV. User-centric interface: improved by restoring visible hero content for Safari visitors - Pass
- V. Minimalist configuration: preserved; no new required workspace configuration introduced - Pass
- VI. Cross-platform compatibility: directly addressed through Safari-specific fix with Chrome/Firefox regression verification - Pass
- VII. Test coverage: plan includes existing docs automated validation plus explicit browser acceptance checks for Safari and non-Safari - Pass
- VIII. Semantic versioning: compatible with patch-level bug fix semantics - Pass
- IX. Hook system: unaffected - Pass
- X. Performance standards: preserved; no heavy runtime logic added, and docs page render remains lightweight - Pass

**Gate Result (Pre-Research)**: Pass.

**Post-Design Re-check**: Pass (research decisions, data model, contract definitions, and quickstart keep all constitutional principles intact with no exceptions).

## Project Structure

### Documentation (this feature)

```text
specs/040-fix-safari-hero-image/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── hero-visibility-checks.md
└── tasks.md
```

### Source Code (repository root)
```text
repos/arashi-docs/
├── docs/
│   └── index.mdx
├── src/
│   └── styles/
│       └── theme.css
├── scripts/
│   └── (existing validation scripts leveraged for acceptance)
└── package.json
```

**Structure Decision**: This feature is implemented only in `repos/arashi-docs`, using existing homepage content (`docs/index.mdx`) and theme styling (`src/styles/theme.css`) paths to correct Safari rendering without introducing new backend or multi-repo logic.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
