# remove-lifecycle-hooks Specification

## Purpose
TBD - created by archiving change add-pre-remove-and-post-remove-hooks. Update Purpose after archive.
## Requirements
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

### Requirement: Pre-remove hook gates destructive operations
The system SHALL execute discovered `pre-remove` hooks after user confirmation and before any worktree removal or branch deletion, and the command MUST abort destructive operations when any `pre-remove` hook fails.

#### Scenario: All pre-remove hooks succeed
- **WHEN** all discovered `pre-remove` hooks exit successfully
- **THEN** the command proceeds to worktree removal and branch deletion

#### Scenario: A pre-remove hook fails
- **WHEN** any discovered `pre-remove` hook exits non-zero or times out
- **THEN** the command exits with failure and does not remove worktrees or delete branches

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
The system SHALL provide remove lifecycle hooks with executor-owned context defined by `lifecycle-hook-contracts` and `ARASHI_OPERATION=remove`. Per-target scalar branch/worktree values MUST come only from that repository and MUST be omitted when ambiguous. `ARASHI_REMOVE_TARGETS_JSON` SHALL be a JSON array of records shaped exactly as `{ "repository": string, "branchName": string|null, "worktreePath": string|null }`; keys are always present and absent branch/path values are JSON `null`. A worktree path SHALL be made absolute and lexically normalized without filesystem realpath/symlink resolution, use `/` separators on every platform, uppercase a Windows drive letter, preserve a UNC `//server/share` prefix, and omit a trailing separator except at a filesystem root. Exact duplicate triples SHALL be removed after normalization. Records SHALL be sorted by Unicode scalar value of repository name, then normalized worktree path with `null` before strings, then branch name with `null` before strings; locale collation and filesystem enumeration order MUST NOT affect the result.

The 1.x compatibility aggregates SHALL be derived from the canonical records: `ARASHI_REMOVE_TARGET_BRANCHES` is the comma-joined ascending distinct non-null `branchName` values; `ARASHI_REMOVE_TARGET_WORKTREES` is the comma-joined ascending distinct non-null normalized `worktreePath` values; `ARASHI_REMOVE_TARGET_REPOSITORIES` is the comma-joined ascending distinct `repository` values; and `ARASHI_REMOVE_TOTAL_BRANCHES`, `ARASHI_REMOVE_TOTAL_WORKTREES`, and `ARASHI_REMOVE_TOTAL_REPOSITORIES` are base-10 counts of the corresponding distinct lists. Empty lists produce an empty string and count `0`. Because commas inside names/paths cannot be represented reversibly, these fields are lossy and non-canonical; new aggregate consumers MUST parse `ARASHI_REMOVE_TARGETS_JSON`. Existing `ARASHI_REPO_*` and `ARASHI_WORKTREE_PATH` aliases remain available with the mapping defined by `lifecycle-hook-contracts`.

#### Scenario: Hook receives one remove target
- **WHEN** a remove lifecycle hook runs for one repository/branch/worktree target
- **THEN** explicit target repository/source/worktree fields and branch context all identify that same target
- **AND** the JSON aggregate contains its complete record

#### Scenario: Hook receives ambiguous branch or worktree targets
- **WHEN** one hook invocation applies to multiple branches or worktrees in its current repository target
- **THEN** ambiguous scalar values are omitted
- **AND** `ARASHI_REMOVE_TARGETS_JSON` preserves every structured target without comma parsing

#### Scenario: Compatibility aggregates are derived
- **WHEN** remove context contains duplicate, absent, or differently ordered target values
- **THEN** each comma-separated aggregate contains its ascending distinct non-null canonical values
- **AND** each `ARASHI_REMOVE_TOTAL_*` value equals the number of values in its corresponding aggregate list

#### Scenario: Workspace hook runs for successive repositories
- **WHEN** a configured workspace remove hook executes for two repository targets
- **THEN** each invocation receives that invocation's target repository values
- **AND** neither invocation borrows branch or worktree scalars from the other repository

#### Scenario: Operation data conflicts with executor context
- **WHEN** caller-provided operation data contains a reserved hook metadata key
- **THEN** the executor-owned scope, source, name, cwd, and target identity remain authoritative

#### Scenario: Compatibility fields are consumed during 1.x
- **WHEN** a 1.x release executes a hook that reads documented legacy repository/worktree or comma-separated remove fields
- **THEN** those compatibility values remain available with the normative lifecycle mapping
- **AND** removal is deferred to a separately approved 2.0-or-later breaking-change proposal

### Requirement: Hook failures affect command result
The system MUST treat remove lifecycle hook failures as command errors and SHALL report hook failure details in user-visible output.

#### Scenario: Post-remove fails
- **WHEN** any discovered `post-remove` hook exits non-zero or times out
- **THEN** the command reports the hook failure and returns a non-zero exit status

### Requirement: Standalone remove preserves user-global lifecycle hooks
`arashi remove` in implicit standalone mode SHALL execute applicable user-global `pre-remove` and `post-remove` hooks with the existing destructive-operation gate, finalization, context, and failure-result contracts.

#### Scenario: Standalone pre-remove hooks succeed
- **WHEN** all applicable standalone user-global `pre-remove` hooks succeed after confirmation
- **THEN** Arashi proceeds with the planned standalone worktree and branch removals

#### Scenario: Standalone pre-remove hook fails
- **WHEN** an applicable standalone user-global `pre-remove` hook fails or times out
- **THEN** Arashi aborts before removing worktrees or deleting branches
- **AND** reports the hook source and failure

#### Scenario: Standalone removal partially fails
- **WHEN** one or more standalone remove operations fail after successful pre-remove hooks
- **THEN** applicable user-global `post-remove` hooks still run once after operation attempts complete
- **AND** the final result preserves both removal and hook failures

#### Scenario: Standalone remove hook receives context
- **WHEN** a user-global remove hook runs for an implicit standalone workspace
- **THEN** `ARASHI_*` context identifies standalone mode, main-root basename, main repository path, target branch/worktree, hook scope, and source path

### Requirement: Remove lifecycle hooks use the shared timeout and outcome contract
Configured and standalone remove hooks SHALL use the common lifecycle timeout contract and SHALL preserve timeout/nonzero/validation outcomes alongside remove-operation failures.

#### Scenario: Configured timeout applies across remove scopes
- **WHEN** a configured workspace overrides `hooks.timeout`
- **THEN** repository, workspace, global-targeted, and global-shared remove hooks use that value

#### Scenario: Multiple failures occur
- **WHEN** remove operations and one or more post-remove hooks fail or time out
- **THEN** the final result preserves each removal and hook outcome
- **AND** timeout classification is not replaced merely by a later nonzero failure

