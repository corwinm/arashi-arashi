# Data Model: Add Command

**Feature**: 018-add-command  
**Date**: 2026-02-06  
**Phase**: 1 - Design

## Overview

This document defines the data structures used by the `arashi add` command. All types are TypeScript interfaces that will be implemented in `src/commands/add.ts` and related modules.

## Core Entities

### AddCommandOptions

Command-line options and runtime configuration for the add command.

```typescript
interface AddCommandOptions {
  /**
   * Git repository URL to clone
   * Required. Must be a valid Git URL (HTTPS, SSH, Git, File, or SCP format)
   * Example: "https://github.com/user/repo.git"
   */
  gitUrl: string;
  
  /**
   * Custom repository name (overrides auto-derived name)
   * Optional. If not provided, name is derived from URL
   * Must be unique within workspace
   * Example: "my-custom-name"
   */
  name?: string;
  
  /**
   * Whether to create setup.sh template if no setup script found
   * Optional. Default: false
   */
  createSetup?: boolean;
  
  /**
   * Skip confirmation prompts
   * Optional. Default: false
   */
  force?: boolean;
  
  /**
   * Output result as JSON instead of human-readable format
   * Optional. Default: false
   */
  json?: boolean;
}
```

**Validation Rules**:
- `gitUrl`: Must match one of the Git URL patterns (see RT-001)
- `name`: If provided, must contain only `[a-zA-Z0-9._-]` characters
- `name`: Must be unique within workspace (checked against config.discovered_repos)

**Usage Example**:
```typescript
const options: AddCommandOptions = {
  gitUrl: 'https://github.com/user/repo.git',
  name: 'my-repo',
  createSetup: false,
  force: false,
  json: false
};
```

---

### AddCommandResult

Result data returned by the add command operation.

```typescript
interface AddCommandResult {
  /**
   * Name of the added repository (either derived or custom)
   */
  repositoryName: string;
  
  /**
   * Absolute filesystem path where repository was cloned
   * Example: "/path/to/workspace/repos/my-repo"
   */
  clonePath: string;
  
  /**
   * Detected default branch name
   * Example: "main" or "master"
   */
  defaultBranch: string;
  
  /**
   * Path to detected or created setup script
   * Null if no setup script found or created
   * Example: "/path/to/workspace/repos/my-repo/setup.sh"
   */
  setupScript: string | null;
  
  /**
   * Whether a new setup script was created (vs. detected existing)
   */
  setupScriptCreated: boolean;
  
  /**
   * Original Git URL that was cloned
   */
  gitUrl: string;
}
```

**State Transitions**:
- Result is only returned on successful completion
- On error, no result is returned (exception thrown)
- Partial results are not persisted (rollback on error)

**Usage Example**:
```typescript
const result: AddCommandResult = {
  repositoryName: 'my-repo',
  clonePath: '/workspace/repos/my-repo',
  defaultBranch: 'main',
  setupScript: '/workspace/repos/my-repo/setup.sh',
  setupScriptCreated: false,
  gitUrl: 'https://github.com/user/repo.git'
};
```

---

### GitUrlInfo

Parsed Git URL information (internal type, not exposed in public API).

```typescript
interface GitUrlInfo {
  /**
   * Original URL string
   */
  url: string;
  
  /**
   * Detected protocol
   * One of: 'https', 'ssh', 'git', 'file', 'scp'
   */
  protocol: 'https' | 'ssh' | 'git' | 'file' | 'scp';
  
  /**
   * Git host domain
   * Example: "github.com" or "gitlab.company.com"
   * Null for file:// URLs
   */
  host: string | null;
  
  /**
   * Repository owner or organization
   * Example: "facebook" from "https://github.com/facebook/react.git"
   * Null if path doesn't contain owner segment
   */
  owner: string | null;
  
  /**
   * Repository name (without .git suffix)
   * Example: "react" from "https://github.com/facebook/react.git"
   */
  repository: string;
  
  /**
   * Auto-derived repository name (suitable for use as config key)
   * Same as repository field, but validated for filesystem safety
   */
  derivedName: string;
}
```

**Derivation Logic** (see RT-002):
1. Extract last path segment from URL
2. Remove `.git` suffix if present
3. Validate contains only safe characters `[a-zA-Z0-9._-]`
4. Use as `derivedName`

**Usage Example**:
```typescript
const urlInfo: GitUrlInfo = {
  url: 'https://github.com/facebook/react.git',
  protocol: 'https',
  host: 'github.com',
  owner: 'facebook',
  repository: 'react',
  derivedName: 'react'
};
```

---

### RollbackOperation

Operation metadata for rollback mechanism (internal type).

```typescript
interface RollbackOperation {
  /**
   * Type of operation that was performed
   */
  type: 'clone' | 'config_update' | 'setup_script_create';
  
  /**
   * Filesystem path affected by operation
   */
  path: string;
  
  /**
   * Whether operation can be automatically reversed
   */
  reversible: boolean;
  
  /**
   * Metadata for rollback logic (operation-specific)
   */
  metadata?: Record<string, any>;
}
```

**Rollback Strategy**:
- Operations are tracked in order during command execution
- On error, operations are reversed in LIFO order (last in, first out)
- Non-reversible operations log warnings but don't block rollback

**Usage Example**:
```typescript
const operations: RollbackOperation[] = [
  {
    type: 'clone',
    path: '/workspace/repos/my-repo',
    reversible: true
  },
  {
    type: 'setup_script_create',
    path: '/workspace/repos/my-repo/setup.sh',
    reversible: true
  },
  {
    type: 'config_update',
    path: '/workspace/.arashi/config.json',
    reversible: false,
    metadata: { backupPath: '/workspace/.arashi/config.json.backup' }
  }
];
```

---

## Configuration Schema Extension

The add command extends the existing `Config` schema (defined in `src/lib/config.ts`) by adding repositories to `discovered_repos`.

### RepoConfig (Existing)

```typescript
interface RepoConfig {
  /** Path to the repository (relative or absolute) */
  path: string;
  
  /** Name of the default branch (auto-detected) */
  default_branch?: string;
  
  /** Whether the repository is bare */
  is_bare?: boolean;
  
  /** List of active worktrees */
  worktrees?: WorktreeInfo[];
  
  /** Custom hook configuration */
  hooks?: HookConfig;
}
```

**Add Command Population**:
- `path`: Set to clone destination (relative to workspace root)
- `default_branch`: Set to detected default branch (from RT-003)
- `is_bare`: Set to `false` (add command only clones non-bare repos)
- `worktrees`: Set to `[]` (empty - worktrees created by `arashi create`)
- `hooks.setup`: Set to detected setup script path (if found)

**Example Entry**:
```json
{
  "discovered_repos": {
    "my-repo": {
      "path": "./repos/my-repo",
      "default_branch": "main",
      "is_bare": false,
      "worktrees": [],
      "hooks": {
        "setup": "./repos/my-repo/setup.sh"
      }
    }
  }
}
```

---

## Error Types

The add command uses existing error types from `src/lib/errors.ts` and extends with command-specific errors.

### AddCommandError (New)

```typescript
class AddCommandError extends ArashiError {
  /**
   * Error code for programmatic handling
   */
  code: 'INVALID_URL' | 'DUPLICATE_NAME' | 'CLONE_FAILED' | 'BRANCH_DETECTION_FAILED' | 'CONFIG_UPDATE_FAILED';
  
  /**
   * Additional context for debugging
   */
  context?: Record<string, any>;
  
  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'AddCommandError';
    this.code = code;
    this.context = context;
  }
}
```

**Error Codes**:
- `INVALID_URL`: Git URL format validation failed
- `DUPLICATE_NAME`: Repository name already exists in config
- `CLONE_FAILED`: Git clone operation failed
- `BRANCH_DETECTION_FAILED`: Unable to detect default branch
- `CONFIG_UPDATE_FAILED`: Failed to update configuration file

**Usage Example**:
```typescript
throw new AddCommandError(
  'Repository name "my-repo" already exists. Use --name to specify a different name.',
  'DUPLICATE_NAME',
  { name: 'my-repo', existingPath: './repos/my-repo' }
);
```

---

## Validation Rules

### Repository Name Validation

```typescript
function isValidRepositoryName(name: string): boolean {
  // Must contain only alphanumeric, dash, underscore, dot
  return /^[a-zA-Z0-9._-]+$/.test(name);
}
```

**Invalid Examples**:
- `my repo` (contains space)
- `my/repo` (contains slash)
- `my@repo` (contains @)
- `` (empty string)

### Git URL Validation

```typescript
const GIT_URL_PATTERNS = {
  https: /^https:\/\/[^\/]+\/.+/,
  ssh: /^(ssh:\/\/)?git@[^:]+:[^\/].+/,
  git: /^git:\/\/[^\/]+\/.+/,
  file: /^(file:\/\/)?\/[^\/].+/,
  scp: /^[^@]+@[^:]+:[^\/].+/
};

function isValidGitUrl(url: string): boolean {
  return Object.values(GIT_URL_PATTERNS).some(pattern => pattern.test(url));
}
```

---

## State Diagram

```
[Start] → Validate Input → Parse URL → Check Duplicate Name
                ↓                           ↓
            [Invalid]                  [Duplicate]
                ↓                           ↓
            [Error Exit]               [Error Exit]
            
[Valid & Unique] → Clone Repository → Detect Branch → Detect Setup Script
                        ↓                   ↓                ↓
                   [Clone Failed]   [Detection Failed]   [Optional]
                        ↓                   ↓                ↓
                   [Rollback]         [Use Fallback]    [Continue]
                   
[Success Path] → Update Config → Display Success → [End]
                      ↓
                 [Update Failed]
                      ↓
                 [Rollback] → [Error Exit]
```

---

## File System Layout

After successful `arashi add`, the file system structure:

```
workspace/
├── .arashi/
│   └── config.json              # Updated with new repo entry
└── repos/
    └── my-repo/                 # Cloned repository
        ├── .git/                # Git metadata
        ├── setup.sh             # Detected or created setup script
        └── [repository files]
```

---

## JSON Output Schema

When `--json` flag is used, output follows this schema:

```json
{
  "success": true,
  "repository": {
    "name": "my-repo",
    "path": "./repos/my-repo",
    "gitUrl": "https://github.com/user/repo.git",
    "defaultBranch": "main",
    "setupScript": "./repos/my-repo/setup.sh",
    "setupScriptCreated": false
  }
}
```

**Error JSON Schema**:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_NAME",
    "message": "Repository name 'my-repo' already exists",
    "context": {
      "name": "my-repo",
      "existingPath": "./repos/my-repo"
    }
  }
}
```

---

## Summary

| Entity | Purpose | Location |
|--------|---------|----------|
| `AddCommandOptions` | Command input/configuration | `src/commands/add.ts` |
| `AddCommandResult` | Command output/result | `src/commands/add.ts` |
| `GitUrlInfo` | Parsed URL data (internal) | `src/commands/add.ts` |
| `RollbackOperation` | Rollback tracking (internal) | `src/commands/add.ts` or `src/core/rollback.ts` |
| `AddCommandError` | Command-specific errors | `src/lib/errors.ts` |
| `RepoConfig` | Configuration entry (existing) | `src/lib/config.ts` |

**Next Steps**: Generate API contracts (YAML) and quickstart guide.
