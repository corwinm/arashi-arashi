## ADDED Requirements

### Requirement: Temporary release-runtime compatibility workarounds are retired after upstream resolution
When an Arashi release workflow uses an older project Node runtime to avoid a confirmed release-tool incompatibility, the workflow SHALL return to the current supported LTS runtime after the upstream fix is published, locked, and validated. The release dependency graph MUST resolve the minimum fixed plugin version before the runtime workaround is removed.

#### Scenario: Upstream release fixes the pinned-runtime incompatibility
- **WHEN** the upstream release plugin publishes a version that fixes the incompatibility and validates the current supported LTS runtime
- **THEN** Arashi updates its locked release dependency to at least that fixed version before changing the release workflow to the current supported LTS runtime

#### Scenario: Lockfile still contains the affected plugin version
- **WHEN** the dependency manifest permits a fixed release-plugin version but the repository lockfile still resolves the affected version
- **THEN** the runtime workaround remains in place until the lockfile is updated and the resolved dependency version is verified

#### Scenario: Fixed release toolchain is validated before merge
- **WHEN** the runtime workaround and compatibility comment are removed
- **THEN** repository quality gates, release asset builds, checksum generation, workflow review, resolved dependency inspection, and available semantic-release dry-run validation complete successfully or explicitly document any environment-limited check

#### Scenario: Production asset upload provides final verification
- **WHEN** the first normal release runs after the runtime workaround is removed
- **THEN** maintainers verify the semantic-release step succeeded, the GitHub release is published rather than left as a draft, and every expected release asset is present

#### Scenario: Newer non-LTS runtime has a separate open incompatibility
- **WHEN** a newer Node major is not yet supported by the release toolchain or has an unresolved compatibility issue
- **THEN** restoring the current supported LTS runtime does not implicitly adopt that newer Node major
