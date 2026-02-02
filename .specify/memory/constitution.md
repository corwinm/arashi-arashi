<!--
SYNC IMPACT REPORT - Constitution Update
=========================================
Version Change: [INITIAL_VERSION] → 1.0.0
Created: 2026-02-02

This is the initial constitution for the Arashi project, establishing core principles
and governance for development. Extracted from design.md and aligned with spec-kit
methodology.

Modified Principles: N/A (initial creation)
Added Sections:
  - 10 Core Principles (Single-File Executable, Automatic Worktree Management,
    Error Recovery & Rollback, User-Centric Interface, Minimalist Configuration,
    Cross-Platform Compatibility, Test Coverage, Semantic Versioning, Hook System,
    Performance Standards)
  - Development Workflow section
  - Distribution Strategy section
  - Governance section

Removed Sections: N/A (initial creation)

Templates Requiring Updates:
  ✅ plan-template.md - Constitution Check section already present
  ✅ spec-template.md - No constitution-specific updates needed
  ✅ tasks-template.md - No constitution-specific updates needed

Follow-up TODOs: None
-->

# Arashi Project Constitution

## Core Principles

### I. Single-File Executable
Arashi MUST be distributed as a standalone, single-file executable with no runtime dependencies.

**Rules:**
- Build targets: macOS ARM64, Linux x64, Windows x64
- Binary size target: < 50MB
- No external runtime required (Bun runtime bundled)
- Platform detection handled automatically

**Rationale:** Users should be able to download and run Arashi immediately without
installing Node.js, Bun, or any other runtime. This maximizes accessibility and
reduces setup friction.

### II. Automatic Worktree Management
Worktree creation MUST automatically coordinate across the main repository and all
configured sub-repositories with a single command.

**Rules:**
- One command creates worktrees for main repo + all sub-repos
- Automatic branch creation from default branch with latest changes
- Remote tracking setup by default
- Automatic directory structure creation
- Support for both bare and regular repositories

**Rationale:** The core value proposition of Arashi is eliminating manual worktree
management across multiple repositories. This MUST remain the primary focus.

### III. Error Recovery & Rollback
Any failed operation MUST automatically rollback all changes to leave repositories
in a clean state.

**Rules:**
- Track all operations during command execution
- On error, reverse all completed operations in reverse order
- Provide clear error messages with suggested fixes
- Never leave partial worktree configurations
- Handle dirty worktrees with user confirmation

**Rationale:** Partial failures in multi-repository operations create confusing and
hard-to-debug states. Complete rollback ensures users always have a working state.

### IV. User-Centric Interface
All commands MUST provide clear, informative output with progress indicators and
meaningful error messages.

**Rules:**
- Show progress for long-running operations (spinners, progress bars)
- Color-coded output (success=green, warning=yellow, error=red)
- Structured output with clear sections and hierarchy
- Support both human-readable and JSON output formats
- Interactive prompts for ambiguous situations
- Confirmation prompts for destructive operations (unless --force)

**Rationale:** Good UX reduces cognitive load and builds trust. Users should always
understand what Arashi is doing and why.

### V. Minimalist Configuration
Configuration MUST be minimal and auto-discovered wherever possible.

**Rules:**
- Auto-discover git repositories in repos/ directory
- Auto-detect default branch names
- Auto-detect bare vs regular repository
- Store configuration in .arashi/config.json
- Manual configuration only when auto-detection insufficient
- Version configuration file for future migrations

**Rationale:** Reducing configuration burden accelerates onboarding and reduces
maintenance. Auto-discovery eliminates manual tedium while allowing overrides when
needed.

### VI. Cross-Platform Compatibility
Arashi MUST work identically on macOS, Linux, and Windows.

**Rules:**
- Use Bun's cross-platform APIs exclusively
- Test all features on all supported platforms
- Handle platform-specific path separators correctly
- Account for platform-specific git behaviors
- Document any unavoidable platform differences

**Rationale:** Development teams use heterogeneous environments. Arashi must work
seamlessly everywhere to avoid fragmenting the user experience.

### VII. Test Coverage
All features MUST have automated tests with >80% code coverage.

**Rules:**
- Write tests during or after implementation (flexible timing)
- Unit tests for utility functions (git, config, filesystem)
- Integration tests for commands (init, create, remove, etc.)
- End-to-end tests for complete workflows
- Tests MUST cover edge cases and error scenarios
- Use Bun's built-in test runner

**Rationale:** High test coverage prevents regressions and enables confident
refactoring. The 80% threshold ensures core logic is tested while allowing
flexibility for straightforward code.

### VIII. Semantic Versioning
Arashi MUST follow semantic versioning (MAJOR.MINOR.PATCH) with special handling
before 1.0.0 release.

**Rules:**
- **Pre-1.0.0 (current):**
  - MAJOR: Reserved for 1.0.0 release
  - MINOR: New features OR breaking changes (0.1.0 → 0.2.0)
  - PATCH: Bug fixes and minor improvements (0.1.0 → 0.1.1)
- **Post-1.0.0:**
  - MAJOR: Breaking changes or API removals (1.0.0 → 2.0.0)
  - MINOR: New features, backward compatible (1.0.0 → 1.1.0)
  - PATCH: Bug fixes, no new features (1.0.0 → 1.0.1)
- Breaking changes MUST include migration documentation
- Use conventional commits for automated versioning

**Rationale:** Semantic versioning communicates change impact clearly. Pre-1.0.0
flexibility allows iteration without artificial constraints, while post-1.0.0
strictness protects production users.

### IX. Hook System
Arashi MUST support lifecycle hooks to enable custom automation.

**Rules:**
- Support hooks: pre-create.sh, post-create.sh, setup.sh
- Pass context via environment variables (branch name, worktree path, etc.)
- Hooks execute with user's shell environment
- Hook failures MUST be surfaced clearly
- Warn users about hook execution security
- Provide --no-hooks flag to bypass
- Check execute permissions before running

**Rationale:** Users have diverse workflows and toolchains. Hooks provide
extensibility without bloating Arashi's core functionality.

### X. Performance Standards
Commands MUST complete quickly to maintain workflow momentum.

**Rules:**
- Worktree creation for 5 repos: < 30 seconds (excluding network I/O)
- Status checks: < 5 seconds for 5 repos
- List operations: < 2 seconds
- Use parallel operations where safe (e.g., fetching from multiple repos)
- Show progress for operations > 1 second
- Optimize for common case (default branch creation)

**Rationale:** Slow tools disrupt flow state. Arashi's value diminishes if it
introduces significant delays compared to manual operations.

## Development Workflow

### Specification Process
All features MUST follow the spec-kit methodology:

1. **Specification** (`.specify/specs/###-feature/spec.md`)
   - User stories with priorities (P1, P2, P3...)
   - Functional requirements
   - Success criteria
   - Edge cases

2. **Planning** (`.specify/specs/###-feature/plan.md`)
   - Technical context and dependencies
   - Constitution compliance check
   - Project structure decisions
   - Complexity justification (if needed)

3. **Task Breakdown** (`.specify/specs/###-feature/tasks.md`)
   - Concrete, actionable tasks
   - Organized by user story
   - Parallel execution opportunities identified
   - Clear dependencies documented

4. **Implementation** (main arashi repository)
   - Follow task breakdown
   - Each user story independently testable
   - Reference spec in commits/PRs

### Code Review Requirements
All changes MUST pass code review before merge:

- At least one approval from maintainer
- All CI checks passing (tests, linting, builds)
- Constitution compliance verified
- Breaking changes documented with migration guide

### Commit Standards
All commits MUST follow conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `feat!:` or `fix!:` - Breaking changes (major version bump)

**Examples:**
```
feat(create): add interactive mode for repo selection
fix(remove): handle worktrees with uncommitted changes
docs: update installation instructions for npm
feat!: change config file format to support templates
```

## Distribution Strategy

### Release Channels
Arashi is distributed through two channels:

1. **GitHub Releases** - Pre-built binaries for direct download
2. **npm Package** - Platform detection wrapper with bundled binaries

### CI/CD Pipeline
**Continuous Integration (PR & Push):**
- Triggered on pull requests and pushes to main
- Run tests, linting, type checking
- Build binaries for all platforms
- All checks MUST pass before merge
- Squash merge with conventional commit message

**Release Pipeline (On-Demand):**
- Manual trigger via GitHub Actions
- Analyze commits using conventional commits
- Determine version bump automatically
- Generate CHANGELOG.md
- Create git tag
- Build and attach binaries to GitHub release
- Publish to npm registry

### Installation Methods
Users can install via:
1. `npm install -g arashi` (recommended)
2. Direct binary download from GitHub releases
3. Install script (curl/bash) for automation

## Governance

### Constitution Authority
This constitution supersedes all other development practices and guidelines.

### Amendment Process
Constitution amendments:
- MUST be proposed via pull request with rationale
- MUST include impact analysis on existing specs/plans
- MUST update dependent templates and documentation
- REQUIRE approval from project maintainers
- VERSION bumping:
  - MAJOR: Principle removal or backward-incompatible redefinition
  - MINOR: New principle added or material expansion
  - PATCH: Clarifications, wording fixes, non-semantic refinements

### Compliance Review
All specifications MUST include a "Constitution Check" section verifying:
- Single-file executable maintained
- Worktree coordination preserved
- Error rollback implemented
- User-centric output provided
- Configuration minimized
- Cross-platform compatibility ensured
- Test coverage >80%
- Semantic versioning followed
- Hooks supported (if applicable)
- Performance standards met

### Complexity Justification
Any violation of constitutional principles MUST be explicitly justified:
- Document the specific need
- Explain why simpler alternatives were rejected
- Include in plan.md "Complexity Tracking" section
- Subject to maintainer review

### Repository Split
**Specifications Repository** (arashi-arashi):
- Specs, plans, and task breakdowns
- Constitution and design documents
- Spec-kit templates and commands

**Implementation Repository** (arashi):
- Source code and tests
- Distribution artifacts
- User-facing documentation

**Rationale:** Separating specs from implementation prevents spec/plan documents
from cluttering the main repository while enabling focused spec-kit workflow.

### Runtime Guidance
For AI agent assistance during implementation, use guidance files in the main
arashi repository. Constitution principles apply universally across all agents
and workflows.

**Version**: 1.0.0 | **Ratified**: 2026-02-02 | **Last Amended**: 2026-02-02
