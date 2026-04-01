# Arashi Meta-Repo Agent Rules

This repository is the meta-repo that coordinates work across the child repositories in `repos/`.

## Core Rule

- Put implementation in the affected child repository under `repos/<project>/`.
- Keep shared context, planning, cross-repo notes, and workspace-level guidance in this meta-repo.

## How To Work In This Workspace

1. Start in the child repo that owns the change.
2. Keep code, tests, and project-specific docs in that child repo.
3. Use the meta-repo for change context, coordination, OpenSpec artifacts, and cross-repo guidance.
4. When a change affects multiple repos, update each affected repo directly instead of mixing files into the wrong location.

## Multi-Repo Expectations

- A single git commit cannot span multiple repositories.
- If a feature changes both planning artifacts and project implementation, commit each affected repository separately.
- When command behavior, configuration, or user workflow changes in `repos/arashi`, review companion updates in `repos/arashi-docs/` and `repos/arashi-skills/`.
- When multiple repositories need PRs, include explicit cross-links between the PRs and reference the originating issue in each one.

## Repo-Specific Rules

- `repos/arashi/AGENTS.md`
- `repos/arashi-docs/AGENTS.md`
- `repos/arashi-skills/AGENTS.md`
- `repos/arashi-vscode/AGENTS.md`
