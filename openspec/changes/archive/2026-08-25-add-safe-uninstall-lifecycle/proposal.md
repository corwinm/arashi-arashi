# Change: Add a conservative uninstall MVP

## Why

Arashi has official install and update paths but no official removal path. Users currently have to infer which executable files, package-manager state, PATH line, or shell block to remove, which risks deleting project data or corrupting an installation they do not own.

The first proposal attempted to solve every historical install, transaction phase, recovery state, JSON consumer, hosted-helper trust boundary, documentation export, and packaged-agent workflow at once. That scope is disproportionate to the immediate need. This revision defines a smaller fail-closed MVP: remove only state proven by a current official direct-install manifest, delegate confidently identified package-manager installs, and refuse legacy/manual/modified/ambiguous state.

## What Changes

- Add equivalent `aw uninstall` and `arashi uninstall` commands with `--dry-run` and `--yes`.
- Add equivalent `aw shell uninstall` and `arashi shell uninstall` commands for exact managed shell blocks.
- Add a minimal schema-v2 direct-install manifest containing exact installed files and the exact installer-added PATH mutation.
- Update official POSIX and PowerShell installers to write that manifest for new or refreshed direct installations.
- Bundle standalone POSIX and PowerShell uninstall helpers with release artifacts so direct removal remains available when the CLI cannot run.
- Detect confidently owned npm, pnpm, Yarn classic, Bun, and Vite+ global installs and delegate to exactly one owning package manager.
- Preflight all direct-install state before mutation, retain the manifest until cleanup succeeds, and allow reruns to treat already-absent manifest-listed files as completed work.
- Preserve workspaces, repositories, worktrees, `.arashi.yaml`, Git metadata, configuration, unrelated profile bytes, and unrelated install-directory content.
- Synchronize command discovery, completions, release packaging, checksums, concise CLI docs, and proportional public documentation.

## Explicit Non-Goals

- No uninstall `--json` contract in this MVP.
- No generalized transaction journal, tombstones, rollback engine, or phase API.
- No automatic adoption or migration of schema-v1, manual, partial, or ambiguous installations.
- No force bypass for modified or unproven files.
- No helper downloaded dynamically during uninstall and no separate remote-helper trust protocol.
- No automatic cleanup of every historical installer variation.
- No new packaged-skill uninstall workflow or feature-specific docs/skills semantic-checking framework.

## Capabilities

### New Capabilities

- `cli-uninstallation`: Conservative channel-aware product uninstall planning, consent, delegation, direct helper handoff, refusal, and preservation.
- `installer-ownership-lifecycle`: Minimal current-direct-install manifest, preflight, manifest-last cleanup, and rerunnable partial progress.

### Modified Capabilities

- `executable-aliases`: Package both executable names and bundled uninstall helpers as one current direct-install payload.
- `windows-powershell-installer`: Write the minimal Windows direct-install manifest and package/run the PowerShell helper.
- `npm-binary-installation`: Intercept uninstall before native dispatch and delegate to one confidently proven package manager.
- `shell-integration`: Add exact managed-block-only shell uninstall while preserving all canonical install scenarios.
- `shell-completions`: Discover and generate completion for the new command paths and options.
- `cross-repo-command-contracts`: Publish the new command inventory and semantics from the CLI producer.
- `docs-workflow-guidance-sections`: Add concise install/removal/troubleshooting guidance and hosted static helper routes without a new semantic-checker framework.

## Impact

- **Repositories:** `arashi`, `arashi-docs`, and this coordinating meta-repository.
- **CLI:** New product and shell-only uninstall commands; no uninstall JSON mode.
- **Installers/releases:** Minimal manifest v2 and bundled POSIX/PowerShell helpers.
- **Legacy users:** A schema-v1 or unmanifested direct install must be refreshed with the current official installer before automatic removal.
- **Safety:** Automatic deletion remains limited to exact current manifest-owned files, one exact installer-added PATH mutation, and exact managed shell blocks.

Tracks #329.
