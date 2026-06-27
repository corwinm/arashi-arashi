## Context

Arashi is distributed as an npm package that provides a JavaScript entrypoint plus platform-specific release binaries, and it can also be used as a directly downloaded binary. The npm entrypoint already owns first-use binary installation and the explicit `arashi install` flow, while the native CLI currently registers an `install` command that explains no npm-managed install work is needed in direct-binary contexts.

Issue #157 asks for an `arashi update` command that detects how Arashi was installed, checks whether an update exists, and then runs the appropriate update path to download the updated binary. The design needs to account for two execution contexts:

- npm-managed entrypoint (`bin/arashi.js`): can update the package and refresh the platform binary from the package root.
- direct native binary (`src/index.ts` compiled output): cannot reliably mutate package-manager state, but can report version/release information and provide safe guidance.

## Goals / Non-Goals

**Goals:**

- Provide a first-class `arashi update` command visible in CLI help.
- Detect whether the command is running through the npm entrypoint or as a direct native binary.
- Compare the current CLI version with the latest available Arashi release/package version.
- For npm-managed installs, run the detected/supported package-manager command to update the `arashi` package and then ensure the matching platform binary is installed and verified.
- For direct binary/manual installs, avoid unsafe guesses and print actionable manual update guidance.
- Support check/dry-run behavior for users and automation.
- Cover the behavior with focused unit tests and update user-facing docs.

**Non-Goals:**

- Implement OS package manager integrations such as Homebrew, apt, winget, or scoop until Arashi has an official distribution channel there.
- Auto-update arbitrary manually downloaded binaries in place.
- Change release publishing or semantic-release behavior.
- Change existing `arashi install` first-use binary installation semantics except where update reuses the installer to refresh a selected version.

## Decisions

### Intercept npm-managed updates in the JavaScript entrypoint

The npm package entrypoint should intercept `arashi update` before spawning the native binary, similar to the existing `arashi install` interception. This gives the update flow access to the package root, package metadata, and installer helpers needed to refresh the npm-managed binary.

Alternative considered: implement all update logic inside the native binary. That would make direct binaries and npm binaries share one command implementation, but the compiled binary does not naturally know the package-manager context that launched it and would need brittle path probing.

### Keep a native `update` command for direct-binary guidance

The native CLI should still register `update` so users running a direct binary see a real command rather than an unknown command. In direct-binary context, `arashi update` should check the current version against the latest GitHub release when possible and then print the release URL or manual update guidance rather than mutating files.

Alternative considered: omit `update` from the native binary and only support npm entrypoint updates. That would make direct installs confusing and would not satisfy install-method detection.

### Use explicit install-method detection with conservative fallbacks

The update code should classify the current install as `npm-managed` only when it is running inside the npm package entrypoint/package root. Package-manager command selection should prefer explicit metadata/configuration when available, then known global managers that can update the package. If the package manager cannot be confidently determined, the command should show the exact manual command options rather than guessing.

Alternative considered: always run `npm install -g arashi@latest`. That would work for some users but could break pnpm/yarn/bun global installs or local tool installs.

### Reuse binary installer helpers with version override support

The existing binary installer downloads a release asset matching a package version. Update should reuse that logic after the package has been updated, and the installer should be able to replace a stale binary when the selected package version changed. Verification should remain the same: make the binary executable where needed and smoke-test `--version` before reporting success.

Alternative considered: implement a separate downloader for updates. That would duplicate platform asset naming, cleanup, and verification logic already covered by install tests.

### Add explicit automation flags

`arashi update --check` should only report whether an update is available. `arashi update --dry-run` should show what command would run without modifying the installation. `arashi update --yes` should allow non-interactive execution when an update is available; interactive terminals may prompt before executing.

Alternative considered: update immediately with no confirmation. That is simpler, but a command that invokes package managers and replaces binaries should have safe inspection and automation paths.

## Risks / Trade-offs

- Package-manager detection can be imperfect → prefer conservative fallback guidance when detection is ambiguous, and cover each supported manager with tests.
- Global package manager commands vary by tool/version → keep the supported command matrix small and documented, and surface the command before execution.
- Updating the package may replace the entrypoint while it is running → run the package-manager command as a child process, then re-read package metadata and reinstall/verify the binary after the command completes.
- Release/package metadata can be unavailable offline → fail with actionable guidance and do not remove an existing working binary.
- Direct-binary users may expect in-place mutation → explicitly explain that direct binary auto-replacement is unsupported and link to the latest release asset.

## Migration Plan

1. Add the update command and npm-entrypoint interception in `repos/arashi`.
2. Add tests for version comparison, update availability, package-manager command selection, binary refresh, and direct-binary guidance.
3. Update CLI README/docs/skills command references.
4. Release normally through existing semantic-release flow; users can continue using `arashi install` and all existing commands.
5. Rollback by reverting the new command and docs; existing install/runtime behavior remains unchanged.

## Open Questions

- Should `arashi update --check` use a distinct exit code when an update is available, or always exit `0` unless the check itself fails?
- Should the first implementation support local project installs, or only global npm-managed installs plus direct-binary guidance?
