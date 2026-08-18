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

The docs landing surface SHALL present PowerShell as the canonical Windows install path alongside POSIX and npm install options without expanded shell-specific explanation. Windows onboarding and troubleshooting surfaces SHALL identify the installed payload's canonical `arashi` and alias `aw` support for Git Bash, PowerShell, and Command Prompt and SHALL explain when a new shell is required for persistent user PATH changes.

#### Scenario: Visitor reviews install choices on the landing page

- **WHEN** a visitor opens the docs landing page install section
- **THEN** they can choose a Windows PowerShell install command, the existing POSIX install command, or npm install guidance without additional Git Bash explanatory copy in the install tab

#### Scenario: Visitor wants to inspect the Windows installer

- **WHEN** a visitor reviews the Windows PowerShell install command
- **THEN** the page provides a subordinate `View install.ps1` inspection link to the hosted script

#### Scenario: Visitor uses Git Bash after PowerShell installation

- **WHEN** a visitor reads Windows installation or troubleshooting guidance for Git Bash
- **THEN** the docs explain that the canonical PowerShell installer installs extensionless `arashi` and `aw` commands for Git Bash, both execute the same native binary, and a newly opened Git Bash window inherits persistent user PATH changes

#### Scenario: Visitor disables PATH modification

- **WHEN** a visitor uses the Windows installer's no-modify-PATH option
- **THEN** the docs explain that the selected install directory must be made available to Git Bash without requiring the installer to edit shell-profile files

#### Scenario: Visitor needs a manual Windows fallback

- **WHEN** a visitor reads Windows installation guidance
- **THEN** the docs explain how to download `arashi-windows-x64.exe`, `arashi`, `arashi.ps1`, `arashi.bat`, `aw`, `aw.ps1`, and `aw.bat` from one GitHub release, verify every launcher plus the native executable with that release's checksum manifest, rename the native executable to `arashi.bin.exe`, place all seven installed files together in a directory on PATH, and open a new shell
- **AND** the docs explain that manually placed alias wrappers have no direct-installer ownership ledger, so a later installer migration requires deliberately moving/removing the manual `aw` files before retrying

#### Scenario: Visitor has an existing aw command

- **WHEN** installation reports an alias destination or PATH-resolution ownership collision
- **THEN** troubleshooting explains that Arashi will not overwrite or shadow the path and the user must inspect and deliberately move or remove the unrelated command before retrying

### Requirement: Docs introduce the supported executable alias concisely

Canonical user documentation SHALL identify `aw` concisely as a shorter alias for `arashi` in getting-started guidance and explain that supported installations provide both names with equivalent behavior. The landing page SHALL remain focused on the product and installation choices without a separate alias-identity paragraph.

#### Scenario: Visitor scans the landing page

- **WHEN** a visitor reviews the landing page or getting-started install outcome
- **THEN** the landing page carries no separate alias-identity paragraph and getting-started states only that `aw` is a shorter alias for `arashi`
- **AND** the install tab is not expanded into implementation, collision, or payload-transaction detail

#### Scenario: Visitor reads installation guidance

- **WHEN** a visitor reads npm, POSIX, Windows, update, manual-install, or troubleshooting guidance
- **THEN** the owning page accurately explains whether the channel creates both names and that an unrelated pre-existing alias must be moved deliberately
- **AND** canonical package names, installer URLs, configuration, and environment variables remain `arashi`/`ARASHI_*`

#### Scenario: Visitor reads shell guidance

- **WHEN** a visitor reads shell integration or completion documentation
- **THEN** it explains that one managed Arashi block enables parent-shell behavior and native completion for both executable names
- **AND** manual activation continues to use canonical `command arashi` lines
- **AND** troubleshooting explains that an unrelated parent-shell `aw` alias or function is preserved until the user deliberately removes it and re-sources integration

### Requirement: Introductory docs lead naturally with aw
Getting Started and landing guidance SHALL introduce `aw` directly as the command users run, SHALL avoid repeatedly expanding the letters, and SHALL include no more than one concise compatibility note stating that `arashi` remains supported for existing scripts and workflows.

#### Scenario: New user opens Getting Started
- **WHEN** the introductory page renders
- **THEN** its first verification and workflow commands use `aw`
- **AND** it does not repeatedly explain what the letters mean
