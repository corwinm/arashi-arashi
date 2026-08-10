## Context

The extension resolves its active root from `arashi.workspaceRoot` or the first opened workspace folder. A configured main checkout owns `.arashi/config.json`; a linked coordinated worktree can reuse that sibling configuration even though its child repositories live under the linked checkout rather than the main checkout. The existing workspace-context loader omits malformed entries and nonexistent repository paths, which is useful for the worktree panel but cannot distinguish “no usable config” from “valid config with no currently materialized child.”

VS Code's built-in Git extension reads the resource-scoped `git.repositoryScanMaxDepth` setting. A value of `-1` means unlimited traversal, while nonnegative values cap traversal by directory levels below an opened workspace folder.

## Goals / Non-Goals

**Goals:**

- Compute the minimum repository scan depth from the active Arashi configuration instead of assuming the default depth of `2`.
- Work for the main checkout and linked coordinated worktrees that reuse a sibling main-worktree configuration.
- Prompt only when configuration evidence and an applicable opened workspace folder make the recommendation actionable.
- Require explicit consent before persisting a setting or reloading the editor.
- Keep calculation, policy, and VS Code adapters separately testable.

**Non-Goals:**

- Changing Arashi CLI or configuration schema behavior.
- Inspecting or modifying `git.detectWorktrees`, `git.autoRepositoryDetection`, or any setting other than `git.repositoryScanMaxDepth`.
- Making paths outside opened workspace folders discoverable through scan depth.
- Automatically adding workspace folders or opening Git repositories through VS Code's private/built-in Git API.

## Decisions

### Parse configuration with an explicit result

Add a focused configuration reader that returns a discriminated result for unavailable, unreadable/malformed, or usable configuration, including normalized configured repository path strings. The recommendation path will stop for unavailable or unusable results and log a diagnostic for unreadable/malformed configuration without presenting a settings action.

This avoids inferring configuration validity from the worktree panel's filtered repository list. Reusing only `resolveArashiWorkspaceContext` was rejected because it silently collapses parse failures, invalid entries, and valid-but-not-yet-created paths into an empty list.

### Rebase relative paths onto the active checkout

Resolve the configuration owner with the existing sibling-worktree discovery. Resolve relative `repos.<name>.path` values against the active Arashi checkout root, not necessarily the configuration owner's main-checkout root. Preserve absolute configured paths as absolute.

This makes a default `repos/app` entry calculate as `<active-linked-worktree>/repos/app` when the user opens a coordinated feature worktree. Resolving all entries against the sibling main root was rejected because it would incorrectly classify every linked-worktree child as outside the opened feature workspace.

### Calculate depth from opened workspace folders

For each syntactically usable configured path:

1. Normalize it with the platform path implementation.
2. If its repository root equals any opened workspace folder, exclude it because it is already a workspace root.
3. Otherwise, find the deepest opened workspace folder that contains it.
4. Exclude it if no opened folder contains it.
5. Count the non-empty relative path segments from the containing folder to the repository root.

Group applicable repositories by containing workspace folder and take the maximum depth in each group. A default `repos/app` path therefore requires `2`; `projects/services/app` requires `3`.

Grouping was chosen over one process-global maximum because VS Code configuration is resource-scoped in multi-root workspaces. Lexical normalized containment is sufficient: this recommendation predicts traversal from configured paths and must not require the repository directory to exist.

### Evaluate and update each applicable resource scope

Read `workspace.getConfiguration("git", folder.uri)` for each applicable folder. Treat `-1` or any value greater than or equal to the group's required depth as sufficient. Ignore malformed effective values defensively and log them without mutation.

Aggregate all insufficient groups into one prompt per activation/check cycle. The action names the exact depth for the common single-group case. On acceptance, update:

- `ConfigurationTarget.Workspace` for a single-folder workspace; or
- `ConfigurationTarget.WorkspaceFolder` for each affected folder in a multi-root workspace.

The prompt discloses that the action persists workspace configuration. Updating the user's global setting was rejected because an Arashi workspace should not broaden Git scanning for unrelated projects.

### Separate update and reload consent

After successful updates, show a confirmation with a separate **Reload Window** action. Dismissal leaves the editor running. A failed update is surfaced and logged, and no reload is offered.

The feature does not invoke a private Git command or promise that discovery refreshes immediately; reload remains an explicit reliability action.

### Trigger after usable workspace resolution without prompt spam

Run the recommendation after successful startup and initial panel refresh, and after relevant Arashi extension configuration changes that cause a refresh. Track every normalized recommendation snapshot shown during the activation. The snapshot key contains each affected workspace-folder identity, its required depth, and its current insufficient effective depth, sorted deterministically. Focus and visibility refreshes therefore do not repeat an unchanged prompt. A changed Arashi root or configured path set produces a new prompt only when it changes the affected folder or required depth, while a changed effective Git setting produces a new prompt only when it changes an affected folder's insufficient effective depth. Returning to any snapshot already shown during the same activation remains suppressed.

## Risks / Trade-offs

- **[Risk] A custom relative path contains `..` and leaves the active checkout.** → Normalize first and exclude it unless another opened workspace folder contains the resulting path.
- **[Risk] A linked checkout borrows the wrong sibling configuration.** → Reuse the extension's existing common-Git-dir relationship and require the active root to resolve to that configured context before rebasing relative paths.
- **[Risk] Folder-level overrides remain lower than a workspace update.** → Use workspace-folder scope in multi-root workspaces and verify the effective value after every update.
- **[Risk] A configuration changes while a prompt is open.** → Recompute before applying; if the recommendation no longer matches, abort the mutation and rerun the check.
- **[Risk] Deep scans can cost more on large trees.** → Calculate the minimum maximum required by configured paths and never raise a setting already sufficient or unlimited.

## Migration Plan

Ship as additive extension behavior with no stored extension migration. Users who accept receive standard VS Code workspace settings that remain understandable without the extension. Rollback consists of removing the recommendation code; existing user-approved settings are left intact rather than silently reverted.

## Open Questions

None. The implementation should preserve exact message copy as a reviewable UI detail rather than making it part of the durable configuration contract.
