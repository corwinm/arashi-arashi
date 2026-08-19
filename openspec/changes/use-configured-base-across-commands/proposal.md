## Why

Configured workspaces can declare the branch each repository is based on, but status, pull, push fallback, handoff, and doctor still reason primarily about upstreams or remote defaults. This hides actionable base lag, can pull or compare against the wrong branch, and leaves a deprecated create-only base setting in the public contract.

## What Changes

- Extend the canonical configured-base resolution—repository override, then root fallback—to status, pull, push's no-upstream publishability check, handoff, and doctor.
- Preserve current-branch upstream and remote-default roles as distinct concepts; a configured base neither replaces the push destination nor erases default-branch diagnostics.
- Add configured-base status and JSON records, explicit unavailable states, and same-target base/default de-duplication without making structured roles ambiguous.
- Make configured pull merge the selected remote base into the current branch, with no silent upstream fallback when an explicitly configured base cannot be refreshed or resolved; preserve upstream-based pull when no base is configured.
- Use a refreshed configured base as push's fallback comparison only when the current branch has no upstream; preserve `--set-upstream` and destination behavior.
- Surface configured-base lag and unavailability in handoff and doctor while retaining distinct default-branch information when targets differ.
- **BREAKING**: remove `defaults.create.baseBranch` from configuration, schema, normalization, diagnostics, contracts, documentation, and skill guidance. Reject the legacy property before repository discovery, hooks, or Git mutation with actionable migration guidance to root `baseBranch`.
- Preserve `defaults.create` launch/switch settings, configured create/clone CLI overrides, unrelated command semantics, and all standalone behavior.

## Capabilities

### New Capabilities

- `coordinated-pull`: Defines configured-base pull selection, fallback, failure, ordering, filtering, rollback, and reporting semantics.

### Modified Capabilities

- `repository-base-branch-policy`: Makes repository override then root the only persisted configured-base precedence, applies it across base-aware commands, and removes the create-only legacy key.
- `status-command`: Adds a distinct configured-base comparison, unavailable states, output modes, and base/default de-duplication.
- `coordinated-branch-publishing`: Uses configured base only for no-upstream publishability comparison while preserving push destinations.
- `agent-handoff-reporting`: Includes configured-base lag and unavailable state in Markdown and JSON handoffs.
- `workspace-health-diagnostics`: Adds distinct configured-base findings and same-target diagnostic de-duplication.
- `create-command-defaults`: Rejects rather than normalizes `defaults.create.baseBranch` while retaining non-base create defaults.
- `lifecycle-hook-contracts`: Moves legacy-key rejection and configured-base resolution ahead of hook discovery and execution.
- `machine-readable-cli-output`: Publishes stable configured-base comparison and result records for affected JSON commands.
- `docs-workflow-guidance-sections`: Documents cross-command configured-base behavior, migration, distinctions, and unchanged standalone behavior.
- `arashi-skill-guidance`: Teaches agents the canonical base-aware command policy and removal of the legacy key.
- `cross-repo-command-contracts`: Keeps CLI, generated contracts, docs, skills, and meta validation synchronized on the expanded policy and legacy removal.

## Impact

Implementation spans configuration validation/schema generation, shared base/remote status helpers, `status`, `pull`, `push`, `handoff`, and `doctor` command models and formatters in `repos/arashi`; canonical and generated guidance in `repos/arashi-docs`; packaged guidance in `repos/arashi-skills`; and meta-repository semantic contract checks. Human and JSON output contracts gain configured-base state, and configurations containing `defaults.create.baseBranch` become invalid.