# Feature Specification: Create Command from Bare Repository

**Feature Branch**: `032-fix-bare-create-command`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/57"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run create from bare repo root (Priority: P1)

As a developer working in a bare repository, I can run the create command from the repository root and it succeeds without requiring me to switch into an existing worktree first.

**Why this priority**: This is the core reported failure and blocks the primary workflow for users who operate from bare repositories.

**Independent Test**: In a bare repository with a valid workspace configuration, run the create command from the bare repo root and verify a new worktree is created successfully.

**Acceptance Scenarios**:

1. **Given** a bare repository with valid workspace configuration, **When** the user runs create from the bare repo root, **Then** the command completes successfully and creates the requested worktree.
2. **Given** the same repository and configuration, **When** the user runs create from a regular worktree directory, **Then** the command behavior and output remain consistent with existing behavior.

---

### User Story 2 - Resolve config in bare repo context (Priority: P2)

As a developer, I can run create in a bare repository even when workspace configuration is not physically present in the bare root filesystem view, as long as that configuration exists in the repository's primary branch content.

**Why this priority**: The current failure is caused by config lookup in the wrong context; resolving configuration correctly is required for the command to work reliably.

**Independent Test**: Use a bare repository where configuration exists in branch content, run create from the bare root, and verify config lookup succeeds without a false "config not found" error.

**Acceptance Scenarios**:

1. **Given** a bare repository where configuration exists in repository content, **When** the user runs create from the bare root, **Then** configuration is discovered and the command proceeds.
2. **Given** a bare repository with no workspace configuration, **When** the user runs create, **Then** the command fails with clear guidance on how to initialize configuration.

---

### User Story 3 - Fail safely with actionable guidance (Priority: P3)

As a developer, if create cannot run from a bare repository due to missing prerequisites, I receive a clear error that explains what is missing and what to do next.

**Why this priority**: Clear recovery steps reduce support burden and let users self-correct quickly when setup is incomplete.

**Independent Test**: In a bare repository with intentionally missing prerequisites, run create and verify the command returns a non-success outcome with actionable recovery instructions.

**Acceptance Scenarios**:

1. **Given** a bare repository where required setup is incomplete, **When** the user runs create, **Then** the command reports the exact missing prerequisite and a concrete next step.

### Edge Cases

- Bare repository has multiple candidate branches and no clear primary branch selection.
- A create request uses a branch/worktree name that already exists.
- Required repository metadata is inaccessible due to permissions or corruption.
- Command is interrupted mid-operation and must avoid leaving partial, unusable artifacts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect when create is executed from a bare repository context.
- **FR-002**: The system MUST resolve workspace configuration for create in bare repository context when configuration exists in repository content.
- **FR-003**: The system MUST execute create operations in a valid repository context that supports worktree operations, regardless of whether invocation started in a bare root or a regular worktree directory.
- **FR-004**: The system MUST preserve existing create command behavior for non-bare invocation paths.
- **FR-005**: The system MUST provide a clear, actionable error when workspace configuration is unavailable, including a concrete next step to resolve it.
- **FR-006**: The system MUST reject create requests that conflict with existing branch or worktree names and explain the conflict.
- **FR-007**: The system MUST avoid leaving partially created worktrees or branch state when create fails.
- **FR-008**: The system MUST present consistent command outcomes for equivalent inputs across supported repository entry points.

### Key Entities *(include if feature involves data)*

- **Repository Context**: The invocation environment for a command (bare root or worktree directory), including repository metadata needed to choose a valid execution path.
- **Workspace Configuration**: User-managed workspace setup data required to validate repositories and create worktrees.
- **Create Request**: User input for creating a new worktree/branch, including requested name and command options.
- **Create Result**: Outcome of a create operation, including success state, created artifacts, or actionable failure details.

## Assumptions

- Users running create from a bare repository intend behavior equivalent to running the same command from a valid worktree.
- Workspace configuration remains the authoritative source for repository setup requirements.
- Existing create naming and validation rules remain unchanged unless explicitly required for bare repository compatibility.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of create attempts from bare repositories with valid setup complete without a false "configuration not found" failure.
- **SC-002**: At least 95% of users can complete a bare-repository create workflow on their first attempt using command output alone.
- **SC-003**: For invalid setup cases, 100% of failures include a specific corrective action that allows a user to retry successfully.
- **SC-004**: Support reports for "create from bare repository" failures decrease by at least 80% within one release cycle after launch.
