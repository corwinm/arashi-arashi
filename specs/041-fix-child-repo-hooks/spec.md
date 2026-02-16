# Feature Specification: Run Hooks from Child Repo Create

**Feature Branch**: `041-fix-child-repo-hooks`  
**Created**: 2026-02-15  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/96"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic setup from child repos (Priority: P1)

As a developer working inside a managed child repository, I can run `arashi create <name>` and have post-create hooks run automatically, so the new worktree is ready without manual setup.

**Why this priority**: This is the reported broken path and directly blocks expected day-to-day workflow by forcing manual setup.

**Independent Test**: From within a child repository, run `arashi create <name>` in a workspace with configured post-create hooks; verify each targeted repository reports hook execution and expected setup outcomes are present.

**Acceptance Scenarios**:

1. **Given** a workspace with post-create hooks configured and the user is in a child repository, **When** the user runs `arashi create feature-x`, **Then** post-create hooks run for each targeted repository and are reported as completed.
2. **Given** a workspace with a dependency-install hook configured, **When** `arashi create feature-x` is run from a child repository, **Then** the created worktree is immediately usable without manual dependency installation.

---

### User Story 2 - Actionable hook failure feedback (Priority: P2)

As a developer, I can see clear per-repository hook outcomes when a hook fails, so I know exactly what to fix instead of guessing why setup is incomplete.

**Why this priority**: Restoring hook execution is primary; clear diagnostics is next because it reduces recovery time when hooks fail for valid reasons.

**Independent Test**: Configure one hook to fail intentionally, run `arashi create <name>` from a child repository, and verify output identifies the affected repository and recommended next step.

**Acceptance Scenarios**:

1. **Given** one repository hook fails during create, **When** the command finishes, **Then** the output includes repository name, failed hook, and an actionable recovery message.
2. **Given** multiple repositories are processed, **When** create completes, **Then** each repository has an explicit hook status of success, failure, or skipped.

---

### User Story 3 - Consistent behavior across invocation locations (Priority: P3)

As a workspace maintainer, I get the same create-and-hook behavior whether the command is started at workspace root or inside any managed repository path.

**Why this priority**: Consistency lowers training and support burden, but it depends on fixing core hook execution first.

**Independent Test**: Run `arashi create <name>` once from workspace root and once from a child repository in identical setup; compare hook result sets and confirm they match.

**Acceptance Scenarios**:

1. **Given** identical workspace configuration, **When** create is run from root and from a child repository, **Then** both runs execute the same repository hooks with equivalent outcomes.

### Edge Cases

- User runs create from a nested subdirectory inside a managed child repository instead of that repository root.
- A targeted repository has no post-create hook configured.
- One repository hook fails while others succeed in the same create operation.
- A hook exceeds its configured timeout.
- User starts create from a directory that is not part of any managed workspace repository.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST detect workspace context when `arashi create` is invoked from any path inside a managed repository, including child repositories.
- **FR-002**: The system MUST execute configured post-create hooks for every repository targeted by the create operation, regardless of invocation location.
- **FR-003**: The system MUST apply the same hook selection and execution order that is used when create is invoked from workspace root.
- **FR-004**: The system MUST record and display per-repository hook outcomes as `success`, `failure`, or `skipped` before command completion.
- **FR-005**: If a hook fails or times out, the system MUST show which repository was affected and provide at least one actionable recovery step.
- **FR-006**: If no post-create hook is configured for a targeted repository, the system MUST mark that repository as `skipped` and continue processing remaining repositories.
- **FR-007**: The system MUST ensure each applicable post-create hook runs at most once per repository for a single create invocation.
- **FR-008**: The system MUST keep create behavior functionally consistent between workspace-root and child-repository invocation for the same workspace configuration.

### Key Entities *(include if feature involves data)*

- **Create Invocation Context**: The command start location, target feature name, and resolved workspace scope used to determine which repositories participate.
- **Repository Hook Definition**: A repository-specific post-create automation rule and execution policy (including optional timeout behavior).
- **Hook Execution Result**: The per-repository outcome record containing status, completion state, and user-visible message.
- **Create Operation Summary**: The final user-facing report of repository outcomes for the invocation.

### Assumptions & Dependencies

- Workspaces already contain valid repository registrations and hook definitions where automation is expected.
- Existing post-create hook semantics remain unchanged except for invocation-location parity.
- Repository setup requirements (for example dependency installation) are represented through existing hooks rather than manual-only steps.

### Scope Boundaries

- In scope: post-create hook execution parity for `arashi create` when invoked from child repositories.
- Out of scope: introducing new hook types, changing hook authoring format, or redesigning hook timeout policy.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation runs, 100% of `arashi create` executions started from managed child repositories trigger hook evaluation for all targeted repositories.
- **SC-002**: In at least 95% of create runs with valid setup hooks, developers can begin work in the created worktree without performing manual setup actions.
- **SC-003**: 100% of hook failures and timeouts during create provide repository-specific, actionable recovery guidance in command output.
- **SC-004**: Root-invoked and child-invoked create runs produce matching repository hook outcome sets for the same workspace configuration.
