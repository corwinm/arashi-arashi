# Research Document: List Command

**Feature**: 001-list-command  
**Date**: 2026-02-06  
**Status**: Complete

## Overview

This document captures research findings and technical decisions for implementing the list command. All NEEDS CLARIFICATION items from the Technical Context have been resolved through analysis of existing arashi infrastructure and best practices for CLI output formatting.

---

## Research Area 1: Git Worktree Listing and Status Checking

### Decision: Use Existing Git Utility Library

**Chosen Solution**: Leverage `listWorktrees()` and `getStatus()` from `/specs/001-git-utility-lib/contracts/git-api.ts`

**Rationale**:
- The existing git utility library already provides `listWorktrees(repoPath: string): Promise<Worktree[]>` which returns structured data including path, branch, commit, and locked status
- The `getStatus(repoPath: string): Promise<StatusEntry[]>` function provides file-level status information (modified, added, deleted, untracked)
- These APIs handle cross-platform path concerns and git command parsing
- No need to re-implement git command execution or output parsing

**Implementation Details**:
1. Call `listWorktrees()` to get all worktrees for the main repository
2. For each worktree, call `getStatus()` to determine if there are uncommitted changes
3. Status summary: count files with `worktreeStatus !== ' '` or `indexStatus !== ' '`
4. For verbose mode, use `isGitRepository()` to discover nested sub-repositories
5. Recursively call `listWorktrees()` and `getStatus()` for each sub-repository

**Alternatives Considered**:
- **Direct git command execution**: Rejected because existing git utility library already handles command execution, error handling, and cross-platform compatibility
- **Read `.git/worktrees/` directory directly**: Rejected because git's internal format may change and requires re-implementing parsing logic

**Example Usage**:
```typescript
import { listWorktrees, getStatus } from '../lib/git.ts';

const worktrees = await listWorktrees('/path/to/repo');
for (const worktree of worktrees) {
  const status = await getStatus(worktree.path);
  const hasChanges = status.length > 0;
  console.log(`${worktree.path}: ${worktree.branch} [${hasChanges ? 'modified' : 'clean'}]`);
}
```

**Performance Considerations**:
- `listWorktrees()` is a single git command: `git worktree list --porcelain`
- `getStatus()` per worktree: `git status --porcelain` (fast, even for large repos)
- For 50 worktrees: ~51 git commands total (1 list + 50 status) - well within < 2 second target
- Verbose mode with sub-repos may require additional status checks, but still within < 5 second target

---

## Research Area 2: JSON Output Schema Design

### Decision: Simple, Flat JSON Array with Nested Sub-Repositories

**Chosen Solution**: JSON output format with top-level worktrees array and optional nested `subRepositories` array

**Rationale**:
- Flat structure is easy to parse with jq, grep, and other command-line tools
- Mirrors the structure returned by `listWorktrees()` API
- Compatible with fzf for interactive selection (can extract paths with `jq -r '.[].path'`)
- Extensible for future metadata (tags, custom fields, etc.)

**Schema**:
```typescript
interface ListOutputItem {
  path: string;              // Absolute path to worktree
  branch: string | null;     // Branch name (null if detached HEAD)
  commit: string;            // Short commit SHA
  locked: boolean;           // Whether worktree is locked
  lockReason?: string;       // Lock reason (if locked)
  hasChanges: boolean;       // Whether uncommitted changes exist
  isMain: boolean;           // true for main worktree, false for linked worktrees
  subRepositories?: SubRepoInfo[];  // Only present in verbose mode
}

interface SubRepoInfo {
  relativePath: string;      // Path relative to parent worktree
  branch: string | null;
  commit: string;
  hasChanges: boolean;
}

type ListOutput = ListOutputItem[];
```

**Example JSON Output**:
```json
[
  {
    "path": "/Users/user/projects/myrepo",
    "branch": "main",
    "commit": "a1b2c3d",
    "locked": false,
    "hasChanges": false,
    "isMain": true
  },
  {
    "path": "/Users/user/projects/myrepo-worktrees/feature-branch",
    "branch": "feature-branch",
    "commit": "e4f5g6h",
    "locked": false,
    "hasChanges": true,
    "isMain": false,
    "subRepositories": [
      {
        "relativePath": "repos/frontend",
        "branch": "feature-branch",
        "commit": "i7j8k9l",
        "hasChanges": false
      }
    ]
  }
]
```

**Alternatives Considered**:
- **Nested object by branch name**: Rejected because branch names may contain special characters, making jq queries more complex
- **CSV format**: Rejected because harder to represent nested sub-repositories and doesn't support complex data structures
- **Line-delimited JSON (JSONL)**: Rejected because less common for command-line tools and harder to parse as a complete list

**Integration Examples**:

```bash
# fzf selection for tmux workspace switching
arashi list --json | jq -r '.[].path' | fzf

# Filter worktrees with changes
arashi list --json | jq '.[] | select(.hasChanges == true)'

# Count total worktrees
arashi list --json | jq 'length'

# Get all sub-repository paths
arashi list --json --verbose | jq -r '.[] | .subRepositories[]? | .relativePath'
```

---

## Research Area 3: Terminal Output Formatting Patterns

### Decision: Tabular Layout with Color-Coded Status Indicators

**Chosen Solution**: Use chalk for colors and structured table format with status icons

**Rationale**:
- Existing arashi infrastructure uses chalk for colored output (per AGENTS.md)
- Tabular format provides clear visual hierarchy and alignment
- Status icons (✓, ✗, 🔒) provide quick visual indicators
- Compatible with existing logger utilities (ora spinners for slow operations)

**Output Format**:
```
Worktrees (3 total)

PATH                                    BRANCH           STATUS    
────────────────────────────────────────────────────────────────
/Users/user/projects/myrepo             main             ✓ clean   
/Users/user/worktrees/feature-123       feature-123      ✗ modified
/Users/user/worktrees/hotfix-456        hotfix-456       🔒 locked  

Legend: ✓ = clean, ✗ = modified, 🔒 = locked
```

**Verbose Mode with Sub-Repositories**:
```
Worktrees (2 total)

PATH: /Users/user/projects/myrepo
BRANCH: main
STATUS: ✓ clean
TYPE: Main worktree

PATH: /Users/user/worktrees/feature-123
BRANCH: feature-123
STATUS: ✗ modified
TYPE: Linked worktree
SUB-REPOSITORIES:
  ├── repos/frontend (feature-123) - ✓ clean
  ├── repos/backend (feature-123) - ✗ modified
  └── repos/shared (feature-123) - ✓ clean
```

**Color Scheme** (using chalk):
- Path: `chalk.cyan`
- Branch: `chalk.yellow`
- Clean status: `chalk.green`
- Modified status: `chalk.red`
- Locked status: `chalk.gray`
- Headers: `chalk.bold`

**Implementation Details**:
```typescript
import chalk from 'chalk';
import { log } from '../lib/logger.ts';

function formatWorktreeTable(worktrees: Worktree[]): string {
  const header = `${chalk.bold('PATH').padEnd(40)} ${chalk.bold('BRANCH').padEnd(20)} ${chalk.bold('STATUS')}`;
  const separator = '─'.repeat(68);
  
  const rows = worktrees.map(wt => {
    const path = chalk.cyan(wt.path.padEnd(40));
    const branch = chalk.yellow((wt.branch || 'detached').padEnd(20));
    const status = wt.locked 
      ? chalk.gray('🔒 locked')
      : wt.hasChanges 
        ? chalk.red('✗ modified')
        : chalk.green('✓ clean');
    
    return `${path} ${branch} ${status}`;
  });
  
  return [header, separator, ...rows].join('\n');
}
```

**Alternatives Considered**:
- **JSON-only output**: Rejected because human-readable output is required for interactive use
- **Plain text without colors**: Rejected because colors significantly improve readability and scanning
- **Tree view by default**: Rejected because too verbose for default output; verbose mode provides tree view for sub-repos

**No Worktrees Case**:
```
No additional worktrees found.

The main repository is at: /Users/user/projects/myrepo

To create a worktree, run:
  arashi create <branch-name>
```

---

## Research Area 4: Sub-Repository Discovery in Verbose Mode

### Decision: Recursive Git Repository Detection Using Filesystem Utilities

**Chosen Solution**: Use existing filesystem utilities to discover nested `.git` directories

**Rationale**:
- Arashi already has filesystem utilities in `src/lib/filesystem.ts` (per AGENTS.md and project structure)
- Can use `isGitRepository()` from git utility library to validate discovered directories
- Avoids relying on git submodule commands (sub-repos may not be configured as submodules)
- Provides flexibility for users with various nested repository patterns

**Implementation Strategy**:
1. For each worktree, recursively scan directories for `.git` entries
2. Use `isGitRepository(path)` to validate each discovered directory
3. Skip the parent worktree's `.git` directory
4. Call `getCurrentBranch()` and `getStatus()` for each sub-repository
5. Return relative paths to maintain portability

**Discovery Pseudocode**:
```typescript
async function discoverSubRepositories(worktreePath: string): Promise<SubRepoInfo[]> {
  const subRepos: SubRepoInfo[] = [];
  
  // Recursively find all .git directories (excluding worktree's own .git)
  const gitDirs = await findGitDirectories(worktreePath, { excludeRoot: true });
  
  for (const gitDir of gitDirs) {
    const repoPath = path.dirname(gitDir);
    
    if (isGitRepository(repoPath)) {
      const branch = await getCurrentBranch(repoPath);
      const status = await getStatus(repoPath);
      const relativePath = path.relative(worktreePath, repoPath);
      
      subRepos.push({
        relativePath,
        branch,
        commit: await getCommitSha(repoPath),
        hasChanges: status.length > 0
      });
    }
  }
  
  return subRepos;
}
```

**Performance Considerations**:
- Filesystem traversal limited by `--max-depth` option (default: 3 levels)
- For 20 sub-repositories across 50 worktrees: ~1000 additional operations
- Most time spent in git status checks (already optimized)
- Target < 5 seconds for verbose mode achievable with parallel operations

**Alternatives Considered**:
- **Git submodule commands only**: Rejected because users may have nested repos that aren't configured as submodules
- **Manual configuration**: Rejected because auto-discovery is a core arashi principle (Constitution Principle V: Minimalist Configuration)
- **No sub-repository support**: Rejected because feature spec explicitly requires sub-repository visibility (User Story 2, P2 priority)

---

## Research Area 5: Performance Optimization for Large Worktree Sets

### Decision: Parallel Git Operations with Concurrency Control

**Chosen Solution**: Use Promise.all() with concurrency limiting for git status checks

**Rationale**:
- Git operations are I/O bound and can run in parallel safely (read-only)
- Constitution Principle X requires parallel operations where safe
- Bun runtime supports efficient concurrent async operations
- Need concurrency limit to avoid overwhelming system resources

**Implementation Pattern**:
```typescript
async function getWorktreeStatuses(worktrees: Worktree[]): Promise<WorktreeWithStatus[]> {
  const CONCURRENCY = 10; // Max parallel git operations
  
  // Process in batches of CONCURRENCY
  const results: WorktreeWithStatus[] = [];
  for (let i = 0; i < worktrees.length; i += CONCURRENCY) {
    const batch = worktrees.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (wt) => {
        const status = await getStatus(wt.path);
        return { ...wt, hasChanges: status.length > 0 };
      })
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

**Benchmarking Plan**:
- Test with 10, 25, 50 worktrees
- Measure with and without concurrency
- Verify < 2 second target for 50 worktrees
- Adjust CONCURRENCY based on results

**Alternatives Considered**:
- **Sequential operations**: Rejected because Constitution requires parallel operations for performance
- **Unlimited concurrency**: Rejected because may overwhelm file system or git locks
- **Worker threads**: Rejected because Bun's async runtime is sufficient for I/O-bound operations

---

## Summary of Resolved Clarifications

| Original Question | Resolution |
|-------------------|------------|
| How to parse git worktree list output? | Use existing `listWorktrees()` API from git utility library |
| How to check worktree status efficiently? | Use existing `getStatus()` API; parallelize across worktrees |
| What JSON schema for command-line integration? | Flat array of worktree objects with optional nested sub-repos |
| How to format terminal output? | Tabular layout with chalk colors and status icons |
| How to discover sub-repositories? | Recursive filesystem scan with `isGitRepository()` validation |
| How to achieve < 2 second performance? | Parallel git operations with concurrency limiting |

---

## Dependencies Confirmed

All required dependencies are already available in the arashi project:

- ✅ **Bun runtime**: Built-in spawn, file system, path APIs
- ✅ **chalk**: Terminal colors (already in use)
- ✅ **ora**: Spinners (already in use for progress)
- ✅ **Git utility library**: `/specs/001-git-utility-lib/contracts/git-api.ts`
- ✅ **Config management**: `/specs/001-config-management/contracts/config-api.ts`
- ✅ **Filesystem utilities**: Referenced in AGENTS.md

No new external dependencies required.

---

## Open Questions for Phase 1 Design

These questions will be addressed during data model and contract design:

1. Should locked worktrees be included in default output or require a flag?
   - **Recommendation**: Include by default with visual indicator; Constitution Principle IV requires clear, informative output
   
2. Should detached HEAD worktrees show commit SHA or "detached HEAD" in branch column?
   - **Recommendation**: Show "detached HEAD" in branch column, commit SHA in separate column
   
3. Should sub-repository discovery respect `.gitignore` patterns?
   - **Recommendation**: No; users may want visibility into ignored nested repos
   
4. Should JSON output include main repository information?
   - **Recommendation**: Yes; include with `isMain: true` flag to differentiate from linked worktrees

---

**Status**: ✅ All research complete. Ready for Phase 1 design.
