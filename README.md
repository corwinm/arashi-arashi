# Arashi Specifications Repository

[![npm version](https://img.shields.io/npm/v/arashi.svg)](https://www.npmjs.com/package/arashi)
[![CI](https://github.com/corwinm/arashi/actions/workflows/ci.yml/badge.svg)](https://github.com/corwinm/arashi/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/corwinm/arashi.svg)](https://github.com/corwinm/arashi/blob/main/LICENSE)

Planning and specification workspace for the Arashi project.

## Overview

This repository contains the planning artifacts used to guide implementation in project repositories under `repos/`.

- Active change proposals, designs, and task breakdowns are authored in `openspec/changes/`.
- Stable capability requirements live in `openspec/specs/`.
- Earlier numbered specs remain in `specs/` as historical artifacts from the project's SpecKit-oriented start.
- Implementation is done in `repos/arashi/`.
- Companion repository content lives in `repos/arashi-skills/`.

## Repositories

- Implementation: [github.com/corwinm/arashi](https://github.com/corwinm/arashi)
- Specs and planning (this repo): [github.com/corwinm/arashi-arashi](https://github.com/corwinm/arashi-arashi)

## OpenSpec Workflow

This repository started with a SpecKit-oriented workflow, but current planning work for the Arashi project now uses OpenSpec. Treat older `/speckit.*` references and numbered `specs/NNN-*` artifacts as historical context rather than the active path for new changes.

1. Create or refine a change in `openspec/changes/` with `/opsx-propose <change-name>`.
2. Review the generated proposal, design, specs, and tasks artifacts.
3. Implement the pending tasks with `/opsx-apply <change-name>`.
4. Make implementation changes in the affected repository under `repos/`.
5. Validate the touched repos and keep planning artifacts/docs in sync.

## Repository Layout

```text
.
├── openspec/            # Active OpenSpec changes and capability specs
├── specs/               # Legacy numbered specs from the earlier SpecKit-oriented workflow
├── repos/               # Project repositories (implementation lives here)
│   ├── arashi/
│   ├── arashi-docs/
│   ├── arashi-skills/
│   └── arashi-vscode/
├── docs/                # Supporting process documentation
├── CONTRIBUTING.md
└── README.md
```

## Framework Support Matrix (Spec-Driven Workflows)

| Framework | Support Level | Scope | Caveats |
| --- | --- | --- | --- |
| OpenSpec | Current | Primary workflow for change proposals, design, specs, and tasks | Use `openspec/changes/` for active changes and `openspec/specs/` for capability baselines |
| Spec-Kit | Historical | Earlier workflow used during initial project setup | Legacy `specs/NNN-*` artifacts remain for reference, but new changes should use OpenSpec |
| Kiro | Supported with modifications | Works for story/task decomposition and implementation guidance | Requires adapting command conventions and path references |
| Specification by Example | Experimental | Useful for acceptance-criteria shaping in specs | No dedicated automation in this repository |
| BDD (Gherkin-first) | Not supported | Can inform narrative requirements only | No native pipeline for feature file execution here |

## Contribution

Use the canonical guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

Quick path:

1. Build and link Arashi CLI from `repos/arashi/`.
2. Create a feature worktree with `arashi create NNN-feature-name`.
3. Switch into that worktree and run `opencode`.
4. Propose or update a change with `/opsx-propose <change-name>`.
5. Implement the change tasks with `/opsx-apply <change-name>`.
6. Prefer Claude or Codex models for spec and implementation work.

For implementation-specific contribution steps, see [`repos/arashi/CONTRIBUTING.md`](./repos/arashi/CONTRIBUTING.md).

## Badge Applicability Notes

- npm, CI, and license badges above represent the implementation project in `repos/arashi`.
- This specifications repository itself is documentation-focused and does not publish an npm package.

## License

MIT. See [`LICENSE`](./LICENSE).
