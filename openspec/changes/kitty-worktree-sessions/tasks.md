## 1. Establish CLI RED coverage

- [x] 1.1 Install the CLI child worktree dependencies with the pinned package manager without mutating either the child or meta lockfile, then add focused failing tests for inherited-PATH/macOS-bundle `kitten` resolution, version parsing, 0.43 minimum enforcement, realpath/platform-normalized canonical-path SHA-256 identity, readable labels, stale readable-metadata reuse, and narrow structured-state projection that excludes full environment data.
- [x] 1.2 Add failing launcher tests for trimmed non-empty Kitty detection, whitespace/similar-TERM rejection, detection-before-support-preflight behavior, fail-closed unsupported selected Kitty, `kitty` result mode, and automatic precedence across explicit/configured launchers, nested tmux, Herdr, cmux, supported IDEs, Kitty, contextual `cd`, and generic terminal/platform fallback.
- [x] 1.3 Add failing managed-launch tests for exact existing-window discovery/focus/revalidation and no-match `kitten @ launch` argv, including spaces, quotes, regex characters, and shell-significant path/label values.
- [x] 1.4 Add failing validation/error tests for missing `kitten`, unsupported/malformed versions, denied or unreachable remote control, malformed `ls` JSON/fields, malformed launch IDs, inconsistent returned window state, and focus/launch process failures with no fallback.
- [x] 1.5 Add failing race tests for atomic cross-process identity locking, bounded wait, live-owner non-stealing, dead/malformed stale recovery, ownership-safe `finally` release, close-between-query-and-focus retry, concurrent no-match launch serialization, duplicate-state failure, and no automatic Kitty window cleanup.
- [x] 1.6 Add failing switch and configured/standalone create integration tests proving ordinary reuse, shared post-create behavior, `mode: "kitty"`, named-launcher precedence, JSON restrictions, and preservation/reporting of created worktrees after Kitty launch failure.

## 2. Implement managed Kitty sessions

- [x] 2.1 Implement narrow Kitty version/state models, canonical identity and readable-label helpers, safe diagnostic projection, and first-class `kitty` launch result typing until the focused RED tests pass.
- [x] 2.2 Implement strict positive Kitty detection and insert managed Kitty at the specified automatic precedence point without changing explicit/configured mode vocabularies or unrelated terminal fallbacks.
- [x] 2.3 Implement the bounded cross-process lock plus inspect/focus/create/validate state machine with distinct argv values, exact marker matching, returned-ID validation, one close-race retry, conservative stale-lock recovery, and duplicate-state failure without window cleanup.
- [x] 2.4 Route `arashi switch` and automatic post-create launch through the shared Kitty path, preserving fail-closed managed errors and non-transactional post-create partial success.
- [x] 2.5 Refactor only after focused tests are green, then rerun all affected launcher, switch, create, JSON, precedence, and generated-contract CLI tests.

## 3. Establish companion-contract RED coverage

- [x] 3.1 Add failing meta-repository semantic-checker tests/fixtures for Kitty 0.43+, remote-control prerequisites, exact reuse, precedence, live-only persistence, fail-closed behavior, auto-detected-only scope, and remove-time non-ownership.
- [x] 3.2 Review the source-derived CLI contract and add failing freshness/semantic tests before changing generated artifacts only if the new launch result mode changes a serialized contract surface.
- [x] 3.3 Add or update failing docs and packaged-skill source/package tests so a deliberate Kitty semantic mismatch is rejected from an out-of-repository fixture.

## 4. Update canonical guidance and enforcement

- [x] 4.1 Update canonical CLI and documentation pages for switch/create Kitty workflow, minimum version, safe remote-control setup, reuse, live-only sessions, troubleshooting, and manual window cleanup; regenerate agent-readable exports.
- [x] 4.2 Update Arashi skill source and packaged guidance with the same Kitty contract, regenerate packaged artifacts, and keep maintainer-only semantic manifests outside installable skill directories.
- [x] 4.3 Extend the meta semantic checker and CI/local workflow to compare normalized Kitty semantics across CLI-owned contract evidence, canonical docs/exports, and packaged skills until controlled mismatch tests fail and aligned fixtures pass.
- [x] 4.4 Review VS Code launch-result consumers and record no change when they do not expose Kitty mode; if a real serialized consumer is found, add RED coverage before updating it.

## 5. Verify the completed change

- [ ] 5.1 Run focused and complete CLI format, lint, typecheck/test, build, generated-contract freshness, and package checks after the final CLI source edit.
- [x] 5.2 Run docs formatting, tests, build, link/export freshness, and rendered workflow/troubleshooting verification after the final docs edit.
- [x] 5.3 Run skills source/package tests and inspect the extracted package file list after the final skills edit.
- [x] 5.4 Run the meta-repository cross-contract checker, deliberate-mismatch fixture, strict OpenSpec validation, and `git diff --check` after the final contract edit.
- [x] 5.5 Exercise the built CLI against a disposable Kitty 0.48.1 socket-only instance to verify create, exact structured state, repeat reuse/focus without a duplicate, and denied-remote-control diagnostics without exposing Kitty environment values or modifying persistent Kitty config/session files.
- [x] 5.6 Verify every affected coordinated child status, commit each repository separately, and prepare child PRs with non-closing issue references while leaving archive/closing ownership to the final meta PR.
