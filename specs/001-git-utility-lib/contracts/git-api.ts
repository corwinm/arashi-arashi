/**
 * Git Utility Library API Contract
 * 
 * This file defines the TypeScript interfaces for the git utility library.
 * All functions are async and may throw ArashiError on failure.
 * 
 * @module git-api
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Result of executing a git command
 */
export interface CommandResult {
  /** Standard output from command */
  stdout: string;
  /** Standard error output from command */
  stderr: string;
  /** Process exit code (0 = success) */
  exitCode: number;
}

/**
 * Diagnostic context for git operation errors
 */
export interface GitErrorContext {
  stdout: string;
  stderr: string;
  exitCode: number;
  args: string[];
  cwd?: string;
}

/**
 * Represents a git worktree
 */
export interface Worktree {
  /** Absolute filesystem path */
  path: string;
  /** Branch name (null if detached HEAD) */
  branch: string | null;
  /** Commit SHA */
  commit: string;
  /** Whether worktree is locked */
  locked: boolean;
  /** Lock reason (if locked) */
  lockReason?: string;
}

/**
 * Represents a git branch
 */
export interface Branch {
  /** Branch name */
  name: string;
  /** Commit SHA */
  commit: string;
  /** Upstream tracking branch (e.g., 'origin/main') */
  upstream: string | null;
  /** Whether branch is merged */
  merged: boolean;
}

/**
 * Represents a file status entry
 */
export interface StatusEntry {
  /** File path relative to repository root */
  path: string;
  /** Status in index (' ', 'M', 'A', 'D', 'R', 'C', 'U', '?') */
  indexStatus: string;
  /** Status in worktree (' ', 'M', 'D', '?') */
  worktreeStatus: string;
  /** Original path (for renames) */
  originalPath?: string;
}

/**
 * Repository information
 */
export interface RepositoryInfo {
  /** Absolute filesystem path */
  path: string;
  /** Repository type */
  type: 'normal' | 'bare';
  /** Default branch name */
  defaultBranch: string | null;
}

// ============================================================================
// Error Class
// ============================================================================

/**
 * Custom error class for git operations
 * 
 * @example
 * try {
 *   await createWorktree('/repo', 'feature', '/worktree');
 * } catch (error) {
 *   if (error instanceof ArashiError) {
 *     console.error(`Git operation failed: ${error.message}`);
 *     console.error(`Git output: ${error.context.stderr}`);
 *     console.error(`Error code: ${error.code}`);
 *   }
 * }
 */
export class ArashiError extends Error {
  readonly name: 'ArashiError';
  readonly context: GitErrorContext;
  readonly code: string;
  
  constructor(message: string, context: GitErrorContext);
  toJSON(): object;
}

// ============================================================================
// Core Functions - Command Execution
// ============================================================================

/**
 * Execute a git command and capture output
 * 
 * @param args - Git command arguments (e.g., ['status', '--porcelain'])
 * @param cwd - Working directory to execute command in
 * @returns Command result with stdout, stderr, and exit code
 * @throws {ArashiError} If command fails (non-zero exit code)
 * 
 * @example
 * const result = await exec(['status', '--porcelain'], '/path/to/repo');
 * console.log(result.stdout);
 */
export function exec(args: string[], cwd: string): Promise<CommandResult>;

// ============================================================================
// Repository Detection Functions
// ============================================================================

/**
 * Check if a path is a git repository
 * 
 * Checks for .git directory or .git file (submodule/worktree reference).
 * 
 * @param path - Filesystem path to check
 * @returns true if path is a git repository
 * 
 * @example
 * if (isGitRepository('/path/to/repo')) {
 *   console.log('Valid git repository');
 * }
 */
export function isGitRepository(path: string): boolean;

/**
 * Check if a path is a bare git repository
 * 
 * Checks for HEAD, refs/, and objects/ directories in repository root.
 * 
 * @param path - Filesystem path to check
 * @returns true if path is a bare repository
 * 
 * @example
 * if (isGitBareRepo('/path/to/repo.git')) {
 *   console.log('Bare repository detected');
 * }
 */
export function isGitBareRepo(path: string): boolean;

// ============================================================================
// Worktree Management Functions
// ============================================================================

/**
 * Create a new worktree
 * 
 * Creates a new worktree at the specified location for the given branch.
 * If branch doesn't exist, it will be created from HEAD.
 * 
 * @param repoPath - Path to main repository
 * @param branch - Branch name to checkout in worktree
 * @param location - Filesystem path for new worktree
 * @throws {ArashiError} If repository invalid, path exists, or git command fails
 * 
 * @example
 * await createWorktree('/repo', 'feature-branch', '/worktrees/feature');
 */
export function createWorktree(
  repoPath: string,
  branch: string,
  location: string
): Promise<void>;

/**
 * Remove a worktree
 * 
 * Removes the worktree at the specified path. Worktree must not have
 * uncommitted changes unless force=true.
 * 
 * @param path - Path to worktree to remove
 * @param force - Force removal even with uncommitted changes
 * @throws {ArashiError} If worktree invalid, locked, or git command fails
 * 
 * @example
 * await removeWorktree('/worktrees/feature', false);
 */
export function removeWorktree(path: string, force?: boolean): Promise<void>;

/**
 * List all worktrees for a repository
 * 
 * Returns information about all worktrees associated with the repository.
 * Includes main worktree and all linked worktrees.
 * 
 * @param repoPath - Path to repository
 * @returns Array of worktree information
 * @throws {ArashiError} If repository invalid or git command fails
 * 
 * @example
 * const worktrees = await listWorktrees('/repo');
 * worktrees.forEach(wt => {
 *   console.log(`${wt.path}: ${wt.branch || 'detached'} @ ${wt.commit}`);
 * });
 */
export function listWorktrees(repoPath: string): Promise<Worktree[]>;

// ============================================================================
// Branch Management Functions
// ============================================================================

/**
 * Check if a branch exists
 * 
 * Checks for both local and remote branches.
 * 
 * @param repoPath - Path to repository
 * @param branch - Branch name to check (e.g., 'main' or 'origin/main')
 * @returns true if branch exists
 * @throws {ArashiError} If repository invalid
 * 
 * @example
 * if (await branchExists('/repo', 'feature-branch')) {
 *   console.log('Branch exists');
 * }
 */
export function branchExists(repoPath: string, branch: string): Promise<boolean>;

/**
 * Create a new branch
 * 
 * Creates a new branch from an existing branch or commit.
 * 
 * @param repoPath - Path to repository
 * @param branch - Name for new branch
 * @param fromBranch - Source branch/commit (defaults to HEAD)
 * @throws {ArashiError} If repository invalid, branch exists, or git command fails
 * 
 * @example
 * await createBranch('/repo', 'new-feature', 'main');
 */
export function createBranch(
  repoPath: string,
  branch: string,
  fromBranch?: string
): Promise<void>;

/**
 * Delete a branch
 * 
 * Deletes a local branch. If force=false, only deletes if fully merged.
 * If force=true, deletes regardless of merge status.
 * 
 * @param repoPath - Path to repository
 * @param branch - Branch name to delete
 * @param force - Force deletion even if not merged
 * @throws {ArashiError} If repository invalid, branch not found, or not merged (when force=false)
 * 
 * @example
 * await deleteBranch('/repo', 'old-feature', false);
 */
export function deleteBranch(
  repoPath: string,
  branch: string,
  force?: boolean
): Promise<void>;

// ============================================================================
// Remote Synchronization Functions
// ============================================================================

/**
 * Fetch latest changes from remote
 * 
 * Fetches all refs from the specified remote (defaults to 'origin').
 * 
 * @param repoPath - Path to repository
 * @param remote - Remote name (defaults to 'origin')
 * @throws {ArashiError} If repository invalid, remote not found, or network error
 * 
 * @example
 * await fetchLatest('/repo', 'origin');
 */
export function fetchLatest(repoPath: string, remote?: string): Promise<void>;

/**
 * Set upstream tracking for a branch
 * 
 * Configures a local branch to track a remote branch.
 * 
 * @param repoPath - Path to repository
 * @param branch - Local branch name
 * @param remote - Remote name (e.g., 'origin')
 * @param remoteBranch - Remote branch name (defaults to same as local branch)
 * @throws {ArashiError} If repository invalid, branches not found, or git command fails
 * 
 * @example
 * await setUpstreamTracking('/repo', 'feature', 'origin', 'feature');
 */
export function setUpstreamTracking(
  repoPath: string,
  branch: string,
  remote: string,
  remoteBranch?: string
): Promise<void>;

// ============================================================================
// Repository State Query Functions
// ============================================================================

/**
 * Get working tree status
 * 
 * Returns status of all modified, added, deleted, and untracked files.
 * 
 * @param repoPath - Path to repository
 * @returns Array of status entries
 * @throws {ArashiError} If repository invalid or git command fails
 * 
 * @example
 * const status = await getStatus('/repo');
 * const modified = status.filter(s => s.worktreeStatus === 'M');
 * console.log(`${modified.length} modified files`);
 */
export function getStatus(repoPath: string): Promise<StatusEntry[]>;

/**
 * Get default branch name
 * 
 * Queries the remote HEAD to determine the default branch (e.g., 'main', 'master').
 * 
 * @param repoPath - Path to repository
 * @returns Default branch name
 * @throws {ArashiError} If repository invalid, no remote, or git command fails
 * 
 * @example
 * const defaultBranch = await getDefaultBranch('/repo');
 * console.log(`Default branch: ${defaultBranch}`);
 */
export function getDefaultBranch(repoPath: string): Promise<string>;

/**
 * Get current branch name
 * 
 * Returns the name of the currently checked out branch.
 * Returns 'HEAD' if in detached HEAD state.
 * 
 * @param repoPath - Path to repository
 * @returns Current branch name or 'HEAD'
 * @throws {ArashiError} If repository invalid or git command fails
 * 
 * @example
 * const currentBranch = await getCurrentBranch('/repo');
 * console.log(`On branch: ${currentBranch}`);
 */
export function getCurrentBranch(repoPath: string): Promise<string>;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get git version
 * 
 * Returns the installed git version string.
 * 
 * @returns Git version (e.g., '2.39.2')
 * @throws {ArashiError} If git not installed or command fails
 * 
 * @example
 * const version = await getGitVersion();
 * console.log(`Git version: ${version}`);
 */
export function getGitVersion(): Promise<string>;

/**
 * Get repository information
 * 
 * Returns comprehensive information about a repository.
 * 
 * @param repoPath - Path to repository
 * @returns Repository information
 * @throws {ArashiError} If repository invalid
 * 
 * @example
 * const info = await getRepositoryInfo('/repo');
 * console.log(`Type: ${info.type}, Default: ${info.defaultBranch}`);
 */
export function getRepositoryInfo(repoPath: string): Promise<RepositoryInfo>;
