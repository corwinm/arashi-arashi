# GitHub Actions CI Workflow Contract

**Feature**: 001-ci-workflow  
**Purpose**: Define the structure and interface of the CI workflow

## Workflow Schema

This document defines the contract for the CI workflow - the expected inputs, outputs, and behavior.

### Workflow Inputs (Triggers)

**Pull Request Events**:
```yaml
on:
  pull_request:
    types:
      - opened        # New PR created
      - synchronize   # New commits pushed to PR
      - reopened      # Previously closed PR reopened
```

**Push Events**:
```yaml
on:
  push:
    branches:
      - main          # Only main branch
```

**Event Context Available**:
- `github.event.pull_request.number`: PR number (if PR event)
- `github.sha`: Commit SHA being tested
- `github.ref`: Git ref (branch or tag)
- `github.actor`: User who triggered the workflow
- `github.event.pull_request.head.sha`: PR head commit (if PR event)

---

### Job Contracts

#### Job: Lint

**Purpose**: Validate TypeScript types and code compilation

**Inputs**:
- Repository code at `github.sha`
- Dependencies from `bun.lock`

**Execution**:
```bash
bun install --frozen-lockfile
bun run lint  # Runs: tsc --noEmit
```

**Outputs** (Status API):
- Context: `lint`
- Success: All TypeScript types valid, no compilation errors
- Failure: Type errors detected, compilation fails

**Exit codes**:
- 0: Success
- Non-zero: Failure (type errors or command failure)

**Environment**:
- Runner: ubuntu-latest
- Timeout: 5 minutes

---

#### Job: Test

**Purpose**: Execute automated test suite

**Inputs**:
- Repository code at `github.sha`
- Dependencies from `bun.lock`

**Execution**:
```bash
bun install --frozen-lockfile
bun test
```

**Outputs** (Status API):
- Context: `test`
- Success: All tests pass, coverage >80%
- Failure: Any test fails or coverage below threshold

**Exit codes**:
- 0: Success (all tests passed)
- Non-zero: Failure (test failures or command error)

**Environment**:
- Runner: ubuntu-latest
- Timeout: 10 minutes

---

#### Job: Build

**Purpose**: Compile platform-specific binaries

**Inputs**:
- Repository code at `github.sha`
- Dependencies from `bun.lock`
- Matrix configuration:
  - `os`: ubuntu-latest | macos-latest | windows-latest
  - `target`: bun-linux-x64 | bun-darwin-arm64 | bun-windows-x64
  - `artifact`: arashi-linux-x64 | arashi-macos-arm64 | arashi-windows-x64.exe
  - `script`: build:linux | build:mac | build:windows

**Execution**:
```bash
bun install --frozen-lockfile
bun run ${{ matrix.script }}
# Creates: dist/${{ matrix.artifact }}
```

**Outputs**:
1. **Status API**:
   - Context: `build (${{ matrix.os }})`
   - Success: Binary created successfully
   - Failure: Build failed or binary not created

2. **Artifact**:
   - Name: `arashi-${{ matrix.artifact }}`
   - Path: `dist/${{ matrix.artifact }}`
   - Retention: 30 days
   - Size: Must be <50MB

**Exit codes**:
- 0: Success (binary created)
- Non-zero: Failure (build error)

**Environment**:
- Runner: ${{ matrix.os }}
- Timeout: 15 minutes

**Dependencies**: Requires `lint` AND `test` jobs to succeed

---

#### Job: Validate

**Purpose**: Verify compiled binaries are functional

**Inputs**:
- Artifact: `arashi-${{ matrix.artifact }}` (from build job)
- Matrix configuration: (same as build job)

**Execution**:
```bash
# Download artifact
# Set permissions (Linux/macOS): chmod +x ${{ matrix.artifact }}

# Run version check
./${{ matrix.artifact }} --version

# Expected output format: "arashi v0.1.0" or similar
```

**Outputs** (Status API):
- Context: `validate (${{ matrix.os }})`
- Success: Binary executes and returns version
- Failure: Binary fails to run or doesn't return version

**Exit codes**:
- 0: Success (binary validated)
- Non-zero: Failure (validation error)

**Environment**:
- Runner: ${{ matrix.os }} (same as build)
- Timeout: 5 minutes

**Dependencies**: Requires corresponding `build` job to succeed

---

### Workflow Outputs

#### Status Checks (reported to GitHub)

**Check names** (6 total):
- `lint`
- `test`
- `build (ubuntu-latest)`
- `build (macos-latest)`
- `build (windows-latest)`
- `validate`

**Status states**:
- ✓ **Success**: Check passed
- ✗ **Failure**: Check failed
- ⏳ **Pending**: Check queued or in progress
- ⚠️ **Cancelled**: Check cancelled (timeout or manual)

**Required for merge**: ALL checks must be ✓ Success

---

#### Artifacts

**Artifacts created** (3 total):

1. **arashi-linux-x64**
   - Platform: Linux x64
   - Binary path: `arashi-linux-x64`
   - Expected size: ~10-30MB
   - Retention: 30 days

2. **arashi-macos-arm64**
   - Platform: macOS ARM64 (Apple Silicon)
   - Binary path: `arashi-macos-arm64`
   - Expected size: ~10-30MB
   - Retention: 30 days

3. **arashi-windows-x64.exe**
   - Platform: Windows x64
   - Binary path: `arashi-windows-x64.exe`
   - Expected size: ~10-30MB
   - Retention: 30 days

**Access**: Via workflow run page → "Artifacts" section

---

### Error Contracts

#### Lint Failure

**Condition**: TypeScript compilation errors

**Status**:
- Context: `lint`
- State: failure
- Description: "Type check failed"

**Log output includes**:
- File paths with errors
- Line numbers
- Error messages from TypeScript compiler

**Impact**: Build jobs skipped (dependency not met)

---

#### Test Failure

**Condition**: Any test fails or coverage below threshold

**Status**:
- Context: `test`
- State: failure
- Description: "Tests failed" or "Coverage below 80%"

**Log output includes**:
- Failed test names
- Assertion failures
- Stack traces
- Coverage report (if applicable)

**Impact**: Build jobs skipped (dependency not met)

---

#### Build Failure

**Condition**: Binary compilation fails or file not created

**Status**:
- Context: `build (${{ matrix.os }})`
- State: failure
- Description: "Build failed"

**Log output includes**:
- Bun compiler errors
- File system errors (if any)
- Build command output

**Impact**: 
- Validate job for that platform skipped
- PR merge blocked (all builds required)

---

#### Validate Failure

**Condition**: Binary doesn't execute or version check fails

**Status**:
- Context: `validate (${{ matrix.os }})`
- State: failure
- Description: "Binary validation failed"

**Log output includes**:
- Binary execution errors
- Permission errors (if any)
- Version check output

**Impact**: PR merge blocked (all validations required)

---

#### Timeout Failure

**Condition**: Job exceeds timeout limit

**Status**:
- Context: (job name)
- State: cancelled
- Description: "Job cancelled due to timeout"

**Timeouts**:
- Lint: 5 minutes
- Test: 10 minutes
- Build: 15 minutes
- Validate: 5 minutes

**Impact**: Workflow fails, PR merge blocked

---

### Cache Contracts

#### Bun Install Cache

**Cache key**:
```yaml
${{ runner.os }}-bun-${{ hashFiles('**/bun.lock') }}
```

**Restore keys** (fallback):
```yaml
${{ runner.os }}-bun-
```

**Cached paths**:
- `~/.bun/install/cache` (Linux/macOS)
- `%USERPROFILE%\.bun\install\cache` (Windows)

**Invalidation**: Automatic when `bun.lock` changes

**Benefits**:
- Reduces `bun install` time from ~30s to ~5s
- Consistent across jobs (same cache for all)

---

### Performance Contracts

**Success Criteria SC-001**: Developers receive feedback within 5 minutes

**Expected timings**:

| Job | Target Duration | Maximum Duration |
|-----|----------------|------------------|
| Lint | 1-2 min | 5 min (timeout) |
| Test | 2-4 min | 10 min (timeout) |
| Build (per platform) | 3-5 min | 15 min (timeout) |
| Validate | 30s-1min | 5 min (timeout) |
| **Total (parallel)** | **3-5 min** | **15 min** |

**Note**: Total duration is NOT sum of all jobs due to parallelization:
- Lint + Test run in parallel: max(2min, 4min) = 4min
- Build (3 platforms) run in parallel: ~5min
- Validate: ~1min
- Setup/teardown: ~1min
- **Total: ~5 minutes**

---

### Security Contracts

#### Secrets Access

**Available secrets**: None required for this workflow

**Permissions** (GITHUB_TOKEN):
```yaml
permissions:
  contents: read        # Read repository code
  statuses: write       # Write status checks
  pull-requests: read   # Read PR metadata
```

**No elevated permissions needed** for:
- Publishing packages (out of scope)
- Pushing to repository (out of scope)
- Creating releases (out of scope)

---

#### Code Execution

**Trusted code only**:
- Workflow runs on PR head commit (contributor's code)
- No external script execution
- All dependencies from `bun.lock` (vetted)

**No external inputs**:
- No workflow_dispatch inputs
- No user-provided scripts
- No dynamic action versions (all pinned to @v1, @v4)

---

### Compatibility Contracts

#### Bun Version

**Version**: Latest stable (via `oven-sh/setup-bun@v1`)

**Why latest**: 
- Arashi targets latest Bun features
- Bun is pre-1.0 with frequent improvements
- CI validates latest compatibility

**Future consideration**: Pin to specific version when Bun reaches 1.0

---

#### Runner Versions

**GitHub-hosted runners** (always latest):
- ubuntu-latest: Ubuntu 22.04 LTS (subject to GitHub updates)
- macos-latest: macOS 13 Ventura (subject to GitHub updates)
- windows-latest: Windows Server 2022 (subject to GitHub updates)

**Self-hosted runners**: Not supported (requires GitHub-hosted)

---

## Integration Contract

### Branch Protection Integration

**This workflow provides checks for branch protection rules.**

**To enable merge protection** (manual GitHub repo configuration required):

1. Go to: Repository Settings → Branches → Branch protection rules
2. Add rule for `main` branch:
   - ☑ Require status checks to pass before merging
   - ☑ Require branches to be up to date before merging
   - Select required checks:
     - `lint`
     - `test`
     - `build (ubuntu-latest)`
     - `build (macos-latest)`
     - `build (windows-latest)`
     - `validate`

**Without this configuration**: Workflow runs but doesn't enforce merge protection (FR-009)

---

### Pull Request Integration

**Automatic features** (no configuration needed):

1. **Status indicators**: 
   - Green checkmarks for passing checks
   - Red X for failing checks
   - Yellow dots for pending checks

2. **Details links**: 
   - Click check name → view workflow run logs
   - Click "Details" → jump to specific job

3. **Re-run capability**:
   - Failed checks can be re-run individually
   - Entire workflow can be re-run

4. **Commit status**:
   - Each commit shows aggregated status
   - Hover for check details

---

## Extensibility Contract

### Adding New Checks

**To add a new check** (future enhancements):

1. Add new job to workflow file
2. Add job name to required checks in branch protection
3. Define job dependencies (if any)
4. Set appropriate timeout

**Example**: Adding code coverage upload

```yaml
jobs:
  # ... existing jobs ...
  
  coverage:
    name: Upload Coverage
    runs-on: ubuntu-latest
    needs: [test]  # Runs after test
    steps:
      - uses: actions/checkout@v4
      - uses: codecov/codecov-action@v3
```

---

### Modifying Build Targets

**To add/remove platforms**:

1. Update build job matrix:
   ```yaml
   matrix:
     include:
       - os: ubuntu-latest
         target: bun-linux-arm64  # NEW PLATFORM
         artifact: arashi-linux-arm64
         script: build:linux-arm
   ```

2. Add corresponding package.json script:
   ```json
   "build:linux-arm": "bun build ... --target=bun-linux-arm64"
   ```

3. Update branch protection required checks

**Note**: Each new platform increases total workflow time

---

## Testing the Contract

### Local Validation

**Before pushing**:
```bash
# Validate workflow syntax
gh workflow view ci.yml

# Or use act (local GitHub Actions runner)
act pull_request
```

### PR Testing

**First PR with workflow**:
1. Push workflow file in PR
2. Workflow runs on that PR
3. Verify all checks appear
4. Check timing meets <5min target
5. Intentionally break something to verify failure detection

### Smoke Tests

**After merging**:
1. Create test PR with no changes
2. Verify all checks pass
3. Create test PR with intentional lint error
4. Verify lint check fails and merge blocked
5. Create test PR with failing test
6. Verify test check fails and merge blocked

---

## Version History

**v1.0.0** (2026-02-05): Initial contract definition
- 4 jobs: lint, test, build (matrix), validate
- 6 status checks
- 3 artifacts (Linux, macOS, Windows)
- 5-minute target execution time
