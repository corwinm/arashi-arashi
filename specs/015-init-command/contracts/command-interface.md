# Command Interface Contract: arashi init

**Feature**: 015-init-command  
**Date**: 2026-02-05  
**Purpose**: Define the command-line interface contract for the init command

## Command Signature

```bash
arashi init [options]
```

## Description

Initialize Arashi workspace in the current git repository. Creates configuration directory, generates default settings, discovers existing repositories, and provides example hook templates.

**Prerequisites**:
- Must be run from within a git repository
- User must have write permissions in current directory

**Effects**:
- Creates `.arashi/` directory with configuration and hooks
- Generates `.arashi/config.json` with defaults
- Creates managed repositories directory (default: `./repos`)
- Updates `.gitignore` to exclude managed repositories
- Discovers and catalogs existing repositories in repos directory

---

## Options

### --repos-dir <path>

**Description**: Specify custom location for managed repositories

**Type**: string  
**Default**: `"./repos"`  
**Format**: Relative or absolute path

**Validation**:
- Must be valid path format
- Must not exceed 4096 characters
- Must not contain null bytes

**Examples**:
```bash
arashi init --repos-dir ./repositories
arashi init --repos-dir /absolute/path/to/repos
arashi init --repos-dir ../shared-repos
```

**Behavior**:
- Directory created if it doesn't exist
- Relative paths resolved from current directory
- Path stored in `config.json` as provided (relative/absolute)

---

### --force

**Description**: Overwrite existing configuration if present

**Type**: boolean flag  
**Default**: false

**Behavior**:
- If `.arashi/config.json` exists:
  - Without `--force`: Exit with error code 2
  - With `--force`: Backup existing config to `.arashi/config.json.backup-{timestamp}`, then create new config
- If `.arashi/` directory exists but no config: Proceeds normally (not an error)

**Examples**:
```bash
arashi init --force
```

**Warnings**:
- Command displays warning before overwriting
- Backup path shown in output

---

### --no-discover

**Description**: Skip automatic repository discovery

**Type**: boolean flag  
**Default**: false (discovery enabled)

**Behavior**:
- When enabled:
  - Skips scanning repos directory
  - `discovered_repos` in config remains empty `{}`
  - Faster initialization (useful for large workspaces)
- When disabled (default):
  - Scans repos directory up to depth 3
  - Populates `discovered_repos` with found repositories
  - Displays count in success message

**Examples**:
```bash
arashi init --no-discover
```

**Use Cases**:
- Large workspace with many repositories (slow discovery)
- Repos will be added manually later with `arashi add`
- Clean initialization for testing

---

### --auto-setup <boolean>

**Description**: Enable or disable automatic setup hook execution

**Type**: boolean  
**Default**: true

**Behavior**:
- Sets `config.auto_setup` field
- When true: Setup hooks run automatically during worktree creation
- When false: Setup hooks must be triggered manually

**Examples**:
```bash
arashi init --auto-setup=false
arashi init --no-auto-setup
```

---

### --dry-run

**Description**: Preview initialization without making any changes to the filesystem

**Type**: boolean flag  
**Default**: false

**Behavior**:
- Shows what would be created/modified without executing changes
- Displays configuration preview with all settings
- Shows all operations that would be performed
- No files or directories are created
- No modifications to .gitignore
- Exit code 0 if preview succeeds
- Can be combined with other options to preview their effects

**Output Format**:
```text
=== DRY RUN MODE ===
No changes will be made to the filesystem.

[DRY RUN] CREATE_DIR: /path/to/.arashi
[DRY RUN] CREATE_DIR: /path/to/.arashi/hooks
[DRY RUN] WRITE_FILE: /path/to/.arashi/hooks/pre-create.sh.example (761 bytes)
[DRY RUN] WRITE_FILE: /path/to/.arashi/hooks/post-create.sh.example (826 bytes)
[DRY RUN] WRITE_FILE: /path/to/.arashi/hooks/setup.sh.example (601 bytes)
[DRY RUN] CREATE_DIR: /path/to/repos
[DRY RUN] DISCOVER: Scan ./repos for git repositories
[DRY RUN] WRITE_FILE: /path/to/.arashi/config.json

Configuration preview:
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
[DRY RUN] UPDATE_FILE: /path/to/.gitignore (add: ./repos/)

=== DRY RUN COMPLETE ===
No changes were made. Run without --dry-run to apply.
```

**Examples**:
```bash
# Preview basic initialization
arashi init --dry-run

# Preview with custom options
arashi init --dry-run --repos-dir ./custom --no-auto-setup

# Preview force reinitialization (shows backup operation)
arashi init --dry-run --force
```

**Use Cases**:
- Verify configuration before applying
- Test custom repos-dir path
- Preview what would happen with --force
- Documentation/demonstration purposes
- CI/CD validation without side effects

---

### --verbose

**Description**: Show detailed progress information during initialization

**Type**: boolean flag  
**Default**: false

**Behavior**:
- Displays detailed progress for each initialization step
- Shows resolved paths and configuration values
- Includes timing information for the overall operation
- All verbose output prefixed with `[VERBOSE]`
- Can be combined with --dry-run for maximum visibility

**Output Additions**:
```text
[VERBOSE] Checking if current directory is a git repository...
[VERBOSE] ✓ Confirmed git repository at: /path/to/repo
[VERBOSE] Checking for existing Arashi configuration...
[VERBOSE] No existing configuration found
[VERBOSE] Validating repos directory path: ./repos
[VERBOSE] Resolved repos directory: /path/to/repo/repos
[VERBOSE] Creating .arashi directory: /path/to/repo/.arashi
[VERBOSE] ✓ .arashi directory created
[VERBOSE] Creating hooks directory: /path/to/repo/.arashi/hooks
[VERBOSE] ✓ Hooks directory created
[VERBOSE] Writing 3 hook templates...
[VERBOSE] ✓ Hook templates written
[VERBOSE] Creating repos directory: /path/to/repo/repos
[VERBOSE] ✓ Repos directory created
[VERBOSE] Discovering repositories in: ./repos
[VERBOSE] ✓ Found 2 repositories
[VERBOSE]   - my-app (main)
[VERBOSE]   - api-service (main)
[VERBOSE] Writing configuration file...
[VERBOSE] ✓ Configuration written
[VERBOSE] Updating .gitignore...
[VERBOSE] ✓ .gitignore updated
[VERBOSE] Initialization completed in 1.2s
```

**Examples**:
```bash
# Verbose initialization
arashi init --verbose

# Verbose with custom options
arashi init --verbose --repos-dir ./custom

# Verbose dry-run (maximum visibility)
arashi init --verbose --dry-run

# Verbose force reinitialization
arashi init --verbose --force
```

**Use Cases**:
- Debugging initialization issues
- Understanding what each step does
- Monitoring slow initialization (e.g., with many repos)
- Providing detailed logs for support
- CI/CD logging for audit trails

---

## Output

### Success Output

**Format** (color-coded with chalk):

```text
✓ Initialized Arashi workspace

Created:
  • Configuration: /path/to/repo/.arashi/config.json
  • Hooks directory: /path/to/repo/.arashi/hooks/
  • Repositories directory: /path/to/repo/repos/

Discovered 3 repositories:
  • my-app (main)
  • api-service (main)
  • shared-lib (develop)

Updated .gitignore to exclude: repos/

Next steps:
  • Create a worktree: arashi create <branch-name>
  • View configuration: cat .arashi/config.json
  • Customize hooks: cp .arashi/hooks/*.example .arashi/hooks/<name>.sh

Completed in 1.2s
```

**Output Components**:
- Checkmark (✓) + success message
- Created paths (absolute)
- Discovered repository count and names (with default branch)
- .gitignore update status
- Next steps guidance
- Total duration

---

### Error Output

**Format**:

```text
✗ Error: {error message}

{optional: additional context or guidance}
```

**Error Messages**:

#### NOT_GIT_REPOSITORY
```text
✗ Error: Not a git repository

The current directory is not a git repository.
Run 'git init' to initialize a repository first, or 'cd' to a git repository.
```

#### CONFIG_EXISTS
```text
✗ Error: Arashi configuration already exists

Found existing configuration at: /path/to/.arashi/config.json

To reinitialize, use: arashi init --force
This will backup your existing configuration.
```

#### PERMISSION_DENIED
```text
✗ Error: Permission denied

Cannot create directory: /path/to/.arashi
Reason: {filesystem error message}

Check directory permissions and try again.
```

#### DISK_FULL
```text
✗ Error: Insufficient disk space

Cannot write to: /path/to/.arashi/config.json
Reason: No space left on device

Free up disk space and try again.
```

#### INVALID_PATH
```text
✗ Error: Invalid path

The specified repos directory is invalid: {path}
Reason: {validation error}

Use a valid relative or absolute path.
```

#### CONFIG_WRITE_FAILED
```text
✗ Error: Failed to write configuration

Cannot write to: /path/to/.arashi/config.json
Reason: {error message}

Check permissions and disk space.
```

#### DISCOVERY_FAILED
```text
✗ Error: Repository discovery failed

Cannot scan directory: {path}
Reason: {error message}

Use --no-discover to skip discovery, or fix the error and try again.
```

---

## Exit Codes

| Code | Name | Condition | Recoverable |
|------|------|-----------|-------------|
| 0 | SUCCESS | Initialization completed successfully | N/A |
| 1 | NOT_GIT_REPOSITORY | Not in a git repository | Yes - run in git repo |
| 2 | CONFIG_EXISTS | Configuration already exists (without --force) | Yes - use --force |
| 3 | PERMISSION_DENIED | Insufficient permissions | Yes - fix permissions |
| 4 | DISK_FULL | Insufficient disk space | Yes - free space |
| 5 | INVALID_PATH | Invalid repos directory path | Yes - provide valid path |
| 6 | CONFIG_WRITE_FAILED | Failed to write configuration | Maybe - check permissions |
| 7 | DISCOVERY_FAILED | Repository discovery failed | Maybe - use --no-discover |
| 99 | UNKNOWN | Unexpected error | Unlikely |

**Exit Code Usage**:
```bash
# Success
arashi init
echo $?  # 0

# Already initialized
arashi init
echo $?  # 2

# Not in git repo
cd /tmp && arashi init
echo $?  # 1
```

---

## Side Effects

### File System Changes

**Created**:
- `.arashi/` directory (if doesn't exist)
- `.arashi/config.json` (always)
- `.arashi/hooks/` directory (if doesn't exist)
- `.arashi/hooks/pre-create.sh.example` (if doesn't exist)
- `.arashi/hooks/post-create.sh.example` (if doesn't exist)
- `.arashi/hooks/setup.sh.example` (if doesn't exist)
- `{repos-dir}/` directory (if doesn't exist)

**Modified**:
- `.gitignore` (appends repos directory entry if not present)

**Backed Up** (with --force):
- `.arashi/config.json` → `.arashi/config.json.backup-{timestamp}`

### Git State

**No changes to git state**:
- No git commands that modify repository
- No commits, branches, or worktrees created
- Only filesystem operations

---

## Behavior Specifications

### Idempotency

**Multiple runs without --force**:
1. First run: Success (exit code 0)
2. Second run: Error CONFIG_EXISTS (exit code 2)
3. Subsequent runs: Error CONFIG_EXISTS (exit code 2)

**Multiple runs with --force**:
1. First run: Success (exit code 0)
2. Second run with --force: Success (exit code 0), config backed up
3. Subsequent runs with --force: Success (exit code 0), new backup each time

### Rollback Behavior

**Partial Failure**:
If any operation fails after `.arashi/` directory creation:
1. Remove all created files/directories
2. Restore any modified files (e.g., .gitignore)
3. Display error message
4. Exit with appropriate error code
5. Leave repository in pre-init state

**Rollback Example**:
```text
Creating .arashi directory... ✓
Writing configuration... ✓
Creating repos directory... ✗ Permission denied

Rolling back changes...
  • Removed .arashi/ directory
  
✗ Error: Permission denied
Cannot create directory: ./repos
```

### Discovery Behavior

**With --no-discover**:
- Skips scanning
- Config has empty `discovered_repos: {}`
- Success message shows "Discovered 0 repositories"

**Without --no-discover** (default):
- Scans repos directory recursively (maxDepth: 3)
- Detects .git directories
- Gathers metadata: name, path, default branch
- Populates `discovered_repos` in config
- Success message lists found repositories

**Discovery Errors** (non-fatal):
- Permission errors: Logged as warnings, continue
- Invalid repositories: Skipped, logged as warnings
- Empty directory: Not an error, shows "Discovered 0 repositories"

---

## Examples

### Basic Initialization

```bash
$ cd /path/to/my-project
$ arashi init

✓ Initialized Arashi workspace

Created:
  • Configuration: /path/to/my-project/.arashi/config.json
  • Hooks directory: /path/to/my-project/.arashi/hooks/
  • Repositories directory: /path/to/my-project/repos/

Discovered 0 repositories

Updated .gitignore to exclude: repos/

Next steps:
  • Create a worktree: arashi create <branch-name>
  
Completed in 0.3s
```

### Custom Repos Directory

```bash
$ arashi init --repos-dir ./submodules

✓ Initialized Arashi workspace

Created:
  • Configuration: /path/to/my-project/.arashi/config.json
  • Repositories directory: /path/to/my-project/submodules/

Discovered 5 repositories:
  • frontend (main)
  • backend (main)
  • shared-types (main)
  • infrastructure (trunk)
  • docs (main)

Updated .gitignore to exclude: submodules/

Completed in 2.1s
```

### Reinitialize with Force

```bash
$ arashi init --force

⚠ Warning: Existing configuration will be backed up

Backing up: .arashi/config.json → .arashi/config.json.backup-2026-02-05T10-30-00

✓ Initialized Arashi workspace

Created:
  • Configuration: /path/to/my-project/.arashi/config.json
  
Discovered 3 repositories:
  • app (main)
  • api (main)
  • lib (develop)

Completed in 1.0s
```

### Skip Discovery

```bash
$ arashi init --no-discover

✓ Initialized Arashi workspace

Created:
  • Configuration: /path/to/my-project/.arashi/config.json
  • Hooks directory: /path/to/my-project/.arashi/hooks/
  • Repositories directory: /path/to/my-project/repos/

Discovery skipped (--no-discover)

Updated .gitignore to exclude: repos/

Next steps:
  • Add repositories: arashi add <path>
  
Completed in 0.2s
```

### Dry Run Preview

```bash
$ arashi init --dry-run

=== DRY RUN MODE ===
No changes will be made to the filesystem.

[DRY RUN] CREATE_DIR: /path/to/my-project/.arashi
[DRY RUN] CREATE_DIR: /path/to/my-project/.arashi/hooks
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/hooks/pre-create.sh.example (761 bytes)
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/hooks/post-create.sh.example (826 bytes)
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/hooks/setup.sh.example (601 bytes)
[DRY RUN] CREATE_DIR: /path/to/my-project/repos
[DRY RUN] DISCOVER: Scan ./repos for git repositories
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/config.json

Configuration preview:
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
[DRY RUN] UPDATE_FILE: /path/to/my-project/.gitignore (add: ./repos/)

=== DRY RUN COMPLETE ===
No changes were made. Run without --dry-run to apply.
```

### Verbose Initialization

```bash
$ arashi init --verbose

[VERBOSE] Checking if current directory is a git repository...
[VERBOSE] ✓ Confirmed git repository at: /path/to/my-project
[VERBOSE] Checking for existing Arashi configuration...
[VERBOSE] No existing configuration found
[VERBOSE] Validating repos directory path: ./repos
[VERBOSE] Resolved repos directory: /path/to/my-project/repos
[VERBOSE] Creating .arashi directory: /path/to/my-project/.arashi
[VERBOSE] ✓ .arashi directory created
[VERBOSE] Creating hooks directory: /path/to/my-project/.arashi/hooks
[VERBOSE] ✓ Hooks directory created
[VERBOSE] Writing 3 hook templates...
[VERBOSE] ✓ Hook templates written
[VERBOSE] Creating repos directory: /path/to/my-project/repos
[VERBOSE] ✓ Repos directory created
[VERBOSE] Discovering repositories in: ./repos
[VERBOSE] ✓ Found 0 repositories
[VERBOSE] Writing configuration file...
[VERBOSE] ✓ Configuration written
[VERBOSE] Updating .gitignore...
[VERBOSE] ✓ .gitignore updated
[VERBOSE] Initialization completed in 0.3s
✓ Initialized Arashi workspace

Created:
  • Configuration: /path/to/my-project/.arashi/config.json
  • Hooks directory: /path/to/my-project/.arashi/hooks/
  • Repositories directory: /path/to/my-project/repos/

Discovered 0 repositories

Updated .gitignore to exclude: repos/

Next steps:
  • Add repositories: arashi add <path>
  • View configuration: cat .arashi/config.json
  • Customize hooks: cp .arashi/hooks/*.example .arashi/hooks/<name>.sh
```

### Dry Run with Verbose

```bash
$ arashi init --dry-run --verbose

=== DRY RUN MODE ===
No changes will be made to the filesystem.

[VERBOSE] Checking if current directory is a git repository...
[VERBOSE] ✓ Confirmed git repository at: /path/to/my-project
[VERBOSE] Checking for existing Arashi configuration...
[VERBOSE] No existing configuration found
[VERBOSE] Validating repos directory path: ./repos
[VERBOSE] Resolved repos directory: /path/to/my-project/repos
[DRY RUN] CREATE_DIR: /path/to/my-project/.arashi
[DRY RUN] CREATE_DIR: /path/to/my-project/.arashi/hooks
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/hooks/pre-create.sh.example (761 bytes)
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/hooks/post-create.sh.example (826 bytes)
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/hooks/setup.sh.example (601 bytes)
[DRY RUN] CREATE_DIR: /path/to/my-project/repos
[DRY RUN] DISCOVER: Scan ./repos for git repositories
[DRY RUN] WRITE_FILE: /path/to/my-project/.arashi/config.json

Configuration preview:
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
[DRY RUN] UPDATE_FILE: /path/to/my-project/.gitignore (add: ./repos/)
[VERBOSE] Initialization completed in 0.0s

=== DRY RUN COMPLETE ===
No changes were made. Run without --dry-run to apply.
```

---

## Integration with Other Commands

### Commands that depend on init

All commands except `init` require `.arashi/config.json` to exist:

- `arashi create <branch>` - Creates worktrees
- `arashi remove <branch>` - Removes worktrees
- `arashi list` - Lists worktrees
- `arashi add <path>` - Adds repository to config
- `arashi status` - Shows worktree status

**Error if not initialized**:
```bash
$ arashi create feature/test

✗ Error: Arashi not initialized

Run 'arashi init' first to set up the workspace.
```

### State after init

**Ready for**:
- Creating worktrees (if repositories discovered)
- Adding repositories manually (if used --no-discover)
- Configuring hooks (copying .example files)

**Not yet configured**:
- Hook scripts (only examples provided)
- Repository-specific settings (default branch, bare repo)
- Worktrees (none created yet)

---

## Testing Contract

### Unit Tests

- ✅ Git repository validation
- ✅ Directory creation with permissions
- ✅ Config file generation with defaults
- ✅ .gitignore append logic (idempotent)
- ✅ Hook template generation
- ✅ Option parsing and validation
- ✅ Error code mapping

### Integration Tests

- ✅ Full init flow (success case)
- ✅ Init in non-git directory (error case)
- ✅ Init when already initialized (error case)
- ✅ Init with --force (backup case)
- ✅ Init with custom repos-dir
- ✅ Init with --no-discover
- ✅ Rollback on partial failure

### Edge Cases

- ✅ .gitignore doesn't exist (create new)
- ✅ .gitignore exists without trailing newline
- ✅ Repos directory already exists
- ✅ Permission errors during creation
- ✅ Disk full during write operations
- ✅ Special characters in paths (spaces, unicode)

---

## Summary

| Aspect | Specification |
|--------|---------------|
| **Command** | `arashi init [options]` |
| **Options** | --repos-dir, --force, --no-discover, --auto-setup, --dry-run, --verbose |
| **Exit Codes** | 0 (success), 1-7 (errors), 99 (unknown) |
| **Side Effects** | Creates .arashi/, writes config, updates .gitignore |
| **Idempotency** | Yes with --force; error without |
| **Rollback** | Automatic on failure (Constitution III) |
| **Discovery** | Auto by default; optional with --no-discover |
| **Dry Run** | Preview mode with --dry-run (no side effects) |
| **Verbose** | Detailed logging with --verbose |
| **Performance** | <30 seconds target (SC-001) |

**Contract Guarantees**:
1. Either succeeds completely or fails with clean rollback
2. Exit codes unambiguous and documented
3. Error messages actionable and clear
4. No git state modifications
5. Safe to run multiple times with --force
6. Dry-run mode guarantees no filesystem changes
