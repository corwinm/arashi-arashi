# Data Model: Arashi CLI

**Feature**: Complete Research Tasks for Arashi CLI  
**Created**: 2026-02-03  
**Status**: Design Phase  
**Related**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md)

## Overview

This document defines all data structures, entities, and relationships used throughout the Arashi CLI tool. These definitions provide the foundation for type-safe implementation and clear contracts between components.

## Core Entities

### 1. ArashiConfig

The main configuration object stored in `.arashi/config.json` at the repository root.

```typescript
interface ArashiConfig {
  /**
   * Configuration schema version for migration support
   * @example "1.0.0"
   */
  version: string;

  /**
   * Directory where sub-repositories are stored (relative to main repo root)
   * @default "repos"
   */
  repos_dir: string;

  /**
   * Strategy for creating worktrees
   * - "same_branch": Create worktrees with the same branch name across all repos
   * - "custom": Allow custom branch names per repo
   * @default "same_branch"
   */
  worktree_strategy: "same_branch" | "custom";

  /**
   * Whether to automatically run setup scripts after worktree creation
   * @default true
   */
  auto_setup: boolean;

  /**
   * Map of discovered repositories and their metadata
   * Key: repository name (derived from directory name or custom)
   * Value: repository configuration
   */
  discovered_repos: Record<string, RepoConfig>;
}
```

**Validation Rules:**
- `version` must match pattern `^\d+\.\d+\.\d+$` (semantic versioning)
- `repos_dir` must be a relative path (no leading `/` or `C:\`)
- `worktree_strategy` must be one of the allowed enum values
- `auto_setup` must be a boolean
- `discovered_repos` must be an object with string keys

**Default Values:**
```typescript
const DEFAULT_CONFIG: ArashiConfig = {
  version: "1.0.0",
  repos_dir: "repos",
  worktree_strategy: "same_branch",
  auto_setup: true,
  discovered_repos: {},
};
```

---

### 2. RepoConfig

Metadata for an individual sub-repository.

```typescript
interface RepoConfig {
  /**
   * Absolute or relative path to the repository
   * @example "/Users/dev/projects/arashi-main/repos/frontend"
   * @example "repos/frontend"
   */
  path: string;

  /**
   * Default branch name (e.g., "main", "master", "develop")
   * Auto-detected from git remote HEAD
   */
  default_branch: string;

  /**
   * Remote name (typically "origin")
   */
  remote: string;

  /**
   * Whether the repository has a setup script at `.arashi/setup.sh`
   */
  has_setup_script: boolean;

  /**
   * Git URL for the repository (for cloning/reference)
   * @example "git@github.com:user/frontend.git"
   * @example "https://github.com/user/frontend.git"
   */
  git_url: string;
}
```

**Validation Rules:**
- `path` must exist and be a valid directory
- `default_branch` must be a valid git branch name (no spaces, special chars)
- `remote` must be a valid git remote name
- `has_setup_script` must be a boolean
- `git_url` must be a valid git URL format

**Derived From:**
- `path`: User-specified or auto-discovered via repository discovery algorithm
- `default_branch`: Detected via `git symbolic-ref refs/remotes/origin/HEAD`
- `remote`: Typically "origin", detected via `git remote`
- `has_setup_script`: Detected by checking file existence and execute permissions
- `git_url`: Extracted via `git remote get-url origin`

---

### 3. WorktreeInfo

Runtime information about a worktree's state.

```typescript
interface WorktreeInfo {
  /**
   * Absolute path to the worktree directory
   */
  path: string;

  /**
   * Branch name checked out in this worktree
   */
  branch: string;

  /**
   * Working tree status
   * - "clean": No uncommitted changes
   * - "dirty": Uncommitted changes present
   * - "ahead": Commits not pushed to remote
   * - "behind": Remote has commits not pulled locally
   * - "diverged": Both ahead and behind
   */
  status: "clean" | "dirty" | "ahead" | "behind" | "diverged";

  /**
   * Nested worktree info for sub-repositories
   */
  sub_repos: WorktreeInfo[];

  /**
   * Commit SHA currently checked out
   * @example "a1b2c3d4e5f6..."
   */
  commit?: string;

  /**
   * Whether this worktree is bare (main repo in bare mode)
   */
  is_bare?: boolean;
}
```

**Derived From:**
- `path`: Result of `git worktree list --porcelain`
- `branch`: Parsed from `git worktree list` or `git rev-parse --abbrev-ref HEAD`
- `status`: Parsed from `git status --porcelain`
- `commit`: Result of `git rev-parse HEAD`
- `is_bare`: Result of checking if `.git` is a directory or file

---

### 4. OperationLogEntry

Tracks operations for rollback capability.

```typescript
interface OperationLogEntry {
  /**
   * Type of operation performed
   */
  type: 
    | "worktree_created"
    | "branch_created"
    | "directory_created"
    | "file_written"
    | "script_executed"
    | "git_command";

  /**
   * Operation-specific data needed for rollback
   */
  data: OperationData;

  /**
   * Function to execute to rollback this operation
   * Must be idempotent (safe to call multiple times)
   */
  rollback_fn: () => Promise<void>;

  /**
   * Human-readable description for logging/debugging
   * @example "Create worktree at /path/to/feature-branch"
   */
  description: string;

  /**
   * Timestamp when operation was executed
   */
  timestamp: Date;
}

type OperationData = 
  | WorktreeOperationData
  | BranchOperationData
  | DirectoryOperationData
  | FileOperationData
  | ScriptOperationData
  | GitCommandData;

interface WorktreeOperationData {
  repo_path: string;
  worktree_path: string;
  branch: string;
}

interface BranchOperationData {
  repo_path: string;
  branch_name: string;
  created_from: string; // source branch
  existed_before: boolean; // if true, don't delete on rollback
}

interface DirectoryOperationData {
  path: string;
  existed_before: boolean;
}

interface FileOperationData {
  path: string;
  existed_before: boolean;
  backup_path?: string; // if file was overwritten
}

interface ScriptOperationData {
  script_path: string;
  cwd: string;
  exit_code: number;
  stdout?: string;
  stderr?: string;
}

interface GitCommandData {
  command: string[];
  cwd: string;
  exit_code: number;
  stdout?: string;
  stderr?: string;
}
```

**Usage Pattern:**
```typescript
const log: OperationLogEntry[] = [];

// Log an operation
log.push({
  type: "worktree_created",
  data: {
    repo_path: "/path/to/repo",
    worktree_path: "/path/to/worktree",
    branch: "feature",
  },
  rollback_fn: async () => {
    await execGit(["worktree", "remove", "--force", "/path/to/worktree"]);
  },
  description: "Create worktree at /path/to/worktree",
  timestamp: new Date(),
});

// Rollback in reverse order (LIFO)
for (let i = log.length - 1; i >= 0; i--) {
  await log[i].rollback_fn();
}
```

---

### 5. Command Options

Type definitions for each CLI command's options.

#### InitOptions

```typescript
interface InitOptions {
  /**
   * Custom repos directory name (overrides default "repos")
   */
  repos_dir?: string;

  /**
   * Disable automatic setup script execution
   */
  no_auto_setup?: boolean;
}
```

#### AddOptions

```typescript
interface AddOptions {
  /**
   * Custom name for the repository (overrides derived name)
   */
  name?: string;

  /**
   * Specific branch to track (overrides default branch detection)
   */
  branch?: string;

  /**
   * Skip creating setup script template
   */
  no_setup_template?: boolean;
}
```

#### CreateOptions

```typescript
interface CreateOptions {
  /**
   * Interactive mode: prompt user to select repositories
   */
  interactive?: boolean;

  /**
   * Only create worktrees for specified repositories (comma-separated)
   * @example "frontend,backend"
   */
  only?: string;

  /**
   * Custom path for worktree (overrides default location strategy)
   */
  path?: string;

  /**
   * Skip running setup scripts even if auto_setup is true
   */
  no_setup?: boolean;

  /**
   * Don't set up remote tracking for new branches
   */
  no_track?: boolean;

  /**
   * Run repository operations in parallel
   */
  parallel?: boolean;
}
```

#### StatusOptions

```typescript
interface StatusOptions {
  /**
   * Show verbose output (full git status for each repo)
   */
  verbose?: boolean;

  /**
   * Show short output (one-line summary per repo)
   */
  short?: boolean;

  /**
   * Output in JSON format instead of human-readable
   */
  json?: boolean;
}
```

#### ListOptions

```typescript
interface ListOptions {
  /**
   * Show verbose output (detailed sub-repo info)
   */
  verbose?: boolean;

  /**
   * Output in JSON format
   */
  json?: boolean;
}
```

#### RemoveOptions

```typescript
interface RemoveOptions {
  /**
   * Keep branches after removing worktrees
   */
  keep_branches?: boolean;

  /**
   * Keep worktree directories (only remove from git metadata)
   */
  keep_worktrees?: boolean;

  /**
   * Force removal even with uncommitted changes
   */
  force?: boolean;

  /**
   * Skip checking for dirty worktrees
   */
  no_check_dirty?: boolean;
}
```

#### SetupOptions

```typescript
interface SetupOptions {
  /**
   * Only run setup for specified repositories (comma-separated)
   */
  only?: string;

  /**
   * Run setup scripts in parallel
   */
  parallel?: boolean;

  /**
   * Show verbose output (full script stdout/stderr)
   */
  verbose?: boolean;

  /**
   * Timeout in milliseconds for each script (default: 300000 = 5 minutes)
   */
  timeout?: number;
}
```

---

### 6. HookContext

Environment variables passed to lifecycle hooks.

```typescript
interface HookContext {
  /**
   * Command that triggered the hook (e.g., "create", "remove")
   */
  ARASHI_COMMAND: string;

  /**
   * Branch name being operated on
   */
  ARASHI_BRANCH: string;

  /**
   * Path to the worktree being created/removed
   */
  ARASHI_WORKTREE_PATH: string;

  /**
   * Path to the repos directory
   */
  ARASHI_REPOS_DIR: string;

  /**
   * Comma-separated list of repository names being operated on
   */
  ARASHI_REPO_LIST: string;

  /**
   * Main repository root path
   */
  ARASHI_MAIN_REPO: string;
}
```

**Usage:**
```typescript
function executeHook(hookPath: string, context: HookContext): Promise<void> {
  return execScript(hookPath, {
    env: {
      ...process.env,
      ...context,
    },
  });
}
```

---

### 7. Error Types

Custom error classes for better error handling.

```typescript
class ArashiError extends Error {
  constructor(
    message: string,
    public code: 
      | "CONFIG_INVALID"
      | "GIT_ERROR"
      | "WORKTREE_EXISTS"
      | "BRANCH_CONFLICT"
      | "PERMISSION_DENIED"
      | "NOT_FOUND"
      | "USER_ABORT"
      | "HOOK_FAILED"
      | "TIMEOUT",
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ArashiError";
  }

  /**
   * Exit code for CLI
   */
  get exitCode(): number {
    switch (this.code) {
      case "USER_ABORT":
        return 2;
      case "CONFIG_INVALID":
      case "GIT_ERROR":
      case "PERMISSION_DENIED":
        return 1;
      case "NOT_FOUND":
        return 4;
      default:
        return 1;
    }
  }
}

class ConfigValidationError extends ArashiError {
  constructor(message: string, public validationErrors: string[]) {
    super(message, "CONFIG_INVALID", { validationErrors });
    this.name = "ConfigValidationError";
  }
}

class GitCommandError extends ArashiError {
  constructor(
    message: string,
    public command: string[],
    public stdout: string,
    public stderr: string,
    public exitCode: number
  ) {
    super(message, "GIT_ERROR", { command, stdout, stderr, exitCode });
    this.name = "GitCommandError";
  }
}
```

---

## Relationships

```
ArashiConfig
    └── discovered_repos: Record<string, RepoConfig>
            └── RepoConfig
                    ├── used by → WorktreeInfo (runtime)
                    └── validated against → File system (discovery)

Command (user input)
    ├── InitOptions
    ├── CreateOptions
    │       └── triggers → OperationLog (rollback tracking)
    ├── RemoveOptions
    └── ... (other command options)

OperationLogEntry[]
    ├── tracks → operations performed
    └── enables → rollback via rollback_fn

HookContext
    ├── passed to → lifecycle hooks
    └── derived from → ArashiConfig + runtime state

Error Hierarchy
    ArashiError (base)
        ├── ConfigValidationError
        ├── GitCommandError
        └── ... (other specific errors)
```

---

## State Transitions

### Worktree Lifecycle

```
[non-existent]
    ↓ (arashi create <branch>)
[creating] → [operation log building]
    ↓ (all operations succeed)
[active] ← clear operation log
    ↓ (arashi remove <branch>)
[removing] → [rollback if needed]
    ↓ (removal complete)
[non-existent]
```

### Configuration Lifecycle

```
[no config]
    ↓ (arashi init)
[default config created]
    ↓ (arashi add <repo>)
[config updated with repo]
    ↓ (auto-discovery on load)
[discovered_repos populated]
    ↓ (version mismatch detected)
[migration applied]
    ↓ (save)
[config persisted]
```

---

## Validation Rules Summary

| Entity | Field | Validation |
|--------|-------|-----------|
| ArashiConfig | version | Semantic versioning pattern `^\d+\.\d+\.\d+$` |
| ArashiConfig | repos_dir | Relative path, no leading `/` |
| ArashiConfig | worktree_strategy | Enum: "same_branch" \| "custom" |
| RepoConfig | path | Must exist as directory |
| RepoConfig | default_branch | Valid git branch name |
| RepoConfig | git_url | Valid git URL format |
| WorktreeInfo | status | Enum: "clean" \| "dirty" \| "ahead" \| "behind" \| "diverged" |
| OperationLogEntry | rollback_fn | Must be idempotent |
| HookContext | ARASHI_REPO_LIST | Comma-separated, no spaces |

---

## References

- **Configuration Management**: See [research.md](./research.md) Section 3
- **Error Handling**: See [research.md](./research.md) Section 2
- **Git Operations**: See [contracts/git-api.md](./contracts/git-api.md)
- **CLI Commands**: See [contracts/cli-commands.md](./contracts/cli-commands.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-03
