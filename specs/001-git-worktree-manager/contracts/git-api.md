# Git Wrapper API Design

**Feature**: 001-git-worktree-manager  
**Document**: [D4] #10  
**Created**: 2026-02-03  
**Status**: Draft  
**Dependencies**: D2 (Type System - ArashiError)

## Purpose

This document defines the internal API for all git operations in Arashi. The git wrapper abstracts direct git CLI interactions, provides type-safe interfaces, and handles error propagation consistently.

## Scope

**In Scope**:
- Git command execution wrapper (using Bun.spawn)
- Repository detection and validation functions
- Worktree management functions
- Branch management functions
- Git status and information queries
- Output parsing strategies
- Error handling and propagation

**Out of Scope**:
- CLI command implementations (see D3)
- High-level orchestration logic (see D5)
- Hook execution (see D6)

---

## Git Command Execution Wrapper

### Design Philosophy

All git operations go through a single execution wrapper that:
1. Constructs git commands with consistent options
2. Executes via Bun.spawn with proper working directory
3. Captures stdout and stderr
4. Parses exit codes and throws ArashiError on failure
5. Returns parsed output to caller

### Core Execution Function

#### execGit

Execute a git command and return output or throw on error.

```typescript
/**
 * Execute a git command with error handling
 * 
 * @param args - Git command arguments (excluding 'git')
 * @param options - Execution options
 * @returns stdout output from git command
 * @throws ArashiError if command fails (non-zero exit code)
 */
async function execGit(
  args: string[],
  options: GitExecOptions = {}
): Promise<string> {
  const {
    cwd = process.cwd(),
    throwOnError = true,
    env = process.env,
  } = options;

  const proc = Bun.spawn(['git', ...args], {
    cwd,
    env,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (throwOnError && exitCode !== 0) {
    throw new ArashiError(
      `Git command failed: git ${args.join(' ')}`,
      ExitCode.ERROR,
      `${stderr}\n${stdout}`.trim()
    );
  }

  return stdout.trim();
}
```

#### GitExecOptions

Options for git command execution.

```typescript
/**
 * Options for git command execution
 */
interface GitExecOptions {
  /** Working directory for git command (default: process.cwd()) */
  cwd?: string;

  /** Whether to throw ArashiError on non-zero exit (default: true) */
  throwOnError?: boolean;

  /** Environment variables (default: process.env) */
  env?: Record<string, string>;
}
```

### Helper Functions

#### buildGitCommand

Build git command arguments with common options.

```typescript
/**
 * Build git command arguments with common options
 * 
 * @param subcommand - Git subcommand (e.g., 'worktree', 'branch')
 * @param args - Subcommand arguments
 * @param options - Common git options
 * @returns Array of command arguments
 */
function buildGitCommand(
  subcommand: string,
  args: string[],
  options: GitCommandOptions = {}
): string[] {
  const cmd: string[] = [subcommand];

  if (options.porcelain) {
    cmd.push('--porcelain');
  }

  if (options.verbose) {
    cmd.push('--verbose');
  }

  cmd.push(...args);

  return cmd;
}
```

#### GitCommandOptions

Common options for git commands.

```typescript
/**
 * Common options for git commands
 */
interface GitCommandOptions {
  /** Use machine-readable porcelain format */
  porcelain?: boolean;

  /** Enable verbose output */
  verbose?: boolean;
}
```

---

## Repository Detection Functions

### isGitRepository

Check if a directory is a git repository.

```typescript
/**
 * Check if a directory is a git repository
 * 
 * @param path - Directory path to check
 * @returns true if directory contains .git or is inside a git repo
 */
async function isGitRepository(path: string): Promise<boolean> {
  try {
    await execGit(['rev-parse', '--git-dir'], { 
      cwd: path,
      throwOnError: true 
    });
    return true;
  } catch {
    return false;
  }
}
```

**Behavior**:
- Uses `git rev-parse --git-dir` to detect git repository
- Returns true if command succeeds (exit code 0)
- Returns false if command fails (not a git repository)

**Implementation Notes**:
- Detects both regular repos and worktrees (both have .git)
- Works from any subdirectory within a repository
- Fast operation (no network required)

---

### findGitRoot

Find the root directory of a git repository.

```typescript
/**
 * Find the root directory of a git repository
 * 
 * @param startPath - Directory to start search from
 * @returns Absolute path to repository root
 * @throws ArashiError if not in a git repository
 */
async function findGitRoot(startPath: string = process.cwd()): Promise<string> {
  const output = await execGit(
    ['rev-parse', '--show-toplevel'],
    { cwd: startPath }
  );
  return output.trim();
}
```

**Behavior**:
- Uses `git rev-parse --show-toplevel` to find root
- Returns absolute path to repository root directory
- Throws ArashiError if not in a git repository

**Implementation Notes**:
- Works from any subdirectory within repository
- Returns worktree root (not bare repository location)

---

### isGitBareRepo

Check if a directory is a bare git repository.

```typescript
/**
 * Check if a repository is a bare repository (no working tree)
 * 
 * @param path - Repository path
 * @returns true if repository is bare
 */
async function isGitBareRepo(path: string): Promise<boolean> {
  try {
    const output = await execGit(
      ['rev-parse', '--is-bare-repository'],
      { cwd: path }
    );
    return output === 'true';
  } catch {
    return false;
  }
}
```

**Behavior**:
- Uses `git rev-parse --is-bare-repository`
- Returns true if output is "true"
- Returns false if not a bare repository or not a git repo

**Implementation Notes**:
- Bare repositories cannot have worktrees created from them
- Arashi requires non-bare repositories

---

## Worktree Management Functions

### listWorktrees

List all worktrees for a repository.

```typescript
/**
 * List all worktrees in a repository
 * 
 * @param repoPath - Path to repository
 * @returns Array of worktree information
 */
async function listWorktrees(repoPath: string): Promise<GitWorktree[]> {
  const output = await execGit(
    ['worktree', 'list', '--porcelain'],
    { cwd: repoPath }
  );

  return parseWorktreeList(output);
}
```

#### GitWorktree

Worktree information returned by listWorktrees.

```typescript
/**
 * Information about a git worktree
 */
interface GitWorktree {
  /** Absolute path to worktree directory */
  path: string;

  /** Current HEAD commit SHA */
  head: string;

  /** Branch name (if checked out), or null for detached HEAD */
  branch: string | null;

  /** Whether this is a bare repository */
  bare: boolean;

  /** Whether worktree is locked */
  locked: boolean;

  /** Whether worktree can be pruned */
  prunable: boolean;
}
```

**Behavior**:
- Uses `git worktree list --porcelain` for machine-readable output
- Parses porcelain format into structured objects
- Returns all worktrees including main worktree

**Output Format** (git worktree list --porcelain):
```
worktree /path/to/main
HEAD abc123def456
branch refs/heads/main

worktree /path/to/feature-branch
HEAD 789ghi012jkl
branch refs/heads/feature-branch
```

**Implementation Notes**:
- Porcelain format is stable across git versions
- Each worktree is separated by blank line
- Fields are key-value pairs

---

### createWorktree

Create a new git worktree.

```typescript
/**
 * Create a new worktree at the specified path
 * 
 * @param repoPath - Path to source repository
 * @param worktreePath - Path where worktree should be created
 * @param branch - Branch name to checkout (creates if doesn't exist)
 * @param options - Worktree creation options
 * @throws ArashiError if worktree creation fails
 */
async function createWorktree(
  repoPath: string,
  worktreePath: string,
  branch: string,
  options: CreateWorktreeOptions = {}
): Promise<void> {
  const args = ['worktree', 'add'];

  if (options.force) {
    args.push('--force');
  }

  if (options.detach) {
    args.push('--detach');
  }

  if (options.track !== undefined) {
    args.push(options.track ? '--track' : '--no-track');
  }

  args.push(worktreePath, branch);

  await execGit(args, { cwd: repoPath });
}
```

#### CreateWorktreeOptions

Options for creating worktrees.

```typescript
/**
 * Options for creating a worktree
 */
interface CreateWorktreeOptions {
  /** Force creation even if worktree already exists (default: false) */
  force?: boolean;

  /** Create worktree with detached HEAD (default: false) */
  detach?: boolean;

  /** Set upstream tracking (default: true) */
  track?: boolean;
}
```

**Behavior**:
- Uses `git worktree add <path> <branch>`
- Creates branch if it doesn't exist (from current HEAD)
- Creates worktree directory if it doesn't exist
- Throws ArashiError if:
  - Worktree path already exists
  - Branch is already checked out in another worktree
  - Repository is bare

**Implementation Notes**:
- Use `--force` to override safety checks (dangerous)
- Use `--track` to set upstream tracking automatically
- Path can be relative or absolute

---

### removeWorktree

Remove an existing git worktree.

```typescript
/**
 * Remove a git worktree
 * 
 * @param repoPath - Path to source repository
 * @param worktreePath - Path to worktree to remove
 * @param options - Worktree removal options
 * @throws ArashiError if worktree removal fails
 */
async function removeWorktree(
  repoPath: string,
  worktreePath: string,
  options: RemoveWorktreeOptions = {}
): Promise<void> {
  const args = ['worktree', 'remove'];

  if (options.force) {
    args.push('--force');
  }

  args.push(worktreePath);

  await execGit(args, { cwd: repoPath });
}
```

#### RemoveWorktreeOptions

Options for removing worktrees.

```typescript
/**
 * Options for removing a worktree
 */
interface RemoveWorktreeOptions {
  /** Force removal even if worktree is dirty or locked (default: false) */
  force?: boolean;
}
```

**Behavior**:
- Uses `git worktree remove <path>`
- Removes worktree directory from filesystem
- Updates git metadata
- Throws ArashiError if:
  - Worktree doesn't exist
  - Worktree has uncommitted changes (unless `--force`)
  - Worktree is locked

**Implementation Notes**:
- Does NOT delete the branch (use deleteBranch separately)
- Use `--force` to remove dirty worktrees (dangerous)

---

## Branch Management Functions

### branchExists

Check if a branch exists in a repository.

```typescript
/**
 * Check if a branch exists
 * 
 * @param repoPath - Path to repository
 * @param branch - Branch name to check
 * @param options - Branch check options
 * @returns true if branch exists
 */
async function branchExists(
  repoPath: string,
  branch: string,
  options: BranchExistsOptions = {}
): Promise<boolean> {
  const ref = options.remote 
    ? `refs/remotes/${options.remote}/${branch}`
    : `refs/heads/${branch}`;

  try {
    await execGit(['show-ref', '--verify', '--quiet', ref], { 
      cwd: repoPath 
    });
    return true;
  } catch {
    return false;
  }
}
```

#### BranchExistsOptions

Options for checking branch existence.

```typescript
/**
 * Options for checking branch existence
 */
interface BranchExistsOptions {
  /** Check remote branch instead of local (e.g., "origin") */
  remote?: string;
}
```

**Behavior**:
- Uses `git show-ref --verify` to check exact ref
- Returns true if branch exists (exit code 0)
- Returns false if branch doesn't exist (exit code 1)
- `--quiet` suppresses output

**Implementation Notes**:
- Local branches: `refs/heads/<branch>`
- Remote branches: `refs/remotes/<remote>/<branch>`
- Fast operation (no network)

---

### createBranch

Create a new branch in a repository.

```typescript
/**
 * Create a new branch
 * 
 * @param repoPath - Path to repository
 * @param branch - Branch name to create
 * @param options - Branch creation options
 * @throws ArashiError if branch creation fails
 */
async function createBranch(
  repoPath: string,
  branch: string,
  options: CreateBranchOptions = {}
): Promise<void> {
  const args = ['branch'];

  if (options.force) {
    args.push('--force');
  }

  if (options.track && options.startPoint) {
    args.push('--track', branch, options.startPoint);
  } else {
    args.push(branch);
    if (options.startPoint) {
      args.push(options.startPoint);
    }
  }

  await execGit(args, { cwd: repoPath });
}
```

#### CreateBranchOptions

Options for creating branches.

```typescript
/**
 * Options for creating a branch
 */
interface CreateBranchOptions {
  /** Starting point for new branch (commit, branch, or tag) */
  startPoint?: string;

  /** Force creation even if branch exists (default: false) */
  force?: boolean;

  /** Set upstream tracking to startPoint (default: false) */
  track?: boolean;
}
```

**Behavior**:
- Uses `git branch <name> [start-point]`
- Creates branch at start-point or current HEAD
- Throws ArashiError if:
  - Branch already exists (unless `--force`)
  - Start-point is invalid

**Implementation Notes**:
- Does not checkout the branch (use git checkout separately)
- Use `--track` to set upstream tracking

---

### deleteBranch

Delete a branch from a repository.

```typescript
/**
 * Delete a branch
 * 
 * @param repoPath - Path to repository
 * @param branch - Branch name to delete
 * @param options - Branch deletion options
 * @throws ArashiError if branch deletion fails
 */
async function deleteBranch(
  repoPath: string,
  branch: string,
  options: DeleteBranchOptions = {}
): Promise<void> {
  const args = ['branch'];

  if (options.force) {
    args.push('-D'); // Force delete (even if not merged)
  } else {
    args.push('-d'); // Safe delete (only if merged)
  }

  if (options.remote) {
    // Delete remote branch
    await execGit(
      ['push', options.remote, '--delete', branch],
      { cwd: repoPath }
    );
  } else {
    // Delete local branch
    args.push(branch);
    await execGit(args, { cwd: repoPath });
  }
}
```

#### DeleteBranchOptions

Options for deleting branches.

```typescript
/**
 * Options for deleting a branch
 */
interface DeleteBranchOptions {
  /** Force deletion even if not merged (default: false) */
  force?: boolean;

  /** Delete remote branch instead of local (e.g., "origin") */
  remote?: string;
}
```

**Behavior**:
- Uses `git branch -d <branch>` (safe) or `-D` (force)
- Safe delete: Only deletes if branch is fully merged
- Force delete: Deletes regardless of merge status
- Remote delete: Uses `git push <remote> --delete <branch>`
- Throws ArashiError if:
  - Branch doesn't exist
  - Branch not merged (safe mode)
  - Branch is currently checked out

**Implementation Notes**:
- Cannot delete currently checked-out branch
- Remote deletion requires network access

---

### getCurrentBranch

Get the name of the currently checked-out branch.

```typescript
/**
 * Get the current branch name
 * 
 * @param repoPath - Path to repository
 * @returns Current branch name, or null if detached HEAD
 */
async function getCurrentBranch(repoPath: string): Promise<string | null> {
  try {
    const output = await execGit(
      ['symbolic-ref', '--short', 'HEAD'],
      { cwd: repoPath }
    );
    return output.trim();
  } catch {
    // Detached HEAD state
    return null;
  }
}
```

**Behavior**:
- Uses `git symbolic-ref --short HEAD`
- Returns branch name (e.g., "main", "feature-branch")
- Returns null if in detached HEAD state
- `--short` removes `refs/heads/` prefix

**Implementation Notes**:
- Fast operation (reads local git metadata)
- Detached HEAD occurs when checking out a commit directly

---

### getDefaultBranch

Get the default branch name from remote.

```typescript
/**
 * Get the default branch name from remote
 * 
 * @param repoPath - Path to repository
 * @param remote - Remote name (default: "origin")
 * @returns Default branch name (e.g., "main", "master")
 * @throws ArashiError if remote doesn't exist or is unreachable
 */
async function getDefaultBranch(
  repoPath: string,
  remote: string = 'origin'
): Promise<string> {
  const output = await execGit(
    ['symbolic-ref', `refs/remotes/${remote}/HEAD`],
    { cwd: repoPath }
  );

  // Output format: refs/remotes/origin/main
  const match = output.match(/refs\/remotes\/[^\/]+\/(.+)/);
  if (!match) {
    throw new ArashiError(
      `Failed to parse default branch from: ${output}`,
      ExitCode.ERROR
    );
  }

  return match[1];
}
```

**Behavior**:
- Uses `git symbolic-ref refs/remotes/<remote>/HEAD`
- Parses output to extract branch name
- Throws ArashiError if:
  - Remote doesn't exist
  - Remote HEAD is not set (run `git remote set-head <remote> -a`)

**Implementation Notes**:
- Reads cached remote HEAD (no network access)
- If remote HEAD not set, run: `git remote set-head origin -a`

---

### setUpstreamTracking

Set upstream tracking for a branch.

```typescript
/**
 * Set upstream tracking for a branch
 * 
 * @param repoPath - Path to repository
 * @param branch - Local branch name
 * @param upstream - Upstream branch (format: "origin/main")
 * @throws ArashiError if tracking setup fails
 */
async function setUpstreamTracking(
  repoPath: string,
  branch: string,
  upstream: string
): Promise<void> {
  await execGit(
    ['branch', '--set-upstream-to', upstream, branch],
    { cwd: repoPath }
  );
}
```

**Behavior**:
- Uses `git branch --set-upstream-to=<upstream> <branch>`
- Sets tracking relationship for pull/push
- Throws ArashiError if:
  - Local branch doesn't exist
  - Upstream ref doesn't exist

**Implementation Notes**:
- Upstream format: `<remote>/<branch>` (e.g., "origin/main")
- Enables `git pull` without arguments

---

### fetchLatest

Fetch latest changes from remote.

```typescript
/**
 * Fetch latest changes from remote
 * 
 * @param repoPath - Path to repository
 * @param options - Fetch options
 * @throws ArashiError if fetch fails
 */
async function fetchLatest(
  repoPath: string,
  options: FetchOptions = {}
): Promise<void> {
  const args = ['fetch'];

  if (options.remote) {
    args.push(options.remote);
  } else {
    args.push('--all'); // Fetch from all remotes
  }

  if (options.prune) {
    args.push('--prune'); // Remove deleted remote branches
  }

  await execGit(args, { cwd: repoPath });
}
```

#### FetchOptions

Options for fetching from remote.

```typescript
/**
 * Options for fetching from remote
 */
interface FetchOptions {
  /** Specific remote to fetch from (default: all remotes) */
  remote?: string;

  /** Prune deleted remote branches (default: false) */
  prune?: boolean;
}
```

**Behavior**:
- Uses `git fetch [remote]` or `git fetch --all`
- Downloads objects and refs from remote
- Does not modify working tree
- Throws ArashiError if network failure

**Implementation Notes**:
- Requires network access
- Use `--prune` to clean up stale remote-tracking branches
- Always fetch before creating worktrees to ensure latest refs

---

## Status & Information Functions

### getStatus

Get git status for a repository.

```typescript
/**
 * Get git status for a repository
 * 
 * @param repoPath - Path to repository
 * @returns Parsed status information
 */
async function getStatus(repoPath: string): Promise<GitStatus> {
  const output = await execGit(
    ['status', '--porcelain=v2', '--branch'],
    { cwd: repoPath }
  );

  return parseGitStatus(output);
}
```

#### GitStatus

Parsed git status information.

```typescript
/**
 * Git status information
 */
interface GitStatus {
  /** Current branch name (or null if detached) */
  branch: string | null;

  /** Upstream branch name (or null if no tracking) */
  upstream: string | null;

  /** Commits ahead of upstream */
  ahead: number;

  /** Commits behind upstream */
  behind: number;

  /** Whether working tree has uncommitted changes */
  isDirty: boolean;

  /** Number of staged changes */
  stagedCount: number;

  /** Number of unstaged changes */
  unstagedCount: number;

  /** Number of untracked files */
  untrackedCount: number;
}
```

**Behavior**:
- Uses `git status --porcelain=v2 --branch` for machine-readable output
- Parses output into structured status object
- Detects dirty state (any uncommitted changes)

**Output Format** (porcelain v2):
```
# branch.oid abc123def456
# branch.head main
# branch.upstream origin/main
# branch.ab +3 -1
1 .M N... 100644 100644 100644 sha1 sha2 file.txt
? untracked.txt
```

**Implementation Notes**:
- Porcelain v2 is stable and comprehensive
- Header lines start with `#`
- Change lines: `1` (ordinary), `2` (renamed), `?` (untracked)
- `ab` line: `+ahead -behind`

---

### getRemoteUrl

Get remote URL for a repository.

```typescript
/**
 * Get remote URL
 * 
 * @param repoPath - Path to repository
 * @param remote - Remote name (default: "origin")
 * @returns Remote URL (https or ssh format)
 * @throws ArashiError if remote doesn't exist
 */
async function getRemoteUrl(
  repoPath: string,
  remote: string = 'origin'
): Promise<string> {
  const output = await execGit(
    ['remote', 'get-url', remote],
    { cwd: repoPath }
  );
  return output.trim();
}
```

**Behavior**:
- Uses `git remote get-url <remote>`
- Returns URL exactly as configured
- Throws ArashiError if remote doesn't exist

**Implementation Notes**:
- URL formats: https://, git://, git@host:, file://
- Fast operation (reads local config)

---

## Output Parsing Strategies

### parseWorktreeList

Parse output from `git worktree list --porcelain`.

```typescript
/**
 * Parse git worktree list --porcelain output
 * 
 * @param output - Raw porcelain output
 * @returns Array of parsed worktree objects
 */
function parseWorktreeList(output: string): GitWorktree[] {
  const worktrees: GitWorktree[] = [];
  const entries = output.split('\n\n'); // Worktrees separated by blank lines

  for (const entry of entries) {
    if (!entry.trim()) continue;

    const lines = entry.split('\n');
    const worktree: Partial<GitWorktree> = {
      bare: false,
      locked: false,
      prunable: false,
      branch: null,
    };

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        worktree.path = line.substring('worktree '.length);
      } else if (line.startsWith('HEAD ')) {
        worktree.head = line.substring('HEAD '.length);
      } else if (line.startsWith('branch ')) {
        const branchRef = line.substring('branch '.length);
        // Extract branch name from refs/heads/branch-name
        worktree.branch = branchRef.replace('refs/heads/', '');
      } else if (line === 'bare') {
        worktree.bare = true;
      } else if (line.startsWith('locked')) {
        worktree.locked = true;
      } else if (line.startsWith('prunable')) {
        worktree.prunable = true;
      }
    }

    worktrees.push(worktree as GitWorktree);
  }

  return worktrees;
}
```

**Format**:
```
worktree /path/to/worktree
HEAD abc123def456789
branch refs/heads/main

worktree /path/to/feature
HEAD 789def012abc345
branch refs/heads/feature-branch
locked reason for lock
```

---

### parseGitStatus

Parse output from `git status --porcelain=v2 --branch`.

```typescript
/**
 * Parse git status --porcelain=v2 output
 * 
 * @param output - Raw porcelain v2 output
 * @returns Parsed status object
 */
function parseGitStatus(output: string): GitStatus {
  const status: GitStatus = {
    branch: null,
    upstream: null,
    ahead: 0,
    behind: 0,
    isDirty: false,
    stagedCount: 0,
    unstagedCount: 0,
    untrackedCount: 0,
  };

  const lines = output.split('\n');

  for (const line of lines) {
    if (line.startsWith('# branch.head ')) {
      status.branch = line.substring('# branch.head '.length);
    } else if (line.startsWith('# branch.upstream ')) {
      status.upstream = line.substring('# branch.upstream '.length);
    } else if (line.startsWith('# branch.ab ')) {
      const ab = line.substring('# branch.ab '.length);
      const [ahead, behind] = ab.split(' ').map(s => parseInt(s.replace(/[+-]/, ''), 10));
      status.ahead = ahead;
      status.behind = behind;
    } else if (line.startsWith('1 ')) {
      // Ordinary change
      const parts = line.split(' ');
      const xy = parts[1]; // XY status (e.g., "M.", ".M", "MM")
      if (xy[0] !== '.') status.stagedCount++;
      if (xy[1] !== '.') status.unstagedCount++;
      status.isDirty = true;
    } else if (line.startsWith('? ')) {
      // Untracked file
      status.untrackedCount++;
      status.isDirty = true;
    }
  }

  return status;
}
```

**Format**:
```
# branch.oid abc123
# branch.head main
# branch.upstream origin/main
# branch.ab +3 -1
1 .M N... 100644 100644 100644 sha sha file.txt
? untracked.txt
```

**XY Status Codes**:
- First char (X): Staged status (M=modified, A=added, D=deleted, .=unchanged)
- Second char (Y): Unstaged status (same codes)
- Examples: "M." (staged), ".M" (unstaged), "MM" (both)

---

## Error Handling Strategy

### Principles

1. **Always capture git output**: Include stdout and stderr in ArashiError
2. **Throw on failure**: Non-zero exit codes throw ArashiError
3. **Preserve context**: Include git command in error message
4. **Exit codes**: Map git failures to ExitCode.ERROR (1)

### Example Error Handling

```typescript
try {
  await createWorktree(repoPath, worktreePath, branch);
} catch (error) {
  if (error instanceof ArashiError) {
    console.error(`Error: ${error.message}`);
    console.error(`Git output: ${error.gitOutput}`);
    process.exit(error.exitCode);
  }
  throw error; // Re-throw unexpected errors
}
```

### Common Git Errors

| Git Error | Arashi Handling | User Message |
|-----------|-----------------|--------------|
| `fatal: not a git repository` | Throw ArashiError | "Not a git repository. Run `git init` first." |
| `fatal: invalid reference` | Throw ArashiError | "Branch does not exist: <branch>" |
| `fatal: '<path>' already exists` | Throw ArashiError | "Worktree path already exists: <path>" |
| `fatal: '<branch>' is already checked out` | Throw ArashiError | "Branch already checked out in another worktree" |
| Network errors | Throw ArashiError | "Failed to fetch from remote. Check network connection." |

---

## Implementation Notes

### Bun.spawn Specifics

```typescript
// Bun.spawn API usage
const proc = Bun.spawn(['git', 'status'], {
  cwd: '/path/to/repo',           // Working directory
  env: process.env,                // Environment variables
  stdout: 'pipe',                  // Capture stdout
  stderr: 'pipe',                  // Capture stderr
});

// Read output
const stdout = await new Response(proc.stdout).text();
const stderr = await new Response(proc.stderr).text();

// Wait for exit
const exitCode = await proc.exited;
```

### Performance Considerations

1. **Batch operations**: Minimize git command invocations
2. **Use porcelain formats**: Faster parsing than human-readable output
3. **Avoid unnecessary fetches**: Cache remote information when possible
4. **Parallel execution**: Run independent git commands concurrently

### Cross-Platform Compatibility

All git commands work identically on:
- macOS
- Linux
- Windows (with git installed)

**Path handling**:
- Always use forward slashes for git paths
- Convert Windows paths (C:\...) to git format (C:/...)
- Use Bun's path utilities for filesystem operations

---

## Design Decisions

### Decision: Single execGit Function

**Choice**: All git commands go through one execution function

**Rationale**: 
- Consistent error handling
- Centralized logging (future)
- Easy to add global git options

**Alternatives Considered**:
- Direct Bun.spawn calls: Rejected (duplicated error handling)
- Separate functions per git command: Rejected (too much boilerplate)

### Decision: Porcelain Formats for Parsing

**Choice**: Use `--porcelain` flags for machine-readable output

**Rationale**:
- Stable across git versions
- Easy to parse (key-value pairs)
- No localization issues

**Alternatives Considered**:
- Parse human-readable output: Rejected (fragile, locale-dependent)
- Use libgit2 bindings: Rejected (adds dependency, increases binary size)

### Decision: Throw on Error (Not Return Codes)

**Choice**: Git failures throw ArashiError with captured output

**Rationale**:
- TypeScript best practice (exceptions for exceptional cases)
- Simplifies caller code (no error checking on every call)
- Full error context available

**Alternatives Considered**:
- Return Result<T, E> type: Rejected (verbose, not idiomatic)
- Return null on error: Rejected (loses error information)

### Decision: Async All Functions

**Choice**: All git wrapper functions are async

**Rationale**:
- Git commands are I/O operations (inherently async)
- Bun.spawn is async
- Enables concurrent operations

**Alternatives Considered**:
- Synchronous wrappers: Rejected (blocks event loop)
- Mix of sync/async: Rejected (confusing API)

---

## References

- **GitHub Issue**: #10 (D4 Git Wrapper API Design)
- **Related Documents**:
  - D2: Type System (ArashiError, WorktreeStatus)
  - D3: CLI Commands (uses git wrapper functions)
  - D5: Worktree Orchestration (calls git wrapper API)
- **External Resources**:
  - [Git Documentation](https://git-scm.com/docs)
  - [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
  - [Git Porcelain Formats](https://git-scm.com/docs/git-status#_porcelain_format_version_2)
  - [Bun.spawn Documentation](https://bun.sh/docs/api/spawn)
- **Constitution Principles**:
  - Cross-platform: All git commands work on macOS, Linux, Windows
  - Single-file executable: No external dependencies beyond git CLI
  - Type-safe: TypeScript interfaces for all functions
