# Implementation Plan: Update Docs Domain Across Projects

**Branch**: `035-update-docs-domain` | **Date**: 2026-02-10 | **Spec**: `specs/035-update-docs-domain/spec.md`
**Input**: Feature specification from `specs/035-update-docs-domain/spec.md`

## Summary

Replace deprecated default Netlify documentation-domain references with `https://arashi.haphazard.dev` across in-scope project surfaces, preserve URL path/query/fragment semantics, and provide auditable migration evidence plus policy checks that prevent reintroducing deprecated domain references.

## Technical Context

**Language/Version**: Markdown (CommonMark), TypeScript 5.9, JavaScript module config, YAML workflow definitions  
**Primary Dependencies**: Bun runtime scripts, Astro/Starlight site configuration, GitHub Actions workflows, Netlify publication pipeline  
**Storage**: Filesystem content and repository metadata only (no application database)  
**Testing**: `bun run validate` quality gates in `repos/arashi-docs`, README link health checks, repository CI checks for changed surfaces  
**Target Platform**: Multi-repository documentation surfaces in `repos/arashi` and `repos/arashi-docs`, with public docs endpoint at `https://arashi.haphazard.dev`  
**Project Type**: Multi-repository documentation/configuration migration  
**Performance Goals**: Full migration verification evidence can be reviewed by an approver within 30 minutes; no critical broken-link findings at acceptance  
**Constraints**: Preserve path/query/fragment when replacing domain-only URL components; do not alter non-target external links; document immutable/external exceptions with owner and reason  
**Scale/Scope**: Current in-scope baseline is 5 identified deprecated-domain references across 2 repositories, plus policy/validation updates to prevent regressions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Single-file executable distribution: unchanged (docs-domain update only) - Pass
- II. Automatic worktree management: unchanged - Pass
- III. Error recovery and rollback behavior: unchanged - Pass
- IV. User-centric interface: improved by reducing stale documentation entry points - Pass
- V. Minimalist configuration: preserved by centralizing one canonical docs domain - Pass
- VI. Cross-platform compatibility: preserved (content/config updates only) - Pass
- VII. Test coverage and automated quality checks: supported via existing docs validation gates and added policy verification scope - Pass
- VIII. Semantic versioning: unchanged for product release behavior - Pass
- IX. Hook system: unaffected - Pass
- X. Performance standards: unaffected for CLI runtime; migration verification kept lightweight and auditable - Pass

**Gate Result (Pre-Research)**: Pass.

**Post-Design Re-check**: Pass (research, data model, contracts, and quickstart keep constitutional principles intact; no exceptions required).

## Project Structure

### Documentation (this feature)

```text
specs/035-update-docs-domain/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── docs-domain-migration.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi/
└── README.md

repos/arashi-docs/
├── README.md
├── astro.config.mjs
├── scripts/
│   └── check-readme-link.ts
├── docs/
│   └── contributing/
│       └── validation-troubleshooting.md
└── .github/
    └── workflows/
        └── docs-validate.yml
```

**Structure Decision**: Keep planning artifacts in `specs/035-update-docs-domain` and implement migration/policy enforcement in existing documentation surfaces under `repos/arashi` and `repos/arashi-docs`, where current canonical URL coupling already exists.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
