# Arashi CLI: Developer Quickstart Guide

**For**: Developers implementing or extending Arashi  
**Created**: 2026-02-03  
**Status**: Active

## Overview

This guide helps developers quickly set up their development environment and start working on Arashi CLI. For detailed specifications and contracts, see the other documents in this directory.

## Prerequisites

- **Git**: 2.22.0 or later (required for `git worktree remove` command)
- **Bun**: Latest stable version (for runtime, testing, and compilation)
- **Editor**: VS Code (recommended) or any TypeScript-capable editor

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the main specifications repository
git clone https://github.com/yourusername/arashi-arashi.git
cd arashi-arashi

# The actual implementation lives in a sub-repository
cd repos/arashi
```

### 2. Install Dependencies

```bash
# Install all dependencies using Bun
bun install
```

### 3. Verify Setup

```bash
# Run tests to ensure everything works
bun test

# Check TypeScript compilation
bun run build

# Try the development CLI
bun run dev --version
```

## Project Structure

```
repos/arashi/                    # Implementation repository
├── src/
│   ├── lib/                     # Utility libraries
│   │   ├── git.ts              # Git command wrappers
│   │   ├── config.ts           # Configuration management
│   │   ├── filesystem.ts       # File system operations
│   │   ├── logger.ts           # Console output (chalk, ora)
│   │   ├── prompts.ts          # User interaction (inquirer)
│   │   └── hooks.ts            # Hook system execution
│   ├── core/                    # Core orchestration logic
│   │   ├── worktree.ts         # Worktree coordination
│   │   ├── rollback.ts         # Rollback mechanism
│   │   └── repository.ts       # Repository management
│   ├── commands/                # CLI commands
│   │   ├── init.ts             # arashi init
│   │   ├── add.ts              # arashi add
│   │   ├── create.ts           # arashi create
│   │   ├── status.ts           # arashi status
│   │   ├── list.ts             # arashi list
│   │   ├── remove.ts           # arashi remove
│   │   └── setup.ts            # arashi setup
│   ├── types.ts                 # TypeScript type definitions
│   └── index.ts                 # CLI entry point
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
├── package.json
├── tsconfig.json
├── bun.lockb
└── README.md
```

## Development Workflow

### Running the Development CLI

```bash
# Run CLI in development mode (no compilation)
bun run dev <command> [args]

# Examples:
bun run dev init
bun run dev create feature-branch
bun run dev status
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/unit/git.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage

# Run tests in parallel (faster)
bun test --concurrent
```

### Type Checking

```bash
# Check TypeScript types
bun run typecheck

# Watch mode for continuous type checking
bun run typecheck --watch
```

### Linting

```bash
# Run linter
bun run lint

# Fix auto-fixable issues
bun run lint --fix
```

### Building

```bash
# Build all platform binaries
bun run build:all

# Build for specific platform
bun run build:mac     # macOS ARM64
bun run build:linux   # Linux x64
bun run build:windows # Windows x64

# Output directory: dist/
# Binaries: arashi-darwin-arm64, arashi-linux-x64, arashi-windows-x64.exe
```

### Testing Built Binaries

```bash
# After building, test the binary
./dist/arashi-darwin-arm64 --version

# Run a full workflow test
./dist/arashi-darwin-arm64 init
```

## Key Development Patterns

### 1. Adding a New Command

See [contracts/cli-commands.md](./contracts/cli-commands.md) for detailed command contracts.

```typescript
// src/commands/mycommand.ts
import { Command } from 'commander';
import { loadConfig } from '../lib/config';
import { logger } from '../lib/logger';

export function registerMyCommand(program: Command): void {
  program
    .command('mycommand')
    .description('Description of my command')
    .argument('<required>', 'Required argument')
    .option('-f, --force', 'Force operation')
    .action(async (required, options) => {
      try {
        const config = await loadConfig();
        logger.info(`Running mycommand with ${required}`);
        // Implementation here
        logger.success('Command completed!');
      } catch (error) {
        logger.error(error.message);
        process.exit(1);
      }
    });
}

// src/index.ts
import { registerMyCommand } from './commands/mycommand';
registerMyCommand(program);
```

### 2. Implementing Git Operations

See [contracts/git-api.md](./contracts/git-api.md) for git wrapper contracts.

```typescript
// src/lib/git.ts
import { $ } from 'bun';

export async function createWorktree(
  repoPath: string,
  branch: string,
  location: string
): Promise<void> {
  const result = await $`git worktree add ${location} ${branch}`
    .cwd(repoPath)
    .nothrow();
  
  if (result.exitCode !== 0) {
    throw new GitCommandError(
      `Failed to create worktree: ${result.stderr}`,
      ['worktree', 'add', location, branch],
      result.stdout.toString(),
      result.stderr.toString(),
      result.exitCode
    );
  }
}
```

### 3. Configuration Management

See [contracts/config-schema.md](./contracts/config-schema.md) for schema details.

```typescript
// src/lib/config.ts
import { z } from 'zod';
import { readFileSync } from 'fs';

const ConfigSchema = z.object({
  version: z.string(),
  repos_dir: z.string(),
  worktree_strategy: z.enum(['same_branch', 'custom']),
  auto_setup: z.boolean(),
  discovered_repos: z.record(z.object({
    path: z.string(),
    default_branch: z.string(),
    remote: z.string(),
    has_setup_script: z.boolean(),
    git_url: z.string(),
  })),
});

export async function loadConfig(): Promise<ArashiConfig> {
  const configPath = '.arashi/config.json';
  const content = readFileSync(configPath, 'utf-8');
  const data = JSON.parse(content);
  return ConfigSchema.parse(data);
}
```

### 4. Error Handling with Rollback

See [contracts/error-handling.md](./contracts/error-handling.md) for patterns.

```typescript
// src/core/rollback.ts
class TransactionManager {
  private operations: OperationLogEntry[] = [];

  async executeWithRollback(
    description: string,
    operation: () => Promise<void>,
    rollback: () => Promise<void>
  ): Promise<void> {
    await operation();
    this.operations.push({
      type: 'custom',
      data: {},
      rollback_fn: rollback,
      description,
      timestamp: new Date(),
    });
  }

  async rollback(): Promise<void> {
    for (let i = this.operations.length - 1; i >= 0; i--) {
      await this.operations[i].rollback_fn();
    }
  }
}
```

### 5. User Interaction

See [research.md](./research.md) Section 1.2 for inquirer patterns.

```typescript
// src/lib/prompts.ts
import { select, confirm } from '@inquirer/prompts';

export async function selectRepository(repos: string[]): Promise<string> {
  return await select({
    message: 'Select a repository',
    choices: repos.map(name => ({ name, value: name })),
  });
}

export async function confirmRemoval(branch: string): Promise<boolean> {
  return await confirm({
    message: `Are you sure you want to remove worktree for "${branch}"?`,
    default: false,
  });
}
```

### 6. Writing Tests

See [contracts/test-patterns.md](./contracts/test-patterns.md) for testing conventions.

```typescript
// tests/unit/git.test.ts
import { test, expect } from 'bun:test';
import { tempDir } from 'harness';
import { createWorktree } from '../../src/lib/git';
import { $ } from 'bun';

test('createWorktree creates worktree successfully', async () => {
  using dir = tempDir('arashi-test', {
    'README.md': '# Test',
  });

  const repoPath = String(dir);
  
  // Initialize git repo
  await $`git init`.cwd(repoPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(repoPath).quiet();
  await $`git config user.name "Test"`.cwd(repoPath).quiet();
  await $`git add .`.cwd(repoPath).quiet();
  await $`git commit -m "Initial"`.cwd(repoPath).quiet();

  // Test worktree creation
  const worktreePath = `${repoPath}-worktree`;
  await createWorktree(repoPath, 'main', worktreePath);

  // Verify worktree was created
  const result = await $`git worktree list`.cwd(repoPath).text();
  expect(result).toContain(worktreePath);
});
```

## Debugging

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Arashi",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["run", "dev"],
      "args": ["create", "test-branch"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["test"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### Using Console Debugging

```typescript
import { logger } from './lib/logger';

// Use logger for debug output (respects --verbose flag)
logger.info('Debug info message');
logger.warn('Warning message');
logger.error('Error message');

// For temporary debugging
console.debug('Temporary debug output');
```

### Git Command Debugging

```typescript
// Enable verbose git output
const result = await $`git worktree add ${path} ${branch}`.cwd(repoPath);
console.log('stdout:', result.stdout);
console.log('stderr:', result.stderr);
console.log('exitCode:', result.exitCode);
```

## Common Tasks

### Testing a Full Workflow

```bash
# Create a test repository
mkdir test-main && cd test-main
git init
bun run dev init

# Add a sub-repository
git clone https://github.com/example/frontend.git repos/frontend
bun run dev add repos/frontend

# Create worktrees
bun run dev create feature-test

# Check status
bun run dev status

# Clean up
bun run dev remove feature-test
```

### Running Performance Benchmarks

```bash
# Run performance tests
bun test tests/performance/

# Profile specific operations
bun test tests/performance/worktree-creation.test.ts --verbose
```

### Updating Dependencies

```bash
# Update all dependencies
bun update

# Update specific dependency
bun update commander

# Check for outdated packages
bun outdated
```

## Troubleshooting

### Issue: Tests fail with git errors

**Solution**: Ensure git config is set for tests:
```bash
git config --global user.email "test@example.com"
git config --global user.name "Test User"
```

### Issue: Binary is too large (>50MB)

**Solution**: Check for unnecessary dependencies or use tree-shaking:
```bash
bun build src/index.ts --target=bun --minify --sourcemap
```

### Issue: Tests interfere with each other

**Solution**: Ensure each test uses isolated temp directories:
```typescript
test('isolated test', () => {
  using dir = tempDir('unique-prefix'); // Auto-cleanup
  // Test code here
});
```

## Resources

- **Specifications**: See `specs/003-research-tasks/spec.md`
- **Implementation Plan**: See `specs/003-research-tasks/plan.md`
- **Research**: See `specs/003-research-tasks/research.md`
- **Data Model**: See `specs/003-research-tasks/data-model.md`
- **API Contracts**: See `specs/003-research-tasks/contracts/`

- **Bun Documentation**: https://bun.sh/docs
- **Commander.js**: https://github.com/tj/commander.js
- **Inquirer Prompts**: https://github.com/SBoudrias/Inquirer.js
- **Git Worktree**: https://git-scm.com/docs/git-worktree

## Next Steps

1. Review the [specification](./spec.md) to understand requirements
2. Read [research.md](./research.md) for technical patterns
3. Check [data-model.md](./data-model.md) for entity definitions
4. Browse [contracts/](./contracts/) for API contracts
5. Start implementing! Follow the task breakdown in [tasks.md](./tasks.md)

## Getting Help

- **Issues**: Report bugs and request features on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Contributing**: See CONTRIBUTING.md in the main repository

---

**Last Updated**: 2026-02-03  
**Document Version**: 1.0
