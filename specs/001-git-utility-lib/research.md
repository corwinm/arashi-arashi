# Research: Git Utility Library

**Feature**: 001-git-utility-lib  
**Date**: 2026-02-03  
**Status**: Complete

## Research Tasks

This document consolidates research findings for technical decisions needed to implement the git utility library.

## R1: Bun.spawn() API for Git Command Execution

### Decision
Use `Bun.spawn()` with the following configuration:
```typescript
const proc = Bun.spawn(["git", ...args], {
  cwd: repoPath,
  stdout: "pipe",
  stderr: "pipe",
});
```

### Rationale
- **Built-in support**: Bun.spawn() is native to Bun runtime, no external dependencies
- **Stream capture**: Supports capturing both stdout and stderr separately
- **Process control**: Returns process handle with exit code, allowing proper error detection
- **Cross-platform**: Works identically on macOS, Linux, and Windows
- **Async-friendly**: Returns Promise-based API for clean async/await usage

### Implementation Details
```typescript
async function exec(args: string[], cwd: string): Promise<CommandResult> {
  const proc = Bun.spawn(["git", ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  
  if (exitCode !== 0) {
    throw new ArashiError(`Git command failed: ${stderr}`, { stdout, stderr, exitCode, args });
  }
  
  return { stdout, stderr, exitCode };
}
```

### Alternatives Considered
- **Node.js child_process**: Rejected - requires Node.js runtime, conflicts with Bun-native approach
- **Simple-git library**: Rejected - external dependency, adds bundle size, not necessary for our needs
- **Direct libgit2 bindings**: Rejected - complex C bindings, cross-platform compilation challenges, git version compatibility issues

## R2: Git Porcelain Format Parsing

### Decision
Parse `git worktree list --porcelain` and `git status --porcelain=v1` output using line-based parsing with state machines.

### Rationale
- **Stable format**: Porcelain formats are designed for machine consumption and guaranteed stable across git versions
- **Complete information**: Porcelain format includes all necessary metadata (paths, branches, commits, status)
- **Git version support**: Both formats available since git 2.5+ (meets constitution requirement)
- **Parsing simplicity**: Line-based format is straightforward to parse without complex regex

### Implementation Details

**Worktree List Parsing**:
```typescript
// git worktree list --porcelain output:
// worktree /path/to/worktree
// HEAD abcd1234...
// branch refs/heads/feature-branch
// 
// worktree /path/to/another
// HEAD efgh5678...
// detached

interface Worktree {
  path: string;
  head: string;
  branch: string | null;
  locked: boolean;
}

function parseWorktreeList(output: string): Worktree[] {
  const worktrees: Worktree[] = [];
  let current: Partial<Worktree> = {};
  
  for (const line of output.split('\n')) {
    if (line.startsWith('worktree ')) {
      if (current.path) worktrees.push(current as Worktree);
      current = { path: line.slice(9), locked: false };
    } else if (line.startsWith('HEAD ')) {
      current.head = line.slice(5);
    } else if (line.startsWith('branch ')) {
      current.branch = line.slice(7).replace('refs/heads/', '');
    } else if (line === 'detached') {
      current.branch = null;
    } else if (line.startsWith('locked')) {
      current.locked = true;
    }
  }
  
  if (current.path) worktrees.push(current as Worktree);
  return worktrees;
}
```

**Status Parsing**:
```typescript
// git status --porcelain=v1 output:
// XY PATH
// where X=index status, Y=worktree status
//  M file.txt (modified in worktree)
// M  file.txt (modified in index)
// ?? new.txt (untracked)

interface StatusEntry {
  path: string;
  indexStatus: string;
  worktreeStatus: string;
}

function parseStatus(output: string): StatusEntry[] {
  return output.split('\n')
    .filter(line => line.length > 0)
    .map(line => ({
      indexStatus: line[0],
      worktreeStatus: line[1],
      path: line.slice(3),
    }));
}
```

### Alternatives Considered
- **git status --short**: Rejected - same as --porcelain=v1, just an alias
- **git status --json**: Rejected - not available in git 2.5, would break version compatibility requirement
- **Plumbing commands (diff-index, etc.)**: Rejected - more complex, requires multiple commands for same info

## R3: Error Handling Strategy

### Decision
Create custom `ArashiError` class that extends Error and preserves git command context:

```typescript
interface GitErrorContext {
  stdout: string;
  stderr: string;
  exitCode: number;
  args: string[];
  cwd?: string;
}

class ArashiError extends Error {
  readonly context: GitErrorContext;
  readonly code: string;
  
  constructor(message: string, context: GitErrorContext) {
    super(message);
    this.name = 'ArashiError';
    this.context = context;
    this.code = this.parseGitErrorCode(context.stderr);
  }
  
  private parseGitErrorCode(stderr: string): string {
    // Extract git error codes like "fatal:", "error:", etc.
    if (stderr.includes('fatal:')) return 'GIT_FATAL';
    if (stderr.includes('not a git repository')) return 'NOT_A_REPOSITORY';
    if (stderr.includes('already exists')) return 'ALREADY_EXISTS';
    // ... more error code detection
    return 'GIT_ERROR';
  }
  
  toJSON() {
    return {
      message: this.message,
      code: this.code,
      context: this.context,
    };
  }
}
```

### Rationale
- **Diagnostic context**: Preserves full git output, command, and working directory for debugging
- **Structured errors**: Error codes enable programmatic error handling (e.g., retry logic, rollback decisions)
- **Constitution compliance**: Provides clear error messages with sufficient diagnostic context (SC-007)
- **User-facing**: CLI layer can format these errors with color, suggestions, etc. (Constitution IV)

### Alternatives Considered
- **Plain Error with message**: Rejected - loses command context needed for diagnostics
- **Separate error classes per operation**: Rejected - over-engineering, single error class with codes is simpler
- **Return error objects instead of throwing**: Rejected - TypeScript async/await idiom expects thrown errors

## R4: Repository Detection Methods

### Decision
Implement detection using synchronous file system checks:

```typescript
import { existsSync, statSync } from 'fs';
import { join } from 'path';

function isGitRepository(path: string): boolean {
  const gitDir = join(path, '.git');
  
  if (!existsSync(gitDir)) return false;
  
  const stat = statSync(gitDir);
  
  // .git can be a directory (normal repo) or file (submodule/worktree)
  return stat.isDirectory() || stat.isFile();
}

function isGitBareRepo(path: string): boolean {
  // Bare repos have HEAD, refs/, and objects/ directly in root
  const requiredPaths = ['HEAD', 'refs', 'objects'].map(p => join(path, p));
  
  return requiredPaths.every(p => {
    try {
      return existsSync(p);
    } catch {
      return false;
    }
  });
}
```

### Rationale
- **Fast**: File system checks are < 1ms, no process spawning needed
- **Accurate**: Checks for actual git repository structure, not just naming conventions
- **Handles edge cases**: Detects submodules (.git file) and worktrees (.git file pointing to parent)
- **Cross-platform**: File system APIs work identically on all platforms

### Alternatives Considered
- **Execute `git rev-parse --git-dir`**: Rejected - slower (process spawn), unnecessary for simple detection
- **Check for .git only**: Rejected - misses bare repositories
- **Parse .git file content**: Rejected - unnecessary complexity, existence check sufficient

## R5: Git Version Compatibility

### Decision
Target git version 2.5+ with feature detection where needed.

### Rationale
- **Widely available**: Git 2.5 released in 2015, available on all modern systems
- **Worktree support**: `git worktree` command introduced in git 2.5
- **Porcelain stability**: All required porcelain formats stable since 2.5
- **Constitution requirement**: SC-006 specifies version 2.5+ support

### Version-Specific Features
All required commands available in git 2.5+:
- `git worktree add` (2.5)
- `git worktree list --porcelain` (2.7, use non-porcelain in 2.5-2.6)
- `git worktree remove` (2.17, manual removal fallback for older versions)
- `git status --porcelain` (1.7)
- `git branch`, `git fetch`, `git show-ref` (all ancient)

### Compatibility Strategy
```typescript
async function getGitVersion(): Promise<string> {
  const result = await exec(['--version'], process.cwd());
  // "git version 2.39.2" -> "2.39.2"
  return result.stdout.trim().replace('git version ', '');
}

function compareVersions(actual: string, required: string): boolean {
  const [aMajor, aMinor] = actual.split('.').map(Number);
  const [rMajor, rMinor] = required.split('.').map(Number);
  
  if (aMajor > rMajor) return true;
  if (aMajor === rMajor && aMinor >= rMinor) return true;
  return false;
}
```

### Alternatives Considered
- **Require git 2.17+**: Rejected - unnecessary, can support older versions with minimal fallbacks
- **No version checking**: Rejected - risks runtime failures on old git versions

## R6: Best Practices for Git Operations

### Decision
Follow these patterns for all git operations:

1. **Validate inputs before execution**:
   - Check repository exists with `isGitRepository()`
   - Verify branch exists before operations
   - Check for conflicts (e.g., worktree path already exists)

2. **Provide atomic operations**:
   - Each function performs one logical operation
   - No hidden side effects
   - Failures leave repository in clean state

3. **Use explicit git arguments**:
   - Always specify `--porcelain` for parseable output
   - Use `--verify` for existence checks
   - Prefer `--no-pager` to avoid interactive prompts

4. **Handle paths correctly**:
   - Normalize paths with `path.resolve()`
   - Use absolute paths in git commands
   - Handle spaces in paths with proper quoting

### Rationale
- **Reliability**: Input validation prevents cryptic git errors
- **Predictability**: Atomic operations make behavior easy to understand and test
- **Cross-platform**: Explicit arguments avoid platform-specific git config differences
- **Constitution**: Aligns with error recovery principle (III) and user-centric interface (IV)

### Example Pattern
```typescript
async function createWorktree(
  repoPath: string,
  branch: string,
  worktreePath: string
): Promise<void> {
  // Validate inputs
  if (!isGitRepository(repoPath)) {
    throw new ArashiError('Not a git repository', {
      stdout: '',
      stderr: `Path ${repoPath} is not a git repository`,
      exitCode: 1,
      args: [],
      cwd: repoPath,
    });
  }
  
  // Check for conflicts
  if (existsSync(worktreePath)) {
    throw new ArashiError('Worktree path already exists', {
      stdout: '',
      stderr: `Path ${worktreePath} already exists`,
      exitCode: 1,
      args: [],
    });
  }
  
  // Execute operation
  await exec(['worktree', 'add', worktreePath, branch], repoPath);
}
```

## R7: Testing Strategy

### Decision
Use Bun test runner with temporary git repositories for test isolation:

```typescript
import { test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let testRepo: string;

beforeEach(() => {
  testRepo = mkdtempSync(join(tmpdir(), 'arashi-test-'));
  // Initialize test repo
  Bun.spawnSync(['git', 'init'], { cwd: testRepo });
  Bun.spawnSync(['git', 'config', 'user.email', 'test@example.com'], { cwd: testRepo });
  Bun.spawnSync(['git', 'config', 'user.name', 'Test User'], { cwd: testRepo });
});

afterEach(() => {
  rmSync(testRepo, { recursive: true, force: true });
});

test('createWorktree creates new worktree', async () => {
  // Create initial commit
  const filePath = join(testRepo, 'README.md');
  await Bun.write(filePath, '# Test');
  Bun.spawnSync(['git', 'add', '.'], { cwd: testRepo });
  Bun.spawnSync(['git', 'commit', '-m', 'Initial commit'], { cwd: testRepo });
  
  // Test worktree creation
  const worktreePath = join(testRepo, '..', 'test-worktree');
  await createWorktree(testRepo, 'main', worktreePath);
  
  expect(existsSync(worktreePath)).toBe(true);
  expect(isGitRepository(worktreePath)).toBe(true);
});
```

### Rationale
- **Isolation**: Each test gets fresh git repository, preventing test interdependencies
- **Real git**: Tests actual git commands, catches integration issues
- **Fast**: Bun test runner is fast, temporary directories cleaned up automatically
- **Coverage**: Can test both success and failure scenarios with real git behavior

### Test Categories
1. **Unit tests**: Individual functions with mocked git operations
2. **Integration tests**: Full operations with real git repositories
3. **Edge case tests**: Error scenarios, permission issues, concurrent operations
4. **Cross-platform tests**: Run on macOS, Linux, Windows CI

### Alternatives Considered
- **Mock all git commands**: Rejected - misses real git behavior, integration bugs
- **Use fixture repositories**: Rejected - shared state between tests causes flakiness
- **Manual cleanup**: Rejected - Bun's beforeEach/afterEach cleaner and more reliable

## Summary

All research tasks complete. Key decisions:
- **R1**: Use Bun.spawn() for git command execution
- **R2**: Parse porcelain formats with line-based state machines
- **R3**: Custom ArashiError class with full diagnostic context
- **R4**: Fast file system checks for repository detection
- **R5**: Target git 2.5+ with feature detection
- **R6**: Validate inputs, atomic operations, explicit git arguments
- **R7**: Bun test runner with temporary git repositories

All technical unknowns resolved. Ready for Phase 1 (Design & Contracts).
