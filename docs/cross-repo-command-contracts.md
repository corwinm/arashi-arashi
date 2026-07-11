# Cross-repository command contract checks

The meta-repository compares the generated CLI contract with the canonical docs, structured skill coverage, and VS Code policy. Generated docs exports (`public/`, `dist/`, and curated `llms.txt`) are deliberately not exhaustive inputs.

## Run locally

Populate all four `repos/*` checkouts, install the pinned private toolchain, then run:

```sh
bun install --frozen-lockfile
bun run contracts:check
bun run contracts:check --json
bun run test
bun run typecheck
```

The human report groups findings by stable category/code. Intentional exclusions are `info`; schema, missing, stale, and invalid findings exit non-zero. JSON emits `{ ok, diagnostics }` with the same deterministic ordering.

## Update a command

1. In `repos/arashi`, update registration/semantic annotations, run `bun run contract:generate`, and verify `bun run contract:check`.
2. Add or remove `repos/arashi-docs/docs/commands/<command>.md` and its link in `docs/commands/index.md`. Do not edit generated exports for this checker.
3. Update `repos/arashi-skills/contracts/command-coverage.json`; covered entries need an existing skill-relative reference, exclusions need a reason. Keep backticked `arashi <command>` references current.
4. Update `repos/arashi-vscode/contracts/command-policy.json`. Every CLI command must be `mapped`, `represented`, or reasoned `excluded`; every contributed extension command must be CLI-backed or listed in `extensionOnlyCommands`.
5. Run child-repository checks and then the commands above from this meta-repository.

## Troubleshooting

- `SCHEMA_*` / `POLICY_REASON_REQUIRED`: use schema version 1, valid arrays/objects, unique command names, and non-empty reasons for conditional/unsupported/excluded/represented states.
- `DOCS_*`: check only canonical `docs/commands` sources and use a `/commands/<name>/` or `commands/<name>.md` index link.
- `SKILLS_*`: remove renamed commands from structured coverage and backticked command-shaped prose; ensure covered `reference` paths are relative to `skills/arashi` and exist.
- `VSCODE_*`: ensure mapping IDs exist in `package.json` contributions and classify extension-only navigation/panel commands explicitly.
- CI prints all checked-out SHAs. Reproduce a failure by checking out those exact revisions into `repos/*`.

## CI trigger decision

The authoritative workflow runs on meta-repository changes and manual dispatch. For coordinated pull requests, it checks out the matching head branch from each child repository; pushes to `main` and manual runs validate each child’s `main` branch. This preserves review-time cross-repo validation while ensuring the durable post-merge check follows released repository state.

Child repositories do **not** dispatch the workflow yet: cross-repository authentication, independently named PR refs, and status reporting should be designed together in a follow-up. Child-local freshness/consistency gates remain independently useful in the meantime.
