## Why

Configured worktree destination naming currently applies the bare and non-bare topology defaults in reverse. Bare repositories can share a sibling worktree base and therefore need the canonical repository naming component, while a non-bare configured workspace already owns its worktree base and should not repeat that component.

## What Changes

- Correct newly planned configured parent destinations so bare repositories use `<canonical repository naming component>/<branch>` and non-bare repositories use `<branch>` beneath the effective `worktreesDir` base.
- Resolve the repository component through the existing `worktreeName`/canonical configured-name authority, omitting a conventional terminal `.git` from the bare-source fallback; do not substitute a linked-checkout or clone-directory basename.
- Derive coordinated child destinations from the same corrected authoritative parent destination while preserving each child's configured path beneath it.
- Preserve slash-containing branch hierarchy, standalone `.worktrees/<branch>` behavior, and custom-root semantics in which `worktreesDir` changes only the base.
- Require human, dry-run, and JSON create output to report the same resolved destination and require destination collision checks before hooks, branches, worktrees, directories, or other filesystem mutation.
- Leave every existing worktree in place without migration and keep list, status, switch, and remove operating through Git worktree metadata.
- Add portable path coverage plus native macOS, Linux, and Windows acceptance for the corrected configured layouts.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `configurable-worktree-location`: Corrects configured bare/non-bare destination naming, parent/child path authority, compatibility, collision, slash-branch, and cross-platform behavior.
- `init-repository-aware-worktree-default`: Corrects the downstream bare-create layout while retaining the persisted repository-aware base selection.
- `machine-readable-cli-output`: Requires configured create JSON and dry-run destinations to match the authoritative plan and human result.

## Impact

- **CLI repository:** configured destination planning, repository-name resolution reuse, coordinated child path projection, pre-mutation conflict checks, human/dry-run/JSON rendering, and cross-platform tests.
- **Documentation repository:** correct the stale configured non-bare clone-worktree example, document the bare namespace, and regenerate agent-readable exports.
- **Meta repository:** OpenSpec artifacts and validation only.
- **Compatibility:** the corrected rule applies only to destinations for newly created configured worktrees. Existing worktrees are neither renamed nor migrated; standalone behavior is unchanged.
