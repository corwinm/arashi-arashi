## Context

Arashi already ships Windows release assets (`arashi-windows-x64.exe`, `arashi.ps1`, `arashi.bat`, and `arashi-checksums.txt`) and the POSIX installer verifies checksums before installing direct binaries. Windows users who do not already have Node/npm must currently discover and assemble those release assets manually, while the docs landing/install surfaces emphasize the POSIX curl pipeline and npm install.

The change spans the CLI repository, where release scripts and installer docs live, and the docs site, which serves the hosted install endpoints and public install guidance. The installer is security-sensitive because the promoted command pipes remote PowerShell into execution, so inspectability, checksum validation, staging, and clear manual fallback paths are first-class parts of the design.

## Goals / Non-Goals

**Goals:**

- Provide a hosted one-line PowerShell install path for Windows x64 users that does not require Node/npm.
- Reuse existing GitHub release assets and checksum manifests instead of introducing a new distribution channel.
- Keep installation user-scoped by default, atomic enough to avoid replacing a working install with unverified downloads, and easy to inspect before execution.
- Update docs and website install surfaces so Windows, npm, and manual release fallback paths are all discoverable.
- Add focused automated coverage for script helper behavior and publish/docs paths.

**Non-Goals:**

- Supporting Windows ARM64 before matching release assets exist.
- Introducing MSI/MSIX installers, package-manager integrations, or admin/system-wide installs.
- Changing POSIX installer behavior except where docs or shared publishing paths need to mention the Windows script.
- Replacing npm-managed install/update behavior.

## Decisions

1. **Host `install.ps1` through the docs site while sourcing release assets from GitHub Releases.**
   - Rationale: The public one-liner should mirror the existing `https://arashi.haphazard.dev/install` flow and keep script inspection at the project domain, while binaries remain versioned release artifacts.
   - Alternative considered: only document direct GitHub release URLs. That keeps implementation smaller but does not satisfy the no-Node one-line installer goal.

2. **Install to a user-writable bin directory by default.**
   - Default target: `$env:USERPROFILE\.arashi\bin`, overridable via `-InstallDir` or `ARASHI_INSTALL_DIR`.
   - Rationale: Avoids requiring elevated PowerShell and matches the direct-binary convenience of the POSIX installer.

3. **Download all required assets into a temporary staging directory and verify checksums before replacing installed files.**
   - Assets: `arashi-windows-x64.exe`, `arashi.ps1`, `arashi.bat`, and `arashi-checksums.txt`.
   - Install layout: `arashi.bin.exe`, `arashi.ps1`, and `arashi.bat` in the install directory.
   - Rationale: Checksum validation and staged replacement reduce the chance of leaving a broken or partially verified install.

4. **Support both parameter and environment-variable configuration.**
   - Version: `-Version 1.15.0` or `ARASHI_VERSION=1.15.0`, with latest release downloads by default.
   - Install directory: `-InstallDir` or `ARASHI_INSTALL_DIR`.
   - PATH opt-out: `-NoModifyPath` or `ARASHI_NO_MODIFY_PATH=1`.
   - Rationale: Parameters are natural for direct script invocation, while environment variables work with the `irm ... | iex` pattern.

5. **Update the persistent user PATH by default and explicitly communicate terminal refresh needs.**
   - The script should append the install directory to the user PATH if missing, attempt a best-effort environment-change broadcast, and still tell the user to open a new terminal.
   - Rationale: PATH propagation differs across shells; success should not imply already-open shells see the change.

6. **Smoke-test the installed wrapper after replacement.**
   - Prefer invoking `arashi.ps1 --version` from the install directory; fall back to clear troubleshooting/fallback output if execution policy or wrapper behavior prevents success.
   - Rationale: Verifies the installed files work together, not just that downloads completed.

## Risks / Trade-offs

- **Remote script execution pattern is sensitive** → Mitigate with a visible `View install.ps1`/inspection link, checksum verification, and manual release fallback docs.
- **Windows PATH updates may not affect current shells** → Persist to user PATH, best-effort broadcast, and print explicit “open a new terminal” guidance.
- **PowerShell execution policies vary** → Document the recommended `-ExecutionPolicy Bypass` invocation and direct-download fallback; keep smoke-test failure messages actionable.
- **Checksum manifest format changes could break parsing** → Test parser behavior against current manifest lines and fail closed when expected asset hashes are absent.
- **No Windows runner may be available locally** → Cover pure helper logic in tests and rely on GitHub Actions/Windows CI for end-to-end script execution if the repo has or adds an appropriate workflow path.

## Migration Plan

1. Land the OpenSpec proposal for review.
2. Implement `scripts/install.ps1` and focused tests in `corwinm/arashi`.
3. Update `repos/arashi/docs/INSTALLATION.md` and any release/publish configuration needed to expose the script.
4. Update `corwinm/arashi-docs` landing/getting-started install guidance, script-inspection affordance, manual fallback docs, and generated agent-readable exports if they include install pages.
5. Validate CLI repo checks (`bun run lint`, `bun run test`, `bun run build`) and docs repo checks (`bun run validate` plus rendered route/static asset smoke checks).
6. Open cross-linked implementation/docs PRs, then archive and sync this OpenSpec change after implementation review.

## Open Questions

- Should the implementation add a dedicated Windows CI smoke test for `scripts/install.ps1`, or is helper-level testing plus manual/PR validation acceptable for the first slice?
- Should the public docs show the long `powershell -ExecutionPolicy Bypass -c "irm ... | iex"` command everywhere, or also include a PowerShell 7 `pwsh` variant?
