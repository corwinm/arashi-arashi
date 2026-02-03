# Implementation Plan: Complete Research Tasks for Arashi CLI

**Branch**: `003-research-tasks` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-research-tasks/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Complete research and documentation for four critical technical areas required for Arashi CLI implementation: CLI framework patterns (commander.js, inquirer, ora, chalk), error handling and rollback mechanisms for multi-repository operations, configuration management patterns for JSON configs and repository discovery, and testing strategies for git-dependent functionality. This research phase (P0) provides the technical foundation needed for design and implementation phases.

## Technical Context

**Language/Version**: TypeScript + Bun (latest stable version for bundling and runtime)  
**Primary Dependencies**: 
- commander.js (CLI framework - version TBD in research)
- @inquirer/prompts (interactive prompts - version TBD in research)
- ora (terminal spinners - version TBD in research)
- chalk (terminal colors - version TBD in research)

**Storage**: 
- JSON configuration files (.arashi/config.json)
- Git repository metadata (leveraging git commands, no additional storage)

**Testing**: Bun's built-in test runner  
**Target Platform**: Cross-platform (macOS ARM64, Linux x64, Windows x64) via Bun's `--compile` flag  
**Project Type**: Single CLI application (will be packaged as standalone executable)  
**Performance Goals**: 
- Worktree creation for 5 repos: < 30 seconds (excluding network I/O)
- Status checks: < 5 seconds for 5 repos
- List operations: < 2 seconds

**Constraints**: 
- Single-file executable < 50MB
- No external runtime dependencies (Bun bundled)
- Test suite completes in < 5 minutes
- >80% code coverage

**Scale/Scope**: 
- Support meta-repositories with 5-20 sub-repositories
- Handle worktree operations across multiple git repositories
- Documentation must be comprehensive enough for developers to implement without additional guidance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Single-File Executable ✅
**Status**: COMPLIANT  
**Justification**: Research task - no implementation. Final implementation will use Bun's `--compile` flag (this is part of the research to document in FR-007).

### II. Automatic Worktree Management ✅
**Status**: COMPLIANT  
**Justification**: Research task documenting patterns that enable coordinated worktree management. Configuration management research (FR-015 to FR-021) and error handling research (FR-008 to FR-014) directly support this principle.

### III. Error Recovery & Rollback ✅
**Status**: COMPLIANT  
**Justification**: Core focus of User Story 2 (P1). FR-008 through FR-014 specifically document rollback patterns, operation logging, error recovery, and cleanup strategies.

### IV. User-Centric Interface ✅
**Status**: COMPLIANT  
**Justification**: Core focus of User Story 1 (P1). FR-001 through FR-007 document CLI framework patterns including progress indicators (ora spinners), colored output (chalk), interactive prompts (inquirer), and error formatting (commander.js).

### V. Minimalist Configuration ✅
**Status**: COMPLIANT  
**Justification**: Core focus of User Story 3 (P1). FR-018 documents repository auto-discovery algorithm, FR-017 documents defaults and override hierarchy, FR-021 documents auto-detection of setup scripts.

### VI. Cross-Platform Compatibility ✅
**Status**: COMPLIANT  
**Justification**: Research task. FR-007 specifically addresses Bun's `--compile` flag for cross-platform executables. FR-027 documents CI/CD testing for cross-platform binaries.

### VII. Test Coverage ✅
**Status**: COMPLIANT  
**Justification**: Core focus of User Story 4 (P2). FR-022 through FR-028 document comprehensive testing strategies including fixture creation, test isolation, snapshot testing, CI/CD approaches, and performance testing.

### VIII. Semantic Versioning ✅
**Status**: COMPLIANT  
**Justification**: Research task - no versioning impact. Documentation only.

### IX. Hook System ✅
**Status**: COMPLIANT  
**Justification**: FR-013 documents timeout handling for setup scripts, FR-021 documents setup script detection. Hook system patterns will be documented as part of error handling architecture.

### X. Performance Standards ✅
**Status**: COMPLIANT  
**Justification**: FR-028 specifically documents performance testing approach. Success criteria SC-004 requires test suite completion in < 5 minutes. Technical context defines performance goals aligned with constitution.

### Summary
**All constitution checks PASSED** - This research phase lays the technical foundation for implementing all constitutional principles in subsequent phases.

## Project Structure

### Documentation (this feature)

```text
specs/003-research-tasks/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (IN PROGRESS)
├── research.md          # Phase 0: Research findings and decisions
├── data-model.md        # Phase 1: Entity definitions and relationships
├── quickstart.md        # Phase 1: Developer quick-start guide
├── contracts/           # Phase 1: API/interface contracts
│   ├── cli-commands.md      # Command signatures and behaviors
│   ├── git-api.md           # Git wrapper function contracts
│   ├── config-schema.md     # Configuration file schema
│   ├── error-handling.md    # Error types and rollback contracts
│   └── test-patterns.md     # Testing interface patterns
└── tasks.md             # Phase 2: Implementation tasks (created by /speckit.tasks)
```

### Source Code (arashi repository - NOT created in this research phase)

```text
repos/arashi/
├── src/
│   ├── lib/              # Utility libraries
│   │   ├── git.ts            # Git command wrappers
│   │   ├── config.ts         # Configuration management
│   │   ├── filesystem.ts     # File system operations
│   │   ├── logger.ts         # Console output (chalk, ora)
│   │   ├── prompts.ts        # User interaction (inquirer)
│   │   └── hooks.ts          # Hook system execution
│   ├── core/             # Core orchestration logic
│   │   ├── worktree.ts       # Worktree coordination
│   │   ├── rollback.ts       # Rollback mechanism
│   │   └── repository.ts     # Repository management
│   ├── commands/         # CLI commands
│   │   ├── init.ts           # arashi init
│   │   ├── add.ts            # arashi add
│   │   ├── create.ts         # arashi create
│   │   ├── status.ts         # arashi status
│   │   ├── list.ts           # arashi list
│   │   ├── remove.ts         # arashi remove
│   │   └── setup.ts          # arashi setup
│   ├── types.ts          # TypeScript type definitions
│   └── index.ts          # CLI entry point (commander.js setup)
│
├── tests/
│   ├── unit/             # Unit tests for utilities
│   │   ├── git.test.ts
│   │   ├── config.test.ts
│   │   ├── filesystem.test.ts
│   │   └── ...
│   ├── integration/      # Integration tests for commands
│   │   ├── init.test.ts
│   │   ├── create.test.ts
│   │   └── ...
│   └── e2e/              # End-to-end workflow tests
│       └── full-workflow.test.ts
│
├── package.json          # Dependencies and build scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # User-facing documentation
```

**Structure Decision**: This is a single CLI application project following the standard TypeScript CLI structure. The research phase documents patterns that will be implemented in the source structure shown above. The actual implementation happens in a separate repository (repos/arashi/), while this specifications repository (arashi-arashi) contains only planning and research documentation.

## Complexity Tracking

**No violations** - Research task aligns with all constitutional principles. No complexity justification needed.

---

## Phase 0: Research & Discovery

### Objectives
1. Document CLI framework patterns for consistent command implementation
2. Design error handling and rollback architecture for multi-repository operations
3. Document configuration management patterns for auto-discovery and validation
4. Establish testing strategies for git-dependent functionality

### Research Tasks

#### R2: CLI Framework Patterns (User Story 1 - P1)

**Research Questions:**
1. What are the recommended patterns for structuring commander.js commands with subcommands, options, and arguments?
2. How should @inquirer/prompts be used for different interaction types (select, multiselect, confirm, input)?
3. What are best practices for ora spinner usage in long-running operations with proper success/failure states?
4. What color scheme should be standardized for chalk output (success, warning, error, info)?
5. How should CLI errors be formatted and what exit codes should be used?
6. What patterns exist for configuration file loading and search paths?
7. How does Bun's `--compile` flag work for creating cross-platform executables?

**Research Method:**
- Review official documentation for commander.js, @inquirer/prompts, ora, chalk
- Analyze example projects using these libraries
- Research Bun bundling and compilation capabilities
- Document version compatibility and breaking changes

**Deliverable:** Section in `research.md` titled "CLI Framework Patterns"

**Acceptance Criteria:**
- FR-001: Commander.js subcommand patterns documented
- FR-002: @inquirer/prompts patterns documented
- FR-003: ora spinner patterns documented
- FR-004: chalk color scheme defined
- FR-005: CLI error handling patterns documented
- FR-006: Configuration loading patterns documented
- FR-007: Bun compilation process documented

---

#### R3: Error Handling & Rollback Architecture (User Story 2 - P1)

**Research Questions:**
1. What transaction/rollback patterns work best for multi-repository operations?
2. How should operation logs be structured to enable reliable rollback?
3. What rollback strategies are needed for different operation types (worktree created, branch created, directory created)?
4. How should partial failures be handled in multi-step operations?
5. What cleanup strategies exist for orphaned worktrees?
6. How should setup script timeouts be handled with proper process termination?
7. What signal handling is needed for graceful shutdown (SIGINT/SIGTERM)?

**Research Method:**
- Review transaction patterns from database systems (ACID principles)
- Research git worktree cleanup commands (`git worktree prune`)
- Investigate Node.js/Bun process management and signal handling
- Analyze error recovery patterns in similar CLI tools

**Deliverable:** Section in `research.md` titled "Error Handling & Rollback Architecture"

**Acceptance Criteria:**
- FR-008: Transaction/rollback patterns documented
- FR-009: Operation log structure defined
- FR-010: Rollback strategies for each operation type documented
- FR-011: Error recovery patterns documented
- FR-012: Cleanup strategies documented
- FR-013: Timeout handling documented
- FR-014: Signal handling documented

---

#### R4: Configuration Management Patterns (User Story 3 - P1)

**Research Questions:**
1. Should we use manual JSON validation or a library (e.g., Zod, JSON Schema)?
2. How should configuration migrations be handled for version updates?
3. What should the configuration defaults and override hierarchy be?
4. What algorithm should be used for recursive repository discovery?
5. What validation rules are needed and how should error messages be formatted?
6. What file locking strategies exist for concurrent config access?
7. How should setup script detection work (file presence + execute permissions)?

**Research Method:**
- Compare JSON validation approaches (manual vs Zod vs JSON Schema)
- Research configuration migration patterns (transform functions)
- Analyze repository discovery algorithms (recursive directory search for .git)
- Investigate file locking mechanisms in Node.js/Bun

**Deliverable:** Section in `research.md` titled "Configuration Management Patterns"

**Acceptance Criteria:**
- FR-015: JSON validation approaches documented
- FR-016: Configuration migration strategy designed
- FR-017: Configuration hierarchy documented
- FR-018: Repository discovery algorithm designed
- FR-019: Validation rules and error messages documented
- FR-020: File locking strategies documented
- FR-021: Setup script detection documented

---

#### R5: Testing Strategy (User Story 4 - P2)

**Research Questions:**
1. What pattern should be used for creating temporary git repository fixtures?
2. Should we mock git commands or use real git in isolated environments?
3. How should test cleanup be handled (afterEach hooks)?
4. What considerations are needed for parallel test execution?
5. How should CLI output be snapshot-tested (chalk stripping)?
6. What CI/CD approach should be used for testing cross-platform binaries?
7. How should performance testing be implemented (measuring operation times)?

**Research Method:**
- Research Bun test runner capabilities and patterns
- Investigate temporary directory management for test fixtures
- Review snapshot testing libraries and chalk-stripping techniques
- Analyze CI/CD matrix build configurations for cross-platform testing

**Deliverable:** Section in `research.md` titled "Testing Strategy"

**Acceptance Criteria:**
- FR-022: Test fixture creation pattern documented
- FR-023: Mocking strategy decided (real git in isolated repos)
- FR-024: Test cleanup strategy documented
- FR-025: Parallel test execution considerations documented
- FR-026: Snapshot testing approach documented
- FR-027: CI/CD testing approach documented
- FR-028: Performance testing approach documented

---

### Research Document Structure

The `research.md` file will follow this structure (based on `specs/002-git-worktree-research/research.md`):

```markdown
# Arashi CLI: Technical Research

**Research Phase**: Phase 0 - Discovery
**Created**: 2026-02-03
**Status**: [In Progress → Complete]

## Overview
[Brief introduction to the research scope and objectives]

## 1. CLI Framework Patterns
### 1.1 Commander.js Architecture
### 1.2 Interactive Prompts (@inquirer/prompts)
### 1.3 Terminal Spinners (ora)
### 1.4 Color Scheme (chalk)
### 1.5 Error Handling and Exit Codes
### 1.6 Configuration Loading Patterns
### 1.7 Bun Compilation and Distribution

## 2. Error Handling & Rollback Architecture
### 2.1 Transaction/Rollback Patterns
### 2.2 Operation Log Structure
### 2.3 Rollback Strategies by Operation Type
### 2.4 Error Recovery Patterns
### 2.5 Cleanup Strategies
### 2.6 Timeout Handling
### 2.7 Signal Handling

## 3. Configuration Management Patterns
### 3.1 JSON Validation Approaches
### 3.2 Configuration Migration Strategy
### 3.3 Defaults and Override Hierarchy
### 3.4 Repository Discovery Algorithm
### 3.5 Validation Rules and Error Messages
### 3.6 File Locking Strategies
### 3.7 Setup Script Detection

## 4. Testing Strategy
### 4.1 Test Fixture Creation
### 4.2 Mocking Strategy
### 4.3 Test Cleanup
### 4.4 Parallel Test Execution
### 4.5 Snapshot Testing
### 4.6 CI/CD Testing
### 4.7 Performance Testing

## 5. Integration Points
[Document where different patterns interact and require coordination]

## 6. References
[Links to official documentation, example projects, and resources]
```

---

## Phase 1: Design & Contracts

### Prerequisites
- `research.md` complete with all technical decisions made
- All "NEEDS CLARIFICATION" items resolved

### Deliverables

#### 1.1 Data Model (`data-model.md`)

Define the entities and data structures used across Arashi:

**Key Entities (from spec.md):**
- **ArashiConfig**: Configuration file structure (.arashi/config.json)
  - version: string
  - repos_dir: string
  - worktree_strategy: string
  - auto_setup: boolean
  - discovered_repos: Record<string, RepoConfig>

- **RepoConfig**: Individual repository metadata
  - path: string
  - default_branch: string
  - remote: string
  - has_setup_script: boolean
  - git_url: string

- **WorktreeInfo**: Worktree state information
  - path: string
  - branch: string
  - status: string (clean | dirty | ahead | behind)
  - sub_repos: WorktreeInfo[]

- **OperationLogEntry**: Rollback tracking
  - type: string (worktree_created | branch_created | directory_created)
  - data: Record<string, any>
  - rollback_fn: () => Promise<void>

- **CommandOptions**: Options for each command
  - InitOptions: repos_dir?, auto_setup?
  - CreateOptions: interactive?, only?, path?, no_setup?, no_track?
  - RemoveOptions: keep_branches?, keep_worktrees?, force?, no_check_dirty?
  - etc.

- **HookContext**: Environment variables passed to hooks
  - ARASHI_COMMAND: string
  - ARASHI_BRANCH: string
  - ARASHI_WORKTREE_PATH: string
  - ARASHI_REPOS_DIR: string
  - ARASHI_REPO_LIST: string

**Deliverable:** `data-model.md` with complete entity definitions, relationships, and validation rules

---

#### 1.2 API Contracts (`contracts/`)

Generate contract documents for each major interface:

**contracts/cli-commands.md**
- Command signatures for all commands (init, add, create, status, list, remove, setup)
- Options and arguments for each command
- Expected behaviors and outputs
- Exit codes (0=success, 1=error, 2=user abort)

**contracts/git-api.md**
- Function signatures for git operations:
  - isGitRepository, isGitBareRepo
  - createWorktree, removeWorktree, listWorktrees
  - branchExists, createBranch, deleteBranch
  - fetchLatest, setUpstreamTracking
  - getStatus, getDefaultBranch, getCurrentBranch
- Error handling strategy
- Output parsing patterns

**contracts/config-schema.md**
- JSON schema for configuration files
- Validation rules
- Default values
- Migration strategies between versions

**contracts/error-handling.md**
- ArashiError class definition
- Operation log structure
- Rollback function contracts
- Error recovery patterns

**contracts/test-patterns.md**
- Test fixture setup interfaces
- Test cleanup patterns
- Snapshot testing conventions
- CI/CD matrix configurations

---

#### 1.3 Quickstart Guide (`quickstart.md`)

Create developer quickstart documentation:

**Content:**
- Project setup instructions
- Development workflow
- Running tests
- Building binaries
- Debugging tips
- Links to detailed documentation

---

#### 1.4 Agent Context Update

Run the agent context update script to add new technologies discovered in research:

```bash
.specify/scripts/bash/update-agent-context.sh opencode
```

This will update `AGENTS.md` with:
- TypeScript + Bun
- commander.js, @inquirer/prompts, ora, chalk
- Project structure decisions
- Testing frameworks and patterns

---

### Post-Phase 1 Constitution Re-check

After design phase, re-verify all constitution principles are supported by the documented architecture. Update the Constitution Check section above if any concerns arise.

---

## Phase 2: Task Breakdown

**NOT COMPLETED IN THIS COMMAND** - Use `/speckit.tasks` command after plan is complete.

The tasks.md file will break down implementation into concrete, actionable tasks organized by user story priority. Since this is a research/documentation phase, tasks will focus on creating documentation rather than writing code.

**Expected task categories:**
1. Research and document CLI framework patterns
2. Research and document error handling architecture
3. Research and document configuration management
4. Research and document testing strategy
5. Create contract documents
6. Create data model documentation
7. Create quickstart guide

---

## Success Metrics

- **SC-001**: Developer can implement a new CLI command in under 30 minutes using only the research documentation
- **SC-002**: Multi-step operations with rollback can be implemented without leaving repositories in inconsistent states
- **SC-003**: Configuration validation provides clear, actionable error messages
- **SC-004**: Test suite runs with 100% isolation in under 5 minutes
- **SC-005**: Research documentation receives zero questions from implementers about basic patterns
- **SC-006**: All four research areas documented with consistent structure and cross-references
- **SC-007**: Developers can extend Arashi without introducing inconsistencies

---

## Dependencies and Risks

### Dependencies
- Existing research from `specs/002-git-worktree-research/research.md` provides foundation
- GitHub issues #3, #4, #5, #6 define acceptance criteria

### Risks
- **Library version changes**: Libraries may have breaking changes between research and implementation
  - Mitigation: Document specific versions used and pin in package.json
- **Pattern conflicts**: Recommended patterns may not work well together (e.g., ora + inquirer)
  - Mitigation: Test integration points during research phase
- **Documentation drift**: Research may become outdated as libraries evolve
  - Mitigation: Version the research document and update when issues arise

---

## Next Steps

1. ✅ Complete this plan.md (IN PROGRESS)
2. Execute Phase 0 research tasks
3. Create research.md with all findings
4. Execute Phase 1 design tasks
5. Create data-model.md, contracts/, quickstart.md
6. Update agent context
7. Run `/speckit.tasks` to generate task breakdown for implementation
8. Close GitHub issues #3, #4, #5, #6 as research is completed
