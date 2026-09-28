## ADDED Requirements

### Requirement: Explicit T3 handoff owns post-create context

An explicit `--t3` handoff SHALL suppress configured create switch and terminal/editor launch defaults so that successful creation produces only the requested T3 dispatch. The initial interface SHALL reject simultaneous explicit create switch, terminal/editor launcher, or tab flags before workspace mutation rather than silently ignoring either intent.

#### Scenario: Configured launcher is suppressed

- **WHEN** configured create defaults request switch or launch and the user explicitly requests `--t3`
- **THEN** Arashi performs the T3 handoff without the configured switch or launcher
- **AND** does not open a second terminal, editor, browser, desktop window, sesh session, Herdr workspace, or tmux session

#### Scenario: Explicit launch intent conflicts

- **WHEN** a user combines `--t3` with an explicit create switch, launch, tab, sesh, Herdr, or tmux flag
- **THEN** Arashi rejects the conflicting intents before workspace mutation
- **AND** identifies the flags that must be removed
