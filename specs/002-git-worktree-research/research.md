# Git Worktree Fundamentals

**Research Task**: Document git worktree commands, limitations, and best practices  
**Created**: Tue Feb 03 2026  
**Status**: Complete

## Overview

Git worktrees allow multiple working directories to be attached to a single repository, enabling parallel work on different branches without switching contexts or stashing changes. This document provides comprehensive technical foundation for building worktree management tools.

## 1. Git Worktree Commands

### 1.1 git worktree add

Creates a new worktree and checks out a branch.

**Syntax:**
```bash
git worktree add <path> [<branch>]
git worktree add <path> -b <new-branch> [<start-point>]
```

**Examples:**
```bash
# Create worktree for existing branch
git worktree add ../feature-login feature-login

# Create new branch and worktree
git worktree add -b feature-auth ../feature-auth main

# Create worktree with detached HEAD at specific commit
git worktree add --detach ../hotfix abc123

# Force add even if path exists
git worktree add --force ../feature-login feature-login
```

**Key Behaviors:**
- Creates directory at `<path>` if it doesn't exist
- Checks out specified branch (or creates new branch with `-b`)
- Sets up .git file pointing to main repository
- Branch cannot be checked out in multiple worktrees simultaneously
- Default: creates branch from HEAD of current branch

### 1.2 git worktree list

Lists all worktrees attached to the repository.

**Syntax:**
```bash
git worktree list [--porcelain]
```

**Examples:**
```bash
# Human-readable format
git worktree list
# Output:
# /path/to/main-repo    abc123 [main]
# /path/to/feature      def456 [feature-login]

# Machine-readable format
git worktree list --porcelain
# Output:
# worktree /path/to/main-repo
# HEAD abc123def456...
# branch refs/heads/main
#
# worktree /path/to/feature
# HEAD def456abc123...
# branch refs/heads/feature-login
```

**Key Behaviors:**
- Main worktree (repository root) always listed first
- Shows absolute paths to all worktrees
- Displays current commit and branch for each worktree
- `--porcelain` format is stable for scripting

### 1.3 git worktree remove

Removes a worktree and cleans up metadata.

**Syntax:**
```bash
git worktree remove <worktree>
git worktree remove --force <worktree>
```

**Examples:**
```bash
# Remove clean worktree
git worktree remove ../feature-login

# Force remove (even with uncommitted changes)
git worktree remove --force ../feature-login

# Remove by path or branch name
git worktree remove feature-login
```

**Key Behaviors:**
- Refuses to remove worktree with uncommitted changes (unless `--force`)
- Deletes worktree directory and `.git/worktrees/<name>` metadata
- Branch remains after worktree removal
- Safe to remove locked worktrees with `--force`

### 1.4 git worktree prune

Removes stale worktree metadata.

**Syntax:**
```bash
git worktree prune [--dry-run] [--verbose]
```

**Examples:**
```bash
# Preview what would be pruned
git worktree prune --dry-run --verbose

# Remove stale metadata
git worktree prune
```

**Key Behaviors:**
- Cleans up `.git/worktrees/` entries for deleted directories
- Automatically run by other worktree commands
- Skips locked worktrees
- Safe to run regularly (idempotent)

### 1.5 git worktree lock

Prevents worktree from being pruned.

**Syntax:**
```bash
git worktree lock [--reason <string>] <worktree>
```

**Examples:**
```bash
# Lock with reason
git worktree lock --reason "On removable drive" ../feature-login

# Lock without reason
git worktree lock ../feature-login
```

**Key Behaviors:**
- Creates `locked` file in `.git/worktrees/<name>/`
- Prevents accidental pruning when worktree is on removable media
- Reason stored in `locked` file for documentation
- Does not prevent manual removal with `--force`

### 1.6 git worktree unlock

Allows worktree to be pruned again.

**Syntax:**
```bash
git worktree unlock <worktree>
```

**Examples:**
```bash
# Unlock worktree
git worktree unlock ../feature-login
```

**Key Behaviors:**
- Removes `locked` file from `.git/worktrees/<name>/`
- Worktree can now be pruned if directory is missing
- No effect on unlocked worktrees

### 1.7 git worktree move

Moves a worktree to a new location.

**Syntax:**
```bash
git worktree move <worktree> <new-path>
```

**Examples:**
```bash
# Move worktree to new location
git worktree move ../feature-login ../new-location/feature-login

# Move with force (overwrite destination)
git worktree move --force ../feature-login ../existing-dir
```

**Key Behaviors:**
- Updates `.git/worktrees/<name>/gitdir` to point to new location
- Updates `.git` file in worktree to maintain connection
- Refuses if destination exists (unless `--force`)
- Locked worktrees can be moved
- Introduced in Git 2.17.0

## 2. Version Requirements

### 2.1 Minimum Version

**Git 2.5.0** (July 2015) introduced `git worktree` command.

**Rationale**: Earlier versions used `git checkout --to` (experimental), which had different semantics and is now deprecated.

### 2.2 Version-Specific Features

| Git Version | Feature | Description |
|-------------|---------|-------------|
| 2.5.0 | Initial release | Basic add, list, prune commands |
| 2.7.0 | Lock/unlock | Prevent pruning of worktrees on removable media |
| 2.15.0 | Improved cleanup | Better handling of stale worktree metadata |
| 2.17.0 | Move command | Relocate worktrees without manual cleanup |
| 2.22.0 | Remove command | Dedicated command to remove worktrees (previously manual) |
| 2.25.0 | Branch name inference | Better default branch naming from path |

**Recommendation**: Target Git 2.22.0+ for modern worktree management tools to access `remove` command.

## 3. Repository Type Behavior

### 3.1 Regular Repositories

**Structure:**
```
my-repo/
├── .git/              # Full git directory
│   ├── worktrees/     # Worktree metadata
│   │   └── feature-login/
│   │       ├── gitdir     # Points to worktree's .git file
│   │       ├── HEAD       # Current commit
│   │       ├── locked     # Lock file (optional)
│   │       └── ...
│   ├── refs/
│   ├── objects/
│   └── ...
└── src/               # Working directory
```

**Characteristics:**
- Main worktree is the repository itself
- `.git` is a directory
- Worktrees created as siblings or subdirectories
- All worktrees share `.git/objects` and `.git/refs`

### 3.2 Bare Repositories

**Structure:**
```
my-repo.git/           # Bare repository
├── worktrees/         # Worktree metadata (top-level)
│   └── feature-login/
│       ├── gitdir
│       ├── HEAD
│       └── ...
├── refs/
├── objects/
└── ...

../worktrees/          # Actual worktrees (elsewhere)
├── main/
│   └── .git           # Points to my-repo.git/worktrees/main
└── feature-login/
    └── .git           # Points to my-repo.git/worktrees/feature-login
```

**Characteristics:**
- No main worktree (bare repository has no working directory)
- All worktrees are equal (no primary worktree)
- `worktrees/` directory at repository root level (not in `.git/`)
- Common in CI/CD and server environments
- All branches must be in worktrees to be modified

**Differences Summary:**

| Aspect | Regular Repo | Bare Repo |
|--------|-------------|-----------|
| Main worktree | Yes (repo root) | No |
| Worktree metadata | `.git/worktrees/` | `worktrees/` |
| Working directory | Repo root + worktrees | All in worktrees |
| Typical use case | Local development | CI/CD, servers |

## 4. Worktree Location Strategies

### 4.1 Sibling Directories

**Structure:**
```
projects/
├── my-repo/           # Main repository
├── my-repo-feature-1/ # Worktree 1
└── my-repo-feature-2/ # Worktree 2
```

**Pros:**
- Clear separation from main repository
- Easy to identify worktrees by directory name
- No nesting complexity
- Works well with IDE project switching

**Cons:**
- Parent directory can become cluttered
- Harder to associate worktrees with main repo visually
- Requires consistent naming convention

**Best for:** Teams with many concurrent features, long-lived worktrees

### 4.2 Subdirectories

**Structure:**
```
my-repo/               # Main repository
├── .git/
├── .worktrees/        # Worktree container
│   ├── feature-1/     # Worktree 1
│   └── feature-2/     # Worktree 2
└── src/
```

**Pros:**
- Keeps worktrees organized within project
- Clear ownership and association
- Single directory to delete when cleaning up project

**Cons:**
- Worktrees can accidentally be committed if not in .gitignore
- May confuse IDE/tools that scan project directory
- Nested paths can be longer

**Best for:** Individual developers, short-lived worktrees, experimentation

### 4.3 Centralized Location

**Structure:**
```
~/.worktrees/
├── repo1-main/
├── repo1-feature-1/
├── repo2-main/
└── repo2-feature-2/
```

**Pros:**
- All worktrees in one predictable location
- Easy to find and manage globally
- Separate from repository directories

**Cons:**
- Requires consistent naming to identify repositories
- Path navigation more cumbersome
- Less discoverable for team members

**Best for:** Personal preference, scripted workflows, multiple repositories

### 4.4 Recommendation

**Default strategy**: Sibling directories with naming pattern `<repo>-<branch>`

**Rationale:**
- Balances discoverability with organization
- Compatible with most IDEs and tools
- No risk of accidental commits
- Easy to automate and script

## 5. Common Error Scenarios

### 5.1 Insufficient Disk Space

**Error:**
```
fatal: could not create leading directories of '/path/to/worktree': No space left on device
```

**Cause:** Not enough disk space to create worktree directory or checkout files.

**Resolution:**
1. Check available disk space: `df -h`
2. Free up space or choose different location
3. Use sparse checkout if repository is large

**Prevention:**
- Check disk space before creating worktrees
- Monitor disk usage in automated workflows
- Use disk space thresholds in CI/CD

### 5.2 Permission Denied

**Error:**
```
fatal: could not create work tree dir '/path/to/worktree': Permission denied
```

**Cause:** Insufficient permissions to create directory at specified path.

**Resolution:**
1. Check directory permissions: `ls -la /path/to/`
2. Use location where user has write access
3. Adjust permissions if appropriate: `chmod u+w /path/to/`

**Prevention:**
- Validate write permissions before worktree operations
- Use user-writable locations by default
- Provide clear error messages about permission issues

### 5.3 Branch Already Checked Out

**Error:**
```
fatal: 'feature-login' is already checked out at '/path/to/existing-worktree'
```

**Cause:** Attempting to check out a branch that's already active in another worktree.

**Resolution:**
1. List existing worktrees: `git worktree list`
2. Use different branch name
3. Remove existing worktree first (if appropriate)
4. Use `--detach` flag if HEAD position is needed without branch

**Prevention:**
- Check worktree list before creating new worktrees
- Use unique branch names per worktree
- Provide interactive branch selection in tools

### 5.4 Path Already Exists

**Error:**
```
fatal: '/path/to/worktree' already exists
```

**Cause:** Target directory already exists.

**Resolution:**
1. Choose different path
2. Remove existing directory if safe
3. Use `--force` flag to overwrite (use with caution)

**Prevention:**
- Check path existence before creation
- Generate unique paths automatically
- Prompt user for confirmation before overwriting

### 5.5 Corrupt Worktree Metadata

**Error:**
```
fatal: invalid gitdir file
```

**Cause:** `.git` file in worktree or `.git/worktrees/<name>/gitdir` file is corrupted or has invalid path.

**Resolution:**
1. Manually prune stale metadata: `git worktree prune`
2. Fix `.git` file in worktree to point to correct location
3. Remove and recreate worktree if metadata is unrecoverable
4. Check filesystem integrity if corruption is recurring

**Prevention:**
- Use `git worktree move` instead of manual directory moves
- Regular backups of repository metadata
- Validate gitdir file format after operations

## 6. Remote Tracking Setup

### 6.1 New Branch from Existing Branch

```bash
# Create worktree with new branch
git worktree add -b feature-login ../feature-login main

# In the worktree, set up remote tracking
cd ../feature-login
git push -u origin feature-login
```

**Key Points:**
- New branch initially has no upstream tracking
- `-u` flag sets up tracking during first push
- Subsequent pulls/pushes use tracked remote automatically

### 6.2 Existing Remote Branch

```bash
# Create worktree tracking remote branch
git worktree add ../feature-login origin/feature-login

# Or create with explicit tracking
git worktree add -b feature-login ../feature-login --track origin/feature-login
```

**Key Points:**
- Git automatically sets up tracking if branch exists remotely
- Local branch name can differ from remote branch name
- `--track` flag makes relationship explicit

### 6.3 Branch Without Remote

```bash
# Create worktree for local-only branch
git worktree add ../experiment experiment-branch

# Later, push and set up tracking
cd ../experiment
git push -u origin experiment-branch
```

**Key Points:**
- Local-only branches are valid for worktrees
- Can add remote tracking at any time
- Useful for temporary or experimental work

### 6.4 Fetch Behavior

```bash
# Fetch updates all remote-tracking branches
git fetch origin

# Affects all worktrees (shared refs)
cd /path/to/any/worktree
git status  # Shows "Your branch is behind 'origin/main'"
```

**Key Points:**
- Fetch updates are visible in all worktrees
- Each worktree can pull independently
- Conflicts must be resolved per worktree
- Shared object store means efficient fetching

## 7. .git File Format (Gitlink)

### 7.1 Structure

In a worktree, the `.git` is a **file** (not directory) containing a gitlink reference:

```
gitdir: /absolute/path/to/main-repo/.git/worktrees/feature-login
```

**Format:**
- Single line starting with `gitdir:`
- Followed by space and absolute path
- Points to worktree's metadata directory in main repository
- No trailing newline required (but typically present)

### 7.2 Metadata Directory Contents

```
.git/worktrees/feature-login/
├── gitdir          # Points back to worktree's .git file
├── HEAD            # Current commit/branch
├── commondir       # Points to shared .git directory
├── locked          # Lock file (optional)
├── index           # Staging area (worktree-specific)
├── logs/           # Reflog (worktree-specific)
└── refs/           # Local refs (worktree-specific)
```

**Key Files:**

**gitdir** (in metadata):
```
/absolute/path/to/worktree/.git
```
Points back to the worktree's .git file (circular reference for validation).

**commondir**:
```
..
```
Relative path to shared .git directory (usually just parent directory).

### 7.3 Shared vs Worktree-Specific

**Shared across all worktrees:**
- `.git/objects/` - Object database
- `.git/refs/remotes/` - Remote-tracking branches
- `.git/refs/heads/` - Branch refs (shared, but branch can only be checked out once)
- `.git/config` - Repository configuration

**Worktree-specific:**
- `HEAD` - Current commit/branch
- `index` - Staging area
- `logs/HEAD` - HEAD reflog
- `refs/bisect/` - Bisect refs
- `MERGE_HEAD`, `CHERRY_PICK_HEAD`, etc. - Operation state

### 7.4 Manual Inspection

```bash
# View worktree's .git file
cat /path/to/worktree/.git
# Output: gitdir: /path/to/main/.git/worktrees/feature-login

# View metadata's gitdir file
cat /path/to/main/.git/worktrees/feature-login/gitdir
# Output: /path/to/worktree/.git

# View current branch
cat /path/to/main/.git/worktrees/feature-login/HEAD
# Output: ref: refs/heads/feature-login
```

**Use Cases:**
- Debugging worktree issues
- Implementing low-level worktree tools
- Understanding git internals
- Troubleshooting corrupt metadata

## 8. Edge Cases and Considerations

### 8.1 Symbolic Links Not Required

Git worktrees do **not** use symbolic links. They use gitlink files (.git file with path) and shared object storage.

**Implication:** Worktrees work on filesystems without symlink support (Windows FAT32, some network drives).

### 8.2 Moving Main Repository

If main repository is moved or renamed:

```bash
# Worktrees break because .git file points to old location
cd /path/to/worktree
git status
# fatal: not a git repository

# Fix: Update .git file in each worktree
echo "gitdir: /new/path/to/repo/.git/worktrees/feature-login" > .git

# Or recreate worktrees
```

**Best Practice:** Use `git worktree move` for worktrees, but main repository moves require manual updates.

### 8.3 Locked Worktrees During Remove

```bash
# Locked worktree
git worktree lock ../feature-login

# Attempt remove
git worktree remove ../feature-login
# fatal: validation failed, cannot remove working tree: worktree is locked

# Force remove (ignores lock)
git worktree remove --force ../feature-login
```

**Use Case:** Prevent accidental removal of worktrees on removable drives.

### 8.4 Case-Insensitive Filesystems

macOS and Windows use case-insensitive filesystems by default.

```bash
# These conflict on case-insensitive filesystems
git worktree add ../Feature feature
git worktree add ../feature feature2
# Second command fails: '/path/../feature' already exists

# Branch names can differ in case
git branch Feature feature-base
git branch feature other-base
# Both exist, but checking out in worktrees may be ambiguous
```

**Best Practice:** Use consistent casing for branch names and worktree paths.

### 8.5 Metadata Corruption Recovery

If `.git/worktrees/` becomes corrupted:

```bash
# Prune stale entries
git worktree prune

# If worktree .git file is broken, recreate it
echo "gitdir: $(git rev-parse --git-dir)/worktrees/feature-login" > /path/to/worktree/.git

# If metadata is completely lost, remove and recreate worktree
rm -rf /path/to/worktree
git worktree add /path/to/worktree feature-login
```

**Prevention:**
- Use git commands (not manual file operations)
- Regular backups of `.git` directory
- Validate worktree operations in scripts

## 9. Best Practices Summary

### 9.1 Creating Worktrees

- Check available disk space before creation
- Use consistent naming convention for worktree paths
- Set up remote tracking during or immediately after creation
- Add worktree paths to global .gitignore if using subdirectories
- Validate target path doesn't exist (unless intentionally overwriting)

### 9.2 Managing Worktrees

- Run `git worktree prune` periodically to clean stale metadata
- Use `git worktree list` to track active worktrees
- Lock worktrees on removable media or temporary locations
- Use `git worktree move` instead of manual directory moves
- Document worktree purposes in commit messages or branch descriptions

### 9.3 Removing Worktrees

- Commit or stash changes before removal
- Use `git worktree remove` instead of manual directory deletion
- Consider keeping branch even if worktree is removed (branches are cheap)
- Check for uncommitted changes before force removal
- Prune after bulk removals to clean up metadata

### 9.4 Automation and Tools

- Target Git 2.22.0+ for modern features
- Parse `git worktree list --porcelain` for scripting
- Handle errors gracefully with user-friendly messages
- Provide progress indicators for long operations
- Validate prerequisites (git version, disk space, permissions)

## 10. References

- **Official Git Documentation**: https://git-scm.com/docs/git-worktree
- **Git Release Notes**: https://github.com/git/git/tree/master/Documentation/RelNotes
- **Pro Git Book - Git Internals**: https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain

---

**Document Version**: 1.0  
**Last Updated**: Tue Feb 03 2026  
**Research Completed**: All acceptance criteria from spec.md satisfied
