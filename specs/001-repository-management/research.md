# Technical Research: Repository Management

**Last Updated**: 2026-02-04  
**Status**: Draft

## Overview

This document outlines the technical decisions for implementing repository management functionality, including repository discovery, default branch detection, setup script detection, repository cloning, workspace validation, and metadata gathering.

---

## Technical Decisions

### TD-001: Repository Discovery Strategy

**Context**: The system needs to scan a workspace directory to find all git repositories. We must balance thoroughness with performance and handle various repository configurations.

**Decision**: Implement recursive filesystem traversal with early termination when `.git` is found

**Rationale**:
- **Efficiency**: Stop traversing once a `.git` directory is found (don't descend into subdirectories of repositories)
- **Accuracy**: Checking for `.git` directory is the standard way to identify git repositories
- **Flexibility**: Supports repositories at any depth level within configurable scan depth limit
- **Performance**: Avoids scanning repository internals which can contain thousands of files

**Implementation Details**:
```typescript
// Use Bun's file system APIs for fast directory traversal
// Check each directory for .git subdirectory
// Stop descending when repository is found
// Apply max depth limit (default: 3 levels)
// Collect repository paths for further analysis
```

**Alternatives Considered**:
- Git command-based discovery (`git rev-parse --git-dir`): Slower, requires spawning process for each directory
- Configuration-based only: Less flexible, requires manual setup

**Risks & Mitigations**:
- Risk: Symlinks could cause infinite loops → Mitigation: Track visited paths, provide option to follow/ignore symlinks
- Risk: Large directory trees cause slow scans → Mitigation: Configurable depth limit, exclude patterns
- Risk: Permission errors block discovery → Mitigation: Continue on error, report inaccessible directories

---

### TD-002: Default Branch Detection Strategy

**Context**: Different repositories use different default branch names (main, master, develop, trunk). We need to reliably detect the default branch for each repository.

**Decision**: Use git symbolic-ref with fallback to remote HEAD

**Rationale**:
- **Standard approach**: `git symbolic-ref refs/remotes/origin/HEAD` is the canonical way to get default branch
- **Handles detached HEAD**: Falls back to remote when local HEAD is detached
- **Reliable**: Works across different repository configurations
- **Fast**: Single git command per repository

**Implementation Details**:
```typescript
// Primary: git symbolic-ref refs/remotes/origin/HEAD
// Extract branch name from refs/remotes/origin/<branch>
// Fallback 1: git remote show origin | grep 'HEAD branch'
// Fallback 2: Check for existence of main, master, develop in order
// Cache results to avoid repeated queries
```

**Alternatives Considered**:
- Always assume "main" or "master": Too brittle, fails for custom default branches
- Read .git/HEAD file directly: Doesn't work for detached HEAD or non-standard configs
- Query remote server: Slow, requires network access

**Risks & Mitigations**:
- Risk: Repository has no remote configured → Mitigation: Fallback to checking common branch names locally
- Risk: Remote is unreachable → Mitigation: Use cached result or skip remote check
- Risk: Multiple remotes with different defaults → Mitigation: Use "origin" as convention, make configurable

---

### TD-003: Setup Script Detection Pattern

**Context**: Repositories may contain setup scripts that should be executed after worktree creation. We need to identify which repositories have these scripts.

**Decision**: Check for `setup.sh` file in repository root using filesystem stat

**Rationale**:
- **Simple**: Single file check is fast and reliable
- **Conventional**: `setup.sh` is a common convention for setup scripts
- **Extensible**: Easy to add support for other script names (setup.py, setup.js, etc.)
- **Fast**: Filesystem stat is faster than git operations

**Implementation Details**:
```typescript
// Check for existence of <repo-root>/setup.sh
// Use Bun.file().exists() for fast filesystem check
// Store script path if found
// Make script name patterns configurable in .arashi/config.json
// Default patterns: ["setup.sh", "setup.bash", ".arashi/setup.sh"]
```

**Alternatives Considered**:
- Git ls-files to check tracked files: Slower, doesn't detect untracked setup scripts
- Execute scripts to detect capabilities: Dangerous, could execute malicious code
- Check for any executable file: Too broad, many false positives

**Risks & Mitigations**:
- Risk: Setup script isn't executable → Mitigation: Check permissions, report warning
- Risk: Setup script is malicious → Mitigation: Require user confirmation before execution
- Risk: Multiple setup scripts present → Mitigation: Use priority order, allow configuration

---

### TD-004: Repository Clone Strategy

**Context**: Users need to clone missing repositories to set up their workspace. We must handle clone operations reliably with good progress reporting.

**Decision**: Use git clone command with progress reporting via spawn

**Rationale**:
- **Standard**: Git clone is the standard, reliable way to clone repositories
- **Progress**: Git provides progress output that can be parsed for user feedback
- **Options**: Supports shallow clone, specific branch, etc.
- **Familiar**: Users understand git clone behavior and error messages

**Implementation Details**:
```typescript
// Spawn: git clone --progress <url> <target-path>
// Parse stderr for progress information (git outputs to stderr)
// Support options: --depth for shallow clone, --branch for specific branch
// Verify clone success by checking for .git directory
// Run repository discovery on newly cloned repo to get metadata
```

**Alternatives Considered**:
- Use git library (like isomorphic-git): More complex, less mature than git command
- Download and extract archive: Doesn't preserve git history
- Implement git protocol: Massive complexity, reinventing the wheel

**Risks & Mitigations**:
- Risk: Network failures during clone → Mitigation: Retry logic with backoff, clean up partial clones
- Risk: Authentication required → Mitigation: Let git handle auth (SSH keys, credential helpers)
- Risk: Disk space exhausted → Mitigation: Check available space before clone, clean up on failure
- Risk: Target path exists → Mitigation: Pre-flight check, clear error message

---

### TD-005: Workspace Validation Approach

**Context**: Users may have incomplete workspace setups where some configured repositories are missing. We need to validate and report discrepancies.

**Decision**: Set-based comparison of expected vs actual repositories

**Rationale**:
- **Clear**: Easy to understand missing vs present repositories
- **Fast**: Simple set operations, no complex graph algorithms
- **Actionable**: Provides clear list of what needs to be cloned
- **Flexible**: Can compare by name, path, or URL depending on configuration format

**Implementation Details**:
```typescript
// Parse workspace configuration to get expected repositories
// Run repository discovery to get actual repositories
// Compare using repository identifier (name or normalized path)
// Categorize: present, missing, extra (not in config)
// Return structured validation result with details
// Optionally check repository state (correct branch, clean state)
```

**Alternatives Considered**:
- Deep validation of repository state: Too complex for initial implementation, belongs in separate feature
- Automatic cloning of missing repos: Too aggressive, should require user confirmation

**Risks & Mitigations**:
- Risk: Configuration format changes → Mitigation: Support multiple config formats, clear versioning
- Risk: Repositories moved/renamed → Mitigation: Fuzzy matching by remote URL, suggest mappings
- Risk: Large configuration files → Mitigation: Stream parsing, lazy evaluation

---

### TD-006: Metadata Gathering Scope

**Context**: Repositories have extensive metadata (branches, tags, commits, status, config). We need to decide what to gather and when.

**Decision**: Implement two-tier metadata gathering: basic (cheap) and detailed (expensive)

**Rationale**:
- **Performance**: Basic metadata (path, default branch) can be gathered quickly for all repos
- **On-demand**: Detailed metadata (all branches, commit history, status) gathered only when needed
- **Scalability**: Avoids expensive operations during initial discovery of large workspaces
- **Flexibility**: Users can request detailed metadata for specific repositories

**Implementation Details**:
```typescript
// Basic metadata (always gathered):
//   - Repository path
//   - Default branch
//   - Has setup script
//   - Primary remote URL

// Detailed metadata (on-demand):
//   - Current branch
//   - All local branches
//   - All remote branches
//   - Last commit info (hash, author, date, message)
//   - Working tree status (clean, modified, untracked files)
//   - Stash list
//   - Configuration values

// Use git commands: rev-parse, status --porcelain, branch, remote, log
// Cache detailed metadata with TTL (e.g., 5 minutes)
```

**Alternatives Considered**:
- Always gather all metadata: Too slow for large workspaces
- Never gather detailed metadata: Limits functionality of dependent features
- Use git repository database directly: Complex, fragile across git versions

**Risks & Mitigations**:
- Risk: Metadata becomes stale → Mitigation: TTL-based cache invalidation, explicit refresh
- Risk: Gathering metadata for many repos is slow → Mitigation: Parallel gathering with concurrency limit
- Risk: Repository in inconsistent state → Mitigation: Handle git command errors gracefully

---

### TD-007: Error Handling Strategy

**Context**: Repository operations can fail in many ways (permissions, corrupt repos, network issues). We need consistent error handling.

**Decision**: Use typed error classes with repository context

**Rationale**:
- **Type-safe**: Consumers can handle specific error types
- **Informative**: Errors include repository context (path, operation)
- **Actionable**: Clear error messages guide users to resolution
- **Debuggable**: Errors include cause chain for troubleshooting

**Implementation Details**:
```typescript
// Error class hierarchy:
class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly repository: string,
    public readonly cause?: Error
  ) {}
}

class RepositoryNotFoundError extends RepositoryError {}
class RepositoryInvalidError extends RepositoryError {}
class RepositoryCloneError extends RepositoryError {}
class RepositoryMetadataError extends RepositoryError {}

// Usage:
try {
  await detectDefaultBranch(repoPath);
} catch (error) {
  if (error instanceof RepositoryInvalidError) {
    // Handle invalid repository
  }
  throw error; // Re-throw if not handled
}
```

**Alternatives Considered**:
- Plain Error objects: Less type-safe, harder to handle specific cases
- Result type (Ok/Err): More functional but less idiomatic in TypeScript
- Error codes: Less descriptive than typed errors

**Risks & Mitigations**:
- Risk: Error types proliferate → Mitigation: Keep hierarchy shallow, use error causes
- Risk: Errors don't include enough context → Mitigation: Always include repository identifier

---

## Integration Points

### Dependencies on Other Features

- **Config Management** (spec 001-config-management): Reads workspace configuration to determine expected repositories
- **Git Utilities** (spec 001-git-utility-lib): Uses git command wrappers for repository operations
- **Filesystem Utilities** (spec 005-filesystem-utilities): Uses filesystem operations for directory traversal
- **Logger Utilities** (spec 006-logger-utilities): Uses logger for progress and error reporting

### Used By Other Features

- **Worktree Orchestration** (spec 001-worktree-orchestration): Depends on repository discovery and default branch detection
- **Repository Initialization** (future): May use clone and validation functionality

---

## Performance Considerations

### Scalability Targets

- **50 repositories**: Discovery completes in < 5 seconds
- **200 repositories**: Discovery completes in < 20 seconds (acceptable for large teams)
- **Clone operations**: Bound by network speed, not implementation

### Optimization Strategies

1. **Early termination**: Stop directory traversal when `.git` is found
2. **Parallel operations**: Gather metadata for multiple repositories concurrently
3. **Caching**: Cache expensive operations (default branch detection, metadata gathering)
4. **Lazy evaluation**: Only gather detailed metadata when explicitly requested
5. **Configurable limits**: Max scan depth, max repositories, operation timeouts

---

## Security Considerations

### Potential Vulnerabilities

1. **Path traversal attacks**: Symlinks could escape workspace directory
2. **Code execution**: Setup scripts could be malicious
3. **Git URL injection**: Clone URLs could include dangerous options
4. **Resource exhaustion**: Large workspaces could consume excessive memory

### Mitigations

1. **Path validation**: Resolve all paths and verify they're within workspace
2. **Script confirmation**: Require user confirmation before executing setup scripts
3. **URL sanitization**: Validate and sanitize git URLs before clone
4. **Resource limits**: Configurable scan depth, max repositories, timeouts

---

## Testing Strategy

### Unit Tests

- Repository discovery with various directory structures
- Default branch detection for different git configurations
- Setup script detection with various file patterns
- Clone operation success and failure scenarios
- Workspace validation with different configurations
- Metadata gathering for repositories in various states

### Integration Tests

- End-to-end repository discovery in real workspace
- Clone and verify newly cloned repository
- Validate workspace with mix of present and missing repositories
- Error handling with corrupt or invalid repositories

### Test Coverage Targets

- **Minimum**: 80% code coverage (per Constitution VII)
- **Focus areas**: 100% coverage for error paths and edge cases

---

## Open Questions

1. **Q**: Should we support monorepos with multiple projects?
   - **A**: Not in initial implementation; treat monorepo as single repository

2. **Q**: How should we handle git submodules?
   - **A**: Submodules are treated as separate repositories during discovery

3. **Q**: Should repository discovery follow symlinks?
   - **A**: Make configurable with default to not follow (security concern)

4. **Q**: What clone options should be supported (shallow, single-branch)?
   - **A**: Start with full clone, add options in future based on user needs

5. **Q**: Should we support non-git version control systems?
   - **A**: No, git-only for initial implementation (per Constitution)
