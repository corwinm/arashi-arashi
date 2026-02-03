# Contributing to Arashi

Thank you for your interest in contributing to Arashi! This document outlines our specs-first development workflow and contribution guidelines.

## Overview

Arashi uses a **meta-repository structure**:
- **This repo** (arashi-arashi): Specifications, planning, and design documents
- **Implementation repos**: Located in `repos/` directory (git worktrees)
  - `repos/arashi/`: Main implementation repository

**IMPORTANT**: The `repos/arashi/` directory is a separate git repository with its own branches and commits. Do NOT commit implementation code to the meta repo root.

📖 **See [Implementation Workflow](docs/implementation-workflow.md) for detailed step-by-step guide.**

## Quick Start

For complete workflow documentation, see [docs/implementation-workflow.md](docs/implementation-workflow.md).

## Specs-First Development Workflow

### 1. Specification Phase (Meta Repository)

All features start with a specification in this repository.

#### Step 1.1: Create Feature Branch
```bash
git checkout -b 001-feature-name
```

**Branch naming**: Use `NNN-feature-name` format (e.g., `001-git-utility-lib`)

#### Step 1.2: Create Specification Files

Use `/speckit` commands in OpenCode to create specification:

```bash
/speckit.specify  # Create spec.md
/speckit.plan     # Create plan.md
/speckit.tasks    # Create tasks.md
```

Manually create additional files as needed:
- `research.md` - Research decisions
- `data-model.md` - Entity definitions
- `contracts/` - API contracts

This creates: `specs/001-feature-name/`

#### Step 1.3: Commit Specification
```bash
git add specs/001-feature-name/
git commit -m "feat: add specification for feature-name

- Create spec with N user stories and acceptance criteria
- Generate implementation plan with Tech Stack
- Document M research decisions
- Break down into X tasks across Y phases
- Follows constitutional principles"

git push origin 001-feature-name
```

#### Step 1.4: Create Meta Repo PR
```bash
gh pr create --head 001-feature-name --title "feat: Add Feature Name specification (Feature 001)" --base main
```

### 2. Implementation Phase (Implementation Repository)

**CRITICAL**: Implementation happens in `repos/arashi/`, which is a **separate git repository**.

#### Step 2.1: Switch to Implementation Repository
```bash
cd repos/arashi/
git status  # Verify you're in the implementation repo (not meta repo!)
git checkout -b 001-feature-name  # Same branch name as meta repo
```

#### Step 2.2: Implement According to Specification

Follow TDD approach:
1. Write tests first (they should fail)
2. Implement functionality  
3. Run tests until they pass
4. Refactor as needed

```bash
# Run tests
bun test

# Check coverage
bun test --coverage
```

#### Step 2.3: Commit Implementation Regularly
```bash
git add src/ tests/
git commit -m "feat: implement feature-name (Phase 3 - User Story 1)

- Implement core functionality
- Add N unit tests and M integration tests
- All tests passing (X/X)

Completed tasks: T008-T012
Feature: 001-feature-name
Test coverage: NN%
Next: Phase 4"
```

#### Step 2.4: Push and Create Implementation PR
```bash
git push -u origin 001-feature-name

gh pr create --head 001-feature-name --title "feat: Implement Feature Name (Phase 1-3)" --base main
```

**IMPORTANT**: Link to meta repo PR in the implementation PR description.

### 3. Cleanup Phase (Meta Repository)

#### Step 3.1: Remove Misplaced Files

Common mistake: Implementation files accidentally created in meta repo.

```bash
cd ../../  # Back to meta repo root

# If you see src/, tests/, package.json, tsconfig.json in meta repo:
rm -rf src/ tests/ package.json tsconfig.json

git add -A
git commit -m "chore: remove wrongly placed implementation files from meta repo"
```

**Meta repo should ONLY contain**:
- `specs/` - Feature specifications
- `docs/` - Documentation
- `repos/` - Links to implementation repos
- `CONTRIBUTING.md`, `README.md`, `LICENSE`

**Meta repo should NEVER contain**:
- `src/` - Source code (goes in repos/arashi/)
- `tests/` - Test files (goes in repos/arashi/)
- `package.json` - Implementation config (goes in repos/arashi/)
- `tsconfig.json` - TypeScript config (goes in repos/arashi/)

### 3. Review Process

#### Specification Review
- Verify alignment with constitution
- Check completeness of user stories
- Validate acceptance criteria
- Ensure implementation plan is feasible
- Confirm task breakdown is actionable

#### Implementation Review
- Code follows TypeScript strict mode
- Tests have >80% coverage
- Error handling includes rollback
- CLI output is clear and informative
- Matches specification
- Platform-independent

### 4. Merge Process

#### Specs Repository
- **Squash merge** with conventional commit message
- Format: `feat(scope): description`
- Include BREAKING CHANGE if applicable

#### Main Repository
- **Squash merge** with conventional commit message
- Reference spec in commit body
- Follow semver for releases

## Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for both repositories.

### Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat:` - New feature (minor version bump)
- `fix:` - Bug fix (patch version bump)
- `docs:` - Documentation only
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes

### Breaking Changes
Add `!` after type or include `BREAKING CHANGE:` in footer:
```
feat!: change config file format

BREAKING CHANGE: config.json structure changed, migration needed
```

### Examples
```bash
feat(create): add interactive mode for repo selection
fix(remove): handle worktrees with uncommitted changes
docs: update installation instructions
refactor(git): extract common git operations
test(config): add tests for config validation
```

## Development Setup

### Prerequisites
- [opencode](https://opencode.ai/) - AI coding assistant
- [uv](https://docs.astral.sh/uv/) - Python package manager
- [Python 3.11+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)
- [Bun](https://bun.sh/) >= 1.3.0 (for implementation)

### Specs Repository Setup
```bash
# Clone specs repo
git clone https://github.com/corwinm/arashi-arashi.git
cd arashi-arashi/setup

# Install specify CLI
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# Verify installation
specify check

# Launch opencode
opencode
```

### Main Repository Setup
```bash
# Clone main repo
git clone https://github.com/corwinm/arashi.git
cd arashi

# Install dependencies
bun install

# Run in development mode
bun run dev

# Run tests
bun test

# Type check
bun run lint
```

## Code Style

### TypeScript
- Strict mode enabled
- No implicit any
- Explicit return types for public functions
- Consistent error handling patterns

### Testing
- TDD approach when applicable
- Test coverage >80%
- Test both happy path and error cases
- Test rollback scenarios

### CLI Output
- Use logger utility for consistent output
- Clear progress indicators for long operations
- Informative error messages with suggestions
- Confirmation prompts before destructive operations

### Error Handling
- Track operations during execution
- Rollback all changes on any error
- Provide clear error messages
- Suggest fixes for common errors

## Project Structure

### Meta Repository (This Repo)
```
arashi-arashi/
├── specs/                        # Feature specifications
│   └── 001-feature-name/
│       ├── spec.md              # User stories, acceptance criteria
│       ├── plan.md              # Technical implementation plan
│       ├── research.md          # Research decisions (optional)
│       ├── data-model.md        # Entity definitions (optional)
│       ├── tasks.md             # Task breakdown with phases
│       └── contracts/           # API contracts (optional)
├── repos/                        # Implementation repositories (git worktrees)
│   └── arashi/                  # Main implementation (SEPARATE REPO)
├── docs/                         # Project documentation
│   └── implementation-workflow.md  # Detailed workflow guide
├── .specify/                     # Spec-kit configuration
│   ├── memory/
│   │   ├── constitution.md      # Governance principles
│   │   └── design.md            # Technical design
│   ├── templates/
│   └── scripts/
├── CONTRIBUTING.md               # This file
└── README.md
```

### Implementation Repository (repos/arashi/)
```
repos/arashi/           # Separate git repository!
├── src/
│   ├── commands/       # CLI commands
│   ├── lib/            # Utility libraries
│   │   ├── git.ts
│   │   └── errors.ts
│   └── types/          # TypeScript types
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── helpers/        # Test utilities
├── package.json        # Project configuration
└── tsconfig.json       # TypeScript configuration
```

## Getting Help

- **Questions**: Open a discussion in this repo
- **Bugs**: Open an issue in the main repo with reproduction steps
- **Feature Ideas**: Start with a discussion, then create a spec

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the specs-first workflow
- Maintain high code quality standards

## Recognition

Contributors will be recognized in:
- Release notes
- Contributors list
- Project documentation

Thank you for contributing to Arashi! 🌊
