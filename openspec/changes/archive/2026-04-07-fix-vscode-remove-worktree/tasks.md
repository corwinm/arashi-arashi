## 1. Remove flow update

- [x] 1.1 Update `repos/arashi-vscode/src/commands/flows.ts` so extension-driven remove arguments include `--force` together with exact path targeting.
- [x] 1.2 Keep both command-palette and panel remove handlers in `repos/arashi-vscode/src/commands/handlers.ts` gated by native VS Code confirmation and invoking the shared forced remove argument path for the selected worktree.
- [x] 1.3 Add a shared progress-notification runner in `repos/arashi-vscode/` and apply it to long-running command executions.

## 2. Regression coverage

- [x] 2.1 Update `repos/arashi-vscode/tests/unit/flows.test.ts` to assert the remove helper builds forced path-mode arguments.
- [x] 2.2 Update `repos/arashi-vscode/tests/integration/registration-and-panel.test.ts` to assert cancelled remove flows do not execute the CLI and confirmed remove flows execute `arashi remove` with forced exact-target arguments.
- [x] 2.3 Update `repos/arashi-vscode/tests/` to assert long-running commands route through the shared progress wrapper.

## 3. Validation

- [x] 3.1 Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi-vscode/` after the implementation lands.
- [x] 3.2 Manually verify issue `#143` by removing a worktree through both the command palette and the panel trash action and confirming the extension shows a busy indicator and does not require a second CLI confirmation prompt.
