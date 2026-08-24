## MODIFIED Requirements

### Requirement: Query workspace-aware candidates safely

Arashi SHALL provide one shell-neutral internal completion query that accepts the current argument vector and cursor position without shell re-parsing and returns values with optional descriptions through a lossless machine-only record protocol. Typed completion policy SHALL map every dynamic slot explicitly: each registered `--only` value segment to repository names; each registered `--group` value segment to configured groups; optional `delete [repository]` to exact configured child repository keys; `switch [filter]` and `remove [target]` to branch/worktree names and paths, narrowed to exact worktree paths when `--path` is present; `move --from` and `move --to` to workspace branch/name/path references; `shell init [shell]` and `completion [shell]` to supported shells; and `create --conflict` plus any later explicitly classified finite-value option to its canonical constrained values. No command or option inherits dynamic completion merely because its value syntax resembles one of these slots.

#### Scenario: Repository selector is active

- **WHEN** completion is requested for `--only` in a configured workspace
- **THEN** the query offers canonical configured repository names that match the current comma-separated or repeated-value segment prefix

#### Scenario: Group selector is active

- **WHEN** completion is requested for `--group` in a configured workspace
- **THEN** the query offers configured group names that match the current comma-separated or repeated-value segment prefix

#### Scenario: Delete repository argument is active

- **WHEN** completion is requested for optional `delete [repository]` from a configured parent, linked parent, or nested configured child invocation
- **THEN** the query offers exact matching keys from the active `config.repos` authority
- **AND** excludes meta/root identity, branch names, paths, fuzzy aliases, and implicit standalone repositories

#### Scenario: Worktree or branch argument is active

- **WHEN** completion is requested for `switch [filter]`, `remove [target]`, `move --from`, or `move --to`
- **THEN** the query offers the matching branch, worktree name, or path values owned by that exact slot from read-only local workspace and Git discovery

#### Scenario: Exact path interpretation is active

- **WHEN** completion is requested for `switch [filter]` or `remove [target]` while `--path` is present
- **THEN** the query offers exact worktree paths rather than branch-only candidates

#### Scenario: Constrained value owner is active

- **WHEN** completion is requested for a supported-shell argument, `create --conflict`, or another option with explicit typed finite-value policy
- **THEN** the query offers only the canonical values owned by that exact argument or option

#### Scenario: Candidate contains shell-sensitive characters

- **WHEN** a candidate value or description contains spaces, tabs, quotes, backslashes, glob characters, or newlines
- **THEN** the internal protocol preserves the complete value and description as separate fields
- **AND** the shell adapter inserts the candidate using that shell's native escaping rules

#### Scenario: Workspace discovery is unavailable

- **WHEN** dynamic completion runs outside an Arashi workspace or configuration or Git metadata cannot be read
- **THEN** the query exits successfully with no dynamic records and no human output
- **AND** stdout and stderr are both empty
- **AND** static command, option, and choice completion remains available

#### Scenario: Dynamic completion is invoked repeatedly

- **WHEN** one completion attempt requires multiple candidate classes
- **THEN** workspace and Git discovery are reused within that attempt
- **AND** no network request, prompt, hook, workspace mutation, or child-repository operation is performed

## ADDED Requirements

### Requirement: Delete completion is read-only and bounded

Delete candidate lookup SHALL read only the active workspace configuration needed to enumerate repository keys. It SHALL derive delete options and aliases from registered CLI metadata and SHALL NOT inspect candidate repository Git status, worktrees, refs, hooks, file contents, or remote state. It SHALL NOT prompt, lock, launch, run hooks, or mutate any workspace state.

#### Scenario: Delete option is active

- **WHEN** completion is requested after `aw delete api -`
- **THEN** registered `--force`, `--dry-run`, `--json` and their command-local aliases are offered with canonical descriptions
- **AND** no handwritten delete option inventory is required

#### Scenario: Destructive plan would be unsafe

- **WHEN** a configured repository is dirty, unpublished, missing, symlinked, or otherwise unsafe to delete
- **THEN** completion may still offer its exact configured key
- **AND** performs none of the destructive planner's Git/filesystem/hook probes

#### Scenario: Standalone or unavailable workspace requests candidates

- **WHEN** delete argument completion runs outside configured workspace state
- **THEN** the dynamic query succeeds silently with no repository records
- **AND** static command/option completion remains available

#### Scenario: Configuration lookup fails or exceeds budget

- **WHEN** active configuration cannot be loaded safely within the completion budget
- **THEN** dynamic completion returns no records with empty stdout/stderr according to the existing silent-failure contract
- **AND** no repair or fallback mutation occurs

#### Scenario: Real-shell parity is exercised

- **WHEN** Bash, Zsh, and Fish acceptance runs for both `aw` and `arashi`
- **THEN** each executable/wrapper spelling offers equivalent delete keys/options with native insertion
- **AND** tracked files, untracked files, refs, worktrees, config, hooks, and shell startup files remain unchanged
