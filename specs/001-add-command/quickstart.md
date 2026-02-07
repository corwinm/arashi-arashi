# Quickstart: Add Command

**Feature**: 001-add-command  
**Date**: 2026-02-06  
**Audience**: Developers using Arashi

## Overview

The `arashi add` command adds a Git repository to your Arashi workspace, making it available for worktree management. This guide shows you how to use the command effectively.

---

## Basic Usage

### Add a Repository

```bash
arashi add https://github.com/user/repo.git
```

**What happens**:
1. ✓ Validates the Git URL
2. ✓ Clones the repository to `./repos/repo/`
3. ✓ Detects the default branch (e.g., `main`)
4. ✓ Checks for setup scripts (e.g., `setup.sh`)
5. ✓ Updates workspace configuration

**Output**:
```
✓ Validating Git URL...
✓ Cloning repository from https://github.com/user/repo.git...
✓ Detected default branch: main
✓ Found setup script: setup.sh
✓ Updated configuration

Repository added successfully:
  Name:     repo
  Location: ./repos/repo
  Branch:   main
  Setup:    ./repos/repo/setup.sh

Next steps:
  1. Run setup: cd ./repos/repo && ./setup.sh
  2. Create worktree: arashi create my-branch
```

---

## Common Scenarios

### Scenario 1: Add Repository with Custom Name

When the auto-detected name conflicts with an existing repository or you prefer a custom name:

```bash
arashi add https://github.com/user/common-repo.git --name my-custom-name
```

**Use cases**:
- Multiple forks of the same repository
- Avoiding name conflicts
- Preference for descriptive names

**Example**:
```bash
# Add two forks of the same repo
arashi add https://github.com/original/repo.git --name repo-original
arashi add https://github.com/myfork/repo.git --name repo-fork
```

---

### Scenario 2: Add Repository via SSH

For private repositories or when you prefer SSH authentication:

```bash
arashi add git@github.com:user/private-repo.git
```

**Prerequisites**:
- SSH keys configured with your Git host
- SSH agent running (if key is passphrase-protected)

**Verify SSH access**:
```bash
ssh -T git@github.com
# Should output: Hi username! You've successfully authenticated...
```

---

### Scenario 3: Add Repository with Setup Script

When the repository needs dependencies installed or configuration:

```bash
# Repository has setup.sh already
arashi add https://github.com/user/repo.git

# Create setup.sh template if missing
arashi add https://github.com/user/repo.git --create-setup
```

**Setup script detection**:
Arashi automatically detects these common setup scripts:
- `setup.sh`, `setup.bash`
- `install.sh`, `bootstrap.sh`
- `setup.ps1` (Windows)
- `setup.py` (Python)
- `Makefile` (with `setup` or `install` target)

**Running detected setup**:
```bash
cd ./repos/repo
./setup.sh
```

---

### Scenario 4: Add Local Repository

Clone from a local filesystem path:

```bash
# Absolute path
arashi add file:///home/user/repos/local-repo.git

# Or simplified syntax
arashi add /home/user/repos/local-repo.git
```

**Use cases**:
- Working with local Git servers
- Testing with local repositories
- Air-gapped environments

---

### Scenario 5: Batch Add Multiple Repositories

Add multiple repositories in sequence:

```bash
arashi add https://github.com/user/repo1.git
arashi add https://github.com/user/repo2.git --name backend
arashi add https://github.com/user/repo3.git --name frontend
```

**Or use a script**:
```bash
#!/bin/bash
REPOS=(
  "https://github.com/user/repo1.git"
  "https://github.com/user/repo2.git"
  "https://github.com/user/repo3.git"
)

for repo in "${REPOS[@]}"; do
  arashi add "$repo" --force
done
```

---

## Error Handling

### Error: Invalid URL Format

**Error message**:
```
✗ Invalid Git URL format

The URL "invalid-url" is not a valid Git repository URL.

Supported formats:
  - HTTPS: https://github.com/user/repo.git
  - SSH:   git@github.com:user/repo.git
  - Git:   git://host/repo.git
  - File:  file:///path/to/repo.git
  - SCP:   user@host:repo.git
```

**Solution**: Use a valid Git URL format (see examples above)

---

### Error: Duplicate Repository Name

**Error message**:
```
✗ Repository name already exists

A repository named "repo" already exists at ./repos/repo.

Solutions:
  1. Use a different name: arashi add <url> --name repo-2
  2. Remove existing repo: arashi remove repo
```

**Solution 1: Use custom name**
```bash
arashi add https://github.com/user/repo.git --name repo-v2
```

**Solution 2: Remove existing repository first**
```bash
arashi remove repo
arashi add https://github.com/user/repo.git
```

---

### Error: Clone Failed

**Error message**:
```
✗ Failed to clone repository

Git clone failed with error:
  fatal: repository 'https://github.com/user/repo.git' not found

Common causes:
  - Network connectivity issues
  - Repository doesn't exist or is private
  - Authentication required (use SSH with configured keys)
  - Insufficient disk space
```

**Solutions**:

**For private repositories**, use SSH:
```bash
arashi add git@github.com:user/private-repo.git
```

**For network issues**, check connectivity:
```bash
ping github.com
git clone https://github.com/user/repo.git /tmp/test-clone
```

**For authentication**, set up SSH keys:
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add public key to GitHub/GitLab/Bitbucket
ssh-add ~/.ssh/id_ed25519
```

---

### Error: Unable to Detect Default Branch

**Error message**:
```
✗ Unable to detect default branch

The repository has no remote branches or HEAD is not set.

This may be an empty repository. Possible solutions:
  1. Create an initial commit in the repository
  2. Set a default branch: git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main
```

**Solution**: Initialize the repository with at least one commit

```bash
# On the Git server or original repo
cd /path/to/repo
echo "# My Project" > README.md
git add README.md
git commit -m "Initial commit"
git push -u origin main

# Then try adding again
arashi add https://github.com/user/repo.git
```

---

## Advanced Usage

### Using --force to Skip Prompts

For automation or CI/CD:

```bash
arashi add https://github.com/user/repo.git --force
```

**When to use**:
- Scripted repository setup
- CI/CD pipelines
- Batch operations
- When you're certain of the operation

---

### JSON Output for Scripting

Get machine-readable output:

```bash
arashi add https://github.com/user/repo.git --json
```

**Output**:
```json
{
  "success": true,
  "repository": {
    "name": "repo",
    "path": "./repos/repo",
    "gitUrl": "https://github.com/user/repo.git",
    "defaultBranch": "main",
    "setupScript": "./repos/repo/setup.sh",
    "setupScriptCreated": false
  }
}
```

**Use in scripts**:
```bash
#!/bin/bash
result=$(arashi add https://github.com/user/repo.git --json)
name=$(echo "$result" | jq -r '.repository.name')
path=$(echo "$result" | jq -r '.repository.path')

echo "Added $name at $path"
```

---

## URL Format Reference

### HTTPS URLs

```bash
# With .git suffix
arashi add https://github.com/user/repo.git

# Without .git suffix
arashi add https://github.com/user/repo

# Private Git server
arashi add https://git.company.com/team/project.git

# With credentials (not recommended - use SSH instead)
arashi add https://username:token@github.com/user/repo.git
```

---

### SSH URLs

```bash
# Standard SSH
arashi add git@github.com:user/repo.git

# Explicit SSH protocol
arashi add ssh://git@github.com/user/repo.git

# Custom SSH port
arashi add ssh://git@github.com:2222/user/repo.git

# Private server
arashi add git@git.company.com:team/project.git
```

---

### Git Protocol URLs

```bash
# Public Git protocol (read-only)
arashi add git://github.com/user/repo.git

# Private Git server
arashi add git://git.company.com/repo.git
```

---

### File URLs

```bash
# Absolute path with file:// protocol
arashi add file:///home/user/repos/local-repo.git

# Absolute path without protocol
arashi add /home/user/repos/local-repo.git

# Absolute path with .git directory
arashi add /home/user/repos/local-repo/.git
```

---

## Command Reference

### Syntax

```bash
arashi add <git-url> [options]
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--name <name>` | Custom repository name | `--name my-repo` |
| `--create-setup` | Create setup.sh template | `--create-setup` |
| `--no-setup` | Skip setup script detection | `--no-setup` |
| `--force` | Skip confirmation prompts | `--force` |
| `--json` | Output JSON format | `--json` |
| `--help` | Show help message | `--help` |

### Aliases

| Full Option | Alias |
|-------------|-------|
| `--name` | `-n` |
| `--force` | `-f` |
| `--help` | `-h` |

---

## Best Practices

### 1. Use SSH for Private Repositories

**Why**: More secure, no need to store credentials

```bash
# Good
arashi add git@github.com:user/private-repo.git

# Avoid
arashi add https://username:password@github.com/user/private-repo.git
```

---

### 2. Use Custom Names for Clarity

**Why**: Makes intent clear, avoids conflicts

```bash
# Instead of auto-detected names
arashi add https://github.com/user/common-repo.git

# Be explicit
arashi add https://github.com/user/common-repo.git --name project-backend
```

---

### 3. Run Setup Scripts After Adding

**Why**: Ensures dependencies are installed

```bash
arashi add https://github.com/user/repo.git
cd ./repos/repo
./setup.sh
```

---

### 4. Verify Repository Before Creating Worktrees

**Why**: Ensures repository is fully initialized

```bash
arashi add https://github.com/user/repo.git
cd ./repos/repo
git status  # Verify repository is valid
arashi create feature-branch  # Now create worktree
```

---

### 5. Use --json in Scripts

**Why**: Reliable, parseable output

```bash
# Good
result=$(arashi add "$url" --json --force)
if [ $? -eq 0 ]; then
  name=$(echo "$result" | jq -r '.repository.name')
fi

# Avoid parsing human-readable output
arashi add "$url" | grep "Name:" | cut -d: -f2
```

---

## Troubleshooting

### Problem: Command hangs during clone

**Cause**: Large repository or slow network

**Solution**: Wait or use Git's built-in timeout configuration:
```bash
git config --global http.lowSpeedLimit 1000
git config --global http.lowSpeedTime 60
```

---

### Problem: Permission denied during clone

**Cause**: SSH keys not configured or incorrect permissions

**Solution**: 
1. Verify SSH key is added: `ssh-add -l`
2. Test SSH access: `ssh -T git@github.com`
3. Check key permissions: `chmod 600 ~/.ssh/id_rsa`

---

### Problem: Disk space full

**Cause**: Insufficient disk space for cloning

**Solution**: Free up disk space:
```bash
df -h  # Check disk usage
du -sh ./repos/*  # Check repository sizes
```

---

### Problem: Configuration file corrupt

**Cause**: Manual editing or interrupted operation

**Solution**: Re-initialize workspace:
```bash
# Backup current config
cp .arashi/config.json .arashi/config.json.backup

# Re-initialize
arashi init

# Manually merge repositories from backup
```

---

## Next Steps

After adding repositories:

1. **Run setup scripts** (if detected)
   ```bash
   cd ./repos/repo
   ./setup.sh
   ```

2. **Create worktrees** for feature development
   ```bash
   arashi create feature-branch
   ```

3. **List repositories** to verify
   ```bash
   arashi list
   ```

4. **View configuration** to see registered repositories
   ```bash
   cat .arashi/config.json
   ```

---

## Related Commands

- **`arashi init`**: Initialize a new Arashi workspace
- **`arashi list`**: List all repositories and worktrees
- **`arashi create`**: Create worktrees across repositories
- **`arashi remove`**: Remove repository from workspace

---

## Getting Help

- View command help: `arashi add --help`
- View all commands: `arashi --help`
- Report issues: https://github.com/user/arashi/issues

---

**Status**: ✅ Quickstart Complete - Ready for Users
