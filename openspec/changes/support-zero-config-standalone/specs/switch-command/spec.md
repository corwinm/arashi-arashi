## ADDED Requirements

### Requirement: Switch discovers implicit standalone targets
`arashi switch` SHALL discover and select worktrees belonging to the resolved standalone repository without requiring configured repository entries.

#### Scenario: Standalone worktrees are available
- **WHEN** a user runs switch in an implicit standalone workspace with linked worktrees
- **THEN** each target reports its branch and exact Git worktree path
- **AND** configured repository-name prefixes are not required for matching

#### Scenario: Invocation starts in linked worktree
- **WHEN** switch runs from a standalone linked worktree
- **THEN** target discovery uses the shared main repository worktree list
- **AND** existing launch, shell-integration, ambiguity, and explicit path behavior applies

#### Scenario: No standalone targets exist
- **WHEN** no switchable linked worktree exists
- **THEN** switch preserves its actionable no-target error without creating workspace state
