# Quickstart Guide: Repository Management

**Last Updated**: 2026-02-04  
**Audience**: Developers implementing the repository management feature

This guide provides a quick-start implementation path for repository management functionality.

---

## Implementation Overview

Repository management provides foundational capabilities for discovering, analyzing, and managing git repositories in a workspace. The feature consists of 6 main user stories organized into 3 priority tiers.

**Architecture**: Library module (`src/core/repository.ts`) that uses git utilities, filesystem utilities, and logger utilities to provide repository discovery and information services.

**Key Files**:
- `src/core/repository.ts` - Main implementation
- `src/lib/git.ts` - Git command wrappers (dependency)
- `src/lib/filesystem.ts` - Filesystem operations (dependency)
- `tests/unit/core/repository.test.ts` - Unit tests
- `tests/integration/repository-integration.test.ts` - Integration tests

---

## MVP Scope (Start Here)

**Recommended MVP**: User Story 1 + User Story 2 (P1 stories)
- **US1**: Discover repositories in workspace directory
- **US2**: Detect default branch for each repository

**Why**: These two stories provide the core functionality needed by worktree orchestration (the main consumer of this feature). They can be implemented and tested independently, providing immediate value.

**Implementation Time**: ~1-2 days for MVP

**What to Skip Initially**:
- Setup script detection (US3) - Nice to have, not critical
- Repository cloning (US4) - Complex, can add later
- Workspace validation (US5) - Requires cloning or manual setup
- Metadata gathering (US6) - Advanced feature for future iterations

---

## Implementation Sequence

### Phase 0: Setup & Dependencies (30 minutes)

1. **Verify Dependencies**:
   ```bash
   # Check that these files exist (from other features):
   ls src/lib/git.ts           # Git utility lib (001-git-utility-lib)
   ls src/lib/filesystem.ts    # Filesystem utilities (005-filesystem-utilities)
   ls src/lib/logger.ts        # Logger utilities (006-logger-utilities)
   ls src/lib/config.ts        # Config management (001-config-management)
   ```

2. **Create Core File**:
   ```bash
   touch src/core/repository.ts
   ```

3. **Create Test Files**:
   ```bash
   mkdir -p tests/unit/core
   mkdir -p tests/integration
   mkdir -p tests/fixtures/test-repos
   touch tests/unit/core/repository.test.ts
   touch tests/integration/repository-integration.test.ts
   ```

4. **Copy Contracts**:
   ```bash
   # Copy type definitions from spec
   cp specs/001-repository-management/contracts/repository-api.ts src/core/repository-types.ts
   # Remove function declarations, keep only types/interfaces
   ```

---

### Phase 1: Core Discovery (US1) - 4-6 hours

**Goal**: Implement `discoverRepositories()` function that scans a workspace directory.

#### 1.1 Create Basic Discovery Function (1 hour)

```typescript
// src/core/repository.ts

import { resolve, join } from "path";
import { exists, isDirectory, readdir } from "@/lib/filesystem";
import type { Repository, RepositoryDiscoveryResult, DiscoveryOptions } from "./repository-types";

export async function discoverRepositories(
  workspacePath: string,
  options: DiscoveryOptions = {}
): Promise<RepositoryDiscoveryResult> {
  const startTime = Date.now();
  const repositories: Repository[] = [];
  const errors: DiscoveryError[] = [];
  let scannedDirectories = 0;
  
  const maxDepth = options.maxDepth ?? 3;
  const followSymlinks = options.followSymlinks ?? false;
  const excludePatterns = options.excludePatterns ?? ["node_modules", ".git"];
  
  // Recursive scan implementation
  await scanDirectory(workspacePath, 0);
  
  return {
    repositories,
    workspacePath,
    scanDepth: maxDepth,
    scannedDirectories,
    errors,
    duration: Date.now() - startTime
  };
  
  async function scanDirectory(dirPath: string, depth: number) {
    // Implementation in next step
  }
}
```

#### 1.2 Implement Recursive Scanning (2 hours)

```typescript
async function scanDirectory(dirPath: string, depth: number) {
  if (depth > maxDepth) return;
  
  scannedDirectories++;
  
  try {
    // Check if this directory is a git repository
    const gitDir = join(dirPath, ".git");
    if (await exists(gitDir)) {
      // Found a repository - don't scan subdirectories
      const repo = await createRepositoryInfo(dirPath);
      repositories.push(repo);
      return;
    }
    
    // Not a repo - scan subdirectories
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip excluded patterns
      if (excludePatterns.some(pattern => entry.name.includes(pattern))) {
        continue;
      }
      
      // Handle directories
      if (entry.isDirectory()) {
        const subPath = join(dirPath, entry.name);
        await scanDirectory(subPath, depth + 1);
      }
      
      // Handle symlinks if configured
      if (entry.isSymbolicLink() && followSymlinks) {
        const subPath = resolve(dirPath, entry.name);
        // TODO: Add cycle detection
        await scanDirectory(subPath, depth + 1);
      }
    }
  } catch (error) {
    // Collect non-fatal errors
    errors.push({
      path: dirPath,
      message: error.message,
      code: classifyError(error),
      cause: error
    });
  }
}
```

#### 1.3 Create Repository Info Helper (1 hour)

```typescript
async function createRepositoryInfo(repoPath: string): Promise<Repository> {
  const name = basename(repoPath);
  
  return {
    name,
    path: repoPath,
    defaultBranch: "main", // Placeholder - implemented in Phase 2
    hasSetupScript: false, // Placeholder - implemented later
    setupScriptPath: undefined,
    remoteUrl: undefined // Placeholder - can be enhanced later
  };
}
```

#### 1.4 Write Tests (1-2 hours)

```typescript
// tests/unit/core/repository.test.ts

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { discoverRepositories } from "@/core/repository";
import { mkdir, rmdir } from "@/lib/filesystem";
import { execSync } from "child_process";

describe("Repository Discovery", () => {
  const testWorkspace = "/tmp/test-workspace";
  
  beforeEach(async () => {
    await mkdir(testWorkspace, { recursive: true });
  });
  
  afterEach(async () => {
    await rmdir(testWorkspace, { recursive: true });
  });
  
  test("discovers git repositories", async () => {
    // Create test repositories
    await mkdir(`${testWorkspace}/repo1`);
    execSync(`git init`, { cwd: `${testWorkspace}/repo1` });
    
    await mkdir(`${testWorkspace}/repo2`);
    execSync(`git init`, { cwd: `${testWorkspace}/repo2` });
    
    // Create non-repository directory
    await mkdir(`${testWorkspace}/not-a-repo`);
    
    // Run discovery
    const result = await discoverRepositories(testWorkspace);
    
    // Verify results
    expect(result.repositories).toHaveLength(2);
    expect(result.repositories.map(r => r.name).sort()).toEqual(["repo1", "repo2"]);
    expect(result.errors).toHaveLength(0);
  });
  
  test("respects max depth", async () => {
    // Create nested repositories
    await mkdir(`${testWorkspace}/level1/level2/level3/level4`, { recursive: true });
    execSync(`git init`, { cwd: `${testWorkspace}/level1/level2/level3/level4` });
    
    // Discovery with depth 2 should not find repo
    const result1 = await discoverRepositories(testWorkspace, { maxDepth: 2 });
    expect(result1.repositories).toHaveLength(0);
    
    // Discovery with depth 4 should find repo
    const result2 = await discoverRepositories(testWorkspace, { maxDepth: 4 });
    expect(result2.repositories).toHaveLength(1);
  });
  
  test("stops at repository boundaries", async () => {
    // Create repo with subdirectories (should not scan inside)
    await mkdir(`${testWorkspace}/parent-repo/subdir`, { recursive: true });
    execSync(`git init`, { cwd: `${testWorkspace}/parent-repo` });
    
    const result = await discoverRepositories(testWorkspace);
    
    // Should find only parent repo, not scan subdirectories
    expect(result.repositories).toHaveLength(1);
    expect(result.scannedDirectories).toBeLessThan(5); // Should stop early
  });
});
```

---

### Phase 2: Default Branch Detection (US2) - 2-3 hours

**Goal**: Implement `detectDefaultBranch()` to identify the default branch for repositories.

#### 2.1 Implement Default Branch Detection (1.5 hours)

```typescript
// src/core/repository.ts

import { spawn } from "@/lib/git";

export async function detectDefaultBranch(
  repositoryPath: string
): Promise<string> {
  try {
    // Primary: Check symbolic ref for remote HEAD
    const result = await spawn(
      "git",
      ["symbolic-ref", "refs/remotes/origin/HEAD"],
      { cwd: repositoryPath }
    );
    
    if (result.success) {
      // Output format: "refs/remotes/origin/main"
      const match = result.stdout.match(/refs\/remotes\/origin\/(.+)/);
      if (match) {
        return match[1].trim();
      }
    }
  } catch (error) {
    // Fall through to fallback methods
  }
  
  // Fallback 1: Check common branch names
  const commonBranches = ["main", "master", "develop", "trunk"];
  for (const branch of commonBranches) {
    try {
      const result = await spawn(
        "git",
        ["rev-parse", "--verify", `refs/heads/${branch}`],
        { cwd: repositoryPath }
      );
      
      if (result.success) {
        return branch;
      }
    } catch {
      // Try next branch
    }
  }
  
  // Fallback 2: Get current branch
  try {
    const result = await spawn(
      "git",
      ["rev-parse", "--abbrev-ref", "HEAD"],
      { cwd: repositoryPath }
    );
    
    if (result.success && result.stdout.trim() !== "HEAD") {
      return result.stdout.trim();
    }
  } catch {
    // Fall through
  }
  
  throw new RepositoryInvalidError(
    repositoryPath,
    new Error("Could not determine default branch")
  );
}
```

#### 2.2 Integrate with Discovery (30 minutes)

```typescript
async function createRepositoryInfo(repoPath: string): Promise<Repository> {
  const name = basename(repoPath);
  
  // Detect default branch
  let defaultBranch = "main"; // fallback
  try {
    defaultBranch = await detectDefaultBranch(repoPath);
  } catch (error) {
    // Use fallback, log warning
    console.warn(`Could not detect default branch for ${name}: ${error.message}`);
  }
  
  return {
    name,
    path: repoPath,
    defaultBranch,
    hasSetupScript: false,
    setupScriptPath: undefined,
    remoteUrl: undefined
  };
}
```

#### 2.3 Write Tests (1 hour)

```typescript
// tests/unit/core/repository.test.ts

describe("Default Branch Detection", () => {
  test("detects 'main' as default branch", async () => {
    const repoPath = `${testWorkspace}/main-repo`;
    await mkdir(repoPath);
    execSync(`git init -b main`, { cwd: repoPath });
    execSync(`git commit --allow-empty -m "Initial commit"`, { cwd: repoPath });
    
    const branch = await detectDefaultBranch(repoPath);
    expect(branch).toBe("main");
  });
  
  test("detects 'master' as default branch", async () => {
    const repoPath = `${testWorkspace}/master-repo`;
    await mkdir(repoPath);
    execSync(`git init -b master`, { cwd: repoPath });
    execSync(`git commit --allow-empty -m "Initial commit"`, { cwd: repoPath });
    
    const branch = await detectDefaultBranch(repoPath);
    expect(branch).toBe("master");
  });
  
  test("handles repository without remote", async () => {
    const repoPath = `${testWorkspace}/no-remote-repo`;
    await mkdir(repoPath);
    execSync(`git init -b develop`, { cwd: repoPath });
    execSync(`git commit --allow-empty -m "Initial commit"`, { cwd: repoPath });
    
    const branch = await detectDefaultBranch(repoPath);
    expect(branch).toBe("develop");
  });
});
```

---

### Phase 3: Error Handling & Polish (US1 + US2) - 2 hours

#### 3.1 Implement Error Classes (30 minutes)

```typescript
// src/core/repository.ts

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly repository: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export class RepositoryNotFoundError extends RepositoryError {
  constructor(repository: string, cause?: Error) {
    super(`Repository not found: ${repository}`, repository, cause);
    this.name = "RepositoryNotFoundError";
  }
}

export class RepositoryInvalidError extends RepositoryError {
  constructor(repository: string, cause?: Error) {
    super(`Invalid repository: ${repository}`, repository, cause);
    this.name = "RepositoryInvalidError";
  }
}
```

#### 3.2 Add Progress Reporting (1 hour)

```typescript
import { spinner } from "@/lib/logger";

export async function discoverRepositories(
  workspacePath: string,
  options: DiscoveryOptions = {}
): Promise<RepositoryDiscoveryResult> {
  const s = spinner("Discovering repositories...");
  s.start();
  
  try {
    // ... discovery logic ...
    
    s.succeed(`Found ${repositories.length} repositories`);
    return result;
  } catch (error) {
    s.fail("Discovery failed");
    throw error;
  }
}
```

#### 3.3 Integration Tests (30 minutes)

```typescript
// tests/integration/repository-integration.test.ts

describe("Repository Discovery Integration", () => {
  test("discovers real workspace repositories", async () => {
    // Use actual test fixtures
    const result = await discoverRepositories("tests/fixtures/test-repos");
    
    expect(result.repositories.length).toBeGreaterThan(0);
    
    for (const repo of result.repositories) {
      expect(repo.name).toBeDefined();
      expect(repo.path).toBeDefined();
      expect(repo.defaultBranch).toBeDefined();
      expect(["main", "master", "develop"]).toContain(repo.defaultBranch);
    }
  });
});
```

---

## Beyond MVP

After completing MVP (US1 + US2), implement additional features in this order:

### Priority 2: Setup Script Detection (US3) - 1-2 hours

- Add `detectSetupScript()` function
- Check for setup.sh files in repository root
- Support configurable patterns
- Update `createRepositoryInfo()` to include setup script info

### Priority 2: Workspace Validation (US5) - 2-3 hours

- Implement `validateWorkspace()` function
- Compare discovered repos against configuration
- Report missing/extra repositories
- Add validation tests

### Priority 2: Repository Cloning (US4) - 4-6 hours

- Implement `cloneRepository()` function
- Parse git clone progress output
- Add progress callbacks
- Handle authentication and errors
- Add extensive error handling tests

### Priority 3: Metadata Gathering (US6) - 3-4 hours

- Implement `getRepositoryMetadata()` function
- Query git for branches, status, remotes
- Implement two-tier metadata (basic/detailed)
- Add caching with TTL
- Add comprehensive metadata tests

---

## Testing Strategy

### Unit Tests (Target: 80%+ coverage)

Focus on:
- Discovery logic with various directory structures
- Default branch detection for different git configs
- Error handling (permissions, invalid repos, etc.)
- Edge cases (symlinks, nested repos, etc.)

### Integration Tests

Use real test repositories in `tests/fixtures/test-repos/`:
- `main-repo/` - Repository with 'main' as default
- `master-repo/` - Repository with 'master' as default
- `develop-repo/` - Repository with 'develop' as default
- `with-setup/` - Repository with setup.sh script
- `no-remote/` - Repository without remote configuration
- `bare-repo/` - Bare git repository

### Test Coverage Commands

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run only repository tests
bun test tests/unit/core/repository.test.ts
bun test tests/integration/repository-integration.test.ts
```

---

## Common Pitfalls

1. **Path Handling**: Always use `resolve()` for absolute paths, normalize paths for comparison
2. **Git Command Output**: Trim whitespace from git command output, check for empty responses
3. **Permissions**: Wrap filesystem operations in try-catch, continue on permission errors
4. **Symlinks**: Track visited paths to prevent infinite loops
5. **Repository State**: Don't assume repositories are in clean state, handle detached HEAD
6. **Performance**: Stop scanning when `.git` is found, don't descend into repository subdirectories

---

## Quick Reference

### Key Functions

```typescript
// Discover repositories in workspace
const result = await discoverRepositories("/path/to/workspace", {
  maxDepth: 3,
  excludePatterns: ["node_modules"]
});

// Detect default branch
const branch = await detectDefaultBranch("/path/to/repo");

// Get repository info
const repo = await getRepositoryInfo("/path/to/repo");
```

### Error Handling

```typescript
try {
  const result = await discoverRepositories(workspacePath);
} catch (error) {
  if (error instanceof RepositoryNotFoundError) {
    // Handle missing repository
  } else if (error instanceof RepositoryInvalidError) {
    // Handle invalid repository
  }
}
```

### Test Patterns

```typescript
// Create test repository
const testRepo = `${testWorkspace}/test-repo`;
await mkdir(testRepo);
execSync(`git init -b main`, { cwd: testRepo });
execSync(`git commit --allow-empty -m "Initial"`, { cwd: testRepo });

// Run function
const result = await someFunction(testRepo);

// Verify
expect(result).toBeDefined();
```

---

## Next Steps

After completing repository management:
1. **Integrate with Worktree Orchestration** - Use discovery for multi-repo operations
2. **Add CLI Commands** - Expose functionality via CLI (e.g., `arashi repos list`)
3. **Enhance Metadata** - Add more repository information as needed
4. **Performance Optimization** - Add caching, parallel operations for large workspaces

---

## Getting Help

- **Specification**: See [spec.md](./spec.md) for full requirements
- **Data Model**: See [data-model.md](./data-model.md) for entity definitions
- **Research**: See [research.md](./research.md) for technical decisions
- **Contracts**: See [contracts/repository-api.ts](./contracts/repository-api.ts) for API signatures
