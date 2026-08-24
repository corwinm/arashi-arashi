## ADDED Requirements

### Requirement: Workspace configuration defines a closed worktree naming policy

Configured workspace files SHALL accept an optional root `worktreeNaming` object with optional `style` and `branchSlashes` fields. `style` MUST accept only `default`, `branch`, or `repo-branch`; `branchSlashes` MUST accept only `preserve` or `flatten`. Omitted `worktreeNaming`, omitted nested fields, explicit `style: "default"`, and explicit `branchSlashes: "preserve"` SHALL preserve the corrected configured topology and natural slash behavior without automatically persisting or migrating omitted values. Invalid object shapes or unsupported values MUST fail configuration loading before destination planning, hooks, managed-ignore reconciliation, branch creation, worktree creation, directory creation, or any other mutation.

#### Scenario: Omitted policy preserves corrected defaults

- **WHEN** a configured workspace omits `worktreeNaming`
- **THEN** a new bare parent uses `<canonical repository naming component>/<branch>` beneath the effective base
- **AND** a new non-bare parent uses `<branch>` beneath the effective base
- **AND** branch `/` separators remain directory boundaries
- **AND** the omitted object is not automatically persisted

#### Scenario: Explicit compatibility values match omission

- **WHEN** a configured workspace sets `worktreeNaming.style` to `default` and `worktreeNaming.branchSlashes` to `preserve`
- **THEN** destination planning is exactly equivalent to the omitted policy for the same workspace, repository identity, and branch
- **AND** the earlier inverted pre-#323 behavior is not restored

#### Scenario: Supported values are accepted independently

- **WHEN** a configured workspace supplies any supported `style` with either supported `branchSlashes` value while omitting or providing the other field
- **THEN** configuration loading succeeds
- **AND** every omitted nested field uses its compatibility value only in the effective runtime policy

#### Scenario: Invalid naming configuration fails before mutation

- **WHEN** `worktreeNaming` is not an object, contains an unsupported `style`, or contains an unsupported `branchSlashes` value
- **THEN** configured create fails through the established invalid-configuration result rather than `WORKTREE_DESTINATION_COLLISION`
- **AND** no destination plan, managed-ignore write, hook, branch, worktree, directory, Git registration, or configuration migration is produced

#### Scenario: Generated schema closes the value sets

- **WHEN** the generated configuration JSON Schema and published configuration examples are inspected
- **THEN** the schema exposes optional root `worktreeNaming` with optional closed-enum `style` and `branchSlashes` properties
- **AND** maintained guidance documents compatibility defaults, configured-only scope, and the fact that Git branch names are unchanged

## MODIFIED Requirements

### Requirement: Worktree creation uses a single resolved base path

All commands that create configured worktrees MUST derive destinations from a shared normalized effective `worktreesDir` base, the normalized effective `worktreeNaming` policy, and one immutable ordered destination plan. The effective compatibility policy is `style: "default"` plus `branchSlashes: "preserve"`: a newly created configured bare parent uses `<canonical repository naming component>/<branch>` beneath the base and a newly created configured non-bare parent uses `<branch>`. `style: "branch"` removes the topology-dependent repository component; `style: "repo-branch"` prefixes the first branch filesystem component with `<canonical repository naming component>-` for both bare and non-bare parents. `branchSlashes: "preserve"` retains Git branch `/` separators as directory boundaries, while `branchSlashes: "flatten"` replaces those separators only in the filesystem branch representation with `-`. The requested Git branch value MUST remain exact for Git operations. The repository component MUST be the existing resolved `worktreeName` when present and otherwise the repository's canonical configured name, with a conventional terminal `.git` suffix omitted when the bare source directory supplies the fallback name, and MUST NOT otherwise be guessed from filesystem paths. A custom `worktreesDir` changes only the base and MUST NOT change the naming policy.

#### Scenario: Configured bare parent uses a repository namespace

- **WHEN** configured create plans branch `feature/auth` for a bare parent whose canonical repository naming component is `example` with omitted policy or explicit `default` and `preserve`
- **THEN** the parent destination beneath the effective worktree base is `example/feature/auth`
- **AND** the Git branch remains `feature/auth`

#### Scenario: Bare source suffix does not overlap the worktree namespace

- **WHEN** configured create plans branch `main` for bare source directory `<base>/example.git` without an explicit `worktreeName` under a policy that uses a repository component
- **THEN** the fallback repository namespace is `example`
- **AND** the compatibility destination is `<base>/example/main`
- **AND** no checked-out files are placed beneath `<base>/example.git`

#### Scenario: Bare repository and branch components cannot alias

- **WHEN** repository `example` plans branch `feature/auth` and repository `example-feature` plans branch `auth` beneath the same effective base using `default` and `preserve`
- **THEN** their destinations are respectively `example/feature/auth` and `example-feature/auth`
- **AND** the destinations are distinct

#### Scenario: Configured non-bare parent uses branch path

- **WHEN** configured create plans branch `feature/auth` for a non-bare parent with omitted policy or explicit `default` and `preserve`
- **THEN** the parent destination beneath the effective worktree base is `feature/auth`
- **AND** no repository component is repeated inside that base

#### Scenario: Resolved worktree name is authoritative

- **WHEN** a configured parent's selected style uses a repository component and its resolved `worktreeName` differs from its checkout-directory basename
- **THEN** destination naming uses the resolved `worktreeName`
- **AND** does not inspect or infer a substitute from the filesystem

#### Scenario: Canonical configured name is the fallback

- **WHEN** a configured parent selected style uses a repository component and no resolved `worktreeName` exists
- **THEN** destination naming uses the repository's canonical configured name
- **AND** no second repository-name derivation rule is introduced

#### Scenario: Custom worktree root changes only the base

- **WHEN** a configured bare or non-bare workspace defines a custom `worktreesDir`
- **THEN** create applies the selected effective naming policy beneath that custom base
- **AND** the custom root does not add, remove, replace, or flatten any repository or branch component independently of that policy

#### Scenario: Branch style removes topology namespace

- **WHEN** repository `example` plans branch `feature/auth` with `style: "branch"` and `branchSlashes: "preserve"` in either a configured bare or non-bare workspace
- **THEN** the relative parent destination is `feature/auth`
- **AND** bare topology does not add `example`
- **AND** the Git branch remains `feature/auth`

#### Scenario: Repository-branch style prefixes the first preserved branch component

- **WHEN** repository `example` plans branch `feature/auth` with `style: "repo-branch"` and `branchSlashes: "preserve"` in either a configured bare or non-bare workspace
- **THEN** the relative parent destination is `example-feature/auth`
- **AND** the repository component is not emitted as a separate directory
- **AND** the Git branch remains `feature/auth`

#### Scenario: Flatten applies only to the branch filesystem representation

- **WHEN** repository `example` plans Git branch `feature/auth` with `branchSlashes: "flatten"`
- **THEN** `branch` resolves to `feature-auth`, `repo-branch` resolves to `example-feature-auth`, configured bare `default` resolves to `example/feature-auth`, and configured non-bare `default` resolves to `feature-auth` beneath the effective base
- **AND** every Git operation still receives branch `feature/auth`

#### Scenario: Coordinated children use the authoritative parent

- **WHEN** configured create plans child repository worktrees beneath a parent destination for any supported naming policy
- **THEN** each child destination is the exact authoritative parent destination plus that child's unchanged configured path
- **AND** parent planning, child planning, preflight, output, and execution do not calculate competing parent paths or reapply the policy to children

#### Scenario: Worktree-producing commands resolve destinations consistently

- **WHEN** different commands create worktrees in the same configured workspace for equivalent topology, base, repository identity, branch, and naming-policy inputs
- **THEN** each command uses the same normalized effective base and naming policy
- **AND** command-specific rendering or execution does not introduce a competing destination calculation

### Requirement: Implicit standalone mode uses a fixed worktree location

The configurable worktree-location, configured topology, and `worktreeNaming` contracts SHALL remain authoritative only for configured workspaces, while implicit standalone workspaces SHALL use the fixed main-root `.worktrees` base and natural branch-relative destination.

#### Scenario: Standalone branch path resolves

- **WHEN** standalone create plans branch `feat/example`
- **THEN** the destination is `<main-root>/.worktrees/feat/example`
- **AND** no repository-name prefix, configured default location, or configured slash flattening is applied

#### Scenario: Configured custom location exists

- **WHEN** a valid configured workspace defines `worktreesDir` and any supported `worktreeNaming` policy
- **THEN** Arashi uses that configured base and applies the effective configured naming policy beneath it
- **AND** the presence of a root `.worktrees/` directory does not override it

#### Scenario: Standalone invocation starts in linked worktree

- **WHEN** standalone create runs from a linked worktree
- **THEN** the fixed base remains the Git main worktree's `.worktrees/` directory

### Requirement: Configured destination planning is prospective and collision-safe

The effective configured naming policy SHALL apply only to destinations for newly created worktrees. Arashi MUST NOT rename, migrate, or rewrite registrations for existing worktrees when the policy changes. Existing worktrees SHALL remain discoverable and operable through Git worktree metadata rather than path-name reversal. Before any configured create mutation, Arashi MUST resolve the complete parent/child destination plan, validate each destination remains within the effective worktree root under the established configured path-safety contract, and reject filesystem or Git-registration collisions without inventing an alternate name. Naming-derived aliases, including flattened slash and literal-hyphen branches that resolve to one destination, are ordinary collisions and MUST NOT change the Git branch requested by either operation.

#### Scenario: Existing inverted-layout worktree remains operable

- **WHEN** Git worktree metadata identifies an existing configured worktree at a path created under the prior inverted naming layout
- **THEN** list, status, switch, and remove continue operating on that exact registered path
- **AND** no command renames or migrates it to the effective configured naming policy

#### Scenario: New worktree coexists with an existing old-layout worktree

- **WHEN** an existing worktree uses a prior layout and a distinct new branch resolves under the effective naming policy without collision
- **THEN** create may use the newly planned destination for the new worktree
- **AND** preserves the existing directory and registration unchanged

#### Scenario: Destination collision blocks before mutation

- **WHEN** a resolved configured parent or child destination conflicts with filesystem state or a Git worktree registration
- **THEN** create reports the conflict before managed-ignore writes, hooks, branch creation, `git worktree add`, directory creation, or other filesystem mutation
- **AND** does not silently select an alternate destination

#### Scenario: Flattened slash and literal hyphen branches collide deterministically

- **WHEN** an existing worktree for branch `feature/auth` occupies the destination selected by `branchSlashes: "flatten"` and create plans branch `feature-auth` to that same destination
- **THEN** the second operation reports the exact conflicting destination and requested branch context
- **AND** does not reuse the differently registered branch, append a suffix, create a branch, run hooks, or mutate filesystem or Git state

#### Scenario: Multiple planned collisions preserve plan precedence

- **WHEN** more than one selected parent or child destination collides under the effective naming policy
- **THEN** preflight evaluates the immutable parent-first then selected-child plan order
- **AND** public diagnostics identify the first conflicting plan record without later collisions replacing it

### Requirement: Configured destination behavior is portable

The configured destination resolver and create lifecycle SHALL interpret Git branch `/` separators independently of host path separators and SHALL compose the effective naming policy with cross-platform path semantics. Native acceptance on macOS, Linux, and Windows SHALL cover configured bare and non-bare omission/default defaults, every explicit style, both slash policies, exact Git branch identity, and coordinated child placement. Platform-neutral integration coverage SHALL cover custom roots, slash-derived collision preflight, containment, output parity, standalone isolation, and existing-worktree compatibility.

#### Scenario: Native platform matrix runs

- **WHEN** pull-request validation executes on supported operating systems
- **THEN** native tests exercise configured bare and non-bare defaults, all supported style and slash-policy values, exact branch identity, and coordinated children
- **AND** injected platform flags alone are not treated as Windows acceptance

#### Scenario: Platform separator representation differs

- **WHEN** the same configured topology, canonical repository component, branch, base, and naming policy are resolved on different supported platforms
- **THEN** each result preserves the same policy-defined component hierarchy using that platform's path representation
- **AND** literal Git `/` separators are preserved or flattened according to configuration rather than host parsing accidents
- **AND** repository naming is not inferred from platform-specific filesystem spellings
