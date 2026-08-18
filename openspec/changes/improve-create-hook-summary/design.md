## Context

Configured create records a complete deterministic hook outcome ledger spanning workspace and selected repositories. The human renderer currently projects every record as one long line, including routine `not_found` skips and absolute script paths. The JSON projection is already complete and must remain stable. A fixed-column table would be compact only at generous widths and would degrade in redirected output or narrow terminals.

## Goals / Non-Goals

**Goals:**

- Make the overall success/skip/failure distribution visible in one line.
- Make every failure immediately identifiable by repository, hook, scope, source owner, reason, diagnostic, and file path when available.
- Keep routine successes and skips from dominating multi-repository output.
- Use a layout that remains understandable without color and when lines wrap naturally.
- Preserve the complete internal and JSON ledgers unchanged.

**Non-Goals:**

- Change hook discovery, execution, ordering, rollback, timeout, or recovery guidance.
- Change hook outcome fields or structured envelope locations.
- Redesign remove hook output in this issue.
- Add a new verbosity flag or terminal-table dependency.

## Decisions

### 1. Summarize all statuses, detail failures only

The first line will retain the `Hook results:` label and append deterministic counts in status order: succeeded, skipped, failed. Counts include every evaluated outcome. Successful and skipped outcomes receive no individual rows because their status is routine and remains available in `--json` when complete per-location inspection is needed.

Every failed outcome receives a separate detail block headed by an uppercase failure marker. Separately labelled lines print its canonical repository identity, logical hook name, scope, source kind and owner, non-`none` reason code, and public diagnostic message. Every line of a multiline diagnostic repeats the `Message:` label so diagnostic text cannot escape the block or resemble another field. File-backed failures print the absolute script path on another labelled line; inline failures identify `inline-config` but do not invent a path.

Alternatives considered:

- A fixed-column table was rejected because repository names, hook names, reasons, and paths force clipping or unstable wrapping in narrow and redirected output.
- Listing every outcome in a shorter row was rejected because routine skips would still dominate the result.
- Showing only failures without counts was rejected because users would lose the quick confirmation of what succeeded or was skipped.

### 2. Use plain text structure rather than color or width detection

The formatter will produce deterministic plain-text lines with indentation and labels. Readability will not depend on ANSI color, TTY detection, or a reported terminal width. Terminal control sequences are stripped from the human diagnostic projection without modifying the underlying outcome or JSON value. Failure identity, diagnostic, and script path remain on separate lines so a long path cannot obscure the status line; natural terminal wrapping remains understandable at narrow widths.

This is preferred over width-dependent alternate layouts because redirected output often lacks trustworthy dimensions and snapshots become environment-dependent.

### 3. Isolate formatting from execution and structured projection

A pure formatter will accept the existing `HookOutcomeRecord[]` and return lines for the human renderer. `executeCreate` will call it only on existing human paths. JSON serialization, outcome construction, fail-fast prefixes, recovery guidance, and command status remain untouched.

Tests will pin aggregate grammar, deterministic ordering of failure blocks, omission of routine per-hook rows and success script paths, complete failure attribution/diagnostics/paths, and width-independent output. Existing command-level JSON tests guard compatibility.

## Risks / Trade-offs

- Users lose per-hook success/skip names in default human output. → Preserve complete counts and direct users who need the full ledger to the existing `--json` result.
- A long failure path can still wrap. → Put it on a labelled line separate from failure identity so wrapping does not hide repository, hook, or status.
- A hidden unusual skipped reason could deserve attention. → Current skipped classifications are routine absence/disabled/not-applicable; any `hookStatus: failure` remains fully detailed, including validation and interpreter failures.
- Status-summary wording can become a compatibility surface for informal scrapers. → Keep the existing `Hook results:` label while documenting that machine consumers must use unchanged JSON.
