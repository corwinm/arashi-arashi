## Why

`arashi switch` currently has limited editor-launch awareness, and the VS Code extension treats compatible IDEs too generically. Expanding switch-time IDE targeting and making the extension aware of sibling worktrees and host editor identity removes extra manual steps and keeps CLI and extension behavior aligned.

## What Changes

- Extend `arashi switch` with explicit IDE launch flags such as `--vscode`, `--cursor`, and `--kiro` that can override configured switch defaults for a single invocation.
- Update switch behavior to choose the matching editor launcher when running from a supported IDE-integrated terminal or when an explicit IDE flag is provided.
- Enhance the VS Code extension to detect the editor host it is running in and pass the matching switch flag when invoking `arashi switch`.
- Update the VS Code worktree panel to show sibling worktrees and suppress `init` guidance when the extension is already running inside a sibling worktree of an initialized workspace.
- Update user-facing docs and skills guidance to document the new switch flags, editor-aware extension behavior, and sibling worktree detection.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `switch-command`: add explicit IDE launch overrides, editor-specific launch selection, and clearer precedence between CLI flags and configured defaults.
- `vscode-command-integration`: make extension command execution detect the current editor host and pass editor-specific switch flags when it invokes the CLI.
- `vscode-worktree-panel`: include sibling worktrees in discovery and avoid suggesting `arashi init` when the current window is already inside a sibling worktree of an initialized workspace.

## Impact

- CLI implementation in `repos/arashi/` for `arashi switch`, launch-mode parsing, and editor detection.
- VS Code extension code in `repos/arashi-vscode/` for command invocation, workspace detection, and panel rendering.
- Documentation and skills updates in `repos/arashi-docs/` and `repos/arashi-skills/` to keep command behavior guidance current.
- Possible shared logic around workspace/worktree discovery if sibling detection needs to be reused across CLI and extension flows.
