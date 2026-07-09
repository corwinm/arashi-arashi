## ADDED Requirements

### Requirement: Remove dry-run JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi remove --dry-run --json` that describe a non-mutating removal plan in the standard JSON envelope.

#### Scenario: Dry-run remove JSON succeeds
- **WHEN** a user runs `arashi remove <target> --dry-run --json`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "remove"`
- **AND** the data object identifies the invocation as dry-run preview mode
- **AND** the data object includes planned worktree removals, planned branch deletions, skipped main worktrees, missing branches, blockers or dirty details, hook preview context, effective options, and totals
- **AND** no human-readable preview text is mixed into stdout

#### Scenario: Dry-run remove JSON requires explicit target
- **WHEN** a user runs `arashi remove --dry-run --json` without a target and interactive selection would be required
- **THEN** stdout contains exactly one valid JSON error envelope
- **AND** the error explains that an explicit target is required for JSON mode
- **AND** no prompt is shown

#### Scenario: Dry-run remove JSON reports no-op keep flags
- **WHEN** a user runs `arashi remove <target> --dry-run --json --keep-worktrees --keep-branches`
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true`
- **AND** the plan totals show zero planned worktree removals and zero planned branch deletions
- **AND** the effective options show both keep flags were supplied

#### Scenario: Dry-run remove JSON is non-mutating
- **WHEN** a user runs `arashi remove <target> --dry-run --json`
- **THEN** the JSON plan describes pending operations only
- **AND** no operation in the plan is reported as successfully executed
- **AND** worktrees, branches, and hooks remain unmodified by the preview
