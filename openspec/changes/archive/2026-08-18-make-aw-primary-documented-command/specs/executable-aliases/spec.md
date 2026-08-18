## ADDED Requirements

### Requirement: Primary documented command spelling
Maintained user-facing command examples, quick starts, tutorials, recommended workflows, troubleshooting steps, shell guidance, completion guidance, and update guidance SHALL use `aw` as the primary executable spelling. The `arashi` executable SHALL remain supported for existing scripts and workflows, and maintained introductory guidance SHALL state that compatibility concisely without describing `arashi` as preferred or canonical documentation vocabulary.

#### Scenario: New user follows introductory guidance
- **WHEN** a user follows a maintained introductory workflow
- **THEN** actionable commands use `aw`
- **AND** one concise note states that `arashi` remains supported for existing scripts and workflows

#### Scenario: Existing script invokes legacy spelling
- **WHEN** an existing script invokes a supported `arashi` command
- **THEN** runtime behavior remains supported and equivalent
- **AND** no new deprecation warning or removal behavior is introduced

### Requirement: Identifier boundaries remain stable
The naming migration MUST preserve Arashi product naming and all `arashi` package, repository, URL, `.arashi` configuration/schema, `ARASHI_*` environment-variable, native-binary, installer payload, extension-command, and other machine identifier spellings.

#### Scenario: Maintained content references an identifier
- **WHEN** maintained content references `npm install -g arashi`, an Arashi URL/repository, `.arashi`, an `ARASHI_*` variable, a native binary, or an extension identifier
- **THEN** the identifier retains its exact established spelling
- **AND** semantic validation does not classify it as a preferred-command regression
