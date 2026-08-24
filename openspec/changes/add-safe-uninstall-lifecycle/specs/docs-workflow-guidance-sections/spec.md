# docs-workflow-guidance-sections Delta Specification

## ADDED Requirements

### Requirement: Public docs provide a safe uninstall workflow

Canonical documentation SHALL provide discoverable top-level and shell-only uninstall command pages plus installation, shell-integration, troubleshooting, and release-route guidance. It SHALL distinguish direct, npm, pnpm, Yarn, Bun, Vite+, manual, legacy, and ambiguous channels; teach dry-run and explicit consent; explain JSON inspection-only behavior; publish exact package-manager commands and hosted POSIX/PowerShell routes; state the v1 update/reinstall migration boundary; and state prominently that workspaces, configuration, repositories, worktrees, projects, and unrelated files are preserved.

#### Scenario: Direct-install user wants to remove Arashi

- **WHEN** the user follows canonical uninstall guidance
- **THEN** they are directed to inspect the exact plan, understand ownership refusal and migration, confirm deliberately, and verify fresh-shell results
- **AND** the docs never recommend broad deletion of `~/.arashi` or an installation directory

#### Scenario: Package-manager or manual user wants to remove Arashi

- **WHEN** the channel is package-managed, manual, legacy, or ambiguous
- **THEN** docs provide the exact applicable owner commands or bounded remediation without teaching direct file deletion

#### Scenario: User wants to preserve the product but remove shell integration

- **WHEN** the user follows shell-only guidance
- **THEN** it teaches `aw shell uninstall`, exact managed-block safety, inspection and consent, and states that executable/PATH/project state is untouched

#### Scenario: Generated route or semantic claim drifts

- **WHEN** maintained docs, command indexes, hosted route guidance, Markdown routes, or generated exports omit or contradict an uninstall invariant
- **THEN** the stable docs aggregate reports the owning source and exits unsuccessfully
