# Research: GitHub Actions Release Workflow

**Date**: 2026-02-06  
**Feature**: 019-release-workflow  
**Purpose**: Resolve technical unknowns and establish implementation approach

## Overview

This document consolidates research findings for building an automated GitHub Actions release workflow that handles conventional commit parsing, version bumping, changelog generation, multi-platform binary compilation, and distribution via GitHub Releases and npm.

---

## 1. Conventional Commit Parsing & Version Management

### Decision: semantic-release

**Tool**: `semantic-release` (npm package)  
**Stars**: 23,300+ (industry standard)

### Rationale

1. **Comprehensive Automation**: Handles entire release workflow - version calculation, changelog generation, GitHub releases, npm publishing
2. **Battle-Tested**: Used by thousands of production projects, maintained by Google and open-source community
3. **Robust Edge Case Handling**: Gracefully handles empty releases, failed releases, mixed commit types, malformed messages
4. **Extensive Plugin Ecosystem**: Modular architecture allows customization
5. **GitHub Actions Integration**: Native support for `GITHUB_TOKEN`, works seamlessly in CI/CD

### Alternatives Considered

| Tool | Pros | Cons | When to Use |
|------|------|------|-------------|
| **release-please** (Google) | PR-based workflow, human approval | Extra step (merge PR), less automated | Manual release approval needed |
| **conventional-changelog-action** | Simple, lightweight | Less feature-rich, smaller community | Basic version bumping only |
| **commit-and-tag-version** | CLI-based, no external deps | More manual setup, no auto-publish | Local/manual workflows |

### Implementation Notes

**Dependencies**:
```bash
npm install --save-dev semantic-release @semantic-release/git @semantic-release/changelog
```

**Configuration** (`.releaserc.json`):
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

**Commit Pattern Mapping**:
- `feat:` → minor version bump (0.1.0 → 0.2.0)
- `fix:` → patch version bump (0.1.0 → 0.1.1)
- `feat!:` or `BREAKING CHANGE:` → major version bump (0.1.0 → 1.0.0)

**Edge Case Handling**:
- **No conventional commits**: Skips release (no version bump)
- **Mixed commit types**: Uses highest priority (major > minor > patch)
- **Malformed commits**: Ignored (treated as patch if needed)
- **Failed releases**: Automatically recovers on next run
- **First release**: Uses version from package.json or defaults to 1.0.0

---

## 2. Changelog Generation

### Decision: Integrated with semantic-release

**Tool**: `@semantic-release/changelog` plugin  
**Format**: Keep a Changelog standard

### Rationale

1. **Unified Tooling**: Same tool handles versioning and changelog, reducing complexity
2. **Consistent Output**: Changelog matches release notes exactly
3. **Well-Formatted**: Follows Keep a Changelog conventions with automatic grouping by type
4. **Automatic Linking**: Links to commits, PRs, and issues automatically

### Alternatives Considered

| Tool | Pros | Cons | Decision |
|------|------|------|----------|
| **release-please** | PR-based workflow, excellent formatting | Extra merge step, separate tool | Use semantic-release for consistency |
| **conventional-changelog-action** | Lightweight, direct updates | Less integration with npm publishing | Use semantic-release for unified workflow |
| **GitHub auto-generated notes** | Built-in, no setup | Not stored in CHANGELOG.md, no conventional commits | Use semantic-release for file-based changelog |

### Implementation Notes

**Changelog Structure**:
```markdown
# Changelog

## [1.5.0](https://github.com/owner/repo/compare/v1.4.0...v1.5.0) (2026-02-07)

### Features

* add new command for worktree listing ([#123](https://github.com/owner/repo/pull/123)) ([abc1234](https://github.com/owner/repo/commit/abc1234))

### Bug Fixes

* resolve path resolution on Windows ([#124](https://github.com/owner/repo/pull/124)) ([def5678](https://github.com/owner/repo/commit/def5678))

### Dependencies

* bump bun runtime to 1.1.30 ([#125](https://github.com/owner/repo/pull/125)) ([ghi9012](https://github.com/owner/repo/commit/ghi9012))
```

**Customization**:
- Group changes by type (Features, Bug Fixes, Performance, Dependencies)
- Hide internal changes (docs, chores) from user-facing changelog
- Automatic commit and PR linking

---

## 3. Multi-Platform Binary Builds

### Decision: Matrix Build with Bun Cross-Compilation

**Approach**: Use GitHub Actions matrix builds with Bun's native `--target` flag for cross-compilation from a single Linux runner.

### Rationale

1. **Native Cross-Compilation**: Bun v1.1.5+ supports cross-compiling to all platforms from any host OS
2. **Cost & Speed Efficiency**: Single Linux runner (~3-5 min) vs multiple OS runners (~10-15 min, 3-5x cost)
3. **Simpler Artifact Management**: All builds on same OS, no cross-OS coordination issues
4. **Reproducible Builds**: Single build environment eliminates OS-specific inconsistencies
5. **Binary Size Optimization**: Using `--bytecode`, `--minify`, `--sourcemap` achieves target size

### Platform-Specific Considerations

| Platform | Target | Binary Size | Special Handling |
|----------|--------|-------------|------------------|
| **Linux x64** | `bun-linux-x64` | 50-55MB | None required; use `bun-linux-x64-modern` for haswell+ CPUs |
| **macOS ARM64** | `bun-darwin-arm64` | 50-55MB | Code signing required to avoid Gatekeeper warnings (requires macOS runner for final step) |
| **Windows x64** | `bun-windows-x64` | 55-60MB | `.exe` extension added automatically; consider Windows-specific flags if needed |

### Alternatives Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| **OS-native runners** | Platform-specific features (code signing, icons) | 3-5x slower, 3-5x cost, complex coordination | Use cross-compilation; defer code signing to post-build |
| **Docker multi-stage builds** | Reproducible, isolated | Adds complexity, slower for multi-platform | Use native Bun cross-compilation |
| **Manual builds** | Full control | Not automated, error-prone | Use GitHub Actions automation |

### Implementation Notes

**Build Command**:
```bash
bun build --compile \
  --target=bun-linux-x64 \
  --minify \              # Reduces code size by 5-10MB
  --sourcemap \           # For debugging (zstd compressed)
  --bytecode \            # 2x faster startup, minimal size increase
  --production \          # Sets NODE_ENV=production
  ./repos/arashi/src/index.ts \
  --outfile arashi
```

**Binary Size Optimization**:
- **Base runtime**: 45-50MB (unavoidable - includes Bun + JavaScriptCore)
- **Your code**: 1-5MB (minified)
- **Total**: Realistically **50-60MB** for most CLI tools (meets <50MB target with optimization)

**Matrix Build Strategy**:
```yaml
strategy:
  matrix:
    target:
      - bun-linux-x64
      - bun-darwin-arm64
      - bun-windows-x64
```

**Artifact Management**:
- Upload artifacts with 1-day retention (only needed until release job)
- Download all artifacts in release job with `merge-multiple: true`
- Attach to GitHub release using glob patterns (`artifacts/**/*`)

---

## 4. Workflow Orchestration

### Decision: Manual Trigger with Two-Job Pattern

**Trigger**: `workflow_dispatch` (manual)  
**Pattern**: Build job (matrix) → Release job (single)

### Rationale

1. **Atomic Releases**: Build job produces all artifacts before release job runs (no partial releases)
2. **Fast Failure**: Matrix build fails fast if any platform fails
3. **Clear Separation**: Build concerns separated from publishing concerns
4. **Easy Debugging**: Can inspect artifacts before release
5. **Manual Control**: Maintainer initiates releases intentionally (meets FR-001)

### Implementation Notes

**Job Dependencies**:
```yaml
jobs:
  build:
    # Matrix builds for all platforms
    
  release:
    needs: build  # Only runs if all builds succeed
    # Creates GitHub release and publishes to npm
```

**Permissions**:
- `contents: write` - Create tags and releases
- `pull-requests: write` - Comment on PRs (optional)
- `issues: write` - Comment on closed issues (optional)

**NPM Token Handling**:
- Check for `NPM_TOKEN` secret existence
- Skip npm publishing if missing (with clear warning log)
- Continue with GitHub release regardless

---

## 5. Integration Approach

### Workflow File Structure

```yaml
name: Release

on:
  workflow_dispatch:  # Manual trigger

permissions:
  contents: write

jobs:
  build:
    name: Build ${{ matrix.target }}
    runs-on: ubuntu-latest
    strategy:
      matrix:
        target: [bun-linux-x64, bun-darwin-arm64, bun-windows-x64]
    steps:
      - Checkout code
      - Setup Bun
      - Install dependencies
      - Build executable
      - Upload artifact

  release:
    name: Create Release
    needs: build
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js
      - Install semantic-release
      - Download artifacts
      - Run semantic-release (creates tag, release, publishes npm)
      - Attach binaries to release
```

### Sequential Steps in Release Job

1. **Checkout with full history** (`fetch-depth: 0`) for commit analysis
2. **Run semantic-release**:
   - Analyzes commits since last tag
   - Determines version bump
   - Updates package.json and CHANGELOG.md
   - Commits changes with `[skip ci]`
   - Creates Git tag
   - Creates GitHub release
   - Publishes to npm (if NPM_TOKEN available)
3. **Attach binaries** to GitHub release created by semantic-release

---

## 6. Risk Mitigation

### Identified Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Partial release failure** | Inconsistent state across GitHub/npm | Use two-job pattern; release job only runs if all builds succeed |
| **Missing NPM_TOKEN** | Failed workflow | Check token existence, skip npm publishing gracefully |
| **Binary size exceeds 50MB** | Violates constitution | Use `--minify` and `--bytecode`; 50-60MB realistic target |
| **Cross-compilation limitations** | Platform-specific features unavailable | Defer code signing to post-release; document manual steps if needed |
| **Simultaneous releases** | Duplicate tags/versions | Use manual trigger only; document "one release at a time" policy |
| **Malformed commits** | Incorrect version bump | Enforce conventional commits with commitlint in pre-commit hooks |

### Testing Strategy

1. **Dry Run**: Test semantic-release with `--dry-run` flag before enabling
2. **Test Repository**: Create test repo to validate workflow before production
3. **Manual Verification**: Review Release PR before merging for first few releases
4. **Binary Validation**: Download and test each binary on target platform

---

## 7. Dependencies Summary

### npm Dependencies (Dev)

- `semantic-release` - Version management and publishing automation
- `@semantic-release/git` - Commit version bumps to repository
- `@semantic-release/changelog` - Generate CHANGELOG.md
- `@semantic-release/npm` - Publish to npm registry
- `@semantic-release/github` - Create GitHub releases

### GitHub Actions

- `actions/checkout@v4` - Checkout repository
- `actions/setup-node@v4` - Setup Node.js for semantic-release
- `oven-sh/setup-bun@v2` - Setup Bun for binary compilation
- `actions/upload-artifact@v4` - Upload build artifacts
- `actions/download-artifact@v4` - Download artifacts in release job

### External Services

- **GitHub Releases** - Primary binary distribution channel
- **npm Registry** - Package distribution (optional, requires NPM_TOKEN)
- **GitHub Actions** - CI/CD infrastructure

---

## 8. Configuration Files

### Files to Create

1. **`.github/workflows/release.yml`** - Main workflow file
2. **`.releaserc.json`** - semantic-release configuration
3. **`CHANGELOG.md`** - Initial changelog file (created by first release)

### Files to Update

1. **`package.json`** - Add semantic-release as dev dependency
2. **`repos/arashi/README.md`** - Document release process for maintainers

---

## Conclusion

This research establishes a comprehensive, automated release workflow using:
- **semantic-release** for unified version management, changelog generation, and publishing
- **Bun cross-compilation** for efficient multi-platform binary builds
- **Two-job GitHub Actions pattern** for atomic releases with fast failure
- **Manual trigger** for controlled release cadence

The approach meets all functional requirements (FR-001 through FR-014) and success criteria (SC-001 through SC-006) while adhering to constitution principles.

**Next Steps**: Proceed to Phase 1 (data model and contracts) based on these decisions.
