# docs-workflow-guidance-sections Delta Specification

## ADDED Requirements

### Requirement: Public docs explain conservative uninstall without overstating automation

Public documentation SHALL provide concise pages for product uninstall and shell-only uninstall plus proportional installation/removal/troubleshooting guidance. It SHALL document dry-run before consent, exact package-manager commands, current-direct manifest ownership, legacy refresh, CLI-unavailable bundled helpers, fail-closed manual/modified/ambiguous state, and preservation of workspaces, repositories, worktrees, project files, configuration, Git metadata, and unrelated user state. It SHALL NOT document uninstall JSON, force deletion, automatic legacy adoption, rollback guarantees, or recursive Arashi-directory removal.

#### Scenario: User reads product uninstall guidance

- **WHEN** the user opens the uninstall command page
- **THEN** it distinguishes proven package-manager delegation, current official direct removal, and refusal cases
- **AND** shows inspection before interactive or `--yes` consent

#### Scenario: User reads shell-only guidance

- **WHEN** the user opens the shell-uninstall page
- **THEN** it explains exact managed-block removal and executable/PATH/project preservation

#### Scenario: Legacy direct user needs removal

- **WHEN** documentation describes schema-v1 or unmanifested direct state
- **THEN** it instructs the user to refresh the same install with the current official installer before retrying
- **AND** does not suggest heuristic deletion

### Requirement: Documentation exposes static recovery-helper routes proportionally

The docs deployment SHALL provide static POSIX and PowerShell helper routes, with and without trailing slash where the platform requires route normalization, that resolve to the release-owned helper content. Guidance SHALL recommend downloading to a unique temporary file, inspecting it, and supplying the exact non-default install directory. The scripts SHALL remain complete local manifest validators rather than trusting the route itself as ownership proof.

#### Scenario: POSIX recovery route is requested

- **WHEN** a user fetches the documented POSIX uninstall route
- **THEN** the response is the current release-owned POSIX helper
- **AND** documentation shows dry-run before apply

#### Scenario: PowerShell recovery route is requested

- **WHEN** a user fetches the documented PowerShell uninstall route
- **THEN** the response is the current release-owned PowerShell helper
- **AND** documentation shows `-InstallDir`, `-DryRun`, and explicit consent

### Requirement: Existing docs generation and validation remain sufficient

The new pages and routes SHALL integrate through existing documentation generation, link validation, build validation, and command-contract consumers. This MVP SHALL NOT require a new feature-specific semantic checker framework or packaged-skill uninstall workflow.

#### Scenario: Documentation validation runs

- **WHEN** the existing canonical docs validation suite runs after regeneration
- **THEN** new pages, links, static routes, and generated command inventory pass through existing checks
- **AND** no standalone uninstall-specific checker registry is required by this change
