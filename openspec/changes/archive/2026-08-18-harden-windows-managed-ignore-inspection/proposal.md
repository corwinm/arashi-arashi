## Why

A reported Windows workspace could not complete `arashi init` because managed-ignore provenance inspection rejected a successful but malformed `git check-ignore` payload; converting the checked-out `.gitignore` from CRLF to LF avoided the failure. A controlled Windows reproduction confirms ordinary CRLF is valid, so Arashi needs a bounded recovery path that preserves Git-authoritative provenance without treating line-ending normalization as a user prerequisite.

## What Changes

- Keep the NUL-delimited `git check-ignore` query as the primary managed-ignore provenance path.
- If Git exits successfully but the primary payload cannot be parsed, retry through a separate Git invocation whose output is parsed independently.
- Accept recovered provenance only when the fallback returns a complete, unambiguous source record; otherwise fail closed with diagnostics that identify both unusable payloads.
- Add regression coverage for CRLF `.gitignore` checkouts, malformed primary output recovery, and malformed fallback failure.
- Verify the behavior with a native Windows probe in addition to the Arashi package quality gates.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `managed-git-ignore-reconciliation`: Clarify cross-platform effective-ignore provenance handling and bounded recovery when a successful Git query returns an unusable primary payload.

## Impact

- Affected implementation: `repos/arashi/src/lib/managed-ignore.ts` and its Git process boundary.
- Affected tests: managed-ignore unit/integration coverage, including Windows/CRLF behavior.
- No new CLI flags, configuration keys, schema fields, dependencies, or documented user workflow are introduced.
