# Feature Specification: GitHub Actions Release Workflow

**Feature Branch**: `019-release-workflow`  
**Created**: 2026-02-06  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/36"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated Release Creation (Priority: P1)

As a maintainer, I need to trigger a new release that automatically determines the version number, creates release artifacts, and publishes them to distribution channels so that users can access new versions without manual intervention.

**Why this priority**: This is the core functionality that delivers immediate value - enabling releases to happen at all. Without this, no other release features matter.

**Independent Test**: Can be fully tested by triggering the workflow with a manual dispatch and verifying that a GitHub release is created with the correct version number and binaries attached.

**Acceptance Scenarios**:

1. **Given** a repository with committed changes, **When** I manually trigger the release workflow, **Then** the system determines the appropriate version bump based on commit messages
2. **Given** a new version has been determined, **When** the workflow completes, **Then** a Git tag is created with the new version number
3. **Given** the workflow has completed successfully, **When** I check GitHub releases, **Then** a new release exists with binaries for all supported platforms
4. **Given** the release is created, **When** I examine the release notes, **Then** they contain a changelog generated from commit history

---

### User Story 2 - Version Management (Priority: P2)

As a maintainer, I need the system to automatically parse my commit messages using conventional commit format and determine whether to bump major, minor, or patch versions so that semantic versioning is consistently applied.

**Why this priority**: Essential for maintaining proper semantic versioning, but can be initially simplified with manual version selection if needed.

**Independent Test**: Can be tested by creating commits with different conventional commit prefixes (feat:, fix:, BREAKING CHANGE:) and verifying the correct version bump is calculated.

**Acceptance Scenarios**:

1. **Given** commits contain only "fix:" prefixes, **When** the workflow runs, **Then** the patch version is incremented
2. **Given** commits contain "feat:" prefixes, **When** the workflow runs, **Then** the minor version is incremented
3. **Given** commits contain "BREAKING CHANGE:" in the footer, **When** the workflow runs, **Then** the major version is incremented
4. **Given** multiple commit types exist, **When** the workflow runs, **Then** the highest precedence version bump is applied (major > minor > patch)

---

### User Story 3 - NPM Package Publishing (Priority: P3)

As a maintainer, I need releases to be automatically published to the npm registry so that users can install the package via npm/bun/yarn package managers.

**Why this priority**: Important for distribution, but GitHub releases and binaries provide alternative installation methods, making this lower priority.

**Independent Test**: Can be tested by verifying that after a successful release, the package appears on npmjs.com with the correct version and can be installed via npm.

**Acceptance Scenarios**:

1. **Given** a release workflow has completed successfully, **When** I search npmjs.com, **Then** the new version is available
2. **Given** the package is published to npm, **When** a user runs `npm install arashi`, **Then** they receive the latest released version
3. **Given** NPM_TOKEN secret is not configured, **When** the workflow runs, **Then** it completes successfully but skips npm publishing with a clear warning

---

### Edge Cases

- What happens when no conventional commits are found? (Default to patch bump)
- What happens when the workflow is triggered but there are no changes since the last release? (Fail with clear message)
- What happens when the NPM_TOKEN secret is missing or invalid? (Skip npm publishing, log warning, continue with GitHub release)
- What happens when binary compilation fails for one platform? (Continue with other platforms, mark release as partial)
- What happens when two releases are triggered simultaneously? (Second one should fail or queue)
- What happens when the changelog generation encounters malformed commit messages? (Include them as-is, continue processing)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a manual trigger mechanism for initiating releases
- **FR-002**: System MUST parse commit messages following conventional commit specification (feat, fix, BREAKING CHANGE)
- **FR-003**: System MUST calculate version bumps according to semantic versioning rules (major.minor.patch)
- **FR-004**: System MUST update version numbers in all relevant project files (package.json, etc.)
- **FR-005**: System MUST generate a CHANGELOG.md file from commit history
- **FR-006**: System MUST create a Git tag with the new version number
- **FR-007**: System MUST commit version bump changes with an automated commit message
- **FR-008**: System MUST compile binaries for all supported platforms (Linux, macOS, Windows)
- **FR-009**: System MUST create a GitHub release with the generated changelog as release notes
- **FR-010**: System MUST attach compiled binaries to the GitHub release
- **FR-011**: System MUST publish the package to npm registry when NPM_TOKEN secret is available
- **FR-012**: System MUST provide clear documentation of the release process for maintainers
- **FR-013**: System MUST handle missing NPM_TOKEN gracefully by skipping npm publishing without failing the entire workflow
- **FR-014**: System MUST prevent duplicate releases for the same version

### Key Entities

- **Release**: Represents a versioned distribution with version number, changelog, binaries, and publication status
- **Version**: Semantic version number (major.minor.patch) calculated from commit history
- **Binary Artifact**: Platform-specific executable file (linux-x64, darwin-arm64, win32-x64, etc.)
- **Changelog Entry**: Generated from commit messages, grouped by type (features, fixes, breaking changes)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Maintainers can create a complete release in under 10 minutes from trigger to publication
- **SC-002**: 100% of releases have correctly calculated semantic versions based on commit history
- **SC-003**: Every release includes binaries for all supported platforms (Linux, macOS, Windows)
- **SC-004**: Changelog is automatically generated for every release without manual editing
- **SC-005**: The release process completes successfully 95% of the time without manual intervention
- **SC-006**: Time spent on manual release tasks reduces from ~30 minutes to under 2 minutes per release
