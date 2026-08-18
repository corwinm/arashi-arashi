## Context

Managed-ignore inspection currently streams a NUL-terminated path to `git check-ignore -z -v --no-index --stdin` and parses the successful response as four NUL-delimited fields. The reported Windows failure reached the explicit malformed-payload guard and disappeared when `.gitignore` was refreshed to LF. However, native testing with Git for Windows 2.49.0 and Arashi 1.32.0 proves that an ordinary CRLF checkout produces the expected payload and initializes successfully. The implementation must therefore tolerate the observed process/output anomaly without encoding the unsupported claim that CRLF itself is invalid.

Constraints:

- Git remains the authority for ignore matching and source provenance.
- Recovery must not infer provenance by reading `.gitignore` directly because global excludes, local excludes, negation, precedence, escaping, and per-directory files are part of Git's semantics.
- A malformed successful payload is exceptional; normal no-match and nonzero Git failures retain their existing meanings.
- The change must remain internal: no CLI, config, schema, or dependency expansion.

## Goals / Non-Goals

**Goals:**

- Preserve successful managed-ignore discovery for normal LF and CRLF ignore files on all supported platforms.
- Recover from an unusable primary payload through one independent, Git-authoritative query.
- Fail closed with actionable diagnostics when neither query yields a complete provenance record.
- Make the process boundary injectable enough to test both the primary and fallback paths deterministically.

**Non-Goals:**

- Rewriting user `.gitignore` line endings or adding `.gitattributes` to consumer repositories.
- Guessing that a rule came from `.gitignore` based on file contents.
- Retrying arbitrary Git failures or changing the semantics of exit codes 0, 1, and fatal errors.
- Adding a general-purpose retry framework.

## Decisions

### Use a distinct direct-argument query as the fallback

The primary query remains stdin/NUL based. Only when it exits 0 but cannot be decoded as exactly one complete provenance record, Arashi will invoke `git check-ignore -v --no-index -- <path>` without `-z` and parse the single-path human-format response independently. Git rejects `-z` without `--stdin`, so the direct-argument fallback intentionally uses Git's documented `<source>:<line>:<pattern>\t<path>` form rather than claiming NUL output is available on that transport.

This changes both the input transport and output parser while preserving Git's matching engine. It is preferred over immediately repeating the same command because an identical retry would not isolate stdin/stream anomalies. It is also preferred over reading ignore files because only Git can resolve precedence across tracked, local, global, negated, and per-directory rules.

### Parse each transport strictly and reject delimiter ambiguity

The primary parser will require the expected source, line, pattern, path, and terminal delimiter shape for one NUL-delimited queried path. Empty source, pattern, or returned path fields, missing delimiters, or extra nonempty records are unusable.

The fallback parser will first split on the final tab, strictly decode Git's optional C-style quoting for the returned path, and require the decoded path to equal the one safe managed path supplied as the direct argument. It will then enumerate every possible `:<decimal-line>:` boundary in the prefix, strictly decode optional C-style quoting for each candidate source path, and accept the source, line, and pattern only when exactly one candidate has nonempty source and pattern fields. Valid quoting uses Git's named escapes or exact three-digit octal bytes with a leading digit from `0` through `3`, decoded as UTF-8; malformed, out-of-range, truncated, or ambiguously delimited quoting is unusable rather than guessed. The line-number field remains opaque because it is not exposed by Arashi.

Strict per-transport parsing is preferred over accepting partial fields because incomplete or ambiguous provenance could misclassify global, local, or tracked authority and trigger the wrong write/migration behavior.

### Preserve current exit-code semantics on both queries

Primary exit 1 remains “not ignored” and does not trigger fallback. Primary fatal/spawn failures remain fatal. Fallback is used only after primary exit 0 with malformed data. If fallback exits 1, exits fatally, is malformed, returns a different path, or is delimiter-ambiguous, Arashi reports a managed-ignore inspection error that identifies the primary parse failure and fallback outcome without embedding raw binary payloads.

### Inject the Git provenance runner at the inspection boundary

Tests need to produce a malformed successful primary payload reliably; filesystem line endings alone cannot reproduce it. A narrow internal runner dependency will default to the real process implementation and can be supplied by unit tests. Integration coverage will still exercise real Git with CRLF files.

## Risks / Trade-offs

- **[Risk] A second Git process adds latency in the exceptional path** → The fallback runs only after a malformed successful response, never during normal inspection.
- **[Risk] A permissive fallback could conceal a Git/process regression** → Both payloads use the same strict decoder, fallback runs once, and dual failure remains explicit.
- **[Risk] Test injection could overcomplicate the public API** → Keep the dependency internal/optional and scoped to managed-ignore inspection rather than exporting a new user-facing contract.
- **[Risk] The original machine-specific trigger remains unknown** → Record the failed reproduction honestly, retain strict diagnostics, and verify the exact recovery behavior plus native Windows CRLF behavior.

## Migration Plan

1. Add RED tests for real CRLF effective-source discovery and deterministic malformed-primary recovery/failure.
2. Introduce the strict parser and direct-argument fallback behind the existing inspection contract.
3. Run focused and complete Arashi validation on macOS.
4. Build/fetch the exact child revision on the Windows test host and run the CRLF init probe plus focused tests.
5. Rollback is a normal source revert; no persisted data or configuration migration is involved.

## Open Questions

None. The original malformed payload is not available, so the implementation deliberately targets the only proven boundary—successful but unusable Git output—without attributing it solely to CRLF.
