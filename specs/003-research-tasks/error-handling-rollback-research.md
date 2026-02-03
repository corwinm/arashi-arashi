# Error Handling & Rollback Architecture

**Research Topic**: Transaction patterns, operation logging, and error recovery for multi-repository git operations  
**Created**: Tue Feb 03 2026  
**Status**: Complete

## Overview

When performing multi-step git operations across multiple repositories (such as creating worktrees, checking out branches, running setup scripts), ensuring atomicity and providing rollback capabilities is critical for data integrity. This document provides comprehensive patterns for implementing robust error handling and recovery mechanisms.

## 1. Transaction/Rollback Patterns

### 1.1 Core Pattern: Operation Log with Compensating Actions

The fundamental pattern for atomic multi-step operations is to maintain an **operation log** that tracks each completed step and pairs it with a **compensating action** (rollback function).

**Concept:**
```typescript
interface Operation {
  description: string;
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
}

interface OperationLog {
  operations: Operation[];
  completedSteps: number;
}
```

**Implementation Example:**

```typescript
class TransactionManager {
  private completedOperations: Array<() => Promise<void>> = [];
  private operationDescriptions: string[] = [];

  /**
   * Execute an operation and register its rollback function
   */
  async executeWithRollback(
    description: string,
    operation: () => Promise<void>,
    rollback: () => Promise<void>
  ): Promise<void> {
    try {
      await operation();
      this.completedOperations.push(rollback);
      this.operationDescriptions.push(description);
    } catch (error) {
      // Don't add to completed operations if it failed
      throw error;
    }
  }

  /**
   * Rollback all completed operations in reverse order
   */
  async rollback(): Promise<void> {
    const errors: Error[] = [];
    
    // Execute rollbacks in reverse order (LIFO)
    while (this.completedOperations.length > 0) {
      const rollbackFn = this.completedOperations.pop()!;
      const description = this.operationDescriptions.pop()!;
      
      try {
        console.error(`Rolling back: ${description}`);
        await rollbackFn();
      } catch (error) {
        // Continue rolling back even if one rollback fails
        errors.push(new Error(
          `Failed to rollback "${description}": ${error.message}`
        ));
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Rollback completed with ${errors.length} error(s)`
      );
    }
  }

  /**
   * Clear the operation log (call after successful commit)
   */
  clear(): void {
    this.completedOperations = [];
    this.operationDescriptions = [];
  }
}
```

**Usage Example:**

```typescript
async function createWorktreeForRepos(repos: string[]): Promise<void> {
  const txn = new TransactionManager();

  try {
    for (const repoPath of repos) {
      const worktreePath = `${repoPath}-feature`;
      
      // Step 1: Create directory
      await txn.executeWithRollback(
        `Create directory ${worktreePath}`,
        async () => {
          await fs.mkdir(worktreePath, { recursive: true });
        },
        async () => {
          await fs.rm(worktreePath, { recursive: true, force: true });
        }
      );

      // Step 2: Create git worktree
      await txn.executeWithRollback(
        `Create worktree at ${worktreePath}`,
        async () => {
          await execGit(['worktree', 'add', worktreePath, '-b', 'feature'], {
            cwd: repoPath
          });
        },
        async () => {
          await execGit(['worktree', 'remove', '--force', worktreePath], {
            cwd: repoPath
          });
        }
      );

      // Step 3: Run setup script (if exists)
      const setupScript = path.join(repoPath, '.arashi', 'setup.sh');
      if (await fileExists(setupScript)) {
        await txn.executeWithRollback(
          `Run setup script in ${worktreePath}`,
          async () => {
            await runSetupScript(setupScript, worktreePath);
          },
          async () => {
            // Cleanup may require running teardown script or manual cleanup
            const teardownScript = path.join(repoPath, '.arashi', 'teardown.sh');
            if (await fileExists(teardownScript)) {
              await runScript(teardownScript, worktreePath);
            }
          }
        );
      }
    }

    // Success - clear the operation log
    txn.clear();
    console.log('All worktrees created successfully');
  } catch (error) {
    console.error('Operation failed, rolling back...');
    await txn.rollback();
    throw error;
  }
}
```

**Best Practices:**

1. **Always execute rollbacks in reverse order (LIFO)**: The last operation completed should be rolled back first to maintain dependency ordering.

2. **Make rollback operations idempotent**: Rollback functions should safely handle the case where the state already matches the desired rollback state (e.g., directory already deleted).

3. **Continue rollback even if individual steps fail**: Use try-catch within the rollback loop to ensure all cleanup attempts are made, collecting errors for later reporting.

4. **Use descriptive operation names**: Operation descriptions help with debugging and user feedback during rollback.

5. **Clear the operation log on success**: Prevent accidental rollback of successful operations.

**Common Pitfalls:**

- **Not making rollbacks idempotent**: If a rollback is attempted twice (e.g., due to retry logic), it should not fail on the second attempt.

- **Rolling back in forward order**: This can cause dependency violations (e.g., trying to delete a directory before removing a worktree that references it).

- **Stopping rollback on first error**: This leaves the system in a partially cleaned-up state. Always attempt all rollbacks.

- **Not validating preconditions**: Check that operations can succeed before executing (e.g., check disk space before creating directories).

### 1.2 Pattern: Try-Commit-Rollback with Validation

For complex operations, separate validation from execution:

```typescript
interface ValidatedOperation<T> {
  validate(): Promise<ValidationResult>;
  execute(): Promise<T>;
  rollback(): Promise<void>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

async function executeTransaction<T>(
  operations: ValidatedOperation<T>[]
): Promise<T[]> {
  // Phase 1: Validate all operations
  const validationResults = await Promise.all(
    operations.map(op => op.validate())
  );

  const allErrors = validationResults.flatMap(r => r.errors);
  if (allErrors.length > 0) {
    throw new Error(`Validation failed:\n${allErrors.join('\n')}`);
  }

  // Phase 2: Execute operations with rollback capability
  const txn = new TransactionManager();
  const results: T[] = [];

  try {
    for (const operation of operations) {
      const result = await txn.executeWithRollback(
        operation.constructor.name,
        async () => {
          const r = await operation.execute();
          results.push(r);
        },
        operation.rollback.bind(operation)
      );
    }

    txn.clear();
    return results;
  } catch (error) {
    await txn.rollback();
    throw error;
  }
}
```

**Best Practice**: Fail fast during validation to avoid expensive partial execution and rollback.

### 1.3 Ensuring Atomicity

Git worktree operations are **not inherently atomic**. To achieve atomicity:

**Approach 1: Pre-flight Checks**

Validate all preconditions before starting any operations:

```typescript
async function validateWorktreeCreation(
  repoPath: string,
  worktreePath: string,
  branch: string
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Check repo exists and is a git repository
  if (!await isGitRepo(repoPath)) {
    errors.push(`${repoPath} is not a git repository`);
  }

  // Check branch is not already checked out
  const worktrees = await listWorktrees(repoPath);
  if (worktrees.some(w => w.branch === branch)) {
    errors.push(`Branch '${branch}' is already checked out in another worktree`);
  }

  // Check target path doesn't exist or is empty
  if (await fs.exists(worktreePath)) {
    const entries = await fs.readdir(worktreePath);
    if (entries.length > 0) {
      errors.push(`Path '${worktreePath}' already exists and is not empty`);
    }
  }

  // Check disk space (estimate based on repo size)
  const repoSize = await getDirectorySize(repoPath);
  const availableSpace = await getDiskSpace(path.dirname(worktreePath));
  if (availableSpace < repoSize * 1.5) {
    errors.push(`Insufficient disk space (need ~${repoSize * 1.5} bytes, have ${availableSpace})`);
  }

  // Check write permissions
  const parentDir = path.dirname(worktreePath);
  if (!await hasWritePermission(parentDir)) {
    errors.push(`No write permission in ${parentDir}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}
```

**Approach 2: Locking**

For concurrent access protection, use file-based locks:

```typescript
import { open } from 'node:fs/promises';

class FileLock {
  private fd: FileHandle | null = null;

  async acquire(lockPath: string, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        // Try to create exclusive lock file
        this.fd = await open(lockPath, 'wx');
        return; // Success
      } catch (error) {
        if (error.code === 'EEXIST') {
          // Lock file exists, wait and retry
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Failed to acquire lock on ${lockPath} within ${timeout}ms`);
  }

  async release(lockPath: string): Promise<void> {
    if (this.fd) {
      await this.fd.close();
      await fs.unlink(lockPath);
      this.fd = null;
    }
  }
}

async function withLock<T>(
  lockPath: string,
  operation: () => Promise<T>
): Promise<T> {
  const lock = new FileLock();
  
  try {
    await lock.acquire(lockPath);
    return await operation();
  } finally {
    await lock.release(lockPath);
  }
}

// Usage
await withLock('/tmp/arashi-operation.lock', async () => {
  await createWorktreeForRepos(repos);
});
```

**Best Practice for Atomicity:**

1. Validate all operations can succeed before executing any
2. Use locking for concurrent operation protection
3. Implement comprehensive rollback for inevitable failures
4. Consider two-phase commit for distributed operations

## 2. Operation Log Structure

### 2.1 Structured Operation Log

An operation log should track enough information to enable rollback and provide debugging context:

```typescript
interface OperationLogEntry {
  id: string;                    // Unique identifier
  timestamp: Date;               // When operation occurred
  type: OperationType;           // Type of operation
  description: string;           // Human-readable description
  state: 'pending' | 'completed' | 'failed' | 'rolled_back';
  metadata: OperationMetadata;   // Type-specific metadata
  error?: Error;                 // Error if failed
}

enum OperationType {
  CREATE_DIRECTORY = 'create_directory',
  CREATE_WORKTREE = 'create_worktree',
  CREATE_BRANCH = 'create_branch',
  RUN_SCRIPT = 'run_script',
  MODIFY_FILE = 'modify_file',
  GIT_COMMAND = 'git_command',
}

type OperationMetadata =
  | DirectoryMetadata
  | WorktreeMetadata
  | BranchMetadata
  | ScriptMetadata
  | FileMetadata
  | GitCommandMetadata;

interface DirectoryMetadata {
  type: 'directory';
  path: string;
  existedBefore: boolean;       // For idempotent rollback
  contentsBackup?: string;      // Optional backup path
}

interface WorktreeMetadata {
  type: 'worktree';
  repoPath: string;
  worktreePath: string;
  branch: string;
  wasNewBranch: boolean;        // For branch cleanup decision
}

interface BranchMetadata {
  type: 'branch';
  repoPath: string;
  branchName: string;
  startPoint: string;           // Commit/branch it was created from
  existedBefore: boolean;
}

interface ScriptMetadata {
  type: 'script';
  scriptPath: string;
  workingDirectory: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}

interface FileMetadata {
  type: 'file';
  path: string;
  backupPath?: string;          // Where original was backed up
  operation: 'create' | 'modify' | 'delete';
}

interface GitCommandMetadata {
  type: 'git_command';
  command: string[];
  cwd: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
}
```

### 2.2 Operation Log Manager

```typescript
class OperationLog {
  private entries: OperationLogEntry[] = [];
  private currentTxnId: string = crypto.randomUUID();

  /**
   * Add a new operation to the log
   */
  add(
    type: OperationType,
    description: string,
    metadata: OperationMetadata
  ): string {
    const entry: OperationLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      description,
      state: 'pending',
      metadata,
    };

    this.entries.push(entry);
    return entry.id;
  }

  /**
   * Mark operation as completed
   */
  markCompleted(id: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.state = 'completed';
    }
  }

  /**
   * Mark operation as failed
   */
  markFailed(id: string, error: Error): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.state = 'failed';
      entry.error = error;
    }
  }

  /**
   * Mark operation as rolled back
   */
  markRolledBack(id: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.state = 'rolled_back';
    }
  }

  /**
   * Get all completed operations in reverse order for rollback
   */
  getCompletedOperations(): OperationLogEntry[] {
    return this.entries
      .filter(e => e.state === 'completed')
      .reverse();
  }

  /**
   * Persist log to file for recovery
   */
  async persist(path: string): Promise<void> {
    const data = JSON.stringify({
      transactionId: this.currentTxnId,
      startTime: this.entries[0]?.timestamp,
      entries: this.entries,
    }, null, 2);
    
    await fs.writeFile(path, data, 'utf-8');
  }

  /**
   * Load log from file for recovery
   */
  static async load(path: string): Promise<OperationLog> {
    const data = await fs.readFile(path, 'utf-8');
    const parsed = JSON.parse(data);
    
    const log = new OperationLog();
    log.currentTxnId = parsed.transactionId;
    log.entries = parsed.entries.map(e => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }));
    
    return log;
  }

  /**
   * Export log as human-readable format
   */
  toString(): string {
    return this.entries
      .map(e => {
        const status = e.state === 'completed' ? '✓' : 
                      e.state === 'failed' ? '✗' : 
                      e.state === 'rolled_back' ? '⮌' : '○';
        return `[${status}] ${e.description} (${e.type})`;
      })
      .join('\n');
  }
}
```

**Usage Example:**

```typescript
async function createWorktreesWithLogging(
  repos: string[],
  branch: string
): Promise<void> {
  const log = new OperationLog();
  const logPath = '/tmp/arashi-operation.log';

  try {
    for (const repoPath of repos) {
      const worktreePath = `${repoPath}-${branch}`;

      // Create worktree
      const opId = log.add(
        OperationType.CREATE_WORKTREE,
        `Create worktree for ${repoPath}`,
        {
          type: 'worktree',
          repoPath,
          worktreePath,
          branch,
          wasNewBranch: true,
        }
      );

      try {
        await execGit(['worktree', 'add', '-b', branch, worktreePath], {
          cwd: repoPath
        });
        log.markCompleted(opId);
      } catch (error) {
        log.markFailed(opId, error);
        throw error;
      }
    }

    console.log('Operation completed successfully');
    console.log(log.toString());
  } catch (error) {
    // Persist log for debugging
    await log.persist(logPath);
    console.error(`Operation failed. Log saved to ${logPath}`);
    
    // Rollback
    await rollbackFromLog(log);
    throw error;
  }
}
```

**Best Practices:**

1. **Include enough metadata for rollback**: Each entry should contain all information needed to undo the operation without additional lookups.

2. **Persist logs for crash recovery**: Write the log to disk periodically so interrupted operations can be recovered after crash/kill.

3. **Use structured metadata types**: Strong typing prevents errors in rollback logic and makes code more maintainable.

4. **Track operation dependencies**: Consider adding a `dependsOn` field to entries to enforce rollback ordering.

5. **Implement log rotation**: For long-running services, implement log cleanup to prevent unbounded growth.

## 3. Rollback Strategies

### 3.1 Rollback Strategy by Operation Type

Each operation type requires a specific rollback approach:

#### 3.1.1 Worktree Created

```typescript
async function rollbackWorktreeCreation(
  metadata: WorktreeMetadata
): Promise<void> {
  const { repoPath, worktreePath, branch, wasNewBranch } = metadata;

  try {
    // Step 1: Remove worktree (use --force to handle uncommitted changes)
    await execGit(['worktree', 'remove', '--force', worktreePath], {
      cwd: repoPath
    });
  } catch (error) {
    // If worktree doesn't exist, that's fine (already rolled back)
    if (!error.message.includes('not a working tree')) {
      throw error;
    }
  }

  // Step 2: Delete branch if we created it
  if (wasNewBranch) {
    try {
      await execGit(['branch', '-D', branch], {
        cwd: repoPath
      });
    } catch (error) {
      // If branch doesn't exist or is checked out elsewhere, log warning
      if (!error.message.includes('not found')) {
        console.warn(`Could not delete branch ${branch}: ${error.message}`);
      }
    }
  }

  // Step 3: Clean up directory if it still exists
  try {
    await fs.rm(worktreePath, { recursive: true, force: true });
  } catch (error) {
    // Directory already gone, that's fine
    if (error.code !== 'ENOENT') {
      console.warn(`Could not delete directory ${worktreePath}: ${error.message}`);
    }
  }

  // Step 4: Prune worktree metadata
  try {
    await execGit(['worktree', 'prune'], {
      cwd: repoPath
    });
  } catch (error) {
    // Non-fatal, just log
    console.warn(`Could not prune worktree metadata: ${error.message}`);
  }
}
```

**Key Points:**
- Use `--force` flag to remove worktrees with uncommitted changes
- Only delete branch if it was created as part of the operation
- Clean up both the worktree and its metadata
- Make rollback idempotent by handling "already rolled back" cases

#### 3.1.2 Branch Created

```typescript
async function rollbackBranchCreation(
  metadata: BranchMetadata
): Promise<void> {
  const { repoPath, branchName, existedBefore } = metadata;

  // Don't delete branch if it existed before we touched it
  if (existedBefore) {
    return;
  }

  // Check if branch is currently checked out in any worktree
  const worktrees = await listWorktrees(repoPath);
  const checkedOut = worktrees.some(w => w.branch === branchName);

  if (checkedOut) {
    // Can't delete checked-out branch, log warning
    console.warn(
      `Cannot delete branch ${branchName}: currently checked out in a worktree`
    );
    return;
  }

  try {
    // Use -D to force delete even if not merged
    await execGit(['branch', '-D', branchName], {
      cwd: repoPath
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      // Already deleted, idempotent success
      return;
    }
    throw error;
  }
}
```

**Key Points:**
- Never delete branches that existed before the operation
- Check if branch is currently checked out before attempting deletion
- Use `-D` (force delete) to handle unmerged branches

#### 3.1.3 Directory Created

```typescript
async function rollbackDirectoryCreation(
  metadata: DirectoryMetadata
): Promise<void> {
  const { path, existedBefore, contentsBackup } = metadata;

  if (existedBefore) {
    // Restore from backup if we have one
    if (contentsBackup) {
      await fs.rm(path, { recursive: true, force: true });
      await fs.cp(contentsBackup, path, { recursive: true });
    } else {
      // Just delete new contents, keep original structure
      const entries = await fs.readdir(path);
      for (const entry of entries) {
        const fullPath = path.join(path, entry);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
          await fs.rm(fullPath, { recursive: true });
        } else {
          await fs.unlink(fullPath);
        }
      }
    }
  } else {
    // Directory didn't exist before, safe to delete entirely
    try {
      await fs.rm(path, { recursive: true, force: true });
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // Already deleted, idempotent success
    }
  }
}
```

**Key Points:**
- Track whether directory existed before operation
- Support restoring from backup for existing directories
- Make deletion idempotent by handling ENOENT

#### 3.1.4 Script Execution

```typescript
async function rollbackScriptExecution(
  metadata: ScriptMetadata
): Promise<void> {
  const { scriptPath, workingDirectory } = metadata;

  // Look for companion teardown script
  const dir = path.dirname(scriptPath);
  const name = path.basename(scriptPath, path.extname(scriptPath));
  const teardownScript = path.join(dir, `${name}.teardown${path.extname(scriptPath)}`);

  if (await fileExists(teardownScript)) {
    console.log(`Running teardown script: ${teardownScript}`);
    try {
      await runScript(teardownScript, workingDirectory, {
        timeout: 30000 // 30 second timeout for teardown
      });
    } catch (error) {
      console.error(`Teardown script failed: ${error.message}`);
      // Continue rollback even if teardown fails
    }
  } else {
    console.warn(
      `No teardown script found for ${scriptPath}. ` +
      `Manual cleanup may be required.`
    );
  }
}
```

**Key Points:**
- Scripts should provide companion teardown scripts
- Teardown scripts should be idempotent
- Log warnings if teardown isn't available
- Don't fail entire rollback if teardown fails

### 3.2 Comprehensive Rollback Function

```typescript
async function rollbackFromLog(log: OperationLog): Promise<void> {
  const completed = log.getCompletedOperations();
  const errors: Error[] = [];

  console.error(`Rolling back ${completed.length} operation(s)...`);

  for (const entry of completed) {
    try {
      console.error(`  ⮌ ${entry.description}`);

      switch (entry.type) {
        case OperationType.CREATE_WORKTREE:
          await rollbackWorktreeCreation(entry.metadata as WorktreeMetadata);
          break;

        case OperationType.CREATE_BRANCH:
          await rollbackBranchCreation(entry.metadata as BranchMetadata);
          break;

        case OperationType.CREATE_DIRECTORY:
          await rollbackDirectoryCreation(entry.metadata as DirectoryMetadata);
          break;

        case OperationType.RUN_SCRIPT:
          await rollbackScriptExecution(entry.metadata as ScriptMetadata);
          break;

        // Add other operation types as needed

        default:
          console.warn(`No rollback handler for operation type: ${entry.type}`);
      }

      log.markRolledBack(entry.id);
    } catch (error) {
      errors.push(new Error(
        `Failed to rollback "${entry.description}": ${error.message}`
      ));
      // Continue with remaining rollbacks
    }
  }

  if (errors.length > 0) {
    console.error(`\nRollback completed with ${errors.length} error(s):`);
    errors.forEach(e => console.error(`  - ${e.message}`));
    throw new AggregateError(errors, 'Rollback partially failed');
  }

  console.error('Rollback completed successfully');
}
```

**Best Practices:**

1. **Make rollbacks idempotent**: Running rollback twice should be safe
2. **Continue on rollback errors**: Attempt all rollbacks even if some fail
3. **Collect and report all errors**: Use AggregateError to report multiple failures
4. **Provide detailed logging**: Users need to know what was rolled back
5. **Order rollbacks correctly**: Reverse of creation order (LIFO)

## 4. Error Recovery Patterns

### 4.1 Partial Failure Handling

When an operation fails partway through a multi-step process:

```typescript
async function handlePartialFailure(
  error: Error,
  context: OperationContext
): Promise<void> {
  console.error(`Operation failed: ${error.message}`);
  console.error('Analyzing partial failure...');

  // Assess what was completed
  const completedOps = context.log.getCompletedOperations();
  console.error(`${completedOps.length} operation(s) completed before failure`);

  // Offer recovery options
  const choice = await prompt({
    type: 'select',
    message: 'How would you like to proceed?',
    choices: [
      { value: 'rollback', name: 'Rollback all changes (recommended)' },
      { value: 'continue', name: 'Attempt to continue from failure point' },
      { value: 'manual', name: 'Leave as-is for manual recovery' },
    ],
  });

  switch (choice) {
    case 'rollback':
      await rollbackFromLog(context.log);
      break;

    case 'continue':
      // Attempt to resume operation
      await attemptResume(context);
      break;

    case 'manual':
      console.log('Saving recovery information...');
      await context.log.persist('/tmp/arashi-recovery.json');
      console.log('Recovery info saved to /tmp/arashi-recovery.json');
      console.log('Run `arashi recover` to resume or rollback later');
      break;
  }
}
```

### 4.2 Retry with Exponential Backoff

For transient failures (network issues, resource contention):

```typescript
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      console.warn(
        `Attempt ${attempt}/${maxAttempts} failed: ${error.message}`
      );
      console.warn(`Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

// Usage with selective retry
async function createWorktreeWithRetry(
  repoPath: string,
  worktreePath: string,
  branch: string
): Promise<void> {
  await retryWithBackoff(
    () => execGit(['worktree', 'add', '-b', branch, worktreePath], {
      cwd: repoPath
    }),
    {
      maxAttempts: 3,
      shouldRetry: (error) => {
        // Retry on transient errors, not on permanent failures
        return (
          error.message.includes('temporarily unavailable') ||
          error.message.includes('resource busy') ||
          error.message.includes('timeout')
        );
      },
    }
  );
}
```

### 4.3 Checkpoint and Resume

For long-running operations, implement checkpointing:

```typescript
interface Checkpoint {
  operationId: string;
  completedSteps: string[];
  remainingSteps: string[];
  timestamp: Date;
}

class ResumableOperation {
  private checkpointPath: string;
  private checkpoint: Checkpoint;

  constructor(operationId: string) {
    this.checkpointPath = `/tmp/arashi-checkpoint-${operationId}.json`;
    this.checkpoint = {
      operationId,
      completedSteps: [],
      remainingSteps: [],
      timestamp: new Date(),
    };
  }

  async saveCheckpoint(): Promise<void> {
    await fs.writeFile(
      this.checkpointPath,
      JSON.stringify(this.checkpoint, null, 2),
      'utf-8'
    );
  }

  async loadCheckpoint(): Promise<boolean> {
    try {
      const data = await fs.readFile(this.checkpointPath, 'utf-8');
      this.checkpoint = JSON.parse(data);
      return true;
    } catch (error) {
      return false;
    }
  }

  markStepCompleted(stepId: string): void {
    this.checkpoint.completedSteps.push(stepId);
    this.checkpoint.remainingSteps = this.checkpoint.remainingSteps
      .filter(id => id !== stepId);
  }

  isStepCompleted(stepId: string): boolean {
    return this.checkpoint.completedSteps.includes(stepId);
  }

  async cleanup(): Promise<void> {
    try {
      await fs.unlink(this.checkpointPath);
    } catch (error) {
      // Ignore if already deleted
    }
  }
}

// Usage
async function createWorktreesResumable(repos: string[]): Promise<void> {
  const operation = new ResumableOperation('create-worktrees');
  const hadCheckpoint = await operation.loadCheckpoint();

  if (hadCheckpoint) {
    console.log('Resuming from checkpoint...');
  }

  try {
    for (const repo of repos) {
      const stepId = `worktree-${repo}`;

      // Skip if already completed
      if (operation.isStepCompleted(stepId)) {
        console.log(`Skipping ${repo} (already completed)`);
        continue;
      }

      // Perform operation
      await createWorktree(repo);

      // Checkpoint progress
      operation.markStepCompleted(stepId);
      await operation.saveCheckpoint();
    }

    // Success - clean up checkpoint
    await operation.cleanup();
  } catch (error) {
    console.error('Operation failed. Checkpoint saved for resumption.');
    throw error;
  }
}
```

**Best Practices:**

1. **Save checkpoints frequently**: After each major step completion
2. **Make operations idempotent**: Resuming should safely skip completed work
3. **Validate checkpoint integrity**: Check timestamp to detect stale checkpoints
4. **Clean up on success**: Remove checkpoint files after successful completion

## 5. Cleanup Strategies

### 5.1 Orphaned Worktree Detection

Orphaned worktrees occur when:
- Worktree directory is manually deleted
- Operation is interrupted mid-creation
- Git metadata becomes corrupted

```typescript
interface OrphanedWorktree {
  name: string;
  gitdir: string;
  reason: 'missing_directory' | 'invalid_gitdir' | 'corrupted_metadata';
}

async function detectOrphanedWorktrees(
  repoPath: string
): Promise<OrphanedWorktree[]> {
  const orphaned: OrphanedWorktree[] = [];
  const worktreesDir = path.join(repoPath, '.git', 'worktrees');

  // Check if worktrees directory exists
  if (!await fileExists(worktreesDir)) {
    return orphaned;
  }

  const entries = await fs.readdir(worktreesDir);

  for (const name of entries) {
    const metadataDir = path.join(worktreesDir, name);
    const gitdirFile = path.join(metadataDir, 'gitdir');

    try {
      // Read gitdir file to get worktree path
      const worktreePath = (await fs.readFile(gitdirFile, 'utf-8')).trim();

      // Check if worktree directory exists
      if (!await fileExists(worktreePath)) {
        orphaned.push({
          name,
          gitdir: metadataDir,
          reason: 'missing_directory',
        });
        continue;
      }

      // Check if .git file in worktree is valid
      const gitFile = worktreePath.replace(/\.git$/, '') + '.git';
      if (await fileExists(gitFile)) {
        const gitFileContent = await fs.readFile(gitFile, 'utf-8');
        if (!gitFileContent.startsWith('gitdir:')) {
          orphaned.push({
            name,
            gitdir: metadataDir,
            reason: 'invalid_gitdir',
          });
        }
      }
    } catch (error) {
      // Couldn't read metadata
      orphaned.push({
        name,
        gitdir: metadataDir,
        reason: 'corrupted_metadata',
      });
    }
  }

  return orphaned;
}
```

### 5.2 Using `git worktree prune`

Git's built-in prune command removes stale worktree metadata:

```typescript
async function pruneWorktrees(repoPath: string): Promise<void> {
  console.log('Pruning stale worktree metadata...');

  // Run with --verbose to see what's being pruned
  const result = await execGit(
    ['worktree', 'prune', '--verbose'],
    { cwd: repoPath }
  );

  if (result.stdout.trim()) {
    console.log('Pruned worktrees:');
    console.log(result.stdout);
  } else {
    console.log('No stale worktrees found');
  }
}

// Alternative: dry-run first to preview
async function pruneWorktreesSafe(repoPath: string): Promise<void> {
  // Preview what would be pruned
  const dryRun = await execGit(
    ['worktree', 'prune', '--dry-run', '--verbose'],
    { cwd: repoPath }
  );

  if (!dryRun.stdout.trim()) {
    console.log('No stale worktrees to prune');
    return;
  }

  console.log('The following worktrees would be pruned:');
  console.log(dryRun.stdout);

  const confirmed = await confirm({
    message: 'Proceed with pruning?',
    default: true,
  });

  if (confirmed) {
    await pruneWorktrees(repoPath);
  }
}
```

### 5.3 Aggressive Cleanup

For complete cleanup including worktree directories and branches:

```typescript
async function aggressiveCleanup(
  repoPath: string,
  options: {
    removeDirectories?: boolean;
    deleteBranches?: boolean;
    force?: boolean;
  } = {}
): Promise<void> {
  const {
    removeDirectories = true,
    deleteBranches = false,
    force = false,
  } = options;

  // Step 1: Get list of all worktrees
  const worktrees = await listWorktrees(repoPath);

  // Step 2: Remove worktrees (excluding main)
  for (const worktree of worktrees) {
    if (worktree.isMain) continue;

    try {
      // Try graceful removal first
      await execGit(['worktree', 'remove', worktree.path], {
        cwd: repoPath
      });
      console.log(`Removed worktree: ${worktree.path}`);
    } catch (error) {
      if (force) {
        // Force removal if graceful fails
        await execGit(['worktree', 'remove', '--force', worktree.path], {
          cwd: repoPath
        });
        console.log(`Force removed worktree: ${worktree.path}`);
      } else {
        console.error(`Failed to remove ${worktree.path}: ${error.message}`);
      }
    }

    // Delete branch if requested
    if (deleteBranches && worktree.branch) {
      try {
        await execGit(['branch', '-D', worktree.branch], {
          cwd: repoPath
        });
        console.log(`Deleted branch: ${worktree.branch}`);
      } catch (error) {
        console.warn(`Could not delete branch ${worktree.branch}: ${error.message}`);
      }
    }
  }

  // Step 3: Prune stale metadata
  await pruneWorktrees(repoPath);

  // Step 4: Remove directories if requested
  if (removeDirectories) {
    for (const worktree of worktrees) {
      if (worktree.isMain) continue;

      if (await fileExists(worktree.path)) {
        try {
          await fs.rm(worktree.path, { recursive: true, force: true });
          console.log(`Removed directory: ${worktree.path}`);
        } catch (error) {
          console.error(`Could not remove ${worktree.path}: ${error.message}`);
        }
      }
    }
  }

  console.log('Cleanup complete');
}
```

**Best Practices:**

1. **Run prune regularly**: Include in automated cleanup tasks
2. **Use dry-run for safety**: Preview changes before applying
3. **Provide force option**: For cases where graceful cleanup fails
4. **Distinguish user branches**: Don't delete branches the user created manually
5. **Log all cleanup actions**: Help users understand what was removed

## 6. Timeout Handling

### 6.1 Process Group Termination (Node.js/Bun)

When running setup scripts, use process groups to ensure child processes are killed on timeout:

```typescript
import { spawn, ChildProcess } from 'node:child_process';

interface ProcessOptions {
  timeout?: number;          // Timeout in milliseconds
  cwd?: string;              // Working directory
  env?: Record<string, string>;
  killSignal?: NodeJS.Signals;
}

interface ProcessResult {
  exitCode: number;
  signal: string | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

async function runProcessWithTimeout(
  command: string,
  args: string[],
  options: ProcessOptions = {}
): Promise<ProcessResult> {
  const {
    timeout = 30000,
    cwd = process.cwd(),
    env = process.env,
    killSignal = 'SIGTERM',
  } = options;

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let timeoutId: NodeJS.Timeout;

    // Spawn process in new process group
    // On Unix: detached + negative PID to kill process group
    // On Windows: detached + taskkill to kill process tree
    const child = spawn(command, args, {
      cwd,
      env,
      detached: true,  // Create new process group
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Collect output
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    // Setup timeout
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        killProcessGroup(child, killSignal);
      }, timeout);
    }

    // Handle process exit
    child.on('exit', (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);

      resolve({
        exitCode: code ?? -1,
        signal,
        stdout,
        stderr,
        timedOut,
      });
    });

    // Handle spawn errors
    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}

function killProcessGroup(
  child: ChildProcess,
  signal: NodeJS.Signals = 'SIGTERM'
): void {
  if (process.platform === 'win32') {
    // Windows: use taskkill to kill process tree
    try {
      spawn('taskkill', ['/pid', child.pid!.toString(), '/f', '/t'], {
        detached: true,
        stdio: 'ignore',
      });
    } catch (error) {
      console.error('Failed to kill process tree:', error);
    }
  } else {
    // Unix: kill process group using negative PID
    try {
      process.kill(-child.pid!, signal);
    } catch (error) {
      // Process may have already exited
      if (error.code !== 'ESRCH') {
        console.error('Failed to kill process group:', error);
      }
    }
  }
}
```

**Usage Example:**

```typescript
async function runSetupScript(
  scriptPath: string,
  workingDir: string
): Promise<void> {
  console.log(`Running setup script: ${scriptPath}`);

  const spinner = ora('Executing setup script...').start();

  try {
    const result = await runProcessWithTimeout(scriptPath, [], {
      cwd: workingDir,
      timeout: 60000, // 60 second timeout
      killSignal: 'SIGTERM',
    });

    if (result.timedOut) {
      spinner.fail('Setup script timed out after 60 seconds');
      throw new Error(
        `Setup script timed out. Script: ${scriptPath}\n` +
        `Stdout: ${result.stdout}\n` +
        `Stderr: ${result.stderr}`
      );
    }

    if (result.exitCode !== 0) {
      spinner.fail(`Setup script failed with exit code ${result.exitCode}`);
      throw new Error(
        `Setup script failed (exit ${result.exitCode})\n` +
        `Stderr: ${result.stderr}`
      );
    }

    spinner.succeed('Setup script completed successfully');
  } catch (error) {
    spinner.fail('Setup script error');
    throw error;
  }
}
```

### 6.2 Graceful vs Forceful Termination

Implement escalating termination strategy:

```typescript
async function terminateProcessGracefully(
  child: ChildProcess,
  gracePeriod: number = 5000
): Promise<void> {
  return new Promise((resolve) => {
    // Track if process has exited
    let exited = false;

    child.on('exit', () => {
      exited = true;
      resolve();
    });

    // Phase 1: Send SIGTERM (graceful shutdown)
    console.log(`Sending SIGTERM to process ${child.pid}`);
    killProcessGroup(child, 'SIGTERM');

    // Phase 2: If still running after grace period, send SIGKILL
    setTimeout(() => {
      if (!exited) {
        console.log(`Process did not exit after ${gracePeriod}ms, sending SIGKILL`);
        killProcessGroup(child, 'SIGKILL');

        // Give SIGKILL a moment to work
        setTimeout(() => {
          resolve();
        }, 1000);
      }
    }, gracePeriod);
  });
}
```

**Best Practices:**

1. **Always use process groups**: Ensures child processes are killed too
2. **Implement graceful shutdown**: Try SIGTERM before SIGKILL
3. **Set reasonable timeouts**: Balance between allowing work and preventing hangs
4. **Log timeout events**: Help users debug long-running scripts
5. **Handle platform differences**: Windows requires different process tree killing

**Common Pitfalls:**

- **Not killing child processes**: Scripts may spawn children that outlive the parent
- **Forgetting to clear timeouts**: Causes memory leaks in long-running apps
- **Using wrong signal**: Some processes ignore SIGTERM
- **Not handling already-exited**: Sending signals to non-existent PIDs throws errors

## 7. Signal Handling

### 7.1 Graceful Shutdown on SIGINT/SIGTERM

Handle interrupt signals to perform cleanup before exit:

```typescript
class GracefulShutdown {
  private shutdownHandlers: Array<() => Promise<void>> = [];
  private isShuttingDown = false;
  private originalHandlers: {
    SIGINT?: NodeJS.SignalsListener;
    SIGTERM?: NodeJS.SignalsListener;
  } = {};

  /**
   * Register a cleanup handler
   */
  onShutdown(handler: () => Promise<void>): void {
    this.shutdownHandlers.push(handler);
  }

  /**
   * Setup signal handlers
   */
  setup(): void {
    // Save original handlers
    this.originalHandlers.SIGINT = process.listeners('SIGINT')[0] as NodeJS.SignalsListener;
    this.originalHandlers.SIGTERM = process.listeners('SIGTERM')[0] as NodeJS.SignalsListener;

    // Register our handlers
    process.on('SIGINT', this.handleSignal.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.handleSignal.bind(this, 'SIGTERM'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.shutdown(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection:', reason);
      this.shutdown(1);
    });
  }

  /**
   * Handle signal
   */
  private async handleSignal(signal: 'SIGINT' | 'SIGTERM'): Promise<void> {
    if (this.isShuttingDown) {
      console.log('\nForce shutdown requested');
      process.exit(1);
    }

    console.log(`\n${signal} received, shutting down gracefully...`);
    await this.shutdown(0);
  }

  /**
   * Execute shutdown sequence
   */
  private async shutdown(exitCode: number): Promise<void> {
    this.isShuttingDown = true;

    // Execute handlers in reverse order (LIFO)
    const handlers = [...this.shutdownHandlers].reverse();

    for (const handler of handlers) {
      try {
        await Promise.race([
          handler(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown handler timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.error('Error during shutdown:', error);
      }
    }

    console.log('Shutdown complete');
    process.exit(exitCode);
  }

  /**
   * Restore original signal handlers
   */
  restore(): void {
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');

    if (this.originalHandlers.SIGINT) {
      process.on('SIGINT', this.originalHandlers.SIGINT);
    }
    if (this.originalHandlers.SIGTERM) {
      process.on('SIGTERM', this.originalHandlers.SIGTERM);
    }
  }
}
```

### 7.2 Integration with Operation Management

Combine signal handling with transaction management:

```typescript
// Global shutdown manager
const shutdown = new GracefulShutdown();
shutdown.setup();

async function createWorktreesWithGracefulShutdown(
  repos: string[]
): Promise<void> {
  const txn = new TransactionManager();
  const log = new OperationLog();

  // Register cleanup handler
  shutdown.onShutdown(async () => {
    console.log('Rolling back operations...');
    await txn.rollback();
    
    // Persist log for later inspection
    await log.persist('/tmp/arashi-interrupted.log');
    console.log('Operation log saved to /tmp/arashi-interrupted.log');
  });

  try {
    // Perform operations...
    for (const repo of repos) {
      await txn.executeWithRollback(
        `Create worktree for ${repo}`,
        async () => {
          await createWorktree(repo);
        },
        async () => {
          await removeWorktree(repo);
        }
      );
    }

    txn.clear();
    console.log('All operations completed successfully');
  } catch (error) {
    await txn.rollback();
    throw error;
  }
}
```

### 7.3 User Feedback During Shutdown

Provide clear feedback about shutdown progress:

```typescript
async function createWorktreesWithFeedback(repos: string[]): Promise<void> {
  const txn = new TransactionManager();
  let currentRepo = '';

  shutdown.onShutdown(async () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║  Interrupt received - cleaning up...  ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`Current operation: ${currentRepo}`);
    console.log('Please wait while we rollback changes...');
    console.log('(Press Ctrl+C again to force quit)');
    console.log('');

    const spinner = ora('Rolling back operations').start();
    try {
      await txn.rollback();
      spinner.succeed('Rollback complete');
    } catch (error) {
      spinner.fail('Rollback had errors');
      console.error(error);
    }
  });

  try {
    for (const repo of repos) {
      currentRepo = repo;
      
      await txn.executeWithRollback(
        `Create worktree for ${repo}`,
        async () => {
          console.log(`Processing ${repo}...`);
          await createWorktree(repo);
        },
        async () => {
          await removeWorktree(repo);
        }
      );
    }

    txn.clear();
  } catch (error) {
    await txn.rollback();
    throw error;
  }
}
```

**Best Practices:**

1. **Setup handlers early**: Register signal handlers before any operations
2. **Provide force-quit escape hatch**: Second Ctrl+C immediately exits
3. **Time-bound cleanup**: Don't let cleanup hang indefinitely
4. **Clear user communication**: Explain what's happening during shutdown
5. **Persist state**: Save operation logs for later recovery
6. **LIFO shutdown**: Execute cleanup in reverse order of registration

**Common Pitfalls:**

- **Not handling second interrupt**: Users get frustrated when Ctrl+C doesn't work
- **Hanging on cleanup**: Set timeouts for all shutdown handlers
- **Losing error information**: Persist logs before exiting
- **Not testing shutdown paths**: Regularly test interrupt handling
- **Forgetting to restore handlers**: In tests, restore original handlers after

## Summary: Ensuring Atomicity

To achieve atomic multi-repository operations:

1. **Pre-flight Validation**
   - Validate all operations can succeed before starting
   - Check disk space, permissions, git state
   - Fail fast on validation errors

2. **Operation Logging**
   - Track every operation with sufficient metadata for rollback
   - Persist logs for crash recovery
   - Include both what was done and how to undo it

3. **Rollback Mechanisms**
   - Implement specific rollback for each operation type
   - Execute rollbacks in reverse order (LIFO)
   - Make rollbacks idempotent and error-tolerant
   - Continue rollback even if individual steps fail

4. **Error Handling**
   - Wrap operations in try-catch with automatic rollback
   - Provide retry mechanisms for transient failures
   - Offer checkpointing for long operations
   - Handle partial failures gracefully

5. **Signal Handling**
   - Register cleanup handlers for SIGINT/SIGTERM
   - Provide force-quit escape hatch
   - Time-bound all cleanup operations
   - Give clear feedback during shutdown

6. **Cleanup**
   - Use `git worktree prune` to remove stale metadata
   - Detect and clean orphaned worktrees
   - Provide aggressive cleanup options
   - Log all cleanup actions

By following these patterns, multi-repository git operations can achieve practical atomicity: either all operations succeed, or all changes are rolled back, leaving the system in a consistent state.

---

**Document Version**: 1.0  
**Last Updated**: Tue Feb 03 2026  
**Research Completed**: All topics covered with code examples and best practices
