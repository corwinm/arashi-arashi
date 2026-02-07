# API Contract: Filesystem Utilities

**Feature**: 007-filesystem-utilities  
**Type**: TypeScript Library API  
**Date**: 2026-02-04

## Overview

This contract defines the public API for the Filesystem Utilities library. All functions are exported from `src/lib/filesystem.ts`.

---

## Functions

### `ensureDir`

**Purpose**: Create a directory and all parent directories if they don't exist.

**Signature**:
```typescript
export async function ensureDir(path: string): Promise<void>
```

**Parameters**:
- `path` (string): Absolute or relative path to directory

**Returns**: `Promise<void>` - Resolves when directory exists

**Throws**:
- `PermissionError` - Insufficient permissions to create directory
- `DiskFullError` - No space left on device
- `InvalidPathError` - Path is invalid or exceeds length limits

**Behavior**:
- Creates all parent directories recursively
- Succeeds silently if directory already exists (idempotent)
- Preserves existing directory permissions if already exists

**Examples**:
```typescript
await ensureDir('/foo/bar/baz');  // Creates /foo, /foo/bar, /foo/bar/baz
await ensureDir('./relative/path');  // Creates relative to CWD
```

---

### `fileExists`

**Purpose**: Check if a file or directory exists.

**Signature**:
```typescript
export async function fileExists(path: string): Promise<boolean>
```

**Parameters**:
- `path` (string): Absolute or relative path to check

**Returns**: `Promise<boolean>` - true if exists, false otherwise

**Throws**: Never throws - returns false for permission errors

**Behavior**:
- Returns true for files, directories, and symlinks
- Follows symlinks (returns true if target exists)
- Returns false if path doesn't exist or not accessible

**Examples**:
```typescript
const exists = await fileExists('/etc/passwd');  // true on Unix
const missing = await fileExists('/nonexistent');  // false
```

---

### `isExecutable`

**Purpose**: Check if a file has executable permissions.

**Signature**:
```typescript
export async function isExecutable(path: string): Promise<boolean>
```

**Parameters**:
- `path` (string): Absolute or relative path to file

**Returns**: `Promise<boolean>` - true if executable, false otherwise

**Throws**: Never throws - returns false for errors

**Behavior**:
- Checks execute permission bit on Unix/macOS
- On Windows, checks file extension (.exe, .bat, .cmd, .com)
- Returns false if file doesn't exist
- Returns false for directories

**Examples**:
```typescript
const canExecute = await isExecutable('/usr/bin/git');  // true
const notExecutable = await isExecutable('/etc/hosts');  // false
```

---

### `getWorktreePath`

**Purpose**: Compute worktree path based on repository configuration.

**Signature**:
```typescript
export function getWorktreePath(
  repoPath: string,
  branch: string,
  isBare: boolean,
  customPath?: string
): string
```

**Parameters**:
- `repoPath` (string): Path to main repository
- `branch` (string): Branch name for worktree
- `isBare` (boolean): true if bare repository, false otherwise
- `customPath` (string, optional): Override computed path

**Returns**: `string` - Computed worktree path

**Throws**:
- `InvalidPathError` - repoPath is invalid

**Behavior**:
- If `customPath` provided, returns it unchanged
- If `isBare`, returns `{repoPath}/.git/worktrees/{branch}`
- If not bare, returns `{parentDir(repoPath)}/{branch}`
- Does not check if paths exist

**Examples**:
```typescript
// Bare repository
getWorktreePath('/repos/bare.git', 'feature', true);
// Returns: /repos/bare.git/.git/worktrees/feature

// Non-bare repository
getWorktreePath('/repos/project', 'feature', false);
// Returns: /repos/feature

// Custom path
getWorktreePath('/repos/project', 'feature', false, '/custom/path');
// Returns: /custom/path
```

---

### `copyFile`

**Purpose**: Copy a file while preserving permissions.

**Signature**:
```typescript
export async function copyFile(src: string, dest: string): Promise<void>
```

**Parameters**:
- `src` (string): Source file path
- `dest` (string): Destination file path

**Returns**: `Promise<void>` - Resolves when copy completes

**Throws**:
- `NotFoundError` - Source file doesn't exist
- `PermissionError` - Insufficient permissions
- `DiskFullError` - No space left on device

**Behavior**:
- Overwrites destination if it exists
- Preserves source file permissions
- Creates parent directories if needed (implicitly via ensureDir pattern)
- Uses efficient copy-on-write when available (FICLONE)

**Examples**:
```typescript
await copyFile('/src/config.json', '/dest/config.json');
```

---

### `removeDir`

**Purpose**: Remove a directory and all its contents recursively.

**Signature**:
```typescript
export async function removeDir(path: string): Promise<void>
```

**Parameters**:
- `path` (string): Directory path to remove

**Returns**: `Promise<void>` - Resolves when removed

**Throws**:
- `PermissionError` - Insufficient permissions to remove

**Behavior**:
- Removes all files and subdirectories recursively
- Succeeds silently if directory doesn't exist (idempotent)
- Follows symlinks and removes targets

**Examples**:
```typescript
await removeDir('/tmp/build');  // Removes /tmp/build and all contents
await removeDir('/nonexistent');  // Succeeds without error
```

---

### `readTextFile`

**Purpose**: Read file contents as a UTF-8 string.

**Signature**:
```typescript
export async function readTextFile(path: string): Promise<string>
```

**Parameters**:
- `path` (string): File path to read

**Returns**: `Promise<string>` - File contents as UTF-8 string

**Throws**:
- `NotFoundError` - File doesn't exist
- `PermissionError` - Insufficient read permissions
- `EncodingError` - File is not valid UTF-8

**Behavior**:
- Reads entire file into memory
- Assumes UTF-8 encoding
- Works with files up to memory limits

**Examples**:
```typescript
const config = await readTextFile('/etc/app/config.json');
const json = JSON.parse(config);
```

---

### `writeTextFile`

**Purpose**: Write content to a file as UTF-8.

**Signature**:
```typescript
export async function writeTextFile(path: string, content: string): Promise<void>
```

**Parameters**:
- `path` (string): File path to write
- `content` (string): Content to write

**Returns**: `Promise<void>` - Resolves when write completes

**Throws**:
- `PermissionError` - Insufficient write permissions
- `DiskFullError` - No space left on device
- `InvalidPathError` - Path invalid or too long

**Behavior**:
- Creates parent directories if needed
- Overwrites file if it exists
- Writes as UTF-8 encoding
- Atomic write (temp file + rename where possible)

**Examples**:
```typescript
await writeTextFile('/tmp/output.txt', 'Hello, world!');
await writeTextFile('./config.json', JSON.stringify(config, null, 2));
```

---

## Error Types

All errors extend the base `FilesystemError` class:

```typescript
class FilesystemError extends Error {
  constructor(
    public operation: string,
    public path: string,
    public code: string,
    message: string
  );
}

class PermissionError extends FilesystemError {}
class NotFoundError extends FilesystemError {}
class DiskFullError extends FilesystemError {}
class InvalidPathError extends FilesystemError {}
class EncodingError extends FilesystemError {}
```

---

## Usage Patterns

### Safe Directory Creation
```typescript
await ensureDir('/path/to/dir');
await writeTextFile('/path/to/dir/file.txt', 'content');
```

### Conditional File Operations
```typescript
if (await fileExists('/path/to/file')) {
  const content = await readTextFile('/path/to/file');
  // process content
}
```

### Worktree Management
```typescript
const worktreePath = getWorktreePath(repoPath, branch, isBare);
await ensureDir(worktreePath);
```

### Cleanup
```typescript
await removeDir('/tmp/build');
await removeDir('/tmp/cache');
```

---

## Performance Guarantees

- All operations complete within 100ms for typical use (single directory, <1MB files)
- No operation blocks the event loop for more than 16ms
- Handles 1000+ files in a directory without degradation
- Memory usage proportional to file size being read/written

---

## Cross-Platform Notes

### Path Separators
- Use `/` in code - automatically converted to `\` on Windows
- Use `path.join()` or `path.resolve()` for path construction

### Execute Permissions
- Unix/macOS: Checks actual execute bit
- Windows: Checks file extension (.exe, .bat, .cmd, .com)

### Case Sensitivity
- Unix/macOS: Case-sensitive by default (but varies by filesystem)
- Windows: Case-insensitive
- Always assume case-sensitive for portability

### Symbolic Links
- All platforms follow symlinks by default
- Windows requires admin privileges to create symlinks (reading works for all users)
