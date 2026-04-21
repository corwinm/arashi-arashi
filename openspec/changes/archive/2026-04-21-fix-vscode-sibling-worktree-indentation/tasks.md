## 1. Reproduce and cover the panel regression

- [x] 1.1 Add or update a tree/presentation test that models a sibling worktree with a modified child repository.
- [x] 1.2 Assert that the modified child repository is still rendered as a nested child entry and keeps modified-state text visible.

## 2. Stabilize repository node presentation

- [x] 2.1 Update the VS Code worktree tree-item rendering so child repository nodes use consistent structural iconography across clean and modified states.
- [x] 2.2 Preserve current-vs-child context and modified-state information in descriptions/tooltips after the icon treatment change.

## 3. Validate the extension behavior

- [x] 3.1 Run the relevant `repos/arashi-vscode` unit/integration tests covering the worktree panel.
- [x] 3.2 Run `bun run build` in `repos/arashi-vscode` to confirm the extension still compiles cleanly.
