## Context

Current setup/init flows treat `.arashi/worktrees/` as a path that must be explicitly added to `.gitignore` when default worktree location is used. For this repository behavior, that write is unnecessary and produces avoidable diffs in user-owned ignore files. The change is intentionally narrow: remove automatic `.gitignore` mutation while preserving existing worktree path resolution and command behavior.

## Goals / Non-Goals

**Goals:**
- Eliminate automatic `.gitignore` writes for `.arashi/worktrees/`.
- Keep setup/init/create flows functional with default and configured worktree locations.
- Keep behavior idempotent and side-effect-free regarding existing `.gitignore` files.
- Update tests to assert no `.gitignore` mutation for this case.

**Non-Goals:**
- Changing default worktree location semantics.
- Removing or rewriting user-provided `.gitignore` entries.
- Introducing new CLI flags or configuration fields.

## Decisions

- Remove invocation of helper logic that appends `.arashi/worktrees/` to `.gitignore` during initialization/setup paths.
  - **Rationale:** Align behavior with Git worktree handling and avoid mutating user files.
  - **Alternative considered:** Keep current write but gate it behind file-content checks. Rejected because the write remains unnecessary and still couples setup to ignore-file mutation.

- Retain all existing worktree path resolution logic and only alter ignore-file side effects.
  - **Rationale:** Limits blast radius and reduces regression risk in worktree creation.
  - **Alternative considered:** Refactor worktree destination and ignore behavior together. Rejected because issue scope is specific and does not require broader path changes.

- Adjust tests to verify `.gitignore` remains unchanged for default managed path.
  - **Rationale:** Ensures regressions are caught if ignore-file mutation is reintroduced.
  - **Alternative considered:** Remove tests for ignore handling entirely. Rejected because the new behavior is contractually important.

## Risks / Trade-offs

- [Risk] Existing tests may assume `.gitignore` is created or modified as part of setup. -> Mitigation: update assertions to validate no mutation and preserve other setup side effects.
- [Risk] Some user workflows may have relied on auto-added ignore line for visibility. -> Mitigation: preserve any pre-existing ignore entries and document that Arashi no longer edits `.gitignore` for worktree path.
- [Trade-off] Less automated repository mutation means users own ignore configuration decisions. -> Mitigation: keep docs explicit about default worktree location and expected Git behavior.

## Migration Plan

1. Update setup/init implementation to stop writing `.arashi/worktrees/` into `.gitignore`.
2. Update relevant unit/integration tests to assert `.gitignore` is unchanged.
3. Update docs/spec deltas to reflect the new contract.
4. Validate with lint, test, and build before merge.

Rollback strategy: restore previous ignore-update call sites and test expectations if regressions appear.

## Open Questions

- None.
