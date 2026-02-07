# Feature Specification: Add Command

**Feature Branch**: `018-add-command`  
**Created**: 2026-02-06  
**Status**: Draft  
**Input**: User description: "Implement add command to clone and register Git repositories in arashi workspace"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Repository by Git URL (Priority: P1)

A developer wants to add an existing Git repository to their arashi workspace so they can manage it alongside other repositories using arashi's worktree capabilities.

**Why this priority**: This is the core functionality - without the ability to add repositories, the command has no value. It represents the minimal viable feature that delivers immediate value.

**Independent Test**: Can be fully tested by running `arashi add <git-url>` against a valid Git repository and verifying the repository is cloned and registered in the workspace configuration.

**Acceptance Scenarios**:

1. **Given** a valid Git repository URL, **When** user runs `arashi add https://github.com/user/repo.git`, **Then** the repository is cloned into the repos directory, the default branch is detected, and the repository metadata is saved to configuration
2. **Given** a valid Git repository URL with custom name, **When** user runs `arashi add https://github.com/user/repo.git --name custom-name`, **Then** the repository is cloned with the custom name instead of deriving it from the URL
3. **Given** a newly added repository, **When** the operation completes successfully, **Then** user sees a success message displaying the repository name, location, and detected default branch

---

### User Story 2 - Handle Repository with Setup Script (Priority: P2)

A developer adds a repository that requires setup steps (dependencies, configuration, etc.) and wants arashi to detect or create a setup script template to help standardize the onboarding process.

**Why this priority**: Enhances the add command with setup automation support, making it easier to onboard repositories that need initialization, but not critical for basic add functionality.

**Independent Test**: Can be tested by adding a repository that contains a setup script and verifying arashi detects it, or by requesting setup script creation and verifying a template is generated.

**Acceptance Scenarios**:

1. **Given** a repository with an existing setup script (setup.sh, setup.bash, install.sh), **When** user adds the repository, **Then** arashi detects the setup script and includes its path in the repository metadata
2. **Given** a repository without a setup script, **When** user adds the repository with `--create-setup` flag, **Then** arashi creates a setup.sh template in the repository with standard placeholder steps
3. **Given** a repository with a detected setup script, **When** the add operation completes, **Then** the success message indicates the setup script was found and provides guidance on running it

---

### User Story 3 - Prevent Duplicate or Invalid Additions (Priority: P1)

A developer accidentally tries to add a repository that already exists in the workspace, or provides an invalid Git URL, and needs clear error messages to understand what went wrong.

**Why this priority**: Error handling is critical for user experience and preventing configuration corruption. This is P1 because it protects data integrity.

**Independent Test**: Can be tested by attempting to add duplicate repositories or invalid URLs and verifying appropriate error messages are displayed without corrupting existing configuration.

**Acceptance Scenarios**:

1. **Given** a repository name that already exists in the workspace, **When** user tries to add another repository with the same name, **Then** arashi displays an error message indicating the duplicate name and suggests using a custom name
2. **Given** an invalid Git URL format, **When** user runs `arashi add invalid-url`, **Then** arashi displays an error message explaining the URL format requirements before attempting any clone operation
3. **Given** a valid Git URL that fails to clone (network error, authentication required, repository doesn't exist), **When** the clone operation fails, **Then** arashi displays a clear error message with the failure reason and does not update the configuration
4. **Given** a corrupted or invalid configuration file, **When** user tries to add a repository, **Then** arashi detects the invalid configuration and displays an error message without proceeding with the add operation

---

### Edge Cases

- What happens when the Git URL requires authentication (SSH keys, credentials)?
- What happens when the repository has no commits (empty repository)?
- What happens when the default branch detection fails (no HEAD reference)?
- What happens when the repos directory doesn't exist or lacks write permissions?
- What happens when disk space is insufficient for cloning?
- What happens when a partial clone occurs (network interruption mid-clone)?
- What happens when the configuration file is locked by another process?
- What happens when the repository name contains special characters or invalid filesystem characters?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST validate Git URL format before attempting clone operation
- **FR-002**: System MUST derive repository name from Git URL (last path segment without .git extension) when no custom name is provided
- **FR-003**: System MUST support custom repository names via command-line flag or prompt
- **FR-004**: System MUST clone the repository into a repos directory within the workspace
- **FR-005**: System MUST detect the repository's default branch after successful clone
- **FR-006**: System MUST detect presence of setup scripts (common names: setup.sh, setup.bash, install.sh) in the repository root
- **FR-007**: System MUST update the workspace configuration file (config.json) with repository metadata including: name, Git URL, clone path, default branch, and setup script path (if detected)
- **FR-008**: System MUST support creating a setup script template when requested by user
- **FR-009**: System MUST display a success message after successful add operation, including repository name, location, and default branch information
- **FR-010**: System MUST validate that repository name is unique within the workspace before cloning
- **FR-011**: System MUST handle clone failures gracefully and display meaningful error messages without corrupting configuration
- **FR-012**: System MUST validate configuration file integrity before and after modification
- **FR-013**: System MUST handle errors for: clone failure, duplicate repository name, invalid configuration, and invalid Git URL format
- **FR-014**: System MUST clean up partial clones if the operation fails mid-process
- **FR-015**: System MUST provide integration tests covering success and error scenarios

### Key Entities

- **Repository**: Represents a Git repository managed by arashi, including its name (unique identifier within workspace), Git URL (remote origin), local clone path, default branch name, and optional setup script path
- **Workspace Configuration**: Stores metadata about all repositories in the workspace, persisted in config.json format

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can successfully add a Git repository to their workspace in under 30 seconds for typical repository sizes (excluding network clone time)
- **SC-002**: System prevents 100% of duplicate repository additions by validating names before cloning
- **SC-003**: Error messages for failed operations are clear enough that 90% of users can resolve issues without consulting documentation
- **SC-004**: Configuration file remains valid and uncorrupted in 100% of error scenarios (no partial updates)
- **SC-005**: Integration tests achieve at least 90% code coverage for the add command, including all error paths

## Assumptions

- The workspace has already been initialized with `arashi init` and has a valid configuration structure
- Users have Git installed and available in their PATH
- The repos directory is created by arashi if it doesn't exist (or fails with clear error)
- Default setup script names follow common conventions: setup.sh, setup.bash, install.sh
- Repository metadata includes only essential fields - detailed worktree information is managed by separate commands
- Git authentication (SSH keys, credential helpers) is already configured by the user's Git installation
- Network connectivity is available for cloning remote repositories
