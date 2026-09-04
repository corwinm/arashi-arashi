# remove-lifecycle-hooks Specification

## Purpose
TBD - created by archiving change add-pre-remove-and-post-remove-hooks. Update Purpose after archive.
## Requirements
### Requirement: Remove command lifecycle hooks

The system SHALL support configured remove hooks named `pre-remove` and `post-remove` for each target repository. Repository scope SHALL accept exactly one source from repository-owned inline configuration, a workspace-owned repository-specific native file (`.arashi/hooks/<hook-name>.<repo><ext>`), or the compatible repository-local native file (`repos/<repo>/.arashi/hooks/<hook-name><ext>`). Workspace scope SHALL retain `.arashi/hooks/<hook-name><ext>` or root inline configuration, and user-global shared/targeted locations SHALL remain file-only. `<ext>` SHALL be `.sh` on POSIX and `.ps1`, `.cmd`, or `.bat` on Windows. Multiple supported native candidates or multiple claims on one logical location MUST fail discovery before any hook or removal mutation.

#### Scenario: Remove hooks are configured across scopes

- **WHEN** a user removes a target with one valid repository source plus workspace and user-global sources
- **THEN** the command evaluates and executes each discovered hook at its lifecycle point in established scope order

#### Scenario: Workspace-owned repository script is selected

- **WHEN** `.arashi/hooks/pre-remove.<repo><ext>` is the only source claiming repository pre-remove for target `<repo>`
- **THEN** it is selected with repository scope and owner `<repo>`
- **AND** executes from `<repo>`'s configured source checkout with plain hook name `pre-remove`

#### Scenario: Compatible repository-local script remains selected

- **WHEN** `repos/<repo>/.arashi/hooks/pre-remove<ext>` is the only source claiming repository pre-remove
- **THEN** existing repository-scope discovery and execution remain unchanged

#### Scenario: Remove hooks are not configured

- **WHEN** a user runs `arashi remove` and one or more logical locations have no source
- **THEN** the command skips missing hooks without failing solely because they are absent

#### Scenario: Repository location has competing native forms

- **WHEN** workspace-owned repository-specific and repository-local native files claim the same target lifecycle
- **THEN** discovery fails before hook execution, worktree removal, or branch deletion
- **AND** diagnostics identify every candidate path without reading file contents

#### Scenario: Remove hook location is ambiguous on Windows

- **WHEN** one remove hook directory contains more than one case-insensitive `.ps1`, `.cmd`, or `.bat` candidate for the same logical hook
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

### Requirement: Configured remove inline hooks preserve destructive-gate parity
Configured remove SHALL execute resolved repository- and workspace-owned inline `pre-remove` hooks through the same post-confirmation, pre-mutation gate as file-backed hooks. Every enabled target/location SHALL be preflighted before any worktree removal or branch deletion. Any inline ambiguity, unavailable interpreter, validation failure, timeout, or nonzero exit MUST abort all destructive operations and retain the complete evaluated outcome prefix.

#### Scenario: Inline pre-remove succeeds
- **WHEN** all resolved inline and file `pre-remove` hooks succeed after confirmation
- **THEN** remove proceeds to its existing worktree and branch operations

#### Scenario: Inline pre-remove fails
- **WHEN** a repository or workspace inline `pre-remove` fails or times out
- **THEN** no worktree is removed and no branch is deleted
- **AND** human and JSON results identify the source without revealing snippet text

#### Scenario: Preflight fails for a later target
- **WHEN** interpreter or source ambiguity preflight fails for any enabled target before pre-remove execution
- **THEN** remove performs no destructive operation for any target
- **AND** preserves actionable target/location metadata

### Requirement: Configured remove inline post hooks preserve finalization parity
After remove operations have been attempted, configured remove SHALL evaluate eligible repository and workspace inline `post-remove` locations with the same per-target scope ordering, target context, and continuation semantics as files, including when one or more removal operations fail. Inline post-hook failures MUST make the command fail without erasing earlier operation failures, hook failures, timeouts, or successful outcomes.

#### Scenario: Remove operation partially fails
- **WHEN** one target removal fails after successful pre-remove hooks
- **THEN** eligible inline/file `post-remove` hooks still run after operation attempts according to existing finalization behavior
- **AND** the final result preserves operation and hook outcomes

#### Scenario: Multiple post hooks fail differently
- **WHEN** one inline post hook times out and another hook exits nonzero
- **THEN** each per-hook reason remains distinct regardless of completion order
- **AND** neither replaces removal errors

### Requirement: Remove input and output behavior is source-neutral
Configured remove SHALL apply `--no-hook-input`, effective timeout, TTY/unavailable input, JSON-owned quiet behavior, and JSON output rules identically to inline and file sources. `--no-hook-input` and JSON SHALL provide immediate EOF; JSON-owned quiet behavior SHALL suppress human progress without changing outcomes; JSON SHALL remain non-interactive and one-document. This change MUST NOT add or advertise `--no-hooks` for remove.

#### Scenario: Remove option ownership remains unchanged
- **WHEN** remove help and the generated command contract are inspected after inline-hook support is added
- **THEN** remove advertises `--no-hook-input` and does not advertise or accept `--no-hooks`
- **AND** create remains the command that owns the existing `--no-hooks` lifecycle behavior

#### Scenario: Inline remove reads in JSON mode
- **WHEN** an inline remove hook attempts a native read under `--json`
- **THEN** it receives immediate EOF with `ARASHI_HOOK_INPUT=disabled`
- **AND** stdout contains exactly one JSON envelope

#### Scenario: JSON-owned quiet remove executes inline hook
- **WHEN** configured remove executes inline hooks with JSON-owned quiet behavior
- **THEN** human progress and spinner output are suppressed as for files
- **AND** failures, exit status, and structured outcomes remain authoritative

### Requirement: Remove acceptance covers all inline fields and file compatibility
Real temporary configured-workspace tests SHALL activate repository and workspace `pre-remove` and `post-remove`, prove per-target multiplicity and destructive/finalization boundaries, and run through the native production adapters. Existing configured and standalone file-only remove tests SHALL remain green without altered ordering, target context, or outcome behavior.

#### Scenario: All configured remove fields are activated
- **WHEN** acceptance fixtures define all repository and workspace remove lifecycle fields
- **THEN** each field is observed at its exact lifecycle boundary and cwd
- **AND** the fixture proves pre failure blocks mutation while post failure preserves attempted removal state

#### Scenario: File-only remove remains compatible
- **WHEN** no inline values are configured
- **THEN** configured and standalone file discovery, scope order, gating, finalization, and reporting remain unchanged

