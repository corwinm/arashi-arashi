## ADDED Requirements

### Requirement: Pass host-specific switch overrides from the extension
The extension SHALL detect whether it is running in VS Code, Cursor, or Kiro and SHALL pass the matching `arashi switch` IDE flag when invoking switch flows that do not already specify an explicit launch override.

#### Scenario: VS Code host passes VS Code override
- **WHEN** the extension runs `arashi switch` inside VS Code and no explicit launch override has already been chosen
- **THEN** the extension invokes the CLI with `--vscode`

#### Scenario: Cursor host passes Cursor override
- **WHEN** the extension runs `arashi switch` inside Cursor and no explicit launch override has already been chosen
- **THEN** the extension invokes the CLI with `--cursor`

#### Scenario: Kiro host passes Kiro override
- **WHEN** the extension runs `arashi switch` inside Kiro and no explicit launch override has already been chosen
- **THEN** the extension invokes the CLI with `--kiro`

#### Scenario: Unsupported host omits IDE override
- **WHEN** the extension runs `arashi switch` in a compatible host that does not map to a supported IDE override
- **THEN** the extension invokes the CLI without adding an IDE-specific launch flag
