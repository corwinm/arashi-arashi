# Arashi Specifications Repository

[![npm version](https://img.shields.io/npm/v/arashi.svg)](https://www.npmjs.com/package/arashi)
[![CI](https://github.com/corwinm/arashi/actions/workflows/ci.yml/badge.svg)](https://github.com/corwinm/arashi/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/corwinm/arashi.svg)](https://github.com/corwinm/arashi/blob/main/LICENSE)

Planning and specification workspace for the Arashi project.

## Overview

- Proposed changes, designs, and task breakdowns live in `openspec/changes/`.
- Canonical capability requirements live in `openspec/specs/`.
- Implementation is done in the affected repository under `repos/`.

## Repositories

- CLI: [github.com/corwinm/arashi](https://github.com/corwinm/arashi)
- Documentation: [arashi.haphazard.dev](https://arashi.haphazard.dev) · [source](https://github.com/corwinm/arashi-docs)
- Specs and coordination: [github.com/corwinm/arashi-arashi](https://github.com/corwinm/arashi-arashi)
- Presentation: [live deck](https://arashi-presentation.netlify.app/) · [source](https://github.com/corwinm/arashi-presentation)

## OpenSpec Workflow

1. Explore the problem with `/opsx-explore` when requirements are unclear.
2. Create or refine a change with `/opsx-propose <change-name>`.
3. Review the generated proposal, design, capability deltas, and tasks.
4. Implement approved tasks with `/opsx-apply <change-name>` in the repositories that own the changes.
5. Validate every touched repository and the OpenSpec change.
6. Archive completed changes with `/opsx-archive <change-name>` after implementation is merged.

## Repository Layout

```text
.
├── openspec/
│   ├── changes/          # Proposed and archived changes
│   └── specs/            # Canonical capability requirements
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
