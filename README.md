# Arashi Specifications Repository

[![npm version](https://img.shields.io/npm/v/arashi.svg)](https://www.npmjs.com/package/arashi)
[![CI](https://github.com/corwinm/arashi/actions/workflows/ci.yml/badge.svg)](https://github.com/corwinm/arashi/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/corwinm/arashi.svg)](https://github.com/corwinm/arashi/blob/main/LICENSE)

Planning and specification workspace for the Arashi project.

## Overview

This repository contains feature specifications, plans, research notes, and task breakdowns used to guide implementation in project repositories under `repos/`.

- Specs are authored in `specs/NNN-feature-name/`.
- Implementation is done in `repos/arashi/`.
- Companion repository content lives in `repos/arashi-skills/`.

## Repositories

- Implementation: [github.com/corwinm/arashi](https://github.com/corwinm/arashi)
- Specs and planning (this repo): [github.com/corwinm/arashi-arashi](https://github.com/corwinm/arashi-arashi)

## Specs-First Workflow

1. Define requirements with `/speckit.specify`.
2. Produce a technical plan with `/speckit.plan`.
3. Generate execution tasks with `/speckit.tasks`.
4. Implement inside `repos/arashi/`.
5. Validate and keep specs/docs in sync.

## Repository Layout

```text
.
├── specs/               # Feature specifications and planning artifacts
├── repos/               # Project repositories (implementation lives here)
│   ├── arashi/
│   └── arashi-skills/
├── docs/                # Supporting process documentation
├── CONTRIBUTING.md
└── README.md
```

## Framework Support Matrix (Spec-Driven Workflows)

| Framework | Support Level | Scope | Caveats |
| --- | --- | --- | --- |
| Spec-Kit | Native | Primary workflow for spec, plan, and tasks generation | None |
| OpenSpec | Supported with modifications | Compatible with equivalent artifact structure and naming | Requires mapping to this repo's `specs/NNN-*` layout |
| Kiro | Supported with modifications | Works for story/task decomposition and implementation guidance | Requires adapting command conventions and path references |
| Specification by Example | Experimental | Useful for acceptance-criteria shaping in specs | No dedicated automation in this repository |
| BDD (Gherkin-first) | Not supported | Can inform narrative requirements only | No native pipeline for feature file execution here |

## Contribution

Use the canonical guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md).

For implementation-specific contribution steps, see [`repos/arashi/CONTRIBUTING.md`](./repos/arashi/CONTRIBUTING.md).

## Badge Applicability Notes

- npm, CI, and license badges above represent the implementation project in `repos/arashi`.
- This specifications repository itself is documentation-focused and does not publish an npm package.

## License

MIT. See [`LICENSE`](./LICENSE).
