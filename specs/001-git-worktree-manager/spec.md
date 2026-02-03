# Feature Specification: Arashi - Git Worktree Manager for Meta-Repositories

**Feature Branch**: `001-git-worktree-manager`  
**Created**: February 2, 2026  
**Status**: Draft  
**Input**: User description: "I want to use my design in .specify/memory/design.md to create a spec for the project"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize Meta-Repository Management (Priority: P1)

As a developer working with multiple related repositories, I need to initialize Arashi in my meta-repository so that I can start managing coordinated worktrees across all my repositories.

**Why this priority**: This is the foundational capability that enables all other features. Without initialization, no worktree management is possible. This provides immediate value by setting up the structure needed for coordinated development.

**Independent Test**: Can be fully tested by running initialization in a git repository and verifying that configuration files are created and repositories are discovered. Delivers value by preparing the meta-repository for worktree coordination.

**Acceptance Scenarios**:

1. **Given** I am in a git repository with sub-repositories in a `repos/` folder, **When** I run initialization, **Then** the system creates configuration structure, discovers existing repositories, and updates ignore files
2. **Given** I am in a bare git repository, **When** I run initialization, **Then** the system creates configuration structure appropriate for bare repositories
3. **Given** I am in a directory that is not a git repository, **When** I run initialization, **Then** the system shows a clear error message indicating a git repository is required
4. **Given** I am in a git repository with no sub-repositories, **When** I run initialization, **Then** the system creates configuration structure with empty repository list

---

### User Story 2 - Create Coordinated Worktrees (Priority: P1)

As a developer, I need to create coordinated worktrees across all my repositories for a new feature branch so that I can work on changes that span multiple repositories without manually managing each worktree.

**Why this priority**: This is the core value proposition of Arashi. It directly addresses the pain point of manually creating and tracking worktrees across multiple repositories. This is the minimum viable feature that makes Arashi useful.

**Independent Test**: Can be fully tested by creating a worktree for a new branch name and verifying that worktrees are created in the main repository and all sub-repositories with proper branch setup and remote tracking. Delivers immediate value by automating what would otherwise be 10+ manual git commands.

**Acceptance Scenarios**:

1. **Given** I have an initialized meta-repository with 3 sub-repositories, **When** I create a worktree for branch "feature-auth", **Then** the system creates worktrees for all repositories with the same branch name, creates branches from default branches, and sets up remote tracking
2. **Given** I want to work on a subset of repositories, **When** I create a worktree with interactive selection or filtering, **Then** the system only creates worktrees for selected repositories
3. **Given** a branch already exists in one of the sub-repositories, **When** I create a worktree for that branch name, **Then** the system prompts me to either use the existing branch, create a new branch with a numeric suffix, or abort
4. **Given** I have setup scripts defined in my repositories, **When** I create a worktree, **Then** the system automatically runs setup scripts to prepare the development environment
5. **Given** an error occurs during worktree creation, **When** the operation fails, **Then** the system rolls back all created worktrees and branches, leaving repositories in a clean state

---

### User Story 3 - View Worktree Status (Priority: P2)

As a developer with multiple active worktrees, I need to see the status of all my worktrees and their sub-repositories so that I can understand what work is in progress and identify any uncommitted changes.

**Why this priority**: After creating worktrees, developers need visibility into their state. This enables informed decision-making about which worktree to work in and prevents lost work from forgotten changes.

**Independent Test**: Can be fully tested by creating worktrees with various states (clean, dirty, ahead of remote) and verifying the display shows accurate status information. Delivers value by providing a single view of all development environments.

**Acceptance Scenarios**:

1. **Given** I have multiple worktrees with mixed states, **When** I view worktree status, **Then** the system shows all worktrees with branch names, paths, and clean/dirty indicators for main and sub-repositories
2. **Given** I am currently in a worktree, **When** I view status, **Then** the system shows detailed git status for the current worktree and all its sub-repositories
3. **Given** I have worktrees with branches ahead or behind remote, **When** I view status, **Then** the system shows the ahead/behind commit counts for each repository

---

### User Story 4 - Add Repositories to Configuration (Priority: P2)

As a developer, I need to add new repositories to my meta-repository configuration so that they are included in future worktree operations.

**Why this priority**: This enables teams to grow their meta-repository as the project evolves. While not required for the initial setup, it's essential for maintaining the system over time.

**Independent Test**: Can be fully tested by adding a new repository via git URL and verifying it is cloned, configured, and included in subsequent worktree operations. Delivers value by allowing dynamic addition of repositories without manual configuration.

**Acceptance Scenarios**:

1. **Given** I have a git URL for a new repository, **When** I add the repository, **Then** the system clones it into the repos folder, detects its default branch, and updates the configuration
2. **Given** I want to customize the repository name, **When** I add a repository with a custom name, **Then** the system uses my specified name instead of deriving it from the URL
3. **Given** the repository has a setup script, **When** I add the repository, **Then** the system detects the setup script and marks it in the configuration

---

### User Story 5 - Remove Worktrees and Cleanup (Priority: P2)

As a developer, I need to remove worktrees and their associated branches when I'm done with a feature so that I can keep my repository clean and avoid clutter.

**Why this priority**: Cleanup is essential for long-term usability. Without it, developers accumulate stale worktrees and branches. This completes the worktree lifecycle (create → work → remove).

**Independent Test**: Can be fully tested by creating a worktree, making changes, and then removing it while verifying that worktrees are deleted and branches are cleaned up according to flags. Delivers value by automating cleanup that would otherwise require multiple manual commands per repository.

**Acceptance Scenarios**:

1. **Given** I have a worktree I want to remove, **When** I remove it, **Then** the system deletes worktrees from all repositories and removes local branches
2. **Given** a worktree has uncommitted changes, **When** I attempt to remove it, **Then** the system warns me and requires confirmation before proceeding
3. **Given** I want to keep branches but remove worktrees, **When** I remove with the keep-branches flag, **Then** the system removes worktrees but preserves all branches
4. **Given** I want to remove branches but keep worktrees, **When** I remove with the keep-worktrees flag, **Then** the system removes branches but preserves worktrees

---

### User Story 6 - Run Setup Scripts (Priority: P3)

As a developer, I need to manually run setup scripts in my worktrees so that I can prepare or repair development environments without recreating worktrees.

**Why this priority**: This is a convenience feature for maintaining environments. While useful, worktrees can function without it since setup runs automatically during creation.

**Independent Test**: Can be fully tested by running setup commands in an existing worktree and verifying that setup scripts execute and complete successfully. Delivers value by enabling environment refresh without recreation.

**Acceptance Scenarios**:

1. **Given** I am in a worktree with setup scripts, **When** I run setup, **Then** the system executes setup scripts for all repositories in sequence
2. **Given** I want to run setup only for specific repositories, **When** I run setup with repository filters, **Then** the system only executes setup for specified repositories
3. **Given** I want faster setup, **When** I run setup with parallel flag, **Then** the system executes all setup scripts concurrently

---

### User Story 7 - List All Worktrees (Priority: P3)

As a developer, I need to see a list of all my worktrees so that I can quickly navigate to the right worktree for my current task.

**Why this priority**: This is a convenience feature for discovery. While helpful, developers can also use standard filesystem tools to find worktrees.

**Independent Test**: Can be fully tested by creating multiple worktrees and verifying they all appear in the list with correct information. Delivers value by providing a directory of all active development environments.

**Acceptance Scenarios**:

1. **Given** I have multiple worktrees, **When** I list worktrees, **Then** the system shows all worktrees with their branch names, paths, and status summaries
2. **Given** I want detailed information, **When** I list worktrees in verbose mode, **Then** the system shows additional details including sub-repository states
3. **Given** I need machine-readable output, **When** I list worktrees in JSON format, **Then** the system outputs structured JSON data

---

### Edge Cases

- What happens when a sub-repository is unreachable during worktree creation (network issues, authentication failures)?
- How does the system handle partial worktree creation when disk space runs out mid-operation?
- What happens when a user manually deletes worktree directories without using the remove command?
- How does the system handle repositories with different branch naming conventions?
- What happens when setup scripts fail or hang indefinitely?
- How does the system handle merge conflicts in branches that already exist?
- What happens when the main repository is a bare repository vs. a regular repository?
- How does the system handle repositories with no remote configured?
- What happens when branches have diverged significantly from their tracking branches?
- How does the system handle case-sensitive vs. case-insensitive filesystems for branch names?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect whether the current directory is a git repository before initialization
- **FR-002**: System MUST create a configuration directory structure with version tracking
- **FR-003**: System MUST automatically discover git repositories within the configured repositories directory
- **FR-004**: System MUST determine whether a repository is bare or regular and adapt worktree creation location accordingly
- **FR-005**: System MUST create worktrees in sibling directories for regular repositories
- **FR-006**: System MUST create worktrees within the repository directory for bare repositories
- **FR-007**: System MUST fetch the latest changes from default branches before creating new branches
- **FR-008**: System MUST create new branches from the latest default branch when the branch doesn't exist
- **FR-009**: System MUST set up remote tracking for all newly created branches
- **FR-010**: System MUST create coordinated worktrees across the main repository and all configured sub-repositories
- **FR-011**: System MUST detect branch name conflicts and provide resolution options (use existing, create new with suffix, abort)
- **FR-012**: System MUST execute lifecycle hooks at appropriate points (pre-create, post-create, setup)
- **FR-013**: System MUST automatically run setup scripts after worktree creation when auto-setup is enabled
- **FR-014**: System MUST track all operations during worktree creation for rollback purposes
- **FR-015**: System MUST rollback all created worktrees and branches if any operation fails
- **FR-016**: System MUST allow selective repository inclusion during worktree creation through interactive selection or filtering
- **FR-017**: System MUST report git status for all repositories in a worktree
- **FR-018**: System MUST indicate clean/dirty state for each repository in status displays
- **FR-019**: System MUST show ahead/behind tracking information relative to remote branches
- **FR-020**: System MUST clone repositories from git URLs into the configured repositories directory
- **FR-021**: System MUST detect the default branch for newly added repositories
- **FR-022**: System MUST detect the presence of setup scripts in repositories
- **FR-023**: System MUST persist repository configuration to disk in JSON format
- **FR-024**: System MUST remove worktrees from all repositories when requested
- **FR-025**: System MUST delete local branches from all repositories when requested
- **FR-026**: System MUST warn users when removing worktrees with uncommitted changes
- **FR-027**: System MUST provide options to keep branches while removing worktrees or vice versa
- **FR-028**: System MUST require confirmation before destructive operations
- **FR-029**: System MUST execute setup scripts sequentially by default
- **FR-030**: System MUST support parallel setup script execution via flag
- **FR-031**: System MUST display progress information during long-running operations
- **FR-032**: System MUST list all worktrees associated with the meta-repository
- **FR-033**: System MUST provide both compact and detailed views of worktree information
- **FR-034**: System MUST support machine-readable output formats for automation
- **FR-035**: System MUST validate that hooks have execute permissions before running them
- **FR-036**: System MUST pass context information to hooks via environment variables
- **FR-037**: System MUST update repository ignore files to exclude the repositories directory
- **FR-038**: System MUST handle missing or deleted worktree directories gracefully
- **FR-039**: System MUST provide clear error messages with actionable guidance
- **FR-040**: System MUST log all significant operations for debugging purposes

### Key Entities

- **Meta-Repository**: The main git repository that contains the Arashi configuration and references to sub-repositories. It can be either a regular repository (with working directory) or bare repository (no working directory). Contains the configuration directory and serves as the coordination point for all worktree operations.

- **Sub-Repository**: Individual git repositories managed as part of the meta-repository. Each has its own git history, remote, and default branch. Located within the configured repositories directory (gitignored).

- **Worktree**: A linked working directory associated with a specific branch in a git repository. Each worktree creation operation produces coordinated worktrees across the main repository and all selected sub-repositories. Contains actual code files and git metadata linking back to the parent repository.

- **Configuration**: Persistent settings stored in the configuration directory including: version, repositories directory name, worktree strategy, auto-setup flag, and discovered repository metadata (path, default branch, remote, setup script presence, git URL).

- **Branch**: A named reference to a specific commit in git history. Arashi coordinates branch creation and tracking across multiple repositories, ensuring that related work uses consistent branch names. Branches may have remote tracking relationships.

- **Setup Script**: An executable shell script that prepares a development environment (install dependencies, configure settings, etc.). Can exist at the meta-repository level and/or within individual sub-repositories.

- **Lifecycle Hook**: Optional executable scripts that run at specific points in the worktree lifecycle (pre-create, post-create). Receive context via environment variables and can influence or observe operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can initialize a meta-repository with 5 sub-repositories in under 5 seconds
- **SC-002**: Developers can create coordinated worktrees across 5 repositories with a single command, completing in under 30 seconds (excluding setup script time)
- **SC-003**: Worktree creation operations that fail rollback completely within 10 seconds, leaving repositories in the same state as before the operation
- **SC-004**: Developers can see status of all repositories across all worktrees in under 3 seconds
- **SC-005**: 95% of worktree operations complete without manual intervention or error recovery
- **SC-006**: Error messages provide actionable guidance that enables users to resolve issues without external documentation in 90% of cases
- **SC-007**: Developers reduce time spent on worktree coordination tasks by 80% compared to manual git command execution
- **SC-008**: Setup scripts complete successfully for all configured repositories 95% of the time
- **SC-009**: The system accurately detects and reports git status (clean/dirty) for all repositories with 100% accuracy
- **SC-010**: Developers can add a new repository to the configuration in under 2 minutes
- **SC-011**: Worktree removal operations complete in under 10 seconds for typical repositories
- **SC-012**: The system handles 20+ sub-repositories without performance degradation beyond linear scaling
- **SC-013**: Configuration changes persist correctly across 100% of operations
- **SC-014**: Interactive prompts provide clear options and defaults that require no additional explanation 90% of the time
- **SC-015**: The system prevents data loss from uncommitted changes through warnings and confirmations in 100% of cases where destructive operations are attempted

## Assumptions

1. **Git Installation**: Users have git installed and properly configured with credentials for all remote repositories
2. **Shell Access**: Users have access to a command-line shell (bash, zsh, or compatible) for executing the tool
3. **File System Permissions**: Users have read/write permissions in the directories where worktrees will be created
4. **Network Access**: Users have network access to remote git repositories when fetching or setting up tracking
5. **Repository Relationships**: Sub-repositories are related to the main repository in purpose (e.g., frontend/backend of the same application) rather than being arbitrary unrelated repositories
6. **Branch Naming**: Teams follow consistent branch naming conventions across their repositories
7. **Setup Scripts**: Setup scripts are idempotent (can be run multiple times safely) and handle their own error cases
8. **Repository Structure**: The main repository's build/deploy processes expect sub-repositories to be in the configured location (e.g., `repos/`)
9. **User Expertise**: Users have basic familiarity with git concepts (branches, remotes, worktrees)
10. **Single User**: Worktree management is performed by a single user at a time per meta-repository (not concurrent operations)

## Dependencies

- **Git**: Version 2.5+ (when worktrees were introduced) is installed and available in PATH
- **Node.js**: Runtime environment version 18+ for executing the CLI tool if distributed as npm package
- **Bun**: Development runtime for building and testing (not required for end users if distributed as standalone binary)

## Out of Scope

The following capabilities are explicitly not included in this specification:

1. **Remote Worktree Management**: Managing worktrees on remote machines via SSH or other protocols
2. **IDE Integration**: Direct integration with Visual Studio Code, JetBrains, or other IDEs
3. **CI/CD Integration**: Automatic worktree creation/management in continuous integration pipelines
4. **Workspace Templates**: Predefined sets of repositories that can be activated together beyond the current "all or filtered" approach
5. **Stash Management**: Coordinating git stash operations across repositories
6. **Bulk Git Operations**: Coordinating complex git operations like rebase, merge, cherry-pick across repositories
7. **Web Dashboard**: Browser-based interface for worktree management
8. **Plugin System**: Extensibility framework for custom commands or behaviors
9. **Analytics**: Usage tracking or telemetry collection
10. **Multi-User Coordination**: Preventing conflicts when multiple developers work on the same meta-repository
11. **Automated Branch Merging**: Automatically merging or synchronizing branches across repositories
12. **Repository Creation**: Creating new repositories from scratch (only cloning existing repositories is supported)
13. **Git Server Functionality**: Hosting or serving git repositories
14. **Credential Management**: Handling git credentials, SSH keys, or authentication (assumes user has configured git access)
15. **Repository Discovery Beyond Configured Directory**: Finding or managing repositories outside the designated repositories directory
