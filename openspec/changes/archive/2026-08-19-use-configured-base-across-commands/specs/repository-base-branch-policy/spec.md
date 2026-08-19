## ADDED Requirements

### Requirement: Reject the removed create-only base property before workspace work

Configured validation MUST reject `defaults.create.baseBranch` as unsupported and MUST provide actionable migration guidance to root `baseBranch`, or to the owning `meta.baseBranch` / `repos.<name>.baseBranch` for a repository-specific policy. Validation MUST occur before repository discovery, hook discovery or execution, managed-ignore reconciliation, network access, or Git mutation. `defaults.create` SHALL remain valid for its non-base launch and switch properties.

#### Scenario: Removed legacy property is present alone

- **WHEN** configuration contains `defaults.create.baseBranch: "integration"`
- **THEN** validation fails and identifies the exact unsupported path
- **AND** the error directs the user to root `baseBranch`
- **AND** no repository discovery, hook, fetch, clone, branch, worktree, or ignore operation runs

#### Scenario: Removed legacy property accompanies canonical policy

- **WHEN** configuration contains `defaults.create.baseBranch` together with root or repository `baseBranch`
- **THEN** validation rejects the unsupported legacy property rather than comparing, normalizing, or choosing between values
- **AND** no deprecation compatibility diagnostic or legacy source is emitted

#### Scenario: Non-base create defaults remain valid

- **WHEN** `defaults.create` contains only supported launch or switch settings
- **THEN** configuration validation accepts those settings
- **AND** branch ancestry is resolved independently from canonical base policy

## MODIFIED Requirements

### Requirement: Configure one shared base policy with repository overrides

Configured workspaces SHALL accept optional root `baseBranch`, optional `meta.baseBranch`, and optional `repos.<name>.baseBranch` values. Root `baseBranch` SHALL be the workspace fallback for configured base-aware commands; meta and child values SHALL override that fallback only for their owning repositories. Every configured value MUST be a valid logical Git branch name.

#### Scenario: Workspace default applies everywhere

- **WHEN** configuration defines root `baseBranch` as `integration`
- **AND** no repository override or CLI override applies
- **THEN** configured create and clone use `integration` for every selected repository
- **AND** status, pull, no-upstream push comparison, handoff, and doctor resolve `integration` as each selected repository's configured base

#### Scenario: Meta and children use different bases

- **WHEN** root `baseBranch` is `main`, `meta.baseBranch` is `meta/integration`, and `repos.api.baseBranch` is `api/integration`
- **THEN** every configured base-aware command resolves the meta repository from `meta/integration`
- **AND** resolves child `api` from `api/integration`
- **AND** resolves children without an override from `main`

#### Scenario: Invalid configured branch is rejected

- **WHEN** any root, meta, or child `baseBranch` is empty, whitespace-only, non-string, or not a valid Git branch name
- **THEN** configuration validation fails with the exact owning configuration path
- **AND** no repository discovery, hook, clone, fetch, branch, worktree, or ignore mutation runs

### Requirement: Resolve effective bases with deterministic precedence

For each selected repository, Arashi SHALL resolve persisted configured base policy in this order: repository-specific configuration, root `baseBranch`, then absent. For create and clone only, repository-specific CLI override and invocation-wide `--base` SHALL precede persisted policy in that order. A higher-precedence source SHALL replace lower-precedence values for that repository only. No command SHALL read `defaults.create.baseBranch` or expose a legacy source.

#### Scenario: Invocation-wide CLI overrides repository config

- **WHEN** child `api` configures `baseBranch` as `develop`
- **AND** create or clone receives `--base release`
- **THEN** child `api` uses `release`

#### Scenario: Repository CLI override beats invocation-wide CLI

- **WHEN** create or clone receives `--base release --repo-base api=api/release`
- **THEN** child `api` uses `api/release`
- **AND** other selected children without repository CLI overrides use `release`

#### Scenario: Diagnostics use persisted policy rather than create CLI policy

- **WHEN** status, pull, push, handoff, or doctor resolves a configured base
- **THEN** it uses the owning repository override and then root fallback
- **AND** it does not invent invocation base flags or create-default precedence

#### Scenario: No base policy is configured or passed

- **WHEN** root, meta, child, and applicable CLI base values are all absent
- **THEN** create and clone retain their omitted-base behavior
- **AND** status, pull, push, handoff, and doctor retain their established no-configured-base behavior

### Requirement: Report the effective repository policy

Human dry-run/help and machine-readable base-aware results SHALL identify each selected repository's effective base and source using stable source values `repository-cli`, `cli`, `repository-config`, `workspace-config`, or `omitted` as applicable to the command. Comparison records SHALL additionally identify whether the configured-base target is available and its concrete remote/ref. JSON errors SHALL remain one-document output and SHALL not mix human text on stdout.

#### Scenario: Create JSON uses mixed sources

- **WHEN** configured create resolves selected repositories from mixed CLI and configuration sources
- **THEN** its JSON result identifies each repository's normalized requested branch, resolved ref/OID where applicable, and exact source

#### Scenario: Diagnostic JSON reports configured base

- **WHEN** status, handoff, or doctor evaluates a configured repository base
- **THEN** structured output identifies the logical branch, source, concrete comparison target, and available or unavailable state
- **AND** no legacy source value is emitted

#### Scenario: Clone reports policy failures structurally

- **WHEN** JSON clone encounters invalid selectors or unavailable effective bases
- **THEN** stdout contains exactly one structured error document naming all affected selected repositories
- **AND** human diagnostics do not contaminate stdout

## REMOVED Requirements

### Requirement: Migrate the create-only legacy default safely

**Reason**: `defaults.create.baseBranch` is removed so one canonical persisted base policy can apply consistently across configured commands.

**Migration**: Move a workspace-wide value to root `baseBranch`; use `meta.baseBranch` or `repos.<name>.baseBranch` when the value is repository-specific. Configurations retaining the removed property fail validation with this guidance before workspace work begins.
