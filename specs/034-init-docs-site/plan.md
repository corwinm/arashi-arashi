# Implementation Plan: Documentation Site Repository Initialization

**Branch**: `034-init-docs-site` | **Date**: 2026-02-10 | **Spec**: `specs/034-init-docs-site/spec.md`
**Input**: Feature specification from `specs/034-init-docs-site/spec.md`

## Summary

Initialize a dedicated documentation site repository with a clear landing experience, contributor-ready structure, and automated publication so users can discover docs from the main README and maintainers can keep content current with minimal manual deployment effort.

## Technical Context

**Language/Version**: Markdown (CommonMark) for content, TypeScript-based static site toolchain for build/runtime orchestration  
**Primary Dependencies**: Astro, Starlight, Netlify for hosting/deploy previews, GitHub Actions for validation and link health checks  
**Storage**: Filesystem documentation content and static site artifacts (no application database)  
**Testing**: Documentation quality gates in CI: deterministic install, build/type checks, internal link+anchor validation, markdown/content lint baseline, accessibility smoke checks on critical pages; external links checked in scheduled non-blocking jobs  
**Target Platform**: Public web documentation site for desktop/mobile browsers; repository-hosted contributor workflow  
**Project Type**: Separate documentation repository plus README integration in implementation repository (`repos/arashi`)  
**Performance Goals**: Initial page content visible within 2 seconds on standard broadband; publication completes in less than 10 minutes for normal updates  
**Constraints**: Must support zero-downtime fallback to last successful published version; initial hosting on Netlify with production deploys from the default branch; README documentation entry URL must be continuously health-checked and remain stable  
**Scale/Scope**: Initial launch scope of landing page plus baseline sections (getting started, reference, contributing) for project users and maintainers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable distribution is unaffected (documentation repository setup only) - Pass
- Automatic worktree management behavior in Arashi CLI is unchanged - Pass
- Error recovery and rollback behavior in Arashi CLI is unchanged - Pass
- User-centric interface principle is supported by clearer user-facing docs and contributor guidance - Pass
- Minimalist configuration principle is preserved by limiting new setup to documentation scope - Pass
- Cross-platform compatibility is preserved because output is static web content and repository workflows - Pass
- Test coverage principle is supported by requiring automated documentation validation gates - Pass
- Semantic versioning policy remains unchanged for existing CLI distribution - Pass
- Hook system behavior is unaffected - Pass
- Performance standards are respected by explicit publication latency target and static delivery expectations - Pass

**Gate Result (Pre-Research)**: Pass.

**Post-Design Re-check**: Pass (research decisions, data model, contracts, and quickstart preserve constitutional principles without exceptions).

## Project Structure

### Documentation (this feature)

```text
specs/034-init-docs-site/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── docs-site-publishing.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi-docs/
├── README.md
├── netlify.toml
├── docs/
│   ├── index.md
│   ├── getting-started/
│   ├── reference/
│   └── contributing/
└── .github/
    └── workflows/
        └── docs-validate.yml

repos/arashi/
└── README.md
```

**Structure Decision**: Keep specification and planning artifacts in `specs/034-init-docs-site`, implement documentation site initialization in `repos/arashi-docs`, and integrate discoverability with a documentation entry link in `repos/arashi/README.md`.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
