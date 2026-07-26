# init-repository-aware-worktree-default Specification

## Purpose
Define repository-aware configured-init defaults, canonical bare-root resolution, preference and override precedence, rollback safety, and downstream worktree placement behavior.

## Requirements
### Requirement: Configured init resolves repository type and canonical bare root
Configured `arashi init` SHALL use Git to classify an existing repository and SHALL canonicalize a bare invocation to Git's absolute bare repository directory before reading or writing configuration.

#### Scenario: Init runs at bare root
- **WHEN** configured init is invoked at an existing bare Git repository root
- **THEN** Arashi uses that bare repository directory as `workspaceRoot`
- **AND** classifies the workspace as bare

#### Scenario: Init runs below bare root
- **WHEN** configured init is invoked from a Git-discoverable descendant such as `<bare-root>/objects`
- **THEN** Arashi resolves `workspaceRoot` to the canonical bare repository directory
- **AND** does not create configuration, hooks, or repositories beneath the invocation subdirectory

#### Scenario: Existing repository classification fails
- **WHEN** Git cannot return an exact repository type or canonical bare directory for an existing repository
- **THEN** initialization fails with an actionable structured error before managed-ignore or workspace mutation
- **AND** Arashi does not guess a root or worktree default

### Requirement: Configured init selects the omitted worktree location from repository type
Configured init SHALL use `..` for a canonical bare repository and `.arashi/worktrees` for a non-bare repository when `--worktrees-dir` is omitted.

#### Scenario: Bare repository receives parent default
- **WHEN** configured init resolves an existing bare Git repository and `--worktrees-dir` is omitted
- **THEN** Arashi resolves the worktree location to `..`
- **AND** persists `"worktreesDir": ".."` at the canonical bare root

#### Scenario: Non-bare repository retains managed-directory default
- **WHEN** configured init resolves a non-bare Git repository and `--worktrees-dir` is omitted
- **THEN** Arashi resolves and persists `.arashi/worktrees`

#### Scenario: Explicit bare-repository override wins
- **WHEN** configured init resolves a bare Git repository and receives a valid explicit `--worktrees-dir <path>`
- **THEN** Arashi normalizes and persists the explicit path
- **AND** does not replace it with `..`

#### Scenario: Explicit non-bare override wins
- **WHEN** configured init resolves a non-bare Git repository and receives a valid explicit `--worktrees-dir <path>`
- **THEN** Arashi normalizes and persists the explicit path
- **AND** does not replace it with `.arashi/worktrees`

### Requirement: Non-bare bootstrap retains deterministic defaults
Interactive and dry-run repository bootstrap SHALL remain non-bare and SHALL not require a Git bare probe against a repository that does not yet exist.

#### Scenario: Current-directory bootstrap applies
- **WHEN** configured init bootstraps the current directory with plain `git init`
- **THEN** the resolution is non-bare and persists `.arashi/worktrees` when no explicit option is supplied

#### Scenario: Child-directory bootstrap applies
- **WHEN** configured init creates and bootstraps a selected child directory
- **THEN** the resolution is non-bare and persists `.arashi/worktrees` when no explicit option is supplied

#### Scenario: Bootstrap dry-run is synthetic and non-mutating
- **WHEN** configured init previews current-directory or child-directory bootstrap under `--dry-run`
- **THEN** it reports the non-bare `.arashi/worktrees` default without probing a nonexistent repository
- **AND** creates no directory or Git repository

### Requirement: Repository-aware default respects existing-config and force semantics
The repository-aware default SHALL apply only while creating or force-replacing configured initialization state and SHALL NOT silently migrate an existing configuration.

#### Scenario: Existing config blocks ordinary reinitialization
- **WHEN** config already exists and the user runs configured init without `--force` or the supported preference-only form
- **THEN** Arashi preserves the existing config and returns the existing-config result
- **AND** does not recalculate a repository-aware default

#### Scenario: Preference-only init uses existing configured value
- **WHEN** an existing workspace runs the supported preference-only init form
- **THEN** Arashi reports and uses the existing normalized configured `worktreesDir`
- **AND** uses `.arashi/worktrees` only as the legacy fallback when that config field is omitted
- **AND** does not recalculate from repository type or rewrite config

#### Scenario: Forced init with omitted option recalculates the default
- **WHEN** configured `arashi init --force` receives no `--worktrees-dir`
- **THEN** Arashi backs up the existing configuration through the established force flow
- **AND** persists the default selected from the resolved repository type

#### Scenario: Forced init with explicit option preserves override
- **WHEN** configured init receives `--force --worktrees-dir <path>`
- **THEN** the explicit normalized path is persisted regardless of repository type

### Requirement: Repository-aware default is consistent across human, JSON, and persisted results
Configured init SHALL derive dry-run preview, ordinary success output, structured data, rollback decisions, and persistence from the same normalized worktree-location value.

#### Scenario: Bare dry-run human preview
- **WHEN** configured init runs with `--dry-run` in a bare repository without an explicit worktree location
- **THEN** the configuration preview reports `"worktreesDir": ".."`
- **AND** no config, hook, repository, ignore, preference, or worktree mutation occurs

#### Scenario: Applied human success reports active location
- **WHEN** configured init succeeds without JSON output
- **THEN** the success output reports the normalized active worktree location

#### Scenario: Bare dry-run JSON preview
- **WHEN** configured init runs with `--dry-run --json` in a bare repository without an explicit worktree location
- **THEN** stdout contains exactly one successful init envelope whose data reports `worktreesDir: ".."`
- **AND** human stdout and stderr progress, preview, success, and warning output are empty
- **AND** no mutation occurs

#### Scenario: Applied JSON and config agree
- **WHEN** configured bare init succeeds with `--json` and no explicit worktree location
- **THEN** JSON data reports `worktreesDir: ".."`
- **AND** persisted config contains the same normalized value
- **AND** human stdout and stderr output are not leaked around the envelope

#### Scenario: Preference-only JSON reports config authority
- **WHEN** preference-only configured init succeeds with `--json`
- **THEN** JSON data reports the existing configured value or legacy fallback
- **AND** does not report a repository-type recalculation

### Requirement: Bare initialized create uses the persisted sibling base
A configured bare repository initialized with the repository-aware default SHALL use the persisted parent base for subsequent create operations while retaining the existing branch-only bare path strategy.

#### Scenario: Created bare worktree is a sibling
- **WHEN** a real bare repository with a committed branch is initialized without `--worktrees-dir` and then creates `feature/example`
- **THEN** the worktree is created under the canonical bare repository parent using the existing bare branch-only layout
- **AND** no checked-out worktree is created beneath the bare Git repository

#### Scenario: Explicit bare base is used by create
- **WHEN** a bare repository is initialized with an explicit valid worktree base and then creates a branch
- **THEN** create uses the persisted explicit base rather than the parent default

### Requirement: Init rollback excludes unsafe and non-applicable paths from residual-state ownership
Configured init SHALL retain managed-ignore state only for applicable safe managed paths that survive rollback and SHALL never treat a pre-existing parent or bare-root administrative path as invocation-owned residual state.

#### Scenario: Parent existence alone does not retain changes
- **WHEN** init selected `..`, a downstream failure occurs, and all applicable init-created state is removed
- **THEN** the pre-existing parent does not prevent restoration of invocation-owned ignore or preference changes

#### Scenario: Surviving applicable repositories state retains coverage
- **WHEN** a downstream failure leaves an applicable safe `reposDir` path in a non-bare workspace
- **THEN** Arashi retains managed-ignore coverage required by that surviving path

#### Scenario: Bare parent is never mutated
- **WHEN** bare init fails after selecting `..`
- **THEN** rollback does not remove, empty, rewrite, or claim ownership of the bare repository parent

#### Scenario: Restoration failure remains structured
- **WHEN** restoration of invocation-owned ignore or preference state fails
- **THEN** Arashi reports the restoration failure and final observed state through the established structured contract

### Requirement: Repository-aware defaults are documented at command and workflow surfaces
Arashi's init help and canonical initialization/configuration guidance SHALL explain the repository-aware omitted default and explicit-option precedence.

#### Scenario: User reads init help
- **WHEN** a user requests `arashi init --help`
- **THEN** help explains that omitted `--worktrees-dir` uses `..` for a bare repository and `.arashi/worktrees` otherwise

#### Scenario: User reads initialization or configuration documentation
- **WHEN** a user reads canonical CLI, docs-site, generated agent-readable, or packaged skill guidance
- **THEN** it explains the two defaults, persistence in config, and explicit override precedence without an unconditional conflicting claim

### Requirement: Zero-config initialization remains non-bare standalone behavior
The configured repository-aware default SHALL NOT broaden or alter `arashi init --zero-config`.

#### Scenario: Zero-config behavior is unchanged
- **WHEN** a user invokes `arashi init --zero-config`
- **THEN** Arashi continues enforcing existing non-bare eligibility, fixed `.worktrees` convention, incompatibility rules, and no-config contract
- **AND** the configured bare default is not applied
