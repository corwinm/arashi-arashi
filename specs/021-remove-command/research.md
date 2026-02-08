# Research: Remove Command

**Feature**: 021-remove-command  
**Date**: 2026-02-07  
**Status**: Complete

## Purpose

This document consolidates research findings for implementing the Remove Command feature. All NEEDS CLARIFICATION items from the Technical Context have been resolved through investigation of git documentation, existing arashi codebase patterns, and @inquirer/prompts API.

---

## 1. Git Worktree Removal Patterns

### Decision

Use `git worktree remove <path>` as the primary removal method, with `--force` flag support for locked or dirty worktrees.

### Rationale

**Best Practice:**
- `git worktree remove` is the official, safe method that properly cleans up both the filesystem and git metadata
- It prevents accidental data loss by refusing to remove worktrees with uncommitted changes (unless `--force` is used)
- It automatically handles administrative files in `.git/worktrees/` directory

**Safety Features:**
- Without `--force`: Refuses to remove worktrees with:
  - Uncommitted changes (modified tracked files)
  - Untracked files
  - Staged changes
- With `--force`: Overrides safety checks and removes worktree regardless of state
- With `--force --force` (double force): Removes even locked worktrees

**Fallback Behavior:**
- If `git worktree remove` fails, can use `git worktree prune` to clean up stale metadata after manual deletion
- Manual `rm -rf` should be avoided as it leaves `.git/worktrees/` in inconsistent state

### Implementation Approach

```typescript
// Primary method: Use git worktree remove
async function removeWorktree(path: string, force: boolean): Promise<void> {
  const args = ['worktree', 'remove', path];
  if (force) {
    args.push('--force');
  }
  
  try {
    await git.exec(args, repoPath);
  } catch (error) {
    if (error.message.includes('locked')) {
      // Retry with double force if locked
      await git.exec([...args, '--force'], repoPath);
    } else {
      throw error;
    }
  }
}
```

### References

- Git Official Documentation: `git worktree remove` only removes clean worktrees by default
- Stack Overflow: Multiple sources confirm `--force` flag bypasses safety checks
- Dev.to: "It won't let you remove if you have changes" - confirms protection mechanism

---

## 2. Git Branch Deletion Best Practices

### Decision

Use `git branch -D <branch>` (force delete) for worktree cleanup, with optional pre-check for merged status.

### Rationale

**Safe vs Force Delete:**
- `git branch -d <branch>`: Safe delete - only removes fully merged branches
- `git branch -D <branch>`: Force delete - removes branch regardless of merge status

**Why Force Delete is Appropriate:**
- User is explicitly requesting removal via `arashi remove` command
- Confirmation prompts already provide safety net
- Feature branches often aren't merged when removed (rebased, squashed, or abandoned)
- Checking merge status adds complexity and may prevent legitimate removals

**Merged Branch Check (Optional Enhancement):**
```bash
# Check if branch is merged into current branch
git branch --merged | grep "^  branchname$"

# Check if branch is merged into specific branch
git branch --merged main | grep "^  branchname$"
```

### Implementation Approach

```typescript
// Direct force delete (recommended)
async function deleteBranch(repoPath: string, branchName: string): Promise<void> {
  await git.exec(['branch', '-D', branchName], repoPath);
}

// Optional: Check merge status first (for future enhancement)
async function isBranchMerged(repoPath: string, branchName: string, baseBranch: string): Promise<boolean> {
  try {
    const result = await git.exec(['branch', '--merged', baseBranch], repoPath);
    const branches = result.stdout.split('\n').map(b => b.trim());
    return branches.some(b => b === branchName || b === `* ${branchName}`);
  } catch {
    return false;
  }
}
```

### Edge Cases

1. **Currently checked out branch**: Git prevents deletion - must checkout different branch first
2. **Remote tracking branches**: Should be deleted separately with `git push origin --delete <branch>` (future enhancement)
3. **Branch doesn't exist**: `git branch -D` fails gracefully with clear error message

### References

- Git Documentation: `git branch -d` vs `git branch -D` behavior
- Multiple Stack Overflow answers: Recommended pattern for cleanup scripts
- Graphite/DataCamp guides: Safe delete (`-d`) for merged branches, force (`-D`) for cleanup

---

## 3. Multi-Select Interactive Prompt Implementation

### Decision

Use `@inquirer/prompts` checkbox API for multi-select worktree selection.

### Rationale

**Why @inquirer/prompts:**
- Already included in arashi's dependencies (package.json: `@inquirer/prompts: ^7.2.0`)
- Modern, actively maintained (@inquirer organization)
- Provides standalone `checkbox` prompt for multi-select
- Consistent with existing arashi prompt usage (confirm, select, input)

**Checkbox API Features:**
- Space bar to select/deselect individual items
- `a` key to toggle all items
- `i` key to invert selection
- Arrow keys for navigation
- Enter to confirm selection
- Returns array of selected values

### Implementation Approach

```typescript
import { checkbox } from '@inquirer/prompts';

interface WorktreeChoice {
  name: string;      // Display text (formatted with branch, path, status)
  value: string;     // Branch name to remove
  checked?: boolean; // Pre-selected (optional)
  disabled?: boolean | string; // Disable with optional reason
}

async function promptForWorktrees(worktrees: Worktree[]): Promise<string[]> {
  const choices: WorktreeChoice[] = worktrees.map(wt => ({
    name: formatWorktreeDisplay(wt),  // e.g., "feature-auth (repos/main/feature-auth) - clean"
    value: wt.branch,
    checked: false,
    disabled: wt.isMain ? 'Cannot remove main worktree' : false,
  }));

  const selectedBranches = await checkbox({
    message: 'Select worktrees to remove:',
    choices,
    pageSize: 15,
    loop: true,
  });

  return selectedBranches;
}

function formatWorktreeDisplay(wt: Worktree): string {
  const status = wt.isDirty ? chalk.yellow('dirty') : chalk.green('clean');
  return `${wt.branch} (${wt.path}) - ${status}`;
}
```

### User Experience

```
? Select worktrees to remove: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ feature-login (worktrees/feature-login) - clean
 ◯ feature-auth (worktrees/feature-auth) - dirty
 ◉ bugfix-123 (worktrees/bugfix-123) - clean
 ◯ refactor-api (worktrees/refactor-api) - clean
```

### References

- NPM @inquirer/prompts: Official documentation with checkbox examples
- @inquirer/checkbox package: Detailed API reference
- inquirer-ordered-checkbox: Alternative with ordering (not needed for this feature)

---

## 4. Dirty Worktree Detection

### Decision

Use `git status --porcelain` to detect uncommitted changes. Worktree is "dirty" if output is non-empty.

### Rationale

**Why --porcelain:**
- Machine-readable format (stable across git versions)
- Returns empty string if working directory is clean
- Returns status codes for all changes (modified, untracked, staged)
- Already used in existing arashi codebase (`src/lib/git.ts`)

**What Constitutes "Dirty":**
Based on spec requirement (FR-003) and git documentation:
- Modified tracked files (staged or unstaged)
- Untracked files
- Deleted files (staged or unstaged)
- Staged changes not yet committed

**Empty output = Clean worktree**

### Implementation Approach

```typescript
// Existing pattern from src/lib/git.ts (lines 247-275)
async function isDirty(worktreePath: string): Promise<boolean> {
  try {
    const result = await git.exec(['status', '--porcelain'], worktreePath);
    return result.stdout.trim().length > 0;
  } catch (error) {
    // If git status fails, assume dirty for safety
    return true;
  }
}

// Enhanced version with details (for verbose output)
interface DirtyStatus {
  isDirty: boolean;
  modifiedFiles: number;
  untrackedFiles: number;
  stagedFiles: number;
}

async function getDirtyStatus(worktreePath: string): Promise<DirtyStatus> {
  try {
    const result = await git.exec(['status', '--porcelain'], worktreePath);
    const lines = result.stdout.trim().split('\n').filter(l => l.length > 0);
    
    return {
      isDirty: lines.length > 0,
      modifiedFiles: lines.filter(l => l.startsWith(' M') || l.startsWith('M ')).length,
      untrackedFiles: lines.filter(l => l.startsWith('??')).length,
      stagedFiles: lines.filter(l => l[0] !== ' ' && l[0] !== '?').length,
    };
  } catch {
    return { isDirty: true, modifiedFiles: 0, untrackedFiles: 0, stagedFiles: 0 };
  }
}
```

### Performance Considerations

- For 5-10 repositories: Sequential checks acceptable (< 5 seconds)
- Can be parallelized using `Promise.all()` for better performance
- Skip check when `--no-check-dirty` flag is provided

### References

- Git Documentation: `git status --porcelain` format specification
- Existing arashi code: `src/lib/git.ts` lines 247-275 implements this pattern
- Multiple dev guides: Consistent recommendation for porcelain format in scripts

---

## 5. Partial Failure Handling & Rollback

### Decision

Implement operation tracking with reverse-order rollback, following the pattern established in `add.ts` command.

### Rationale

**Existing Pattern (from add.ts lines 74-86, 441-458):**
```typescript
interface RollbackOperation {
  type: 'clone' | 'config_update' | 'setup_script_create';
  path: string;
  reversible: boolean;
  metadata?: Record<string, any>;
}

// Track operations
const operations: RollbackOperation[] = [];

// On error, rollback in reverse order
for (const op of operations.reverse()) {
  if (op.type === 'clone') {
    await Bun.$`rm -rf ${op.path}`;
  }
}
```

**Why This Pattern Works:**
- Simple array tracking with clear operation types
- Reverse order ensures dependencies are respected
- Graceful degradation (logs warnings if rollback fails)
- User gets clear error message with manual cleanup instructions

### Implementation Approach for Remove Command

```typescript
interface RemovalOperation {
  type: 'worktree_remove' | 'branch_delete';
  repository: string;
  branchName: string;
  worktreePath?: string;
  reversible: boolean;  // Always false for remove operations
}

async function removeWorktreesWithRollback(
  branchName: string,
  repositories: Repository[]
): Promise<RemovalSummary> {
  const operations: RemovalOperation[] = [];
  const errors: string[] = [];
  
  try {
    // Phase 1: Remove worktrees
    for (const repo of repositories) {
      try {
        await removeWorktree(repo, branchName);
        operations.push({
          type: 'worktree_remove',
          repository: repo.name,
          branchName,
          worktreePath: getWorktreePath(repo, branchName),
          reversible: false,
        });
      } catch (error) {
        errors.push(`${repo.name}: ${error.message}`);
        // Continue with other repositories (FR-015)
      }
    }
    
    // Phase 2: Delete branches
    for (const repo of repositories) {
      try {
        await deleteBranch(repo, branchName);
        operations.push({
          type: 'branch_delete',
          repository: repo.name,
          branchName,
          reversible: false,
        });
      } catch (error) {
        errors.push(`${repo.name}: ${error.message}`);
        // Continue with other repositories
      }
    }
    
    return {
      success: errors.length === 0,
      operations,
      errors,
    };
  } catch (fatalError) {
    // For remove command, rollback means reporting what was done
    // (can't restore deleted worktrees/branches)
    logger.warn('Partial removal completed. Some operations succeeded:');
    for (const op of operations) {
      logger.info(`  ✓ ${op.repository}: ${op.type} completed`);
    }
    throw fatalError;
  }
}
```

**Key Differences from Add Command:**
- Remove operations are **not reversible** (can't restore deleted worktrees/branches)
- Rollback means "report what was partially completed" rather than "undo operations"
- Continue on failure (FR-015) to remove as much as possible
- Final summary shows successes and failures

### References

- Existing code: `src/commands/add.ts` lines 74-86 (RollbackOperation interface)
- Existing code: `src/commands/add.ts` lines 441-458 (rollback implementation)
- Constitution Principle III: Error Recovery & Rollback

---

## 6. Worktree Discovery Across Multiple Repositories

### Decision

Use `git worktree list --porcelain` to discover worktrees in each repository, filtering by branch name.

### Rationale

**Git Worktree List Format:**
```bash
$ git worktree list --porcelain
worktree /path/to/main
HEAD abc123...
branch refs/heads/main

worktree /path/to/feature-branch
HEAD def456...
branch refs/heads/feature-branch
```

**Benefits of --porcelain:**
- Machine-readable format (stable across versions)
- Provides worktree path, HEAD commit, and branch reference
- Easy to parse with regex or line-by-line processing
- Already used in arashi codebase

**Existing Pattern (from src/core/list.ts):**
The list command already implements worktree discovery across repositories. We can reuse this logic.

### Implementation Approach

```typescript
interface WorktreeInfo {
  path: string;
  branch: string;
  isMain: boolean;
  repository: string;
}

async function discoverWorktreesByBranch(
  branchName: string,
  repositories: Repository[]
): Promise<WorktreeInfo[]> {
  const allWorktrees: WorktreeInfo[] = [];
  
  for (const repo of repositories) {
    try {
      const result = await git.exec(['worktree', 'list', '--porcelain'], repo.path);
      const worktrees = parseWorktreeList(result.stdout);
      
      // Filter worktrees matching the branch name
      const matching = worktrees.filter(wt => wt.branch === branchName);
      
      for (const wt of matching) {
        allWorktrees.push({
          ...wt,
          repository: repo.name,
        });
      }
    } catch (error) {
      // Repository has no worktrees or git command failed
      // Continue with next repository
    }
  }
  
  return allWorktrees;
}

function parseWorktreeList(porcelainOutput: string): Worktree[] {
  const worktrees: Worktree[] = [];
  const lines = porcelainOutput.trim().split('\n');
  
  let currentWorktree: Partial<Worktree> = {};
  
  for (const line of lines) {
    if (line.startsWith('worktree ')) {
      if (currentWorktree.path) {
        worktrees.push(currentWorktree as Worktree);
      }
      currentWorktree = { path: line.substring(9) };
    } else if (line.startsWith('branch ')) {
      const ref = line.substring(7);  // "branch refs/heads/feature"
      currentWorktree.branch = ref.replace('refs/heads/', '');
    } else if (line.startsWith('bare')) {
      currentWorktree.isMain = true;
    }
  }
  
  if (currentWorktree.path) {
    worktrees.push(currentWorktree as Worktree);
  }
  
  return worktrees;
}
```

### Discovery Strategy

1. **Load Configuration**: Get list of repositories from `.arashi/config.json`
2. **Query Each Repository**: Run `git worktree list --porcelain` in each repo
3. **Filter by Branch**: Match worktrees where branch equals target branch name
4. **Handle Missing Branches**: Some repos may not have the branch (normal case)
5. **Build Complete List**: Aggregate worktrees across all repositories

### Edge Cases

- **Branch doesn't exist in repository**: No worktrees found (normal)
- **Repository not found**: Skip and continue with other repos
- **Main worktree**: Should NOT be removed (filter out or disable in UI)
- **Multiple worktrees for same branch**: Possible with nested structures

### References

- Git Documentation: `git worktree list --porcelain` format
- Existing code: `src/core/list.ts` implements similar discovery logic
- Arashi patterns: Multi-repository coordination is core feature

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| **Worktree Removal** | `git worktree remove` with `--force` flag | Official safe method, prevents data loss |
| **Branch Deletion** | `git branch -D` (force delete) | User confirmation provides safety, avoids merge check complexity |
| **Multi-Select UI** | `@inquirer/prompts` checkbox | Already in dependencies, consistent with existing prompts |
| **Dirty Detection** | `git status --porcelain` | Machine-readable, already used in codebase |
| **Rollback** | Track operations, report partial completion | Remove operations not reversible, continue on failure |
| **Discovery** | `git worktree list --porcelain` per repo | Standard approach, existing patterns in list command |

---

## Alternatives Considered

### Worktree Removal
- ❌ **Direct filesystem deletion (`rm -rf`)**: Leaves `.git/worktrees/` in inconsistent state, requires manual `git worktree prune`
- ❌ **Always use double force**: Unnecessarily aggressive, single `--force` handles most cases

### Branch Deletion
- ❌ **Always check merge status (`git branch -d`)**: Prevents legitimate removals of unmerged branches (rebased, squashed)
- ❌ **Prompt per branch**: Too many confirmations for multi-branch removal

### Multi-Select UI
- ❌ **inquirer-checkbox-plus-prompt**: Adds dependency, search feature not needed
- ❌ **inquirer-ordered-checkbox**: Ordering not required for removal
- ❌ **Custom TUI with blessed**: Massive complexity increase

### Dirty Detection
- ❌ **Parse `git status --short`**: Less stable format, same information
- ❌ **Check specific file states**: Incomplete coverage, misses edge cases

---

## Implementation Notes

### Command Flow

1. Parse arguments and flags
2. Load configuration (`.arashi/config.json`)
3. If no branch argument: Prompt with multi-select list
4. Discover worktrees for specified branch(es) across all repositories
5. Check dirty status (unless `--no-check-dirty`)
6. Display summary and confirmation prompt
7. Remove worktrees (unless `--keep-worktrees`)
8. Delete branches (unless `--keep-branches`)
9. Display results with success/failure per repository

### Error Handling

- **Branch not found**: Clear error message, suggest `arashi list`
- **Partial failure**: Continue with remaining repos, report errors at end
- **Confirmation declined**: Exit cleanly with no changes
- **Locked worktree**: Retry with double `--force` if needed

### Testing Strategy

- **Unit tests**: Each function (discovery, removal, dirty check)
- **Integration tests**: Full command flows for each user story
- **Edge case tests**: Missing branches, locked worktrees, dirty states
- **Multi-repo tests**: Verify coordination across repositories

---

## Open Questions

None - all NEEDS CLARIFICATION items resolved.
