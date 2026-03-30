## 1. CLI exact-path switching

- [x] 1.1 Add `--path` support to `arashi switch` and resolve selected worktrees by normalized absolute path when that mode is enabled.
- [x] 1.2 Preserve existing fuzzy filter and interactive selection behavior when `--path` is not used, and add actionable no-match/error messaging for exact path mode.
- [x] 1.3 Add or update CLI tests covering exact-path success, exact-path no-match failures, and the existing ambiguous-filter behavior.

## 2. VS Code exact-target invocation

- [x] 2.1 Update extension switch argument construction so flows that already selected a concrete worktree invoke `arashi switch` with `--path` while preserving host-specific IDE flags.
- [x] 2.2 Update extension coverage for the command-palette switch flow and worktree-panel switch action, including duplicate-branch scenarios such as multiple `main` worktrees.

## 3. Docs and skills synchronization

- [x] 3.1 Review and update `repos/arashi-docs/` documentation if switch command or VSCode troubleshooting guidance needs to mention exact-path extension switching.
- [x] 3.2 Review and update `repos/arashi-skills/` guidance and examples if they reference VSCode-driven switch behavior affected by this change.

## 4. Validation

- [x] 4.1 Run the required lint, test, and build checks for `repos/arashi/` after the CLI changes land.
- [x] 4.2 Run the relevant test and build checks for `repos/arashi-vscode` after the extension changes land.
- [x] 4.3 Manually verify the issue `#131` scenario by switching to a selected `main` worktree from the VSCode extension UI without ambiguity errors.
