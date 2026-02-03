# CLI Commands API Contract

## Overview

This document defines the API contract for all CLI commands in the arashi-arashi project. Each command signature, option, argument, exit code, and error handling behavior is specified here.

## Version

Contract Version: 1.0.0  
Last Updated: 2026-02-03

## Global Options

All commands support the following global options:

```typescript
interface GlobalOptions {
  --help: boolean;        // Show help for the command
  --version: boolean;     // Show version information
  --verbose: boolean;     // Enable verbose output
  --quiet: boolean;       // Suppress non-error output
  --no-color: boolean;    // Disable colored output
}
```

## Command: `init`

### Purpose
Initialize a new arashi-arashi configuration in the current repository.

### Signature
```bash
arashi init [options]
```

### Options
```typescript
interface InitOptions extends GlobalOptions {
  --force: boolean;              // Overwrite existing configuration
  --worktree-dir: string;        // Custom worktree directory path (default: .arashi)
  --template: string;            // Configuration template (basic|advanced)
  --no-gitignore: boolean;       // Skip .gitignore update
}
```

### Arguments
None

### Behavior
1. Checks if current directory is a git repository
2. Verifies arashi is not already initialized (unless --force)
3. Creates configuration file at `.arashi/config.json`
4. Adds `.arashi/` to `.gitignore` (unless --no-gitignore)
5. Sets default configuration values

### Output
```typescript
interface InitOutput {
  success: boolean;
  message: string;
  config: {
    path: string;
    worktreeDir: string;
  };
}
```

### Success Example
```
✓ Initialized arashi in /Users/user/project
  Configuration: /Users/user/project/.arashi/config.json
  Worktree directory: /Users/user/project/.arashi
```

### Exit Codes
- `0` - Success
- `1` - Not a git repository
- `2` - Already initialized (without --force)
- `3` - Permission denied
- `4` - Invalid configuration
- `5` - Git command failed

### Error Examples
```
Error: Not a git repository
  Run 'git init' first or navigate to a git repository
  Exit code: 1

Error: arashi is already initialized
  Use --force to reinitialize
  Exit code: 2
```

---

## Command: `add`

### Purpose
Create a new worktree and branch for a task.

### Signature
```bash
arashi add <task-id> [branch-name] [options]
```

### Options
```typescript
interface AddOptions extends GlobalOptions {
  --base: string;                // Base branch (default: main/master)
  --fetch: boolean;              // Fetch latest before creating (default: true)
  --no-fetch: boolean;           // Skip fetch operation
  --checkout: boolean;           // Switch to new worktree after creation (default: false)
  --prefix: string;              // Branch name prefix (default: from config)
  --force: boolean;              // Force creation even if branch exists
}
```

### Arguments
```typescript
interface AddArguments {
  taskId: string;          // Required: Task identifier (e.g., "123", "JIRA-456")
  branchName?: string;     // Optional: Custom branch name (overrides default naming)
}
```

### Behavior
1. Validates task-id format
2. Fetches latest from remote (unless --no-fetch)
3. Checks if branch already exists
4. Creates branch from base branch
5. Creates worktree in configured directory
6. Optionally switches to new worktree (if --checkout)

### Output
```typescript
interface AddOutput {
  success: boolean;
  worktree: {
    path: string;
    branch: string;
    base: string;
    taskId: string;
  };
  message: string;
}
```

### Success Example
```
✓ Created worktree for task 123
  Branch: feature/123-new-feature
  Path: /Users/user/project/.arashi/123
  Base: main
```

### Exit Codes
- `0` - Success
- `1` - Invalid task-id format
- `2` - Branch already exists (without --force)
- `3` - Base branch not found
- `4` - Worktree creation failed
- `5` - Git command failed
- `6` - Not initialized (run 'arashi init')

### Error Examples
```
Error: Branch feature/123 already exists
  Use --force to recreate or choose a different task-id
  Exit code: 2

Error: Base branch 'develop' not found
  Available branches: main, staging
  Exit code: 3
```

---

## Command: `create`

### Purpose
Alias for `add` command (for backward compatibility).

### Signature
```bash
arashi create <task-id> [branch-name] [options]
```

### Behavior
Identical to `add` command. See `add` specification above.

---

## Command: `status`

### Purpose
Show the status of all managed worktrees.

### Signature
```bash
arashi status [options]
```

### Options
```typescript
interface StatusOptions extends GlobalOptions {
  --format: 'table' | 'json' | 'compact';  // Output format (default: table)
  --all: boolean;                           // Include completed/removed worktrees
  --filter: string;                         // Filter by task-id or branch name
}
```

### Arguments
None

### Behavior
1. Lists all active worktrees
2. Shows git status for each worktree
3. Displays branch tracking information
4. Indicates uncommitted changes

### Output
```typescript
interface StatusOutput {
  success: boolean;
  worktrees: WorktreeStatus[];
  summary: {
    total: number;
    active: number;
    dirty: number;
  };
}

interface WorktreeStatus {
  taskId: string;
  branch: string;
  path: string;
  status: 'clean' | 'dirty' | 'untracked';
  ahead: number;
  behind: number;
  uncommittedChanges: number;
  untrackedFiles: number;
}
```

### Success Example (Table Format)
```
Worktrees Status
┌─────────┬──────────────────────────┬────────┬───────┬────────┬──────────┐
│ Task ID │ Branch                   │ Status │ Ahead │ Behind │ Changes  │
├─────────┼──────────────────────────┼────────┼───────┼────────┼──────────┤
│ 123     │ feature/123-new-feature  │ dirty  │ 2     │ 0      │ 3 files  │
│ 456     │ bugfix/456-fix-error     │ clean  │ 0     │ 1      │ 0 files  │
└─────────┴──────────────────────────┴────────┴───────┴────────┴──────────┘

Summary: 2 active worktrees, 1 with uncommitted changes
```

### Success Example (JSON Format)
```json
{
  "success": true,
  "worktrees": [
    {
      "taskId": "123",
      "branch": "feature/123-new-feature",
      "path": "/Users/user/project/.arashi/123",
      "status": "dirty",
      "ahead": 2,
      "behind": 0,
      "uncommittedChanges": 3,
      "untrackedFiles": 1
    }
  ],
  "summary": {
    "total": 2,
    "active": 2,
    "dirty": 1
  }
}
```

### Exit Codes
- `0` - Success
- `1` - Not initialized
- `2` - No worktrees found
- `5` - Git command failed

---

## Command: `list`

### Purpose
List all managed worktrees (simplified version of status).

### Signature
```bash
arashi list [options]
```

### Options
```typescript
interface ListOptions extends GlobalOptions {
  --format: 'simple' | 'json' | 'paths';  // Output format (default: simple)
  --all: boolean;                          // Include completed/removed worktrees
}
```

### Arguments
None

### Behavior
1. Lists all active worktrees
2. Shows basic information (task-id, branch, path)

### Output
```typescript
interface ListOutput {
  success: boolean;
  worktrees: WorktreeInfo[];
}

interface WorktreeInfo {
  taskId: string;
  branch: string;
  path: string;
}
```

### Success Example (Simple Format)
```
Active Worktrees:
  123  feature/123-new-feature  → .arashi/123
  456  bugfix/456-fix-error     → .arashi/456
```

### Success Example (Paths Format)
```
/Users/user/project/.arashi/123
/Users/user/project/.arashi/456
```

### Exit Codes
- `0` - Success
- `1` - Not initialized
- `5` - Git command failed

---

## Command: `remove`

### Purpose
Remove a worktree and optionally its branch.

### Signature
```bash
arashi remove <task-id> [options]
```

### Options
```typescript
interface RemoveOptions extends GlobalOptions {
  --delete-branch: boolean;      // Delete the associated branch (default: false)
  --force: boolean;              // Force removal even with uncommitted changes
  --keep-branch: boolean;        // Keep branch (opposite of --delete-branch)
}
```

### Arguments
```typescript
interface RemoveArguments {
  taskId: string;          // Required: Task identifier to remove
}
```

### Behavior
1. Validates task-id exists
2. Checks for uncommitted changes (warns if present, blocks unless --force)
3. Removes worktree directory
4. Optionally deletes associated branch
5. Updates configuration

### Output
```typescript
interface RemoveOutput {
  success: boolean;
  removed: {
    worktree: string;
    branch?: string;
  };
  message: string;
}
```

### Success Example
```
✓ Removed worktree for task 123
  Path: /Users/user/project/.arashi/123
  Branch: feature/123-new-feature (kept)
```

### Exit Codes
- `0` - Success
- `1` - Task-id not found
- `2` - Uncommitted changes (without --force)
- `3` - Worktree removal failed
- `4` - Branch deletion failed
- `5` - Git command failed

### Error Examples
```
Error: Worktree has uncommitted changes
  Task: 123
  Branch: feature/123-new-feature
  Use --force to remove anyway or commit your changes
  Exit code: 2

Error: Task-id not found: 999
  Use 'arashi list' to see active worktrees
  Exit code: 1
```

---

## Command: `setup`

### Purpose
Set up git worktree support and verify configuration.

### Signature
```bash
arashi setup [options]
```

### Options
```typescript
interface SetupOptions extends GlobalOptions {
  --check: boolean;              // Only check setup, don't modify
  --repair: boolean;             // Repair broken worktrees
}
```

### Arguments
None

### Behavior
1. Verifies git worktree support (Git 2.5+)
2. Checks configuration validity
3. Repairs broken worktree references (if --repair)
4. Validates worktree directory structure

### Output
```typescript
interface SetupOutput {
  success: boolean;
  checks: {
    gitVersion: boolean;
    worktreeSupport: boolean;
    configValid: boolean;
    directoryStructure: boolean;
  };
  issues: string[];
  repaired: string[];
}
```

### Success Example
```
✓ Git version: 2.39.0 (worktree support available)
✓ Configuration valid
✓ Directory structure intact
✓ All checks passed
```

### Exit Codes
- `0` - Success (all checks passed)
- `1` - Git version too old
- `2` - Configuration invalid
- `3` - Directory structure issues
- `4` - Repair failed

---

## Error Handling Patterns

### Standard Error Output Format
```typescript
interface ErrorOutput {
  error: string;           // Human-readable error message
  code: number;           // Exit code
  details?: string;       // Additional error details
  suggestion?: string;    // Suggested fix
  context?: {             // Error context
    command: string;
    args: string[];
    cwd: string;
  };
}
```

### Error Output Example
```
Error: Not a git repository

Details:
  The current directory is not inside a git repository.
  
Suggestion:
  Run 'git init' to create a new repository, or
  Navigate to an existing git repository.

Context:
  Command: arashi init
  Directory: /Users/user/not-a-repo

Exit code: 1
```

### Common Error Codes (All Commands)
- `0` - Success
- `1` - General error (invalid input, not found, etc.)
- `2` - Precondition failed (already exists, uncommitted changes, etc.)
- `3` - Permission/access error
- `4` - Operation failed (creation, deletion, etc.)
- `5` - Git command failed
- `6` - Not initialized
- `10` - Invalid arguments
- `11` - Missing required argument
- `12` - Invalid option combination

### Signal Handling
All commands should handle the following signals gracefully:

```typescript
interface SignalHandling {
  SIGINT: () => void;   // Ctrl+C - Clean up and exit
  SIGTERM: () => void;  // Termination - Clean up and exit
  SIGHUP: () => void;   // Hangup - Clean up and exit
}
```

### Cleanup Behavior
On error or interruption:
1. Rollback partial operations
2. Remove temporary files
3. Log operation for debugging
4. Provide recovery instructions

---

## Output Formatting

### Verbose Mode
When `--verbose` is enabled:
- Show all git commands executed
- Display detailed progress information
- Include timing information

```
[verbose] Executing: git worktree add .arashi/123 -b feature/123
[verbose] Duration: 234ms
✓ Created worktree for task 123
```

### Quiet Mode
When `--quiet` is enabled:
- Suppress all output except errors
- Return only exit codes

### Color Support
Colors should be used for:
- ✓ Success messages (green)
- ✗ Error messages (red)
- ⚠ Warning messages (yellow)
- ℹ Info messages (blue)

Colors disabled with `--no-color` or when stdout is not a TTY.

---

## Version Compatibility

### Minimum Requirements
- Node.js: 18.0.0+
- Git: 2.5.0+ (for worktree support)

### Feature Detection
Commands should detect and gracefully handle:
- Git version differences
- Missing git features
- Platform-specific behaviors (Windows/macOS/Linux)

---

## Testing Requirements

### Unit Tests
Each command must have:
- Option parsing tests
- Argument validation tests
- Error handling tests
- Exit code tests

### Integration Tests
Each command must have:
- End-to-end success scenarios
- Error scenario tests
- Signal handling tests
- Cleanup verification tests

### Example Test Structure
```typescript
describe('arashi add', () => {
  describe('option parsing', () => {
    it('should parse --base option', () => {});
    it('should parse --no-fetch option', () => {});
    it('should reject invalid option combinations', () => {});
  });

  describe('execution', () => {
    it('should create worktree with valid task-id', () => {});
    it('should fail with duplicate branch name', () => {});
    it('should cleanup on interruption', () => {});
  });

  describe('exit codes', () => {
    it('should return 0 on success', () => {});
    it('should return 2 on duplicate branch', () => {});
  });
});
```

---

## Change Log

### Version 1.0.0 (2026-02-03)
- Initial API contract definition
- All commands specified
- Error handling patterns defined
