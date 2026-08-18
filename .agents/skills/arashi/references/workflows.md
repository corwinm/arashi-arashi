# Workflow Catalog

Use this catalog to choose the right workflow by goal and confidence level.

| Workflow     | Difficulty   | User Goal                                                               |
| ------------ | ------------ | ----------------------------------------------------------------------- |
| Beginner     | Beginner     | Initialize a workspace and inspect current status                       |
| Intermediate | Intermediate | Clone missing repositories and create a feature branch across worktrees |
| Advanced     | Advanced     | Recover from branch drift and synchronize repositories safely           |

## Command Shape by Workflow

- Beginner: `aw init` -> `aw status`
- Intermediate: `aw clone --all` -> `aw create` -> `aw switch`
- Advanced: `aw pull` -> `aw sync` -> `aw status`

## Selection Guidance

- Start with **Beginner** if this is your first Arashi skill session.
- Choose **Intermediate** if you already have repositories and need cross-repo branch creation.
- Choose **Advanced** if you need sync and recovery controls.
- If you automate teardown on branch removal, use [Hooks](hooks.md).
- If you use tmux/sesh, apply shortcuts from [Session Shortcuts](session-shortcuts.md).
- For the latest hooks docs, see `https://arashi.haphazard.dev/workflows/hooks/`.
- For command defaults and shell-aware switching behavior, see `https://arashi.haphazard.dev/workflows/config/`.
- For VS Code and VS Code-based editor workflows, see `https://arashi.haphazard.dev/workflows/vscode/`.
- For tmux and sesh workflows, see `https://arashi.haphazard.dev/workflows/tmux-and-sesh/`.
- For agent guidance in a meta-repo, see `https://arashi.haphazard.dev/workflows/agents-and-specs/`.

## Workflow Entry Guidance

Assume Arashi is available unless the user is installing it or a command is not working as expected.

When a workflow needs command-specific options, inspect `aw <command> --help` before recommending or running flags. If your team enforces repository security checks, run them before executing workflows.

## Beginner Workflow

Run `aw init` from one of two valid starting points:

- inside an existing repository root you want to manage
- inside a non-repository parent directory, then enter `.` or a child repository name when prompted

```bash
aw init
aw status
```

Expected outcomes:

- `.arashi/config.json` exists after `aw init`.
- `.arashi/config.json` records `worktreesDir` (default `.arashi/worktrees`).
- bootstrap mode accepts `.` for the current directory and a direct child repository name for child-directory creation.
- `.gitignore` includes the configured repositories directory.
- `.gitignore` includes the normalized managed worktree directory entry when using the default location or a safe repository-relative subdirectory.
- `aw status` prints repository/worktree status without errors.

## Intermediate Workflow

```bash
aw clone --all
aw create feature/skill-integration
aw switch feature/skill-integration
```

Expected outcomes:

- Missing configured repositories are materialized locally.
- New worktrees exist for `feature/skill-integration`.
- `aw switch` opens the selected worktree in a new terminal context.
- Use `aw switch --help` to confirm current editor launch flags before choosing an IDE-specific switch option.

## Advanced Workflow

```bash
aw pull
aw sync
aw status
```

Expected outcomes:

- Remotes are fetched and local branches update where possible.
- Sync avoids partial update states.
- `aw status` reports clean or actionable next steps.

After completion, confirm the expected outcomes listed for that workflow before moving to another one.
