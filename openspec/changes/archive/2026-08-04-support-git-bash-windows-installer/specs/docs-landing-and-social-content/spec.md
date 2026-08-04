## MODIFIED Requirements

### Requirement: Docs SHALL present Windows PowerShell install guidance
The docs landing surface SHALL present PowerShell as the canonical Windows install path alongside POSIX and npm install options without expanded shell-specific explanation. Windows onboarding and troubleshooting surfaces SHALL identify the installed payload's Git Bash support and SHALL explain when a new shell is required for persistent user PATH changes.

#### Scenario: Visitor reviews install choices on the landing page
- **WHEN** a visitor opens the docs landing page install section
- **THEN** they can choose a Windows PowerShell install command, the existing POSIX install command, or npm install guidance without additional Git Bash explanatory copy in the install tab

#### Scenario: Visitor wants to inspect the Windows installer
- **WHEN** a visitor reviews the Windows PowerShell install command
- **THEN** the page provides a subordinate `View install.ps1` inspection link to the hosted script

#### Scenario: Visitor uses Git Bash after PowerShell installation
- **WHEN** a visitor reads Windows installation or troubleshooting guidance for Git Bash
- **THEN** the docs explain that the canonical PowerShell installer installs an extensionless `arashi` command for Git Bash and that a newly opened Git Bash window inherits persistent user PATH changes

#### Scenario: Visitor disables PATH modification
- **WHEN** a visitor uses the Windows installer's no-modify-PATH option
- **THEN** the docs explain that the selected install directory must be made available to Git Bash without requiring the installer to edit shell-profile files

#### Scenario: Visitor needs a manual Windows fallback
- **WHEN** a visitor reads Windows installation guidance
- **THEN** the docs explain how to download the Windows executable, extensionless `arashi` wrapper, PowerShell wrapper, and Command Prompt wrapper from one GitHub release, verify them with the release checksum manifest, place them together in a directory on PATH, and open a new shell
