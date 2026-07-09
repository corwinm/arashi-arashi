## Context

Arashi already knows the repositories that belong to a coordinated workspace, can filter selected repositories for commands such as `setup`, `pull`, and `sync`, and has a JSON envelope contract for automation-safe command output. The missing piece is a general ad hoc runner for common operations that are not baked into Arashi itself.

`arashi exec` needs to be useful for humans in a terminal and for agents in automation. That means it must preserve command argument passthrough after `--`, run from the right working directory, make per-repository output understandable, and avoid mixing human output into JSON mode.

## Goals / Non-Goals

**Goals:**

- Run an arbitrary command once per selected managed repository with that repository as the working directory.
- Reuse existing repository configuration and filtering conventions where possible.
- Provide deterministic aggregate exit status and per-repository failure reporting.
- Support serial execution by default and bounded parallel execution when requested.
- Provide `--json` results that are parseable as a single stdout document.
- Document safe examples for tests, validation, status inspection, and dirty-repo workflows.

**Non-Goals:**

- Replace shell scripting, task runners, or package-manager workspaces.
- Stream a single combined interactive TTY to all repositories.
- Provide remote execution, long-running daemon supervision, or cross-repository dependency scheduling.
- Interpret shell syntax itself; callers remain responsible for choosing shell wrappers when they need shell features.

## Decisions

### Command invocation requires `--` before the child command

`arashi exec` will treat tokens after `--` as the child command and arguments. This keeps Arashi options separate from child command options and prevents flags such as `--json`, `--only`, or `--jobs` from being confused with the command being executed.

Alternative considered: accept the first positional argument as the child command without `--`. That is more concise, but it creates ambiguous parsing for commands with their own flags and is less safe for automation.

### Run from repository working directories, not the meta root

For each selected repository, Arashi will spawn the child command with `cwd` set to that repository's resolved path. This matches the common use cases in the issue (`git status`, `bun run test`, `bun run validate`) and avoids forcing users to write path-aware commands.

Alternative considered: run from the workspace root while passing repository paths as arguments. That would be less surprising for workspace-level scripts but does not meet the requested per-repository command-runner behavior.

### Group human output by repository and summarize results

Human mode will clearly delimit each repository's command output and report a final summary. Serial execution can print one group at a time. Parallel execution should still keep repository output grouped rather than interleaving raw stdout/stderr lines from multiple child processes.

Alternative considered: stream child stdout/stderr directly as processes run. That offers lower latency but becomes unreadable under `--jobs` and makes it hard to tell which repository produced a line.

### JSON mode captures per-repository stdout/stderr

`--json` will suppress grouped human output and emit one envelope whose data includes selected repositories, command argv, execution options, per-repository stdout, stderr, exit code, duration, and status. The process exit code remains non-zero when any selected repository fails.

Alternative considered: stream JSON lines per repository. That would be useful for very large output, but it would violate Arashi's existing single-document JSON stdout contract.

### Default to serial execution with bounded parallelism opt-in

The command will run serially by default. `--jobs <n>` enables bounded concurrency with a positive integer limit. `--fail-fast` stops scheduling additional repositories after the first failure; already-running jobs may finish and be reported.

Alternative considered: parallel by default. That would be faster but less predictable for commands that use shared resources, print large output, or mutate repository state.

## Risks / Trade-offs

- Child commands can produce very large output → Capture output per repository and document that `--json` includes captured stdout/stderr; implementation can choose a documented compact/truncation strategy if necessary.
- Commands may require an interactive TTY → Treat `arashi exec` as non-interactive command spawning and document that interactive fan-out is out of scope.
- `--dirty` requires status checks before execution → Reuse existing git status helpers where possible and surface status-check failures as repository selection errors rather than silently skipping repositories.
- Fail-fast with parallel jobs cannot cancel already-running work cleanly in every case → Define fail-fast as stopping new scheduling while reporting already-started jobs.
