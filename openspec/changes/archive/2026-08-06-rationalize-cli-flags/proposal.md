## Why

Arashi's public CLI has accumulated one no-op format flag, inconsistent aliases and selector input shapes, and negative switch flags whose names obscure their actual positive behavior. The current constructed surface contains 22 command paths, 105 option registrations, and 57 unique long options. Rationalizing these surfaces now makes common invocations easier to discover and script while preserving existing long-form automation through explicit compatibility boundaries.

## What Changes

- Add consistent command-local short aliases for common cross-command concepts: `-v/--verbose`, `-f/--force`, `-j/--json`, `-o/--only`, `-g/--group`, and `-n/--dry-run`.
- Normalize repository selectors to accept both repeated and comma-separated values without removing either existing form, and add fail-closed `status --only` selection parity.
- Replace switch's negatively expressed launch override with canonical `switch --launch`; retain `--no-cd` throughout Arashi 1.x as a deprecated compatibility spelling with identical semantics.
- Replace misleading `switch --no-default-launch` with canonical `--ignore-configured-launcher`; retain the old spelling throughout Arashi 1.x with identical semantics.
- Make `switch --cd` and `--launch` explicit conflicting behavior choices, while preserving the defined precedence and compatibility of explicit launchers and tab disposition.
- Deprecate and hide the redundant `handoff --markdown` spelling throughout Arashi 1.x while retaining Markdown as the default output; preserve JSON stdout isolation.
- Reject `update --check --dry-run` as an explicit conflict instead of silently allowing `--check` to win.
- Synchronize CLI help, generated command contracts, canonical docs, agent-readable exports, and packaged skills with the final option surface; keep the Commander tree authoritative for future completion consumers without implementing the separately tracked native shell-completion feature.

## Capabilities

### New Capabilities

- `cli-option-conventions`: Defines consistent short aliases, backward-compatible selector parsing, deprecated-option handling, and command-local collision policy across the CLI.

### Modified Capabilities

- `switch-command`: Replaces negative behavior/launcher spellings with canonical positive names, defines compatibility aliases, and makes the complete behavior and conflict matrix normative.
- `launch-disposition`: Replaces deprecated switch spellings in actionable unsupported-tab guidance while preserving every launcher mapping and failure boundary.
- `agent-handoff-reporting`: Deprecates the redundant explicit Markdown option while preserving default Markdown and structured JSON behavior.
- `cli-self-update`: Rejects the ambiguous combined check and dry-run invocation.
- `repository-group-selection`: Normalizes repeated and comma-separated `--only`/`--group` values while preserving fail-closed intersection behavior.
- `status-command`: Adds explicit repository selection through `--only` with shared fail-closed filtering.
- `machine-readable-cli-output`: Standardizes `-j` wherever `--json` is registered and preserves one-document stdout during deprecated-option handling.
- `cross-repo-command-contracts`: Extends generated semantic metadata and companion enforcement to cover aliases, compatibility spellings, conflicts, and selector input policy.
- `arashi-skill-guidance`: Updates packaged guidance to use canonical switch names and consistent aliases without teaching deprecated spellings as preferred workflow.

## Impact

The primary implementation is in `repos/arashi`, including Commander registrations, npm-wrapper argument interception, switch resolution, shared selector parsing, update validation, help, tests, and generated CLI contracts. Canonical documentation and generated agent-readable exports in `repos/arashi-docs`, packaged guidance in `repos/arashi-skills`, and meta-repository cross-contract checks must be updated in coordinated child PRs. Native shell completion remains outside this change. Existing long options and deprecated switch/handoff spellings remain behaviorally compatible for the documented migration window; their eventual removal requires a separately identified breaking-release boundary.
