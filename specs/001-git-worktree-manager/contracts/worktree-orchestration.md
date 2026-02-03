# Worktree Orchestration Design

**Feature**: 001-git-worktree-manager  
**Document**: [D5] #11  
**Created**: 2026-02-03  
**Status**: Draft  
**Dependencies**: D4 (Git Wrapper API)

## Purpose

This document defines the high-level orchestration logic for coordinating worktree operations across multiple repositories. It specifies the creation flow, rollback mechanism, conflict resolution, and error handling strategies.

## Scope

**In Scope**:
- Worktree creation flow (validate → fetch → create → setup)
- Operation logging for rollback support
- Rollback mechanism and execution
- Branch conflict resolution dialog
- Repository selection logic (all, filtered, interactive)
- Setup script execution (sequential and parallel)
- Error aggregation and reporting

**Out of Scope**:
- Low-level git operations (see D4 Git Wrapper API)
- CLI argument parsing (see D3 CLI Commands)
- Hook system execution (see D6 Hook System)

---

## Worktree Creation Flow

### High-Level Overview

The `arashi create` command orchestrates worktree creation across multiple repositories with automatic rollback on failure.

```
┌─────────────────────────────────────────────────────────────┐
│                   Worktree Creation Flow                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │   Validate     │ (Pre-flight checks)
                   └────────┬───────┘
                            │ Pass
                            ▼
                   ┌────────────────┐
                   │ Select Repos   │ (All / --only / -i)
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Fetch Latest   │ (Parallel for all repos)
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  Create Main   │ (First repo worktree)
                   │   Worktree     │
                   └────────┬───────┘
                            │ Success
                            ▼
                   ┌────────────────┐
                   │ Create Sub-Repo│ (Sequential per repo)
                   │  Worktrees     │ (Log each operation)
                   └────────┬───────┘
                            │ All Success
                            ▼
                   ┌────────────────┐
                   │  Run Setup     │ (Sequential or parallel)
                   │   Scripts      │
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │    Success     │
                   └────────────────┘

                   Any Failure ──────────────┐
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │    Rollback    │
                                    │  (Reverse log) │
                                    └────────┬───────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │  Exit Error    │
                                    └────────────────┘
```

---

## Step-by-Step Flow

### Phase 1: Validation

Validate preconditions before starting any operations.

```typescript
async function validateCreateCommand(
  branch: string,
  options: CreateOptions
): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. Check Arashi initialized
  if (!await configExists()) {
    errors.push("Arashi not initialized. Run `arashi init` first.");
  }

  // 2. Load config
  const config = await loadConfig();

  // 3. Check repositories exist
  if (Object.keys(config.discovered_repos).length === 0) {
    errors.push("No repositories discovered. Run `arashi add <git-url>`.");
  }

  // 4. Validate branch name
  if (!isValidBranchName(branch)) {
    errors.push(`Invalid branch name: "${branch}"`);
  }

  // 5. Validate --only repos exist
  if (options.only) {
    const repoNames = options.only.split(',');
    const invalidRepos = repoNames.filter(
      name => !config.discovered_repos[name]
    );
    if (invalidRepos.length > 0) {
      errors.push(`Unknown repositories: ${invalidRepos.join(', ')}`);
    }
  }

  // 6. Check worktree path doesn't exist
  const worktreePath = options.path || `../${branch}`;
  if (await pathExists(worktreePath)) {
    errors.push(`Worktree path already exists: ${worktreePath}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

**Validation Checks**:
1. Arashi initialized (`.arashi/config.json` exists)
2. At least one repository discovered
3. Valid branch name (alphanumeric, hyphens, underscores, slashes)
4. `--only` repos exist in config (if specified)
5. Target worktree path doesn't exist
6. Current directory is a git repository

**Failure Handling**: If validation fails, print all errors and exit with code 1.

---

### Phase 2: Repository Selection

Determine which repositories to create worktrees for.

```typescript
async function selectRepositories(
  config: ArashiConfig,
  options: CreateOptions
): Promise<string[]> {
  const allRepos = Object.keys(config.discovered_repos);

  // Strategy 1: --only flag (explicit filter)
  if (options.only) {
    return options.only.split(',').map(s => s.trim());
  }

  // Strategy 2: Interactive mode
  if (options.interactive) {
    return await promptRepoSelection(allRepos);
  }

  // Strategy 3: Default (all repos)
  return allRepos;
}
```

#### Interactive Repository Selection

```typescript
async function promptRepoSelection(
  repos: string[]
): Promise<string[]> {
  const selected = await prompt({
    type: 'multiselect',
    message: 'Select repositories to include:',
    choices: repos.map(name => ({
      title: name,
      value: name,
      selected: true, // All selected by default
    })),
  });

  if (selected.length === 0) {
    throw new ArashiError(
      "No repositories selected",
      ExitCode.USER_ABORT
    );
  }

  return selected;
}
```

**Selection Modes**:
1. **Default**: All repos in `discovered_repos`
2. **Filtered** (`--only`): Comma-separated list
3. **Interactive** (`-i`): Multi-select prompt

---

### Phase 3: Fetch Latest

Fetch latest changes from all remotes in parallel.

```typescript
async function fetchAllRepos(
  config: ArashiConfig,
  selectedRepos: string[]
): Promise<void> {
  console.log("Fetching latest changes...");

  const fetchPromises = selectedRepos.map(async (repoName) => {
    const repo = config.discovered_repos[repoName];
    const repoPath = path.join(config.repos_dir, repo.path);

    try {
      await fetchLatest(repoPath, { prune: true });
      console.log(`✓ ${repoName}: Fetched`);
    } catch (error) {
      throw new ArashiError(
        `Failed to fetch ${repoName}`,
        ExitCode.ERROR,
        error.gitOutput
      );
    }
  });

  await Promise.all(fetchPromises);
}
```

**Behavior**:
- Fetch all repos in parallel (independent operations)
- Use `git fetch --all --prune` (update all refs, remove stale)
- Fail fast: Any fetch failure aborts entire operation
- No rollback needed (read-only operation)

---

### Phase 4: Create Main Worktree

Create the first worktree (typically the "main" repository).

```typescript
async function createMainWorktree(
  branch: string,
  config: ArashiConfig,
  selectedRepos: string[],
  options: CreateOptions,
  operationLog: OperationLogEntry[]
): Promise<string> {
  const mainRepo = selectedRepos[0];
  const repo = config.discovered_repos[mainRepo];
  const repoPath = path.join(config.repos_dir, repo.path);
  const worktreeBase = options.path || `../${branch}`;
  const worktreePath = path.join(worktreeBase, config.repos_dir, repo.path);

  console.log(`\nCreating worktrees for branch '${branch}'...\n`);

  // 1. Determine branch for this repo
  const branchName = await determineBranch(
    branch,
    mainRepo,
    config.worktree_strategy,
    options.interactive
  );

  // 2. Check for branch conflicts
  const conflict = await checkBranchConflict(repoPath, branchName);
  if (conflict) {
    const resolution = await resolveBranchConflict(
      mainRepo,
      branchName,
      conflict
    );
    if (resolution.action === 'abort') {
      throw new ArashiError("User aborted", ExitCode.USER_ABORT);
    }
    if (resolution.action === 'create_new') {
      branchName = resolution.newBranch;
    }
  }

  // 3. Create worktree directory structure
  await fs.mkdir(path.dirname(worktreePath), { recursive: true });
  logOperation(operationLog, {
    type: 'directory_created',
    data: { path: path.dirname(worktreePath) },
    rollback: async () => {
      await fs.rm(worktreeBase, { recursive: true, force: true });
    },
  });

  // 4. Create branch if needed
  if (!await branchExists(repoPath, branchName)) {
    await createBranch(repoPath, branchName, {
      startPoint: repo.default_branch,
    });
    logOperation(operationLog, {
      type: 'branch_created',
      data: { repo: mainRepo, branch: branchName },
      rollback: async () => {
        await deleteBranch(repoPath, branchName, { force: true });
      },
    });
  }

  // 5. Create worktree
  await createWorktree(repoPath, worktreePath, branchName, {
    track: !options.no_track,
  });
  logOperation(operationLog, {
    type: 'worktree_created',
    data: { repo: mainRepo, path: worktreePath, branch: branchName },
    rollback: async () => {
      await removeWorktree(repoPath, worktreePath, { force: true });
    },
  });

  console.log(`✓ ${mainRepo}: Created worktree (${worktreePath})`);
  console.log(`  └─ Branch: ${branchName}${options.no_track ? '' : ` (tracking ${repo.remote}/${branchName})`}`);

  return worktreeBase;
}
```

**Key Points**:
- Main worktree determines base path for all subsequent worktrees
- Creates directory structure first
- Handles branch conflicts interactively
- Logs all operations for rollback
- Creates branch if doesn't exist

---

### Phase 5: Create Sub-Repository Worktrees

Create worktrees for remaining repositories sequentially.

```typescript
async function createSubRepoWorktrees(
  branch: string,
  worktreeBase: string,
  config: ArashiConfig,
  selectedRepos: string[],
  options: CreateOptions,
  operationLog: OperationLogEntry[]
): Promise<void> {
  const remainingRepos = selectedRepos.slice(1); // Skip first (already created)

  for (const repoName of remainingRepos) {
    const repo = config.discovered_repos[repoName];
    const repoPath = path.join(config.repos_dir, repo.path);
    const worktreePath = path.join(worktreeBase, config.repos_dir, repo.path);

    // 1. Determine branch
    const branchName = await determineBranch(
      branch,
      repoName,
      config.worktree_strategy,
      options.interactive
    );

    // 2. Check for conflicts
    const conflict = await checkBranchConflict(repoPath, branchName);
    if (conflict) {
      const resolution = await resolveBranchConflict(
        repoName,
        branchName,
        conflict
      );
      if (resolution.action === 'abort') {
        throw new ArashiError("User aborted", ExitCode.USER_ABORT);
      }
      if (resolution.action === 'create_new') {
        branchName = resolution.newBranch;
      }
    }

    // 3. Create branch if needed
    if (!await branchExists(repoPath, branchName)) {
      await createBranch(repoPath, branchName, {
        startPoint: repo.default_branch,
      });
      logOperation(operationLog, {
        type: 'branch_created',
        data: { repo: repoName, branch: branchName },
        rollback: async () => {
          await deleteBranch(repoPath, branchName, { force: true });
        },
      });
    }

    // 4. Create worktree
    await createWorktree(repoPath, worktreePath, branchName, {
      track: !options.no_track,
    });
    logOperation(operationLog, {
      type: 'worktree_created',
      data: { repo: repoName, path: worktreePath, branch: branchName },
      rollback: async () => {
        await removeWorktree(repoPath, worktreePath, { force: true });
      },
    });

    console.log(`✓ ${repoName}: Created worktree (${worktreePath})`);
    console.log(`  └─ Branch: ${branchName}`);
  }
}
```

**Sequential Processing**:
- Process repos one at a time (not parallel)
- Log each operation before proceeding
- Any failure triggers rollback of all previous operations

---

### Phase 6: Run Setup Scripts

Execute setup scripts for repositories (unless `--no-setup`).

```typescript
async function runSetupScripts(
  config: ArashiConfig,
  selectedRepos: string[],
  worktreeBase: string,
  options: CreateOptions,
  operationLog: OperationLogEntry[]
): Promise<void> {
  if (options.no_setup) {
    return;
  }

  const reposWithSetup = selectedRepos.filter(
    name => config.discovered_repos[name].has_setup_script
  );

  if (reposWithSetup.length === 0) {
    return;
  }

  console.log("\nRunning setup scripts...");

  if (options.parallel) {
    await runSetupParallel(config, reposWithSetup, worktreeBase, operationLog);
  } else {
    await runSetupSequential(config, reposWithSetup, worktreeBase, operationLog);
  }
}
```

#### Sequential Setup Execution

```typescript
async function runSetupSequential(
  config: ArashiConfig,
  repos: string[],
  worktreeBase: string,
  operationLog: OperationLogEntry[]
): Promise<void> {
  for (const repoName of repos) {
    const repo = config.discovered_repos[repoName];
    const worktreePath = path.join(worktreeBase, config.repos_dir, repo.path);
    const scriptPath = path.join(worktreePath, '.arashi-setup.sh');

    const startTime = Date.now();

    try {
      const proc = Bun.spawn([scriptPath], {
        cwd: worktreePath,
        env: process.env,
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const exitCode = await proc.exited;
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      if (exitCode === 0) {
        console.log(`✓ ${repoName}: Setup completed (${duration}s)`);
        logOperation(operationLog, {
          type: 'setup_executed',
          data: { repo: repoName, script: scriptPath },
          rollback: async () => {
            // Setup rollback: just log (can't undo arbitrary scripts)
            console.log(`  ⚠ ${repoName}: Setup was executed (cannot undo)`);
          },
        });
      } else {
        console.log(`✗ ${repoName}: Setup failed (exit code ${exitCode}, ${duration}s)`);
        // Setup failures are non-fatal (warn but continue)
      }
    } catch (error) {
      console.log(`✗ ${repoName}: Setup failed (${error.message})`);
    }
  }
}
```

#### Parallel Setup Execution

```typescript
async function runSetupParallel(
  config: ArashiConfig,
  repos: string[],
  worktreeBase: string,
  operationLog: OperationLogEntry[]
): Promise<void> {
  const setupPromises = repos.map(async (repoName) => {
    const repo = config.discovered_repos[repoName];
    const worktreePath = path.join(worktreeBase, config.repos_dir, repo.path);
    const scriptPath = path.join(worktreePath, '.arashi-setup.sh');

    const startTime = Date.now();

    try {
      const proc = Bun.spawn([scriptPath], {
        cwd: worktreePath,
        env: process.env,
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const exitCode = await proc.exited;
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      return {
        repo: repoName,
        success: exitCode === 0,
        exitCode,
        duration,
      };
    } catch (error) {
      return {
        repo: repoName,
        success: false,
        error: error.message,
        duration: ((Date.now() - startTime) / 1000).toFixed(1),
      };
    }
  });

  const results = await Promise.all(setupPromises);

  // Display results
  for (const result of results) {
    if (result.success) {
      console.log(`✓ ${result.repo}: Setup completed (${result.duration}s)`);
    } else {
      console.log(`✗ ${result.repo}: Setup failed (${result.duration}s)`);
    }
  }
}
```

**Setup Script Behavior**:
- Setup failures are **non-fatal** (warn but continue)
- Scripts run in worktree directory
- Timeout: 5 minutes (configurable in future)
- Parallel mode: All scripts run simultaneously

---

## Operation Logging

### OperationLog Structure

Track all operations for rollback support.

```typescript
/**
 * Operation log for rollback tracking
 */
type OperationLog = OperationLogEntry[];

interface OperationLogEntry {
  /** Type of operation */
  type: OperationType;

  /** Operation-specific data */
  data: OperationData;

  /** Function to rollback this operation */
  rollback: () => Promise<void>;
}
```

### Logging Operations

```typescript
function logOperation(
  log: OperationLog,
  entry: OperationLogEntry
): void {
  log.push(entry);
}
```

### Operation Types

```typescript
type OperationType =
  | 'directory_created'   // Created directory
  | 'worktree_created'    // Created git worktree
  | 'branch_created'      // Created git branch
  | 'setup_executed';     // Ran setup script
```

### Example Log Entries

```typescript
// Directory creation
{
  type: 'directory_created',
  data: { path: '/path/to/worktree' },
  rollback: async () => {
    await fs.rm('/path/to/worktree', { recursive: true, force: true });
  }
}

// Worktree creation
{
  type: 'worktree_created',
  data: { repo: 'backend', path: '/path/to/worktree', branch: 'feature' },
  rollback: async () => {
    await removeWorktree(repoPath, '/path/to/worktree', { force: true });
  }
}

// Branch creation
{
  type: 'branch_created',
  data: { repo: 'backend', branch: 'feature-auth' },
  rollback: async () => {
    await deleteBranch(repoPath, 'feature-auth', { force: true });
  }
}

// Setup execution
{
  type: 'setup_executed',
  data: { repo: 'backend', script: '/path/to/.arashi-setup.sh' },
  rollback: async () => {
    // Setup cannot be undone (log only)
    console.log('  ⚠ Setup was executed (cannot undo)');
  }
}
```

---

## Rollback Mechanism

### When Rollback Occurs

Rollback is triggered when:
1. Validation fails (no rollback needed - no operations yet)
2. Fetch fails (no rollback needed - read-only)
3. Worktree creation fails (rollback all previous operations)
4. User aborts (Ctrl+C or interactive cancel)

### Rollback Execution

```typescript
async function executeRollback(
  operationLog: OperationLog
): Promise<void> {
  if (operationLog.length === 0) {
    return;
  }

  console.error("\n⚠ Error occurred. Rolling back changes...\n");

  // Iterate in REVERSE order (undo most recent operations first)
  for (let i = operationLog.length - 1; i >= 0; i--) {
    const entry = operationLog[i];

    try {
      await entry.rollback();
      console.log(`✓ Rolled back: ${formatOperation(entry)}`);
    } catch (error) {
      console.error(`✗ Rollback failed: ${formatOperation(entry)}`);
      console.error(`  Error: ${error.message}`);
      // Continue with remaining rollbacks
    }
  }

  console.error("\n✓ Rollback complete\n");
}
```

### Rollback Guarantees

**Best-Effort Rollback**:
- Attempt to undo all operations
- Log success/failure for each rollback
- Continue even if individual rollback fails
- Leave system in cleanest possible state

**Rollback Order**:
1. Setup scripts (log only - cannot undo)
2. Worktrees (remove worktrees)
3. Branches (delete created branches)
4. Directories (remove created directories)

**Idempotency**:
- Rollback operations are safe to retry
- Use `force` flags to ignore errors (already removed, etc.)

---

## Branch Conflict Resolution

### Conflict Detection

```typescript
async function checkBranchConflict(
  repoPath: string,
  branch: string
): Promise<BranchConflict | null> {
  // Check if branch exists locally
  const localExists = await branchExists(repoPath, branch);
  if (!localExists) {
    return null; // No conflict
  }

  // Branch exists - check if checked out in another worktree
  const worktrees = await listWorktrees(repoPath);
  const checkedOutIn = worktrees.find(wt => wt.branch === branch);

  if (checkedOutIn) {
    return {
      type: 'checked_out',
      branch,
      existingWorktree: checkedOutIn.path,
    };
  }

  return {
    type: 'exists',
    branch,
  };
}
```

#### BranchConflict Type

```typescript
interface BranchConflict {
  /** Conflict type */
  type: 'checked_out' | 'exists';

  /** Branch name */
  branch: string;

  /** Path to existing worktree (if checked out) */
  existingWorktree?: string;
}
```

---

### Conflict Resolution Dialog

```typescript
async function resolveBranchConflict(
  repoName: string,
  branch: string,
  conflict: BranchConflict
): Promise<BranchResolution> {
  if (conflict.type === 'checked_out') {
    console.warn(`\n⚠ Branch '${branch}' is already checked out in another worktree:`);
    console.warn(`  Repository: ${repoName}`);
    console.warn(`  Worktree: ${conflict.existingWorktree}`);
    console.warn("");

    const choice = await prompt({
      type: 'select',
      message: 'How would you like to proceed?',
      choices: [
        { title: 'Create new branch with suffix (feature-branch-2)', value: 'create_new' },
        { title: 'Abort operation', value: 'abort' },
      ],
    });

    if (choice === 'create_new') {
      const newBranch = await generateUniqueBranch(repoPath, branch);
      return { action: 'create_new', newBranch };
    }

    return { action: 'abort' };
  }

  if (conflict.type === 'exists') {
    console.warn(`\n⚠ Branch '${branch}' already exists in ${repoName}`);
    console.warn("");

    const choice = await prompt({
      type: 'select',
      message: 'How would you like to proceed?',
      choices: [
        { title: 'Use existing branch', value: 'use_existing' },
        { title: 'Create new branch with suffix (feature-branch-2)', value: 'create_new' },
        { title: 'Abort operation', value: 'abort' },
      ],
    });

    if (choice === 'create_new') {
      const newBranch = await generateUniqueBranch(repoPath, branch);
      return { action: 'create_new', newBranch };
    }

    if (choice === 'use_existing') {
      return { action: 'use_existing' };
    }

    return { action: 'abort' };
  }
}
```

#### BranchResolution Type

```typescript
interface BranchResolution {
  /** Resolution action */
  action: 'use_existing' | 'create_new' | 'abort';

  /** New branch name (if action is 'create_new') */
  newBranch?: string;
}
```

---

### Generate Unique Branch Name

```typescript
async function generateUniqueBranch(
  repoPath: string,
  baseBranch: string
): Promise<string> {
  let counter = 2;
  let candidate = `${baseBranch}-${counter}`;

  while (await branchExists(repoPath, candidate)) {
    counter++;
    candidate = `${baseBranch}-${counter}`;
  }

  return candidate;
}
```

**Example**:
- Base: `feature-auth`
- Candidates: `feature-auth-2`, `feature-auth-3`, ...
- Returns first available name

---

## Branch Strategy Resolution

### determineBranch Function

```typescript
async function determineBranch(
  requestedBranch: string,
  repoName: string,
  strategy: WorktreeStrategy,
  interactive: boolean
): Promise<string> {
  // Interactive mode always prompts
  if (interactive) {
    return await promptBranchName(repoName, requestedBranch);
  }

  // Apply strategy from config
  switch (strategy) {
    case 'same_branch':
      return requestedBranch;

    case 'independent':
      // Stay on default branch (fetch latest)
      const repo = config.discovered_repos[repoName];
      return repo.default_branch;

    case 'prompt':
      return await promptBranchName(repoName, requestedBranch);

    default:
      throw new ArashiError(
        `Unknown worktree strategy: ${strategy}`,
        ExitCode.ERROR
      );
  }
}
```

### Interactive Branch Prompt

```typescript
async function promptBranchName(
  repoName: string,
  suggestedBranch: string
): Promise<string> {
  const branch = await prompt({
    type: 'text',
    message: `Branch name for '${repoName}':`,
    initial: suggestedBranch,
  });

  if (!branch || !isValidBranchName(branch)) {
    throw new ArashiError(
      "Invalid branch name",
      ExitCode.USER_ABORT
    );
  }

  return branch;
}
```

---

## Error Aggregation

### Collect and Display Errors

```typescript
interface OperationError {
  repo: string;
  operation: string;
  error: Error;
}

async function createWorktreesWithErrorHandling(
  branch: string,
  config: ArashiConfig,
  options: CreateOptions
): Promise<void> {
  const operationLog: OperationLog = [];
  const errors: OperationError[] = [];

  try {
    // Execute all phases
    await validateCreateCommand(branch, options);
    const selectedRepos = await selectRepositories(config, options);
    await fetchAllRepos(config, selectedRepos);
    const worktreeBase = await createMainWorktree(
      branch, config, selectedRepos, options, operationLog
    );
    await createSubRepoWorktrees(
      branch, worktreeBase, config, selectedRepos, options, operationLog
    );
    await runSetupScripts(
      config, selectedRepos, worktreeBase, options, operationLog
    );

    console.log(`\n✓ All worktrees created successfully\n`);

  } catch (error) {
    // Execute rollback
    await executeRollback(operationLog);

    // Display error details
    console.error(`\nError: ${error.message}`);
    if (error.gitOutput) {
      console.error(`\nGit output:\n${error.gitOutput}`);
    }

    process.exit(error.exitCode || ExitCode.ERROR);
  }
}
```

**Error Display Format**:
```
Error: Failed to create worktree for 'backend'

Git output:
fatal: 'feature-auth' is already checked out at '/path/to/existing/worktree'

⚠ Error occurred. Rolling back changes...

✓ Rolled back: Removed worktree (backend)
✓ Rolled back: Deleted branch (backend: feature-auth)
✓ Rolled back: Removed directory (/path/to/new/worktree)

✓ Rollback complete
```

---

## Design Decisions

### Decision: Sequential Worktree Creation

**Choice**: Create worktrees one at a time (not parallel)

**Rationale**:
- Enables ordered rollback (reverse operation log)
- User can see progress step-by-step
- Git operations on same repo cannot be parallelized safely

**Alternatives Considered**:
- Parallel creation: Rejected (complex rollback, race conditions)

### Decision: Parallel Fetch

**Choice**: Fetch all repos in parallel

**Rationale**:
- Independent operations (no shared state)
- Significantly faster (network I/O bound)
- Read-only operation (no rollback needed)

**Alternatives Considered**:
- Sequential fetch: Rejected (slower, no benefit)

### Decision: Non-Fatal Setup Failures

**Choice**: Setup script failures are warnings, not errors

**Rationale**:
- Setup is optional automation
- User should be able to fix and re-run manually
- Core worktree creation is valuable even without setup

**Alternatives Considered**:
- Fatal failures: Rejected (too strict, poor UX)

### Decision: Best-Effort Rollback

**Choice**: Attempt all rollback operations, continue on failure

**Rationale**:
- Leaves system in cleanest possible state
- Individual rollback failures shouldn't prevent cleanup
- User can manually fix remaining issues

**Alternatives Considered**:
- Stop on first rollback failure: Rejected (leaves partial state)

### Decision: Interactive Conflict Resolution

**Choice**: Prompt user for branch conflicts (checked out, exists)

**Rationale**:
- User intent is ambiguous (use existing? create new?)
- Prevents accidental data loss
- Provides clear options and consequences

**Alternatives Considered**:
- Auto-resolve: Rejected (dangerous, unpredictable)
- Always fail: Rejected (forces manual cleanup)

---

## References

- **GitHub Issue**: #11 (D5 Worktree Orchestration Design)
- **Related Documents**:
  - D2: Type System (OperationLogEntry, WorktreeStrategy)
  - D3: CLI Commands (arashi create behavior)
  - D4: Git Wrapper API (createWorktree, listWorktrees, etc.)
  - D6: Hook System (hook execution during create)
- **External Resources**:
  - [Transaction Rollback Patterns](https://en.wikipedia.org/wiki/Rollback_(data_management))
  - [Command Pattern](https://en.wikipedia.org/wiki/Command_pattern)
  - [Saga Pattern](https://microservices.io/patterns/data/saga.html)
- **Constitution Principles**:
  - Rollback mechanism: Prevents inconsistent state
  - User control: Interactive prompts for ambiguous situations
  - Clear feedback: Progress indicators and error messages

---

## Implementation Notes

### Rollback Function Closures

Rollback functions capture state at time of operation:

```typescript
// Capture repoPath and worktreePath at operation time
logOperation(operationLog, {
  type: 'worktree_created',
  data: { repo: repoName, path: worktreePath, branch },
  rollback: async () => {
    // These variables are captured in closure
    await removeWorktree(repoPath, worktreePath, { force: true });
  }
});
```

### Idempotent Rollback

Always use `force` flags in rollback to handle:
- Already removed (manual cleanup)
- Locked worktrees
- Dirty state

### Progress Indicators

Use spinners for long operations:
```typescript
const spinner = ora('Fetching latest changes...').start();
await fetchAllRepos(config, selectedRepos);
spinner.succeed('Fetched latest changes');
```

### Error Context

Always include context in errors:
```typescript
throw new ArashiError(
  `Failed to create worktree for '${repoName}'`,
  ExitCode.ERROR,
  gitError.gitOutput
);
```
