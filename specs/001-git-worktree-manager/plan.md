# Implementation Plan: Arashi - Git Worktree Manager for Meta-Repositories

**Branch**: `001-git-worktree-manager` | **Date**: February 2, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-git-worktree-manager/spec.md`

## Summary

Arashi is a CLI tool that automates the management of coordinated git worktrees across multiple related repositories (meta-repositories). It enables developers to create, manage, and remove worktrees for a main repository and all its sub-repositories with a single command, eliminating the manual overhead of managing multiple git worktrees independently. The system handles branch creation, synchronization, setup script execution, error rollback, and status monitoring across all repositories.

## Technical Context

**Language/Version**: TypeScript 5.x with Bun runtime  
**Primary Dependencies**: commander (CLI framework), @inquirer/prompts (interactive prompts), chalk (terminal colors), ora (spinners)  
**Storage**: JSON configuration files in `.arashi/config.json`, git repositories in configurable directory (default: `repos/`)  
**Testing**: Bun test framework for unit and integration tests  
**Target Platform**: macOS (ARM64), Linux (x64), Windows (x64) - compiled to single-file executables  
**Project Type**: CLI application (single project structure)  
**Performance Goals**: Initialize 5 repos in <5s, create worktrees across 5 repos in <30s, status check in <3s, rollback in <10s  
**Constraints**: <200ms p95 for non-git operations, minimal memory footprint (<100MB), offline-capable after initial clone  
**Scale/Scope**: Support 20+ sub-repositories, handle bare and regular git repositories, cross-platform compatibility

## Constitution Check

*No constitution file found - proceeding without constitution gates*

## Project Structure

### Documentation (this feature)

```text
specs/001-git-worktree-manager/
├── plan.md              # This file
├── research.md          # Phase 0 output (dependencies, patterns, architecture decisions)
├── data-model.md        # Phase 1 output (configuration schema, types, data flow)
├── quickstart.md        # Phase 1 output (developer setup, build, test instructions)
├── contracts/           # Phase 1 output (CLI API contracts, internal interfaces)
└── tasks.md             # Phase 2 output (implementation tasks - NOT created yet)
```

### Source Code (repository root)

```text
repos/arashi/               # Actual Arashi CLI tool implementation
├── src/
│   ├── index.ts           # CLI entry point with commander setup (exists)
│   ├── types.ts           # TypeScript type definitions (exists)
│   ├── commands/          # Command implementations (to create)
│   │   ├── init.ts        # Initialize meta-repository
│   │   ├── add.ts         # Add repository to configuration
│   │   ├── create.ts      # Create coordinated worktrees
│   │   ├── remove.ts      # Remove worktrees and branches
│   │   ├── list.ts        # List all worktrees
│   │   ├── status.ts      # Show worktree status
│   │   └── setup.ts       # Run setup scripts
│   ├── lib/               # Core utilities (to create)
│   │   ├── git.ts         # Git command wrappers
│   │   ├── config.ts      # Configuration management
│   │   ├── filesystem.ts  # File system operations
│   │   ├── logger.ts      # Console output utilities
│   │   ├── prompts.ts     # User interaction helpers
│   │   └── hooks.ts       # Lifecycle hook execution
│   └── core/              # Core business logic (to create)
│       ├── worktree.ts    # Worktree orchestration
│       ├── repository.ts  # Repository management
│       └── rollback.ts    # Operation rollback logic
│
├── tests/                 # Test suite (to create)
│   ├── unit/              # Unit tests for lib/ and core/
│   │   ├── git.test.ts
│   │   ├── config.test.ts
│   │   ├── filesystem.test.ts
│   │   └── worktree.test.ts
│   ├── integration/       # Integration tests for commands
│   │   ├── init.test.ts
│   │   ├── create.test.ts
│   │   ├── remove.test.ts
│   │   └── status.test.ts
│   └── e2e/               # End-to-end workflow tests
│       └── full-workflow.test.ts
│
├── bin/                   # npm package shim (to create)
│   └── arashi.js          # Platform detection and binary selection
│
├── dist/                  # Build output (generated)
│   ├── arashi-macos-arm64
│   ├── arashi-linux-x64
│   └── arashi-windows-x64.exe
│
├── package.json           # npm package configuration (exists)
├── tsconfig.json          # TypeScript configuration (exists)
└── README.md              # User documentation (to create)
```

**Structure Decision**: Single CLI project structure within `repos/arashi/`. The meta-repository itself (`arashi-arashi`) contains the specification and development tooling, while the actual Arashi CLI tool lives in `repos/arashi/` as a sub-repository. This self-hosting demonstrates Arashi's capabilities.

## Phase 0: Research & Discovery

*Research tasks to be completed before design phase*

### R1: Git Worktree API Research
**Goal**: Document git worktree commands, limitations, and best practices

**Tasks**:
- Document all git worktree commands (add, list, remove, prune, lock, unlock)
- Identify git version requirements and compatibility considerations
- Research bare repository vs regular repository worktree behavior differences
- Document worktree location strategies and conventions
- Investigate git worktree error scenarios and failure modes
- Research remote tracking setup for worktree branches
- Document git worktree metadata structure (`.git` file format)

**Deliverable**: `research.md` section on "Git Worktree Fundamentals"

---

### R2: CLI Framework Patterns
**Goal**: Establish command structure and interaction patterns using commander and inquirer

**Tasks**:
- Review commander.js patterns for subcommands with options
- Research @inquirer/prompts patterns for interactive selections
- Investigate progress indicators with ora (spinners, progress bars)
- Research chalk usage for color-coded output (success/warning/error)
- Document best practices for CLI error handling and user feedback
- Research CLI configuration file loading patterns
- Investigate cross-platform executable creation with Bun

**Deliverable**: `research.md` section on "CLI Architecture Patterns"

---

### R3: Error Handling & Rollback Strategies
**Goal**: Design robust error handling with full rollback capabilities

**Tasks**:
- Research transaction/rollback patterns for multi-step operations
- Document operation tracking strategies (operation log, undo stack)
- Investigate error recovery from partial failures
- Research cleanup strategies for orphaned git worktrees
- Document error message best practices for actionable guidance
- Research timeout handling for long-running operations (setup scripts)
- Investigate graceful shutdown and cleanup on SIGINT/SIGTERM

**Deliverable**: `research.md` section on "Error Handling Architecture"

---

### R4: Configuration Management Patterns
**Goal**: Design configuration schema and management approach

**Tasks**:
- Research JSON schema validation patterns for configuration files
- Document configuration file migration strategies for version updates
- Investigate configuration defaults and override hierarchies
- Research repository discovery algorithms (scanning directories for .git)
- Document configuration validation and error reporting
- Research configuration file locking for concurrent access prevention
- Investigate setup script detection and metadata capture

**Deliverable**: `research.md` section on "Configuration Architecture"

---

### R5: Testing Strategy for Git Operations
**Goal**: Establish testing approach for git-dependent functionality

**Tasks**:
- Research test fixture creation (temporary git repositories)
- Document mocking strategies for git commands vs real git testing
- Investigate test cleanup strategies (temporary directories, git repos)
- Research parallel test execution considerations for git operations
- Document snapshot testing for CLI output
- Research CI/CD testing patterns for cross-platform executables
- Investigate performance testing for large repository sets

**Deliverable**: `research.md` section on "Testing Strategy"

---

## Phase 1: Design & Contracts

*Design tasks to be completed before implementation*

### D1: Configuration Schema Design
**Goal**: Define complete configuration file structure and validation rules

**Tasks**:
- Design `config.json` schema with all fields and types
- Define repository metadata structure (path, default_branch, remote, etc.)
- Design configuration version migration path
- Define configuration validation rules and error messages
- Design default configuration values
- Document configuration file example with comments

**Deliverable**: `data-model.md` section on "Configuration Schema"

---

### D2: Type System Design
**Goal**: Define all TypeScript types and interfaces

**Tasks**:
- Define `ArashiConfig` type for configuration structure
- Define `RepoConfig` type for individual repository metadata
- Define `WorktreeInfo` type for worktree data structures
- Define `OperationLog` type for rollback tracking
- Define command option types for all CLI commands
- Define error types for structured error handling
- Define hook context types for lifecycle hooks

**Deliverable**: `data-model.md` section on "Type Definitions"

---

### D3: CLI Command Contracts
**Goal**: Define all command signatures, options, and behaviors

**Tasks**:
- Design `arashi init` command signature and options
- Design `arashi add <git-url>` command signature and options
- Design `arashi create <branch>` command signature and options
- Design `arashi remove <branch>` command signature and options
- Design `arashi list` command signature and options
- Design `arashi status` command signature and options
- Design `arashi setup` command signature and options
- Document exit codes for each command (0=success, 1=error, 2=user abort)
- Design help text and examples for each command

**Deliverable**: `contracts/cli-commands.md`

---

### D4: Git Wrapper API Design
**Goal**: Define internal API for git operations

**Tasks**:
- Design `git.ts` module interface (all functions and signatures)
- Define error handling strategy for git command failures
- Design git command execution wrapper (spawn vs exec)
- Define git output parsing strategies
- Design repository detection utilities
- Define branch existence checking and creation logic
- Design worktree creation and removal logic
- Define status checking and parsing logic

**Deliverable**: `contracts/git-api.md`

---

### D5: Worktree Orchestration Design
**Goal**: Define worktree coordination logic and rollback mechanism

**Tasks**:
- Design worktree creation orchestration flow
- Define operation logging structure for rollback
- Design rollback execution logic (reverse order cleanup)
- Define branch conflict resolution dialog flow
- Design repository selection logic (all, filtered, interactive)
- Define setup script execution orchestration (sequential/parallel)
- Design error aggregation for multi-repository operations

**Deliverable**: `contracts/worktree-orchestration.md`

---

### D6: Hook System Design
**Goal**: Define lifecycle hook execution and context passing

**Tasks**:
- Design hook discovery and validation logic
- Define hook execution order (pre-create, post-create, setup)
- Design environment variable structure for hook context
- Define hook timeout and failure handling
- Design hook output capture and display
- Define hook skip mechanisms (--no-hooks flag)
- Document hook script examples and best practices

**Deliverable**: `contracts/hook-system.md`

---

### D7: Development Setup Guide
**Goal**: Create quickstart guide for contributors

**Tasks**:
- Document Bun installation and setup
- Document repository cloning and initialization
- Document dependency installation (`bun install`)
- Document development workflow (`bun run dev`)
- Document testing workflow (`bun test`)
- Document building workflow (`bun run build:all`)
- Document debugging setup and techniques
- Document contribution guidelines

**Deliverable**: `quickstart.md`

---

## Phase 2: Implementation Tasks

*Task breakdown will be generated in `tasks.md` by the `/speckit.tasks` command after Phase 0 and Phase 1 are complete*

**Task Generation Scope**:
- Utility library implementation (git.ts, config.ts, filesystem.ts, logger.ts, prompts.ts, hooks.ts)
- Core logic implementation (worktree.ts, repository.ts, rollback.ts)
- Command implementation (init.ts, add.ts, create.ts, remove.ts, list.ts, status.ts, setup.ts)
- Test suite implementation (unit, integration, e2e)
- Documentation (README.md, examples, troubleshooting guide)
- Build and distribution setup (npm shim, CI/CD workflows)

**Implementation Priority Order**:
1. **P1 - Foundation** (Week 1-2): Utility libraries + core types
2. **P1 - Core Commands** (Week 3-4): init, add, create (with rollback)
3. **P2 - Management** (Week 5): status, remove, list
4. **P3 - Polish** (Week 6): setup command, hook system, tests
5. **P4 - Distribution** (Week 7): Build system, documentation, CI/CD

## Acceptance Criteria Mapping

### User Story 1: Initialize Meta-Repository (P1)
**Covered by**:
- D1: Configuration Schema Design
- D3: CLI Command Contracts (init command)
- Implementation: `init.ts` command

**Acceptance validation**:
- AS1: Repository detection + config creation + repo discovery
- AS2: Bare repository support
- AS3: Non-git directory error handling
- AS4: Empty repository list support

---

### User Story 2: Create Coordinated Worktrees (P1)
**Covered by**:
- D4: Git Wrapper API Design
- D5: Worktree Orchestration Design
- D3: CLI Command Contracts (create command)
- Implementation: `create.ts` command + `worktree.ts` orchestration

**Acceptance validation**:
- AS1: Multi-repository worktree creation with branch setup
- AS2: Repository filtering (interactive/explicit)
- AS3: Branch conflict resolution dialogs
- AS4: Automatic setup script execution
- AS5: Full rollback on failure

---

### User Story 3: View Worktree Status (P2)
**Covered by**:
- D4: Git Wrapper API Design (status functions)
- D3: CLI Command Contracts (status command)
- Implementation: `status.ts` command

**Acceptance validation**:
- AS1: Multi-worktree status display
- AS2: Current worktree detailed view
- AS3: Ahead/behind tracking information

---

### User Story 4: Add Repositories (P2)
**Covered by**:
- D1: Configuration Schema Design
- D3: CLI Command Contracts (add command)
- Implementation: `add.ts` command

**Acceptance validation**:
- AS1: Clone + detect default branch + update config
- AS2: Custom repository naming
- AS3: Setup script detection

---

### User Story 5: Remove Worktrees (P2)
**Covered by**:
- D4: Git Wrapper API Design
- D3: CLI Command Contracts (remove command)
- Implementation: `remove.ts` command

**Acceptance validation**:
- AS1: Worktree and branch removal
- AS2: Uncommitted changes warning
- AS3: Keep-branches flag support
- AS4: Keep-worktrees flag support

---

### User Story 6: Run Setup Scripts (P3)
**Covered by**:
- D6: Hook System Design
- D3: CLI Command Contracts (setup command)
- Implementation: `setup.ts` command

**Acceptance validation**:
- AS1: Sequential setup execution
- AS2: Repository filtering
- AS3: Parallel execution flag

---

### User Story 7: List Worktrees (P3)
**Covered by**:
- D4: Git Wrapper API Design
- D3: CLI Command Contracts (list command)
- Implementation: `list.ts` command

**Acceptance validation**:
- AS1: All worktrees with summary
- AS2: Verbose mode with details
- AS3: JSON output format

---

## Success Criteria Validation

**SC-001** (Initialize in <5s): Validated by performance tests measuring init command execution  
**SC-002** (Create worktrees in <30s): Validated by performance tests measuring create command execution  
**SC-003** (Rollback in <10s): Validated by integration tests simulating failures and measuring rollback time  
**SC-004** (Status in <3s): Validated by performance tests measuring status command execution  
**SC-005** (95% success rate): Tracked via error logging and analytics in real usage  
**SC-006** (90% actionable errors): Validated by user testing and error message review  
**SC-007** (80% time savings): Measured by comparing manual git commands vs Arashi commands  
**SC-008** (95% setup success): Tracked via setup command exit codes and logging  
**SC-009** (100% status accuracy): Validated by comparing Arashi output to raw git status  
**SC-010** (Add repo in <2m): Validated by performance tests measuring add command execution  
**SC-011** (Remove in <10s): Validated by performance tests measuring remove command execution  
**SC-012** (20+ repos support): Validated by stress tests with large repository counts  
**SC-013** (100% config persistence): Validated by tests that verify config after operations  
**SC-014** (90% clear prompts): Validated by user testing and prompt review  
**SC-015** (100% data loss prevention): Validated by tests ensuring warnings before destructive ops

## Risk Analysis

### High Risk
1. **Git Command Failures**: Mitigation via comprehensive error handling and rollback
2. **Partial Worktree Creation**: Mitigation via operation logging and rollback mechanism
3. **Cross-Platform Compatibility**: Mitigation via CI/CD testing on all platforms
4. **Large Repository Performance**: Mitigation via parallel operations where safe

### Medium Risk
1. **Hook Script Failures**: Mitigation via timeout handling and clear error messages
2. **Configuration Corruption**: Mitigation via JSON validation and backup mechanisms
3. **Network/Authentication Failures**: Mitigation via clear error messages and retry guidance

### Low Risk
1. **Setup Script Compatibility**: Documented as user responsibility
2. **Disk Space Issues**: Clear error messages with actionable guidance
3. **Manual Worktree Deletion**: Graceful handling of missing directories

## Next Steps

1. **Complete Phase 0 Research** (1 week): Execute all R1-R5 research tasks
2. **Complete Phase 1 Design** (1 week): Execute all D1-D7 design tasks
3. **Generate Implementation Tasks** (run `/speckit.tasks`): Break down implementation into granular tasks
4. **Begin Implementation** (4-5 weeks): Follow task priority order (P1 → P2 → P3 → P4)
5. **Testing & Documentation** (ongoing): Write tests alongside implementation
6. **Release** (week 7): Build, test, and publish first version

**Current Status**: ✅ Specification complete, ready to begin Phase 0 research
