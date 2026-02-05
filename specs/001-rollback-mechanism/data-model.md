# Data Model: Rollback Mechanism

**Feature**: 001-rollback-mechanism
**Date**: 2026-02-04

## Core Entities

### OperationLog

**Fields**:
- `entries: LogEntry[]` - Chronological list of logged operations
- `isRollingBack: boolean` - Flag to prevent concurrent rollbacks (default: false)

**Methods**:
- `add(entry: LogEntry): void` - Add operation to log
- `rollback(): RollbackResult` - Reverse all operations in LIFO order

**State Transitions**:
```
IDLE → LOGGING (add operations) → ROLLING_BACK → COMPLETED
```

---

### LogEntry (Discriminated Union)

**Common Fields**:
- `timestamp: number` - When operation occurred (Date.now())

**Type-Specific Variants**:

```typescript
type LogEntry = 
  | WorktreeCreatedEntry
  | BranchCreatedEntry  
  | DirectoryCreatedEntry
```

#### WorktreeCreatedEntry
- `type: 'worktree_created'`
- `data.repositoryPath: string` - Absolute path to repository
- `data.worktreePath: string` - Absolute path to worktree
- `data.branchName: string` - Branch name

#### BranchCreatedEntry
- `type: 'branch_created'`
- `data.repositoryPath: string` - Absolute path to repository
- `data.branchName: string` - Branch name

#### DirectoryCreatedEntry
- `type: 'directory_created'`
- `data.directoryPath: string` - Absolute path to directory

---

### RollbackResult

**Fields**:
- `totalOperations: number` - Total operations in log
- `successCount: number` - Successfully reversed operations
- `failureCount: number` - Failed reversal operations
- `failures: RollbackFailure[]` - Details of failed operations
- `duration: number` - Total rollback time in milliseconds

---

### RollbackFailure

**Fields**:
- `entry: LogEntry` - The log entry that failed to rollback
- `error: Error` - The error that occurred
- `operationIndex: number` - Position in operation log

---

## Data Flow

### Logging Operations
```
Operation Completes Successfully
    ↓
Create LogEntry with operation type and reversal data
    ↓
Validate entry (required fields present)
    ↓
Add timestamp
    ↓
Push to OperationLog.entries[]
```

### Rollback Execution
```
Rollback Triggered
    ↓
Check isRollingBack flag (throw if true)
    ↓
Set isRollingBack = true
    ↓
Reverse entries array (LIFO)
    ↓
For each entry (sequential):
    Dispatch to type-specific rollback function
    ↓
    Catch errors, log failures, continue
    ↓
Build RollbackResult
    ↓
Clear isRollingBack flag
    ↓
Return RollbackResult
```

---

## Validation Rules

- **LogEntry**: Must have valid `type` from enum, timestamp must be positive number, data must contain required fields for type
- **OperationLog.add()**: Cannot add entries during rollback (isRollingBack must be false)
- **OperationLog.rollback()**: Cannot start if already rolling back
- **RollbackResult**: successCount + failureCount must equal totalOperations

---

## Entity Relationships

```
OperationLog
└── entries: LogEntry[]
    └── type determines data structure

RollbackResult
└── failures: RollbackFailure[]
    └── entry: LogEntry
```
