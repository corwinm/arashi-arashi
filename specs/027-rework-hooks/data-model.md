# Data Model: Rework Hooks

## Entities

### Hook Script

- **Purpose**: Represents a user-provided script tied to a hook lifecycle point.
- **Fields**:
  - **name**: Hook name (e.g., `pre-create`, `post-create`, `pre-create.<repo>`, `post-create.<repo>`)
  - **scope**: `global` or `repo-specific`
  - **repoName**: Child repo name when scope is `repo-specific`
  - **path**: File path to the script
  - **enabled**: Boolean indicating whether the script exists and is runnable
- **Validation Rules**:
  - Only one script per hook name is recognized.
  - Repo-specific hook names must include a child repo name.

### Hook Execution

- **Purpose**: Captures a single invocation of a hook script during a create operation.
- **Fields**:
  - **hookName**: Associated Hook Script name
  - **scope**: `global` or `repo-specific`
  - **repoContextId**: Reference to Repository Context
  - **status**: `pending`, `running`, `succeeded`, `failed`, `skipped`
  - **startedAt**: Timestamp of start
  - **finishedAt**: Timestamp of completion
  - **exitCode**: Optional exit code on completion
  - **message**: Optional error or warning message
- **Validation Rules**:
  - Global post-create runs at most once per create operation.
  - Repo-specific hooks must run in the child worktree context.

### Repository Context

- **Purpose**: Provides the working context for a hook execution.
- **Fields**:
  - **mainRepoPath**: Path to the main repository
  - **parentRepoPath**: Path to the parent repository
  - **childRepoName**: Name of the child repo (if applicable)
  - **childWorktreePath**: Path to the child repo worktree
- **Validation Rules**:
  - Repo-specific hooks require `childRepoName` and `childWorktreePath`.

## Relationships

- **Hook Script** 1..1 → **Hook Execution** 0..N
- **Repository Context** 1..1 → **Hook Execution** 0..N

## State Transitions

- **Hook Execution**: `pending` → `running` → `succeeded` | `failed`
- **Hook Execution**: `pending` → `skipped` when a hook is missing
