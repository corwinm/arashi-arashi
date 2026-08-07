## Why

Direct-binary `arashi update` currently aborts when GitHub's latest-release API returns a rate-limit response, even though the official installers can still target GitHub's unversioned latest-release download URLs. Users should be able to make an informed, explicitly confirmed attempt instead of being blocked by an availability check that cannot complete.

## What Changes

- Classify GitHub's documented HTTP 403 and 429 rate-limit responses only when headers or the response error message identify primary or secondary rate limiting.
- Explain that the latest version could not be verified and offer direct-binary users an interactive fallback that runs the official installer against the latest release without a pinned version.
- Treat `--yes` as approval for the same fallback without prompting.
- Preserve non-mutation for declined/cancelled prompts, non-interactive invocations without `--yes`, `--check`, `--dry-run`, and `--json`.
- Preserve existing failure behavior for generic 403/429 responses and unrelated release-check failures.
- Preserve the existing version-pinned installer path whenever the release check succeeds.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli-self-update`: Allow an explicitly confirmed unpinned direct-binary installer fallback after a rate-limited GitHub latest-release check while preserving inspection and failure boundaries.
- `windows-powershell-installer`: Allow confirmed Windows direct-binary updates to defer the installer without a pinned version only when the API check was rate limited.

## Impact

The change affects the compiled direct-binary update command in `repos/arashi/src/commands/update.ts`, its focused unit tests, and the Windows/POSIX installer-plan environment contract. It adds no CLI flags, configuration fields, dependencies, package-manager behavior changes, or release format changes. Tracks `corwinm/arashi-arashi#263`.
