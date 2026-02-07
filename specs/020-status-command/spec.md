# Feature Specification: Status Command

**Feature Branch**: `020-status-command`  
**Created**: 2026-02-07  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/26"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Check Repository Status at a Glance (Priority: P1)

As a developer using arashi to manage multiple worktrees, I want to quickly see the status of all my repositories so I can understand which ones have uncommitted changes or need attention.

**Why this priority**: This is the core value of the status command - providing immediate visibility into the state of all managed repositories. Without this, users would need to manually check each repository individually.

**Independent Test**: Can be fully tested by running `arashi status` in a workspace with multiple repositories and verifying it displays the status of each repository with visual indicators (colors, symbols) for clean vs. dirty states.

**Acceptance Scenarios**:

1. **Given** I am in a workspace with 3 repositories (2 clean, 1 with uncommitted changes), **When** I run `arashi status`, **Then** I see a summary listing all 3 repositories with green indicators for clean repos and yellow indicators for the dirty repo
2. **Given** I am in a workspace with all repositories in clean state, **When** I run `arashi status`, **Then** I see all repositories marked as clean with green indicators and a summary showing "3/3 clean"
3. **Given** I am in a workspace root directory, **When** I run `arashi status`, **Then** I see status for the main repository and all sub-repositories

---

### User Story 2 - View Detailed Status Information (Priority: P2)

As a developer, I want to see detailed git status information for each repository so I can understand exactly what changes exist (staged, unstaged, untracked files, branch ahead/behind status).

**Why this priority**: While the summary view (P1) provides quick visibility, developers often need detailed information to make decisions about what actions to take next.

**Independent Test**: Can be tested by running `arashi status --verbose` in a workspace and verifying it shows full git status output for each repository including staged/unstaged changes, untracked files, and branch tracking information.

**Acceptance Scenarios**:

1. **Given** I am in a workspace with repositories having various changes, **When** I run `arashi status --verbose`, **Then** I see complete git status output for each repository showing staged files, unstaged files, untracked files, and branch tracking status
2. **Given** a repository is ahead of its remote by 2 commits, **When** I run `arashi status --verbose`, **Then** I see "Your branch is ahead of 'origin/main' by 2 commits" in the output
3. **Given** a repository has both staged and unstaged changes, **When** I run `arashi status --verbose`, **Then** I see both categories of changes clearly listed

---

### User Story 3 - View Compact Status Summary (Priority: P3)

As a developer working with many repositories, I want a one-line summary per repository so I can quickly scan status without scrolling through verbose output.

**Why this priority**: This is a convenience feature for power users managing large numbers of repositories. The default view (P1) already provides reasonable output, making this an optimization rather than a necessity.

**Independent Test**: Can be tested by running `arashi status --short` and verifying each repository is represented by exactly one line showing repository name and essential status indicators.

**Acceptance Scenarios**:

1. **Given** I am in a workspace with 10 repositories, **When** I run `arashi status --short`, **Then** I see exactly 10 lines of output (one per repository) plus a summary line
2. **Given** a repository has uncommitted changes and is ahead by 2 commits, **When** I run `arashi status --short`, **Then** I see a one-line summary like "repo-name: ✗ dirty ↑2"
3. **Given** all repositories are clean, **When** I run `arashi status --short`, **Then** I see one line per repository showing "✓ clean" and a summary showing total clean count

---

### Edge Cases

- What happens when running `arashi status` outside of an arashi-managed workspace?
- What happens when a sub-repository path exists in configuration but the repository is not found on disk?
- What happens when git status command fails for a particular repository (e.g., corrupted git repository)?
- How does the system handle repositories that are in a detached HEAD state?
- What happens when a repository exists but has no remote configured?
- How does the command handle very large numbers of repositories (50+) in terms of performance and output readability?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load workspace configuration to identify all managed repositories
- **FR-002**: System MUST execute git status for the current repository and each configured sub-repository
- **FR-003**: System MUST parse git status output to determine repository state (clean, dirty, ahead, behind, diverged)
- **FR-004**: System MUST display repository status with color-coded indicators (green for clean, yellow for dirty)
- **FR-005**: System MUST display a summary showing total count of clean and dirty repositories
- **FR-006**: System MUST support a verbose mode (`--verbose` or `-v`) that shows full git status output for each repository
- **FR-007**: System MUST support a short mode (`--short` or `-s`) that shows one-line summary per repository
- **FR-008**: System MUST provide clear error messages when run outside an arashi-managed workspace
- **FR-009**: System MUST handle missing repositories gracefully by displaying a warning and continuing to check other repositories
- **FR-010**: System MUST handle git command failures for individual repositories without stopping the entire status check
- **FR-011**: System MUST display branch tracking information (ahead/behind remote) when available
- **FR-012**: System MUST identify staged changes, unstaged changes, and untracked files separately

### Key Entities

- **Workspace**: The root directory containing arashi configuration and managed repositories
- **Repository Status**: State information for a single repository including:
  - Repository path/name
  - Clean/dirty state (any uncommitted changes)
  - Staged changes count
  - Unstaged changes count
  - Untracked files count
  - Branch name
  - Remote tracking status (ahead/behind/diverged)
- **Status Summary**: Aggregate information across all repositories including:
  - Total repository count
  - Clean repository count
  - Dirty repository count

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view status of all managed repositories with a single command execution in under 3 seconds for workspaces with up to 10 repositories
- **SC-002**: Users can distinguish between clean and dirty repositories at a glance through visual indicators (colors)
- **SC-003**: Users can determine the overall health of their workspace through a summary showing clean/dirty counts
- **SC-004**: 95% of status checks complete successfully even when individual repositories have issues (graceful error handling)
- **SC-005**: Users receive actionable error messages when running the command in invalid contexts
- **SC-006**: Users can switch between three output modes (default, verbose, short) to match their current workflow needs

## Assumptions

- Git is installed and available in the system PATH
- Users have appropriate file system permissions to read repository directories
- The workspace configuration file exists and is valid (created by `arashi init`)
- Default output mode (neither verbose nor short) shows moderate detail: repository names, clean/dirty indicators, and basic summary
- Branch tracking information is displayed when a remote is configured, but absence of remote is not treated as an error
- Performance expectations assume local repositories; network operations for remote status checks are not included in this feature
