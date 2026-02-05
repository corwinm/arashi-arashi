# Research: Worktree Orchestration

**Feature**: 001-worktree-orchestration
**Date**: 2026-02-04
**Purpose**: Resolve technical unknowns and establish patterns for coordinated worktree creation

## Research Tasks Completed

### 1. Multi-Repository Orchestration Patterns

**Decision**: Use sequential processing with fail-fast behavior and operation logging for rollback

**Rationale**:
- **Sequential vs Parallel**: While parallel worktree creation could improve performance, sequential processing provides:
  - Predictable operation order for hooks that might have side effects
  - Easier error handling and rollback coordination
  - Simpler progress reporting (one repository at a time)
  - Avoids race conditions when multiple hooks write to shared locations
- **Fail-fast**: Stop on first error rather than continuing, because:
  - Partial state across repositories is confusing and potentially harmful
  - Faster feedback to users when errors occur
  - Simpler rollback logic (no need to track which repos succeeded after the failure point)
- **Operation Logging**: Every reversible action logged for rollback capability

**Alternatives Considered**:
- **Parallel execution with barrier synchronization**: Rejected due to complexity in coordinating rollback when multiple repos fail simultaneously
- **Continue-on-error with summary**: Rejected because partial multi-repo state violates atomic consistency requirement
- **Transaction log to file**: Rejected in favor of in-memory operation log for performance (persist only on explicit save/debug mode)

**Best Practices**:
- Log every operation with sufficient context for reversal (operation type, paths, identifiers)
- Use try-finally blocks to ensure rollback is always attempted on error
- Provide detailed error context (which repository, what operation, why it failed)
- Clear progress indicators showing current repository being processed

---

### 2. Branch Conflict Detection Strategy

**Decision**: Pre-flight check across all repositories before creating any worktrees, present consolidated conflict dialog

**Rationale**:
- **Pre-flight vs On-the-fly**: Check all repositories upfront rather than during creation because:
  - Users see all conflicts at once and make one decision for the entire operation
  - Avoids partial worktree creation followed by conflict discovery
  - No rollback needed for conflict detection (operation never starts)
- **Consolidated Dialog**: Single prompt showing all conflicting repositories, not one prompt per repository
- **Check Strategy**: Use `git branch --list <branch-name>` for local branches and `git ls-remote` for remote tracking

**Alternatives Considered**:
- **On-the-fly detection**: Rejected because it requires rollback when conflict discovered mid-operation
- **Per-repository prompts**: Rejected because it's tedious for users (imagine 10 conflicting repos = 10 prompts)
- **Ignore conflicts and fail**: Rejected because branch creation failure would trigger unnecessary rollback

**Best Practices**:
- Check both local and remote branches for comprehensive conflict detection
- Present conflict resolution options: abort (default), reuse existing branches, create alternate name (e.g., feature-123-1)
- Show which repositories have conflicts in the dialog for user awareness
- Cache conflict check results to avoid re-checking during actual operation

---

### 3. Repository Filtering Implementation

**Decision**: Three-mode filtering system with command-line flag, interactive selection, and default all-repos behavior

**Rationale**:
- **Command-line flag (`--only repo1,repo2`)**: For scripting and quick filtering in CI/automation
- **Interactive selection**: Use checkbox prompt from 007-prompt-utilities for manual selection, enabled via `--interactive` flag
- **Default all-repos**: When no filter specified, process all configured repositories
- **Filtering happens after conflict detection**: Filter applies to the set of repositories without conflicts

**Alternatives Considered**:
- **Regex filtering**: Rejected as overcomplication for typical use case (explicit names are clearer)
- **Tag-based filtering**: Rejected as requiring additional configuration metadata
- **Interactive-first**: Rejected because command-line flags are better for automation

**Best Practices**:
- Validate repository names in `--only` flag against configured repositories (fail early if unknown name)
- Interactive mode shows repository names with additional context (path, current branch)
- Allow combining filters (e.g., `--only` with `--interactive` narrows the interactive list)
- Display filtered repository list before starting operation for user confirmation

---

### 4. Progress Tracking Implementation

**Decision**: Use spinner per repository with success/failure state, plus operation summary at completion

**Rationale**:
- **Spinner library**: Use 006-logger-utilities spinner implementation (chalk + ora)
- **One spinner per repository**: Start spinner when beginning repository processing, update to success/failure when done
- **Status persistence**: Keep previous repository statuses visible while processing current repository
- **Summary output**: After all repositories processed (or after rollback), show summary table with per-repo results

**Alternatives Considered**:
- **Progress bar**: Rejected because repository processing time is unpredictable (can't show accurate percentage)
- **Single spinner for all**: Rejected because it doesn't show which repository is currently processing
- **Silent operation**: Rejected because it violates user-centric interface principle

**Best Practices**:
- Spinner text format: "Creating worktree in <repo-name>..."
- Success state: Green checkmark + "Created worktree in <repo-name> at <path>"
- Failure state: Red X + "Failed in <repo-name>: <error-message>"
- Include timing information in summary (total time, per-repo time if helpful for debugging)

---

### 5. Hook Integration Points

**Decision**: Execute hooks synchronously at specific lifecycle points with timeout enforcement and error handling

**Rationale**:
- **Hook execution order**:
  1. Pre-create hook: Before any git operations in the repository
  2. Worktree creation: Create worktree and branch
  3. Post-create hook: After worktree successfully created
- **Synchronous execution**: Hooks run sequentially, blocking operation until complete (or timeout)
- **Timeout enforcement**: Read timeout from configuration (default: 60 seconds), terminate hung hooks
- **Failure handling**: Pre-create hook failure aborts worktree creation for that repo and triggers rollback; post-create hook failure logs warning but doesn't rollback (worktree already created)

**Alternatives Considered**:
- **Async hooks**: Rejected because coordination complexity and potential for race conditions
- **Post-create failure triggers rollback**: Rejected because worktree is already functional, user might want it despite hook failure
- **No timeout**: Rejected because hung hooks would block indefinitely

**Best Practices**:
- Pass hook context via environment variables: `ARASHI_BRANCH`, `ARASHI_REPO_PATH`, `ARASHI_WORKTREE_PATH`, `ARASHI_REPO_NAME`
- Capture hook stdout/stderr and include in error messages if hook fails
- Check hook file execute permissions before attempting to run
- Respect `--no-hooks` flag to bypass hook execution entirely
- Log hook execution in operation log (for audit trail, not for rollback)

---

### 6. Error Handling Strategy

**Decision**: Structured error types with repository context, automatic rollback on any failure, detailed error reporting

**Rationale**:
- **Error Types**: Define specific error types for different failure modes:
  - `RepositoryValidationError`: Repository doesn't exist or isn't a valid git repo
  - `BranchConflictError`: Branch name already exists (should be caught in pre-flight, but defensive check)
  - `GitOperationError`: Git command failed (worktree creation, branch creation)
  - `HookExecutionError`: Hook failed or timed out
  - `InsufficientPermissionsError`: User lacks write permissions
- **Context Preservation**: Every error includes repository name, operation type, original error message
- **Rollback Trigger**: Any error during processing triggers immediate rollback of completed operations
- **User Communication**: Error messages formatted with color, clear explanation, and suggested remediation when possible

**Alternatives Considered**:
- **Generic errors**: Rejected because debugging is difficult without specific error types
- **Continue on error**: Rejected because it violates atomic consistency requirement
- **Silent rollback**: Rejected because users need to know what failed and that cleanup occurred

**Best Practices**:
- Use TypeScript union types for error handling: `Result<T, E>` pattern or throw specific error classes
- Include original error stack traces in debug mode for troubleshooting
- Suggest remediation in error messages: "Check that you have write permissions to <path>" or "Ensure repository at <path> is a valid git repository"
- Log full error details even when showing simplified message to user

---

### 7. Operation Log Structure

**Decision**: Use operation log from 001-rollback-mechanism with strongly-typed log entries for each reversible action

**Rationale**:
- **Log Entry Types** (defined in 001-rollback-mechanism):
  - `worktree_created`: Repository path, worktree path, branch name
  - `branch_created`: Repository path, branch name (for branches created without worktrees)
  - `directory_created`: Directory path (for worktree directories)
- **Log Ordering**: Operations logged in chronological order, rollback processes in reverse order (LIFO)
- **Rollback Ownership**: The rollback mechanism (001-rollback-mechanism) handles reversal logic, orchestration layer just logs operations

**Alternatives Considered**:
- **Manual rollback in orchestration layer**: Rejected because rollback logic should be centralized and reusable
- **No-op for directories**: Rejected because worktree directories should be cleaned up on rollback
- **Git reflog for rollback**: Rejected because it doesn't handle filesystem cleanup (directories)

**Best Practices**:
- Log operation immediately after successful completion (not before attempt)
- Include all information needed for reversal (no dependency on external state for rollback)
- Ensure log entries are serializable for potential future persistence
- Test rollback for each operation type thoroughly

---

## Technology Choices Validated

### TypeScript + Bun
**Best Practices Applied**:
- Use Bun's built-in APIs for process spawning (`Bun.spawn`) instead of Node.js `child_process`
- Leverage Bun's fast startup time for CLI responsiveness
- Use TypeScript strict mode for type safety in orchestration logic
- Avoid external dependencies where Bun provides equivalent functionality

### Dependency Coordination
**Best Practices Applied**:
- Import utilities from lib layer (git, config, logger, prompts, filesystem, hooks)
- Import core components (rollback, repository) for cross-cutting functionality
- Use TypeScript interfaces for contracts between layers
- Ensure all dependencies support cross-platform operation

### Testing Strategy
**Best Practices Applied**:
- Unit tests: Mock all dependencies (git operations, rollback, prompts, logger) to test orchestration logic in isolation
- Integration tests: Use temporary git repositories created in test fixtures
- Test fixtures: Script to create multi-repo test workspaces with various configurations
- Edge case coverage: Test conflict scenarios, hook failures, permission errors, disk space issues

---

## Implementation Guidance

### Key Orchestration Flow

```
1. Validate inputs (branch name, repository filter)
2. Discover/load repositories (via 001-repository-management)
3. Apply repository filter (all/explicit/interactive)
4. Pre-flight: Check for branch conflicts in filtered repositories
5. Handle conflicts: Prompt user for resolution or abort
6. Initialize operation log (via 001-rollback-mechanism)
7. For each repository (sequential):
   a. Start progress spinner
   b. Execute pre-create hook (if configured)
   c. Create branch from default branch
   d. Log branch creation
   e. Create worktree for branch
   f. Log worktree creation
   g. Execute post-create hook (if configured)
   h. Update spinner to success
8. Return detailed results (created paths, warnings)

Error Handling (at any step 7a-7g):
- Stop processing remaining repositories
- Trigger rollback via operation log
- Report error with repository context
- Exit with non-zero status
```

### Performance Considerations

- **Parallel Opportunities**: Branch conflict detection can be parallelized (read-only operation, no side effects)
- **Sequential Requirements**: Worktree creation must be sequential to coordinate hooks and rollback
- **Optimization**: Cache repository metadata (default branch) from 001-repository-management to avoid repeated git calls
- **Lazy Loading**: Only load/validate repositories after filter is applied (don't process repositories that will be excluded)

### Testing Strategy

**Unit Tests** (`tests/unit/core/worktree.test.ts`):
- Repository filtering logic (all/explicit/interactive)
- Branch conflict detection with mocked git responses
- Error handling for each failure mode
- Operation log integration

**Integration Tests** (`tests/integration/worktree-integration.test.ts`):
- Full orchestration flow with real temporary git repositories
- Multi-repo worktree creation success case
- Rollback on failure (simulate failure in 3rd repo, verify first 2 are cleaned up)
- Hook execution with test hook scripts
- Conflict resolution scenarios

---

## Conclusion

All technical decisions are resolved. No unknowns remain. Ready to proceed to Phase 1: Design (data model, contracts, quickstart).
