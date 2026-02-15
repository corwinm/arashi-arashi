# Feature Specification: Windows CLI Compatibility

**Feature Branch**: `039-fix-windows-cli`  
**Created**: 2026-02-14  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/98"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run CLI in PowerShell after npm install (Priority: P1)

A Windows user installs the CLI with npm and expects to run it directly in PowerShell without errors.

**Why this priority**: The reported failure in PowerShell blocks all Windows usage, making this the most critical path to restore basic functionality.

**Independent Test**: Can be fully tested by installing via npm on Windows and running a simple command (for example, a version or help command) in PowerShell to confirm it executes successfully.

**Acceptance Scenarios**:

1. **Given** a Windows user installs the CLI with npm, **When** they run a basic command in PowerShell, **Then** the CLI executes successfully and returns expected output.
2. **Given** a Windows user runs the CLI from a directory without elevated permissions, **When** they invoke a read-only command, **Then** it succeeds without requiring administrative access.

---

### User Story 2 - Run CLI in Git Bash on Windows (Priority: P2)

A Windows user who prefers Git Bash expects the CLI to run without platform errors after installing with npm.

**Why this priority**: The issue reports an incompatible platform error in Git Bash, which blocks a common Windows workflow.

**Independent Test**: Can be fully tested by installing via npm on Windows and running the same command in Git Bash to confirm the CLI launches and completes.

**Acceptance Scenarios**:

1. **Given** a Windows user installs the CLI with npm, **When** they run a basic command in Git Bash, **Then** the CLI executes successfully and returns expected output.
2. **Given** a Windows user is running an older Windows environment, **When** they run the CLI in Git Bash, **Then** the CLI behaves consistently with supported Windows environments.

---

### User Story 3 - Clear guidance when execution is unsupported (Priority: P3)

A Windows user who hits a launch failure wants clear guidance on what went wrong and how to fix it.

**Why this priority**: Even with improved compatibility, clear guidance reduces support load and helps users self-serve.

**Independent Test**: Can be tested by forcing a launch failure and verifying the CLI provides a clear, actionable message.

**Acceptance Scenarios**:

1. **Given** a Windows user attempts to run the CLI in an unsupported context, **When** the CLI cannot start, **Then** it provides a clear message describing why and how to resolve it.

---

### Edge Cases

- What happens when npm installs the CLI locally rather than globally?
- How does the system handle execution from paths containing spaces or non-ASCII characters?
- What happens when the user's shell is neither PowerShell nor Git Bash?
- How does the system handle an older Windows environment with limited shell capabilities?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow Windows users to run the CLI from PowerShell after installing via npm.
- **FR-002**: The system MUST allow Windows users to run the CLI from Git Bash after installing via npm.
- **FR-003**: The system MUST select a compatible launch path for the user's Windows shell environment.
- **FR-004**: The system MUST provide a clear, actionable error message when the CLI cannot start on Windows.
- **FR-005**: The system MUST support both global and local npm installs on Windows.
- **FR-006**: The system MUST avoid regressions for non-Windows platforms.

### Key Entities *(include if feature involves data)*

- **Runtime Environment**: The user's operating system and shell context used to launch the CLI.
- **CLI Launcher**: The entry point a user invokes after installation to start the CLI.
- **Install Context**: Whether the CLI was installed globally or locally via npm.

### Assumptions

- Windows 10 and Windows 11 are the primary supported Windows environments.
- Users have npm available and can install the CLI from the public package registry.
- Basic CLI commands (help, version) are available to validate successful startup.

### Dependencies

- The npm package distribution for the CLI remains available to Windows users.
- Windows test environments are available to validate PowerShell and Git Bash execution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of Windows users can run a basic CLI command in PowerShell on their first attempt after npm install.
- **SC-002**: At least 95% of Windows users can run a basic CLI command in Git Bash on their first attempt after npm install.
- **SC-003**: Windows validation runs report zero occurrences of incompatible platform errors during CLI startup.
- **SC-004**: At least 90% of surveyed Windows users rate the startup guidance as clear or very clear when a launch fails.
- **SC-005**: Windows-related startup support requests decrease by at least 50% within 30 days of release.
