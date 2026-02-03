# Error Handling & Rollback Contract

## Overview

This document defines the error handling patterns, ArashiError class, operation logging, rollback mechanisms, and error recovery patterns for the arashi-arashi project.

## Version

Contract Version: 1.0.0  
Last Updated: 2026-02-03

---

## Core Principles

1. **Predictability**: All operations are predictable and repeatable
2. **Atomicity**: Operations are atomic (all-or-nothing)
3. **Rollback**: Failed operations can be rolled back
4. **Logging**: All operations are logged for debugging
5. **User Clarity**: Errors provide clear guidance for resolution

---

## ArashiError Class

### Class Definition

```typescript
/**
 * Custom error class for arashi operations
 * 
 * Provides structured error information including:
 * - Error code for programmatic handling
 * - User-friendly message
 * - Technical details for debugging
 * - Recovery suggestions
 * - Operation context
 */
class ArashiError extends Error {
  /**
   * Error code for programmatic handling
   * @example "GIT_BRANCH_EXISTS"
   */
  readonly code: ErrorCode;
  
  /**
   * Original error that caused this error (if any)
   */
  readonly cause?: Error;
  
  /**
   * Additional error details
   */
  readonly details: ErrorDetails;
  
  /**
   * Operation context when error occurred
   */
  readonly context: OperationContext;
  
  /**
   * Suggested recovery actions
   */
  readonly suggestions: string[];
  
  /**
   * Is this error recoverable?
   */
  readonly recoverable: boolean;
  
  /**
   * Exit code for CLI
   */
  readonly exitCode: number;

  constructor(
    message: string,
    options: ArashiErrorOptions
  ) {
    super(message);
    this.name = 'ArashiError';
    this.code = options.code;
    this.cause = options.cause;
    this.details = options.details || {};
    this.context = options.context || {};
    this.suggestions = options.suggestions || [];
    this.recoverable = options.recoverable ?? true;
    this.exitCode = options.exitCode || 1;
    
    // Capture stack trace
    Error.captureStackTrace(this, ArashiError);
  }

  /**
   * Convert error to JSON for logging/serialization
   */
  toJSON(): ErrorJSON {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      context: this.context,
      suggestions: this.suggestions,
      recoverable: this.recoverable,
      exitCode: this.exitCode,
      stack: this.stack,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message,
        stack: this.cause.stack,
      } : undefined,
    };
  }

  /**
   * Format error for CLI display
   */
  format(options?: ErrorFormatOptions): string {
    const { colors = true, verbose = false } = options || {};
    
    let output = '';
    
    // Error header
    output += colors ? chalk.red('Error: ') : 'Error: ';
    output += this.message + '\n';
    
    // Details
    if (Object.keys(this.details).length > 0) {
      output += '\nDetails:\n';
      for (const [key, value] of Object.entries(this.details)) {
        output += `  ${key}: ${value}\n`;
      }
    }
    
    // Suggestions
    if (this.suggestions.length > 0) {
      output += '\nSuggestion:\n';
      this.suggestions.forEach(suggestion => {
        output += `  - ${suggestion}\n`;
      });
    }
    
    // Context (verbose mode)
    if (verbose && Object.keys(this.context).length > 0) {
      output += '\nContext:\n';
      for (const [key, value] of Object.entries(this.context)) {
        output += `  ${key}: ${JSON.stringify(value)}\n`;
      }
    }
    
    // Stack trace (verbose mode)
    if (verbose && this.stack) {
      output += '\nStack Trace:\n';
      output += this.stack + '\n';
    }
    
    // Exit code
    output += `\nExit code: ${this.exitCode}\n`;
    
    return output;
  }

  /**
   * Check if error is of specific type
   */
  is(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if error is recoverable
   */
  canRecover(): boolean {
    return this.recoverable;
  }
}
```

### Supporting Types

```typescript
/**
 * Error code enum
 */
enum ErrorCode {
  // Repository errors
  NOT_GIT_REPOSITORY = 'NOT_GIT_REPOSITORY',
  GIT_VERSION_TOO_OLD = 'GIT_VERSION_TOO_OLD',
  
  // Configuration errors
  CONFIG_NOT_FOUND = 'CONFIG_NOT_FOUND',
  CONFIG_INVALID = 'CONFIG_INVALID',
  CONFIG_MIGRATION_FAILED = 'CONFIG_MIGRATION_FAILED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  
  // Worktree errors
  WORKTREE_EXISTS = 'WORKTREE_EXISTS',
  WORKTREE_NOT_FOUND = 'WORKTREE_NOT_FOUND',
  WORKTREE_PATH_EXISTS = 'WORKTREE_PATH_EXISTS',
  WORKTREE_DIRTY = 'WORKTREE_DIRTY',
  WORKTREE_CREATION_FAILED = 'WORKTREE_CREATION_FAILED',
  WORKTREE_REMOVAL_FAILED = 'WORKTREE_REMOVAL_FAILED',
  MAX_WORKTREES_EXCEEDED = 'MAX_WORKTREES_EXCEEDED',
  
  // Branch errors
  BRANCH_EXISTS = 'BRANCH_EXISTS',
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  BRANCH_NOT_MERGED = 'BRANCH_NOT_MERGED',
  BRANCH_CHECKED_OUT = 'BRANCH_CHECKED_OUT',
  BRANCH_CREATION_FAILED = 'BRANCH_CREATION_FAILED',
  BRANCH_DELETION_FAILED = 'BRANCH_DELETION_FAILED',
  
  // Git operation errors
  GIT_COMMAND_FAILED = 'GIT_COMMAND_FAILED',
  GIT_FETCH_FAILED = 'GIT_FETCH_FAILED',
  GIT_NETWORK_ERROR = 'GIT_NETWORK_ERROR',
  GIT_TIMEOUT = 'GIT_TIMEOUT',
  GIT_REMOTE_NOT_FOUND = 'GIT_REMOTE_NOT_FOUND',
  
  // File system errors
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PATH_NOT_FOUND = 'PATH_NOT_FOUND',
  PATH_EXISTS = 'PATH_EXISTS',
  DISK_FULL = 'DISK_FULL',
  
  // Validation errors
  INVALID_TASK_ID = 'INVALID_TASK_ID',
  INVALID_BRANCH_NAME = 'INVALID_BRANCH_NAME',
  INVALID_PATH = 'INVALID_PATH',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  MISSING_ARGUMENT = 'MISSING_ARGUMENT',
  
  // Operation errors
  OPERATION_CANCELLED = 'OPERATION_CANCELLED',
  OPERATION_TIMEOUT = 'OPERATION_TIMEOUT',
  ROLLBACK_FAILED = 'ROLLBACK_FAILED',
  HOOK_FAILED = 'HOOK_FAILED',
  
  // Unknown/unexpected errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error constructor options
 */
interface ArashiErrorOptions {
  code: ErrorCode;
  cause?: Error;
  details?: ErrorDetails;
  context?: OperationContext;
  suggestions?: string[];
  recoverable?: boolean;
  exitCode?: number;
}

/**
 * Error details (structured data)
 */
interface ErrorDetails {
  [key: string]: unknown;
}

/**
 * Operation context
 */
interface OperationContext {
  operation?: string;      // Operation name
  command?: string;        // CLI command
  args?: unknown[];        // Command arguments
  cwd?: string;           // Working directory
  timestamp?: Date;       // When error occurred
  duration?: number;      // Operation duration (ms)
  [key: string]: unknown;
}

/**
 * Error JSON representation
 */
interface ErrorJSON {
  name: string;
  message: string;
  code: ErrorCode;
  details: ErrorDetails;
  context: OperationContext;
  suggestions: string[];
  recoverable: boolean;
  exitCode: number;
  stack?: string;
  cause?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Error formatting options
 */
interface ErrorFormatOptions {
  colors?: boolean;
  verbose?: boolean;
}
```

---

## Operation Log

### Log Entry Structure

```typescript
/**
 * Operation log entry
 * 
 * Records all operations for debugging and rollback
 */
interface OperationLogEntry {
  /**
   * Unique operation ID
   */
  id: string;
  
  /**
   * Operation type
   */
  type: OperationType;
  
  /**
   * Operation status
   */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  
  /**
   * Operation timestamp
   */
  timestamp: Date;
  
  /**
   * Operation duration (ms)
   */
  duration?: number;
  
  /**
   * Operation details
   */
  details: OperationDetails;
  
  /**
   * Changes made by operation
   */
  changes: OperationChange[];
  
  /**
   * Rollback function (if operation is reversible)
   */
  rollback?: RollbackFunction;
  
  /**
   * Error (if operation failed)
   */
  error?: ErrorJSON;
  
  /**
   * Parent operation (for nested operations)
   */
  parent?: string;
  
  /**
   * Child operations
   */
  children?: string[];
}

/**
 * Operation types
 */
enum OperationType {
  INIT = 'init',
  CREATE_WORKTREE = 'create_worktree',
  REMOVE_WORKTREE = 'remove_worktree',
  CREATE_BRANCH = 'create_branch',
  DELETE_BRANCH = 'delete_branch',
  FETCH = 'fetch',
  CONFIG_UPDATE = 'config_update',
  HOOK_EXECUTION = 'hook_execution',
  FILE_SYSTEM = 'file_system',
}

/**
 * Operation details
 */
interface OperationDetails {
  command?: string;
  args?: unknown[];
  options?: unknown;
  [key: string]: unknown;
}

/**
 * Operation change record
 */
interface OperationChange {
  type: 'create' | 'modify' | 'delete' | 'move';
  target: string;           // What was changed (file, branch, etc.)
  before?: unknown;         // State before change
  after?: unknown;          // State after change
  reversible: boolean;      // Can this change be rolled back?
}
```

### Operation Logger

```typescript
/**
 * Operation logger for tracking and rollback
 */
class OperationLogger {
  private entries: Map<string, OperationLogEntry> = new Map();
  private activeOperations: Set<string> = new Set();

  /**
   * Start a new operation
   */
  async start(
    type: OperationType,
    details: OperationDetails,
    parent?: string
  ): Promise<string> {
    const id = generateOperationId();
    
    const entry: OperationLogEntry = {
      id,
      type,
      status: 'pending',
      timestamp: new Date(),
      details,
      changes: [],
      parent,
    };
    
    this.entries.set(id, entry);
    this.activeOperations.add(id);
    
    // Link to parent
    if (parent) {
      const parentEntry = this.entries.get(parent);
      if (parentEntry) {
        parentEntry.children = parentEntry.children || [];
        parentEntry.children.push(id);
      }
    }
    
    return id;
  }

  /**
   * Mark operation as running
   */
  setRunning(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.status = 'running';
    }
  }

  /**
   * Record a change
   */
  recordChange(id: string, change: OperationChange): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.changes.push(change);
    }
  }

  /**
   * Set rollback function
   */
  setRollback(id: string, rollback: RollbackFunction): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.rollback = rollback;
    }
  }

  /**
   * Complete operation
   */
  complete(id: string): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.status = 'completed';
      entry.duration = Date.now() - entry.timestamp.getTime();
      this.activeOperations.delete(id);
    }
  }

  /**
   * Fail operation
   */
  fail(id: string, error: Error | ArashiError): void {
    const entry = this.entries.get(id);
    if (entry) {
      entry.status = 'failed';
      entry.duration = Date.now() - entry.timestamp.getTime();
      entry.error = error instanceof ArashiError 
        ? error.toJSON()
        : {
            name: error.name,
            message: error.message,
            code: ErrorCode.UNKNOWN_ERROR,
            details: {},
            context: {},
            suggestions: [],
            recoverable: false,
            exitCode: 1,
            stack: error.stack,
          };
      this.activeOperations.delete(id);
    }
  }

  /**
   * Rollback operation
   */
  async rollback(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new ArashiError('Operation not found', {
        code: ErrorCode.INVALID_ARGUMENT,
        details: { operationId: id },
      });
    }

    // Rollback children first (in reverse order)
    if (entry.children) {
      for (const childId of entry.children.reverse()) {
        await this.rollback(childId);
      }
    }

    // Execute rollback
    if (entry.rollback) {
      try {
        await entry.rollback();
        entry.status = 'rolled_back';
      } catch (error) {
        throw new ArashiError('Rollback failed', {
          code: ErrorCode.ROLLBACK_FAILED,
          cause: error as Error,
          details: {
            operationId: id,
            operationType: entry.type,
          },
          recoverable: false,
        });
      }
    }
  }

  /**
   * Rollback all operations in transaction
   */
  async rollbackTransaction(rootId: string): Promise<void> {
    await this.rollback(rootId);
  }

  /**
   * Get operation entry
   */
  get(id: string): OperationLogEntry | undefined {
    return this.entries.get(id);
  }

  /**
   * Get all operations
   */
  getAll(): OperationLogEntry[] {
    return Array.from(this.entries.values());
  }

  /**
   * Get active operations
   */
  getActive(): OperationLogEntry[] {
    return Array.from(this.activeOperations)
      .map(id => this.entries.get(id))
      .filter((entry): entry is OperationLogEntry => entry !== undefined);
  }

  /**
   * Clear completed operations
   */
  clearCompleted(): void {
    for (const [id, entry] of this.entries) {
      if (entry.status === 'completed' || entry.status === 'rolled_back') {
        this.entries.delete(id);
      }
    }
  }

  /**
   * Export log for debugging
   */
  export(): OperationLogEntry[] {
    return this.getAll();
  }

  /**
   * Import log (for recovery)
   */
  import(entries: OperationLogEntry[]): void {
    for (const entry of entries) {
      this.entries.set(entry.id, entry);
    }
  }
}

/**
 * Generate unique operation ID
 */
function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## Rollback Functions

### Rollback Function Type

```typescript
/**
 * Rollback function signature
 * 
 * Reverts changes made by an operation
 */
type RollbackFunction = () => Promise<void>;
```

### Common Rollback Patterns

#### 1. File System Rollback

```typescript
/**
 * Create directory with rollback
 */
async function createDirectoryWithRollback(
  path: string,
  logger: OperationLogger,
  operationId: string
): Promise<void> {
  // Check if already exists
  const exists = await fs.pathExists(path);
  
  if (exists) {
    throw new ArashiError('Path already exists', {
      code: ErrorCode.PATH_EXISTS,
      details: { path },
      suggestions: ['Use a different path', 'Remove existing directory'],
    });
  }

  // Record change
  logger.recordChange(operationId, {
    type: 'create',
    target: path,
    before: undefined,
    after: { exists: true },
    reversible: true,
  });

  // Set rollback
  logger.setRollback(operationId, async () => {
    await fs.remove(path);
  });

  // Create directory
  await fs.ensureDir(path);
}
```

#### 2. Git Branch Rollback

```typescript
/**
 * Create branch with rollback
 */
async function createBranchWithRollback(
  branch: string,
  base: string,
  logger: OperationLogger,
  operationId: string
): Promise<void> {
  // Check if branch exists
  const exists = await branchExists(branch);
  
  if (exists) {
    throw new ArashiError('Branch already exists', {
      code: ErrorCode.BRANCH_EXISTS,
      details: { branch },
      suggestions: ['Use --force to overwrite', 'Choose a different name'],
    });
  }

  // Record change
  logger.recordChange(operationId, {
    type: 'create',
    target: `branch:${branch}`,
    before: undefined,
    after: { name: branch, base },
    reversible: true,
  });

  // Set rollback
  logger.setRollback(operationId, async () => {
    await deleteBranch(branch, { force: true });
  });

  // Create branch
  await createBranch(branch, { base });
}
```

#### 3. Worktree Creation Rollback

```typescript
/**
 * Create worktree with rollback
 */
async function createWorktreeWithRollback(
  taskId: string,
  branch: string,
  options: CreateWorktreeOptions,
  logger: OperationLogger,
  operationId: string
): Promise<WorktreeInfo> {
  const path = resolveWorktreePath(taskId);
  
  // Start branch creation (child operation)
  const branchOpId = await logger.start(
    OperationType.CREATE_BRANCH,
    { branch, base: options.base },
    operationId
  );
  
  try {
    await createBranchWithRollback(branch, options.base!, logger, branchOpId);
    logger.complete(branchOpId);
  } catch (error) {
    logger.fail(branchOpId, error as Error);
    throw error;
  }

  // Record worktree change
  logger.recordChange(operationId, {
    type: 'create',
    target: `worktree:${path}`,
    before: undefined,
    after: { path, branch },
    reversible: true,
  });

  // Set rollback (removes both worktree and branch)
  logger.setRollback(operationId, async () => {
    // Remove worktree
    await removeWorktree(path, { force: true });
    
    // Delete branch
    await deleteBranch(branch, { force: true });
  });

  // Create worktree
  const worktree = await createWorktree(path, branch, options);
  
  return worktree;
}
```

#### 4. Configuration Update Rollback

```typescript
/**
 * Update configuration with rollback
 */
async function updateConfigWithRollback(
  updates: Partial<ArashiConfig>,
  logger: OperationLogger,
  operationId: string
): Promise<void> {
  const configPath = '.arashi/config.json';
  
  // Read current config
  const currentConfig = await loadConfig();
  
  // Record change
  logger.recordChange(operationId, {
    type: 'modify',
    target: configPath,
    before: currentConfig,
    after: { ...currentConfig, ...updates },
    reversible: true,
  });

  // Set rollback
  logger.setRollback(operationId, async () => {
    await saveConfig(currentConfig);
  });

  // Save updated config
  await saveConfig({ ...currentConfig, ...updates });
}
```

---

## Error Recovery Patterns

### Pattern 1: Retry with Backoff

```typescript
/**
 * Retry operation with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry if not recoverable
      if (error instanceof ArashiError && !error.recoverable) {
        throw error;
      }

      // Last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Notify retry
      if (onRetry) {
        onRetry(attempt, delay, lastError);
      }

      // Wait before retry
      await sleep(delay);
      
      // Increase delay
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw new ArashiError('Operation failed after retries', {
    code: ErrorCode.OPERATION_TIMEOUT,
    cause: lastError!,
    details: {
      attempts: maxAttempts,
    },
    recoverable: false,
  });
}

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, delay: number, error: Error) => void;
}
```

### Pattern 2: Graceful Degradation

```typescript
/**
 * Execute with fallback
 */
async function withFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: FallbackOptions = {}
): Promise<T> {
  const { logWarning = true } = options;

  try {
    return await primary();
  } catch (error) {
    if (logWarning) {
      console.warn('Primary operation failed, using fallback', error);
    }
    
    return await fallback();
  }
}

interface FallbackOptions {
  logWarning?: boolean;
}
```

### Pattern 3: Transaction with Rollback

```typescript
/**
 * Execute operations in a transaction
 * 
 * Rolls back all operations if any fails
 */
async function transaction<T>(
  operations: TransactionOperation[],
  logger: OperationLogger
): Promise<T> {
  const rootId = await logger.start(
    OperationType.FILE_SYSTEM, // or appropriate type
    { operations: operations.length }
  );

  try {
    logger.setRunning(rootId);
    
    const results: unknown[] = [];
    
    for (const op of operations) {
      const opId = await logger.start(op.type, op.details, rootId);
      
      try {
        logger.setRunning(opId);
        const result = await op.execute(logger, opId);
        results.push(result);
        logger.complete(opId);
      } catch (error) {
        logger.fail(opId, error as Error);
        throw error;
      }
    }
    
    logger.complete(rootId);
    return results[results.length - 1] as T;
    
  } catch (error) {
    logger.fail(rootId, error as Error);
    
    // Rollback all operations
    try {
      await logger.rollbackTransaction(rootId);
    } catch (rollbackError) {
      // Rollback failed - this is serious
      throw new ArashiError('Transaction rollback failed', {
        code: ErrorCode.ROLLBACK_FAILED,
        cause: rollbackError as Error,
        details: {
          originalError: (error as Error).message,
          rollbackError: (rollbackError as Error).message,
        },
        recoverable: false,
        suggestions: [
          'Manual cleanup may be required',
          'Check operation log for details',
        ],
      });
    }
    
    throw error;
  }
}

interface TransactionOperation {
  type: OperationType;
  details: OperationDetails;
  execute: (logger: OperationLogger, operationId: string) => Promise<unknown>;
}
```

### Pattern 4: Safe Operation Wrapper

```typescript
/**
 * Wrap operation with error handling and rollback
 */
async function safeOperation<T>(
  operationType: OperationType,
  details: OperationDetails,
  execute: (logger: OperationLogger, operationId: string) => Promise<T>,
  options: SafeOperationOptions = {}
): Promise<T> {
  const {
    logger = new OperationLogger(),
    rollbackOnError = true,
    retryOnFailure = false,
    retryOptions,
  } = options;

  const operationId = await logger.start(operationType, details);

  try {
    logger.setRunning(operationId);
    
    const executeWithRetry = retryOnFailure
      ? () => retryWithBackoff(() => execute(logger, operationId), retryOptions)
      : () => execute(logger, operationId);
    
    const result = await executeWithRetry();
    
    logger.complete(operationId);
    return result;
    
  } catch (error) {
    logger.fail(operationId, error as Error);
    
    if (rollbackOnError) {
      try {
        await logger.rollback(operationId);
      } catch (rollbackError) {
        // Log rollback failure but throw original error
        console.error('Rollback failed:', rollbackError);
      }
    }
    
    throw error;
  }
}

interface SafeOperationOptions {
  logger?: OperationLogger;
  rollbackOnError?: boolean;
  retryOnFailure?: boolean;
  retryOptions?: RetryOptions;
}
```

---

## Error Factory Functions

Convenience functions for creating common errors:

```typescript
/**
 * Error factory functions
 */
export const ErrorFactory = {
  notInitialized: (projectRoot: string): ArashiError =>
    new ArashiError('arashi is not initialized', {
      code: ErrorCode.NOT_INITIALIZED,
      details: { projectRoot },
      suggestions: [
        "Run 'arashi init' to initialize",
      ],
      exitCode: 6,
    }),

  alreadyInitialized: (configPath: string): ArashiError =>
    new ArashiError('arashi is already initialized', {
      code: ErrorCode.ALREADY_INITIALIZED,
      details: { configPath },
      suggestions: [
        "Use --force to reinitialize",
      ],
      exitCode: 2,
    }),

  notGitRepository: (path: string): ArashiError =>
    new ArashiError('Not a git repository', {
      code: ErrorCode.NOT_GIT_REPOSITORY,
      details: { path },
      suggestions: [
        "Run 'git init' to create a repository",
        "Navigate to a git repository",
      ],
      exitCode: 1,
    }),

  branchExists: (branch: string): ArashiError =>
    new ArashiError('Branch already exists', {
      code: ErrorCode.BRANCH_EXISTS,
      details: { branch },
      suggestions: [
        "Use --force to overwrite",
        "Choose a different branch name",
      ],
      exitCode: 2,
    }),

  worktreeDirty: (path: string, changes: number): ArashiError =>
    new ArashiError('Worktree has uncommitted changes', {
      code: ErrorCode.WORKTREE_DIRTY,
      details: { path, changes },
      suggestions: [
        "Commit or stash your changes",
        "Use --force to remove anyway",
      ],
      exitCode: 2,
    }),

  invalidTaskId: (taskId: string, pattern: string): ArashiError =>
    new ArashiError('Invalid task ID format', {
      code: ErrorCode.INVALID_TASK_ID,
      details: { taskId, expectedPattern: pattern },
      suggestions: [
        `Task ID must match pattern: ${pattern}`,
      ],
      exitCode: 10,
    }),

  gitCommandFailed: (
    command: string,
    stderr: string,
    cause?: Error
  ): ArashiError =>
    new ArashiError('Git command failed', {
      code: ErrorCode.GIT_COMMAND_FAILED,
      cause,
      details: { command, stderr },
      suggestions: [
        "Check git installation",
        "Verify repository state",
      ],
      exitCode: 5,
    }),

  maxWorktreesExceeded: (max: number): ArashiError =>
    new ArashiError('Maximum worktrees exceeded', {
      code: ErrorCode.MAX_WORKTREES_EXCEEDED,
      details: { maxWorktrees: max },
      suggestions: [
        "Remove an existing worktree",
        "Increase maxWorktrees in config",
      ],
      exitCode: 2,
    }),
};
```

---

## Testing Requirements

### Error Handling Tests

```typescript
describe('Error Handling', () => {
  describe('ArashiError', () => {
    it('should create error with all fields', () => {});
    it('should format error for display', () => {});
    it('should serialize to JSON', () => {});
    it('should check error type with is()', () => {});
    it('should include stack trace', () => {});
  });

  describe('Operation Logger', () => {
    it('should log operation start', () => {});
    it('should record changes', () => {});
    it('should complete operation', () => {});
    it('should fail operation with error', () => {});
    it('should rollback single operation', () => {});
    it('should rollback nested operations', () => {});
    it('should export/import log', () => {});
  });

  describe('Rollback', () => {
    it('should rollback file creation', () => {});
    it('should rollback branch creation', () => {});
    it('should rollback worktree creation', () => {});
    it('should rollback config changes', () => {});
    it('should handle rollback failures', () => {});
  });

  describe('Error Recovery', () => {
    it('should retry with backoff', () => {});
    it('should use fallback on error', () => {});
    it('should execute transaction with rollback', () => {});
    it('should wrap operation safely', () => {});
  });
});
```

---

## Change Log

### Version 1.0.0 (2026-02-03)
- Initial error handling contract
- ArashiError class definition
- Operation logging system
- Rollback patterns
- Error recovery strategies
