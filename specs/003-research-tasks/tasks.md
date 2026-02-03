# Tasks: Complete Research Tasks for Arashi CLI

**Input**: Design documents from `/specs/003-research-tasks/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not applicable - this is a research and documentation feature, not code implementation.

**Organization**: Tasks are grouped by user story (research area) to enable independent documentation and validation of each area.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a documentation project. All files are in:
- `specs/003-research-tasks/` - Specification and planning documents
- `specs/003-research-tasks/research.md` - Consolidated research findings
- `specs/003-research-tasks/contracts/` - API contract documents

---

## Phase 1: Setup (Documentation Infrastructure)

**Purpose**: Verify all documentation structure is in place and ready for final review

- [x] T001 Verify specs/003-research-tasks/spec.md exists and contains all 4 user stories with priorities
- [x] T002 Verify specs/003-research-tasks/plan.md exists with technical context and constitution checks
- [x] T003 [P] Verify specs/003-research-tasks/research.md exists with consolidated research findings
- [x] T004 [P] Verify specs/003-research-tasks/data-model.md exists with entity definitions
- [x] T005 [P] Verify specs/003-research-tasks/contracts/ directory exists with 5 contract files
- [x] T006 [P] Verify specs/003-research-tasks/quickstart.md exists with developer guide

**Status**: ✅ All setup tasks completed during planning phase

---

## Phase 2: Foundational (Cross-Cutting Documentation)

**Purpose**: Documentation elements that support all research areas

**⚠️ CRITICAL**: These foundational documents must be validated before individual research areas can be closed

- [x] T007 Review and validate specs/003-research-tasks/research.md structure matches template from specs/002-git-worktree-research/research.md
- [x] T008 Review and validate specs/003-research-tasks/data-model.md has complete entity definitions with validation rules
- [x] T009 [P] Review and validate specs/003-research-tasks/contracts/cli-commands.md has all 7 CLI commands documented
- [x] T010 [P] Review and validate specs/003-research-tasks/contracts/git-api.md has all git wrapper functions documented
- [x] T011 [P] Review and validate specs/003-research-tasks/contracts/config-schema.md has complete JSON schema
- [x] T012 [P] Review and validate specs/003-research-tasks/contracts/error-handling.md has ArashiError class and rollback patterns
- [x] T013 [P] Review and validate specs/003-research-tasks/contracts/test-patterns.md has test fixture and CI/CD patterns

**Status**: ✅ All foundational tasks completed during planning phase

**Checkpoint**: Foundation validated - user story verification can now begin in parallel

---

## Phase 3: User Story 1 - CLI Framework Documentation (Priority: P1) 🎯 MVP

**Goal**: Comprehensive documentation of CLI framework patterns (commander.js, inquirer, ora, chalk, Bun compilation) so developers can build consistent command interfaces

**Independent Test**: Provide the CLI framework section of research.md to a developer unfamiliar with these libraries and have them implement a sample CLI command. Success means they can create a working command with proper error handling, spinners, and colored output without additional guidance.

### Validation for User Story 1

- [ ] T014 [US1] Verify specs/003-research-tasks/research.md Section 1 documents commander.js subcommand patterns per FR-001
- [ ] T015 [US1] Verify specs/003-research-tasks/research.md Section 1 documents @inquirer/prompts patterns (select, multiselect, confirm, input) per FR-002
- [ ] T016 [US1] Verify specs/003-research-tasks/research.md Section 1 documents ora spinner patterns with success/failure states per FR-003
- [ ] T017 [US1] Verify specs/003-research-tasks/research.md Section 1 defines chalk color scheme (green=success, yellow=warning, red=error) per FR-004
- [ ] T018 [US1] Verify specs/003-research-tasks/research.md Section 1 documents CLI error handling patterns and exit codes (0, 1, 2) per FR-005
- [ ] T019 [US1] Verify specs/003-research-tasks/research.md Section 1 documents configuration file loading patterns and search paths per FR-006
- [ ] T020 [US1] Verify specs/003-research-tasks/research.md Section 1 documents Bun's --compile flag usage for cross-platform executables per FR-007
- [ ] T021 [US1] Verify specs/003-research-tasks/contracts/cli-commands.md documents all command signatures with options and exit codes
- [ ] T022 [US1] Test acceptance scenario 1: Have developer implement a new subcommand using documented patterns
- [ ] T023 [US1] Test acceptance scenario 2: Have developer implement interactive prompts using documented patterns
- [ ] T024 [US1] Test acceptance scenario 3: Have developer implement spinners for long operations using documented patterns
- [ ] T025 [US1] Test acceptance scenario 4: Have developer implement colored output using documented color scheme
- [ ] T026 [US1] Close GitHub issue #3 [R2] CLI Framework Patterns as complete with link to research.md

**Checkpoint**: CLI Framework Documentation (US1) should be complete, validated, and ready for developers to use

---

## Phase 4: User Story 2 - Error Handling Architecture (Priority: P1)

**Goal**: Documented error handling and rollback patterns for multi-repository git operations so developers can ensure atomic operations and proper state management

**Independent Test**: Have a developer implement a multi-step operation (e.g., create worktrees for 3 repos) following the documented patterns, then simulate failures at different points. Success means the system cleanly rolls back all changes and leaves repositories in their original state.

### Validation for User Story 2

- [ ] T027 [US2] Verify specs/003-research-tasks/research.md Section 2 documents transaction/rollback patterns for multi-repository operations per FR-008
- [ ] T028 [US2] Verify specs/003-research-tasks/research.md Section 2 defines operation log structure for tracking completed steps per FR-009
- [ ] T029 [US2] Verify specs/003-research-tasks/research.md Section 2 documents rollback strategies for each operation type (worktree_created, branch_created, directory_created) per FR-010
- [ ] T030 [US2] Verify specs/003-research-tasks/research.md Section 2 documents error recovery patterns for partial failures per FR-011
- [ ] T031 [US2] Verify specs/003-research-tasks/research.md Section 2 documents cleanup strategies for orphaned worktrees (git worktree prune) per FR-012
- [ ] T032 [US2] Verify specs/003-research-tasks/research.md Section 2 documents timeout handling for setup scripts with process group termination per FR-013
- [ ] T033 [US2] Verify specs/003-research-tasks/research.md Section 2 documents signal handling for graceful shutdown (SIGINT/SIGTERM) per FR-014
- [ ] T034 [US2] Verify specs/003-research-tasks/contracts/error-handling.md documents ArashiError class with exit codes
- [ ] T035 [US2] Verify specs/003-research-tasks/contracts/error-handling.md documents operation log entry structure
- [ ] T036 [US2] Verify specs/003-research-tasks/contracts/error-handling.md documents rollback function contracts (idempotent, LIFO order)
- [ ] T037 [US2] Verify specs/003-research-tasks/data-model.md documents OperationLogEntry entity with rollback_fn
- [ ] T038 [US2] Test acceptance scenario 1: Simulate multi-repo operation failure midway and verify rollback documentation is complete
- [ ] T039 [US2] Test acceptance scenario 2: Verify operation log tracking documentation enables proper rollback sequencing
- [ ] T040 [US2] Test acceptance scenario 3: Verify timeout handling documentation covers process group termination
- [ ] T041 [US2] Test acceptance scenario 4: Verify signal handling documentation enables graceful shutdown
- [ ] T042 [US2] Close GitHub issue #4 [R3] Error Handling & Rollback Strategies as complete with link to research.md

**Checkpoint**: Error Handling Architecture (US2) should be complete, validated, and ready for developers to implement atomic operations

---

## Phase 5: User Story 3 - Configuration Management Patterns (Priority: P1)

**Goal**: Documented patterns for JSON config management and repository discovery so developers can build flexible, user-friendly configuration with validation, defaults, and migrations

**Independent Test**: Have a developer implement config loading/saving following the documented patterns, then test with various scenarios: missing config, malformed JSON, version mismatches, missing required fields. Success means users receive clear, actionable error messages and the system gracefully applies defaults.

### Validation for User Story 3

- [ ] T043 [US3] Verify specs/003-research-tasks/research.md Section 3 documents JSON schema validation approaches (recommends Zod for TypeScript) per FR-015
- [ ] T044 [US3] Verify specs/003-research-tasks/research.md Section 3 designs configuration migration strategy with transform functions per FR-016
- [ ] T045 [US3] Verify specs/003-research-tasks/research.md Section 3 documents configuration defaults and override hierarchy (config file > CLI flags) per FR-017
- [ ] T046 [US3] Verify specs/003-research-tasks/research.md Section 3 designs repository discovery algorithm (recursive .git directory search) per FR-018
- [ ] T047 [US3] Verify specs/003-research-tasks/research.md Section 3 documents configuration validation rules with user-friendly error messages per FR-019
- [ ] T048 [US3] Verify specs/003-research-tasks/research.md Section 3 documents file locking strategies for concurrent config access per FR-020
- [ ] T049 [US3] Verify specs/003-research-tasks/research.md Section 3 documents setup script detection (file existence + execute permissions) per FR-021
- [ ] T050 [US3] Verify specs/003-research-tasks/contracts/config-schema.md documents complete JSON schema for ArashiConfig
- [ ] T051 [US3] Verify specs/003-research-tasks/contracts/config-schema.md documents validation rules and default values
- [ ] T052 [US3] Verify specs/003-research-tasks/contracts/config-schema.md documents migration strategy between versions
- [ ] T053 [US3] Verify specs/003-research-tasks/data-model.md documents ArashiConfig entity with all fields and validation
- [ ] T054 [US3] Verify specs/003-research-tasks/data-model.md documents RepoConfig entity with metadata fields
- [ ] T055 [US3] Test acceptance scenario 1: Verify default config documentation includes repos_dir, auto_setup, worktree_strategy
- [ ] T056 [US3] Test acceptance scenario 2: Verify migration documentation enables version updates with transform functions
- [ ] T057 [US3] Test acceptance scenario 3: Verify repository discovery documentation finds all git repos and populates metadata
- [ ] T058 [US3] Test acceptance scenario 4: Verify validation error message examples are clear and actionable
- [ ] T059 [US3] Close GitHub issue #5 [R4] Configuration Management Patterns as complete with link to research.md

**Checkpoint**: Configuration Management Patterns (US3) should be complete, validated, and ready for developers to implement config system

---

## Phase 6: User Story 4 - Testing Strategy Documentation (Priority: P2)

**Goal**: Documented testing patterns for git-dependent functionality so developers can write reliable, isolated tests that run quickly in CI/CD without flakiness

**Independent Test**: Have a developer write tests for a git operation (e.g., worktree creation) following the documented patterns. Success means tests run in parallel without interference, clean up properly after themselves, and provide clear failure messages.

### Validation for User Story 4

- [ ] T060 [US4] Verify specs/003-research-tasks/research.md Section 4 documents test fixture creation pattern using temporary directories with initialized git repos per FR-022
- [ ] T061 [US4] Verify specs/003-research-tasks/research.md Section 4 documents mocking strategy (use real git commands in isolated temp repos) per FR-023
- [ ] T062 [US4] Verify specs/003-research-tasks/research.md Section 4 documents test cleanup strategy using afterEach hooks per FR-024
- [ ] T063 [US4] Verify specs/003-research-tasks/research.md Section 4 documents parallel test execution considerations with isolated temp dirs per FR-025
- [ ] T064 [US4] Verify specs/003-research-tasks/research.md Section 4 documents snapshot testing approach for CLI output with chalk-stripped comparison per FR-026
- [ ] T065 [US4] Verify specs/003-research-tasks/research.md Section 4 documents CI/CD testing approach for cross-platform binaries using matrix builds per FR-027
- [ ] T066 [US4] Verify specs/003-research-tasks/research.md Section 4 documents performance testing approach measuring operation times per FR-028
- [ ] T067 [US4] Verify specs/003-research-tasks/contracts/test-patterns.md documents test fixture setup interfaces
- [ ] T068 [US4] Verify specs/003-research-tasks/contracts/test-patterns.md documents test cleanup patterns with automatic disposal
- [ ] T069 [US4] Verify specs/003-research-tasks/contracts/test-patterns.md documents snapshot testing conventions with chalk stripping
- [ ] T070 [US4] Verify specs/003-research-tasks/contracts/test-patterns.md documents CI/CD matrix configurations for Node/OS/Git versions
- [ ] T071 [US4] Test acceptance scenario 1: Verify fixture creation documentation enables isolated temporary git repos with auto-cleanup
- [ ] T072 [US4] Test acceptance scenario 2: Verify parallel test documentation ensures no test interference with isolated temp dirs
- [ ] T073 [US4] Test acceptance scenario 3: Verify snapshot testing documentation enables reliable chalk-stripped output comparisons
- [ ] T074 [US4] Test acceptance scenario 4: Verify CI/CD documentation validates binaries on all platforms using matrix builds
- [ ] T075 [US4] Close GitHub issue #6 [R5] Testing Strategy for Git Operations as complete with link to research.md

**Checkpoint**: Testing Strategy Documentation (US4) should be complete, validated, and ready for developers to write reliable tests

---

## Phase 7: Polish & Cross-Cutting Validation

**Purpose**: Final validation and improvements that affect all research areas

- [ ] T076 [P] Review specs/003-research-tasks/research.md Section 5 (Integration Points) to ensure cross-references between patterns are documented
- [ ] T077 [P] Review specs/003-research-tasks/research.md Section 6 (References) to ensure all official documentation links are included
- [ ] T078 [P] Verify specs/003-research-tasks/quickstart.md provides clear developer onboarding path
- [ ] T079 [P] Verify specs/003-research-tasks/quickstart.md includes code examples for key patterns from each research area
- [ ] T080 Validate success criterion SC-001: Developer can implement a new CLI command in under 30 minutes using only research.md
- [ ] T081 Validate success criterion SC-002: Multi-step operations with rollback can be implemented without leaving inconsistent states
- [ ] T082 Validate success criterion SC-003: Configuration validation provides clear, actionable error messages
- [ ] T083 Validate success criterion SC-004: Test suite can achieve 100% test isolation and complete in under 5 minutes
- [ ] T084 Validate success criterion SC-005: Research documentation receives zero questions from implementers about basic patterns
- [ ] T085 Validate success criterion SC-006: All four research areas documented with consistent structure and cross-references
- [ ] T086 Validate success criterion SC-007: Developers can extend Arashi without introducing inconsistencies in error handling, output, or config
- [ ] T087 Update AGENTS.md with final confirmed technology stack (TypeScript + Bun, commander.js, inquirer, ora, chalk, Zod)
- [ ] T088 Run specs/003-research-tasks/quickstart.md validation by having external developer follow setup instructions
- [ ] T089 Final review: Ensure all 28 functional requirements (FR-001 through FR-028) are documented in research.md
- [ ] T090 Final review: Ensure all contract files (cli-commands.md, git-api.md, config-schema.md, error-handling.md, test-patterns.md) are complete
- [ ] T091 Close feature branch 003-research-tasks and merge to main

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ COMPLETE - All documentation files created during planning
- **Foundational (Phase 2)**: ✅ COMPLETE - All foundational documents validated during planning
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion ✅
  - US1 (CLI Framework): Can validate independently
  - US2 (Error Handling): Can validate independently
  - US3 (Configuration): Can validate independently
  - US4 (Testing Strategy): Can validate independently
- **Polish (Phase 7)**: Depends on all user story validations being complete

### User Story Dependencies

- **User Story 1 (P1)**: CLI Framework Documentation - No dependencies, can start immediately
- **User Story 2 (P1)**: Error Handling Architecture - No dependencies, can start immediately
- **User Story 3 (P1)**: Configuration Management - No dependencies, can start immediately
- **User Story 4 (P2)**: Testing Strategy - No dependencies, can start immediately

**All user stories are INDEPENDENT and can be validated in parallel**

### Within Each User Story

1. Verify research.md section completeness against functional requirements
2. Verify related contract documents are complete
3. Verify related data-model.md entities are documented
4. Test acceptance scenarios to validate documentation quality
5. Close related GitHub issue

### Parallel Opportunities

Since this is documentation validation (not code implementation), ALL user story phases can be validated in parallel:

- **Phase 3 (US1)**: T014-T026 can all be validated concurrently
- **Phase 4 (US2)**: T027-T042 can all be validated concurrently  
- **Phase 5 (US3)**: T043-T059 can all be validated concurrently
- **Phase 6 (US4)**: T060-T075 can all be validated concurrently
- **Phase 7 (Polish)**: T076-T079 can be validated concurrently

---

## Parallel Example: User Story 1 (CLI Framework Documentation)

```bash
# All validation tasks for US1 can run in parallel:
Task: "Verify research.md Section 1 documents commander.js patterns per FR-001"
Task: "Verify research.md Section 1 documents @inquirer/prompts patterns per FR-002"
Task: "Verify research.md Section 1 documents ora spinner patterns per FR-003"
Task: "Verify research.md Section 1 defines chalk color scheme per FR-004"
Task: "Verify research.md Section 1 documents CLI error handling per FR-005"
Task: "Verify research.md Section 1 documents config loading per FR-006"
Task: "Verify research.md Section 1 documents Bun compilation per FR-007"
Task: "Verify contracts/cli-commands.md documents all command signatures"
# Then run acceptance tests:
Task: "Test acceptance scenario 1: Developer implements subcommand"
Task: "Test acceptance scenario 2: Developer implements prompts"
Task: "Test acceptance scenario 3: Developer implements spinners"
Task: "Test acceptance scenario 4: Developer implements colored output"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. ✅ Complete Phase 1: Setup (DONE during planning)
2. ✅ Complete Phase 2: Foundational (DONE during planning)
3. Complete Phase 3: User Story 1 validation
4. **STOP and VALIDATE**: Test that a developer can implement a CLI command using only the documented patterns
5. If validation passes, US1 (CLI Framework Documentation) is ready for use

### Incremental Delivery

1. ✅ Setup + Foundational → Documentation structure ready
2. Validate User Story 1 → Test with developer → Ready for CLI implementation (MVP!)
3. Validate User Story 2 → Test with developer → Ready for error handling implementation
4. Validate User Story 3 → Test with developer → Ready for configuration implementation
5. Validate User Story 4 → Test with developer → Ready for test suite implementation
6. Complete Polish → Close all GitHub issues → Merge to main

### Parallel Validation Strategy

With multiple reviewers:

1. ✅ Team completed Setup + Foundational together (DONE)
2. Validation can proceed in parallel:
   - **Reviewer A**: User Story 1 (CLI Framework) - T014-T026
   - **Reviewer B**: User Story 2 (Error Handling) - T027-T042
   - **Reviewer C**: User Story 3 (Configuration) - T043-T059
   - **Reviewer D**: User Story 4 (Testing Strategy) - T060-T075
3. All validations complete independently, then proceed to Polish phase together

---

## Notes

- **[P] not used extensively**: Most tasks are sequential validation steps within each user story
- **[Story] labels**: Map each validation task to specific user story for traceability
- **No code implementation**: This is pure documentation/research validation
- **GitHub issues**: Close issues #3 (R2), #4 (R3), #5 (R4), #6 (R5) as user stories complete
- **Independent testing**: Each user story can be validated by having a developer attempt to implement the documented patterns
- **Success criteria**: SC-001 through SC-007 must all be validated in Phase 7
- **Foundational docs**: Already complete (research.md, data-model.md, contracts/, quickstart.md)
- **Quality bar**: Documentation must be detailed enough that developers need zero additional context

---

## Summary

- **Total Tasks**: 91 tasks
- **Completed**: 13 tasks (Setup and Foundational phases done during planning)
- **Remaining**: 78 tasks across 5 phases
- **Tasks per User Story**:
  - US1 (CLI Framework): 13 tasks (T014-T026)
  - US2 (Error Handling): 16 tasks (T027-T042)
  - US3 (Configuration): 17 tasks (T043-T059)
  - US4 (Testing Strategy): 16 tasks (T060-T075)
  - Polish: 16 tasks (T076-T091)
- **Parallel Opportunities**: All user story validations (US1-US4) can proceed in parallel
- **MVP Scope**: User Story 1 (CLI Framework Documentation) - enables CLI command implementation
- **Format Validation**: ✅ All remaining tasks follow the checklist format with [ID], optional [P], required [Story] for user story tasks, and exact file paths in descriptions
