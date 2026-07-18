## Context

The CLI contract generator builds a deterministic JSON artifact from the same Commander program used at runtime. Its `cliVersion` field is copied from `package.json`, while its `schemaVersion` field already versions the contract format. Semantic-release updates `package.json` in a `[skip ci]` release commit, which changes generated output even when no command metadata changed and leaves the checked-in contract stale.

The meta-repository validator also requires `cliVersion`, so removing the coupling requires coordinated CLI and meta changes.

## Goals / Non-Goals

**Goals:**

- Make command-contract freshness depend only on contract structure and semantic policy.
- Preserve deterministic generation and schema compatibility validation.
- Keep runtime `arashi --version` behavior sourced from `package.json`.
- Update the canonical consumer and tests together.

**Non-Goals:**

- Change semantic-release, package publication, tags, or changelog behavior.
- Change commands, options, companion-surface policies, or runtime output.
- Introduce another release-version manifest.

## Decisions

### Treat `schemaVersion` as the contract's only version field

Remove `cliVersion` from `CliCommandContract` and generated JSON. A contract checked out at a release tag is already associated with that release, while `schemaVersion` is the compatibility signal consumers actually need.

Alternative: teach semantic-release to regenerate and commit the contract on every release. Rejected because it creates meaningless contract churn, depends on plugin ordering, and preserves coupling between interface validation and release bookkeeping.

Alternative: retain `cliVersion` but ignore it during freshness checks. Rejected because checked-in generated output would still be stale and consumers could mistake the field for a compatibility guarantee.

### Keep runtime version handling unchanged

`buildProgram()` continues to call Commander `.version(pkg.version)`, so `arashi --version` and update behavior remain tied to the package release. Only serialization of the command-surface contract changes.

### Coordinate consumer validation in the meta-repository

The meta checker will require a supported `schemaVersion` and `commands` array, and fixtures will no longer carry arbitrary CLI package versions. This makes the consumer validate the contract format rather than release provenance.

## Risks / Trade-offs

- **[Risk] An unknown consumer relies on `cliVersion`** → Repository-wide inspection found only the CLI generator and meta validator; the coordinated PRs update both known producers and consumers.
- **[Risk] Removing a JSON field is treated as a schema change** → Increment `schemaVersion` from 1 to 2 and make the meta validator require version 2, explicitly representing the shape change.
- **[Risk] Companion repositories temporarily consume mismatched revisions** → Land the green CLI child PR first, then update and merge the meta/OpenSpec PR as the coordination point.

## Migration Plan

1. Add failing CLI and meta tests for a schema-versioned contract without `cliVersion`.
2. Remove the field, bump the contract schema to 2, and regenerate the artifact.
3. Update meta validation and fixtures to require schema version 2.
4. Run repository-local and coordinated contract checks.
5. Merge the child CLI PR before the meta/OpenSpec PR.

Rollback by reverting both coordinated PRs; runtime CLI version behavior is unaffected either way.

## Open Questions

None.
