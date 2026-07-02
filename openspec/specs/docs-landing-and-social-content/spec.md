## Purpose

Define the docs landing page messaging, metadata, and navigation requirements so first-time visitors understand Arashi and can quickly find onboarding and workflow documentation.
## Requirements
### Requirement: Landing page SHALL surface the canonical Arashi value statement
The docs landing page SHALL present Arashi's primary value using the canonical README tagline and a one-sentence summary that explains the product before readers navigate to deeper documentation.

#### Scenario: First-time visitor opens the docs site
- **WHEN** a visitor loads the landing page
- **THEN** the hero region includes the canonical tagline and a concise explanation of what Arashi helps them do

### Requirement: Docs site metadata SHALL align with landing and README messaging
The docs site SHALL expose page title and description metadata for the landing page that matches the canonical product message used in the landing page and README, adapted only as needed for metadata length.

#### Scenario: User shares the docs URL
- **WHEN** the docs home page is rendered for social preview or browser metadata
- **THEN** the title and description communicate the same product identity and purpose as the landing page and README summary

### Requirement: Landing page SHALL provide guided entry points into workflow documentation
The docs landing page SHALL include discoverable links to workflow guidance for getting started, hooks or configuration guidance, integrations, and contributor or agent workflow documentation.

#### Scenario: Visitor scans landing-page actions
- **WHEN** a visitor uses the landing page to choose a next step
- **THEN** they can navigate directly to onboarding and workflow guidance without relying on command-page discovery alone

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

