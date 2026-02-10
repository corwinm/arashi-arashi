# Feature Specification: Audit README Documentation

**Feature Branch**: `031-audit-readmes`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/77"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Align README Content to Current Product State (Priority: P1)

As a project maintainer, I need README content to accurately describe what is currently implemented so users and contributors are not misled.

**Why this priority**: Outdated capability descriptions create immediate confusion, reduce trust, and increase support overhead.

**Independent Test**: Review all README feature and usage claims against current project behavior and repository artifacts; each claim is either corrected or removed.

**Acceptance Scenarios**:

1. **Given** a README section that describes a capability that no longer exists, **When** the documentation audit is completed, **Then** that section is updated or removed.
2. **Given** a capability that is implemented but undocumented, **When** the documentation audit is completed, **Then** the README includes accurate user-facing guidance for it.

---

### User Story 2 - Surface Key Project Status at a Glance (Priority: P2)

As a repository visitor, I want key status indicators in the README header so I can quickly evaluate package, build, and licensing status.

**Why this priority**: Quick trust and adoption decisions depend on immediately visible project health signals.

**Independent Test**: Open the main README and verify required badges are present, visible at the top, and link to correct destinations.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the repository homepage, **When** they view the README header, **Then** they can see npm package status, CI status, and license badges without scrolling.
2. **Given** a badge is displayed, **When** it is selected, **Then** it resolves to a relevant and valid destination.

---

### User Story 3 - Clarify Contribution Path and SDD Framework Support (Priority: P3)

As a contributor or evaluator, I need contribution guidance in a standard location and a clear support matrix for spec-driven development frameworks.

**Why this priority**: This improves onboarding and sets clear expectations about workflow/tool compatibility.

**Independent Test**: Confirm contribution content is moved to a standalone contribution guide with README linkage, and verify a framework support section includes Spec-Kit, OpenSpec, Kiro, and additional common frameworks.

**Acceptance Scenarios**:

1. **Given** a contributor looking for contribution instructions, **When** they open the README, **Then** they can reach the dedicated contribution guide in one step.
2. **Given** a user evaluating spec-driven workflows, **When** they review the support section, **Then** they can compare support levels and notable caveats per framework.

---

### Edge Cases

- Required status badge data is temporarily unavailable; documentation still renders clearly and does not show broken formatting.
- Some repositories in the workspace do not yet publish packages; badge expectations are adjusted to only include applicable signals.
- Framework support status is partial or conditional; caveats are stated explicitly to avoid overstating support.
- Existing contribution content appears in multiple README files; all references point to the same canonical contribution guide after migration.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Documentation MUST be audited so README claims match currently implemented project behavior.
- **FR-002**: Outdated or inaccurate README statements MUST be corrected or removed.
- **FR-003**: Missing high-value README content for existing implemented capabilities MUST be added.
- **FR-004**: Contribution guidance MUST be moved from README content into a dedicated contribution document using a standard contribution filename convention.
- **FR-005**: The README MUST contain a clear pointer to the dedicated contribution document.
- **FR-006**: The README header MUST display badges for npm package status, CI status, and license status when applicable.
- **FR-007**: Badge links MUST resolve to relevant, non-broken destinations.
- **FR-008**: The README MUST include a section that compares support levels for spec-driven development frameworks.
- **FR-009**: The framework support section MUST include Spec-Kit, OpenSpec, and Kiro, plus at least one additional commonly used framework.
- **FR-010**: Framework support descriptions MUST include clear qualifiers when support requires project-specific modifications.
- **FR-011**: Documentation updates MUST preserve consistent terminology and avoid conflicting statements across documentation entry points.

### Key Entities *(include if feature involves data)*

- **README Section**: A user-facing documentation block covering capabilities, status indicators, workflow support, and navigation links.
- **Contribution Guide**: A standalone contributor instruction document referenced from README content.
- **Status Badge**: A visual status indicator with label, value state, and destination link.
- **Framework Support Entry**: A row-like record capturing framework name, support level, and caveats/limitations.

### Assumptions

- The standard contribution filename convention is `CONTRIBUTING.md` unless an existing project-wide convention takes precedence.
- "Applicable" badges are determined by whether the project currently exposes that signal (for example, package publication status).
- "Additional commonly used framework" is selected based on mainstream spec-driven workflow adoption.

### Dependencies

- Current implementation behavior must be available and reviewable so documentation claims can be verified.
- Repository metadata and external badge endpoints must be reachable to validate badge targets.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of README capability claims reviewed in this scope are verified as accurate or are corrected before release.
- **SC-002**: 100% of required header badges (npm, CI, license) that apply to the project are visible at the top of the README and use valid links.
- **SC-003**: 90% of new contributors can locate contribution instructions from the README in 30 seconds or less during a walkthrough test.
- **SC-004**: The spec-driven framework support section includes at least four frameworks and clearly states support level and caveats for each.
