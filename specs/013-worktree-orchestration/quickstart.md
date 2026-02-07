# Quickstart: Worktree Orchestration

**Feature**: 013-worktree-orchestration
**Purpose**: Guide for implementing coordinated worktree creation
**Date**: 2026-02-04

## Overview

This quickstart provides implementation guidance for the worktree orchestration feature. It covers the main orchestration flow, key integration points, and testing strategies.

## Prerequisites

Before implementing this feature, ensure these dependencies are available:

- ✅ **001-git-utility-lib**: Git operations (worktree add, branch create, branch check)
- ✅ **001-rollback-mechanism**: Operation logging and automatic rollback
- ✅ **001-repository-management**: Repository discovery and validation
- ✅ **001-config-management**: Reading workspace configuration
- ✅ **006-logger-utilities**: Progress spinners and colored output
- ✅ **007-prompt-utilities**: Interactive prompts (conflict resolution, repository selection)
- ✅ **001-github-issues**: Hook execution system

## Implementation Path

### Step 1: Core Orchestration Function

**File**: `repos/arashi/src/core/worktree.ts`

**Purpose**: Implement `createCoordinatedWorktrees()` - the main entry point for multi-repo worktree creation.

**Key Logic**:

```typescript
export async function createCoordinatedWorktrees(
  branchName: string,
  filter: RepositoryFilter,
  options: WorktreeOperationOptions = {}
): Promise<OperationSummary> {
  const startTime = Date.now();
  const operationLog = new OperationLog(); // from 001-rollback-mechanism
  
  try {
    // 1. Validate branch name
    if (!isValidBranchName(branchName)) {
      throw new InvalidBranchNameError(
        `Invalid branch name: ${branchName}`,
        branchName,
        "Branch name contains invalid characters"
      );
    }
    
    // 2. Load and filter repositories
    const allRepos = await loadRepositories(); // from 001-repository-management
    const selectedRepos = await applyRepositoryFilter(filter, allRepos);
    
    if (selectedRepos.length === 0) {
      throw new RepositoryValidationError("No repositories selected", "");
    }
    
    // 3. Pre-flight conflict check
    const conflictCheck = await checkBranchConflicts(branchName, selectedRepos);
    if (conflictCheck.hasConflicts) {
      const strategy = await resolveConflicts(conflictCheck.conflicts, options);
      if (strategy === 'ABORT') {
        throw new ConflictAbortedError("User aborted due to conflicts", conflictCheck.conflicts);
      }
      // Apply strategy to determine actual branch names to use
    }
    
    // 4. Process each repository sequentially
    const results: RepositoryResult[] = [];
    for (const repo of selectedRepos) {
      const repoResult = await processRepository(
        repo,
        branchName,
        operationLog,
        options
      );
      results.push(repoResult);
      
      if (repoResult.status === 'failed') {
        // Trigger rollback on first failure
        throw repoResult.error;
      }
    }
    
    // 5. Return success summary
    return {
      totalRepositories: selectedRepos.length,
      successCount: results.filter(r => r.status === 'success').length,
      failureCount: 0,
      skippedCount: 0,
      repositoryResults: results,
      rolledBack: false,
      totalDuration: Date.now() - startTime,
      errorSummary: null
    };
    
  } catch (error) {
    // Automatic rollback on any error
    await operationLog.rollback();
    
    return {
      totalRepositories: selectedRepos?.length || 0,
      successCount: 0,
      failureCount: 1,
      skippedCount: 0,
      repositoryResults: results || [],
      rolledBack: true,
      totalDuration: Date.now() - startTime,
      errorSummary: error.message
    };
  }
}
```

**Integration Points**:
- Import `OperationLog` from `001-rollback-mechanism`
- Import `loadRepositories()` from `001-repository-management`
- Import `spinner()` from `006-logger-utilities` for progress display
- Import `select()`, `checkbox()` from `007-prompt-utilities` for user interaction

---

### Step 2: Repository Processing

**Function**: `processRepository(repo, branchName, operationLog, options)`

**Purpose**: Process a single repository - execute hooks, create worktree, log operations.

**Key Logic**:

```typescript
async function processRepository(
  repo: Repository,
  branchName: string,
  operationLog: OperationLog,
  options: WorktreeOperationOptions
): Promise<RepositoryResult> {
  const startTime = Date.now();
  let spinner: Spinner | null = null;
  
  if (options.showProgress) {
    spinner = logger.spinner(`Creating worktree in ${repo.name}...`);
    spinner.start();
  }
  
  try {
    // 1. Execute pre-create hook (if configured)
    if (options.executeHooks && repo.hasPreCreateHook) {
      const hookContext: HookExecutionContext = {
        hookType: 'pre-create',
        branchName,
        repositoryPath: repo.path,
        repositoryName: repo.name,
        worktreePath: null,
        environment: buildHookEnvironment(repo, branchName, null),
        timeout: options.hookTimeout || 60000
      };
      
      await executeHook(hookContext); // throws on failure
    }
    
    // 2. Create branch from default branch
    await git.createBranch(repo.path, branchName, repo.defaultBranch);
    operationLog.add({
      type: 'branch_created',
      timestamp: Date.now(),
      data: { repositoryPath: repo.path, branchName }
    });
    
    // 3. Create worktree
    const worktreePath = await git.addWorktree(repo.path, branchName);
    operationLog.add({
      type: 'worktree_created',
      timestamp: Date.now(),
      data: { repositoryPath: repo.path, worktreePath, branchName }
    });
    
    // 4. Execute post-create hook (if configured)
    if (options.executeHooks && repo.hasPostCreateHook) {
      const hookContext: HookExecutionContext = {
        hookType: 'post-create',
        branchName,
        repositoryPath: repo.path,
        repositoryName: repo.name,
        worktreePath,
        environment: buildHookEnvironment(repo, branchName, worktreePath),
        timeout: options.hookTimeout || 60000
      };
      
      try {
        await executeHook(hookContext);
      } catch (error) {
        // Post-create hook failure is a warning, not a failure
        // (worktree is already created successfully)
        return {
          repository: repo,
          status: 'success',
          worktreePath,
          branchName,
          error: null,
          warnings: [`Post-create hook failed: ${error.message}`],
          duration: Date.now() - startTime
        };
      }
    }
    
    if (spinner) {
      spinner.succeed(`Created worktree in ${repo.name} at ${worktreePath}`);
    }
    
    return {
      repository: repo,
      status: 'success',
      worktreePath,
      branchName,
      error: null,
      warnings: [],
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    if (spinner) {
      spinner.fail(`Failed in ${repo.name}: ${error.message}`);
    }
    
    return {
      repository: repo,
      status: 'failed',
      worktreePath: null,
      branchName,
      error,
      warnings: [],
      duration: Date.now() - startTime
    };
  }
}
```

**Key Decisions**:
- Pre-create hook failure aborts worktree creation and triggers rollback
- Post-create hook failure is logged as warning but doesn't fail the operation (worktree is already functional)
- All operations logged immediately after success for accurate rollback

---

### Step 3: Conflict Detection

**Function**: `checkBranchConflicts(branchName, repositories)`

**Purpose**: Pre-flight check for branch name conflicts across all repositories.

**Key Logic**:

```typescript
export async function checkBranchConflicts(
  branchName: string,
  repositories: Repository[]
): Promise<ConflictCheckResult> {
  const conflicts: BranchConflict[] = [];
  const nonConflicting: Repository[] = [];
  
  // Check all repositories in parallel (read-only operation)
  const checks = repositories.map(async (repo) => {
    const existsLocally = await git.branchExists(repo.path, branchName);
    const existsRemotely = await git.remoteBranchExists(repo.path, branchName);
    
    if (existsLocally || existsRemotely) {
      return {
        hasConflict: true,
        conflict: {
          repository: repo,
          branchName,
          existsLocally,
          existsRemotely,
          resolution: null
        }
      };
    } else {
      return { hasConflict: false, repo };
    }
  });
  
  const results = await Promise.all(checks);
  
  for (const result of results) {
    if (result.hasConflict) {
      conflicts.push(result.conflict);
    } else {
      nonConflicting.push(result.repo);
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    nonConflictingRepositories: nonConflicting
  };
}
```

**Optimization**: Parallel conflict checking (read-only operation, safe to parallelize).

---

### Step 4: Conflict Resolution

**Function**: `resolveConflicts(conflicts, options)`

**Purpose**: Prompt user for conflict resolution strategy and apply it.

**Key Logic**:

```typescript
export async function resolveConflicts(
  conflicts: BranchConflict[],
  options: WorktreeOperationOptions = {}
): Promise<ConflictResolutionStrategy> {
  // If strategy pre-selected in options, use it
  if (options.conflictResolution) {
    return options.conflictResolution;
  }
  
  // Build conflict message
  const conflictList = conflicts.map(c => {
    const location = c.existsLocally && c.existsRemotely 
      ? "locally and remotely"
      : c.existsLocally ? "locally" : "remotely";
    return `  • ${c.repository.name} (${location})`;
  }).join('\n');
  
  const message = `Branch "${conflicts[0].branchName}" already exists in ${conflicts.length} repositories:\n${conflictList}\n\nHow would you like to proceed?`;
  
  // Prompt user for strategy
  const strategy = await prompts.select({
    message,
    choices: [
      {
        name: 'ABORT',
        value: 'ABORT',
        description: 'Cancel operation without creating any worktrees'
      },
      {
        name: 'REUSE_EXISTING',
        value: 'REUSE_EXISTING',
        description: 'Create worktrees using existing branches where they exist'
      },
      {
        name: 'CREATE_ALTERNATE',
        value: 'CREATE_ALTERNATE',
        description: 'Create alternate branch names (e.g., feature-123-1)'
      }
    ]
  });
  
  return strategy as ConflictResolutionStrategy;
}
```

**User Experience**: Single consolidated prompt showing all conflicts, not one prompt per repository.

---

### Step 5: Repository Filtering

**Function**: `applyRepositoryFilter(filter, allRepositories)`

**Purpose**: Apply filter mode to get selected repositories.

**Key Logic**:

```typescript
export async function applyRepositoryFilter(
  filter: RepositoryFilter,
  allRepositories: Repository[]
): Promise<Repository[]> {
  switch (filter.mode) {
    case 'all':
      return allRepositories;
      
    case 'explicit':
      // Validate explicit names
      const selected = filter.explicitList.map(name => {
        const repo = allRepositories.find(r => r.name === name);
        if (!repo) {
          throw new RepositoryValidationError(
            `Repository not found: ${name}`,
            name
          );
        }
        return repo;
      });
      return selected;
      
    case 'interactive':
      // Use checkbox prompt for selection
      const choices = allRepositories.map(repo => ({
        name: repo.name,
        value: repo,
        description: `${repo.path} (default branch: ${repo.defaultBranch})`
      }));
      
      // Pre-select from explicit list if provided
      const preSelected = filter.explicitList.length > 0
        ? filter.explicitList
        : [];
      
      const selectedRepos = await prompts.checkbox({
        message: 'Select repositories for worktree creation:',
        choices,
        initialValues: preSelected
      });
      
      if (selectedRepos.length === 0) {
        throw new RepositoryValidationError(
          'No repositories selected',
          ''
        );
      }
      
      return selectedRepos;
      
    default:
      throw new Error(`Unknown filter mode: ${filter.mode}`);
  }
}
```

**Flexibility**: Interactive mode can use explicit list as pre-selection.

---

## Testing Strategy

### Unit Tests (`tests/unit/core/worktree.test.ts`)

**What to Test**:

1. **Branch name validation**
   - Valid names: `feature-123`, `bugfix/login-error`, `user_feature`
   - Invalid names: `feature 123`, `feature~123`, `-feature`, `feature.lock`

2. **Repository filtering**
   - Mode 'all': Returns all repositories
   - Mode 'explicit': Returns only specified repositories, throws error for unknown names
   - Mode 'interactive': Mock checkbox prompt, verify selected repositories returned

3. **Conflict detection**
   - No conflicts: All repositories return false for branch existence
   - Partial conflicts: Some repositories have existing branch
   - Full conflicts: All repositories have existing branch
   - Mock git.branchExists() and git.remoteBranchExists()

4. **Conflict resolution**
   - Pre-selected strategy: Returns strategy from options without prompting
   - User prompt: Mock select() prompt, verify strategy returned
   - Abort handling: Verify ConflictAbortedError thrown when user aborts

5. **Error handling**
   - Invalid branch name: Verify InvalidBranchNameError thrown
   - Empty repository list: Verify RepositoryValidationError thrown
   - Unknown repository in explicit filter: Verify RepositoryValidationError thrown

**Mocking Strategy**:
- Mock git operations (branchExists, createBranch, addWorktree)
- Mock rollback mechanism (OperationLog.add, OperationLog.rollback)
- Mock prompts (select, checkbox)
- Mock logger (spinner)
- Mock hook execution

---

### Integration Tests (`tests/integration/worktree-integration.test.ts`)

**Test Fixtures**:

Create temporary test workspace with real git repositories:

```typescript
async function createTestWorkspace(): Promise<TestWorkspace> {
  const tmpDir = await fs.mkdtemp('/tmp/arashi-test-');
  
  // Create 3 test repositories
  const repos = ['repo-a', 'repo-b', 'repo-c'];
  for (const repoName of repos) {
    const repoPath = path.join(tmpDir, repoName);
    await git.init(repoPath);
    await git.commit(repoPath, 'Initial commit');
  }
  
  return { tmpDir, repos };
}

async function cleanupTestWorkspace(workspace: TestWorkspace) {
  await fs.rm(workspace.tmpDir, { recursive: true });
}
```

**What to Test**:

1. **Successful coordinated creation**
   - Create worktrees across 3 repositories
   - Verify worktrees exist at expected paths
   - Verify branches created from default branch
   - Verify operation summary shows 3 successes

2. **Rollback on failure**
   - Simulate failure in 2nd repository (e.g., insufficient permissions)
   - Verify worktree from 1st repository is rolled back
   - Verify operation summary shows rolledBack=true

3. **Conflict resolution with reuse strategy**
   - Manually create branch in 1 of 3 repositories
   - Run coordinated creation with REUSE_EXISTING strategy
   - Verify 1 worktree uses existing branch, 2 create new branches

4. **Hook execution**
   - Create test pre-create and post-create hook scripts
   - Verify hooks are executed with correct environment variables
   - Verify hook failure triggers appropriate behavior (pre-create aborts, post-create warns)

5. **Repository filtering**
   - Test explicit filter with --only flag
   - Test that only specified repositories receive worktrees

**Assertions**:
- File system: Verify worktree directories exist (or don't exist after rollback)
- Git state: Verify branches exist/don't exist using git commands
- Operation results: Verify RepositoryResult status, counts, error messages

---

## Common Pitfalls

### 1. Race Conditions in Parallel Operations

**Problem**: Parallelizing worktree creation can cause race conditions if hooks write to shared locations.

**Solution**: Process repositories sequentially. Parallel conflict checking is safe (read-only), but worktree creation must be sequential.

### 2. Incomplete Rollback

**Problem**: Operation log doesn't capture all reversible actions, leaving partial state on rollback.

**Solution**: Log immediately after every successful operation (branch creation, worktree creation, directory creation). Test rollback for each operation type.

### 3. Hook Timeout Handling

**Problem**: Hung hooks block operation indefinitely.

**Solution**: Enforce timeout using process kill. On timeout, treat as hook failure and trigger rollback.

### 4. Post-Create Hook Failures

**Problem**: Post-create hook fails after worktree is already created. Rolling back removes functional worktree.

**Solution**: Treat post-create hook failure as warning, not error. Worktree remains created. Log warning in RepositoryResult.

### 5. Path Handling on Windows

**Problem**: Path separators and spaces in paths break on Windows.

**Solution**: Use `path.join()` and `path.resolve()` from Bun's standard library. Always quote paths when passing to git commands.

---

## Performance Optimization

### Parallel Conflict Checking

Conflict detection is read-only and can be parallelized:

```typescript
const checks = repositories.map(repo => checkBranchConflict(repo, branchName));
const results = await Promise.all(checks);
```

**Expected Improvement**: 3-5x faster for large repository counts (10+).

### Lazy Repository Loading

Don't load repository metadata until after filter is applied:

```typescript
// Load all repositories
const allRepos = await loadRepositories();

// Apply filter first (may reduce set significantly)
const selectedRepos = await applyRepositoryFilter(filter, allRepos);

// Only now load detailed metadata (default branch, hooks) for selected repos
for (const repo of selectedRepos) {
  await enrichRepositoryMetadata(repo);
}
```

**Expected Improvement**: Reduces git operations for filtered repositories.

---

## Next Steps

After implementing this feature:

1. Run unit tests: `bun test tests/unit/core/worktree.test.ts`
2. Run integration tests: `bun test tests/integration/worktree-integration.test.ts`
3. Verify >80% code coverage: `bun test --coverage`
4. Create CLI command that calls `createCoordinatedWorktrees()` (in `src/cli/commands/create.ts`)
5. Test end-to-end with real multi-repo workspace

**Documentation**:
- Add user-facing docs for worktree creation command
- Document conflict resolution options
- Document hook integration points
