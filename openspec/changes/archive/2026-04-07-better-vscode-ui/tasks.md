## 1. Build repo context and tree models

- [x] 1.1 Extract reusable workspace-family and Arashi config-root resolution helpers in `repos/arashi-vscode/` for repo-navigation flows.
- [x] 1.2 Load configured repository paths from `.arashi/config.json`, resolve existing repo roots, and expose parent/current/child repo metadata to the extension.
- [x] 1.3 Refactor the tree provider to emit typed repo and worktree nodes so panel actions can operate on the clicked entry directly.

## 2. Update panel actions and command flows

- [x] 2.1 Replace the panel title-bar add action with create while keeping add-repository access through command-palette flows.
- [x] 2.2 Update panel remove and switch handlers to use exact clicked worktree payloads and require only a single confirmation for removal.
- [x] 2.3 Add repo-navigation commands and panel actions that open the selected repository root in a new editor window with native VS Code APIs.
- [x] 2.4 Refresh panel state after successful mutating extension commands and when the window regains focus or the panel becomes visible.

## 3. Improve README guidance

- [x] 3.1 Update `repos/arashi-vscode/README.md` to explain that the Arashi UI lives in the Explorer sidebar and how to reveal it.
- [x] 3.2 Add screenshots or equally clear structured guidance for create, refresh, worktree actions, and repository navigation.
- [x] 3.3 Review `repos/arashi-docs/` for any broader VS Code workflow guidance that should mention the repo-aware panel behavior.

## 4. Validate the extension changes

- [x] 4.1 Add or update unit and integration coverage for repo discovery, repo-aware tree rendering, single-confirm panel removal, repo-opening flows, and refresh synchronization.
- [x] 4.2 Run `bun test`, `bun run lint`, and `bun run build` in `repos/arashi-vscode`.
- [x] 4.3 Manually verify issue `#140` flows, including panel create, external create refresh visibility, single-confirm delete, child-repo navigation, and README onboarding clarity.
