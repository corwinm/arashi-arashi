# cli-uninstallation Delta Specification

## ADDED Requirements

### Requirement: Product uninstall classifies one installation channel before mutation

Arashi SHALL expose equivalent `aw uninstall` and `arashi uninstall` commands. Before prompting or mutating, the command SHALL classify the installation as one confidently proven supported package manager, one valid current official direct install, or an unowned/legacy/manual/modified/ambiguous refusal. Environment hints alone SHALL NOT override conflicting ownership evidence.

#### Scenario: Current official direct install is detected

- **WHEN** the deterministic install directory contains a valid schema-v2 official-direct manifest whose present files pass preflight
- **THEN** uninstall selects the bundled direct-helper plan
- **AND** does not inspect package-manager roots or unrelated filesystem locations

#### Scenario: One package manager owns the installation

- **WHEN** package-root evidence confidently identifies exactly one supported global package manager
- **THEN** uninstall selects exactly that manager's normative removal command
- **AND** does not directly unlink package files or shims

#### Scenario: Ownership is not proven

- **WHEN** ownership is legacy, manual, malformed, modified, unsupported, missing, or ambiguous
- **THEN** uninstall exits non-zero with bounded remediation
- **AND** does not prompt, delegate, or mutate

### Requirement: Product uninstall supports human inspection and explicit consent

Product uninstall SHALL support `--dry-run`/`-n` as inspection-only and `--yes`/`-y` as consent to a completely preflighted human plan. Interactive confirmation SHALL default to no, and non-interactive apply SHALL require `--yes`. The MVP SHALL NOT expose uninstall JSON or force options.

#### Scenario: Dry-run is requested

- **WHEN** the user runs either executable name with `uninstall --dry-run`
- **THEN** the command prints the deterministic channel, actions, blockers, and preserved scopes
- **AND** does not prompt, delegate, stage a helper, or mutate

#### Scenario: User declines confirmation

- **WHEN** preflight succeeds and the user declines the default-no confirmation
- **THEN** uninstall exits without delegation or mutation

#### Scenario: Unsupported uninstall JSON is requested

- **WHEN** the user runs `uninstall --json` or `uninstall --force`
- **THEN** option parsing rejects the unsupported option before ownership discovery or mutation

### Requirement: Direct uninstall hands off to the bundled local helper

For a valid current official direct install, confirmed product uninstall SHALL copy the manifest-listed bundled platform helper to a unique temporary path, pass the exact install directory and parent PID, launch it, and exit. The helper SHALL wait for the parent and independently revalidate local ownership before mutation.

#### Scenario: Confirmed direct uninstall runs

- **WHEN** direct preflight succeeds and the user confirms
- **THEN** the CLI stages only the manifest-owned bundled helper at a unique temporary path
- **AND** the helper re-reads the manifest rather than trusting only the CLI's in-memory plan

#### Scenario: Installed CLI is unavailable

- **WHEN** the user invokes the bundled POSIX or PowerShell helper with the exact or deterministic default install directory
- **THEN** the helper can dry-run and apply the same direct-install plan without invoking the installed CLI

### Requirement: Every uninstall path preserves project and unrelated user state

Uninstall SHALL never delete or rewrite Arashi workspaces, repositories, linked worktrees, project files, `.arashi.yaml`, Git metadata, unrelated configuration, unrelated profile bytes, package-manager roots, or unrelated install-directory content. It SHALL never recursively remove an Arashi parent or install directory.

#### Scenario: Project data exists beside user configuration

- **WHEN** confirmed uninstall removes an owned executable installation
- **THEN** every workspace, repository, worktree, project configuration file, Git directory, and unrelated user file remains unchanged

#### Scenario: Unrelated file exists in the install directory

- **WHEN** the manifest-owned files are removed and an unrelated neighbor remains
- **THEN** uninstall preserves the neighbor and the containing directory
