# Implementation Plan: Linter and Formatter Setup

**Branch**: `030-setup-oxlint-oxfmt` | **Date**: 2026-02-09 | **Spec**: `specs/030-setup-oxlint-oxfmt/spec.md`
**Input**: Feature specification from `specs/030-setup-oxlint-oxfmt/spec.md`

## Summary

Establish Oxlint and Oxfmt as the default code quality workflows for the Arashi repository, expose consistent contributor commands, and enforce these checks in pull request validation so non-compliant changes are blocked before merge.

## Technical Context

**Language/Version**: TypeScript 5.9 with Bun runtime  
**Primary Dependencies**: Oxlint, Oxfmt, Bun, GitHub Actions CI  
**Storage**: Repository configuration files and source files on filesystem (no new persistent store)  
**Testing**: Bun test runner, plus lint and format validation checks in local and CI flows  
**Target Platform**: macOS, Linux, and Windows contributors; Linux CI runners  
**Project Type**: Single CLI project (`repos/arashi`)  
**Performance Goals**: PR quality checks complete within 6 minutes p95; local changed-file quality checks complete within 60 seconds for typical changes  
**Constraints**: Preserve existing contributor workflow, avoid formatting generated/vendor artifacts, keep local and CI outcomes deterministic, no breaking changes to user-facing CLI commands  
**Scale/Scope**: Medium TypeScript CLI codebase with ongoing multi-contributor pull request activity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Single-file executable distribution model unchanged (tooling affects development workflow only) - Pass
- Automatic worktree coordination behavior untouched - Pass
- Error recovery and rollback behavior untouched - Pass
- User-centric interface upheld through clear lint/format feedback and remediation guidance - Pass
- Minimalist configuration upheld by adding only essential quality configuration - Pass
- Cross-platform compatibility preserved for local contributor tooling and CI validation - Pass
- Test coverage principle supported by adding or updating tests with this feature - Pass
- Semantic versioning impact is additive (`feat`) with no breaking change - Pass
- Hook system compatibility preserved (no removal or behavioral change to hooks) - Pass
- Performance standards respected through bounded check duration targets and parallelizable CI checks - Pass

**Post-Design Re-check**: Pass (research, data model, contracts, and quickstart preserve all constitutional principles without exceptions)

## Project Structure

### Documentation (this feature)

```text
specs/030-setup-oxlint-oxfmt/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── quality-checks.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi/
├── package.json
├── oxlint.json
├── .oxfmtrc.json
├── src/
├── tests/
└── .github/
    └── workflows/
        └── ci.yml
```

**Structure Decision**: Keep implementation in `repos/arashi` and introduce quality-tool configuration at repository root while reusing existing source, test, and CI workflow locations.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
