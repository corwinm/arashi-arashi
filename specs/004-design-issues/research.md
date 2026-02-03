# Research: Design Phase Documentation Requirements

**Feature**: 004-design-issues  
**Date**: 2026-02-03  
**Purpose**: Extract and synthesize requirements from GitHub issues D1-D7 to prepare for document authoring

## Overview

This research analyzes seven GitHub issues (#7-#13) that define design documentation requirements for the Arashi git worktree manager. Each issue follows a consistent structure with acceptance criteria, deliverable paths, dependencies, and estimated effort.

## Issue Analysis

### D1: Configuration Schema Design (Issue #7)

**Status**: OPEN  
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 3 hours  
**Dependencies**: R4 (unknown - needs clarification from issue context)

**Acceptance Criteria**:
1. Define config.json schema with fields: version, repos_dir, worktree_strategy, auto_setup, discovered_repos
2. Define discovered_repos structure: { [name]: { path, default_branch, remote, has_setup_script, git_url } }
3. Define configuration version migration path (v1.0.0 → future versions)
4. Define validation rules for each field (e.g., repos_dir must be relative path)
5. Define default values (repos_dir="repos", auto_setup=true, worktree_strategy="same_branch")
6. Create example configuration with inline comments

**Deliverable**: `specs/001-git-worktree-manager/data-model.md` with "Configuration Schema" section

**Analysis**: This document establishes the foundational data structure for Arashi. Key design decisions:
- **Config file location**: `.arashi/config.json` (convention-based)
- **Versioning strategy**: Semantic versioning for config format (enables future migrations)
- **Repository discovery**: Auto-populate discovered_repos from repos/ directory
- **Validation philosophy**: Fail early with clear errors rather than auto-correct

**Research Findings**:
- Standard practice for CLI tools: config in dotfile directory at project root
- Version field enables graceful migrations when schema evolves
- Relative paths preferred for portability across machines/users

---

### D2: Type System Design (Issue #8)

**Status**: OPEN  
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 2 hours  
**Dependencies**: D1 (must complete configuration schema first)

**Acceptance Criteria**:
1. Define ArashiConfig interface matching configuration schema
2. Define RepoConfig interface for individual repository metadata
3. Define WorktreeInfo interface (path, branch, status, sub_repos)
4. Define OperationLogEntry interface for rollback tracking (type, data, rollback_fn)
5. Define command option interfaces for all commands (InitOptions, CreateOptions, etc.)
6. Define ArashiError class extending Error with exit codes
7. Define HookContext interface for environment variables passed to hooks

**Deliverable**: Add "Type Definitions" section to `data-model.md`

**Analysis**: Type system directly maps to configuration schema (D1) and provides compile-time safety for TypeScript implementation. Key design decisions:
- **Interface vs Type**: Use interfaces for extensibility, types for unions/intersections
- **Error handling**: Custom error class with exit codes (0, 1, 2) per D3
- **Rollback tracking**: OperationLogEntry includes rollback function pointer for cleanup

**Research Findings**:
- TypeScript best practice: interfaces for object shapes, types for composed/computed
- Exit codes: 0=success, 1=error, 2=user abort (POSIX convention)
- Function pointer in data structure enables strategy pattern for rollback

---

### D3: CLI Command Contracts (Issue #9)

**Status**: OPEN  
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: D2 (needs type definitions)

**Acceptance Criteria**:
1. Define `arashi init [--repos-dir <name>] [--no-auto-setup]` contract
2. Define `arashi add <git-url> [name] [--branch <branch>] [--no-setup-template]` contract
3. Define `arashi create <branch> [-i|--interactive] [--only <repos>] [--path <path>] [--no-setup] [--no-track]` contract
4. Define `arashi remove <branch> [-k|--keep-branches] [-w|--keep-worktrees] [-f|--force] [--no-check-dirty]` contract
5. Define `arashi list [-v|--verbose] [--json]` contract
6. Define `arashi status [-v|--verbose] [-s|--short]` contract
7. Define `arashi setup [--only <repos>] [--parallel] [-v|--verbose]` contract
8. Document exit codes: 0=success, 1=error, 2=user abort
9. Write help text and examples for each command

**Deliverable**: `specs/001-git-worktree-manager/contracts/cli-commands.md`

**Analysis**: Seven commands form the complete CLI surface area. Key design patterns:
- **Command naming**: Verbs (init, add, create, remove, setup) and nouns (list, status)
- **Flag conventions**: Single-letter shortcuts for common options (-i, -v, -f)
- **Boolean flags**: --no-* prefix for negating defaults (--no-auto-setup, --no-hooks)
- **Output formats**: Support both human (default) and machine-readable (--json)

**Research Findings**:
- POSIX conventions: single-dash for short options (-v), double-dash for long (--verbose)
- Git patterns: `git worktree add/remove/list` as prior art for worktree commands
- Modern CLI trends: Rich output with colors, progress indicators, structured data

---

### D4: Git Wrapper API Design (Issue #10)

**Status**: OPEN  
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: D2 (needs error types)

**Acceptance Criteria**:
1. Define function signatures for: isGitBareRepo, createWorktree, removeWorktree, listWorktrees
2. Define function signatures for: branchExists, createBranch, deleteBranch, fetchLatest
3. Define function signatures for: setUpstreamTracking, getStatus, getDefaultBranch, getCurrentBranch
4. Define error handling strategy: throw ArashiError with git output in message
5. Design git command execution wrapper using Bun's spawn with stdio capture
6. Define git output parsing strategy for status, branch lists, worktree lists
7. Define repository detection utilities: isGitRepository, findGitRoot

**Deliverable**: `specs/001-git-worktree-manager/contracts/git-api.md`

**Analysis**: Git wrapper abstracts all git CLI interactions. Key design decisions:
- **Async operations**: All git commands are async (file I/O, network)
- **Error propagation**: Capture stderr and wrap in ArashiError for context
- **Porcelain format**: Use `--porcelain` flags for stable, parseable output
- **Command building**: Helper to construct git commands with consistent options

**Research Findings**:
- Bun.spawn API: Returns stdout/stderr streams, supports working directory
- Git porcelain formats: Machine-readable output with stable structure
  - `git worktree list --porcelain`: Key-value pairs per worktree
  - `git status --porcelain`: Two-letter status codes per file
  - `git show-ref --verify`: Exit code indicates branch existence
- Error handling: Always include git command output in error messages for debugging

---

### D5: Worktree Orchestration Design (Issue #11)

**Status**: OPEN  
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 5 hours  
**Dependencies**: D4 (needs git API contracts)

**Acceptance Criteria**:
1. Design worktree creation flow: validate → fetch → create main → create sub-repos → run setup
2. Define OperationLog array structure for tracking: `{ type, data, rollback }[]`
3. Design rollback execution: reverse iterate log, call rollback functions, log results
4. Define branch conflict resolution dialog with options: use existing, create new (suffix), abort
5. Design repository selection logic: all (default), --only filter, -i interactive
6. Define setup script execution: sequential by default, parallel with --parallel flag
7. Design error aggregation: collect all errors, display summary, execute rollback

**Deliverable**: `specs/001-git-worktree-manager/contracts/worktree-orchestration.md`

**Analysis**: Orchestration is the core feature - coordinating worktrees across multiple repos. Key design patterns:
- **Transaction semantics**: All-or-nothing with automatic rollback on failure
- **Progressive enhancement**: Main worktree creation first, then sub-repos (fail fast)
- **User control**: Interactive prompts for ambiguous situations (conflicts)
- **Parallel safety**: Setup scripts can run in parallel (no git operations during setup)

**Research Findings**:
- Database transaction patterns: Log operations, rollback in reverse order
- Multi-step wizard patterns: Validate upfront, execute steps, handle failures
- Conflict resolution UX: Present options with recommendations (default choice highlighted)

---

### D6: Hook System Design (Issue #12)

**Status**: OPEN  
**Priority**: P2  
**Estimated Effort**: 3 hours  
**Dependencies**: D2 (needs HookContext interface)

**Acceptance Criteria**:
1. Design hook discovery: check `.arashi/hooks/{pre-create,post-create,setup}.sh`
2. Design hook validation: verify execute permissions before running
3. Define hook execution order: pre-create → worktree operations → post-create → setup
4. Define environment variables: ARASHI_COMMAND, ARASHI_BRANCH, ARASHI_WORKTREE_PATH, ARASHI_REPOS_DIR, ARASHI_REPO_LIST
5. Define hook timeout (5 minutes default) and failure handling (warn but continue)
6. Design hook output capture: stream to console with prefix
7. Define --no-hooks flag to skip all hook execution

**Deliverable**: `specs/001-git-worktree-manager/contracts/hook-system.md`

**Analysis**: Hooks provide extensibility without bloating core. Key design decisions:
- **Hook locations**: Convention-based (`.arashi/hooks/`) with standard names
- **Non-fatal failures**: Hooks warn but don't abort (user automation shouldn't break core)
- **Environment passing**: Context via env vars (shell-agnostic approach)
- **Safety**: Validate execute permissions, timeout long-running hooks

**Research Findings**:
- Git hooks: Prior art for hook naming (pre-*, post-*)
- npm scripts: Environment variable patterns (npm_package_*, npm_lifecycle_event)
- Security: Never execute files without explicit +x permission

---

### D7: Development Setup Guide (Issue #13)

**Status**: OPEN  
**Priority**: P3  
**Estimated Effort**: 2 hours  
**Dependencies**: None

**Acceptance Criteria**:
1. Document Bun installation (curl -fsSL https://bun.sh/install | bash)
2. Document repository structure (meta-repo with repos/arashi/ sub-repo)
3. Document `cd repos/arashi && bun install` for dependency installation
4. Document `bun run dev <command>` for development testing
5. Document `bun test` for running test suite
6. Document `bun run build:all` for creating cross-platform binaries
7. Document debugging setup (VS Code launch.json example)
8. Link to CONTRIBUTING.md for PR guidelines

**Deliverable**: `specs/001-git-worktree-manager/quickstart.md`

**Analysis**: Quickstart lowers barrier to contribution. Key elements:
- **Prerequisites**: Bun runtime, git (assumed installed)
- **Repository structure**: Meta-repo pattern with sub-repos (explain the inception)
- **Common workflows**: Install, test, build, debug
- **Next steps**: Link to deeper documentation (CONTRIBUTING.md)

**Research Findings**:
- Exemplary quickstarts: Rust Book, React docs, Next.js
- Best practice: Complete working example within 5 minutes
- VS Code debugging: Standard launch.json configuration for Node/Bun projects

---

## Cross-Document Dependencies

Identified dependency graph:

```
D1 (Config Schema)
  ↓
D2 (Type System)
  ↓
D3 (CLI Contracts) ← D4 (Git API)
  ↓                     ↓
  └─────→ D5 (Worktree Orchestration) ←─────┘
              ↓
          D6 (Hooks)

D7 (Quickstart) - Independent
```

**Critical path**: D1 → D2 → D4 → D5 (affects foundation tasks F1-F6)

**Parallel work possible**: D7 can be written independently anytime

---

## Design Decisions

### 1. Document Structure Convention

**Decision**: Use consistent section structure across all contract documents:
- Overview (purpose and scope)
- Contracts (function signatures, command formats)
- Error Handling (failure modes and strategies)
- Examples (usage demonstrations)
- Implementation Notes (guidance for developers)

**Rationale**: Consistency enables faster comprehension. Developers know where to find information.

### 2. Configuration Schema Versioning

**Decision**: Include version field (semantic versioning) in config.json

**Rationale**: Enables graceful migration when schema evolves. Can detect old configs and offer upgrade path.

**Alternatives Considered**:
- No versioning: Rejected (can't distinguish old vs new format)
- Git commit hash: Rejected (not human-readable, hard to compare)

### 3. Type Safety Strategy

**Decision**: Define TypeScript interfaces in D2 matching JSON schema in D1

**Rationale**: Compile-time safety catches mismatches. Types serve as executable documentation.

**Alternatives Considered**:
- JSON Schema with codegen: Rejected (adds build complexity)
- Runtime validation only: Rejected (errors caught too late)

### 4. Error Handling Philosophy

**Decision**: Fail fast with detailed error messages including git command output

**Rationale**: Debugging multi-repo operations requires context. Show exactly what failed and why.

**Alternatives Considered**:
- Silent failures with exit codes: Rejected (poor UX)
- Generic error messages: Rejected (insufficient debugging information)

### 5. Hook Execution Model

**Decision**: Non-fatal hook failures (warn but continue)

**Rationale**: User automation shouldn't break core functionality. Hooks are customizations, not requirements.

**Alternatives Considered**:
- Fatal failures: Rejected (breaks users with faulty hooks)
- Silent ignore: Rejected (users won't know hooks failed)

---

## Open Questions

All requirements are well-defined in GitHub issues. No clarifications needed.

---

## Next Steps

Proceed to Phase 1:
1. Create `data-model.md` (D1 + D2 combined)
2. Create `contracts/` directory with four contract documents (D3, D4, D5, D6)
3. Create `quickstart.md` (D7)
4. Create `checklists/design-review.md` for validation
