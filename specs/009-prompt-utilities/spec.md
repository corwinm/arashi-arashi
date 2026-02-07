# Feature Specification: Prompt Utilities

**Feature Branch**: `009-prompt-utilities`  
**Created**: 2026-02-04  
**Status**: Draft  
**Input**: User description: "Implement user interaction utilities in src/lib/prompts.ts using @inquirer/prompts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Yes/No Confirmations (Priority: P1)

Developers need to ask users for confirmation before performing potentially dangerous or irreversible operations.

**Why this priority**: Critical safety feature for all destructive operations (delete, overwrite, etc.).

**Independent Test**: Can be fully tested by presenting confirmation prompts and verifying responses, delivering immediate value for safe command execution.

**Acceptance Scenarios**:

1. **Given** a confirmation question, **When** developer calls `confirm()` with a message, **Then** the user is prompted with yes/no options
2. **Given** a default value of true, **When** user presses Enter without input, **Then** true is returned
3. **Given** a default value of false, **When** user presses Enter without input, **Then** false is returned
4. **Given** user enters 'y' or 'yes', **When** developer calls `confirm()`, **Then** true is returned
5. **Given** user enters 'n' or 'no', **When** developer calls `confirm()`, **Then** false is returned

---

### User Story 2 - Single Selection (Priority: P1)

Developers need to present users with a list of options and allow them to select exactly one item.

**Why this priority**: Essential for branch selection, configuration choices, and navigation menus.

**Independent Test**: Can be fully tested by presenting choice lists and verifying selected value, delivering immediate value for any selection workflow.

**Acceptance Scenarios**:

1. **Given** a list of choices, **When** developer calls `select()`, **Then** user can navigate and select one option
2. **Given** user navigates with arrow keys, **When** user presses Enter, **Then** the highlighted choice is returned
3. **Given** a list with descriptions, **When** choices are displayed, **Then** both labels and descriptions are visible
4. **Given** an empty choice list, **When** developer calls `select()`, **Then** an appropriate error is thrown

---

### User Story 3 - Multiple Selection (Priority: P2)

Developers need to allow users to select multiple items from a list using checkboxes.

**Why this priority**: Important for batch operations but not as critical as single selection for core workflows.

**Independent Test**: Can be fully tested by presenting checkbox lists and verifying multiple selections, delivering immediate value for batch operations.

**Acceptance Scenarios**:

1. **Given** a list of choices, **When** developer calls `multiSelect()`, **Then** user can check/uncheck multiple options
2. **Given** user toggles checkboxes with spacebar, **When** user presses Enter, **Then** all checked items are returned as an array
3. **Given** no items are selected, **When** user presses Enter, **Then** an empty array is returned
4. **Given** all items are selected, **When** user presses Enter, **Then** all items are returned in the array

---

### User Story 4 - Text Input (Priority: P2)

Developers need to collect free-form text input from users for names, paths, or custom values.

**Why this priority**: Common operation but less critical than confirmation and selection for core CLI flows.

**Independent Test**: Can be fully tested by prompting for input and verifying entered text, delivering immediate value for custom configuration.

**Acceptance Scenarios**:

1. **Given** an input prompt, **When** developer calls `input()`, **Then** user can type free-form text
2. **Given** a default value, **When** user presses Enter without input, **Then** the default value is returned
3. **Given** user enters text, **When** user presses Enter, **Then** the entered text is returned
4. **Given** user enters empty string and no default, **When** user presses Enter, **Then** empty string is returned

---

### User Story 5 - Graceful Interruption (Priority: P1)

Users need to be able to cancel operations at any time without leaving the CLI in an inconsistent state.

**Why this priority**: Critical for user control and preventing stuck or unresponsive CLI states.

**Independent Test**: Can be fully tested by pressing Ctrl+C during prompts and verifying exit behavior, delivering immediate value for user experience.

**Acceptance Scenarios**:

1. **Given** any active prompt, **When** user presses Ctrl+C, **Then** the process exits with code 2
2. **Given** Ctrl+C is pressed, **When** process exits, **Then** terminal is restored to normal state (no leftover UI elements)
3. **Given** nested or sequential prompts, **When** user presses Ctrl+C, **Then** all prompts are cancelled immediately

---

### Edge Cases

- What happens when terminal doesn't support interactive prompts (piped input)?
- How does system handle very long choice lists (more than terminal height)?
- What happens when choice labels contain special characters or ANSI codes?
- How does system handle rapid input before prompt is fully rendered?
- What happens when terminal is resized during prompt display?
- How does system handle Unicode characters in prompts and choices?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a function for yes/no confirmation prompts
- **FR-002**: System MUST provide a function for single-choice selection from a list
- **FR-003**: System MUST provide a function for multiple-choice selection from a list
- **FR-004**: System MUST provide a function for free-form text input
- **FR-005**: Confirmation prompts MUST support default values
- **FR-006**: Text input prompts MUST support default values
- **FR-007**: Selection lists MUST support keyboard navigation (arrow keys, Enter)
- **FR-008**: Multiple selection MUST support checkbox toggling (spacebar)
- **FR-009**: System MUST handle Ctrl+C gracefully with exit code 2
- **FR-010**: System MUST restore terminal state after exit or cancellation
- **FR-011**: Choice lists MUST display both labels and optional descriptions
- **FR-012**: System MUST work in standard terminal environments

### Key Entities

- **Prompt**: An interactive question displayed to users requiring input
- **Choice**: An option in a selection list with label and optional description
- **Input**: User-provided data in response to a prompt (text, selection, or confirmation)
- **Default Value**: A pre-selected or pre-filled value used when user provides no input

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Prompts render within 50ms of function call for typical use cases
- **SC-002**: Selection lists handle at least 1000 choices without performance degradation
- **SC-003**: 100% of Ctrl+C interruptions result in clean exit with proper terminal restoration
- **SC-004**: Prompts work correctly on terminals with heights from 24 to 200 lines
- **SC-005**: Functions are covered by unit tests with at least 90% code coverage
