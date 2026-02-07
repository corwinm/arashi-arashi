# Research: Status Command

**Feature**: 020-status-command  
**Date**: 2026-02-07  
**Purpose**: Research technical approaches for implementing git status parsing, output formatting, and performance optimization

## Research Questions

### R1: Git Status Output Parsing

**Question**: What is the most reliable way to parse git status output across different git versions and states?

**Decision**: Use `git status --porcelain=v1` for machine-readable output

**Rationale**:
- `--porcelain=v1` format is stable across git versions (since Git 1.7.0)
- Provides consistent, parseable output format
- Two-character status codes clearly indicate file states (staged, modified, untracked)
- Easier to parse than human-readable output
- Can be combined with `--branch` flag for branch tracking information

**Alternatives Considered**:
- `git status` (human-readable): Too inconsistent, localization issues, hard to parse
- `git status --porcelain=v2`: More detailed but unnecessarily complex for our needs
- Custom git commands (diff, ls-files): Would require multiple git invocations, slower

**Implementation Notes**:
```bash
# For file status
git status --porcelain=v1

# For branch tracking
git status --porcelain=v1 --branch

# Example output:
## main...origin/main [ahead 2]
 M file1.txt
A  file2.txt
?? file3.txt
```

**Status Code Reference**:
- First character = staging area status
- Second character = working tree status
- `??` = untracked
- `!!` = ignored (not needed for our use case)
- Space = unchanged
- `M` = modified
- `A` = added
- `D` = deleted
- `R` = renamed
- `C` = copied

---

### R2: Git Repository Discovery

**Question**: How should we discover and validate repository paths from the workspace configuration?

**Decision**: Use existing `loadConfig()` from `src/lib/config.ts` and validate repository paths

**Rationale**:
- Config already contains workspace root and sub-repository paths
- Existing config management handles `.arashi/config.json` parsing
- Need to check both main repo and all sub-repos defined in config
- Should validate that paths exist and are git repositories

**Alternatives Considered**:
- Auto-discover all git repos in directory tree: Too slow, may include unwanted repos
- Use git worktree list: Only shows worktrees, not main repos
- Read `.git/worktrees/` directly: Low-level, fragile to git implementation changes

**Implementation Notes**:
```typescript
// Existing config structure (from config.ts)
interface ArashiConfig {
  workspaceRoot: string;
  repos: RepoConfig[];
  // ... other fields
}

interface RepoConfig {
  name: string;
  path: string;
  // ... other fields
}

// Status command will:
// 1. Load config with loadConfig()
// 2. Check main repo at workspaceRoot
// 3. Check each repo in repos array
// 4. Validate each is a git repo by checking for .git directory
```

---

### R3: Output Formatting Strategy

**Question**: How should we structure the three output modes (default, verbose, short) for optimal usability?

**Decision**: Use chalk for colors, ora for progress, and structured sections for readability

**Rationale**:
- Existing commands already use chalk (colors) and ora (spinners)
- Users expect consistency with other arashi commands
- Color-coding improves scannability (green=good, yellow=attention)
- Progress indicators for operations >1 second
- Default mode balances detail and brevity

**Alternatives Considered**:
- Plain text only: Poor UX, hard to scan
- JSON output only: Not human-readable for primary use case
- Table format: Over-engineered for this use case

**Implementation Notes**:

**Default Mode**:
```
Checking repository status...

Main Repository (/)
  Branch: main → origin/main [↑2]
  Status: ● Dirty (3 changes)
    2 modified, 1 untracked

Sub-repositories:

arashi (repos/arashi/)
  Branch: 020-status-command
  Status: ✓ Clean

config-mgmt (repos/config-mgmt/)
  Branch: main → origin/main
  Status: ● Dirty (1 change)
    1 modified

────────────────────────────────
Summary: 1 clean, 2 dirty (3 total)
```

**Verbose Mode** (`--verbose`, `-v`):
```
Checking repository status...

Main Repository (/)
  Branch: main → origin/main [↑2]
  
  Changes to be committed:
    modified:   src/commands/status.ts
  
  Changes not staged:
    modified:   README.md
  
  Untracked files:
    test.txt

[Full git status for each repo]
```

**Short Mode** (`--short`, `-s`):
```
/ (main ↑2): ● 3 changes
repos/arashi/ (020-status-command): ✓ clean
repos/config-mgmt/ (main): ● 1 change

Summary: 1 clean, 2 dirty
```

**Color Scheme**:
- ✓ Clean: green
- ● Dirty: yellow
- ✗ Error: red
- Branch info: cyan
- Summary: bold

---

### R4: Performance Optimization

**Question**: How should we optimize status checking for workspaces with many repositories?

**Decision**: Execute git status commands in parallel with Promise.all, show incremental results

**Rationale**:
- Git status operations are I/O bound and independent
- Parallel execution reduces total time significantly
- Can use Promise.allSettled to handle individual failures
- Show progress incrementally as repos complete

**Alternatives Considered**:
- Sequential execution: Too slow for many repos (3 seconds per repo = 30 seconds for 10 repos)
- Worker threads: Over-engineered, git commands already run in separate processes
- Batching: Adds complexity without clear benefit

**Implementation Notes**:
```typescript
// Pseudo-code
async function checkAllRepos(repos: RepoConfig[]): Promise<RepoStatus[]> {
  const statusPromises = repos.map(repo => 
    checkRepoStatus(repo).catch(error => ({
      repo: repo.name,
      error: error.message,
      status: 'failed'
    }))
  );
  
  // Use Promise.allSettled to handle individual failures
  const results = await Promise.allSettled(statusPromises);
  
  return results.map(result => 
    result.status === 'fulfilled' ? result.value : result.reason
  );
}
```

**Performance Target**: <3 seconds for 10 repos (per spec SC-001)

---

### R5: Error Handling Patterns

**Question**: How should we handle various error scenarios gracefully?

**Decision**: Continue on individual repo failures, report errors clearly, provide actionable messages

**Rationale**:
- One broken repo shouldn't prevent checking others
- Users need to know which repos had issues
- Errors should suggest fixes (e.g., "not a git repository", "permission denied")
- Exit code should reflect if any repos failed

**Error Scenarios**:
1. **Not in arashi workspace**: Display error, suggest running `arashi init`
2. **Repository path not found**: Warn, continue with other repos, suggest removing from config
3. **Git command failure**: Warn, continue with other repos, display git error message
4. **Corrupted git repo**: Warn, continue with other repos, suggest running `git fsck`
5. **Permission denied**: Warn, continue with other repos, suggest checking permissions
6. **Detached HEAD**: Not an error, display as "(detached HEAD at <sha>)"
7. **No remote configured**: Not an error, omit tracking info

**Exit Codes**:
- 0: All repos checked successfully
- 1: One or more repos failed to check (after displaying partial results)
- 2: Not in arashi workspace or config load failed

---

### R6: Integration with Existing Infrastructure

**Question**: Which existing arashi utilities and patterns should be reused?

**Decision**: Leverage existing libraries and follow established command patterns

**Utilities to Reuse**:

1. **Config Management** (`src/lib/config.ts`):
   - `loadConfig()`: Load workspace configuration
   - `ArashiConfig` type: Access repo paths
   
2. **Git Utilities** (`src/lib/git.ts`):
   - May need to add `getGitStatus()` function
   - Follow existing pattern of `executeGitCommand()`
   
3. **Logger Utilities** (`src/lib/logger.ts`):
   - `logger.info()`, `logger.error()`, `logger.success()`
   - `spinner()`: Progress indicators
   - Use existing chalk integration for colors
   
4. **Error Handling** (`src/lib/errors.ts`):
   - Extend existing error types if needed
   - Follow existing error handling patterns

5. **Commander Integration** (`src/index.ts`):
   - Register status command like other commands
   - Use `.option()` for `--verbose` and `--short` flags

**Command Pattern** (from existing commands):
```typescript
// src/commands/status.ts
export async function statusCommand(options: StatusOptions): Promise<void> {
  try {
    // 1. Load config
    // 2. Validate workspace
    // 3. Check repos (with progress)
    // 4. Format and display results
  } catch (error) {
    // Handle errors
    throw error;
  }
}

// src/index.ts (register command)
program
  .command('status')
  .description('Show status of all managed repositories')
  .option('-v, --verbose', 'Show full git status output')
  .option('-s, --short', 'Show one-line summary per repository')
  .action(statusCommand);
```

---

## Summary of Key Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| Git Parsing | Use `git status --porcelain=v1` | Stable, machine-readable format |
| Repo Discovery | Use existing `loadConfig()` | Leverages existing infrastructure |
| Output Format | Three modes: default/verbose/short | Balances detail and usability |
| Performance | Parallel execution with Promise.allSettled | I/O bound, independent operations |
| Error Handling | Continue on failures, report clearly | One failure shouldn't block others |
| Integration | Reuse config, git, logger utilities | Consistency with existing commands |

## Implementation Checklist

- [ ] Add `getGitStatus()` function to `src/lib/git.ts`
- [ ] Create `src/commands/status.ts` with three output modes
- [ ] Register command in `src/index.ts`
- [ ] Add unit tests for status parsing
- [ ] Add integration tests for all modes and error scenarios
- [ ] Update documentation (README.md)
- [ ] Verify cross-platform compatibility
- [ ] Performance testing with 10+ repos
