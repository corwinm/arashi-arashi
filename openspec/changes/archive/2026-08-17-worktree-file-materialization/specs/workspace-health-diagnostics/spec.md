## ADDED Requirements

### Requirement: Doctor diagnoses configured worktree materialization without mutation
For configured repositories, `arashi doctor` SHALL use the shared materialization policy and path resolver to validate Git-primary canonical source-checkout availability, source existence, normalized collisions, destination containment, current managed-worktree destination shape, broken or misdirected configured links, and available non-mutating platform capability evidence. For `copy`, doctor SHALL classify only missing destination, unsafe ancestor, and source/destination file-versus-directory kind mismatch; a present compatible-kind copy has unprovable ownership and freshness and MUST NOT be called conflicting, stale, or healthy-by-content. Doctor MUST NOT read or hash file contents, execute hooks, create temporary probe links/directories, repair links, or otherwise mutate the filesystem.

Every materialization finding SHALL use one closed record below. Entry findings SHALL use scope `materialization:<repositoryId>:<action>:<normalizedPath>` for source-only state or `materialization:<repositoryId>:<normalizedWorktreePath>:<action>:<normalizedPath>` for a managed-worktree destination; repository-wide findings SHALL use `materialization:<repositoryId>:source-checkout` or `materialization:<repositoryId>:symlink-capability`. Every record's `details` SHALL contain `repositoryId`, `action`, `path`, and `worktreePath`, using `null` where the finding is repository-wide or has no managed-worktree target. Kind mismatch additionally SHALL contain `expectedKind` and `actualKind`; unsafe ancestor additionally SHALL contain `ancestorKind`. All materialization findings SHALL use `suggestedCommands: []`: diagnostics may explain a manual check, but doctor SHALL NOT advertise a universal repair command for machine-local files or platform policy.

| Code | Severity | Category | Meaning |
| --- | --- | --- | --- |
| `MATERIALIZATION_SOURCE_CHECKOUT_UNAVAILABLE` | `error` | `repository` | No usable Git-primary non-bare checkout exists. |
| `MATERIALIZATION_SOURCE_MISSING` | `info` | `repository` | An optional configured source is absent and create would skip it. |
| `MATERIALIZATION_COPY_DESTINATION_MISSING` | `warning` | `worktree` | A managed worktree lacks the configured copy destination. |
| `MATERIALIZATION_COPY_DESTINATION_KIND_MISMATCH` | `warning` | `worktree` | Source and destination file/directory kinds differ. |
| `MATERIALIZATION_DESTINATION_ANCESTOR_UNSAFE` | `error` | `worktree` | A destination ancestor is a link, junction/reparse equivalent, or non-directory. |
| `MATERIALIZATION_SYMLINK_BROKEN` | `warning` | `worktree` | A configured managed-worktree link does not resolve. |
| `MATERIALIZATION_SYMLINK_MISDIRECTED` | `warning` | `worktree` | A configured link does not target the exact canonical source path or expected source kind. |
| `MATERIALIZATION_SYMLINK_CAPABILITY_UNAVAILABLE` | `error` | `configuration` | Non-mutating evidence proves native symbolic links cannot be created under current policy. |
| `MATERIALIZATION_SYMLINK_CAPABILITY_UNKNOWN` | `info` | `configuration` | Capability cannot be established without a forbidden mutation probe. |

Only the `error` rows SHALL contribute to doctor's blocking count and nonzero exit status; these materialization warnings and info findings SHALL preserve zero exit status when no other error exists.

#### Scenario: Materialization configuration is healthy
- **WHEN** configured sources and managed-worktree destinations satisfy the materialization contract
- **THEN** doctor emits no blocking materialization finding
- **AND** does not read configured file contents

#### Scenario: Optional source is missing
- **WHEN** a configured source path is absent from the canonical checkout
- **THEN** doctor reports `MATERIALIZATION_SOURCE_MISSING` with the exact info/repository scope and details contract
- **AND** preserves the runtime rule that create may skip that source

#### Scenario: Canonical source checkout is unavailable
- **WHEN** a repository with materialization entries lacks a usable canonical source checkout
- **THEN** doctor reports `MATERIALIZATION_SOURCE_CHECKOUT_UNAVAILABLE` as an error/repository finding and exits nonzero

#### Scenario: Managed link is broken or misdirected
- **WHEN** an existing managed worktree has a configured symlink destination that is broken or does not target the exact canonical configured source path
- **THEN** doctor reports `MATERIALIZATION_SYMLINK_BROKEN` or `MATERIALIZATION_SYMLINK_MISDIRECTED` with the exact warning/worktree scope and details contract
- **AND** does not follow the link for repair or expose source contents

#### Scenario: Destination ancestor escapes
- **WHEN** a configured destination in an existing managed worktree traverses an existing link/junction ancestor or non-directory component
- **THEN** doctor reports `MATERIALIZATION_DESTINATION_ANCESTOR_UNSAFE` as an error/worktree finding with `ancestorKind` and exits nonzero

#### Scenario: Existing copied destination has a compatible kind
- **WHEN** an existing managed worktree contains a regular file or directory matching the configured copy source kind
- **THEN** doctor does not claim ownership, content equality, freshness, or a destination conflict
- **AND** performs no content read or hash comparison

#### Scenario: Existing copied destination has the wrong kind
- **WHEN** an existing managed worktree copy destination is missing or has a different file-versus-directory kind from its source
- **THEN** doctor reports `MATERIALIZATION_COPY_DESTINATION_MISSING` or `MATERIALIZATION_COPY_DESTINATION_KIND_MISMATCH` with the exact warning/worktree details it can prove


#### Scenario: Symlink capability is proven unavailable
- **WHEN** non-mutating platform evidence proves configured symbolic links cannot be created
- **THEN** doctor reports `MATERIALIZATION_SYMLINK_CAPABILITY_UNAVAILABLE` as error/configuration and exits nonzero
- **AND** uses the repository-wide capability scope, null entry/worktree details, and no suggested command

#### Scenario: Symlink capability cannot be proven non-mutatingly
- **WHEN** current platform evidence cannot establish symbolic-link capability without creating a probe
- **THEN** doctor reports `MATERIALIZATION_SYMLINK_CAPABILITY_UNKNOWN` as info/configuration with zero exit status when no other error exists, rather than mutating state or claiming a false blocking result

#### Scenario: Doctor JSON remains isolated
- **WHEN** materialization findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with stable findings
- **AND** no file content, hash, environment value, or human progress leaks to stdout

#### Scenario: Standalone workspace is diagnosed
- **WHEN** doctor runs in implicit standalone mode
- **THEN** it does not invent repository materialization policy or findings because the feature is configured-mode only
