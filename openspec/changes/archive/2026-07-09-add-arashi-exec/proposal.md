## Why

Arashi can run configured setup hooks, but it does not provide a general-purpose way to run the same ad hoc command across a coordinated workspace. Humans and agents currently have to hand-roll loops for common tasks such as tests, validation, status inspection, or maintenance commands across all or selected managed repositories.

## What Changes

- Add an `arashi exec` CLI command that runs an arbitrary command in each selected managed repository.
- Support repository selection with standard filtering, including explicit `--only <repos>` and a `--dirty` mode that targets repositories with local changes.
- Provide clear grouped human output and aggregate exit behavior for success, partial failure, and fail-fast operation.
- Support bounded parallelism with `--jobs <n>` and `--fail-fast` for faster but controlled multi-repo execution.
- Add `--json` output with per-repository command results that follows the existing single-envelope stdout contract.
- Document the command in the CLI docs and agent-facing guidance.

## Capabilities

### New Capabilities
- `command-execution`: Defines how `arashi exec` selects repositories, runs arbitrary commands from each repository working directory, groups output, handles failures, and coordinates parallel execution.

### Modified Capabilities
- `machine-readable-cli-output`: Adds the `arashi exec --json` result contract for per-repository stdout, stderr, exit status, and aggregate failure reporting.

## Impact

- `repos/arashi`: CLI command registration, command execution core, filtering/status helpers, JSON envelope integration, and tests.
- `repos/arashi-docs`: Add command documentation and update command index/agent-readable exports if generated docs include command pages.
- `repos/arashi-skills`: Update Arashi skill guidance so agents can use `arashi exec` for safe repeated multi-repo commands.
