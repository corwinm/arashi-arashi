# CLI Interface Contract: Status Command

**Feature**: 020-status-command  
**Date**: 2026-02-07  
**Purpose**: Define the command-line interface contract for the status command

## Command Signature

```bash
arashi status [options]
```

## Description

Show status of all managed repositories in the workspace.

Checks the git status of the main repository and all configured sub-repositories, displaying changes, branch information, and a summary of clean/dirty states.

## Options

| Flag | Alias | Type | Required | Default | Description |
|------|-------|------|----------|---------|-------------|
| `--verbose` | `-v` | boolean | No | `false` | Show full git status output for each repository |
| `--short` | `-s` | boolean | No | `false` | Show one-line summary per repository |
| `--help` | `-h` | boolean | No | `false` | Display help information |

**Constraints**:
- `--verbose` and `--short` are mutually exclusive
- If both are provided, display error: "Cannot use --verbose and --short together"

## Exit Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 0 | Success | All repositories checked successfully |
| 1 | Partial failure | One or more repositories failed to check (after showing results for others) |
| 2 | Complete failure | Not in arashi workspace or critical error (config load failed) |

## Output Formats

### Default Output

Shows moderate detail with color-coded indicators.

**Structure**:
```
[Progress message]

[Main Repository Section]
  Repository name and path
  Branch information with tracking status
  Status indicator (✓ Clean or ● Dirty)
  Change summary (if dirty)

[Sub-repositories Section]
(Repeat for each sub-repo)

[Summary Line]
────────────────────────────────
Summary: X clean, Y dirty (Z total)
```

**Example**:
```bash
$ arashi status
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

**Color Codes**:
- ✓ Clean: Green
- ● Dirty: Yellow
- ✗ Error: Red
- Branch names: Cyan
- Summary: Bold white
- Separators: Gray

---

### Verbose Output (`--verbose`)

Shows full git status output for each repository.

**Structure**:
```
[Progress message]

[Main Repository Section]
  Repository name and path
  Branch information
  [Full git status output - multiple lines]

[Sub-repositories Section]
(Repeat for each sub-repo with full git status)

[Summary Line]
```

**Example**:
```bash
$ arashi status --verbose
Checking repository status...

Main Repository (/)
  Branch: main → origin/main [↑2]
  
  Changes to be committed:
    (use "git restore --staged <file>..." to unstage)
          modified:   src/commands/status.ts
  
  Changes not staged for commit:
    (use "git add <file>..." to update what will be committed)
    (use "git restore <file>..." to discard changes in working directory)
          modified:   README.md
  
  Untracked files:
    (use "git add <file>..." to include in what will be committed)
          test.txt

[... full output for each repo ...]

────────────────────────────────
Summary: 1 clean, 2 dirty (3 total)
```

---

### Short Output (`--short`)

Shows one line per repository for quick scanning.

**Structure**:
```
[Repo path] ([branch] [tracking]): [indicator] [change summary]
[... one line per repo ...]

Summary: X clean, Y dirty
```

**Example**:
```bash
$ arashi status --short
/ (main ↑2): ● 3 changes (2 modified, 1 untracked)
repos/arashi/ (020-status-command): ✓ clean
repos/config-mgmt/ (main): ● 1 change (1 modified)

Summary: 1 clean, 2 dirty
```

**Format Legend**:
- `↑N` = N commits ahead of remote
- `↓N` = N commits behind remote
- `↑N↓M` = N ahead, M behind (diverged)
- `✓` = clean repository
- `●` = dirty repository
- `✗` = error checking repository

---

## Error Handling

### Error: Not in Arashi Workspace

**Trigger**: Command run outside directory with `.arashi/config.json`

**Output**:
```bash
✗ Error: Not in an arashi workspace
  Run 'arashi init' to initialize a workspace
```

**Exit Code**: 2

---

### Error: Config Load Failed

**Trigger**: `.arashi/config.json` exists but is invalid

**Output**:
```bash
✗ Error: Failed to load workspace configuration
  [Specific error message from config parser]
```

**Exit Code**: 2

---

### Error: Repository Not Found

**Trigger**: Configured repository path does not exist

**Output** (continues checking other repos):
```bash
config-mgmt (repos/config-mgmt/)
  Status: ✗ Error - Repository not found at path
  
  Consider removing this repository from configuration:
    arashi remove config-mgmt
```

**Exit Code**: 1 (after showing all results)

---

### Error: Git Command Failed

**Trigger**: Git status command fails for a repository

**Output** (continues checking other repos):
```bash
broken-repo (repos/broken-repo/)
  Status: ✗ Error - Git command failed
  
  fatal: not a git repository (or any of the parent directories): .git
  
  Try running 'git fsck' to diagnose the issue
```

**Exit Code**: 1 (after showing all results)

---

### Error: Mutually Exclusive Options

**Trigger**: Both `--verbose` and `--short` provided

**Output**:
```bash
✗ Error: Cannot use --verbose and --short together
  Use 'arashi status --help' for usage information
```

**Exit Code**: 2

---

## Progress Indicators

### Checking Repositories

**When**: While executing git status on each repository

**Display**:
```bash
Checking repository status... ⠋
```

Uses ora spinner, updates as each repo completes.

---

### Incremental Results (Optional Enhancement)

Display results as each repository check completes instead of waiting for all to finish.

**Display**:
```bash
Checking repository status...

✓ arashi: clean
● config-mgmt: 2 changes
✓ docs: clean
...
```

---

## Integration Points

### Required from Existing Libraries

1. **Config Management** (`src/lib/config.ts`):
   - `loadConfig()`: Load workspace configuration
   - `ArashiConfig` type

2. **Git Utilities** (`src/lib/git.ts`):
   - New function needed: `getGitStatus(repoPath: string): Promise<GitStatusResult>`

3. **Logger** (`src/lib/logger.ts`):
   - `logger.info()`, `logger.error()`, `logger.success()`
   - `spinner()` for progress
   - `chalk` for colors

4. **Commander** (`src/index.ts`):
   - Register command with options

### Function Signature

```typescript
export async function statusCommand(options: StatusOptions): Promise<void>
```

**Parameters**:
- `options.verbose`: boolean - Show full git status
- `options.short`: boolean - Show one-line summary

**Returns**: Promise<void> - Outputs to stdout, throws on critical errors

**Throws**:
- `ArashiError` - Not in workspace
- `ConfigError` - Config load failed
- (Individual repo errors are handled gracefully, not thrown)

---

## Testing Contract

### Unit Test Cases

1. Parse git status porcelain output → GitFileStatus[]
2. Parse branch tracking info → BranchTrackingInfo
3. Format default output → string
4. Format verbose output → string
5. Format short output → string
6. Calculate summary statistics → StatusSummary

### Integration Test Cases

1. **Clean Workspace**: All repos clean → exit 0
2. **Dirty Workspace**: Some dirty repos → exit 0 (success, showing dirty state)
3. **Missing Repository**: Configured repo not found → exit 1, show error, continue
4. **Git Command Failure**: Corrupted repo → exit 1, show error, continue
5. **Not in Workspace**: Run outside arashi workspace → exit 2, show error
6. **Verbose Mode**: All output includes full git status
7. **Short Mode**: One line per repo
8. **Mutually Exclusive Options**: --verbose and --short → exit 2, show error
9. **Detached HEAD**: Show detached state correctly
10. **No Remote**: Omit tracking info when no remote configured
11. **Branch Ahead/Behind**: Show tracking status correctly

### Performance Test Cases

1. **10 Repositories**: Complete in <3 seconds (per spec SC-001)
2. **50 Repositories**: Reasonable performance with progress indicator
3. **Parallel Execution**: Verify concurrent git status execution

---

## Compatibility

### Git Version Requirements

- Minimum: Git 1.7.0 (for `--porcelain=v1` support)
- Tested: Git 2.30+ (current stable versions)

### Platform Support

- macOS ARM64: Full support
- Linux x64: Full support
- Windows x64: Full support with proper path handling

### Terminal Support

- Color output: Detects TTY, falls back to plain text
- Unicode symbols (✓, ●, ✗): Falls back to ASCII (+, *, x) if not supported
