# Feature Specification: Configuration Management

**Feature Branch**: `006-config-management`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "Implement configuration file management for .arashi/config.json with load, save, add/remove repo, validation, and error handling capabilities"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initialize Configuration (Priority: P1)

As a developer setting up arashi for the first time, I need the system to create a default configuration file so I can start managing repositories with sensible defaults.

**Why this priority**: This is the foundation for all configuration operations - without it, no other configuration management can occur.

**Independent Test**: Can be fully tested by running arashi init or first-time setup command and verifying a valid `.arashi/config.json` file is created with default values including version, repos_dir, and auto_setup fields.

**Acceptance Scenarios**:

1. **Given** no configuration file exists, **When** the system initializes, **Then** a new `.arashi/config.json` file is created with default values (version, repos_dir, auto_setup)
2. **Given** a configuration file already exists, **When** initialization is attempted, **Then** the existing configuration is preserved without overwriting

---

### User Story 2 - Load and Validate Configuration (Priority: P1)

As a developer working with arashi, I need the system to load my configuration reliably so I can continue my workflow without interruption.

**Why this priority**: Loading configuration is essential for all operations - without reliable config loading, the system cannot function.

**Independent Test**: Can be fully tested by creating various config files (valid, invalid, missing, malformed) and verifying the system loads valid configs successfully and provides clear error messages for problems.

**Acceptance Scenarios**:

1. **Given** a valid configuration file exists, **When** the system loads the configuration, **Then** the configuration data is returned successfully
2. **Given** the configuration file is missing, **When** the system attempts to load it, **Then** a helpful error message indicates the file doesn't exist and suggests initialization
3. **Given** the configuration file contains malformed JSON, **When** the system attempts to load it, **Then** a clear error message with parse error details is provided
4. **Given** the configuration file has invalid structure (missing required fields), **When** validation runs, **Then** specific validation errors identify which fields are missing or invalid

---

### User Story 3 - Manage Repository List (Priority: P2)

As a developer managing multiple repositories, I need to add and remove repositories from my configuration so I can track which repositories arashi should manage.

**Why this priority**: While important for multi-repo workflows, the system can function with a single repository, making this lower priority than initialization and loading.

**Independent Test**: Can be fully tested by adding repositories to the configuration, verifying they appear in the discovered_repos section, removing repositories, and confirming they're deleted from the configuration.

**Acceptance Scenarios**:

1. **Given** a valid configuration exists, **When** I add a repository with name and path, **Then** the repository is added to discovered_repos with the provided details
2. **Given** a repository exists in discovered_repos, **When** I remove it by name, **Then** the repository is deleted from the configuration
3. **Given** I attempt to add a repository with a duplicate name, **When** the add operation executes, **Then** the system either updates the existing entry or provides an error about the duplicate

---

### User Story 4 - Persist Configuration Changes (Priority: P2)

As a developer modifying my arashi configuration, I need changes to be saved in a readable format so I can review or manually edit the configuration later if needed.

**Why this priority**: Essential for persistence but depends on the ability to load and modify configuration first.

**Independent Test**: Can be fully tested by making configuration changes programmatically, verifying the file is written with proper JSON formatting (indentation, line breaks), and confirming the file can be re-loaded successfully.

**Acceptance Scenarios**:

1. **Given** a configuration object in memory, **When** the system saves it, **Then** the configuration is written to `.arashi/config.json` with pretty formatting (indented, human-readable)
2. **Given** the configuration directory doesn't exist, **When** saving configuration, **Then** the directory is created automatically before writing the file
3. **Given** file system permissions prevent writing, **When** saving configuration, **Then** a clear error message indicates the permission problem

---

### Edge Cases

- What happens when the `.arashi` directory doesn't exist during save operations?
- How does the system handle concurrent access to the configuration file?
- What happens when the configuration file has valid JSON but unexpected additional fields?
- How does the system handle extremely large configuration files (hundreds of repositories)?
- What happens when file system operations fail (disk full, permission denied, read-only filesystem)?
- How does the system handle invalid paths in repo configurations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a function to load configuration from `.arashi/config.json` given a repository path
- **FR-002**: System MUST provide a function to save configuration to `.arashi/config.json` with pretty formatting (indented JSON)
- **FR-003**: System MUST provide a function to add a repository to the discovered_repos collection
- **FR-004**: System MUST provide a function to remove a repository from discovered_repos by name
- **FR-005**: System MUST provide a function to get the full path to the configuration file
- **FR-006**: System MUST provide a function to check if a configuration file exists
- **FR-007**: System MUST provide a function to validate configuration structure and required fields
- **FR-008**: System MUST generate default configuration with version, repos_dir, and auto_setup fields
- **FR-009**: System MUST provide helpful error messages when configuration file is missing
- **FR-010**: System MUST provide detailed error messages with parse information when JSON is malformed
- **FR-011**: System MUST validate all required configuration fields (version, repos_dir, auto_setup) are present
- **FR-012**: System MUST create the configuration directory if it doesn't exist during save operations
- **FR-013**: System MUST preserve JSON readability with consistent formatting when saving

### Key Entities

- **Configuration**: Represents the complete arashi configuration including version, repositories directory location, auto-setup flag, and discovered repositories collection
- **Repository Entry**: Represents a single repository in the discovered_repos collection with a unique name and associated configuration details (path, worktrees, etc.)

### Dependencies

- File system access with read/write permissions for creating and modifying configuration files
- JSON parser for reading and writing configuration data
- File path utilities for constructing and validating paths

### Assumptions

- Configuration files will typically contain fewer than 100 repositories (optimized for this scale)
- The `.arashi` directory location is determined by the repository path parameter
- Configuration file format is JSON (not YAML, TOML, or other formats)
- Duplicate repository names are considered an error condition (not silently overwritten)
- Pretty formatting uses standard JSON indentation (assumed 2 or 4 spaces)
- File system operations are synchronous (blocking) for reliability
- Configuration validation happens at load time, not at save time
- Unknown fields in configuration are preserved but not validated (forward compatibility)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can successfully initialize a new configuration in under 5 seconds
- **SC-002**: Configuration loading completes in under 100 milliseconds for files with up to 100 repositories
- **SC-003**: All configuration operations provide actionable error messages that include specific details about failures
- **SC-004**: Configuration files remain human-readable and properly formatted after all programmatic modifications
- **SC-005**: All configuration functions have complete unit test coverage with tests for success cases, error cases, and edge cases
- **SC-006**: Configuration validation catches 100% of missing required fields and provides specific field names in error messages
