## Why

Arashi users need a machine-readable contract for `.arashi/config.json` so editors can validate and autocomplete config updates safely. We should define and publish a canonical JSON Schema now because config keys have drifted (naming, legacy fields, and unclear required properties), which increases support and migration risk.

## What Changes

- Generate a JSON Schema for `.arashi/config.json` from the TypeScript `Config` type and store the generated artifact in the repository.
- Publish the schema at a stable public URL (`https://arashi.haphazard.dev/config.json`) with version-pinned guidance for consumers.
- Normalize config field naming to camelCase and rename `discoveredRepos` to `repos`.
- Audit config shape and remove obsolete stored fields that are not required by current runtime behavior.
- Define strict schema behavior (required fields and `additionalProperties: false`) and add CI checks so generated schema stays in sync.
- Update docs and init/config examples so users can attach `$schema` to local config files.

## Capabilities

### New Capabilities

- `config-json-schema`: Generate, publish, and validate a JSON Schema contract for `.arashi/config.json`, including documentation for `$schema` usage.

### Modified Capabilities

- `config-management`: Update config requirements to use camelCase keys, rename `discoveredRepos` to `repos`, and remove no-longer-needed persisted fields.

## Impact

- Affected code: config types/loaders/writers, init/setup flows, release/publish scripts, and documentation pages.
- Affected artifacts: generated schema file(s), package publishing metadata, and CI validation for schema drift.
- External impact: users editing config manually gain validation/autocomplete support; legacy config keys may require migration handling.
- Dependencies: JSON Schema generation tooling and schema hosting/publishing path.
