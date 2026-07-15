# zero-config-standalone-workspaces Specification

## Purpose
TBD - created by archiving change support-zero-config-standalone. Update Purpose after archive.
## Requirements
### Requirement: Arashi discovers implicit standalone workspaces through Git
Arashi SHALL recognize a non-bare Git repository as an implicit standalone workspace when its main worktree has a root-level `.worktrees/` directory and no `.arashi/config.json`.

#### Scenario: Main worktree contains the convention
- **WHEN** a user invokes a supported standalone command anywhere inside a non-bare repository whose main worktree contains `.worktrees/` and no `.arashi/config.json`
- **THEN** Arashi resolves the main worktree as an implicit standalone workspace
- **AND** reports the workspace mode as standalone where the command exposes workspace metadata

#### Scenario: Invocation starts in a linked worktree
- **WHEN** a user invokes a supported standalone command from a linked worktree belonging to a repository whose main worktree contains `.worktrees/`
- **THEN** Arashi resolves the same main-worktree workspace and shared worktree set through Git
- **AND** does not require `.worktrees/` or `.arashi/` to exist inside the linked worktree

#### Scenario: Worktrees convention is absent
- **WHEN** a non-bare Git repository has neither `.arashi/config.json` nor a main-root `.worktrees/` directory and the user invokes a command that requires workspace context
- **THEN** Arashi preserves the existing guidance to run `arashi init`
- **AND** does not synthesize workspace state

#### Scenario: List remains configuration-optional
- **WHEN** a user runs `arashi list` in a Git repository with neither `.arashi/config.json` nor a main-root `.worktrees/` directory
- **THEN** list preserves its existing configuration-optional Git worktree discovery behavior
- **AND** does not identify the repository as an implicit standalone Arashi workspace

#### Scenario: Repository is bare
- **WHEN** a bare repository has no configured Arashi workspace
- **THEN** Arashi does not classify it as an implicit standalone workspace solely because a `.worktrees` path exists

### Requirement: Persisted configuration takes precedence over implicit mode
Arashi MUST treat an existing `.arashi/config.json` at the resolved workspace root as authoritative and MUST synthesize standalone configuration only after confirming that the file is absent.

#### Scenario: Valid configuration and worktrees convention both exist
- **WHEN** the main worktree contains both a valid `.arashi/config.json` and `.worktrees/`
- **THEN** Arashi loads configured workspace behavior
- **AND** does not replace configured paths, repositories, hooks, or defaults with standalone values

#### Scenario: Invocation worktree contains valid configuration
- **WHEN** the user invokes Arashi from a linked worktree whose root or enclosing coordinated workspace contains a valid `.arashi/config.json`
- **THEN** Arashi preserves configured-workspace discovery from that invocation path
- **AND** does not replace it with the main repository's implicit `.worktrees/` convention

#### Scenario: Existing configuration is malformed
- **WHEN** `.arashi/config.json` exists but cannot be parsed
- **THEN** Arashi reports the configuration parse failure
- **AND** does not fall back to standalone mode

#### Scenario: Existing configuration is invalid or unsupported
- **WHEN** `.arashi/config.json` exists but fails validation, uses an unsupported version, or cannot be read
- **THEN** Arashi preserves the specific configuration error
- **AND** performs no implicit fallback mutation

#### Scenario: Invocation worktree contains invalid configuration
- **WHEN** the user invokes Arashi from a linked worktree whose discovered `.arashi/config.json` is malformed, invalid, unsupported, or unreadable
- **THEN** Arashi reports that configuration failure
- **AND** does not fall back to a `.worktrees/` convention from the repository's main worktree

#### Scenario: External linked worktree belongs to a managed child
- **WHEN** an invocation starts in an externally located linked worktree whose Git main root is a child of an enclosing configured Arashi workspace
- **THEN** Arashi re-runs configured discovery from that main root and resolves the enclosing workspace
- **AND** does not classify the child as implicit standalone even if its main root contains `.worktrees/`

### Requirement: Implicit standalone configuration remains in memory only
Arashi SHALL model an implicit workspace with version `1.0.0`, `reposDir` equal to `./repos`, `worktreesDir` equal to `.worktrees`, and an empty configured repository map without persisting that configuration.

#### Scenario: Supported lifecycle command completes
- **WHEN** a supported command runs in implicit standalone mode
- **THEN** Arashi uses the synthesized values only for that invocation
- **AND** does not create `.arashi/`, `.arashi/config.json`, hooks, managed-ignore preferences, or repository entries

#### Scenario: Standalone command fails or rolls back
- **WHEN** a standalone lifecycle command fails before completion or rolls back its Git/filesystem mutations
- **THEN** no implicit configuration file or `.arashi/` directory remains

### Requirement: Zero-config initialization prepares only the local convention
`arashi init --zero-config` SHALL prepare the root `.worktrees/` convention in an existing non-bare Git repository without creating configured workspace state.

#### Scenario: Repository needs directory and local exclude rule
- **WHEN** a user runs `arashi init --zero-config` and the main root lacks `.worktrees/` and no effective ignore rule covers it
- **THEN** Arashi creates the main-root `.worktrees/` directory
- **AND** appends `.worktrees/` to the repository-local exclude file resolved through Git
- **AND** does not modify tracked `.gitignore`, global Git configuration, `.arashi/`, or `.arashi/config.json`

#### Scenario: Existing effective rule applies
- **WHEN** `git check-ignore --no-index` reports that a tracked, repository-local, or existing global rule covers the deterministic `.worktrees/.arashi-ignore-probe` descendant
- **THEN** zero-config initialization honors the effective rule without adding a duplicate local rule

#### Scenario: Directory-only or negated rule does not cover the bootstrap probe
- **WHEN** Git does not report the deterministic `.worktrees/.arashi-ignore-probe` as ignored because a rule covers only another path or an effective negation exposes descendants
- **THEN** zero-config initialization adds the repository-local `.worktrees/` rule
- **AND** later standalone create still verifies its exact destination independently

#### Scenario: Higher-precedence rule defeats the local exclude
- **WHEN** Arashi adds the repository-local `.worktrees/` rule but Git still reports the deterministic descendant as unignored because a higher-precedence rule exposes it
- **THEN** zero-config initialization restores the prior local exclude content
- **AND** exits non-zero with guidance identifying the effective conflict instead of claiming the convention is safe

#### Scenario: Initialization is repeated
- **WHEN** `arashi init --zero-config` runs repeatedly after the convention is prepared
- **THEN** the directory, rule, headings, and existing exclude content are not duplicated or rewritten
- **AND** the result reports no new change

#### Scenario: Local exclude content lacks a trailing newline
- **WHEN** the repository-local exclude file has existing content without a final newline and needs the `.worktrees/` rule
- **THEN** Arashi preserves the existing bytes and adds a valid line boundary before the new rule

#### Scenario: Dry-run previews bootstrap
- **WHEN** a user runs `arashi init --zero-config --dry-run`
- **THEN** Arashi reports planned directory creation and effective/local-exclude action
- **AND** does not modify the filesystem, ignore files, or Git configuration

#### Scenario: Bootstrap fails after partial mutation
- **WHEN** zero-config initialization changes the directory or local exclude and a later bootstrap step fails
- **THEN** Arashi restores the exact prior exclude content and removes only a newly created empty `.worktrees/` directory
- **AND** reports any restoration failure separately from the original failure

### Requirement: Zero-config initialization rejects incompatible state before mutation
Arashi MUST validate zero-config eligibility and incompatible initialization options before creating directories or writing the local exclude file.

#### Scenario: Configured workspace already exists
- **WHEN** a repository has `.arashi/config.json` and the user requests `init --zero-config`
- **THEN** Arashi exits with guidance distinguishing configured and zero-config modes
- **AND** performs no zero-config mutation

#### Scenario: Configuration-producing options are combined
- **WHEN** `--zero-config` is combined with `--repos-dir`, `--worktrees-dir`, `--ignore-scope`, `--force`, or `--no-discover`
- **THEN** Arashi rejects the incompatible combination before mutation
- **AND** identifies the conflicting option or mode

#### Scenario: Output and preview options are combined
- **WHEN** `--zero-config` is combined with any of `--dry-run`, `--verbose`, or `--json`
- **THEN** Arashi accepts the combination and applies the corresponding preview, diagnostic, or structured-output contract
- **AND** `--json` suppresses verbose human stdout

#### Scenario: Invocation is not in a non-bare Git repository
- **WHEN** a user runs `init --zero-config` outside Git or in an unsupported bare repository
- **THEN** Arashi exits non-zero with actionable eligibility guidance
- **AND** creates no workspace files

### Requirement: Standalone creation uses the natural branch path
`arashi create <branch>` in implicit standalone mode SHALL create one linked worktree at `<main-root>/.worktrees/<branch>` for the resolved repository.

#### Scenario: Simple branch is created
- **WHEN** a user runs `arashi create feature-x` in a healthy implicit standalone workspace
- **THEN** Arashi creates exactly one worktree at `.worktrees/feature-x`
- **AND** does not add a repository-name prefix or write implicit configuration

#### Scenario: Branch contains slashes
- **WHEN** a user runs `arashi create feat/example`
- **THEN** Arashi creates the worktree at `.worktrees/feat/example`
- **AND** preserves the branch's natural nested path structure

#### Scenario: Slash-branch creation rolls back
- **WHEN** standalone creation of a slash-containing branch fails after creating one or more destination parent directories
- **THEN** rollback removes only parent directories created by that invocation that remain empty and unused
- **AND** preserves pre-existing parents such as `.worktrees/feat/`, non-empty directories, and every path required by a surviving worktree

#### Scenario: Invocation starts in an existing linked worktree
- **WHEN** a user creates another branch from a linked worktree in the implicit workspace
- **THEN** the new worktree is created under the main root's `.worktrees/`
- **AND** normal branch conflict, applicable user-global hook, and rollback rules apply

### Requirement: Creation requires effective ignore safety before mutation
Arashi MUST verify through Git that the exact normalized `.worktrees/<branch>` destination is effectively ignored before standalone create performs any branch, directory, worktree, or hook mutation.

#### Scenario: Manually created directory is not ignored
- **WHEN** implicit discovery succeeds because `.worktrees/` exists but Git reports no effective ignore rule for the exact requested destination
- **THEN** `arashi create` exits non-zero before mutation
- **AND** recommends `arashi init --zero-config` or adding `.worktrees/` to the repository-local exclude file

#### Scenario: Parent rule is negated for the requested destination
- **WHEN** an ignore rule covers `.worktrees/` generally but a later effective negation or selective pattern exposes the requested `.worktrees/<branch>` destination
- **THEN** standalone create treats the exact destination as unignored and blocks before mutation

#### Scenario: Selective rule covers the requested destination
- **WHEN** Git reports that the exact requested `.worktrees/<branch>` destination is ignored by an effective tracked, local, or global rule even though other descendants may not be ignored
- **THEN** standalone create proceeds for that destination without rewriting ignore state

#### Scenario: Dry-run finds an ignore blocker
- **WHEN** a user runs `arashi create <branch> --dry-run` with an unignored exact `.worktrees/<branch>` destination
- **THEN** the plan is blocked, identifies the exact destination, and identifies ignore safety as the blocker
- **AND** no branch, directory, worktree, ignore rule, or config is created

#### Scenario: Existing effective ignore rule permits creation
- **WHEN** Git reports a tracked, repository-local, or global rule that effectively ignores the exact normalized `.worktrees/<branch>` destination
- **THEN** standalone creation proceeds without rewriting that rule or another ignore source

### Requirement: Standalone lifecycle hooks preserve global policy
Standalone create and remove lifecycles SHALL execute applicable shared and repository-targeted user-global hooks while treating repository-local and workspace-root hook scopes as configured-mode capabilities.

#### Scenario: Shared user-global hook exists
- **WHEN** a standalone create or remove lifecycle has a matching `~/.arashi/hooks/<lifecycle>.sh`
- **THEN** Arashi executes the hook at the existing lifecycle point with the main repository as its working directory
- **AND** exposes standalone workspace mode in hook context

#### Scenario: Repository-targeted user-global hook exists
- **WHEN** `~/.arashi/hooks/<main-root-basename>/<lifecycle>.sh` exists for the standalone repository
- **THEN** Arashi applies it to that repository using existing targeted-before-shared ordering

#### Scenario: Local hook directories exist without configuration
- **WHEN** a configless repository contains repository-root `.arashi/hooks` content but no `.arashi/config.json`
- **THEN** zero-config mode does not activate repository-local or workspace-root hook scopes
- **AND** recommends configured mode when those hook capabilities are required

#### Scenario: Standalone pre-remove hook fails
- **WHEN** any applicable user-global `pre-remove` hook fails or times out
- **THEN** Arashi aborts worktree removal and branch deletion under the existing destructive-operation gate

#### Scenario: Standalone post-remove hook fails
- **WHEN** an applicable user-global `post-remove` hook fails after removal attempts
- **THEN** Arashi preserves existing finalization and non-zero result behavior

### Requirement: Single-repository lifecycle commands support implicit mode
Arashi SHALL support `list`, `status`, `switch`, `remove`, `prune`, `doctor`, `move`, and `handoff` against the resolved standalone repository where each command is otherwise applicable.

#### Scenario: Full lifecycle completes
- **WHEN** a real temporary configless repository is bootstrapped and a user creates, lists, checks status, switches to, and removes a worktree
- **THEN** every command operates on the same main-repository worktree set
- **AND** the final Git worktree list and filesystem state reflect the requested removal without `.arashi/` creation

#### Scenario: Cleanup runs when ignore state is missing
- **WHEN** `.worktrees/` exists but is not ignored and the user runs `list`, `status`, `switch`, `remove`, `prune`, `doctor`, `move`, or `handoff`
- **THEN** Arashi still recognizes the implicit workspace
- **AND** non-creating commands remain non-mutating except for the command's explicitly requested cleanup or movement operation

#### Scenario: Standalone move preserves one-repository scope
- **WHEN** a user moves eligible uncommitted changes between worktrees in an implicit workspace
- **THEN** Arashi limits source and target discovery to worktrees of the resolved repository
- **AND** preserves the existing move validation and rollback contract

### Requirement: Coordination-only behavior remains configured-only
Commands and options whose semantics require persisted child repositories, groups, hooks, or coordinated selection MUST reject implicit standalone context clearly.

#### Scenario: Child-repository command is invoked
- **WHEN** a user runs `add`, `clone`, or `sync` in an implicit standalone workspace
- **THEN** Arashi exits non-zero with guidance to run ordinary `arashi init` for configured coordination
- **AND** performs no partial configuration or repository mutation

#### Scenario: Meaningless repository filter is supplied
- **WHEN** a user passes `--only`, `--group`, or interactive multi-repository selection to a standalone lifecycle command where the filter cannot be meaningful
- **THEN** Arashi rejects the option before mutation
- **AND** does not silently ignore the filter, broaden scope, or reinterpret it as the standalone repository

#### Scenario: Switch repository scope is supplied
- **WHEN** a user passes switch repository-scope flags such as `--repos` or `--all` in implicit standalone mode
- **THEN** Arashi rejects the meaningless multi-repository scope before target selection or launch
- **AND** explains that ordinary standalone switch already operates on the resolved repository's worktrees

#### Scenario: Other coordinated command is audited
- **WHEN** a command depends on configured repository maps, groups, hooks, setup, pull, push, or cross-repository execution
- **THEN** its standalone support is explicitly classified as supported single-repository behavior or configured-only with a reason
- **AND** it cannot accidentally succeed as an empty configured workspace

### Requirement: Human output identifies standalone behavior consistently
Human-readable output for workspace-aware standalone lifecycle commands SHALL identify implicit standalone mode and use single-repository terminology without leaking configured-workspace assumptions.

#### Scenario: Human lifecycle command succeeds
- **WHEN** a user runs a human-output init, status, create, list, switch, remove, prune, doctor, move, or handoff operation in implicit standalone mode or zero-config bootstrap
- **THEN** output identifies standalone mode at the command's workspace summary or result boundary
- **AND** reports the main repository and exact worktree paths without configured child-repository labels

#### Scenario: Human command runs from linked worktree
- **WHEN** a human-output standalone command is invoked from a linked worktree
- **THEN** output distinguishes the caller worktree from the resolved main repository root where relevant
- **AND** does not imply that the linked worktree is a configured workspace root

#### Scenario: Human create reports ignore blocker
- **WHEN** standalone create or create dry-run finds the exact destination unignored
- **THEN** human output identifies standalone mode, the blocked destination, and `arashi init --zero-config` or repository-local exclude guidance
- **AND** does not claim configured managed-ignore reconciliation occurred

#### Scenario: Human configured-only command is rejected
- **WHEN** a configured-only command or meaningless repository/group scope is used in implicit standalone mode
- **THEN** human output explains that the command requires configured mode and suggests ordinary `arashi init`
- **AND** does not describe the failure as an undiscovered or empty child repository set

### Requirement: Documentation presents standalone mode as supported
Arashi documentation SHALL teach zero-config standalone mode as a first-class one-repository workflow and SHALL distinguish it from configured mode.

#### Scenario: User follows explicit bootstrap workflow
- **WHEN** a user reads the standalone workflow
- **THEN** it shows `arashi init --zero-config` followed by create, list, status, switch, and remove examples
- **AND** shows the resulting `.worktrees/<branch>` layout

#### Scenario: User needs configured capabilities
- **WHEN** a user needs child repositories, groups, hooks, defaults, custom paths, or coordination
- **THEN** documentation contrasts configured `.arashi` mode and explains upgrading with ordinary `arashi init`
- **AND** links the workflow from Getting Started and relevant command pages
