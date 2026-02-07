# Implementation Plan: Add Command

**Branch**: `001-add-command` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-command/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement `arashi add` command to enable developers to add Git repositories to their arashi workspace. The command will validate Git URLs, clone repositories into the repos directory, detect repository metadata (default branch, setup scripts), and update the workspace configuration file. The feature provides error handling for common failure scenarios (duplicate names, invalid URLs, clone failures) with automatic rollback on errors to maintain configuration integrity.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)  
**Primary Dependencies**: commander (CLI framework), chalk (colored output), ora (spinners), @inquirer/prompts (user prompts)  
**Storage**: File system (`.arashi/config.json` for workspace configuration)  
**Testing**: Bun test (built-in test runner), integration tests with temporary repositories  
**Target Platform**: Cross-platform (macOS, Linux, Windows) - single executable via Bun compile  
**Project Type**: Single project (CLI tool)  
**Performance Goals**: Add operation completes in under 30 seconds for typical repositories (excluding network clone time)  
**Constraints**: No runtime dependencies (bundled executable), configuration file must remain valid in 100% of error cases  
**Scale/Scope**: Supports adding unlimited repositories to workspace, handles repositories of any size (limited by disk space and Git)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **I. Single-File Executable** | ✅ Pass | Command is part of arashi CLI bundled as single executable via Bun compile |
| **II. Automatic Worktree Management** | ✅ Pass | Add command registers repos for later worktree coordination, does not create worktrees itself |
| **III. Error Recovery & Rollback** | ✅ Pass | MUST rollback partial clones and prevent configuration corruption on failure (FR-014, FR-011, SC-004) |
| **IV. User-Centric Interface** | ✅ Pass | MUST display progress, success messages, and clear error messages (FR-009, SC-003) |
| **V. Minimalist Configuration** | ✅ Pass | Auto-detects default branch and setup scripts, minimal manual configuration (FR-005, FR-006) |
| **VI. Cross-Platform Compatibility** | ✅ Pass | Uses Bun's cross-platform APIs, handles path separators correctly |
| **VII. Test Coverage** | ✅ Pass | MUST achieve >80% coverage with integration tests (FR-015, SC-005) |
| **VIII. Semantic Versioning** | ✅ Pass | No breaking changes to existing config format |
| **IX. Hook System** | ⚠️ N/A | Add command does not execute hooks, only detects them |
| **X. Performance Standards** | ✅ Pass | MUST complete in under 30 seconds excluding network I/O (SC-001) |

**Overall Status**: ✅ **PASS** - All applicable principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-add-command/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (will be generated)
├── data-model.md        # Phase 1 output (will be generated)
├── quickstart.md        # Phase 1 output (will be generated)
├── contracts/           # Phase 1 output (will be generated)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repos/arashi/)

```text
repos/arashi/
├── src/
│   ├── commands/
│   │   ├── init.ts           # Existing - initializes workspace
│   │   ├── create.ts         # Existing - creates worktrees
│   │   ├── list.ts           # Existing - lists worktrees
│   │   └── add.ts            # NEW - add repository command
│   ├── lib/
│   │   ├── config.ts         # Existing - config management (loadConfig, saveConfig, addRepo)
│   │   ├── git.ts            # Existing - git operations (exec, clone, getDefaultBranch)
│   │   ├── logger.ts         # Existing - colored output with spinners
│   │   ├── prompts.ts        # Existing - user interaction
│   │   ├── filesystem.ts     # Existing - file operations
│   │   ├── errors.ts         # Existing - error classes
│   │   └── hooks.ts          # Existing - hook detection
│   ├── core/
│   │   ├── repository.ts     # Existing - repository operations
│   │   └── rollback.ts       # Existing - rollback mechanism
│   ├── types/
│   │   └── git.ts            # Existing - Git types
│   └── index.ts              # Existing - CLI entry point
│
└── tests/
    ├── integration/
    │   ├── init.test.ts      # Existing - init command tests
    │   └── add.test.ts       # NEW - add command tests
    └── unit/
        ├── config.test.ts    # Existing - config tests
        └── git.test.ts       # Existing - git utility tests
```

**Structure Decision**: Single project structure (existing arashi CLI). The add command integrates into the existing command structure, reusing utility libraries (config, git, logger, prompts). New file `src/commands/add.ts` implements the command, with integration tests in `tests/integration/add.test.ts`. No new directories or major structural changes required.

## Complexity Tracking

> **No violations** - All constitutional principles satisfied.

## Phase 0: Research & Discovery

### Research Questions

Based on Technical Context analysis, the following areas need research:

1. **Git URL Validation**: What are the valid Git URL formats that should be accepted?
   - HTTPS URLs (https://github.com/user/repo.git)
   - SSH URLs (git@github.com:user/repo.git)
   - Git protocol URLs (git://host/repo.git)
   - File URLs (file:///path/to/repo.git)
   - SCP-style SSH shorthand (user@host:repo.git)

2. **Repository Name Derivation**: How to derive repository name from various Git URL formats?
   - Extract from HTTPS URLs
   - Extract from SSH URLs
   - Handle edge cases (.git suffix, trailing slashes, path segments)

3. **Default Branch Detection**: Best practices for detecting default branch in modern Git?
   - Use `git symbolic-ref refs/remotes/origin/HEAD`
   - Fall back to common names (main, master)
   - Handle repositories with no commits

4. **Setup Script Detection**: What are common setup script naming conventions?
   - Standard names: setup.sh, setup.bash, install.sh, bootstrap.sh
   - Platform-specific: setup.ps1 (Windows)
   - Language-specific: setup.py, setup.rb, Makefile

5. **Error Cleanup Strategy**: How to reliably clean up partial clones on failure?
   - Use try-catch with rollback
   - Check for partial clone indicators (.git directory existence)
   - Handle file system permission errors during cleanup

6. **Configuration Atomicity**: Best practices for atomic configuration updates?
   - Write to temporary file, then move
   - Validate before writing
   - Backup original on modification

### Research Tasks

The following tasks will be executed to resolve unknowns:

- **RT-001**: Research Git URL validation patterns and edge cases
- **RT-002**: Research repository name extraction from various URL formats
- **RT-003**: Research default branch detection methods (post-Git 2.28)
- **RT-004**: Research common setup script naming conventions across ecosystems
- **RT-005**: Research filesystem cleanup strategies for partial clones
- **RT-006**: Research atomic file write patterns for configuration updates

**Output**: `research.md` with findings, decisions, and rationale

## Phase 1: Design & Contracts

### Data Model

**Entities to be designed in `data-model.md`**:

1. **AddCommandOptions**: Command-line options for `arashi add`
   - gitUrl (string, required): Git repository URL
   - name (string, optional): Custom repository name
   - createSetup (boolean, optional): Whether to create setup.sh template
   - force (boolean, optional): Skip confirmation prompts

2. **AddCommandResult**: Result of add operation
   - repositoryName (string): Name of added repository
   - clonePath (string): Local filesystem path
   - defaultBranch (string): Detected default branch
   - setupScript (string | null): Path to detected setup script
   - created (boolean): Whether setup script was created

3. **GitUrlInfo**: Parsed Git URL information
   - url (string): Original URL
   - protocol (string): Protocol (https, ssh, git, file)
   - host (string): Git host (e.g., github.com)
   - owner (string): Repository owner/organization
   - repository (string): Repository name
   - derivedName (string): Suggested repository name

### API Contracts

**Command Interface** (to be detailed in `contracts/add-command.yaml`):

```yaml
command: arashi add <git-url>
options:
  --name <name>: Custom repository name
  --create-setup: Create setup.sh template
  --no-setup: Skip setup script detection
  --force: Skip confirmation prompts
  --json: Output result as JSON
```

**Exit Codes**:
- 0: Success
- 1: Invalid arguments (URL format, missing required options)
- 2: Configuration error (file corrupt, duplicate name)
- 3: Git operation error (clone failed, branch detection failed)
- 4: File system error (permissions, disk space)

**Output Format** (human-readable):
```
✓ Cloning repository from <url>...
✓ Detected default branch: <branch>
✓ Found setup script: <path>
✓ Updated configuration

Repository added successfully:
  Name:     <name>
  Location: <path>
  Branch:   <branch>
  Setup:    <script> (run with: cd <path> && ./<script>)
```

**Output Format** (JSON with --json flag):
```json
{
  "success": true,
  "repository": {
    "name": "repo-name",
    "path": "./repos/repo-name",
    "defaultBranch": "main",
    "setupScript": "./repos/repo-name/setup.sh"
  }
}
```

### Quickstart

**`quickstart.md` will include**:

1. **Basic Usage Examples**:
   ```bash
   # Add repository with auto-detected name
   arashi add https://github.com/user/repo.git

   # Add repository with custom name
   arashi add https://github.com/user/repo.git --name my-project

   # Add repository and create setup script template
   arashi add git@github.com:user/repo.git --create-setup
   ```

2. **Common Scenarios**:
   - Adding first repository to workspace
   - Adding repository with authentication (SSH)
   - Handling duplicate name errors
   - Running detected setup scripts

3. **Error Resolution Guide**:
   - Invalid URL format → examples of valid formats
   - Duplicate name → use --name flag
   - Clone failure → check network, authentication
   - Configuration corrupt → run arashi init to reset

### Agent Context Update

After Phase 1 design completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh opencode
```

This will update `AGENTS.md` with:
- New command: `arashi add <git-url>`
- New file: `src/commands/add.ts`
- Updated dependencies (if any)

## Phase 2: Task Breakdown

**Not included in this plan** - Task breakdown is generated by `/speckit.tasks` command after plan approval.

Task breakdown will organize implementation into:
- User Story 1 tasks (P1 - Basic add functionality)
- User Story 2 tasks (P2 - Setup script handling)
- User Story 3 tasks (P1 - Error handling)
- Test tasks (integration tests for each user story)

## Dependencies

### Existing Code Dependencies

- **config.ts**: `loadConfig()`, `saveConfig()`, `addRepo()` - already implemented
- **git.ts**: `exec()` - already implemented, need to add `clone()` and `getDefaultBranch()`
- **logger.ts**: `spinner()`, `success()`, `error()` - already implemented
- **prompts.ts**: `confirm()`, `input()` - already implemented
- **filesystem.ts**: File operations - already implemented
- **errors.ts**: `ArashiError`, `ConfigError` - already implemented
- **rollback.ts**: Rollback mechanism - already implemented

### New Functionality Required

- **git.ts**: Add `clone()` function (if not exists)
- **git.ts**: Add `getDefaultBranch()` function (if not exists)
- **Validation**: Git URL validation function (new or extend existing)
- **Parser**: Git URL parsing function (derive name from URL)
- **Detection**: Setup script detection function (may reuse from hooks.ts)

### External Dependencies

- **Git**: Must be installed on user's system (pre-existing requirement)
- **Network**: Required for cloning remote repositories
- **Disk Space**: Required for cloning repositories

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Git URL regex fails on edge cases | Medium | Medium | Comprehensive research (RT-001) and extensive test coverage |
| Clone hangs indefinitely (network timeout) | High | Low | Use Git's timeout flags or spawn with timeout |
| Partial clone cleanup fails due to permissions | Medium | Low | Robust error handling with user guidance |
| Default branch detection fails on empty repos | Low | Medium | Handle empty repos gracefully with clear message |
| Configuration corruption on concurrent adds | High | Very Low | File locking or atomic writes (research in RT-006) |

## Success Metrics

Based on Success Criteria from spec:

- **SC-001**: Operation completes in <30s (excluding network) ✓ Measured via integration tests
- **SC-002**: 100% duplicate prevention ✓ Validated via unit tests for config.addRepo()
- **SC-003**: 90% error resolution without docs ✓ Validated via user testing (manual)
- **SC-004**: 100% config integrity on errors ✓ Validated via error scenario integration tests
- **SC-005**: >80% test coverage ✓ Measured via Bun test coverage report

## Next Steps

1. ✅ **Phase 0 Research**: Generate `research.md` with findings from RT-001 through RT-006
2. ✅ **Phase 1 Design**: Generate `data-model.md`, `contracts/`, and `quickstart.md`
3. ✅ **Phase 1 Update**: Run agent context update script
4. ✅ **Gate Re-Check**: Verify constitution compliance after design
5. **Ready for Tasks**: Proceed to `/speckit.tasks` to generate task breakdown

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE
- Generated `research.md` with decisions for all 6 research tasks
- Resolved all technical unknowns (URL validation, name derivation, branch detection, setup scripts, cleanup, atomicity)
- Documented rationale and alternatives for each decision

### Phase 1: Design ✅ COMPLETE
- Generated `data-model.md` with all entity definitions
- Generated `contracts/add-command.md` with API contract, exit codes, output formats, error messages
- Generated `quickstart.md` with usage examples, scenarios, troubleshooting
- Updated agent context (AGENTS.md) with new technology stack

### Constitution Re-Check ✅ PASS

All constitutional principles remain satisfied after design phase:
- Single-file executable: Maintained
- Automatic worktree management: Add command supports coordination
- Error recovery & rollback: Detailed rollback strategy in research.md
- User-centric interface: Comprehensive output formats in contracts
- Minimalist configuration: Auto-detection emphasized in design
- Cross-platform compatibility: Uses Bun APIs exclusively
- Test coverage: Testing contract specifies >80% coverage
- Semantic versioning: No breaking changes
- Hook system: Setup script detection only (no execution)
- Performance standards: <30s operation time specified

**No violations or concerns identified**

---

**Status**: ✅ Planning Complete - Ready for `/speckit.tasks`
