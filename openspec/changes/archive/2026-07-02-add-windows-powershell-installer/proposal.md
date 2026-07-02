## Why

Windows users can already install Arashi from GitHub release assets, but the documented one-line installer path only supports macOS/Linux. Adding a hosted PowerShell installer gives Windows users a no-Node/no-npm setup path that matches the existing release and checksum contract.

## What Changes

- Add a Windows PowerShell installer in `corwinm/arashi` that installs the released Windows executable and wrappers into a user-writable bin directory.
- Publish the PowerShell installer from the docs site at `https://arashi.haphazard.dev/install.ps1` alongside the existing POSIX installer endpoint.
- Support latest and pinned version installs, custom install directories, checksum verification, safe staged replacement, optional user PATH modification, and a post-install smoke test.
- Update CLI install documentation, docs-site install tabs, getting-started guidance, and manual Windows fallback instructions.
- Add focused tests for installer helper behavior and docs/publish coverage.

## Capabilities

### New Capabilities
- `windows-powershell-installer`: Defines the Windows PowerShell install flow, including platform support, release asset resolution, checksum validation, installation layout, PATH behavior, smoke testing, publishing, and fallback guidance.

### Modified Capabilities
- `docs-landing-and-social-content`: Add Windows PowerShell install guidance to the docs landing/getting-started surfaces where users choose an install method.

## Impact

- `repos/arashi/scripts/install.ps1` plus tests and `docs/INSTALLATION.md` in `corwinm/arashi`.
- `repos/arashi-docs` install UI, static file publishing for `/install.ps1`, Getting Started/manual fallback documentation, and generated agent-readable exports if affected by docs generation.
- Release/download behavior continues to use existing `corwinm/arashi` release assets and `arashi-checksums.txt`; no new runtime dependency is expected.
- Originating issue: https://github.com/corwinm/arashi-arashi/issues/100
