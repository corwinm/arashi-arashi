# windows-powershell-installer Delta Specification

## ADDED Requirements

### Requirement: Windows direct installation records exactly reversible ownership

The PowerShell installer SHALL accept a documented explicit `-InstallDir`, normalize and bind that directory in schema v2, record every native executable and canonical/alias wrapper destination with SHA-256, and record only user PATH, profile, and shell mutations created by the transaction. Existing equivalent PATH or profile state SHALL remain unowned. Installation success SHALL require atomic v2 ledger commit after payload and fresh-shell smoke tests.

#### Scenario: User selects a custom install directory

- **WHEN** the user invokes the hosted installer with `-InstallDir` naming a supported writable directory
- **THEN** payload, ledger, smoke tests, and future uninstall ownership bind to that exact normalized directory
- **AND** no default install directory is mutated

#### Scenario: User PATH already contains the directory

- **WHEN** exact user PATH state already makes the selected directory available before install
- **THEN** the installer preserves the PATH value and records no created PATH mutation
- **AND** uninstall later leaves that entry unchanged

#### Scenario: Installer adds user PATH state

- **WHEN** the selected directory is absent and installer policy adds it
- **THEN** schema v2 records the exact created value and prior-state evidence
- **AND** uninstall removes it only while that exact owned state remains unmodified

### Requirement: Windows full uninstall uses native deferred transaction semantics

The Windows CLI and hosted `/uninstall.ps1` SHALL apply whole-installation v2 preflight, confirmation or inspection policy, single-journal rollback and retry evidence, exact final observation, and verified deferred deletion after the running process exits. They SHALL preserve unrelated files, pre-existing PATH/profile state, all workspaces and project data, and SHALL reject schema v1, manual, ambiguous, malformed, or modified state before mutation.

#### Scenario: Running executable is locked

- **WHEN** confirmed uninstall runs from its own v2-owned Windows payload
- **THEN** a verified PowerShell helper outside the payload waits for process exit and removes only journal-proven remaining targets
- **AND** the helper retires itself only after durable final-state handling

#### Scenario: Profile state is malformed or duplicated

- **WHEN** exact managed mutation preflight finds partial, malformed, or duplicate marker state
- **THEN** uninstall exits before payload, PATH, or profile mutation
- **AND** reports reinstall, migration, or bounded manual remediation

#### Scenario: Mid-transaction Windows failure is recoverable

- **WHEN** payload removal or PATH/profile removal fails before the journal commits `ledger-removed`
- **THEN** rollback restores exact prior files and values where possible
- **AND** retained journal state, per-target observations, and retry guidance are reported when restoration is incomplete

#### Scenario: Fresh shells observe successful removal

- **WHEN** native Windows uninstall reports success
- **THEN** fresh PowerShell, Command Prompt, and verified Git for Windows Bash sessions do not resolve managed `arashi` or `aw` entrypoints
- **AND** unrelated PATH entries and project state remain unchanged

### Requirement: Windows hosted uninstall route is release-validated

Release and documentation validation SHALL smoke-test the deployed `/uninstall.ps1` route and exercise native Windows acceptance using an exact release and explicit installation directory.

#### Scenario: Hosted script is inspected

- **WHEN** a client requests `/uninstall.ps1`
- **THEN** the route returns the inspectable supported PowerShell uninstaller successfully
- **AND** the script exposes the documented explicit install-directory parameter

#### Scenario: Native release acceptance runs

- **WHEN** an exact released version is installed and removed on native Windows
- **THEN** ledger completeness, refusal fixtures, confirmation, dry-run, rollback/retry, deferred self-removal, and fresh-shell observations are verified
- **AND** acceptance fails if any workspace, config, repository, worktree, project, or unrelated file is deleted
