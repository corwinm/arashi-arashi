# Implementation Plan: Install Script and Onboarding Instructions

**Branch**: `038-add-install-script` | **Date**: 2026-02-11 | **Spec**: `specs/038-add-install-script/spec.md`
**Input**: Feature specification from `specs/038-add-install-script/spec.md`

## Summary

Add a one-command curl installation path alongside the existing npm path, then align all first-touch onboarding surfaces so users can discover both methods immediately and follow consistent prerequisite, verification, troubleshooting, and next-step guidance. The implementation strategy keeps one canonical install guidance contract across `repos/arashi` and `repos/arashi-docs`, with release-aware script behavior and explicit consistency checks to prevent docs drift.

## Technical Context

**Language/Version**: Shell script (POSIX/Bash) for installer bootstrap, TypeScript 5.9 + Bun runtime for CLI/release support scripts, Markdown (CommonMark) for README and documentation, Astro/Starlight content frontmatter for landing hero content  
**Primary Dependencies**: GitHub Releases distribution assets, npm global distribution (`arashi` package), Bun build/release scripts, Astro/Starlight docs site toolchain  
**Storage**: Filesystem content in repository worktrees; release artifacts in GitHub Releases (no application database)  
**Testing**: `bun run lint`, `bun test`, `bun run build` in `repos/arashi`; `bun run validate`, `bun run build` in `repos/arashi-docs`; manual acceptance checks for curl install flow, npm install flow, hero visibility, and command consistency  
**Target Platform**: First-time CLI users on macOS ARM64, Linux x64, and Windows x64 (with platform-appropriate installation guidance), plus docs consumers on modern desktop/mobile browsers  
**Project Type**: Multi-repository CLI distribution + documentation/landing-page onboarding update  
**Performance Goals**: Preserve spec outcomes: >=90% install completion within 5 minutes, >=95% first-attempt verification success, and full command-consistency checks across hero/docs/README in each release cycle  
**Constraints**: One-command curl path and npm path must both be copy-ready; no account gate for initial install; install messaging must include prerequisites, verification, troubleshooting, and next action; command text must stay synchronized across all in-scope surfaces  
**Scale/Scope**: Two installation methods, three high-visibility surfaces (`repos/arashi/README.md`, `repos/arashi-docs/docs/getting-started/index.md`, `repos/arashi-docs/docs/index.md` hero), plus supporting install-script/release workflow touchpoints in `repos/arashi`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- I. Single-file executable: preserved; install path still distributes existing compiled binaries and wrapper behavior - Pass
- II. Automatic worktree management: unchanged; feature is installation/onboarding only - Pass
- III. Error recovery and rollback: unchanged for CLI worktree operations; installer plan adds explicit failure messaging and safe retry expectations - Pass
- IV. User-centric interface: improved with dual install methods, clear prerequisites, and troubleshooting guidance - Pass
- V. Minimalist configuration: preserved; no new mandatory configuration files introduced - Pass
- VI. Cross-platform compatibility: addressed by platform-aware install guidance and fallback paths per supported OS/arch matrix - Pass
- VII. Test coverage: implementation plan includes required lint/test/build gates plus onboarding acceptance checks across repositories - Pass
- VIII. Semantic versioning: preserved; release pipeline continues semantic-release tagging and binary publication - Pass
- IX. Hook system: unaffected; no lifecycle hook behavior changes - Pass
- X. Performance standards: CLI runtime performance unaffected; onboarding improvements target faster successful first install - Pass

**Gate Result (Pre-Research)**: Pass.

**Post-Design Re-check**: Pass (research, data model, contracts, and quickstart keep constitutional principles intact; no exceptions required).

## Project Structure

### Documentation (this feature)

```text
specs/038-add-install-script/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── install-onboarding.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
repos/arashi/
├── README.md
├── docs/
│   └── INSTALLATION.md
├── scripts/
│   └── install.sh
├── .releaserc.json
└── .github/
    └── workflows/
        └── release.yml

repos/arashi-docs/
├── docs/
│   ├── index.md
│   └── getting-started/
│       └── index.md
└── scripts/
    └── (existing validation scripts leveraged for checks)
```

**Structure Decision**: Keep planning artifacts in `specs/038-add-install-script` and implement install and onboarding updates in the existing implementation repositories: install/release/README behavior in `repos/arashi` and landing/docs guidance in `repos/arashi-docs`.

## Complexity Tracking

No constitutional violations identified; no complexity exceptions required.
