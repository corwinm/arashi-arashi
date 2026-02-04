# Feature Specification: Filesystem Utilities

**Feature Branch**: `005-filesystem-utilities`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Implement file system operations in src/lib/filesystem.ts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Safe Directory Operations (Priority: P1)

Developers need to ensure directories exist before writing files, without worrying about race conditions or parent directory creation.

**Why this priority**: Core functionality required by all other features that write files or manage directory structures.

**Independent Test**: Can be fully tested by calling `ensureDir()` with various paths and verifying directories are created recursively, delivering immediate value for any file-writing operations.

**Acceptance Scenarios**:

1. **Given** a path to a non-existent directory, **When** developer calls `ensureDir()`, **Then** the directory and all parent directories are created
2. **Given** a path to an existing directory, **When** developer calls `ensureDir()`, **Then** the operation succeeds without errors
3. **Given** insufficient permissions for directory creation, **When** developer calls `ensureDir()`, **Then** a descriptive error is thrown indicating the permission issue

---

### User Story 2 - File Existence and Permission Checks (Priority: P1)

Developers need to verify file/directory existence and check executable permissions before attempting operations.

**Why this priority**: Essential for safe operations and avoiding runtime errors in subsequent operations.

**Independent Test**: Can be fully tested by checking various file states and permissions, delivering immediate value for conditional logic in file operations.

**Acceptance Scenarios**:

1. **Given** a path to an existing file, **When** developer calls `fileExists()`, **Then** true is returned
2. **Given** a path to a non-existent file, **When** developer calls `fileExists()`, **Then** false is returned
3. **Given** a path to an executable file, **When** developer calls `isExecutable()`, **Then** true is returned
4. **Given** a path to a non-executable file, **When** developer calls `isExecutable()`, **Then** false is returned

---

### User Story 3 - Worktree Path Calculation (Priority: P1)

Developers need to compute the correct worktree path based on repository configuration (bare vs non-bare) and custom paths.

**Why this priority**: Critical for git worktree management features to function correctly.

**Independent Test**: Can be fully tested by providing different repository configurations and verifying correct path computation, delivering immediate value for worktree-related features.

**Acceptance Scenarios**:

1. **Given** a bare repository path and branch name, **When** developer calls `getWorktreePath()`, **Then** the correct worktree path is computed following bare repository conventions
2. **Given** a non-bare repository path and branch name, **When** developer calls `getWorktreePath()`, **Then** the correct worktree path is computed following non-bare repository conventions
3. **Given** a custom path parameter, **When** developer calls `getWorktreePath()`, **Then** the custom path is used instead of computed path

---

### User Story 4 - File Operations (Priority: P2)

Developers need to read, write, and copy files with proper encoding and permission handling.

**Why this priority**: Common operations needed by many features, but can be implemented after basic directory operations.

**Independent Test**: Can be fully tested by performing file operations and verifying content/permissions, delivering immediate value for configuration and data file management.

**Acceptance Scenarios**:

1. **Given** source and destination paths, **When** developer calls `copyFile()`, **Then** the file is copied with permissions preserved
2. **Given** a file path and content string, **When** developer calls `writeTextFile()`, **Then** the content is written as UTF-8
3. **Given** a file path, **When** developer calls `readTextFile()`, **Then** the file content is returned as a UTF-8 string
4. **Given** a non-existent file path, **When** developer calls `readTextFile()`, **Then** a descriptive error is thrown

---

### User Story 5 - Directory Cleanup (Priority: P3)

Developers need to remove directories and their contents safely and reliably.

**Why this priority**: Important for cleanup operations but less critical than creation and read operations.

**Independent Test**: Can be fully tested by creating and removing directories, delivering immediate value for cleanup and reset operations.

**Acceptance Scenarios**:

1. **Given** a path to an existing directory with files, **When** developer calls `removeDir()`, **Then** the directory and all contents are removed recursively
2. **Given** a path to a non-existent directory, **When** developer calls `removeDir()`, **Then** the operation succeeds without errors
3. **Given** insufficient permissions for directory removal, **When** developer calls `removeDir()`, **Then** a descriptive error is thrown

---

### Edge Cases

- What happens when paths contain special characters or spaces?
- How does system handle symbolic links (follow or treat as files)?
- What happens when attempting operations on paths at system limits (max path length)?
- How does system handle concurrent access to the same files/directories?
- What happens when disk space is exhausted during write operations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a function to create directories recursively if they don't exist
- **FR-002**: System MUST provide a function to check if a file or directory exists
- **FR-003**: System MUST provide a function to check if a file has executable permissions
- **FR-004**: System MUST provide a function to compute worktree paths based on repository configuration
- **FR-005**: System MUST provide a function to copy files while preserving permissions
- **FR-006**: System MUST provide a function to remove directories recursively
- **FR-007**: System MUST provide a function to read file contents as UTF-8 strings
- **FR-008**: System MUST provide a function to write file contents as UTF-8 strings
- **FR-009**: System MUST throw descriptive errors for permission failures
- **FR-010**: System MUST throw descriptive errors for not-found scenarios
- **FR-011**: System MUST handle both absolute and relative paths
- **FR-012**: System MUST work cross-platform (macOS, Linux, Windows)

### Key Entities

- **Directory**: A filesystem location that can contain files and subdirectories
- **File**: A filesystem entity containing data, with associated metadata (permissions, size, timestamps)
- **Path**: A string representing a location in the filesystem (absolute or relative)
- **Worktree Path**: A computed location for git worktrees based on repository type and configuration

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All file system operations complete within 100ms for typical use cases (single directory, files under 1MB)
- **SC-002**: Operations handle at least 1000 files in a directory without degradation
- **SC-003**: 100% of error scenarios provide descriptive error messages indicating the cause and affected path
- **SC-004**: All functions work correctly on macOS, Linux, and Windows platforms
- **SC-005**: Functions are covered by unit tests with at least 90% code coverage
