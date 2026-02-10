# Data Model: Fix create command in bare repositories

## Entities

### Invocation Context

- **Represents**: Where and how the user invoked the create command.
- **Fields**:
  - **Invocation Path**: Absolute path where command started.
  - **Repository Type**: Bare or non-bare classification.
  - **Workspace Root**: Resolved workspace base path used for config and repository resolution.
  - **Execution Path**: Effective path used to run create orchestration.
- **Validation Rules**:
  - Invocation Path and Execution Path must be absolute and non-empty.
  - Repository Type must be one of: bare, non-bare.
  - Execution Path must resolve to a valid git working context before orchestration begins.

### Workspace Configuration Source

- **Represents**: How configuration is located for the current invocation.
- **Fields**:
  - **Source Type**: Local-file or repository-content.
  - **Config Path**: Canonical config location (`.arashi/config.json`).
  - **Resolution Status**: Resolved or missing.
  - **Failure Reason**: Human-readable reason when unresolved.
- **Validation Rules**:
  - Source Type is required and must be explicit.
  - Resolution Status must be resolved before repository discovery starts.
  - Missing configuration must include a corrective guidance message.

### Create Request

- **Represents**: User-supplied request for coordinated worktree creation.
- **Fields**:
  - **Branch Name**: Requested branch/worktree name.
  - **Repository Selection Mode**: All, explicit list, or interactive selection.
  - **Behavior Flags**: Hook execution, progress visibility, dry-run, conflict strategy.
- **Validation Rules**:
  - Branch Name must satisfy existing branch naming rules.
  - Explicit repository selections must map to configured repositories.

### Create Execution Outcome

- **Represents**: Final command result after context resolution and orchestration.
- **Fields**:
  - **Outcome Type**: Success, validation failure, or execution failure.
  - **Created Worktrees**: List of repository/path pairs on success.
  - **Conflict Details**: Any name/path conflicts detected.
  - **Rollback Applied**: Whether rollback executed.
  - **User Guidance**: Actionable next-step message on failure.
- **Validation Rules**:
  - Success outcomes must include at least one created worktree or an explicit no-op reason.
  - Failures must include non-empty user guidance.
  - Rollback Applied must be true when a partially completed operation fails.

## Relationships

- One **Invocation Context** resolves one **Workspace Configuration Source**.
- One **Create Request** executes within one **Invocation Context**.
- One **Create Request** produces one **Create Execution Outcome**.
- **Create Execution Outcome** may reference multiple created worktree records and conflict records.
