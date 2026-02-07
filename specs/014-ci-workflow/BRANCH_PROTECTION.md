# Branch Protection Setup Guide

**Feature**: GitHub Actions CI Workflow  
**Date**: 2026-02-05  
**Purpose**: Configure GitHub branch protection rules to enforce CI checks

## Overview

This document provides step-by-step instructions for configuring GitHub branch protection rules to ensure all CI checks must pass before code can be merged to the `main` branch.

## Required Status Checks

The CI workflow provides the following status checks that must all pass before merging:

1. **lint** - TypeScript type checking
2. **test** - Full test suite execution  
3. **build (ubuntu-latest)** - Linux binary build
4. **build (macos-latest)** - macOS binary build
5. **build (windows-latest)** - Windows binary build
6. **validate** - Binary validation checks

## Configuration Steps

### Step 1: Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click on **Settings** (top navigation bar)
3. In the left sidebar, click **Branches**
4. Click **Add branch protection rule** (or edit existing rule for `main`)

### Step 2: Configure Branch Name Pattern

In the **Branch name pattern** field, enter:
```
main
```

This ensures the protection rules apply to the main branch.

### Step 3: Enable Status Check Requirements

Check the following boxes:

- ☑ **Require status checks to pass before merging**
- ☑ **Require branches to be up to date before merging**

### Step 4: Select Required Status Checks

In the **Status checks that are required** search field, type and select each of these checks:

1. Type `lint` and select it
2. Type `test` and select it
3. Type `build (ubuntu-latest)` and select it
4. Type `build (macos-latest)` and select it
5. Type `build (windows-latest)` and select it
6. Type `validate` and select it

**Note**: These checks will only appear in the list after the CI workflow has run at least once. You may need to create a test PR first to populate this list.

### Step 5: Additional Recommended Settings (Optional)

Consider enabling these additional protections:

- ☑ **Require a pull request before merging**
  - Minimum number of approvals: 1
- ☑ **Require conversation resolution before merging**
- ☑ **Do not allow bypassing the above settings**

### Step 6: Save Changes

1. Scroll to the bottom of the page
2. Click **Create** (or **Save changes** if editing existing rule)

## Verification

To verify the branch protection is working:

### Test 1: Create PR with Failing Check

1. Create a new branch with an intentional TypeScript error
2. Push and create a PR
3. Observe that the `lint` check fails
4. Try to merge - the button should be disabled with message "Merging is blocked"

### Test 2: Create PR with Passing Checks

1. Create a new branch with valid code
2. Push and create a PR
3. Wait for all 6 checks to pass (green checkmarks)
4. Merge button should be enabled

## Troubleshooting

### Status Checks Not Appearing

**Problem**: Status check names don't appear in the selection list

**Solution**: 
1. Ensure the CI workflow file (`.github/workflows/ci.yml`) is merged to `main` branch
2. Create a test PR to trigger the workflow
3. Wait for workflow to complete
4. Return to branch protection settings - checks should now be available

### Wrong Check Names Selected

**Problem**: Selected the wrong status check names

**Solution**:
1. Edit the branch protection rule
2. Remove incorrect check names (click X next to each)
3. Add correct names as listed in "Required Status Checks" section above
4. Save changes

### Merge Still Allowed Despite Failing Checks

**Problem**: PRs can be merged even with failing checks

**Solution**:
1. Verify "Require status checks to pass before merging" is checked
2. Verify all 6 required checks are selected
3. Verify "Do not allow bypassing" is checked (if you enabled it)
4. Check that your user account doesn't have admin bypass enabled

### Builds Timeout or Fail

**Problem**: Build or validate checks consistently timeout or fail

**Solution**:
1. Check the workflow run logs for specific errors
2. Common issues:
   - Missing dependencies: Verify `package.json` has all required deps
   - Binary size too large: Check dist/ files are under 50MB
   - Timeout too short: Consider increasing timeout if builds legitimately take longer
3. Fix the underlying issue and push again

## Expected Workflow Experience

### Developer Flow

1. Developer creates feature branch
2. Makes code changes
3. Pushes to GitHub
4. Creates pull request
5. **CI automatically triggers**:
   - Lint runs (1-2 min)
   - Test runs (2-4 min)  
   - Build runs for 3 platforms in parallel (3-5 min)
   - Validate runs for 3 platforms
6. Developer sees 6 status checks in PR:
   - All green ✓ → Can merge
   - Any red ✗ → Must fix before merge
7. If failures, developer:
   - Reads error logs
   - Fixes issues locally
   - Pushes fix
   - CI re-runs automatically
8. Once all checks pass, reviewer approves
9. Developer merges PR

### Timing Expectations

- **First run (cold cache)**: 5-7 minutes
- **Subsequent runs (warm cache)**: 3-5 minutes
- **Lint + Test (parallel)**: 3-4 minutes
- **Build (parallel across platforms)**: 3-5 minutes
- **Validate (parallel across platforms)**: 1 minute

## Maintenance

### Updating Required Checks

If you add new jobs to the CI workflow:

1. Merge the workflow changes to `main`
2. Create a test PR to run the new checks
3. Edit branch protection rule
4. Add the new check names to required list
5. Save changes

### Removing Required Checks

If you remove jobs from the CI workflow:

1. Edit branch protection rule
2. Remove the check names that no longer exist (click X)
3. Save changes
4. Merge the workflow changes to `main`

## Additional Resources

- GitHub Actions Documentation: https://docs.github.com/en/actions
- Branch Protection Rules: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches
- CI Workflow Troubleshooting: See `quickstart.md` in this directory
- Workflow Contract: See `contracts/ci-workflow-contract.md`

## Questions or Issues?

If you encounter problems with branch protection or CI checks:

1. Check this guide's Troubleshooting section
2. Review the quickstart.md for common CI issues
3. Check workflow run logs for specific errors
4. Open an issue in the repository with:
   - Screenshot of branch protection settings
   - Link to failing workflow run
   - Description of expected vs actual behavior
