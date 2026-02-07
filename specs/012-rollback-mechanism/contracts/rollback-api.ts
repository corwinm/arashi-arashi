/**
 * API Contracts: Rollback Mechanism
 * 
 * TypeScript interfaces for operation logging and automatic rollback.
 * These contracts define the public API for the core/rollback.ts module.
 * 
 * Feature: 012-rollback-mechanism
 * Date: 2026-02-04
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Operation types that can be logged and rolled back
 */
export type OperationType = 'worktree_created' | 'branch_created' | 'directory_created';

// ============================================================================
// Log Entry Types (Discriminated Union)
// ============================================================================

/**
 * Log entry for worktree creation
 */
export interface WorktreeCreatedEntry {
  type: 'worktree_created';
  timestamp: number;
  data: {
    repositoryPath: string;
    worktreePath: string;
    branchName: string;
  };
}

/**
 * Log entry for branch creation
 */
export interface BranchCreatedEntry {
  type: 'branch_created';
  timestamp: number;
  data: {
    repositoryPath: string;
    branchName: string;
  };
}

/**
 * Log entry for directory creation
 */
export interface DirectoryCreatedEntry {
  type: 'directory_created';
  timestamp: number;
  data: {
    directoryPath: string;
  };
}

/**
 * Union type for all log entry types
 */
export type LogEntry = WorktreeCreatedEntry | BranchCreatedEntry | DirectoryCreatedEntry;

// ============================================================================
// Rollback Results
// ============================================================================

/**
 * Details of a failed rollback operation
 */
export interface RollbackFailure {
  /** The log entry that failed to rollback */
  entry: LogEntry;
  
  /** The error that occurred */
  error: Error;
  
  /** Position in operation log (0-based) */
  operationIndex: number;
}

/**
 * Result of rollback execution
 */
export interface RollbackResult {
  /** Total number of operations in log */
  totalOperations: number;
  
  /** Number of successfully reversed operations */
  successCount: number;
  
  /** Number of failed reversal operations */
  failureCount: number;
  
  /** Details of failed operations */
  failures: RollbackFailure[];
  
  /** Total rollback time in milliseconds */
  duration: number;
}

// ============================================================================
// Operation Log Class
// ============================================================================

/**
 * Operation log for tracking and rolling back operations
 * 
 * Usage:
 * ```typescript
 * const log = new OperationLog();
 * 
 * // Log operations
 * log.add({ type: 'worktree_created', timestamp: Date.now(), data: { ... } });
 * log.add({ type: 'branch_created', timestamp: Date.now(), data: { ... } });
 * 
 * // Rollback on error
 * const result = await log.rollback();
 * console.log(`Rolled back ${result.successCount} of ${result.totalOperations} operations`);
 * ```
 */
export class OperationLog {
  /** Chronological list of logged operations */
  entries: LogEntry[];
  
  /** Flag to prevent concurrent rollbacks */
  private isRollingBack: boolean;
  
  constructor();
  
  /**
   * Add operation to log
   * 
   * @param entry - Log entry with operation type and reversal data
   * @throws Error if rollback is in progress
   * @throws Error if entry is invalid (missing required fields)
   */
  add(entry: LogEntry): void;
  
  /**
   * Rollback all logged operations in reverse order (LIFO)
   * 
   * Continues rollback even if individual operations fail. Returns summary
   * with success/failure counts and details of any failures.
   * 
   * @returns Promise resolving to rollback result
   * @throws Error if rollback already in progress
   */
  rollback(): Promise<RollbackResult>;
  
  /**
   * Check if rollback is currently in progress
   * 
   * @returns true if rollback is executing, false otherwise
   */
  isRollbackInProgress(): boolean;
  
  /**
   * Get number of logged operations
   * 
   * @returns Entry count
   */
  getEntryCount(): number;
  
  /**
   * Clear all entries from log
   * 
   * @throws Error if rollback is in progress
   */
  clear(): void;
}

// ============================================================================
// Type-Specific Rollback Functions
// ============================================================================

/**
 * Rollback a worktree creation operation
 * 
 * Removes the worktree using git worktree remove command. Handles case where
 * worktree no longer exists (treats as success).
 * 
 * @param entry - Worktree creation log entry
 * @returns Promise resolving when rollback completes
 * @throws Error if worktree removal fails (permission denied, etc.)
 */
export async function rollbackWorktreeCreated(
  entry: WorktreeCreatedEntry
): Promise<void>;

/**
 * Rollback a branch creation operation
 * 
 * Deletes the branch using git branch -D command. Handles case where branch
 * no longer exists (treats as success).
 * 
 * @param entry - Branch creation log entry
 * @returns Promise resolving when rollback completes
 * @throws Error if branch deletion fails
 */
export async function rollbackBranchCreated(
  entry: BranchCreatedEntry
): Promise<void>;

/**
 * Rollback a directory creation operation
 * 
 * Removes the directory and its contents recursively. Handles case where
 * directory no longer exists (treats as success).
 * 
 * @param entry - Directory creation log entry
 * @returns Promise resolving when rollback completes
 * @throws Error if directory removal fails (permission denied, file locks, etc.)
 */
export async function rollbackDirectoryCreated(
  entry: DirectoryCreatedEntry
): Promise<void>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate log entry structure
 * 
 * Checks that entry has valid type and all required data fields for that type.
 * 
 * @param entry - Log entry to validate
 * @returns true if valid, false otherwise
 */
export function isValidLogEntry(entry: any): entry is LogEntry;

/**
 * Validate worktree created entry data
 * 
 * @param data - Entry data to validate
 * @returns true if all required fields present
 */
export function isValidWorktreeCreatedData(data: any): boolean;

/**
 * Validate branch created entry data
 * 
 * @param data - Entry data to validate
 * @returns true if all required fields present
 */
export function isValidBranchCreatedData(data: any): boolean;

/**
 * Validate directory created entry data
 * 
 * @param data - Entry data to validate
 * @returns true if all required fields present
 */
export function isValidDirectoryCreatedData(data: any): boolean;

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error thrown when attempting to add entry during rollback
 */
export class RollbackInProgressError extends Error {
  constructor(message: string);
}

/**
 * Error thrown when attempting concurrent rollback
 */
export class ConcurrentRollbackError extends Error {
  constructor(message: string);
}

/**
 * Error thrown when log entry is invalid
 */
export class InvalidLogEntryError extends Error {
  constructor(
    message: string,
    public readonly entry: any,
    public readonly reason: string
  );
}
