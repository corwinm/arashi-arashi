# Research: Rollback Mechanism

**Feature**: 012-rollback-mechanism
**Date**: 2026-02-04
**Purpose**: Resolve technical unknowns for operation log and rollback implementation

## Research Tasks Completed

### 1. Operation Log Data Structure

**Decision**: In-memory array-based operation log with LIFO (stack) processing for rollback

**Rationale**:
- **Array vs Linked List**: Array provides simpler implementation and sufficient performance
  - Push operation: O(1) amortized time
  - Reverse iteration: O(n) with simple array reverse
  - No complex pointer management
- **In-Memory vs Persistent**: In-memory for performance, optional persistence for audit trail
  - No I/O overhead during logging (critical path)
  - Persist only on explicit save or error for debugging
- **LIFO (Stack) Processing**: Reverse chronological order ensures dependency-safe cleanup
  - Worktree removed before branch deleted (prevents git errors)
  - Directories removed after contents

**Alternatives Considered**:
- **Linked List**: Rejected due to implementation complexity with minimal benefit
- **Database Storage**: Rejected for performance reasons (adds I/O to critical path)
- **FIFO Processing**: Rejected because it violates dependency order (would fail on worktree/branch)

**Best Practices**:
- Log entry immediately after successful operation completion
- Include complete reversal information (no external state dependencies)
- Validate log entry structure before adding to log
- Use TypeScript types to enforce log entry structure

---

### 2. Rollback Error Handling Strategy

**Decision**: Continue-on-error approach with comprehensive error logging

**Rationale**:
- **Continue vs Abort**: Continue rollback even when individual operations fail because:
  - Partial cleanup is better than no cleanup
  - Some failures are benign (resource already deleted)
  - User gets maximum cleanup effort
- **Error Logging**: Capture all failure details for user awareness and debugging
- **Non-Existent Resources**: Treat as success (idempotent rollback)

**Alternatives Considered**:
- **Abort on First Error**: Rejected because it leaves more artifacts
- **Retry Failed Operations**: Rejected due to complexity and potential infinite loops
- **Silent Failures**: Rejected because users need to know what couldn't be cleaned up

**Best Practices**:
- Log both successes and failures during rollback
- Include error details in rollback result summary
- Distinguish between fatal errors (permission denied) and benign (already deleted)
- Return rollback result with success/failure counts

---

### 3. Operation Type Handling

**Decision**: Type-specific rollback functions with factory pattern

**Rationale**:
- **Separate Functions per Type**: Each operation type has unique rollback logic
  - `worktree_created` → call git.removeWorktree()
  - `branch_created` → call git.deleteBranch()
  - `directory_created` → call filesystem.removeDirectory()
- **Factory Pattern**: Centralized dispatch based on operation type
- **Extensibility**: Easy to add new operation types in future

**Alternatives Considered**:
- **Generic Rollback Function**: Rejected because operation types require different git/filesystem commands
- **Class Hierarchy**: Rejected as over-engineering for simple operation types
- **Command Pattern**: Rejected due to complexity (operation log entries don't need execute/undo methods)

**Best Practices**:
- Define union type for log entry data based on operation type
- Validate operation type before dispatch
- Handle unknown operation types gracefully (log warning, skip)
- Each rollback function should be idempotent (safe to call multiple times)

---

### 4. Concurrency and Race Conditions

**Decision**: Simple mutex lock to prevent concurrent rollbacks on same operation log

**Rationale**:
- **Problem**: Multiple rollback calls on same operation log could cause race conditions
- **Solution**: Flag-based lock during rollback execution
  - Set `isRollingBack` flag at start of rollback
  - Check flag before allowing rollback
  - Clear flag after rollback completes
- **Scope**: Lock is per-operation-log instance (different operations can rollback simultaneously)

**Alternatives Considered**:
- **No Lock**: Rejected because concurrent rollbacks could conflict (double-delete)
- **Global Lock**: Rejected because it prevents parallel operations on different logs
- **Sophisticated Lock**: Rejected as over-engineering for simple use case

**Best Practices**:
- Check `isRollingBack` flag before starting rollback
- Throw error if rollback already in progress
- Use try-finally to ensure flag is cleared even on errors
- Document that OperationLog is not thread-safe (single-operation context)

---

### 5. Rollback Progress Reporting

**Decision**: Emit progress events during rollback with per-operation status

**Rationale**:
- **User Feedback**: Users need to see cleanup progress (may take several seconds)
- **Event-Based**: Emit events rather than blocking for spinner updates
  - Caller can attach logger to events
  - Keeps rollback logic decoupled from UI
- **Granularity**: Report per-operation progress (reverting operation X of N)

**Alternatives Considered**:
- **Callback Functions**: Rejected because events provide cleaner interface
- **Silent Rollback**: Rejected because users need feedback for multi-repo operations
- **Detailed Logging**: Rejected as too verbose (just report major steps)

**Best Practices**:
- Emit start event with total operation count
- Emit progress event after each operation reversal
- Emit complete event with final summary
- Include operation details in events (type, target, status)

---

### 6. Log Entry Structure and Validation

**Decision**: Strongly-typed log entries with discriminated union for type-specific data

**Rationale**:
- **TypeScript Discriminated Union**: Each operation type has specific data structure
  ```typescript
  type LogEntry = 
    | { type: 'worktree_created'; data: { repoPath: string; worktreePath: string; branch: string } }
    | { type: 'branch_created'; data: { repoPath: string; branch: string } }
    | { type: 'directory_created'; data: { dirPath: string } }
  ```
- **Compile-Time Safety**: TypeScript ensures correct data for each operation type
- **Runtime Validation**: Validate required fields present before adding to log

**Alternatives Considered**:
- **Generic Object**: Rejected because it loses type safety
- **Separate Classes**: Rejected as over-engineering
- **String-Based Data**: Rejected because it requires parsing and error-prone

**Best Practices**:
- Use TypeScript discriminated unions for log entries
- Validate data completeness before logging
- Include timestamps for audit trail
- Keep data minimal (only what's needed for reversal)

---

## Technology Choices Validated

### TypeScript + Bun
**Best Practices Applied**:
- Use Bun's spawn for git command execution
- Leverage TypeScript strict mode for type safety
- Use built-in path utilities for cross-platform compatibility
- Avoid external dependencies (use Bun APIs only)

### Dependency Coordination
**Best Practices Applied**:
- Import git operations from lib/git.ts (removeWorktree, deleteBranch)
- Import filesystem operations from lib/filesystem.ts (removeDirectory)
- Import logger from lib/logger.ts for optional progress display
- Rollback module is consumed by core/worktree.ts (orchestration layer)

### Testing Strategy
**Best Practices Applied**:
- Unit tests: Mock git and filesystem operations, test log management in isolation
- Integration tests: Use real temporary git repositories and directories
- Test each operation type rollback (worktree, branch, directory)
- Test error scenarios (permission errors, non-existent resources)
- Test concurrent rollback prevention

---

## Implementation Guidance

### Key Rollback Flow

```
1. Check if rollback already in progress (throw if true)
2. Set isRollingBack flag
3. Get operation log entries in reverse order (LIFO)
4. For each entry in reverse:
   a. Emit progress event
   b. Dispatch to type-specific rollback function
   c. Log success or failure
   d. Continue even if operation fails
5. Build rollback result summary
6. Emit complete event
7. Clear isRollingBack flag
8. Return rollback result
```

### Error Handling

- Catch errors during individual operation rollback
- Log error details but continue processing
- Include failed operations in result summary
- Treat non-existent resources as successful rollback

### Performance Considerations

- Rollback is sequential (no parallelization) for safety
- Minimize logging overhead during critical path
- Use efficient array reversal (slice + reverse)
- Avoid I/O during log entry creation

### Testing Strategy

**Unit Tests**:
- OperationLog.add() - verify entry added with timestamp
- OperationLog.rollback() - verify LIFO processing order
- Each operation type rollback function - mock git/fs calls
- Concurrent rollback prevention - verify error thrown
- Empty log rollback - verify no-op behavior

**Integration Tests**:
- Create real worktree, log it, rollback, verify removed
- Create real branch, log it, rollback, verify deleted
- Create real directory, log it, rollback, verify removed
- Simulate permission error, verify rollback continues
- Mixed operation types, verify correct reversal order

---

## Conclusion

All technical decisions are resolved. No unknowns remain. Ready to proceed to Phase 1: Design (data model, contracts, quickstart).
