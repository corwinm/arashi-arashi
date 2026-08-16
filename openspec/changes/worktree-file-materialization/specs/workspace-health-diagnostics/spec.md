## ADDED Requirements

### Requirement: Doctor diagnoses configured worktree materialization without mutation
For configured repositories, `arashi doctor` SHALL use the shared materialization policy and path resolver to validate Git-primary canonical source-checkout availability, source existence, normalized collisions, destination containment, current managed-worktree destination shape, broken or misdirected configured links, and available non-mutating platform capability evidence. For `copy`, doctor SHALL classify only missing destination, unsafe ancestor, and source/destination file-versus-directory kind mismatch; a present compatible-kind copy has unprovable ownership and freshness and MUST NOT be called conflicting, stale, or healthy-by-content. Doctor MUST NOT read or hash file contents, execute hooks, create temporary probe links/directories, repair links, or otherwise mutate the filesystem.

#### Scenario: Materialization configuration is healthy
- **WHEN** configured sources and managed-worktree destinations satisfy the materialization contract
- **THEN** doctor emits no blocking materialization finding
- **AND** does not read configured file contents

#### Scenario: Optional source is missing
- **WHEN** a configured source path is absent from the canonical checkout
- **THEN** doctor reports a stable non-blocking missing-source finding with repository, action, and relative path
- **AND** preserves the runtime rule that create may skip that source

#### Scenario: Canonical source checkout is unavailable
- **WHEN** a repository with materialization entries lacks a usable canonical source checkout
- **THEN** doctor reports a blocking finding with actionable source-checkout guidance

#### Scenario: Managed link is broken or misdirected
- **WHEN** an existing managed worktree has a configured symlink destination that is broken or does not target the exact canonical configured source path
- **THEN** doctor reports a stable finding identifying the repository, worktree, and relative path
- **AND** does not follow the link for repair or expose source contents

#### Scenario: Destination ancestor escapes
- **WHEN** a configured destination in an existing managed worktree traverses an existing link/junction ancestor or non-directory component
- **THEN** doctor reports the same containment classification used by create preflight

#### Scenario: Existing copied destination has a compatible kind
- **WHEN** an existing managed worktree contains a regular file or directory matching the configured copy source kind
- **THEN** doctor does not claim ownership, content equality, freshness, or a destination conflict
- **AND** performs no content read or hash comparison

#### Scenario: Existing copied destination has the wrong kind
- **WHEN** an existing managed worktree copy destination is missing or has a different file-versus-directory kind from its source
- **THEN** doctor reports the bounded missing or kind-mismatch finding it can prove

#### Scenario: Symlink capability cannot be proven non-mutatingly
- **WHEN** current platform evidence cannot establish symbolic-link capability without creating a probe
- **THEN** doctor reports capability as informational or unknown rather than mutating state or claiming a false blocking result

#### Scenario: Doctor JSON remains isolated
- **WHEN** materialization findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with stable findings
- **AND** no file content, hash, environment value, or human progress leaks to stdout

#### Scenario: Standalone workspace is diagnosed
- **WHEN** doctor runs in implicit standalone mode
- **THEN** it does not invent repository materialization policy or findings because the feature is configured-mode only
