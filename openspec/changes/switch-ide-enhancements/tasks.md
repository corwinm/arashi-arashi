## 1. CLI switch launch targeting

- [x] 1.1 Add `--vscode`, `--cursor`, and `--kiro` options to `arashi switch` and validate conflicting launch overrides.
- [x] 1.2 Resolve switch launch precedence across explicit IDE flags, the existing launch opt-out behavior, configured defaults, and IDE-environment detection.
- [x] 1.3 Implement launcher selection and actionable missing-CLI errors for VS Code, Cursor, and Kiro.
- [x] 1.4 Add or update CLI tests for explicit IDE launches, override precedence, conflict validation, and supported IDE environment detection.

## 2. Extension IDE-aware switching and sibling worktrees

- [x] 2.1 Detect the current extension host editor with stable VS Code APIs and expose the resolved host type to switch command execution.
- [x] 2.2 Update extension switch flows to pass the matching IDE override flag when invoking `arashi switch` without an explicit launch override.
- [x] 2.3 Extend worktree discovery and rendering to include sibling worktrees and label current-versus-sibling entries in the panel.
- [x] 2.4 Suppress `arashi init` guidance when the active window is a sibling of an initialized workspace and add extension coverage for that detection path.

## 3. Docs and skills synchronization

- [x] 3.1 Update `repos/arashi-docs/` to document the new switch flags, launch precedence, and sibling-aware extension behavior.
- [x] 3.2 Update `repos/arashi-skills/` examples and operator guidance that reference `arashi switch` or VS Code extension workflows.

## 4. Validation

- [x] 4.1 Run the required lint, test, and build checks for `repos/arashi/` after the CLI changes land.
- [x] 4.2 Run the relevant test and build checks for `repos/arashi-vscode/` after the extension changes land.
- [ ] 4.3 Manually verify CLI and extension switching flows for VS Code, Cursor, Kiro, and sibling-worktree scenarios.
