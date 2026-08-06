## ADDED Requirements

### Requirement: JSON short alias preserves the machine-readable contract
Every command that registers `--json` SHALL also register `-j` as an exact alias, including commands whose requested operation returns a structured unsupported-mode error rather than success.

#### Scenario: JSON-capable command uses short alias
- **WHEN** a user replaces `--json` with `-j` on a JSON-capable command
- **THEN** stdout, envelope schema, warnings, exit code, interactivity, and side effects are identical

#### Scenario: Unsupported JSON mode uses short alias
- **WHEN** a user supplies `-j` for a command or mode that rejects JSON operation
- **THEN** Arashi returns the same one-document structured unsupported-mode error as `--json`
- **AND** does not fall back to human execution

#### Scenario: Json alias and long form are combined
- **WHEN** a user supplies both `-j` and `--json` on one command
- **THEN** Arashi treats them as the same boolean intent
- **AND** emits exactly one JSON document

#### Scenario: Npm wrapper recognizes the JSON alias
- **WHEN** npm-managed `install` or `update` intercepts an invocation containing `-j` before Commander runs
- **THEN** the wrapper applies the same JSON mode, output isolation, envelope, and exit behavior as `--json`
- **AND** does not delegate to an unintended human-mode path

### Requirement: Deprecated option handling preserves structured output isolation
Compatibility spellings accepted during deprecation SHALL NOT add human deprecation prose to JSON stdout and SHALL preserve the command's existing JSON guard and validation precedence.

#### Scenario: Deprecated spelling reaches JSON success
- **WHEN** a deprecated spelling is accepted alongside a successful JSON invocation
- **THEN** stdout contains exactly one success envelope
- **AND** any deprecation signal is represented in the existing structured warnings field or outside stdout according to documented policy

#### Scenario: Deprecated spelling reaches JSON failure
- **WHEN** a deprecated spelling is accepted alongside a JSON invocation that fails or is unsupported
- **THEN** stdout contains exactly one error envelope
- **AND** the original command-specific error/guard precedence remains authoritative

#### Scenario: Human deprecation output is isolated
- **WHEN** a deprecated spelling emits a human migration warning
- **THEN** the warning is written only to stderr
- **AND** it does not alter machine-readable stdout
