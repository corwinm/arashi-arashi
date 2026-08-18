## ADDED Requirements

### Requirement: Configure one shared base policy with repository overrides
Configured workspaces SHALL accept optional root `baseBranch`, optional `meta.baseBranch`, and optional `repos.<name>.baseBranch` values. Root `baseBranch` SHALL be the workspace fallback for both configured `create` and `clone`; meta and child values SHALL override that fallback only for their owning repositories. Every configured value MUST be a valid logical Git branch name.

#### Scenario: Workspace default applies everywhere
- **WHEN** configuration defines root `baseBranch` as `integration`
- **AND** no repository override or CLI override applies
- **THEN** configured create uses `integration` for the meta repository and every selected child
- **AND** clone uses `integration` for every selected missing child

#### Scenario: Meta and children use different bases
- **WHEN** root `baseBranch` is `main`, `meta.baseBranch` is `meta/integration`, and `repos.api.baseBranch` is `api/integration`
- **THEN** configured create resolves the meta repository from `meta/integration`
- **AND** resolves child `api` from `api/integration`
- **AND** resolves children without an override from `main`

#### Scenario: Invalid configured branch is rejected
- **WHEN** any root, meta, or child `baseBranch` is empty, whitespace-only, non-string, or not a valid Git branch name
- **THEN** configuration validation fails with the exact owning configuration path
- **AND** no repository discovery, hook, clone, branch, worktree, or ignore mutation runs

### Requirement: Support invocation-wide and per-repository CLI overrides
Configured `create` and `clone` SHALL accept `--base <branch>` as an invocation-wide override and repeatable `--repo-base <repository=branch>` values as repository-specific overrides. The reserved selector `@meta` SHALL identify the configured meta repository; all other selectors MUST exactly match configured child repository names. Implicit standalone create SHALL continue to support `--base` and SHALL reject `--repo-base`.

#### Scenario: One create invocation overrides two repositories
- **WHEN** the user runs configured create with `--base release --repo-base @meta=meta/release --repo-base api=api/release`
- **THEN** the meta repository uses `meta/release`
- **AND** child `api` uses `api/release`
- **AND** every other selected child uses `release`

#### Scenario: Clone overrides one selected child
- **WHEN** the user runs clone with `--base release --repo-base api=api/release`
- **THEN** missing selected child `api` uses `api/release`
- **AND** every other selected missing child uses `release`

#### Scenario: Selector is invalid or duplicated
- **WHEN** a repository override is malformed, names an unknown repository, names an unselected repository, repeats a selector, uses `@meta` for clone, or contains an invalid branch
- **THEN** the command exits nonzero with every offending value identified
- **AND** no hook, clone, branch, worktree, or ignore mutation runs

#### Scenario: Standalone create receives a repository override
- **WHEN** implicit standalone create receives `--repo-base`
- **THEN** it exits nonzero with configured-workspace guidance
- **AND** creates no configuration, branch, hook outcome, or worktree

### Requirement: Resolve effective bases with deterministic precedence
For each selected repository, Arashi SHALL resolve the effective base in this order: repository-specific CLI override, invocation-wide `--base`, repository-specific configuration, root `baseBranch`, then existing omitted-base behavior. A higher-precedence source SHALL replace lower-precedence values for that repository only.

#### Scenario: Invocation-wide CLI overrides repository config
- **WHEN** child `api` configures `baseBranch` as `develop`
- **AND** create or clone receives `--base release`
- **THEN** child `api` uses `release`

#### Scenario: Repository CLI override beats invocation-wide CLI
- **WHEN** create or clone receives `--base release --repo-base api=api/release`
- **THEN** child `api` uses `api/release`
- **AND** other selected children without repository CLI overrides use `release`

#### Scenario: No base policy is configured or passed
- **WHEN** root, meta, child, and CLI base values are all absent
- **THEN** configured create and clone retain their pre-policy omitted-base behavior

### Requirement: Migrate the create-only legacy default safely
Arashi SHALL continue accepting `defaults.create.baseBranch` as deprecated create-only compatibility input and SHALL emit one actionable migration diagnostic naming root `baseBranch`. The legacy key SHALL NOT affect clone until the user explicitly migrates it. If root `baseBranch` and the legacy key are both present with different values, configuration validation MUST fail rather than choosing silently.

#### Scenario: Legacy create default is the only configured value
- **WHEN** configuration contains only `defaults.create.baseBranch: "integration"`
- **THEN** configured create uses `integration` as its workspace-wide compatibility base
- **AND** configured clone retains its previous remote-default behavior
- **AND** Arashi emits one deprecation diagnostic explaining that migration to root `baseBranch` will make the value shared by create and clone

#### Scenario: Legacy and canonical values conflict
- **WHEN** root `baseBranch` and `defaults.create.baseBranch` contain different values
- **THEN** configuration validation fails before repository or Git operations
- **AND** identifies both paths and the required migration

#### Scenario: Legacy and canonical values agree
- **WHEN** both paths contain the same valid value
- **THEN** Arashi uses the canonical shared value once for create and clone
- **AND** emits the migration diagnostic without reporting a conflict

### Requirement: Apply effective bases to clone without losing coordinated alignment
Normal configured clone SHALL clone each selected missing child at its effective base when one exists and SHALL preserve remote-default clone behavior when absent. When clone runs inside a coordinated worktree, the missing child's checked-out target SHALL remain the current coordinated branch; if that target must be created, Arashi SHALL create it from the child's effective base rather than checking out the base as the coordinated target.

#### Scenario: Main workspace clones an overridden base
- **WHEN** a missing child has effective base `develop`
- **AND** clone runs from the main configured workspace
- **THEN** the child is cloned with local branch `develop` tracking `origin/develop`

#### Scenario: Coordinated clone materializes the current target from a base
- **WHEN** clone runs from coordinated branch `feature/task`
- **AND** the missing child target branch does not exist in its available source repository
- **AND** the child effective base is `develop`
- **THEN** Arashi creates `feature/task` from the repository-local resolution of `develop`
- **AND** materializes the child at `feature/task`, not at `develop`

#### Scenario: Coordinated target already exists
- **WHEN** clone runs from a coordinated worktree and the current target branch already exists for the missing child
- **THEN** Arashi reuses that target without resetting, rebasing, or asserting its ancestry

#### Scenario: Clone base is missing
- **WHEN** one or more selected missing children cannot resolve or clone their effective base
- **THEN** clone reports every affected child and attempted base before managed-ignore or filesystem mutation
- **AND** no selected repository is cloned or materialized

### Requirement: Report the effective repository policy
Human dry-run/help and machine-readable results SHALL identify each selected repository's effective base and source using stable source values `repository-cli`, `cli`, `repository-config`, `workspace-config`, or `legacy-omitted`. JSON errors SHALL remain one-document output and SHALL not mix human text on stdout.

#### Scenario: Create JSON uses mixed sources
- **WHEN** configured create resolves selected repositories from mixed CLI and configuration sources
- **THEN** its JSON result identifies each repository's normalized requested branch, resolved ref/OID where applicable, and exact source

#### Scenario: Clone reports policy failures structurally
- **WHEN** JSON clone encounters invalid selectors or unavailable effective bases
- **THEN** stdout contains exactly one structured error document naming all affected selected repositories
- **AND** human diagnostics do not contaminate stdout
