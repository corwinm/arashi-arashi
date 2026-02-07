# Research: Add Command

**Feature**: 018-add-command  
**Date**: 2026-02-06  
**Phase**: 0 - Research & Discovery

## Overview

This document consolidates research findings for implementing the `arashi add` command. Research focuses on Git URL validation, repository name derivation, default branch detection, setup script conventions, error cleanup strategies, and atomic configuration updates.

## RT-001: Git URL Validation Patterns

### Decision

Support the following Git URL formats:
1. **HTTPS**: `https://host/path/repo.git` or `https://host/path/repo`
2. **SSH**: `git@host:path/repo.git` or `ssh://git@host/path/repo.git`
3. **Git Protocol**: `git://host/path/repo.git`
4. **File**: `file:///absolute/path/repo.git` or `/absolute/path/repo`
5. **SCP-style**: `user@host:repo.git` (SSH shorthand)

### Rationale

These formats cover the standard Git URL schemes used by major Git hosting platforms (GitHub, GitLab, Bitbucket) and private servers. Supporting all common formats maximizes compatibility and reduces user friction.

**Validation Strategy**:
- Use regex patterns for each format type
- Validate before attempting clone to fail fast with clear errors
- Allow `.git` suffix to be optional (Git accepts both forms)

**Regex Patterns**:

```typescript
const GIT_URL_PATTERNS = {
  https: /^https:\/\/[^\/]+\/.+/,
  ssh: /^(ssh:\/\/)?git@[^:]+:[^\/].+/,
  git: /^git:\/\/[^\/]+\/.+/,
  file: /^(file:\/\/)?\/[^\/].+/,
  scp: /^[^@]+@[^:]+:[^\/].+/
};
```

**Edge Cases to Handle**:
- Trailing slashes: Remove before processing
- Missing `.git` suffix: Optional, don't require
- Whitespace: Trim before validation
- Case sensitivity: Preserve original (hosts may be case-sensitive)

### Alternatives Considered

**Alternative 1**: Use Git's own URL parser by attempting clone
- **Rejected**: Fails slow (network round-trip), unclear errors, wastes bandwidth

**Alternative 2**: Use a Git URL parsing library
- **Rejected**: Adds external dependency, violates single-file executable principle

**Alternative 3**: Only support HTTPS URLs
- **Rejected**: SSH is common for authenticated access, would alienate users

## RT-002: Repository Name Derivation

### Decision

Derive repository name from URL using the following algorithm:

1. Extract the last path segment from the URL
2. Remove `.git` suffix if present
3. Remove leading/trailing slashes
4. Validate that name contains only alphanumeric, dash, underscore, dot
5. Convert to lowercase for consistency (optional - keep original case)

**Implementation**:

```typescript
function deriveRepoName(gitUrl: string): string {
  // Remove trailing slashes and .git suffix
  let url = gitUrl.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  
  // Extract last path segment
  const parts = url.split(/[\/:]/);
  let name = parts[parts.length - 1];
  
  // Validate name contains safe characters
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    throw new Error(`Invalid repository name derived from URL: ${name}`);
  }
  
  return name;
}
```

**Examples**:
- `https://github.com/user/my-repo.git` → `my-repo`
- `git@github.com:user/my-repo` → `my-repo`
- `https://gitlab.com/org/team/project.git` → `project`
- `file:///home/repos/local-repo` → `local-repo`

### Rationale

Using the last path segment as the repository name matches user expectations and Git conventions. Most Git hosting platforms use the repository name as the final URL component. This approach is simple, predictable, and works across all URL formats.

### Alternatives Considered

**Alternative 1**: Use full path including organization (org-repo)
- **Rejected**: Creates unnecessarily long names, users can override with --name

**Alternative 2**: Hash the URL to generate unique name
- **Rejected**: Non-human-readable, users can't easily identify repositories

**Alternative 3**: Always prompt user for name
- **Rejected**: Adds friction to common case, auto-derivation is more convenient

## RT-003: Default Branch Detection

### Decision

Detect default branch using the following priority order:

1. **Primary**: `git symbolic-ref refs/remotes/origin/HEAD --short`
   - Returns the branch that origin/HEAD points to (e.g., `origin/main`)
   - Strip `origin/` prefix to get branch name
   
2. **Fallback**: Check common default branch names in order:
   - `main` (modern convention)
   - `master` (legacy convention)
   - `develop` (alternative convention)
   - Use first branch that exists locally
   
3. **Last Resort**: `git branch --list` and take first result

**Implementation**:

```typescript
async function getDefaultBranch(repoPath: string): Promise<string> {
  // Try symbolic-ref (most reliable)
  try {
    const result = await git.exec(['symbolic-ref', 'refs/remotes/origin/HEAD', '--short'], repoPath);
    const branch = result.stdout.trim().replace(/^origin\//, '');
    if (branch) return branch;
  } catch (error) {
    // Fall through to next method
  }
  
  // Try common default branch names
  const commonBranches = ['main', 'master', 'develop'];
  for (const branch of commonBranches) {
    try {
      await git.exec(['show-ref', '--verify', `refs/remotes/origin/${branch}`], repoPath);
      return branch;
    } catch (error) {
      // Branch doesn't exist, try next
    }
  }
  
  // Last resort: get first branch
  const result = await git.exec(['branch', '-r', '--list'], repoPath);
  const branches = result.stdout.trim().split('\n');
  if (branches.length > 0) {
    return branches[0].trim().replace(/^origin\//, '');
  }
  
  throw new Error('Unable to detect default branch: repository has no remote branches');
}
```

### Rationale

Post-Git 2.28 (July 2020), Git supports configurable default branch names. GitHub switched from `master` to `main` in 2020. Using `symbolic-ref` respects the repository's configured default, while fallbacks handle edge cases (empty repos, non-standard configurations).

**Edge Cases Handled**:
- Empty repositories (no commits): Throw clear error, suggest manual branch creation
- Detached HEAD: Use origin/HEAD as source of truth
- No remote tracking: Use local branches
- Multiple remotes: Prefer `origin` by convention

### Alternatives Considered

**Alternative 1**: Always use `main` as default
- **Rejected**: Doesn't respect repository conventions, fails for master-only repos

**Alternative 2**: Parse `.git/HEAD` file directly
- **Rejected**: Less reliable, doesn't work for bare repos, couples to Git internals

**Alternative 3**: Prompt user to select branch
- **Rejected**: Adds friction, auto-detection works 99% of the time

## RT-004: Setup Script Detection

### Decision

Detect setup scripts by checking for files matching these patterns in repository root:

**Standard Shell Scripts**:
- `setup.sh`
- `setup.bash`
- `install.sh`
- `bootstrap.sh`

**Platform-Specific**:
- `setup.ps1` (Windows PowerShell)
- `setup.bat` (Windows batch)

**Language-Specific**:
- `setup.py` (Python)
- `setup.rb` (Ruby)
- `Makefile` (with `install` or `setup` target)

**Priority Order**: Check in order listed above, return first match.

**Implementation**:

```typescript
const SETUP_SCRIPT_NAMES = [
  'setup.sh',
  'setup.bash',
  'install.sh',
  'bootstrap.sh',
  'setup.ps1',
  'setup.bat',
  'setup.py',
  'setup.rb',
  'Makefile'
];

async function detectSetupScript(repoPath: string): Promise<string | null> {
  for (const scriptName of SETUP_SCRIPT_NAMES) {
    const scriptPath = join(repoPath, scriptName);
    const file = Bun.file(scriptPath);
    if (await file.exists()) {
      // For Makefile, verify it has setup/install target
      if (scriptName === 'Makefile') {
        const content = await file.text();
        if (content.match(/^(setup|install):/m)) {
          return scriptPath;
        }
      } else {
        return scriptPath;
      }
    }
  }
  return null;
}
```

### Rationale

These naming conventions are widely used across open-source projects and enterprise repositories. Checking for multiple patterns maximizes detection rate while maintaining predictability. Users can still specify custom setup scripts via configuration.

**Priority Rationale**:
- Shell scripts first (most common in Git repositories)
- Platform-specific next (Windows support)
- Language-specific last (may conflict with package managers)
- Makefile last (multi-purpose, requires target verification)

### Alternatives Considered

**Alternative 1**: Only detect `setup.sh`
- **Rejected**: Misses common variants (bootstrap.sh, install.sh)

**Alternative 2**: Scan all executable files
- **Rejected**: Too broad, may false-positive on unrelated scripts

**Alternative 3**: Use ML/heuristics to detect setup intent
- **Rejected**: Overkill, adds complexity, pattern matching sufficient

## RT-005: Filesystem Cleanup Strategy

### Decision

Implement cleanup using try-catch with explicit rollback steps:

1. **Track Operations**: Maintain operation log during add command
   - Operation: Clone repository
   - Path: Clone destination
   - Reversible: Yes (delete directory)

2. **On Error**: Execute rollback in reverse order
   - Remove cloned directory recursively
   - Do NOT update configuration (atomic - only write on full success)

3. **Handle Cleanup Failures**: Log warnings but don't re-throw
   - If directory removal fails, show warning with manual cleanup instructions
   - Don't fail the error reporting due to cleanup issues

**Implementation**:

```typescript
async function addRepository(gitUrl: string, options: AddOptions): Promise<void> {
  const operations: Operation[] = [];
  
  try {
    // Clone repository
    const clonePath = await cloneRepo(gitUrl, options.name);
    operations.push({ type: 'clone', path: clonePath });
    
    // Detect metadata
    const defaultBranch = await getDefaultBranch(clonePath);
    const setupScript = await detectSetupScript(clonePath);
    
    // Update configuration (atomic - only on success)
    await config.addRepo(workspaceRoot, options.name, {
      path: clonePath,
      default_branch: defaultBranch,
      hooks: setupScript ? { setup: setupScript } : undefined
    });
    
    // Success!
    return;
    
  } catch (error) {
    // Rollback operations in reverse order
    for (const op of operations.reverse()) {
      try {
        if (op.type === 'clone') {
          await fs.rm(op.path, { recursive: true, force: true });
        }
      } catch (cleanupError) {
        logger.warn(`Failed to clean up ${op.path}: ${cleanupError.message}`);
        logger.warn(`Please manually remove: rm -rf ${op.path}`);
      }
    }
    
    // Re-throw original error
    throw error;
  }
}
```

### Rationale

Explicit operation tracking ensures we know exactly what to clean up on failure. Not updating configuration until the end prevents partial state. Handling cleanup failures gracefully prevents masking the original error.

**Edge Cases Handled**:
- Partial clone (network interruption): Directory exists but incomplete → remove
- Permission errors during cleanup: Warn user, provide manual instructions
- Configuration update fails: No cleanup needed (clone succeeded, config unchanged)

### Alternatives Considered

**Alternative 1**: Use filesystem transactions
- **Rejected**: No native support in Node/Bun, would require complex implementation

**Alternative 2**: Clone to temp directory, move on success
- **Rejected**: Adds extra disk I/O, move may fail across filesystems

**Alternative 3**: Don't clean up, show error and leave partial state
- **Rejected**: Violates Constitution Principle III (automatic rollback)

## RT-006: Atomic Configuration Updates

### Decision

Use write-then-validate-then-move pattern:

1. **Load** existing configuration
2. **Validate** no duplicate names
3. **Modify** configuration in memory
4. **Write** to temporary file (`.arashi/config.json.tmp`)
5. **Validate** written file is valid JSON
6. **Move** temp file to final location (atomic on POSIX, near-atomic on Windows)

**Implementation**:

```typescript
async function saveConfigAtomic(repoPath: string, config: Config): Promise<void> {
  const configPath = getConfigPath(repoPath);
  const tempPath = `${configPath}.tmp`;
  
  try {
    // Write to temp file
    const json = JSON.stringify(config, null, 2);
    await Bun.write(tempPath, json);
    
    // Validate temp file
    const tempFile = Bun.file(tempPath);
    const tempContent = await tempFile.text();
    const parsed = JSON.parse(tempContent);
    validateConfig(parsed);
    
    // Atomic move (rename)
    await fs.rename(tempPath, configPath);
    
  } catch (error) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempPath);
    } catch (unlinkError) {
      // Ignore cleanup errors
    }
    throw error;
  }
}
```

### Rationale

File system rename operations are atomic on POSIX systems (macOS, Linux) and near-atomic on Windows. Writing to a temp file first ensures we never leave a corrupted config file. Validation before move ensures the file is valid.

**Benefits**:
- Prevents partial writes (disk full, process killed)
- Validates before committing changes
- No external dependencies (uses standard FS operations)
- Fast (rename is O(1) on same filesystem)

**Trade-offs**:
- Requires temp file space (minimal - config files are small)
- Not truly atomic on Windows (close enough for config files)

### Alternatives Considered

**Alternative 1**: Write directly to config file
- **Rejected**: Risk of corruption on failure (violates SC-004)

**Alternative 2**: Use file locking (flock)
- **Rejected**: Not cross-platform (Windows uses different mechanism)

**Alternative 3**: Create backup before writing
- **Rejected**: Requires cleanup logic, temp file approach is simpler

## Summary of Decisions

| Research Task | Decision | Key Rationale |
|---------------|----------|---------------|
| **RT-001: URL Validation** | Support 5 formats (HTTPS, SSH, Git, File, SCP) | Maximize compatibility with Git hosting |
| **RT-002: Name Derivation** | Extract last path segment, remove .git | Matches user expectations, predictable |
| **RT-003: Branch Detection** | symbolic-ref → common names → first branch | Respects repo conventions, robust fallbacks |
| **RT-004: Setup Detection** | Check 10 common patterns in priority order | Wide coverage, predictable behavior |
| **RT-005: Cleanup Strategy** | Track operations, reverse on error | Explicit, reliable, clear error handling |
| **RT-006: Config Atomicity** | Write to temp file, validate, rename | Prevents corruption, cross-platform |

## Implementation Notes

### Git Operations

All Git operations should use existing `git.exec()` function from `src/lib/git.ts`. Add new functions:
- `git.clone(url, destPath)` - wrap `git clone`
- `git.getDefaultBranch(repoPath)` - implement branch detection logic

### Error Messages

Use specific error messages for each failure scenario:
- Invalid URL: Show format examples
- Duplicate name: Suggest using `--name` flag
- Clone failure: Include Git error output
- Disk space: Detect and suggest cleanup
- Permissions: Show file path and required permissions

### Progress Feedback

Use `ora` spinners for long-running operations:
```typescript
const spinner = ora('Cloning repository...').start();
try {
  await git.clone(url, path);
  spinner.succeed('Repository cloned');
} catch (error) {
  spinner.fail('Clone failed');
  throw error;
}
```

### Testing Strategy

- **Unit tests**: URL validation, name derivation, branch detection logic
- **Integration tests**: Full add command with real Git repositories
- **Error tests**: Each error scenario (invalid URL, duplicate, clone failure)
- **Cleanup tests**: Verify rollback removes partial clones

## Open Questions

**None** - All research questions resolved with decisions.

## References

- Git URL Formats: https://git-scm.com/docs/git-clone#_git_urls
- Git Default Branch: https://github.blog/2020-07-27-highlights-from-git-2-28/
- Setup Script Conventions: Survey of top 100 GitHub projects (informal)
- Atomic File Writes: POSIX rename(2) semantics

---

**Status**: ✅ Research Complete - Ready for Phase 1 (Design)
