# Arashi Specifications Repository

> 📋 Dedicated specifications and planning repository for [Arashi](https://github.com/corwinm/arashi) development

## Overview

This repository serves as the **single source of truth** for all Arashi specifications, design documents, and planning materials. We follow a **specs-first development workflow** using [spec-kit](https://github.com/github/spec-kit) with [opencode](https://opencode.ai/) as the AI coding assistant.

### Related Repositories

- **Implementation Repository**: [github.com/corwinm/arashi](https://github.com/corwinm/arashi)
- **Specs Repository** (this repo): [github.com/corwinm/arashi-arashi](https://github.com/corwinm/arashi-arashi)

## What is Arashi?

Arashi (嵐 - "storm" in Japanese) is a Git worktree manager for meta-repositories that automatically manages worktrees across multiple related repositories. It aims to be the calm center - the eye of the storm - that brings order to the chaos of managing multiple repositories and worktrees.

## Specs-First Workflow

This repository uses the spec-kit methodology for structured, AI-assisted development:

1. **Constitution** → Establish project principles and governance
2. **Specify** → Define what to build (requirements, user stories)
3. **Plan** → Create technical implementation plan
4. **Tasks** → Generate actionable task breakdown
5. **Implement** → Execute in the main arashi repository

## Repository Structure

```
arashi-arashi/
├── .specify/
│   ├── memory/                    # Project knowledge base
│   │   ├── constitution.md        # Project governance principles
│   │   ├── design.md              # Complete technical design document
│   │   └── original-readme.md     # Archived README from main repo
│   ├── specs/                     # Feature specifications
│   │   └── 00X-feature-name/      # Individual feature folders
│   │       ├── spec.md            # Feature specification
│   │       ├── plan.md            # Implementation plan
│   │       └── tasks.md           # Task breakdown
│   ├── templates/                 # Spec-kit templates
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   └── tasks-template.md
│   ├── scripts/                   # Automation scripts
│   │   └── bash/
│   └── examples/                  # Reference examples
│       ├── sample-config.json     # Example arashi config
│       └── sample-setup.sh        # Example setup script
├── .opencode/                     # OpenCode configuration
├── README.md                      # This file
├── CONTRIBUTING.md                # Development workflow guide
└── LICENSE
```

## Getting Started

### Prerequisites

- [opencode](https://opencode.ai/) - AI coding assistant
- [uv](https://docs.astral.sh/uv/) - Python package manager
- [Python 3.11+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)
- [specify CLI](https://github.com/github/spec-kit) (installation below)

### Installation

1. **Install specify CLI**:
   ```bash
   uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
   ```

2. **Clone this repository**:
   ```bash
   git clone https://github.com/corwinm/arashi-arashi.git
   cd arashi-arashi/setup  # or your worktree name
   ```

3. **Launch opencode**:
   ```bash
   opencode
   ```

4. **Verify slash commands are available**:
   Type `/` in opencode to see available spec-kit commands:
   - `/speckit.constitution` - Establish project principles
   - `/speckit.specify` - Create feature specification
   - `/speckit.plan` - Generate implementation plan
   - `/speckit.tasks` - Create task breakdown
   - `/speckit.implement` - Execute implementation

### Creating Your First Specification

1. **Review the constitution** (already created):
   ```bash
   cat .specify/memory/constitution.md
   ```

2. **Review the design document**:
   ```bash
   cat .specify/memory/design.md
   ```

3. **Create a new feature spec** using opencode:
   ```
   /speckit.specify
   
   [Describe your feature here, referencing design.md phases if applicable]
   ```

4. **Follow the workflow**:
   - Use `/speckit.clarify` to clarify ambiguous requirements (optional)
   - Use `/speckit.plan` to create implementation plan
   - Use `/speckit.tasks` to generate task breakdown
   - Use `/speckit.implement` to execute in main arashi repo

## Development Workflow

### For Specifications (This Repo)

1. **Create branch for new feature**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Use spec-kit slash commands** in opencode to:
   - Create specification
   - Generate implementation plan
   - Create task breakdown

3. **Review and refine** the generated artifacts

4. **Commit specifications**:
   ```bash
   git add .specify/specs/00X-your-feature/
   git commit -m "feat: add specification for your-feature"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** for review

### For Implementation (Main Repo)

1. **Reference the spec** from this repository

2. **Implement in arashi repo**:
   ```bash
   cd ../../arashi  # or wherever your arashi repo is
   git checkout -b feature/your-feature-name
   # Implement according to spec
   ```

3. **Link back to spec** in commit messages and PR descriptions

4. **Update spec** if implementation requires changes

## Key Documents

- **[Design Document](./.specify/memory/design.md)** - Complete technical design and roadmap
- **[Constitution](./.specify/memory/constitution.md)** - Project governance principles
- **[Sample Config](./.specify/examples/sample-config.json)** - Example arashi configuration
- **[Sample Setup](./.specify/examples/sample-setup.sh)** - Example setup script

## Spec-Kit Enhancement Commands

Optional commands for improved quality:

- `/speckit.clarify` - Ask structured questions before planning
- `/speckit.analyze` - Cross-artifact consistency analysis
- `/speckit.checklist` - Generate quality validation checklists

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed workflow and guidelines.

Quick summary:
1. Specs are created in **this repository** first
2. Implementation happens in the **main arashi repository**
3. Use conventional commits: `feat:`, `fix:`, `docs:`, etc.
4. All PRs require review
5. Squash merge with conventional commit message

## Architecture

Arashi is built with:
- **Runtime**: Bun (single-file executable)
- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **User Prompts**: @inquirer/prompts

## Current Status

🚧 **Under Active Development** - Phase 1 Complete

See [Design Document](./.specify/memory/design.md) for complete roadmap.

### Current Phase: Foundation (Phase 1)
- [x] Project setup and structure
- [x] Type definitions
- [ ] Utility libraries (git, config, filesystem, logger, prompts)

### Next Phase: Core Commands (Phase 2)
- [ ] `init` command
- [ ] `add` command
- [ ] `create` command

## License

MIT - See [LICENSE](./LICENSE)

---

**Note**: This is a specifications repository. For the implementation, see [github.com/corwinm/arashi](https://github.com/corwinm/arashi).
