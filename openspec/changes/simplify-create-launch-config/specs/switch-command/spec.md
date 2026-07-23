## MODIFIED Requirements

### Requirement: Configure switch behavior with one canonical mode

The system SHALL expose `defaults.switch.mode` as the single canonical configured switch choice, SHALL accept `auto`, `cd`, `launch`, `sesh`, and `herdr`, and SHALL NOT advertise `defaults.switch.launchMode` in the generated schema, maintained examples, generated agent-readable exports, or skill guidance. An absent configured mode SHALL preserve automatic launcher selection without preferring parent-shell `cd`. `defaults.create` and editor-scoped create defaults SHALL retain an independent `switch` boolean and SHALL use their own canonical `launch` choice.

#### Scenario: Automatic contextual mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `auto`
- **THEN** Arashi selects a strictly detected managed launcher context before considering parent-shell switching

#### Scenario: Parent-shell mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `cd`
- **THEN** Arashi requests parent-shell switching when shell integration is available

#### Scenario: Automatic launch mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `launch`
- **THEN** Arashi uses automatic launcher selection without preferring parent-shell switching

#### Scenario: Explicit sesh mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `sesh`
- **THEN** Arashi selects the existing explicit sesh launch behavior regardless of shell-integration availability or automatic context detection

#### Scenario: Explicit Herdr mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `herdr`
- **THEN** Arashi selects the existing explicit Herdr launch behavior regardless of shell-integration availability or automatic context detection

#### Scenario: Switch mode is absent

- **WHEN** a configured or standalone repository has no `defaults.switch.mode`
- **THEN** Arashi preserves the existing built-in automatic launch behavior
- **AND** does not newly prefer parent-shell `cd`

#### Scenario: Canonical schema is generated

- **WHEN** Arashi generates its configuration schema
- **THEN** `defaults.switch.mode` enumerates `auto`, `cd`, `launch`, `sesh`, and `herdr`
- **AND** `defaults.switch.launchMode` is not a canonical schema property
- **AND** create defaults expose their independent canonical `launch` choice without create-specific `launchMode`

#### Scenario: Unsupported unified mode is rejected

- **WHEN** `defaults.switch.mode` contains a value outside the supported unified mode set
- **THEN** Arashi rejects the configuration with an actionable validation error before target selection, launch, directory switching, or other workspace mutation

#### Scenario: User-facing switch contracts agree

- **WHEN** Arashi publishes the unified switch configuration model
- **THEN** CLI help and diagnostics, maintained CLI documentation, canonical documentation, generated agent-readable exports, and the Arashi skill package use the same unified mode vocabulary and legacy migration rules
- **AND** none of those canonical surfaces instruct users to compose `defaults.switch.mode` with `defaults.switch.launchMode`
- **AND** references to create defaults use the independent canonical create `launch` choice
