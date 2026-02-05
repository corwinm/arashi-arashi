# Data Model: Init Command

**Feature**: 001-init-command  
**Date**: 2026-02-05  
**Purpose**: Define data structures and entities for the init command implementation

## Overview

The init command operates on three primary entities: command options, initialization results, and hook templates. This document defines the structure and validation rules for each entity based on the functional requirements in the specification.

---

## Entity Definitions

### E1: InitOptions

**Purpose**: Command-line options and configuration for the init command

**Schema**:

```typescript
interface InitOptions {
  /** 
   * Custom directory path for managed repositories
   * Default: "./repos"
   * Validation: Must be valid relative or absolute path
   */
  reposDir?: string;
  
  /** 
   * Force overwrite of existing configuration
   * Default: false
   * If true, existing .arashi/config.json will be backed up and replaced
   */
  force?: boolean;
  
  /** 
   * Skip repository discovery step
   * Default: false
   * Useful for large workspaces or when repos will be added later
   */
  noDiscover?: boolean;
  
  /** 
   * Enable automatic setup hooks
   * Default: true
   * Maps to config.auto_setup field
   */
  autoSetup?: boolean;
}
```

**Validation Rules**:

| Field | Rule | Error Message |
|-------|------|--------------|
| reposDir | Must not contain null bytes | "Invalid path: null bytes not allowed" |
| reposDir | Must not exceed 4096 characters | "Path too long (max 4096 characters)" |
| reposDir | Must be valid path format | "Invalid path format" |

**Default Values**:
- reposDir: `"./repos"`
- force: `false`
- noDiscover: `false`
- autoSetup: `true`

**Mapping to FR**:
- reposDir → FR-003 (configuration setting)
- force → FR-010 (handling existing config)
- noDiscover → FR-006 (repository discovery)
- autoSetup → FR-003 (configuration setting)

---

### E2: InitResult

**Purpose**: Result of initialization operation with success/failure status and details

**Schema**:

```typescript
interface InitResult {
  /** 
   * Whether initialization completed successfully
   */
  success: boolean;
  
  /** 
   * Number of repositories discovered in repos directory
   * 0 if noDiscover option was true
   */
  discoveredRepoCount: number;
  
  /** 
   * Absolute path to created .arashi directory
   */
  arashiDirPath: string;
  
  /** 
   * Absolute path to created config file
   */
  configPath: string;
  
  /** 
   * Absolute path to created repos directory
   * undefined if directory already existed
   */
  reposDirPath?: string;
  
  /** 
   * Whether .gitignore was updated
   * false if entry already existed
   */
  gitignoreUpdated: boolean;
  
  /** 
   * List of discovered repository names
   * Empty array if noDiscover option was true
   */
  discoveredRepos: string[];
  
  /** 
   * Error details if initialization failed
   */
  error?: InitError;
  
  /** 
   * Total duration of init operation in milliseconds
   */
  duration: number;
}

interface InitError {
  /** Error code for categorization */
  code: InitErrorCode;
  
  /** Human-readable error message */
  message: string;
  
  /** Original error if available */
  cause?: Error;
  
  /** Path where error occurred, if applicable */
  path?: string;
}

enum InitErrorCode {
  NOT_GIT_REPOSITORY = "NOT_GIT_REPOSITORY",
  CONFIG_EXISTS = "CONFIG_EXISTS",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  DISK_FULL = "DISK_FULL",
  INVALID_PATH = "INVALID_PATH",
  CONFIG_WRITE_FAILED = "CONFIG_WRITE_FAILED",
  DISCOVERY_FAILED = "DISCOVERY_FAILED",
  UNKNOWN = "UNKNOWN",
}
```

**State Invariants**:
- If `success === true`, then `error` must be undefined
- If `success === false`, then `error` must be defined
- `discoveredRepoCount` must match `discoveredRepos.length`
- `duration` must be non-negative

**Success Criteria Mapping**:
- discoveredRepoCount → SC-003 (100% correct discovery)
- duration → SC-001 (<30 seconds)
- error.message → SC-004 (clear error messages)

---

### E3: HookTemplate

**Purpose**: Example hook script template with metadata and content

**Schema**:

```typescript
interface HookTemplate {
  /** 
   * Hook name (matches hook configuration keys)
   * Values: "pre-create", "post-create", "setup"
   */
  name: HookName;
  
  /** 
   * Filename for the example template
   * Format: "{name}.sh.example"
   */
  filename: string;
  
  /** 
   * Human-readable description of hook purpose
   */
  description: string;
  
  /** 
   * Example use cases for this hook
   */
  useCases: string[];
  
  /** 
   * Environment variables available to the hook
   */
  availableVars: HookVariable[];
  
  /** 
   * Full script content including comments and example code
   */
  scriptContent: string;
}

enum HookName {
  PRE_CREATE = "pre-create",
  POST_CREATE = "post-create",
  SETUP = "setup",
}

interface HookVariable {
  /** Variable name (e.g., "ARASHI_BRANCH") */
  name: string;
  
  /** Description of what the variable contains */
  description: string;
  
  /** Example value */
  example: string;
}
```

**Pre-defined Templates**:

#### Template 1: pre-create.sh.example

```yaml
name: "pre-create"
filename: "pre-create.sh.example"
description: "Validation before worktree creation"
useCases:
  - "Validate branch name format"
  - "Check if CI/CD pipeline is green"
  - "Verify local changes are committed"
availableVars:
  - name: "ARASHI_BRANCH"
    description: "Branch name being created"
    example: "feature/user-auth"
  - name: "ARASHI_REPO_NAME"
    description: "Repository name"
    example: "my-app"
  - name: "ARASHI_REPO_PATH"
    description: "Repository root path"
    example: "/path/to/repos/my-app"
```

#### Template 2: post-create.sh.example

```yaml
name: "post-create"
filename: "post-create.sh.example"
description: "Setup actions after worktree creation"
useCases:
  - "Install dependencies (npm install, bundle install)"
  - "Run database migrations"
  - "Copy configuration files"
availableVars:
  - name: "ARASHI_BRANCH"
    description: "Branch name that was created"
    example: "feature/user-auth"
  - name: "ARASHI_WORKTREE_PATH"
    description: "Path to created worktree"
    example: "/path/to/feature-user-auth"
  - name: "ARASHI_REPO_NAME"
    description: "Repository name"
    example: "my-app"
  - name: "ARASHI_REPO_PATH"
    description: "Repository root path"
    example: "/path/to/repos/my-app"
```

#### Template 3: setup.sh.example

```yaml
name: "setup"
filename: "setup.sh.example"
description: "Repository-specific environment setup"
useCases:
  - "Configure development environment variables"
  - "Set git config for repository"
  - "Initialize development tools (e.g., pre-commit)"
availableVars:
  - name: "ARASHI_REPO_NAME"
    description: "Repository name"
    example: "my-app"
  - name: "ARASHI_REPO_PATH"
    description: "Repository root path"
    example: "/path/to/repos/my-app"
```

**Template Content Structure**:

```bash
#!/usr/bin/env bash
#
# Hook: {name}
# Description: {description}
#
# This is an EXAMPLE template. To use:
# 1. Copy this file to .arashi/hooks/{name}.sh
# 2. Make it executable: chmod +x .arashi/hooks/{name}.sh
# 3. Customize the script below
#
# Environment variables available:
{list of available vars with descriptions}
#
# Exit with non-zero to abort operation

# Example implementation
{example code for common use case}

echo "Hook {name} completed successfully"
```

**Mapping to FR**:
- Hook templates → FR-007 (create example hook templates)
- scriptContent → FR-007 (user reference and documentation)

---

### E4: Configuration Schema

**Purpose**: Structure of the generated .arashi/config.json file

**Schema** (from existing `lib/config.ts`):

```typescript
interface Config {
  /** 
   * Configuration schema version for future migrations
   * Initial version: "1.0.0"
   */
  version: string;
  
  /** 
   * Directory where repositories are located
   * Relative or absolute path
   */
  repos_dir: string;
  
  /** 
   * Whether to automatically run setup hooks
   * Controls hook execution behavior
   */
  auto_setup: boolean;
  
  /** 
   * Map of repository names to their configurations
   * Populated by repository discovery
   */
  discovered_repos: Record<string, RepoConfig>;
}

interface RepoConfig {
  /** Path to the repository (relative or absolute) */
  path: string;
  
  /** Name of the default branch (auto-detected) */
  default_branch?: string;
  
  /** Whether the repository is bare (auto-detected) */
  is_bare?: boolean;
  
  /** List of active worktrees (empty initially) */
  worktrees?: WorktreeInfo[];
  
  /** Custom hook configuration (optional) */
  hooks?: HookConfig;
}
```

**Default Generated Config** (by init command):

```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
```

**After Discovery** (if repos found):

```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {
    "my-app": {
      "path": "./repos/my-app",
      "default_branch": "main",
      "is_bare": false,
      "worktrees": []
    },
    "api-service": {
      "path": "./repos/api-service",
      "default_branch": "main",
      "is_bare": false,
      "worktrees": []
    }
  }
}
```

**Validation Rules**:
- `version` must match semantic versioning format (X.Y.Z)
- `repos_dir` must be non-empty string
- `auto_setup` must be boolean
- `discovered_repos` keys must be unique

**Mapping to FR**:
- Config generation → FR-003
- Repository discovery data → FR-006
- Default values → FR-003

---

## Entity Relationships

```text
InitOptions ────> InitResult
     │                 │
     │                 ├──> InitError (optional)
     │                 │
     │                 └──> discoveredRepos: string[]
     │
     └──> Config
            │
            └──> discovered_repos: Record<string, RepoConfig>

HookTemplate (3 instances) ────> Created Files
     │                                   │
     ├── pre-create.sh.example           │
     ├── post-create.sh.example          │
     └── setup.sh.example                │
                                          │
                                 .arashi/hooks/ directory
```

---

## File System Structure

**Created by init command**:

```text
repository-root/
├── .arashi/                    # Created by FR-002
│   ├── config.json             # Created by FR-003
│   └── hooks/                  # Created by FR-007
│       ├── pre-create.sh.example
│       ├── post-create.sh.example
│       └── setup.sh.example
├── repos/                      # Created by FR-004 (if doesn't exist)
│   └── (discovered repositories)
└── .gitignore                  # Updated by FR-005
```

**Directory Permissions**:
- `.arashi/`: 0755 (rwxr-xr-x)
- `.arashi/hooks/`: 0755 (rwxr-xr-x)
- `repos/`: 0755 (rwxr-xr-x)

**File Permissions**:
- `config.json`: 0644 (rw-r--r--)
- `*.sh.example`: 0644 (rw-r--r--) - Not executable until user copies and activates

---

## Validation & Error Handling

### Path Validation

```typescript
function validatePath(path: string): { valid: boolean; error?: string } {
  if (path.includes('\0')) {
    return { valid: false, error: "Path contains null bytes" };
  }
  
  if (path.length > 4096) {
    return { valid: false, error: "Path exceeds maximum length (4096)" };
  }
  
  if (path.trim() === '') {
    return { valid: false, error: "Path cannot be empty" };
  }
  
  return { valid: true };
}
```

### Config Validation

Uses existing `validateConfig()` from `lib/config.ts`:
- Type checking (version: string, repos_dir: string, auto_setup: boolean)
- Required fields present
- RepoConfig structure validation

### Discovery Result Validation

```typescript
function validateDiscoveryResult(result: RepositoryDiscoveryResult): boolean {
  // All discovered repositories must have valid paths
  for (const repo of result.repositories) {
    if (!repo.path || !repo.name) {
      return false;
    }
  }
  
  // Duration must be non-negative
  if (result.duration < 0) {
    return false;
  }
  
  return true;
}
```

---

## Summary

| Entity | Purpose | Key Fields | Validation |
|--------|---------|------------|------------|
| **InitOptions** | Command configuration | reposDir, force, noDiscover | Path format, length limits |
| **InitResult** | Operation outcome | success, discoveredRepoCount, error | State invariants, duration >= 0 |
| **HookTemplate** | Example hook scripts | name, scriptContent, availableVars | Fixed set of 3 templates |
| **Config** | Persistent configuration | version, repos_dir, discovered_repos | Schema validation (existing) |

**Next Steps**:
1. ✅ Data model defined
2. → Create API contracts (command interface, exit codes)
3. → Create quickstart guide (user documentation)
