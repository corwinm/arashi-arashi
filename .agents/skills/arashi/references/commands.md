# Command Reference

Common command patterns for installing and using the Arashi CLI.

## Most Common Commands

```bash
# verify Arashi CLI
aw --version

# inspect command surface
aw --help
```

## Installation

Installation instructions are maintained on the Arashi website:

- https://arashi.haphazard.dev

Use the website flow for your platform and environment policy.

Expected outcome:

- `aw --version` exits `0`
- `aw --help` exits `0`

## Workflow Execution

Choose one workflow from [Workflows](workflows.md).

Order of operations:

1. Execute one workflow from start to finish.
2. Confirm expected outcomes from the workflow doc.
3. If a command is missing or behaves unexpectedly, verify setup with `aw --version` and use [Troubleshooting](troubleshooting.md).

## Workspace Initialization

Run `aw init` from an existing repository root, or from a non-repository parent directory when you want Arashi to create the repository during setup.

Initialize an existing repository with defaults:

```bash
aw init
```

Bootstrap the current directory as a new repository:

```bash
mkdir my-arashi-workspace
cd my-arashi-workspace
aw init
# prompt: Repository target ('.' for current directory or a child directory name) -> .
```

Bootstrap a child repository from a parent directory:

```bash
mkdir scratch
cd scratch
aw init
# prompt: Repository target ('.' for current directory or a child directory name) -> my-arashi-repo
cd my-arashi-repo
```

Use a custom repositories directory:

```bash
aw init --repos-dir ./workspace-repos
```

Use a custom worktree base directory:

```bash
aw init --worktrees-dir ./workspace-worktrees
```

Expected outcomes:

- `.arashi/config.json` includes `reposDir` and `worktreesDir`.
- default `worktreesDir` is `.arashi/worktrees` when the option is omitted.
- bootstrap mode accepts only `.` or a direct child directory name.
- `.gitignore` always includes the configured repositories directory.
- `.gitignore` auto-includes the normalized managed worktree directory entry when using the default location or a safe repository-relative subdirectory.
- `.gitignore` skips auto-adding worktree entries for `.` and parent-traversal (`../`) `worktreesDir` values.

## Repository Cloning and Recovery

Use `aw clone` to clone configured repositories that are missing locally.

```bash
# interactively choose missing repositories
aw clone

# clone all missing repositories
aw clone --all
```

Expected outcomes:

- command exits `0` when clone operations succeed
- already-present repositories are skipped
- `aw status` no longer reports missing repository spawn errors

## Worktree Switching

Use `aw switch` to open a terminal context for an existing worktree, or change the current shell directory when shell integration is active.

```bash
# parent workspace worktrees (default)
aw switch

# child repositories in current workspace only
aw switch --repos docs

# include parent workspaces + nested child repo worktrees
aw switch --all

# select one exact worktree by full path
aw switch --path /path/to/worktree

# force Cursor / VS Code / Kiro for one run
aw switch --cursor feature-auth
aw switch --vscode feature-auth
aw switch --kiro feature-auth

# request parent-shell cd when shell integration is active
aw switch --cd feature-auth

# force launch behavior for one run
aw switch --no-cd

# sesh mode inside tmux
aw switch --sesh

# bypass configured switch launch defaults for one run
aw switch --no-default-launch
```

Expected outcomes:

- command exits `0` and opens the selected target in a new context
- `aw switch --cd` changes the current shell directory when invoked through the installed shell wrapper
- `--repos` matches repository names first (exact match preferred)
- `--repos` with no matches lists available child repositories
- `--path` matches one exact worktree path and skips fuzzy branch/path matching
- `--vscode`, `--cursor`, and `--kiro` override configured switch defaults for a single invocation
- when shell integration is inactive, `--cd` warns and falls back to launch behavior instead of failing solely because the parent shell cannot be changed directly
- compatible editor hosts can pass the matching switch flag automatically when running Arashi through the extension
- extension-driven switch selections use exact path mode so duplicate branch names do not create ambiguous CLI matches

## Create Defaults and Overrides

Use command defaults in `.arashi/config.json` to control post-create switch/launch behavior:

```json
{
  "defaults": {
    "create": {
      "switch": true,
      "launch": true,
      "launchMode": "sesh"
    },
    "switch": {
      "mode": "auto",
      "launchMode": "sesh"
    }
  }
}
```

Use one-off CLI overrides when you want a single `aw create` run to differ from configured defaults, such as launching immediately or skipping the post-create switch. Common examples include:

```bash
aw create feature-auth --launch
aw create feature-auth --no-launch
aw create feature-auth --no-switch
```

Use `aw shell install` to enable parent-shell switching for bash, zsh, or fish, or `aw shell init <shell>` for manual setup.

Precedence for create/switch launch behavior is: explicit flag > opt-out flag > config default > built-in default.
For `switch`, IDE-integrated terminals also prefer the matching IDE launcher when no explicit override is provided.

## Remove Cleanup Hooks

Use [Hooks](hooks.md) for remove lifecycle hook setup and safety guidance.

## Session Navigation (Optional)

For tmux/sesh and worktree jump shortcuts, use [Session Shortcuts](session-shortcuts.md).

## Publication and Discoverability

Publication is optional and policy-dependent.

```bash
git tag -a skill-arashi-v0.1.0 -m "arashi skill package v0.1.0"
git push origin skill-arashi-v0.1.0
```

After release, validate that installation and workflow instructions remain accurate for new users.
