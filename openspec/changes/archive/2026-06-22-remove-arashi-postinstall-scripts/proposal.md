## Why

Modern package managers increasingly disable lifecycle scripts such as `postinstall` by default, so npm installation should not depend on a package-manager-triggered download to produce a working `arashi` command. Arashi already has runtime fallback behavior for missing binaries; this change makes that fallback the primary installation path and gives users an explicit command when they want to preinstall the matching release binary.

## What Changes

- Remove the npm `postinstall` lifecycle script and exclude the postinstall implementation from published package files.
- Promote runtime binary resolution/download behavior from fallback to the default path when the packaged binary is missing.
- Add an explicit `arashi install` command that installs or refreshes the platform binary matching the installed npm package version.
- Ensure `arashi install` reports unsupported platforms, download failures, verification failures, and successful no-op cases clearly.
- Update user-facing npm installation guidance to no longer mention postinstall failure as the expected recovery path.

## Capabilities

### New Capabilities
- `npm-binary-installation`: Defines script-free npm installation, runtime binary availability behavior, and the explicit `arashi install` command for installing the matching platform binary.

### Modified Capabilities

## Impact

- Affected repository: `repos/arashi/`.
- Package metadata: `package.json` scripts/files and npm published contents.
- Runtime entrypoint: `bin/arashi.js` binary resolution and installation fallback behavior.
- Installer code: reusable binary download/verification logic for runtime fallback and explicit command use.
- CLI surface: new `arashi install` command.
- Tests/docs: add or update coverage and README/installation guidance for script-free npm installs and explicit binary installation.
