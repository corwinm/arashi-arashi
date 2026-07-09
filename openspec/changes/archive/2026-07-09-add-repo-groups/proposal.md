## Why

Arashi workspaces are starting to contain repositories with different roles: CLI/runtime, docs, VS Code extension, skills, and future project-specific repos. Name-based `--only` filters work for one-off operations, but they force users and agents to remember every repo name instead of targeting semantic sets such as `core`, `docs`, `extensions`, or `agents`.

Repository groups give workspace owners a durable way to name those sets once in configuration and reuse them consistently across coordinated operations.

## What Changes

- Add optional repository group metadata to `.arashi/config.json` repository entries.
- Add a consistent `--group <group>` repository filter to commands that operate across selected managed repositories.
- Allow group filters to compose with explicit `--only` filters by intersecting the selected repository sets.
- Report unknown/empty group selections clearly in both human output and JSON envelopes.
- Include selected/skipped group context in machine-readable results where commands already expose selected repositories or effective options.
- Update CLI docs and Arashi skill guidance with common group layouts and examples.

## Capabilities

### New Capabilities

- `repository-group-selection`: Defines repository group configuration, validation, group-based selection semantics, composition with explicit repository filters, output visibility, docs, and skill guidance.

### Modified Capabilities

None. This change introduces a cross-cutting repository-selection capability without removing existing `--only`, `--dirty`, or interactive selection behavior.

## Impact

- `repos/arashi`: config types/schema generation, config validation, shared repository selection helpers, and command option handling for repo-selecting commands such as `status`, `create`, `exec`, `push`, `pull`, `setup`, and `sync`.
- `repos/arashi-docs`: config reference and command pages that show `--group` examples.
- `repos/arashi-skills`: agent guidance for choosing `--group` when running targeted multi-repo commands.
- Existing configs remain valid because groups are optional and default to no group membership.
