## ADDED Requirements

### Requirement: Docs SHALL present Windows PowerShell install guidance
The docs landing and onboarding surfaces SHALL present the Windows PowerShell install path alongside POSIX and npm install options.

#### Scenario: Visitor reviews install choices on the landing page
- **WHEN** a visitor opens the docs landing page install section
- **THEN** they can choose a Windows PowerShell install command, the existing POSIX install command, or npm install guidance

#### Scenario: Visitor wants to inspect the Windows installer
- **WHEN** a visitor reviews the Windows PowerShell install command
- **THEN** the page provides a subordinate `View install.ps1` inspection link to the hosted script

#### Scenario: Visitor needs a manual Windows fallback
- **WHEN** a visitor reads Windows installation guidance
- **THEN** the docs explain how to download the Windows executable and wrapper assets from GitHub Releases into a directory on PATH
