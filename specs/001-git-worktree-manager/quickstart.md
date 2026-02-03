# Development Setup Guide (Quickstart)

**Feature**: 001-git-worktree-manager  
**Document**: [D7] #13  
**Created**: 2026-02-03  
**Status**: Draft  
**Dependencies**: None

## Purpose

This guide helps new contributors get started with Arashi development. Follow these steps to set up your development environment, run tests, and make your first contribution.

**Time to Complete**: ~10 minutes

---

## Prerequisites

Before you begin, ensure you have:

| Tool | Minimum Version | Purpose | Installation |
|------|----------------|---------|--------------|
| **Git** | 2.5+ | Version control, worktree support | [git-scm.com](https://git-scm.com/) |
| **Bun** | Latest stable | Runtime, package manager, bundler | See below |
| **Code Editor** | Any | VS Code recommended | [code.visualstudio.com](https://code.visualstudio.com/) |

**Operating Systems**: macOS, Linux, or Windows (with Git Bash or WSL)

---

## Step 1: Install Bun

Arashi uses [Bun](https://bun.sh) as its runtime and bundler.

### macOS / Linux / WSL

```bash
curl -fsSL https://bun.sh/install | bash
```

### Windows (PowerShell)

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Verify Installation

```bash
bun --version
# Expected output: 1.x.x (or higher)
```

**Note**: Restart your terminal after installation to refresh PATH.

---

## Step 2: Clone the Repository

Arashi uses a **meta-repository** pattern:
- **Meta-repo** (arashi-arashi): Contains specifications and manages sub-repos
- **Sub-repo** (repos/arashi): Contains actual CLI implementation code

```bash
# Clone the meta-repository
git clone https://github.com/your-org/arashi-arashi.git
cd arashi-arashi

# The repos/arashi sub-repo should already be present
# If not, run: arashi init (after implementing Arashi!)
```

---

## Step 3: Install Dependencies

Navigate to the sub-repo and install dependencies:

```bash
cd repos/arashi
bun install
```

**Expected Output**:
```
bun install v1.x.x
Resolving dependencies...
Installed 42 packages in 1.2s
```

---

## Step 4: Verify Setup

Run tests to verify everything is working:

```bash
bun test
```

**Expected Output**:
```
bun test v1.x.x

test/config.test.ts:
✓ loadConfig loads valid config (2ms)
✓ loadConfig throws on invalid config (1ms)

test/git-api.test.ts:
✓ execGit executes git commands (5ms)
✓ execGit throws on error (3ms)

...

Tests: 42 passed, 42 total
Time: 1.5s
```

**If tests fail**: Check prerequisites, dependency installation, or ask for help in GitHub Discussions.

---

## Repository Structure

Understanding the project layout:

```
arashi-arashi/              # Meta-repository (you are here)
├── .arashi/                # Arashi project config
│   ├── config.json         # Project configuration
│   └── hooks/              # Global lifecycle hooks
├── specs/                  # Specifications and design docs
│   ├── 001-git-worktree-manager/  # Main feature spec
│   │   ├── spec.md         # Feature specification
│   │   ├── plan.md         # Implementation plan
│   │   ├── tasks.md        # Task breakdown
│   │   ├── data-model.md   # D1 + D2 (Config & Types)
│   │   ├── contracts/      # D3-D6 (API contracts)
│   │   └── checklists/     # Validation checklists
│   └── 004-design-issues/  # Design phase documentation
└── repos/                  # Sub-repositories
    └── arashi/             # CLI implementation (THE CODE)
        ├── src/            # Source code
        │   ├── cli/        # CLI commands
        │   ├── git/        # Git wrapper API
        │   ├── config/     # Configuration loading
        │   └── index.ts    # Entry point
        ├── test/           # Test suite
        ├── package.json    # Dependencies and scripts
        └── tsconfig.json   # TypeScript configuration
```

**Key Directories**:
- `specs/`: Design documents (read before coding)
- `repos/arashi/src/`: Implementation code
- `repos/arashi/test/`: Test suite

---

## Development Workflow

### Running the CLI in Development

Test your changes without building:

```bash
cd repos/arashi

# Run any arashi command
bun run dev init
bun run dev add https://github.com/example/repo.git
bun run dev create feature-branch

# With flags
bun run dev create feature-auth -i
bun run dev list --verbose
```

**How it works**: `bun run dev` executes `src/index.ts` directly (no build step).

---

### Making Changes

1. **Read the Design Docs**:
   ```bash
   cd ../../specs/001-git-worktree-manager
   cat data-model.md           # Understand types
   cat contracts/cli-commands.md  # Understand CLI contracts
   cat contracts/git-api.md    # Understand git wrapper
   ```

2. **Create a Feature Branch**:
   ```bash
   cd repos/arashi
   git checkout -b feature/your-feature-name
   ```

3. **Write Code**:
   - Follow TypeScript best practices
   - Use types from `data-model.md`
   - Follow contracts from design docs
   - Add JSDoc comments

4. **Write Tests**:
   ```bash
   # Create test file
   touch test/your-feature.test.ts
   ```

   Example test:
   ```typescript
   import { describe, test, expect } from 'bun:test';
   import { yourFunction } from '../src/your-module';

   describe('yourFunction', () => {
     test('should do something', () => {
       const result = yourFunction('input');
       expect(result).toBe('expected output');
     });
   });
   ```

5. **Run Tests**:
   ```bash
   # Run all tests
   bun test

   # Run specific test file
   bun test test/your-feature.test.ts

   # Watch mode (re-run on file changes)
   bun test --watch
   ```

6. **Check Types**:
   ```bash
   bun run typecheck
   # or
   bunx tsc --noEmit
   ```

7. **Format Code**:
   ```bash
   bun run format
   # or
   bunx prettier --write src/
   ```

---

### Testing Your Changes

#### Unit Tests

```bash
cd repos/arashi
bun test
```

**Test Organization**:
- `test/config.test.ts`: Configuration loading tests
- `test/git-api.test.ts`: Git wrapper API tests
- `test/cli/*.test.ts`: CLI command tests
- `test/orchestration.test.ts`: Worktree orchestration tests

#### Integration Tests

```bash
# Test against real git repositories
bun test test/integration/
```

**Note**: Integration tests create temporary git repos and worktrees.

#### Manual Testing

Create a test project:

```bash
# Outside of arashi repo
mkdir test-project
cd test-project
git init

# Use your development version
/path/to/arashi-arashi/repos/arashi/bun run dev init
/path/to/arashi-arashi/repos/arashi/bun run dev add https://github.com/example/repo.git
/path/to/arashi-arashi/repos/arashi/bun run dev create test-branch
```

---

### Building Arashi

Build for your current platform:

```bash
cd repos/arashi
bun run build
```

**Output**: `dist/arashi` (or `dist/arashi.exe` on Windows)

**Test the built binary**:
```bash
./dist/arashi --version
./dist/arashi init
```

---

### Building for All Platforms

Create binaries for macOS, Linux, and Windows:

```bash
cd repos/arashi
bun run build:all
```

**Output**:
```
dist/
  arashi-macos-arm64      # macOS Apple Silicon
  arashi-macos-x64        # macOS Intel
  arashi-linux-x64        # Linux 64-bit
  arashi-linux-arm64      # Linux ARM 64-bit
  arashi-windows-x64.exe  # Windows 64-bit
```

**Note**: This requires Docker for cross-compilation (or GitHub Actions CI).

---

## Debugging

### VS Code Configuration

Create `.vscode/launch.json` in `repos/arashi/`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Arashi CLI",
      "type": "bun",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "args": ["create", "test-branch"],
      "cwd": "${workspaceFolder}/../../test-project",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Current Test File",
      "type": "bun",
      "request": "launch",
      "program": "bun",
      "args": ["test", "${file}"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

**Usage**:
1. Set breakpoints in source code (click left margin)
2. Select debug configuration from dropdown
3. Press F5 to start debugging
4. Use debug controls (continue, step over, step into, etc.)

---

### Console Debugging

Add debug logging:

```typescript
// Use console.error for debug output (won't pollute stdout)
console.error('Debug:', { variable, anotherVariable });

// Or use Bun's built-in logger
import { inspect } from 'bun';
console.error(inspect(complexObject, { depth: 5, colors: true }));
```

**Remove debug logs before committing!**

---

### Git Debugging

See actual git commands being executed:

```typescript
// In git-api.ts, add logging to execGit
async function execGit(args: string[], options: GitExecOptions = {}) {
  console.error(`[git] ${args.join(' ')}`);  // Debug log
  // ... rest of function
}
```

---

## Common Tasks

### Running Specific Commands

```bash
cd repos/arashi

# Initialize a project
bun run dev init

# Add a repository
bun run dev add https://github.com/example/repo.git

# Create worktrees
bun run dev create feature-branch -i

# List worktrees
bun run dev list -v

# Show status
bun run dev status

# Remove worktrees
bun run dev remove feature-branch

# Run setup scripts
bun run dev setup --parallel
```

---

### Working with Hooks

Test hook execution:

```bash
# Create a test hook
mkdir -p .arashi/hooks
cat > .arashi/hooks/pre-create.sh << 'EOF'
#!/usr/bin/env bash
set -e
echo "Running pre-create hook"
echo "Branch: $ARASHI_BRANCH"
echo "Repos: $ARASHI_REPO_LIST"
EOF

chmod +x .arashi/hooks/pre-create.sh

# Test hook execution
bun run dev create test-branch
```

---

### Updating Dependencies

```bash
cd repos/arashi

# Check for outdated packages
bun outdated

# Update all dependencies
bun update

# Update specific package
bun update <package-name>
```

---

## Troubleshooting

### Issue: `bun: command not found`

**Solution**: Restart terminal after installing Bun, or manually source:
```bash
source ~/.bashrc  # or ~/.zshrc
```

---

### Issue: Tests Failing

**Solution**:
1. Ensure dependencies installed: `bun install`
2. Check Bun version: `bun --version` (should be 1.x.x+)
3. Clear cache: `rm -rf node_modules && bun install`
4. Check git is available: `git --version`

---

### Issue: TypeScript Errors

**Solution**:
1. Run type checker: `bunx tsc --noEmit`
2. Check `tsconfig.json` is valid
3. Ensure all `@types/*` packages installed

---

### Issue: Git Operations Failing

**Solution**:
1. Check git version: `git --version` (need 2.5+)
2. Ensure testing in a git repository: `git rev-parse --git-dir`
3. Check file permissions (hooks need +x)

---

## Next Steps

### Contributing

Ready to contribute? Read the contributing guide:

```bash
cat CONTRIBUTING.md
```

**Or online**: [CONTRIBUTING.md](https://github.com/your-org/arashi-arashi/blob/main/CONTRIBUTING.md)

**Key points**:
- Fork the repository
- Create feature branch
- Write tests for your changes
- Follow code style (Prettier + ESLint)
- Submit pull request

---

### Learning Resources

**Design Documents**:
- `specs/001-git-worktree-manager/data-model.md`: Configuration and types
- `specs/001-git-worktree-manager/contracts/cli-commands.md`: CLI command specifications
- `specs/001-git-worktree-manager/contracts/git-api.md`: Git wrapper API
- `specs/001-git-worktree-manager/contracts/worktree-orchestration.md`: Orchestration logic
- `specs/001-git-worktree-manager/contracts/hook-system.md`: Hook system design

**External Resources**:
- [Bun Documentation](https://bun.sh/docs)
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

### Community

**Get Help**:
- GitHub Discussions: Ask questions, share ideas
- GitHub Issues: Report bugs, request features
- Pull Requests: Review code, provide feedback

**Stay Updated**:
- Watch the repository for updates
- Subscribe to release notifications
- Follow the project roadmap

---

## Quick Reference

### Essential Commands

```bash
# Setup
bun install                      # Install dependencies
bun test                         # Run tests
bun run typecheck                # Check TypeScript

# Development
bun run dev <command>            # Run CLI in dev mode
bun test --watch                 # Run tests in watch mode

# Building
bun run build                    # Build for current platform
bun run build:all                # Build for all platforms

# Code Quality
bun run format                   # Format code
bun run lint                     # Lint code
```

---

### File Structure

```
repos/arashi/
├── src/
│   ├── cli/              # CLI command implementations
│   ├── git/              # Git wrapper API
│   ├── config/           # Configuration loading
│   ├── orchestration/    # Worktree orchestration
│   ├── hooks/            # Hook system
│   └── index.ts          # Entry point
├── test/                 # Test suite
├── dist/                 # Build output
└── package.json          # Scripts and dependencies
```

---

### Package Scripts

```json
{
  "scripts": {
    "dev": "bun run src/index.ts",           // Run CLI in dev
    "build": "bun build src/index.ts --compile --outfile dist/arashi",
    "build:all": "./scripts/build-all.sh",   // Cross-platform builds
    "test": "bun test",                      // Run tests
    "test:watch": "bun test --watch",        // Watch mode
    "typecheck": "bunx tsc --noEmit",        // Type checking
    "format": "bunx prettier --write src/",  // Format code
    "lint": "bunx eslint src/",              // Lint code
  }
}
```

---

## Appendix: Meta-Repository Pattern

### Why Meta + Sub-Repo?

Arashi uses itself to manage its own development:

1. **Meta-repo** (arashi-arashi):
   - Contains specifications and design docs
   - Manages multiple sub-repositories
   - Uses Arashi to create feature worktrees

2. **Sub-repo** (repos/arashi):
   - Contains actual implementation code
   - Managed by Arashi from meta-repo

**Workflow Example**:
```bash
# In meta-repo (arashi-arashi/)
arashi create feature-auth

# Creates:
# ../feature-auth/
#   repos/arashi/   (worktree of arashi sub-repo)

# Develop in feature worktree
cd ../feature-auth/repos/arashi
# Make changes, test, commit

# Back to main
cd ../../arashi-arashi/repos/arashi
git merge feature-auth
```

**Benefits**:
- Dogfooding: We use Arashi to develop Arashi
- Real-world testing: Catches issues early
- Clear separation: Specs vs implementation

---

## Getting Help

**Questions?**
- Check design documents in `specs/`
- Search GitHub Issues
- Ask in GitHub Discussions

**Found a Bug?**
- Create a GitHub Issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Environment (OS, Bun version, git version)

**Want to Contribute?**
- Read `CONTRIBUTING.md`
- Check open issues labeled "good first issue"
- Join community discussions

---

## Conclusion

You're now ready to contribute to Arashi! 🎉

**Remember**:
1. Read design docs before coding
2. Write tests for your changes
3. Follow code style guidelines
4. Ask questions if stuck

**Happy coding!**
