## MODIFIED Requirements

### Requirement: Configured create reports a complete hook outcome ledger
Configured create SHALL record workspace and repository-specific hook skips, successes, validation failures, timeouts, and nonzero exits in one deterministic outcome ledger used by human and JSON results. Human output SHALL render one aggregate count line in succeeded, skipped, and failed order; SHALL collapse routine success and skipped records into those counts; and SHALL render every failed record as a plain-text detail block that identifies its canonical repository, logical hook, scope, source kind and owner, reason classification, available non-stream diagnostic message, and file-backed script path when present. Failure identity, attribution, diagnostics, and paths SHALL use separate labelled lines; every line of a multiline diagnostic SHALL repeat its message label; and terminal control sequences SHALL be removed from the human diagnostic projection, so readability does not depend on ANSI color, TTY detection, trustworthy terminal dimensions, or a fixed-column table. Raw hook stdout and stderr SHALL remain on their original streams and SHALL NOT be duplicated into the summary stream. Structured output SHALL preserve the complete ledger, field schema, values, ordering, and success/failure envelope locations unchanged.

#### Scenario: Workspace and repository hooks succeed
- **WHEN** configured create runs active workspace and repository-specific hooks successfully
- **THEN** its human result reports complete succeeded, skipped, and failed counts in one line
- **AND** routine success and skipped locations do not receive individual human rows
- **AND** its structured result includes an ordered outcome for every evaluated hook location

#### Scenario: Mixed outcomes contain failures
- **WHEN** configured create records routine success or skip outcomes followed by one or more validation, interpreter, timeout, or nonzero failures
- **THEN** the human summary counts every evaluated outcome exactly once
- **AND** every failed outcome has a detail block identifying repository, hook, scope, source kind and owner, reason, and available diagnostic
- **AND** a file-backed failed outcome includes its script path while routine outcomes do not print script paths
- **AND** nonzero hook stdout and stderr remain on their original streams instead of being duplicated into the summary block
- **AND** recovery guidance is derived from the same complete ledger

#### Scenario: Failure details render in narrow or redirected output
- **WHEN** a failed outcome has long repository, hook, diagnostic, or script-path values and human output is redirected or displayed in a narrow terminal
- **THEN** repository, hook, scope, source owner, status, diagnostic, and path remain separately identifiable without color or table-column alignment
- **AND** every line of a multiline diagnostic remains inside the failure block under a repeated message label
- **AND** natural wrapping of a diagnostic or path cannot obscure the failure identity line

#### Scenario: Structured create output remains compatible
- **WHEN** configured create runs with `--json` after the human summary change
- **THEN** success `data.hookOutcomes` and failure `error.details.hookOutcomes` retain their existing complete records, fields, values, and deterministic order
- **AND** no human summary text is mixed into JSON stdout
