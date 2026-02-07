# Research: GitHub Actions CI Workflow

**Feature**: 014-ci-workflow  
**Date**: 2026-02-05  
**Purpose**: Resolve technical unknowns and establish best practices for CI implementation

## Research Questions

### 1. GitHub Actions Best Practices for Bun Projects

**Question**: What are the recommended patterns for setting up Bun in GitHub Actions and running tests/builds?

**Research Findings**:

**Decision**: Use official `oven-sh/setup-bun@v1` action with caching enabled

**Rationale**:
- Official action maintained by Bun team ensures compatibility
- Built-in caching support speeds up workflow execution
- Handles cross-platform setup automatically
- Supports version pinning for reproducibility

**Implementation approach**:
```yaml
- uses: oven-sh/setup-bun@v1
  with:
    bun-version: latest # or pin to specific version
```

**Alternatives considered**:
- Manual installation via curl/wget: Rejected - more complex, no caching, harder to maintain
- Using Node.js with Bun installed globally: Rejected - unnecessary dependency layer

---

### 2. Multi-Platform Binary Building Strategy

**Question**: What is the optimal job structure for building binaries across multiple platforms (parallel vs sequential, native vs cross-compilation)?

**Research Findings**:

**Decision**: Use matrix strategy with native builds on platform-specific runners

**Rationale**:
- Native builds are more reliable than cross-compilation for Bun
- Matrix strategy enables parallel execution across all platforms
- Each platform runner (ubuntu-latest, macos-latest, windows-latest) provides native environment
- Reduces total build time from sequential ~15min to parallel ~5min

**Implementation approach**:
```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        target: bun-linux-x64
        artifact: arashi-linux-x64
      - os: macos-latest
        target: bun-darwin-arm64
        artifact: arashi-macos-arm64
      - os: windows-latest
        target: bun-windows-x64
        artifact: arashi-windows-x64.exe
```

**Alternatives considered**:
- Sequential builds: Rejected - takes 3x longer, no benefit
- Cross-compilation from single runner: Rejected - Bun's cross-compile support less mature, potential compatibility issues

---

### 3. Workflow Trigger Configuration

**Question**: What events and filters should trigger the CI workflow to balance thoroughness with resource efficiency?

**Research Findings**:

**Decision**: Trigger on pull_request (all types) and push to main branch only

**Rationale**:
- PR triggers catch issues before merge (aligns with SC-002: detect failures before merge)
- Push to main validates what actually landed (catches any issues from merge process)
- Excludes feature branch pushes to avoid redundant runs (PRs already cover validation)
- Includes all PR types (opened, synchronize, reopened) to catch all changes

**Implementation approach**:
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - main
```

**Alternatives considered**:
- All branch pushes: Rejected - wastes resources, PRs already validate feature branches
- Manual workflow_dispatch only: Rejected - doesn't provide automatic protection
- Push to main only: Rejected - doesn't catch issues before merge (too late)

---

### 4. Job Dependencies and Parallelization

**Question**: How should lint, test, and build jobs be structured to optimize for speed while maintaining logical dependencies?

**Research Findings**:

**Decision**: Parallel lint + test jobs, then dependent build job, then dependent validate job

**Rationale**:
- Lint and test are independent - can run in parallel (saves ~2 minutes)
- Build should only run if code quality passes (fail fast principle)
- Validate runs after build to check binary integrity
- Aligns with user story priorities (P1: lint/test, P2: build)

**Job dependency flow**:
```
[Lint] ──┐
         ├─→ [Build: Linux/Mac/Win] ──→ [Validate]
[Test] ──┘
```

**Implementation approach**:
```yaml
jobs:
  lint:
    # runs immediately
  
  test:
    # runs immediately (parallel with lint)
  
  build:
    needs: [lint, test]
    # only runs if both pass
    strategy:
      matrix: # parallel across platforms
  
  validate:
    needs: [build]
    # runs after all builds complete
```

**Alternatives considered**:
- Sequential execution: Rejected - takes too long, violates SC-001 (5 min feedback)
- Build without lint/test dependency: Rejected - wastes resources building broken code
- Validate during build: Rejected - separating concerns makes debugging easier

---

### 5. Artifact Management

**Question**: How should build artifacts be stored, named, and retained to balance accessibility with storage costs?

**Research Findings**:

**Decision**: Upload artifacts with descriptive names, 30-day retention, platform-specific naming

**Rationale**:
- 30 days matches GitHub's default and balances accessibility vs storage
- Platform-specific names make downloads clear (arashi-linux-x64, arashi-macos-arm64, etc.)
- Separate artifacts per platform enable partial downloads
- Includes metadata (git SHA, workflow run) for traceability

**Implementation approach**:
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: arashi-${{ matrix.artifact }}
    path: dist/${{ matrix.artifact }}
    retention-days: 30
```

**Alternatives considered**:
- Single combined artifact: Rejected - forces downloading all platforms even if only one needed
- 90-day retention: Rejected - unnecessary for CI artifacts (release artifacts are separate)
- No retention limit: Rejected - wastes storage, GitHub has limits

---

### 6. Merge Protection Configuration

**Question**: What required status checks should be enforced to prevent merging broken code?

**Research Findings**:

**Decision**: Require all check jobs (lint, test, build, validate) with "Require branches to be up to date" enabled

**Rationale**:
- All jobs must pass ensures comprehensive validation (aligns with FR-009)
- "Up to date" requirement prevents merge race conditions
- Prevents merging stale PRs that might conflict with recent main changes
- Matches constitutional principle III (error prevention)

**GitHub branch protection rules**:
```
✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
  Required checks:
    - lint
    - test
    - build (ubuntu-latest)
    - build (macos-latest)
    - build (windows-latest)
    - validate
```

**Alternatives considered**:
- Only lint + test required: Rejected - allows broken builds to merge
- No "up to date" requirement: Rejected - risks merge conflicts and race conditions
- Any one build platform: Rejected - could merge code that fails on other platforms

---

### 7. Caching Strategy

**Question**: What should be cached to optimize workflow execution time without causing stale dependency issues?

**Research Findings**:

**Decision**: Cache Bun install directory with cache key based on lockfile hash

**Rationale**:
- Bun's install cache includes compiled native modules
- Lockfile-based key ensures cache invalidates on dependency changes
- Can reduce install time from 30s to 5s
- Minimal risk of stale cache (auto-invalidates on bun.lock changes)

**Implementation approach**:
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.bun/install/cache
    key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
    restore-keys: |
      ${{ runner.os }}-bun-
```

**Alternatives considered**:
- No caching: Rejected - wastes time on every run
- Cache node_modules: Rejected - Bun doesn't use node_modules the same way
- More aggressive restore-keys: Rejected - risks stale cache causing hard-to-debug issues

---

### 8. Timeout and Error Handling

**Question**: What timeouts and failure strategies should be applied to handle edge cases like hanging tests or infrastructure failures?

**Research Findings**:

**Decision**: Set job-level timeouts (lint: 5min, test: 10min, build: 15min) with no auto-retry

**Rationale**:
- Prevents hung processes from consuming runner time (aligns with edge case concerns)
- Conservative timeouts based on expected durations (align with SC-001: 5min feedback)
- No auto-retry avoids masking intermittent issues (flaky tests should be fixed, not hidden)
- Fail-fast by default makes issues visible immediately

**Implementation approach**:
```yaml
jobs:
  lint:
    timeout-minutes: 5
  test:
    timeout-minutes: 10
  build:
    timeout-minutes: 15
```

**Alternatives considered**:
- No timeouts: Rejected - could hang indefinitely, blocking other workflows
- Auto-retry on failure: Rejected - masks flaky tests, delays real issue discovery
- Shorter timeouts (2min): Rejected - might cause false failures on slower runners

---

## Summary of Technical Decisions

| Aspect | Decision | Key Benefit |
|--------|----------|-------------|
| Bun Setup | Official `setup-bun` action | Reliability, caching, cross-platform support |
| Build Strategy | Native builds via matrix | Parallel execution, reliability |
| Triggers | PR + push to main | Balance between thoroughness and efficiency |
| Job Structure | Parallel lint/test → build → validate | Fast feedback, logical dependencies |
| Artifacts | Platform-specific, 30-day retention | Clear naming, balanced storage |
| Merge Protection | All checks required, up-to-date | Comprehensive validation, prevent races |
| Caching | Bun install cache, lockfile-keyed | Faster installs, safe invalidation |
| Timeouts | Job-specific (5-15 min) | Prevent hangs, fail fast |

## Dependencies and Integration Points

### External Services
- **GitHub Actions**: Workflow execution platform
- **GitHub Artifact Storage**: Binary artifact storage (30-day retention)
- **GitHub Status API**: Automatic status reporting on PRs/commits

### Existing Project Integration
- **package.json scripts**: Workflow uses existing `lint`, `test`, `build:*` commands
- **TypeScript compiler**: Used for linting via `tsc --noEmit`
- **Bun test runner**: Used for test execution via `bun test`
- **Bun compiler**: Used for binary builds via `bun build --compile`

### Configuration Files Created
- `.github/workflows/ci.yml`: Main CI workflow configuration
- No changes to existing project configuration (tsconfig.json, package.json)

## Performance Expectations

Based on research and typical GitHub Actions execution:

| Phase | Expected Duration | Success Criteria |
|-------|------------------|------------------|
| Setup (checkout, install deps) | 30s - 1min | SC-001 component |
| Lint | 30s - 1min | SC-001 component |
| Test | 1min - 3min | SC-001 component |
| Build (per platform) | 2min - 4min | Parallel execution |
| Validate | 30s | Quick binary check |
| **Total** | **3min - 5min** | **Meets SC-001** |

**Note**: Times measured from GitHub-hosted runners with caching. First run (cold cache) may take 1-2 minutes longer.
