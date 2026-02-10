# Feature Specification: Linter and Formatter Setup

**Feature Branch**: `030-setup-oxlint-oxfmt`  
**Created**: 2026-02-09  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/62"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Run consistent code quality checks (Priority: P1)

As a contributor, I can run standard linting and formatting checks for the Arashi repository so I can catch code quality issues before opening a pull request.

**Why this priority**: Reliable local quality checks are the core value of this feature and prevent avoidable review and CI failures.

**Independent Test**: Can be fully tested by running the repository quality-check commands in a sample change set and verifying lint and format results are reported consistently.

**Acceptance Scenarios**:

1. **Given** a contributor has modified source files, **When** they run the linting check, **Then** they receive clear pass/fail output for code quality violations.
2. **Given** a contributor has files with style deviations, **When** they run the formatting command, **Then** style issues are corrected or clearly reported so the contributor can resolve them.

---

### User Story 2 - Enforce standards in pull request validation (Priority: P2)

As a maintainer, I can rely on automated lint and format validation during pull request checks so only code that meets repository standards is merged.

**Why this priority**: Automated enforcement reduces manual review burden and keeps repository quality predictable, but depends on local tooling being usable first.

**Independent Test**: Can be fully tested by triggering pull request validation with both compliant and non-compliant changes and verifying the expected pass/fail outcomes.

**Acceptance Scenarios**:

1. **Given** a pull request with code that meets repository style and lint standards, **When** automated validation runs, **Then** the quality checks pass.
2. **Given** a pull request with lint or formatting violations, **When** automated validation runs, **Then** the quality checks fail and indicate that corrections are required before merge.

---

### User Story 3 - Onboard contributors quickly (Priority: P3)

As a new contributor, I can follow repository guidance to run linting and formatting checks without guessing commands so I can contribute with minimal setup friction.

**Why this priority**: Good onboarding improves contributor experience and consistency, but remains secondary to having the checks and enforcement in place.

**Independent Test**: Can be fully tested by having a contributor unfamiliar with the repository follow documented steps and complete lint and format checks successfully.

**Acceptance Scenarios**:

1. **Given** a new contributor cloned the repository, **When** they follow the documented workflow for quality checks, **Then** they can run lint and format checks without additional tribal knowledge.
2. **Given** a contributor encounters a quality-check failure, **When** they consult the documented guidance, **Then** they can identify required remediation steps.

### Edge Cases

- The repository contains generated, vendored, or external files that should not be reformatted.
- A file passes linting but still fails formatting, or vice versa.
- Contributors run checks from different entry points (for example full repo vs changed files) and receive inconsistent outcomes.
- Quality checks are run in an environment with missing prerequisites.
- Existing legacy files trigger many violations on first adoption and could block unrelated contributions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a standard linting workflow for repository source files.
- **FR-002**: The system MUST provide a standard formatting workflow for repository source files.
- **FR-003**: The system MUST define and apply a single set of linting rules for all contributors.
- **FR-004**: The system MUST define and apply a single set of formatting rules for all contributors.
- **FR-005**: The system MUST present linting results in a way that identifies failing files and the associated issues.
- **FR-006**: The system MUST present formatting results in a way that identifies changed or non-compliant files.
- **FR-007**: The system MUST expose repository-level commands or documented entry points so contributors can run lint and format workflows locally.
- **FR-008**: The system MUST include automated pull request validation that enforces lint and format standards before merge.
- **FR-009**: The system MUST fail validation when linting or formatting requirements are not met.
- **FR-010**: The system MUST document contributor-facing instructions for running quality checks and remediating failures.

### Key Entities *(include if feature involves data)*

- **Code Quality Rule Set**: The repository-approved linting and formatting standards that define valid source code quality.
- **Quality Check Run**: A single linting or formatting execution event with scope, outcome, and issue details.
- **Validation Outcome**: The pass/fail result used to determine whether a contribution satisfies repository quality gates.

### Assumptions

- The feature applies to the Arashi repository as referenced in the issue description.
- Existing repository automation can execute quality checks during pull request validation.
- Contributors are expected to run quality checks before opening or updating pull requests.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pull requests are evaluated by lint and format validation before merge eligibility is granted.
- **SC-002**: At least 95% of contributors can run repository quality checks successfully on first attempt using documented instructions.
- **SC-003**: In validation testing, 100% of intentionally non-compliant sample changes are rejected by automated quality checks.
- **SC-004**: Within one release cycle of adoption, formatting-related review comments decrease by at least 50% compared with the prior cycle.
