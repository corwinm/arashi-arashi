# Data Model: Filesystem Utilities

**Feature**: 007-filesystem-utilities  
**Date**: 2026-02-04  
**Status**: Complete

## Overview

Filesystem Utilities is a pure utility library with no persistent data model. All entities are runtime concepts representing filesystem state.

## Entities

### Directory

**Description**: A filesystem location that can contain files and subdirectories.

**Attributes**:
- `path` (string): Absolute or relative path to the directory
- `exists` (boolean): Whether the directory exists (runtime state)
- `permissions` (bitmask): Read/write/execute permissions (platform-specific)

**Relationships**: 
- Contains zero or more Files
- Contains zero or more child Directories
- Has one parent Directory (except root)

**Validation Rules**:
- Path must not be empty
- Path must be valid for target platform
- Path length must not exceed platform limits

**State Transitions**:
```
[Non-existent] --ensureDir()--> [Exists]
[Exists] --removeDir()--> [Non-existent]
```

---

### File

**Description**: A filesystem entity containing data, with associated metadata.

**Attributes**:
- `path` (string): Absolute or relative path to the file
- `exists` (boolean): Whether the file exists (runtime state)
- `content` (string): UTF-8 text content (when read)
- `size` (number): File size in bytes
- `permissions` (bitmask): Read/write/execute permissions
- `executable` (boolean): Whether file has execute permission

**Relationships**:
- Contained by one Directory
- May be a symbolic link to another File or Directory

**Validation Rules**:
- Path must not be empty
- Content must be valid UTF-8 for text operations
- Path must not exceed platform limits

**State Transitions**:
```
[Non-existent] --writeTextFile()--> [Exists]
[Exists] --readTextFile()--> [Exists] (no state change)
[Exists] --copyFile()--> [Exists at dest]
[Exists] --removeDir()--> [Non-existent] (if in removed directory)
```

---

### Path

**Description**: A string representing a location in the filesystem (abstract concept, not stored).

**Attributes**:
- `value` (string): The path string
- `type` (enum): 'absolute' | 'relative'
- `platform` (enum): 'posix' | 'windows'
- `segments` (array): Path components split by separator

**Relationships**:
- References zero or one File
- References zero or one Directory

**Validation Rules**:
- Must be non-empty
- Must use platform-appropriate separators
- Must not contain null bytes
- Must not exceed platform max path length (typically 260-4096 chars)

**Normalization**:
- Resolve relative paths to absolute
- Remove redundant separators (`/foo//bar` → `/foo/bar`)
- Resolve `.` and `..` components
- Use platform-appropriate separators

---

### Worktree Path

**Description**: A computed path for git worktrees based on repository configuration.

**Attributes**:
- `repoPath` (string): Path to the main repository
- `branch` (string): Branch name for the worktree
- `isBare` (boolean): Whether repository is bare
- `customPath` (string?): Optional custom worktree location
- `computedPath` (string): Resulting worktree path

**Computation Logic**:
```
if customPath provided:
  return customPath
else if isBare:
  return repoPath + "/.git/worktrees/" + branch
else:
  return parentDir(repoPath) + "/" + branch
```

**Validation Rules**:
- `repoPath` must exist
- `branch` must be a valid git branch name
- `customPath` if provided must be absolute

**Relationships**:
- Based on main repository Directory
- Results in target worktree Directory path

---

## Error Types

### FilesystemError

**Base error class for all filesystem operations.**

**Attributes**:
- `message` (string): Human-readable error description
- `operation` (string): Operation that failed (e.g., "create", "read", "remove")
- `path` (string): Path where error occurred
- `code` (string): Platform error code (EACCES, ENOENT, ENOSPC, etc.)

**Subtypes**:
- `PermissionError`: Insufficient permissions (EACCES, EPERM)
- `NotFoundError`: File or directory not found (ENOENT)
- `DiskFullError`: No space left on device (ENOSPC)
- `InvalidPathError`: Path is invalid or too long

---

## Invariants

1. **Idempotency**: 
   - `ensureDir(path)` succeeds if directory already exists
   - `removeDir(path)` succeeds if directory doesn't exist

2. **Atomicity**: 
   - Operations either fully succeed or fully fail
   - No partial file writes (use temp file + atomic rename where critical)

3. **Cross-platform**: 
   - All operations work identically on macOS, Linux, Windows
   - Path separators handled transparently

4. **Error context**: 
   - All errors include the failing path and operation
   - Error messages are descriptive and actionable

---

## Notes

- **No persistence**: All data is transient runtime state
- **No caching**: Always read current filesystem state
- **No transactions**: Filesystem operations are not transactional
- **Symbolic links**: Follow by default (standard behavior)
- **Permissions**: Platform-specific but abstracted where possible
