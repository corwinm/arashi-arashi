## Why

Arashi's command surface is now large enough that users of its supported shells must repeatedly consult `--help` to discover commands, options, aliases, and accepted values. The existing Bash, Zsh, and Fish integration only installs the parent-shell wrapper, leaving native tab completion absent and allowing completion guidance to drift from the Commander-derived CLI contract.

## What Changes

- Add `arashi completion <bash|zsh|fish>` to emit deterministic, sourceable native completion code and a narrow internal read-only query for bounded workspace-aware candidates.
- Derive commands, subcommands, options, aliases, arguments, descriptions, choices, conflicts, and dynamic-candidate policy from the canonical Commander program and typed command contract rather than a handwritten inventory.
- Extend `arashi shell install` to activate completion in the same idempotent managed block as the existing wrapper while keeping `arashi shell init <shell>` wrapper-only.
- Generate and drift-check embedded shell artifacts so npm and standalone-binary distributions expose identical completion behavior.
- Add real-shell smoke and behavior coverage for Bash, Zsh, and Fish, including direct executable and installed-wrapper use, static completion outside a workspace, safe dynamic candidates inside a workspace, stdout isolation, and non-mutation.
- Update README, canonical shell/command documentation, generated agent-facing exports, packaged skill guidance, and cross-repository semantic checks together.

## Capabilities

### New Capabilities

- `shell-completions`: Defines the public completion command, canonical metadata model, native shell behavior, dynamic candidate protocol, distribution parity, safety, performance, and real-shell verification contract.

### Modified Capabilities

- `shell-integration`: Extends managed installation so each supported shell activates completion separately from the existing wrapper, idempotently and without changing parent-shell switching behavior.
- `cross-repo-command-contracts`: Extends canonical command metadata and coordinated drift validation to cover completion policy and synchronized completion guidance/artifacts.

## Impact

- CLI command registration, shell integration and release-installer block generation, completion metadata/rendering/query code, generated artifacts, tests, build/package verification, and the generated command contract in `repos/arashi`.
- Shell command documentation and agent-readable exports in `repos/arashi-docs`, plus packaged guidance in `repos/arashi-skills`.
- OpenSpec artifacts and the authoritative cross-repository semantic checker/workflow in the meta-repository.
- No configuration-schema migration, network dependency, or breaking command removal is introduced.
