# Quickstart Guide: List Command

**Feature**: 001-list-command  
**Audience**: Developers implementing the list command  
**Date**: 2026-02-06

## Overview

This guide provides step-by-step instructions for implementing the list command. Follow these phases to build a complete, tested implementation that meets all requirements.

---

## Phase 1: Setup and Scaffolding (Est. 30 minutes)

### 1.1 Create Command File

Create the main command file at `repos/arashi/src/commands/list.ts`:

```typescript
import { Command } from 'commander';
import { listCommand } from '../core/list';

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List all worktrees and their status')
    .option('-v, --verbose', 'Show detailed sub-repository information')
    .option('-j, --json', 'Output in JSON format')
    .option('--max-depth <depth>', 'Maximum depth for sub-repo discovery', '3')
    .action(async (options) => {
      await listCommand({
        verbose: options.verbose,
        json: options.json,
        maxDepth: parseInt(options.maxDepth, 10)
      });
    });
}
```

### 1.2 Create Core Implementation File

Create `repos/arashi/src/core/list.ts` with basic structure:

```typescript
import { ListCommandOptions, ListCommandOutput, WorktreeListItem } from '../types/list';

export async function listCommand(options?: ListCommandOptions): Promise<void> {
  // Implementation will go here
  console.log('List command called with options:', options);
}
```

### 1.3 Create Type Definitions

Create `repos/arashi/src/types/list.ts` with types from `/specs/001-list-command/contracts/list-api.ts`.

Copy all interface definitions:
- `SubRepositoryInfo`
- `WorktreeListItem`
- `ListCommandOptions`
- `ListCommandOutput`
- Error classes

### 1.4 Register Command in CLI

Update `repos/arashi/src/index.ts` to register the list command:

```typescript
import { registerListCommand } from './commands/list';

// ... existing code ...

registerListCommand(program);
```

**Checkpoint**: Run `bun run build` to verify compilation succeeds.

---

## Phase 2: Core Data Gathering (Est. 1-2 hours)

### 2.1 Implement gatherWorktreeData()

Location: `repos/arashi/src/core/list.ts`

```typescript
import { listWorktrees, getStatus, getCurrentBranch } from '../lib/git';
import { isGitRepository } from '../lib/git';

export async function gatherWorktreeData(repoPath: string): Promise<WorktreeListItem[]> {
  // 1. Call listWorktrees() to get all worktrees
  const worktrees = await listWorktrees(repoPath);
  
  // 2. For each worktree, gather additional data
  const items: WorktreeListItem[] = [];
  
  for (const wt of worktrees) {
    // Get status to determine hasChanges
    const status = await getStatus(wt.path);
    const hasChanges = status.length > 0;
    
    // Get short commit SHA (first 7 chars)
    const commit = wt.commit.substring(0, 7);
    
    // Determine if this is the main worktree
    const isMain = wt.path === repoPath;
    
    items.push({
      path: wt.path,
      branch: wt.branch,
      commit,
      locked: wt.locked,
      lockReason: wt.lockReason,
      hasChanges,
      isMain
    });
  }
  
  return items;
}
```

**Test**: Create a test at `repos/arashi/tests/unit/list.test.ts`:

```typescript
import { describe, test, expect } from 'bun:test';
import { gatherWorktreeData } from '../../src/core/list';

describe('gatherWorktreeData', () => {
  test('returns at least one worktree (main repo)', async () => {
    const worktrees = await gatherWorktreeData(process.cwd());
    expect(worktrees.length).toBeGreaterThanOrEqual(1);
    expect(worktrees.some(wt => wt.isMain)).toBe(true);
  });
});
```

Run: `bun test tests/unit/list.test.ts`

---

## Phase 3: Sub-Repository Discovery (Est. 1-2 hours)

### 3.1 Implement findGitRepositories()

Location: `repos/arashi/src/core/list.ts`

```typescript
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function findGitRepositories(
  rootPath: string,
  maxDepth: number,
  excludeRoot: boolean = false
): Promise<string[]> {
  const gitRepos: string[] = [];
  
  async function scan(currentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    
    try {
      const entries = await readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const fullPath = join(currentPath, entry.name);
        
        // Check if this directory is a git repository
        if (entry.name === '.git') {
          const repoPath = currentPath;
          
          // Exclude root if requested
          if (excludeRoot && repoPath === rootPath) {
            continue;
          }
          
          if (isGitRepository(repoPath)) {
            gitRepos.push(repoPath);
          }
          
          continue; // Don't traverse into .git directories
        }
        
        // Recursively scan subdirectories
        await scan(fullPath, depth + 1);
      }
    } catch (error) {
      // Silently skip directories we can't read (permissions, etc.)
      return;
    }
  }
  
  await scan(rootPath, 0);
  return gitRepos;
}
```

### 3.2 Implement discoverSubRepositories()

Location: `repos/arashi/src/core/list.ts`

```typescript
import { relative } from 'path';
import { getShortCommitSha, hasUncommittedChanges } from '../lib/git';

export async function discoverSubRepositories(
  worktreePath: string,
  maxDepth: number = 3
): Promise<SubRepositoryInfo[]> {
  // Find all git repositories within worktree
  const repoPaths = await findGitRepositories(worktreePath, maxDepth, true);
  
  const subRepos: SubRepositoryInfo[] = [];
  
  for (const repoPath of repoPaths) {
    const branch = await getCurrentBranch(repoPath);
    const commit = await getShortCommitSha(repoPath);
    const hasChanges = await hasUncommittedChanges(repoPath);
    const relativePath = relative(worktreePath, repoPath);
    
    subRepos.push({
      relativePath,
      branch: branch === 'HEAD' ? null : branch,
      commit,
      hasChanges
    });
  }
  
  return subRepos;
}
```

**Test**: Add to `repos/arashi/tests/unit/list.test.ts`:

```typescript
test('discoverSubRepositories finds nested repos', async () => {
  // This test requires a worktree with nested repos
  // Setup test fixture or skip if not available
  const subRepos = await discoverSubRepositories(process.cwd(), 2);
  expect(Array.isArray(subRepos)).toBe(true);
});
```

---

## Phase 4: Output Formatting (Est. 1-2 hours)

### 4.1 Implement formatAsTable()

Location: `repos/arashi/src/core/list.ts`

```typescript
import chalk from 'chalk';

export function formatAsTable(output: ListCommandOutput, verbose: boolean): string {
  const lines: string[] = [];
  
  // Header
  lines.push(chalk.bold(`Worktrees (${output.totalCount} total)`));
  lines.push('');
  
  if (output.worktrees.length === 1 && output.worktrees[0].isMain) {
    // No additional worktrees
    lines.push('No additional worktrees found.');
    lines.push('');
    lines.push(`The main repository is at: ${chalk.cyan(output.repositoryPath)}`);
    lines.push('');
    lines.push('To create a worktree, run:');
    lines.push('  arashi create <branch-name>');
    return lines.join('\n');
  }
  
  if (verbose) {
    // Verbose format with sub-repositories
    for (const wt of output.worktrees) {
      lines.push(`PATH: ${chalk.cyan(wt.path)}`);
      lines.push(`BRANCH: ${chalk.yellow(wt.branch || 'detached')}`);
      lines.push(`STATUS: ${formatStatus(wt)}`);
      lines.push(`TYPE: ${wt.isMain ? 'Main worktree' : 'Linked worktree'}`);
      
      if (wt.subRepositories && wt.subRepositories.length > 0) {
        lines.push('SUB-REPOSITORIES:');
        wt.subRepositories.forEach((sub, idx) => {
          const isLast = idx === wt.subRepositories!.length - 1;
          const prefix = isLast ? '└──' : '├──';
          const status = sub.hasChanges ? chalk.red('✗ modified') : chalk.green('✓ clean');
          lines.push(`  ${prefix} ${sub.relativePath} (${sub.branch || 'detached'}) - ${status}`);
        });
      }
      
      lines.push('');
    }
  } else {
    // Table format
    const header = `${chalk.bold('PATH').padEnd(40)} ${chalk.bold('BRANCH').padEnd(20)} ${chalk.bold('STATUS')}`;
    const separator = '─'.repeat(68);
    
    lines.push(header);
    lines.push(separator);
    
    for (const wt of output.worktrees) {
      const path = chalk.cyan(wt.path.padEnd(40));
      const branch = chalk.yellow((wt.branch || 'detached').padEnd(20));
      const status = formatStatus(wt);
      lines.push(`${path} ${branch} ${status}`);
    }
    
    lines.push('');
    lines.push('Legend: ✓ = clean, ✗ = modified, 🔒 = locked');
  }
  
  return lines.join('\n');
}

function formatStatus(wt: WorktreeListItem): string {
  if (wt.locked) {
    return chalk.gray('🔒 locked');
  }
  if (wt.hasChanges) {
    return chalk.red('✗ modified');
  }
  return chalk.green('✓ clean');
}
```

### 4.2 Implement formatAsJson()

Location: `repos/arashi/src/core/list.ts`

```typescript
export function formatAsJson(output: ListCommandOutput): string {
  return JSON.stringify(output.worktrees, null, 2);
}
```

**Test**: Add to `repos/arashi/tests/unit/list.test.ts`:

```typescript
test('formatAsJson returns valid JSON', () => {
  const output: ListCommandOutput = {
    worktrees: [
      {
        path: '/test/path',
        branch: 'main',
        commit: 'a1b2c3d',
        locked: false,
        hasChanges: false,
        isMain: true
      }
    ],
    totalCount: 1,
    repositoryPath: '/test/path'
  };
  
  const json = formatAsJson(output);
  const parsed = JSON.parse(json);
  expect(Array.isArray(parsed)).toBe(true);
  expect(parsed.length).toBe(1);
});
```

---

## Phase 5: Orchestration and Error Handling (Est. 1 hour)

### 5.1 Implement buildListOutput()

Location: `repos/arashi/src/core/list.ts`

```typescript
export async function buildListOutput(
  repoPath: string,
  options: ListCommandOptions
): Promise<ListCommandOutput> {
  // Gather worktree data
  const worktrees = await gatherWorktreeData(repoPath);
  
  // If verbose, discover sub-repositories
  if (options.verbose) {
    for (const wt of worktrees) {
      wt.subRepositories = await discoverSubRepositories(
        wt.path,
        options.maxDepth || 3
      );
    }
  }
  
  return {
    worktrees,
    totalCount: worktrees.length,
    repositoryPath: repoPath
  };
}
```

### 5.2 Implement Main Command Logic

Update `listCommand()` in `repos/arashi/src/core/list.ts`:

```typescript
import { loadConfig } from '../lib/config';
import { isGitRepository } from '../lib/git';
import { NotInRepositoryError, ConfigurationMissingError } from '../types/list';
import { log, spinner } from '../lib/logger';

export async function listCommand(options?: ListCommandOptions): Promise<void> {
  const opts: ListCommandOptions = {
    verbose: options?.verbose || false,
    json: options?.json || false,
    maxDepth: options?.maxDepth || 3
  };
  
  // Validate we're in a repository
  const cwd = process.cwd();
  if (!isGitRepository(cwd)) {
    throw new NotInRepositoryError(cwd);
  }
  
  // Load configuration (optional check - list can work without config)
  try {
    await loadConfig(cwd);
  } catch (error) {
    // Config not required for list command
    // Just warn the user
    log.warn('Arashi configuration not found. Some features may be limited.');
  }
  
  // Show progress for verbose mode (may be slow)
  const s = opts.verbose ? spinner('Discovering worktrees and sub-repositories...') : null;
  s?.start();
  
  try {
    // Build output
    const output = await buildListOutput(cwd, opts);
    
    s?.succeed('Discovery complete');
    
    // Format and display
    if (opts.json) {
      console.log(formatAsJson(output));
    } else {
      console.log(formatAsTable(output, opts.verbose || false));
    }
  } catch (error) {
    s?.fail('Failed to list worktrees');
    throw error;
  }
}
```

---

## Phase 6: Integration Testing (Est. 1-2 hours)

### 6.1 Create Integration Test

Create `repos/arashi/tests/integration/list.test.ts`:

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';
import { createWorktree } from '../../src/lib/git';
import { listCommand } from '../../src/core/list';

describe('list command integration', () => {
  const testRepoPath = join(process.cwd(), 'test-fixtures', 'list-test-repo');
  const worktreePath = join(testRepoPath, '..', 'test-worktree');
  
  beforeAll(async () => {
    // Setup: create a test worktree
    await mkdir(testRepoPath, { recursive: true });
    // ... additional setup ...
  });
  
  afterAll(async () => {
    // Cleanup
    await rm(testRepoPath, { recursive: true, force: true });
    await rm(worktreePath, { recursive: true, force: true });
  });
  
  test('lists worktrees in default format', async () => {
    // Run command and capture output
    await expect(async () => {
      await listCommand({ verbose: false, json: false });
    }).not.toThrow();
  });
  
  test('outputs valid JSON with --json flag', async () => {
    // Capture stdout
    // Parse as JSON
    // Validate structure
  });
  
  test('discovers sub-repositories with --verbose flag', async () => {
    // Test with nested repos
    // Verify sub-repositories are found
  });
});
```

### 6.2 Run Full Test Suite

```bash
cd repos/arashi
bun test
```

**Success Criteria**:
- All unit tests pass
- All integration tests pass
- Test coverage >80%

---

## Phase 7: Manual Testing (Est. 30 minutes)

### 7.1 Test Basic Scenarios

```bash
# Build the project
cd repos/arashi
bun run build

# Test basic list
bun run src/index.ts list

# Test JSON output
bun run src/index.ts list --json

# Test verbose mode
bun run src/index.ts list --verbose

# Test combined flags
bun run src/index.ts list --verbose --json

# Test max-depth option
bun run src/index.ts list --verbose --max-depth 5
```

### 7.2 Test Integration with Tools

```bash
# Test fzf integration
bun run src/index.ts list --json | jq -r '.[].path' | fzf

# Test jq filtering
bun run src/index.ts list --json | jq '.[] | select(.hasChanges == true)'

# Test worktree count
bun run src/index.ts list --json | jq 'length'
```

### 7.3 Test Edge Cases

```bash
# Test with no additional worktrees (only main repo)
# Expected: Clear message + suggestion to create worktree

# Test with locked worktree
# Create a locked worktree first
# Expected: Locked status shown with lock icon

# Test from non-repository directory
cd /tmp
bun run ~/path/to/arashi/src/index.ts list
# Expected: NotInRepositoryError with clear message
```

---

## Phase 8: Documentation and Polish (Est. 30 minutes)

### 8.1 Add Help Text

Ensure the command registration includes proper help text:

```typescript
.description('List all worktrees and their status')
.addHelpText('after', `
Examples:
  $ arashi list                    # List worktrees in table format
  $ arashi list --json             # Output as JSON
  $ arashi list --verbose          # Show sub-repositories
  $ arashi list --json | jq -r '.[].path' | fzf  # Interactive selection
`)
```

### 8.2 Update Main README (if applicable)

Add list command to the main arashi documentation.

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Not a git repository" error | Ensure you're running from repository root |
| Slow performance with many worktrees | Check if parallel operations are enabled in gatherWorktreeData() |
| Sub-repositories not discovered | Increase --max-depth or check filesystem permissions |
| JSON output invalid | Verify validateListCommandOutput() passes |
| Colors not showing | Check terminal supports ANSI colors; chalk handles this automatically |

---

## Verification Checklist

Before considering implementation complete, verify:

- [ ] `bun run build` succeeds with no errors
- [ ] `bun run lint` passes
- [ ] `bun test` passes with >80% coverage
- [ ] Manual testing of all user scenarios from spec.md completed
- [ ] Edge cases handled gracefully (no repos, locked worktrees, etc.)
- [ ] JSON output validates against schema
- [ ] fzf integration works as expected
- [ ] Help text is clear and accurate
- [ ] Error messages are helpful and actionable

---

## Performance Targets

Verify the following performance requirements are met:

- [ ] List operation completes in < 2 seconds for 50 worktrees
- [ ] Verbose mode completes in < 5 seconds for worktrees with 20 sub-repos
- [ ] Parallel git operations are used where safe
- [ ] Progress indicators shown for operations > 1 second

---

## Next Steps

After completing implementation:

1. Run the full test suite: `bun test`
2. Run linting: `bun run lint`
3. Build the project: `bun run build`
4. Create a pull request with reference to spec: `specs/001-list-command/spec.md`
5. Request code review from maintainers

---

**Status**: Ready for implementation. Follow phases sequentially for best results.
