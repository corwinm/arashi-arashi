## Why

When `arashi status` cannot fetch a matching remote branch, it currently emits a large yellow warning block with the raw git error. That preserves local status information, but it makes the output feel noisier than necessary for a common warning case where the local branch simply has no corresponding remote branch yet.

## What Changes

- Update `arashi status` to recognize the specific case where the resolved remote branch does not exist on the remote.
- Show the missing-remote condition inline on the Branch line instead of as a separate warning block.
- Render the Branch line in yellow for this warning state while still showing local branch information and preserving other local repository status details.
- Keep existing warning behavior for other remote refresh failures such as authentication, network, or generic git command errors.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `status-command`: Change how `arashi status` reports a missing remote branch so the branch line shows the warning inline instead of printing the generic stale remote-tracking warning block.

## Impact

- Affected code: `repos/arashi/src/commands/status.ts`, `repos/arashi/src/lib/git-remote.ts`, and related unit/integration tests.
- User-visible behavior: `arashi status` output changes for repositories whose local branch has no matching branch on the remote.
- Dependencies: No new runtime dependencies expected.
