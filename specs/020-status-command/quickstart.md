# Quickstart: Status Command Implementation

**Feature**: 020-status-command  
**Date**: 2026-02-07  
**Purpose**: Get developers started implementing the status command quickly

## Overview

The status command shows git status for all managed repositories in an arashi workspace. It's a read-only operation that leverages existing config, git, and logger utilities.

**Estimated Implementation Time**: 4-6 hours

## Prerequisites

- Arashi development environment set up
- Familiarity with existing command structure (`add.ts`, `list.ts`)
- Understanding of git status porcelain format

## Quick Start (5 Minutes)

### 1. Create Command File

```bash
cd repos/arashi
touch src/commands/status.ts
```

### 2. Basic Command Structure

```typescript
// src/commands/status.ts
import { loadConfig } from '../lib/config.js';
import { logger } from '../lib/logger.js';

export interface StatusOptions {
  verbose?: boolean;
  short?: boolean;
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  // TODO: Implement
  logger.info('Status command - Coming soon!');
}
```

### 3. Register Command

```typescript
// src/index.ts
import { statusCommand } from './commands/status.js';

// Add to program
program
  .command('status')
  .description('Show status of all managed repositories')
  .option('-v, --verbose', 'Show full git status output')
  .option('-s, --short', 'Show one-line summary per repository')
  .action(statusCommand);
```

### 4. Test Scaffolding

```bash
bun run dev status
# Should print: "Status command - Coming soon!"
```

**Checkpoint**: Basic command registered and callable ✓

---

## Implementation Steps

### Step 1: Add Git Status Utility (30 minutes)

**File**: `src/lib/git.ts`

Add function to execute git status and return output:

```typescript
export interface GitStatusResult {
  output: string;
  error: string | null;
}

export async function getGitStatus(repoPath: string): Promise<GitStatusResult> {
  try {
    const result = await Bun.spawn(
      ['git', 'status', '--porcelain=v1', '--branch'],
      {
        cwd: repoPath,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    );
    
    const output = await new Response(result.stdout).text();
    const error = await new Response(result.stderr).text();
    
    return {
      output: output.trim(),
      error: error || null,
    };
  } catch (err) {
    return {
      output: '',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
```

**Test manually**:
```bash
bun run dev
# In Bun REPL:
import { getGitStatus } from './src/lib/git.ts';
await getGitStatus('.');
```

---

### Step 2: Parse Git Status Output (45 minutes)

**File**: `src/commands/status.ts`

Add parsing logic for porcelain output:

```typescript
interface GitFileStatus {
  path: string;
  stagingStatus: string;
  workingStatus: string;
}

interface BranchTrackingInfo {
  localBranch: string;
  remoteBranch: string | null;
  ahead: number;
  behind: number;
  isDetached: boolean;
}

function parseGitStatus(output: string): {
  files: GitFileStatus[];
  branch: BranchTrackingInfo;
} {
  const lines = output.split('\n').filter(line => line.length > 0);
  const files: GitFileStatus[] = [];
  let branch: BranchTrackingInfo = {
    localBranch: 'unknown',
    remoteBranch: null,
    ahead: 0,
    behind: 0,
    isDetached: false,
  };

  for (const line of lines) {
    // Parse branch line (starts with ##)
    if (line.startsWith('##')) {
      branch = parseBranchLine(line);
      continue;
    }

    // Parse file status (2 characters + space + path)
    const stagingStatus = line[0];
    const workingStatus = line[1];
    const path = line.substring(3);

    files.push({
      path,
      stagingStatus,
      workingStatus,
    });
  }

  return { files, branch };
}

function parseBranchLine(line: string): BranchTrackingInfo {
  // Remove "## "
  const branchInfo = line.substring(3);
  
  // Handle detached HEAD: "## HEAD (no branch)"
  if (branchInfo.includes('no branch') || branchInfo.startsWith('HEAD (detached')) {
    return {
      localBranch: '',
      remoteBranch: null,
      ahead: 0,
      behind: 0,
      isDetached: true,
    };
  }

  // Format: "main...origin/main [ahead 2, behind 1]"
  const parts = branchInfo.split('...');
  const localBranch = parts[0];
  let remoteBranch: string | null = null;
  let ahead = 0;
  let behind = 0;

  if (parts.length > 1) {
    const remotePart = parts[1];
    const trackingMatch = remotePart.match(/^([^\s[]+)/);
    if (trackingMatch) {
      remoteBranch = trackingMatch[1];
    }

    const aheadMatch = remotePart.match(/ahead (\d+)/);
    if (aheadMatch) {
      ahead = parseInt(aheadMatch[1], 10);
    }

    const behindMatch = remotePart.match(/behind (\d+)/);
    if (behindMatch) {
      behind = parseInt(behindMatch[1], 10);
    }
  }

  return {
    localBranch,
    remoteBranch,
    ahead,
    behind,
    isDetached: false,
  };
}
```

**Test with sample input**:
```typescript
const sampleOutput = `## main...origin/main [ahead 2]
 M src/file1.ts
A  src/file2.ts
?? test.txt`;

const result = parseGitStatus(sampleOutput);
console.log(result);
// Should show: 2 commits ahead, 3 files
```

---

### Step 3: Check All Repositories (30 minutes)

**File**: `src/commands/status.ts`

Add logic to check all repos in parallel:

```typescript
interface RepoStatus {
  name: string;
  path: string;
  branch: BranchTrackingInfo;
  files: GitFileStatus[];
  error: string | null;
}

async function checkAllRepos(config: ArashiConfig): Promise<RepoStatus[]> {
  const reposToCheck = [
    { name: 'Main Repository', path: config.workspaceRoot },
    ...config.repos.map(r => ({ name: r.name, path: r.path })),
  ];

  const statusPromises = reposToCheck.map(async (repo) => {
    try {
      const result = await getGitStatus(repo.path);
      
      if (result.error) {
        return {
          name: repo.name,
          path: repo.path,
          branch: { localBranch: '', remoteBranch: null, ahead: 0, behind: 0, isDetached: false },
          files: [],
          error: result.error,
        };
      }

      const parsed = parseGitStatus(result.output);
      return {
        name: repo.name,
        path: repo.path,
        branch: parsed.branch,
        files: parsed.files,
        error: null,
      };
    } catch (err) {
      return {
        name: repo.name,
        path: repo.path,
        branch: { localBranch: '', remoteBranch: null, ahead: 0, behind: 0, isDetached: false },
        files: [],
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  });

  return Promise.all(statusPromises);
}
```

---

### Step 4: Format Output (60 minutes)

**File**: `src/commands/status.ts`

Add output formatting for all three modes:

```typescript
import chalk from 'chalk';

function formatDefaultOutput(statuses: RepoStatus[]): string {
  let output = '';

  for (const status of statuses) {
    output += formatRepoSection(status);
  }

  output += formatSummary(statuses);
  return output;
}

function formatRepoSection(status: RepoStatus): string {
  let section = `\n${chalk.bold(status.name)} (${status.path})\n`;

  // Branch info
  if (status.branch.isDetached) {
    section += `  Branch: ${chalk.cyan('(detached HEAD)')}\n`;
  } else {
    section += `  Branch: ${chalk.cyan(status.branch.localBranch)}`;
    if (status.branch.remoteBranch) {
      section += ` → ${status.branch.remoteBranch}`;
      if (status.branch.ahead > 0) {
        section += ` [↑${status.branch.ahead}]`;
      }
      if (status.branch.behind > 0) {
        section += ` [↓${status.branch.behind}]`;
      }
    }
    section += '\n';
  }

  // Status
  if (status.error) {
    section += `  Status: ${chalk.red('✗ Error')}\n`;
    section += `  ${chalk.red(status.error)}\n`;
  } else if (status.files.length === 0) {
    section += `  Status: ${chalk.green('✓ Clean')}\n`;
  } else {
    const stagedCount = status.files.filter(f => f.stagingStatus !== ' ').length;
    const untrackedCount = status.files.filter(f => f.workingStatus === '?').length;
    const modifiedCount = status.files.filter(f => 
      f.workingStatus === 'M' && f.stagingStatus === ' '
    ).length;

    section += `  Status: ${chalk.yellow('● Dirty')} (${status.files.length} changes)\n`;
    
    const parts = [];
    if (stagedCount > 0) parts.push(`${stagedCount} staged`);
    if (modifiedCount > 0) parts.push(`${modifiedCount} modified`);
    if (untrackedCount > 0) parts.push(`${untrackedCount} untracked`);
    
    section += `    ${parts.join(', ')}\n`;
  }

  return section;
}

function formatSummary(statuses: RepoStatus[]): string {
  const cleanCount = statuses.filter(s => s.files.length === 0 && !s.error).length;
  const dirtyCount = statuses.filter(s => s.files.length > 0 || s.error).length;
  const total = statuses.length;

  return `\n${'─'.repeat(40)}\n${chalk.bold(`Summary: ${cleanCount} clean, ${dirtyCount} dirty (${total} total)`)}\n`;
}

// Implement formatVerboseOutput and formatShortOutput similarly
```

---

### Step 5: Main Command Implementation (30 minutes)

**File**: `src/commands/status.ts`

Put it all together:

```typescript
export async function statusCommand(options: StatusOptions): Promise<void> {
  // Validate options
  if (options.verbose && options.short) {
    logger.error('Cannot use --verbose and --short together');
    process.exit(2);
  }

  // Load config
  let config: ArashiConfig;
  try {
    config = await loadConfig();
  } catch (err) {
    logger.error('Not in an arashi workspace');
    logger.info('Run \'arashi init\' to initialize a workspace');
    process.exit(2);
  }

  // Show progress
  const s = spinner('Checking repository status...');
  s.start();

  // Check all repos
  const statuses = await checkAllRepos(config);

  s.stop();

  // Format and display output
  let output: string;
  if (options.verbose) {
    output = formatVerboseOutput(statuses);
  } else if (options.short) {
    output = formatShortOutput(statuses);
  } else {
    output = formatDefaultOutput(statuses);
  }

  console.log(output);

  // Exit with appropriate code
  const hasErrors = statuses.some(s => s.error !== null);
  if (hasErrors) {
    process.exit(1);
  }
}
```

---

### Step 6: Write Tests (90 minutes)

**File**: `tests/unit/status.test.ts`

```typescript
import { describe, test, expect } from 'bun:test';
import { parseGitStatus, parseBranchLine } from '../../src/commands/status';

describe('Git Status Parsing', () => {
  test('parses clean repository', () => {
    const output = '## main...origin/main';
    const result = parseGitStatus(output);
    
    expect(result.files).toHaveLength(0);
    expect(result.branch.localBranch).toBe('main');
    expect(result.branch.remoteBranch).toBe('origin/main');
  });

  test('parses modified files', () => {
    const output = `## main
 M src/file.ts
?? test.txt`;
    const result = parseGitStatus(output);
    
    expect(result.files).toHaveLength(2);
    expect(result.files[0].workingStatus).toBe('M');
    expect(result.files[1].workingStatus).toBe('?');
  });

  test('parses ahead/behind tracking', () => {
    const branch = parseBranchLine('## main...origin/main [ahead 2, behind 1]');
    
    expect(branch.ahead).toBe(2);
    expect(branch.behind).toBe(1);
  });
});
```

**File**: `tests/integration/status.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';

describe('Status Command Integration', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'arashi-test-'));
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  test('shows clean repository status', async () => {
    // Setup git repo
    execSync('git init', { cwd: testDir });
    execSync('git commit --allow-empty -m "init"', { cwd: testDir });
    
    // Init arashi
    execSync('arashi init', { cwd: testDir });
    
    // Run status
    const output = execSync('arashi status', { 
      cwd: testDir,
      encoding: 'utf-8',
    });
    
    expect(output).toContain('✓ Clean');
    expect(output).toContain('Summary: 1 clean, 0 dirty');
  });

  // Add more integration tests...
});
```

---

## Testing Checklist

- [ ] Unit tests for `parseGitStatus()`
- [ ] Unit tests for `parseBranchLine()`
- [ ] Unit tests for output formatting
- [ ] Integration test: clean repository
- [ ] Integration test: dirty repository
- [ ] Integration test: multiple repositories
- [ ] Integration test: --verbose mode
- [ ] Integration test: --short mode
- [ ] Integration test: error handling (missing repo)
- [ ] Integration test: not in workspace
- [ ] Manual test: 10+ repositories (performance)

---

## Common Pitfalls

### 1. Git Status Output Variations

**Issue**: Git status format varies slightly between versions

**Solution**: Use `--porcelain=v1` for stable format, test with multiple git versions

### 2. Path Handling

**Issue**: Windows vs Unix path separators

**Solution**: Use Bun's `path.join()` and `path.resolve()`, avoid string concatenation

### 3. Error Handling

**Issue**: One failed repo stops entire command

**Solution**: Use `Promise.all()` with try-catch per repo, continue on failures

### 4. Output Buffering

**Issue**: Large output may be buffered, users see nothing until complete

**Solution**: Consider streaming output as repos complete (optional enhancement)

---

## Next Steps

1. Implement basic command structure ✓
2. Add git status utility ✓
3. Parse git status output ✓
4. Check all repositories ✓
5. Format output (3 modes) ✓
6. Write tests ✓
7. Manual testing with real workspaces
8. Performance optimization if needed
9. Documentation update
10. Submit PR

---

## Resources

- **Existing Commands**: Study `src/commands/list.ts` for repo iteration patterns
- **Git Porcelain**: `git help status` - search for "porcelain"
- **Chalk Docs**: https://github.com/chalk/chalk - color output
- **Bun Spawn**: https://bun.sh/docs/api/spawn - process execution

---

## Getting Help

- **Constitution**: `.specify/memory/constitution.md` - principles and standards
- **Spec**: `specs/020-status-command/spec.md` - requirements
- **Research**: `specs/020-status-command/research.md` - technical decisions
- **Data Model**: `specs/020-status-command/data-model.md` - types and structures
