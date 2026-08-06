## MODIFIED Requirements

### Requirement: Launch supported IDE targets explicitly

The system SHALL provide explicit CLI flags for supported IDE launchers, SHALL resolve each supported flag to an executable target for the selected worktree, and SHALL preserve the requested IDE as authoritative without falling back to another IDE or terminal. The system SHALL prefer the canonical launcher command discovered through PATH. On macOS, when that command is unavailable, the system SHALL resolve verified official bundled launchers from supported system or per-user application locations before reporting that the requested IDE is unavailable.

#### Scenario: Launch VS Code explicitly

- **WHEN** the user runs `arashi switch --vscode`
- **THEN** the system opens the selected worktree in VS Code

#### Scenario: Launch Cursor explicitly

- **WHEN** the user runs `arashi switch --cursor`
- **THEN** the system opens the selected worktree in Cursor

#### Scenario: Launch Kiro explicitly

- **WHEN** the user runs `arashi switch --kiro`
- **THEN** the system opens the selected worktree in Kiro

#### Scenario: PATH launcher takes precedence

- **WHEN** the requested IDE's canonical launcher command is available through PATH and a supported macOS app-bundle launcher also exists
- **THEN** the system invokes the PATH launcher for the selected worktree
- **AND** it does not invoke the app-bundle launcher

#### Scenario: macOS system application bundle supplies the launcher

- **WHEN** the user explicitly requests an IDE on macOS
- **AND** its canonical launcher command is unavailable through PATH
- **AND** a verified official bundled launcher exists in the supported system Applications location
- **THEN** the system invokes that absolute bundled launcher with the selected worktree as one argv element

#### Scenario: macOS user application bundle supplies the launcher

- **WHEN** the user explicitly requests an IDE on macOS
- **AND** its canonical launcher command is unavailable through PATH
- **AND** a verified official bundled launcher exists beneath the current user's Applications directory
- **THEN** the system invokes that absolute bundled launcher with the selected worktree as one argv element

#### Scenario: Explicit IDE launcher is unavailable

- **WHEN** the user requests an explicit IDE launch flag
- **AND** neither its canonical PATH command nor a verified supported platform launcher target is available
- **THEN** the system exits with an actionable error identifying the missing launcher
- **AND** it does not launch another IDE or terminal

#### Scenario: Resolved explicit IDE launcher fails

- **WHEN** the system resolves the requested IDE to a PATH or bundled launcher target
- **AND** that launcher exits unsuccessfully
- **THEN** the system reports the launch failure for the resolved target
- **AND** it does not try another bundle candidate, IDE, or terminal
