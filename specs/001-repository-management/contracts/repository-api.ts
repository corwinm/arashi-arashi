/**
 * API Contracts: Repository Management
 * 
 * This file defines the TypeScript interfaces for repository management
 * functionality including discovery, metadata, validation, and cloning.
 */

// ============================================================================
// Core Entities
// ============================================================================

/**
 * Represents a git repository with its metadata and location.
 */
export interface Repository {
  /** Repository name (derived from directory name) */
  name: string;
  /** Absolute filesystem path to repository root */
  path: string;
  /** Default branch name (main, master, develop, etc.) */
  defaultBranch: string;
  /** Whether repository contains a setup script */
  hasSetupScript: boolean;
  /** Path to setup script if present */
  setupScriptPath?: string;
  /** Primary remote URL (usually origin) */
  remoteUrl?: string;
}

/**
 * Options for repository discovery.
 */
export interface DiscoveryOptions {
  /** Maximum depth to scan (default: 3) */
  maxDepth?: number;
  /** Whether to follow symbolic links (default: false) */
  followSymlinks?: boolean;
  /** Patterns to exclude from scan (e.g., "node_modules", ".git") */
  excludePatterns?: string[];
  /** Setup script file patterns to detect (default: ["setup.sh"]) */
  setupScriptPatterns?: string[];
}

/**
 * Result of scanning a workspace directory for repositories.
 */
export interface RepositoryDiscoveryResult {
  /** Discovered repositories */
  repositories: Repository[];
  /** Path that was scanned */
  workspacePath: string;
  /** Maximum depth that was scanned */
  scanDepth: number;
  /** Total directories examined */
  scannedDirectories: number;
  /** Non-fatal errors encountered */
  errors: DiscoveryError[];
  /** Time taken in milliseconds */
  duration: number;
}

/**
 * Non-fatal error encountered during repository discovery.
 */
export interface DiscoveryError {
  /** Path where error occurred */
  path: string;
  /** Error description */
  message: string;
  /** Categorized error type */
  code: ErrorCode;
  /** Original error if applicable */
  cause?: Error;
}

/**
 * Error codes for repository operations.
 */
export enum ErrorCode {
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NOT_A_DIRECTORY = "NOT_A_DIRECTORY",
  INVALID_GIT_REPO = "INVALID_GIT_REPO",
  SYMLINK_LOOP = "SYMLINK_LOOP",
  IO_ERROR = "IO_ERROR",
}

// ============================================================================
// Repository Metadata
// ============================================================================

/**
 * Options for gathering repository metadata.
 */
export interface MetadataOptions {
  /** Include branch information (default: true) */
  includeBranches?: boolean;
  /** Include commit history (default: false) */
  includeCommits?: boolean;
  /** Include working tree status (default: true) */
  includeStatus?: boolean;
  /** Include remote information (default: true) */
  includeRemotes?: boolean;
  /** Include stash list (default: false) */
  includeStashes?: boolean;
  /** Include tags (default: false) */
  includeTags?: boolean;
}

/**
 * Comprehensive metadata about a repository's state.
 */
export interface RepositoryMetadata {
  /** Basic repository information */
  repository: Repository;
  /** Current checked-out branch */
  currentBranch?: string;
  /** All local branches */
  localBranches: string[];
  /** All remote branches */
  remoteBranches: string[];
  /** Most recent commit information */
  lastCommit?: CommitInfo;
  /** Working tree status */
  status: RepositoryStatus;
  /** Configured remotes */
  remotes: Remote[];
  /** Number of stashed changes */
  stashCount: number;
  /** Repository tags */
  tags: string[];
}

/**
 * Information about a git commit.
 */
export interface CommitInfo {
  /** Commit SHA-1 hash */
  hash: string;
  /** Abbreviated commit hash (7 characters) */
  shortHash: string;
  /** Commit author name */
  author: string;
  /** Commit author email */
  email: string;
  /** Commit date */
  date: Date;
  /** Commit message (first line) */
  message: string;
  /** Complete commit message */
  fullMessage: string;
}

/**
 * Working tree status of a repository.
 */
export interface RepositoryStatus {
  /** No uncommitted changes */
  isClean: boolean;
  /** Count of modified files */
  modifiedFiles: number;
  /** Count of untracked files */
  untrackedFiles: number;
  /** Count of staged files */
  stagedFiles: number;
  /** Count of conflicted files */
  conflictedFiles: number;
  /** Commits ahead of remote */
  ahead: number;
  /** Commits behind remote */
  behind: number;
}

/**
 * Git remote configuration.
 */
export interface Remote {
  /** Remote name (e.g., "origin") */
  name: string;
  /** Remote URL */
  url: string;
  /** Fetch or push */
  type: RemoteType;
}

/**
 * Remote type enum.
 */
export enum RemoteType {
  FETCH = "fetch",
  PUSH = "push",
}

// ============================================================================
// Workspace Configuration & Validation
// ============================================================================

/**
 * Expected repository structure of a workspace.
 */
export interface WorkspaceConfiguration {
  /** Expected repositories */
  repositories: RepositoryConfig[];
  /** Workspace root path */
  workspacePath: string;
}

/**
 * Configuration for a single expected repository.
 */
export interface RepositoryConfig {
  /** Repository identifier */
  name: string;
  /** Expected relative path (optional) */
  path?: string;
  /** Git URL for cloning (optional) */
  url?: string;
  /** Expected default branch (optional) */
  defaultBranch?: string;
}

/**
 * Options for workspace validation.
 */
export interface ValidationOptions {
  /** Whether to report extra repositories (default: true) */
  reportExtra?: boolean;
  /** Whether to validate repository state (default: false) */
  validateState?: boolean;
}

/**
 * Result of validating workspace structure against configuration.
 */
export interface ValidationResult {
  /** Whether workspace matches configuration */
  isValid: boolean;
  /** Repositories that exist as expected */
  presentRepositories: Repository[];
  /** Repository names not found on disk */
  missingRepositories: string[];
  /** Repositories found but not in config */
  extraRepositories: Repository[];
  /** Validation errors encountered */
  errors: string[];
}

// ============================================================================
// Repository Cloning
// ============================================================================

/**
 * Options for cloning a repository.
 */
export interface CloneOptions {
  /** Perform shallow clone with specified depth */
  depth?: number;
  /** Clone specific branch only */
  branch?: string;
  /** Whether to run setup script after clone (default: false) */
  runSetupScript?: boolean;
  /** Timeout in milliseconds (default: 300000 = 5 minutes) */
  timeout?: number;
  /** Progress callback */
  onProgress?: (progress: CloneProgress) => void;
}

/**
 * Represents an in-progress or completed repository clone operation.
 */
export interface CloneOperation {
  /** Unique operation identifier */
  id: string;
  /** Source repository URL */
  url: string;
  /** Destination path */
  targetPath: string;
  /** Current operation status */
  status: CloneStatus;
  /** Clone progress information */
  progress: CloneProgress;
  /** When clone started */
  startTime: Date;
  /** When clone completed/failed */
  endTime?: Date;
  /** Error if clone failed */
  error?: CloneError;
}

/**
 * Clone operation status.
 */
export enum CloneStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

/**
 * Progress information for a clone operation.
 */
export interface CloneProgress {
  /** Current clone phase */
  phase: ClonePhase;
  /** Objects received */
  receivedObjects: number;
  /** Total objects to receive */
  totalObjects: number;
  /** Deltas resolved */
  resolvedDeltas: number;
  /** Total deltas to resolve */
  totalDeltas: number;
  /** Bytes received so far */
  bytesReceived: number;
}

/**
 * Clone operation phases.
 */
export enum ClonePhase {
  INITIALIZING = "initializing",
  RECEIVING_OBJECTS = "receiving_objects",
  RESOLVING_DELTAS = "resolving_deltas",
  CHECKING_OUT = "checking_out",
  COMPLETE = "complete",
}

/**
 * Error that occurred during cloning.
 */
export interface CloneError {
  /** Categorized error type */
  code: CloneErrorCode;
  /** Error description */
  message: string;
  /** Original error if applicable */
  cause?: Error;
}

/**
 * Clone error codes.
 */
export enum CloneErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
  REPOSITORY_NOT_FOUND = "REPOSITORY_NOT_FOUND",
  TARGET_EXISTS = "TARGET_EXISTS",
  DISK_FULL = "DISK_FULL",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  INVALID_URL = "INVALID_URL",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN",
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Discovers git repositories in a workspace directory.
 * 
 * Recursively scans the workspace directory up to the specified depth,
 * identifying valid git repositories and gathering basic information.
 * 
 * @param workspacePath - Absolute path to workspace directory
 * @param options - Discovery options
 * @returns Discovery result with found repositories and errors
 * 
 * @example
 * ```typescript
 * const result = await discoverRepositories("/Users/dev/workspace", {
 *   maxDepth: 3,
 *   excludePatterns: ["node_modules", "vendor"]
 * });
 * 
 * console.log(`Found ${result.repositories.length} repositories`);
 * for (const repo of result.repositories) {
 *   console.log(`  - ${repo.name} (${repo.defaultBranch})`);
 * }
 * ```
 */
export async function discoverRepositories(
  workspacePath: string,
  options?: DiscoveryOptions
): Promise<RepositoryDiscoveryResult>;

/**
 * Detects the default branch for a repository.
 * 
 * Queries the repository's git configuration to determine the default branch,
 * falling back to remote HEAD reference if needed.
 * 
 * @param repositoryPath - Absolute path to repository root
 * @returns Default branch name (e.g., "main", "master", "develop")
 * @throws {RepositoryError} If repository is invalid or default branch cannot be determined
 * 
 * @example
 * ```typescript
 * const defaultBranch = await detectDefaultBranch("/Users/dev/workspace/arashi");
 * console.log(`Default branch: ${defaultBranch}`);
 * ```
 */
export async function detectDefaultBranch(
  repositoryPath: string
): Promise<string>;

/**
 * Detects setup scripts in a repository.
 * 
 * Checks for the presence of setup script files (e.g., setup.sh) in the
 * repository root according to configured patterns.
 * 
 * @param repositoryPath - Absolute path to repository root
 * @param patterns - Setup script file patterns to check (default: ["setup.sh"])
 * @returns Object with hasSetupScript flag and setupScriptPath if found
 * 
 * @example
 * ```typescript
 * const { hasSetupScript, setupScriptPath } = await detectSetupScript(
 *   "/Users/dev/workspace/arashi",
 *   ["setup.sh", "setup.bash"]
 * );
 * 
 * if (hasSetupScript) {
 *   console.log(`Setup script found: ${setupScriptPath}`);
 * }
 * ```
 */
export async function detectSetupScript(
  repositoryPath: string,
  patterns?: string[]
): Promise<{ hasSetupScript: boolean; setupScriptPath?: string }>;

/**
 * Clones a git repository from a URL.
 * 
 * Executes git clone with progress reporting. Returns a CloneOperation
 * that can be monitored for progress and completion.
 * 
 * @param url - Git repository URL
 * @param targetPath - Absolute path where repository should be cloned
 * @param options - Clone options
 * @returns Clone operation with status and progress
 * @throws {CloneError} If clone fails (target exists, network error, etc.)
 * 
 * @example
 * ```typescript
 * const operation = await cloneRepository(
 *   "git@github.com:user/repo.git",
 *   "/Users/dev/workspace/repo",
 *   {
 *     depth: 1,
 *     onProgress: (progress) => {
 *       console.log(`${progress.phase}: ${progress.receivedObjects}/${progress.totalObjects}`);
 *     }
 *   }
 * );
 * 
 * if (operation.status === CloneStatus.COMPLETED) {
 *   console.log("Clone successful!");
 * }
 * ```
 */
export async function cloneRepository(
  url: string,
  targetPath: string,
  options?: CloneOptions
): Promise<CloneOperation>;

/**
 * Validates workspace structure against configuration.
 * 
 * Compares expected repositories in configuration against actual repositories
 * discovered in the workspace, identifying missing and extra repositories.
 * 
 * @param configuration - Expected workspace configuration
 * @param options - Validation options
 * @returns Validation result with present/missing/extra repositories
 * 
 * @example
 * ```typescript
 * const config: WorkspaceConfiguration = {
 *   workspacePath: "/Users/dev/workspace",
 *   repositories: [
 *     { name: "arashi", path: "arashi" },
 *     { name: "utilities", path: "utilities" }
 *   ]
 * };
 * 
 * const result = await validateWorkspace(config);
 * 
 * if (!result.isValid) {
 *   console.log("Missing repositories:", result.missingRepositories);
 * }
 * ```
 */
export async function validateWorkspace(
  configuration: WorkspaceConfiguration,
  options?: ValidationOptions
): Promise<ValidationResult>;

/**
 * Gathers comprehensive metadata for a repository.
 * 
 * Collects detailed information about repository state including branches,
 * commits, status, remotes, and more according to specified options.
 * 
 * @param repository - Repository to gather metadata for
 * @param options - Metadata gathering options
 * @returns Comprehensive repository metadata
 * @throws {RepositoryError} If repository is invalid or metadata cannot be gathered
 * 
 * @example
 * ```typescript
 * const repo: Repository = {
 *   name: "arashi",
 *   path: "/Users/dev/workspace/arashi",
 *   defaultBranch: "main",
 *   hasSetupScript: true
 * };
 * 
 * const metadata = await getRepositoryMetadata(repo, {
 *   includeBranches: true,
 *   includeStatus: true,
 *   includeRemotes: true
 * });
 * 
 * console.log(`Current branch: ${metadata.currentBranch}`);
 * console.log(`Status: ${metadata.status.isClean ? "clean" : "dirty"}`);
 * ```
 */
export async function getRepositoryMetadata(
  repository: Repository,
  options?: MetadataOptions
): Promise<RepositoryMetadata>;

/**
 * Gets basic repository information.
 * 
 * Quick lookup for essential repository information without expensive
 * metadata gathering operations.
 * 
 * @param repositoryPath - Absolute path to repository root
 * @returns Repository information
 * @throws {RepositoryError} If path is not a valid repository
 * 
 * @example
 * ```typescript
 * const repo = await getRepositoryInfo("/Users/dev/workspace/arashi");
 * console.log(`${repo.name} on ${repo.defaultBranch}`);
 * ```
 */
export async function getRepositoryInfo(
  repositoryPath: string
): Promise<Repository>;

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base error class for repository operations.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly repository: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

/**
 * Error thrown when repository is not found.
 */
export class RepositoryNotFoundError extends RepositoryError {
  constructor(repository: string, cause?: Error) {
    super(`Repository not found: ${repository}`, repository, cause);
    this.name = "RepositoryNotFoundError";
  }
}

/**
 * Error thrown when repository is invalid or corrupt.
 */
export class RepositoryInvalidError extends RepositoryError {
  constructor(repository: string, cause?: Error) {
    super(`Invalid repository: ${repository}`, repository, cause);
    this.name = "RepositoryInvalidError";
  }
}

/**
 * Error thrown when repository clone fails.
 */
export class RepositoryCloneError extends RepositoryError {
  constructor(repository: string, message: string, cause?: Error) {
    super(`Clone failed for ${repository}: ${message}`, repository, cause);
    this.name = "RepositoryCloneError";
  }
}

/**
 * Error thrown when repository metadata gathering fails.
 */
export class RepositoryMetadataError extends RepositoryError {
  constructor(repository: string, cause?: Error) {
    super(
      `Failed to gather metadata for ${repository}`,
      repository,
      cause
    );
    this.name = "RepositoryMetadataError";
  }
}
