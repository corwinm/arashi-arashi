# Contributing to Arashi Specs

Thanks for helping improve Arashi.

## Scope

This repository is for planning artifacts:

- `specs/` for feature specs, plans, tasks, research, and related docs
- `docs/` for process documentation

Implementation code changes belong in `repos/arashi/` (separate git repository with its own commits and pull requests).

## Tooling Requirement: Arashi CLI

This workflow assumes you use the Arashi CLI to create and manage feature worktrees.

Build and link the local CLI before starting feature work:

```bash
cd repos/arashi
bun install
bun run build
bun link
```

Verify:

```bash
arashi --version
```

## Recommended Workflow

1. From the repository root, create a feature worktree with Arashi:

   ```bash
   arashi create NNN-feature-name
   ```

2. Switch to the new worktree path (for example, from `arashi list`):

   ```bash
   cd "$(arashi list | fzf)"
   ```

3. Open OpenCode in that feature worktree:

   ```bash
   opencode
   ```

4. Run the spec-kit flow inside OpenCode:
   - `/speckit.specify`
   - `/speckit.clarify` (optional)
   - `/speckit.plan`
   - `/speckit.tasks`
   - `/speckit.implement`

5. Prefer Claude or Codex models for spec and implementation work.
6. Keep spec and implementation links synchronized across PRs.

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
