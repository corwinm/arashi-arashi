/**
 * Configuration Management API Contract
 * 
 * This file defines the TypeScript interfaces and function signatures for the
 * configuration management module. These contracts serve as the API specification
 * for implementation.
 * 
 * Feature: 006-config-management
 * Date: 2026-02-03
 */

// ============================================================================
// Data Types
// ============================================================================

/**
 * Hook configuration for lifecycle events
 */
export interface HookConfig {
  /** Path to script executed before worktree creation */
  pre_create?: string;
  /** Path to script executed after worktree creation */
  post_create?: string;
  /** Path to script executed during repository setup */
  setup?: string;
}

/**
 * Information about a single git worktree
 */
export interface WorktreeInfo {
  /** Branch name for this worktree */
  branch: string;
  /** Filesystem path to the worktree */
  path: string;
  /** ISO 8601 timestamp when worktree was created */
  created_at: string;
  /** Optional user-defined metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration for a single repository
 */
export interface RepoConfig {
  /** Path to the repository (relative or absolute) */
  path: string;
  /** Name of the default branch (auto-detected if omitted) */
  default_branch?: string;
  /** Whether the repository is bare (auto-detected if omitted) */
  is_bare?: boolean;
  /** List of active worktrees for this repository */
  worktrees?: WorktreeInfo[];
  /** Custom hook configuration for this repository */
  hooks?: HookConfig;
}

/**
 * Root configuration object for Arashi
 */
export interface Config {
  /** Configuration schema version for migrations */
  version: string;
  /** Directory where repositories are located */
  repos_dir: string;
  /** Whether to automatically run setup hooks */
  auto_setup: boolean;
  /** Map of repository names to their configurations */
  discovered_repos: Record<string, RepoConfig>;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Custom error class for configuration-related errors
 */
export class ConfigError extends Error {
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
    this.name = 'ConfigError';
    this.cause = cause;
    this.context = context;
    
    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigError);
    }
  }
}

/**
 * Error thrown when configuration file is not found
 */
export class ConfigNotFoundError extends ConfigError {
  constructor(path: string) {
    super(
      `Configuration file not found at ${path}. Run "arashi init" to create it.`,
      undefined,
      { path }
    );
    this.name = 'ConfigNotFoundError';
  }
}

/**
 * Error thrown when configuration file contains invalid JSON
 */
export class ConfigParseError extends ConfigError {
  constructor(path: string, cause: Error) {
    super(
      `Failed to parse configuration file at ${path}: ${cause.message}`,
      cause,
      { path }
    );
    this.name = 'ConfigParseError';
  }
}

/**
 * Error thrown when configuration fails validation
 */
export class ConfigValidationError extends ConfigError {
  constructor(errors: string[]) {
    super(
      `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`,
      undefined,
      { errors }
    );
    this.name = 'ConfigValidationError';
  }
}

// ============================================================================
// Function Signatures
// ============================================================================

/**
 * Load configuration from .arashi/config.json
 * 
 * @param repoPath - Path to the repository (config loaded from repoPath/.arashi/config.json)
 * @returns Parsed and validated configuration object
 * @throws {ConfigNotFoundError} If configuration file doesn't exist
 * @throws {ConfigParseError} If JSON parsing fails
 * @throws {ConfigValidationError} If validation fails
 * 
 * @example
 * ```typescript
 * const config = await loadConfig('/path/to/repo');
 * console.log(config.repos_dir); // "./repos"
 * ```
 */
export async function loadConfig(repoPath: string): Promise<Config>;

/**
 * Save configuration to .arashi/config.json
 * 
 * Creates the .arashi directory if it doesn't exist.
 * Writes JSON with pretty formatting (2-space indentation).
 * 
 * @param repoPath - Path to the repository
 * @param config - Configuration object to save
 * @throws {ConfigError} If file system operations fail (permissions, disk full, etc.)
 * 
 * @example
 * ```typescript
 * const config = await loadConfig('/path/to/repo');
 * config.auto_setup = false;
 * await saveConfig('/path/to/repo', config);
 * ```
 */
export async function saveConfig(repoPath: string, config: Config): Promise<void>;

/**
 * Add a repository to the configuration
 * 
 * @param repoPath - Path to the repository containing the config
 * @param name - Unique name for the repository
 * @param repoConfig - Repository configuration
 * @throws {ConfigError} If repository name already exists
 * 
 * @example
 * ```typescript
 * await addRepo('/path/to/main-repo', 'my-app', {
 *   path: './repos/my-app',
 *   default_branch: 'main',
 *   is_bare: false
 * });
 * ```
 */
export async function addRepo(
  repoPath: string, 
  name: string, 
  repoConfig: RepoConfig
): Promise<void>;

/**
 * Remove a repository from the configuration
 * 
 * @param repoPath - Path to the repository containing the config
 * @param name - Name of the repository to remove
 * @throws {ConfigError} If repository name doesn't exist (implementation decision: TBD)
 * 
 * @example
 * ```typescript
 * await removeRepo('/path/to/main-repo', 'my-app');
 * ```
 */
export async function removeRepo(repoPath: string, name: string): Promise<void>;

/**
 * Get the full path to the configuration file
 * 
 * @param repoPath - Path to the repository
 * @returns Absolute path to .arashi/config.json
 * 
 * @example
 * ```typescript
 * const configPath = getConfigPath('/path/to/repo');
 * // Returns: /path/to/repo/.arashi/config.json
 * ```
 */
export function getConfigPath(repoPath: string): string;

/**
 * Check if configuration file exists
 * 
 * @param repoPath - Path to the repository
 * @returns True if config file exists, false otherwise
 * 
 * @example
 * ```typescript
 * if (!await configExists('/path/to/repo')) {
 *   console.log('Run arashi init to create configuration');
 * }
 * ```
 */
export async function configExists(repoPath: string): Promise<boolean>;

/**
 * Validate configuration structure and required fields
 * 
 * Checks:
 * - All required fields present (version, repos_dir, auto_setup, discovered_repos)
 * - Field types are correct
 * - Nested structures valid (RepoConfig, WorktreeInfo, HookConfig)
 * 
 * Does NOT check:
 * - File system paths exist
 * - Git repository validity
 * - Hook script permissions
 * 
 * @param config - Configuration object to validate
 * @throws {ConfigValidationError} If validation fails with specific error details
 * 
 * @example
 * ```typescript
 * try {
 *   validateConfig(loadedData);
 * } catch (error) {
 *   if (error instanceof ConfigValidationError) {
 *     console.error('Validation errors:', error.context.errors);
 *   }
 * }
 * ```
 */
export function validateConfig(config: any): asserts config is Config;

/**
 * Generate default configuration
 * 
 * Creates a minimal valid configuration with sensible defaults:
 * - version: "1.0.0"
 * - repos_dir: "./repos"
 * - auto_setup: true
 * - discovered_repos: {}
 * 
 * @returns Default configuration object
 * 
 * @example
 * ```typescript
 * const defaultConfig = generateDefaultConfig();
 * await saveConfig('/path/to/repo', defaultConfig);
 * ```
 */
export function generateDefaultConfig(): Config;

// ============================================================================
// Usage Examples
// ============================================================================

/**
 * Example 1: Initialize new configuration
 */
async function example1_initialize() {
  const repoPath = '/path/to/repo';
  
  // Check if config exists
  if (!await configExists(repoPath)) {
    // Create default config
    const config = generateDefaultConfig();
    await saveConfig(repoPath, config);
    console.log('Configuration initialized');
  }
}

/**
 * Example 2: Add repository to config
 */
async function example2_addRepository() {
  const repoPath = '/path/to/main-repo';
  
  // Add a new repository
  await addRepo(repoPath, 'frontend', {
    path: './repos/frontend',
    default_branch: 'main',
    is_bare: false
  });
  
  console.log('Repository added');
}

/**
 * Example 3: Load and modify configuration
 */
async function example3_modifyConfig() {
  const repoPath = '/path/to/repo';
  
  // Load existing config
  const config = await loadConfig(repoPath);
  
  // Modify settings
  config.auto_setup = false;
  config.repos_dir = '/absolute/path/to/repos';
  
  // Save changes
  await saveConfig(repoPath, config);
  
  console.log('Configuration updated');
}

/**
 * Example 4: Error handling
 */
async function example4_errorHandling() {
  const repoPath = '/path/to/repo';
  
  try {
    const config = await loadConfig(repoPath);
  } catch (error) {
    if (error instanceof ConfigNotFoundError) {
      console.error('Config not found. Run init command.');
    } else if (error instanceof ConfigParseError) {
      console.error('Invalid JSON:', error.cause?.message);
    } else if (error instanceof ConfigValidationError) {
      console.error('Validation failed:', error.context.errors);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

/**
 * Example 5: Validation before save
 */
async function example5_validation() {
  const config = {
    version: '1.0.0',
    repos_dir: './repos',
    auto_setup: true,
    discovered_repos: {
      'my-app': {
        path: './repos/my-app'
      }
    }
  };
  
  try {
    // Validate before saving
    validateConfig(config);
    await saveConfig('/path/to/repo', config);
    console.log('Config saved successfully');
  } catch (error) {
    if (error instanceof ConfigValidationError) {
      console.error('Invalid config:', error.context.errors);
    }
  }
}
