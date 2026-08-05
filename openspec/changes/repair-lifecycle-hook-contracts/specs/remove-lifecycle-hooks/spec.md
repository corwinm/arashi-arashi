## MODIFIED Requirements

### Requirement: Remove command lifecycle hooks
The system SHALL support remove lifecycle hooks named `pre-remove` and `post-remove` that are discovered for each target repository from repository-local (`repos/<repo>/.arashi/hooks/<hook-name><ext>`), workspace-root (`.arashi/hooks/<hook-name><ext>`), and user-global shared/targeted locations. `<ext>` SHALL be `.sh` on POSIX and `.ps1`, `.cmd`, or `.bat` on Windows; multiple supported candidates for one logical location MUST fail discovery before mutation.

#### Scenario: Remove hooks are configured across scopes
- **WHEN** a user runs `arashi remove` for repository `<repo>` and one native hook file exists in repository-local, workspace-root, and user-global locations
- **THEN** the command evaluates and executes discovered hooks at their lifecycle points in scope order

#### Scenario: Remove hooks are not configured
- **WHEN** a user runs `arashi remove` and one or more remove hook files are absent across all supported locations
- **THEN** the command skips missing hooks without failing solely because the scripts are absent

#### Scenario: Remove hook location is ambiguous on Windows
- **WHEN** a Windows remove hook location contains more than one of `.ps1`, `.cmd`, or `.bat` for the same logical hook
- **THEN** discovery fails before worktree or branch mutation and identifies every candidate

### Requirement: Post-remove hook finalization behavior
The system SHALL execute discovered `post-remove` hooks after remove operations have been attempted, including runs where some remove operations fail. In configured multi-repository mode, each target repository SHALL evaluate its repository, workspace, global-targeted, and global-shared hooks with target-consistent context; workspace and shared hooks therefore execute once per target repository rather than once per command.

#### Scenario: Remove operations fully succeed
- **WHEN** all targeted remove operations complete successfully
- **THEN** discovered `post-remove` hooks run after those operations and before final completion output
- **AND** each configured target evaluates the documented scope order

#### Scenario: Remove operations partially fail
- **WHEN** one or more targeted remove operations fail but the command continues processing remaining targets
- **THEN** applicable `post-remove` hooks still run after operation attempts complete
- **AND** each invocation identifies the repository target whose context it receives

### Requirement: Remove lifecycle hook context
The system SHALL provide remove lifecycle hooks with executor-owned `ARASHI_*` values identifying workspace mode, logical hook name, hook scope, source path, exact execution cwd, canonical main root, and explicit current target repository/source/worktree identity. Per-target scalar branch/worktree values MUST come only from that repository and MUST be omitted when ambiguous. The command SHALL additionally expose `ARASHI_REMOVE_TARGETS_JSON` as a JSON array of `{repository, branchName, worktreePath}` records, using JSON `null` for absent branch/path, removing exact duplicate triples, and sorting by repository, normalized worktree path with null first, then branch with null first. Existing `ARASHI_REPO_*`, `ARASHI_WORKTREE_PATH`, comma-separated remove aggregates, and totals SHALL remain available with the compatibility mapping defined by `lifecycle-hook-contracts`.

#### Scenario: Hook receives one remove target
- **WHEN** a remove lifecycle hook runs for one repository/branch/worktree target
- **THEN** explicit target repository/source/worktree fields and branch context all identify that same target
- **AND** the JSON aggregate contains its complete record

#### Scenario: Hook receives ambiguous branch or worktree targets
- **WHEN** one hook invocation applies to multiple branches or worktrees in its current repository target
- **THEN** ambiguous scalar values are omitted
- **AND** `ARASHI_REMOVE_TARGETS_JSON` preserves every structured target without comma parsing

#### Scenario: Workspace hook runs for successive repositories
- **WHEN** a configured workspace remove hook executes for two repository targets
- **THEN** each invocation receives that invocation's target repository values
- **AND** neither invocation borrows branch or worktree scalars from the other repository

#### Scenario: Operation data conflicts with executor context
- **WHEN** caller-provided operation data contains a reserved hook metadata key
- **THEN** the executor-owned scope, source, name, cwd, and target identity remain authoritative

## ADDED Requirements

### Requirement: Remove lifecycle hooks use the shared timeout and outcome contract
Configured and standalone remove hooks SHALL use the common lifecycle timeout contract and SHALL preserve timeout/nonzero/validation outcomes alongside remove-operation failures.

#### Scenario: Configured timeout applies across remove scopes
- **WHEN** a configured workspace overrides `hooks.timeout`
- **THEN** repository, workspace, global-targeted, and global-shared remove hooks use that value

#### Scenario: Multiple failures occur
- **WHEN** remove operations and one or more post-remove hooks fail or time out
- **THEN** the final result preserves each removal and hook outcome
- **AND** timeout classification is not replaced merely by a later nonzero failure
