# release-workflow Specification

## Purpose
TBD - created by archiving change consolidate-legacy-speckit-specifications. Update Purpose after archive.
## Requirements
### Requirement: Semantic release derives and records one version
The Arashi release workflow SHALL derive the next semantic version from conventional commits, update the maintained package metadata and changelog exactly once, create one release metadata commit, and create the corresponding Git reference without publishing a duplicate version.

#### Scenario: Releasable commits exist
- **WHEN** semantic-release evaluates conventional commits since the last release
- **THEN** it selects the highest required semantic bump, updates package metadata and changelog, and creates one release identity

#### Scenario: Version already exists
- **WHEN** the calculated version already has a published release or conflicting Git reference
- **THEN** release fails closed instead of overwriting or duplicating the version

### Requirement: Production release publishes the complete supported distribution
A successful production release SHALL publish the npm package through the maintained trusted-publishing path and create a GitHub release containing release notes, supported platform binaries, launcher/install payloads, and checksum metadata required by canonical installer and alias contracts. The release SHALL not be considered complete when a required supported artifact is missing.

#### Scenario: Production release succeeds
- **WHEN** release preflight, signing, build, verification, npm publication, and GitHub publication succeed
- **THEN** the exact version is installable from npm and its GitHub release contains the complete required artifact set

#### Scenario: Required artifact is missing
- **WHEN** any required supported binary, launcher/install payload, or checksum is absent or fails verification
- **THEN** the workflow fails before claiming a complete production release

### Requirement: Maintainers can inspect release behavior without mutation
The release workflow SHALL provide a dry-run or equivalent non-publishing validation path that evaluates versioning and release configuration without creating commits, tags, npm versions, or GitHub releases.

#### Scenario: Release dry-run executes
- **WHEN** a maintainer runs the supported release dry-run path
- **THEN** version and plugin configuration are evaluated
- **AND** no repository or distribution channel is mutated

