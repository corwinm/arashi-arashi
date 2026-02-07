# Function Contract: Worktree Path Calculation

**Feature**: 016-nested-worktree-paths  
**Date**: 2026-02-05  
**Type**: Internal Library Contract

## Overview

This document defines the contracts for internal functions that implement nested worktree path calculation. These are not external APIs but internal function signatures that must be maintained for consistency.

---

## Primary Functions

### 1. `detectRepositoryType()`

**Purpose**: Classify a repository as meta-repo, child, or standalone

**Signature**:
```typescript
async function detectRepositoryType(
  repo: Repository,
  config: ArashiConfig | null
): Promise<RepositoryTypeInfo>
```

**Parameters**:
- `repo` - Repository object to classify
  - Required fields: `path` (absolute path to repository)
  - Type: `Repository` from `src/core/repository.ts`
- `config` - Arashi configuration (null if not in meta-repo context)
  - Required fields: `repos_dir` (for child detection)
  - Type: `ArashiConfig | null`

**Returns**: `Promise<RepositoryTypeInfo>`
```typescript
{
  type: 'meta-repo' | 'child' | 'standalone',
  parentName?: string,        // Only for type='child'
  reposDir?: string,          // Only for type='child'
  reason: string              // Human-readable explanation
}
```

**Behavior**:
1. Check if repository contains `.arashi/config.json` → meta-repo
2. If config provided, check if path contains `repos_dir` segment → child
3. Otherwise → standalone

**Error Conditions**:
- Throws `Error` if file system access fails
- Never returns error for classification itself (defaults to standalone)

**Examples**:
```typescript
// Meta-repo
await detectRepositoryType(
  { path: "/workspace/project", name: "project" },
  null
)
// → { type: 'meta-repo', reason: 'Contains .arashi/config.json' }

// Child repo
await detectRepositoryType(
  { path: "/workspace/project/repos/frontend", name: "frontend" },
  { repos_dir: "./repos", /* ... */ }
)
// → { type: 'child', parentName: 'project', reposDir: 'repos', reason: '...' }

// Standalone
await detectRepositoryType(
  { path: "/workspace/standalone", name: "standalone" },
  null
)
// → { type: 'standalone', reason: 'Not a meta-repo and not in repos/ folder' }
```

---

### 2. `calculateWorktreePath()`

**Purpose**: Calculate destination path for a new worktree based on repository type

**Signature**:
```typescript
function calculateWorktreePath(
  repo: Repository,
  branchName: string,
  config: ArashiConfig,
  knownType?: RepositoryTypeInfo
): Promise<WorktreePathResult>
```

**Parameters**:
- `repo` - Repository for which to calculate path
  - Required fields: `path`, `name`
  - Type: `Repository`
- `branchName` - Target branch name (validated elsewhere)
  - Must be valid git branch name (no path separators)
  - Type: `string`
- `config` - Arashi configuration
  - Required fields: `repos_dir`
  - Type: `ArashiConfig`
- `knownType` - Optional pre-computed repository type (optimization)
  - If provided, skips type detection
  - Type: `RepositoryTypeInfo | undefined`

**Returns**: `Promise<WorktreePathResult>`
```typescript
{
  path: string,                    // Absolute path for worktree
  repositoryType: RepositoryType,  // Type used for calculation
  strategy: 'sibling' | 'nested',  // Strategy applied
  parentWorktreePath?: string      // Parent path (nested strategy only)
}
```

**Behavior**:
1. Detect repository type (or use `knownType` if provided)
2. Apply appropriate path calculation strategy:
   - **Meta-repo / Standalone**: Sibling strategy
   - **Child**: Nested strategy
3. Return absolute path and metadata

**Error Conditions**:
- Throws `Error` if child repo path doesn't contain `repos_dir`
- Throws `Error` if path calculation results in invalid path
- Propagates errors from `detectRepositoryType()`

**Examples**:
```typescript
// Meta-repo → sibling
await calculateWorktreePath(
  { path: "/workspace/project", name: "project" },
  "feature-123",
  { repos_dir: "./repos", /* ... */ }
)
// → {
//     path: "/workspace/project-feature-123",
//     repositoryType: "meta-repo",
//     strategy: "sibling"
//   }

// Child → nested
await calculateWorktreePath(
  { path: "/workspace/project/repos/frontend", name: "frontend" },
  "feature-123",
  { repos_dir: "./repos", /* ... */ }
)
// → {
//     path: "/workspace/project-feature-123/repos/frontend",
//     repositoryType: "child",
//     strategy: "nested",
//     parentWorktreePath: "/workspace/project-feature-123"
//   }

// Standalone → sibling
await calculateWorktreePath(
  { path: "/workspace/standalone", name: "standalone" },
  "bugfix-456",
  { repos_dir: "./repos", /* ... */ }
)
// → {
//     path: "/workspace/standalone-bugfix-456",
//     repositoryType: "standalone",
//     strategy: "sibling"
//   }
```

---

### 3. `calculateChildWorktreePath()` (Helper)

**Purpose**: Calculate nested path for child repositories (internal helper)

**Signature**:
```typescript
function calculateChildWorktreePath(
  repo: Repository,
  branchName: string,
  parentName: string,
  reposDir: string
): string
```

**Parameters**:
- `repo` - Child repository
  - Required fields: `path`, `name`
- `branchName` - Target branch name
- `parentName` - Parent repository name (from detection)
- `reposDir` - Name of repos directory (e.g., "repos")

**Returns**: `string` - Absolute path to nested worktree

**Behavior**:
1. Construct parent worktree name: `${parentName}-${branchName}`
2. Navigate up from child repo to workspace level: `../../../`
3. Append parent worktree path
4. Append repos directory and child name

**Error Conditions**:
- Throws `Error` if path construction fails
- Assumes `parentName` and `reposDir` are valid (validated by caller)

**Example**:
```typescript
calculateChildWorktreePath(
  { path: "/workspace/project/repos/frontend", name: "frontend" },
  "feature-123",
  "project",
  "repos"
)
// → "/workspace/project-feature-123/repos/frontend"
```

---

## Modified Functions

### `processRepository()`

**Change**: Add `config` parameter to enable path calculation

**Old Signature**:
```typescript
async function processRepository(
  repo: Repository,
  branchName: string,
  operationLog: OperationLog,
  options: Required<WorktreeOperationOptions>,
  conflicts: BranchConflict[] = [],
  strategy: ConflictResolutionStrategy | null = null
): Promise<RepositoryResult>
```

**New Signature**:
```typescript
async function processRepository(
  repo: Repository,
  branchName: string,
  operationLog: OperationLog,
  options: Required<WorktreeOperationOptions>,
  config: ArashiConfig,  // ← NEW PARAMETER
  conflicts: BranchConflict[] = [],
  strategy: ConflictResolutionStrategy | null = null
): Promise<RepositoryResult>
```

**Impact**:
- Caller (`createCoordinatedWorktrees()`) must load and pass config
- All existing calls to `processRepository()` must be updated

**Modified Line** (line 635):
```typescript
// OLD:
const worktreePath = join(repo.path, "..", `${repo.name}-${branchName}`);

// NEW:
const pathResult = await calculateWorktreePath(repo, branchName, config);
const worktreePath = pathResult.path;
```

---

## Integration Points

### Where Functions Are Called

**`detectRepositoryType()`**:
- Called internally by `calculateWorktreePath()`
- May be called directly for type checking/validation

**`calculateWorktreePath()`**:
- Called in `processRepository()` at line 635
- Replaces inline path calculation

**`processRepository()`** (modified):
- Called in `createCoordinatedWorktrees()` at line 461

### Required Changes in Calling Code

**File**: `src/core/worktree.ts`

**Function**: `createCoordinatedWorktrees()` (lines 407-504)

**Change**: Load config and pass to `processRepository()`

```typescript
// At start of function (after line 421):
const config = await loadConfig('.'); // Load Arashi config

// In repository processing loop (around line 461):
const repoResult = await processRepository(
  repo,
  branchName,
  operationLog,
  completeOptions,
  config,  // ← Pass config to processRepository
  conflicts,
  strategy
);
```

---

## Testing Contract

### Unit Tests Required

**Test**: `detectRepositoryType()`
- Meta-repo detection (has .arashi/config.json)
- Child repo detection (path contains repos/)
- Standalone detection (neither)
- Null config handling
- Custom repos_dir handling

**Test**: `calculateWorktreePath()`
- Meta-repo → sibling path
- Child repo → nested path
- Standalone repo → sibling path
- Verify parent path extraction
- Verify repos_dir usage

**Test**: `calculateChildWorktreePath()`
- Basic nested path construction
- Different branch names
- Different parent names
- Different repos directory names

### Integration Tests Required

**Scenario 1**: Create worktree for meta-repo
- Verify worktree created as sibling
- Verify path matches expected pattern

**Scenario 2**: Create worktrees for meta-repo + child repos
- Verify meta-repo worktree is sibling
- Verify child worktrees are nested inside parent worktree
- Verify directory structure matches original

**Scenario 3**: Create worktree for standalone repo
- Verify backward compatibility (sibling creation)
- Verify no regression from current behavior

---

## Versioning

**Semantic Version Impact**: PATCH (bug fix, pre-1.0.0)

**Breaking Changes**: None (internal functions, public behavior fixed not changed)

**Deprecation**: None

---

## Notes

**Cross-Platform Considerations**:
- Use `path.sep` for path splitting (handles `/` vs `\`)
- Use `path.join()` for path construction (platform-agnostic)
- All paths must be absolute (use `path.resolve()` if relative)

**Performance**:
- Type detection involves one file existence check (`.arashi/config.json`)
- Path calculation is pure string manipulation (no I/O)
- Negligible performance impact (< 1ms per repository)

**Security**:
- No user input in path construction (branch name validated separately)
- Path traversal (`../../../`) is intentional and safe (within workspace)
- Git validates final path when creating worktree
