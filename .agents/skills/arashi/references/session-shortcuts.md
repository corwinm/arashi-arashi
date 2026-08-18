# Session Shortcuts (fzf, tmux, sesh)

Use these optional shortcuts to move quickly between Arashi worktrees.

## Prerequisites

- `arashi` installed and on `PATH`
- `fzf` installed for interactive selection
- `sesh` installed for tmux session management (optional)

## Safe Worktree Selection

List available paths and select one explicitly:

```bash
aw list
cd -- "<selected-worktree-path>"
```

If you want an `fzf` helper, keep selection and execution as separate steps:

```bash
aw list | fzf > /tmp/arashi-selected-worktree
read -r selected_worktree < /tmp/arashi-selected-worktree
cd -- "$selected_worktree"
```

This avoids inline command substitution and keeps quoting explicit.

## Switch with Arashi

Use `aw shell --help` and `aw switch --help` to confirm current shell and switch options. Common examples include:

```bash
aw shell install
aw switch
aw switch --cd feature-auth
aw switch --repos docs
aw switch --all
aw switch --cursor feature-auth
aw switch --no-default-launch
```

## Connect with sesh

```bash
aw switch --sesh
```

## Optional Keybinds

If you create shell keybinds, prefer wrappers that validate selected paths before changing directories.
Avoid command-substitution keybinds that execute unsanitized output directly.

## Expected Outcomes

- selection flow changes shell to the selected worktree path.
- `aw switch` opens a terminal context for a selected worktree.
- `aw switch --cd` changes the current shell directory when shell integration is active.
- `aw switch --vscode|--cursor|--kiro` forces that IDE for one switch invocation.
- `aw switch --sesh` creates or switches via sesh in tmux.
- if shell integration is inactive, `aw switch --cd` warns and falls back to launch behavior.
- `aw switch --no-default-launch` bypasses configured switch launch defaults for one run.
