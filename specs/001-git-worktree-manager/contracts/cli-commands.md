# CLI Command Contracts

**Feature**: 001-git-worktree-manager  
**Document**: [D3] #9  
**Created**: 2026-02-03  
**Status**: Draft  
**Dependencies**: D2 (Type System)

## Purpose

This document defines the complete command-line interface for Arashi, including command signatures, options, behaviors, and output formats. All commands follow POSIX conventions and provide rich, user-friendly output.

## Scope

**In Scope**:
- All 7 Arashi commands (init, add, create, remove, list, status, setup)
- Command signatures with options and flags
- Expected behavior and validation
- Help text and examples
- Exit codes and error handling

**Out of Scope**:
- Implementation details (see code in repos/arashi)
- Internal APIs (see D4 Git Wrapper API)
- Worktree orchestration logic (see D5)

---

## Exit Codes

All Arashi commands use standard POSIX exit codes:

| Code | Meaning | When Used | Shell Behavior |
|------|---------|-----------|----------------|
| 0 | Success | Command completed successfully | Continue execution |
| 1 | Error | Command failed due to error (validation, git failure, etc.) | Stop execution |
| 2 | User Abort | User cancelled operation (Ctrl+C, interactive cancel) | Stop execution |

**Usage in Shell Scripts**:
```bash
# Check success
if arashi create feature-branch; then
  echo "Success"
fi

# Distinguish error from abort
arashi create feature-branch
case $? in
  0) echo "Success" ;;
  1) echo "Error occurred" ;;
  2) echo "User cancelled" ;;
esac
```

---

## Command Overview

| Command | Purpose | Phase |
|---------|---------|-------|
| `init` | Initialize Arashi project | Setup |
| `add` | Add repository to project | Setup |
| `create` | Create worktrees across repos | Daily workflow |
| `remove` | Remove worktrees and branches | Daily workflow |
| `list` | List existing worktrees | Inspection |
| `status` | Show worktree status | Inspection |
| `setup` | Run setup scripts | Maintenance |

---

## Commands

### arashi init

Initialize an Arashi project in the current directory.

**Signature**: 
```
arashi init [options]
```

**Description**:

Creates `.arashi/` directory with initial `config.json`. Scans for existing repositories in `repos_dir` and populates `discovered_repos`. Creates `repos_dir` if it doesn't exist.

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--repos-dir <name>` | | string | `"repos"` | Directory name for sub-repositories |
| `--no-auto-setup` | | flag | false | Disable automatic setup script execution |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Validate Environment**:
   - Check current directory is a git repository
   - Error if `.arashi/` already exists (already initialized)

2. **Create Structure**:
   - Create `.arashi/` directory
   - Create `.arashi/config.json` with defaults
   - Create `.arashi/hooks/` directory (empty)

3. **Discover Repositories**:
   - Create `repos_dir` if doesn't exist
   - Scan `repos_dir` for git repositories
   - For each repository found:
     - Extract default branch (query remote)
     - Extract remote URL
     - Check for `.arashi-setup.sh`
     - Add entry to `config.json` `discovered_repos`

4. **Output**:
   - Success message with repos discovered
   - Guidance on next steps (`arashi add <git-url>`)

**Exit Codes**:
- **0**: Successfully initialized
- **1**: Error (not a git repo, already initialized, filesystem error)
- **2**: N/A (no interactive prompts)

**Examples**:

```bash
# Initialize with defaults
arashi init
# Output:
# ✓ Initialized Arashi project
# ✓ Created .arashi/config.json
# ✓ Discovered 0 repositories in repos/
# 
# Next steps:
#   arashi add <git-url>  # Add a repository

# Initialize with custom repos directory
arashi init --repos-dir packages
# Output:
# ✓ Initialized Arashi project
# ✓ Created .arashi/config.json
# ✓ Discovered 2 repositories in packages/
#   - backend (main branch, https://github.com/example/backend.git)
#   - frontend (main branch, https://github.com/example/frontend.git)

# Initialize without auto-setup
arashi init --no-auto-setup
```

**Help Text**:

```
arashi init - Initialize Arashi project

USAGE
  arashi init [options]

OPTIONS
  --repos-dir <name>    Directory name for sub-repositories (default: "repos")
  --no-auto-setup       Disable automatic setup script execution
  -h, --help            Show this help message

DESCRIPTION
  Creates .arashi/ directory and config.json in the current git repository.
  Scans for existing repositories in repos_dir and populates discovered_repos.

EXAMPLES
  arashi init
  arashi init --repos-dir packages
  arashi init --no-auto-setup

EXIT CODES
  0   Success
  1   Error (not a git repo, already initialized)
```

**Validation**:
- Current directory must be a git repository (has `.git/`)
- `.arashi/` must not already exist
- `repos_dir` name must be valid directory name

**Error Messages**:
```
Error: Not a git repository
  Run `git init` first, then `arashi init`

Error: Arashi already initialized
  .arashi/ directory already exists

Error: Invalid repos directory name
  --repos-dir must be a valid directory name (got: "../invalid")
```

---

### arashi add

Add a repository to the Arashi project.

**Signature**:
```
arashi add <git-url> [name] [options]
```

**Description**:

Clones a git repository into `repos_dir` and adds it to `discovered_repos` in config.json. Creates optional `.arashi-setup.sh` template if repository doesn't have one.

**Arguments**:

| Argument | Required | Type | Description |
|----------|----------|------|-------------|
| `<git-url>` | Yes | string | Git remote URL (https or ssh) |
| `[name]` | No | string | Custom repository name (default: infer from URL) |

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--branch <branch>` | `-b` | string | (remote default) | Branch to checkout after clone |
| `--no-setup-template` | | flag | false | Skip creating .arashi-setup.sh template |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Validate**:
   - Ensure `.arashi/config.json` exists (project initialized)
   - Validate `git-url` format
   - Infer repository name from URL if not provided
   - Check repository doesn't already exist in `repos_dir`

2. **Clone Repository**:
   - Clone to `repos_dir/<name>`
   - Checkout specified branch (or default)
   - Fetch all branches

3. **Create Setup Template** (unless `--no-setup-template`):
   - If `.arashi-setup.sh` doesn't exist in repo:
     - Create template file with example content
     - Make executable (`chmod +x`)

4. **Update Config**:
   - Extract default branch from remote
   - Extract remote name (typically "origin")
   - Check for `.arashi-setup.sh`
   - Add entry to `config.json` `discovered_repos`

5. **Output**:
   - Progress indicator during clone
   - Success message with repository details

**Exit Codes**:
- **0**: Successfully added repository
- **1**: Error (not initialized, clone failed, invalid URL, already exists)
- **2**: N/A (no interactive prompts)

**Examples**:

```bash
# Add repository with default name
arashi add https://github.com/example/backend.git
# Output:
# Cloning into 'repos/backend'...
# ✓ Added repository 'backend'
#   Branch: main
#   Remote: origin
#   Setup script: Created template (.arashi-setup.sh)
# 
# Edit repos/backend/.arashi-setup.sh to customize setup behavior

# Add repository with custom name
arashi add https://github.com/example/api-server.git backend-api
# Output:
# ✓ Added repository 'backend-api'

# Add repository on specific branch
arashi add https://github.com/example/frontend.git -b develop
# Output:
# ✓ Added repository 'frontend' (checked out to develop)

# Add repository without setup template
arashi add git@github.com:example/ui.git --no-setup-template
```

**Help Text**:

```
arashi add - Add repository to project

USAGE
  arashi add <git-url> [name] [options]

ARGUMENTS
  <git-url>             Git remote URL (https or ssh)
  [name]                Custom repository name (default: infer from URL)

OPTIONS
  -b, --branch <branch> Branch to checkout (default: remote default branch)
  --no-setup-template   Skip creating .arashi-setup.sh template
  -h, --help            Show this help message

DESCRIPTION
  Clones a git repository into repos_dir and registers it in config.json.
  Optionally creates .arashi-setup.sh template for setup automation.

EXAMPLES
  arashi add https://github.com/example/backend.git
  arashi add https://github.com/example/api.git backend
  arashi add git@github.com:example/frontend.git -b develop
  arashi add https://github.com/example/ui.git --no-setup-template

EXIT CODES
  0   Success
  1   Error (not initialized, clone failed, already exists)
```

**Validation**:
- Project must be initialized (`.arashi/config.json` exists)
- `git-url` must be valid git URL (https:// or git@)
- Repository name must not already exist in `repos_dir`
- Repository name must be valid directory name

**Error Messages**:
```
Error: Arashi not initialized
  Run `arashi init` first

Error: Invalid git URL
  Must be https:// or git@ format (got: "not-a-url")

Error: Repository 'backend' already exists
  Remove repos/backend first or use a different name

Error: Failed to clone repository
  Git error: [git output]
```

---

### arashi create

Create worktrees across all repositories for a branch.

**Signature**:
```
arashi create <branch> [options]
```

**Description**:

Creates git worktrees in all repositories (or selected subset) for the specified branch. Optionally runs setup scripts. Supports automatic rollback on failure.

**Arguments**:

| Argument | Required | Type | Description |
|----------|----------|------|-------------|
| `<branch>` | Yes | string | Branch name to create worktrees for |

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--interactive` | `-i` | flag | false | Interactively select repos and branches |
| `--only <repos>` | | string | (all) | Comma-separated list of repo names |
| `--path <path>` | | string | `../<branch>` | Custom worktree base path |
| `--no-setup` | | flag | false | Skip running setup scripts |
| `--no-track` | | flag | false | Don't set upstream tracking |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Validate**:
   - Project initialized
   - At least one repository discovered
   - Target branch name valid (no spaces, special chars)
   - If `--only`: validate repo names exist

2. **Repository Selection**:
   - Default: All discovered repos
   - `--only repos`: Filter to specified repos
   - `-i/--interactive`: Prompt user to select repos

3. **Branch Strategy** (per repo):
   - Read `worktree_strategy` from config
   - `"same_branch"`: Use `<branch>` for all repos
   - `"independent"`: Keep repos on default branch
   - `"prompt"`: Ask user for each repo
   - Interactive mode: Always prompt

4. **Conflict Resolution**:
   - If branch already exists: Prompt user
     - Use existing branch
     - Create new branch with suffix (feature-branch-2)
     - Abort operation
   - Track choice in operation log

5. **Worktree Creation Flow** (see D5 for details):
   - Create operation log
   - For each repository:
     - Fetch latest
     - Create/checkout branch
     - Create worktree at `<path>/<repos_dir>/<repo_name>`
     - Set upstream tracking (unless `--no-track`)
     - Log operation for rollback
   - On error: Execute rollback (reverse order)

6. **Setup Scripts** (unless `--no-setup`):
   - For repos with `has_setup_script=true`:
     - Run `.arashi-setup.sh` in worktree
     - Stream output to console
     - Log results (non-fatal failures)

7. **Output**:
   - Progress indicator for each step
   - Summary of created worktrees
   - Setup script results

**Exit Codes**:
- **0**: Successfully created all worktrees
- **1**: Error (validation failed, git failure, see error details)
- **2**: User aborted (interactive cancel, Ctrl+C)

**Examples**:

```bash
# Create worktrees for feature branch (all repos)
arashi create feature-auth
# Output:
# Creating worktrees for branch 'feature-auth'...
# 
# ✓ backend: Created worktree (../feature-auth/repos/backend)
#   └─ Branch: feature-auth (tracking origin/feature-auth)
# ✓ frontend: Created worktree (../feature-auth/repos/frontend)
#   └─ Branch: feature-auth (tracking origin/feature-auth)
# 
# Running setup scripts...
# ✓ backend: Setup completed (2.3s)
# ✓ frontend: Setup completed (1.8s)
# 
# ✓ All worktrees created successfully
# 
# Next steps:
#   cd ../feature-auth
#   # Make changes across repos
#   git commit -am "Your changes"

# Interactive mode (select repos and branches)
arashi create feature-auth -i
# Output:
# ? Select repositories to include:
#   [x] backend
#   [x] frontend
#   [ ] docs
# 
# ? Branch name for 'backend': feature-auth
# ? Branch name for 'frontend': feature-auth
# 
# [... continues with creation ...]

# Create for specific repos only
arashi create feature-ui --only frontend,docs
# Output:
# Creating worktrees for branch 'feature-ui' (2 repos)...
# ✓ frontend: Created worktree
# ✓ docs: Created worktree

# Custom path without setup
arashi create hotfix-123 --path /tmp/hotfix --no-setup

# Independent branches (stay on default branch in sub-repos)
# Note: Requires config.json worktree_strategy="independent"
arashi create feature-backend
# Output:
# ✓ backend: Created worktree (branch: feature-backend)
# ✓ frontend: Created worktree (branch: main - independent mode)
```

**Help Text**:

```
arashi create - Create worktrees for a branch

USAGE
  arashi create <branch> [options]

ARGUMENTS
  <branch>              Branch name to create worktrees for

OPTIONS
  -i, --interactive     Interactively select repos and branch names
  --only <repos>        Comma-separated list of repo names (default: all)
  --path <path>         Custom worktree base path (default: ../<branch>)
  --no-setup            Skip running setup scripts
  --no-track            Don't set upstream tracking for branches
  -h, --help            Show this help message

DESCRIPTION
  Creates git worktrees across all (or selected) repositories for a branch.
  Handles branch conflicts, runs setup scripts, and supports rollback on failure.

EXAMPLES
  arashi create feature-auth
  arashi create feature-ui --only frontend,docs
  arashi create hotfix-123 --path /tmp/hotfix --no-setup
  arashi create feature-x -i

EXIT CODES
  0   Success
  1   Error (validation failed, git failure)
  2   User aborted
```

**Validation**:
- Project initialized
- Branch name valid (alphanumeric, hyphens, underscores, slashes)
- If `--only`: All specified repos exist
- If `--path`: Path doesn't already exist

**Error Messages**:
```
Error: Arashi not initialized
  Run `arashi init` first

Error: No repositories discovered
  Run `arashi add <git-url>` to add repositories

Error: Invalid branch name 'feature branch'
  Branch names cannot contain spaces

Error: Repository 'nonexistent' not found
  Available: backend, frontend, docs

Error: Worktree path already exists
  ../feature-auth already exists (remove it first)

Error: Failed to create worktree for 'backend'
  Git error: [git output]
  
  Rolling back changes...
  ✓ Removed worktree: backend
  ✓ Deleted branch: feature-auth
```

**Conflict Resolution Example**:
```bash
arashi create feature-auth
# Output:
# Branch 'feature-auth' already exists in 'backend'
# ? What would you like to do?
#   > Use existing branch
#     Create new branch (feature-auth-2)
#     Abort operation
# 
# [User selects option]
```

---

### arashi remove

Remove worktrees and optionally branches across repositories.

**Signature**:
```
arashi remove <branch> [options]
```

**Description**:

Removes git worktrees for a branch across all repositories. Optionally removes git branches and/or keeps worktree directories. Validates clean state before removal.

**Arguments**:

| Argument | Required | Type | Description |
|----------|----------|------|-------------|
| `<branch>` | Yes | string | Branch name to remove worktrees for |

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--keep-branches` | `-k` | flag | false | Keep git branches (only remove worktrees) |
| `--keep-worktrees` | `-w` | flag | false | Keep worktree directories (only remove git tracking) |
| `--force` | `-f` | flag | false | Skip confirmation prompt |
| `--no-check-dirty` | | flag | false | Skip dirty worktree check |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Discover Worktrees**:
   - Find all worktrees matching `<branch>` across repositories
   - Error if no worktrees found

2. **Validate Clean State** (unless `--no-check-dirty`):
   - Check each worktree for uncommitted changes
   - Warn if dirty worktrees found
   - Prompt to continue or abort

3. **Confirmation Prompt** (unless `--force`):
   - List worktrees to be removed
   - Show branches to be deleted (unless `--keep-branches`)
   - Ask for confirmation

4. **Remove Worktrees**:
   - For each repository:
     - Remove git worktree: `git worktree remove`
     - Delete worktree directory (unless `--keep-worktrees`)
     - Delete branch (unless `--keep-branches`): `git branch -D`
     - Log results

5. **Output**:
   - Progress for each removal
   - Summary of removed worktrees and branches

**Exit Codes**:
- **0**: Successfully removed all worktrees
- **1**: Error (no worktrees found, git failure)
- **2**: User aborted (confirmation declined, Ctrl+C)

**Examples**:

```bash
# Remove worktrees and branches (with confirmation)
arashi remove feature-auth
# Output:
# Found 2 worktrees for branch 'feature-auth':
#   backend: ../feature-auth/repos/backend
#   frontend: ../feature-auth/repos/frontend
# 
# This will:
#   - Remove 2 worktrees
#   - Delete 2 branches (feature-auth)
# 
# ? Continue? (y/N) y
# 
# Removing worktrees...
# ✓ backend: Removed worktree and branch
# ✓ frontend: Removed worktree and branch
# 
# ✓ Removed 2 worktrees and 2 branches

# Keep branches (only remove worktrees)
arashi remove feature-auth --keep-branches
# Output:
# ✓ backend: Removed worktree (kept branch)
# ✓ frontend: Removed worktree (kept branch)

# Keep directories (only remove git tracking)
arashi remove feature-auth --keep-worktrees
# Output:
# ✓ backend: Removed git worktree (kept directory)
# ✓ frontend: Removed git worktree (kept directory)

# Force removal without confirmation
arashi remove feature-auth -f
# [No confirmation prompt]

# Remove with dirty worktrees (skip check)
arashi remove feature-auth --no-check-dirty -f
```

**Help Text**:

```
arashi remove - Remove worktrees and branches

USAGE
  arashi remove <branch> [options]

ARGUMENTS
  <branch>              Branch name to remove worktrees for

OPTIONS
  -k, --keep-branches   Keep git branches (only remove worktrees)
  -w, --keep-worktrees  Keep worktree directories (only remove git tracking)
  -f, --force           Skip confirmation prompt
  --no-check-dirty      Skip dirty worktree check
  -h, --help            Show this help message

DESCRIPTION
  Removes git worktrees for a branch across all repositories.
  Optionally removes branches and/or keeps directories.
  Validates clean state before removal.

EXAMPLES
  arashi remove feature-auth
  arashi remove feature-auth --keep-branches
  arashi remove feature-auth -f
  arashi remove feature-auth --no-check-dirty -f

EXIT CODES
  0   Success
  1   Error (no worktrees found, git failure)
  2   User aborted
```

**Validation**:
- Project initialized
- Branch name provided
- At least one worktree found for branch

**Error Messages**:
```
Error: Arashi not initialized
  Run `arashi init` first

Error: No worktrees found for branch 'feature-auth'
  Available worktrees:
    feature-ui: backend, frontend
    hotfix-123: backend

Warning: Dirty worktrees detected
  backend: 2 uncommitted changes
  frontend: 1 uncommitted file
  
? Continue anyway? (y/N) n
Aborted.
```

**Confirmation Prompt Example**:
```
Found 3 worktrees for branch 'feature-auth':
  backend: ../feature-auth/repos/backend (clean)
  frontend: ../feature-auth/repos/frontend (2 uncommitted changes)
  docs: ../feature-auth/repos/docs (clean)

This will:
  - Remove 3 worktrees
  - Delete 3 branches (feature-auth)
  - Delete worktree directories

? Continue? (y/N) 
```

---

### arashi list

List all worktrees across repositories.

**Signature**:
```
arashi list [options]
```

**Description**:

Displays all git worktrees across discovered repositories. Supports verbose mode with detailed information and JSON output for scripting.

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--verbose` | `-v` | flag | false | Show detailed information (branches, paths, status) |
| `--json` | | flag | false | Output as JSON for scripting |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Discover Worktrees**:
   - Query `git worktree list` for each repository
   - Parse worktree paths, branches, and status
   - Group by branch name

2. **Format Output**:
   - Default: Tree view grouped by branch
   - Verbose: Include full paths, status, tracking info
   - JSON: Machine-readable structure

3. **Output**:
   - Worktree list with formatting
   - Summary count

**Exit Codes**:
- **0**: Success
- **1**: Error (not initialized, git failure)
- **2**: N/A

**Examples**:

```bash
# List all worktrees (default format)
arashi list
# Output:
# Worktrees:
# 
# main (bare repository)
#   backend: repos/backend
#   frontend: repos/frontend
# 
# feature-auth
#   backend: ../feature-auth/repos/backend
#   frontend: ../feature-auth/repos/frontend
# 
# feature-ui
#   frontend: ../feature-ui/repos/frontend
#   docs: ../feature-ui/repos/docs
# 
# Total: 3 branches, 7 worktrees

# Verbose output with details
arashi list -v
# Output:
# Worktrees:
# 
# main (bare repository)
#   backend
#     Path: /Users/dev/project/repos/backend
#     Branch: main (tracking origin/main)
#     Status: clean, up to date
#   frontend
#     Path: /Users/dev/project/repos/frontend
#     Branch: main (tracking origin/main)
#     Status: 2 uncommitted changes, 3 commits ahead
# 
# feature-auth
#   backend
#     Path: /Users/dev/feature-auth/repos/backend
#     Branch: feature-auth (tracking origin/feature-auth)
#     Status: clean, up to date
#   frontend
#     Path: /Users/dev/feature-auth/repos/frontend
#     Branch: feature-auth (tracking origin/feature-auth)
#     Status: clean, 1 commit ahead

# JSON output for scripting
arashi list --json
# Output:
# {
#   "worktrees": [
#     {
#       "branch": "main",
#       "is_bare": true,
#       "repos": [
#         {
#           "name": "backend",
#           "path": "/Users/dev/project/repos/backend",
#           "branch": "main",
#           "status": {
#             "is_dirty": false,
#             "ahead": 0,
#             "behind": 0,
#             "has_upstream": true
#           }
#         },
#         {
#           "name": "frontend",
#           "path": "/Users/dev/project/repos/frontend",
#           "branch": "main",
#           "status": {
#             "is_dirty": true,
#             "ahead": 3,
#             "behind": 0,
#             "has_upstream": true
#           }
#         }
#       ]
#     },
#     {
#       "branch": "feature-auth",
#       "is_bare": false,
#       "repos": [
#         {
#           "name": "backend",
#           "path": "/Users/dev/feature-auth/repos/backend",
#           "branch": "feature-auth",
#           "status": {
#             "is_dirty": false,
#             "ahead": 0,
#             "behind": 0,
#             "has_upstream": true
#           }
#         }
#       ]
#     }
#   ],
#   "summary": {
#     "total_branches": 2,
#     "total_worktrees": 3
#   }
# }
```

**Help Text**:

```
arashi list - List all worktrees

USAGE
  arashi list [options]

OPTIONS
  -v, --verbose         Show detailed information (paths, status, tracking)
  --json                Output as JSON for scripting
  -h, --help            Show this help message

DESCRIPTION
  Displays all git worktrees across discovered repositories.
  Groups worktrees by branch name.

EXAMPLES
  arashi list
  arashi list -v
  arashi list --json

EXIT CODES
  0   Success
  1   Error (not initialized)
```

**Validation**:
- Project initialized

**Error Messages**:
```
Error: Arashi not initialized
  Run `arashi init` first

Error: No repositories discovered
  Run `arashi add <git-url>` to add repositories
```

---

### arashi status

Show git status for all worktrees.

**Signature**:
```
arashi status [options]
```

**Description**:

Displays git status summary for all repositories. Shows uncommitted changes, branch tracking, and sync status with remote.

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--verbose` | `-v` | flag | false | Show detailed git status output |
| `--short` | `-s` | flag | false | Show compact one-line status |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Collect Status**:
   - Run `git status` in each repository
   - Parse status output (dirty, tracking, ahead/behind)
   - Aggregate results

2. **Format Output**:
   - Default: Summary format
   - Verbose: Full git status output
   - Short: One-line compact format

3. **Output**:
   - Status for each repository
   - Summary of dirty repos and sync status

**Exit Codes**:
- **0**: Success (even if repos are dirty)
- **1**: Error (not initialized, git failure)
- **2**: N/A

**Examples**:

```bash
# Default status
arashi status
# Output:
# Status:
# 
# backend (main)
#   ✓ Clean, up to date with origin/main
# 
# frontend (main)
#   ⚠ 2 uncommitted changes
#   ↑ 3 commits ahead of origin/main
# 
# docs (main)
#   ⚠ Uncommitted changes
#   ↓ 1 commit behind origin/main
# 
# Summary: 2 dirty repos, 1 ahead, 1 behind

# Verbose status with full git output
arashi status -v
# Output:
# backend (main):
# On branch main
# Your branch is up to date with 'origin/main'.
# 
# nothing to commit, working tree clean
# 
# ---
# 
# frontend (main):
# On branch main
# Your branch is ahead of 'origin/main' by 3 commits.
#   (use "git push" to publish your local commits)
# 
# Changes not staged for commit:
#   modified:   src/App.tsx
#   modified:   src/index.css
# 
# [... full git status output ...]

# Short status (compact)
arashi status -s
# Output:
# backend     ✓ clean
# frontend    ⚠ dirty, 3 ahead
# docs        ⚠ dirty, 1 behind
```

**Help Text**:

```
arashi status - Show git status for all repos

USAGE
  arashi status [options]

OPTIONS
  -v, --verbose         Show detailed git status output
  -s, --short           Show compact one-line status
  -h, --help            Show this help message

DESCRIPTION
  Displays git status summary for all repositories.
  Shows uncommitted changes, tracking, and sync status.

EXAMPLES
  arashi status
  arashi status -v
  arashi status -s

EXIT CODES
  0   Success (even if repos are dirty)
  1   Error (not initialized)
```

**Validation**:
- Project initialized

**Status Indicators**:
- `✓` Clean, up to date
- `⚠` Uncommitted changes (dirty)
- `↑` Commits ahead of upstream
- `↓` Commits behind upstream
- `?` No upstream tracking

---

### arashi setup

Run setup scripts for repositories.

**Signature**:
```
arashi setup [options]
```

**Description**:

Executes `.arashi-setup.sh` scripts for repositories that have them. Useful for re-running setup after dependencies change or for manual setup invocation.

**Options**:

| Option | Short | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--only <repos>` | | string | (all) | Comma-separated list of repo names |
| `--parallel` | | flag | false | Run setup scripts in parallel |
| `--verbose` | `-v` | flag | false | Show verbose output from scripts |
| `--help` | `-h` | flag | | Show help text |

**Behavior**:

1. **Select Repositories**:
   - Default: All repos with `has_setup_script=true`
   - `--only repos`: Filter to specified repos
   - Error if no repos have setup scripts

2. **Execute Setup Scripts**:
   - Sequential (default): Run one at a time
   - Parallel (`--parallel`): Run all simultaneously
   - For each repository:
     - Change to repository directory
     - Execute `./.arashi-setup.sh`
     - Capture stdout/stderr
     - Log duration and exit code

3. **Output**:
   - Progress indicator for each script
   - Default: Show spinner, hide output
   - Verbose: Stream output to console
   - Summary with timing and results

**Exit Codes**:
- **0**: All scripts succeeded
- **1**: One or more scripts failed (non-fatal, shows summary)
- **2**: N/A

**Examples**:

```bash
# Run setup for all repos
arashi setup
# Output:
# Running setup scripts...
# 
# ✓ backend: Setup completed (2.3s)
# ✓ frontend: Setup completed (1.8s)
# ✗ docs: Setup failed (exit code 1, 0.5s)
# 
# Summary: 2 succeeded, 1 failed

# Run setup for specific repos
arashi setup --only backend,frontend
# Output:
# Running setup scripts (2 repos)...
# ✓ backend: Setup completed (2.1s)
# ✓ frontend: Setup completed (1.9s)

# Run setup in parallel
arashi setup --parallel
# Output:
# Running setup scripts in parallel...
# [backend] Installing dependencies...
# [frontend] Installing dependencies...
# ✓ backend: Setup completed (2.3s)
# ✓ frontend: Setup completed (2.1s)

# Verbose output (show all script output)
arashi setup -v
# Output:
# Running setup scripts...
# 
# backend:
# + npm install
# added 342 packages in 2.1s
# + npm run build
# Built successfully
# ✓ Setup completed (2.3s)
# 
# frontend:
# + bun install
# Installed 156 packages in 1.8s
# ✓ Setup completed (1.8s)
```

**Help Text**:

```
arashi setup - Run setup scripts

USAGE
  arashi setup [options]

OPTIONS
  --only <repos>        Comma-separated list of repo names (default: all)
  --parallel            Run setup scripts in parallel
  -v, --verbose         Show verbose output from scripts
  -h, --help            Show this help message

DESCRIPTION
  Executes .arashi-setup.sh scripts for repositories that have them.
  Useful for re-running setup after dependency changes.

EXAMPLES
  arashi setup
  arashi setup --only backend,frontend
  arashi setup --parallel
  arashi setup -v

EXIT CODES
  0   All scripts succeeded
  1   One or more scripts failed
```

**Validation**:
- Project initialized
- At least one repository has setup script
- If `--only`: All specified repos exist and have setup scripts

**Error Messages**:
```
Error: Arashi not initialized
  Run `arashi init` first

Error: No repositories have setup scripts
  Add .arashi-setup.sh to repositories or use --no-setup-template when adding

Error: Repository 'backend' does not have a setup script
  Available repos with setup scripts: frontend, docs

Error: Setup script failed for 'backend' (exit code 1)
  Output:
    [script output]
```

---

## Common Patterns

### Global Flags

All commands support:
- `-h, --help`: Show command help
- `--version`: Show Arashi version (not shown in individual commands above)

### Interactive Prompts

Commands with prompts support:
- `Ctrl+C`: Cancel operation (exit code 2)
- Up/Down arrows: Navigate options
- Space: Toggle selection (multi-select)
- Enter: Confirm selection

### Output Formatting

- **Colors**: Green (✓ success), Red (✗ error), Yellow (⚠ warning), Blue (info)
- **Progress**: Spinners for long operations
- **Indentation**: Tree structure for nested information

### Error Handling

All errors follow format:
```
Error: <Short description>
  <Detailed explanation>
  <Suggested action>
```

Git errors include command output:
```
Error: Failed to create worktree
  Git error: fatal: invalid reference: feature-branch
  
  Suggestion: Create the branch first with `git branch feature-branch`
```

---

## Design Decisions

### Decision: POSIX-Style Options

**Choice**: Use single-dash for short options (`-i`), double-dash for long (`--interactive`)

**Rationale**: Industry standard (git, docker, npm). Familiar to all developers.

**Alternatives Considered**:
- Single-dash for all: Rejected (ambiguous for multi-char options)
- No short options: Rejected (verbose for common flags)

### Decision: Verbose as Default Output

**Choice**: Rich, colorful output with progress indicators by default

**Rationale**: Better UX for interactive use. Use `--json` for scripting.

**Alternatives Considered**:
- Minimal output by default: Rejected (poor interactive UX)
- Always verbose: Rejected (too noisy)

### Decision: Non-Destructive Defaults

**Choice**: Require confirmation for destructive operations (remove)

**Rationale**: Prevents accidental data loss. Power users can use `--force`.

**Alternatives Considered**:
- No confirmation: Rejected (dangerous)
- Always confirm: Rejected (annoying for safe operations)

### Decision: Rollback on Failure

**Choice**: Automatically rollback partial operations (create command)

**Rationale**: All-or-nothing semantics prevent inconsistent state.

**Alternatives Considered**:
- Leave partial state: Rejected (confusing cleanup)
- Manual rollback command: Rejected (complex UX)

### Decision: Three Exit Codes (0, 1, 2)

**Choice**: Distinguish success, error, and user abort

**Rationale**: Enables scripts to handle user cancellation differently from errors.

**Alternatives Considered**:
- Two exit codes (0, 1): Rejected (can't distinguish abort)
- Many exit codes: Rejected (unnecessary complexity)

---

## References

- **GitHub Issue**: #9 (D3 CLI Command Contracts)
- **Related Documents**:
  - D2: Type System (command option interfaces)
  - D4: Git Wrapper API (underlying git operations)
  - D5: Worktree Orchestration (create/remove logic)
  - D6: Hook System (hook execution during create)
- **External Resources**:
  - [POSIX Utility Conventions](https://pubs.opengroup.org/onlinepubs/9699919799/basedefs/V1_chap12.html)
  - [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
  - [Conventional Commits](https://www.conventionalcommits.org/)
- **Constitution Principles**:
  - Cross-platform: All commands work identically on macOS, Linux, Windows
  - Single-file executable: CLI packaged as single binary
  - User-friendly: Rich output, clear error messages, helpful examples
