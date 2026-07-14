## Why

Arashi currently updates only tracked `.gitignore` content during `init`, even though collaborators may materialize or refresh configured workspaces through `pull`, `clone`, `add`, and `create` without ever running initialization. Managed repository and worktree paths need one safe, clone-aware ignore contract that honors Git's effective ignore sources, defaults to repository-local excludes, and remains consistent throughout the configured workspace lifecycle.

## What Changes

- Resolve effective ignore state through Git across tracked ignore files, repository-local excludes, and existing global excludes before adding any rule.
- Add `arashi init --ignore-scope <local|tracked|none>`, defaulting configured initialization to repository-local `.git/info/exclude` rules while keeping tracked `.gitignore` updates as an explicit team-level opt-in.
- Persist explicit non-default `tracked` or `none` preferences in clone-local Git state rather than shared `.arashi/config.json`.
- Reconcile safe configured `reposDir` and `worktreesDir` ignore rules through shared logic during `init`, `pull`, `clone`, `add`, and `create`; reload and reconcile config after the parent repository is pulled.
- Keep lifecycle reconciliation idempotent, reject unsafe broad ignore paths, never modify global Git configuration, and roll back ignore-file mutations with command failures.
- Extend dry-run and JSON-capable command results with effective ignore sources, scope, planned or applied rules, unsafe skips, and changed-file state without leaking human output into JSON stdout.
- Add non-mutating `doctor` findings for missing or stale managed ignore state.
- Document local-default, tracked opt-in, and manual ignore workflows across Getting Started and the `init`, `pull`, `clone`, `add`, and `create` command pages, including generated agent-readable exports.

## Capabilities

### New Capabilities

- `managed-git-ignore-reconciliation`: Defines effective ignore discovery, clone-local scope preferences, safe rule persistence, and reconciliation across configured workspace lifecycle commands.

### Modified Capabilities

- `configurable-worktree-location`: Changes managed worktree-location ignore behavior from `.gitignore`-specific initialization/setup handling to effective-source detection and local-default lifecycle reconciliation.
- `workspace-health-diagnostics`: Adds non-mutating findings and repair guidance for missing or stale managed ignore state.
- `machine-readable-cli-output`: Adds structured managed-ignore reconciliation details to JSON-capable lifecycle commands while preserving the single-document stdout contract.

## Impact

- Affected repositories: `corwinm/arashi`, `corwinm/arashi-docs`, and `corwinm/arashi-skills`; OpenSpec artifacts remain in `corwinm/arashi-arashi`.
- Expected CLI areas include configuration/path helpers, Git ignore inspection and local config persistence, `init`, `pull`, `clone`, `add`, `create`, `doctor`, rollback handling, JSON output data, and integration fixtures.
- Expected docs and skill areas include Getting Started, command pages for `init`, `pull`, `clone`, `add`, and `create`, automation/agent guidance, and generated Markdown/LLM exports.
- No new runtime dependency or writable global Git configuration is expected.
- This change provides shared ignore infrastructure that the separate zero-config standalone workflow in #212 can reuse later; it does not implement configless workspace discovery.

## Implementation

- CLI: [corwinm/arashi#92](https://github.com/corwinm/arashi/pull/92)
- Documentation: [corwinm/arashi-docs#46](https://github.com/corwinm/arashi-docs/pull/46)
- Skills: [corwinm/arashi-skills#38](https://github.com/corwinm/arashi-skills/pull/38)

Validation completed across the three child repositories. The CLI full suite completed with 850 passing tests and one unrelated timing assertion that exceeded its five-second threshold by 219 ms; the isolated timing test then passed three consecutive runs at 2.1–2.2 seconds.
