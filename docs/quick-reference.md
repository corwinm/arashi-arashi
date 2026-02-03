# Quick Reference: Meta vs Implementation Repo

This is a quick reference card to help you remember which repository you're working in and where files should go.

## Am I in the right place?

```bash
# Check your current location
pwd

# Meta repo path:
/path/to/arashi-arashi/

# Implementation repo path:
/path/to/arashi-arashi/repos/arashi/
```

```bash
# Check git remote
git remote -v

# Meta repo remote:
origin  git@github.com:corwinm/arashi-arashi.git

# Implementation repo remote:
origin  git@github.com:corwinm/arashi.git
```

## What goes where?

### ✅ Meta Repo (arashi-arashi/)

**Should Contain**:
```
✅ specs/               Feature specifications
✅ docs/                Project documentation
✅ repos/               Links to implementation repos
✅ .specify/            Spec-kit configuration
✅ CONTRIBUTING.md      Contribution guidelines
✅ README.md            Project overview
✅ LICENSE              License file
```

**Should NOT Contain**:
```
❌ src/                 Source code
❌ tests/               Test files
❌ package.json         Implementation config
❌ tsconfig.json        TypeScript config
❌ bun.lockb            Dependency lock file
```

### ✅ Implementation Repo (repos/arashi/)

**Should Contain**:
```
✅ src/                 Source code
✅ tests/               Test files
✅ package.json         Project configuration
✅ tsconfig.json        TypeScript configuration
✅ bun.lockb            Dependency lock file
```

**Should NOT Contain**:
```
❌ specs/               Feature specifications
❌ .specify/            Spec-kit config
```

## Common Commands

### Creating a New Feature

```bash
# 1. In meta repo - create spec branch
cd arashi-arashi/
git checkout -b 001-feature-name

# 2. Create specification files (use /speckit commands)
# ... create specs ...

# 3. Commit spec
git add specs/001-feature-name/
git commit -m "feat: add specification for feature-name"
git push origin 001-feature-name

# 4. Switch to implementation repo
cd repos/arashi/
git checkout -b 001-feature-name

# 5. Implement feature
# ... write code and tests ...

# 6. Commit implementation
git add src/ tests/
git commit -m "feat: implement feature-name (Phase 1)"
git push origin 001-feature-name
```

### Switching Between Repos

```bash
# Currently in implementation repo -> go to meta repo
cd ../../

# Currently in meta repo -> go to implementation repo
cd repos/arashi/

# Currently somewhere random -> go to meta repo
cd /path/to/arashi-arashi/

# Currently somewhere random -> go to implementation repo
cd /path/to/arashi-arashi/repos/arashi/
```

### Running Tests

```bash
# Make sure you're in implementation repo!
cd repos/arashi/

# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/lib/feature.test.ts
```

### Creating PRs

```bash
# Meta repo PR (specifications)
cd arashi-arashi/
gh pr create --head 001-feature-name --base main

# Implementation repo PR (code)
cd repos/arashi/
gh pr create --head 001-feature-name --base main
```

## Troubleshooting

### "I committed code to the wrong repo!"

**Symptom**: You see `src/`, `tests/`, `package.json` in the meta repo.

**Solution**:
```bash
cd arashi-arashi/  # Go to meta repo root
rm -rf src/ tests/ package.json tsconfig.json
git add -A
git commit -m "chore: remove wrongly placed implementation files"
```

### "Command not found: bun"

**Symptom**: `bun test` doesn't work.

**Possible Causes**:
1. You're in the meta repo (bun is only used in implementation repo)
2. Bun is not installed

**Solution**:
```bash
# Check if you're in the right place
pwd  # Should be repos/arashi/

# If in meta repo, switch to implementation repo
cd repos/arashi/

# If bun is not installed
curl -fsSL https://bun.sh/install | bash
```

### "Not a git repository"

**Symptom**: Git commands fail with "not a git repository".

**Solution**:
```bash
# Check where you are
pwd

# You might be in a subdirectory, go to repo root
cd ..  # or cd ../../ depending on depth

# Verify you're at a repo root
git status  # Should work now
```

### "Tests are failing"

**Checklist**:
1. Are you in the implementation repo? (`pwd` should show repos/arashi/)
2. Are dependencies installed? (`bun install`)
3. Is the module implemented? (TDD: tests fail first, then implement)
4. Are import paths correct? (Common issue: `../../../src/lib/feature`)

## Branch Naming

**Format**: `NNN-feature-name`

**Examples**:
- `001-git-utility-lib`
- `002-worktree-manager`
- `003-config-system`

**Rules**:
- Use same branch name in both repos
- Use leading zeros (001, not 1)
- Use kebab-case (dashes, not underscores)

## Commit Message Format

```
<type>: <description> (Phase N - User Story M)

Body:
- Implementation details
- Tests added/updated
- Completed tasks

Footer:
Completed tasks: T001-T005
Feature: 001-feature-name
Test results: N pass, 0 fail
Next: Phase N+1
```

**Types**:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests only
- `refactor:` - Code refactoring
- `chore:` - Maintenance

## Git Remotes

```bash
# Meta repo
git remote -v
# origin  git@github.com:corwinm/arashi-arashi.git

# Implementation repo
cd repos/arashi/ && git remote -v
# origin  git@github.com:corwinm/arashi.git
```

**They are DIFFERENT repositories!**

## File Checklist

Before committing to meta repo, verify:

```bash
# Run this in meta repo root
ls -la

# Should see:
✅ specs/
✅ docs/
✅ repos/
✅ .specify/
✅ CONTRIBUTING.md
✅ README.md

# Should NOT see:
❌ src/
❌ tests/
❌ package.json (except in .opencode/)
❌ tsconfig.json
❌ node_modules/ (except in repos/arashi/)
```

## Need Help?

1. **Check workflow**: `cat docs/implementation-workflow.md`
2. **Check contributing**: `cat CONTRIBUTING.md`
3. **Check this reference**: `cat docs/quick-reference.md`
4. **Ask in discussions**: https://github.com/corwinm/arashi-arashi/discussions
