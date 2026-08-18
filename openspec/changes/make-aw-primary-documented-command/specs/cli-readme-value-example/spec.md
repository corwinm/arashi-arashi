## ADDED Requirements

### Requirement: CLI README teaches aw first
The CLI README SHALL use `aw` for actionable installation verification, setup, command examples, shell integration, update, and troubleshooting workflows while preserving package/install and native identifier spellings. It SHALL include one concise compatibility note for existing `arashi` scripts and workflows.

#### Scenario: User copies a README workflow
- **WHEN** a user copies an actionable CLI workflow from the README
- **THEN** the executable spelling is `aw`
- **AND** package installation commands still install the `arashi` package
