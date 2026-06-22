## Context

The npm package currently declares `scripts.postinstall: node scripts/postinstall.js` and publishes that script. The script downloads the release binary matching the installed package version and verifies it with `--version`. The npm bin entrypoint (`bin/arashi.js`) already contains fallback behavior: before delegating to the shell wrapper or platform binary, it checks for a usable packaged binary and runs the postinstall script when files are missing.

Because modern package managers may disable lifecycle scripts, npm installation must be valid even when no lifecycle hook runs. The package should install only lightweight wrapper files initially, then acquire the matching binary either on first use or when the user explicitly runs `arashi install`.

## Goals / Non-Goals

**Goals:**
- Remove package-manager lifecycle dependency from the published npm package.
- Keep `npm install -g arashi` followed by `arashi <command>` working when the binary is absent.
- Provide `arashi install` as an explicit, script-free way to download and verify the platform binary for the installed package version.
- Reuse one implementation for platform detection, download, cleanup, executable permissions, and smoke-test verification.
- Preserve existing wrapper behavior for Unix stdin handling and Windows direct binary execution.

**Non-Goals:**
- Changing the curl installer or release asset naming scheme.
- Adding support for new operating systems or CPU architectures.
- Changing how worktree commands behave after the binary is available.
- Introducing new package manager dependencies.

## Decisions

1. **Replace postinstall with a published installer module invoked by the npm entrypoint.**
   - Move reusable logic out of `scripts/postinstall.js` into a published runtime module, for example `bin/install-binary.js` or `scripts/install-binary.js` if it remains in `files` without being referenced as a lifecycle script.
   - The module exposes functions for platform asset selection, binary existence checks, download, chmod, verification, and cleanup.
   - Rationale: first-use fallback and explicit install need identical semantics; duplicated installer code would drift.
   - Alternative considered: keep `scripts/postinstall.js` and only remove the package script. This keeps misleading naming and makes it easier to accidentally reintroduce lifecycle behavior.

2. **Make `bin/arashi.js` the script-free installation orchestrator for npm installs.**
   - Remove `scripts.postinstall` from `package.json`.
   - Keep the npm `bin` mapping pointed at `./bin/arashi.js`.
   - Before spawning the native binary, `bin/arashi.js` ensures the wrapper and matching binary are present; if not, it runs the shared installer and exits on installer failure.
   - Rationale: this is the only JavaScript code guaranteed to run before the native binary exists.
   - Alternative considered: implement installation only inside the compiled TypeScript CLI. That cannot help the first run when the native binary has not been downloaded yet.

3. **Handle `arashi install` explicitly in the npm entrypoint and expose it in CLI help.**
   - `bin/arashi.js` recognizes `install` as an npm-entrypoint command, invokes the shared installer intentionally, reports success or no-op status, and exits without requiring the native binary first.
   - Add a compiled `install` command as well so `arashi --help` documents the command and direct binary users receive a clear message. For direct binary/curl installs, the command can report that no npm-managed binary installation is needed or unsupported in that context.
   - Rationale: users need a visible command, but the actual npm use case must work even when the binary is missing.
   - Alternative considered: make first use sufficient and skip an explicit command. The issue requests an explicit install path for users/package managers that want deterministic setup.

4. **Preserve matching-version release binding.**
   - The installer reads the package version from the installed npm package metadata and downloads from `https://github.com/corwinm/arashi/releases/download/v<version>/<asset>`.
   - Existing asset names remain the source of truth: `arashi-macos-arm64`, `arashi-linux-x64`, and `arashi-windows-x64.exe`.
   - Rationale: this keeps npm package version, downloaded binary, and release artifacts aligned.

5. **Update docs and tests around script-free install behavior.**
   - Replace npm troubleshooting references to postinstall failure with first-use/`arashi install` guidance.
   - Add tests for package metadata, installer asset selection, no-op when binary exists, first-use invocation when missing, and explicit install command behavior.
   - Rationale: the primary risk is regression back to lifecycle-script assumptions.

## Risks / Trade-offs

- **First command may take longer because it downloads a binary** → Print clear progress and keep `arashi install` available for pre-warming in CI or package-manager hooks.
- **Download failure now happens at first command instead of install time** → Preserve cleanup, verification, and actionable error messages with manual release fallback guidance.
- **Entrypoint tests may need to mock network and child process behavior** → Structure installer functions for unit testing without real GitHub downloads.
- **The compiled direct binary cannot install itself like the npm wrapper can** → Document `arashi install` as an npm-package command and make direct-binary behavior clear/no-op.
- **Published package must still include enough JavaScript to download the binary** → Keep the runtime installer module in `files` while removing lifecycle script metadata.

## Migration Plan

1. Refactor installer logic into a reusable runtime module and update `bin/arashi.js` to call it for first-use fallback and explicit `install`.
2. Remove `postinstall` from `package.json` and remove the old postinstall script from published files.
3. Add the visible CLI `install` command/help entry with npm-context-aware messaging.
4. Update tests and documentation.
5. Release normally; users with lifecycle scripts disabled get first-use installation automatically, and users who want eager setup run `arashi install`.

Rollback is to restore the current package lifecycle script and postinstall implementation if first-use installation causes release-blocking issues.

## Open Questions

- Should `arashi install` support a `--force` option to redownload an existing matching binary, or should it remain idempotent/no-op unless the binary is missing?
