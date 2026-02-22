## Context

Arashi currently validates `.arashi/config.json` with hand-written TypeScript checks in `repos/arashi/src/lib/config.ts`, and the persisted shape still uses snake_case keys such as `repos_dir`, `auto_setup`, and `discovered_repos`. This makes external validation/editor support difficult and allows drift between runtime types, docs, and actual saved config. The change needs a generated JSON Schema published at `https://arashi.haphazard.dev/config.json`, plus a move to canonical camelCase config keys.

## Goals / Non-Goals

**Goals:**
- Define one canonical config model in TypeScript and generate JSON Schema from it.
- Publish schema artifacts with a stable URL and version-pinned usage guidance.
- Migrate persisted config shape to camelCase, including renaming `discoveredRepos` to `repos`.
- Remove persisted fields that are derived/runtime-only so config remains stable and user-editable.
- Add CI checks that fail on schema drift.

**Non-Goals:**
- Re-architect worktree orchestration behavior or repository discovery semantics.
- Introduce a second independently maintained schema source.
- Solve all historical config migrations beyond legacy key normalization needed for this release.

## Decisions

1) Canonical config contract is TypeScript-first
- Decision: keep TypeScript interfaces as source of truth and generate schema from exported `Config` type.
- Why: removes duplication and prevents schema/docs/runtime mismatch.
- Alternatives considered:
  - Hand-authored schema file: rejected due maintenance drift risk.
  - Runtime introspection-only validation: rejected because users/editors still need a distributable schema.

2) Add deterministic schema generation pipeline
- Decision: add `ts-json-schema-generator` as pinned dev dependency; generate to `repos/arashi/schema/config.schema.json` via a dedicated script.
- Why: deterministic output supports reviewability and CI drift checks.
- Alternatives considered:
  - Unpinned generator version: rejected because output changes can break CI unexpectedly.
  - Generate only in CI: rejected because contributors need local regeneration workflow.

3) Canonical persisted config uses camelCase and `repos`
- Decision: migrate root and nested persisted keys to camelCase, with repository map named `repos`.
- Why: consistent naming improves readability and aligns with modern TypeScript usage.
- Alternatives considered:
  - Keep snake_case in storage and map only in memory: rejected as confusing for users editing JSON directly.

4) Persist only durable repository configuration
- Decision: stop persisting values that can be recomputed or quickly refreshed (`defaultBranch`, `isBare`, `worktrees`) unless specs require a clear persisted use case.
- Why: these values become stale and create user-facing confusion when they differ from live git state.
- Alternatives considered:
  - Keep all current fields for backward compatibility: rejected due long-term schema bloat and stale metadata risk.

5) Backward-compatible read, forward-only write
- Decision: loader accepts legacy keys (`repos_dir`, `auto_setup`, `discovered_repos`, nested snake_case keys), normalizes to canonical model, and save paths always write new camelCase shape.
- Why: existing workspaces continue to function while converging quickly to one format.
- Alternatives considered:
  - Hard break without compatibility layer: rejected because it forces immediate manual migration.

6) Public schema publishing path
- Decision: publish generated schema to the docs site root as `config.json` so `https://arashi.haphazard.dev/config.json` always resolves.
- Why: this matches requested URL and keeps schema hosting tied to docs deployment lifecycle.
- Alternatives considered:
  - Rely only on npm CDN URL: rejected because issue requires first-party URL.

## Risks / Trade-offs

- [Risk] Legacy config parsing misses edge-case keys and breaks older workspaces -> Mitigation: add fixture-based tests for legacy + canonical configs and normalize before validation.
- [Risk] Removing persisted fields affects commands that implicitly rely on cached metadata -> Mitigation: audit call sites and compute these values from git/runtime where needed.
- [Risk] Generated schema diverges from docs-hosted file -> Mitigation: CI step regenerates schema and verifies committed/generated/hosted artifacts match.
- [Risk] Strict `additionalProperties: false` blocks user custom fields -> Mitigation: allow extensibility only in explicitly flexible objects (for example `metadata`) and document boundaries.

## Migration Plan

1. Introduce canonical camelCase TypeScript config types and temporary legacy-to-canonical normalization helpers.
2. Update load/validate/save paths to normalize legacy input, validate canonical structure, and write canonical JSON only.
3. Add schema generation script and generated schema artifact in `repos/arashi/schema/`.
4. Wire schema publication to docs output path for `config.json` and update docs/examples to include `$schema`.
5. Add CI guardrails for schema regeneration drift and run lint/tests/build.
6. Rollback strategy: if migration causes regressions, re-enable legacy write mode behind a short-term compatibility flag while keeping canonical read support.

## Open Questions

- Should `schemaVersion` be introduced now, or should the existing `version` field remain the only versioning signal?
- Do we need a deprecation warning window before fully removing any persisted derived repo fields from existing files?
