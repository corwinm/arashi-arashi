## ADDED Requirements

### Requirement: Human output adapts to terminal color capability
Arashi human-readable output SHALL remain understandable without color and SHALL suppress ANSI color decoration when `NO_COLOR` is present or the output channel does not support terminal color. Color SHALL supplement rather than replace textual status and error meaning.

#### Scenario: Color is disabled explicitly
- **WHEN** a user invokes Arashi with a non-empty `NO_COLOR` environment variable
- **THEN** human output contains no ANSI color decoration
- **AND** success, warning, failure, and status meaning remain explicit in text

#### Scenario: Output is redirected
- **WHEN** human-readable output is written to a non-terminal channel
- **THEN** Arashi emits stable readable text without requiring color interpretation

### Requirement: Interactive cancellation is a non-mutating usage outcome
A prompt cancelled before an accepted mutation plan SHALL exit with usage status `2`, SHALL identify cancellation without presenting it as an internal error, and SHALL perform no mutation that depends on the cancelled answer.

#### Scenario: User cancels repository selection
- **WHEN** the user cancels an interactive selector before confirming a command plan
- **THEN** Arashi exits with status `2` and reports that selection was cancelled
- **AND** no branch, worktree, configuration, hook, or repository mutation begins

### Requirement: Interrupted prompts restore terminal state
Arashi SHALL restore terminal cursor, raw-mode, and prompt rendering state when an interactive prompt is interrupted or fails, and SHALL return a non-success outcome without claiming completion.

#### Scenario: User interrupts a prompt
- **WHEN** the user sends an interrupt while an Arashi prompt is active
- **THEN** the prompt terminates and the terminal is restored to a usable state
- **AND** the command does not report successful mutation
