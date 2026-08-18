# Implementation Workflow

This document describes the complete workflow for implementing features in the Arashi project, from specification to deployment.

## Repository Structure

Arashi uses a **meta-repository structure**:

```
arashi-arashi/           # Meta repository (THIS REPO)
├── specs/               # Feature specifications
│   └── 001-feature/     # Numbered feature specs
├── repos/               # Implementation repositories (git worktrees)
│   └── arashi/          # Main implementation
├── docs/                # Project documentation
└── .specify/            # Spec-kit configuration

arashi/                  # Implementation repository (SEPARATE REPO)
└── (actual code)        # Cloned/linked in repos/arashi/
```

**CRITICAL**: The `repos/arashi/` directory is a **git worktree** that points to the actual implementation repository. It maintains its own git history separate from the meta repo.

## Phase 1: Specification (Meta Repo)

### 1.1 Create Feature Branch in Meta Repo

```bash
cd arashi-arashi/
git checkout -b 001-feature-name
```

**Branch Naming**: Use format `NNN-feature-name` where NNN is the feature number (001, 002, etc.)

### 1.2 Create Specification Files

Use `/speckit` commands in OpenCode:

```bash
# Create initial specification
/speckit.specify

# Create implementation plan
/speckit.plan

# Create research documentation (if needed)
# Manually create: specs/001-feature-name/research.md

# Generate task breakdown
/speckit.tasks

# Create data model documentation (if needed)
# Manually create: specs/001-feature-name/data-model.md

# Create API contracts (if needed)
# Manually create: specs/001-feature-name/contracts/
```

**Output Structure**:

```
specs/001-feature-name/
├── spec.md              # User stories, acceptance criteria
├── plan.md              # Technical implementation plan
├── research.md          # Research decisions (optional)
├── data-model.md        # Entity definitions (optional)
├── tasks.md             # Task breakdown with phases
├── contracts/           # API contracts (optional)
│   └── api-name.ts
└── checklists/          # Validation checklists (optional)
    └── requirements.md
```

### 1.3 Commit Specification to Meta Repo

```bash
git add specs/001-feature-name/
git commit -m "feat: add specification for feature-name

- Create spec with N user stories and acceptance criteria
- Generate implementation plan with Tech Stack
- Document M research decisions
- Break down into X tasks across Y phases
- Follows constitutional principles"

git push origin 001-feature-name
```

### 1.4 Create Meta Repo PR

```bash
gh pr create --head 001-feature-name --title "feat: Add Feature Name specification (Feature 001)" --body "..." --base main
```

**PR Should Include**:

- Summary of the feature
- List of specification files added
- Constitutional compliance checklist
- Link to related issues

## Phase 2: Implementation (Implementation Repo)

### 2.1 Switch to Implementation Repository

```bash
cd repos/arashi/
git status  # Verify you're in the implementation repo
```

**IMPORTANT**:

- `repos/arashi/` is a **separate git repository**
- It has its own branches, commits, and remote
- Changes here do NOT affect the meta repo

### 2.2 Create Matching Feature Branch

```bash
cd repos/arashi/
git checkout -b 001-feature-name
```

**Branch Naming**: Use the **same branch name** as meta repo for consistency.

### 2.3 Implement According to Specification

Follow the task breakdown from `specs/001-feature-name/tasks.md`:

**TDD Approach**:

1. Write tests first (they should fail)
2. Implement functionality
3. Run tests until they pass
4. Refactor as needed

**Example Workflow**:

```bash
# Phase 1: Setup
# - Create directory structure
# - Configure TypeScript
# - Setup test framework

# Phase 2: Foundational
# - Define TypeScript interfaces
# - Implement error handling
# - Create test utilities

# Phase 3+: Feature Implementation
# - Implement each user story
# - Write comprehensive tests
# - Verify coverage >80%
```

### 2.4 Commit Implementation Regularly

```bash
git add src/lib/feature.ts tests/unit/feature.test.ts
git commit -m "feat: implement feature-name (Phase 3 - User Story 1)

- Implement core functionality using Tech Stack
- Add comprehensive error handling
- Add N unit tests and M integration tests
- All tests passing (X/X)

Completed tasks: T008-T012
Feature: 001-feature-name
Test coverage: NN%
Next: Phase 4 - Next Phase Name"
```

**Commit Message Guidelines**:

- Reference task numbers (T001, T002, etc.)
- Include test results
- Note what phase/user story is complete
- Indicate next steps

### 2.5 Run Tests Before Each Commit

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/unit/lib/feature.test.ts
```

**Test Requirements**:

- All tests must pass
- Coverage >80% for new code
- Include both unit and integration tests
- Test error cases and edge cases

### 2.6 Push Implementation Branch

```bash
git push -u origin 001-feature-name
```

### 2.7 Create Implementation PR

```bash
cd repos/arashi/
gh pr create --head 001-feature-name --title "feat: Implement Feature Name (Phase 1-3)" --body "..." --base main
```

**PR Should Include**:

- Link to meta repo specification PR
- Implementation progress (phases/tasks completed)
- Test results (N passing, 0 failing)
- Files changed summary
- Next steps
- Constitutional compliance checklist

## Phase 3: Cleanup (Meta Repo)

### 3.1 Remove Misplaced Implementation Files

**COMMON MISTAKE**: Implementation files accidentally created in meta repo during development.

```bash
cd ../../  # Back to meta repo root
git status

# If you see implementation files (src/, tests/, package.json, tsconfig.json):
rm -rf src/ tests/ package.json tsconfig.json

git add -A
git commit -m "chore: remove wrongly placed implementation files from meta repo

These files were mistakenly created in the meta repo during implementation.
They have been correctly placed in repos/arashi/ and should not exist here.

The meta repo should only contain:
- specs/ (feature specifications)
- docs/ (project documentation)
- repos/ (implementation repository links)
- CONTRIBUTING.md, README.md, LICENSE"
```

### 3.2 Verify Repository Separation

**Meta Repo Should Contain**:

```
✅ specs/               # Feature specifications
✅ docs/                # Documentation
✅ repos/               # Links to implementation repos
✅ .specify/            # Spec-kit config
✅ CONTRIBUTING.md      # Contribution guide
✅ README.md            # Project overview

❌ src/                 # NO implementation code
❌ tests/               # NO test files
❌ package.json         # NO implementation config (only .opencode/package.json is ok)
❌ tsconfig.json        # NO implementation config
```

**Implementation Repo Should Contain**:

```
✅ src/                 # Source code
✅ tests/               # Test files
✅ package.json         # Project configuration
✅ tsconfig.json        # TypeScript configuration
✅ bun.lockb            # Dependency lock file

❌ specs/               # NO specifications (those live in meta repo)
❌ .specify/            # NO spec-kit config
```

## Phase 4: Review and Merge

### 4.1 Review Checklist

**Specification Review** (Meta Repo PR):

- [ ] All user stories have acceptance criteria
- [ ] Implementation plan is technically sound
- [ ] Research decisions are documented
- [ ] Tasks are actionable and estimated
- [ ] Constitutional principles are followed
- [ ] No implementation files in meta repo

**Implementation Review** (Implementation Repo PR):

- [ ] Code matches specification
- [ ] All tests passing (>80% coverage)
- [ ] Error handling includes rollback
- [ ] TypeScript strict mode enabled
- [ ] No external dependencies (if required by constitution)
- [ ] Cross-platform compatible
- [ ] Comprehensive test coverage
- [ ] Clear commit history

### 4.2 Merge Order

1. **Merge Meta Repo PR First** (specification approved)

   ```bash
   # Merge via GitHub UI using squash merge
   # This creates the official specification record
   ```

2. **Then Merge Implementation Repo PR** (code approved)
   ```bash
   # Merge via GitHub UI using squash merge
   # Reference meta repo PR in commit message
   ```

## Common Workflows

### Starting a New Feature

```bash
# 1. Meta repo: Create spec branch
cd arashi-arashi/
git checkout main && git pull
git checkout -b 002-new-feature

# 2. Create specification files
# Use /speckit commands...

# 3. Commit specification
git add specs/002-new-feature/
git commit -m "feat: add specification for new-feature"
git push origin 002-new-feature

# 4. Create meta repo PR
gh pr create --head 002-new-feature --base main

# 5. Switch to implementation repo
cd repos/arashi/
git checkout main && git pull
git checkout -b 002-new-feature

# 6. Implement feature
# Follow TDD approach...

# 7. Push implementation
git push origin 002-new-feature

# 8. Create implementation PR
gh pr create --head 002-new-feature --base main
```

### Fixing Mistakes

#### Implementation Files in Meta Repo

```bash
cd arashi-arashi/  # Meta repo root
rm -rf src/ tests/ package.json tsconfig.json
git add -A
git commit -m "chore: remove wrongly placed implementation files"
```

#### Wrong Branch

```bash
# If you committed to wrong branch:
git log --oneline -n 5  # Find commit hash
git checkout correct-branch
git cherry-pick <commit-hash>
git checkout wrong-branch
git reset --hard HEAD~1  # Remove commit from wrong branch
```

### Syncing Between Repositories

```bash
# Pull latest changes in meta repo
cd arashi-arashi/
git checkout main && git pull

# Pull latest changes in implementation repo
cd repos/arashi/
git checkout main && git pull

# They are independent - no syncing needed!
```

## Tips and Best Practices

### Repository Navigation

```bash
# Always check which repo you're in
pwd
git remote -v  # Shows repo URL

# Meta repo remote: corwinm/arashi-arashi.git
# Implementation repo remote: corwinm/arashi.git
```

### Branch Management

- **Use same branch names** in both repos for consistency
- **Format**: `NNN-feature-name` (e.g., `001-git-utility-lib`)
- **Never commit implementation code to meta repo**
- **Never commit specs to implementation repo**

### Test-Driven Development

```bash
# 1. Write failing test
bun test  # Should fail

# 2. Implement feature
# (write code)

# 3. Run tests
bun test  # Should pass

# 4. Refactor
# (improve code)

# 5. Verify tests still pass
bun test  # Should still pass
```

### Commit Messages

```
Format: <type>: <description> (Phase N - User Story M)

Body:
- Implementation details
- Tests added
- Completed tasks

Footer:
Completed tasks: T001-T005
Feature: 001-feature-name
Test results: N pass, 0 fail
Next: Phase N+1
```

### Documentation Updates

When you discover process improvements:

1. Document them immediately
2. Create PR to update docs
3. Share with team

## Troubleshooting

### "I committed implementation code to meta repo"

```bash
cd arashi-arashi/
rm -rf src/ tests/ package.json tsconfig.json
git add -A
git commit -m "chore: remove wrongly placed implementation files"
```

### "My tests are failing"

```bash
# Check you're in the right directory
pwd  # Should be repos/arashi/

# Verify dependencies installed
bun install

# Run single test file for debugging
bun test tests/unit/lib/feature.test.ts

# Check test file imports are correct
# Common issue: wrong relative paths
```

### "Git says 'not a git repository'"

```bash
# Make sure you're in the right directory
pwd

# Meta repo: /path/to/arashi-arashi/
# Implementation repo: /path/to/arashi-arashi/repos/arashi/

cd repos/arashi/  # If you need implementation repo
cd ../../         # If you need meta repo
```

### "Cannot find module '../../../src/lib/feature'"

This means:

1. The module doesn't exist yet (TDD - expected!)
2. Or the relative path is wrong

Solution:

- If TDD: Implement the module
- If wrong path: Fix the import statement

## Reference

- **Meta Repo**: https://github.com/corwinm/arashi-arashi
- **Implementation Repo**: https://github.com/corwinm/arashi
- **Spec-kit Docs**: https://github.com/github/spec-kit
- **OpenCode Docs**: https://opencode.ai/docs
