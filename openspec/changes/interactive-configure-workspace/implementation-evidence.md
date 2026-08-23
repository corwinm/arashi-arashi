# Implementation evidence

## Exact child merge revisions

The coordinated child pull requests were squash-merged and the final parent verification used these exact `main` revisions:

- CLI: `corwinm/arashi#157` — `fefa426850ad819ae72c1d2a2274586646512fa9`
- Docs: `corwinm/arashi-docs#89` — `b2e24458149132be402a7764e7e1106d6ac26966`
- Skills: `corwinm/arashi-skills#69` — `5aeb0b6e50dcabf9bace11b16bf72c9b0bbeee45`
- VS Code: `corwinm/arashi-vscode#36` — `156df9f5456c7712a36aec599a2c33aa9b26f9eb`

## Child verification

- CLI: strict focused TDD covered the final ownership, symlink-target, rollback-reporting, and root remove-hook composability corrections. The final local suite passed 2,514 tests with 16 skipped; lint, typecheck, formatting, command-contract, completion, build, and whitespace gates passed. Exact-head review found no actionable regression. All current-head Linux, macOS, and Windows CI checks passed. One unrelated managed-ignore `EPIPE` failure was rerun successfully.
- Docs: current-head docs validation and deploy checks passed; expected publish was skipped and non-gating Netlify informational contexts were neutral.
- Skills: the current-head security gate passed.
- VS Code: current-head lint/test/build and Linux, macOS, and Windows smoke checks passed.

## Parent verification

The refreshed child set first reproduced two parent contract failures because the meta checker still treated the configuration workflow page as the canonical `configure` command owner. The current docs child correctly provides the dedicated `docs/commands/configure.md` page and `/commands/configure/` index route. The bounded parent correction removed that obsolete special case; the two focused RED cases then passed.

At the final parent candidate:

- all 8 test files and 437 tests passed, including focused red/green coverage for the final review corrections;
- typecheck and formatting passed;
- all 6 registered cross-repository contract checkers passed;
- the canonical 28-member skill archive verified, extracted-package guidance passed 17/17 checks, and temporary archive/extraction artifacts were removed;
- strict OpenSpec validation and `git diff --check` passed;
- exact-head review corrections reject both extra body-bearing views hidden in configure guidance and contradictory generic JSON/standalone classifications.

Closeout requires a current-head CI read-back and no unresolved review threads; those remote checks do not alter this committed evidence.

No merge, auto-merge, archive, or force-push was performed while preparing this evidence.
