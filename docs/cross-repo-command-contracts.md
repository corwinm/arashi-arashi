# Cross-repository command contract checks

The meta-repository compares the generated CLI command contract with the canonical docs, structured skill coverage, and VS Code policy. For create launch configuration, it normalizes the CLI semantic manifest as the authority, verifies its modes, fields, and editor scopes against the generated CLI schema, and compares the docs and skill companions with those CLI-derived semantics. Switch configuration remains checked against its generated schema and companion contracts. Docs-local validation proves that canonical sources and generated agent exports agree with the docs contract; skill-local validation proves packaged guidance agrees with the skill contract.

## Checker development (meta-only)

Run `pnpm test`, `pnpm typecheck`, and `pnpm format:check` without populating
children. Automatic CI reports **Meta quality checks**. See the
[test boundary and moved assertion inventory](checker-test-boundaries.md).

## Run locally

Populate all five `repos/*` checkouts, install the pinned private toolchain, then run:

```sh
pnpm install --frozen-lockfile
pnpm --dir repos/arashi install --frozen-lockfile
pnpm --dir repos/arashi schema:publish
pnpm --dir repos/arashi schema:check
pnpm --dir repos/arashi contract:generate
pnpm --dir repos/arashi contract:check
pnpm --dir repos/arashi completion:generate
pnpm --dir repos/arashi completion:check
git -C repos/arashi diff --exit-code -- schema/config.schema.json contracts/cli-commands.json contracts/executable-distribution.json src/generated/completions.ts
pnpm --dir repos/arashi-docs install --frozen-lockfile
pnpm --dir repos/arashi-docs validate:semantic-docs
node repos/arashi-skills/scripts/validate-guidance.mjs
node repos/arashi-skills/scripts/create-release-archive.mjs --root repos/arashi-skills --output arashi-skill-package.tar.gz
node repos/arashi-skills/scripts/create-release-archive.mjs --verify arashi-skill-package.tar.gz
mkdir package-check
tar -xzf arashi-skill-package.tar.gz -C package-check
node repos/arashi-skills/scripts/validate-guidance.mjs --skill-root package-check/skills/arashi
pnpm contracts:check
pnpm test:integration
pnpm test
pnpm typecheck
```

This sequence validates source guidance and then the extracted `skills/arashi` subtree from the canonical release archive. The archive producer verifies exact release membership during creation, and the explicit verification command keeps that boundary independently executable before extraction. Run `pnpm --silent run contracts:check --json` when one machine-readable aggregate JSON document is required; `--silent` prevents package-manager lifecycle text from contaminating JSON on a nonzero result.

## Update a command

1. In `repos/arashi`, update registration/semantic annotations, run `pnpm run contract:generate`, and verify `pnpm run contract:check`.
2. Add or remove `repos/arashi-docs/docs/commands/<command>.md` and its link in `docs/commands/index.md`. Do not edit generated exports for this checker.
3. Update `repos/arashi-skills/contracts/command-coverage.json`; covered entries need an existing skill-relative reference, exclusions need a reason. Keep backticked `aw <command>` references current.
4. Update `repos/arashi-vscode/contracts/command-policy.json`. Every CLI command must be `mapped`, `represented`, or reasoned `excluded`; every contributed extension command must be CLI-backed or listed in `extensionOnlyCommands`.
5. For configuration-contract changes, regenerate `repos/arashi/schema/config.schema.json` and keep the relevant semantic companions aligned:
   - switch mode: `repos/arashi-docs/contracts/switch-config.json` and `repos/arashi-skills/contracts/switch-config.json`
   - create launch: `repos/arashi/contracts/create-launch-config.json`, `repos/arashi-docs/contracts/create-launch-config.json`, and `repos/arashi-skills/contracts/create-launch-config.json`
     Then run each child repository's source/export/package checks so the structured declarations cannot drift from their human and agent-facing surfaces.
6. Run child-repository checks and then the commands above from this meta-repository.

## Troubleshooting

- `SCHEMA_*` / `POLICY_REASON_REQUIRED`: use schema version 1, valid arrays/objects, unique command names, and non-empty reasons for conditional/unsupported/excluded/represented states.
- `DOCS_*`: check only canonical `docs/commands` sources and use a `/commands/<name>/` or `commands/<name>.md` index link.
- `SKILLS_*`: remove renamed commands from structured coverage and backticked command-shaped prose; ensure covered `reference` paths are relative to `skills/arashi` and exist.
- `SWITCH_CONFIG_*`: keep the generated schema mode enum, canonical field, docs contract, and skill contract aligned. Deprecated launcher aliases are runtime migration inputs only and must not reappear in the canonical switch schema.
- `CREATE_CONFIG_*`: keep the CLI create-launch manifest, generated schema, docs contract, and skill contract semantically identical. Legacy `launchMode`, `launch_mode`, and boolean `launch` remain runtime migration inputs only.
- `VSCODE_*`: ensure mapping IDs exist in `package.json` contributions and classify extension-only navigation/panel commands explicitly.
- CI records all checked-out revisions in `cross-repo-revisions.json`. Reproduce a failure by checking out each recorded `sourceRepository` at its exact `sha` into the meta root or corresponding `repos/*` path.

## Manual advisory assessment and revision evidence

The integration workflow is **manual-only** (`workflow_dispatch`), without revision inputs. It is **not a merge gate**: child local CI and the required automatic **Meta quality checks** remain independent. Dispatch only upstream meta `main`:

```sh
gh workflow run cross-repo-command-contracts.yml --repo corwinm/arashi-arashi --ref main
gh run list --repo corwinm/arashi-arashi --workflow cross-repo-command-contracts.yml --event workflow_dispatch
gh run view RUN_ID --repo corwinm/arashi-arashi --log
gh run download RUN_ID -R corwinm/arashi-arashi -n cross-repo-revisions
```

A dispatch acknowledgment is not a validation result. Inspect the completed run, summary and downloaded manifest. The workflow rejects feature refs, tags, forks and automatic/reusable invocations before checkout. GitHub's executing `github.workflow_ref` must identify this upstream workflow at `refs/heads/main`, and its full lowercase `github.workflow_sha` must equal the dispatch `github.sha`. Meta is checked out at that event SHA, not a newer main tip. Each child's canonical upstream identity is checked and its `main` SHA resolved once; there is no matching-branch or default-branch fallback.

The schemaVersion **2** `cross-repo-revisions.json` records `event` (name/repository/ref/sha), `coordinator` (repository/workflow ref/sha), the meta `trigger`, and exactly six `repositories` entries in meta, CLI, docs, skills, VS Code, presentation order. Every entry has `logicalRepository`, `sourceRepository`, and full `sha`; each checkout HEAD must match. The identical JSON appears in the summary. Manifest validation, summary publication, artifact upload (missing file is an error), and digest validation all precede toolchain installation and semantic validation. Later failures retain the artifact.

The summary reports the **artifact-archive SHA-256** from GitHub's upload action. It covers the downloadable archive, not the JSON file alone. Compare it with the artifact API's `digest` field or hash downloaded archive bytes before extraction. To reproduce, check out each recorded source at its exact SHA into the meta root or corresponding `repos/*` path and execute the local sequence above; never substitute today's branch tips.

This is a recorded snapshot, not an atomic six-repository transaction or a promise of current freshness. Main can advance during assessment. A new dispatch obtains a new snapshot; a rerun retains the original coordinator provenance and is not a fresh coordinator assessment.

Failures remain unsuccessful. Confirmed semantic diagnostics identify **drift**; API, checkout, manifest, artifact, toolchain/build, runner and unclassified checker failures are **inability to validate**, not evidence of compatibility. The final summary names unsuccessful step IDs; those IDs identify workflow phases. It conservatively reports unclassified nonzero exits as inability, not proven drift. Inspect owning diagnostics to identify confirmed drift separately; both may be present. An early failure must not claim complete evidence. Cancellation or runner loss may prevent even the final summary. There is no automatic follow-up action, schedule, status fan-out or merge prohibition.

## Staged rollout

Do not deploy this final workflow before the foundation is merged and its exact-head/main **Meta quality checks** context is verified. With separate authorization, replace the meta integration requirement with that verified local-quality context, remove only obsolete child integration requirements, and read back effective protections. Retire and verify **all five child callers** while the foundation still supports the reusable interface. Only then land this final manual-only workflow. Inspect all six repositories for remaining automatic invocations, perform a real upstream-main dispatch and verify its completed result plus downloaded revision evidence/digest. Local fixtures exercise controlled failures without intentionally breaking main. Archive the OpenSpec change only after rollout acceptance, not during this preparation.
