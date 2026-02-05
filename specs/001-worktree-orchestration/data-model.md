# Data Model: Worktree Orchestration

**Feature**: 001-worktree-orchestration
**Date**: 2026-02-04
**Purpose**: Define data structures and their relationships for coordinated worktree creation

## Core Entities

### WorktreeOperation

Represents a coordinated worktree creation operation spanning multiple repositories.

**Fields**:
- `branchName: string` - The branch name to create across all repositories
- `repositoryFilter: RepositoryFilter` - Criteria for which repositories to include
- `operationLog: OperationLog` - Log of reversible actions for rollback (from 001-rollback-mechanism)
- `options: WorktreeOperationOptions` - Configuration options for the operation

**Relationships**:
- Contains one `RepositoryFilter`
- Contains one `OperationLog`
- Produces multiple `RepositoryResult` (one per repository processed)

**State Transitions**:
```
INITIALIZING → VALIDATING → FILTERING → CONFLICT_CHECKING → EXECUTING → COMPLETED
                                                          ↓
                                                    ROLLING_BACK → FAILED
```

**Validation Rules**:
- `branchName` must be a valid git branch name (no spaces, special characters, cannot start with -)
- `repositoryFilter` must result in at least one repository to process
- `operationLog` must be initialized before execution begins

---

### WorktreeOperationOptions

Configuration options for worktree creation operation.

**Fields**:
- `executeHooks: boolean` - Whether to execute pre-create and post-create hooks (default: true)
- `hookTimeout: number` - Timeout in milliseconds for hook execution (default: 60000)
- `interactive: boolean` - Whether to use interactive repository selection (default: false)
- `conflictResolution: ConflictResolutionStrategy | null` - Pre-selected conflict resolution strategy, or null to prompt user
- `showProgress: boolean` - Whether to display progress spinners (default: true)
- `dryRun: boolean` - Whether to simulate operation without making changes (default: false)

**Validation Rules**:
- `hookTimeout` must be positive
- If `interactive` is true and `repositoryFilter.mode` is explicit list, the list is used as pre-selection in interactive prompt

---

### RepositoryFilter

Represents the selection criteria for which repositories to include in the operation.

**Fields**:
- `mode: 'all' | 'explicit' | 'interactive'` - Filtering mode
- `explicitList: string[]` - Repository names when mode is 'explicit' (empty for other modes)
- `selectedRepositories: Repository[] | null` - Resolved repositories after filtering (populated after filter application)

**Relationships**:
- References `Repository` entities from 001-repository-management

**Validation Rules**:
- When `mode` is 'explicit', `explicitList` must not be empty
- All names in `explicitList` must correspond to configured repositories (validated during filter application)
- `selectedRepositories` is null until filter is applied

---

### BranchConflict

Represents a detected conflict where the target branch name already exists in a repository.

**Fields**:
- `repository: Repository` - The repository with the conflict
- `branchName: string` - The conflicting branch name
- `existsLocally: boolean` - Whether the branch exists locally
- `existsRemotely: boolean` - Whether the branch exists on remote
- `resolution: ConflictResolution | null` - User's chosen resolution (null until resolved)

**Relationships**:
- References one `Repository` from 001-repository-management

**State Transitions**:
```
DETECTED → RESOLVED (with resolution strategy)
         → ABORTED (user chose to abort)
```

---

### ConflictResolutionStrategy

Enumeration of strategies for resolving branch name conflicts.

**Values**:
- `ABORT` - Abort the entire operation without creating any worktrees
- `REUSE_EXISTING` - Use existing branches where they exist, create new branches where they don't
- `CREATE_ALTERNATE` - Create alternate branch names (e.g., feature-123-1, feature-123-2) to avoid conflicts

**Usage**: Selected by user via prompt when conflicts are detected, or pre-configured via options.

---

### RepositoryResult

Represents the outcome of worktree creation for a single repository.

**Fields**:
- `repository: Repository` - The repository processed
- `status: 'success' | 'failed' | 'skipped'` - Outcome status
- `worktreePath: string | null` - Path to created worktree (null if failed or skipped)
- `branchName: string` - Branch name used (may differ from requested if conflict resolution used alternate)
- `error: Error | null` - Error object if status is 'failed' (null otherwise)
- `warnings: string[]` - Non-fatal warnings (e.g., post-create hook failed but worktree created)
- `duration: number` - Time taken to process this repository in milliseconds

**Relationships**:
- References one `Repository` from 001-repository-management
- May contain one `Error` if failed

**Validation Rules**:
- If `status` is 'success', `worktreePath` must not be null
- If `status` is 'failed', `error` must not be null
- If `status` is 'skipped', both `worktreePath` and `error` are null

---

### OperationSummary

Represents the final summary of a worktree creation operation.

**Fields**:
- `totalRepositories: number` - Total number of repositories attempted
- `successCount: number` - Number of repositories where worktree was successfully created
- `failureCount: number` - Number of repositories that failed
- `skippedCount: number` - Number of repositories skipped (e.g., due to filter)
- `repositoryResults: RepositoryResult[]` - Detailed results for each repository
- `rolledBack: boolean` - Whether rollback was triggered
- `totalDuration: number` - Total operation time in milliseconds
- `errorSummary: string | null` - Human-readable error summary if operation failed (null if all succeeded)

**Relationships**:
- Contains multiple `RepositoryResult` entries

**Validation Rules**:
- `successCount + failureCount + skippedCount` must equal `totalRepositories`
- If `rolledBack` is true, `successCount` should be 0 (all successful operations were undone)
- If `failureCount > 0`, `errorSummary` should not be null

---

### HookExecutionContext

Represents the environment and parameters passed to hook scripts.

**Fields**:
- `hookType: 'pre-create' | 'post-create'` - Type of hook being executed
- `branchName: string` - Target branch name
- `repositoryPath: string` - Absolute path to repository
- `repositoryName: string` - Name of repository from configuration
- `worktreePath: string | null` - Path to worktree (null for pre-create hooks, populated for post-create)
- `environment: Record<string, string>` - Environment variables to pass to hook script
- `timeout: number` - Timeout in milliseconds

**Relationships**:
- Associated with one `Repository` during execution

**Validation Rules**:
- For `pre-create` hooks, `worktreePath` must be null
- For `post-create` hooks, `worktreePath` must not be null
- `timeout` must be positive
- `environment` must include standard hook variables: `ARASHI_BRANCH`, `ARASHI_REPO_PATH`, `ARASHI_REPO_NAME`, `ARASHI_WORKTREE_PATH` (for post-create)

---

## Supporting Types from Dependencies

### Repository (from 001-repository-management)

**Relevant Fields**:
- `name: string` - Repository name
- `path: string` - Absolute path to repository
- `defaultBranch: string` - Default branch name (main, master, develop, etc.)
- `hasSetupScript: boolean` - Whether setup.sh exists

---

### OperationLog (from 001-rollback-mechanism)

**Relevant Fields**:
- `entries: LogEntry[]` - Chronological list of logged operations

**Relevant Methods**:
- `add(entry: LogEntry): void` - Add operation to log
- `rollback(): RollbackResult` - Reverse all logged operations

---

### LogEntry (from 001-rollback-mechanism)

**Relevant Fields**:
- `type: 'worktree_created' | 'branch_created' | 'directory_created'` - Operation type
- `timestamp: number` - When operation occurred
- `data: Record<string, any>` - Type-specific reversal information

---

## Entity Relationships Diagram

```
WorktreeOperation
├── repositoryFilter: RepositoryFilter
│   └── selectedRepositories: Repository[] (from 001-repository-management)
├── operationLog: OperationLog (from 001-rollback-mechanism)
│   └── entries: LogEntry[]
├── options: WorktreeOperationOptions
│   └── conflictResolution: ConflictResolutionStrategy?
└── produces → OperationSummary
    └── repositoryResults: RepositoryResult[]
        ├── repository: Repository
        ├── error: Error?
        └── warnings: string[]

BranchConflict
├── repository: Repository
└── resolution: ConflictResolution?

HookExecutionContext
└── associated with → Repository
```

---

## Data Flow

### 1. Initialization
```
User Input (branch name, filter, options)
    ↓
Create WorktreeOperation with RepositoryFilter and WorktreeOperationOptions
    ↓
Initialize OperationLog (from 001-rollback-mechanism)
```

### 2. Repository Filtering
```
Load all repositories (from 001-repository-management)
    ↓
Apply RepositoryFilter
    ↓
Populate selectedRepositories in RepositoryFilter
```

### 3. Conflict Detection
```
For each selected repository:
    Check if branch exists (git branch --list, git ls-remote)
    ↓
    If exists: Create BranchConflict entry
    ↓
If any conflicts: Present to user for resolution
    ↓
User selects ConflictResolutionStrategy
    ↓
Apply resolution to all conflicts
```

### 4. Execution
```
For each repository in selectedRepositories (sequential):
    Create HookExecutionContext (pre-create)
    ↓
    Execute pre-create hook (if configured)
    ↓
    Create branch and worktree (via 001-git-utility-lib)
    ↓
    Log operations in OperationLog
    ↓
    Create HookExecutionContext (post-create)
    ↓
    Execute post-create hook (if configured)
    ↓
    Create RepositoryResult (success/failed)
    
If any error:
    Trigger OperationLog.rollback()
    ↓
    Set rolledBack = true in OperationSummary
```

### 5. Completion
```
Aggregate all RepositoryResults
    ↓
Create OperationSummary with counts, duration, error summary
    ↓
Return OperationSummary to caller
```

---

## Validation Scenarios

### Scenario: Valid Coordinated Worktree Creation
- Input: Branch name "feature-123", filter mode "all", 5 repositories configured
- Validation: Branch name is valid, all repositories exist and are valid git repos
- Expected: 5 RepositoryResult entries with status 'success', OperationSummary.successCount = 5

### Scenario: Branch Conflict with Reuse Strategy
- Input: Branch "feature-123" exists in 2 of 5 repositories, user selects REUSE_EXISTING
- Validation: Conflicts detected in pre-flight, user prompted and resolves
- Expected: 2 repositories reuse existing branch, 3 create new branch, all succeed

### Scenario: Hook Failure with Rollback
- Input: Pre-create hook fails in 3rd of 5 repositories
- Validation: Hook execution error detected, rollback triggered
- Expected: First 2 worktrees are rolled back, OperationSummary shows failureCount = 1, rolledBack = true

### Scenario: Invalid Repository Filter
- Input: Explicit filter with repository name "nonexistent"
- Validation: Repository name validation fails during filter application
- Expected: Operation fails early with RepositoryValidationError, no worktrees created

---

## Persistence

**In-Memory Only** (No Persistence):
- `WorktreeOperation`, `OperationLog`, `RepositoryResult`, `OperationSummary` - exist only during operation execution
- These are transient data structures that represent in-progress or completed operations

**Read from Configuration** (via 001-config-management):
- `Repository` list - read from `.arashi/config.json`
- Hook timeout settings - read from `.arashi/config.json`

**Future Enhancement Potential**:
- Operation history log: Persist `OperationSummary` to `.arashi/operation-history.json` for audit trail
- Conflict resolution preferences: Remember user's last conflict resolution choice as default
