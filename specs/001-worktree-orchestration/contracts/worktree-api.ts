/**
 * API Contracts: Worktree Orchestration
 * 
 * TypeScript interfaces for coordinated worktree creation across multiple repositories.
 * These contracts define the public API for the core/worktree.ts module.
 * 
 * Feature: 001-worktree-orchestration
 * Date: 2026-02-04
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Filtering modes for repository selection
 */
export type RepositoryFilterMode = 'all' | 'explicit' | 'interactive';

/**
 * Strategies for resolving branch name conflicts
 */
export type ConflictResolutionStrategy = 'ABORT' | 'REUSE_EXISTING' | 'CREATE_ALTERNATE';

/**
 * Hook types supported by the system
 */
export type HookType = 'pre-create' | 'post-create';

/**
 * Result status for individual repository operations
 */
export type RepositoryResultStatus = 'success' | 'failed' | 'skipped';

/**
 * Operation states during execution
 */
export type OperationState = 
  | 'INITIALIZING'
  | 'VALIDATING'
  | 'FILTERING'
  | 'CONFLICT_CHECKING'
  | 'EXECUTING'
  | 'ROLLING_BACK'
  | 'COMPLETED'
  | 'FAILED';

// ============================================================================
// Configuration and Options
// ============================================================================

/**
 * Options for worktree creation operation
 */
export interface WorktreeOperationOptions {
  /** Whether to execute pre-create and post-create hooks */
  executeHooks?: boolean;
  
  /** Timeout in milliseconds for hook execution */
  hookTimeout?: number;
  
  /** Whether to use interactive repository selection */
  interactive?: boolean;
  
  /** Pre-selected conflict resolution strategy (null to prompt user) */
  conflictResolution?: ConflictResolutionStrategy | null;
  
  /** Whether to display progress spinners */
  showProgress?: boolean;
  
  /** Whether to simulate operation without making changes */
  dryRun?: boolean;
}

/**
 * Repository filter criteria
 */
export interface RepositoryFilter {
  /** Filtering mode */
  mode: RepositoryFilterMode;
  
  /** Explicit list of repository names (only used when mode is 'explicit') */
  explicitList: string[];
  
  /** Resolved repositories after filtering (populated after filter application) */
  selectedRepositories: Repository[] | null;
}

// ============================================================================
// Entities from Dependencies
// ============================================================================

/**
 * Repository information (from 001-repository-management)
 */
export interface Repository {
  /** Repository name */
  name: string;
  
  /** Absolute path to repository */
  path: string;
  
  /** Default branch name (main, master, develop, etc.) */
  defaultBranch: string;
  
  /** Whether setup.sh script exists */
  hasSetupScript: boolean;
}

/**
 * Operation log entry (from 001-rollback-mechanism)
 */
export interface LogEntry {
  /** Operation type */
  type: 'worktree_created' | 'branch_created' | 'directory_created';
  
  /** Timestamp when operation occurred */
  timestamp: number;
  
  /** Type-specific reversal information */
  data: Record<string, any>;
}

/**
 * Operation log for rollback (from 001-rollback-mechanism)
 */
export interface OperationLog {
  /** Chronological list of logged operations */
  entries: LogEntry[];
  
  /** Add operation to log */
  add(entry: LogEntry): void;
  
  /** Reverse all logged operations */
  rollback(): RollbackResult;
}

/**
 * Result of rollback operation (from 001-rollback-mechanism)
 */
export interface RollbackResult {
  /** Total number of operations rolled back */
  totalOperations: number;
  
  /** Number of successful rollbacks */
  successCount: number;
  
  /** Number of failed rollbacks */
  failureCount: number;
  
  /** Detailed failures */
  failures: Array<{ operation: LogEntry; error: Error }>;
}

// ============================================================================
// Conflict Detection and Resolution
// ============================================================================

/**
 * Detected branch name conflict
 */
export interface BranchConflict {
  /** Repository with the conflict */
  repository: Repository;
  
  /** Conflicting branch name */
  branchName: string;
  
  /** Whether branch exists locally */
  existsLocally: boolean;
  
  /** Whether branch exists on remote */
  existsRemotely: boolean;
  
  /** User's chosen resolution (null until resolved) */
  resolution: ConflictResolutionStrategy | null;
}

/**
 * Result of conflict detection pre-flight check
 */
export interface ConflictCheckResult {
  /** Whether any conflicts were detected */
  hasConflicts: boolean;
  
  /** List of detected conflicts */
  conflicts: BranchConflict[];
  
  /** Repositories without conflicts (can proceed immediately) */
  nonConflictingRepositories: Repository[];
}

// ============================================================================
// Hook Execution
// ============================================================================

/**
 * Context for hook script execution
 */
export interface HookExecutionContext {
  /** Type of hook being executed */
  hookType: HookType;
  
  /** Target branch name */
  branchName: string;
  
  /** Absolute path to repository */
  repositoryPath: string;
  
  /** Name of repository from configuration */
  repositoryName: string;
  
  /** Path to worktree (null for pre-create, populated for post-create) */
  worktreePath: string | null;
  
  /** Environment variables to pass to hook script */
  environment: Record<string, string>;
  
  /** Timeout in milliseconds */
  timeout: number;
}

/**
 * Result of hook execution
 */
export interface HookExecutionResult {
  /** Whether hook executed successfully */
  success: boolean;
  
  /** Exit code from hook script */
  exitCode: number;
  
  /** Standard output from hook */
  stdout: string;
  
  /** Standard error from hook */
  stderr: string;
  
  /** Execution time in milliseconds */
  duration: number;
  
  /** Error if execution failed */
  error?: Error;
}

// ============================================================================
// Operation Results
// ============================================================================

/**
 * Result of worktree creation for a single repository
 */
export interface RepositoryResult {
  /** Repository processed */
  repository: Repository;
  
  /** Outcome status */
  status: RepositoryResultStatus;
  
  /** Path to created worktree (null if failed or skipped) */
  worktreePath: string | null;
  
  /** Branch name used (may differ from requested if alternate created) */
  branchName: string;
  
  /** Error object if status is 'failed' */
  error: Error | null;
  
  /** Non-fatal warnings */
  warnings: string[];
  
  /** Time taken to process this repository in milliseconds */
  duration: number;
}

/**
 * Summary of completed worktree creation operation
 */
export interface OperationSummary {
  /** Total number of repositories attempted */
  totalRepositories: number;
  
  /** Number of repositories where worktree was successfully created */
  successCount: number;
  
  /** Number of repositories that failed */
  failureCount: number;
  
  /** Number of repositories skipped */
  skippedCount: number;
  
  /** Detailed results for each repository */
  repositoryResults: RepositoryResult[];
  
  /** Whether rollback was triggered */
  rolledBack: boolean;
  
  /** Total operation time in milliseconds */
  totalDuration: number;
  
  /** Human-readable error summary if operation failed */
  errorSummary: string | null;
}

// ============================================================================
// Main Orchestration API
// ============================================================================

/**
 * Create coordinated worktrees across multiple repositories
 * 
 * This is the main entry point for worktree orchestration. It coordinates
 * repository filtering, conflict detection, worktree creation, hook execution,
 * and automatic rollback on failure.
 * 
 * @param branchName - Branch name to create across repositories
 * @param filter - Repository filter criteria
 * @param options - Operation options
 * @returns Promise resolving to operation summary
 * @throws RepositoryValidationError if repositories don't exist or aren't valid
 * @throws ConflictError if conflicts detected and user aborts
 * @throws GitOperationError if git operations fail (triggers rollback)
 */
export async function createCoordinatedWorktrees(
  branchName: string,
  filter: RepositoryFilter,
  options?: WorktreeOperationOptions
): Promise<OperationSummary>;

/**
 * Check for branch name conflicts across repositories (pre-flight check)
 * 
 * Scans all repositories to detect if the specified branch name already exists
 * locally or remotely. Used before starting worktree creation to prompt user
 * for conflict resolution.
 * 
 * @param branchName - Branch name to check
 * @param repositories - Repositories to check
 * @returns Promise resolving to conflict check result
 */
export async function checkBranchConflicts(
  branchName: string,
  repositories: Repository[]
): Promise<ConflictCheckResult>;

/**
 * Resolve branch conflicts with user interaction
 * 
 * Presents conflict resolution dialog to user and applies selected strategy
 * to all conflicts. If user aborts, throws error to cancel operation.
 * 
 * @param conflicts - Detected conflicts to resolve
 * @param options - Operation options (may include pre-selected strategy)
 * @returns Promise resolving to chosen conflict resolution strategy
 * @throws ConflictAbortedError if user chooses to abort
 */
export async function resolveConflicts(
  conflicts: BranchConflict[],
  options?: WorktreeOperationOptions
): Promise<ConflictResolutionStrategy>;

/**
 * Apply repository filter to get selected repositories
 * 
 * Applies the specified filter mode to the configured repositories:
 * - 'all': Returns all configured repositories
 * - 'explicit': Returns only repositories in explicitList
 * - 'interactive': Prompts user to select repositories
 * 
 * @param filter - Repository filter criteria
 * @param allRepositories - All configured repositories
 * @returns Promise resolving to filtered repository list
 * @throws RepositoryValidationError if explicit names don't match any repositories
 */
export async function applyRepositoryFilter(
  filter: RepositoryFilter,
  allRepositories: Repository[]
): Promise<Repository[]>;

/**
 * Execute lifecycle hook for a repository
 * 
 * Runs a pre-create or post-create hook script with the specified context.
 * Enforces timeout and captures output. Throws error if hook fails.
 * 
 * @param context - Hook execution context
 * @returns Promise resolving to hook execution result
 * @throws HookExecutionError if hook fails or times out
 */
export async function executeHook(
  context: HookExecutionContext
): Promise<HookExecutionResult>;

/**
 * Validate branch name format
 * 
 * Checks if the branch name is valid according to git naming rules:
 * - No spaces
 * - No special characters like ~, ^, :, ?, *, [
 * - Cannot start with - or /
 * - Cannot end with .lock
 * 
 * @param branchName - Branch name to validate
 * @returns true if valid, false otherwise
 */
export function isValidBranchName(branchName: string): boolean;

// ============================================================================
// Error Types
// ============================================================================

/**
 * Error thrown when repository validation fails
 */
export class RepositoryValidationError extends Error {
  constructor(
    message: string,
    public readonly repositoryName: string,
    public readonly repositoryPath?: string
  );
}

/**
 * Error thrown when git operation fails
 */
export class GitOperationError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly repository: Repository,
    public readonly originalError: Error
  );
}

/**
 * Error thrown when hook execution fails
 */
export class HookExecutionError extends Error {
  constructor(
    message: string,
    public readonly hookType: HookType,
    public readonly repository: Repository,
    public readonly exitCode: number,
    public readonly stderr: string
  );
}

/**
 * Error thrown when user aborts due to conflicts
 */
export class ConflictAbortedError extends Error {
  constructor(
    message: string,
    public readonly conflicts: BranchConflict[]
  );
}

/**
 * Error thrown when branch name is invalid
 */
export class InvalidBranchNameError extends Error {
  constructor(
    message: string,
    public readonly branchName: string,
    public readonly reason: string
  );
}

/**
 * Error thrown when insufficient permissions
 */
export class InsufficientPermissionsError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly operation: string
  );
}
