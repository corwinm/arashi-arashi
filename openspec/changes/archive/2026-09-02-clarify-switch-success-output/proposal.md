## Why

`aw switch` success output currently presents an internal repository label before the selected branch. When that label resembles the caller's current worktree, a successful switch can appear to have targeted the wrong worktree even though the selected path is correct.

## What Changes

- Make the selected branch the primary identity in human-readable success output for every switch behavior.
- Label repository identity explicitly so coordinated child-repository context remains available without being mistaken for the selected worktree.
- Apply the same target-first format to launched contexts and parent-shell directory switching.
- Add exact-output regression coverage for both success paths.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `switch-command`: Require unambiguous, selected-target-first human success output for launched contexts and parent-shell directory switching.

## Impact

- `repos/arashi/src/commands/switch.ts`
- Switch command human-output tests in `repos/arashi/tests/`
- No CLI flags, configuration, JSON output, launcher behavior, or worktree selection behavior changes.
