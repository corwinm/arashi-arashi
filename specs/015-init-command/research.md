# Research: Init Command Implementation

**Feature**: 015-init-command  
**Date**: 2026-02-05  
**Purpose**: Technical research to resolve implementation questions before design phase

## Overview

This document captures research findings for implementing the `arashi init` command. Research focused on five key areas: hook template patterns, .gitignore management, rollback strategies, repository discovery scope, and git repository validation.

---

## R1: Hook Template Patterns

### Question
What should example hook templates contain? What are common use cases for lifecycle hooks in worktree management?

### Investigation

**Examined Existing Patterns**:
- Git's own hook system (client-side hooks in `.git/hooks/`)
- Husky's hook template approach (examples with comments)
- Pre-commit framework templates (executable scripts with metadata)

**Common Use Cases Identified**:
1. **pre-create.sh**: Validate branch name format, check CI/CD status, verify local changes committed
2. **post-create.sh**: Install dependencies, run database migrations, update IDE configuration
3. **setup.sh**: Configure development environment, copy shared config files, set git config

### Decision

**Create 3 example templates** with the following structure:

**Template Pattern**:
```bash
#!/usr/bin/env bash
#
# Hook: [HOOK_NAME]
# Description: [PURPOSE]
#
# This is an EXAMPLE template. To use:
# 1. Copy this file to .arashi/hooks/[HOOK_NAME]
# 2. Make it executable: chmod +x .arashi/hooks/[HOOK_NAME]
# 3. Customize the script below
#
# Environment variables available:
# - ARASHI_BRANCH: Branch name being created
# - ARASHI_WORKTREE_PATH: Path to worktree directory
# - ARASHI_REPO_NAME: Repository name
# - ARASHI_REPO_PATH: Repository root path
#
# Exit with non-zero to abort operation

# Example: Validate branch name format
if [[ ! "$ARASHI_BRANCH" =~ ^(feature|bugfix|hotfix)/.+ ]]; then
  echo "Error: Branch must start with feature/, bugfix/, or hotfix/"
  exit 1
fi

echo "Hook [HOOK_NAME] completed successfully"
```

**Templates to Include**:
1. `pre-create.sh.example` - Validation before worktree creation
2. `post-create.sh.example` - Setup actions after worktree creation
3. `setup.sh.example` - Repository-specific environment setup

### Rationale

- **Example suffix**: Prevents accidental execution; requires explicit user action to enable
- **Environment variables**: Documented contract for hook context; extensible for future needs
- **Comments**: Self-documenting; reduces need to consult external documentation
- **Exit codes**: Standard Unix convention; allows hooks to abort operations

### Alternatives Considered

| Alternative | Reason for Rejection |
|------------|---------------------|
| Single example hook | Insufficient guidance for different use cases |
| Working examples (e.g., "npm install") | Too prescriptive; doesn't fit all projects |
| No examples | Reduces discoverability of hook system |
| JSON/YAML config | Adds complexity; Bash scripts more familiar to developers |

---

## R2: .gitignore Update Strategy

### Question
How should we handle different .gitignore scenarios? What's the safest way to avoid duplicates and respect existing configuration?

### Investigation

**Scenarios to Handle**:
1. `.gitignore` doesn't exist → Create new file
2. `.gitignore` exists, no repos entry → Append entry
3. `.gitignore` exists, exact entry present → No-op (idempotent)
4. `.gitignore` exists, similar but different entry → Append (user may want both)

**Researched Approaches**:
- **Git's ignore patterns**: Support for comments, wildcards, negation
- **GitHub's .gitignore templates**: Always end with newline, use sections with comments
- **Standard .gitignore format**: Blank line separators between sections

### Decision

**Idempotent Append Strategy**:

```typescript
async function addToGitignore(repoPath: string, entry: string): Promise<boolean> {
  const gitignorePath = join(repoPath, '.gitignore');
  
  // Check if .gitignore exists
  const exists = await fileExists(gitignorePath);
  
  if (exists) {
    // Read existing content
    const content = await readTextFile(gitignorePath);
    
    // Check for exact match (avoid duplicates)
    const lines = content.split('\n');
    if (lines.includes(entry)) {
      return false; // Already present, no change needed
    }
    
    // Append with proper formatting
    const newContent = content.endsWith('\n') 
      ? `${content}\n# Arashi managed repositories\n${entry}\n`
      : `${content}\n\n# Arashi managed repositories\n${entry}\n`;
    
    await writeTextFile(gitignorePath, newContent);
    return true;
  } else {
    // Create new .gitignore
    const newContent = `# Arashi managed repositories\n${entry}\n`;
    await writeTextFile(gitignorePath, newContent);
    return true;
  }
}
```

**Key Behaviors**:
- Exact match check prevents duplicates
- Comment section added for clarity
- Blank line separator maintains readability
- Always ends with newline (Git convention)
- Returns boolean indicating if change was made

### Rationale

- **Idempotent**: Running init multiple times safe
- **Comment headers**: Makes auto-generated content obvious
- **Exact match only**: Avoids complex pattern matching; user controls variations
- **Preserves user content**: Append-only, never modifies existing entries

### Alternatives Considered

| Alternative | Reason for Rejection |
|------------|---------------------|
| Always append | Creates duplicates on repeated init |
| Parse and dedupe similar patterns | Complex; risk of removing user's intentional entries |
| Prompt user | Adds friction to init flow; violates Constitution V (minimalist) |
| Modify existing entries | Too invasive; risks data loss |

---

## R3: Rollback Granularity

### Question
What operations need rollback if init fails? How do we ensure repository is left in a clean state?

### Investigation

**Init Operation Sequence**:
1. Validate git repository (read-only check)
2. Create `.arashi/` directory
3. Write `config.json` file
4. Create `repos/` directory (if specified)
5. Create `.arashi/hooks/` directory
6. Write hook template files
7. Update `.gitignore`
8. Discover repositories (read-only)
9. Update config with discovered repos
10. Display success message

**Failure Points**:
- Directory creation: permissions, disk full
- File writes: permissions, disk full, invalid JSON
- Repository discovery: permissions, invalid repos (non-fatal)

### Decision

**Tracked Operations with Reverse Cleanup**:

```typescript
interface InitOperation {
  type: 'CREATE_DIR' | 'WRITE_FILE' | 'UPDATE_FILE';
  path: string;
  originalContent?: string; // For UPDATE_FILE
}

const operations: InitOperation[] = [];

// Track as we go
operations.push({ type: 'CREATE_DIR', path: '.arashi' });
operations.push({ type: 'WRITE_FILE', path: '.arashi/config.json' });
operations.push({ type: 'CREATE_DIR', path: 'repos' });
operations.push({ type: 'UPDATE_FILE', path: '.gitignore', originalContent: existingContent });

// On error, reverse
for (const op of operations.reverse()) {
  if (op.type === 'CREATE_DIR' && wasCreatedByUs(op.path)) {
    await removeDir(op.path);
  } else if (op.type === 'WRITE_FILE') {
    await removeFile(op.path);
  } else if (op.type === 'UPDATE_FILE' && op.originalContent !== undefined) {
    await writeTextFile(op.path, op.originalContent);
  }
}
```

**Rollback Rules**:
1. Only remove directories **we created** (check didn't exist before)
2. Remove files we wrote in their entirety
3. Restore files we modified (save original content)
4. Process in reverse order (LIFO stack)

### Rationale

- **Constitution Principle III**: "Any failed operation MUST automatically rollback all changes"
- **Safety**: Never delete user's existing directories or files
- **Simplicity**: Linear operation log, simple reverse logic
- **Completeness**: Repository left in exact pre-init state

### Alternatives Considered

| Alternative | Reason for Rejection |
|------------|---------------------|
| No rollback | Violates Constitution Principle III |
| Transactional filesystem | Not available in Node.js/Bun; complex to implement |
| Backup entire directory | Wasteful; doesn't scale to large repos |
| Manual cleanup instructions | Poor UX; error-prone |

---

## R4: Repository Discovery Scope

### Question
Should init discover repositories in subdirectories of repos/ or only top-level? How deep should discovery scan?

### Investigation

**Examined User Scenarios**:
- **Flat structure**: `repos/app/`, `repos/api/`, `repos/lib/` (most common)
- **Grouped structure**: `repos/frontend/app/`, `repos/backend/api/` (medium complexity)
- **Deep nesting**: `repos/team1/project1/service1/` (rare, but exists)

**Existing Implementation**:
- `core/repository.ts` already has `discoverRepositories()` function
- Default `maxDepth: 3` supports grouped structures
- Handles symlinks, exclusion patterns, error collection

### Decision

**Reuse existing discovery with defaults**:

```typescript
// In init command
const discoveryResult = await discoverRepositories(reposDir, {
  maxDepth: 3,            // Support grouped structures
  followSymlinks: false,  // Security: avoid loops
  excludePatterns: [      // Skip common non-repo dirs
    'node_modules',
    '.git',
    'dist',
    'build',
  ],
});
```

**Discovery Configuration**:
- **maxDepth: 3**: Covers flat and grouped structures without scanning too deep
- **followSymlinks: false**: Prevents infinite loops, security concern
- **Exclude patterns**: Standard directories that are never repositories

### Rationale

- **Code reuse**: Battle-tested logic already exists in `core/repository.ts`
- **Consistency**: Same discovery used by other commands (e.g., validation)
- **Flexibility**: maxDepth=3 handles 95% of real-world structures
- **Performance**: Exclusion patterns skip large non-repo directories

### Alternatives Considered

| Alternative | Reason for Rejection |
|------------|---------------------|
| Top-level only (maxDepth=1) | Too restrictive; breaks grouped structures |
| Unlimited depth | Performance risk; scans unintended directories |
| Custom discovery implementation | Code duplication; testing burden |
| Config-based depth | Over-engineering for edge case |

---

## R5: Git Repository Validation

### Question
What's the most reliable way to verify we're in a git repository before running init?

### Investigation

**Methods Evaluated**:

1. **Check .git existence**:
   ```typescript
   await fileExists('.git')
   ```
   - ✅ Fast
   - ❌ False positive: `.git` might be a file (submodule) not directory
   - ❌ Doesn't verify git is working

2. **git rev-parse --git-dir**:
   ```typescript
   await git.exec(['rev-parse', '--git-dir'], '.')
   ```
   - ✅ Reliable: validates git repository
   - ✅ Works for submodules, worktrees
   - ✅ Confirms git is installed and working
   - ❌ Slightly slower (spawns process)

3. **git status**:
   ```typescript
   await git.exec(['status'], '.')
   ```
   - ✅ Comprehensive validation
   - ❌ Slower: reads index, checks working tree
   - ❌ Fails in bare repos (edge case)

### Decision

**Use git rev-parse --git-dir**:

```typescript
async function isGitRepository(path: string): Promise<boolean> {
  try {
    await git.exec(['rev-parse', '--git-dir'], path);
    return true;
  } catch (error) {
    return false;
  }
}
```

**Validation Flow**:
1. Run git rev-parse at start of init command
2. If succeeds → Proceed with initialization
3. If fails → Display error: "Not a git repository. Run 'git init' first."

### Rationale

- **Reliability**: Official git method for repository detection
- **Completeness**: Works for normal repos, submodules, worktrees
- **Error clarity**: Git's error message is descriptive
- **Performance**: Fast enough for init command (one-time operation)

### Alternatives Considered

| Alternative | Reason for Rejection |
|------------|---------------------|
| Check .git existence | False positives with submodules |
| git status | Overkill; slower; fails in bare repos |
| Read .git/config | Fragile; doesn't work for submodules |
| Multiple checks | Over-engineering; adds latency |

---

## Summary of Decisions

| Topic | Decision | Impact |
|-------|----------|--------|
| **Hook Templates** | 3 example files (.example suffix) with comments | Creates `.arashi/hooks/` directory with pre-create, post-create, setup examples |
| **.gitignore Updates** | Idempotent append with exact match check | Safe repeated init; respects user config; uses `writeTextFile()` utility |
| **Rollback Strategy** | Track operations, reverse on error (LIFO) | Implements Constitution Principle III; uses `removeDir()` utility |
| **Repository Discovery** | Reuse `discoverRepositories()` with maxDepth=3 | Leverages existing code; handles flat and grouped structures |
| **Git Validation** | Use `git rev-parse --git-dir` | Reliable detection; works for all repo types; uses existing `git.exec()` |

---

## Dependencies Confirmed

All required utilities **already exist** in the codebase:

- ✅ `lib/config.ts`: Config generation, validation, persistence
- ✅ `lib/filesystem.ts`: Directory ops, file I/O, exists checks
- ✅ `lib/git.ts`: Git command execution
- ✅ `lib/logger.ts`: Spinners, success/error display
- ✅ `core/repository.ts`: Repository discovery with options

**No new dependencies required** - init command composes existing utilities.

---

## Next Steps

1. ✅ Research complete - all questions resolved
2. → Proceed to **Phase 1: Design & Contracts**
3. → Create `data-model.md` (InitOptions, InitResult, HookTemplate schemas)
4. → Create `contracts/` (command interface, exit codes)
5. → Create `quickstart.md` (user-facing init guide)
