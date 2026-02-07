# Developer Quickstart: Nested Worktree Paths

**Feature**: 016-nested-worktree-paths  
**Date**: 2026-02-05  
**Estimated Time**: 2-4 hours

## What You're Fixing

**Current Bug**: Child repository worktrees are created as siblings to their source repos, breaking the nested structure of multi-repo setups.

**Desired Behavior**: Child worktrees should be nested inside parent worktree's `repos/` folder to maintain the directory hierarchy.

**Before** (broken):
```
workspace/
├── parent-repo/
│   └── repos/
│       └── child-repo/
├── parent-repo-feature/    ✓ Correct
└── child-repo-feature/     ✗ Wrong! Should be inside parent-repo-feature/repos/
```

**After** (fixed):
```
workspace/
├── parent-repo/
│   └── repos/
│       └── child-repo/
└── parent-repo-feature/
    └── repos/
        └── child-repo/     ✓ Correct! Nested inside parent worktree
```

---

## Understanding the Current Code

### Entry Point: `src/core/worktree.ts`

The bug is in **line 635** of `processRepository()`:

```typescript
// Line 635 - This is the problem!
const worktreePath = join(repo.path, "..", `${repo.name}-${branchName}`);
```

This hardcoded logic always creates worktrees as siblings, regardless of repository type.

### How Worktree Creation Works

**Flow**: `createCoordinatedWorktrees()` → `processRepository()` → `git.exec(["worktree", "add", ...])`

1. **`createCoordinatedWorktrees()`** (lines 407-504)
   - Orchestrates worktree creation across multiple repos
   - Calls `processRepository()` for each repository
   - Handles errors and triggers rollback if needed

2. **`processRepository()`** (lines 525-737)
   - Creates worktree for a single repository
   - **Line 635**: Calculates worktree path (this is where we fix it!)
   - **Line 637**: Executes `git worktree add <path> <branch>`
   - Logs operation for rollback

3. **`git.exec()`** (src/lib/git.ts)
   - Executes git commands using `Bun.spawn()`
   - Git creates the directory and all parents automatically

### Key Data Structures

**Repository** (src/core/repository.ts):
```typescript
{
  name: string;          // e.g., "frontend"
  path: string;          // e.g., "/workspace/parent/repos/frontend"
  defaultBranch: string;
  hasSetupScript: boolean;
  setupScriptPath?: string;
  remoteUrl?: string;
}
```

**ArashiConfig** (src/lib/config.ts):
```typescript
{
  version: string;
  repos_dir: string;     // e.g., "./repos"
  auto_setup: boolean;
  discovered_repos: Record<string, RepoConfig>;
}
```

---

## Implementation Strategy

### Step 1: Add Repository Type Detection

**Create new function** in `src/core/worktree.ts` (after imports):

```typescript
type RepositoryType = 'meta-repo' | 'child' | 'standalone';

interface RepositoryTypeInfo {
  type: RepositoryType;
  parentName?: string;
  reposDir?: string;
}

async function detectRepositoryType(
  repo: Repository,
  config: ArashiConfig | null
): Promise<RepositoryTypeInfo> {
  // Check if meta-repo (has .arashi/config.json)
  const configPath = join(repo.path, '.arashi', 'config.json');
  const isMeta = await Bun.file(configPath).exists();
  if (isMeta) {
    return { type: 'meta-repo' };
  }
  
  // Check if child repo (path contains repos_dir)
  if (config) {
    const reposDir = basename(config.repos_dir);
    const pathParts = repo.path.split(sep);
    const reposIndex = pathParts.lastIndexOf(reposDir);
    
    if (reposIndex > 0) {
      return {
        type: 'child',
        parentName: pathParts[reposIndex - 1],
        reposDir
      };
    }
  }
  
  // Default: standalone
  return { type: 'standalone' };
}
```

### Step 2: Add Path Calculation Logic

**Create helper function** for nested paths:

```typescript
function calculateChildWorktreePath(
  repo: Repository,
  branchName: string,
  parentName: string,
  reposDir: string
): string {
  const parentWorktree = `${parentName}-${branchName}`;
  
  // Navigate: ../../../<parent-worktree>/repos/<child-name>
  return join(
    repo.path,
    "..", "..", "..",
    parentWorktree,
    reposDir,
    repo.name
  );
}
```

**Create main path calculation function**:

```typescript
async function calculateWorktreePath(
  repo: Repository,
  branchName: string,
  config: ArashiConfig
): Promise<string> {
  const typeInfo = await detectRepositoryType(repo, config);
  
  switch (typeInfo.type) {
    case 'child':
      // Nested path for child repos
      return calculateChildWorktreePath(
        repo,
        branchName,
        typeInfo.parentName!,
        typeInfo.reposDir!
      );
    
    case 'meta-repo':
    case 'standalone':
    default:
      // Sibling path (current behavior)
      return join(repo.path, "..", `${repo.name}-${branchName}`);
  }
}
```

### Step 3: Update `processRepository()`

**Modify function signature** (line 525):

```typescript
// OLD:
async function processRepository(
  repo: Repository,
  branchName: string,
  operationLog: OperationLog,
  options: Required<WorktreeOperationOptions>,
  conflicts: BranchConflict[] = [],
  strategy: ConflictResolutionStrategy | null = null
): Promise<RepositoryResult>

// NEW (add config parameter):
async function processRepository(
  repo: Repository,
  branchName: string,
  operationLog: OperationLog,
  options: Required<WorktreeOperationOptions>,
  config: ArashiConfig,  // ← ADD THIS
  conflicts: BranchConflict[] = [],
  strategy: ConflictResolutionStrategy | null = null
): Promise<RepositoryResult>
```

**Replace path calculation** (line 635):

```typescript
// OLD:
const worktreePath = join(repo.path, "..", `${repo.name}-${branchName}`);

// NEW:
const worktreePath = await calculateWorktreePath(repo, branchName, config);
```

### Step 4: Update Caller

**Modify `createCoordinatedWorktrees()`** (around line 420):

```typescript
export async function createCoordinatedWorktrees(
  branchName: string,
  repositories: Repository[],
  options: WorktreeOperationOptions = {}
): Promise<OperationSummary> {
  // ... existing code ...
  
  // ADD: Load Arashi config (after line 421)
  const { loadConfig } = await import('../lib/config.js');
  const config = await loadConfig('.');
  
  // ... existing code ...
  
  // UPDATE: Pass config to processRepository (around line 461)
  const repoResult = await processRepository(
    repo,
    branchName,
    operationLog,
    completeOptions,
    config,  // ← ADD THIS
    conflicts,
    strategy
  );
  
  // ... rest of function ...
}
```

**Add import at top of file**:

```typescript
import { basename, sep } from 'path';  // Add basename and sep if not already imported
```

---

## Testing Your Changes

### Manual Testing Setup

1. **Create test directory structure**:
   ```bash
   mkdir -p /tmp/arashi-test/meta-repo/repos/child-repo
   cd /tmp/arashi-test/meta-repo
   git init
   cd repos/child-repo
   git init
   cd ../..
   arashi init
   ```

2. **Test the fix**:
   ```bash
   arashi create test-branch
   ```

3. **Verify nested structure**:
   ```bash
   ls -la ../
   # Should see:
   # - meta-repo/
   # - meta-repo-test-branch/
   #   └── repos/
   #       └── child-repo/  ← Should be here, not at top level!
   ```

### Automated Tests

**Create integration test** at `tests/integration/nested-worktree-paths.test.ts`:

```typescript
import { test, expect, beforeEach, afterEach } from 'bun:test';
import { createCoordinatedWorktrees } from '../../src/core/worktree';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { pathExists } from '../../src/lib/filesystem';

test("child repo worktree is nested inside parent worktree", async () => {
  // Setup: Create meta-repo with child repo
  const testDir = "/tmp/arashi-test-nested";
  const metaRepoPath = join(testDir, "meta-repo");
  const childRepoPath = join(metaRepoPath, "repos", "child-repo");
  
  await mkdir(childRepoPath, { recursive: true });
  
  // Initialize git repos
  await Bun.spawn(["git", "init"], { cwd: metaRepoPath }).exited;
  await Bun.spawn(["git", "init"], { cwd: childRepoPath }).exited;
  
  // Initialize arashi config
  await Bun.spawn(["arashi", "init"], { cwd: metaRepoPath }).exited;
  
  // Create worktrees
  const repositories = [/* load discovered repos */];
  await createCoordinatedWorktrees("test-branch", repositories);
  
  // Verify: Child worktree is nested
  const expectedChildWorktree = join(
    testDir,
    "meta-repo-test-branch",
    "repos",
    "child-repo"
  );
  
  expect(await pathExists(expectedChildWorktree)).toBe(true);
  
  // Cleanup
  await rm(testDir, { recursive: true, force: true });
});
```

**Run tests**:
```bash
cd repos/arashi
bun test
```

---

## Debugging Tips

### Print Path Calculation

Add debug logging in `calculateWorktreePath()`:

```typescript
async function calculateWorktreePath(
  repo: Repository,
  branchName: string,
  config: ArashiConfig
): Promise<string> {
  const typeInfo = await detectRepositoryType(repo, config);
  console.log(`[DEBUG] Repository: ${repo.name}`);
  console.log(`[DEBUG] Type: ${typeInfo.type}`);
  console.log(`[DEBUG] Path: ${repo.path}`);
  
  const path = /* ... calculation ... */;
  console.log(`[DEBUG] Calculated worktree path: ${path}`);
  return path;
}
```

### Check Repository Discovery

Verify repos are being detected correctly:

```bash
cd /path/to/meta-repo
cat .arashi/config.json
# Should show discovered_repos with correct paths
```

### Git Command Inspection

See what git commands are being executed:

```typescript
// In git.exec() (src/lib/git.ts)
console.log(`[GIT] Running: git ${args.join(' ')}`);
console.log(`[GIT] Working directory: ${cwd}`);
```

---

## Common Issues

### Issue 1: Config Not Found

**Symptom**: Error loading config in `createCoordinatedWorktrees()`

**Fix**: Ensure function is called from within a meta-repo (has `.arashi/config.json`)

### Issue 2: Wrong Parent Name

**Symptom**: Child worktree created in wrong parent worktree

**Fix**: Verify path parsing logic correctly extracts parent name (segment before "repos")

### Issue 3: Directory Already Exists

**Symptom**: Git fails with "directory already exists"

**Fix**: Clean up previous test runs with `arashi remove <branch>`

---

## Rollback Safety

Your changes are safe because:
1. **Rollback mechanism unchanged**: Operation log still tracks worktree paths
2. **Error handling preserved**: Failures still trigger full rollback
3. **Path is just a string**: Git validates and creates it; if invalid, git fails safely

---

## Review Checklist

Before submitting:
- [ ] All three repository types tested (meta, child, standalone)
- [ ] Integration tests pass
- [ ] Linting passes (`bun run lint`)
- [ ] No hardcoded "repos" (uses `config.repos_dir`)
- [ ] Cross-platform path handling (uses `path.sep`, `path.join()`)
- [ ] Debug logs removed
- [ ] Comments explain non-obvious logic

---

## Reference Files

**Must read**:
- `src/core/worktree.ts` - Main worktree logic
- `src/lib/config.ts` - Configuration management
- `src/core/repository.ts` - Repository discovery

**Supporting files**:
- `src/lib/filesystem.ts` - File utilities
- `src/lib/git.ts` - Git command execution
- `tests/integration/worktree-integration.test.ts` - Existing test patterns

---

## Getting Help

**Spec documents** (this feature):
- [spec.md](spec.md) - Requirements and user stories
- [plan.md](plan.md) - Technical context and constitution check
- [research.md](research.md) - Detailed research findings
- [data-model.md](data-model.md) - Data structures and algorithms
- [contracts/worktree-path-calculation.md](contracts/worktree-path-calculation.md) - Function contracts

**Ask for help if**:
- Path calculation isn't working as expected
- Tests are failing unexpectedly
- Unsure about cross-platform compatibility
- Need clarification on repository type detection

Good luck! This is a focused fix with clear requirements and good test coverage opportunities. 🚀
