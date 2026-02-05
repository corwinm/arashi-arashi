# Feature Specification: Repository Management

**Feature Branch**: `001-repository-management`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Implement repository discovery and management functionality that scans for git repositories, detects default branches and setup scripts, clones repositories, validates repository structure, and gathers repository metadata"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover Repositories in Workspace Directory (Priority: P1)

A developer has a workspace directory containing multiple git repositories in subdirectories. They use the system to automatically discover all valid git repositories in the directory structure, eliminating the need to manually configure each repository.

**Why this priority**: Automatic discovery is the foundation of managing a multi-repository workspace. Without this, users would need to manually specify every repository, defeating the purpose of automation.

**Independent Test**: Can be fully tested by creating a directory with multiple subdirectories (some git repos, some not), running repository discovery, and verifying that all and only valid git repositories are identified.

**Acceptance Scenarios**:

1. **Given** a workspace directory with 5 subdirectories where 3 contain git repositories, **When** running discovery, **Then** the system identifies exactly the 3 valid repositories
2. **Given** discovered repositories, **When** discovery completes, **Then** each repository entry includes its filesystem path
3. **Given** nested directory structures with repositories at different depths, **When** running discovery, **Then** the system finds repositories at all levels within the scan depth limit

---

### User Story 2 - Detect Default Branch for Each Repository (Priority: P1)

The system examines each discovered repository to determine its default branch (main, master, develop, etc.). This information is essential for operations that need to branch from the repository's primary branch.

**Why this priority**: Different repositories use different default branch names. Detecting this automatically prevents errors when creating branches or worktrees. This is critical for cross-repository operations to work correctly.

**Independent Test**: Can be tested by creating test repositories with different default branches (main, master, develop), running default branch detection, and verifying the correct default branch is identified for each.

**Acceptance Scenarios**:

1. **Given** a repository with "main" as the default branch, **When** detection runs, **Then** the system correctly identifies "main" as the default
2. **Given** a repository with "master" as the default branch, **When** detection runs, **Then** the system correctly identifies "master" as the default
3. **Given** a repository with a custom default branch "develop", **When** detection runs, **Then** the system correctly identifies "develop" as the default
4. **Given** a repository in a detached HEAD state, **When** detection runs, **Then** the system determines the default branch from remote HEAD reference

---

### User Story 3 - Detect Setup Scripts in Repositories (Priority: P2)

The system checks each repository for the presence of setup scripts (e.g., setup.sh) that should be executed after worktree creation. This enables automatic environment setup for new worktrees without manual configuration.

**Why this priority**: Setup scripts automate post-creation tasks like installing dependencies. This is valuable for developer productivity but not essential for basic repository operations. The system functions without it.

**Independent Test**: Can be tested by creating repositories with and without setup.sh files, running setup script detection, and verifying that repositories with scripts are flagged appropriately.

**Acceptance Scenarios**:

1. **Given** a repository containing a file named "setup.sh" in its root, **When** detection runs, **Then** the system flags this repository as having a setup script
2. **Given** a repository without a setup script, **When** detection runs, **Then** the system flags this repository as having no setup script
3. **Given** discovered setup scripts, **When** detection completes, **Then** the system includes the script's filesystem path in the repository information

---

### User Story 4 - Clone Missing Repositories from Git URLs (Priority: P2)

A developer has a configuration listing repositories by Git URLs, but some repositories are not yet present locally. The system can clone missing repositories to the workspace directory, establishing the complete multi-repository environment.

**Why this priority**: Cloning automates initial workspace setup and enables teams to share workspace configurations. However, users can manually clone repositories, so this is a convenience feature.

**Independent Test**: Can be tested by providing a Git URL and target path, running the clone operation, and verifying that the repository is successfully cloned to the specified location.

**Acceptance Scenarios**:

1. **Given** a Git URL pointing to a valid repository, **When** cloning to a target path, **Then** the repository is successfully cloned to that path
2. **Given** a target path that already exists, **When** attempting to clone, **Then** the system detects the conflict and reports an error without overwriting
3. **Given** a clone operation, **When** cloning completes, **Then** the newly cloned repository is added to the discovered repositories list

---

### User Story 5 - Validate Repository Structure Against Configuration (Priority: P2)

The system compares a workspace configuration (listing expected repositories) against the actual repositories present in the workspace directory. It identifies missing repositories that exist in the configuration but not on disk.

**Why this priority**: Validation helps detect incomplete workspace setups and guides users to clone missing repositories. This improves reliability but isn't essential for working with existing repositories.

**Independent Test**: Can be tested by creating a configuration listing 5 repositories, ensuring only 3 exist on disk, running validation, and verifying that the 2 missing repositories are identified.

**Acceptance Scenarios**:

1. **Given** a configuration listing 5 repositories where 3 exist on disk, **When** validation runs, **Then** the system reports that 2 repositories are missing
2. **Given** validation identifies missing repositories, **When** validation completes, **Then** the system provides the names and expected paths of missing repositories
3. **Given** all configured repositories exist on disk, **When** validation runs, **Then** the system reports that the structure is valid

---

### User Story 6 - Gather Repository Metadata (Priority: P3)

The system collects comprehensive metadata about each repository, such as current branch, remote URLs, last commit information, and repository status. This information aids in monitoring and managing the workspace.

**Why this priority**: Rich metadata enables advanced features and debugging but isn't required for basic operations. The system can function with minimal repository information (path and default branch).

**Independent Test**: Can be tested by running metadata gathering on a repository, and verifying that the returned information includes current branch, remotes, and other relevant details.

**Acceptance Scenarios**:

1. **Given** a repository with a remote named "origin", **When** gathering metadata, **Then** the system includes the remote URL in the metadata
2. **Given** a repository on branch "feature-123", **When** gathering metadata, **Then** the system includes "feature-123" as the current branch
3. **Given** a repository with uncommitted changes, **When** gathering metadata, **Then** the system includes status information indicating uncommitted changes

---

### Edge Cases

- What happens when the workspace directory doesn't exist or isn't readable?
- How does the system handle repositories that are corrupted or have invalid git state?
- What happens when a repository has no remote configured?
- How does the system handle symbolic links in the workspace directory structure?
- What happens when cloning a repository fails due to network issues or authentication?
- How does the system handle repositories with detached HEAD state?
- What happens when the same repository appears in multiple locations within the workspace?
- How does the system handle extremely large workspaces with hundreds of repositories?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST scan a specified workspace directory for git repositories
- **FR-002**: System MUST identify valid git repositories by checking for .git directory or git metadata
- **FR-003**: System MUST return a list of discovered repositories with their filesystem paths
- **FR-004**: System MUST support configurable scan depth to limit directory traversal
- **FR-005**: System MUST skip non-repository directories during discovery
- **FR-006**: System MUST detect the default branch for each discovered repository
- **FR-007**: System MUST query git repository configuration to determine default branch
- **FR-008**: System MUST fall back to checking remote HEAD reference if local default branch detection fails
- **FR-009**: System MUST check each repository for the presence of a setup script file (setup.sh)
- **FR-010**: System MUST record whether a repository has a setup script and its path
- **FR-011**: System MUST clone a git repository from a provided URL to a specified target path
- **FR-012**: System MUST verify the target path doesn't exist before cloning
- **FR-013**: System MUST report clone progress and completion status
- **FR-014**: System MUST handle clone failures gracefully with descriptive error messages
- **FR-015**: System MUST validate a workspace configuration against discovered repositories
- **FR-016**: System MUST identify repositories present in configuration but missing from the workspace
- **FR-017**: System MUST report validation results with details about missing repositories
- **FR-018**: System MUST gather metadata for a repository including current branch, remotes, and status
- **FR-019**: System MUST handle repositories without remotes or in unusual states during metadata gathering
- **FR-020**: System MUST provide repository information in a consistent format across all operations

### Key Entities

- **Repository Discovery Result**: Represents the outcome of scanning a workspace directory, including a collection of discovered repositories and any errors encountered
- **Repository Information**: Represents metadata about a single git repository, including filesystem path, default branch, presence of setup script, current branch, and remote URLs
- **Workspace Configuration**: Represents the expected repository structure, listing repositories by name or URL and their expected locations
- **Validation Result**: Represents the outcome of comparing actual repositories against expected configuration, identifying present and missing repositories
- **Clone Operation**: Represents an in-progress or completed repository clone, including source URL, target path, progress, and status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Repository discovery completes scanning 50 repositories in a workspace within 5 seconds
- **SC-002**: Default branch detection correctly identifies the default branch for 100% of repositories with standard configurations
- **SC-003**: Setup script detection identifies the presence of setup.sh files with 100% accuracy
- **SC-004**: Repository cloning completes for typical repositories (under 100MB) within 30 seconds on standard network connections
- **SC-005**: Workspace validation completes for configurations with 20 repositories within 2 seconds
- **SC-006**: Repository discovery handles corrupt or invalid git repositories without failing the entire scan operation
- **SC-007**: Metadata gathering collects comprehensive information for 95% of repositories without errors
- **SC-008**: The system provides clear, actionable error messages when operations fail (e.g., missing repository, clone failure), enabling users to resolve issues
