## Why

The checked-in CLI command contract currently embeds the package release version, so semantic-release makes the contract stale even when the command surface is unchanged. This couples interface-drift validation to release bookkeeping and allowed a skipped release commit to leave `main` failing its next unrelated pull request.

## What Changes

- Remove the package release version from the generated CLI command contract.
- Keep `schemaVersion` as the contract format version and continue deriving command structure and semantics from the runtime Commander tree.
- Update meta-repository contract parsing and fixtures so cross-repository validation requires the contract schema version and command list rather than a duplicated CLI release version.
- Regenerate the canonical contract and verify ordinary package-version changes no longer affect contract freshness.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cross-repo-command-contracts`: Clarify that contract versioning refers to the contract schema, not the Arashi package release, and require release-version-independent freshness checks.

## Impact

- `corwinm/arashi`: contract type, generator, generated JSON artifact, and focused tests.
- `corwinm/arashi-arashi`: contract parser validation, fixtures/tests, OpenSpec delta, and cross-repository checks.
- No runtime CLI behavior, npm package versioning, documentation command coverage, skills guidance, or VS Code mappings change.
