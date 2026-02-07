# Workflow Interface Contract: GitHub Actions Release Workflow

**Feature**: 019-release-workflow  
**Date**: 2026-02-06  
**Type**: CI/CD Automation Contract

## Overview

This document defines the interface contract for the GitHub Actions release workflow, including trigger mechanisms, inputs, outputs, permissions, and external integrations.

---

## Workflow Trigger

### Manual Dispatch (workflow_dispatch)

**Event**: `workflow_dispatch`  
**Branch**: `main` (or configured default branch)  
**User Action**: Manually triggered via GitHub UI or API

**Trigger Requirements**:
- User must have write access to repository
- Workflow must be on default branch (main)
- No other release workflows should be running (prevent race conditions)

**Example**:
```yaml
on:
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Run in dry-run mode (no actual release)'
        required: false
        type: boolean
        default: false
```

**Optional Inputs**:
- `dry_run` (boolean): If true, perform all steps except creating release (for testing)

---

## Workflow Permissions

### GitHub Token Permissions

**Required**:
```yaml
permissions:
  contents: write        # Create tags, commits, releases
  pull-requests: write   # Comment on PRs (optional, for semantic-release)
  issues: write          # Comment on closed issues (optional, for semantic-release)
```

**Rationale**:
- `contents: write` - Needed to create git tags, commit version bumps, create GitHub releases
- `pull-requests: write` - Allows semantic-release to comment on PRs included in release
- `issues: write` - Allows semantic-release to comment on issues closed by release

---

## Secrets

### Required Secrets

**None** - Workflow can run with only default `GITHUB_TOKEN`

### Optional Secrets

#### NPM_TOKEN

**Type**: npm authentication token  
**Scope**: Automation token with publish permissions  
**Required For**: Publishing to npm registry (FR-011)  
**Behavior if Missing**: Workflow continues, skips npm publishing with warning log

**Setup**:
1. Generate token at https://www.npmjs.com/settings/{username}/tokens
2. Add to GitHub repository secrets as `NPM_TOKEN`
3. Ensure token has `Automation` type and publish permissions

---

## Job Interfaces

### Job 1: Build Binaries (Matrix)

**Name**: `build`  
**Strategy**: Matrix build for 3 platforms  
**Runner**: `ubuntu-latest` (single OS for all platforms via cross-compilation)

#### Inputs

- Repository checkout (default branch)
- Source code from `repos/arashi/src/`
- Build configuration from `package.json`

#### Matrix Configuration

```yaml
strategy:
  matrix:
    target:
      - bun-linux-x64       # Linux x64
      - bun-darwin-arm64    # macOS ARM64
      - bun-windows-x64     # Windows x64
```

#### Outputs (Artifacts)

**Artifact Name**: `arashi-{target}`  
**Retention**: 1 day  
**Contents**: Single compiled binary

**Artifact Specification**:

| Platform | Artifact Name | Binary Filename | Size Limit |
|----------|---------------|-----------------|------------|
| Linux x64 | `arashi-bun-linux-x64` | `arashi-bun-linux-x64` | 70 MB |
| macOS ARM64 | `arashi-bun-darwin-arm64` | `arashi-bun-darwin-arm64` | 70 MB |
| Windows x64 | `arashi-bun-windows-x64` | `arashi-bun-windows-x64.exe` | 70 MB |

#### Exit Codes

- **0**: Binary built successfully, artifact uploaded
- **1**: Build failed (compilation error, missing dependencies, etc.)
- **2**: Artifact upload failed

#### Build Command Contract

```bash
bun build --compile \
  --target={matrix.target} \
  --minify \
  --sourcemap \
  --bytecode \
  --production \
  ./repos/arashi/src/index.ts \
  --outfile dist/arashi-{matrix.target}
```

**Flags**:
- `--compile`: Create standalone executable
- `--target`: Cross-compilation target platform
- `--minify`: Reduce code size
- `--sourcemap`: Include debugging information (compressed)
- `--bytecode`: Compile to bytecode for 2x faster startup
- `--production`: Set NODE_ENV=production

---

### Job 2: Create Release (Single)

**Name**: `release`  
**Depends On**: `build` (only runs if all matrix builds succeed)  
**Runner**: `ubuntu-latest`

#### Inputs

- Repository checkout (full history: `fetch-depth: 0`)
- All build artifacts from `build` job
- Configuration from `.releaserc.json`

#### Processing Steps

1. **Analyze Commits**: Parse commit messages since last tag
2. **Calculate Version**: Determine semantic version bump
3. **Update Files**: Modify `package.json` and `CHANGELOG.md`
4. **Commit Changes**: Commit version bump with `[skip ci]`
5. **Create Tag**: Create git tag `v{version}`
6. **Push Changes**: Push commit and tag to repository
7. **Create GitHub Release**: Create release with changelog as notes
8. **Attach Binaries**: Upload artifacts to GitHub release
9. **Publish to npm**: Publish package (if NPM_TOKEN available)

#### Outputs (GitHub Release)

**Release Specification**:

| Field | Value | Source |
|-------|-------|--------|
| Tag Name | `v{major}.{minor}.{patch}` | Calculated by semantic-release |
| Release Name | `{major}.{minor}.{patch}` | Same as tag without "v" prefix |
| Release Body | Generated changelog | Parsed from commit messages |
| Draft | `false` | Always published immediately |
| Pre-release | `true` if version < 1.0.0 | Based on semantic version |
| Assets | 3 binary files | Artifacts from build job |

**Example Release**:
```
Tag: v0.5.0
Name: 0.5.0
Pre-release: true

Body:
## Features
* add init command for workspace initialization (#23) (abc1234)
* implement list command with JSON output (#24) (def5678)

## Bug Fixes
* resolve path resolution on Windows (#25) (ghi9012)
```

#### Outputs (npm Package)

**Package Specification**:

| Field | Value | Source |
|-------|-------|--------|
| Name | `arashi` | package.json |
| Version | `{major}.{minor}.{patch}` | Updated by semantic-release |
| Tag | `latest` | Default npm dist-tag |
| Files | Per package.json `files` field | Source code + binaries |
| Provenance | Enabled | GitHub Actions attestation |

#### Exit Codes

- **0**: Release created successfully, npm published (if token available)
- **1**: No commits since last release (skip release, not an error)
- **2**: Version calculation failed (malformed commits, git errors)
- **3**: GitHub release creation failed (permissions, API errors)
- **4**: npm publish failed with NPM_TOKEN (token invalid, version conflict)

---

## External System Contracts

### Git Repository

**Operations**:

| Operation | Command | Idempotent? | Rollback on Failure? |
|-----------|---------|-------------|---------------------|
| Read commit history | `git log` | Yes | N/A |
| Create tag | `git tag v{version}` | No (fails if exists) | Manual deletion required |
| Commit version bump | `git commit -am "..."` | No | Revert commit |
| Push changes | `git push --follow-tags` | No | Force push revert |

**Assumptions**:
- Repository has at least one previous release tag OR initial version in package.json
- Branch protection rules allow GitHub Actions to push (or use PAT if needed)
- No force-push restrictions on tags

---

### GitHub Releases API

**Endpoint**: `POST /repos/{owner}/{repo}/releases`

**Request Contract**:
```json
{
  "tag_name": "v0.5.0",
  "name": "0.5.0",
  "body": "## Features\n* add new command...",
  "draft": false,
  "prerelease": true,
  "generate_release_notes": false
}
```

**Response Contract** (201 Created):
```json
{
  "id": 123456789,
  "tag_name": "v0.5.0",
  "html_url": "https://github.com/owner/repo/releases/tag/v0.5.0",
  "upload_url": "https://uploads.github.com/repos/owner/repo/releases/123456789/assets{?name,label}"
}
```

**Asset Upload Contract**:
```
POST {upload_url}?name=arashi-bun-linux-x64
Content-Type: application/octet-stream
Content-Length: {file_size}

[binary data]
```

---

### npm Registry

**Endpoint**: `PUT /{package}` (via `npm publish`)

**Request Contract** (simplified):
```json
{
  "name": "arashi",
  "version": "0.5.0",
  "dist": {
    "tarball": "https://registry.npmjs.org/arashi/-/arashi-0.5.0.tgz"
  }
}
```

**Response Contract** (200 OK):
```json
{
  "ok": true,
  "id": "arashi",
  "rev": "..."
}
```

**Error Cases**:

| Status Code | Error | Behavior |
|-------------|-------|----------|
| 401 | Unauthorized | Log error, skip npm publish, continue with GitHub release |
| 403 | Forbidden | Log error, skip npm publish, continue with GitHub release |
| 409 | Version already published | Log warning, skip npm publish, continue (not fatal) |

---

## Data Flow

```
[Trigger: Manual Dispatch]
         ↓
[Build Job: Matrix]
   ├─ Linux x64 Build   → [Artifact: arashi-bun-linux-x64]
   ├─ macOS ARM64 Build → [Artifact: arashi-bun-darwin-arm64]
   └─ Windows x64 Build → [Artifact: arashi-bun-windows-x64.exe]
         ↓ (All builds must succeed)
[Release Job]
   ├─ Checkout (full history)
   ├─ Analyze commits → [Version: 0.5.0]
   ├─ Update files (package.json, CHANGELOG.md)
   ├─ Commit & Tag → [Git: v0.5.0]
   ├─ Download artifacts (3 binaries)
   ├─ Create GitHub Release → [Release: v0.5.0 + binaries]
   └─ Publish to npm → [Package: arashi@0.5.0]
         ↓
[Output: Release URL]
```

---

## Error Handling

### Build Job Failure

**Scenario**: One or more platform builds fail

**Response**:
1. Matrix job marks failed platform as failure
2. Release job does not run (dependency blocked)
3. Workflow exits with status 1
4. No artifacts created for failed platform
5. No partial release created

**User Action**: Fix build error, re-trigger workflow

---

### Release Job Failure (Before Tagging)

**Scenario**: semantic-release fails to calculate version or commit analysis errors

**Response**:
1. No git tags created
2. No GitHub release created
3. No npm publish attempted
4. Workflow exits with status 2

**Rollback**: None needed (no changes made)

---

### Release Job Failure (After Tagging)

**Scenario**: GitHub release creation fails after tag is created

**Response**:
1. Git tag exists in repository
2. No GitHub release created
3. No npm publish attempted
4. Workflow exits with status 3

**Rollback**: 
- Manual: Delete tag with `git tag -d v{version}` and `git push --delete origin v{version}`
- Re-trigger: Workflow will fail with "tag already exists" - must delete tag first

**Mitigation**: Use semantic-release's recovery mode (automatically recovers on next run)

---

### npm Publish Failure

**Scenario**: npm publish fails (invalid token, version conflict, network error)

**Response**:
1. GitHub release exists and is published
2. npm publish skipped with error log
3. Workflow exits with status 0 (success) if NPM_TOKEN missing
4. Workflow exits with status 4 if NPM_TOKEN present but publish failed

**Rollback**: None needed (GitHub release is primary distribution)

**User Action**: 
- If token issue: Fix NPM_TOKEN secret, manually publish with `npm publish`
- If version conflict: Version already published, no action needed

---

## Performance SLAs

### Build Job

| Metric | Target | Maximum |
|--------|--------|---------|
| Per-platform build time | 1-2 minutes | 5 minutes |
| Parallel build total | 2-3 minutes | 6 minutes |
| Artifact upload | 10-30 seconds | 2 minutes |

### Release Job

| Metric | Target | Maximum |
|--------|--------|---------|
| Commit analysis | 10 seconds | 30 seconds |
| Changelog generation | 5 seconds | 20 seconds |
| Git operations | 15 seconds | 60 seconds |
| GitHub release creation | 10 seconds | 30 seconds |
| npm publish | 20 seconds | 60 seconds |
| **Total** | 60 seconds | 3 minutes |

### End-to-End Workflow

| Metric | Target | Maximum |
|--------|--------|---------|
| Full workflow (build + release) | 3-5 minutes | 10 minutes |

**Success Criteria**: SC-001 requires "under 10 minutes from trigger to publication" ✅

---

## Testing Contract

### Dry Run Mode

**Input**: `dry_run: true`

**Behavior**:
- All steps execute normally
- No git tags created
- No GitHub releases created
- No npm publish
- Logs show "DRY RUN" prefix
- Exit code 0 (success)

**Purpose**: Validate workflow logic without side effects

---

### Test Repository

**Recommendation**: Create a test repository to validate workflow before production

**Test Checklist**:
- [ ] Workflow triggers manually
- [ ] All platforms build successfully
- [ ] Artifacts uploaded and downloadable
- [ ] Version calculated correctly from commits
- [ ] Git tag created
- [ ] GitHub release created with binaries
- [ ] npm publish attempted (with test token or skipped)
- [ ] Changelog generated correctly

---

## Versioning

### Workflow Version

**Current**: 1.0.0 (initial implementation)  
**Location**: Comment in workflow file

**Breaking Changes**: Any change to inputs, outputs, or external API contracts

**Example**:
```yaml
# Release Workflow v1.0.0
# Contract: specs/019-release-workflow/contracts/workflow-interface.md
```

---

## Conclusion

This contract defines the complete interface for the GitHub Actions release workflow, ensuring predictable behavior, clear error handling, and reliable multi-platform binary distribution. All external integrations (GitHub API, npm registry, git operations) are documented with request/response formats and error handling strategies.
