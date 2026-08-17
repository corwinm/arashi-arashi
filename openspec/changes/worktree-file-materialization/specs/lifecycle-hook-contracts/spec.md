## MODIFIED Requirements

### Requirement: Configured create hooks have deterministic lifecycle points
Configured create SHALL execute active hooks and declarative repository materialization in this order: workspace `pre-create` once before branch, worktree, or materialization mutation; repository-specific `pre-create.<repo>` after that repository's Git worktree is materialized; that repository's configured copy entries in array order and symlink entries in array order; repository-specific `post-create.<repo>` after materialization; and workspace `post-create` once after coordinated Git creation/materialization and before move-changes or switch/launch handling. Workspace hooks SHALL run with the configured workspace root as cwd; repository-specific hooks SHALL run with that repository's new worktree as cwd. Any validation failure, timeout, nonzero create-hook exit, or materialization failure MUST fail create and enter the existing owned rollback boundary. Materialization is declarative worktree construction rather than a hook, so `--no-hooks` MUST NOT disable it.

#### Scenario: Workspace pre-create rejects the operation
- **WHEN** configured workspace `pre-create` fails
- **THEN** Arashi creates no branch, worktree, copy, or link
- **AND** reports the workspace hook failure

#### Scenario: Workspace create hook cwd
- **WHEN** configured workspace `pre-create` or `post-create` executes
- **THEN** its cwd and `ARASHI_HOOK_EXECUTION_PATH` are the configured workspace root

#### Scenario: Repository pre-create runs after Git materialization but before declarative materialization
- **WHEN** `pre-create.<repo>` executes
- **THEN** the repository Git worktree already exists
- **AND** the hook cwd and target worktree context identify that new worktree
- **AND** configured copy and symlink entries have not yet been applied

#### Scenario: Repository post-create observes declarative materialization
- **WHEN** a repository has configured copy or symlink entries and its pre-create boundary succeeds
- **THEN** Arashi applies copy entries then symlink entries before `post-create.<repo>`
- **AND** the post hook can rely on every non-skipped entry having succeeded

#### Scenario: Hooks are disabled but materialization remains enabled
- **WHEN** configured create uses `--no-hooks`
- **THEN** no workspace or repository hook is discovered or executed
- **AND** configured repository copy and symlink materialization still runs at the corresponding construction boundary

#### Scenario: Repository materialization fails
- **WHEN** a copy or symlink entry fails after the repository worktree exists
- **THEN** repository post-create does not run
- **AND** create reports the materialization failure and enters owned rollback

#### Scenario: Repository or workspace post-create fails
- **WHEN** a repository-specific or workspace post-create hook fails after worktrees and materialized entries were created
- **THEN** create exits nonzero and rolls back Git and filesystem objects owned by the invocation
- **AND** reports both the hook failure and any rollback warning
