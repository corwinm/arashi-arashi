## ADDED Requirements

### Requirement: Implicit standalone create has no persisted command defaults
`arashi create` in implicit standalone mode SHALL resolve behavior from explicit invocation flags and existing built-in defaults without loading or persisting configured create/editor defaults.

#### Scenario: Standalone create has no explicit overrides
- **WHEN** a user runs create in implicit standalone mode without launch or switch overrides
- **THEN** Arashi applies existing built-in command behavior
- **AND** does not infer defaults from another worktree, user-global state, or synthesized configuration

#### Scenario: Standalone create has explicit overrides
- **WHEN** the user supplies supported explicit launch or switch flags
- **THEN** those flags control the invocation under existing precedence rules
- **AND** no command-default configuration is written

#### Scenario: Configured defaults exist
- **WHEN** a valid configured workspace provides create or editor defaults
- **THEN** existing configured default resolution remains authoritative despite a root `.worktrees/` directory
