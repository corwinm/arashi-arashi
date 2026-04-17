## Why

`arashi status` already helps users see whether each repository is clean, dirty, or diverged from its tracking branch, but it does not show whether a feature branch has fallen behind the repository's default branch. That leaves users without an easy way to spot when a coordinated feature needs to be rebased or updated across repos before drift becomes painful.

## What Changes

- Update `arashi status` to compare the current branch against each repository's default branch in addition to the existing tracking-branch summary.
- Show default-branch divergence inline in status output with a concise indicator such as `Default: 5 ↓` when the current branch is behind the default branch.
- Keep the output useful when the default branch cannot be resolved or refreshed, preserving the rest of the repository status instead of failing the command.
- Add tests covering clean/default-up-to-date repositories, repositories behind the default branch, and fallback behavior when default-branch comparison is unavailable.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `status-command`: Extend `arashi status` requirements so repository status output includes divergence from the repo's default branch, not just the configured tracking branch.

## Impact

- Affected repo: `repos/arashi`.
- Affected code: `src/commands/status.ts`, shared git/default-branch helpers, and status command tests.
- User-visible behavior: `arashi status` output gains default-branch divergence information.
- Follow-up review: confirm whether `repos/arashi-docs/` or `repos/arashi-skills/` need command-output examples updated after implementation.
