## Why

Terminal.app does not expose a reliable supported AppleScript operation for creating a true tab in an exact target window. Arashi currently treats Terminal.app as tab-capable, so `arashi switch --tab` reaches an opaque AppleScript failure and risks future implementations executing in the user's existing selected tab instead of honoring the explicit tab disposition.

## What Changes

- Reclassify Terminal.app's explicit `tab` disposition as unsupported while retaining its existing default new-window behavior.
- Reject Terminal.app `--tab` before any state-changing AppleScript or fallback launch runs.
- Return `TAB_DISPOSITION_UNSUPPORTED` with actionable human guidance: press **Command-T** manually, then run `arashi switch --cd` in the new tab when shell integration is active, or use `arashi switch --no-cd --no-default-launch` to force normal automatic launch instead of parent-shell/configured named-launcher behavior; when Terminal.app is then selected, its supported default opens a new window.
- Preserve structured error stability and do not claim the manual `--cd` alternative succeeded when shell integration is unavailable.
- Correct canonical launcher capability documentation and generated companion guidance that currently describe Terminal.app as creating a true scripted tab.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `launch-disposition`: Correct Terminal.app's tab capability, pre-mutation rejection, no-fallback behavior, and actionable manual alternative.

## Impact

- Meta-repository OpenSpec requirements and semantic contract checks for launcher disposition.
- `repos/arashi`: Terminal.app launch planning/preflight, human error guidance, and regression tests.
- `repos/arashi-docs` and `repos/arashi-skills`: canonical launcher matrix and user guidance if current published content claims Terminal.app tab support.
- No new CLI options, configuration fields, permissions, dependencies, or System Events UI automation.
