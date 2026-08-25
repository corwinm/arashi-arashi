# shell-completions Specification

## Purpose

Define deterministic native Bash, Zsh, and Fish completion behavior derived from Arashi's canonical CLI metadata, including bounded read-only workspace candidates, shell integration, distribution parity, and real-shell acceptance.
## Requirements
### Requirement: Emit native completion programs

Arashi SHALL provide `arashi completion <shell>` for `bash`, `zsh`, and `fish`, and each invocation SHALL write only deterministic, sourceable code for the requested shell to stdout. The emitted program SHALL register completion for direct `arashi` executable invocation and for the same-named wrapper function produced by `arashi shell init <shell>`.

#### Scenario: Supported completion program is requested

- **WHEN** the user runs `arashi completion bash`, `arashi completion zsh`, or `arashi completion fish`
- **THEN** stdout contains only valid completion code for the requested shell
- **AND** sourcing the code in a clean session registers completion for `arashi`

#### Scenario: Completion runs beside the installed wrapper

- **WHEN** a supported shell sources both `arashi shell init <shell>` and `arashi completion <shell>`
- **THEN** tab completion remains attached to the `arashi` wrapper function
- **AND** parent-shell directory switching behavior remains unchanged

#### Scenario: Completion shell is missing or unsupported

- **WHEN** the user omits the shell argument or requests an unsupported shell
- **THEN** Arashi exits unsuccessfully with an actionable error on stderr that lists `bash`, `zsh`, and `fish`
- **AND** stdout contains no partial completion program

### Requirement: Derive static completion from canonical CLI metadata

The completion model SHALL derive command paths, subcommands, option spellings, registered aliases, arguments, descriptions, declared choices, conflicts, and dynamic-candidate classifications from the same Commander program tree and typed command policy used by runtime execution and the generated CLI contract. Arashi MUST NOT maintain a second handwritten command or option inventory. Every adapter SHALL retain descriptions in the shared model; Zsh and Fish SHALL display them through native descriptive menus, while Bash SHALL preserve clean candidate values and native insertion behavior without fabricating descriptions in shells that do not present per-candidate descriptions.

#### Scenario: User completes a command path

- **WHEN** completion is requested at the root or beneath a command with subcommands
- **THEN** every valid registered command or subcommand at that position is offered with its canonical description
- **AND** unregistered command paths are not offered

#### Scenario: User completes root and built-in options

- **WHEN** completion is requested for the root command or a registered command path
- **THEN** applicable Commander-provided help and root version options are offered even when they are not serialized as ordinary command-local options today

#### Scenario: Hidden implementation surface exists

- **WHEN** a command, option, or argument is marked hidden for internal use
- **THEN** interactive completion does not offer that surface
- **AND** public completion metadata does not expose it as recommended usage

#### Scenario: User completes options

- **WHEN** completion is requested in a command context that accepts options
- **THEN** valid long options and every registered short alias are offered with descriptions
- **AND** an option whose declared Commander conflict is already present is not offered

#### Scenario: Native shell cannot display candidate descriptions

- **WHEN** Bash native programmable completion does not provide a per-candidate description presentation channel
- **THEN** canonical command and option descriptions remain present and tested in the shared model
- **AND** Bash candidates contain only insertable values without description text appended or encoded into those values

#### Scenario: User completes a declared choice

- **WHEN** the active argument or option has a finite declared choice set
- **THEN** completion offers only those declared values with available descriptions

#### Scenario: Positional and option boundaries are respected

- **WHEN** the current argument vector includes positional values or the `--` delimiter
- **THEN** completion resolves the active positional slot correctly
- **AND** does not offer options after `--`

#### Scenario: CLI metadata changes without regenerated completion

- **WHEN** a command, subcommand, option, alias, argument, description, choice, conflict, or candidate classification changes without regenerating the embedded completion artifacts
- **THEN** the repository-local freshness check reports the drift and exits unsuccessfully

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

### Requirement: Follow native shell completion conventions

The generated adapters SHALL use native Zsh `compsys`, Bash programmable completion, and Fish `complete` facilities without requiring a plugin manager or completion framework. Zsh activation SHALL initialize completion only when needed and MUST NOT reset or duplicate an existing completion setup.

#### Scenario: Zsh already initialized completion

- **WHEN** the generated Zsh program is sourced after `compinit` or a framework has initialized `compsys`
- **THEN** Arashi registers `_arashi` with `compdef` without reinitializing or resetting the existing completion system

#### Scenario: Clean Bash session sources completion

- **WHEN** the generated Bash program is sourced in a clean supported Bash session
- **THEN** it registers native programmable completion without requiring `bash-completion` or another framework

#### Scenario: Clean Fish session sources completion

- **WHEN** the generated Fish program is sourced in a clean Fish session
- **THEN** it registers native `complete` definitions without requiring a framework

### Requirement: Preserve output, safety, and performance boundaries

Completion program emission and dynamic queries SHALL be inspection-only, SHALL remain free of banners, progress, warnings, prompts, and malformed candidates on stdout, and SHALL not mutate a workspace. Dynamic candidate lookup SHALL use only local state, apply an implementation-defined documented time budget per request, and fail silently to an empty dynamic result when that budget or discovery fails.

#### Scenario: Human logging is enabled elsewhere

- **WHEN** completion emission or a dynamic query executes in an environment where ordinary commands would show banners, progress, or warnings
- **THEN** the completion stdout contract remains machine-only
- **AND** no prompt is attempted

#### Scenario: Dynamic lookup exceeds its budget

- **WHEN** local configuration or Git discovery does not finish within the documented completion budget
- **THEN** Arashi returns no dynamic records without an uncaught error or human-formatted stdout
- **AND** emits no diagnostic on stderr
- **AND** does not terminate or alter the interactive shell

#### Scenario: Completion runs in a real workspace

- **WHEN** completion generation and dynamic queries finish
- **THEN** tracked files, untracked files, Git refs, worktrees, configuration, and shell startup files are unchanged

### Requirement: Distribute identical generated completion behavior

The Bash, Zsh, and Fish completion artifacts SHALL be generated deterministically from one canonical model, embedded into the runtime command, and exposed identically by npm-installed and standalone-binary Arashi distributions.

#### Scenario: Generated artifacts are current

- **WHEN** the completion generation and freshness checks run twice without metadata changes
- **THEN** both runs produce byte-identical artifacts and leave the working tree unchanged

#### Scenario: Npm-installed CLI is exercised

- **WHEN** the packed npm distribution is installed through its canonical binary-install path in a clean fixture
- **THEN** each `arashi completion <shell>` command emits the expected current embedded artifact

#### Scenario: Npm first use installs a missing binary for completion

- **WHEN** the packed npm entrypoint handles `arashi completion <shell>` with no installed platform binary
- **THEN** it installs and verifies the matching binary through the canonical first-use path
- **AND** completion stdout contains only the sourceable shell artifact
- **AND** installer progress or diagnostics are suppressed or routed outside completion stdout

#### Scenario: Standalone binary is exercised

- **WHEN** a compiled standalone Arashi binary is run in a clean fixture
- **THEN** each `arashi completion <shell>` command emits the same completion behavior as the npm-installed CLI

### Requirement: Verify real shell completion behavior

Acceptance tests SHALL exercise completion in real clean Bash, Zsh, and Fish processes rather than relying only on generated-string or snapshot assertions.

#### Scenario: Static and dynamic completion smoke matrix runs

- **WHEN** the completion acceptance suite executes
- **THEN** each supported shell proves direct executable and wrapper-function completion, static discovery outside a workspace, dynamic candidates inside a real temporary workspace, aliases, canonical descriptions with native display where supported, choices, conflicts, positional boundaries, and safe candidate insertion
- **AND** every fixture proves non-mutation and cleans up its temporary state

### Requirement: Register generated completion for both executable names

Each deterministic Bash, Zsh, and Fish completion program SHALL register the same canonical completion model and dynamic query behavior for direct and wrapper-function invocation through `arashi` and `aw`.

#### Scenario: Bash completion is sourced

- **WHEN** a clean Bash session sources the generated completion program
- **THEN** `_arashi` is registered for both `arashi` and `aw`
- **AND** neither name requires `complete_aliases` or a user-defined shell alias

#### Scenario: Zsh completion is sourced

- **WHEN** a clean or already-initialized Zsh completion system sources the generated program
- **THEN** `compdef` associates `_arashi` with both executable names without resetting existing completion state

#### Scenario: Fish completion is sourced

- **WHEN** a clean Fish session sources the generated program
- **THEN** native `complete` definitions invoke the same completion function for `arashi` and `aw`

#### Scenario: Generated alias registration is stale

- **WHEN** a generated shell artifact omits either supported executable name or uses a different candidate model
- **THEN** repository-local generation or freshness validation exits unsuccessfully

### Requirement: Alias completion preserves dynamic and distribution parity

Completion invoked for an `aw` command line SHALL accept `aw` as the root token, query the canonical machine-only backend without recursion, and return the same safe static and dynamic candidates as the equivalent `arashi` command line across source, compiled, npm-installed, and direct-installed distributions.

#### Scenario: Alias dynamic completion runs in a workspace

- **WHEN** completion is requested for an `aw` repository, group, worktree, branch, path, shell, or constrained-value slot
- **THEN** it returns the same values and descriptions as the equivalent `arashi` request
- **AND** preserves local-only, bounded, silent-failure, no-prompt, no-hook, no-network, and non-mutation guarantees

#### Scenario: Alias wrapper-function completion runs

- **WHEN** a supported shell sources both shell integration and completion and completes `aw <arguments>`
- **THEN** completion remains attached to the `aw` parent-shell function
- **AND** parent-shell directive behavior remains intact after completion activation

#### Scenario: Real-shell dual-name matrix runs

- **WHEN** completion acceptance executes in clean Bash, Zsh, and Fish processes
- **THEN** each shell proves equivalent direct and wrapper-function completion for both names, including static and dynamic candidates, conflicts, positional boundaries, descriptions where native, and special-character insertion
- **AND** every fixture proves non-mutation and cleans up temporary state

#### Scenario: Packed npm first use emits alias completion

- **WHEN** a clean packed npm installation runs `aw completion <shell>` with no native binary
- **THEN** canonical first-use installation succeeds
- **AND** stdout contains only the same sourceable artifact emitted by `arashi completion <shell>`

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
