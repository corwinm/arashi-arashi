## Why

`arashi status` currently reads branch tracking data without refreshing remote refs first, so ahead/behind information can be stale even when the repository is otherwise healthy. We need the command to refresh remote state before reporting status so users can trust the branch summary when deciding whether to pull, push, or switch context.

## What Changes

- Update `arashi status` to run `git fetch` before collecting branch tracking information for repositories that exist locally and have a remote to refresh.
- Preserve existing local status reporting when a remote refresh cannot run, instead of turning transient network or auth issues into a full loss of repository status.
- Surface fetch-related degradation clearly enough that users can tell when remote ahead/behind data may be stale.
- Add command-level coverage for successful refreshes and fetch-failure fallback behavior.

## Capabilities

### New Capabilities
- `status-command`: Define status-command requirements for refreshing remote-tracking data before rendering repository status output.

### Modified Capabilities
- None.

## Impact

- Affected repo: `repos/arashi`.
- Affected code: `src/commands/status.ts`, git helper utilities, and status command tests.
- Affected systems: CLI status output, branch tracking accuracy, and git network access during status checks.
- Dependencies: existing git subprocess utilities and repository-level remote configuration.
