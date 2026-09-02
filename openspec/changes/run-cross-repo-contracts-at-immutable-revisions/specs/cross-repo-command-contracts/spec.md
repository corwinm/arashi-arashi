## ADDED Requirements

### Requirement: Child repositories SHALL invoke authoritative cross-repository validation

Each participating child repository SHALL invoke the public authoritative cross-repository workflow for pull requests and pushes to its default branch. The caller SHALL identify its trusted logical upstream repository from the supported fixed set and SHALL pass the actual event source repository plus the event's full child commit SHA without passing secrets. The called workflow SHALL validate the upstream caller identity and, when source differs from logical repository, SHALL validate that the public source belongs to the expected fork network.

#### Scenario: Child pull request changes a shared contract

- **WHEN** a participating child pull request is opened or updated
- **THEN** the child commit runs the authoritative cross-repository semantic stage set
- **AND** the reusable workflow receives the pull request head SHA as the triggering child revision
- **AND** it records the trusted logical upstream separately from the pull request head source repository

#### Scenario: Child change reaches main

- **WHEN** a participating child commit is pushed to `main`
- **THEN** the merged child commit runs the authoritative cross-repository semantic stage set
- **AND** the reusable workflow receives `github.sha` as the triggering child revision

#### Scenario: Caller attempts to pass authority

- **WHEN** a child calls the reusable workflow
- **THEN** the caller and called workflow use read-only contents permission
- **AND** no PAT, release credential, inherited secret, or write permission is passed

### Requirement: Cross-repository CI SHALL bind validation to immutable revisions

Before any repository checkout or semantic checker execution, authoritative CI SHALL validate its invocation and resolve exactly one source repository and full lowercase 40-character commit SHA for the meta repository and every participating child. The triggering child SHALL resolve to the explicit caller source and SHA. For a child-called run, the workflow SHALL require `job.workflow_repository` to equal `corwinm/arashi-arashi` and SHALL resolve the meta repository to `job.workflow_sha`, binding validation to the exact reusable-workflow commit selected by GitHub rather than a fresh default-branch lookup. Every repository checkout SHALL use the corresponding resolved source and SHA and SHALL NOT use a branch, tag, default checkout, pull-request merge ref, or other floating revision.

#### Scenario: Child-triggered validation resolves repositories

- **WHEN** a supported child invokes validation with a valid full commit SHA
- **THEN** that child is resolved to the supplied source repository and SHA
- **AND** the meta repository is resolved to the called job's validated `job.workflow_repository` and `job.workflow_sha`
- **AND** all other repositories are resolved once from their intended default refs before checkout
- **AND** every checkout and checker uses only the resolved SHAs

#### Scenario: Direct meta pull request uses coordinated branches

- **WHEN** the meta workflow runs for a pull request whose branch also exists in one or more children
- **THEN** each matching child branch is resolved to its full SHA before checkout
- **AND** children without that branch are resolved from `main`

#### Scenario: Fork pull request is validated

- **WHEN** a supported child caller reports a source repository different from its trusted logical upstream
- **THEN** validation verifies that source belongs to the expected public fork network
- **AND** checks out the source repository at the exact pull request head SHA into the logical child's canonical path
- **AND** records both logical and source repository identities in durable evidence

#### Scenario: Invocation is malformed

- **WHEN** the triggering logical repository is unsupported, caller identity is mismatched, the logical/source/SHA tuple is incomplete, the source is not the expected upstream or fork, the SHA is not a full lowercase hexadecimal commit identity, the called job workflow repository is unexpected, or a selected ref cannot be resolved
- **THEN** validation exits unsuccessfully before repository checkout and semantic checker execution

### Requirement: Cross-repository CI SHALL publish durable complete revision evidence

Authoritative CI SHALL generate one deterministic JSON manifest after checkout that records schema version, triggering logical/source repository and revision, and one canonical entry containing logical repository, source repository, and SHA for the meta repository and every participating child. It SHALL verify local `HEAD` identities equal the resolved revisions, append the manifest to the job summary, upload the exact manifest under the fixed name `cross-repo-revisions` with missing files treated as errors, require the upload action's non-empty SHA-256 artifact-archive digest, and append that digest to the summary.

#### Scenario: Revision evidence is published

- **WHEN** all repositories are checked out successfully
- **THEN** the manifest lists every repository exactly once in canonical order with a full SHA
- **AND** its trigger fields match the invocation
- **AND** the identical JSON bytes are available in the summary and artifact
- **AND** the summary identifies the non-empty GitHub artifact-archive digest

#### Scenario: Semantic validation fails after checkout

- **WHEN** a later contract stage fails
- **THEN** the already-created revision manifest remains available for that run

#### Scenario: Revision evidence drifts

- **WHEN** a local checkout differs from its resolved SHA, an entry is missing or duplicated, logical/source attribution is wrong, ordering changes, a SHA is malformed, the called meta source is freshly resolved from `main`, the manifest upload can continue without its file, the upload digest is empty, or workflow reporting becomes log-only
- **THEN** deterministic contract validation reports the mismatch and exits unsuccessfully

### Requirement: Direct meta validation SHALL remain available

The authoritative workflow SHALL retain pull-request, default-branch push, and manual triggers in the meta repository while also supporting child calls. Direct meta runs SHALL use the same immutable resolution and revision-evidence path as child-triggered runs.

#### Scenario: Maintainer validates a coordinated meta branch

- **WHEN** the workflow runs directly for a meta pull request
- **THEN** matching coordinated child branches remain eligible
- **AND** the run produces the same complete immutable revision manifest

#### Scenario: Maintainer manually validates current defaults

- **WHEN** the workflow runs by manual dispatch
- **THEN** participating children resolve from their default branches
- **AND** the run produces the same complete immutable revision manifest

#### Scenario: Meta main changes

- **WHEN** a commit reaches the meta repository’s `main` branch
- **THEN** authoritative cross-repository validation runs with the meta commit bound to `github.sha`
