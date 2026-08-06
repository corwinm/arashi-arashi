## 1. Pre-implementation evidence

- [ ] 1.1 Verify and record authoritative macOS bundled-CLI layouts for each supported IDE; retain PATH-only behavior for any editor whose official layout cannot be established.
- [ ] 1.2 Add focused RED unit tests for PATH precedence, verified `/Applications` and per-user `Applications` candidates, missing home/candidates, spaces in executable and worktree paths, and platform isolation.
- [ ] 1.3 Add RED explicit-switch tests proving configured and zero-config invocations use a resolved bundled target when PATH lookup fails, preserve `IDE_NOT_FOUND` when unresolved, and do not fall back after resolved-launch failure.

## 2. CLI implementation

- [ ] 2.1 Introduce the injected IDE launcher-target resolver and verified macOS bundle candidate mappings in `repos/arashi`.
- [ ] 2.2 Carry the resolved executable target through preflight and launch command construction without changing CLI options, configuration, JSON envelopes, or generated option policy.
- [ ] 2.3 Preserve canonical PATH command precedence, argv-safe `--new-window` invocation, explicit IDE authority, existing error codes, and no-fallback behavior.

## 3. Verification and delivery

- [ ] 3.1 Run focused switch launcher and configured/zero-config integration tests after the final source edit.
- [ ] 3.2 Build the real CLI and perform a macOS acceptance switch with the canonical IDE command removed from PATH, verifying the requested installed app-bundle launcher opens the exact selected worktree.
- [ ] 3.3 Run the complete `repos/arashi` format check, lint, typecheck, test, build, schema check, generated command-contract check, and `git diff --check` gates.
- [ ] 3.4 Confirm companion extension/docs/skills contracts require no changes, then open the child implementation PR linked to project issue #259 and verify exact-head CI.
- [ ] 3.5 After implementation approval and green child delivery, complete OpenSpec task evidence and prepare the change for archive/sync in the still-open meta proposal PR.
