# Data Model: Configuration Management

**Feature**: 006-config-management  
**Date**: 2026-02-03  
**Status**: Complete

## Overview

This document defines the data structures for Arashi's configuration management system. The configuration is stored in `.arashi/config.json` and manages repository discovery, worktree settings, and user preferences.

## Entity Definitions

### 1. Config (Root Entity)

The top-level configuration object representing the complete Arashi configuration.

**Fields**:
- `version` (string, required): Configuration schema version for future migrations
- `repos_dir` (string, required): Directory path where repositories are located (relative or absolute)
- `auto_setup` (boolean, required): Whether to automatically run setup hooks on worktree creation
- `discovered_repos` (Record<string, RepoConfig>, required): Map of repository names to their configurations

**Validation Rules**:
- `version` must be non-empty string matching semver pattern (e.g., "1.0.0")
- `repos_dir` must be non-empty string representing a valid path
- `auto_setup` must be boolean (true/false)
- `discovered_repos` must be an object (can be empty `{}`)

**Default Values**:
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
```

**Relationships**:
- Contains many RepoConfig entities via `discovered_repos` map

---

### 2. RepoConfig

Configuration for a single repository tracked by Arashi.

**Fields**:
- `path` (string, required): Path to the repository (relative to repos_dir or absolute)
- `default_branch` (string, optional): Name of the default branch (auto-detected if omitted)
- `is_bare` (boolean, optional): Whether the repository is bare (auto-detected if omitted)
- `worktrees` (WorktreeInfo[], optional): List of active worktrees for this repository
- `hooks` (HookConfig, optional): Custom hook configuration for this repository

**Validation Rules**:
- `path` must be non-empty string
- `default_branch` if present, must be non-empty string
- `is_bare` if present, must be boolean
- `worktrees` if present, must be array of valid WorktreeInfo objects
- `hooks` if present, must be valid HookConfig object

**Example**:
```json
{
  "path": "./repos/my-app",
  "default_branch": "main",
  "is_bare": false,
  "worktrees": [
    {
      "branch": "feature-123",
      "path": "./repos/my-app.worktrees/feature-123",
      "created_at": "2026-02-03T10:30:00Z"
    }
  ],
  "hooks": {
    "post_create": "./repos/my-app/.arashi/hooks/post-create.sh"
  }
}
```

**Relationships**:
- Belongs to Config via `discovered_repos` map
- Contains many WorktreeInfo entities via `worktrees` array
- Contains one HookConfig entity via `hooks` field (optional)

---

### 3. WorktreeInfo

Information about a single git worktree.

**Fields**:
- `branch` (string, required): Branch name for this worktree
- `path` (string, required): Filesystem path to the worktree
- `created_at` (string, required): ISO 8601 timestamp when worktree was created
- `metadata` (Record<string, any>, optional): User-defined metadata for this worktree

**Validation Rules**:
- `branch` must be non-empty string
- `path` must be non-empty string
- `created_at` must be valid ISO 8601 date string
- `metadata` if present, can contain any JSON-serializable data

**Example**:
```json
{
  "branch": "feature-auth",
  "path": "./repos/my-app.worktrees/feature-auth",
  "created_at": "2026-02-03T14:25:30Z",
  "metadata": {
    "jira_ticket": "PROJ-123",
    "owner": "alice"
  }
}
```

**Relationships**:
- Belongs to RepoConfig via `worktrees` array

---

### 4. HookConfig

Configuration for lifecycle hooks that run during worktree operations.

**Fields**:
- `pre_create` (string, optional): Path to script executed before worktree creation
- `post_create` (string, optional): Path to script executed after worktree creation
- `setup` (string, optional): Path to script executed during repository setup

**Validation Rules**:
- All paths must be non-empty strings if present
- Paths should be relative to repository root or absolute
- Scripts must have execute permissions (checked at runtime)

**Example**:
```json
{
  "pre_create": "./.arashi/hooks/pre-create.sh",
  "post_create": "./.arashi/hooks/post-create.sh",
  "setup": "./.arashi/hooks/setup.sh"
}
```

**Relationships**:
- Belongs to RepoConfig via `hooks` field (optional)

---

## State Transitions

### Config Lifecycle

```
[Non-existent] 
    ↓ (generateDefaultConfig + saveConfig)
[Initialized with defaults]
    ↓ (addRepo)
[Has discovered repos]
    ↓ (create worktrees, modify settings)
[Active configuration]
    ↓ (removeRepo, update settings)
[Modified configuration]
```

### RepoConfig Lifecycle

```
[Not in config]
    ↓ (addRepo)
[Registered, no worktrees]
    ↓ (create worktree)
[Has active worktrees]
    ↓ (remove worktree)
[Has fewer worktrees]
    ↓ (removeRepo)
[Removed from config]
```

---

## Validation Hierarchy

1. **Config Level**:
   - All required fields present (version, repos_dir, auto_setup, discovered_repos)
   - Field types correct
   - Version format valid

2. **RepoConfig Level** (for each repo in discovered_repos):
   - `path` field present and non-empty
   - Optional fields have correct types if present
   - Worktrees array valid if present

3. **WorktreeInfo Level** (for each worktree in repo):
   - All required fields present (branch, path, created_at)
   - `created_at` is valid ISO 8601 date

4. **HookConfig Level** (if hooks present):
   - All hook paths are strings if specified

---

## Error Scenarios

### Missing Required Fields
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos"
  // Missing: auto_setup, discovered_repos
}
```
**Error**: "Configuration validation failed: auto_setup: must be a boolean, discovered_repos: must be an object"

### Invalid Field Types
```json
{
  "version": 1.0,
  "repos_dir": "./repos",
  "auto_setup": "true",
  "discovered_repos": []
}
```
**Error**: "Configuration validation failed: version: must be a string, auto_setup: must be a boolean, discovered_repos: must be an object"

### Invalid Nested Structure
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {
    "my-repo": {
      // Missing required 'path' field
      "default_branch": "main"
    }
  }
}
```
**Error**: "Configuration validation failed: discovered_repos.my-repo: path is required"

---

## Forward Compatibility

### Unknown Fields Preservation

Valid configuration with extra fields:
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {},
  "future_feature": "some value",
  "custom_metadata": {
    "team": "backend",
    "owner": "alice"
  }
}
```

**Behavior**: Unknown fields are preserved during load/save cycles. Validation only checks required fields, doesn't reject extra fields.

**Rationale**: Enables future version compatibility and third-party extensions without breaking existing configurations.

---

## Data Constraints

### Size Limits
- **Config file size**: Recommended < 1MB (soft limit)
- **Repository count**: Optimized for < 100 repositories
- **Worktrees per repo**: No hard limit, typically < 50
- **Path lengths**: OS-dependent (260 chars Windows, 4096 chars Unix)

### Naming Constraints
- **Repository names**: 
  - Keys in `discovered_repos` map
  - Must be unique within config
  - No specific format required (any string)
  - Recommended: alphanumeric + hyphens/underscores

- **Branch names**:
  - Must follow git branch naming rules
  - No spaces, special characters vary by git version

### Path Constraints
- **repos_dir**: 
  - Can be relative (./repos) or absolute (/Users/alice/projects)
  - Relative paths resolved from config file location
  
- **Repository paths**:
  - Can be relative to repos_dir or absolute
  - Must point to valid git repositories

---

## Migration Strategy (Future)

### Version 1.0.0 → 2.0.0 Example

If future version adds breaking changes:

1. Check `version` field in loaded config
2. If version < 2.0.0, apply migration transform
3. Update `version` field to "2.0.0"
4. Save migrated config

**Migration function signature**:
```typescript
function migrateConfig(oldConfig: any, fromVersion: string, toVersion: string): Config {
  // Apply transformations based on version gap
  // Return new config structure
}
```

**Current Implementation**: Not required for v1.0.0 (initial version). Document for future reference.

---

## Summary

The configuration data model consists of 4 main entities:
1. **Config**: Root configuration with global settings
2. **RepoConfig**: Per-repository settings and worktree tracking
3. **WorktreeInfo**: Individual worktree metadata
4. **HookConfig**: Lifecycle hook configuration

Key principles:
- Required fields validated strictly
- Optional fields provide flexibility
- Unknown fields preserved for forward compatibility
- Clear validation hierarchy from root to leaves
- Sensible defaults for initialization
