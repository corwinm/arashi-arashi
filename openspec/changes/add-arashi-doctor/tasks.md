## 1. CLI Diagnostic Foundation

- [x] 1.1 Add `arashi doctor` command registration, help text, and option parsing with `--json` support.
- [x] 1.2 Define shared doctor finding types with stable `code`, `severity`, `category`, `scope`, `message`, optional `details`, and `suggestedCommands` fields.
- [x] 1.3 Implement a non-mutating doctor runner that discovers the workspace root, loads configuration, collects independent diagnostic phases, and summarizes severity counts.
- [x] 1.4 Implement human output grouped by severity or category with clear blocking/warning/info labels and suggested commands.
- [x] 1.5 Implement JSON success and failure envelopes for `doctor --json` with stdout isolation and non-zero exit for blocking findings.

## 2. Workspace and Repository Checks

- [x] 2.1 Report missing, malformed, unreadable, or invalid `.arashi/config.json` as blocking configuration findings.
- [x] 2.2 Reuse or extract status helpers to collect configured repository presence, Git status, branch tracking, detached-head, upstream divergence, missing remote-ref, and default-branch drift diagnostics.
- [x] 2.3 Report missing child repositories with clone-oriented suggested commands.
- [x] 2.4 Report dirty repositories with summarized staged/unstaged/untracked counts and status-inspection suggestions.
- [x] 2.5 Ensure repository status failures become blocking findings while independent repositories/checks still run when safe.

## 3. Worktree, Hook, Shell, and Install Checks

- [x] 3.1 Reuse stale worktree discovery from prune/remove helpers and report prunable metadata without running `git worktree prune`.
- [x] 3.2 Add hook validation diagnostics for missing hook files, non-executable hook files, and unsafe or unsupported hook definitions.
- [x] 3.3 Add conservative shell-integration hints that never fail the command when integration status is unknown.
- [x] 3.4 Add conservative install/update channel hints only when they can be detected safely without modifying environment state.

## 4. Tests

- [x] 4.1 Add healthy-workspace tests for human and JSON `doctor` output.
- [x] 4.2 Add invalid-config and outside-workspace tests covering blocking findings and exit codes.
- [x] 4.3 Add missing-repository, dirty-repository, detached/untracked/diverged branch, and default-branch drift tests.
- [x] 4.4 Add stale worktree metadata tests proving doctor reports prunable records without pruning them.
- [x] 4.5 Add hook diagnostics tests for missing, non-executable, and invalid hook configurations.
- [x] 4.6 Add stdout-isolation tests proving `doctor --json` emits exactly one JSON document with no human progress text.

## 5. Documentation and Agent Guidance

- [x] 5.1 Add an `arashi doctor` command page to `repos/arashi-docs` and include options, examples, exit behavior, finding severities, and JSON shape.
- [x] 5.2 Update troubleshooting or agent workflow docs to recommend `arashi doctor` as the safe first diagnostic command.
- [x] 5.3 Update `repos/arashi-skills` guidance to prefer `arashi doctor --json` when agents need structured workspace health diagnostics.
- [x] 5.4 Update generated agent-readable docs/exports if the docs build requires committed generated route changes.

## 6. Validation and PR Choreography

- [x] 6.1 Validate `repos/arashi` with `bun run lint`, `bun run test`, and `bun run build`.
- [x] 6.2 Validate `repos/arashi-docs` with `bun run validate` and smoke-check the generated command/agent-readable routes for doctor content.
- [x] 6.3 Validate `repos/arashi-skills` with its repository checks or a focused content smoke check.
- [x] 6.4 Open cross-linked implementation PRs for affected child repositories and update the meta/OpenSpec PR body with final related PR links before merge.
