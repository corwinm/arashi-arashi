# Data Model: GitHub Actions Release Workflow

**Feature**: 019-release-workflow  
**Date**: 2026-02-06

## Overview

This feature is a CI/CD automation workflow with minimal persistent state. Most "data" exists transiently during workflow execution. Persistent data is managed by external systems (GitHub, npm, git).

---

## Entities

### 1. Release

**Description**: Represents a versioned distribution of Arashi with associated artifacts.

**Attributes**:
- **version** (string, required): Semantic version number (e.g., "1.5.0")
- **tag** (string, required): Git tag name (e.g., "v1.5.0")
- **changelog** (string, required): Generated release notes in markdown format
- **commit_sha** (string, required): Git commit SHA this release is built from
- **created_at** (timestamp, required): Release creation timestamp
- **binaries** (array of BinaryArtifact, required): Compiled executables for each platform
- **npm_published** (boolean, required): Whether package was published to npm registry
- **release_url** (string, required): GitHub release page URL

**State Transitions**:
```
[Building] → [Built] → [Tagged] → [Released] → [Published]
                ↓           ↓          ↓
            [Failed]    [Failed]   [Failed]
```

**Validation Rules**:
- Version must follow semantic versioning (major.minor.patch)
- Version must be greater than previous release
- Tag must match version with "v" prefix
- Must have binaries for all required platforms (Linux x64, macOS ARM64, Windows x64)
- Changelog must not be empty

**Storage**: GitHub Releases API

---

### 2. Version

**Description**: Semantic version number calculated from commit history.

**Attributes**:
- **major** (integer, required): Major version number (breaking changes)
- **minor** (integer, required): Minor version number (new features)
- **patch** (integer, required): Patch version number (bug fixes)
- **full_version** (string, computed): Formatted as "major.minor.patch"

**Calculation Rules**:
- Increment **major** if any commit contains `BREAKING CHANGE:` or `feat!:`/`fix!:` (0.x.x → 1.0.0)
- Increment **minor** if any commit starts with `feat:` and no breaking changes (1.0.0 → 1.1.0)
- Increment **patch** if any commit starts with `fix:` and no features/breaking changes (1.0.0 → 1.0.1)
- If multiple types present, use highest priority: major > minor > patch
- If no conventional commits found, skip release (no version bump)

**Special Handling (Pre-1.0.0)**:
- Per Arashi constitution, pre-1.0.0 releases treat minor as breaking changes
- Major version remains 0 until explicit 1.0.0 release

**Storage**: package.json (version field), git tags

---

### 3. Binary Artifact

**Description**: Platform-specific executable file for Arashi CLI.

**Attributes**:
- **platform** (enum, required): Target platform
  - Values: "linux-x64" | "darwin-arm64" | "windows-x64"
- **filename** (string, required): Binary filename (e.g., "arashi-bun-linux-x64")
- **size** (integer, required): File size in bytes
- **checksum** (string, required): SHA256 checksum for integrity verification
- **build_time** (duration, required): Time taken to compile this binary
- **download_url** (string, required): GitHub release asset download URL

**Validation Rules**:
- Size must be < 70MB (target is 50-60MB, hard limit 70MB)
- Checksum must be valid SHA256 hash
- Filename must match pattern: `arashi-bun-{platform}[.exe]`
- All three required platforms must be present for a valid release

**Storage**: GitHub Releases (attached assets)

---

### 4. Changelog Entry

**Description**: Structured record of changes included in a release, generated from commit messages.

**Attributes**:
- **type** (enum, required): Change category
  - Values: "Features" | "Bug Fixes" | "Performance Improvements" | "Dependencies" | "Breaking Changes"
- **description** (string, required): Human-readable change description
- **commit_sha** (string, required): Associated git commit
- **pr_number** (integer, optional): Associated pull request number
- **pr_url** (string, optional): Link to pull request

**Grouping Rules**:
- `feat:` commits → "Features" section
- `fix:` commits → "Bug Fixes" section
- `perf:` commits → "Performance Improvements" section
- `deps:` commits → "Dependencies" section
- `BREAKING CHANGE:` → "Breaking Changes" section (always listed first)
- Other commit types (docs, chore, test) → Hidden from user-facing changelog

**Storage**: CHANGELOG.md (markdown file), GitHub release notes

---

### 5. Workflow Execution

**Description**: Transient state during a single workflow run. Not persisted after completion.

**Attributes**:
- **run_id** (string, required): GitHub Actions run identifier
- **trigger** (enum, required): How workflow was initiated
  - Values: "workflow_dispatch" (manual trigger)
- **triggered_by** (string, required): GitHub username who initiated workflow
- **start_time** (timestamp, required): Workflow start timestamp
- **status** (enum, required): Current execution status
  - Values: "running" | "succeeded" | "failed" | "cancelled"
- **build_artifacts** (array of BinaryArtifact, transient): Compiled binaries during build phase
- **calculated_version** (Version, transient): Version determined by commit analysis
- **error_message** (string, optional): Failure reason if status is "failed"

**State Machine**:
```
[Triggered] → [Analyzing Commits] → [Building Binaries] → [Creating Release] → [Publishing] → [Completed]
                       ↓                    ↓                      ↓               ↓
                   [Failed]             [Failed]               [Failed]       [Failed]
```

**Rollback Behavior**:
- If build phase fails: No artifacts created, no tags, workflow exits cleanly
- If release phase fails: Builds complete but no GitHub release created, workflow fails
- If publishing phase fails: GitHub release created, npm publish skipped (not considered fatal)

**Storage**: GitHub Actions execution logs (ephemeral, 90-day retention)

---

## Relationships

```
Release (1) ──< (3) Binary Artifact
   │
   └──< (N) Changelog Entry

Version (1) ──> (1) Release

Workflow Execution (1) ──> (0..1) Release
```

**Relationship Descriptions**:
- A **Release** contains exactly 3 **Binary Artifacts** (one per required platform)
- A **Release** contains multiple **Changelog Entries** grouped by type
- A **Version** corresponds to exactly one **Release** (versions are unique)
- A **Workflow Execution** produces at most one **Release** (none if no changes or failure)

---

## External System Integrations

### GitHub Repository (git)

**Interactions**:
- **Read**: Fetch commit history since last tag
- **Write**: Create git tag for new version
- **Write**: Commit version bump changes (package.json, CHANGELOG.md)

**Data Modified**:
- `.git/refs/tags/v{version}` - New git tag
- `package.json` - Version field updated
- `CHANGELOG.md` - New release section added

---

### GitHub Releases API

**Interactions**:
- **Read**: Check for existing releases/tags
- **Write**: Create new release with generated notes
- **Write**: Upload binary artifacts as release assets

**Authentication**: `GITHUB_TOKEN` (automatic, scoped to repository)

---

### npm Registry

**Interactions**:
- **Write**: Publish package with new version

**Authentication**: `NPM_TOKEN` secret (optional, graceful degradation if missing)

**Idempotency**: npm prevents duplicate version publishes (error if version exists)

---

## Configuration Schema

### .releaserc.json (semantic-release)

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  ]
}
```

**Validation**:
- `branches` must include currently checked-out branch
- All plugins must be installed as npm dependencies
- `@semantic-release/git` must list all version-bearing files in `assets`

---

## Edge Cases & Special Handling

### No Conventional Commits

**Scenario**: All commits since last release are non-conventional (e.g., all `docs:`, `chore:`)

**Behavior**:
- semantic-release skips version bump
- No release created
- Workflow succeeds with "No release needed" message
- Exit cleanly (not an error)

---

### Duplicate Release Attempt

**Scenario**: Workflow triggered when no new commits exist since last release

**Behavior**:
- semantic-release detects no changes
- Workflow exits with "No new commits since last release"
- No tags or releases created
- Exit cleanly (not an error)

---

### Partial Binary Build Failure

**Scenario**: One platform's build fails (e.g., Windows compilation error)

**Behavior**:
- Matrix build job reports failure for that platform
- Other platform builds may succeed
- Release job never runs (depends on successful build job)
- No partial release created (atomic guarantee)
- Workflow fails with clear error indicating which platform failed

---

### Missing NPM_TOKEN

**Scenario**: NPM_TOKEN secret not configured in repository settings

**Behavior**:
- semantic-release plugin detects missing token
- GitHub release and tagging proceed normally
- npm publish step skipped with warning log
- Workflow succeeds (npm publishing is optional per FR-013)

---

### Malformed Commit Messages

**Scenario**: Commits don't follow conventional format (e.g., "fixed a bug")

**Behavior**:
- semantic-release ignores non-conventional commits
- Only conventional commits affect version calculation
- If all commits are malformed, treated as "no changes" (skip release)
- No errors raised (graceful degradation)

---

## Performance Considerations

### Build Phase Parallelization

**Strategy**: Matrix builds run in parallel (3 concurrent runners)

**Timing**:
- Linux x64: ~1-2 minutes
- macOS ARM64: ~1-2 minutes (cross-compiled from Linux)
- Windows x64: ~1-2 minutes (cross-compiled from Linux)
- **Total**: ~2-3 minutes (parallel execution)

---

### Artifact Upload/Download

**Optimization**:
- Artifacts retained for only 1 day (minimum needed for release job)
- Use `merge-multiple: true` in download to flatten directory structure
- Compress artifacts before upload (GitHub Actions does this automatically)

**Timing**: ~30 seconds for upload + download across jobs

---

### Release Creation

**Timing**:
- Commit analysis: ~10 seconds
- Changelog generation: ~5 seconds
- Git operations (tag, commit, push): ~15 seconds
- GitHub release creation: ~10 seconds
- npm publish: ~20 seconds
- **Total**: ~60 seconds

---

## Total Workflow Duration

**Target**: < 10 minutes (per SC-001)  
**Actual Expected**: 3-5 minutes

**Breakdown**:
- Build phase: 2-3 minutes (parallel)
- Artifact transfer: 30 seconds
- Release phase: 60 seconds
- **Total**: ~4 minutes (well under target)

---

## Conclusion

This data model defines the minimal persistent state needed for release automation. Most data is transient (workflow execution state) or managed by external systems (GitHub, npm, git). The atomic two-job pattern ensures no partial releases occur, maintaining data consistency across all distribution channels.
