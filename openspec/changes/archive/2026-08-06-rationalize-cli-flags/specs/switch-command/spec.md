## ADDED Requirements

### Requirement: Switch exposes canonical behavior and configured-launcher overrides
`arashi switch` SHALL expose `--cd` and `--launch` as canonical explicit behavior choices and `--ignore-configured-launcher` as an orthogonal configured-launcher override. Omission SHALL continue to use configured and contextual resolution, and no new persisted switch mode or launcher value SHALL be introduced.

#### Scenario: Launch overrides configured or contextual cd
- **WHEN** configured `cd` or contextual `auto` would select parent-shell directory switching and the user passes `--launch`
- **THEN** Arashi selects launch behavior for that invocation
- **AND** does not emit a parent-shell directory-change directive

#### Scenario: Launch preserves a configured named launcher
- **WHEN** `defaults.switch.mode` is `sesh` or `herdr` and the user passes `--launch` without `--ignore-configured-launcher`
- **THEN** Arashi retains and invokes the configured named launcher

#### Scenario: Configured launcher is ignored without forcing behavior
- **WHEN** configured mode is `auto`, `cd`, or `launch` and the user passes `--ignore-configured-launcher`
- **THEN** Arashi bypasses configured `sesh` or `herdr` selection
- **AND** preserves that configured or contextual `auto`, `cd`, or `launch` behavior

#### Scenario: Configured named launcher is bypassed but launch behavior is retained
- **WHEN** configured mode is `sesh` or `herdr` and the user passes `--ignore-configured-launcher`
- **THEN** Arashi removes the configured named launcher target
- **AND** retains launch behavior inherited from that configured mode
- **AND** uses automatic launcher resolution rather than contextual parent-shell `cd`

#### Scenario: Generic automatic launch is requested explicitly
- **WHEN** the user passes `--launch --ignore-configured-launcher`
- **THEN** Arashi selects launch behavior
- **AND** bypasses configured `sesh` or `herdr`
- **AND** uses normal automatic launcher resolution

#### Scenario: Explicit launcher remains authoritative
- **WHEN** the user combines `--launch` or `--ignore-configured-launcher` with exactly one explicit launcher selector
- **THEN** Arashi selects launch behavior and uses the explicit launcher
- **AND** retains the existing prerequisite, failure, and no-fallback policy for that launcher

#### Scenario: Tab retains existing disposition policy
- **WHEN** the user combines canonical switch overrides with `--tab`
- **THEN** `--tab` selects launch behavior and tab disposition
- **AND** bypasses configured `sesh` or Herdr defaults as it does when supplied alone
- **AND** an explicit launcher supplied alongside `--tab` remains authoritative
- **AND** the launcher support matrix, JSON guard precedence, and no-window-fallback requirements remain unchanged

#### Scenario: Tab and generic launch overrides are redundant but compatible
- **WHEN** the user combines `--tab` with `--launch` or `--ignore-configured-launcher`
- **THEN** Arashi accepts the same-intent combination
- **AND** performs automatic tab launch resolution unless an explicit launcher is also supplied

### Requirement: Switch rejects contradictory explicit behavior
Arashi SHALL reject explicit parent-shell `--cd` combined with launch intent before selection, launch, directory-change output, or other mutation. The same conflict policy SHALL apply at the Commander action and exported executor boundaries.

#### Scenario: Cd and launch are combined
- **WHEN** a user passes `--cd --launch`
- **THEN** Arashi exits non-zero with an actionable conflicting-switch-options error
- **AND** no target is selected, launched, or used for a directory-change directive

#### Scenario: Cd and every launch class are combined
- **WHEN** `--cd` is combined with `--tab`, `--tmux`, `--sesh`, `--herdr`, or an explicit IDE selector
- **THEN** Arashi rejects the combination through the same conflict class before side effects

#### Scenario: Structured mode precedes switch conflict validation
- **WHEN** `--json` is combined with launch behavior that remains unsupported for switch, with or without another conflicting option
- **THEN** the existing structured unsupported-mode guard retains its normative precedence
- **AND** stdout contains exactly one JSON envelope

### Requirement: Legacy switch spellings remain compatible during deprecation
`--no-cd` SHALL remain a compatibility spelling for canonical `--launch`, and `--no-default-launch` SHALL remain a compatibility spelling for canonical `--ignore-configured-launcher`, throughout Arashi 1.x. Removal MUST occur no earlier than Arashi 2.0 through a separately approved breaking-change issue.

#### Scenario: No-cd maps to launch
- **WHEN** a user passes `--no-cd`
- **THEN** Arashi resolves the same semantic intent and behavior as `--launch`

#### Scenario: No-default-launch maps to configured-launcher bypass
- **WHEN** a user passes `--no-default-launch`
- **THEN** Arashi resolves the same semantic intent and behavior as `--ignore-configured-launcher`

#### Scenario: Synonymous spellings are combined
- **WHEN** a user combines `--launch --no-cd` or `--ignore-configured-launcher --no-default-launch`
- **THEN** Arashi accepts the redundant same-intent combination
- **AND** behavior is identical to supplying only the canonical spelling

#### Scenario: Deprecated spelling is used in structured mode
- **WHEN** a deprecated switch spelling is supplied with `--json`
- **THEN** stdout remains exactly one structured JSON document
- **AND** no human deprecation text is written to stdout

### Requirement: Switch override behavior is covered as a complete matrix
The system SHALL test canonical, legacy, omitted, and conflicting switch overrides across configured `auto`, `cd`, `launch`, `sesh`, and `herdr` modes, with shell integration available and unavailable and with managed context active and inactive.

#### Scenario: Matrix is incomplete
- **WHEN** a switch mode, context branch, canonical override, compatibility spelling, conflict class, or redundant combination lacks an expected resolution case
- **THEN** repository-local semantic validation fails

#### Scenario: Omission retains existing behavior
- **WHEN** the user supplies none of `--cd`, `--launch`, `--ignore-configured-launcher`, or their compatibility spellings
- **THEN** existing configured and contextual switch behavior remains unchanged
