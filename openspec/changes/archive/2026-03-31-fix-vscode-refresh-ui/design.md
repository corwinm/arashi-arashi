## Context

The VS Code extension currently has two different refresh paths for the worktree panel. `WorktreeTreeDataProvider.refresh()` refreshes the underlying store and then fires `onDidChangeTreeData`, but command handlers use `WorktreeStore.refresh()` directly for manual refresh and post-action refresh flows. That updates in-memory state without notifying VS Code that the tree needs to be re-rendered, which explains how the UI can report a successful refresh while still showing stale entries.

The main constraint is preserving the current separation between data fetching and UI rendering. The extension should keep using the store as the source of truth for worktree state, while any user-visible refresh path must still notify the tree view when the store changes.

## Goals / Non-Goals

**Goals:**
- Make manual refresh always update the rendered worktree tree when newly discovered data differs from the previous state.
- Ensure post-action refreshes use the same UI-invalidating path so create, add, remove, and similar flows do not leave stale panel entries behind.
- Preserve existing banner behavior for empty states, parse failures, and invalid workspace errors.
- Add regression coverage for refreshes that change the visible worktree set.

**Non-Goals:**
- Change the CLI `list` contract or add new refresh-specific CLI flags.
- Redesign the worktree panel UI, sorting, or status presentation.
- Introduce background polling or automatic refresh beyond current command-driven behavior.

## Decisions

### Decision: Route command-triggered panel refreshes through a provider-aware callback
Command handlers should not call `WorktreeStore.refresh()` directly when the intent is to update the visible panel. Instead, activation should wire handlers to a refresh callback that uses the existing provider refresh flow, so every user-facing refresh both updates the store and emits a tree data change event.

Alternatives considered:
- Fire the tree-data event manually from command handlers: rejected because handlers should not know about VS Code tree provider internals.
- Move the event emitter into the store: rejected because the store is intentionally UI-agnostic and should remain reusable in tests.

### Decision: Keep one data source and reuse existing store semantics
The provider-aware refresh path should continue to rely on `WorktreeStore.refresh()` for state transitions, including last-known-state preservation and banner generation. This keeps the bug fix focused on wiring the UI update correctly instead of duplicating refresh logic in multiple places.

Alternatives considered:
- Reimplement refresh handling separately for the panel command: rejected because it would risk divergence in empty-state and error behavior.
- Force the provider to own all state directly: rejected because it would be a broader refactor than this bug requires.

### Decision: Add regression tests at the extension integration layer
Tests should cover a refresh sequence where the underlying discovered worktrees change and verify that the panel refresh path updates what the UI would render, not just the store contents. This targets the real failure mode more directly than unit tests that only assert store state changes.

Alternatives considered:
- Only test the store: rejected because the bug is the missing UI invalidation step, not the data fetch itself.
- Rely on manual verification only: rejected because this is a regression-prone event-wiring bug.

## Risks / Trade-offs

- [Refresh wiring becomes more coupled to activation setup] -> Keep the handler dependency surface small by injecting a single refresh callback rather than the full tree provider.
- [Tests may overfit VS Code implementation details] -> Assert observable panel-refresh outcomes through the provider/handler boundary instead of private emitter behavior.
- [Other code paths may still call the store directly in the future] -> Centralize command refresh usage behind the same helper and cover it with regression tests.

## Migration Plan

1. Update `repos/arashi-vscode/` activation and command wiring so user-triggered panel refreshes flow through the tree provider refresh path.
2. Keep `WorktreeStore.refresh()` as the shared state transition mechanism behind the provider path.
3. Add or update extension tests that simulate changed worktree discovery across refreshes and verify the rendered panel state updates.
4. Run the extension test, lint, and build checks to confirm the fix without behavior regressions.

Rollback is low risk because the fix is confined to extension refresh wiring and tests. Reverting the handler/provider wiring change restores current behavior without data migration.

## Open Questions

- None.
