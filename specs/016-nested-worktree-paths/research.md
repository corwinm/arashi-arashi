# Research: Nested Worktree Paths for Multi-Repo Setup

**Feature**: 016-nested-worktree-paths  
**Date**: 2026-02-05  
**Phase**: 0 - Research & Investigation

## Overview

This document contains research findings to inform the implementation of nested worktree paths for multi-repo setups. The goal is to fix the bug where child repo worktrees are created as siblings instead of being nested inside parent worktree's `repos/` folder.

---

## 1. Repository Type Detection

### Question
How to reliably detect if a repo is a meta-repo, child repo, or standalone repo?

### Findings

**Meta-Repo Detection**:
- **Marker**: Presence of `.arashi/config.json` at repository root
- **Function**: `configExists(repoPath: string): Promise<boolean>` in `src/lib/config.ts:179-183`
- **Implementation**: Uses `Bun.file(configPath).exists()`

**Child Repo Identification**:
- **Strategy**: Location-based detection within `repos_dir` (default: `./repos`)
- **Discovery**: Recursive `.git` directory scanning in `discoverRepositories()` (`src/core/repository.ts:334-429`)
- **Registry**: Child repos stored in parent's `discovered_repos` object
- **Relationship**: Implicit, one-way (parent → children), based on directory structure

**Standalone Repo**:
- By elimination: Repository that is neither a meta-repo (no `.arashi/config.json`) nor located in a parent's `repos/` folder

### Available Information

From `Repository` interface (`src/core/repository.ts:30-43`):
```typescript
{
  name: string;              // Directory name
  path: string;              // Absolute filesystem path
  defaultBranch: string;     // e.g., "main"
  hasSetupScript: boolean;
  setupScriptPath?: string;
  remoteUrl?: string;
}
```

From `ArashiConfig` (loaded via `config.loadConfig('.')`):
```typescript
{
  version: string;
  repos_dir: string;         // Default: "./repos"
  auto_setup: boolean;
  discovered_repos: Record<string, RepoConfig>;
}
```

### Decision

**Three-way classification logic**:

1. **Meta-repo**: `await configExists(repo.path)` returns `true`
2. **Child repo**: `repo.path` is inside a parent's `repos_dir`
   - Check if path contains pattern matching `repos/` relative to meta-repo root
   - Or check if repo is listed in parent's `discovered_repos`
3. **Standalone**: Neither of the above

**Implementation approach**: Extract repository type detection into a dedicated function that accepts `Repository` and `ArashiConfig` and returns an enum value.

---

## 2. Path Calculation Strategy

### Question
How to calculate the correct worktree path for each repository type?

### Current Implementation

**Location**: `src/core/worktree.ts:635`

```typescript
const worktreePath = join(repo.path, "..", `${repo.name}-${branchName}`);
```

**Behavior**: Always creates worktree as sibling to source repository

**Example**:
- `repo.path` = `/Users/user/workspace/arashi`
- `repo.name` = `arashi`
- `branchName` = `feature`
- **Result**: `/Users/user/workspace/arashi-feature`

### Required Behavior

**Meta-repo** (unchanged):
```typescript
// Input: repo.path = /Users/user/workspace/parent-repo
// Output: /Users/user/workspace/parent-repo-feature
join(repo.path, "..", `${repo.name}-${branchName}`)
```

**Child repo** (new):
```typescript
// Input: repo.path = /Users/user/workspace/parent-repo/repos/child-repo
// Output: /Users/user/workspace/parent-repo-feature/repos/child-repo
//
// Strategy: Navigate up to repos/ folder, then up one more to parent,
// then construct path to parent worktree and back down to repos/child-repo

// Steps:
// 1. Get parent repo name from path: "parent-repo"
// 2. Calculate parent worktree path: ../../../parent-repo-feature/
// 3. Append repos/<child-name>: ../../../parent-repo-feature/repos/child-repo
```

**Standalone** (unchanged):
```typescript
// Same as current behavior - sibling creation
join(repo.path, "..", `${repo.name}-${branchName}`)
```

### Path Calculation Algorithm

**For child repos**:

```typescript
// Given: repo.path = /absolute/path/to/parent-repo/repos/child-repo
// Given: branchName = "feature"

// Step 1: Extract parent repo name
//   Split path and find "repos" segment, take the one before it
//   parent-repo/repos/child-repo → parent = "parent-repo"

// Step 2: Build relative path to parent worktree
//   From child repo: ../../../ → up to workspace level
//   Then: parent-repo-feature/ → parent worktree directory

// Step 3: Append repos/<child-name>
//   ../../../parent-repo-feature/repos/child-repo

const pathParts = repo.path.split(sep);
const reposIndex = pathParts.lastIndexOf('repos');
const parentName = pathParts[reposIndex - 1];
const parentWorktree = `${parentName}-${branchName}`;

const worktreePath = join(
  repo.path,                    // /abs/path/parent-repo/repos/child-repo
  "..", "..", "..",             // → /abs/path/
  parentWorktree,               // → /abs/path/parent-repo-feature/
  "repos",                      // → /abs/path/parent-repo-feature/repos/
  repo.name                     // → /abs/path/parent-repo-feature/repos/child-repo
);
```

### Decision

**Extract path calculation into a separate function**:

```typescript
function calculateWorktreePath(
  repo: Repository,
  branchName: string,
  config: ArashiConfig
): string {
  const repoType = detectRepositoryType(repo, config);
  
  switch (repoType) {
    case 'meta-repo':
    case 'standalone':
      // Sibling creation (current behavior)
      return join(repo.path, "..", `${repo.name}-${branchName}`);
    
    case 'child':
      // Nested creation (new behavior)
      return calculateChildWorktreePath(repo, branchName);
  }
}

function calculateChildWorktreePath(
  repo: Repository,
  branchName: string
): string {
  // Extract parent name from path (segment before 'repos')
  const pathParts = repo.path.split(sep);
  const reposIndex = pathParts.lastIndexOf('repos');
  
  if (reposIndex === -1) {
    throw new Error(`Expected 'repos' in path for child repo: ${repo.path}`);
  }
  
  const parentName = pathParts[reposIndex - 1];
  const parentWorktree = `${parentName}-${branchName}`;
  
  // Build path: ../../../<parent-worktree>/repos/<child-name>
  return join(repo.path, "..", "..", "..", parentWorktree, "repos", repo.name);
}
```

**Rationale**:
- Separates path logic from orchestration logic
- Makes code testable (can unit test path calculation)
- Clear separation of concerns
- Easy to extend if more repository types are added

---

## 3. Directory Creation

### Question
Should we create the `repos/` folder in parent worktree automatically?

### Current Behavior

**Git handles directory creation**:
- `git worktree add <path> <branch>` creates all parent directories automatically
- No explicit `mkdir -p` needed before running git command
- Evidence: No directory creation in `processRepository()` before line 637

**Filesystem utilities available** (but not used):
- `ensureDir(path)` in `src/lib/filesystem.ts:124-130`
- Uses `mkdir(path, { recursive: true })` (equivalent to `mkdir -p`)

### Decision

**No explicit directory creation needed** (FR-008 satisfied by git automatically).

**Rationale**:
1. `git worktree add` creates parent directories automatically
2. When we call `git worktree add ../../../parent-feature/repos/child-repo feature`, git will:
   - Create `parent-feature/` if it doesn't exist
   - Create `parent-feature/repos/` if it doesn't exist
   - Create `parent-feature/repos/child-repo/` and populate with worktree

3. This maintains consistency with existing behavior (no pre-creation)
4. Reduces complexity and error surfaces

**Edge case**: If parent worktree doesn't exist yet, git will create the entire path structure. This is the expected and desired behavior.

---

## 4. Edge Cases

### Edge Case 1: Missing `repos/` Folder in Parent Worktree

**Scenario**: Child worktree created before parent worktree has `repos/` folder

**Mitigation**: Git creates the folder automatically (see section 3)

### Edge Case 2: Child Repo Created Before Parent Worktree

**Scenario**: User manually creates child worktree before parent worktree exists

**Current behavior**: Would fail because parent worktree path doesn't exist

**Mitigation**: 
- Git will create entire directory path including parent worktree folder
- This is acceptable behavior - git handles it gracefully
- Alternative: Add validation to check if parent worktree exists first (optional enhancement)

### Edge Case 3: Deeply Nested Meta-Repos

**Scenario**: Meta-repo contains another meta-repo in `repos/`

**Decision**: Out of scope for this fix. Current implementation assumes:
- One level of nesting (parent meta-repo with child repos)
- Child repos are NOT meta-repos themselves

**Rationale**: Spec doesn't address this case; can be handled in future enhancement

### Edge Case 4: Repositories with Custom Paths Outside `repos/`

**Scenario**: Configuration specifies child repos in non-standard locations

**Decision**: Follow the `repos_dir` configuration value instead of hardcoding "repos"

**Implementation**:
```typescript
// Instead of hardcoding "repos":
join(repo.path, "..", "..", "..", parentWorktree, "repos", repo.name)

// Use config value:
const reposDir = basename(config.repos_dir);  // Extract "repos" from "./repos"
join(repo.path, "..", "..", "..", parentWorktree, reposDir, repo.name)
```

### Edge Case 5: Branch Names with Special Characters

**Scenario**: Branch name contains `/`, `\`, spaces, or other special characters

**Current handling**: 
- `isValidBranchName()` validation in `src/core/worktree.ts:337-367`
- Prevents invalid git branch names

**Impact on paths**:
- Branch name becomes part of directory name
- `/` would create nested directories (undesired)
- Validation already prevents this

**Decision**: No additional handling needed; existing validation is sufficient

---

## 5. Existing Code Patterns

### Operation Logging and Rollback

**Pattern**: All operations are logged for rollback on failure

**Implementation** (`src/core/worktree.ts`):
```typescript
// Line 654-662: Log worktree creation
operationLog.add({
  type: 'worktree_create',
  repository: repo,
  data: { path: worktreePath, branch: branchName },
});

// Line 490-504: Automatic rollback on error
} catch (error) {
  await operationLog.rollback();
  // ...
}
```

**Impact**: Path calculation change doesn't affect rollback mechanism. Rollback uses the logged worktree path to remove it.

### Error Handling Pattern

**Pattern**: Wrap errors with context using custom error classes

**Example**:
```typescript
throw new GitOperationError(
  `Failed to create worktree in ${repo.name}`,
  "worktree_create",
  repo,
  error as Error
);
```

**Impact**: Should follow same pattern if new validation errors are introduced

### Path Utilities

**Available utilities** (`src/lib/filesystem.ts`):
- `ensureDir(path)` - Create directory recursively
- `pathExists(path)` - Check if path exists
- `removeDir(path)` - Delete directory recursively

**Standard Node.js/Bun path APIs**:
- `join()`, `dirname()`, `basename()`, `resolve()`, `sep`

---

## Conclusions and Recommendations

### Key Findings

1. **Repository type detection is straightforward**: Check for `.arashi/config.json` and path location
2. **Path calculation is isolated**: Occurs in one place (`worktree.ts:635`), easy to modify
3. **Git handles directory creation**: No need for explicit `mkdir -p`
4. **Rollback mechanism is robust**: Will work with new path logic without changes
5. **Edge cases are manageable**: Most handled by git; some out of scope

### Implementation Strategy

**Recommended approach**:

1. **Create repository type detection function**:
   ```typescript
   type RepositoryType = 'meta-repo' | 'child' | 'standalone';
   
   function detectRepositoryType(
     repo: Repository,
     config: ArashiConfig
   ): RepositoryType
   ```

2. **Extract path calculation to dedicated function**:
   ```typescript
   function calculateWorktreePath(
     repo: Repository,
     branchName: string,
     config: ArashiConfig
   ): string
   ```

3. **Implement child-specific path logic**:
   ```typescript
   function calculateChildWorktreePath(
     repo: Repository,
     branchName: string,
     config: ArashiConfig
   ): string
   ```

4. **Replace inline path calculation**:
   - Replace line 635 in `processRepository()`
   - Pass `config` parameter to `processRepository()` (requires function signature change)

5. **Update calling code**:
   - `createCoordinatedWorktrees()` needs to load config and pass to `processRepository()`

6. **Add comprehensive tests**:
   - Unit tests for path calculation functions
   - Integration tests for all three repository types

### Alternatives Considered

**Alternative 1: Hardcode "repos" instead of using config value**
- **Rejected**: Less flexible; breaks if users configure different `repos_dir`

**Alternative 2: Check if parent worktree exists before creating child**
- **Rejected**: Unnecessary; git handles missing parents gracefully

**Alternative 3: Create dedicated RepositoryType class with path calculation method**
- **Rejected**: Over-engineering for a simple fix; functions are sufficient

### Dependencies

**No new dependencies required**:
- Uses existing path utilities from Node.js/Bun
- Uses existing git command execution (`git.exec()`)
- Uses existing configuration loading (`config.loadConfig()`)

### Performance Impact

**Minimal performance impact**:
- Path calculation: +1 function call, +1 conditional branch
- String operations: Negligible (split, join)
- No additional I/O or git commands
- Well within Constitution Principle X (< 30s for 5 repos)

### Security Considerations

**Path traversal**:
- Using `../../../` is safe because we're navigating within workspace
- Path is validated by git when creating worktree
- No user input directly in path construction (branch name already validated)

**No new security risks introduced**.

---

## Next Steps

Proceed to **Phase 1: Design & Contracts**:
1. Define data model for repository types
2. Create function contracts for path calculation
3. Update quickstart guide for developers
4. Generate task breakdown
