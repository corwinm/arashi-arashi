/**
 * List Command API Contract
 * 
 * This file defines the TypeScript interfaces and function signatures for the
 * list command. These contracts serve as the API specification for implementation.
 * 
 * Feature: 001-list-command
 * Date: 2026-02-06
 */

// ============================================================================
// Data Types
// ============================================================================

/**
 * Represents a nested repository within a worktree
 */
export interface SubRepositoryInfo {
  /** Path relative to parent worktree */
  relativePath: string;
  /** Branch name (null if detached HEAD) */
  branch: string | null;
  /** Short commit SHA (7 characters) */
  commit: string;
  /** Whether uncommitted changes exist */
  hasChanges: boolean;
}

/**
 * Represents a single worktree with its status and metadata
 */
export interface WorktreeListItem {
  /** Absolute filesystem path to worktree */
  path: string;
  /** Branch name (null if detached HEAD) */
  branch: string | null;
  /** Short commit SHA (7 characters) */
  commit: string;
  /** Whether worktree is locked */
  locked: boolean;
  /** Lock reason (if locked) */
  lockReason?: string;
  /** Whether uncommitted changes exist */
  hasChanges: boolean;
  /** True for main worktree, false for linked worktrees */
  isMain: boolean;
  /** Nested sub-repositories (only present in verbose mode) */
  subRepositories?: SubRepositoryInfo[];
}

/**
 * Command-line options for the list command
 */
export interface ListCommandOptions {
  /** Show detailed sub-repository information */
  verbose?: boolean;
  /** Output in JSON format */
  json?: boolean;
  /** Maximum depth for sub-repository discovery (default: 3) */
  maxDepth?: number;
}

/**
 * Complete output structure for the list command
 */
export interface ListCommandOutput {
  /** List of all worktrees */
  worktrees: WorktreeListItem[];
  /** Total number of worktrees */
  totalCount: number;
  /** Path to main repository */
  repositoryPath: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error class for list command errors
 */
export class ListCommandError extends Error {
  /**
   * Original error that caused this error (if any)
   */
  public readonly cause?: Error;
  
  /**
   * Additional context about the error
   */
  public readonly context?: any;
  
  constructor(message: string, cause?: Error, context?: any) {
    super(message);
    this.name = 'ListCommandError';
    this.cause = cause;
    this.context = context;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ListCommandError);
    }
  }
}

/**
 * Error thrown when not in a git repository
 */
export class NotInRepositoryError extends ListCommandError {
  constructor(path: string) {
    super(
      `Not a git repository: ${path}. Run from repository root.`,
      undefined,
      { path }
    );
    this.name = 'NotInRepositoryError';
  }
}

/**
 * Error thrown when configuration is missing
 */
export class ConfigurationMissingError extends ListCommandError {
  constructor(path: string) {
    super(
      `Configuration not found at ${path}. Run "arashi init" first.`,
      undefined,
      { path }
    );
    this.name = 'ConfigurationMissingError';
  }
}

// ============================================================================
// Main Command Function
// ============================================================================

/**
 * Execute the list command
 * 
 * Lists all worktrees associated with the main repository. Supports both
 * human-readable table output and machine-parseable JSON output. Can optionally
 * include detailed sub-repository information in verbose mode.
 * 
 * @param options - Command options (verbose, json, maxDepth)
 * @returns Promise that resolves when command completes successfully
 * @throws {NotInRepositoryError} If current directory is not a git repository
 * @throws {ConfigurationMissingError} If arashi configuration not found
 * @throws {ListCommandError} If git operations fail
 * 
 * @example
 * ```typescript
 * // Basic usage (human-readable table output)
 * await listCommand({ verbose: false, json: false });
 * 
 * // JSON output for tool integration
 * await listCommand({ json: true });
 * 
 * // Verbose mode with sub-repositories
 * await listCommand({ verbose: true, json: false });
 * 
 * // JSON output with verbose data
 * await listCommand({ verbose: true, json: true, maxDepth: 5 });
 * ```
 */
export async function listCommand(options?: ListCommandOptions): Promise<void>;

// ============================================================================
// Internal Functions (exported for testing)
// ============================================================================

/**
 * Gather worktree data from git
 * 
 * Queries git for all worktrees and their status. Does NOT include
 * sub-repository discovery (see discoverSubRepositories).
 * 
 * @param repoPath - Path to main repository
 * @returns List of worktrees with status
 * @throws {ListCommandError} If git operations fail
 * 
 * @example
 * ```typescript
 * const worktrees = await gatherWorktreeData('/path/to/repo');
 * console.log(`Found ${worktrees.length} worktrees`);
 * ```
 */
export async function gatherWorktreeData(repoPath: string): Promise<WorktreeListItem[]>;

/**
 * Discover sub-repositories within a worktree
 * 
 * Recursively scans the worktree directory for nested git repositories.
 * Respects maxDepth setting to limit filesystem traversal.
 * 
 * @param worktreePath - Absolute path to worktree
 * @param maxDepth - Maximum directory depth to scan (default: 3)
 * @returns List of discovered sub-repositories
 * @throws {ListCommandError} If filesystem operations fail
 * 
 * @example
 * ```typescript
 * const subRepos = await discoverSubRepositories('/path/to/worktree', 3);
 * subRepos.forEach(repo => {
 *   console.log(`Found: ${repo.relativePath} (${repo.branch})`);
 * });
 * ```
 */
export async function discoverSubRepositories(
  worktreePath: string,
  maxDepth?: number
): Promise<SubRepositoryInfo[]>;

/**
 * Format worktree data as human-readable table
 * 
 * Creates a formatted table with color-coded status indicators using chalk.
 * Includes headers, separator lines, and legend.
 * 
 * @param output - Complete output data
 * @param verbose - Whether to include verbose sub-repository information
 * @returns Formatted string ready for console output
 * 
 * @example
 * ```typescript
 * const output = await buildListOutput('/path/to/repo', { verbose: false });
 * const table = formatAsTable(output, false);
 * console.log(table);
 * ```
 */
export function formatAsTable(output: ListCommandOutput, verbose: boolean): string;

/**
 * Format worktree data as JSON
 * 
 * Serializes the output as pretty-printed JSON (2-space indentation).
 * 
 * @param output - Complete output data
 * @returns JSON string
 * 
 * @example
 * ```typescript
 * const output = await buildListOutput('/path/to/repo', { verbose: true });
 * const json = formatAsJson(output);
 * console.log(json);
 * ```
 */
export function formatAsJson(output: ListCommandOutput): string;

/**
 * Build complete list output structure
 * 
 * Orchestrates data gathering, sub-repository discovery, and builds the
 * complete ListCommandOutput structure.
 * 
 * @param repoPath - Path to main repository
 * @param options - Command options
 * @returns Complete output structure
 * @throws {ListCommandError} If operations fail
 * 
 * @example
 * ```typescript
 * const output = await buildListOutput('/path/to/repo', {
 *   verbose: true,
 *   maxDepth: 3
 * });
 * console.log(`Total worktrees: ${output.totalCount}`);
 * ```
 */
export async function buildListOutput(
  repoPath: string,
  options: ListCommandOptions
): Promise<ListCommandOutput>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate WorktreeListItem structure
 * 
 * Checks all required fields and types. Throws if invalid.
 * 
 * @param item - Object to validate
 * @throws {ListCommandError} If validation fails
 * 
 * @example
 * ```typescript
 * try {
 *   validateWorktreeListItem(data);
 * } catch (error) {
 *   console.error('Invalid worktree data:', error.message);
 * }
 * ```
 */
export function validateWorktreeListItem(item: any): asserts item is WorktreeListItem;

/**
 * Validate ListCommandOutput structure
 * 
 * Checks all required fields, validates each worktree item, and ensures
 * exactly one main worktree exists.
 * 
 * @param output - Object to validate
 * @throws {ListCommandError} If validation fails
 * 
 * @example
 * ```typescript
 * try {
 *   validateListCommandOutput(data);
 * } catch (error) {
 *   console.error('Invalid output structure:', error.message);
 * }
 * ```
 */
export function validateListCommandOutput(output: any): asserts output is ListCommandOutput;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get short commit SHA (7 characters)
 * 
 * @param repoPath - Path to repository
 * @returns Short commit SHA
 * @throws {ListCommandError} If git command fails
 */
export async function getShortCommitSha(repoPath: string): Promise<string>;

/**
 * Determine if a worktree has uncommitted changes
 * 
 * @param worktreePath - Path to worktree
 * @returns True if changes exist
 * @throws {ListCommandError} If git status fails
 */
export async function hasUncommittedChanges(worktreePath: string): Promise<boolean>;

/**
 * Find all git repositories within a directory
 * 
 * Recursively scans for .git directories up to maxDepth.
 * 
 * @param rootPath - Directory to scan
 * @param maxDepth - Maximum depth to traverse
 * @param excludeRoot - Whether to exclude root's .git directory
 * @returns List of absolute paths to git repositories
 */
export async function findGitRepositories(
  rootPath: string,
  maxDepth: number,
  excludeRoot?: boolean
): Promise<string[]>;

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Basic list command
 */
async function example1_basicList() {
  // List all worktrees in human-readable format
  await listCommand({ verbose: false, json: false });
  
  // Output:
  // Worktrees (3 total)
  // 
  // PATH                                    BRANCH           STATUS    
  // ────────────────────────────────────────────────────────────────
  // /Users/user/projects/myrepo             main             ✓ clean   
  // /Users/user/worktrees/feature-123       feature-123      ✗ modified
  // /Users/user/worktrees/hotfix-456        hotfix-456       ✓ clean   
}

/**
 * Example 2: JSON output for tool integration
 */
async function example2_jsonOutput() {
  // Output in JSON format for piping to jq, fzf, etc.
  await listCommand({ json: true });
  
  // Output:
  // [
  //   {
  //     "path": "/Users/user/projects/myrepo",
  //     "branch": "main",
  //     "commit": "a1b2c3d",
  //     "locked": false,
  //     "hasChanges": false,
  //     "isMain": true
  //   },
  //   ...
  // ]
}

/**
 * Example 3: Verbose mode with sub-repositories
 */
async function example3_verboseMode() {
  // Show detailed sub-repository information
  await listCommand({ verbose: true, json: false });
  
  // Output:
  // Worktrees (2 total)
  // 
  // PATH: /Users/user/projects/myrepo
  // BRANCH: main
  // STATUS: ✓ clean
  // TYPE: Main worktree
  // 
  // PATH: /Users/user/worktrees/feature-123
  // BRANCH: feature-123
  // STATUS: ✗ modified
  // TYPE: Linked worktree
  // SUB-REPOSITORIES:
  //   ├── repos/frontend (feature-123) - ✓ clean
  //   ├── repos/backend (feature-123) - ✗ modified
  //   └── repos/shared (feature-123) - ✓ clean
}

/**
 * Example 4: Integration with fzf for worktree selection
 */
async function example4_fzfIntegration() {
  // Usage in shell:
  // arashi list --json | jq -r '.[].path' | fzf
  
  // This allows users to interactively select a worktree and cd into it:
  // cd $(arashi list --json | jq -r '.[].path' | fzf)
}

/**
 * Example 5: Error handling
 */
async function example5_errorHandling() {
  try {
    await listCommand({ verbose: true });
  } catch (error) {
    if (error instanceof NotInRepositoryError) {
      console.error('Error: Not in a git repository');
      console.error('Run this command from a repository root.');
    } else if (error instanceof ConfigurationMissingError) {
      console.error('Error: Arashi not initialized');
      console.error('Run "arashi init" to create configuration.');
    } else if (error instanceof ListCommandError) {
      console.error('Error:', error.message);
      if (error.cause) {
        console.error('Caused by:', error.cause.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 6: Programmatic usage (building output structure)
 */
async function example6_programmaticUsage() {
  const repoPath = '/Users/user/projects/myrepo';
  
  // Build output structure
  const output = await buildListOutput(repoPath, {
    verbose: true,
    maxDepth: 3
  });
  
  // Validate structure
  validateListCommandOutput(output);
  
  // Process worktrees
  for (const worktree of output.worktrees) {
    console.log(`Worktree: ${worktree.path}`);
    console.log(`  Branch: ${worktree.branch || 'detached'}`);
    console.log(`  Status: ${worktree.hasChanges ? 'modified' : 'clean'}`);
    
    if (worktree.subRepositories) {
      console.log(`  Sub-repos: ${worktree.subRepositories.length}`);
      for (const subRepo of worktree.subRepositories) {
        console.log(`    - ${subRepo.relativePath} (${subRepo.branch})`);
      }
    }
  }
}
