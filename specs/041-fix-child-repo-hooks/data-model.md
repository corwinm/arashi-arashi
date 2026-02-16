# Data Model: Fix child-repo create hook execution

## Entities

### Create Invocation Context

- **Represents**: The normalized command invocation state used to resolve workspace behavior.
- **Fields**:
  - **invocationPath**: Absolute path where `arashi create` is launched.
  - **workspaceRoot**: Canonical workspace root used for config and hooks.
  - **executionPath**: Path used for repository discovery and create orchestration.
  - **repositoryContextType**: Classification of invocation location (workspace root, managed child repository, nested path in managed repository, unmanaged path).
- **Validation Rules**:
  - `invocationPath`, `workspaceRoot`, and `executionPath` are required absolute paths.
  - `executionPath` must belong to the resolved workspace for managed invocations.
  - Unmanaged paths must produce explicit validation failure with recovery guidance.

### Repository Hook Definition

- **Represents**: A hook assignment that may apply to a repository during create.
- **Fields**:
  - **repositoryId**: Stable repository identifier from workspace config.
  - **hookName**: Lifecycle hook identifier executed in create flow.
  - **hookLookupRoot**: Root directory used to discover hook scripts.
  - **timeoutPolicy**: Effective timeout behavior for execution.
  - **isConfigured**: Whether the hook exists for the repository context.
- **Validation Rules**:
  - `repositoryId` and `hookName` are required.
  - `hookLookupRoot` must resolve from canonical workspace context, not arbitrary current directory.
  - Missing hooks must map to `isConfigured = false` and can only transition to `skipped` result.

### Hook Execution Result

- **Represents**: Outcome of a single repository hook evaluation in one create run.
- **Fields**:
  - **repositoryId**: Repository where hook was evaluated.
  - **hookName**: Hook identifier.
  - **status**: `success`, `failure`, or `skipped`.
  - **reasonCode**: Machine-readable reason (`not_found`, `disabled`, `timeout`, `exit_non_zero`, `not_applicable`).
  - **message**: User-facing explanation and suggested recovery action.
  - **durationMs**: Execution duration when hook run starts.
- **Validation Rules**:
  - Every targeted repository must have exactly one terminal result per applicable hook.
  - `failure` and `skipped` statuses require non-empty `reasonCode` and `message`.
  - `durationMs` must be non-negative when present.

### Create Operation Summary

- **Represents**: User-visible aggregate outcome for the create request.
- **Fields**:
  - **branchName**: Requested create branch/worktree name.
  - **overallOutcome**: `success` or `failure`.
  - **repositoryResults**: Collection of per-repository hook and worktree outcomes.
  - **rollbackApplied**: Whether rollback was executed.
  - **nextSteps**: Actionable instructions for failures.
- **Validation Rules**:
  - `overallOutcome = failure` must include at least one failing repository result and actionable `nextSteps`.
  - `rollbackApplied` must be true when operation fails after partial create progress.
  - `repositoryResults` must cover all repositories selected for the create run.

## Relationships

- One **Create Invocation Context** produces one create operation scope.
- One create operation scope references many **Repository Hook Definition** entries.
- Each **Repository Hook Definition** yields one **Hook Execution Result** per create run.
- One create run outputs one **Create Operation Summary** containing all **Hook Execution Result** records.

## State Transitions

- **Hook Execution Result**: `pending -> success | failure | skipped`
- **Create Operation Summary**: `running -> success | failure`
