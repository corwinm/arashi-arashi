# Feature Specification: Complete Design Phase Documentation (D1-D7)

**Feature Branch**: `004-design-issues`  
**Created**: 2026-02-03  
**Status**: Draft  
**Input**: User description: "I want to complete the open design github issues D1-D7"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Core Architecture Documentation (Priority: P1)

As a developer starting work on the Arashi CLI implementation, I need comprehensive design documentation covering configuration, types, and CLI contracts so that I can build features consistently and avoid architectural mistakes.

**Why this priority**: These are foundational documents (D1-D3) that all implementation work depends on. Without clear configuration schemas, type definitions, and CLI contracts, developers will make inconsistent implementation choices leading to technical debt.

**Independent Test**: Can be fully tested by verifying that all three documents exist with complete sections, reviewing them for completeness against acceptance criteria, and confirming they can guide implementation decisions without ambiguity.

**Acceptance Scenarios**:

1. **Given** a developer needs to implement configuration loading, **When** they reference the Configuration Schema Design (D1), **Then** they find complete field definitions, validation rules, and example configurations
2. **Given** a developer needs to write TypeScript code, **When** they reference the Type System Design (D2), **Then** they find all interface definitions needed for type-safe development
3. **Given** a developer needs to implement a CLI command, **When** they reference the CLI Command Contracts (D3), **Then** they find complete command signatures, options, exit codes, and help text examples

---

### User Story 2 - Technical Contract Documentation (Priority: P1)

As a developer implementing core functionality, I need detailed contract documentation for the git wrapper API and worktree orchestration so that I can build reliable, well-tested internal APIs.

**Why this priority**: These documents (D4-D5) define critical internal contracts that multiple features depend on. The git wrapper is used throughout the application, and worktree orchestration is the core feature. Clear contracts prevent integration issues.

**Independent Test**: Can be tested by verifying both documents exist with complete function signatures, error handling strategies, and orchestration flows that implementation teams can follow without clarification requests.

**Acceptance Scenarios**:

1. **Given** a developer needs to implement git operations, **When** they reference the Git Wrapper API Design (D4), **Then** they find complete function signatures, error handling strategies, and parsing logic specifications
2. **Given** a developer needs to implement worktree coordination, **When** they reference the Worktree Orchestration Design (D5), **Then** they find complete flow diagrams, rollback mechanisms, and conflict resolution strategies

---

### User Story 3 - Extensibility and Developer Onboarding (Priority: P2)

As a contributor to the Arashi project, I need hook system documentation and a development setup guide so that I can extend the system with custom workflows and get my development environment running quickly.

**Why this priority**: These documents (D6-D7) enable extensibility and lower the barrier to contribution. While important, they can be completed after core architecture docs since they support rather than define the primary feature set.

**Independent Test**: Can be tested by a new contributor following the quickstart guide to set up their environment and by verifying the hook system documentation enables creation of custom hooks without code changes.

**Acceptance Scenarios**:

1. **Given** a user wants to add custom automation, **When** they reference the Hook System Design (D6), **Then** they find complete hook lifecycle documentation, environment variable definitions, and execution order
2. **Given** a new contributor wants to start development, **When** they follow the Development Setup Guide (D7), **Then** they can install dependencies, run tests, and build binaries without external help

---

### Edge Cases

- What happens when a design document reveals conflicting requirements with another document?
  - Resolution: Document the conflict in both files with a cross-reference and escalate for architectural decision
- What happens if implementation uncovers missing details in a design document?
  - Resolution: Design documents should be living documents - update them as implementation reveals gaps
- How do we ensure design documents stay synchronized with actual implementation?
  - Resolution: Link design documents to implementation tasks in issue tracker and require updates during code review

## Requirements *(mandatory)*

### Functional Requirements

#### D1: Configuration Schema Design
- **FR-001**: Document MUST define config.json schema with fields: version, repos_dir, worktree_strategy, auto_setup, discovered_repos
- **FR-002**: Document MUST define discovered_repos structure with fields: path, default_branch, remote, has_setup_script, git_url
- **FR-003**: Document MUST define configuration version migration path
- **FR-004**: Document MUST define validation rules for each field
- **FR-005**: Document MUST define default values with rationale
- **FR-006**: Document MUST include example configuration with inline comments

#### D2: Type System Design
- **FR-007**: Document MUST define ArashiConfig interface matching configuration schema
- **FR-008**: Document MUST define RepoConfig interface for repository metadata
- **FR-009**: Document MUST define WorktreeInfo interface with fields: path, branch, status, sub_repos
- **FR-010**: Document MUST define OperationLogEntry interface for rollback tracking
- **FR-011**: Document MUST define command option interfaces for all commands
- **FR-012**: Document MUST define ArashiError class with exit codes
- **FR-013**: Document MUST define HookContext interface for environment variables

#### D3: CLI Command Contracts
- **FR-014**: Document MUST define arashi init command signature and behavior
- **FR-015**: Document MUST define arashi add command signature and behavior
- **FR-016**: Document MUST define arashi create command signature and behavior
- **FR-017**: Document MUST define arashi remove command signature and behavior
- **FR-018**: Document MUST define arashi list command signature and behavior
- **FR-019**: Document MUST define arashi status command signature and behavior
- **FR-020**: Document MUST define arashi setup command signature and behavior
- **FR-021**: Document MUST define exit codes: 0=success, 1=error, 2=user abort
- **FR-022**: Document MUST include help text and examples for each command

#### D4: Git Wrapper API Design
- **FR-023**: Document MUST define function signatures for repository detection utilities
- **FR-024**: Document MUST define function signatures for worktree operations
- **FR-025**: Document MUST define function signatures for branch operations
- **FR-026**: Document MUST define error handling strategy with ArashiError
- **FR-027**: Document MUST design git command execution wrapper using Bun's spawn
- **FR-028**: Document MUST define git output parsing strategies

#### D5: Worktree Orchestration Design
- **FR-029**: Document MUST design complete worktree creation flow
- **FR-030**: Document MUST define OperationLog structure for rollback tracking
- **FR-031**: Document MUST design rollback execution mechanism
- **FR-032**: Document MUST define branch conflict resolution dialog
- **FR-033**: Document MUST design repository selection logic (all, --only, interactive)
- **FR-034**: Document MUST define setup script execution strategies
- **FR-035**: Document MUST design error aggregation and reporting

#### D6: Hook System Design
- **FR-036**: Document MUST design hook discovery mechanism
- **FR-037**: Document MUST design hook validation for execute permissions
- **FR-038**: Document MUST define hook execution order
- **FR-039**: Document MUST define environment variables passed to hooks
- **FR-040**: Document MUST define hook timeout and failure handling
- **FR-041**: Document MUST design hook output capture strategy
- **FR-042**: Document MUST define --no-hooks flag behavior

#### D7: Development Setup Guide
- **FR-043**: Document MUST include Bun installation instructions
- **FR-044**: Document MUST explain repository structure
- **FR-045**: Document MUST document dependency installation process
- **FR-046**: Document MUST document development testing workflow
- **FR-047**: Document MUST document test execution
- **FR-048**: Document MUST document binary building process
- **FR-049**: Document MUST include debugging setup example
- **FR-050**: Document MUST link to contribution guidelines

### Key Entities

- **Design Document**: A markdown file containing architectural decisions, contracts, or guides; includes sections defined by acceptance criteria; stored in specs/001-git-worktree-manager/ directory
- **Configuration Schema**: JSON structure definition with field types, validation rules, and default values
- **Type Definition**: TypeScript interface or class definition with properties and methods
- **CLI Contract**: Command specification including signature, options, flags, exit codes, and help text
- **API Contract**: Function signature with parameter types, return types, and error handling behavior
- **Hook**: Executable shell script invoked at specific lifecycle points with defined environment variables

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All seven design documents (D1-D7) exist at specified file paths and are complete per acceptance criteria
- **SC-002**: Each document passes review checklist with 100% of required sections completed
- **SC-003**: Design documents contain zero [NEEDS CLARIFICATION] markers indicating all decisions are documented
- **SC-004**: Implementation teams can reference documents to complete foundation tasks (F1-F6, C1-C3) without requiring clarification from document authors
- **SC-005**: All GitHub issues D1-D7 (#7-#13) are closed with links to completed deliverable files
- **SC-006**: Documentation review by at least one other contributor confirms completeness and clarity
