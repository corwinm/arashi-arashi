# Data Model: GitHub Actions CI Workflow

**Feature**: 014-ci-workflow  
**Date**: 2026-02-05  
**Purpose**: Define the structure and relationships of workflow components

## Overview

This document describes the logical structure of the CI workflow, its jobs, and their relationships. While GitHub Actions workflows are not traditional data models with persistent storage, understanding the workflow structure as a data model helps ensure consistency and maintainability.

## Entity Definitions

### Workflow

The top-level container that orchestrates all CI activities.

**Attributes**:
- `name`: "CI" (human-readable identifier)
- `triggers`: List of events that start the workflow
  - `pull_request`: [opened, synchronize, reopened]
  - `push.branches`: [main]
- `jobs`: Collection of Job entities (defined below)

**Lifecycle**:
- Created: When trigger event occurs
- Running: While jobs execute
- Completed: When all jobs finish (success/failure)
- Retained: Logs kept for 90 days (GitHub default)

**Relationships**:
- Contains 4 jobs: lint, test, build, validate
- Jobs execute based on dependency graph

---

### Job: Lint

Validates code style and type correctness.

**Attributes**:
- `name`: "Lint"
- `runs-on`: ubuntu-latest (Linux runner)
- `timeout`: 5 minutes
- `steps`: Ordered list of Step entities
- `status`: pending | in_progress | success | failure | cancelled

**Steps**:
1. Checkout code (actions/checkout@v4)
2. Setup Bun (oven-sh/setup-bun@v1)
3. Restore cache (actions/cache@v4)
4. Install dependencies (bun install --frozen-lockfile)
5. Run linter (bun run lint → tsc --noEmit)

**Dependencies**: None (runs immediately)

**Success criteria**: TypeScript compilation succeeds with no errors

**Outputs**: None (status only)

---

### Job: Test

Executes all automated tests to verify functionality.

**Attributes**:
- `name`: "Test"
- `runs-on`: ubuntu-latest (Linux runner)
- `timeout`: 10 minutes
- `steps`: Ordered list of Step entities
- `status`: pending | in_progress | success | failure | cancelled

**Steps**:
1. Checkout code (actions/checkout@v4)
2. Setup Bun (oven-sh/setup-bun@v1)
3. Restore cache (actions/cache@v4)
4. Install dependencies (bun install --frozen-lockfile)
5. Run tests (bun test)

**Dependencies**: None (runs immediately, parallel with lint)

**Success criteria**: All tests pass, >80% coverage maintained

**Outputs**: Test results (visible in workflow logs)

---

### Job: Build

Compiles platform-specific binaries.

**Attributes**:
- `name`: "Build (${{ matrix.os }})"
- `runs-on`: ${{ matrix.os }} (platform-specific runner)
- `timeout`: 15 minutes
- `strategy.matrix`: Platform configurations
- `steps`: Ordered list of Step entities
- `status`: pending | in_progress | success | failure | cancelled

**Matrix dimensions**:
```yaml
matrix:
  include:
    - os: ubuntu-latest
      target: bun-linux-x64
      artifact: arashi-linux-x64
      script: build:linux
    
    - os: macos-latest
      target: bun-darwin-arm64
      artifact: arashi-macos-arm64
      script: build:mac
    
    - os: windows-latest
      target: bun-windows-x64
      artifact: arashi-windows-x64.exe
      script: build:windows
```

**Steps** (per matrix configuration):
1. Checkout code (actions/checkout@v4)
2. Setup Bun (oven-sh/setup-bun@v1)
3. Restore cache (actions/cache@v4)
4. Install dependencies (bun install --frozen-lockfile)
5. Build binary (bun run ${{ matrix.script }})
6. Upload artifact (actions/upload-artifact@v4)

**Dependencies**: Requires [lint, test] jobs to succeed

**Success criteria**: Binary file created in dist/ directory

**Outputs**: Build artifact uploaded to GitHub artifact storage
- Naming: `arashi-${{ matrix.artifact }}`
- Retention: 30 days
- Size: <50MB (per constitution)

---

### Job: Validate

Verifies that built binaries are functional.

**Attributes**:
- `name`: "Validate (${{ matrix.os }})"
- `runs-on`: ${{ matrix.os }} (matches build platform)
- `timeout`: 5 minutes
- `strategy.matrix`: Same platforms as build job
- `steps`: Ordered list of Step entities
- `status`: pending | in_progress | success | failure | cancelled

**Matrix dimensions**: Same as Build job

**Steps** (per matrix configuration):
1. Download artifact (actions/download-artifact@v4)
2. Set executable permissions (chmod +x) [Linux/macOS only]
3. Run version check (./${{ matrix.artifact }} --version)
4. Verify version format matches expected pattern

**Dependencies**: Requires build job to succeed

**Success criteria**: Binary executes and returns version string

**Outputs**: None (validation status only)

---

### Artifact

Build output stored for download and verification.

**Attributes**:
- `name`: Platform-specific identifier
  - arashi-linux-x64
  - arashi-macos-arm64
  - arashi-windows-x64.exe
- `path`: Location in workspace (dist/${{ artifact }})
- `size`: Binary file size (target: <50MB)
- `retention_days`: 30
- `created_by`: Build job (specific matrix configuration)
- `used_by`: Validate job (same platform)

**Lifecycle**:
- Created: After successful build
- Uploaded: To GitHub artifact storage
- Downloaded: By validate job
- Expired: After 30 days (automatic cleanup)

**Metadata** (automatically added by GitHub):
- Git SHA: Commit that triggered workflow
- Workflow run ID: Unique identifier
- Upload timestamp

---

### Check Status

Result reported to GitHub's status API for PR/commit.

**Attributes**:
- `context`: Check name (lint, test, build-ubuntu, build-macos, build-windows, validate)
- `state`: pending | success | failure | error
- `description`: Human-readable status message
- `target_url`: Link to workflow run details
- `created_at`: Timestamp when check started
- `updated_at`: Timestamp of last status change
- `completed_at`: Timestamp when check finished

**States and Transitions**:
```
pending → in_progress → success
                     ↘ failure
                     ↘ cancelled
```

**Relationships**:
- Each job creates one check status
- Build job creates 3 statuses (one per platform)
- PR merge protection depends on all statuses = success

---

## Workflow Execution Flow

```
Trigger (PR or push to main)
    ↓
Workflow Created
    ↓
    ├─→ [Job: Lint] ──────┐
    │   (5 min timeout)    │
    │                      ├─→ Both succeed?
    └─→ [Job: Test] ──────┘         ↓ Yes
        (10 min timeout)             │
                                     ↓
                          [Job: Build] (matrix)
                          (15 min timeout)
                          ├─→ ubuntu-latest → artifact
                          ├─→ macos-latest → artifact
                          └─→ windows-latest → artifact
                                     ↓
                                All builds succeed?
                                     ↓ Yes
                          [Job: Validate] (matrix)
                          (5 min timeout)
                          ├─→ ubuntu-latest ✓
                          ├─→ macos-latest ✓
                          └─→ windows-latest ✓
                                     ↓
                          Workflow Complete
                          (all checks → success)
```

**Error scenarios**:
- If lint OR test fails → Build jobs skipped
- If any build fails → Validate jobs skipped
- If any validate fails → Workflow fails
- Timeout → Job cancelled, workflow fails

---

## Integration with GitHub Features

### Pull Request Interface

**Check runs displayed**:
- ✓ lint
- ✓ test
- ✓ build (ubuntu-latest)
- ✓ build (macos-latest)
- ✓ build (windows-latest)
- ✓ validate

**Merge button states**:
- All checks passing → Green "Merge" button enabled
- Any check failing → "Merge" button disabled with message
- Checks in progress → "Merge" button shows "Some checks pending"

### Branch Protection Rules

**Required configuration** (to be set in GitHub repo settings):
```yaml
Branch protection for 'main':
  ✓ Require status checks to pass before merging
    ✓ Require branches to be up to date before merging
    Required status checks:
      - lint
      - test
      - build (ubuntu-latest)
      - build (macos-latest)
      - build (windows-latest)
      - validate
```

### Artifact Storage

**Location**: GitHub Actions artifact storage  
**Access**: Via workflow run page → "Artifacts" section  
**Retention**: 30 days (configurable via workflow)  
**Size limits**: 10GB per workflow run (GitHub limit)

---

## Validation Rules

### Job-Level Validations

**Lint job**:
- MUST checkout latest code
- MUST use frozen lockfile (no dependency changes)
- MUST exit 0 on success, non-zero on failure
- MUST complete within 5 minutes

**Test job**:
- MUST checkout latest code
- MUST use frozen lockfile
- MUST run complete test suite
- MUST exit 0 if all tests pass
- MUST complete within 10 minutes

**Build job**:
- MUST produce exactly one binary file
- Binary MUST be in dist/ directory
- Binary size MUST be <50MB (constitutional requirement)
- MUST upload artifact before job completes
- MUST complete within 15 minutes per platform

**Validate job**:
- MUST download artifact from build job
- Binary MUST have execute permissions (Linux/macOS)
- Binary MUST run without errors
- Version check MUST return valid version string
- MUST complete within 5 minutes

### Workflow-Level Validations

- MUST trigger on PR events (opened, synchronize, reopened)
- MUST trigger on push to main branch
- MUST NOT trigger on feature branch pushes
- MUST complete all checks within 5 minutes (SC-001)
- MUST report all failures clearly with logs (SC-007)
- MUST prevent merge when any check fails (SC-004)

---

## State Transitions

### Job State Machine

```
created → queued → in_progress → success
                               ↘ failure
                               ↘ cancelled (timeout or manual)
```

### Workflow State Machine

```
triggered → running → completed (all jobs success)
                   ↘ failed (any job failed)
                   ↘ cancelled (manual or timeout)
```

### Check Status State Machine

```
pending → in_progress → success
                     ↘ failure
                     ↘ error (infrastructure issue)
                     ↘ cancelled
```

---

## Performance Characteristics

**Expected durations** (from research.md):

| Entity | Duration | Variability |
|--------|----------|-------------|
| Lint job | 1-2 min | Low (CPU-bound) |
| Test job | 2-4 min | Medium (test complexity) |
| Build job (per platform) | 3-5 min | Low (CPU-bound) |
| Validate job | 30s | Low (simple check) |
| **Total workflow** | **3-5 min** | **Medium** |

**Parallelization**:
- Lint + Test: Run in parallel (saves ~2 min)
- Build (3 platforms): Run in parallel (saves ~8 min vs sequential)
- Validate (3 platforms): Run in parallel (saves ~1 min vs sequential)

**Total time savings from parallelization**: ~11 minutes
- Sequential: ~18 minutes
- Parallel: ~5 minutes (72% reduction)

---

## Future Considerations

**Not included in this feature** (potential future enhancements):

1. **Code coverage reporting**: Upload coverage to external service (Codecov, Coveralls)
2. **Release automation**: Separate workflow for version bumps and releases
3. **Performance benchmarks**: Track and report performance metrics over time
4. **Notification integration**: Slack/Discord notifications on failures
5. **Dependency caching optimization**: More aggressive caching strategies

These are deliberately excluded to keep the initial implementation focused on core CI requirements (P1/P2 user stories).
