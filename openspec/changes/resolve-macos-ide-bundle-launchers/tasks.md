## 1. Pre-implementation evidence

- [x] 1.1 Verify and record authoritative macOS bundled-CLI layouts for each supported IDE; retain PATH-only behavior for any editor whose official layout cannot be established.
- [x] 1.2 Add focused RED unit tests for PATH precedence, verified `/Applications` and per-user `Applications` candidates, missing home/candidates, spaces in executable and worktree paths, and platform isolation.
- [x] 1.3 Add RED explicit-switch tests proving configured and zero-config invocations use a resolved bundled target when PATH lookup fails, preserve `IDE_NOT_FOUND` when unresolved, and do not fall back after resolved-launch failure.

## 2. CLI implementation

- [x] 2.1 Introduce the injected IDE launcher-target resolver and verified macOS bundle candidate mappings in `repos/arashi`.
- [x] 2.2 Carry the resolved executable target through preflight and launch command construction without changing CLI options, configuration, JSON envelopes, or generated option policy.
- [x] 2.3 Preserve canonical PATH command precedence, argv-safe `--new-window` invocation, explicit IDE authority, existing error codes, and no-fallback behavior.

## 3. Verification and delivery

- [x] 3.1 Run focused switch launcher and configured/zero-config integration tests after the final source edit.
- [x] 3.2 Build the real CLI and perform a macOS acceptance switch with the canonical IDE command removed from PATH, verifying the requested installed app-bundle launcher opens the exact selected worktree.
- [x] 3.3 Run the complete `repos/arashi` format check, lint, typecheck, test, build, schema check, generated command-contract check, and `git diff --check` gates.
- [x] 3.4 Confirm companion extension/docs/skills contracts require no changes, then open the child implementation PR linked to project issue #259 and verify exact-head CI.
- [ ] 3.5 After implementation approval and green child delivery, complete OpenSpec task evidence and prepare the change for archive/sync in the still-open meta proposal PR.
