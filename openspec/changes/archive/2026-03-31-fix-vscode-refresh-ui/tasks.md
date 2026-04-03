## 1. Refresh wiring

- [x] 1.1 Update `repos/arashi-vscode/` activation and command wiring so manual refresh and post-action refresh flows invoke a provider-aware refresh path that both updates the store and invalidates the tree view.
- [x] 1.2 Preserve the existing worktree-store refresh behavior for empty states, parse-failure fallback, and invalid-workspace banners while routing UI-facing refreshes through the shared panel refresh path.

## 2. Regression coverage

- [x] 2.1 Add or update extension tests to cover a refresh sequence where discovered worktrees change and the visible panel entries update in the same session.
- [x] 2.2 Add or update command-handler coverage to ensure manual refresh and action-triggered refreshes both use the UI-refresh path instead of only mutating store state.

## 3. Validation

- [x] 3.1 Run the relevant lint, test, and build checks for `repos/arashi-vscode` after the refresh fix lands.
- [x] 3.2 Manually verify issue `#136` by changing the available worktrees, invoking the VS Code panel refresh action, and confirming the new entries appear without reloading the window.
