# Implementation evidence

## Exact child revisions

The coordinated child pull requests are open, cleanly mergeable, and verified at these exact heads:

- CLI: `corwinm/arashi#157` — `000096585c8d19d060a238ca2a2603e24286cc03`
- Docs: `corwinm/arashi-docs#89` — `6f8721b6c072b5064aa7c065618a0b874a39a5c7`
- Skills: `corwinm/arashi-skills#69` — `7c7cedaae13348e2e4b889f99c293a56913d0c61`
- VS Code: `corwinm/arashi-vscode#36` — `5b0a3d7cae1a7040d0aa1cf79a7fa70d41c6beae`

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
