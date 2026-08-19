## ADDED Requirements

### Requirement: No-upstream publishability uses the effective configured base

When a selected configured repository's current branch has no upstream, `arashi push` SHALL use the refreshed effective configured base as the fallback baseline for determining whether `HEAD` contains publishable branch-unique commits. The base SHALL resolve by repository override then root fallback. If no configured base exists, push SHALL preserve its established remote-default fallback. This comparison MUST NOT change the destination branch, selected remote, or requirement for `--set-upstream`.

#### Scenario: No-upstream branch has commits beyond configured base

- **WHEN** a current branch has no upstream, child `api` configures base `develop`, and `HEAD` contains commits not reachable from refreshed `origin/develop`
- **THEN** push classifies the branch as having publishable commits
- **AND** publishes the current branch only when existing `--set-upstream` requirements are satisfied
- **AND** does not push to `develop`

#### Scenario: No-upstream branch has no commits beyond configured base

- **WHEN** a current no-upstream branch contains no commits beyond its refreshed configured base
- **THEN** push skips it as untouched rather than manufacturing a coordinated remote branch
- **AND** the outcome identifies the configured base as the comparison baseline

#### Scenario: No configured base exists

- **WHEN** a current branch has no upstream and its repository has no configured base
- **THEN** push preserves the existing remote-default publishability fallback

### Requirement: Existing upstream remains authoritative for push

When a current branch has a usable upstream, push SHALL preserve its existing upstream comparison and destination behavior regardless of configured base. Configured base MUST NOT replace the current branch upstream or alter the push refspec.

#### Scenario: Upstream differs from configured base

- **WHEN** a feature branch tracks `origin/feature-api` and its configured base is `origin/develop`
- **THEN** push evaluates and publishes against `origin/feature-api` using existing behavior
- **AND** configured base does not become the destination or upstream

### Requirement: Configured-base comparison failure does not fall back silently

When push needs a no-upstream publishability baseline and an effective configured base exists but cannot be refreshed, resolved, or compared, push SHALL report a per-repository failure/manual-action outcome naming the configured remote base and SHALL NOT fall back to the remote default. Independent repositories SHALL retain existing partial-failure processing.

#### Scenario: Configured base is missing remotely

- **WHEN** a no-upstream branch configures base `develop` but the selected remote lacks that branch
- **THEN** push does not classify the branch from the remote default or stale base state
- **AND** does not create a remote branch
- **AND** reports the repository failure with the selected remote and base branch

#### Scenario: Standalone push runs

- **WHEN** push runs in implicit standalone mode
- **THEN** its established upstream/default behavior remains unchanged
- **AND** no persisted configured-base policy is applied
