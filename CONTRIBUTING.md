# Contributing to Arashi Specs

Thanks for helping improve Arashi.

## Scope

This repository is for planning artifacts:

- `specs/` for feature specs, plans, tasks, research, and related docs
- `docs/` for process documentation

Implementation code changes belong in `repos/arashi/` (separate git repository with its own commits and pull requests).

## Recommended Workflow

1. Create a feature branch in this repository using `NNN-feature-name`.
2. Author or update spec artifacts in `specs/NNN-feature-name/`.
3. If implementation is required, switch to `repos/arashi/` and work there.
4. Keep spec and implementation links synchronized.

## Quality Expectations

For `repos/arashi/` pull requests, run:

```bash
bun run lint
bun test
bun run build
```

When relevant, also run format checks:

```bash
bun run format:check
```

## Pull Requests

- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, and so on).
- Keep PRs scoped to one feature where possible.
- Link related specs and implementation PRs.
- Prefer squash merge with a clear final commit message.

## Canonical Implementation Guide

For implementation-repo specifics, use [`repos/arashi/CONTRIBUTING.md`](./repos/arashi/CONTRIBUTING.md).
