# Feature Specification: Init Command

**Feature Branch**: `001-init-command`  
**Created**: 2026-02-05  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/23"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time Setup (Priority: P1)

A developer wants to start using arashi in their existing git repository. They need to initialize the tool, which sets up the necessary workspace structure and discovers any existing repositories they're already managing.

**Why this priority**: This is the essential first interaction every user must complete before using any other arashi features. Without initialization, the tool cannot function.

**Independent Test**: Can be fully tested by running the initialization in a new git repository and verifying that the workspace structure is created correctly, delivering immediate value by preparing the environment for repository management.

**Acceptance Scenarios**:

1. **Given** a developer is in a git repository without arashi configuration, **When** they initialize arashi, **Then** a workspace directory structure is created with default configuration
2. **Given** a developer initializes arashi with a custom repositories location, **When** initialization completes, **Then** the custom location is created and configured as the managed repositories directory
3. **Given** a developer has existing repositories in the configured location, **When** they initialize arashi, **Then** all existing repositories are discovered and reported to the user
4. **Given** a developer initializes arashi, **When** initialization completes, **Then** example hook templates are created for reference

---

### User Story 2 - Automatic Workspace Protection (Priority: P2)

A developer wants their managed repositories directory to be automatically excluded from version control to prevent accidentally committing large amounts of repository data.

**Why this priority**: This prevents common mistakes and protects repository integrity, but the tool can still function without it if users manually manage their .gitignore.

**Independent Test**: Can be tested independently by initializing in a repository and verifying that the managed repositories directory is added to .gitignore if not already present.

**Acceptance Scenarios**:

1. **Given** a developer initializes arashi with a repositories directory, **When** the directory is not in .gitignore, **Then** an entry is automatically added to .gitignore
2. **Given** a developer initializes arashi with a repositories directory already in .gitignore, **When** initialization completes, **Then** no duplicate entry is created

---

### User Story 3 - Error Prevention (Priority: P1)

A developer needs clear feedback when they attempt to initialize arashi in an invalid environment or when configuration already exists.

**Why this priority**: Clear error handling is critical for user experience and prevents configuration corruption. This is essential for reliability.

**Independent Test**: Can be tested independently by attempting initialization in various invalid scenarios and verifying appropriate error messages are displayed.

**Acceptance Scenarios**:

1. **Given** a developer is not in a git repository, **When** they attempt to initialize arashi, **Then** they receive a clear error message explaining the requirement
2. **Given** a developer has already initialized arashi, **When** they attempt to initialize again, **Then** they receive a warning that configuration already exists
3. **Given** initialization encounters a file system error, **When** the error occurs, **Then** the user receives a descriptive error message with guidance

---

### Edge Cases

- What happens when the repositories directory path contains spaces or special characters?
- How does the system handle when .gitignore doesn't exist yet?
- What happens if the user doesn't have write permissions to create the workspace directory?
- How does the system behave when discovering repositories in the configured location that are in an invalid state (corrupted, incomplete clones)?
- What happens if hook template creation fails but other initialization succeeds?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST verify that the current directory is a git repository before proceeding with initialization
- **FR-002**: System MUST create a workspace directory structure for configuration and hooks
- **FR-003**: System MUST generate a default configuration file with settings for managed repositories location and automatic setup preferences
- **FR-004**: System MUST create the managed repositories directory if it doesn't exist when specified in configuration
- **FR-005**: System MUST add the managed repositories directory to .gitignore to prevent accidental commits
- **FR-006**: System MUST discover and report any existing repositories in the managed repositories directory
- **FR-007**: System MUST create example hook templates in the workspace directory for user reference
- **FR-008**: System MUST display a success message listing discovered repositories after successful initialization
- **FR-009**: System MUST prevent initialization when not in a git repository with clear error messaging
- **FR-010**: System MUST handle the case when configuration already exists with appropriate user feedback
- **FR-011**: System MUST preserve existing .gitignore entries when adding the repositories directory

### Key Entities

- **Workspace Configuration**: Stores user preferences including managed repositories directory path and automatic setup options. Persists between sessions and defines how arashi operates in this repository.
- **Hook Template**: Example scripts that demonstrate how to integrate custom behavior at various lifecycle events. Serves as documentation and starting point for customization.
- **Managed Repositories Directory**: The location where arashi manages repository worktrees and clones. Can be customized by the user during initialization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can complete initialization in under 30 seconds from command execution to completion
- **SC-002**: 100% of initialization attempts in valid git repositories successfully create the required workspace structure
- **SC-003**: 100% of initialization attempts with existing repositories correctly discover and report them to the user
- **SC-004**: Developers receive clear, actionable error messages within 2 seconds for all invalid initialization attempts
- **SC-005**: Zero accidental commits of managed repositories content after initialization adds .gitignore protection
- **SC-006**: 90% of users can successfully initialize without consulting documentation due to clear error messages and feedback
