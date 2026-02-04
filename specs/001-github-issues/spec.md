# Feature Specification: Hook System

**Feature Branch**: `001-github-issues`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "GitHub issues 19"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Execute Custom Scripts at Lifecycle Points (Priority: P1)

A developer wants to run custom validation, formatting, or notification scripts automatically when arashi commands execute (e.g., before creating a worktree, after switching branches). The hook system allows them to place executable shell scripts in `.arashi/hooks/` directory, and arashi will discover and execute them at appropriate lifecycle points without manual intervention.

**Why this priority**: This is the core value of the hook system - enabling automation and extensibility. Without this, users cannot customize arashi's behavior or integrate with their workflows.

**Independent Test**: Can be fully tested by placing a test hook script in `.arashi/hooks/`, running an arashi command that triggers that hook, and verifying the script executes with correct environment variables. Delivers immediate value by enabling basic workflow automation.

**Acceptance Scenarios**:

1. **Given** a repository with `.arashi/hooks/pre-worktree.sh` that is executable, **When** user runs a command that triggers the pre-worktree hook, **Then** the hook script executes before the worktree is created
2. **Given** a hook script that writes to stdout/stderr, **When** the hook executes, **Then** all output is displayed to the user with the hook name as a prefix
3. **Given** a hook script that sets exit code 0, **When** the hook completes, **Then** the arashi command continues normally
4. **Given** no hook file exists for a lifecycle point, **When** the command reaches that lifecycle point, **Then** arashi continues without error

---

### User Story 2 - Skip Hooks When Needed (Priority: P2)

A developer is debugging an issue or needs to run a command quickly without triggering their configured hooks. They can pass a `--no-hooks` flag to any arashi command to bypass hook execution entirely.

**Why this priority**: This provides an escape hatch for users when hooks are causing problems or when speed is critical. Essential for usability but secondary to core hook functionality.

**Independent Test**: Can be tested by placing a hook that would normally execute, running a command with `--no-hooks` flag, and verifying the hook is skipped. Delivers value by preventing hook-induced blockers.

**Acceptance Scenarios**:

1. **Given** a repository with configured hooks and user runs command with `--no-hooks`, **When** command executes, **Then** no hooks are executed
2. **Given** `--no-hooks` flag is used, **When** command completes, **Then** all functionality works normally except hook execution

---

### User Story 3 - Understand Hook Context (Priority: P3)

A developer writing a hook script needs access to information about the current operation (e.g., branch name, worktree path, repository path). The hook system provides this information through environment variables that the script can read.

**Why this priority**: This enhances hook capabilities but isn't required for basic hook functionality. Hooks can still provide value with minimal context.

**Independent Test**: Can be tested by creating a hook that echoes environment variables and verifying they contain expected values. Delivers value by enabling context-aware hooks.

**Acceptance Scenarios**:

1. **Given** a hook script that reads environment variables, **When** the hook executes, **Then** relevant context information is available (repository path, hook name, etc.)
2. **Given** multiple hooks execute in sequence, **When** each hook runs, **Then** each receives appropriate context for its lifecycle point

---

### User Story 4 - Handle Hook Failures Gracefully (Priority: P1)

A developer's hook script encounters an error (network timeout, validation failure, etc.) and exits with a non-zero code. The arashi command logs the error clearly but continues execution rather than blocking the user's workflow.

**Why this priority**: Critical for reliability - hooks should enhance workflows, not break them. Users need confidence that a misbehaving hook won't prevent their work.

**Independent Test**: Can be tested by creating a hook that exits with code 1, running the triggering command, and verifying the command completes with a logged warning. Delivers value by ensuring system resilience.

**Acceptance Scenarios**:

1. **Given** a hook script exits with non-zero code, **When** hook execution completes, **Then** arashi logs the failure but continues the command
2. **Given** a hook script hangs indefinitely, **When** the timeout period (5 minutes default) expires, **Then** arashi terminates the hook and logs a timeout error but continues
3. **Given** a hook file exists but is not executable, **When** arashi validates the hook, **Then** a clear error is logged and the hook is skipped

---

### Edge Cases

- What happens when a hook script is not executable (missing execute permissions)?
  - System validates permissions before execution, logs a clear error, and skips the hook (non-fatal)
- What happens when a hook script takes too long to complete?
  - System enforces a 5-minute default timeout (configurable), terminates the hook process, logs timeout error, and continues
- What happens when `.arashi/hooks/` directory doesn't exist?
  - System continues normally without attempting hook execution (no error)
- What happens when hook script output is extremely large?
  - Output is streamed in real-time with hook name prefix, allowing users to cancel if needed
- What happens when multiple hooks fail in sequence?
  - Each failure is logged independently, all hooks attempt to run, command continues after all hooks complete
- What happens when user lacks permissions to execute hooks?
  - Validation detects permission issues, logs clear error, skips affected hooks (non-fatal)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST discover hook scripts by looking for files in `.arashi/hooks/{hookName}.sh` where hookName matches a defined lifecycle point
- **FR-002**: System MUST validate that hook scripts have execute permissions before attempting to run them
- **FR-003**: System MUST execute hook scripts as separate processes using the system shell
- **FR-004**: System MUST provide context information to hooks through environment variables (repository path, hook name, and lifecycle-specific data)
- **FR-005**: System MUST stream hook output (stdout and stderr) to the user in real-time with the hook name as a prefix for each line
- **FR-006**: System MUST enforce a timeout for hook execution with a 5-minute default that can be configured per-repository
- **FR-007**: System MUST treat hook failures (non-zero exit codes) as non-fatal and log errors but continue command execution
- **FR-008**: System MUST skip all hook execution when `--no-hooks` flag is provided to any command
- **FR-009**: System MUST handle missing hook files gracefully without throwing errors
- **FR-010**: System MUST handle missing `.arashi/hooks/` directory gracefully without throwing errors
- **FR-011**: System MUST log clear error messages for common hook issues (permission denied, timeout, execution failure)
- **FR-012**: System MUST terminate long-running hook processes when timeout is reached and log timeout errors

### Key Entities

- **Hook**: A shell script file located in `.arashi/hooks/` with a name matching a lifecycle point (e.g., `pre-worktree.sh`). Contains executable commands that run automatically at defined points in arashi's execution.
- **Hook Context**: Information provided to hooks via environment variables, including repository path, hook name, and operation-specific data (e.g., target branch, worktree path).
- **Lifecycle Point**: A named stage in arashi's execution where hooks can be triggered (e.g., pre-worktree, post-worktree, pre-branch-switch).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can place an executable shell script in `.arashi/hooks/` and see it execute automatically when the corresponding lifecycle event occurs
- **SC-002**: Hook scripts receive accurate context information through environment variables 100% of the time
- **SC-003**: Failed hooks (non-zero exit) never block command execution - arashi continues and logs the error
- **SC-004**: Hook execution never exceeds configured timeout (5 minutes default), with processes terminated and errors logged when timeout is reached
- **SC-005**: Users can bypass all hook execution using `--no-hooks` flag on any command
- **SC-006**: Hook validation catches permission issues before execution and provides clear error messages
- **SC-007**: System handles missing hooks, missing hook directories, and invalid hook files without throwing errors or stopping execution

## Assumptions

1. **Shell Environment**: Hooks will run in the user's default shell environment with access to standard system utilities
2. **Hook Naming Convention**: Hook files use `.sh` extension and follow kebab-case naming (e.g., `pre-worktree.sh`, not `preWorktree.sh` or `pre_worktree.sh`)
3. **Single Hook Per Lifecycle**: Only one hook file per lifecycle point is supported (no hook chaining or priority ordering within a lifecycle point)
4. **Synchronous Execution**: Hooks run synchronously and block command execution until completion or timeout
5. **Timeout Configuration**: Timeout can be configured through arashi's configuration system (details to be defined in implementation)
6. **Error Handling Philosophy**: Hooks are enhancements, not requirements - their failure should never prevent core arashi functionality
7. **Security Model**: Users are responsible for the security of their hook scripts - arashi does not sandbox or restrict hook capabilities
8. **Output Handling**: Hook output is displayed in real-time; no buffering or post-processing of output streams
