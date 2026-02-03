# Data Model: Git Utility Library

**Feature**: 001-git-utility-lib  
**Date**: 2026-02-03

## Overview

This document defines the data structures and types used by the git utility library. These types represent git entities and operation results.

## Core Entities

### Repository Information

```typescript
/**
 * Represents a git repository location and type
 */
interface RepositoryInfo {
  /** Absolute filesystem path to repository */
  path: string;
  
  /** Repository type */
  type: 'normal' | 'bare';
  
  /** Default branch name (e.g., 'main', 'master') */
  defaultBranch: string | null;
}
```

**Validation Rules**:
- `path` must be absolute path
- `path` must exist on filesystem
- `type` must match actual repository structure
- `defaultBranch` null when remote not configured

**Relationships**:
- One repository can have many worktrees
- One repository can have many branches

---

### Worktree

```typescript
/**
 * Represents a git worktree (working directory linked to repository)
 */
interface Worktree {
  /** Absolute filesystem path to worktree */
  path: string;
  
  /** Branch name checked out in worktree (null if detached HEAD) */
  branch: string | null;
  
  /** Commit SHA that worktree is at */
  commit: string;
  
  /** Whether worktree is locked (cannot be removed) */
  locked: boolean;
  
  /** Reason for lock (if locked=true) */
  lockReason?: string;
}
```

**Validation Rules**:
- `path` must be absolute path
- `path` must exist on filesystem
- `commit` must be valid 40-character SHA-1 hash or abbreviated hash
- `branch` null only when in detached HEAD state
- `lockReason` only present when `locked=true`

**State Transitions**:
- Created: worktree added via `git worktree add`
- Locked: worktree locked via `git worktree lock`
- Unlocked: worktree unlocked via `git worktree unlock`
- Removed: worktree removed via `git worktree remove`

**Relationships**:
- Belongs to one repository
- Checked out on one branch (or detached)

---

### Branch

```typescript
/**
 * Represents a git branch reference
 */
interface Branch {
  /** Branch name (without refs/heads/ prefix) */
  name: string;
  
  /** Commit SHA that branch points to */
  commit: string;
  
  /** Upstream tracking branch (e.g., 'origin/main') */
  upstream: string | null;
  
  /** Whether branch is fully merged into HEAD */
  merged: boolean;
}
```

**Validation Rules**:
- `name` must not be empty
- `name` must not contain invalid characters (spaces, ~, ^, :, ?, *)
- `commit` must be valid SHA-1 hash
- `upstream` format: `remote/branch` (e.g., 'origin/main')

**Relationships**:
- Belongs to one repository
- Can be checked out in zero or more worktrees
- Can track one upstream branch (or none)

---

### Command Result

```typescript
/**
 * Result of executing a git command
 */
interface CommandResult {
  /** Standard output from command */
  stdout: string;
  
  /** Standard error output from command */
  stderr: string;
  
  /** Process exit code (0 = success) */
  exitCode: number;
}
```

**Validation Rules**:
- `exitCode` must be integer
- `exitCode=0` indicates success
- `exitCode!=0` indicates failure
- Both `stdout` and `stderr` can be empty strings

---

### Error Context

```typescript
/**
 * Diagnostic context for git operation errors
 */
interface GitErrorContext {
  /** Standard output from failed command */
  stdout: string;
  
  /** Standard error output from failed command */
  stderr: string;
  
  /** Process exit code */
  exitCode: number;
  
  /** Git command arguments that were executed */
  args: string[];
  
  /** Working directory where command was executed */
  cwd?: string;
}
```

**Validation Rules**:
- `exitCode` must be non-zero (error condition)
- `args` must not be empty
- `cwd` optional, absolute path when present

---

### Status Entry

```typescript
/**
 * Represents a file status in git working tree
 */
interface StatusEntry {
  /** Relative path to file from repository root */
  path: string;
  
  /** Status in index (staging area): ' ', 'M', 'A', 'D', 'R', 'C', 'U', '?' */
  indexStatus: string;
  
  /** Status in worktree: ' ', 'M', 'D', '?' */
  worktreeStatus: string;
  
  /** Original path (for renames/copies) */
  originalPath?: string;
}
```

**Validation Rules**:
- `path` must be relative path from repository root
- `indexStatus` must be one of: ' ', 'M', 'A', 'D', 'R', 'C', 'U', '?'
  - ' ' = unchanged
  - 'M' = modified
  - 'A' = added
  - 'D' = deleted
  - 'R' = renamed
  - 'C' = copied
  - 'U' = unmerged
  - '?' = untracked
- `worktreeStatus` must be one of: ' ', 'M', 'D', '?'
- `originalPath` only present when `indexStatus='R'` or `indexStatus='C'`

---

## Custom Error Types

### ArashiError

```typescript
/**
 * Custom error class for git operations
 */
class ArashiError extends Error {
  /** Error name (always 'ArashiError') */
  readonly name: 'ArashiError';
  
  /** Diagnostic context from failed git operation */
  readonly context: GitErrorContext;
  
  /** Structured error code for programmatic handling */
  readonly code: string;
  
  constructor(message: string, context: GitErrorContext);
  
  /** Serialize error to JSON for logging/debugging */
  toJSON(): object;
}
```

**Error Codes**:
- `GIT_FATAL`: Fatal git error
- `NOT_A_REPOSITORY`: Path is not a git repository
- `ALREADY_EXISTS`: Resource already exists (branch, worktree, etc.)
- `NOT_FOUND`: Resource not found (branch, worktree, etc.)
- `PERMISSION_DENIED`: Insufficient permissions
- `NETWORK_ERROR`: Network operation failed
- `GIT_ERROR`: Generic git error (fallback)

---

## Type Relationships

```
Repository (1) ──────────── (*) Worktree
    │                             │
    │                             │
    │                          (0..1)
    │                             │
    │                             ▼
    │                          Branch
    │                             ▲
    │                             │
    └─────────────────────────────┘
           (1) owns (*)

CommandResult ──► used by all operations
ArashiError ──► thrown on operation failure
StatusEntry ──► returned by getStatus()
```

## Assumptions

1. **Path formats**: All paths stored as absolute paths using platform-native separators
2. **Commit hashes**: Can be full 40-character SHA-1 or abbreviated (minimum 7 characters)
3. **Branch names**: Exclude `refs/heads/` prefix in public API for simplicity
4. **Concurrency**: Library is not thread-safe; caller responsible for coordination
5. **Git availability**: Git binary must be in system PATH
6. **Working directory**: All operations executed in repository working directory
7. **Encoding**: All git output assumed to be UTF-8
8. **Line endings**: Normalized to `\n` internally, regardless of platform
