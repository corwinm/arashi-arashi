# Data Model: Nested Worktree Paths

**Feature**: 016-nested-worktree-paths  
**Date**: 2026-02-05  
**Phase**: 1 - Design

## Overview

This document defines the data structures and types needed to support nested worktree path calculation for multi-repo setups.

---

## Core Types

### Repository Type Classification

**Purpose**: Distinguish between three types of repositories to determine worktree path strategy

```typescript
/**
 * Classification of repository based on location and configuration
 */
export type RepositoryType = 
  | 'meta-repo'    // Repository with .arashi/config.json
  | 'child'        // Repository inside a meta-repo's repos/ folder
  | 'standalone';  // Independent repository (not meta-repo or child)

/**
 * Context required to determine repository type
 */
export interface RepositoryTypeContext {
  /** Repository to classify */
  repository: Repository;
  
  /** Arashi configuration (if available) */
  config: ArashiConfig | null;
  
  /** Override for testing/special cases */
  forceType?: RepositoryType;
}

/**
 * Result of repository type detection
 */
export interface RepositoryTypeInfo {
  /** Detected or forced repository type */
  type: RepositoryType;
  
  /** For 'child' type: parent repository name */
  parentName?: string;
  
  /** For 'child' type: repos directory name from config */
  reposDir?: string;
  
  /** Human-readable explanation of type classification */
  reason: string;
}
```

### Worktree Path Calculation

**Purpose**: Encapsulate path calculation logic with inputs and outputs

```typescript
/**
 * Input parameters for worktree path calculation
 */
export interface WorktreePathParams {
  /** Repository for which to calculate worktree path */
  repository: Repository;
  
  /** Branch name for the worktree */
  branchName: string;
  
  /** Arashi configuration */
  config: ArashiConfig;
  
  /** Optional repository type (if already detected) */
  knownType?: RepositoryType;
}

/**
 * Result of worktree path calculation
 */
export interface WorktreePathResult {
  /** Absolute path where worktree should be created */
  path: string;
  
  /** Repository type used for calculation */
  repositoryType: RepositoryType;
  
  /** Path calculation strategy applied */
  strategy: 'sibling' | 'nested';
  
  /** For 'nested' strategy: parent worktree path */
  parentWorktreePath?: string;
}
```

---

## Path Calculation Strategies

### Strategy: Sibling Creation

**Applies to**: Meta-repos and standalone repositories

**Algorithm**:
```
Input:
  - repo.path: /absolute/path/to/repository
  - repo.name: repository
  - branchName: feature

Output:
  - worktreePath: /absolute/path/to/repository-feature

Calculation:
  join(repo.path, "..", `${repo.name}-${branchName}`)
```

**Visual representation**:
```
Before:
  workspace/
  └── repository/           (source)

After:
  workspace/
  ├── repository/           (source)
  └── repository-feature/   (worktree)
```

### Strategy: Nested Creation

**Applies to**: Child repositories

**Algorithm**:
```
Input:
  - repo.path: /absolute/path/to/parent-repo/repos/child-repo
  - repo.name: child-repo
  - branchName: feature
  - config.repos_dir: "./repos"

Step 1: Extract parent name
  - Split path by separator
  - Find index of "repos" segment
  - Parent name = segment before "repos"
  - Result: "parent-repo"

Step 2: Extract repos directory name
  - Get basename of config.repos_dir
  - Default: "repos"

Step 3: Construct nested path
  - Navigate up to workspace level: ../../..
  - Append parent worktree name: parent-repo-feature
  - Append repos directory: repos
  - Append child name: child-repo
  
Output:
  - worktreePath: /absolute/path/to/parent-repo-feature/repos/child-repo

Calculation:
  const pathParts = repo.path.split(sep);
  const reposIndex = pathParts.lastIndexOf(reposDir);
  const parentName = pathParts[reposIndex - 1];
  const parentWorktree = `${parentName}-${branchName}`;
  
  return join(
    repo.path, "..", "..", "..",
    parentWorktree,
    reposDir,
    repo.name
  );
```

**Visual representation**:
```
Before:
  workspace/
  └── parent-repo/               (meta-repo source)
      └── repos/
          └── child-repo/        (child source)

After:
  workspace/
  ├── parent-repo/               (meta-repo source)
  │   └── repos/
  │       └── child-repo/        (child source)
  └── parent-repo-feature/       (meta-repo worktree)
      └── repos/
          └── child-repo/        (child worktree - NESTED!)
```

---

## Detection Logic

### Meta-Repo Detection

**Criteria**: Repository contains `.arashi/config.json`

```typescript
async function isMetaRepo(repo: Repository): Promise<boolean> {
  const configPath = join(repo.path, '.arashi', 'config.json');
  return await fileExists(configPath);
}
```

### Child Repo Detection

**Criteria**: Repository path contains a `repos/` segment (or custom `repos_dir` value)

```typescript
function isChildRepo(
  repo: Repository,
  config: ArashiConfig
): boolean {
  const reposDir = basename(config.repos_dir);
  const pathParts = repo.path.split(sep);
  return pathParts.includes(reposDir);
}
```

### Standalone Repo Detection

**Criteria**: Neither meta-repo nor child repo

```typescript
async function detectRepositoryType(
  repo: Repository,
  config: ArashiConfig | null
): Promise<RepositoryTypeInfo> {
  // Check meta-repo first
  const isMeta = await isMetaRepo(repo);
  if (isMeta) {
    return {
      type: 'meta-repo',
      reason: 'Contains .arashi/config.json'
    };
  }
  
  // Check child repo if config available
  if (config && isChildRepo(repo, config)) {
    const reposDir = basename(config.repos_dir);
    const pathParts = repo.path.split(sep);
    const reposIndex = pathParts.lastIndexOf(reposDir);
    const parentName = pathParts[reposIndex - 1];
    
    return {
      type: 'child',
      parentName,
      reposDir,
      reason: `Located in ${parentName}/${reposDir}/`
    };
  }
  
  // Default: standalone
  return {
    type: 'standalone',
    reason: 'Not a meta-repo and not in repos/ folder'
  };
}
```

---

## State Transitions

**No state changes** - This feature only affects path calculation, which is a pure function. No state mutations or database changes.

---

## Validation Rules

### Repository Path Validation

**Rule**: Child repositories must have "repos" (or configured `repos_dir`) in their path

```typescript
function validateChildRepoPath(
  repo: Repository,
  config: ArashiConfig
): void {
  const reposDir = basename(config.repos_dir);
  const pathParts = repo.path.split(sep);
  const reposIndex = pathParts.lastIndexOf(reposDir);
  
  if (reposIndex === -1) {
    throw new Error(
      `Child repository path must contain '${reposDir}': ${repo.path}`
    );
  }
  
  if (reposIndex === 0 || reposIndex === pathParts.length - 1) {
    throw new Error(
      `Invalid child repository path structure: ${repo.path}`
    );
  }
}
```

### Branch Name Validation

**Rule**: Branch names used in paths must not contain path separators

**Existing validation**: `isValidBranchName()` in `src/core/worktree.ts:337-367`

**No changes needed** - Current validation already prevents path separator characters.

---

## Entity Relationships

```
ArashiConfig
  └── repos_dir: string (e.g., "./repos")
  └── discovered_repos: Record<string, RepoConfig>
      └── RepoConfig
          └── path: string

Repository
  └── path: string
  └── name: string

RepositoryTypeInfo
  └── type: RepositoryType
  └── parentName?: string (for child repos)
  └── reposDir?: string (for child repos)

WorktreePathResult
  └── path: string (calculated destination)
  └── repositoryType: RepositoryType
  └── strategy: 'sibling' | 'nested'
  └── parentWorktreePath?: string (for nested strategy)
```

---

## Examples

### Example 1: Meta-Repo Worktree

**Input**:
```typescript
{
  repository: {
    path: "/Users/dev/workspace/my-project",
    name: "my-project"
  },
  branchName: "feature-123",
  config: { /* ... */ }
}
```

**Detection**:
```typescript
{
  type: "meta-repo",
  reason: "Contains .arashi/config.json"
}
```

**Path Calculation**:
```typescript
{
  path: "/Users/dev/workspace/my-project-feature-123",
  repositoryType: "meta-repo",
  strategy: "sibling"
}
```

### Example 2: Child Repo Worktree

**Input**:
```typescript
{
  repository: {
    path: "/Users/dev/workspace/my-project/repos/frontend",
    name: "frontend"
  },
  branchName: "feature-123",
  config: {
    repos_dir: "./repos"
  }
}
```

**Detection**:
```typescript
{
  type: "child",
  parentName: "my-project",
  reposDir: "repos",
  reason: "Located in my-project/repos/"
}
```

**Path Calculation**:
```typescript
{
  path: "/Users/dev/workspace/my-project-feature-123/repos/frontend",
  repositoryType: "child",
  strategy: "nested",
  parentWorktreePath: "/Users/dev/workspace/my-project-feature-123"
}
```

### Example 3: Standalone Repo Worktree

**Input**:
```typescript
{
  repository: {
    path: "/Users/dev/personal/simple-project",
    name: "simple-project"
  },
  branchName: "bugfix-456",
  config: null
}
```

**Detection**:
```typescript
{
  type: "standalone",
  reason: "Not a meta-repo and not in repos/ folder"
}
```

**Path Calculation**:
```typescript
{
  path: "/Users/dev/personal/simple-project-bugfix-456",
  repositoryType: "standalone",
  strategy: "sibling"
}
```

---

## Migration Considerations

**Backward Compatibility**: ✅ Maintained

- Existing meta-repos: No change (still use sibling strategy)
- Existing standalone repos: No change (still use sibling strategy)
- Child repos: Behavior changes, but this is a bug fix (current behavior is incorrect)

**No data migration needed** - This is a behavioral change only, no persistent data affected.
