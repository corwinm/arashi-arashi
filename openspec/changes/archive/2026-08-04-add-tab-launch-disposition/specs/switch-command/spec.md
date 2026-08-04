## ADDED Requirements

### Requirement: Support explicit tab disposition when switching
The system SHALL register `--tab` on `arashi switch`, SHALL treat it as CLI-only explicit launch intent with tab disposition, and SHALL propagate it through the same configured and standalone shared-launcher path after target selection. `--tab` SHALL override configured or contextual parent-shell directory switching for that invocation but SHALL NOT alter or persist `defaults.switch.mode`.

#### Scenario: Switch help exposes tab disposition
- **WHEN** a user runs `arashi switch --help`
- **THEN** help states that the default is a new window or equivalent independent session
- **AND** states that `--tab` requests a tab in the selected launcher and can fail when unsupported

#### Scenario: Automatic switch launch receives tab disposition
- **WHEN** the user runs `arashi switch --tab <target>` and behavior resolves to launch
- **THEN** the selected target and disposition `tab` are passed to the shared launcher
- **AND** automatic launcher precedence otherwise remains unchanged

#### Scenario: Tab overrides configured directory switching
- **WHEN** `defaults.switch.mode` is `cd` and the user passes `--tab`
- **THEN** Arashi does not emit a parent-shell directory directive
- **AND** resolves automatic launch with disposition `tab`

#### Scenario: Tab overrides contextual auto directory switching
- **WHEN** contextual `auto` would use shell integration to change the parent-shell directory and the user passes `--tab`
- **THEN** Arashi does not emit a parent-shell directory directive
- **AND** resolves automatic launch with disposition `tab`

#### Scenario: Tab conflicts with parent-shell switching
- **WHEN** the user combines `--tab` with `--cd`
- **THEN** Arashi rejects the invocation before target launch or directory switching
- **AND** instructs the user to choose either parent-shell switching or tab launch

#### Scenario: No-cd remains compatible with tab
- **WHEN** the user passes `--tab --no-cd`
- **THEN** Arashi resolves launch behavior and applies tab disposition

#### Scenario: Tab composes with explicit managed launcher selection
- **WHEN** the user combines `--tab` with `--tmux`, `--sesh`, or `--herdr`
- **THEN** Arashi preserves the explicit launcher selection
- **AND** applies that launcher's normative tab or unsupported mapping rather than reporting a generic launcher conflict

#### Scenario: Tab composes with explicit IDE workspace selection
- **WHEN** the user combines `--tab` with `--vscode`, `--cursor`, or `--kiro`
- **THEN** Arashi preserves the explicit IDE selection
- **AND** returns that launcher's normative `TAB_DISPOSITION_UNSUPPORTED` result rather than a generic option conflict
- **AND** does not reinterpret editor workspace reuse as a terminal tab

#### Scenario: Configured launcher remains subject to tab support
- **WHEN** `defaults.switch.mode` selects `sesh` or `herdr` and the user passes `--tab` without `--no-default-launch`
- **THEN** Arashi retains the configured launcher
- **AND** applies its normative tab or unsupported mapping

#### Scenario: Default-launch opt-out retains explicit tab intent
- **WHEN** the user passes `--tab --no-default-launch`
- **THEN** Arashi bypasses a configured explicit launcher but still performs automatic launch resolution with disposition `tab`

#### Scenario: Standalone switch has disposition parity
- **WHEN** `arashi switch --tab` runs in an implicit standalone repository
- **THEN** it uses the same support resolver and launcher mapping as configured mode
- **AND** does not synthesize or persist Arashi configuration

### Requirement: Preserve structured switch rejection for tab disposition
The system SHALL reject `switch --json` combined with `--tab` at both the Commander action and exported executor before workspace discovery, option-conflict validation, selection, or launch.

#### Scenario: CLI JSON and tab are combined
- **WHEN** a user invokes `arashi switch --json --tab` with or without another conflicting option
- **THEN** stdout contains exactly one existing `JSON_UNSUPPORTED_FOR_MODE` envelope for switch launch mode
- **AND** the process uses the existing switch JSON usage exit code

#### Scenario: Direct executor JSON and tab are combined
- **WHEN** a caller invokes the exported switch executor with `json: true` and `tab: true`
- **THEN** the executor returns the existing numeric JSON usage result
- **AND** performs no workspace discovery, target selection, directory directive, or launch
