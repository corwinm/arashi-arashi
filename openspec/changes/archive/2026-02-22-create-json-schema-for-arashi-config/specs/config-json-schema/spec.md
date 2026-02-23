## ADDED Requirements

### Requirement: Generate schema from canonical TypeScript config model
The system MUST generate a JSON Schema for `.arashi/config.json` from the canonical exported TypeScript `Config` type so runtime config behavior and schema remain aligned.

#### Scenario: Schema generation succeeds from source type
- **WHEN** a contributor runs the schema generation command
- **THEN** the tool produces a schema file from the `Config` type without manual schema authoring

#### Scenario: Generated schema reflects required config fields
- **WHEN** schema generation completes
- **THEN** the generated schema marks canonical required root properties and nested required properties based on the TypeScript model

### Requirement: Enforce strict config structure in schema
The generated schema MUST set `additionalProperties: false` for objects with fixed structure and MUST constrain documented field types so invalid keys and invalid types are rejected.

#### Scenario: Unknown root property is rejected by schema
- **WHEN** a config file includes an unknown root key not defined in the schema
- **THEN** schema validation fails with an additional properties violation

#### Scenario: Invalid property type is rejected by schema
- **WHEN** a config file provides a value with the wrong type for a defined property
- **THEN** schema validation fails for that property

### Requirement: Publish schema at stable Arashi URL
The system MUST publish the generated schema at `https://arashi.haphazard.dev/config.json` for each release so editors and users can resolve a stable public schema endpoint.

#### Scenario: Published docs expose schema path
- **WHEN** docs artifacts are deployed
- **THEN** `https://arashi.haphazard.dev/config.json` resolves to the current generated schema

#### Scenario: Documentation includes version-pinned usage guidance
- **WHEN** a user reads configuration documentation
- **THEN** docs provide guidance for both stable URL usage and version-pinned schema references

### Requirement: Detect schema drift in CI
The project MUST fail CI when the committed schema does not match the schema regenerated from the current TypeScript config model.

#### Scenario: CI fails on stale committed schema
- **WHEN** config types change and schema file is not regenerated
- **THEN** CI reports schema drift and exits with failure

#### Scenario: CI passes when schema is up to date
- **WHEN** committed schema matches regenerated output
- **THEN** schema validation steps in CI succeed
