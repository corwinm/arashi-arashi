## Context

`arashi init` currently updates `.gitignore` for `repos/` and only adds a worktree ignore entry when the configured worktree location is the default `.arashi/worktrees/`. After the recent change, custom managed worktree locations are no longer reflected in `.gitignore`, so initialized workspaces can accumulate noisy untracked directories.

This change restores ignore synchronization while preserving the original constraints around idempotency and path normalization.

## Goals / Non-Goals

**Goals:**
- Restore `.gitignore` updates for the active managed worktree location when safe to express as a repository-relative directory pattern.
- Keep ignore updates idempotent and normalization-aware (trailing slash variants map to one canonical entry).
- Keep `init` output and dry-run output aligned with the actual patterns that will be managed.

**Non-Goals:**
- Changing how worktree destination paths are resolved or validated.
- Adding support for absolute worktree paths (still invalid).
- Automatically rewriting existing user-authored `.gitignore` sections beyond appending missing managed patterns.

## Decisions

1. Restore configured worktree ignore pattern calculation
   - Decision: derive a candidate ignore pattern from normalized `worktreesDir`, then include it in managed patterns when safe.
   - Rationale: this directly reverts the behavior loss while keeping pattern management centralized in init gitignore logic.
   - Alternatives considered:
     - Keep default-only behavior: rejected because it does not restore requested functionality.
     - Hard-code all non-default values: rejected because some values (for example `.`) are unsafe to auto-ignore.

2. Apply safety guardrails for broad or out-of-repo locations
   - Decision: skip automatic worktree ignore insertion when the configured location resolves to repo root (`.`/`./`) or parent traversal (`../` variants).
   - Rationale: adding these patterns can ignore unrelated files or be ineffective and confusing.
   - Alternatives considered:
     - Always write configured value to `.gitignore`: rejected due to risk of broad accidental ignores.

3. Keep behavior observable and testable
   - Decision: update integration tests for custom worktree directory cases and keep dry-run/success messaging synchronized with managed patterns.
   - Rationale: regression risk is in init flow behavior, so integration coverage is the most direct guard.

## Risks / Trade-offs

- [Risk] Users may expect every custom value to be auto-ignored, including unsafe values. -> Mitigation: document skip behavior in tests and output.
- [Risk] Pattern normalization drift between config and ignore helper could create duplicate variants. -> Mitigation: reuse existing normalization helpers and idempotent pattern detection.
- [Trade-off] Safety filters mean some valid advanced layouts still require manual `.gitignore` updates. -> Mitigation: preserve explicit user control for non-standard layouts.

## Migration Plan

1. Update init gitignore pattern selection to include safe configured worktree location entries.
2. Update integration tests to assert restored custom-location ignore behavior and safety skips.
3. Validate with `bun run lint`, `bun test`, and `bun run build` in `repos/arashi`.

Rollback: revert the pattern-selection logic and associated test expectations.

## Open Questions

- None; this is a behavior restoration with scoped safety constraints.
