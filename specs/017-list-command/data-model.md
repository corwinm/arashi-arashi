# Data Model: List Command

**Feature**: 017-list-command  
**Date**: 2026-02-06  
**Status**: Complete

## Overview

This document defines the data structures and entities used by the list command. The data model supports both human-readable terminal output and machine-parseable JSON output formats.

---

## Core Entities

### 1. WorktreeListItem

Represents a single worktree with its status and metadata.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `path` | `string` | Yes | Absolute filesystem path to worktree | Must be absolute path; must exist on filesystem |
| `branch` | `string \| null` | Yes | Branch name, or null for detached HEAD | Non-empty string when present |
| `commit` | `string` | Yes | Short commit SHA (7 characters) | 7-character hex string |
| `locked` | `boolean` | Yes | Whether worktree is locked | - |
| `lockReason` | `string` | No | Reason for lock (if locked) | Only present when `locked === true` |
| `hasChanges` | `boolean` | Yes | Whether uncommitted changes exist | Computed from git status |
| `isMain` | `boolean` | Yes | True for main worktree, false for linked | Only one worktree can have `isMain === true` |
| `subRepositories` | `SubRepositoryInfo[]` | No | Nested sub-repositories (verbose mode only) | Only present when `--verbose` flag used |

**Relationships**:
- Each `WorktreeListItem` may contain zero or more `SubRepositoryInfo` objects
- One `WorktreeListItem` per repository must have `isMain === true`

**State Transitions**: None (read-only entity)

**Example**:
```typescript
{
  path: '/Users/user/projects/myrepo',
  branch: 'main',
  commit: 'a1b2c3d',
  locked: false,
  hasChanges: false,
  isMain: true
}
```

---

### 2. SubRepositoryInfo

Represents a nested repository within a worktree.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `relativePath` | `string` | Yes | Path relative to parent worktree | Must be relative path; cannot start with `/` or `..` |
| `branch` | `string \| null` | Yes | Branch name, or null for detached HEAD | Non-empty string when present |
| `commit` | `string` | Yes | Short commit SHA (7 characters) | 7-character hex string |
| `hasChanges` | `boolean` | Yes | Whether uncommitted changes exist | Computed from git status |

**Relationships**:
- Owned by parent `WorktreeListItem`
- Multiple `SubRepositoryInfo` objects may belong to one `WorktreeListItem`

**State Transitions**: None (read-only entity)

**Example**:
```typescript
{
  relativePath: 'repos/frontend',
  branch: 'feature-123',
  commit: 'e4f5g6h',
  hasChanges: true
}
```

---

### 3. ListCommandOptions

Command-line options for the list command.

**Fields**:

| Field | Type | Required | Description | Validation Rules | Default |
|-------|------|----------|-------------|------------------|---------|
| `verbose` | `boolean` | No | Show detailed sub-repository information | - | `false` |
| `json` | `boolean` | No | Output in JSON format | - | `false` |
| `maxDepth` | `number` | No | Maximum depth for sub-repo discovery | Must be positive integer | `3` |

**Validation Rules**:
- `verbose` and `json` can both be true (JSON output includes verbose data)
- `maxDepth` only used when `verbose === true`

**Example**:
```typescript
{
  verbose: true,
  json: false,
  maxDepth: 3
}
```

---

### 4. ListCommandOutput

Complete output structure for the list command.

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `worktrees` | `WorktreeListItem[]` | Yes | List of all worktrees | At least one worktree (main repo) |
| `totalCount` | `number` | Yes | Total number of worktrees | Must equal `worktrees.length` |
| `repositoryPath` | `string` | Yes | Path to main repository | Absolute path |

**Validation Rules**:
- At least one worktree with `isMain === true` must exist
- `totalCount` must match array length
- All paths must be absolute

**Example**:
```typescript
{
  worktrees: [
    {
      path: '/Users/user/projects/myrepo',
      branch: 'main',
      commit: 'a1b2c3d',
      locked: false,
      hasChanges: false,
      isMain: true
    },
    {
      path: '/Users/user/worktrees/feature-123',
      branch: 'feature-123',
      commit: 'e4f5g6h',
      locked: false,
      hasChanges: true,
      isMain: false,
      subRepositories: [
        {
          relativePath: 'repos/frontend',
          branch: 'feature-123',
          commit: 'i7j8k9l',
          hasChanges: false
        }
      ]
    }
  ],
  totalCount: 2,
  repositoryPath: '/Users/user/projects/myrepo'
}
```

---

## Derived Data

### 1. Status Summary

Computed from `WorktreeListItem.hasChanges`:

| Status | Condition | Display |
|--------|-----------|---------|
| Clean | `hasChanges === false && locked === false` | `✓ clean` (green) |
| Modified | `hasChanges === true` | `✗ modified` (red) |
| Locked | `locked === true` | `🔒 locked` (gray) |

### 2. Worktree Type

Computed from `WorktreeListItem.isMain`:

| Type | Condition | Display |
|------|-----------|---------|
| Main | `isMain === true` | "Main worktree" |
| Linked | `isMain === false` | "Linked worktree" |

---

## Data Flow

```
┌─────────────────────┐
│   Configuration     │ (loaded from .arashi/config.json)
│   Repository Path   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Git Commands      │
│   - git worktree    │
│     list            │
│   - git status      │
│   - git rev-parse   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Parse & Map       │ (map git output to WorktreeListItem)
│   - Extract fields  │
│   - Compute status  │
└──────────┬──────────┘
           │
           ▼ (if verbose)
┌─────────────────────┐
│   Discover Sub-     │
│   Repositories      │ (recursive filesystem scan)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  ListCommandOutput  │
└──────────┬──────────┘
           │
           ├──── (if json) ────▶ JSON.stringify()
           │
           └──── (default) ────▶ Format table with chalk
```

---

## Validation Rules Summary

### WorktreeListItem Validation

```typescript
function validateWorktreeListItem(item: any): asserts item is WorktreeListItem {
  if (typeof item.path !== 'string' || !path.isAbsolute(item.path)) {
    throw new ValidationError('path must be absolute string');
  }
  
  if (item.branch !== null && typeof item.branch !== 'string') {
    throw new ValidationError('branch must be string or null');
  }
  
  if (typeof item.commit !== 'string' || !/^[0-9a-f]{7}$/.test(item.commit)) {
    throw new ValidationError('commit must be 7-character hex string');
  }
  
  if (typeof item.locked !== 'boolean') {
    throw new ValidationError('locked must be boolean');
  }
  
  if (item.locked && typeof item.lockReason !== 'string') {
    throw new ValidationError('lockReason required when locked is true');
  }
  
  if (typeof item.hasChanges !== 'boolean') {
    throw new ValidationError('hasChanges must be boolean');
  }
  
  if (typeof item.isMain !== 'boolean') {
    throw new ValidationError('isMain must be boolean');
  }
  
  if (item.subRepositories && !Array.isArray(item.subRepositories)) {
    throw new ValidationError('subRepositories must be array');
  }
}
```

### ListCommandOutput Validation

```typescript
function validateListCommandOutput(output: any): asserts output is ListCommandOutput {
  if (!Array.isArray(output.worktrees) || output.worktrees.length === 0) {
    throw new ValidationError('worktrees must be non-empty array');
  }
  
  const mainWorktrees = output.worktrees.filter(wt => wt.isMain);
  if (mainWorktrees.length !== 1) {
    throw new ValidationError('exactly one worktree must have isMain === true');
  }
  
  if (output.totalCount !== output.worktrees.length) {
    throw new ValidationError('totalCount must match worktrees.length');
  }
  
  if (typeof output.repositoryPath !== 'string' || !path.isAbsolute(output.repositoryPath)) {
    throw new ValidationError('repositoryPath must be absolute string');
  }
  
  // Validate each worktree
  output.worktrees.forEach(validateWorktreeListItem);
}
```

---

## Error Scenarios

| Scenario | Detection | Response |
|----------|-----------|----------|
| No repository found | `!isGitRepository(cwd)` | Error: "Not a git repository. Run from repository root." |
| Configuration missing | `!configExists(repoPath)` | Error: "Configuration not found. Run 'arashi init' first." |
| Permission denied on worktree | `getStatus()` throws permission error | Warning: Skip worktree, log error, continue |
| Corrupted worktree | `listWorktrees()` includes invalid path | Warning: Mark as invalid in output |
| No worktrees (only main repo) | `worktrees.length === 1 && worktrees[0].isMain` | Info: "No additional worktrees found." + suggestion |

---

## JSON Schema (for validation)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["worktrees", "totalCount", "repositoryPath"],
  "properties": {
    "worktrees": {
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/WorktreeListItem"
      }
    },
    "totalCount": {
      "type": "number",
      "minimum": 1
    },
    "repositoryPath": {
      "type": "string"
    }
  },
  "definitions": {
    "WorktreeListItem": {
      "type": "object",
      "required": ["path", "branch", "commit", "locked", "hasChanges", "isMain"],
      "properties": {
        "path": { "type": "string" },
        "branch": { "type": ["string", "null"] },
        "commit": { "type": "string", "pattern": "^[0-9a-f]{7}$" },
        "locked": { "type": "boolean" },
        "lockReason": { "type": "string" },
        "hasChanges": { "type": "boolean" },
        "isMain": { "type": "boolean" },
        "subRepositories": {
          "type": "array",
          "items": { "$ref": "#/definitions/SubRepositoryInfo" }
        }
      }
    },
    "SubRepositoryInfo": {
      "type": "object",
      "required": ["relativePath", "branch", "commit", "hasChanges"],
      "properties": {
        "relativePath": { "type": "string" },
        "branch": { "type": ["string", "null"] },
        "commit": { "type": "string", "pattern": "^[0-9a-f]{7}$" },
        "hasChanges": { "type": "boolean" }
      }
    }
  }
}
```

---

## Edge Cases Handled by Data Model

1. **Detached HEAD**: `branch` field is `null`
2. **Locked worktrees**: `locked` field is `true`, `lockReason` may be present
3. **No additional worktrees**: `worktrees.length === 1` with single main worktree
4. **No sub-repositories**: `subRepositories` field is omitted (not empty array)
5. **Unmounted paths**: Included in list with warning flag (future enhancement)
6. **Long paths/branch names**: No artificial truncation; terminal handles wrapping

---

**Status**: ✅ Data model complete. Ready for contract generation.
