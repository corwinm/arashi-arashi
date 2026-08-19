## ADDED Requirements

### Requirement: Compare configured repositories with their effective base

Configured `arashi status` SHALL resolve each selected repository's effective configured base using repository override then root fallback, refresh the selected remote base ref, and compare `HEAD` with that ref independently of current-branch upstream and remote-default comparisons. When no configured base exists, the established upstream/default status behavior SHALL remain unchanged. Implicit standalone status SHALL remain unchanged.

#### Scenario: Feature branch uses a different upstream from its base

- **WHEN** child `api` configures base `develop` while the current feature branch tracks `origin/feature-api`
- **THEN** status retains the upstream comparison with `origin/feature-api`
- **AND** separately reports ahead/behind state against the refreshed remote `develop` base

#### Scenario: Repository override and root fallback are independent

- **WHEN** root base is `main`, child `api` overrides it with `develop`, and selected child `web` has no override
- **THEN** status compares `api` with its selected remote `develop`
- **AND** compares `web` with its selected remote `main`

#### Scenario: No configured base exists

- **WHEN** a configured repository has neither an owning override nor root `baseBranch`
- **THEN** status performs no configured-base comparison for that repository
- **AND** preserves its upstream and remote-default reporting

#### Scenario: Detached HEAD is inspected safely

- **WHEN** a selected configured repository is in detached HEAD state and has an effective base
- **THEN** status preserves local detached and working-tree status
- **AND** represents the configured-base comparison as skipped or unavailable with reason `detached-head`
- **AND** does not claim branch lag or fall back to the remote default

### Requirement: Report configured-base state in every status format

Default, short, verbose, and JSON configured status SHALL expose configured-base state without obscuring upstream or working-tree state. A successful comparison SHALL identify the base branch and ahead/behind state; a requested comparison that cannot complete SHALL identify the base and an explicit unavailable reason. Missing configured child repositories SHALL retain their established visibility rules and SHALL not trigger fetches.

#### Scenario: Human formats report base lag

- **WHEN** a present configured repository is behind its refreshed configured base
- **THEN** default and verbose output include a `Base:` entry naming the branch and behind count
- **AND** short output includes a compact base-behind indicator

#### Scenario: Base is up to date or ahead

- **WHEN** the current branch is equal to or ahead of the configured base
- **THEN** verbose output can identify the successful base comparison
- **AND** default and short output avoid a misleading behind warning
- **AND** JSON retains the exact ahead, behind, and state values

#### Scenario: Configured base is unavailable

- **WHEN** the configured remote base cannot be resolved, fetched, or compared
- **THEN** local status remains available
- **AND** human output emits an explicit per-repository warning naming the base
- **AND** JSON records the branch, unavailable state, and machine-readable reason/details
- **AND** status does not substitute the upstream or remote default as the base

#### Scenario: Configured child repository is missing

- **WHEN** a configured child path is missing
- **THEN** default and short output preserve their established omission behavior
- **AND** verbose and JSON retain the missing-repository record with clone guidance
- **AND** no configured-base refresh runs for the missing path

### Requirement: De-duplicate configured-base and remote-default target work

When configured base and detected remote default resolve to the same selected remote ref, status SHALL fetch and compare that target at most once per repository. Human output MUST avoid duplicate base/default lines while structured output MUST preserve both role records and make their common target unambiguous.

#### Scenario: Base and default are the same target

- **WHEN** configured base and detected remote default both resolve to `origin/main`
- **THEN** status performs one targeted refresh and one divergence computation for `origin/main`
- **AND** human output emits one combined `Base/default` diagnostic where a diagnostic is needed
- **AND** JSON exposes separate configured-base and default role objects that identify the shared target

#### Scenario: Base and default differ

- **WHEN** configured base resolves to `origin/develop` and remote default resolves to `origin/main`
- **THEN** status refreshes and compares each target independently
- **AND** human and structured output retain distinct base and default information
