# Feature Specification: List Command

**Feature Branch**: `017-list-command`  
**Created**: 2026-02-06  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/28"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Worktree Overview (Priority: P1)

As a developer, I need to quickly view all my active worktrees so I can understand what work is currently in progress across my repositories.

**Why this priority**: This is the core value of the list command - providing visibility into existing worktrees. Without this, users can't effectively manage their workspace.

**Independent Test**: Can be fully tested by creating multiple worktrees and running the list command, which should display all worktrees with their paths, branches, and basic status. This delivers immediate value by answering "what worktrees exist?"

**Acceptance Scenarios**:

1. **Given** a repository with 3 worktrees, **When** I run the list command, **Then** I see all 3 worktrees displayed with their paths and branch names
2. **Given** a repository with no worktrees (only main repository), **When** I run the list command, **Then** I see a clear message indicating no additional worktrees exist
3. **Given** a worktree with uncommitted changes, **When** I run the list command, **Then** I see the worktree marked with a status indicator showing changes exist

---

### User Story 2 - Detailed Sub-Repository Information (Priority: P2)

As a developer working with nested repositories, I need to see detailed information about sub-repositories within each worktree so I can understand the complete state of my nested repository structure.

**Why this priority**: Important for users with complex nested repository setups, but basic listing is more critical for MVP. This adds depth to the information available.

**Independent Test**: Can be tested by creating a worktree with nested sub-repositories and running the list command in verbose mode, which should display detailed sub-repository status. This delivers value by answering "what's inside each worktree?"

**Acceptance Scenarios**:

1. **Given** a worktree containing 2 sub-repositories, **When** I run the list command in verbose mode, **Then** I see each sub-repository's path, branch, and status
2. **Given** a worktree where a sub-repository has uncommitted changes, **When** I run the list command in verbose mode, **Then** the sub-repository is clearly marked as having changes

---

### User Story 3 - Machine-Readable Output for Tool Integration (Priority: P2)

As a developer who uses command-line tools and scripts, I need the list command to output data in a structured format so I can integrate it with tools like fzf, tmux, sesh, and custom scripts.

**Why this priority**: Critical for workflow automation and tool integration, which is explicitly mentioned as a use case (piping to fzf for tmux workspace switching). This transforms the list command from a viewing tool to an automation building block.

**Independent Test**: Can be tested by running the list command with JSON output flag and verifying the output is valid JSON that can be parsed by other tools. Can demonstrate value by piping to jq or fzf to select worktrees. This delivers value by enabling "which worktree should I work in?"

**Acceptance Scenarios**:

1. **Given** multiple worktrees exist, **When** I run the list command with JSON output flag, **Then** I receive valid JSON containing all worktree information
2. **Given** JSON output is enabled, **When** I pipe the output to jq or another JSON processor, **Then** the data can be successfully parsed and filtered
3. **Given** I want to select a worktree interactively, **When** I pipe the list output to fzf, **Then** I can search and select from the available worktrees
4. **Given** I'm using tmux/sesh workflow automation, **When** I pipe the list output to selection tools, **Then** I can programmatically switch to selected worktrees

---

### User Story 4 - Quick Worktree Count (Priority: P3)

As a developer managing many worktrees, I need to see the total count of worktrees so I can quickly assess workspace scale without counting manually.

**Why this priority**: Nice to have for quick overview, but less critical than detailed information. Provides convenience rather than core functionality.

**Independent Test**: Can be tested by creating known number of worktrees and verifying the count is displayed correctly. This delivers value by answering "how many worktrees do I have?"

**Acceptance Scenarios**:

1. **Given** 5 worktrees exist, **When** I run the list command, **Then** I see a summary line stating "5 worktrees found"
2. **Given** no additional worktrees exist, **When** I run the list command, **Then** I see "0 additional worktrees found" or similar message

---

### Edge Cases

- What happens when a worktree directory exists but the worktree has been removed from git's perspective?
- How does the system handle worktrees on unmounted drives or network paths that are temporarily unavailable?
- What happens when sub-repositories are in a detached HEAD state?
- How does the system handle extremely long branch names or paths that might break terminal display?
- What happens when running the list command from outside a git repository?
- How does the system handle permission errors when accessing worktree directories?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load configuration from the arashi configuration file to determine repository settings
- **FR-002**: System MUST list all worktrees associated with the main repository
- **FR-003**: System MUST display the path, branch name, and status for each worktree
- **FR-004**: System MUST support a verbose mode that shows detailed sub-repository information for nested repositories
- **FR-005**: System MUST support a JSON output format for machine-readable data
- **FR-006**: System MUST display the total count of worktrees found
- **FR-007**: System MUST handle the case when no additional worktrees exist with a clear informative message
- **FR-008**: System MUST indicate when a worktree or sub-repository has uncommitted changes or other notable status
- **FR-009**: System MUST provide output that can be piped to selection tools like fzf for interactive worktree selection
- **FR-010**: System MUST handle errors gracefully, including: no repository found, permission errors, and invalid configurations
- **FR-011**: Users MUST be able to distinguish between the main repository and additional worktrees in the output
- **FR-012**: Output format MUST be consistent and parseable when used in scripts or automation workflows

### Key Entities

- **Worktree**: Represents a git worktree with attributes including path, branch name, HEAD state, and modification status
- **Sub-Repository**: Represents a nested repository within a worktree with attributes including relative path, branch name, and status
- **Configuration**: Contains repository settings and preferences loaded from arashi configuration file

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view all worktrees with their paths and branches in under 2 seconds for repositories with up to 50 worktrees
- **SC-002**: Output can be successfully piped to fzf, jq, and other command-line tools without parsing errors
- **SC-003**: JSON output validates against a schema and contains all required fields (path, branch, status) for each worktree
- **SC-004**: Users can complete the workflow of listing worktrees, selecting one with fzf, and switching to it in under 10 seconds
- **SC-005**: Verbose mode displays sub-repository information for worktrees with up to 20 nested repositories without performance degradation
- **SC-006**: Error messages clearly indicate the problem and suggest corrective actions in 100% of error scenarios
- **SC-007**: Users can integrate the list command into tmux/sesh workflows with documentation guidance, reducing workspace switching time by 50%
