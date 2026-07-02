## 1. Arashi CLI Repository Installer

- [x] 1.1 Add `scripts/install.ps1` with Windows x64 platform detection, latest/pinned release URL construction, environment-variable and parameter handling, and clear unsupported-platform failures.
- [x] 1.2 Implement staged downloads for `arashi-windows-x64.exe`, `arashi.ps1`, `arashi.bat`, and `arashi-checksums.txt` from one selected GitHub release.
- [x] 1.3 Parse `arashi-checksums.txt` and verify every staged Windows asset with `Get-FileHash` before replacing installed files.
- [x] 1.4 Install verified assets as `arashi.bin.exe`, `arashi.ps1`, and `arashi.bat` in `%USERPROFILE%\.arashi\bin` by default with `-InstallDir` / `ARASHI_INSTALL_DIR` overrides.
- [x] 1.5 Add default persistent user PATH modification with duplicate-entry avoidance, `-NoModifyPath` / `ARASHI_NO_MODIFY_PATH=1` opt-out, best-effort environment broadcast, and new-terminal guidance.
- [x] 1.6 Run an installed binary `--version` smoke test and print direct GitHub Releases fallback guidance for download, checksum, PATH, and smoke-test failures.
- [x] 1.7 Route `arashi update --yes` through a deferred Windows PowerShell installer on Windows while preserving the POSIX installer path on macOS/Linux.

## 2. Arashi CLI Tests and Docs

- [x] 2.1 Add focused tests for architecture detection, asset URL construction, checksum parsing/verification, install directory selection, and no-modify-PATH behavior.
- [x] 2.2 Update `docs/INSTALLATION.md` with the Windows PowerShell one-liner, script inspection option, pinned/custom/no-PATH examples, checksum behavior, troubleshooting, and manual Windows release fallback.
- [x] 2.3 Run `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`.

## 3. Docs Site Publishing and Install Guidance

- [x] 3.1 Publish or copy the PowerShell installer so the built docs site serves it at `/install.ps1` alongside the existing `/install` endpoint.
- [x] 3.2 Add a Windows tab or equivalent Windows-specific install block on the landing page with a subordinate `View install.ps1` inspection link.
- [x] 3.3 Update Getting Started/install documentation with Windows PowerShell, npm install, and manual GitHub Releases fallback guidance.
- [x] 3.4 Regenerate or verify agent-readable docs exports if install docs appear in `/llms.txt`, `/llms-full.txt`, or generated `.md` routes.
- [x] 3.5 Run `bun run validate` in `repos/arashi-docs` and smoke-check built output for `/install.ps1`, landing install text, and relevant generated Markdown routes.

## 4. PR and OpenSpec Closeout

- [x] 4.1 Open a focused `corwinm/arashi` implementation PR linked to issue #100 and this OpenSpec change: https://github.com/corwinm/arashi/pull/76
- [x] 4.2 Open a focused `corwinm/arashi-docs` docs/publish PR linked to issue #100 and the CLI PR: https://github.com/corwinm/arashi-docs/pull/33
- [x] 4.3 Update all related PR bodies with cross-links and validation evidence after PR URLs exist.
- [ ] 4.4 After implementation review, archive/sync the `add-windows-powershell-installer` OpenSpec change and update the meta PR body from proposal-only tracking to final closeout.
