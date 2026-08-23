# configurable-worktree-location Specification

## Purpose
TBD - created by archiving change add-config-option-for-worktrees-locations. Update Purpose after archive.
## Requirements
### Requirement: Workspace configuration defines worktree base location
The system SHALL support a workspace configuration field that defines the base directory used for newly created worktrees, SHALL persist the repository-aware default selected by configured initialization, and SHALL retain `.arashi/worktrees/` as the compatibility fallback when an existing configuration omits the field.

#### Scenario: Explicit configured location is used
- **WHEN** the workspace config provides a worktree location value
- **THEN** new worktree paths are created under that configured base directory

#### Scenario: New bare initialization persists its selected default
- **WHEN** configured initialization resolves a bare repository and the worktree-location option is omitted
- **THEN** the workspace config persists `..` as the worktree base location
- **AND** later commands use that configured value rather than re-inferring repository type

#### Scenario: New non-bare initialization persists its selected default
- **WHEN** configured initialization resolves a non-bare repository and the worktree-location option is omitted
- **THEN** the workspace config persists `.arashi/worktrees` as the worktree base location

#### Scenario: Legacy omitted configuration uses compatibility fallback
- **WHEN** an existing workspace config does not provide a worktree location value
- **THEN** the system MUST use `.arashi/worktrees/` as the compatibility base directory
- **AND** reading the config does not automatically persist or migrate the omitted field

### Requirement: Relative path inputs are normalized consistently
The system MUST normalize supported relative path inputs for worktree location, including optional trailing slash variants, before destination paths are used.

#### Scenario: Dot path variants normalize to repository root
- **WHEN** the configured location is `.` or `./`
- **THEN** destination resolution treats both values as the same repository-root base path

#### Scenario: Managed directory variants normalize identically
- **WHEN** the configured location is `.arashi/worktrees` or `.arashi/worktrees/`
- **THEN** destination resolution treats both values as the same base path

#### Scenario: Parent directory variant remains valid
- **WHEN** the configured location is `../` (or equivalent trailing-slash form)
- **THEN** destination resolution uses the workspace parent directory as the base path

### Requirement: Worktree creation uses a single resolved base path

All commands that create configured worktrees MUST derive destinations from a shared normalized effective `worktreesDir` base and a single authoritative configured topology naming rule. A newly created configured bare parent SHALL use `<canonical repository naming component>/<branch>` beneath that base; a newly created configured non-bare parent SHALL use `<branch>` beneath that base. The repository component MUST be the existing resolved `worktreeName` when present and otherwise the repository's canonical configured name, with a conventional terminal `.git` suffix omitted when the bare source directory supplies the fallback name, and MUST NOT otherwise be guessed from filesystem paths. The branch value SHALL retain the existing natural path behavior, including slash-separated hierarchy. A custom `worktreesDir` SHALL change only the base and SHALL NOT change the topology naming rule.

#### Scenario: Configured bare parent uses a repository namespace

- **WHEN** configured create plans branch `feature/auth` for a bare parent whose canonical repository naming component is `example`
- **THEN** the parent destination beneath the effective worktree base is `example/feature/auth`
- **AND** the branch remains `feature/auth`

#### Scenario: Bare source suffix does not overlap the worktree namespace

- **WHEN** configured create plans branch `main` for bare source directory `<base>/example.git` without an explicit `worktreeName`
- **THEN** the fallback repository namespace is `<base>/example`
- **AND** the parent destination is `<base>/example/main`
- **AND** no checked-out files are placed beneath `<base>/example.git`

#### Scenario: Bare repository and branch components cannot alias

- **WHEN** repository `example` plans branch `feature/auth` and repository `example-feature` plans branch `auth` beneath the same effective base
- **THEN** their destinations are respectively `example/feature/auth` and `example-feature/auth`
- **AND** the destinations are distinct

#### Scenario: Configured non-bare parent uses branch path

- **WHEN** configured create plans branch `feature/auth` for a non-bare parent
- **THEN** the parent destination beneath the effective worktree base is `feature/auth`
- **AND** no repository component is repeated inside that base

#### Scenario: Resolved worktree name is authoritative

- **WHEN** a configured bare parent's resolved `worktreeName` differs from its checkout-directory basename
- **THEN** destination naming uses the resolved `worktreeName`
- **AND** does not inspect or infer a substitute from the filesystem

#### Scenario: Canonical configured name is the fallback

- **WHEN** a configured bare parent has no resolved `worktreeName`
- **THEN** destination naming uses the repository's canonical configured name
- **AND** no second repository-name derivation rule is introduced

#### Scenario: Custom worktree root changes only the base

- **WHEN** a configured bare or non-bare workspace defines a custom `worktreesDir`
- **THEN** create applies the same topology naming component beneath that custom base
- **AND** the custom root does not add, remove, or replace the repository or branch component

#### Scenario: Coordinated children use the authoritative parent

- **WHEN** configured create plans child repository worktrees beneath a parent destination
- **THEN** each child destination is the exact authoritative parent destination plus that child's unchanged configured path
- **AND** parent planning, child planning, preflight, output, and execution do not calculate competing parent paths

#### Scenario: Worktree-producing commands resolve destinations consistently

- **WHEN** different commands create worktrees in the same configured workspace for equivalent topology, base, repository identity, and branch inputs
- **THEN** each command uses the same normalized effective base and corrected topology naming rule
- **AND** command-specific rendering or execution does not introduce a competing destination calculation

### Requirement: Default managed worktree directory is git-ignored
The system SHALL ensure the active managed worktree location is effectively ignored by Git in an idempotent way when that location is an applicable safe repository-relative working-tree directory pattern, using configured lifecycle reconciliation and repository-local rules by default. Paths resolved from a canonical bare repository root are not working-tree paths and SHALL follow the bare non-worktree reporting contract instead.

#### Scenario: Default path adds missing local ignore entry
- **WHEN** the default managed location is active in a non-bare workspace, Git reports no effective ignore rule for `.arashi/worktrees/`, and no non-default scope is stored
- **THEN** the system adds `.arashi/worktrees/` to the repository-local exclude file resolved through Git without duplicating entries
- **AND** the system does not modify tracked `.gitignore`

#### Scenario: Configured managed subdirectory adds missing local ignore entry
- **WHEN** a non-default worktree location is configured as an applicable repository-relative working-tree subdirectory and Git reports no effective ignore rule for its normalized trailing-slash entry
- **THEN** lifecycle reconciliation adds the normalized configured worktree directory entry to the active local-default ignore target without duplication

#### Scenario: Existing effective ignore entry is preserved without duplication
- **WHEN** Git reports that the normalized applicable worktree location is already ignored by a tracked, repository-local, or global rule
- **THEN** initialization, pull, clone, and create flows complete without adding another ignore rule

#### Scenario: Tracked scope adds missing tracked entry
- **WHEN** the clone-local ignore preference is `tracked` and an applicable safe worktree location has no effective ignore rule
- **THEN** lifecycle reconciliation adds the normalized location to workspace-root `.gitignore`

#### Scenario: Unsafe broad locations are not auto-ignored
- **WHEN** the configured worktree location resolves to repository root (`.` or `./`), an absolute path, or parent traversal (`../` variants)
- **THEN** lifecycle reconciliation does not add a worktree-location pattern to tracked or repository-local ignore files
- **AND** the unsafe skip is reported in the supported command output

#### Scenario: Bare-root subdirectory is not a working-tree ignore candidate
- **WHEN** configured init resolves a worktree location beneath a canonical bare repository root
- **THEN** the path is reported as non-applicable to working-tree ignore rules
- **AND** init does not inspect or mutate ignore files for that path

### Requirement: Implicit standalone mode uses a fixed worktree location

The configurable worktree-location and corrected topology naming contracts SHALL remain authoritative only for configured workspaces, while implicit standalone workspaces SHALL use the fixed main-root `.worktrees` base and natural branch-relative destination.

#### Scenario: Standalone branch path resolves

- **WHEN** standalone create plans branch `feat/example`
- **THEN** the destination is `<main-root>/.worktrees/feat/example`
- **AND** no repository-name prefix or configured default location is applied

#### Scenario: Configured custom location exists

- **WHEN** a valid configured workspace defines `worktreesDir`
- **THEN** Arashi uses that configured value as the destination base and applies the corrected configured topology naming rule beneath it
- **AND** the presence of a root `.worktrees/` directory does not override it

#### Scenario: Standalone invocation starts in linked worktree

- **WHEN** standalone create runs from a linked worktree
- **THEN** the fixed base remains the Git main worktree's `.worktrees/` directory

### Requirement: Configured destination planning is prospective and collision-safe

The corrected configured naming rule SHALL apply only to destinations for newly created worktrees. Arashi MUST NOT rename, migrate, or rewrite registrations for existing worktrees. Existing worktrees SHALL remain discoverable and operable through Git worktree metadata rather than path-name reversal. Before any configured create mutation, Arashi MUST resolve the complete parent/child destination plan and reject filesystem or Git-registration collisions without inventing an alternate name.

#### Scenario: Existing inverted-layout worktree remains operable

- **WHEN** Git worktree metadata identifies an existing configured worktree at a path created under the prior inverted naming layout
- **THEN** list, status, switch, and remove continue operating on that exact registered path
- **AND** no command renames or migrates it to the corrected layout

#### Scenario: New worktree coexists with an existing old-layout worktree

- **WHEN** an existing worktree uses the prior layout and a distinct new branch resolves under the corrected layout without collision
- **THEN** create may use the corrected destination for the new worktree
- **AND** preserves the existing directory and registration unchanged

#### Scenario: Destination collision blocks before mutation

- **WHEN** a resolved configured parent or child destination conflicts with filesystem state or a Git worktree registration
- **THEN** create reports the conflict before managed-ignore writes, hooks, branch creation, `git worktree add`, directory creation, or other filesystem mutation
- **AND** does not silently select an alternate destination

### Requirement: Configured destination behavior is portable

The configured destination resolver and create lifecycle SHALL use cross-platform path semantics. Native acceptance on macOS, Linux, and Windows SHALL cover corrected configured bare and non-bare parent destinations plus coordinated child placement. Platform-neutral integration coverage SHALL cover slash branches, custom roots, collision preflight, output parity, and existing-worktree compatibility.

#### Scenario: Native platform matrix runs

- **WHEN** pull-request validation executes on supported operating systems
- **THEN** native tests exercise corrected configured bare and non-bare destinations plus coordinated children
- **AND** injected platform flags alone are not treated as Windows acceptance

#### Scenario: Platform separator representation differs

- **WHEN** the same configured topology, canonical repository component, branch, and base are resolved on different supported platforms
- **THEN** each result preserves the same path-component hierarchy using that platform's path representation
- **AND** repository naming is not inferred from platform-specific filesystem spellings
