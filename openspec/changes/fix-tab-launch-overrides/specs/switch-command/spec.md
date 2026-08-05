## ADDED Requirements

### Requirement: Explicit tab disposition overrides configured launch defaults

The system SHALL treat `--tab` as an explicit per-invocation launch override for `arashi switch`. When no launcher flag is supplied in the same invocation, `--tab` SHALL bypass a configured `sesh` or `herdr` launcher and use normal automatic launcher resolution with disposition `tab`; the user SHALL NOT need to also pass `--no-default-launch`.

#### Scenario: Tab bypasses configured sesh

- **WHEN** `defaults.switch.mode` is `sesh` and the user runs `arashi switch --tab` without an explicit launcher flag
- **THEN** Arashi bypasses configured sesh
- **AND** uses automatic launcher resolution with disposition `tab`

#### Scenario: Tab bypasses configured Herdr

- **WHEN** `defaults.switch.mode` is `herdr` and the user runs `arashi switch --tab` without an explicit launcher flag
- **THEN** Arashi bypasses configured Herdr
- **AND** uses automatic launcher resolution with disposition `tab`

#### Scenario: Explicit launcher composes with tab

- **WHEN** the user combines `--tab` with one supported explicit launcher flag
- **THEN** Arashi preserves that explicit launcher as authoritative
- **AND** passes disposition `tab` to that launcher

#### Scenario: Redundant default-launch opt-out remains compatible

- **WHEN** the user combines `--tab` with `--no-default-launch`
- **THEN** Arashi produces the same launcher and disposition resolution as `--tab` alone
