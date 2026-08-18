## ADDED Requirements

### Requirement: Introductory docs lead naturally with aw
Getting Started and landing guidance SHALL introduce `aw` directly as the command users run, SHALL avoid repeatedly expanding the letters, and SHALL include no more than one concise compatibility note stating that `arashi` remains supported for existing scripts and workflows.

#### Scenario: New user opens Getting Started
- **WHEN** the introductory page renders
- **THEN** its first verification and workflow commands use `aw`
- **AND** it does not repeatedly explain what the letters mean
