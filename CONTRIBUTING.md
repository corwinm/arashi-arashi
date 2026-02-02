# Contributing to Arashi

Thank you for your interest in contributing to Arashi! This document outlines our specs-first development workflow and contribution guidelines.

## Overview

Arashi uses a **two-repository workflow**:
- **This repo** (arashi-arashi): Specifications, planning, and design documents
- **Main repo** (arashi): Implementation code

## Specs-First Development Workflow

### 1. Specification Phase (This Repository)

All features start with a specification in this repository.

#### Step 1.1: Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

#### Step 1.2: Establish or Review Constitution
If this is your first contribution, review the project principles:
```bash
cat .specify/memory/constitution.md
```

The constitution guides all technical decisions and implementations.

#### Step 1.3: Create Feature Specification
Launch opencode and use the `/speckit.specify` command:

```
/speckit.specify

[Describe your feature]
Example:
- What problem does it solve?
- Who are the users?
- What are the acceptance criteria?
- Reference the design.md phases if applicable
```

This creates: `.specify/specs/00X-feature-name/spec.md`

#### Step 1.4: Clarify Requirements (Optional but Recommended)
Use `/speckit.clarify` to identify and resolve ambiguous areas:

```
/speckit.clarify
```

This helps catch unclear requirements before planning.

#### Step 1.5: Create Implementation Plan
Use `/speckit.plan` to generate a technical implementation plan:

```
/speckit.plan

Specify tech stack and architecture decisions:
- TypeScript/Bun
- Which utility libraries are needed
- Testing approach
- Error handling strategy
```

This creates: `.specify/specs/00X-feature-name/plan.md`

#### Step 1.6: Analyze Quality (Optional)
Use `/speckit.analyze` to check consistency:

```
/speckit.analyze
```

#### Step 1.7: Generate Task Breakdown
Use `/speckit.tasks` to create actionable tasks:

```
/speckit.tasks
```

This creates: `.specify/specs/00X-feature-name/tasks.md`

#### Step 1.8: Commit Specification
```bash
git add .specify/specs/00X-feature-name/
git commit -m "feat: add specification for your-feature

- Create spec with user stories and acceptance criteria
- Generate implementation plan with TypeScript/Bun stack
- Break down into actionable tasks
- Follows constitution principles"
```

#### Step 1.9: Create Pull Request
```bash
git push origin feature/your-feature-name
```

Create a PR with:
- Link to related issues
- Summary of the feature
- Key decisions made
- Impact on existing features

### 2. Implementation Phase (Main Repository)

Once the spec is approved, implement in the main arashi repository.

#### Step 2.1: Reference the Spec
```bash
cd ../../arashi  # or path to main repo
git checkout -b feature/your-feature-name
```

#### Step 2.2: Implement According to Spec
Follow the implementation plan and task breakdown from the spec.

Key principles from constitution:
- TypeScript strict mode
- Comprehensive error handling with rollback
- Test-driven development
- Clear, informative CLI output
- Platform-independent design

#### Step 2.3: Link to Spec in Commits
```bash
git commit -m "feat: implement your-feature

Implements specification from arashi-arashi repo:
https://github.com/corwinm/arashi-arashi/tree/feature/your-feature-name

- Completed task 1.x
- Completed task 2.x
- Added tests with >80% coverage
- Follows error handling principles"
```

#### Step 2.4: Create Implementation PR
Create PR in main arashi repo with:
- Link to specification PR/branch
- Implementation details
- Test coverage report
- Screenshots/demos if applicable

#### Step 2.5: Update Spec if Needed
If implementation reveals issues with the spec:
1. Document learnings
2. Update spec in this repo
3. Reference the implementation PR

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

### Specs Repository (This Repo)
```
.specify/
├── memory/              # Project knowledge
│   ├── constitution.md  # Governance principles
│   └── design.md        # Technical design
├── specs/               # Feature specifications
│   └── 00X-feature/
│       ├── spec.md      # Requirements
│       ├── plan.md      # Implementation plan
│       └── tasks.md     # Task breakdown
├── templates/           # Spec-kit templates
├── scripts/             # Automation
└── examples/            # Reference examples
```

### Main Repository (arashi)
```
src/
├── commands/            # CLI commands
│   ├── init.ts
│   ├── add.ts
│   └── create.ts
├── lib/                 # Utility libraries
│   ├── git.ts
│   ├── config.ts
│   └── filesystem.ts
└── types/               # TypeScript types
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
