## ADDED Requirements

### Requirement: Explicit plain tmux switching
The system SHALL allow plain tmux to be selected by `arashi switch --tmux`, SHALL give that explicit launcher precedence over configured behavior and automatic context detection, and SHALL use the existing argv-safe `tmux new-window -c <worktree-path>` launcher. The configured switch-mode vocabulary SHALL remain unchanged.

#### Scenario: Explicit tmux overrides configured directory switching
- **WHEN** the user runs `arashi switch --tmux <target>` with active tmux evidence and `defaults.switch.mode` is `cd`
- **THEN** Arashi opens the selected worktree in a new plain tmux window instead of emitting a parent-shell directory-change directive

#### Scenario: Explicit tmux overrides a configured launcher
- **WHEN** the user runs `arashi switch --tmux <target>` with active tmux evidence and `defaults.switch.mode` is `sesh` or `herdr`
- **THEN** Arashi invokes plain tmux instead of the configured launcher

#### Scenario: Explicit tmux overrides another managed environment
- **WHEN** the user runs `arashi switch --tmux <target>` with a non-empty `TMUX` value and Herdr, cmux, or integrated IDE evidence is also present
- **THEN** Arashi invokes plain tmux and does not invoke the other detected launcher

#### Scenario: Standalone switch supports explicit tmux
- **WHEN** the user runs `arashi switch --tmux <target>` from a zero-config standalone repository inside tmux
- **THEN** Arashi discovers the standalone worktree target and opens it in a new plain tmux window

#### Scenario: Tmux path remains one argv value
- **WHEN** the selected worktree path contains spaces or shell-significant characters
- **THEN** Arashi passes the exact path as the single argument following `tmux new-window -c` without shell interpolation

#### Scenario: Configuration vocabulary remains unchanged
- **WHEN** Arashi validates or publishes the unified switch configuration contract
- **THEN** `defaults.switch.mode` continues to accept only `auto`, `cd`, `launch`, `sesh`, and `herdr`
- **AND** configured `auto` remains the persistent contextual mode that chooses plain tmux when active tmux evidence is present

### Requirement: Explicit plain tmux selection fails closed
The system SHALL require a non-empty trimmed `TMUX` environment value when `--tmux` is selected, SHALL reject incompatible explicit switch behaviors deterministically, and SHALL NOT fall through to another launcher or directory switching after explicit tmux is selected.

#### Scenario: Explicit tmux outside tmux fails actionably
- **WHEN** the user runs `arashi switch --tmux <target>` without a non-empty `TMUX` value
- **THEN** Arashi returns a usage error explaining that `--tmux` requires an active tmux client or session and invokes no launcher

#### Scenario: Tmux conflicts with directory switching
- **WHEN** the user combines `--tmux` with `--cd`
- **THEN** Arashi rejects the conflicting switch behaviors before switching directories or launching a target

#### Scenario: Tmux is compatible with launch-forcing opt-out of cd
- **WHEN** the user combines `--tmux` with `--no-cd`
- **THEN** Arashi treats both options as launch intent and uses explicit plain tmux

#### Scenario: Explicit tmux remains authoritative over default-launch opt-out
- **WHEN** the user combines `--tmux` with `--no-default-launch`
- **THEN** Arashi bypasses any configured launcher and uses explicit plain tmux

#### Scenario: Tmux conflicts with another explicit launcher
- **WHEN** the user combines `--tmux` with one or more of `--sesh`, `--herdr`, `--vscode`, `--cursor`, or `--kiro`
- **THEN** Arashi reports the complete deterministic set of conflicting explicit launch overrides before invoking a target

### Requirement: Automatic and configured switching remain unchanged without explicit tmux
The system SHALL preserve existing configured launch behavior and automatic tmux, sesh, Herdr, cmux, IDE, parent-shell, terminal-app, and platform fallback behavior when `--tmux` is absent.

#### Scenario: Existing automatic tmux still wins in tmux
- **WHEN** switch behavior is automatic, active tmux evidence is present, and `--tmux` is absent
- **THEN** Arashi uses the existing automatic tmux branch with its existing precedence and result mode

#### Scenario: Existing named configured launchers remain authoritative
- **WHEN** `defaults.switch.mode` is `sesh` or `herdr` and `--tmux` is absent
- **THEN** Arashi preserves the existing configured launcher behavior and opt-out semantics

#### Scenario: Non-tmux automatic contexts retain precedence
- **WHEN** `--tmux` is absent and active tmux evidence is absent
- **THEN** Arashi resolves Herdr, cmux, integrated IDE, parent-shell, terminal-app, and platform fallback exactly as specified by the existing automatic launch contract
