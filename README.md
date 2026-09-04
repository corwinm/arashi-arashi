# Arashi Specifications Repository

[![npm version](https://img.shields.io/npm/v/arashi.svg)](https://www.npmjs.com/package/arashi)
[![CI](https://github.com/corwinm/arashi/actions/workflows/ci.yml/badge.svg)](https://github.com/corwinm/arashi/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/corwinm/arashi.svg)](https://github.com/corwinm/arashi/blob/main/LICENSE)

Planning and specification workspace for the Arashi project.

## Overview

- Durable change proposals and capability deltas live in `openspec/changes/`.
- Canonical capability requirements live in `openspec/specs/`.
- Implementation is done in the affected repository under `repos/`.

## Repositories

- CLI: [github.com/corwinm/arashi](https://github.com/corwinm/arashi)
- Documentation: [arashi.haphazard.dev](https://arashi.haphazard.dev) · [source](https://github.com/corwinm/arashi-docs)
- Specs and coordination: [github.com/corwinm/arashi-arashi](https://github.com/corwinm/arashi-arashi)
- Presentation: [live deck](https://arashi-presentation.netlify.app/) · [source](https://github.com/corwinm/arashi-presentation)

## Specification Tracks

Select a track during issue triage:

- **Direct implementation** — no durable product contract changes. Work from the issue directly in the owning repositories.
- **Lightweight OpenSpec** — settled behavior needs a canonical requirement. Use the `lightweight` schema for a proposal and capability deltas.
- **Full OpenSpec** — use the default `spec-driven` schema when design alternatives remain or the change is destructive, migratory, security-sensitive, or difficult to reverse.

Cross-repository scope alone does not require OpenSpec. A mechanical coordinated change can use direct implementation when the issue fully specifies it. If direct work reveals a durable contract decision, move it to lightweight or full OpenSpec before delivery.

Pi and OpenCode provide the checked-in `/opsx-*` prompts; with Hermes, request the OpenSpec phase in plain language. Validate and archive every change that uses OpenSpec.

## Repository Layout

```text
.
├── openspec/
│   ├── changes/          # Proposed and archived changes
│   ├── specs/            # Canonical capability requirements
│   └── schemas/          # Project-local workflow schemas
├── repos/                # Project repositories
│   ├── arashi/
│   ├── arashi-docs/
│   ├── arashi-skills/
│   ├── arashi-vscode/
│   └── arashi-presentation/
├── docs/                 # Supporting process documentation
├── tests/                # Meta-repository contract tests
├── CONTRIBUTING.md
└── README.md
```

## Validation

```bash
pnpm install --frozen-lockfile
openspec validate --all --strict
pnpm run format:check
pnpm run typecheck
pnpm test
pnpm run contracts:check
```

For implementation-specific contribution steps, see [`repos/arashi/CONTRIBUTING.md`](./repos/arashi/CONTRIBUTING.md).

## Badge Applicability

The npm, CI, and license badges describe the CLI project in `repos/arashi/`. This coordination repository does not publish an npm package.

## License

MIT. See [`LICENSE`](./LICENSE).
