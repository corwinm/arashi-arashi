## MODIFIED Requirements

### Requirement: Generate Markdown handoff reports

The system SHALL provide an `arashi handoff` command that generates a Markdown handoff report for the current configured coordinated workspace or implicit standalone workspace without mutating repository state.

#### Scenario: Markdown report summarizes configured workspace state
- **WHEN** a user runs `arashi handoff` from a configured coordinated workspace
- **THEN** Arashi prints a Markdown report to stdout
- **AND** the report identifies the current workspace path and coordinated branch
- **AND** the report includes a per-repository status summary derived from Arashi workspace inspection
- **AND** the command does not stage, commit, push, delete, or otherwise mutate repository state

#### Scenario: Markdown report summarizes standalone workspace state
- **WHEN** a user runs `arashi handoff` from an implicit standalone workspace
- **THEN** Arashi prints a Markdown report that identifies standalone mode, the main repository root, current branch, and linked worktree state
- **AND** the report does not imply that configured child repositories or coordinated workspace configuration exist
- **AND** the command does not create `.arashi/`, write ignore state, or otherwise mutate repository state

#### Scenario: Command runs from a child repository
- **WHEN** a user runs `arashi handoff` from inside a managed child repository worktree
- **THEN** Arashi resolves the containing coordinated workspace
- **AND** the report identifies the workspace anchor and current child repository context
- **AND** the report includes status for the managed repositories in that coordinated workspace

#### Scenario: Command runs from a standalone linked worktree
- **WHEN** a user runs `arashi handoff` from a linked worktree belonging to an implicit standalone workspace
- **THEN** Arashi resolves the main repository through Git
- **AND** the report identifies the caller worktree and shared standalone workspace

#### Scenario: Workspace cannot be resolved
- **WHEN** a user runs `arashi handoff` outside both configured and implicit standalone Arashi workspaces
- **THEN** Arashi exits non-zero
- **AND** the output explains how to initialize configured mode or prepare zero-config standalone mode where applicable
- **AND** no report with misleading repository state is emitted
