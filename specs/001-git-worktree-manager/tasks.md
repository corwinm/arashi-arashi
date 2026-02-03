# Implementation Tasks: Arashi - Git Worktree Manager

**Branch**: `001-git-worktree-manager` | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

This document contains granular implementation tasks derived from the implementation plan. Each task is independently actionable and can be assigned to developers.

---

## Phase 0: Research & Discovery

### Task R1: Git Worktree API Research
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: None  

**Description**:
Research and document git worktree commands, limitations, and best practices to establish technical foundation.

**Acceptance Criteria**:
- [ ] Document all git worktree commands (add, list, remove, prune, lock, unlock) with examples
- [ ] Identify minimum git version requirement (2.5+) and document any version-specific features
- [ ] Document bare vs regular repository worktree behavior differences
- [ ] Document worktree location strategies and conventions (sibling dirs vs subdirs)
- [ ] Identify and document common error scenarios (disk space, permissions, conflicts)
- [ ] Document remote tracking setup process for worktree branches
- [ ] Document `.git` file format in worktrees (gitlink reference structure)

**Deliverable**: Create `specs/001-git-worktree-manager/research.md` with "Git Worktree Fundamentals" section

---

### Task R2: CLI Framework Patterns
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 3 hours  
**Dependencies**: None  

**Description**:
Research and document CLI framework patterns using commander, inquirer, ora, and chalk.

**Acceptance Criteria**:
- [ ] Document commander.js subcommand pattern with options and arguments
- [ ] Document @inquirer/prompts patterns for select, multiselect, confirm, input
- [ ] Document ora spinner patterns for long-running operations with success/failure states
- [ ] Document chalk color scheme for consistent terminal output (green=success, yellow=warning, red=error)
- [ ] Document CLI error handling patterns (exit codes, error formatting)
- [ ] Document configuration file loading patterns (search paths, validation)
- [ ] Document Bun's `--compile` flag and cross-platform executable creation

**Deliverable**: Add "CLI Architecture Patterns" section to `research.md`

---

### Task R3: Error Handling & Rollback Strategies
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: None  

**Description**:
Design robust error handling and rollback mechanisms for multi-step git operations.

**Acceptance Criteria**:
- [ ] Document transaction/rollback patterns for multi-repository operations
- [ ] Design operation log structure for tracking completed steps
- [ ] Document rollback strategies for each operation type (worktree created, branch created, etc.)
- [ ] Document error recovery patterns for partial failures
- [ ] Document cleanup strategies for orphaned worktrees (git worktree prune)
- [ ] Document timeout handling for setup scripts (kill process group)
- [ ] Document signal handling for graceful shutdown (SIGINT/SIGTERM)

**Deliverable**: Add "Error Handling Architecture" section to `research.md`

---

### Task R4: Configuration Management Patterns
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 3 hours  
**Dependencies**: None  

**Description**:
Research configuration management patterns for JSON config files and repository discovery.

**Acceptance Criteria**:
- [ ] Document JSON schema validation approach (manual validation vs libraries)
- [ ] Design configuration migration strategy for version updates (transform functions)
- [ ] Document configuration defaults and override hierarchy (config file > CLI flags)
- [ ] Design repository discovery algorithm (recursive .git directory search)
- [ ] Document configuration validation rules and user-friendly error messages
- [ ] Research file locking strategies for concurrent access (not implemented initially but documented)
- [ ] Document setup script detection (check for `setup.sh` with execute permissions)

**Deliverable**: Add "Configuration Architecture" section to `research.md`

---

### Task R5: Testing Strategy for Git Operations
**Priority**: P2  
**Estimated Effort**: 3 hours  
**Dependencies**: None  

**Description**:
Establish testing approach for git-dependent functionality.

**Acceptance Criteria**:
- [ ] Document test fixture creation pattern (temp dirs with initialized git repos)
- [ ] Decide on mocking strategy: real git commands in isolated temp repos (no mocking)
- [ ] Document test cleanup strategy (remove temp dirs in afterEach hooks)
- [ ] Document parallel test execution considerations (isolated temp dirs per test)
- [ ] Research snapshot testing for CLI output (chalk-stripped output comparison)
- [ ] Document CI/CD testing approach for cross-platform binaries (matrix builds)
- [ ] Document performance testing approach (measure time for operations with varying repo counts)

**Deliverable**: Add "Testing Strategy" section to `research.md`

---

## Phase 1: Design & Contracts

### Task D1: Configuration Schema Design
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 3 hours  
**Dependencies**: R4  

**Description**:
Define complete configuration file structure and validation rules.

**Acceptance Criteria**:
- [ ] Define `config.json` schema with fields: version, repos_dir, worktree_strategy, auto_setup, discovered_repos
- [ ] Define `discovered_repos` structure: { [name]: { path, default_branch, remote, has_setup_script, git_url } }
- [ ] Define configuration version migration path (v1.0.0 → future versions)
- [ ] Define validation rules for each field (e.g., repos_dir must be relative path)
- [ ] Define default values (repos_dir="repos", auto_setup=true, worktree_strategy="same_branch")
- [ ] Create example configuration with inline comments

**Deliverable**: Create `specs/001-git-worktree-manager/data-model.md` with "Configuration Schema" section

---

### Task D2: Type System Design
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 2 hours  
**Dependencies**: D1  

**Description**:
Define all TypeScript types and interfaces for type-safe development.

**Acceptance Criteria**:
- [ ] Define `ArashiConfig` interface matching configuration schema
- [ ] Define `RepoConfig` interface for individual repository metadata
- [ ] Define `WorktreeInfo` interface (path, branch, status, sub_repos)
- [ ] Define `OperationLogEntry` interface for rollback tracking (type, data, rollback_fn)
- [ ] Define command option interfaces for all commands (InitOptions, CreateOptions, etc.)
- [ ] Define `ArashiError` class extending Error with exit codes
- [ ] Define `HookContext` interface for environment variables passed to hooks

**Deliverable**: Add "Type Definitions" section to `data-model.md`

---

### Task D3: CLI Command Contracts
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: D2  

**Description**:
Define all command signatures, options, and expected behaviors.

**Acceptance Criteria**:
- [ ] Define `arashi init [--repos-dir <name>] [--no-auto-setup]` contract
- [ ] Define `arashi add <git-url> [name] [--branch <branch>] [--no-setup-template]` contract
- [ ] Define `arashi create <branch> [-i|--interactive] [--only <repos>] [--path <path>] [--no-setup] [--no-track]` contract
- [ ] Define `arashi remove <branch> [-k|--keep-branches] [-w|--keep-worktrees] [-f|--force] [--no-check-dirty]` contract
- [ ] Define `arashi list [-v|--verbose] [--json]` contract
- [ ] Define `arashi status [-v|--verbose] [-s|--short]` contract
- [ ] Define `arashi setup [--only <repos>] [--parallel] [-v|--verbose]` contract
- [ ] Document exit codes: 0=success, 1=error, 2=user abort
- [ ] Write help text and examples for each command

**Deliverable**: Create `specs/001-git-worktree-manager/contracts/cli-commands.md`

---

### Task D4: Git Wrapper API Design
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: D2  

**Description**:
Define internal API for git operations with error handling.

**Acceptance Criteria**:
- [ ] Define function signatures for: isGitBareRepo, createWorktree, removeWorktree, listWorktrees
- [ ] Define function signatures for: branchExists, createBranch, deleteBranch, fetchLatest
- [ ] Define function signatures for: setUpstreamTracking, getStatus, getDefaultBranch, getCurrentBranch
- [ ] Define error handling strategy: throw ArashiError with git output in message
- [ ] Design git command execution wrapper using Bun's spawn with stdio capture
- [ ] Define git output parsing strategy for status, branch lists, worktree lists
- [ ] Define repository detection utilities: isGitRepository, findGitRoot

**Deliverable**: Create `specs/001-git-worktree-manager/contracts/git-api.md`

---

### Task D5: Worktree Orchestration Design
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 5 hours  
**Dependencies**: D4  

**Description**:
Define worktree coordination logic and rollback mechanism.

**Acceptance Criteria**:
- [ ] Design worktree creation flow: validate → fetch → create main → create sub-repos → run setup
- [ ] Define `OperationLog` array structure for tracking: `{ type, data, rollback }[]`
- [ ] Design rollback execution: reverse iterate log, call rollback functions, log results
- [ ] Define branch conflict resolution dialog with options: use existing, create new (suffix), abort
- [ ] Design repository selection logic: all (default), --only filter, -i interactive
- [ ] Define setup script execution: sequential by default, parallel with --parallel flag
- [ ] Design error aggregation: collect all errors, display summary, execute rollback

**Deliverable**: Create `specs/001-git-worktree-manager/contracts/worktree-orchestration.md`

---

### Task D6: Hook System Design
**Priority**: P2  
**Estimated Effort**: 3 hours  
**Dependencies**: D2  

**Description**:
Define lifecycle hook execution and context passing.

**Acceptance Criteria**:
- [ ] Design hook discovery: check `.arashi/hooks/{pre-create,post-create,setup}.sh`
- [ ] Design hook validation: verify execute permissions before running
- [ ] Define hook execution order: pre-create → worktree operations → post-create → setup
- [ ] Define environment variables: ARASHI_COMMAND, ARASHI_BRANCH, ARASHI_WORKTREE_PATH, ARASHI_REPOS_DIR, ARASHI_REPO_LIST
- [ ] Define hook timeout (5 minutes default) and failure handling (warn but continue)
- [ ] Design hook output capture: stream to console with prefix
- [ ] Define --no-hooks flag to skip all hook execution

**Deliverable**: Create `specs/001-git-worktree-manager/contracts/hook-system.md`

---

### Task D7: Development Setup Guide
**Priority**: P3  
**Estimated Effort**: 2 hours  
**Dependencies**: None  

**Description**:
Create quickstart guide for contributors.

**Acceptance Criteria**:
- [ ] Document Bun installation (curl -fsSL https://bun.sh/install | bash)
- [ ] Document repository structure (meta-repo with repos/arashi/ sub-repo)
- [ ] Document `cd repos/arashi && bun install` for dependency installation
- [ ] Document `bun run dev <command>` for development testing
- [ ] Document `bun test` for running test suite
- [ ] Document `bun run build:all` for creating cross-platform binaries
- [ ] Document debugging setup (VS Code launch.json example)
- [ ] Link to CONTRIBUTING.md for PR guidelines

**Deliverable**: Create `specs/001-git-worktree-manager/quickstart.md`

---

## Phase 2: Foundation - Utility Libraries (Week 1-2)

### Task F1: Implement Git Utility Library
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 8 hours  
**Dependencies**: D4, R1  

**Description**:
Implement core git command wrappers in `src/lib/git.ts`.

**Acceptance Criteria**:
- [ ] Implement `exec()` wrapper using `Bun.spawn()` with stdout/stderr capture
- [ ] Implement `isGitRepository(path)` checking for .git directory or file
- [ ] Implement `isGitBareRepo(path)` checking for HEAD, refs, objects dirs
- [ ] Implement `createWorktree(repoPath, branch, location)` using `git worktree add`
- [ ] Implement `removeWorktree(path)` using `git worktree remove`
- [ ] Implement `listWorktrees(repoPath)` parsing `git worktree list --porcelain`
- [ ] Implement `branchExists(repoPath, branch)` using `git show-ref --verify`
- [ ] Implement `createBranch(repoPath, branch, fromBranch)` using `git branch`
- [ ] Implement `deleteBranch(repoPath, branch, force)` using `git branch -d/-D`
- [ ] Implement `fetchLatest(repoPath, remote)` using `git fetch`
- [ ] Implement `setUpstreamTracking(repoPath, branch, remote)` using `git branch --set-upstream-to`
- [ ] Implement `getStatus(repoPath)` parsing `git status --porcelain`
- [ ] Implement `getDefaultBranch(repoPath)` using `git symbolic-ref refs/remotes/origin/HEAD`
- [ ] Implement `getCurrentBranch(repoPath)` using `git rev-parse --abbrev-ref HEAD`
- [ ] Handle errors by throwing `ArashiError` with git command output
- [ ] Write unit tests with temporary git repositories

**Deliverable**: `repos/arashi/src/lib/git.ts` with full test coverage

---

### Task F2: Implement Configuration Management
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 6 hours  
**Dependencies**: D1, D2, R4  

**Description**:
Implement configuration file management in `src/lib/config.ts`.

**Acceptance Criteria**:
- [ ] Implement `loadConfig(repoPath)` reading and parsing `.arashi/config.json`
- [ ] Implement `saveConfig(repoPath, config)` writing config with pretty formatting
- [ ] Implement `addRepo(config, name, repoConfig)` adding to discovered_repos
- [ ] Implement `removeRepo(config, name)` removing from discovered_repos
- [ ] Implement `getConfigPath(repoPath)` returning `.arashi/config.json` path
- [ ] Implement `configExists(repoPath)` checking for config file
- [ ] Implement `validateConfig(config)` validating all required fields
- [ ] Implement default config generation with version, repos_dir, auto_setup
- [ ] Handle missing config with helpful error messages
- [ ] Handle malformed JSON with parse error details
- [ ] Write unit tests for all functions

**Deliverable**: `repos/arashi/src/lib/config.ts` with full test coverage

---

### Task F3: Implement Filesystem Utilities
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 4 hours  
**Dependencies**: None  

**Description**:
Implement file system operations in `src/lib/filesystem.ts`.

**Acceptance Criteria**:
- [ ] Implement `ensureDir(path)` creating directory if not exists (recursive)
- [ ] Implement `fileExists(path)` checking for file/directory existence
- [ ] Implement `isExecutable(path)` checking file execute permissions
- [ ] Implement `getWorktreePath(repoPath, branch, isBare, customPath)` computing worktree location
- [ ] Implement `copyFile(src, dest)` copying file with permissions
- [ ] Implement `removeDir(path)` removing directory recursively
- [ ] Implement `readTextFile(path)` reading file as UTF-8 string
- [ ] Implement `writeTextFile(path, content)` writing file as UTF-8
- [ ] Handle errors with descriptive messages (permissions, not found, etc.)
- [ ] Write unit tests with temporary directories

**Deliverable**: `repos/arashi/src/lib/filesystem.ts` with full test coverage

---

### Task F4: Implement Logger Utilities
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 3 hours  
**Dependencies**: R2  

**Description**:
Implement console output utilities in `src/lib/logger.ts` using chalk and ora.

**Acceptance Criteria**:
- [ ] Implement `info(message)` printing in default color
- [ ] Implement `success(message)` printing in green with checkmark
- [ ] Implement `warn(message)` printing in yellow with warning symbol
- [ ] Implement `error(message)` printing in red with X symbol
- [ ] Implement `spinner(text)` returning ora spinner instance
- [ ] Implement `table(data)` formatting tabular data with padding
- [ ] Implement `section(title)` printing section headers
- [ ] Support NO_COLOR environment variable for CI environments
- [ ] Write unit tests verifying output format (chalk stripped)

**Deliverable**: `repos/arashi/src/lib/logger.ts` with test coverage

---

### Task F5: Implement Prompt Utilities
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 3 hours  
**Dependencies**: R2  

**Description**:
Implement user interaction utilities in `src/lib/prompts.ts` using @inquirer/prompts.

**Acceptance Criteria**:
- [ ] Implement `confirm(message, defaultValue)` using inquirer confirm
- [ ] Implement `select(message, choices)` using inquirer select
- [ ] Implement `multiSelect(message, choices)` using inquirer checkbox
- [ ] Implement `input(message, defaultValue)` using inquirer input
- [ ] Handle Ctrl+C gracefully (exit code 2)
- [ ] Support --yes flag to auto-confirm all prompts (future)
- [ ] Write unit tests with mocked inquirer

**Deliverable**: `repos/arashi/src/lib/prompts.ts` with test coverage

---

### Task F6: Implement Hook System
**Priority**: P2  
**Estimated Effort**: 4 hours  
**Dependencies**: D6, F3  

**Description**:
Implement lifecycle hook execution in `src/lib/hooks.ts`.

**Acceptance Criteria**:
- [ ] Implement `findHook(hookName, repoPath)` checking `.arashi/hooks/{name}.sh`
- [ ] Implement `validateHook(hookPath)` verifying execute permissions
- [ ] Implement `executeHook(hookPath, context)` running script with env vars
- [ ] Implement environment variable setup from HookContext
- [ ] Implement timeout handling (5 minute default, configurable)
- [ ] Implement output streaming with hook name prefix
- [ ] Handle hook failures: log error but continue (non-fatal)
- [ ] Support --no-hooks flag to skip execution
- [ ] Write unit tests with mock hook scripts

**Deliverable**: `repos/arashi/src/lib/hooks.ts` with test coverage

---

## Phase 3: Core Logic (Week 2-3)

### Task C1: Implement Worktree Orchestration
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 10 hours  
**Dependencies**: F1, F2, F3, D5  

**Description**:
Implement worktree coordination logic in `src/core/worktree.ts`.

**Acceptance Criteria**:
- [ ] Implement `createCoordinatedWorktrees(branch, options, config)` orchestration
- [ ] Implement operation logging: track each worktree/branch created
- [ ] Implement branch conflict detection and resolution dialog
- [ ] Implement repository filtering (all, --only, interactive)
- [ ] Implement progress tracking and display using spinners
- [ ] Implement error handling: catch, log, trigger rollback
- [ ] Call hook system at appropriate points (pre-create, post-create)
- [ ] Return detailed results with created paths and any warnings
- [ ] Write integration tests with multiple test repositories

**Deliverable**: `repos/arashi/src/core/worktree.ts` with integration tests

---

### Task C2: Implement Rollback Mechanism
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 6 hours  
**Dependencies**: F1, D5  

**Description**:
Implement operation rollback logic in `src/core/rollback.ts`.

**Acceptance Criteria**:
- [ ] Implement `OperationLog` class with `add(entry)` and `rollback()` methods
- [ ] Implement rollback execution: reverse iteration with error handling
- [ ] Implement rollback functions for each operation type:
  - [ ] Worktree created: remove worktree
  - [ ] Branch created: delete branch
  - [ ] Directory created: remove directory
- [ ] Log rollback progress and results
- [ ] Handle rollback failures gracefully (log but continue)
- [ ] Write unit tests for each rollback scenario

**Deliverable**: `repos/arashi/src/core/rollback.ts` with unit tests

---

### Task C3: Implement Repository Management
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 6 hours  
**Dependencies**: F1, F2, F3  

**Description**:
Implement repository discovery and management in `src/core/repository.ts`.

**Acceptance Criteria**:
- [ ] Implement `discoverRepositories(reposDir)` scanning for git repositories
- [ ] Implement `detectDefaultBranch(repoPath)` using git.getDefaultBranch
- [ ] Implement `detectSetupScript(repoPath)` checking for setup.sh
- [ ] Implement `cloneRepository(gitUrl, targetPath)` using git clone
- [ ] Implement `validateRepositoryStructure(config)` verifying all repos exist
- [ ] Implement `getRepositoryInfo(repoPath)` gathering metadata
- [ ] Write unit tests with temporary repository fixtures

**Deliverable**: `repos/arashi/src/core/repository.ts` with unit tests

---

## Phase 4: Commands - P1 Commands (Week 3-4)

### Task CMD1: Implement Init Command
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 6 hours  
**Dependencies**: C3, F2, F3, F4, D3  

**Description**:
Implement `arashi init` command in `src/commands/init.ts`.

**Acceptance Criteria**:
- [ ] Verify current directory is a git repository
- [ ] Create `.arashi/` directory structure
- [ ] Generate default config.json with options (repos_dir, auto_setup)
- [ ] Create repos directory if specified
- [ ] Add repos directory to .gitignore if not present
- [ ] Discover existing repositories in repos directory
- [ ] Create example hook templates in .arashi/hooks/
- [ ] Display success message with discovered repositories
- [ ] Handle errors: not a git repo, config already exists
- [ ] Write integration tests

**Deliverable**: `repos/arashi/src/commands/init.ts` with integration tests

---

### Task CMD2: Implement Add Command
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 6 hours  
**Dependencies**: C3, F2, F4, D3  

**Description**:
Implement `arashi add <git-url>` command in `src/commands/add.ts`.

**Acceptance Criteria**:
- [ ] Validate git URL format
- [ ] Derive repository name from URL or use custom name
- [ ] Clone repository into repos directory
- [ ] Detect default branch using git.getDefaultBranch
- [ ] Detect setup script presence
- [ ] Update config.json with repository metadata
- [ ] Create setup.sh template if requested
- [ ] Display success message with repository info
- [ ] Handle errors: clone failure, duplicate name, invalid config
- [ ] Write integration tests

**Deliverable**: `repos/arashi/src/commands/add.ts` with integration tests

---

### Task CMD3: Implement Create Command
**Priority**: P1 (Critical Path)  
**Estimated Effort**: 10 hours  
**Dependencies**: C1, C2, F5, F6, D3  

**Description**:
Implement `arashi create <branch>` command in `src/commands/create.ts`.

**Acceptance Criteria**:
- [ ] Load configuration and validate
- [ ] Determine worktree location (bare vs regular repo)
- [ ] Handle repository selection (all, --only, interactive)
- [ ] Execute pre-create hooks
- [ ] Create main repository worktree
- [ ] For each selected sub-repository:
  - [ ] Fetch latest from default branch
  - [ ] Check branch existence, handle conflicts
  - [ ] Create branch if needed
  - [ ] Set up remote tracking
  - [ ] Create worktree
  - [ ] Log operation for rollback
- [ ] Execute post-create hooks
- [ ] Run setup scripts if auto_setup enabled
- [ ] Display success summary with paths
- [ ] Handle errors with full rollback
- [ ] Write integration tests with multiple scenarios

**Deliverable**: `repos/arashi/src/commands/create.ts` with integration tests

---

## Phase 5: Commands - P2 Commands (Week 5)

### Task CMD4: Implement Status Command
**Priority**: P2  
**Estimated Effort**: 6 hours  
**Dependencies**: F1, F2, F4, D3  

**Description**:
Implement `arashi status` command in `src/commands/status.ts`.

**Acceptance Criteria**:
- [ ] Load configuration
- [ ] Get current repository status
- [ ] Get status for each sub-repository
- [ ] Parse git status output (clean, dirty, ahead/behind)
- [ ] Format output with colors (green=clean, yellow=dirty)
- [ ] Support verbose mode with full git status output
- [ ] Support short mode with one-line summary
- [ ] Display summary with clean/dirty counts
- [ ] Handle errors: not in worktree, repo not found
- [ ] Write integration tests

**Deliverable**: `repos/arashi/src/commands/status.ts` with integration tests

---

### Task CMD5: Implement Remove Command
**Priority**: P2  
**Estimated Effort**: 8 hours  
**Dependencies**: F1, F2, F4, F5, D3  

**Description**:
Implement `arashi remove <branch>` command in `src/commands/remove.ts`.

**Acceptance Criteria**:
- [ ] Load configuration
- [ ] Find worktrees for specified branch
- [ ] Check for uncommitted changes (unless --no-check-dirty)
- [ ] Warn user and require confirmation if dirty
- [ ] Remove worktrees from sub-repositories (unless --keep-worktrees)
- [ ] Remove main repository worktree (unless --keep-worktrees)
- [ ] Delete branches from sub-repositories (unless --keep-branches)
- [ ] Delete main repository branch (unless --keep-branches)
- [ ] Display success message with removed items
- [ ] Handle errors: branch not found, worktree in use
- [ ] Write integration tests with various flags

**Deliverable**: `repos/arashi/src/commands/remove.ts` with integration tests

---

### Task CMD6: Implement List Command
**Priority**: P2  
**Estimated Effort**: 4 hours  
**Dependencies**: F1, F2, F4, D3  

**Description**:
Implement `arashi list` command in `src/commands/list.ts`.

**Acceptance Criteria**:
- [ ] Load configuration
- [ ] List all worktrees from main repository
- [ ] For each worktree, gather sub-repository info
- [ ] Display worktree paths, branches, and status
- [ ] Support verbose mode with detailed sub-repo info
- [ ] Support JSON output format
- [ ] Display total worktree count
- [ ] Handle errors: no worktrees found
- [ ] Write integration tests

**Deliverable**: `repos/arashi/src/commands/list.ts` with integration tests

---

## Phase 6: Commands - P3 Commands (Week 6)

### Task CMD7: Implement Setup Command
**Priority**: P3  
**Estimated Effort**: 5 hours  
**Dependencies**: F6, F2, F4, D3  

**Description**:
Implement `arashi setup` command in `src/commands/setup.ts`.

**Acceptance Criteria**:
- [ ] Load configuration
- [ ] Find all repositories with setup scripts
- [ ] Filter repositories with --only flag if provided
- [ ] Execute main repository setup hook if present
- [ ] Execute sub-repository setup scripts (sequential or parallel)
- [ ] Display progress with spinners
- [ ] Show execution time for each script
- [ ] Support verbose mode with full script output
- [ ] Handle errors: script failures, timeouts
- [ ] Write integration tests

**Deliverable**: `repos/arashi/src/commands/setup.ts` with integration tests

---

## Phase 7: Testing & Documentation (Week 6-7)

### Task T1: Write End-to-End Tests
**Priority**: P2  
**Estimated Effort**: 8 hours  
**Dependencies**: All CMD tasks  

**Description**:
Write comprehensive end-to-end workflow tests.

**Acceptance Criteria**:
- [ ] Test full workflow: init → add → create → status → remove
- [ ] Test error scenarios: network failures, permission errors, conflicts
- [ ] Test rollback scenarios: partial worktree creation failures
- [ ] Test hook execution: pre-create, post-create, setup
- [ ] Test interactive mode: branch conflict resolution, repo selection
- [ ] Test edge cases: bare repos, no remotes, manual deletions
- [ ] Verify test coverage >80%

**Deliverable**: `repos/arashi/tests/e2e/full-workflow.test.ts`

---

### Task T2: Write User Documentation
**Priority**: P2  
**Estimated Effort**: 6 hours  
**Dependencies**: All CMD tasks  

**Description**:
Write comprehensive README.md for end users.

**Acceptance Criteria**:
- [ ] Write overview: what is Arashi, key features
- [ ] Write installation instructions (npm, direct download, install script)
- [ ] Write quick start guide with example workflow
- [ ] Write command reference with examples for each command
- [ ] Write configuration documentation with example config.json
- [ ] Write hook system documentation with example hooks
- [ ] Write troubleshooting guide with common issues
- [ ] Write use cases and best practices
- [ ] Add contributing guidelines link

**Deliverable**: `repos/arashi/README.md`

---

### Task T3: Performance Testing
**Priority**: P3  
**Estimated Effort**: 4 hours  
**Dependencies**: All CMD tasks  

**Description**:
Validate performance against success criteria.

**Acceptance Criteria**:
- [ ] Test init with 5 repos completes in <5 seconds
- [ ] Test create with 5 repos completes in <30 seconds (excluding setup)
- [ ] Test status check completes in <3 seconds
- [ ] Test remove completes in <10 seconds
- [ ] Test rollback completes in <10 seconds
- [ ] Test with 20 repos to verify linear scaling
- [ ] Document performance results

**Deliverable**: `specs/001-git-worktree-manager/performance-results.md`

---

## Phase 8: Build & Distribution (Week 7)

### Task B1: Create npm Package Shim
**Priority**: P2  
**Estimated Effort**: 3 hours  
**Dependencies**: None  

**Description**:
Create platform detection shim for npm package distribution.

**Acceptance Criteria**:
- [ ] Create `bin/arashi.js` with Node.js shebang
- [ ] Implement platform/arch detection (darwin-arm64, linux-x64, win32-x64)
- [ ] Select appropriate binary from dist/ directory
- [ ] Execute binary with passed arguments
- [ ] Handle unsupported platforms with clear error
- [ ] Forward exit codes from binary
- [ ] Test on all platforms

**Deliverable**: `repos/arashi/bin/arashi.js`

---

### Task B2: Setup Build System
**Priority**: P2  
**Estimated Effort**: 4 hours  
**Dependencies**: B1  

**Description**:
Configure build scripts for cross-platform binaries.

**Acceptance Criteria**:
- [ ] Verify build:mac script produces ARM64 binary
- [ ] Verify build:linux script produces x64 binary
- [ ] Verify build:windows script produces x64 exe
- [ ] Verify build:all script builds all platforms
- [ ] Verify binaries are standalone (no node_modules needed)
- [ ] Test binary size <50MB per platform
- [ ] Document build process in README

**Deliverable**: Verified package.json build scripts

---

### Task B3: Create GitHub Actions CI Workflow
**Priority**: P3  
**Estimated Effort**: 4 hours  
**Dependencies**: T1, B2  

**Description**:
Create CI workflow for automated testing and building.

**Acceptance Criteria**:
- [ ] Create `.github/workflows/ci.yml`
- [ ] Configure triggers: pull_request, push to main
- [ ] Setup Bun in CI environment
- [ ] Run lint (bun run lint)
- [ ] Run tests (bun test)
- [ ] Build binaries for all platforms (matrix)
- [ ] Validate binaries (--version check)
- [ ] Upload artifacts
- [ ] Require all checks to pass for PR merge

**Deliverable**: `.github/workflows/ci.yml`

---

### Task B4: Create GitHub Actions Release Workflow
**Priority**: P3  
**Estimated Effort**: 6 hours  
**Dependencies**: B3  

**Description**:
Create release workflow for automated versioning and publishing.

**Acceptance Criteria**:
- [ ] Create `.github/workflows/release.yml`
- [ ] Configure manual trigger (workflow_dispatch)
- [ ] Implement conventional commit parsing
- [ ] Implement version bump logic (major/minor/patch)
- [ ] Generate CHANGELOG.md
- [ ] Commit version bump and tag
- [ ] Build binaries for all platforms
- [ ] Create GitHub release with binaries
- [ ] Publish to npm registry (requires NPM_TOKEN secret)
- [ ] Document release process

**Deliverable**: `.github/workflows/release.yml`

---

## Summary

**Total Estimated Effort**: ~135 hours (approximately 3-4 weeks for 1 developer)

**Critical Path**:
1. Research (R1-R4) → Design (D1-D5) → Foundation (F1-F6) → Core (C1-C3) → Commands (CMD1-CMD3)

**Parallel Work Opportunities**:
- R5 (Testing Strategy) can run parallel with R1-R4
- D6 (Hook System), D7 (Quickstart) can run parallel with D1-D5
- F4 (Logger), F5 (Prompts) can run parallel with F1-F3
- CMD4-CMD6 can be developed in parallel after C1-C3 complete
- Documentation (T2) can be written alongside command development

**Phase Breakdown**:
- Phase 0 (Research): ~17 hours (4 days)
- Phase 1 (Design): ~23 hours (6 days)
- Phase 2 (Foundation): ~28 hours (7 days)
- Phase 3 (Core): ~22 hours (6 days)
- Phase 4 (P1 Commands): ~22 hours (6 days)
- Phase 5 (P2 Commands): ~18 hours (5 days)
- Phase 6 (P3 Commands): ~5 hours (1 day)
- Phase 7 (Testing/Docs): ~18 hours (5 days)
- Phase 8 (Build/CI): ~17 hours (4 days)

**Next Steps**:
1. Begin Phase 0 research tasks (R1-R5)
2. Create GitHub issues for all tasks using `/speckit.issues`
3. Assign tasks to developers
4. Track progress in project board
