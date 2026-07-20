# Cross-repository command contract checks

The meta-repository compares the generated CLI command contract with the canonical docs, structured skill coverage, and VS Code policy. It also compares the generated CLI configuration schema with structured switch-configuration contracts in the docs and skill repositories. Docs-local validation proves that canonical sources and generated agent exports agree with the docs contract; skill-local validation proves packaged guidance agrees with the skill contract.

## Run locally

Populate all four `repos/*` checkouts, install the pinned private toolchain, then run:

```sh
pnpm install --frozen-lockfile
pnpm contracts:check
pnpm contracts:check --json
pnpm test
pnpm typecheck
```

The human report groups findings by stable category/code. Intentional exclusions are `info`; schema, missing, stale, and invalid findings exit non-zero. JSON emits `{ ok, diagnostics }` with the same deterministic ordering.

## Update a command

1. In `repos/arashi`, update registration/semantic annotations, run `bun run contract:generate`, and verify `bun run contract:check`.
2. Add or remove `repos/arashi-docs/docs/commands/<command>.md` and its link in `docs/commands/index.md`. Do not edit generated exports for this checker.
3. Update `repos/arashi-skills/contracts/command-coverage.json`; covered entries need an existing skill-relative reference, exclusions need a reason. Keep backticked `arashi <command>` references current.
4. Update `repos/arashi-vscode/contracts/command-policy.json`. Every CLI command must be `mapped`, `represented`, or reasoned `excluded`; every contributed extension command must be CLI-backed or listed in `extensionOnlyCommands`.
5. For switch-configuration changes, regenerate `repos/arashi/schema/config.schema.json`; update `repos/arashi-docs/contracts/switch-config.json` and `repos/arashi-skills/contracts/switch-config.json`; then run each child repository's source/export/package checks so the structured declarations cannot drift from their human and agent-facing surfaces.
6. Run child-repository checks and then the commands above from this meta-repository.

## Troubleshooting

- `SCHEMA_*` / `POLICY_REASON_REQUIRED`: use schema version 1, valid arrays/objects, unique command names, and non-empty reasons for conditional/unsupported/excluded/represented states.
- `DOCS_*`: check only canonical `docs/commands` sources and use a `/commands/<name>/` or `commands/<name>.md` index link.
- `SKILLS_*`: remove renamed commands from structured coverage and backticked command-shaped prose; ensure covered `reference` paths are relative to `skills/arashi` and exist.
- `SWITCH_CONFIG_*`: keep the generated schema mode enum, canonical field, docs contract, and skill contract aligned. Deprecated launcher aliases are runtime migration inputs only and must not reappear in the canonical switch schema.
- `VSCODE_*`: ensure mapping IDs exist in `package.json` contributions and classify extension-only navigation/panel commands explicitly.
- CI prints all checked-out SHAs. Reproduce a failure by checking out those exact revisions into `repos/*`.

## CI trigger decision

The authoritative workflow runs on meta-repository changes and manual dispatch. It validates each child repository’s `main` branch, which makes the durable contract check follow merged repository state and preserves child-before-meta merge ordering.

Child repositories do **not** dispatch the workflow yet: cross-repository authentication, independently named PR refs, and status reporting should be designed together in a follow-up. Child-local freshness/consistency gates remain independently useful in the meantime.
