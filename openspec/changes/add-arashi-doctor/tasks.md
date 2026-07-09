## 1. CLI Diagnostic Foundation

- [ ] 1.1 Add `arashi doctor` command registration, help text, and option parsing with `--json` support.
- [ ] 1.2 Define shared doctor finding types with stable `code`, `severity`, `category`, `scope`, `message`, optional `details`, and `suggestedCommands` fields.
- [ ] 1.3 Implement a non-mutating doctor runner that discovers the workspace root, loads configuration, collects independent diagnostic phases, and summarizes severity counts.
- [ ] 1.4 Implement human output grouped by severity or category with clear blocking/warning/info labels and suggested commands.
- [ ] 1.5 Implement JSON success and failure envelopes for `doctor --json` with stdout isolation and non-zero exit for blocking findings.

## 2. Workspace and Repository Checks

- [ ] 2.1 Report missing, malformed, unreadable, or invalid `.arashi/config.json` as blocking configuration findings.
- [ ] 2.2 Reuse or extract status helpers to collect configured repository presence, Git status, branch tracking, detached-head, upstream divergence, missing remote-ref, and default-branch drift diagnostics.
- [ ] 2.3 Report missing child repositories with clone-oriented suggested commands.
- [ ] 2.4 Report dirty repositories with summarized staged/unstaged/untracked counts and status-inspection suggestions.
- [ ] 2.5 Ensure repository status failures become blocking findings while independent repositories/checks still run when safe.

## 3. Worktree, Hook, Shell, and Install Checks

- [ ] 3.1 Reuse stale worktree discovery from prune/remove helpers and report prunable metadata without running `git worktree prune`.
- [ ] 3.2 Add hook validation diagnostics for missing hook files, non-executable hook files, and unsafe or unsupported hook definitions.
- [ ] 3.3 Add conservative shell-integration hints that never fail the command when integration status is unknown.
- [ ] 3.4 Add conservative install/update channel hints only when they can be detected safely without modifying environment state.

## 4. Tests

- [ ] 4.1 Add healthy-workspace tests for human and JSON `doctor` output.
- [ ] 4.2 Add invalid-config and outside-workspace tests covering blocking findings and exit codes.
- [ ] 4.3 Add missing-repository, dirty-repository, detached/untracked/diverged branch, and default-branch drift tests.
- [ ] 4.4 Add stale worktree metadata tests proving doctor reports prunable records without pruning them.
- [ ] 4.5 Add hook diagnostics tests for missing, non-executable, and invalid hook configurations.
- [ ] 4.6 Add stdout-isolation tests proving `doctor --json` emits exactly one JSON document with no human progress text.

## 5. Documentation and Agent Guidance

- [ ] 5.1 Add an `arashi doctor` command page to `repos/arashi-docs` and include options, examples, exit behavior, finding severities, and JSON shape.
- [ ] 5.2 Update troubleshooting or agent workflow docs to recommend `arashi doctor` as the safe first diagnostic command.
- [ ] 5.3 Update `repos/arashi-skills` guidance to prefer `arashi doctor --json` when agents need structured workspace health diagnostics.
- [ ] 5.4 Update generated agent-readable docs/exports if the docs build requires committed generated route changes.

## 6. Validation and PR Choreography

- [ ] 6.1 Validate `repos/arashi` with `bun run lint`, `bun run test`, and `bun run build`.
- [ ] 6.2 Validate `repos/arashi-docs` with `bun run validate` and smoke-check the generated command/agent-readable routes for doctor content.
- [ ] 6.3 Validate `repos/arashi-skills` with its repository checks or a focused content smoke check.
- [ ] 6.4 Open cross-linked implementation PRs for affected child repositories and update the meta/OpenSpec PR body with final related PR links before merge.
