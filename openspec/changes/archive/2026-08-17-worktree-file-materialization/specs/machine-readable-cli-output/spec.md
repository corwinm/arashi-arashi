## ADDED Requirements

### Requirement: Configured create JSON reports repository materialization outcomes
Configured `create --json` success, dry-run, and failure envelopes SHALL expose ordered per-repository materialization outcomes without changing the existing envelope schema version or stdout-isolation contract. Executed records at `data.repositoryResults[].materializationOutcomes`, or at `error.details.repositoryResults[].materializationOutcomes` on failure, SHALL contain `action`, normalized repository-relative `path`, `status`, `reasonCode`, and bounded `message`; status SHALL be `copied`, `linked`, `skipped`, `failed`, or `rolled-back`. Dry-run records SHALL appear at `data.dryRunOutcome.materializationPlans[]` as `{ repositoryId, outcomes }`, with outcome status `would-copy`, `would-link`, `skipped`, or `blocked`, and MUST NOT populate executed repository results. `reasonCode` SHALL be one of `none`, `source_missing`, `source_checkout_unavailable`, `source_inspection_failed`, `source_link_broken`, `source_escape`, `source_cycle`, `destination_exists`, `destination_ancestor_unsafe`, `destination_inspection_failed`, `symlink_unsupported`, `copy_failed`, `symlink_failed`, `rolled_back`, or `rollback_failed`. Failed-command details SHALL preserve the existing command-wide rollback summary independently and SHALL add `materializationRollback: { attempted, complete, failureCount, failures }` for materialization cleanup only; each materialization failure entry SHALL identify `repositoryId`, `action`, `path`, `reasonCode: "rollback_failed"`, and bounded `message`. Branch, worktree, and generic directory rollback failures remain in the existing command-wide rollback shape and MUST NOT be forced to invent materialization fields.

#### Scenario: JSON create succeeds with materialization
- **WHEN** configured create copies, links, or skips declared paths and otherwise succeeds with `--json`
- **THEN** stdout contains exactly one `ok: true`, `command: "create"` envelope
- **AND** each repository result contains its outcomes in copy-then-symlink declaration order

#### Scenario: Actionable JSON dry-run previews materialization
- **WHEN** configured create runs with `--dry-run --json` and no materialization blocker exists
- **THEN** stdout contains one `ok: true` envelope, the process exits zero, and ordered plans appear at `data.dryRunOutcome.materializationPlans`
- **AND** no record falsely claims a file was copied or link was created
- **AND** each plan status is exactly `would-copy`, `would-link`, or `skipped`
- **AND** no hook, Git, managed-ignore, directory, file, or link mutation occurs

#### Scenario: Blocked JSON dry-run reports an error plan
- **WHEN** configured create runs with `--dry-run --json` and one or more materialization outcomes are `blocked`
- **THEN** stdout contains one `ok: false` envelope with `error.code: "MATERIALIZATION_PLAN_BLOCKED"` and the process exits nonzero
- **AND** ordered plans appear at `error.details.dryRunOutcome.materializationPlans` with at least one `blocked` status
- **AND** executed `repositoryResults` and `materializationOutcomes` are absent

#### Scenario: JSON materialization fails
- **WHEN** a destination conflict, path-containment problem, source-checkout failure, copy failure, or symlink capability failure blocks create
- **THEN** stdout contains exactly one structured failure envelope
- **AND** `error.details.repositoryResults` preserves affected and previously completed repository results with their materialization ledgers
- **AND** `error.details.materializationRollback` reports whether materialization cleanup was attempted, complete, and which bounded materialization cleanup failures remain
- **AND** existing command-wide rollback details retain branch/worktree/directory cleanup failures without invented action/path fields

#### Scenario: Later lifecycle failure rolls materialization back
- **WHEN** materialization succeeds but a later create hook or repository operation fails and rollback removes owned destinations
- **THEN** the failure envelope reports confirmed removed outcomes as `rolled-back`
- **AND** uses `rolled_back` for confirmed cleanup and `rollback_failed` plus `materializationRollback.complete: false` for incomplete materialization cleanup

#### Scenario: Materialization output protects contents
- **WHEN** human or JSON output reports a configured source or destination
- **THEN** it includes only bounded repository identity, action, relative path, status, and diagnostics
- **AND** includes no file contents, hashes, environment values, or copied data
