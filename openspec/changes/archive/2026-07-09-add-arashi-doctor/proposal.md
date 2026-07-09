## Why

Workspace health problems are currently diagnosed through a mix of `status`, `clone`, `prune`, `shell`, `setup`, docs troubleshooting, and ad hoc Git inspection. A dedicated non-mutating `arashi doctor` command would give humans and agents one safe entry point for understanding what is wrong and which Arashi command to run next.

## What Changes

- Add an `arashi doctor` CLI command that inspects the current Arashi workspace without mutating repository, worktree, hook, shell, or install state.
- Report diagnostic findings with stable codes, severity, affected repository or workspace scope, explanatory messages, and suggested fix commands where practical.
- Group human output by severity or category so blocking issues, warnings, and informational hints are easy to scan.
- Support `arashi doctor --json` using the existing single-envelope stdout contract for automation and agents.
- Define exit behavior: success when there are no blocking health failures; non-zero when one or more blocking findings are present or the command cannot complete required checks.
- Document the command and update agent/skill guidance so troubleshooting flows can prefer `doctor` before lower-level commands.

## Capabilities

### New Capabilities

- `workspace-health-diagnostics`: Defines non-mutating Arashi workspace health diagnostics, finding shape, severity handling, exit codes, and JSON/human output expectations for `arashi doctor`.

### Modified Capabilities

- `machine-readable-cli-output`: Add `doctor --json` to the set of automation-relevant commands that must obey the structured JSON envelope and stdout-isolation contract.

## Impact

- `repos/arashi`: CLI command registration, workspace/config/status/worktree/hook/shell/install diagnostic helpers, JSON envelope output, and integration/unit tests.
- `repos/arashi-docs`: Command documentation and troubleshooting/agent workflow references for `arashi doctor`.
- `repos/arashi-skills`: Agent guidance updates so future agents can use `arashi doctor` for safe diagnostics.
- No breaking changes; the command is additive and non-mutating by default.
