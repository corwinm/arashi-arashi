## ADDED Requirements

### Requirement: JSON execution rejects explicit plain tmux launch without side effects
The system SHALL represent explicit plain-tmux launch requests that use JSON mode with the existing structured unsupported-mode contract, SHALL emit exactly one JSON document on stdout, and SHALL NOT switch, create, launch tmux, or emit human progress text on stdout.

#### Scenario: Switch JSON rejects explicit tmux
- **WHEN** the user runs `arashi switch --json --tmux <target>`
- **THEN** Arashi returns a structured `JSON_UNSUPPORTED_FOR_MODE` error with the existing `launch` mode label and does not invoke tmux or mutate repository state

#### Scenario: Create JSON rejects explicit tmux before creation
- **WHEN** the user runs `arashi create <branch> --json --tmux`
- **THEN** Arashi returns the structured unsupported-mode error with the existing `interactive-or-launch` mode label before creating worktrees or running hooks

#### Scenario: JSON rejection precedes launcher conflicts and tmux context validation
- **WHEN** the user combines JSON mode with `--tmux` and another explicit launcher, or runs JSON mode with `--tmux` while `TMUX` is absent, empty, or whitespace-only
- **THEN** Arashi returns the command's structured unsupported-mode envelope before runtime conflict or tmux-context errors
- **AND** the same precedence applies through the Commander action and direct exported executor
