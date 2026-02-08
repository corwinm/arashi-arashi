# Quickstart: Fix Remove Command Confirmation

## Prerequisites

- Run in an interactive terminal (TTY) for prompts.
- Use the installed `arashi` CLI from your PATH.

## Interactive selection flow

```bash
arashi remove
```

- Select one or more worktrees and submit the selection.
- The command continues to the confirmation step instead of exiting.

## Branch-driven removal with confirmation

```bash
arashi remove <branch-name>
```

- A confirmation prompt appears before any removal.
- Declining the prompt exits without changes.

## Non-interactive behavior

If stdin is not a TTY, the command exits with a clear message.

```bash
echo "y" | arashi remove
```
