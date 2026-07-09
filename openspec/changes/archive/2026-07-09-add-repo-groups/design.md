## Context

Arashi currently models managed repositories with a name and path, plus optional repository metadata such as a clone URL. Commands that need selection each normalize explicit repository names through `--only`-style filters, while `status` currently inspects all configured repositories. The issue asks for semantic groups/tags so users can target logical repo sets without enumerating names.

The design needs to preserve current behavior for existing workspaces, avoid inventing a separate group registry, and keep command selection semantics predictable for humans and automation.

## Goals / Non-Goals

**Goals:**

- Let workspace configuration attach zero or more group names to each configured repository.
- Add one consistent CLI option, `--group <group>`, for commands that select managed repositories.
- Share normalization and selection logic so `--only`, `--group`, repeatable/comma-separated values, and JSON error details behave consistently.
- Make selected, skipped, missing, and empty selections visible enough for users and agents to understand what happened.
- Document common layouts such as `core`, `docs`, `extensions`, `agents`, and `infra`.

**Non-Goals:**

- No dynamic group discovery from GitHub topics, package manifests, directory names, or labels.
- No nested groups or group inheritance in the first implementation.
- No implicit command defaults based on group membership.
- No breaking config version bump; existing repo entries without groups remain valid.

## Decisions

### Store groups on repository config entries

Add an optional `groups?: string[]` field to `RepoConfig`, for example:

```json
{
  "repos": {
    "arashi": { "path": "repos/arashi", "groups": ["core", "cli"] },
    "arashi-docs": { "path": "repos/arashi-docs", "groups": ["docs"] }
  }
}
```

Rationale: group membership belongs to the repository, keeps config local to the existing repo map, and does not require a second registry that can drift. A derived group index can be built at runtime from repo entries.

Alternatives considered:

- Top-level `groups: { docs: ["arashi-docs"] }`: easier to list groups, but duplicates repo names and can drift when repositories are renamed or removed.
- Single `group: "docs"`: too limiting because a repo may be both `core` and `cli`.
- Free-form tags separate from groups: equivalent for this use case; using one term in the CLI avoids ambiguity.

### Normalize group names similarly to repository-name filters

Group filter values should support repeatable flags and comma-separated values where the command's existing filter style supports them. Values are trimmed, deduplicated, and matched exactly after validation. Config validation should reject blank group names and non-string entries.

Rationale: users already have comma-separated and repeatable filter patterns depending on the command. Matching exact configured strings avoids surprising broad matches.

Alternatives considered:

- Case-insensitive matching: friendlier in isolation but can hide config mistakes and make JSON results less stable.
- Prefix/wildcard matching: powerful but unnecessary for the first implementation and risky for mutating commands.

### Compose `--group` with `--only` by intersection

When both filters are supplied, a repository must match both the explicit repository set and at least one requested group. Unknown explicit repositories and unknown groups should be reported separately. If all requested names/groups are valid but the intersection is empty, the command should fail before mutation with a clear empty-selection message.

Rationale: intersection is safer for mutating operations because adding `--group` narrows an existing selection instead of broadening it unexpectedly.

Alternatives considered:

- Union semantics: convenient for building ad hoc sets, but dangerous because `--only docs --group core` could unexpectedly target both sets.
- Last filter wins: simple but silently ignores one user-provided filter.

### Centralize selection helpers

Introduce or extend a shared selection helper that accepts loaded `WorkspaceRepository` records containing groups and returns:

- selected repositories in configured order;
- missing explicit repo names;
- missing group names;
- skipped repositories with skip reasons when useful to a command;
- effective filter options for JSON output.

Commands can then adapt this result to their existing output contracts.

Rationale: existing selection logic is split between config helpers and command-specific normalization. A shared helper reduces drift and makes future commands easier to opt into.

### Apply the option only to commands that select repositories

The first implementation should cover commands that already select or enumerate managed repositories: `status`, `create`, `exec`, `push`, `pull`, `setup`, and `sync`. Commands whose target is a single path, a branch/worktree identifier, or an interactive/shell behavior do not need `--group` unless they already perform repository selection internally.

Rationale: this keeps scope tied to the issue and avoids broad CLI churn.

## Risks / Trade-offs

- **Risk: command-specific output contracts diverge.** → Mitigate by sharing selection metadata and adding focused tests for each opted-in command.
- **Risk: intersection semantics surprise users who expect union.** → Mitigate with docs, help text, and error messages that say `--group` narrows selected repositories when combined with `--only`.
- **Risk: `status --group` hides repositories and changes summary counts.** → Mitigate by making human summaries count selected/visible repositories and JSON include effective filters; only selected repositories appear in status results.
- **Risk: config typos create silently empty groups.** → Mitigate by treating unknown requested groups as errors and validating blank/non-string group values at config load/schema level.
- **Risk: partial worktrees and missing repos complicate group selection.** → Mitigate by resolving selection from config first, then preserving each command's existing behavior for selected-but-missing repositories.

## Migration Plan

1. Extend config typing and generated schema to allow optional `repos.<name>.groups` arrays.
2. Load group metadata into workspace repository records without changing behavior when the field is absent.
3. Add the shared selection helper and unit tests.
4. Opt repo-selecting commands into `--group` one at a time with focused command tests.
5. Update docs and skills.
6. Validate with repo-local CLI checks, docs validation, and a smoke run on a fixture workspace that defines multiple groups.

Rollback is straightforward: because groups are optional metadata, reverting the CLI/docs changes leaves existing workspaces without groups unaffected. Workspaces that adopted `groups` would need to stop using `--group` until the feature is restored.
