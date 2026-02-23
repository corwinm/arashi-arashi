## 1. Extension Scaffold and Baseline Configuration

- [x] 1.1 Initialize the extension project in `repos/arashi-vscode` with TypeScript build/test scripts and contribution points for commands and worktree view.
- [x] 1.2 Set `engines.vscode` to `^1.96.2` (matching `oil.code`) and verify the manifest remains compatible with VS Code and Cursor.
- [x] 1.3 Add extension settings for Arashi binary/workspace resolution and startup validation with actionable error messages.

## 2. Command Integration Layer

- [x] 2.1 Implement a shared command runner module that executes Arashi CLI commands, captures stdout/stderr, and normalizes success/failure reporting.
- [x] 2.2 Register command handlers for `init`, `add`, `create`, `switch`, and `remove` and collect required arguments via native VS Code input/selection/confirmation UI.
- [x] 2.3 Ensure every command flow that parses CLI output appends `--json` and routes parse failures to clear user-facing errors plus output-channel diagnostics.

## 3. Worktree Panel and Data Pipeline

- [x] 3.1 Implement a `TreeDataProvider` for Arashi worktrees that renders repo, branch, path, and git-change status from CLI data.
- [x] 3.2 Implement panel discovery/refresh flows backed by CLI JSON responses (`--json`) and preserve last-known state when refresh parsing fails.
- [x] 3.3 Add empty-state and error-state UX for no worktrees, CLI failures, and invalid workspace configuration.

## 4. Contextual Actions and Confirmation Rules

- [x] 4.1 Add panel actions for switch, remove, and add-repo using the shared command runner and refresh panel state after action completion.
- [x] 4.2 Require explicit confirmation only for destructive actions (remove/delete) and execute non-destructive actions (switch) without confirmation prompts.
- [x] 4.3 Ensure all action outcomes produce consistent notifications and output-channel logs with command context.

## 5. Release and Marketplace Publishing

- [x] 5.1 Add packaging and release automation that publishes each production version to VS Marketplace and Open VSX from the same tagged release.
- [x] 5.2 Add release-time checks that verify version parity and required metadata across both marketplace publishing targets.
- [x] 5.3 Document installation/upgrade paths for both marketplaces and compatibility expectations for VS Code forks.

## 6. Verification and Quality Gates

- [x] 6.1 Add unit tests for command argument building, `--json` enforcement on parsed commands, cancellation paths, and error normalization.
- [x] 6.2 Add integration tests for command registration, worktree panel refresh behavior, destructive confirmation behavior, and post-action refresh.
- [x] 6.3 Run lint, tests, and build in `repos/arashi-vscode`, then validate smoke flows in both VS Code and Cursor.
