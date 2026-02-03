# Git API Contract

## Overview

This document defines the API contract for all git operations in the arashi-arashi project. Each function signature, parameter, return type, error handling, and output parsing pattern is specified here.

## Version

Contract Version: 1.0.0  
Last Updated: 2026-02-03

---

## Core Principles

1. **Isolation**: All git operations are isolated in dedicated modules
2. **Error Handling**: All functions throw typed errors (ArashiError)
3. **Validation**: All inputs are validated before executing git commands
4. **Parsing**: All git output is parsed into structured TypeScript types
5. **Testing**: All functions are unit tested with mocked git commands

---

## Type Definitions

### Base Types

```typescript
/**
 * Git command execution options
 */
interface GitCommandOptions {
  cwd?: string;              // Working directory (default: process.cwd())
  timeout?: number;          // Command timeout in ms (default: 30000)
  encoding?: BufferEncoding; // Output encoding (default: 'utf8')
  env?: NodeJS.ProcessEnv;   // Environment variables
}

/**
 * Git command result
 */
interface GitCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  command: string;
  duration: number;  // milliseconds
}

/**
 * Worktree information
 */
interface WorktreeInfo {
  path: string;        // Absolute path to worktree
  branch: string;      // Branch name
  commit: string;      // Current commit SHA
  bare: boolean;       // Is bare worktree
  detached: boolean;   // Is HEAD detached
  prunable: boolean;   // Can be pruned
}

/**
 * Branch information
 */
interface BranchInfo {
  name: string;          // Branch name (without refs/heads/)
  commit: string;        // Current commit SHA
  upstream?: string;     // Upstream branch (if set)
  ahead: number;         // Commits ahead of upstream
  behind: number;        // Commits behind upstream
  current: boolean;      // Is current branch
}

/**
 * Repository status
 */
interface RepositoryStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: FileStatus[];
  unstaged: FileStatus[];
  untracked: string[];
  conflicted: string[];
}

/**
 * File status
 */
interface FileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied';
  oldPath?: string;  // For renamed files
}

/**
 * Remote information
 */
interface RemoteInfo {
  name: string;
  url: string;
  fetch: string;
  push: string;
}
```

---

## Repository Operations

### `isGitRepository`

Check if a directory is inside a git repository.

#### Signature
```typescript
async function isGitRepository(
  path?: string,
  options?: GitCommandOptions
): Promise<boolean>
```

#### Parameters
- `path` (optional): Directory path to check (default: current directory)
- `options` (optional): Git command options

#### Returns
- `Promise<boolean>`: True if directory is in a git repository

#### Implementation
```bash
git rev-parse --is-inside-work-tree
```

#### Error Handling
- Does NOT throw on "not a git repository"
- Returns `false` for any git error
- Throws `ArashiError` for system errors (permission denied, etc.)

#### Example
```typescript
const isRepo = await isGitRepository('/Users/user/project');
// Returns: true

const notRepo = await isGitRepository('/tmp');
// Returns: false
```

#### Tests
```typescript
describe('isGitRepository', () => {
  it('should return true for valid git repository', async () => {});
  it('should return false for non-git directory', async () => {});
  it('should use provided path', async () => {});
  it('should handle permission errors', async () => {});
});
```

---

### `getRepositoryRoot`

Get the root directory of the current git repository.

#### Signature
```typescript
async function getRepositoryRoot(
  path?: string,
  options?: GitCommandOptions
): Promise<string>
```

#### Parameters
- `path` (optional): Starting directory (default: current directory)
- `options` (optional): Git command options

#### Returns
- `Promise<string>`: Absolute path to repository root

#### Implementation
```bash
git rev-parse --show-toplevel
```

#### Error Handling
- Throws `ArashiError` if not in a git repository
- Error code: `GIT_NOT_REPOSITORY`

#### Example
```typescript
const root = await getRepositoryRoot('/Users/user/project/src');
// Returns: '/Users/user/project'
```

---

### `getDefaultBranch`

Get the default branch name (main/master/etc.).

#### Signature
```typescript
async function getDefaultBranch(
  remote?: string,
  options?: GitCommandOptions
): Promise<string>
```

#### Parameters
- `remote` (optional): Remote name (default: 'origin')
- `options` (optional): Git command options

#### Returns
- `Promise<string>`: Default branch name (e.g., 'main', 'master')

#### Implementation
```bash
# Try 1: Check remote HEAD
git symbolic-ref refs/remotes/origin/HEAD

# Try 2: Check common branch names
git branch --list main master

# Try 3: Get first branch
git branch --format='%(refname:short)' | head -1
```

#### Error Handling
- Throws `ArashiError` if no branches exist
- Error code: `GIT_NO_BRANCHES`

#### Example
```typescript
const defaultBranch = await getDefaultBranch();
// Returns: 'main'
```

---

### `getCurrentBranch`

Get the current branch name.

#### Signature
```typescript
async function getCurrentBranch(
  options?: GitCommandOptions
): Promise<string | null>
```

#### Parameters
- `options` (optional): Git command options

#### Returns
- `Promise<string | null>`: Current branch name, or null if detached HEAD

#### Implementation
```bash
git branch --show-current
```

#### Error Handling
- Returns `null` for detached HEAD
- Throws `ArashiError` if not in a git repository

#### Example
```typescript
const branch = await getCurrentBranch();
// Returns: 'feature/123'

// Detached HEAD
const detached = await getCurrentBranch();
// Returns: null
```

---

## Worktree Operations

### `createWorktree`

Create a new git worktree.

#### Signature
```typescript
async function createWorktree(
  path: string,
  branch: string,
  options?: CreateWorktreeOptions
): Promise<WorktreeInfo>

interface CreateWorktreeOptions extends GitCommandOptions {
  base?: string;      // Base branch/commit to branch from
  force?: boolean;    // Force creation (overwrite existing)
  detach?: boolean;   // Create detached HEAD worktree
  checkout?: boolean; // Checkout files (default: true)
}
```

#### Parameters
- `path`: Absolute or relative path for new worktree
- `branch`: Branch name to create
- `options` (optional): Creation options

#### Returns
- `Promise<WorktreeInfo>`: Information about created worktree

#### Implementation
```bash
# Standard creation
git worktree add -b <branch> <path> <base>

# With force
git worktree add -B <branch> <path> <base>

# Detached
git worktree add --detach <path> <commit>
```

#### Error Handling
- Throws `ArashiError` if branch already exists (without force)
  - Error code: `GIT_BRANCH_EXISTS`
- Throws `ArashiError` if path already exists
  - Error code: `GIT_WORKTREE_PATH_EXISTS`
- Throws `ArashiError` if base branch doesn't exist
  - Error code: `GIT_BRANCH_NOT_FOUND`

#### Example
```typescript
const worktree = await createWorktree(
  '.arashi/123',
  'feature/123',
  { base: 'main' }
);
// Returns: {
//   path: '/Users/user/project/.arashi/123',
//   branch: 'feature/123',
//   commit: 'abc123...',
//   bare: false,
//   detached: false,
//   prunable: false
// }
```

#### Tests
```typescript
describe('createWorktree', () => {
  it('should create worktree with new branch', async () => {});
  it('should create from base branch', async () => {});
  it('should force overwrite with --force', async () => {});
  it('should throw on duplicate branch', async () => {});
  it('should throw on existing path', async () => {});
  it('should create detached worktree', async () => {});
});
```

---

### `removeWorktree`

Remove a git worktree.

#### Signature
```typescript
async function removeWorktree(
  path: string,
  options?: RemoveWorktreeOptions
): Promise<void>

interface RemoveWorktreeOptions extends GitCommandOptions {
  force?: boolean;  // Force removal even with changes
}
```

#### Parameters
- `path`: Path to worktree to remove
- `options` (optional): Removal options

#### Returns
- `Promise<void>`

#### Implementation
```bash
# Standard removal
git worktree remove <path>

# Force removal
git worktree remove --force <path>
```

#### Error Handling
- Throws `ArashiError` if worktree has uncommitted changes (without force)
  - Error code: `GIT_WORKTREE_DIRTY`
- Throws `ArashiError` if worktree doesn't exist
  - Error code: `GIT_WORKTREE_NOT_FOUND`

#### Example
```typescript
await removeWorktree('.arashi/123');
// Worktree removed

await removeWorktree('.arashi/123', { force: true });
// Force removed even with changes
```

---

### `listWorktrees`

List all git worktrees.

#### Signature
```typescript
async function listWorktrees(
  options?: GitCommandOptions
): Promise<WorktreeInfo[]>
```

#### Parameters
- `options` (optional): Git command options

#### Returns
- `Promise<WorktreeInfo[]>`: Array of worktree information

#### Implementation
```bash
git worktree list --porcelain
```

#### Output Parsing
```
worktree /Users/user/project
HEAD abc123def456
branch refs/heads/main

worktree /Users/user/project/.arashi/123
HEAD 789ghi012jkl
branch refs/heads/feature/123
```

Parse into:
```typescript
[
  {
    path: '/Users/user/project',
    branch: 'main',
    commit: 'abc123def456',
    bare: false,
    detached: false,
    prunable: false
  },
  {
    path: '/Users/user/project/.arashi/123',
    branch: 'feature/123',
    commit: '789ghi012jkl',
    bare: false,
    detached: false,
    prunable: false
  }
]
```

#### Error Handling
- Returns empty array if no worktrees
- Throws `ArashiError` if not in a git repository

#### Example
```typescript
const worktrees = await listWorktrees();
// Returns: WorktreeInfo[]
```

---

### `pruneWorktrees`

Remove stale worktree administrative files.

#### Signature
```typescript
async function pruneWorktrees(
  options?: PruneWorktreesOptions
): Promise<string[]>

interface PruneWorktreesOptions extends GitCommandOptions {
  dryRun?: boolean;  // Don't actually prune, just show what would be pruned
}
```

#### Parameters
- `options` (optional): Prune options

#### Returns
- `Promise<string[]>`: Array of pruned worktree paths

#### Implementation
```bash
# Dry run
git worktree prune --dry-run --verbose

# Actual prune
git worktree prune --verbose
```

#### Example
```typescript
const pruned = await pruneWorktrees({ dryRun: true });
// Returns: ['/Users/user/project/.arashi/old-worktree']
```

---

## Branch Operations

### `branchExists`

Check if a branch exists (local or remote).

#### Signature
```typescript
async function branchExists(
  branch: string,
  options?: BranchExistsOptions
): Promise<boolean>

interface BranchExistsOptions extends GitCommandOptions {
  remote?: string;  // Check remote branch (e.g., 'origin')
  all?: boolean;    // Check both local and remote
}
```

#### Parameters
- `branch`: Branch name to check
- `options` (optional): Check options

#### Returns
- `Promise<boolean>`: True if branch exists

#### Implementation
```bash
# Local branch
git show-ref --verify --quiet refs/heads/<branch>

# Remote branch
git show-ref --verify --quiet refs/remotes/<remote>/<branch>
```

#### Example
```typescript
const exists = await branchExists('feature/123');
// Returns: true

const remoteExists = await branchExists('feature/123', { remote: 'origin' });
// Returns: false
```

---

### `createBranch`

Create a new branch.

#### Signature
```typescript
async function createBranch(
  branch: string,
  options?: CreateBranchOptions
): Promise<BranchInfo>

interface CreateBranchOptions extends GitCommandOptions {
  base?: string;      // Base branch/commit (default: HEAD)
  checkout?: boolean; // Checkout after creation (default: false)
  force?: boolean;    // Force creation (overwrite existing)
  track?: string;     // Set upstream tracking branch
}
```

#### Parameters
- `branch`: Branch name to create
- `options` (optional): Creation options

#### Returns
- `Promise<BranchInfo>`: Information about created branch

#### Implementation
```bash
# Create branch
git branch <branch> <base>

# Create and checkout
git checkout -b <branch> <base>

# Force create
git branch -f <branch> <base>

# With tracking
git branch --track <branch> <upstream>
```

#### Error Handling
- Throws `ArashiError` if branch exists (without force)
  - Error code: `GIT_BRANCH_EXISTS`
- Throws `ArashiError` if base doesn't exist
  - Error code: `GIT_COMMIT_NOT_FOUND`

#### Example
```typescript
const branch = await createBranch('feature/123', {
  base: 'main',
  track: 'origin/main'
});
```

---

### `deleteBranch`

Delete a branch.

#### Signature
```typescript
async function deleteBranch(
  branch: string,
  options?: DeleteBranchOptions
): Promise<void>

interface DeleteBranchOptions extends GitCommandOptions {
  force?: boolean;  // Force deletion even if not fully merged
  remote?: string;  // Delete remote branch
}
```

#### Parameters
- `branch`: Branch name to delete
- `options` (optional): Deletion options

#### Returns
- `Promise<void>`

#### Implementation
```bash
# Delete local branch
git branch -d <branch>

# Force delete local branch
git branch -D <branch>

# Delete remote branch
git push <remote> --delete <branch>
```

#### Error Handling
- Throws `ArashiError` if branch doesn't exist
  - Error code: `GIT_BRANCH_NOT_FOUND`
- Throws `ArashiError` if branch not fully merged (without force)
  - Error code: `GIT_BRANCH_NOT_MERGED`
- Throws `ArashiError` if trying to delete current branch
  - Error code: `GIT_BRANCH_CHECKED_OUT`

#### Example
```typescript
await deleteBranch('feature/123');
// Branch deleted

await deleteBranch('feature/456', { force: true });
// Force deleted unmerged branch

await deleteBranch('feature/789', { remote: 'origin' });
// Deleted remote branch
```

---

### `listBranches`

List all branches.

#### Signature
```typescript
async function listBranches(
  options?: ListBranchesOptions
): Promise<BranchInfo[]>

interface ListBranchesOptions extends GitCommandOptions {
  remote?: string;   // List remote branches
  all?: boolean;     // List all branches (local + remote)
  merged?: string;   // Only branches merged into specified branch
  noMerged?: string; // Only branches not merged into specified branch
}
```

#### Parameters
- `options` (optional): List options

#### Returns
- `Promise<BranchInfo[]>`: Array of branch information

#### Implementation
```bash
git branch --format='%(refname:short)|%(objectname:short)|%(upstream:short)|%(upstream:track)' --list
```

#### Output Parsing
```
main|abc123|origin/main|[ahead 2, behind 1]
feature/123|def456||
```

Parse into:
```typescript
[
  {
    name: 'main',
    commit: 'abc123',
    upstream: 'origin/main',
    ahead: 2,
    behind: 1,
    current: true
  },
  {
    name: 'feature/123',
    commit: 'def456',
    upstream: undefined,
    ahead: 0,
    behind: 0,
    current: false
  }
]
```

#### Example
```typescript
const branches = await listBranches();
// Returns: BranchInfo[]

const remoteBranches = await listBranches({ remote: 'origin' });
// Returns: BranchInfo[] (remote branches only)
```

---

## Remote Operations

### `fetchLatest`

Fetch latest changes from remote.

#### Signature
```typescript
async function fetchLatest(
  options?: FetchOptions
): Promise<void>

interface FetchOptions extends GitCommandOptions {
  remote?: string;   // Remote name (default: 'origin')
  branch?: string;   // Specific branch to fetch
  prune?: boolean;   // Prune deleted remote branches (default: true)
  tags?: boolean;    // Fetch tags (default: true)
  depth?: number;    // Shallow fetch depth
}
```

#### Parameters
- `options` (optional): Fetch options

#### Returns
- `Promise<void>`

#### Implementation
```bash
# Fetch all
git fetch <remote> --prune --tags

# Fetch specific branch
git fetch <remote> <branch>

# Shallow fetch
git fetch <remote> --depth=<depth>
```

#### Error Handling
- Throws `ArashiError` if remote doesn't exist
  - Error code: `GIT_REMOTE_NOT_FOUND`
- Throws `ArashiError` on network errors
  - Error code: `GIT_NETWORK_ERROR`

#### Example
```typescript
await fetchLatest();
// Fetched from origin

await fetchLatest({ remote: 'upstream', branch: 'main' });
// Fetched specific branch from upstream
```

---

### `setUpstreamTracking`

Set upstream tracking branch.

#### Signature
```typescript
async function setUpstreamTracking(
  branch: string,
  upstream: string,
  options?: GitCommandOptions
): Promise<void>
```

#### Parameters
- `branch`: Local branch name
- `upstream`: Upstream branch (e.g., 'origin/main')
- `options` (optional): Git command options

#### Returns
- `Promise<void>`

#### Implementation
```bash
git branch --set-upstream-to=<upstream> <branch>
```

#### Error Handling
- Throws `ArashiError` if branch doesn't exist
  - Error code: `GIT_BRANCH_NOT_FOUND`
- Throws `ArashiError` if upstream doesn't exist
  - Error code: `GIT_UPSTREAM_NOT_FOUND`

#### Example
```typescript
await setUpstreamTracking('feature/123', 'origin/main');
// Set upstream tracking
```

---

### `listRemotes`

List all configured remotes.

#### Signature
```typescript
async function listRemotes(
  options?: ListRemotesOptions
): Promise<RemoteInfo[]>

interface ListRemotesOptions extends GitCommandOptions {
  verbose?: boolean;  // Include URLs
}
```

#### Parameters
- `options` (optional): List options

#### Returns
- `Promise<RemoteInfo[]>`: Array of remote information

#### Implementation
```bash
git remote -v
```

#### Output Parsing
```
origin  https://github.com/user/repo.git (fetch)
origin  https://github.com/user/repo.git (push)
upstream  https://github.com/upstream/repo.git (fetch)
upstream  https://github.com/upstream/repo.git (push)
```

Parse into:
```typescript
[
  {
    name: 'origin',
    url: 'https://github.com/user/repo.git',
    fetch: 'https://github.com/user/repo.git',
    push: 'https://github.com/user/repo.git'
  },
  {
    name: 'upstream',
    url: 'https://github.com/upstream/repo.git',
    fetch: 'https://github.com/upstream/repo.git',
    push: 'https://github.com/upstream/repo.git'
  }
]
```

#### Example
```typescript
const remotes = await listRemotes({ verbose: true });
// Returns: RemoteInfo[]
```

---

## Status Operations

### `getStatus`

Get repository status.

#### Signature
```typescript
async function getStatus(
  options?: GetStatusOptions
): Promise<RepositoryStatus>

interface GetStatusOptions extends GitCommandOptions {
  path?: string;  // Specific path to check
}
```

#### Parameters
- `options` (optional): Status options

#### Returns
- `Promise<RepositoryStatus>`: Repository status information

#### Implementation
```bash
git status --porcelain=v2 --branch
```

#### Output Parsing
```
# branch.oid abc123
# branch.head main
# branch.upstream origin/main
# branch.ab +2 -1
1 M. N... 100644 100644 100644 abc123 def456 file1.txt
1 .M N... 100644 100644 100644 abc123 def456 file2.txt
? untracked.txt
```

Parse into:
```typescript
{
  branch: 'main',
  ahead: 2,
  behind: 1,
  staged: [
    { path: 'file1.txt', status: 'modified' }
  ],
  unstaged: [
    { path: 'file2.txt', status: 'modified' }
  ],
  untracked: ['untracked.txt'],
  conflicted: []
}
```

#### Example
```typescript
const status = await getStatus();
// Returns: RepositoryStatus
```

---

### `hasUncommittedChanges`

Check if repository has uncommitted changes.

#### Signature
```typescript
async function hasUncommittedChanges(
  options?: GitCommandOptions
): Promise<boolean>
```

#### Parameters
- `options` (optional): Git command options

#### Returns
- `Promise<boolean>`: True if there are uncommitted changes

#### Implementation
```bash
git status --porcelain
```

#### Example
```typescript
const hasChanges = await hasUncommittedChanges();
// Returns: true
```

---

## Utility Functions

### `executeGitCommand`

Low-level git command execution (internal use).

#### Signature
```typescript
async function executeGitCommand(
  args: string[],
  options?: GitCommandOptions
): Promise<GitCommandResult>
```

#### Parameters
- `args`: Git command arguments
- `options` (optional): Execution options

#### Returns
- `Promise<GitCommandResult>`: Command execution result

#### Error Handling
- Throws `ArashiError` on command failure
- Captures stdout, stderr, and exit code
- Includes command execution time

#### Example
```typescript
const result = await executeGitCommand(['status', '--porcelain']);
// Returns: {
//   stdout: 'M file.txt\n',
//   stderr: '',
//   exitCode: 0,
//   command: 'git status --porcelain',
//   duration: 45
// }
```

---

### `parseWorktreeList`

Parse git worktree list output.

#### Signature
```typescript
function parseWorktreeList(output: string): WorktreeInfo[]
```

#### Parameters
- `output`: Output from `git worktree list --porcelain`

#### Returns
- `WorktreeInfo[]`: Parsed worktree information

#### Example
```typescript
const output = `
worktree /path/to/worktree
HEAD abc123
branch refs/heads/main
`;

const worktrees = parseWorktreeList(output);
// Returns: WorktreeInfo[]
```

---

### `parseBranchList`

Parse git branch list output.

#### Signature
```typescript
function parseBranchList(output: string): BranchInfo[]
```

#### Parameters
- `output`: Output from `git branch --format=...`

#### Returns
- `BranchInfo[]`: Parsed branch information

---

### `parseStatus`

Parse git status output.

#### Signature
```typescript
function parseStatus(output: string): RepositoryStatus
```

#### Parameters
- `output`: Output from `git status --porcelain=v2 --branch`

#### Returns
- `RepositoryStatus`: Parsed status information

---

## Error Codes

All git operations use standardized error codes:

```typescript
enum GitErrorCode {
  // Repository errors
  GIT_NOT_REPOSITORY = 'GIT_NOT_REPOSITORY',
  GIT_NO_BRANCHES = 'GIT_NO_BRANCHES',
  
  // Worktree errors
  GIT_WORKTREE_EXISTS = 'GIT_WORKTREE_EXISTS',
  GIT_WORKTREE_NOT_FOUND = 'GIT_WORKTREE_NOT_FOUND',
  GIT_WORKTREE_PATH_EXISTS = 'GIT_WORKTREE_PATH_EXISTS',
  GIT_WORKTREE_DIRTY = 'GIT_WORKTREE_DIRTY',
  
  // Branch errors
  GIT_BRANCH_EXISTS = 'GIT_BRANCH_EXISTS',
  GIT_BRANCH_NOT_FOUND = 'GIT_BRANCH_NOT_FOUND',
  GIT_BRANCH_NOT_MERGED = 'GIT_BRANCH_NOT_MERGED',
  GIT_BRANCH_CHECKED_OUT = 'GIT_BRANCH_CHECKED_OUT',
  
  // Remote errors
  GIT_REMOTE_NOT_FOUND = 'GIT_REMOTE_NOT_FOUND',
  GIT_UPSTREAM_NOT_FOUND = 'GIT_UPSTREAM_NOT_FOUND',
  GIT_NETWORK_ERROR = 'GIT_NETWORK_ERROR',
  
  // General errors
  GIT_COMMIT_NOT_FOUND = 'GIT_COMMIT_NOT_FOUND',
  GIT_COMMAND_FAILED = 'GIT_COMMAND_FAILED',
  GIT_PERMISSION_DENIED = 'GIT_PERMISSION_DENIED',
  GIT_TIMEOUT = 'GIT_TIMEOUT',
}
```

---

## Testing Strategy

### Unit Tests

Each function requires:
- Success case tests
- Error case tests
- Edge case tests
- Output parsing tests

### Test Doubles

Use test doubles for git commands:

```typescript
// Mock git command execution
jest.mock('./git-command', () => ({
  executeGitCommand: jest.fn()
}));

// Test with mocked output
mockExecuteGitCommand.mockResolvedValue({
  stdout: 'worktree /path\nHEAD abc123\nbranch refs/heads/main\n',
  stderr: '',
  exitCode: 0,
  command: 'git worktree list --porcelain',
  duration: 50
});

const worktrees = await listWorktrees();
expect(worktrees).toHaveLength(1);
```

### Integration Tests

Integration tests should:
- Use real git repositories (in temp directories)
- Test actual git command execution
- Verify file system state
- Test error scenarios with real git errors

---

## Platform Compatibility

### Windows
- Use forward slashes in paths
- Handle CRLF line endings
- Support Git Bash and Git for Windows

### macOS
- Handle case-insensitive file systems
- Support both Intel and Apple Silicon

### Linux
- Support various distributions
- Handle different git versions

---

## Performance Considerations

### Caching
- Cache repository root path
- Cache default branch name
- Cache remote information

### Batch Operations
- Batch multiple git commands when possible
- Use `git worktree list` once instead of multiple checks

### Timeouts
- Default timeout: 30 seconds
- Configurable per operation
- Longer timeouts for network operations

---

## Change Log

### Version 1.0.0 (2026-02-03)
- Initial API contract definition
- All git operations specified
- Error codes defined
- Testing strategy documented
