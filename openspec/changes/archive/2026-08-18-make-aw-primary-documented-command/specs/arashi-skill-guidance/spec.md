## ADDED Requirements

### Requirement: Authored and packaged skills teach aw
Installed Arashi skill routing, tutorials, command references, troubleshooting, prerequisites, shortcuts, and cheatsheets SHALL use `aw` for actionable CLI commands while preserving Arashi product and machine identifiers. Source and extracted-package semantic checks SHALL enforce the same policy.

#### Scenario: Agent follows installed skill guidance
- **WHEN** an agent copies an actionable command from the installed skill package
- **THEN** the executable spelling is `aw`
- **AND** any required package, URL, `.arashi`, `ARASHI_*`, or native identifier remains unchanged

#### Scenario: Packaged artifact is checked
- **WHEN** the canonical skill archive is created and extracted
- **THEN** the extracted guidance passes the same primary-spelling checks as source
- **AND** repeated archive creation from unchanged inputs is deterministic
