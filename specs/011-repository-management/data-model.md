# Data Model: Repository Management

**Last Updated**: 2026-02-04  
**Status**: Draft

## Overview

This document defines the core data structures for repository management functionality, including repository discovery, metadata, validation, and clone operations.

---

## Core Entities

### 1. Repository

Represents a git repository with its metadata and location information.

**Properties**:
```typescript
{
  name: string;              // Repository name (derived from directory name)
  path: string;              // Absolute filesystem path to repository root
  defaultBranch: string;     // Default branch name (main, master, develop, etc.)
  hasSetupScript: boolean;   // Whether repository contains a setup script
  setupScriptPath?: string;  // Path to setup script if present
  remoteUrl?: string;        // Primary remote URL (usually origin)
}
```

**Validation Rules**:
- `name` must be non-empty string
- `path` must be absolute path to valid directory
- `path` must contain a `.git` directory
- `defaultBranch` must be non-empty string
- `setupScriptPath` must be absolute path if provided
- `remoteUrl` must be valid git URL format if provided

**Relationships**:
- A Repository can appear in a `RepositoryDiscoveryResult`
- A Repository can have `RepositoryMetadata` (1:1)
- A Repository is the subject of a `CloneOperation` (1:1)
- A Repository can be referenced in `WorkspaceConfiguration` (many:1)

**Invariants**:
- Repository path must exist on filesystem
- Repository must have valid git structure
- If `hasSetupScript` is true, `setupScriptPath` must be provided

---

### 2. RepositoryDiscoveryResult

Represents the outcome of scanning a workspace directory for repositories.

**Properties**:
```typescript
{
  repositories: Repository[];     // Discovered repositories
  workspacePath: string;          // Path that was scanned
  scanDepth: number;              // Maximum depth that was scanned
  scannedDirectories: number;     // Total directories examined
  errors: DiscoveryError[];       // Non-fatal errors encountered
  duration: number;               // Time taken in milliseconds
}
```

**Validation Rules**:
- `repositories` must be valid array (can be empty)
- `workspacePath` must be absolute path to valid directory
- `scanDepth` must be positive integer
- `scannedDirectories` must be non-negative integer
- `duration` must be non-negative number

**Relationships**:
- Contains multiple `Repository` instances
- Contains multiple `DiscoveryError` instances

**Invariants**:
- All repositories must be within `workspacePath` (or subdirectories)
- All repositories must be within `scanDepth` levels from workspace root
- `scannedDirectories` >= `repositories.length`

---

### 3. DiscoveryError

Represents a non-fatal error encountered during repository discovery.

**Properties**:
```typescript
{
  path: string;           // Path where error occurred
  message: string;        // Error description
  code: ErrorCode;        // Categorized error type
  cause?: Error;          // Original error if applicable
}
```

**Validation Rules**:
- `path` must be non-empty string
- `message` must be non-empty string
- `code` must be valid `ErrorCode` enum value

**Error Codes**:
```typescript
enum ErrorCode {
  PERMISSION_DENIED = "PERMISSION_DENIED",
  NOT_A_DIRECTORY = "NOT_A_DIRECTORY",
  INVALID_GIT_REPO = "INVALID_GIT_REPO",
  SYMLINK_LOOP = "SYMLINK_LOOP",
  IO_ERROR = "IO_ERROR"
}
```

---

### 4. RepositoryMetadata

Represents comprehensive metadata about a repository's state.

**Properties**:
```typescript
{
  repository: Repository;          // Basic repository information
  currentBranch?: string;          // Current checked-out branch
  localBranches: string[];         // All local branches
  remoteBranches: string[];        // All remote branches
  lastCommit?: CommitInfo;         // Most recent commit information
  status: RepositoryStatus;        // Working tree status
  remotes: Remote[];               // Configured remotes
  stashCount: number;              // Number of stashed changes
  tags: string[];                  // Repository tags
}
```

**Validation Rules**:
- `repository` must be valid `Repository` instance
- `localBranches` and `remoteBranches` must be valid arrays (can be empty)
- `stashCount` must be non-negative integer
- `tags` must be valid array (can be empty)

**Relationships**:
- Associated with exactly one `Repository` (1:1)
- Contains one `RepositoryStatus` (1:1)
- Contains multiple `Remote` instances
- Contains optional `CommitInfo` (0:1)

---

### 5. CommitInfo

Represents information about a git commit.

**Properties**:
```typescript
{
  hash: string;         // Commit SHA-1 hash
  shortHash: string;    // Abbreviated commit hash (7 characters)
  author: string;       // Commit author name
  email: string;        // Commit author email
  date: Date;           // Commit date
  message: string;      // Commit message (first line)
  fullMessage: string;  // Complete commit message
}
```

**Validation Rules**:
- `hash` must be 40-character hexadecimal string
- `shortHash` must be 7-character hexadecimal string
- `author` must be non-empty string
- `email` must be valid email format
- `date` must be valid Date object
- `message` must be non-empty string

---

### 6. RepositoryStatus

Represents the working tree status of a repository.

**Properties**:
```typescript
{
  isClean: boolean;              // No uncommitted changes
  modifiedFiles: number;         // Count of modified files
  untrackedFiles: number;        // Count of untracked files
  stagedFiles: number;           // Count of staged files
  conflictedFiles: number;       // Count of conflicted files
  ahead: number;                 // Commits ahead of remote
  behind: number;                // Commits behind remote
}
```

**Validation Rules**:
- All numeric fields must be non-negative integers
- If `isClean` is true, all counts should be 0

**Invariants**:
- `isClean === (modifiedFiles === 0 && untrackedFiles === 0 && stagedFiles === 0 && conflictedFiles === 0)`

---

### 7. Remote

Represents a git remote configuration.

**Properties**:
```typescript
{
  name: string;      // Remote name (e.g., "origin")
  url: string;       // Remote URL
  type: RemoteType;  // Fetch or push
}
```

**Validation Rules**:
- `name` must be non-empty string
- `url` must be valid git URL format
- `type` must be valid `RemoteType` enum value

**Remote Types**:
```typescript
enum RemoteType {
  FETCH = "fetch",
  PUSH = "push"
}
```

---

### 8. WorkspaceConfiguration

Represents the expected repository structure of a workspace.

**Properties**:
```typescript
{
  repositories: RepositoryConfig[];  // Expected repositories
  workspacePath: string;              // Workspace root path
}
```

**Validation Rules**:
- `repositories` must be non-empty array
- `workspacePath` must be absolute path to valid directory
- All repository paths must be relative to workspace path or absolute

**Relationships**:
- Contains multiple `RepositoryConfig` instances

---

### 9. RepositoryConfig

Represents configuration for a single expected repository.

**Properties**:
```typescript
{
  name: string;           // Repository identifier
  path?: string;          // Expected relative path (optional)
  url?: string;           // Git URL for cloning (optional)
  defaultBranch?: string; // Expected default branch (optional)
}
```

**Validation Rules**:
- `name` must be non-empty string
- At least one of `path` or `url` must be provided
- `path` should be relative path if provided
- `url` must be valid git URL if provided

**Invariants**:
- If both `path` and `url` are provided, they must refer to the same repository

---

### 10. ValidationResult

Represents the outcome of validating workspace structure against configuration.

**Properties**:
```typescript
{
  isValid: boolean;                  // Whether workspace matches configuration
  presentRepositories: Repository[]; // Repositories that exist as expected
  missingRepositories: string[];     // Repository names not found on disk
  extraRepositories: Repository[];   // Repositories found but not in config
  errors: string[];                  // Validation errors encountered
}
```

**Validation Rules**:
- All arrays must be valid (can be empty)
- `isValid` should be true only if `missingRepositories` and `errors` are empty

**Relationships**:
- References multiple `Repository` instances

**Invariants**:
- `isValid === (missingRepositories.length === 0 && errors.length === 0)`
- Repository names in `missingRepositories` must not appear in `presentRepositories`

---

### 11. CloneOperation

Represents an in-progress or completed repository clone operation.

**Properties**:
```typescript
{
  id: string;                    // Unique operation identifier
  url: string;                   // Source repository URL
  targetPath: string;            // Destination path
  status: CloneStatus;           // Current operation status
  progress: CloneProgress;       // Clone progress information
  startTime: Date;               // When clone started
  endTime?: Date;                // When clone completed/failed
  error?: CloneError;            // Error if clone failed
}
```

**Validation Rules**:
- `id` must be non-empty unique string
- `url` must be valid git URL
- `targetPath` must be absolute path
- `status` must be valid `CloneStatus` enum value
- `startTime` must be valid Date
- If `status` is COMPLETED or FAILED, `endTime` must be provided

**Clone Status**:
```typescript
enum CloneStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed"
}
```

**Relationships**:
- Contains one `CloneProgress` (1:1)
- Contains optional `CloneError` (0:1)

**State Machine**:
```
PENDING → IN_PROGRESS → COMPLETED
                     ↓
                   FAILED
```

---

### 12. CloneProgress

Represents progress information for a clone operation.

**Properties**:
```typescript
{
  phase: ClonePhase;          // Current clone phase
  receivedObjects: number;     // Objects received
  totalObjects: number;        // Total objects to receive
  resolvedDeltas: number;      // Deltas resolved
  totalDeltas: number;         // Total deltas to resolve
  bytesReceived: number;       // Bytes received so far
}
```

**Validation Rules**:
- All numeric fields must be non-negative integers
- `receivedObjects <= totalObjects`
- `resolvedDeltas <= totalDeltas`

**Clone Phases**:
```typescript
enum ClonePhase {
  INITIALIZING = "initializing",
  RECEIVING_OBJECTS = "receiving_objects",
  RESOLVING_DELTAS = "resolving_deltas",
  CHECKING_OUT = "checking_out",
  COMPLETE = "complete"
}
```

---

### 13. CloneError

Represents an error that occurred during cloning.

**Properties**:
```typescript
{
  code: CloneErrorCode;     // Categorized error type
  message: string;          // Error description
  cause?: Error;            // Original error if applicable
}
```

**Validation Rules**:
- `code` must be valid `CloneErrorCode` enum value
- `message` must be non-empty string

**Error Codes**:
```typescript
enum CloneErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
  REPOSITORY_NOT_FOUND = "REPOSITORY_NOT_FOUND",
  TARGET_EXISTS = "TARGET_EXISTS",
  DISK_FULL = "DISK_FULL",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  INVALID_URL = "INVALID_URL",
  TIMEOUT = "TIMEOUT",
  UNKNOWN = "UNKNOWN"
}
```

---

## Entity Relationships

```
WorkspaceConfiguration
  └── contains ──> RepositoryConfig (1:N)

RepositoryDiscoveryResult
  ├── contains ──> Repository (1:N)
  └── contains ──> DiscoveryError (1:N)

Repository
  ├── has ──> RepositoryMetadata (1:1, optional)
  └── referenced by ──> ValidationResult (N:1)

RepositoryMetadata
  ├── belongs to ──> Repository (1:1)
  ├── has ──> RepositoryStatus (1:1)
  ├── has ──> CommitInfo (0:1)
  └── has ──> Remote (1:N)

CloneOperation
  ├── has ──> CloneProgress (1:1)
  ├── has ──> CloneError (0:1)
  └── creates ──> Repository (1:1, on success)

ValidationResult
  ├── references ──> Repository (N:N)
  └── validates ──> WorkspaceConfiguration (1:1)
```

---

## Data Flow

### Repository Discovery Flow

```
1. Input: workspace path, scan depth
2. Traverse filesystem recursively
3. Identify .git directories
4. Create Repository instances
5. Detect default branch for each
6. Check for setup scripts
7. Collect discovery errors
8. Return RepositoryDiscoveryResult
```

### Repository Clone Flow

```
1. Input: git URL, target path
2. Create CloneOperation (PENDING)
3. Validate target doesn't exist
4. Update status to IN_PROGRESS
5. Execute git clone with progress
6. Update CloneProgress during clone
7. On success: create Repository, status = COMPLETED
8. On failure: create CloneError, status = FAILED
9. Return CloneOperation
```

### Workspace Validation Flow

```
1. Input: WorkspaceConfiguration
2. Run repository discovery
3. Compare discovered vs configured
4. Categorize: present, missing, extra
5. Validate repository states
6. Collect validation errors
7. Return ValidationResult
```

### Metadata Gathering Flow

```
1. Input: Repository
2. Query git for current branch
3. Query git for all branches
4. Query git for last commit
5. Query git status for working tree
6. Query git remote list
7. Query git stash list
8. Assemble RepositoryMetadata
9. Return metadata
```

---

## Validation Rules Summary

### Cross-Entity Validation

1. **Repository path consistency**: All Repository paths must be within workspace directory structure
2. **Unique repository paths**: No two Repository instances can have the same path
3. **Clone target validation**: CloneOperation target must not conflict with existing repositories
4. **Configuration integrity**: RepositoryConfig entries must have resolvable paths or URLs
5. **Status consistency**: RepositoryStatus fields must be internally consistent
6. **Metadata freshness**: RepositoryMetadata should be refreshed if older than TTL (5 minutes)

### Business Rules

1. **Discovery scope**: Repository discovery must respect configured scan depth limit
2. **Clone safety**: Clone operations must not overwrite existing directories
3. **Default branch priority**: If remote HEAD detection fails, fall back to common branch names (main, master, develop)
4. **Setup script detection**: Only executable files named according to patterns count as setup scripts
5. **Error tolerance**: Discovery continues even if individual repositories have errors
6. **Metadata access**: Detailed metadata gathering is on-demand, not automatic

---

## Performance Considerations

### Data Structure Choices

- **Arrays over Sets**: Most collections are small (< 100 items), arrays are sufficient
- **Flat structures**: Avoid deep nesting for easier serialization and transmission
- **Lazy evaluation**: RepositoryMetadata gathered on-demand, not during discovery
- **Immutable results**: Discovery and validation results are snapshots, not live views

### Memory Management

- **Streaming not required**: Expected workspace sizes fit comfortably in memory
- **Bounded collections**: Configurable limits on scan depth and repository count
- **Early disposal**: Large temporary structures (file lists) disposed after use

---

## Serialization

All entities must be serializable to JSON for:
- Configuration file storage
- API responses (if future REST API is added)
- Logging and debugging

**Date Handling**: Date objects serialized as ISO 8601 strings

**Error Handling**: Error cause chains flattened for serialization (circular references removed)

---

## Example Data

### Example Repository
```json
{
  "name": "arashi",
  "path": "/Users/dev/workspace/arashi",
  "defaultBranch": "main",
  "hasSetupScript": true,
  "setupScriptPath": "/Users/dev/workspace/arashi/setup.sh",
  "remoteUrl": "git@github.com:user/arashi.git"
}
```

### Example RepositoryDiscoveryResult
```json
{
  "repositories": [
    { "name": "arashi", "path": "/Users/dev/workspace/arashi", ... },
    { "name": "utilities", "path": "/Users/dev/workspace/utilities", ... }
  ],
  "workspacePath": "/Users/dev/workspace",
  "scanDepth": 3,
  "scannedDirectories": 47,
  "errors": [],
  "duration": 1247
}
```

### Example ValidationResult
```json
{
  "isValid": false,
  "presentRepositories": [
    { "name": "arashi", "path": "/Users/dev/workspace/arashi", ... }
  ],
  "missingRepositories": ["utilities", "docs"],
  "extraRepositories": [],
  "errors": []
}
```

---

## Future Considerations

1. **Incremental updates**: Instead of full re-discovery, detect filesystem changes
2. **Repository groups**: Logical grouping of repositories for operations
3. **Metadata caching**: Persistent cache for expensive metadata operations
4. **Remote metadata**: Query git hosting services (GitHub, GitLab) for additional metadata
5. **Workspace templates**: Pre-defined workspace configurations for common setups
