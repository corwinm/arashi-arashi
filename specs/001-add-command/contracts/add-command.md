# Add Command API Contract

**Feature**: 001-add-command  
**Version**: 1.0.0  
**Date**: 2026-02-06

## Command Interface

### Syntax

```bash
arashi add <git-url> [options]
```

### Arguments

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `git-url` | string | Yes | Git repository URL to clone. Supports HTTPS, SSH, Git protocol, File, and SCP formats. |

### Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--name <name>` | `-n` | string | (derived from URL) | Custom repository name. Must be unique within workspace. |
| `--create-setup` | | boolean | false | Create setup.sh template if no setup script found. |
| `--no-setup` | | boolean | false | Skip setup script detection entirely. |
| `--force` | `-f` | boolean | false | Skip confirmation prompts. |
| `--json` | | boolean | false | Output result as JSON instead of human-readable format. |
| `--help` | `-h` | boolean | false | Display help information. |

### Examples

```bash
# Basic usage - add repository with auto-detected name
arashi add https://github.com/user/repo.git

# Add with custom name
arashi add https://github.com/user/repo.git --name my-project

# Add via SSH with setup script creation
arashi add git@github.com:user/repo.git --create-setup

# Add with force flag (skip prompts)
arashi add https://github.com/user/repo.git --force

# Add with JSON output
arashi add https://github.com/user/repo.git --json
```

---

## Exit Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | Success | Repository added successfully |
| 1 | Invalid Arguments | Invalid URL format, missing required options, or invalid option values |
| 2 | Configuration Error | Configuration file corrupt, duplicate repository name, or config update failed |
| 3 | Git Operation Error | Clone failed, branch detection failed, or other Git errors |
| 4 | File System Error | Insufficient permissions, disk space full, or I/O errors |

---

## Output Formats

### Human-Readable Output (Default)

**Success Output**:
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

**Error Output**:
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

### JSON Output (--json flag)

**Success Response**:
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

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The URL 'invalid-url' is not a valid Git repository URL",
    "details": {
      "url": "invalid-url",
      "supportedFormats": [
        "https://github.com/user/repo.git",
        "git@github.com:user/repo.git",
        "git://host/repo.git",
        "file:///path/to/repo.git",
        "user@host:repo.git"
      ]
    }
  }
}
```

---

## Error Messages

### INVALID_URL

**Human-Readable**:
```
✗ Invalid Git URL format

The URL "{url}" is not a valid Git repository URL.

Supported formats:
  - HTTPS: https://github.com/user/repo.git
  - SSH:   git@github.com:user/repo.git
  - Git:   git://host/repo.git
  - File:  file:///path/to/repo.git
  - SCP:   user@host:repo.git
```

**JSON**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_URL",
    "message": "The URL '{url}' is not a valid Git repository URL",
    "details": {
      "url": "{url}",
      "supportedFormats": ["https://...", "git@...", "git://...", "file://...", "user@..."]
    }
  }
}
```

### DUPLICATE_NAME

**Human-Readable**:
```
✗ Repository name already exists

A repository named "{name}" already exists at {existingPath}.

Solutions:
  1. Use a different name: arashi add {url} --name {name}-2
  2. Remove existing repo: arashi remove {name}
```

**JSON**:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_NAME",
    "message": "Repository name '{name}' already exists in configuration",
    "details": {
      "name": "{name}",
      "existingPath": "{existingPath}",
      "gitUrl": "{url}"
    }
  }
}
```

### CLONE_FAILED

**Human-Readable**:
```
✗ Failed to clone repository

Git clone failed with error:
  {gitErrorMessage}

Common causes:
  - Network connectivity issues
  - Repository doesn't exist or is private
  - Authentication required (use SSH with configured keys)
  - Insufficient disk space

For authentication issues, use SSH:
  arashi add git@github.com:user/repo.git
```

**JSON**:
```json
{
  "success": false,
  "error": {
    "code": "CLONE_FAILED",
    "message": "Git clone operation failed",
    "details": {
      "url": "{url}",
      "gitError": "{gitErrorMessage}",
      "partialCloneRemoved": true
    }
  }
}
```

### BRANCH_DETECTION_FAILED

**Human-Readable**:
```
✗ Unable to detect default branch

The repository has no remote branches or HEAD is not set.

This may be an empty repository. Possible solutions:
  1. Create an initial commit in the repository
  2. Set a default branch: git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main
```

**JSON**:
```json
{
  "success": false,
  "error": {
    "code": "BRANCH_DETECTION_FAILED",
    "message": "Unable to detect default branch: repository has no remote branches",
    "details": {
      "repositoryPath": "{clonePath}",
      "url": "{url}"
    }
  }
}
```

### CONFIG_UPDATE_FAILED

**Human-Readable**:
```
✗ Failed to update configuration

Unable to save configuration file: {error}

The repository was cloned successfully but not registered.

Manual fix:
  1. Repository location: {clonePath}
  2. Edit .arashi/config.json manually to add entry
  3. Or remove cloned repo and try again: rm -rf {clonePath}
```

**JSON**:
```json
{
  "success": false,
  "error": {
    "code": "CONFIG_UPDATE_FAILED",
    "message": "Failed to update configuration file",
    "details": {
      "configPath": ".arashi/config.json",
      "error": "{error}",
      "repositoryCloned": true,
      "clonePath": "{clonePath}"
    }
  }
}
```

---

## Validation Rules

### Git URL Validation

**Valid URLs**:
- `https://github.com/user/repo.git`
- `https://github.com/user/repo`
- `git@github.com:user/repo.git`
- `ssh://git@github.com/user/repo.git`
- `git://host/repo.git`
- `file:///absolute/path/to/repo.git`
- `/absolute/path/to/repo`
- `user@host:repo.git`

**Invalid URLs**:
- `invalid-url` (no protocol or host)
- `http://github.com/user/repo.git` (HTTP not HTTPS)
- `github.com/user/repo` (missing protocol)
- `./relative/path` (relative paths not supported)

### Repository Name Validation

**Valid Names**:
- `my-repo`
- `my_repo`
- `my.repo`
- `MyRepo123`
- `repo-v2.0`

**Invalid Names**:
- `my repo` (contains space)
- `my/repo` (contains slash)
- `my@repo` (contains @)
- `` (empty string)
- `repo!` (contains special character)

---

## Configuration Schema Update

After successful add, the `.arashi/config.json` file is updated:

**Before**:
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
```

**After**:
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {
    "repo": {
      "path": "./repos/repo",
      "default_branch": "main",
      "is_bare": false,
      "worktrees": [],
      "hooks": {
        "setup": "./repos/repo/setup.sh"
      }
    }
  }
}
```

---

## Behavioral Contracts

### Atomicity Guarantee

The add command guarantees **all-or-nothing** behavior:
- If ANY step fails, ALL changes are rolled back
- Configuration is NEVER partially updated
- Partial clones are ALWAYS cleaned up

**Invariants**:
1. Configuration file is valid JSON before and after command
2. If command fails, filesystem state is unchanged (clone removed)
3. If command succeeds, repository is fully registered and usable

### Idempotency

The add command is **NOT idempotent**:
- Running twice with same URL creates duplicate name error
- User must use `--name` to add same repo with different name
- Rationale: Prevents accidental duplicates, makes intent explicit

### Performance Guarantees

Based on Success Criteria SC-001:
- **Operation time**: < 30 seconds (excluding network clone time)
- **Progress feedback**: Spinners for operations > 1 second
- **Timeout**: Git clone may timeout based on user's Git config

---

## Integration Points

### Dependencies on Existing Code

| Module | Functions Used | Purpose |
|--------|----------------|---------|
| `src/lib/config.ts` | `loadConfig()`, `saveConfig()`, `addRepo()` | Load and update configuration |
| `src/lib/git.ts` | `exec()`, `clone()`, `getDefaultBranch()` | Git operations |
| `src/lib/logger.ts` | `spinner()`, `success()`, `error()`, `info()` | User feedback |
| `src/lib/prompts.ts` | `confirm()`, `input()` | User interaction |
| `src/lib/filesystem.ts` | `exists()`, `mkdir()`, `rm()` | File operations |
| `src/lib/errors.ts` | `ArashiError` | Error handling |
| `src/core/rollback.ts` | `trackOperation()`, `rollback()` | Rollback mechanism |

### External Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| Git executable | Clone repositories | Error with installation instructions |
| Network connectivity | Clone remote repositories | Clear error message with retry suggestion |
| Disk space | Store cloned repositories | Error with disk space check |

---

## Testing Contract

### Unit Test Coverage

Must include tests for:
- [ ] Git URL validation (all formats, edge cases)
- [ ] Repository name derivation (all URL formats)
- [ ] Default branch detection (all fallback paths)
- [ ] Setup script detection (all patterns)
- [ ] Error handling (each error code)

### Integration Test Coverage

Must include tests for:
- [ ] Full add flow with HTTPS URL
- [ ] Full add flow with SSH URL
- [ ] Add with custom name
- [ ] Add with setup script creation
- [ ] Duplicate name error
- [ ] Invalid URL error
- [ ] Clone failure rollback
- [ ] Configuration update atomicity

### Minimum Coverage

Per Constitution Principle VII:
- **Overall coverage**: > 80%
- **Error paths**: All error codes tested
- **Edge cases**: Empty repos, no branches, special characters

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-06 | Initial contract definition |

---

**Status**: ✅ Contract Complete - Ready for Implementation
