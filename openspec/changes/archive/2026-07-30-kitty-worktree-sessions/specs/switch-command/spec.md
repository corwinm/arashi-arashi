## ADDED Requirements

### Requirement: Launch selected worktrees as managed Kitty sessions
The system SHALL use the managed Kitty worktree-session contract when automatic launch behavior applies in a positively detected supported Kitty context, SHALL report launch mode `kitty`, and SHALL reuse the same live worktree window instead of creating duplicate tabs during ordinary repeated switches.

#### Scenario: Switch creates a Kitty worktree session
- **WHEN** automatic launch applies, no higher-precedence launcher is selected, the invocation is in supported Kitty, and no exact live worktree match exists
- **THEN** `arashi switch <target>` creates and focuses a validated Kitty session-backed tab rooted at the exact selected worktree path
- **AND** the switch result reports mode `kitty`

#### Scenario: Repeated switch reuses Kitty
- **WHEN** the selected worktree already has a valid exact Arashi-marked Kitty window
- **THEN** `arashi switch <target>` focuses and validates that window
- **AND** does not create another tab

#### Scenario: Managed Kitty launch fails closed
- **WHEN** Kitty is positively selected but version preflight, remote control, inspection, focus, launch, race reconciliation, or state validation fails
- **THEN** switch returns actionable `LAUNCH_FAILED` detail
- **AND** does not fall through to directory switching, an IDE, another terminal, generic Kitty startup, or platform fallback

### Requirement: Preserve launcher precedence when Kitty is active
The system SHALL keep explicit launcher overrides and configured non-auto modes authoritative, SHALL preserve automatic tmux, Herdr, cmux, and strictly detected supported IDE precedence over managed Kitty, and SHALL select managed Kitty before generic terminal/platform fallback.

#### Scenario: Tmux nested in Kitty remains tmux
- **WHEN** automatic launch applies and both non-empty tmux and Kitty evidence are present
- **THEN** Arashi uses the existing automatic tmux launcher rather than managed Kitty

#### Scenario: Higher-precedence managed context appears with Kitty
- **WHEN** automatic launch applies, Kitty evidence appears with Herdr, cmux, or strictly detected supported IDE evidence, and no higher explicit or configured selection exists
- **THEN** Arashi preserves the existing Herdr-before-cmux-before-IDE order and does not select Kitty first

#### Scenario: Configured behavior remains authoritative in Kitty
- **WHEN** a configured non-auto `cd`, `sesh`, or `herdr` mode applies in a Kitty terminal
- **THEN** Arashi follows that configured mode under the existing availability and opt-out rules instead of automatically selecting Kitty

#### Scenario: Generic fallback is reached outside Kitty
- **WHEN** automatic launch applies but no positive managed Kitty or higher-precedence context is detected
- **THEN** Arashi preserves existing terminal-application and platform fallback behavior
