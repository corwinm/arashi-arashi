# Data Model: Remove Command

**Feature**: 021-remove-command  
**Date**: 2026-02-07  
**Status**: Complete

## Purpose

This document defines the key entities, their attributes, relationships, and state transitions for the Remove Command feature. All entities are runtime data structures used during command execution - no persistent storage is required beyond the existing `.arashi/config.json`.

---

## Entity Definitions

### 1. Worktree

Represents a git working directory associated with a specific branch.

**Attributes:**
- `path: string` - Absolute filesystem path to the worktree directory
- `branch: string` - Git branch name checked out in this worktree
- `repository: string` - Name of the repository this worktree belongs to
- `isMain: boolean` - Whether this is the main worktree (cannot be removed)
- `isDirty: boolean` - Whether worktree has uncommitted changes
- `dirtyDetails?: DirtyStatus` - Optional detailed information about uncommitted changes

**Relationships:**
- Belongs to one Repository
- Associated with one Branch
- Has one DirtyStatus (if dirty)

**Validation Rules:**
- `path` must be an absolute path that exists on filesystem
- `branch` must be a valid git branch name
- `isMain` must be `true` for exactly one worktree per repository
- Main worktree cannot be removed (enforced in UI and command logic)

**Source:**
- Discovered via `git worktree list --porcelain` in each repository
- Filtered by target branch name

**Lifecycle:**
- Created during discovery phase
- Checked for dirty status if `--no-check-dirty` not provided
- Removed from filesystem via `git worktree remove`

---

### 2. Branch

Represents a git branch reference in a repository.

**Attributes:**
- `name: string` - Branch name (without refs/heads/ prefix)
- `repository: string` - Name of the repository this branch belongs to
- `isCurrent: boolean` - Whether this branch is currently checked out in main worktree
- `exists: boolean` - Whether branch exists in the repository

**Relationships:**
- Belongs to one Repository
- May have zero or more Worktrees

**Validation Rules:**
- `name` must be a valid git branch name
- `name` cannot be a protected branch (main, master, develop)
- Cannot delete `isCurrent=true` branch (must checkout different branch first)

**Source:**
- Target branch specified by user via CLI argument or interactive selection
- Existence verified via git commands

**Lifecycle:**
- Validated during discovery phase
- Deleted via `git branch -D <name>` after worktree removal

---

### 3. DirtyStatus

Represents uncommitted changes in a worktree.

**Attributes:**
- `isDirty: boolean` - Overall dirty status
- `modifiedFiles: number` - Count of modified tracked files
- `untrackedFiles: number` - Count of untracked files
- `stagedFiles: number` - Count of staged changes

**Relationships:**
- Belongs to one Worktree

**Validation Rules:**
- If `isDirty=true`, at least one of the count fields must be > 0
- All count fields must be >= 0

**Source:**
- Computed via `git status --porcelain` in each worktree path

**Lifecycle:**
- Created during dirty check phase (if not skipped)
- Used to display warnings and require confirmation
- Discarded after confirmation/cancellation

---

### 4. RemovalOperation

Represents a single removal operation (worktree or branch) for rollback tracking.

**Attributes:**
- `type: 'worktree_remove' | 'branch_delete'` - Type of operation
- `repository: string` - Repository where operation was performed
- `branchName: string` - Target branch name
- `worktreePath?: string` - Worktree path (for worktree_remove type only)
- `status: 'pending' | 'success' | 'failed'` - Operation status
- `error?: string` - Error message if status is 'failed'
- `reversible: boolean` - Whether operation can be reversed (always false for remove)

**Relationships:**
- Associated with one Repository
- Associated with one Branch
- Part of one RemovalSummary

**Validation Rules:**
- `type='worktree_remove'` requires `worktreePath` to be set
- `status='failed'` requires `error` to be set
- `reversible` is always `false` (removal operations cannot be undone)

**Source:**
- Created before each removal operation
- Updated with success/failure status after execution

**Lifecycle:**
- Created in pending state
- Executed and updated to success or failed
- Collected in RemovalSummary for reporting
- Used for partial failure tracking (FR-015)

---

### 5. RemovalSummary

Aggregates the results of all removal operations for a command execution.

**Attributes:**
- `totalWorktrees: number` - Total worktrees targeted for removal
- `successfulWorktrees: number` - Number of worktrees successfully removed
- `totalBranches: number` - Total branches targeted for deletion
- `successfulBranches: number` - Number of branches successfully deleted
- `operations: RemovalOperation[]` - List of all operations performed
- `errors: string[]` - List of error messages from failed operations
- `duration: number` - Total execution time in milliseconds

**Relationships:**
- Contains multiple RemovalOperations
- Aggregates results from multiple Repositories

**Validation Rules:**
- `successfulWorktrees <= totalWorktrees`
- `successfulBranches <= totalBranches`
- `operations.length` should equal sum of worktree and branch operations
- `errors.length > 0` implies some operations have `status='failed'`

**Source:**
- Built incrementally during command execution
- Finalized after all operations complete

**Lifecycle:**
- Initialized at start of removal process
- Updated after each operation
- Used to generate final output (success message or error report)

---

### 6. Repository

Represents a git repository in the workspace (main repo or sub-repo).

**Attributes:**
- `name: string` - Repository name (from config or derived)
- `path: string` - Absolute path to repository
- `defaultBranch: string` - Default branch name (main, master, etc.)
- `hasSetupScript: boolean` - Whether repository has setup.sh script (not relevant for remove)

**Relationships:**
- Contains zero or more Worktrees
- Contains zero or more Branches
- Part of workspace Configuration

**Validation Rules:**
- `path` must exist and be a valid git repository
- `name` must be unique within workspace

**Source:**
- Loaded from `.arashi/config.json` via `loadConfig()`
- Discovered via repository discovery module

**Lifecycle:**
- Loaded at command start
- Used to coordinate removal across multiple repos
- Not modified during remove command (unlike add command)

---

## Entity Relationships Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     RemovalSummary                      │
│  • totalWorktrees, successfulWorktrees                  │
│  • totalBranches, successfulBranches                    │
│  • operations[], errors[], duration                     │
└─────────────────┬──────────────────────────────────────┘
                  │ contains
                  ▼
         ┌─────────────────┐
         │ RemovalOperation│
         │  • type         │◀────────┐
         │  • repository   │         │
         │  • branchName   │         │ references
         │  • status       │         │
         └────────┬────────┘         │
                  │                  │
      ┌───────────┴───────────┐      │
      │                       │      │
      ▼                       ▼      │
┌───────────┐           ┌─────────┐ │
│ Worktree  │           │ Branch  │─┘
│  • path   │───────────│  • name │
│  • branch │ refers to │  • repo │
│  • repo   │           └─────────┘
│  • isMain │
│  • isDirty│
└─────┬─────┘
      │ has (if dirty)
      ▼
┌──────────────┐
│ DirtyStatus  │
│  • isDirty   │
│  • modified  │
│  • untracked │
│  • staged    │
└──────────────┘

         Repository
         ┌───────────────┐
         │  • name       │
         │  • path       │
         │  • default... │
         └───────┬───────┘
                 │ contains
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   Worktrees          Branches
```

---

## State Transitions

### Worktree Removal Flow

```
┌─────────────┐
│ Discovered  │ ──────► Initial state after git worktree list
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validated   │ ──────► Checked: exists, not main, not currently checked out
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Dirty Checked│ ──────► git status --porcelain executed (unless skipped)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Confirmed   │ ──────► User confirmed removal (interactive prompt)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Removing   │ ──────► git worktree remove executing
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌────────┐ ┌────────┐
│Removed │ │ Failed │
│(success│ │(error) │
└────────┘ └────────┘
```

### Branch Deletion Flow

```
┌─────────────┐
│  Targeted   │ ──────► Branch name specified by user
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Validated  │ ──────► Checked: exists, not protected, not current
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Deleting   │ ──────► git branch -D executing
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌────────┐ ┌────────┐
│Deleted │ │ Failed │
│(success│ │(error) │
└────────┘ └────────┘
```

### Command Execution Flow

```
┌─────────────┐
│   Start     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Load Config     │
└──────┬──────────┘
       │
       ▼
┌──────────────────────┐
│ Discover Worktrees   │──► git worktree list in each repo
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Check Dirty Status   │──► git status --porcelain per worktree
│ (if not skipped)     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Display Summary &    │──► Show what will be removed
│ Request Confirmation │
└──────┬───────────────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌────────┐ ┌─────────┐
│Declined│ │Confirmed│
│(exit)  │ │         │
└────────┘ └────┬────┘
                │
                ▼
       ┌────────────────────┐
       │ Remove Worktrees   │──► For each worktree
       │ (unless --keep)    │
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Delete Branches   │──► For each branch
       │  (unless --keep)   │
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Generate Summary  │──► RemovalSummary with results
       └────────┬───────────┘
                │
            ┌───┴────┐
            │        │
            ▼        ▼
     ┌────────┐ ┌──────────┐
     │Success │ │ Partial  │
     │(exit 0)│ │(exit 1)  │
     └────────┘ └──────────┘
```

---

## Data Validation

### Pre-Removal Validation Checklist

Before removing any worktree or branch, validate:

1. **Worktree Validation:**
   - ✓ Path exists on filesystem
   - ✓ Is not the main worktree (`isMain=false`)
   - ✓ Repository is accessible
   - ✓ Branch name is valid

2. **Dirty Check (unless skipped):**
   - ✓ Run `git status --porcelain`
   - ✓ If dirty and user declines confirmation, abort

3. **Branch Validation:**
   - ✓ Branch exists in repository
   - ✓ Branch is not currently checked out in main worktree
   - ✓ Branch is not a protected branch

4. **Repository Validation:**
   - ✓ Repository path exists
   - ✓ Repository is a valid git repository
   - ✓ Git commands can execute successfully

### Post-Removal Verification

After removal operations:

1. **Success Verification:**
   - ✓ Worktree directory no longer exists
   - ✓ `git worktree list` no longer shows worktree
   - ✓ `git branch` no longer shows branch
   - ✓ `.git/worktrees/` metadata cleaned up

2. **Error Handling:**
   - ✓ Collect all errors in RemovalSummary
   - ✓ Display which repositories succeeded/failed
   - ✓ Exit with non-zero code if any failures

---

## Implementation Notes

### Memory Footprint

Estimated memory usage for typical operation (5 repos, 10 worktrees):
- Worktree objects: ~10 KB (10 worktrees × ~1 KB each)
- Branch objects: ~5 KB (10 branches × ~500 bytes each)
- RemovalOperations: ~20 KB (20 operations × ~1 KB each)
- RemovalSummary: ~1 KB
- **Total: ~36 KB** (negligible)

### Performance Characteristics

- **Discovery**: O(R) where R = number of repositories (~1-2 seconds for 5 repos)
- **Dirty Check**: O(W) where W = number of worktrees (~0.5-1 second for 10 worktrees)
- **Removal**: O(W) for worktrees + O(B) for branches (~2-3 seconds for 10 worktrees + 10 branches)
- **Total**: < 30 seconds for typical workspace (meets SC-001 success criteria)

### Concurrency Considerations

Current implementation is sequential. Potential optimizations:
- Parallelize dirty checks: `Promise.all(worktrees.map(checkDirty))`
- Parallelize worktree removal across repositories
- Parallelize branch deletion across repositories

However, sequential approach is simpler and meets performance requirements.

---

## Future Enhancements

Potential entity extensions for future features:

1. **RemoteTrackingBranch**: Track and optionally delete remote branches
2. **MergeStatus**: Check if branch is merged before deletion
3. **WorktreeMetrics**: Track worktree age, last commit date, file count
4. **RemovalPolicy**: Configurable rules for what can be removed
5. **AuditLog**: Persistent log of removal operations for workspace history

None of these are required for the MVP (Phase 1 implementation).
