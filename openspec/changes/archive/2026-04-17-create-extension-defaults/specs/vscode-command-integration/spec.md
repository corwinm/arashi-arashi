## ADDED Requirements

### Requirement: Pass editor host context for create invocations
The extension SHALL pass its detected editor host context when invoking `arashi create` so the CLI can resolve editor-scoped create defaults without implying a launch override.

#### Scenario: VS Code create passes VS Code host context
- **WHEN** a user runs `arashi create` from the extension inside VS Code
- **THEN** the extension invokes the CLI with create arguments that identify the host as VS Code for default-resolution purposes

#### Scenario: Cursor create passes Cursor host context
- **WHEN** a user runs `arashi create` from the extension inside Cursor
- **THEN** the extension invokes the CLI with create arguments that identify the host as Cursor for default-resolution purposes

#### Scenario: Unknown host omits create host context
- **WHEN** a user runs `arashi create` from the extension in a compatible host that does not map to a supported editor-host identifier
- **THEN** the extension invokes the CLI without editor-host context and without adding an IDE launch flag on behalf of the user
