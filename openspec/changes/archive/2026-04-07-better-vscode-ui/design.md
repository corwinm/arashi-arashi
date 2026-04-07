## Context

The current VS Code extension is built around a single Explorer tree view that renders a flat list of worktrees returned by `arashi list --json`. That implementation is enough for switching between worktrees, but it does not yet expose repository-level navigation, it prioritizes low-frequency title-bar actions, and it only refreshes on startup, configuration changes, manual refresh, or a subset of extension-managed command completions.

There are also two concrete UX problems in the current structure. First, panel item actions receive tree elements, but the command handlers only understand raw `ArashiWorktree` models, so the remove action falls back to asking the user to pick a worktree again instead of acting on the clicked entry directly. Second, users who run Arashi commands outside the extension command handlers can leave the panel stale until they refresh manually.

The workspace already contains the information needed to improve this. `.arashi/config.json` defines the configured repositories, and the extension already has startup logic that can resolve the workspace family even when the current window is a sibling worktree. The design should reuse those sources instead of adding new CLI requirements.

## Goals / Non-Goals

**Goals:**
- Keep the extension in standard VS Code tree-view surfaces while making the Arashi UI easier to discover and use.
- Make the panel repo-aware so users can see the workspace root, child repositories, and the worktrees associated with each repo.
- Promote `arashi create` to a primary panel action and keep panel state synchronized after extension commands and common external changes.
- Remove the extra selection step from panel deletion and ensure destructive actions operate on the exact clicked entry.
- Add command-palette and UI flows that open a repo-focused editor window for a selected related repository.
- Update extension README guidance so users can quickly find and understand the panel.

**Non-Goals:**
- Rebuild the extension UI as a webview or custom sidebar experience.
- Introduce new Arashi CLI commands solely for repo navigation.
- Add background polling for filesystem or CLI state changes.
- Redesign unrelated command flows such as `init`, `pull`, or `sync` beyond refresh integration.

## Decisions

### Decision: Keep the Explorer tree view and make it repo-aware
The extension should keep its existing Explorer-based view id and evolve it from a flat worktree list into a repo-aware tree. Top-level repo nodes will provide clear parent/current context, and child worktree nodes will preserve the existing switch/remove workflows. This addresses the child-repo visibility problem without introducing a second navigation system or a heavier UI technology.

Alternatives considered:
- Move the experience to a different VS Code surface: rejected because the current tree view already matches the data model and only needs better affordances.
- Add a separate repositories-only view: rejected because it would split closely related navigation tasks across two panels and increase discovery burden.

### Decision: Source repo navigation from the workspace config and resolved workspace family
Related repositories should be discovered from the active Arashi workspace root and `.arashi/config.json`, reusing the same workspace-family resolution already needed for sibling worktree startup validation. The repo model should include at least the workspace root repo context, configured child repos whose paths exist, and enough metadata to label the current repo and parent repo distinctly.

Alternatives considered:
- Add a new CLI command just for repo discovery: rejected because the extension already has access to the config file and path layout it needs.
- Infer repositories only from visible worktrees: rejected because users also need to navigate to repo roots that may not currently have an active non-main worktree entry.

### Decision: Replace the panel title-bar add action with create, but keep add available as a command
The panel title area should prioritize the most frequent worktree workflow by exposing create and refresh. Repository addition remains useful, but it should move out of the primary panel chrome and remain available through the command palette and existing command infrastructure.

Alternatives considered:
- Keep add and create side by side in the title bar: rejected because the view title area is limited and the issue specifically calls for favoring create.
- Remove add entirely from the extension: rejected because adding a repo is still a supported workflow even if it is less frequent.

### Decision: Centralize refresh triggers around successful mutations plus window re-entry
The extension should continue refreshing immediately after successful extension-managed mutations, and it should additionally refresh when the window regains focus or when the tree view becomes visible. This captures the common case where users run `arashi` commands in a terminal or open a different repo window, without requiring polling.

Alternatives considered:
- Poll for CLI state changes continuously: rejected because it adds unnecessary command load and background churn.
- Refresh only after extension commands: rejected because it leaves the panel stale for CLI-driven workflows that are common for Arashi users.

### Decision: Bind panel actions to typed node payloads instead of re-discovering selection
Tree items should carry enough typed payload information for command handlers to act on the clicked repo or worktree directly. For worktree removal, the handler should prompt once for confirmation and then execute `arashi remove --path <selected path>` against that exact entry. This fixes the current double-selection behavior and removes ambiguity between clicked UI state and follow-up command execution.

Alternatives considered:
- Keep the current generic handler and re-prompt for selection: rejected because it is slower, confusing, and the current issue reports that it fails.
- Add bespoke command ids per tree item type without shared payload handling: rejected because it complicates registration without solving the underlying data mismatch.

### Decision: Open repository-focused windows with native VS Code APIs
Repo navigation should open the selected repository root with VS Code's folder-opening API in a new window. That keeps the behavior editor-native, works across compatible VS Code forks, and avoids adding editor-launch logic to the Arashi CLI for a problem that is extension-local.

Alternatives considered:
- Shell out to `code`, `cursor`, or `kiro` binaries manually: rejected because the extension already runs inside the target editor environment and should prefer the host API.
- Reuse `arashi switch` for repo-root navigation: rejected because repo navigation is not the same as switching to a worktree.

## Risks / Trade-offs

- [Repo-aware trees add more visual structure than the current flat list] -> Keep labels concise and only add repo nodes where they clarify parent/current context.
- [Refreshing on focus or visibility may trigger extra CLI calls] -> Refresh only when the view is relevant and continue using manual refresh for explicit retries.
- [Config-driven repo discovery can reference missing directories] -> Limit navigable repo entries to existing paths and surface missing-path failures as actionable errors if a stale entry slips through.
- [README screenshots can drift as the UI evolves] -> Keep the guidance section small and pair visuals with text that remains accurate if icons or ordering change.

## Migration Plan

1. Add a shared workspace-context helper in `repos/arashi-vscode/` that resolves the Arashi config root and configured repo paths for the active window.
2. Refactor the tree provider to emit repo and worktree nodes with typed payloads, and update panel menus so create and refresh are the primary title actions.
3. Add repo-navigation commands and handlers that open selected repo roots in new editor windows.
4. Extend refresh wiring to cover successful mutations plus window-focus and view-visibility refresh points.
5. Update README guidance and add tests for repo-aware trees, exact remove behavior, refresh synchronization, and repo-opening flows.

Rollback is low risk because the change is contained to the extension UI and documentation. Reverting the repo-aware tree and new command registrations restores the prior flat panel behavior without any data migration.

## Open Questions

- None.
