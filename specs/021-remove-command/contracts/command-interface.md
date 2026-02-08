# Command Contract: arashi remove

**Feature**: 021-remove-command  
**Date**: 2026-02-07  
**Version**: 1.0.0

## Command Signature

```bash
arashi remove [branch] [options]
```

### Parameters

#### Positional Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `branch` | string | No | Branch name to remove. If omitted, displays interactive multi-select list of all worktrees. |

#### Options/Flags

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--no-check-dirty` | boolean | false | Skip uncommitted changes check. Remove worktrees without checking for dirty state. |
| `--keep-worktrees` | boolean | false | Delete branches but preserve worktree directories on filesystem. |
| `--keep-branches` | boolean | false | Remove worktree directories but preserve git branches. |
| `--force` / `-f` | boolean | false | Skip all confirmation prompts. Equivalent to answering "yes" to all prompts. |
| `--json` | boolean | false | Output results in JSON format instead of human-readable text. |
| `--help` / `-h` | boolean | false | Display help information and exit. |

### Examples

```bash
# Remove single branch with prompts
arashi remove feature-login

# Remove multiple branches interactively
arashi remove

# Remove without checking for uncommitted changes
arashi remove feature-branch --no-check-dirty

# Delete only branches, keep worktree directories
arashi remove feature-branch --keep-worktrees

# Remove only worktrees, keep git branches
arashi remove feature-branch --keep-branches

# Force removal without confirmations
arashi remove feature-branch --force

# JSON output for scripting
arashi remove feature-branch --json
```

---

## Success Output

### Human-Readable Format (default)

```
✓ Successfully removed 3 worktrees and deleted 3 branches

Removed worktrees:
  • main-repo: worktrees/feature-login
  • api-service: repos/api-service/feature-login
  • web-app: repos/web-app/feature-login

Deleted branches:
  • main-repo: feature-login
  • api-service: feature-login
  • web-app: feature-login

Total duration: 5.42s
```

### JSON Format (`--json`)

```json
{
  "success": true,
  "summary": {
    "totalWorktrees": 3,
    "successfulWorktrees": 3,
    "totalBranches": 3,
    "successfulBranches": 3,
    "duration": 5420
  },
  "operations": [
    {
      "type": "worktree_remove",
      "repository": "main-repo",
      "branchName": "feature-login",
      "worktreePath": "/workspace/worktrees/feature-login",
      "status": "success"
    },
    {
      "type": "worktree_remove",
      "repository": "api-service",
      "branchName": "feature-login",
      "worktreePath": "/workspace/repos/api-service/feature-login",
      "status": "success"
    },
    {
      "type": "worktree_remove",
      "repository": "web-app",
      "branchName": "feature-login",
      "worktreePath": "/workspace/repos/web-app/feature-login",
      "status": "success"
    },
    {
      "type": "branch_delete",
      "repository": "main-repo",
      "branchName": "feature-login",
      "status": "success"
    },
    {
      "type": "branch_delete",
      "repository": "api-service",
      "branchName": "feature-login",
      "status": "success"
    },
    {
      "type": "branch_delete",
      "repository": "web-app",
      "branchName": "feature-login",
      "status": "success"
    }
  ],
  "errors": []
}
```

---

## Error Output

### Error Categories

| Error Type | Exit Code | Description |
|------------|-----------|-------------|
| Branch Not Found | 2 | Specified branch does not exist in any repository |
| User Cancelled | 0 | User declined confirmation prompt |
| Configuration Error | 1 | Workspace not initialized or config invalid |
| Partial Failure | 1 | Some operations succeeded, some failed |
| Fatal Error | 1 | Unexpected error during execution |

### Human-Readable Error Format

#### Branch Not Found
```
✗ Branch 'feature-xyz' not found in any repository

Available branches:
  • feature-login (3 repositories)
  • feature-auth (2 repositories)
  • bugfix-123 (1 repository)

Hint: Run 'arashi list' to see all worktrees
```

#### Uncommitted Changes Warning
```
⚠ Uncommitted changes detected in 2 worktrees:

  • main-repo: 3 modified files, 1 untracked file
  • api-service: 1 modified file

? Are you sure you want to remove these worktrees? This will discard all uncommitted changes. (y/N)
```

#### User Cancelled
```
Operation cancelled by user
```

#### Partial Failure
```
✗ Partial removal completed with errors

Successful operations:
  ✓ main-repo: Removed worktree and deleted branch
  ✓ web-app: Removed worktree and deleted branch

Failed operations:
  ✗ api-service: Worktree is locked (use --force to override)

2 of 3 repositories processed successfully
```

### JSON Error Format

```json
{
  "success": false,
  "summary": {
    "totalWorktrees": 3,
    "successfulWorktrees": 2,
    "totalBranches": 3,
    "successfulBranches": 2,
    "duration": 3210
  },
  "operations": [
    {
      "type": "worktree_remove",
      "repository": "main-repo",
      "branchName": "feature-login",
      "worktreePath": "/workspace/worktrees/feature-login",
      "status": "success"
    },
    {
      "type": "worktree_remove",
      "repository": "api-service",
      "branchName": "feature-login",
      "worktreePath": "/workspace/repos/api-service/feature-login",
      "status": "failed",
      "error": "Worktree is locked"
    },
    {
      "type": "worktree_remove",
      "repository": "web-app",
      "branchName": "feature-login",
      "worktreePath": "/workspace/repos/web-app/feature-login",
      "status": "success"
    },
    {
      "type": "branch_delete",
      "repository": "main-repo",
      "branchName": "feature-login",
      "status": "success"
    },
    {
      "type": "branch_delete",
      "repository": "api-service",
      "branchName": "feature-login",
      "status": "failed",
      "error": "Branch is currently checked out"
    },
    {
      "type": "branch_delete",
      "repository": "web-app",
      "branchName": "feature-login",
      "status": "success"
    }
  ],
  "errors": [
    "api-service: Worktree is locked",
    "api-service: Branch is currently checked out"
  ]
}
```

---

## Interactive Prompts

### Multi-Select List (when no branch argument provided)

```
? Select worktrees to remove: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ feature-login (3 repositories) - clean
 ◉ feature-auth (2 repositories) - clean
 ◯ bugfix-123 (1 repository) - dirty
 ◯ refactor-api (2 repositories) - clean
```

**Behavior:**
- Shows all discovered worktrees grouped by branch name
- Indicates number of repositories per branch
- Shows clean/dirty status with colored indicators
- User can select multiple branches using space bar
- Enter confirms selection, Ctrl+C cancels

### Confirmation Prompt (standard removal)

```
? Remove 3 worktrees and delete 3 branches for 'feature-login'? (y/N)
```

**Behavior:**
- Shows count of worktrees and branches to be removed
- Defaults to "No" (safer option)
- Requires explicit "y" or "yes" to proceed

### Dirty Worktree Warning Prompt

```
⚠ Uncommitted changes detected in 2 worktrees:

  • main-repo: 3 modified files, 1 untracked file
  • api-service: 1 modified file

? Are you sure you want to remove these worktrees? This will discard all uncommitted changes. (y/N)
```

**Behavior:**
- Lists repositories with uncommitted changes
- Shows detailed file counts
- More explicit warning about data loss
- Defaults to "No"

---

## Behavior Specifications

### When Both `--keep-worktrees` and `--keep-branches` Are Used

```
⚠ Both --keep-worktrees and --keep-branches specified

No operations will be performed. At least one removal type must be enabled.
```

**Exit Code:** 0 (not an error, just a no-op)

### When Branch Doesn't Exist in Some Repositories

**Behavior:** This is normal - proceed with removal in repositories that have the branch.

```
✓ Successfully removed 2 worktrees and deleted 2 branches

Removed worktrees:
  • main-repo: worktrees/feature-login
  • api-service: repos/api-service/feature-login

Note: Branch 'feature-login' not found in: web-app, mobile-app
```

### When Main Worktree is Encountered

**Behavior:** Skip main worktree automatically (cannot be removed).

```
Skipping main worktree: /workspace/main-repo (cannot be removed)

✓ Successfully removed 2 worktrees and deleted 2 branches
```

### When Worktree is Currently Open (In Use)

```
✗ Failed to remove worktree in api-service

Error: Worktree is in use by another process

Hint: Close any terminals, editors, or processes using this worktree and try again
```

---

## Exit Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 0 | Success | All operations completed successfully OR user cancelled before making changes |
| 1 | Failure | Configuration error, fatal error, or partial failure with some operations failing |
| 2 | Validation Error | Branch not found, invalid arguments, or pre-condition check failed |

---

## Configuration Dependencies

### Required Configuration

- `.arashi/config.json` must exist in workspace root
- Configuration must include `repos_dir` field
- Configuration must list discovered repositories

### Optional Configuration

None - all behavior is controlled via command-line flags.

---

## Performance Guarantees

Based on Success Criteria (SC-001):

| Operation | Target | Typical |
|-----------|--------|---------|
| Single branch removal | < 30 seconds | 5-10 seconds |
| Multi-branch removal (5 branches) | < 60 seconds | 20-30 seconds |
| Discovery phase | < 5 seconds | 2-3 seconds |
| Dirty check phase | < 5 seconds | 1-2 seconds |

**Assumptions:** 
- 5-10 repositories
- 10-50 total worktrees
- Local git operations (no network I/O)
- Standard SSD storage

---

## Compatibility

### Minimum Requirements

- Git 2.5+ (when `git worktree` was introduced)
- Bun runtime (bundled in executable)
- Operating Systems: macOS, Linux, Windows

### Cross-Platform Notes

- Path separators handled automatically by Bun's path utilities
- Command output uses ANSI colors (gracefully degrades in non-color terminals)
- Prompts work in all standard terminals (TTY required)

---

## Security Considerations

### Data Loss Prevention

1. **Confirmation Prompts:** Required by default for all destructive operations
2. **Dirty Detection:** Warns about uncommitted changes before removal
3. **Force Flag:** Explicit `--force` required to skip safety checks
4. **No Remote Operations:** Does not delete remote branches (preserves backup)

### Process Safety

1. **Atomic Operations:** Each worktree/branch operation is independent
2. **Partial Failure Handling:** Continues on error, reports what succeeded/failed
3. **No Cascading Deletes:** Removing worktree does not affect other worktrees

---

## Extension Points

### Future Enhancements

1. **Remote Branch Deletion:** `--delete-remote` flag to also delete from origin
2. **Dry Run Mode:** `--dry-run` to preview what would be removed
3. **Filter by Age:** `--older-than=30d` to remove old worktrees
4. **Filter by Status:** `--dirty-only` or `--clean-only` for selective removal
5. **Batch Confirmation:** `--confirm-each` to confirm per repository
6. **Merge Check:** `--only-merged` to delete only merged branches

None of these are in scope for MVP implementation.
