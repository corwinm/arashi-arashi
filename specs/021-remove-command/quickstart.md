# Developer Quickstart: Implementing Remove Command

**Feature**: 021-remove-command  
**Date**: 2026-02-07  
**Audience**: Developers implementing the remove command

## Purpose

This guide provides a step-by-step walkthrough for implementing the Remove Command in the arashi codebase. It assumes familiarity with TypeScript, Bun, and git concepts, but explains arashi-specific patterns and utilities.

---

## Prerequisites

### Development Environment

```bash
# Clone the repository
git clone https://github.com/corwinm/arashi.git
cd arashi

# Install dependencies
bun install

# Run tests
bun test

# Run linting
bun run lint

# Build the project
bun run build
```

### Recommended Reading

Before starting, review:
1. [Constitution](../.specify/memory/constitution.md) - Core principles and standards
2. [Specification](./spec.md) - Feature requirements and user stories
3. [Implementation Plan](./plan.md) - Technical context and design decisions
4. [Research](./research.md) - Git patterns and best practices
5. [Data Model](./data-model.md) - Entity definitions
6. [Command Contract](./contracts/command-interface.md) - API specification

---

## Arashi Architecture Overview

### Project Structure

```
repos/arashi/
├── src/
│   ├── commands/        # CLI command implementations
│   │   ├── add.ts       # Example: Add repository command
│   │   ├── create.ts    # Example: Create worktree command
│   │   └── remove.ts    # ← YOU WILL CREATE THIS
│   ├── core/            # Core business logic
│   │   ├── worktree.ts  # Worktree orchestration
│   │   ├── rollback.ts  # Rollback mechanism
│   │   └── list.ts      # Worktree discovery
│   ├── lib/             # Utility libraries
│   │   ├── git.ts       # Git command wrapper
│   │   ├── config.ts    # Configuration management
│   │   ├── logger.ts    # Logging and UI
│   │   ├── prompts.ts   # User prompts
│   │   └── errors.ts    # Error types
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main entry point (register commands)
└── tests/
    ├── integration/     # End-to-end command tests
    └── unit/            # Unit tests for utilities
```

### Key Design Patterns

1. **Command Pattern:** Each command is a self-contained module with `createCommand()` export
2. **Separation of Concerns:** Commands orchestrate, core modules handle logic, lib modules provide utilities
3. **Error Handling:** Custom error classes with context, rollback on failure
4. **User Experience:** Spinners for long operations, colored output, clear error messages
5. **Testing:** Integration tests for commands, unit tests for utilities

---

## Step-by-Step Implementation

### Phase 1: Create Command File

Create `src/commands/remove.ts`:

```typescript
/**
 * Remove Command
 * 
 * Removes worktrees and deletes branches across multiple repositories.
 * Supports confirmation prompts, dirty checks, and selective removal.
 * 
 * @module commands/remove
 */

import { Command } from 'commander';
import { confirm, checkbox } from '@inquirer/prompts';
import * as logger from '../lib/logger.ts';
import * as config from '../lib/config.ts';
import * as git from '../lib/git.ts';
import { RemoveCommandError, RemoveCommandErrorCode } from '../lib/errors.ts';

// TODO: Define interfaces (see Phase 2)
// TODO: Implement helper functions (see Phase 3)
// TODO: Implement main execution logic (see Phase 4)
// TODO: Export createCommand() (see Phase 5)

export function createCommand(): Command {
  const cmd = new Command('remove');
  
  cmd
    .description('Remove worktrees and delete branches')
    .argument('[branch]', 'Branch name to remove (optional - prompts if omitted)')
    .option('--no-check-dirty', 'Skip uncommitted changes check')
    .option('--keep-worktrees', 'Delete branches but keep worktree directories')
    .option('--keep-branches', 'Remove worktrees but keep git branches')
    .option('-f, --force', 'Skip confirmation prompts')
    .option('--json', 'Output results as JSON')
    .action(async (branch?: string, options = {}) => {
      try {
        await executeRemove(branch, options);
        process.exit(0);
      } catch (error) {
        handleError(error, options);
        process.exit(1);
      }
    });
  
  return cmd;
}
```

### Phase 2: Define TypeScript Interfaces

Add type definitions to `src/commands/remove.ts`:

```typescript
/**
 * Command-line options for remove command
 */
interface RemoveCommandOptions {
  checkDirty?: boolean;      // Auto-set by commander (--no-check-dirty)
  keepWorktrees?: boolean;
  keepBranches?: boolean;
  force?: boolean;
  json?: boolean;
}

/**
 * Worktree information for removal
 */
interface WorktreeInfo {
  path: string;
  branch: string;
  repository: string;
  isMain: boolean;
  isDirty?: boolean;
}

/**
 * Removal operation result
 */
interface RemovalOperation {
  type: 'worktree_remove' | 'branch_delete';
  repository: string;
  branchName: string;
  worktreePath?: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

/**
 * Summary of all removal operations
 */
interface RemovalSummary {
  totalWorktrees: number;
  successfulWorktrees: number;
  totalBranches: number;
  successfulBranches: number;
  operations: RemovalOperation[];
  errors: string[];
  duration: number;
}
```

### Phase 3: Implement Helper Functions

#### 3.1 Worktree Discovery

```typescript
/**
 * Discover all worktrees for a specific branch across repositories
 */
async function discoverWorktreesByBranch(
  branchName: string,
  repositories: config.Repository[]
): Promise<WorktreeInfo[]> {
  const allWorktrees: WorktreeInfo[] = [];
  
  for (const repo of repositories) {
    try {
      const result = await git.exec(['worktree', 'list', '--porcelain'], repo.path);
      const worktrees = parseWorktreeList(result.stdout, repo.name);
      
      // Filter for matching branch
      const matching = worktrees.filter(wt => 
        wt.branch === branchName && !wt.isMain
      );
      
      allWorktrees.push(...matching);
    } catch (error) {
      // Repository might not have any worktrees - skip
    }
  }
  
  return allWorktrees;
}

/**
 * Parse git worktree list --porcelain output
 */
function parseWorktreeList(output: string, repoName: string): WorktreeInfo[] {
  const worktrees: WorktreeInfo[] = [];
  const lines = output.trim().split('\n');
  let current: Partial<WorktreeInfo> = {};
  
  for (const line of lines) {
    if (line.startsWith('worktree ')) {
      if (current.path) {
        worktrees.push(current as WorktreeInfo);
      }
      current = { 
        path: line.substring(9),
        repository: repoName,
        isMain: false
      };
    } else if (line.startsWith('branch ')) {
      current.branch = line.substring(7).replace('refs/heads/', '');
    } else if (line.startsWith('bare')) {
      current.isMain = true;
    } else if (line === '') {
      // Empty line separates worktree entries
      if (current.path) {
        worktrees.push(current as WorktreeInfo);
        current = {};
      }
    }
  }
  
  // Don't forget the last entry
  if (current.path) {
    worktrees.push(current as WorktreeInfo);
  }
  
  return worktrees;
}
```

#### 3.2 Dirty Status Check

```typescript
/**
 * Check if a worktree has uncommitted changes
 */
async function checkDirtyStatus(worktree: WorktreeInfo): Promise<boolean> {
  try {
    const result = await git.exec(['status', '--porcelain'], worktree.path);
    return result.stdout.trim().length > 0;
  } catch (error) {
    // If status check fails, assume dirty for safety
    return true;
  }
}

/**
 * Check dirty status for all worktrees (parallelized)
 */
async function checkAllDirtyStatus(worktrees: WorktreeInfo[]): Promise<void> {
  const checks = worktrees.map(async (wt) => {
    wt.isDirty = await checkDirtyStatus(wt);
  });
  
  await Promise.all(checks);
}
```

#### 3.3 User Prompts

```typescript
/**
 * Prompt user to select branches for removal (multi-select)
 */
async function promptForBranches(worktrees: WorktreeInfo[]): Promise<string[]> {
  // Group by branch name
  const branchGroups = new Map<string, WorktreeInfo[]>();
  for (const wt of worktrees) {
    if (!branchGroups.has(wt.branch)) {
      branchGroups.set(wt.branch, []);
    }
    branchGroups.get(wt.branch)!.push(wt);
  }
  
  // Build choices
  const choices = Array.from(branchGroups.entries()).map(([branch, wts]) => {
    const hasDirty = wts.some(wt => wt.isDirty);
    const status = hasDirty ? logger.chalk.yellow('dirty') : logger.chalk.green('clean');
    return {
      name: `${branch} (${wts.length} ${wts.length === 1 ? 'repository' : 'repositories'}) - ${status}`,
      value: branch,
    };
  });
  
  if (choices.length === 0) {
    logger.warn('No worktrees found to remove');
    return [];
  }
  
  return await checkbox({
    message: 'Select worktrees to remove:',
    choices,
    pageSize: 15,
  });
}

/**
 * Prompt for confirmation before removal
 */
async function promptConfirmation(
  worktrees: WorktreeInfo[],
  hasDirty: boolean
): Promise<boolean> {
  if (hasDirty) {
    const dirtyWts = worktrees.filter(wt => wt.isDirty);
    logger.warn(`\nUncommitted changes detected in ${dirtyWts.length} ${dirtyWts.length === 1 ? 'worktree' : 'worktrees'}:\n`);
    for (const wt of dirtyWts) {
      console.log(`  • ${wt.repository}: ${wt.path}`);
    }
    console.log('');
    
    return await confirm({
      message: 'Are you sure you want to remove these worktrees? This will discard all uncommitted changes.',
      default: false,
    });
  } else {
    const branches = [...new Set(worktrees.map(wt => wt.branch))];
    return await confirm({
      message: `Remove ${worktrees.length} ${worktrees.length === 1 ? 'worktree' : 'worktrees'} and delete ${branches.length} ${branches.length === 1 ? 'branch' : 'branches'}?`,
      default: false,
    });
  }
}
```

#### 3.4 Removal Operations

```typescript
/**
 * Remove a single worktree
 */
async function removeWorktree(worktree: WorktreeInfo): Promise<void> {
  const args = ['worktree', 'remove', worktree.path];
  
  // Add force flag if worktree is dirty
  if (worktree.isDirty) {
    args.push('--force');
  }
  
  try {
    await git.exec(args, worktree.repository);
  } catch (error) {
    // If locked, try with double force
    if (error.message && error.message.includes('locked')) {
      await git.exec([...args, '--force'], worktree.repository);
    } else {
      throw error;
    }
  }
}

/**
 * Delete a git branch
 */
async function deleteBranch(repoPath: string, branchName: string): Promise<void> {
  await git.exec(['branch', '-D', branchName], repoPath);
}
```

### Phase 4: Implement Main Execution Logic

```typescript
/**
 * Main execution function for remove command
 */
async function executeRemove(
  branchArg: string | undefined,
  options: RemoveCommandOptions
): Promise<void> {
  const startTime = Date.now();
  
  // Step 1: Load configuration
  const workspaceRoot = process.cwd();
  const cfg = await config.loadConfig(workspaceRoot);
  
  // Step 2: Get repository list
  const repositories = Object.entries(cfg.discovered_repos).map(([name, repo]) => ({
    name,
    path: repo.path,
  }));
  
  if (repositories.length === 0) {
    throw new RemoveCommandError(
      'No repositories found in workspace',
      RemoveCommandErrorCode.NO_REPOSITORIES
    );
  }
  
  // Step 3: Determine target branches
  let targetBranches: string[];
  
  if (branchArg) {
    // Single branch specified
    targetBranches = [branchArg];
  } else {
    // Interactive mode: discover all worktrees and prompt
    logger.info('Discovering worktrees...');
    const allWorktrees: WorktreeInfo[] = [];
    
    for (const repo of repositories) {
      try {
        const result = await git.exec(['worktree', 'list', '--porcelain'], repo.path);
        const wts = parseWorktreeList(result.stdout, repo.name);
        allWorktrees.push(...wts.filter(wt => !wt.isMain));
      } catch (error) {
        // Skip repos with no worktrees
      }
    }
    
    targetBranches = await promptForBranches(allWorktrees);
    
    if (targetBranches.length === 0) {
      logger.info('No branches selected');
      return;
    }
  }
  
  // Step 4: Discover worktrees for target branches
  const worktreesToRemove: WorktreeInfo[] = [];
  
  for (const branch of targetBranches) {
    const worktrees = await discoverWorktreesByBranch(branch, repositories);
    worktreesToRemove.push(...worktrees);
  }
  
  if (worktreesToRemove.length === 0) {
    throw new RemoveCommandError(
      `No worktrees found for branch${targetBranches.length > 1 ? 'es' : ''}: ${targetBranches.join(', ')}`,
      RemoveCommandErrorCode.BRANCH_NOT_FOUND
    );
  }
  
  // Step 5: Check dirty status (unless skipped)
  if (options.checkDirty !== false) {
    const s = logger.spinner('Checking for uncommitted changes...').start();
    await checkAllDirtyStatus(worktreesToRemove);
    s.succeed('Dirty check complete');
  }
  
  // Step 6: Prompt for confirmation (unless --force)
  if (!options.force) {
    const hasDirty = worktreesToRemove.some(wt => wt.isDirty);
    const confirmed = await promptConfirmation(worktreesToRemove, hasDirty);
    
    if (!confirmed) {
      logger.info('Operation cancelled by user');
      return;
    }
  }
  
  // Step 7: Perform removals
  const summary: RemovalSummary = {
    totalWorktrees: options.keepWorktrees ? 0 : worktreesToRemove.length,
    successfulWorktrees: 0,
    totalBranches: options.keepBranches ? 0 : targetBranches.length * repositories.length,
    successfulBranches: 0,
    operations: [],
    errors: [],
    duration: 0,
  };
  
  // Remove worktrees (unless --keep-worktrees)
  if (!options.keepWorktrees) {
    for (const wt of worktreesToRemove) {
      const operation: RemovalOperation = {
        type: 'worktree_remove',
        repository: wt.repository,
        branchName: wt.branch,
        worktreePath: wt.path,
        status: 'pending',
      };
      
      try {
        await removeWorktree(wt);
        operation.status = 'success';
        summary.successfulWorktrees++;
      } catch (error) {
        operation.status = 'failed';
        operation.error = (error as Error).message;
        summary.errors.push(`${wt.repository}: ${operation.error}`);
      }
      
      summary.operations.push(operation);
    }
  }
  
  // Delete branches (unless --keep-branches)
  if (!options.keepBranches) {
    for (const branch of targetBranches) {
      for (const repo of repositories) {
        const operation: RemovalOperation = {
          type: 'branch_delete',
          repository: repo.name,
          branchName: branch,
          status: 'pending',
        };
        
        try {
          await deleteBranch(repo.path, branch);
          operation.status = 'success';
          summary.successfulBranches++;
        } catch (error) {
          // Branch might not exist in this repo - not an error
          operation.status = 'failed';
          operation.error = (error as Error).message;
        }
        
        summary.operations.push(operation);
      }
    }
  }
  
  // Step 8: Display results
  summary.duration = Date.now() - startTime;
  
  if (options.json) {
    console.log(JSON.stringify({
      success: summary.errors.length === 0,
      summary,
    }, null, 2));
  } else {
    displaySummary(summary);
  }
  
  // Exit with error if any operations failed
  if (summary.errors.length > 0) {
    throw new Error('Some operations failed');
  }
}
```

### Phase 5: Output Formatting

```typescript
/**
 * Display removal summary in human-readable format
 */
function displaySummary(summary: RemovalSummary): void {
  if (summary.errors.length === 0) {
    logger.success(`\nSuccessfully removed ${summary.successfulWorktrees} worktrees and deleted ${summary.successfulBranches} branches\n`);
  } else {
    logger.error(`\nPartial removal completed with ${summary.errors.length} errors\n`);
  }
  
  // Show successful worktree removals
  if (summary.successfulWorktrees > 0) {
    console.log('Removed worktrees:');
    for (const op of summary.operations) {
      if (op.type === 'worktree_remove' && op.status === 'success') {
        console.log(`  • ${op.repository}: ${op.worktreePath}`);
      }
    }
    console.log('');
  }
  
  // Show successful branch deletions
  if (summary.successfulBranches > 0) {
    console.log('Deleted branches:');
    for (const op of summary.operations) {
      if (op.type === 'branch_delete' && op.status === 'success') {
        console.log(`  • ${op.repository}: ${op.branchName}`);
      }
    }
    console.log('');
  }
  
  // Show errors
  if (summary.errors.length > 0) {
    logger.warn('Errors:');
    for (const error of summary.errors) {
      console.log(`  • ${error}`);
    }
    console.log('');
  }
  
  console.log(`Total duration: ${(summary.duration / 1000).toFixed(2)}s`);
}
```

### Phase 6: Error Handling

```typescript
/**
 * Handle errors and display appropriate messages
 */
function handleError(error: unknown, options: RemoveCommandOptions): void {
  if (error instanceof RemoveCommandError) {
    if (options.json) {
      console.log(JSON.stringify({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          context: error.context,
        },
      }, null, 2));
    } else {
      logger.error(`\n✗ ${error.message}\n`);
      
      // Provide helpful hints based on error code
      if (error.code === RemoveCommandErrorCode.BRANCH_NOT_FOUND) {
        logger.info('Hint: Run "arashi list" to see all worktrees');
      }
    }
  } else if (error instanceof Error) {
    if (options.json) {
      console.log(JSON.stringify({
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message,
        },
      }, null, 2));
    } else {
      logger.error(`\nUnexpected error: ${error.message}`);
    }
  }
}
```

### Phase 7: Add Error Types

Add to `src/lib/errors.ts`:

```typescript
export enum RemoveCommandErrorCode {
  NO_REPOSITORIES = 'NO_REPOSITORIES',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  WORKTREE_LOCKED = 'WORKTREE_LOCKED',
  WORKTREE_IN_USE = 'WORKTREE_IN_USE',
  CONFIG_ERROR = 'CONFIG_ERROR',
}

export class RemoveCommandError extends ArashiError {
  constructor(
    message: string,
    public readonly code: RemoveCommandErrorCode,
    public readonly context?: Record<string, any>
  ) {
    super(message, context);
    this.name = 'RemoveCommandError';
  }
}
```

### Phase 8: Register Command

Update `src/index.ts`:

```typescript
import { createCommand as createRemoveCommand } from './commands/remove.ts';

// ... existing imports ...

program
  .name('arashi')
  .description('Git worktree manager for meta-repositories')
  .version('1.1.3');

// ... existing commands ...

// Register remove command
program.addCommand(createRemoveCommand());

program.parse();
```

---

## Testing Strategy

### Integration Tests

Create `tests/integration/remove.test.ts`:

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { setupTestWorkspace, cleanupTestWorkspace } from '../helpers/workspace.ts';

describe('Remove Command', () => {
  let workspacePath: string;
  
  beforeEach(async () => {
    workspacePath = await setupTestWorkspace();
  });
  
  afterEach(async () => {
    await cleanupTestWorkspace(workspacePath);
  });
  
  test('removes single branch with worktrees', async () => {
    // TODO: Create test worktrees
    // TODO: Run remove command
    // TODO: Verify worktrees are removed
    // TODO: Verify branches are deleted
  });
  
  test('prompts for confirmation when worktree is dirty', async () => {
    // TODO: Create dirty worktree
    // TODO: Run remove command
    // TODO: Verify prompt appears
  });
  
  test('supports --keep-worktrees flag', async () => {
    // TODO: Test selective removal
  });
  
  // Add more tests for each user story
});
```

### Unit Tests

Create `tests/unit/remove.test.ts`:

```typescript
import { describe, test, expect } from 'bun:test';

describe('parseWorktreeList', () => {
  test('parses porcelain output correctly', () => {
    const output = `worktree /path/to/main
HEAD abc123
branch refs/heads/main

worktree /path/to/feature
HEAD def456
branch refs/heads/feature-branch
`;
    
    const worktrees = parseWorktreeList(output, 'test-repo');
    
    expect(worktrees).toHaveLength(2);
    expect(worktrees[0].branch).toBe('main');
    expect(worktrees[1].branch).toBe('feature-branch');
  });
});

// Add more unit tests for helper functions
```

---

## Common Pitfalls

### 1. Forgetting to Handle Missing Branches

**Problem:** Throwing error when branch doesn't exist in a repository.

**Solution:** Branch absence in some repos is normal - continue with repos that have it.

### 2. Not Checking for Main Worktree

**Problem:** Attempting to remove the main worktree (will fail).

**Solution:** Filter out `isMain=true` worktrees during discovery.

### 3. Ignoring Dirty Status

**Problem:** Removing worktrees without warning about data loss.

**Solution:** Always check dirty status unless explicitly skipped, and require confirmation.

### 4. Sequential Operations Too Slow

**Problem:** Checking dirty status sequentially takes too long.

**Solution:** Use `Promise.all()` to parallelize independent operations.

### 5. Poor Error Messages

**Problem:** Generic "operation failed" messages don't help users.

**Solution:** Provide specific error codes and helpful hints for each error type.

---

## Next Steps

After implementing the remove command:

1. **Run Tests:** `bun test tests/integration/remove.test.ts`
2. **Manual Testing:** Test all user stories from spec.md
3. **Linting:** `bun run lint` - fix any TypeScript errors
4. **Code Review:** Follow Constitution Principle VII (test coverage >80%)
5. **Documentation:** Update user-facing docs if needed

---

## Additional Resources

- [Commander.js Documentation](https://github.com/tj/commander.js) - CLI framework
- [@inquirer/prompts Documentation](https://github.com/SBoudrias/Inquirer.js/tree/main/packages/prompts) - Interactive prompts
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) - Git commands
- [Bun Test Runner](https://bun.sh/docs/cli/test) - Testing framework

---

## Getting Help

If you encounter issues:

1. Check existing commands (`add.ts`, `create.ts`) for reference implementations
2. Review research.md for git command patterns
3. Consult data-model.md for entity relationships
4. Ask in the team chat or open a GitHub discussion
