# Implementation Plan: Audit README Documentation

**Branch**: `031-audit-readmes` | **Date**: 2026-02-09 | **Spec**: `specs/031-audit-readmes/spec.md`
**Input**: Feature specification from `specs/031-audit-readmes/spec.md`

## Summary

Audit and update project READMEs so public documentation matches current implementation, move contribution instructions to a dedicated guide using standard naming, add high-signal repository badges, and add an explicit spec-driven framework support matrix with clear support levels and caveats.

## Technical Context

**Language/Version**: Markdown (CommonMark), YAML for workflow badge targets, JSON for package metadata validation  
**Primary Dependencies**: Existing repository metadata in `repos/arashi` (`package.json`, GitHub workflows, LICENSE), Markdown link conventions, badge providers (GitHub Actions and npm badge endpoints)  
**Storage**: Filesystem documentation files only (no new persistent store)  
**Testing**: Manual claim verification against repository artifacts; markdown/link validation as documentation QA  
**Target Platform**: GitHub repository visitors and contributors on web and mobile GitHub clients  
**Project Type**: Multi-repository documentation update in specs repo and `repos/arashi`  
**Performance Goals**: Primary README trust signals visible within first screen load; contribution path discoverable in <=30 seconds for first-time contributors  
**Constraints**: No inaccurate capability claims, no broken badge/link targets, preserve contributor workflow, avoid implementation promises not backed by current behavior  
**Scale/Scope**: Root specs repo README plus implementation repo README/contribution references and related documentation pointers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable principle is unaffected (documentation-only change) - Pass
- Automatic worktree management behavior is unaffected - Pass
- Error recovery and rollback behavior is unaffected - Pass
- User-centric interface is improved through clearer docs, status signals, and contributor guidance - Pass
- Minimalist configuration is preserved (no new config surface introduced) - Pass
- Cross-platform compatibility remains unchanged (docs consumed platform-independently) - Pass
- Test coverage principle is supported by requiring verifiable documentation claims and link validation - Pass
- Semantic versioning policy remains unchanged (docs scope) - Pass
- Hook system behavior remains unchanged - Pass
- Performance standards for CLI runtime remain unaffected; documentation discoverability goals added - Pass

**Post-Design Re-check**: Pass (research decisions, data model, contracts, and quickstart preserve all constitutional principles without exceptions)

## Project Structure

### Documentation (this feature)

```text
specs/031-audit-readmes/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── documentation-audit.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
README.md
CONTRIBUTING.md

repos/arashi/
├── README.md
├── CONTRIBUTING.md
├── package.json
├── LICENSE
└── .github/
    └── workflows/
        └── ci.yml

repos/arashi-skills/
└── README.md
```

**Structure Decision**: Keep planning artifacts in `specs/031-audit-readmes` and execute documentation updates in README/contribution files across the root specs repository and `repos/arashi` (plus minimal normalization in `repos/arashi-skills` when applicable).

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
