## Why

Arashi can currently install its npm-managed platform binary, but users do not have a first-class way to ask the CLI whether a newer release exists and update itself. Adding an explicit update command reduces manual release hunting and gives each install method a safer, guided update path.

## What Changes

- Add an `arashi update` command that detects how Arashi is installed before attempting an update.
- Check the currently running version against the latest available release for supported install methods.
- For npm-managed installs, update the package with the detected package manager and refresh the matching platform binary.
- For direct binary/manual installs, report the latest available version and provide actionable update guidance without guessing a package manager.
- Add dry-run/check-only and non-interactive behavior so users and automation can inspect update availability safely.
- Update CLI tests and user-facing documentation for the new update workflow.

## Capabilities

### New Capabilities
- `cli-self-update`: Defines how the CLI detects install method, checks update availability, updates supported installs, refreshes binaries, and reports guidance for unsupported/manual installs.

### Modified Capabilities
- `npm-binary-installation`: Extend npm-managed binary behavior so explicit updates can replace or refresh the installed platform binary for the selected package version.

## Impact

- Affected implementation repo: `repos/arashi`.
- Likely CLI files: command registration in `src/index.ts`, a new `src/commands/update.ts`, shared update/install helpers near `bin/install-binary.js` and/or CLI library modules, and focused unit tests under `tests/unit/`.
- Documentation updates likely needed in `repos/arashi/README.md`, `repos/arashi-docs`, and `repos/arashi-skills` command guidance.
- External systems: npm registry/package-manager commands for npm installs, GitHub Releases API or release metadata for direct binary/manual guidance.
