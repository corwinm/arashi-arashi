## MODIFIED Requirements

### Requirement: Open a new terminal context at the selected worktree
The system SHALL open a new terminal or editor context rooted at the selected worktree path and SHALL support config-driven default launch behavior with CLI overrides.

#### Scenario: Switch applies configured launch default
- **WHEN** the user runs `arashi switch` and switch launch behavior is configured in workspace defaults
- **THEN** the command launches the configured terminal/editor behavior for the selected worktree

#### Scenario: CLI launch option overrides switch default
- **WHEN** switch launch defaults are configured and the user passes an explicit launch option
- **THEN** the command uses the CLI launch option for that invocation

#### Scenario: User opts out of default launch behavior
- **WHEN** switch launch defaults are configured and the user provides a launch opt-out flag
- **THEN** the command skips configured default launch behavior for that invocation

#### Scenario: No switch launch defaults configured
- **WHEN** the user runs `arashi switch` and no switch launch defaults are configured
- **THEN** the command preserves existing switch launch behavior
