## 1. Status data model

- [x] 1.1 Add typed models for `arashi status --json` repository health data in `repos/arashi-vscode`.
- [x] 1.2 Add parser coverage for clean, dirty, ahead, behind, diverged, missing/error, and unexpected status JSON responses.
- [x] 1.3 Preserve existing worktree-list parsing and last-known-state behavior when status parsing fails.

## 2. Panel presentation and actions

- [x] 2.1 Extend the existing Arashi Worktrees tree provider to render a workspace status section backed by parsed status data.
- [x] 2.2 Add compact labels, descriptions, icons, and tooltips for healthy, dirty, ahead/behind/diverged, and error repositories.
- [x] 2.3 Add contextual actions for opening repositories, opening terminals, pulling drifted repositories, cloning missing repositories, and using prune preview/apply where supported.
- [x] 2.4 Ensure mutating or destructive actions use existing confirmation patterns and refresh the panel after successful completion.

## 3. Documentation

- [x] 3.1 Update `repos/arashi-vscode/README.md` with workspace status dashboard guidance and representative states.
- [x] 3.2 Confirm whether docs-site changes are needed; keep the MVP to extension README guidance if no docs-site command/workflow behavior changes.

## 4. Validation

- [x] 4.1 Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi-vscode`.
- [x] 4.2 Run VS Code integration coverage if panel registration or command wiring changes require it.
- [x] 4.3 Run `openspec validate vscode-status-dashboard` from the meta-repo.
- [x] 4.4 Open cross-linked implementation/spec PRs and reference issue #184.
