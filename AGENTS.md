# arashi-arashi Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-03

## 🚨 IMPORTANT: Implementation Location

**All code implementation must be done in the respective project in the `repos/` folder.**

- **Specifications**: Remain in `specs/` directory of config-mgmt repo
- **Implementation**: Goes in the project repo (e.g., `repos/arashi/` for arashi project)
- **Tests**: Go with the implementation in the project repo
- **Documentation**: Project-specific docs in project repo; specs in config-mgmt

### Example Structure

```
config-mgmt/
├── specs/
│   └── 001-config-management/    # Specification stays here
│       ├── spec.md
│       ├── plan.md
│       └── ...
└── repos/
    └── arashi/                    # Implementation goes here
        ├── src/
        │   └── lib/
        │       └── config.ts      # ✓ Implementation
        └── tests/
            ├── unit/
            │   └── config.test.ts # ✓ Tests
            └── integration/
                └── config-integration.test.ts
```

**Why?** This separates planning (specs) from implementation (project code), allowing each project repo to maintain its own codebase independently while specifications remain centralized for planning.

## Active Technologies
- TypeScript + Bun (latest stable version for bundling and runtime) (003-research-tasks)
- Markdown (CommonMark specification) + None (pure documentation) (004-design-issues)
- File system (specs/001-git-worktree-manager/ directory) (004-design-issues)
- TypeScript + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path) (001-git-utility-lib)
- N/A (library layer - operates on git repositories on filesystem) (001-git-utility-lib)
- TypeScript + Bun (latest stable version) + Bun runtime (built-in APIs only - file system, path utilities) (001-config-management)
- File system (`.arashi/config.json`) (001-config-management)

- Markdown documentation (N/A - no code implementation) + Git 2.5+ (subject of research) (002-git-worktree-research)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for Markdown documentation (N/A - no code implementation)

## Code Style

Markdown documentation (N/A - no code implementation): Follow standard conventions

## Recent Changes
- 001-config-management: Added TypeScript + Bun (latest stable version) + Bun runtime (built-in APIs only - file system, path utilities)
- 001-git-utility-lib: Added TypeScript + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path)
- 004-design-issues: Added Markdown (CommonMark specification) + None (pure documentation)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
