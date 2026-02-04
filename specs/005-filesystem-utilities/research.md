# Research: Filesystem Utilities

**Feature**: 005-filesystem-utilities  
**Date**: 2026-02-04  
**Status**: Complete

## Overview

This document consolidates research findings for implementing filesystem utilities using Bun's built-in APIs. The library provides cross-platform filesystem operations for the Arashi CLI tool.

## Technology Decisions

### Decision 1: Use Bun's Built-in File System APIs

**Rationale**:
- Bun provides cross-platform filesystem APIs that work identically on macOS, Linux, and Windows
- No external dependencies required - aligns with constitution principle V (Minimalist Configuration)
- Performance is excellent - native implementation in Zig with JavaScript bindings
- API surface is similar to Node.js `fs` module, making it familiar to developers

**Alternatives Considered**:
- **Node.js `fs` module**: Would require Node.js runtime, contradicts single-file executable principle
- **Platform-specific APIs**: Would require conditional compilation and testing on each platform
- **External library (e.g., `fs-extra`)**: Adds unnecessary dependency, violates zero-dependency goal

**Selected Approach**: Use `Bun.file()`, `Bun.write()`, and standard `fs` operations from Bun's runtime

### Decision 2: Error Handling Strategy

**Rationale**:
- All functions throw descriptive errors rather than returning error codes
- Error messages include the failing path and operation context
- Follows JavaScript/TypeScript conventions for error handling
- Aligns with constitution principle III (Error Recovery & Rollback)

**Alternatives Considered**:
- **Result type pattern**: More functional but less idiomatic for TypeScript
- **Error codes**: Less descriptive, harder for developers to debug

**Selected Approach**: Throw typed errors with descriptive messages including context

### Decision 3: Path Handling

**Rationale**:
- Use Bun's `path` module for cross-platform path manipulation
- Support both absolute and relative paths (FR-011)
- Normalize paths internally to handle platform differences
- Use `path.resolve()` to convert relative to absolute paths

**Alternatives Considered**:
- **String concatenation**: Error-prone and not cross-platform
- **Manual platform detection**: Unnecessary complexity when Bun provides abstractions

**Selected Approach**: Use `Bun.path` for all path operations

### Decision 4: Worktree Path Computation

**Rationale**:
- Bare repositories store worktrees in `.git/worktrees/<branch>/`
- Non-bare repositories store worktrees as siblings: `../<branch>/`
- Custom paths override computed locations
- This aligns with git's worktree conventions

**Alternatives Considered**:
- **Single convention**: Would not support both bare and non-bare repositories
- **Configuration-driven**: Over-complicates for a pure utility function

**Selected Approach**: Conditional logic based on repository type with custom path override

## Best Practices

### Bun File System Operations

**Directory Creation**:
```typescript
import { mkdir } from 'fs/promises';
await mkdir(path, { recursive: true });
```

**File Existence Check**:
```typescript
import { exists } from 'fs/promises';
const fileExists = await exists(path);
```

**Permission Check**:
```typescript
import { access } from 'fs/promises';
import { constants } from 'fs';
try {
  await access(path, constants.X_OK);
  return true;
} catch {
  return false;
}
```

**File Copy with Permissions**:
```typescript
import { copyFile } from 'fs/promises';
import { constants } from 'fs';
await copyFile(src, dest, constants.COPYFILE_FICLONE);
```

**Read/Write UTF-8 Files**:
```typescript
const content = await Bun.file(path).text();
await Bun.write(path, content);
```

**Recursive Directory Removal**:
```typescript
import { rm } from 'fs/promises';
await rm(path, { recursive: true, force: true });
```

### Error Message Patterns

**Pattern**: `Operation failed: <operation> at <path>: <reason>`

Examples:
- `"Failed to create directory at /foo/bar: Permission denied (EACCES)"`
- `"Failed to read file at /config.json: File not found (ENOENT)"`
- `"Failed to copy file from /a to /b: Disk space exhausted (ENOSPC)"`

### Testing Strategy

1. **Unit Tests**: Test each function independently with temporary directories
2. **Edge Cases**: Test with special characters, spaces, long paths, symlinks
3. **Error Scenarios**: Test permission failures, not-found cases, disk full
4. **Cross-Platform**: Use Bun's test runner with platform-agnostic assertions
5. **Cleanup**: Always clean up test directories in `afterEach` hooks

## API Design

### Function Signatures

```typescript
export async function ensureDir(path: string): Promise<void>
export async function fileExists(path: string): Promise<boolean>
export async function isExecutable(path: string): Promise<boolean>
export function getWorktreePath(
  repoPath: string,
  branch: string,
  isBare: boolean,
  customPath?: string
): string
export async function copyFile(src: string, dest: string): Promise<void>
export async function removeDir(path: string): Promise<void>
export async function readTextFile(path: string): Promise<string>
export async function writeTextFile(path: string, content: string): Promise<void>
```

### Design Principles

1. **Async by default**: All I/O operations are async except pure path computation
2. **No side effects**: Functions don't modify global state
3. **Idempotent where possible**: `ensureDir` and `removeDir` succeed if target state already achieved
4. **Descriptive names**: Function names clearly indicate their purpose
5. **Minimal parameters**: Only required parameters, optional parameters last

## Performance Considerations

- **Parallel operations**: Filesystem utilities don't coordinate, allowing parallel calls from consumers
- **No caching**: Direct filesystem access for correctness over speed
- **Streaming**: Not needed for typical file sizes (<1MB as per SC-001)
- **Benchmarking**: Test operations meet <100ms target on typical hardware

## Security Considerations

- **Path traversal**: Use `path.resolve()` to prevent `../` attacks in user-provided paths
- **Permission checks**: Verify execute permissions before treating files as executable
- **Error exposure**: Don't leak system paths in error messages beyond what's necessary for debugging
- **Symbolic links**: Follow symlinks by default (standard filesystem behavior)

## Open Questions

None - all technical decisions resolved.

## Next Steps

1. Implement functions in `repos/arashi/src/lib/filesystem.ts`
2. Write unit tests in `repos/arashi/tests/unit/filesystem.test.ts`
3. Verify cross-platform behavior on macOS, Linux, Windows
4. Validate performance meets <100ms target (SC-001)
5. Confirm test coverage >90% (SC-005)
