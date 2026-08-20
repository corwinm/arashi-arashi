## Why

`arashi create` currently prints every evaluated lifecycle-hook location as a dense line containing source, owner, hook, repository, status, reason, and often an absolute script path. Multi-repository runs therefore bury the outcomes that need attention beneath routine successes and missing-hook skips.

## What Changes

- Replace the human create hook ledger with one aggregate status line counting succeeded, skipped, and failed outcomes.
- Collapse routine successes and skips into those counts while printing a compact, vertically structured detail block for every failure.
- Keep failure repository, hook, scope, source owner, classification, diagnostic message, and file-backed script path visible without placing them on one width-sensitive table row.
- Preserve the complete structured `--json` hook outcome schema, ordering, and success/failure envelope locations unchanged.
- Add focused formatter and command-level coverage for success-only, skip-only, mixed, timeout/validation/nonzero failure, long-path, narrow-output, and exact JSON compatibility cases.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `lifecycle-hook-contracts`: Define concise, failure-first human rendering for the complete configured-create hook outcome ledger while preserving structured results.

## Impact

- Meta repository: OpenSpec proposal, design, tasks, and lifecycle-hook contract delta.
- CLI repository: configured-create human output formatting and focused unit/integration tests.
- Documentation and skill references: distinguish concise configured-create human summaries from the complete JSON outcome ledger.
- JSON consumers, hook execution, hook outcome data, ordering, exit status, rollback, and other commands remain unchanged.
