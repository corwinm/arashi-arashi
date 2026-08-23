## MODIFIED Requirements

### Requirement: Worktree creation uses a single resolved base path

All commands that create configured worktrees MUST derive destinations from a shared normalized effective `worktreesDir` base and a single authoritative configured topology naming rule. A newly created configured bare parent SHALL use `<canonical repository naming component>-<branch>` beneath that base; a newly created configured non-bare parent SHALL use `<branch>` beneath that base. The repository component MUST be the existing resolved `worktreeName` when present and otherwise the repository's canonical configured name, and MUST NOT be guessed from filesystem paths. The branch value SHALL retain the existing natural path behavior, including slash-separated hierarchy. A custom `worktreesDir` SHALL change only the base and SHALL NOT change the topology naming rule.

#### Scenario: Configured bare parent uses repository-prefixed branch path

- **WHEN** configured create plans branch `feature/auth` for a bare parent whose canonical repository naming component is `example`
- **THEN** the parent destination beneath the effective worktree base is `example-feature/auth`
- **AND** the branch remains `feature/auth`

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

## ADDED Requirements

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
