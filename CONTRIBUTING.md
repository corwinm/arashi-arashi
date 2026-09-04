# Contributing to Arashi Specs

Thanks for helping improve Arashi.

## Scope

This repository owns cross-repository planning and canonical capability requirements:

- `openspec/changes/` for proposals, designs, deltas, and implementation tasks
- `openspec/specs/` for archived canonical requirements
- `docs/` for workspace process guidance

Implementation belongs in the affected repository under `repos/` and uses that repository's own commits and pull request.

## Setup

Root validation uses Node.js 24.18.0 or later and pnpm 11.22.0:

```bash
corepack enable
pnpm install --frozen-lockfile
```

Build and link the CLI when coordinated worktree commands are needed:

```bash
cd repos/arashi
pnpm install --frozen-lockfile
pnpm run build
pnpm link --global
aw --version
```

## Workflow

1. Create an issue or confirm the existing issue, affected repositories, acceptance criteria, and contract impact. Use OpenSpec when the change creates or modifies a durable product requirement, needs design decisions resolved before implementation, or carries destructive, migration, or security risk. Routine maintenance and fully specified mechanical changes can proceed directly from the issue, even across repositories.
2. Create a coordinated worktree when child repositories are affected:

   ```bash
   aw create issue-NNN-short-name --only arashi --no-launch --no-switch
   ```

   For meta-only work, use a normal Git branch/worktree because `aw --only` selects configured child repositories.

3. Start your preferred coding agent in the parent worktree.

   Pi and OpenCode expose the checked-in `/opsx-*` prompts. With Hermes, request the same OpenSpec phase in plain language, such as `Use OpenSpec to propose <change-name>`.

4. When OpenSpec is warranted, explore unclear requirements with OpenSpec Explore.
5. Create the complete OpenSpec change artifacts when the selected work requires them.
6. Validate and review any OpenSpec proposal before implementation:

   ```bash
   openspec validate <change-name> --strict
   ```

7. Implement approved OpenSpec tasks or follow the issue directly, and keep code in the owning child repository.
8. Run repository-local checks plus the meta-repository checks below.
9. Open cross-linked pull requests for every changed repository.
10. Archive any OpenSpec change after implementation is merged.

## Meta-Repository Validation

```bash
openspec validate --all --strict
pnpm run format:check
pnpm run typecheck
pnpm test
pnpm run contracts:check
```

When child repositories changed, also run their documented validation commands. For the CLI:

```bash
cd repos/arashi
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run contract:check
pnpm run build
```

## Pull Requests

- Use Conventional Commits.
- Keep each pull request scoped to one issue where practical.
- Link the issue, any OpenSpec change, and companion pull requests.
- Report exact validation results and any environment-limited checks.
- Prefer squash merge with a clear final commit message.
