# Quickstart: GitHub Actions Release Workflow

**Feature**: 019-release-workflow  
**Audience**: Maintainers and contributors  
**Last Updated**: 2026-02-06

## Overview

This guide shows you how to create a new Arashi release using the automated GitHub Actions workflow. The entire process takes **under 10 minutes** from start to finish.

---

## Prerequisites

### One-Time Setup

Before creating your first release:

1. **Install semantic-release dependencies** (if not already done):
   ```bash
   cd repos/arashi
   npm install --save-dev semantic-release @semantic-release/git @semantic-release/changelog
   ```

2. **Create `.releaserc.json`** in repository root:
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

3. **Add NPM_TOKEN secret** (optional, for npm publishing):
   - Go to https://www.npmjs.com/settings/{username}/tokens
   - Create new "Automation" token with publish permissions
   - Add to GitHub repo secrets: Settings → Secrets → Actions → New secret
   - Name: `NPM_TOKEN`, Value: your token

4. **Ensure commit messages follow conventional format**:
   - Use `feat:` for new features
   - Use `fix:` for bug fixes
   - Use `feat!:` or `BREAKING CHANGE:` for breaking changes

---

## Creating a Release

### Step 1: Verify Commits

Check that you have conventional commits since the last release:

```bash
# View commits since last tag
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Example output:
# abc1234 feat(cli): add list command with JSON output
# def5678 fix(windows): resolve path separator issues
# ghi9012 docs: update README with new examples
```

**What to look for**:
- At least one `feat:` or `fix:` commit (otherwise no release will be created)
- All commits follow conventional format (non-conventional commits are ignored)

---

### Step 2: Trigger the Workflow

1. **Go to GitHub Actions**:
   - Navigate to https://github.com/corwinm/arashi-arashi/actions
   - Click "Release" workflow in the left sidebar

2. **Run workflow**:
   - Click "Run workflow" button (top right)
   - Select branch: `main`
   - Leave "dry_run" unchecked (or check for testing)
   - Click "Run workflow"

![Run Workflow Screenshot]
```
┌─────────────────────────────────────┐
│ Run workflow                        │
├─────────────────────────────────────┤
│ Branch: main                    ▼   │
│ □ Run in dry-run mode               │
│                                     │
│          [Run workflow]             │
└─────────────────────────────────────┘
```

---

### Step 3: Monitor Progress

The workflow has two jobs that run sequentially:

#### Job 1: Build (3-5 minutes)

Builds binaries for all platforms in parallel:

```
Build bun-linux-x64 ........... ✓ (1m 45s)
Build bun-darwin-arm64 ........ ✓ (1m 52s)
Build bun-windows-x64 ......... ✓ (1m 48s)
```

**Status**: Watch for green checkmarks. If any build fails, the workflow stops here.

#### Job 2: Release (1-2 minutes)

Creates the release and publishes:

```
✓ Checkout repository
✓ Setup Node.js
✓ Install semantic-release
✓ Download artifacts (3 binaries)
✓ Run semantic-release
  ├─ Analyzing commits
  ├─ Determining version: 0.5.0 → 0.6.0
  ├─ Updating package.json and CHANGELOG.md
  ├─ Creating git tag v0.6.0
  ├─ Creating GitHub release
  ├─ Attaching binaries (3 files)
  └─ Publishing to npm (or skipping if no token)
✓ Release complete
```

---

### Step 4: Verify Release

After the workflow completes successfully:

1. **Check GitHub Releases**:
   - Go to https://github.com/corwinm/arashi/releases
   - You should see a new release `v0.6.0` (or whatever version was calculated)
   - Verify 3 binary assets are attached:
     - `arashi-bun-linux-x64`
     - `arashi-bun-darwin-arm64`
     - `arashi-bun-windows-x64.exe`

2. **Check npm** (if NPM_TOKEN configured):
   - Go to https://www.npmjs.com/package/arashi
   - Verify new version appears
   - Test installation: `npm install -g arashi@latest`

3. **Check Git Tags**:
   ```bash
   git fetch --tags
   git tag -l
   # Should show new v0.6.0 tag
   ```

4. **Check CHANGELOG.md**:
   ```bash
   git pull
   cat CHANGELOG.md
   # Should have new section for 0.6.0
   ```

---

## Version Bump Rules

The workflow automatically determines version bumps based on commit messages:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor | 0.5.0 → **0.6.0** |
| `fix:` | Patch | 0.5.0 → **0.5.1** |
| `feat!:` or `BREAKING CHANGE:` | Major | 0.5.0 → **1.0.0** |
| Multiple types | Highest priority | `feat:` + `fix:` → **0.6.0** (minor wins) |
| No conventional commits | No release | Workflow skips release |

**Pre-1.0.0 Special Rule** (per Arashi constitution):
- Breaking changes bump **minor** version (0.5.0 → **0.6.0**), not major
- Major version is reserved for 1.0.0 release
- After 1.0.0, breaking changes bump major as expected

---

## Common Scenarios

### Scenario 1: No Release Created

**Symptom**: Workflow succeeds but no release appears

**Cause**: No conventional commits since last release

**Solution**: 
- Check commit messages: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`
- Ensure at least one commit starts with `feat:` or `fix:`
- Amend commits if needed: `git commit --amend` (before pushing)

---

### Scenario 2: Build Fails for One Platform

**Symptom**: Build job shows red X for one platform

**Cause**: Platform-specific compilation error

**Solution**:
1. Click into failed job to see error logs
2. Fix the issue in source code
3. Push fix to main branch
4. Re-trigger release workflow

**Note**: Release job will not run until all builds succeed.

---

### Scenario 3: npm Publish Fails

**Symptom**: GitHub release succeeds, but npm publish step fails

**Cause**: Invalid NPM_TOKEN or version already published

**Solution**:

**If token issue**:
1. Generate new token at https://www.npmjs.com/settings/{username}/tokens
2. Update GitHub secret `NPM_TOKEN`
3. Manually publish: `npm publish` (from repos/arashi directory)

**If version conflict**:
- Version already exists on npm (not an error)
- No action needed; GitHub release is primary distribution

---

### Scenario 4: Need to Rollback Release

**Symptom**: Released version has critical bug

**Solution**:

**Don't delete the release!** Instead, create a new patch release:

1. Fix the bug in a new commit: `fix(critical): resolve [issue]`
2. Push to main
3. Trigger workflow again → creates 0.6.1 automatically
4. Mark previous release as "draft" or add warning note

**Why?** Deleting releases breaks users who already downloaded binaries or installed from npm.

---

### Scenario 5: Testing Before Release

**Symptom**: Want to test workflow without creating real release

**Solution**: Use dry-run mode:

1. Trigger workflow
2. Check "Run in dry-run mode"
3. Workflow executes all steps but skips:
   - Creating git tags
   - Creating GitHub releases
   - Publishing to npm

**Use case**: Test after making changes to workflow file.

---

## Troubleshooting

### Workflow Not Visible

**Problem**: "Release" workflow not showing in Actions tab

**Fix**: 
- Workflow file must be on `main` branch
- Check file exists: `.github/workflows/release.yml`
- Verify YAML syntax is valid

---

### Permission Denied Errors

**Problem**: Workflow fails with "permission denied" during git operations

**Fix**:
- Check workflow permissions in `.github/workflows/release.yml`:
  ```yaml
  permissions:
    contents: write
    pull-requests: write
    issues: write
  ```
- Verify branch protection rules allow GitHub Actions to push

---

### Version Already Exists

**Problem**: semantic-release fails with "tag v0.6.0 already exists"

**Fix**:

**If release was partial/failed**:
1. Delete remote tag: `git push --delete origin v0.6.0`
2. Delete local tag: `git tag -d v0.6.0`
3. Delete GitHub release (if created)
4. Re-trigger workflow

**If release was successful**:
- This is expected behavior
- Workflow skips release when no new commits exist
- No action needed

---

## Best Practices

### Commit Message Hygiene

✅ **Good**:
```
feat(cli): add list command with JSON output
fix(windows): resolve path separator in worktree paths
docs: update installation instructions
```

❌ **Bad**:
```
added new feature          # Missing type prefix
fix bug                    # Too vague, missing scope
WIP: testing something     # Not a release-worthy commit
```

**Tip**: Use `commitlint` to enforce conventional commits in pre-commit hooks.

---

### Squash Merge PRs

When merging pull requests, use **squash merging** with a single conventional commit:

```
feat(create): implement interactive repo selection (#42)

- Add prompt for selecting repositories
- Support multi-select with arrow keys
- Update tests for new flow

Closes #35
```

**Why?** Easier to control version bumps when each PR = one commit.

---

### Release Cadence

**Recommended**: Release after merging 3-5 PRs or once per week

**Reasoning**:
- Too frequent: Many small releases, harder to track
- Too infrequent: Large changelogs, higher risk per release

**Exception**: Critical bug fixes should be released immediately.

---

### Pre-Release Testing

Before triggering release:

1. Ensure CI passes on main branch
2. Test locally: `bun run build && ./dist/arashi --version`
3. Review commits since last release: `git log v0.5.0..HEAD`
4. Verify conventional commit format

---

## Advanced Usage

### Custom Version Bump

**Scenario**: Need to force a specific version bump (override conventional commits)

**Solution**: Add `Release-As` footer to commit message:

```bash
git commit -m "feat: new feature

Release-As: 1.0.0"
```

**Use case**: Manually marking 1.0.0 release milestone.

---

### Pre-Release Versions

**Scenario**: Want to publish beta/alpha versions

**Solution**: Use release branches (requires configuration):

```json
{
  "branches": [
    "main",
    { "name": "beta", "prerelease": true }
  ]
}
```

Then releases from `beta` branch create versions like `0.6.0-beta.1`.

---

### Skipping CI

**Scenario**: Push changes without triggering workflows

**Solution**: Include `[skip ci]` in commit message:

```bash
git commit -m "chore: update docs [skip ci]"
```

**Note**: semantic-release automatically adds `[skip ci]` to version bump commits.

---

## Reference

### Workflow File Location

`.github/workflows/release.yml` in the arashi repository

### Configuration File

`.releaserc.json` in repository root

### Documentation

- [semantic-release docs](https://semantic-release.gitbook.io/)
- [Conventional Commits spec](https://www.conventionalcommits.org/)
- [GitHub Actions docs](https://docs.github.com/en/actions)

### Support

- **Issues**: https://github.com/corwinm/arashi/issues
- **Discussions**: https://github.com/corwinm/arashi/discussions

---

## Summary

Creating a release is simple:

1. ✅ Ensure commits follow conventional format
2. ✅ Trigger workflow manually from GitHub Actions
3. ✅ Wait 3-5 minutes for builds and release
4. ✅ Verify release on GitHub and npm

The workflow handles everything automatically: version calculation, changelog generation, binary compilation, and distribution.

Happy releasing! 🚀
