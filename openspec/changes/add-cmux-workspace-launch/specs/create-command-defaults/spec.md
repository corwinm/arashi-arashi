## ADDED Requirements

### Requirement: Reuse cmux-aware launch behavior after create
The system SHALL use the shared terminal-aware worktree launcher for post-create launch behavior so cmux-managed invocations create and focus a cmux workspace at the newly created primary worktree.

#### Scenario: Explicit post-create launch uses cmux
- **WHEN** a user runs `arashi create <branch> --launch` from a cmux-managed terminal and worktree creation succeeds
- **THEN** Arashi creates and focuses a cmux workspace rooted at the newly created primary worktree
- **AND** the create result reports launch mode `cmux`

#### Scenario: Configured post-create launch uses cmux
- **WHEN** create launch behavior is enabled by workspace defaults and `arashi create <branch>` succeeds from a cmux-managed terminal
- **THEN** Arashi uses the same cmux workspace launch behavior as `arashi switch`

#### Scenario: Post-create cmux launch fails after worktree creation
- **WHEN** coordinated worktree creation succeeds but cmux workspace creation or response validation fails
- **THEN** Arashi preserves the created worktrees
- **AND** reports an actionable launch failure that distinguishes the completed worktree creation from the failed cmux launch
- **AND** does not fall back to standalone Ghostty
