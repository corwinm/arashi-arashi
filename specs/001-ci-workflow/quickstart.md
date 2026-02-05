# Quickstart: GitHub Actions CI Workflow

**Feature**: 001-ci-workflow  
**Date**: 2026-02-05  
**Audience**: Developers working on Arashi

## Overview

The CI workflow automatically validates code quality, runs tests, and builds binaries for all platforms whenever you create a pull request or push to the main branch. This guide explains how to work with the CI workflow effectively.

## What the CI Workflow Does

Every time you push code or create/update a PR, the CI workflow:

1. ✅ **Lints** your TypeScript code for type errors
2. ✅ **Runs** all automated tests
3. ✅ **Builds** binaries for Linux, macOS, and Windows
4. ✅ **Validates** that each binary works correctly
5. ✅ **Reports** status on your PR (pass/fail)
6. 🚫 **Blocks** merge if any check fails

**Total time**: ~3-5 minutes for all checks

---

## First-Time Setup

### For Repository Maintainers

After the CI workflow file is created, configure branch protection:

1. Go to repository **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Set **Branch name pattern**: `main`
4. Enable these options:
   - ☑ **Require status checks to pass before merging**
   - ☑ **Require branches to be up to date before merging**
5. In **Status checks**, search and select:
   - `lint`
   - `test`
   - `build (ubuntu-latest)`
   - `build (macos-latest)`
   - `build (windows-latest)`
   - `validate`
6. Click **Create** (or **Save changes**)

**Without this step**: CI runs but doesn't enforce merge protection! ⚠️

---

## Working with the CI Workflow

### Creating a Pull Request

1. **Push your branch** to GitHub:
   ```bash
   git push origin your-feature-branch
   ```

2. **Create PR** via GitHub UI or CLI:
   ```bash
   gh pr create --title "Your feature" --body "Description"
   ```

3. **Watch CI status** in the PR:
   - Checks appear immediately below the PR description
   - Yellow dot (⏳) = Running
   - Green check (✓) = Passed
   - Red X (✗) = Failed

4. **Wait for results** (~3-5 minutes):
   - All 6 checks must pass to merge
   - You can click each check to view logs

### Understanding Check Status

**All green ✓✓✓✓✓✓**: 
- Your code is ready to merge
- Merge button will be enabled (if branch protection configured)

**Any red ✗**: 
- CI found issues
- Click the failed check to see details
- Fix the issue and push again
- CI automatically re-runs on new push

**Yellow dots ⏳**: 
- Checks still running
- Wait a few minutes
- Most checks complete in 1-3 minutes

---

## Common Scenarios

### Scenario 1: Lint Check Fails

**Problem**: TypeScript type error detected

**What you see**:
```
✗ lint
  Type 'string' is not assignable to type 'number'
  src/commands/create.ts:45:12
```

**How to fix**:
1. **Check logs** in the CI run
2. **Fix type errors** locally
3. **Verify locally**:
   ```bash
   bun run lint
   ```
4. **Push fix**:
   ```bash
   git add .
   git commit -m "fix: correct type error"
   git push
   ```
5. **CI re-runs automatically**

---

### Scenario 2: Test Check Fails

**Problem**: One or more tests failed

**What you see**:
```
✗ test
  FAIL: tests/unit/config.test.ts
  Expected: "main" Received: "master"
```

**How to fix**:
1. **Check logs** for which test failed
2. **Run tests locally**:
   ```bash
   bun test
   ```
3. **Fix the failing test** (or the code it's testing)
4. **Verify all tests pass**:
   ```bash
   bun test
   ```
5. **Push fix**:
   ```bash
   git add .
   git commit -m "fix: update test expectation"
   git push
   ```

---

### Scenario 3: Build Check Fails

**Problem**: Binary compilation failed on one platform

**What you see**:
```
✗ build (macos-latest)
  error: Cannot find module './lib/missing-file'
```

**How to fix**:
1. **Check which platform failed** (Linux, macOS, or Windows)
2. **Verify build locally** (if you have that platform):
   ```bash
   bun run build:mac    # macOS
   bun run build:linux  # Linux
   bun run build:windows # Windows
   ```
3. **Fix the build error** (usually missing files or import issues)
4. **Test the fix**:
   ```bash
   bun run build:all
   ```
5. **Push fix**:
   ```bash
   git add .
   git commit -m "fix: add missing module"
   git push
   ```

**Note**: If you only have one platform, CI is your cross-platform validator!

---

### Scenario 4: Validate Check Fails

**Problem**: Binary built but doesn't execute correctly

**What you see**:
```
✗ validate (windows-latest)
  Error: Binary failed to run --version check
```

**How to fix**:
1. **Check validate logs** for execution error
2. **Download failing artifact**:
   - Go to CI run page
   - Scroll to "Artifacts" section
   - Download `arashi-windows-x64.exe` (or failing platform)
3. **Test locally** (if you have that platform):
   ```bash
   ./arashi-windows-x64.exe --version
   ```
4. **Fix the issue** (usually runtime error or missing dependency)
5. **Push fix and let CI rebuild**

---

### Scenario 5: All Checks Pass but Can't Merge

**Problem**: Merge button says "Merging is blocked"

**Possible causes**:

1. **Branch not up to date**:
   - Solution: Merge main into your branch
   ```bash
   git pull origin main
   git push
   ```
   - CI re-runs on new commit

2. **Required reviews not approved**:
   - Solution: Request review from maintainer
   - Wait for approval

3. **Checks from other workflows**:
   - Solution: Check which checks are required
   - Ensure all required checks pass

---

### Scenario 6: CI Takes Too Long (>5 min)

**Problem**: Workflow still running after 5 minutes

**Expected behavior**: 
- First run (cold cache): 5-7 minutes
- Subsequent runs (warm cache): 3-5 minutes

**If taking >10 minutes**:
1. **Check runner availability**: GitHub may be experiencing delays
2. **Check for hanging tests**: Review test job logs
3. **Check for network issues**: Dependency installation may be slow

**What to do**:
- Wait for timeout (jobs have 5-15 min timeouts)
- If timed out, check logs for specific issue
- Re-run failed jobs if it was infrastructure issue

---

## Advanced Usage

### Viewing Detailed Logs

1. **Open PR** in GitHub
2. **Click failing check** name (e.g., "lint" or "test")
3. **View job details**:
   - Expand steps to see command output
   - Look for red ✗ marks indicating failures
4. **Download logs** (if needed):
   - Click ⋯ (three dots) → "View raw logs"
   - Or download log archive

---

### Downloading Build Artifacts

**To download binaries from CI**:

1. **Go to PR** in GitHub
2. **Click "Checks" tab** at top
3. **Select any check** from the left sidebar
4. **Scroll down** to "Artifacts" section
5. **Click artifact name** to download:
   - `arashi-linux-x64`
   - `arashi-macos-arm64`
   - `arashi-windows-x64.exe`

**Artifacts expire after 30 days**

**Use case**: Test binaries before merging

---

### Re-Running Failed Checks

**If a check failed due to transient issue** (network, runner availability):

1. **Open PR** in GitHub
2. **Click "Checks" tab**
3. **Click ↻ Re-run** button:
   - "Re-run all jobs" (re-runs everything)
   - "Re-run failed jobs" (only re-runs failures)

**Note**: Only do this for infrastructure failures, not code failures!

---

### Skipping CI (Not Recommended)

**You cannot skip CI checks**. This is intentional for code quality.

**If you absolutely must** (e.g., docs-only change):
- Branch protection still requires checks to pass
- Consider adding `paths` filter to workflow (future enhancement)
- Current design: ALL changes trigger CI (safest approach)

---

## Troubleshooting

### Problem: "Workflow not found"

**Symptoms**: PR shows no checks

**Cause**: Workflow file not on base branch (main)

**Solution**:
1. Ensure `.github/workflows/ci.yml` exists on main branch
2. Merge the PR that adds the workflow first
3. Subsequent PRs will trigger CI

---

### Problem: "Required status check is not passing"

**Symptoms**: Can't merge even though all checks show green

**Cause**: Branch protection looking for old check names

**Solution**:
1. Go to Settings → Branches → Branch protection rules
2. Edit rule for `main`
3. Update required status checks to match current check names
4. Save changes

---

### Problem: "This branch is out-of-date with the base branch"

**Symptoms**: Message at top of PR

**Cause**: Main branch has new commits since your PR was created

**Solution**:
```bash
# Update your branch
git checkout your-feature-branch
git pull origin main
git push

# CI will re-run automatically
```

---

### Problem: Lint passes locally but fails in CI

**Symptoms**: `bun run lint` works on your machine but fails in CI

**Possible causes**:

1. **Different Bun version**:
   - Solution: Update to latest Bun locally
   ```bash
   bun upgrade
   ```

2. **Uncommitted changes**:
   - Solution: Ensure all files are committed
   ```bash
   git status
   git add .
   git commit -m "fix: add missing files"
   ```

3. **Different tsconfig**:
   - Solution: Check tsconfig.json is committed correctly

---

### Problem: Tests pass locally but fail in CI

**Symptoms**: `bun test` works locally but fails in CI

**Possible causes**:

1. **Environment differences**:
   - CI uses Ubuntu Linux
   - May have different file paths, timezone, etc.
   - Solution: Make tests platform-agnostic

2. **Timing issues**:
   - CI runners may be slower
   - Solution: Increase timeouts in tests

3. **Missing test data**:
   - Solution: Ensure test fixtures are committed

---

## Performance Tips

### Making CI Faster

**Dependency caching** (automatic):
- First run: ~30s for dependencies
- Subsequent runs: ~5s (90% faster)
- Cache automatically invalidates when bun.lock changes

**Parallel execution** (automatic):
- Lint + Test run at same time
- Build for 3 platforms at same time
- Total: ~5min instead of ~18min sequential

**What you can do**:
- Keep test suite fast (CI timeout: 10 min)
- Avoid unnecessary dependencies (slower install)
- Don't commit large files (slower checkout)

---

## Best Practices

### Before Pushing

**Run these locally** to catch issues early:
```bash
# Type check
bun run lint

# Run tests
bun test

# Build for your platform
bun run build
```

**Catches 80% of CI failures before pushing** ⚡

---

### Writing CI-Friendly Code

**Do**:
- ✅ Write fast tests (<10 min total)
- ✅ Use TypeScript types correctly
- ✅ Test on multiple platforms (if possible)
- ✅ Keep builds under 50MB (constitutional requirement)

**Don't**:
- ❌ Commit large binary files (slows checkout)
- ❌ Use platform-specific code without fallbacks
- ❌ Write tests that depend on timing/order
- ❌ Use `any` type excessively (defeats linting)

---

### Interpreting CI Results

**All checks green ✓✓✓✓✓✓**: 
- Code quality is good
- Safe to merge
- Consider getting code review

**Lint fails ✗**: 
- Type safety issue
- Fix before proceeding (quick fix)

**Test fails ✗**: 
- Logic error or broken test
- Investigate and fix (may take time)

**Build fails ✗**: 
- Syntax error or missing dependency
- Usually quick to fix

**Validate fails ✗**: 
- Runtime error or broken binary
- More serious, investigate thoroughly

---

## Next Steps

**After merging your first PR with CI**:

1. ✅ **Verify CI ran on main branch push**
   - Check main branch commit has green checks

2. ✅ **Test branch protection**
   - Create test PR with intentional error
   - Verify merge is blocked

3. ✅ **Review CI timing**
   - Check typical run time
   - Report if consistently >5 minutes

4. ✅ **Share feedback**
   - What worked well?
   - What was confusing?
   - Suggest improvements

---

## Getting Help

**CI-specific issues**:
- Check workflow logs for details
- Review this guide for common scenarios
- Open GitHub issue with workflow run URL

**Code issues** (not CI):
- Review test failure messages
- Run tests locally for faster debugging
- Ask maintainer for code review feedback

**Infrastructure issues**:
- GitHub Actions status: https://www.githubstatus.com
- Check if GitHub is experiencing incidents
- Wait and re-run if transient failure

---

## Summary

**Key takeaways**:

1. 🚀 **CI runs automatically** on every PR and push to main
2. ⏱️ **Feedback in ~3-5 minutes** (first run may be slower)
3. 🚫 **Merge blocked if checks fail** (by design, for quality)
4. 🔧 **Fix issues locally first** (`bun run lint` and `bun test`)
5. 📊 **All 6 checks must pass** to merge
6. 🔄 **CI re-runs automatically** on new pushes
7. 📦 **Artifacts available for 30 days** (download from PR)

**Remember**: CI is here to help catch issues early. If it finds a problem, that's a good thing - it prevented broken code from reaching main! 🎉
