# Contributing to Arashi Specs

Thanks for helping improve Arashi.

## Scope

This repository owns cross-repository planning and canonical capability requirements:

- `openspec/changes/` for durable proposals, designs, and capability deltas
- `openspec/specs/` for archived canonical requirements
- `openspec/schemas/` for project-local workflow schemas
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

1. Create an issue or confirm the existing issue, affected repositories, acceptance criteria, and contract impact.
2. Select a specification track:
   - **Direct implementation** when no durable product contract changes.
   - **Lightweight OpenSpec** when settled behavior needs a canonical requirement. Create the change with the `lightweight` schema; it requires only a proposal and capability deltas.
   - **Full OpenSpec** for unresolved design choices or destructive, migratory, security-sensitive, or difficult-to-reverse changes. Use the default `spec-driven` schema.

   Cross-repository scope alone does not require OpenSpec when the issue fully specifies a mechanical change. Escalate direct work before delivery if implementation reveals a durable contract decision.
3. Create a coordinated worktree when child repositories are affected:

   ```bash
   aw create issue-NNN-short-name --only arashi --no-launch --no-switch
   ```

   For meta-only work, use a normal Git branch/worktree because `aw --only` selects configured child repositories.

4. Start your preferred coding agent in the parent worktree.

   For OpenSpec work, Pi and OpenCode expose the checked-in `/opsx-*` prompts. With Hermes, request the same phase in plain language.

5. Explore unclear requirements before implementation. For an OpenSpec track, use OpenSpec Explore and create the artifacts required by the selected schema.
6. Validate and review any OpenSpec change before implementation:

   ```bash
   openspec validate <change-name> --strict
   ```

7. Implement in the owning child repository. Keep task checklists and transient evidence in the issue, pull request, tests, and CI unless they establish a durable contract.
8. Run repository-local checks plus the meta-repository checks below.
9. Open cross-linked pull requests for every changed repository.
10. For OpenSpec tracks, archive the validated change after implementation is complete. Direct work needs a meta pull request only when the meta-repository changes.

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
