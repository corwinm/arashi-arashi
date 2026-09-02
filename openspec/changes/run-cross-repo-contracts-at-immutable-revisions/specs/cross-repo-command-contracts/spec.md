## ADDED Requirements

### Requirement: Child repositories SHALL invoke authoritative cross-repository validation

Each participating child repository SHALL invoke the public authoritative cross-repository workflow for pull requests and pushes to its default branch. The caller SHALL identify its repository from the supported fixed set and SHALL pass the event’s full child commit SHA without passing secrets.

#### Scenario: Child pull request changes a shared contract

- **WHEN** a participating child pull request is opened or updated
- **THEN** the child commit runs the authoritative cross-repository semantic stage set
- **AND** the reusable workflow receives the pull request head SHA as the triggering child revision

#### Scenario: Child change reaches main

- **WHEN** a participating child commit is pushed to `main`
- **THEN** the merged child commit runs the authoritative cross-repository semantic stage set
- **AND** the reusable workflow receives `github.sha` as the triggering child revision

#### Scenario: Caller attempts to pass authority

- **WHEN** a child calls the reusable workflow
- **THEN** the caller and called workflow use read-only contents permission
- **AND** no PAT, release credential, inherited secret, or write permission is passed

### Requirement: Cross-repository CI SHALL bind validation to immutable revisions

Before any repository checkout or semantic checker execution, authoritative CI SHALL validate its invocation and resolve exactly one full lowercase 40-character commit SHA for the meta repository and every participating child. The triggering child SHALL resolve to the explicit caller SHA. For a child-called run, the meta repository SHALL resolve to `github.workflow_sha`, binding validation to the exact reusable-workflow commit selected by GitHub rather than a later default-branch revision. Every repository checkout SHALL use the corresponding resolved SHA and SHALL NOT use a branch, tag, default checkout, pull-request merge ref, or other floating revision.

#### Scenario: Child-triggered validation resolves repositories

- **WHEN** a supported child invokes validation with a valid full commit SHA
- **THEN** that child is resolved to the supplied SHA
- **AND** the meta repository is resolved to the called workflow's `github.workflow_sha`
- **AND** all other repositories are resolved once from their intended default refs before checkout
- **AND** every checkout and checker uses only the resolved SHAs

#### Scenario: Direct meta pull request uses coordinated branches

- **WHEN** the meta workflow runs for a pull request whose branch also exists in one or more children
- **THEN** each matching child branch is resolved to its full SHA before checkout
- **AND** children without that branch are resolved from `main`

#### Scenario: Invocation is malformed

- **WHEN** the triggering repository is unsupported, the repository/SHA pair is incomplete, the SHA is not a full lowercase hexadecimal commit identity, or a selected ref cannot be resolved
- **THEN** validation exits unsuccessfully before repository checkout and semantic checker execution

### Requirement: Cross-repository CI SHALL publish durable complete revision evidence

Authoritative CI SHALL generate one deterministic JSON manifest after checkout that records schema version, triggering repository and revision, and one canonical entry for the meta repository and every participating child. It SHALL verify local `HEAD` identities equal the resolved revisions, append the manifest to the job summary, upload the exact manifest as a workflow artifact, and append the upload action’s SHA-256 artifact digest to the summary.

#### Scenario: Revision evidence is published

- **WHEN** all repositories are checked out successfully
- **THEN** the manifest lists every repository exactly once in canonical order with a full SHA
- **AND** its trigger fields match the invocation
- **AND** the identical JSON bytes are available in the summary and artifact
- **AND** the summary identifies the artifact digest

#### Scenario: Semantic validation fails after checkout

- **WHEN** a later contract stage fails
- **THEN** the already-created revision manifest remains available for that run

#### Scenario: Revision evidence drifts

- **WHEN** a local checkout differs from its resolved SHA, an entry is missing or duplicated, ordering changes, a SHA is malformed, or workflow reporting becomes log-only
- **THEN** deterministic contract validation reports the mismatch and exits unsuccessfully

### Requirement: Direct meta validation SHALL remain available

The authoritative workflow SHALL retain pull-request, default-branch push, and manual triggers in the meta repository while also supporting child calls. Direct meta runs SHALL use the same immutable resolution and revision-evidence path as child-triggered runs.

#### Scenario: Maintainer validates a coordinated meta branch

- **WHEN** the workflow runs directly for a meta pull request or manual dispatch
- **THEN** matching coordinated child branches remain eligible
- **AND** the run produces the same complete immutable revision manifest

#### Scenario: Meta main changes

- **WHEN** a commit reaches the meta repository’s `main` branch
- **THEN** authoritative cross-repository validation runs with the meta commit bound to `github.sha`
