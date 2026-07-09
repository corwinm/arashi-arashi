## ADDED Requirements

### Requirement: Display workspace repository health
The VS Code worktree panel SHALL display workspace repository health backed by `arashi status --json`, including each configured repository's name, branch, tracking branch when available, clean or dirty state, and ahead/behind relationship when available.

#### Scenario: Healthy repositories are visible
- **WHEN** the panel refreshes in an Arashi workspace whose `arashi status --json` output reports clean repositories on tracked branches
- **THEN** the panel displays those repositories as healthy with branch and tracking context

#### Scenario: Dirty repositories are highlighted
- **WHEN** the panel refreshes and `arashi status --json` reports one or more changed files for a repository
- **THEN** the panel highlights that repository as dirty and includes a concise changed-file count

#### Scenario: Branch drift is highlighted
- **WHEN** the panel refreshes and `arashi status --json` reports a repository ahead, behind, or both relative to its tracking branch
- **THEN** the panel highlights the ahead, behind, or diverged state with the relevant counts

#### Scenario: Repository status errors are highlighted
- **WHEN** the panel refreshes and `arashi status --json` reports an error for a configured repository
- **THEN** the panel displays the repository as unhealthy with actionable error context rather than hiding it

### Requirement: Provide safe dashboard recovery actions
The VS Code worktree panel SHALL provide contextual actions for common workspace-status recovery operations and SHALL only expose destructive operations behind explicit confirmation.

#### Scenario: Repository navigation actions are available
- **WHEN** a repository status row is visible in the panel
- **THEN** the user can open that repository or open an integrated terminal for that repository without running a separate command-palette flow

#### Scenario: Pull action is available for branch drift
- **WHEN** a repository status row is behind its tracking branch or diverged from it
- **THEN** the panel offers a pull action that uses the existing Arashi pull flow and refreshes the panel after completion

#### Scenario: Missing repository recovery is available
- **WHEN** a repository status row represents a missing configured repository or a status error that indicates cloning is needed
- **THEN** the panel offers a clone/recover action that invokes the existing Arashi clone flow and refreshes the panel after completion

#### Scenario: Prune remains confirmation guarded
- **WHEN** stale or prunable metadata is surfaced through the dashboard or the existing prune flow
- **THEN** applying prune requires explicit native confirmation before mutation while previewing prune remains non-destructive

### Requirement: Handle unsupported status JSON gracefully
The VS Code worktree panel SHALL handle unsupported CLI versions, command failures, and unexpected `arashi status --json` response shapes without crashing or clearing useful last-known panel state unnecessarily.

#### Scenario: Status JSON parse fails after prior success
- **WHEN** the panel has previously loaded valid workspace data and a later status refresh returns invalid JSON
- **THEN** the panel preserves last-known data when possible and shows a warning banner with diagnostic guidance

#### Scenario: Status JSON is unavailable
- **WHEN** the configured Arashi CLI does not support the expected `status --json` contract
- **THEN** the panel shows actionable guidance to upgrade or inspect the Arashi output channel while preserving existing worktree panel behavior when possible

### Requirement: Document the dashboard workflow
The extension documentation SHALL describe the workspace status dashboard workflow, including representative healthy, dirty, branch-drift, missing/error, and recovery-action states.

#### Scenario: User reads extension guidance
- **WHEN** a user reads the extension README or equivalent extension guidance
- **THEN** they can understand where to find the dashboard, what the status indicators mean, and which actions are safe recovery shortcuts
