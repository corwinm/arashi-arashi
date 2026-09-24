## ADDED Requirements

### Requirement: Finish JSON preserves completion evidence and removal results
`aw finish --json` and `-j` SHALL use the standard `schemaVersion: 1` single-document envelope and stdout isolation, and SHALL never prompt. Success `data` and failure `error.details` after target resolution SHALL include `target`, `dryRun`, `readiness`, ordered `repositories`, ordered `nonparticipants`, `blockers`, `warnings`, `confirmations`, `cleanupPlan`, and `cleanupResult`. Readiness SHALL be `ready`, `blocked`, or `unknown`; per-repository integration SHALL be `proven`, `not-finished`, `unknown`, or `manually-confirmed`. Unavailable observations SHALL be null and paired with stable reasons rather than omitted or represented as successful zero values. `cleanupPlan` SHALL include the established removal pending operations and hook previews, or be null when no safe plan exists; `cleanupResult` SHALL preserve remove's operation/hook outcomes and partial failure details, or be null before execution. No secret-bearing remote URL, GitHub API response body, commit text, configuration/hook contents or raw environment SHALL be serialized. JSON mode SHALL not offer non-interactive manual-completion confirmation in v1. `--force` SHALL only authorize discard and normal remove confirmation, never an unknown completion conclusion.

#### Scenario: Blocked preview returns a complete report
- **WHEN** `aw finish <target> --dry-run --json` finds dirty, unknown and unavailable repositories
- **THEN** stdout contains one `ok: true`, `command: "finish"` preview envelope with the entire ordered report and no executed cleanup result
- **AND** exit code is zero because preview completed, not because cleanup is ready

#### Scenario: Missing manual confirmation in JSON mutation
- **WHEN** JSON mutation encounters completion evidence requiring a human judgment, even with `--force`
- **THEN** stdout contains one `ok: false` envelope with a stable confirmation-required code and the complete assessment in `error.details`
- **AND** no cleanup mutation occurs and the process exits `2`

#### Scenario: Revalidation or remove fails
- **WHEN** a previously accepted assessment becomes stale after hooks or removal partially fails
- **THEN** stdout contains one `ok: false` finish envelope preserving the assessment, hook outcomes and available remove ledger
- **AND** process exit code is `1` without a second remove envelope

#### Scenario: Inspection order changes
- **WHEN** asynchronous repository inspections finish in different orders under equivalent snapshots
- **THEN** repository, reason, warning and operation arrays retain deterministic order
- **AND** stdout never contains human output or a prompt
