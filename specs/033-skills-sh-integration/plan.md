# Implementation Plan: skills.sh Integration Repository

**Branch**: `033-skills-sh-integration` | **Date**: 2026-02-10 | **Spec**: `/Users/corwinm/Developer/arashi-arashi.git/init-skills-repo/specs/033-skills-sh-integration/spec.md`
**Input**: Feature specification from `/specs/033-skills-sh-integration/spec.md`

## Summary

Create a dedicated skills repository for Arashi that supports discovery, installation, verification, workflow execution, troubleshooting, and optional registry publication. The implementation approach uses a spec-compliant skill manifest, a preflight-first onboarding flow, and explicit validation gates to reduce first-run failures.

## Technical Context

**Language/Version**: Markdown (CommonMark), YAML 1.2, shell scripts (POSIX/Bash compatible)  
**Primary Dependencies**: skills CLI/skills.sh conventions, GitHub repository hosting, Arashi CLI distribution artifacts  
**Storage**: File system (skill metadata, docs, scripts, and examples)  
**Testing**: Installation and verification smoke checks, scenario-based workflow validation, documentation walkthrough validation  
**Target Platform**: skills ecosystem users on macOS/Linux/Windows terminal environments  
**Project Type**: Documentation and integration repository (no core runtime changes)  
**Performance Goals**: >=90% of first-time users complete install plus first workflow in <=15 minutes; validation feedback available in <=2 minutes under normal network conditions  
**Constraints**: No manual repository file edits for first-time install; include actionable recovery for prerequisite and network failures; publication path remains optional when platform policy disallows listing  
**Scale/Scope**: One skill package, one canonical skill definition, >=3 workflow examples, one quickstart, one troubleshooting path, and one cross-link section in main Arashi docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

- **I. Single-File Executable**: PASS - No changes to binary distribution requirements.
- **II. Automatic Worktree Management**: PASS - Integration path only; no change to orchestration behavior.
- **III. Error Recovery & Rollback**: PASS - Design includes explicit failure handling and user recovery guidance.
- **IV. User-Centric Interface**: PASS - Requires quickstart, examples, and troubleshooting clarity.
- **V. Minimalist Configuration**: PASS - Installation flow minimizes manual configuration.
- **VI. Cross-Platform Compatibility**: PASS - Documentation and validation cover macOS/Linux/Windows terminal environments.
- **VII. Test Coverage**: PASS - Plan includes integration smoke validation for setup and workflows.
- **VIII. Semantic Versioning**: PASS - No changes to release/versioning policy.
- **IX. Hook System**: PASS - No hook behavior removed or restricted.
- **X. Performance Standards**: PASS - Adds measurable onboarding and validation time outcomes.

**Gate Decision (Pre-Research)**: PASS

### Post-Phase 1 Design Re-Check

- `research.md`, `data-model.md`, `contracts/`, and `quickstart.md` preserve all constitutional principles.
- No design artifact introduces a constitutional violation.

**Gate Decision (Post-Design)**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/033-skills-sh-integration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── skill-integration.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi-skills/
├── README.md
├── LICENSE
├── skills/
│   └── arashi/
│       ├── SKILL.md
│       ├── references/
│       ├── assets/
│       └── scripts/
└── examples/

repos/arashi/
└── README.md
```

**Structure Decision**: Implement skill assets and integration workflows in `repos/arashi-skills/`; add user-facing integration documentation links in `repos/arashi/README.md`; keep planning artifacts in `specs/033-skills-sh-integration/`.

## Complexity Tracking

No constitutional violations requiring justification.
