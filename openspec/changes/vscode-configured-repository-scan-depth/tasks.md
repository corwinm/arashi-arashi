## 1. Pre-implementation RED coverage

- [ ] 1.1 Add unit tests for explicit configuration outcomes: missing, unreadable, malformed, structurally unusable, valid configured paths, and sibling-config relative-path rebasing for an active linked checkout; run the focused tests and record the expected RED failure before production edits.
- [ ] 1.2 Add unit tests for normalized depth calculation covering `repos/app` → `2`, `projects/services/app` → `3`, maximum selection, nonexistent configured targets, explicit workspace-folder roots, outside/`..` paths, absolute paths, and independent multi-root groups; run them RED before production edits.
- [ ] 1.3 Add unit tests for effective-setting policy covering insufficient, equal, greater, `-1`, and malformed values; run them RED before production edits.
- [ ] 1.4 Add orchestration tests for no-config/no-path silence, one aggregated prompt with distinct workspace/user actions and global-scope disclosure, dismissal, exact `ConfigurationTarget.Workspace` and `ConfigurationTarget.Global` updates using the maximum required depth, no workspace-folder mutation on either normal success path, preservation of higher/unlimited selected-scope values, higher-precedence override failures without workspace-folder mutation, stale-recommendation recomputation, update/verification failures, separate reload acceptance/dismissal, unchanged-prompt suppression, an insufficient effective-value change (`1` → `2` while `3` is required) producing one new snapshot, and suppression when a previously shown snapshot returns; run them RED before production edits.
- [ ] 1.5 Add an extension wiring regression test that proves the recommendation runs after successful initial workspace refresh, reacts to relevant configuration changes, and does not run after failed startup validation; run it RED before production edits.

## 2. Configuration and depth implementation

- [ ] 2.1 Implement the explicit Arashi configuration reader and active-checkout relative-path rebasing without changing the worktree panel's existing repository filtering behavior.
- [ ] 2.2 Implement platform-safe containment, deepest-workspace-folder selection, path-segment counting, direct-folder exclusion, outside-folder exclusion, and per-folder maximum calculation.
- [ ] 2.3 Implement effective `git.repositoryScanMaxDepth` classification with `-1` unlimited semantics and defensive diagnostics for unusable values.
- [ ] 2.4 Run the focused configuration, depth, and policy tests GREEN, then refactor shared path/config helpers without changing behavior.

## 3. Consent and extension integration

- [ ] 3.1 Implement the testable recommendation coordinator with one aggregated prompt, exact calculated values, stale-state recomputation, and per-activation recommendation-key suppression.
- [ ] 3.2 Implement the user's selected persistence target: `ConfigurationTarget.Workspace` for the current workspace or `ConfigurationTarget.Global` for the user profile, using the maximum required depth without lowering an existing sufficient/unlimited target value, followed by effective-value verification for every affected folder.
- [ ] 3.3 Implement success/failure diagnostics and the separate optional **Reload Window** action, with no reload offer after failed or insufficient updates.
- [ ] 3.4 Wire the check after successful startup and initial panel refresh and into relevant Arashi/Git configuration refreshes while preventing focus/visibility prompt spam.
- [ ] 3.5 Run all focused orchestration and extension-wiring tests GREEN, then refactor adapters and message construction without changing the tested contract.

## 4. End-to-end verification and delivery

- [ ] 4.1 Run `pnpm lint`, `pnpm test`, `pnpm test:vscode`, `pnpm build`, and `git diff --check` in `repos/arashi-vscode`.
- [ ] 4.2 Package a smoke-test VSIX with `pnpm exec vsce package --no-dependencies --out /tmp/arashi-vscode-configured-scan-depth.vsix` and verify the bundled extension contains the recommendation path.
- [ ] 4.3 Run `openspec validate vscode-configured-repository-scan-depth --strict` plus meta-repository tests and type checks, and reconcile every normative scenario against a passing test.
- [ ] 4.4 Perform independent spec-compliance review followed by code-quality review on the final child commit, resolve only concrete findings, and rerun affected verification.
- [ ] 4.5 Commit and push the `arashi-vscode` implementation, open a focused child PR linked to issue #269 and the OpenSpec proposal, and verify remote CI is green before requesting merge approval.
