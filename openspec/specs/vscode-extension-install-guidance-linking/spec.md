# vscode-extension-install-guidance-linking Specification

## Purpose
TBD - created by archiving change vscode-add-additional-commands. Update Purpose after archive.
## Requirements
### Requirement: Extension README links to canonical install docs
The VSCode extension README SHALL include a link to the docs site installation guidance as the canonical source for Arashi CLI installation.

#### Scenario: User reads installation guidance in README
- **WHEN** a user opens the extension README and reviews installation instructions
- **THEN** the README includes a link to the docs site install guidance

### Requirement: Extension README avoids duplicated install procedures
The extension README MUST avoid embedding full platform-specific installation steps when those steps are maintained on the docs site.

#### Scenario: Installation instructions are maintained centrally
- **WHEN** the README presents how to install the CLI
- **THEN** the README provides a concise direction to the docs site instead of duplicating full install procedures

