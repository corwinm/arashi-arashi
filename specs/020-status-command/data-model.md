# Data Model: Status Command

**Feature**: 020-status-command  
**Date**: 2026-02-07  
**Purpose**: Define data structures for repository status information

## Entity Definitions

### StatusOptions

Command-line options for the status command.

**Fields**:
- `verbose`: boolean - Show full git status output for each repository
- `short`: boolean - Show one-line summary per repository

**Validation Rules**:
- `verbose` and `short` are mutually exclusive (if both provided, error)
- Both default to `false`

**State Transitions**: N/A (immutable options)

---

### GitFileStatus

Represents the status of a single file in a git repository.

**Fields**:
- `path`: string - Relative path to the file
- `stagingStatus`: string - Status in staging area (one character: ' ', 'M', 'A', 'D', 'R', 'C')
- `workingStatus`: string - Status in working tree (one character: ' ', 'M', 'D', '?')
- `isStaged`: boolean - Derived: true if stagingStatus !== ' '
- `isModified`: boolean - Derived: true if workingStatus === 'M'
- `isUntracked`: boolean - Derived: true if workingStatus === '?'

**Validation Rules**:
- `path` must be non-empty string
- `stagingStatus` must be valid git status code
- `workingStatus` must be valid git status code
- At least one of `stagingStatus` or `workingStatus` must be non-space

**Relationships**: Many-to-one with RepoStatus

---

### BranchTrackingInfo

Branch tracking information relative to remote.

**Fields**:
- `localBranch`: string - Name of the local branch
- `remoteBranch`: string | null - Name of the remote tracking branch (null if no remote)
- `ahead`: number - Number of commits ahead of remote (0 if no remote)
- `behind`: number - Number of commits behind remote (0 if no remote)
- `isDiverged`: boolean - Derived: true if ahead > 0 && behind > 0
- `isDetached`: boolean - True if HEAD is detached

**Validation Rules**:
- `localBranch` required unless `isDetached` is true
- `ahead` >= 0
- `behind` >= 0
- If `remoteBranch` is null, `ahead` and `behind` must be 0

**Relationships**: One-to-one with RepoStatus

---

### RepoStatus

Complete status information for a single repository.

**Fields**:
- `name`: string - Repository name (from config)
- `path`: string - Absolute path to repository
- `branch`: BranchTrackingInfo - Branch and tracking information
- `files`: GitFileStatus[] - List of changed files
- `isClean`: boolean - Derived: true if files.length === 0
- `isDirty`: boolean - Derived: true if files.length > 0
- `error`: string | null - Error message if status check failed

**Computed Fields**:
- `stagedCount`: number - Count of staged files
- `unstagedCount`: number - Count of unstaged (modified) files
- `untrackedCount`: number - Count of untracked files

**Validation Rules**:
- `name` must be non-empty string
- `path` must be absolute path to existing directory
- If `error` is set, all other fields may be null/empty
- `isClean` and `isDirty` are mutually exclusive

**Relationships**: 
- One-to-many with GitFileStatus
- One-to-one with BranchTrackingInfo

**State Transitions**: N/A (snapshot data)

---

### StatusSummary

Aggregate status across all repositories in the workspace.

**Fields**:
- `repos`: RepoStatus[] - Status for all checked repositories
- `totalCount`: number - Derived: repos.length
- `cleanCount`: number - Derived: repos.filter(r => r.isClean).length
- `dirtyCount`: number - Derived: repos.filter(r => r.isDirty).length
- `errorCount`: number - Derived: repos.filter(r => r.error !== null).length
- `hasErrors`: boolean - Derived: errorCount > 0

**Validation Rules**:
- `repos` must be non-empty array
- `totalCount` = `cleanCount` + `dirtyCount` (repos with errors count toward dirty)

**Relationships**: One-to-many with RepoStatus

---

## Data Flow

```
Command Input (options)
        ↓
Load Config (workspace + repos)
        ↓
For each repo in parallel:
    Execute: git status --porcelain=v1 --branch
        ↓
    Parse output → GitFileStatus[]
        ↓
    Parse branch info → BranchTrackingInfo
        ↓
    Construct: RepoStatus
        ↓
Aggregate all → StatusSummary
        ↓
Format based on options (default/verbose/short)
        ↓
Display output
```

## Type Definitions

```typescript
// src/commands/status.ts or src/types/status.ts

export interface StatusOptions {
  verbose?: boolean;
  short?: boolean;
}

export interface GitFileStatus {
  path: string;
  stagingStatus: string;
  workingStatus: string;
}

export interface BranchTrackingInfo {
  localBranch: string;
  remoteBranch: string | null;
  ahead: number;
  behind: number;
  isDetached: boolean;
}

export interface RepoStatus {
  name: string;
  path: string;
  branch: BranchTrackingInfo;
  files: GitFileStatus[];
  error: string | null;
}

export interface StatusSummary {
  repos: RepoStatus[];
}

// Computed properties implemented as helper functions
export function isClean(status: RepoStatus): boolean {
  return status.files.length === 0 && !status.error;
}

export function isDirty(status: RepoStatus): boolean {
  return status.files.length > 0 || !!status.error;
}

export function getStagedCount(status: RepoStatus): number {
  return status.files.filter(f => f.stagingStatus !== ' ').length;
}

export function getUnstagedCount(status: RepoStatus): number {
  return status.files.filter(f => 
    f.workingStatus === 'M' && f.stagingStatus === ' '
  ).length;
}

export function getUntrackedCount(status: RepoStatus): number {
  return status.files.filter(f => f.workingStatus === '?').length;
}

export function getCleanCount(summary: StatusSummary): number {
  return summary.repos.filter(isClean).length;
}

export function getDirtyCount(summary: StatusSummary): number {
  return summary.repos.filter(isDirty).length;
}

export function getErrorCount(summary: StatusSummary): number {
  return summary.repos.filter(r => !!r.error).length;
}
```

## Example Data

### Clean Repository

```json
{
  "name": "arashi",
  "path": "/Users/dev/workspace/repos/arashi",
  "branch": {
    "localBranch": "main",
    "remoteBranch": "origin/main",
    "ahead": 0,
    "behind": 0,
    "isDetached": false
  },
  "files": [],
  "error": null
}
```

### Dirty Repository (with changes)

```json
{
  "name": "config-mgmt",
  "path": "/Users/dev/workspace/repos/config-mgmt",
  "branch": {
    "localBranch": "020-status-command",
    "remoteBranch": null,
    "ahead": 0,
    "behind": 0,
    "isDetached": false
  },
  "files": [
    {
      "path": "src/commands/status.ts",
      "stagingStatus": "A",
      "workingStatus": " "
    },
    {
      "path": "README.md",
      "stagingStatus": " ",
      "workingStatus": "M"
    },
    {
      "path": "test.txt",
      "stagingStatus": " ",
      "workingStatus": "?"
    }
  ],
  "error": null
}
```

### Repository with Error

```json
{
  "name": "broken-repo",
  "path": "/Users/dev/workspace/repos/broken-repo",
  "branch": {
    "localBranch": "",
    "remoteBranch": null,
    "ahead": 0,
    "behind": 0,
    "isDetached": false
  },
  "files": [],
  "error": "fatal: not a git repository"
}
```

### Complete Status Summary

```json
{
  "repos": [
    {
      "name": "arashi",
      "path": "/Users/dev/workspace/repos/arashi",
      "branch": { "localBranch": "main", "remoteBranch": "origin/main", "ahead": 0, "behind": 0, "isDetached": false },
      "files": [],
      "error": null
    },
    {
      "name": "config-mgmt",
      "path": "/Users/dev/workspace/repos/config-mgmt",
      "branch": { "localBranch": "feature", "remoteBranch": null, "ahead": 0, "behind": 0, "isDetached": false },
      "files": [
        { "path": "plan.md", "stagingStatus": "M", "workingStatus": " " }
      ],
      "error": null
    }
  ]
}
```

**Computed values**:
- `totalCount`: 2
- `cleanCount`: 1
- `dirtyCount`: 1
- `errorCount`: 0
