## Why

Arashi's lifecycle-hook runtime, generated `init` examples, documentation, agent exports, packaged skill guidance, and the project's own hooks have diverged into contradictory contracts. A fresh configured workspace can activate examples that read nonexistent variables, install dependencies from the wrong directory, remain non-executable, or report success after setup failed, while Windows builds expose hook code that normal discovery cannot execute.

## What Changes

- Establish one normative configured/standalone lifecycle matrix covering discovery, invocation multiplicity, mutation timing, working directory, failure/rollback behavior, timeout behavior, and structured outcomes.
- **BREAKING**: Standardize hook context on `ARASHI_BRANCH_NAME` and explicit workspace, execution, source, target-repository, target-worktree, and aggregate remove metadata. Preserve valid legacy aliases, but stop exposing an arbitrary first child as workspace-create target context and omit ambiguous cross-target scalars.
- Keep repository-specific `pre-create.<repo>` compatibility while documenting and testing its existing post-materialization/pre-setup timing rather than falsely presenting it as pre-mutation.
- Include workspace-level create-hook success, skip, timeout, and failure records in human and JSON hook outcomes and recovery guidance.
- Generate scope-correct create/remove/setup examples, valid one-to-one activation commands, and executable-permission guidance; remove the unrelated `core.hooksPath` recommendation.
- Support native lifecycle scripts on Windows through deterministic PowerShell and command-script discovery, platform-matched generated examples, and real Windows lifecycle tests; POSIX discovery remains shell-script based.
- Use one documented hook timeout default, with positive millisecond overrides through `hooks.timeout`.
- Replace package-manager examples and Arashi dogfood hooks with pinned, lockfile-aware, ancestor-workspace-safe commands and fail-fast shell behavior; make presentation provisioning policy explicit and make tmux cleanup exact and idempotent.
- Update CLI docs, website canonical pages, generated Markdown and LLM exports, and packaged skill references with source/export/package semantic checks.

## Capabilities

### New Capabilities

- `lifecycle-hook-contracts`: Defines configured create lifecycle timing, environment context, template generation/activation, platform-aware script discovery, timeout defaults, outcome reporting, and setup-example boundaries.

### Modified Capabilities

- `remove-lifecycle-hooks`: Makes remove context target-consistent, aggregate-safe, timeout-consistent, and explicit about per-target invocation and structured failure records.
- `scoped-lifecycle-hooks`: Defines platform-specific script discovery, exact scope/cwd semantics, execution-path context, and configured versus standalone scope behavior.
- `global-hook-targeting`: Extends deterministic targeted/shared behavior and metadata across supported platforms and create/remove lifecycles.
- `zero-config-standalone-workspaces`: Documents and validates standalone global create/remove hook scope, platform behavior, context, and rollback parity.
- `machine-readable-cli-output`: Requires the normative per-hook schema for configured workspace/repository and standalone global create/remove outcomes without human stdout contamination.
- `docs-workflow-guidance-sections`: Requires a canonical lifecycle/environment matrix, safe activation and package-manager examples, timeout configuration, Windows guidance, and generated-export parity.
- `arashi-skill-guidance`: Requires packaged hook activation, scope, environment, package-manager, and standalone/configured guidance to match the canonical contract.
- `project-package-management`: Requires coordinated post-create setup to honor each child repository's pinned pnpm version and avoid selecting the ancestor meta workspace.

## Impact

- Meta repository: OpenSpec artifacts, semantic cross-repository checks, tracked `.arashi/config.json` and lifecycle scripts.
- CLI repository: hook discovery/execution/context, create/remove orchestration and JSON results, `init` templates/output, setup example placement, schema/default documentation, and macOS/Linux/Windows integration tests.
- Docs repository: hooks/config/create/remove/init workflow pages, generated agent-readable exports, focused semantic checker, and CI wiring.
- Skills repository: hook reference/tutorial guidance, packaged-artifact checks, and cross-repository semantic records.
- Presentation repository: an explicit automatic or manual provisioning decision; no unrelated presentation behavior changes.
