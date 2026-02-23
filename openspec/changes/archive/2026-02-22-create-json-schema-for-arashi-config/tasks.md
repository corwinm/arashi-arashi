## 1. Canonical Config Model

- [x] 1.1 Define canonical camelCase config interfaces in `repos/arashi/src/lib/config.ts` with root `repos` map and repository `gitUrl` keys.
- [x] 1.2 Add legacy-to-canonical normalization for root and nested snake_case keys during config load.
- [x] 1.3 Update config validation to validate canonical shape and enforce rejection of unknown fixed-structure properties.
- [x] 1.4 Update config save paths to always write canonical camelCase JSON.

## 2. Repository Metadata Persistence Cleanup

- [x] 2.1 Remove persisted `defaultBranch`, `isBare`, and `worktrees` from repository config writes.
- [x] 2.2 Audit command call sites that currently read those fields and switch them to runtime/git-derived values.
- [x] 2.3 Add migration-safe behavior so legacy files with removed fields still load successfully.

## 3. JSON Schema Generation

- [x] 3.1 Add pinned `ts-json-schema-generator` dev dependency and create a schema generation script in `repos/arashi/package.json`.
- [x] 3.2 Generate and commit `repos/arashi/schema/config.schema.json` from the exported `Config` type.
- [x] 3.3 Ensure package/release metadata includes the generated schema artifact for distribution.

## 4. Schema Publication and Documentation

- [x] 4.1 Wire docs/site output so `https://arashi.haphazard.dev/config.json` serves the generated schema.
- [x] 4.2 Update config documentation with `$schema` examples for stable URL and version-pinned usage.
- [x] 4.3 Update init/config templates so generated config references the canonical schema URL where applicable.

## 5. Validation, CI, and Tests

- [x] 5.1 Add CI check to regenerate schema and fail when committed schema differs.
- [x] 5.2 Add unit tests for legacy key normalization, camelCase persistence, and rejected invalid/unknown fields.
- [x] 5.3 Add tests that verify removed derived repo fields are not persisted while runtime behavior remains correct.
- [x] 5.4 Run required quality checks in `repos/arashi` (`bun run lint`, `bun test`) and recommended build (`bun run build`).
