## Why

Arashi rejects valid SCP-style Git remotes that omit an explicit SSH user, and its clone protocol normalization can rewrite machine-local SSH host aliases into unusable HTTPS URLs. Developers who use SSH aliases for multiple identities should be able to add and clone repositories without Arashi interpreting or corrupting Git/OpenSSH-owned routing.

## What Changes

- Accept standard `[user@]host:path` Git SSH remotes, including host aliases without an explicit user, alongside existing `ssh://[user@]host/path` forms.
- Parse repository identity and derive safe repository names from those forms while preserving the exact configured URL.
- Treat every SSH host as opaque: Arashi will not read, resolve, validate, or manage SSH configuration.
- Make clone protocol selection conservative so an SSH URL is never silently converted through an opaque host into a fabricated HTTPS URL.
- Preserve existing clone failure, cleanup, rollback, partial-success, human-output, and JSON-output contracts while surfacing Git's actionable failure context.
- Document the machine-local portability boundary and recommend canonical shared remotes plus Git `url.<base>.insteadOf` configuration for per-developer routing.
- Add deterministic CLI, integration, documentation, packaged-skill, and coordinated semantic checks for the supported URL forms and preservation rules.

## Capabilities

### New Capabilities

- `ssh-host-alias-remotes`: Defines accepted SSH/SCP-style remote forms, opaque-host preservation, clone protocol safety, failure boundaries, and portability guidance for `add` and `clone`.

### Modified Capabilities

- `partial-worktree-completion`: Requires ordinary remote-clone fallback to preserve configured SSH alias URLs when local worktree completion is unavailable.
- `cross-repo-command-contracts`: Requires canonical docs, generated agent-readable exports, and packaged skill guidance to agree on SSH alias support, preservation, and portability boundaries.

## Impact

- CLI implementation and tests in `repos/arashi`, especially add URL validation/parsing and clone protocol inference/application.
- Canonical add, clone, configuration, and troubleshooting guidance plus generated agent-readable exports in `repos/arashi-docs`.
- Packaged workflow guidance in `repos/arashi-skills`.
- OpenSpec deltas and the coordinated semantic checker in the meta-repository.
- No configuration-schema migration, SSH dependency, key handling, or direct SSH configuration access is introduced.
