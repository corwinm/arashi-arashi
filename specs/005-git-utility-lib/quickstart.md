# Quickstart: Git Utility Library

**Feature**: 005-git-utility-lib  
**Audience**: Developers implementing features that use git operations

## Overview

The git utility library provides type-safe TypeScript wrappers around git commands for the Arashi worktree manager. It handles command execution, output parsing, error handling, and repository validation.

## Installation

The library is part of the Arashi monorepo. Import from `src/lib/git.ts`:

```typescript
import {
  isGitRepository,
  createWorktree,
  listWorktrees,
  removeWorktree,
  branchExists,
  createBranch,
  fetchLatest,
  getStatus,
  getCurrentBranch,
  getDefaultBranch,
} from './lib/git';
```

## Quick Examples

### Check if path is a repository

```typescript
import { isGitRepository, isGitBareRepo } from './lib/git';

const repoPath = '/path/to/repo';

if (isGitRepository(repoPath)) {
  console.log('Valid git repository');
  
  if (isGitBareRepo(repoPath)) {
    console.log('Bare repository detected');
  } else {
    console.log('Normal repository with working directory');
  }
} else {
  console.error('Not a git repository');
}
```

### Create and manage worktrees

```typescript
import { createWorktree, listWorktrees, removeWorktree } from './lib/git';

const repoPath = '/path/to/repo';
const worktreePath = '/path/to/worktree';
const branchName = 'feature-branch';

try {
  // Create a new worktree
  await createWorktree(repoPath, branchName, worktreePath);
  console.log(`Worktree created at ${worktreePath}`);
  
  // List all worktrees
  const worktrees = await listWorktrees(repoPath);
  worktrees.forEach(wt => {
    console.log(`${wt.path}: ${wt.branch || 'detached'} @ ${wt.commit.slice(0, 7)}`);
    if (wt.locked) {
      console.log(`  (locked: ${wt.lockReason})`);
    }
  });
  
  // Remove worktree when done
  await removeWorktree(worktreePath, false);
  console.log('Worktree removed');
} catch (error) {
  if (error instanceof ArashiError) {
    console.error(`Git operation failed: ${error.message}`);
    console.error(`Git output: ${error.context.stderr}`);
  }
}
```

### Manage branches

```typescript
import { branchExists, createBranch, deleteBranch } from './lib/git';

const repoPath = '/path/to/repo';
const branchName = 'new-feature';

try {
  // Check if branch exists
  if (await branchExists(repoPath, branchName)) {
    console.log('Branch already exists');
  } else {
    // Create new branch from main
    await createBranch(repoPath, branchName, 'main');
    console.log(`Branch ${branchName} created`);
  }
  
  // Later: delete branch (only if merged)
  await deleteBranch(repoPath, branchName, false);
  console.log('Branch deleted');
} catch (error) {
  if (error instanceof ArashiError) {
    if (error.code === 'NOT_MERGED') {
      console.error('Branch has unmerged changes');
      // Force delete if needed
      await deleteBranch(repoPath, branchName, true);
    }
  }
}
```

### Synchronize with remote

```typescript
import { fetchLatest, setUpstreamTracking } from './lib/git';

const repoPath = '/path/to/repo';
const branchName = 'feature';

try {
  // Fetch latest changes from origin
  await fetchLatest(repoPath, 'origin');
  console.log('Fetched latest changes');
  
  // Set up tracking relationship
  await setUpstreamTracking(repoPath, branchName, 'origin', branchName);
  console.log(`Branch ${branchName} now tracks origin/${branchName}`);
} catch (error) {
  if (error instanceof ArashiError) {
    if (error.code === 'NETWORK_ERROR') {
      console.error('Network connectivity issue');
    } else if (error.code === 'NOT_FOUND') {
      console.error('Remote or branch not found');
    }
  }
}
```

### Query repository state

```typescript
import { getCurrentBranch, getDefaultBranch, getStatus } from './lib/git';

const repoPath = '/path/to/repo';

try {
  // Get current branch
  const currentBranch = await getCurrentBranch(repoPath);
  console.log(`On branch: ${currentBranch}`);
  
  // Get default branch
  const defaultBranch = await getDefaultBranch(repoPath);
  console.log(`Default branch: ${defaultBranch}`);
  
  // Get working tree status
  const status = await getStatus(repoPath);
  
  const modified = status.filter(s => s.worktreeStatus === 'M');
  const untracked = status.filter(s => s.indexStatus === '?');
  
  console.log(`${modified.length} modified files`);
  console.log(`${untracked.length} untracked files`);
  
  if (status.length === 0) {
    console.log('Working tree clean');
  }
} catch (error) {
  if (error instanceof ArashiError) {
    console.error(`Failed to query repository: ${error.message}`);
  }
}
```

## Error Handling

All async functions throw `ArashiError` on failure. Always wrap in try-catch:

```typescript
import { ArashiError } from './lib/errors';

try {
  await someGitOperation();
} catch (error) {
  if (error instanceof ArashiError) {
    // Structured error with diagnostic context
    console.error(`Operation failed: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    console.error(`Git command: git ${error.context.args.join(' ')}`);
    console.error(`Git output: ${error.context.stderr}`);
    
    // Programmatic error handling
    switch (error.code) {
      case 'NOT_A_REPOSITORY':
        console.log('Initialize repository first');
        break;
      case 'ALREADY_EXISTS':
        console.log('Resource already exists');
        break;
      case 'NETWORK_ERROR':
        console.log('Check network connection');
        break;
      default:
        console.log('Unknown error');
    }
  } else {
    // Unexpected error
    throw error;
  }
}
```

## Performance Tips

1. **Repository detection is fast**: `isGitRepository()` uses file system checks, not git commands
2. **Parallel operations**: Run independent operations concurrently:
   ```typescript
   const [worktrees, status, branch] = await Promise.all([
     listWorktrees(repoPath),
     getStatus(repoPath),
     getCurrentBranch(repoPath),
   ]);
   ```
3. **Validate early**: Check repository exists before complex operations:
   ```typescript
   if (!isGitRepository(repoPath)) {
     throw new Error('Invalid repository');
   }
   ```

## Common Patterns

### Safe worktree creation with cleanup

```typescript
async function createWorktreeSafe(
  repoPath: string,
  branch: string,
  worktreePath: string
): Promise<void> {
  // Validate repository
  if (!isGitRepository(repoPath)) {
    throw new Error('Invalid repository');
  }
  
  // Create branch if needed
  if (!await branchExists(repoPath, branch)) {
    const defaultBranch = await getDefaultBranch(repoPath);
    await fetchLatest(repoPath);
    await createBranch(repoPath, branch, `origin/${defaultBranch}`);
  }
  
  // Create worktree with automatic cleanup on error
  try {
    await createWorktree(repoPath, branch, worktreePath);
  } catch (error) {
    // Clean up branch if we created it
    if (await branchExists(repoPath, branch)) {
      await deleteBranch(repoPath, branch, true);
    }
    throw error;
  }
}
```

### Check for uncommitted changes

```typescript
async function hasUncommittedChanges(repoPath: string): Promise<boolean> {
  const status = await getStatus(repoPath);
  return status.length > 0;
}

// Use before destructive operations
if (await hasUncommittedChanges(repoPath)) {
  console.warn('Warning: uncommitted changes detected');
  // Prompt user or abort
}
```

### Detect repository type and adapt behavior

```typescript
async function getRepositoryType(repoPath: string): Promise<'normal' | 'bare' | 'none'> {
  if (isGitBareRepo(repoPath)) return 'bare';
  if (isGitRepository(repoPath)) return 'normal';
  return 'none';
}

const type = await getRepositoryType(repoPath);
switch (type) {
  case 'bare':
    console.log('Bare repository - no working directory');
    // Skip status checks
    break;
  case 'normal':
    console.log('Normal repository');
    const status = await getStatus(repoPath);
    // Handle status
    break;
  case 'none':
    console.error('Not a repository');
    break;
}
```

## Testing

See `tests/unit/lib/git.test.ts` for comprehensive examples of:
- Creating temporary test repositories
- Testing success and failure scenarios
- Mocking git commands
- Testing cross-platform behavior

## API Reference

See `contracts/git-api.ts` for complete API documentation with:
- Type definitions
- Function signatures
- Parameter descriptions
- Return types
- Error conditions
- Usage examples

## Next Steps

After implementing this library:
1. Use it in CLI commands (create, remove, list)
2. Add progress indicators for long-running operations
3. Implement rollback logic using these primitives
4. Add hook system support (pre-create, post-create, setup)

## Support

For questions or issues with the git utility library:
- Review API contract: `contracts/git-api.ts`
- Check test examples: `tests/unit/lib/git.test.ts`
- Refer to research decisions: `research.md`
