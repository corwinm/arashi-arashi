# Quickstart: Filesystem Utilities

**Feature**: 005-filesystem-utilities  
**Audience**: Developers using the filesystem utilities library  
**Date**: 2026-02-04

## Overview

The Filesystem Utilities library provides a set of cross-platform functions for common filesystem operations. It's designed for use within the Arashi CLI tool and other TypeScript/Bun projects.

## Installation

The library is part of the Arashi project. No separate installation needed.

```typescript
import {
  ensureDir,
  fileExists,
  isExecutable,
  getWorktreePath,
  copyFile,
  removeDir,
  readTextFile,
  writeTextFile
} from './lib/filesystem';
```

## Quick Examples

### Create Directories

```typescript
// Create a directory (and parents) if it doesn't exist
await ensureDir('/foo/bar/baz');

// Idempotent - safe to call multiple times
await ensureDir('/foo/bar/baz');  // No error
```

### Check File Existence

```typescript
// Check if a file or directory exists
const exists = await fileExists('/etc/passwd');  // true on Unix
const missing = await fileExists('/nonexistent');  // false

// Check before reading
if (await fileExists('/config.json')) {
  const config = await readTextFile('/config.json');
}
```

### Check Execute Permissions

```typescript
// Check if a file is executable
const canRun = await isExecutable('/usr/bin/git');  // true
const script = await isExecutable('./setup.sh');  // true if +x
```

### Compute Worktree Paths

```typescript
// For bare repository
const bareWorktree = getWorktreePath(
  '/repos/project.git',
  'feature-branch',
  true
);
// Returns: /repos/project.git/.git/worktrees/feature-branch

// For non-bare repository
const worktree = getWorktreePath(
  '/repos/project',
  'feature-branch',
  false
);
// Returns: /repos/feature-branch

// With custom path
const custom = getWorktreePath(
  '/repos/project',
  'feature-branch',
  false,
  '/custom/location'
);
// Returns: /custom/location
```

### Copy Files

```typescript
// Copy a file (preserves permissions)
await copyFile('/src/template.json', '/dest/config.json');

// Overwrites destination if it exists
await copyFile('/new/version.txt', '/dest/file.txt');
```

### Read and Write Files

```typescript
// Read UTF-8 text file
const content = await readTextFile('/config.json');
const config = JSON.parse(content);

// Write UTF-8 text file
const data = JSON.stringify(config, null, 2);
await writeTextFile('/config.json', data);
```

### Remove Directories

```typescript
// Remove directory and all contents
await removeDir('/tmp/build');

// Idempotent - safe if directory doesn't exist
await removeDir('/nonexistent');  // No error
```

## Common Patterns

### Safe File Writing

Always create parent directories before writing:

```typescript
const filePath = '/foo/bar/config.json';
const parentDir = path.dirname(filePath);

await ensureDir(parentDir);
await writeTextFile(filePath, JSON.stringify(config));
```

### Conditional Operations

Check before operating to avoid unnecessary errors:

```typescript
if (await fileExists('/backup.json')) {
  await copyFile('/backup.json', '/config.json');
} else {
  await writeTextFile('/config.json', defaultConfig);
}
```

### Worktree Setup

```typescript
const worktreePath = getWorktreePath(repoPath, branch, isBare);
await ensureDir(worktreePath);
// Now safe to git clone or worktree add into worktreePath
```

### Cleanup

```typescript
const tempDirs = ['/tmp/build', '/tmp/cache', '/tmp/test'];
await Promise.all(tempDirs.map(dir => removeDir(dir)));
```

## Error Handling

All functions throw descriptive errors with context:

```typescript
import { PermissionError, NotFoundError } from './lib/filesystem';

try {
  await readTextFile('/protected/file.txt');
} catch (error) {
  if (error instanceof PermissionError) {
    console.error(`Access denied: ${error.path}`);
  } else if (error instanceof NotFoundError) {
    console.error(`File not found: ${error.path}`);
  } else {
    throw error;  // Unexpected error
  }
}
```

### Error Types

- `PermissionError`: Insufficient permissions
- `NotFoundError`: File or directory not found
- `DiskFullError`: No disk space available
- `InvalidPathError`: Path invalid or too long
- `EncodingError`: File not valid UTF-8

## Performance Tips

1. **Batch operations**: Use `Promise.all()` for independent operations
   ```typescript
   await Promise.all([
     ensureDir('/foo'),
     ensureDir('/bar'),
     ensureDir('/baz')
   ]);
   ```

2. **Avoid unnecessary checks**: Functions are idempotent where possible
   ```typescript
   // No need to check - ensureDir is idempotent
   await ensureDir('/foo');  // Just call it
   ```

3. **Large files**: Be mindful of memory when using `readTextFile`/`writeTextFile`
   - Suitable for config files, scripts, small data files
   - For large files (>10MB), consider streaming APIs

## Cross-Platform Notes

### Path Construction

Always use `path.join()` or `path.resolve()` for portability:

```typescript
import path from 'path';

// ✅ Good - works on all platforms
const configPath = path.join(homeDir, '.arashi', 'config.json');

// ❌ Bad - breaks on Windows
const configPath = homeDir + '/.arashi/config.json';
```

### Execute Permissions

Behavior differs by platform:

```typescript
// Unix/macOS: Checks actual +x permission bit
await isExecutable('./script.sh');  // true if chmod +x

// Windows: Checks file extension
await isExecutable('./script.bat');  // true
await isExecutable('./script.sh');   // false (no .sh execution on Windows)
```

### Case Sensitivity

Assume case-sensitive for portability:

```typescript
// May work on Windows but fail on Linux
await fileExists('/FOO/bar.txt');  // Case varies

// Always use exact case
await fileExists('/foo/bar.txt');  // Consistent
```

## Testing

All functions are tested with Bun's test runner:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { ensureDir, fileExists, removeDir } from './lib/filesystem';

describe('Filesystem Utilities', () => {
  const testDir = '/tmp/test-' + Date.now();

  afterEach(async () => {
    await removeDir(testDir);
  });

  it('creates directories recursively', async () => {
    await ensureDir(testDir + '/foo/bar');
    expect(await fileExists(testDir + '/foo/bar')).toBe(true);
  });
});
```

## Next Steps

- See [API Contract](contracts/api.md) for detailed function signatures
- See [Data Model](data-model.md) for entity definitions
- See [Research](research.md) for implementation details
- See [Implementation Plan](plan.md) for architecture decisions

## Support

For issues or questions:
- Check existing tests in `tests/unit/filesystem.test.ts`
- Review error messages - they include path and operation context
- Consult Bun documentation for platform-specific behaviors
