# Feature Specification: Install Script and Onboarding Instructions

**Feature Branch**: `038-add-install-script`  
**Created**: 2026-02-11  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/90"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install via curl command (Priority: P1)

A first-time user wants a single command they can copy and run to install the tool without reading long setup steps.

**Why this priority**: The request centers on adding an install script, and this is the fastest path from discovery to first successful use.

**Independent Test**: Can be fully tested by following the documented curl-based command from the landing page or docs and confirming the user reaches a successful installed state.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page, **When** they copy and run the curl-based install command, **Then** they can complete installation and see a clear verification step.
2. **Given** a user follows the curl-based install instructions, **When** a prerequisite is missing, **Then** the instructions clearly explain what is missing and how to proceed.

---

### User Story 2 - Install via npm command (Priority: P2)

A user who prefers package-manager workflows wants an npm install path that is as easy to follow as the curl option.

**Why this priority**: The issue explicitly asks for npm as an alternative install path, which broadens adoption for users who avoid shell scripts.

**Independent Test**: Can be fully tested by following the npm install instructions from docs and confirming the user reaches the same successful installed state.

**Acceptance Scenarios**:

1. **Given** a user is on the docs install page, **When** they use the npm install path, **Then** installation completes and they can run a verification command.
2. **Given** npm is unavailable on the user's environment, **When** they attempt the npm path, **Then** the instructions direct them to a workable alternative.

---

### User Story 3 - Choose install method from hero section (Priority: P3)

A user evaluating the project wants to immediately see available install methods in the landing page hero so they can start without hunting through documentation.

**Why this priority**: The issue requires hero-level visibility for both install options, improving discoverability during first visit.

**Independent Test**: Can be tested by loading the landing page and verifying the hero clearly presents both curl and npm install options with actionable commands.

**Acceptance Scenarios**:

1. **Given** a user lands on the homepage, **When** they view the hero section, **Then** they can see both curl and npm install commands without navigating away.
2. **Given** a user selects either method from the hero, **When** they follow the linked guidance, **Then** they are taken to complete, matching install instructions.

---

### Edge Cases

- What happens when a user copies a command from an outdated cached page version?
- How does the system handle install script download failures caused by connectivity or permissions issues?
- What happens when the user environment supports neither curl nor npm?
- How does guidance stay consistent when install commands are updated in one location but not the other?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an official curl-based installation path that users can execute with a single copied command.
- **FR-002**: The system MUST provide an official npm-based installation path that achieves the same installation outcome as the curl path.
- **FR-003**: The landing page hero MUST display both curl and npm installation options in a copy-ready format.
- **FR-004**: Documentation MUST include prerequisite checks and a post-install verification step for each installation method.
- **FR-005**: Installation guidance MUST include troubleshooting steps for common first-run failures (missing prerequisites, command failure, or permission issues).
- **FR-006**: Installation commands and expected outcomes MUST remain consistent between the landing page and documentation.
- **FR-007**: Users MUST be able to complete initial installation without account creation or additional onboarding gates.
- **FR-008**: The system MUST provide a clear next step after install (for example, where to find usage help) so users can move from install to first use.

### Key Entities *(include if feature involves data)*

- **Installation Method**: A user-selectable path for setup (curl or npm), including command text, prerequisites, and verification expectations.
- **Installation Guidance**: Canonical user-facing instructions for each method, including command, verification, and troubleshooting content.
- **First-Run Outcome**: The observable result of a completed install flow, including successful verification and clear next action.

### Assumptions

- This feature targets first-time users installing from project-controlled channels.
- Both installation methods are intended to be equally valid choices for supported user environments.
- "Similar to OpenCode's install script" means one-command simplicity and strong onboarding clarity, not strict behavioral parity.

### Dependencies

- Public distribution channels for both installation methods remain reachable to first-time users.
- The landing page and documentation content can be updated and published in the same release window to avoid mismatched guidance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time users can complete installation in under 5 minutes using either documented method.
- **SC-002**: At least 95% of first-time users can complete the post-install verification step on their first attempt.
- **SC-003**: 100% of landing page hero and install documentation reviews show both curl and npm methods present with copy-ready commands.
- **SC-004**: At least 85% of surveyed new users rate installation instructions as clear or very clear.
- **SC-005**: Installation-related support requests from new users decrease by at least 30% in the first 30 days after release versus the prior 30-day period.
