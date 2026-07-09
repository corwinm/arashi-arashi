## Context

The extension has an Explorer sidebar view named **Arashi Worktrees**. It currently uses JSON-backed CLI output to list worktrees and related repositories, then exposes navigation and worktree actions. Separately, the CLI `arashi status --json` returns repository-level workspace health data including branch/tracking fields, ahead/behind counts, file lists, errors, and a clean/dirty summary.

Issue #184 asks for a richer dashboard. The desirable shape is diagnostic and lightweight: make the panel answer “is my coordinated workspace healthy?” without becoming a full Git client or replacing VS Code Source Control.

## Goals / Non-Goals

**Goals:**

- Reuse the existing tree view rather than adding a bespoke webview.
- Back workspace health rows with `arashi status --json`.
- Make healthy, dirty, missing/error, ahead/behind, and diverged repositories visually distinct.
- Offer conservative actions that map to existing extension flows or safe CLI invocations.
- Keep current worktree navigation available in the same panel experience.
- Handle old/unsupported CLI output gracefully.

**Non-Goals:**

- Do not implement a full Git diff/browser UI.
- Do not add charts, custom webview rendering, or a separate dashboard page for the first slice.
- Do not change `arashi status --json` unless implementation discovers an essential missing field.
- Do not expose destructive actions without native VS Code confirmation.

## Decisions

### Keep the existing Explorer tree view

Use the current `arashi.worktrees` view and extend its root-level contents to include a workspace status section. This avoids a separate webview lifecycle, keeps keyboard/navigation behavior native, and lets the implementation reuse existing tree item context actions.

Alternative considered: build a new webview dashboard. That would allow richer layout but would add more implementation surface, theming/accessibility work, and testing complexity for a diagnostic MVP.

### Parse status JSON into a typed panel model

Add a typed parser/model for `arashi status --json` rather than rendering raw JSON. The model should normalize branch fields, dirty file counts, ahead/behind state, errors, and action hints so provider/presentation tests can cover healthy and unhealthy examples.

Alternative considered: shell out to `arashi status` human output. That would be less robust and would duplicate terminal formatting in the extension.

### Use conservative actions first

The first dashboard should prefer safe and obvious actions: open repo, open terminal, refresh, pull, clone missing repos, and prune preview/apply with existing confirmations. Risky or ambiguous operations such as branch switching or bulk repair should remain command-palette flows or follow-ups.

### Treat stale/prunable metadata as best-effort

If `arashi status --json` does not expose stale/prunable metadata, the dashboard can either omit that state or surface it via existing prune preview flows instead of changing the CLI contract in the same MVP. A future CLI enhancement can add first-class status fields if needed.

## Risks / Trade-offs

- **Panel becomes noisy** → Keep statuses compact, show only actionable problem states prominently, and make healthy rows low-emphasis.
- **Older CLI lacks the expected status JSON shape** → Detect parse/shape failures, preserve last-known data when possible, and show an upgrade/diagnostic banner.
- **Actions mutate unexpectedly** → Keep destructive actions behind native confirmation and prefer preview flows for prune.
- **Duplicating VS Code Source Control** → Do not show file diffs or low-level Git operations; focus on coordinated workspace health.
