## ADDED Requirements

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
