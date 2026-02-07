# Quickstart: Rollback Mechanism

**Feature**: 012-rollback-mechanism
**Purpose**: Guide for implementing operation logging and automatic rollback
**Date**: 2026-02-04

## Overview

This quickstart provides implementation guidance for the rollback mechanism. It covers operation logging, rollback execution, and error handling.

## Prerequisites

- ✅ **001-git-utility-lib**: Git operations (removeWorktree, deleteBranch)
- ✅ **005-filesystem-utilities**: Directory removal
- ✅ **006-logger-utilities**: Optional progress display

## Implementation Path

### Step 1: OperationLog Class

**File**: `repos/arashi/src/core/rollback.ts`

**Purpose**: Maintain log of reversible operations with LIFO rollback

**Key Logic**:

```typescript
export class OperationLog {
  entries: LogEntry[] = [];
  private isRollingBack = false;
  
  add(entry: LogEntry): void {
    if (this.isRollingBack) {
      throw new RollbackInProgressError("Cannot add entries during rollback");
    }
    
    // Validate entry
    if (!isValidLogEntry(entry)) {
      throw new InvalidLogEntryError("Invalid log entry", entry, "Missing required fields");
    }
    
    this.entries.push(entry);
  }
  
  async rollback(): Promise<RollbackResult> {
    if (this.isRollingBack) {
      throw new ConcurrentRollbackError("Rollback already in progress");
    }
    
    this.isRollingBack = true;
    const startTime = Date.now();
    const failures: RollbackFailure[] = [];
    
    try {
      // Reverse array for LIFO processing
      const reversedEntries = [...this.entries].reverse();
      
      for (let i = 0; i < reversedEntries.length; i++) {
        const entry = reversedEntries[i];
        
        try {
          await rollbackOperation(entry);
        } catch (error) {
          failures.push({
            entry,
            error: error as Error,
            operationIndex: this.entries.length - 1 - i
          });
          // Continue rollback despite failure
        }
      }
      
      return {
        totalOperations: this.entries.length,
        successCount: this.entries.length - failures.length,
        failureCount: failures.length,
        failures,
        duration: Date.now() - startTime
      };
    } finally {
      this.isRollingBack = false;
    }
  }
}
```

---

### Step 2: Type-Specific Rollback Functions

**Function**: `rollbackOperation(entry: LogEntry)` - Dispatcher

**Purpose**: Route to appropriate rollback function based on operation type

```typescript
async function rollbackOperation(entry: LogEntry): Promise<void> {
  switch (entry.type) {
    case 'worktree_created':
      return rollbackWorktreeCreated(entry);
    case 'branch_created':
      return rollbackBranchCreated(entry);
    case 'directory_created':
      return rollbackDirectoryCreated(entry);
    default:
      throw new Error(`Unknown operation type: ${(entry as any).type}`);
  }
}

async function rollbackWorktreeCreated(entry: WorktreeCreatedEntry): Promise<void> {
  const { repositoryPath, worktreePath } = entry.data;
  
  try {
    await git.removeWorktree(repositoryPath, worktreePath);
  } catch (error) {
    // Check if worktree no longer exists (idempotent rollback)
    if (error.message.includes('not a working tree')) {
      return; // Already removed, treat as success
    }
    throw error;
  }
}

async function rollbackBranchCreated(entry: BranchCreatedEntry): Promise<void> {
  const { repositoryPath, branchName } = entry.data;
  
  try {
    await git.deleteBranch(repositoryPath, branchName, { force: true });
  } catch (error) {
    if (error.message.includes('not found')) {
      return; // Already deleted
    }
    throw error;
  }
}

async function rollbackDirectoryCreated(entry: DirectoryCreatedEntry): Promise<void> {
  const { directoryPath } = entry.data;
  
  try {
    await filesystem.removeDirectory(directoryPath, { recursive: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return; // Already removed
    }
    throw error;
  }
}
```

---

### Step 3: Validation Functions

**Purpose**: Ensure log entries are valid before adding

```typescript
export function isValidLogEntry(entry: any): entry is LogEntry {
  if (!entry || typeof entry !== 'object') return false;
  if (typeof entry.timestamp !== 'number' || entry.timestamp <= 0) return false;
  
  switch (entry.type) {
    case 'worktree_created':
      return isValidWorktreeCreatedData(entry.data);
    case 'branch_created':
      return isValidBranchCreatedData(entry.data);
    case 'directory_created':
      return isValidDirectoryCreatedData(entry.data);
    default:
      return false;
  }
}

export function isValidWorktreeCreatedData(data: any): boolean {
  return (
    data &&
    typeof data.repositoryPath === 'string' &&
    typeof data.worktreePath === 'string' &&
    typeof data.branchName === 'string'
  );
}

export function isValidBranchCreatedData(data: any): boolean {
  return (
    data &&
    typeof data.repositoryPath === 'string' &&
    typeof data.branchName === 'string'
  );
}

export function isValidDirectoryCreatedData(data: any): boolean {
  return (
    data &&
    typeof data.directoryPath === 'string'
  );
}
```

---

## Testing Strategy

### Unit Tests (`tests/unit/core/rollback.test.ts`)

**What to Test**:

1. **OperationLog.add()**
   - Valid entries are added successfully
   - Invalid entries throw InvalidLogEntryError
   - Cannot add during rollback (throws RollbackInProgressError)

2. **OperationLog.rollback()**
   - Empty log: Returns result with totalOperations=0
   - LIFO order: Verify operations reversed in reverse order
   - Continue on error: Partial failures don't stop rollback
   - Concurrent prevention: Second rollback throws ConcurrentRollbackError

3. **Rollback functions**
   - Mock git/filesystem operations
   - Verify correct function called for each operation type
   - Idempotent: Non-existent resources don't throw errors

4. **Validation functions**
   - Valid entries pass validation
   - Missing fields fail validation
   - Invalid types fail validation

**Mocking Strategy**:
- Mock git.removeWorktree, git.deleteBranch
- Mock filesystem.removeDirectory
- Use spy/mock to verify calls with correct arguments

---

### Integration Tests (`tests/integration/rollback-integration.test.ts`)

**Test Fixtures**: Create temporary git repositories and directories

**What to Test**:

1. **Worktree rollback**
   - Create real worktree, log it, rollback, verify removed

2. **Branch rollback**
   - Create real branch, log it, rollback, verify deleted

3. **Directory rollback**
   - Create real directory, log it, rollback, verify removed

4. **Mixed operations**
   - Log worktree + branch + directory, rollback, verify correct order

5. **Partial failure**
   - Make one operation fail (e.g., read-only directory)
   - Verify other operations still rolled back
   - Verify failure reported in result

---

## Common Pitfalls

1. **FIFO Instead of LIFO**: Must reverse array before processing
2. **Abort on First Error**: Must continue rollback despite failures
3. **Non-Idempotent Rollback**: Must handle already-deleted resources
4. **No Concurrent Protection**: Must prevent simultaneous rollbacks

---

## Next Steps

1. Implement OperationLog class with add() and rollback() methods
2. Implement type-specific rollback functions
3. Write unit tests for all functions
4. Write integration tests with real resources
5. Integrate with worktree orchestration (core/worktree.ts consumer)
