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

### Requirement: Configured naming accepts an optional absolute path budget

Configured workspace files SHALL accept optional `worktreeNaming.maxPathLength` only as an integer from 1 through 2,147,483,647. The value SHALL limit the UTF-16 code-unit length of every absolute newly planned configured-worktree destination. Omission SHALL preserve current destination bytes and SHALL NOT infer, persist, or migrate a default. Invalid values SHALL fail configuration loading before destination planning or mutation.

#### Scenario: Omitted budget preserves naming

- **WHEN** a configured workspace omits `worktreeNaming.maxPathLength`
- **THEN** every configured destination is exactly the value produced by the existing style and slash policy
- **AND** no budget is automatically written to configuration

#### Scenario: Invalid budget fails before planning

- **WHEN** `maxPathLength` is zero, negative, fractional, nonnumeric, or greater than 2,147,483,647
- **THEN** configuration loading fails through the established invalid-configuration contract
- **AND** no destination plan, hook, managed-ignore write, branch, directory, worktree, registration, or migration is produced

#### Scenario: Generated schema exposes exact bounds

- **WHEN** the generated configuration schema is inspected
- **THEN** `worktreeNaming.maxPathLength` is an optional integer with minimum 1 and maximum 2,147,483,647
- **AND** `worktreeNaming` remains closed to unknown members

### Requirement: Configured destination planning fits one authoritative namespace

When an optional maximum is present, Arashi SHALL measure resolved absolute host paths in UTF-16 code units and fit only the ordinary generated parent-relative namespace. If all selected destinations fit, paths SHALL remain exact. Otherwise Arashi SHALL hash the portable `/`-separated ordinary generated namespace with SHA-256, retain the first eight lowercase hexadecimal characters, reserve `-<hash>`, retain the longest leading readable prefix that fits without splitting a Unicode scalar value, and use that one fitted parent for every selected repository. Existing style/slash aliases that produce one ordinary namespace SHALL remain aliases.

#### Scenario: Under-budget plan remains exact

- **WHEN** every selected configured destination is within `maxPathLength`
- **THEN** the planned parent and child paths are byte-for-byte equivalent to planning with the budget omitted

#### Scenario: Long parent namespace is shortened deterministically

- **WHEN** an ordinary generated parent namespace would make a selected destination exceed the configured budget and at least nine units remain for generated naming
- **THEN** the final generated namespace retains a readable leading prefix and ends in the first eight lowercase hex characters of SHA-256 over the portable ordinary namespace
- **AND** every absolute selected destination is at most the configured budget
- **AND** repeated planning produces the same destination

#### Scenario: Unicode prefix is not split

- **WHEN** the fitted boundary falls within a non-BMP character represented by a UTF-16 surrogate pair
- **THEN** Arashi excludes that whole character from the readable prefix
- **AND** the final path respects the configured UTF-16 budget

#### Scenario: Distinct ordinary namespaces retain distinct fitted identities

- **WHEN** repository, style, or branch inputs produce distinct ordinary generated namespaces that share a long readable prefix
- **THEN** each fitted result uses the hash of its own ordinary namespace
- **AND** no result silently aliases unless the ordinary naming policy already produced the same destination

### Requirement: Coordinated fitting includes every selected child path

Arashi SHALL derive one maximum parent namespace length from the complete deterministic selected plan, including unchanged configured child-relative paths. Parent exclusion SHALL NOT make selected children calculate independent names. The same fitted parent SHALL feed preflight, output, hooks, materialization, execution, and rollback.

#### Scenario: Longest child sizes the parent

- **WHEN** selected coordinated children have different configured relative-path lengths
- **THEN** Arashi fits the parent using the longest selected child suffix
- **AND** all selected children remain within the budget with unchanged relative paths

#### Scenario: Child-only selection retains parent authority

- **WHEN** filters exclude the configured parent but select one or more children
- **THEN** Arashi still derives and fits one authoritative parent destination
- **AND** child plan order remains selected discovery/filter order

### Requirement: Impossible configured budgets fail before mutation

If fixed base and selected child topology leave fewer than nine UTF-16 units for the collision-resistant generated suffix, Arashi SHALL fail with `WORKTREE_PATH_LENGTH_EXCEEDED` before mutation. The first ordered destination that cannot fit SHALL identify its repository, ordinary absolute path, configured maximum, and shortest collision-resistant absolute length.

#### Scenario: Fixed child topology cannot fit

- **WHEN** a selected child path cannot fit even after reducing the generated namespace to `-<eight-hex-hash>`
- **THEN** create fails with `WORKTREE_PATH_LENGTH_EXCEEDED`
- **AND** details contain exactly `repositoryName`, `worktreePath`, `maxPathLength`, and `minimumPathLength`
- **AND** no hook, managed-ignore write, branch, directory, worktree, registration, or other mutation occurs

### Requirement: Path budgeting preserves existing and standalone boundaries

The budget SHALL affect only prospective configured destinations. Existing registered paths SHALL remain metadata-authoritative, standalone SHALL remain `.worktrees/<branch>`, and Git SHALL receive the exact requested branch. Arashi SHALL describe the budget as reserved worktree-root space and MUST NOT claim repository-internal files are guaranteed to fit.

#### Scenario: Existing and standalone paths remain unchanged

- **WHEN** current configuration adds or changes `maxPathLength`
- **THEN** existing registrations remain at their exact paths and standalone planning ignores the configured budget
- **AND** no command renames or migrates an existing worktree
