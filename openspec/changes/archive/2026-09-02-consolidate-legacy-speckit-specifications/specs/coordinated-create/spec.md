## ADDED Requirements

### Requirement: Configured create resolves the complete selected repository set before mutation
Configured `aw create <branch>` SHALL validate the workspace, requested branch, repository/group filters, selected repository existence, Git repository state, effective base refs, and target branch/worktree conflicts for the complete selected set before creating a branch or worktree. Omitted filters SHALL select the configured parent and all configured child repositories; explicit selection SHALL leave excluded repositories untouched.

#### Scenario: Default coordinated create is planned
- **WHEN** a user runs configured `aw create feature/x` without repository filters
- **THEN** the accepted plan includes the configured parent and every eligible configured child in deterministic order
- **AND** all knowable blockers are evaluated before mutation

#### Scenario: Filtered create is planned
- **WHEN** a user supplies valid `--only`, `--group`, or interactive repository selection
- **THEN** only the selected repositories are included in planning and execution
- **AND** excluded repositories receive no branch, worktree, hook, or filesystem mutation

### Requirement: Target branch conflicts have explicit bounded outcomes
Configured create SHALL classify an existing selected target branch before mutation and SHALL support only the explicit conflict outcomes `ABORT` and `REUSE_EXISTING`. Abort SHALL create nothing; reuse SHALL use the exact existing local branch where present and create the exact requested branch from the resolved base only where absent. Create SHALL NOT invent alternate branch names.

#### Scenario: Default conflict handling aborts
- **WHEN** a selected repository already has the target branch and no accepted reuse strategy is supplied
- **THEN** create reports the conflicting repository and exits before mutating any selected repository

#### Scenario: Existing branches are reused explicitly
- **WHEN** the user selects `REUSE_EXISTING` for a plan containing existing and missing target branches
- **THEN** existing exact branches are reused and missing exact branches are created from their resolved bases
- **AND** every worktree remains associated with the requested branch name

### Requirement: Coordinated create reports and rolls back invocation-owned work
Configured create SHALL return ordered per-repository outcomes with repository identity, branch, worktree destination, status, warnings, and failure details. If execution fails, it SHALL roll back invocation-created worktrees and branches in reverse dependency order, continue bounded cleanup after an individual rollback failure, preserve pre-existing state, and report both the originating failure and any residual cleanup failures.

#### Scenario: Coordinated create succeeds
- **WHEN** every selected repository is created successfully
- **THEN** output reports each resulting worktree path and a successful overall outcome in deterministic plan order

#### Scenario: A later repository fails
- **WHEN** mutation succeeds for earlier selected repositories and a later repository fails
- **THEN** Arashi removes only invocation-created state in reverse dependency order
- **AND** the final result identifies the failed repository plus any state that could not be rolled back
