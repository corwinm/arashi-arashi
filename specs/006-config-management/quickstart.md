# Quickstart: Configuration Management

**Feature**: 006-config-management  
**Date**: 2026-02-03  
**Audience**: Developers implementing or using configuration management

## Overview

This guide provides practical examples for implementing and using Arashi's configuration management system. The configuration system manages repository settings, worktree tracking, and user preferences via `.arashi/config.json`.

## For Implementers

### Step 1: Implement Core Data Types

Start by implementing the TypeScript interfaces from `contracts/config-api.ts`:

```typescript
// src/lib/config.ts

export interface Config {
  version: string;
  repos_dir: string;
  auto_setup: boolean;
  discovered_repos: Record<string, RepoConfig>;
}

export interface RepoConfig {
  path: string;
  default_branch?: string;
  is_bare?: boolean;
  worktrees?: WorktreeInfo[];
  hooks?: HookConfig;
}

export interface WorktreeInfo {
  branch: string;
  path: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface HookConfig {
  pre_create?: string;
  post_create?: string;
  setup?: string;
}
```

### Step 2: Implement Error Classes

```typescript
// src/lib/config.ts (continued)

export class ConfigError extends Error {
  constructor(
    message: string,
    public cause?: Error,
    public context?: any
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class ConfigNotFoundError extends ConfigError {
  constructor(path: string) {
    super(
      `Configuration file not found at ${path}. Run "arashi init" to create it.`,
      undefined,
      { path }
    );
    this.name = 'ConfigNotFoundError';
  }
}

export class ConfigParseError extends ConfigError {
  constructor(path: string, cause: Error) {
    super(
      `Failed to parse configuration file at ${path}: ${cause.message}`,
      cause,
      { path }
    );
    this.name = 'ConfigParseError';
  }
}

export class ConfigValidationError extends ConfigError {
  constructor(errors: string[]) {
    super(
      `Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`,
      undefined,
      { errors }
    );
    this.name = 'ConfigValidationError';
  }
}
```

### Step 3: Implement Helper Functions

```typescript
// src/lib/config.ts (continued)

import { join, dirname } from 'path';
import { mkdir } from 'fs/promises';

export function getConfigPath(repoPath: string): string {
  return join(repoPath, '.arashi', 'config.json');
}

export async function configExists(repoPath: string): Promise<boolean> {
  const configPath = getConfigPath(repoPath);
  const file = Bun.file(configPath);
  return await file.exists();
}

export function generateDefaultConfig(): Config {
  return {
    version: '1.0.0',
    repos_dir: './repos',
    auto_setup: true,
    discovered_repos: {}
  };
}
```

### Step 4: Implement Validation

```typescript
// src/lib/config.ts (continued)

export function validateConfig(config: any): asserts config is Config {
  const errors: string[] = [];

  // Validate required fields
  if (typeof config.version !== 'string' || config.version === '') {
    errors.push('version: must be a non-empty string');
  }
  
  if (typeof config.repos_dir !== 'string' || config.repos_dir === '') {
    errors.push('repos_dir: must be a non-empty string');
  }
  
  if (typeof config.auto_setup !== 'boolean') {
    errors.push('auto_setup: must be a boolean');
  }
  
  if (typeof config.discovered_repos !== 'object' || config.discovered_repos === null || Array.isArray(config.discovered_repos)) {
    errors.push('discovered_repos: must be an object');
  } else {
    // Validate each repository config
    for (const [name, repoConfig] of Object.entries(config.discovered_repos)) {
      if (typeof repoConfig !== 'object' || repoConfig === null) {
        errors.push(`discovered_repos.${name}: must be an object`);
        continue;
      }
      
      if (typeof (repoConfig as any).path !== 'string' || (repoConfig as any).path === '') {
        errors.push(`discovered_repos.${name}.path: must be a non-empty string`);
      }
      
      // Validate optional fields if present
      const rc = repoConfig as RepoConfig;
      if (rc.default_branch !== undefined && (typeof rc.default_branch !== 'string' || rc.default_branch === '')) {
        errors.push(`discovered_repos.${name}.default_branch: must be a non-empty string if present`);
      }
      
      if (rc.is_bare !== undefined && typeof rc.is_bare !== 'boolean') {
        errors.push(`discovered_repos.${name}.is_bare: must be a boolean if present`);
      }
      
      if (rc.worktrees !== undefined && !Array.isArray(rc.worktrees)) {
        errors.push(`discovered_repos.${name}.worktrees: must be an array if present`);
      }
    }
  }

  if (errors.length > 0) {
    throw new ConfigValidationError(errors);
  }
}
```

### Step 5: Implement Load and Save

```typescript
// src/lib/config.ts (continued)

export async function loadConfig(repoPath: string): Promise<Config> {
  const configPath = getConfigPath(repoPath);
  
  // Check if file exists
  if (!await configExists(repoPath)) {
    throw new ConfigNotFoundError(configPath);
  }
  
  // Read and parse JSON
  try {
    const file = Bun.file(configPath);
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Validate structure
    validateConfig(data);
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ConfigParseError(configPath, error);
    }
    if (error instanceof ConfigValidationError) {
      throw error;
    }
    throw new ConfigError('Failed to load configuration', error as Error, { path: configPath });
  }
}

export async function saveConfig(repoPath: string, config: Config): Promise<void> {
  const configPath = getConfigPath(repoPath);
  const configDir = dirname(configPath);
  
  try {
    // Ensure directory exists
    await mkdir(configDir, { recursive: true });
    
    // Write pretty-printed JSON
    const json = JSON.stringify(config, null, 2);
    await Bun.write(configPath, json);
  } catch (error) {
    throw new ConfigError('Failed to save configuration', error as Error, { path: configPath });
  }
}
```

### Step 6: Implement Repository Management

```typescript
// src/lib/config.ts (continued)

export async function addRepo(
  repoPath: string,
  name: string,
  repoConfig: RepoConfig
): Promise<void> {
  const config = await loadConfig(repoPath);
  
  // Check for duplicates (error on duplicate)
  if (name in config.discovered_repos) {
    throw new ConfigError(
      `Repository "${name}" already exists in configuration`,
      undefined,
      { name, existingConfig: config.discovered_repos[name] }
    );
  }
  
  config.discovered_repos[name] = repoConfig;
  await saveConfig(repoPath, config);
}

export async function removeRepo(repoPath: string, name: string): Promise<void> {
  const config = await loadConfig(repoPath);
  
  // Succeed silently if repo doesn't exist (idempotent)
  delete config.discovered_repos[name];
  
  await saveConfig(repoPath, config);
}
```

### Step 7: Write Tests

Create comprehensive tests covering all scenarios:

```typescript
// tests/unit/config.test.ts

import { describe, it, expect } from 'bun:test';
import { generateDefaultConfig, validateConfig, ConfigValidationError } from '../../src/lib/config';

describe('generateDefaultConfig', () => {
  it('returns valid default configuration', () => {
    const config = generateDefaultConfig();
    
    expect(config.version).toBe('1.0.0');
    expect(config.repos_dir).toBe('./repos');
    expect(config.auto_setup).toBe(true);
    expect(config.discovered_repos).toEqual({});
  });
});

describe('validateConfig', () => {
  it('accepts valid configuration', () => {
    const config = {
      version: '1.0.0',
      repos_dir: './repos',
      auto_setup: true,
      discovered_repos: {}
    };
    
    expect(() => validateConfig(config)).not.toThrow();
  });
  
  it('throws on missing version field', () => {
    const config = {
      repos_dir: './repos',
      auto_setup: true,
      discovered_repos: {}
    };
    
    expect(() => validateConfig(config)).toThrow(ConfigValidationError);
  });
  
  it('preserves unknown fields', () => {
    const config = {
      version: '1.0.0',
      repos_dir: './repos',
      auto_setup: true,
      discovered_repos: {},
      custom_field: 'value'
    };
    
    expect(() => validateConfig(config)).not.toThrow();
  });
});
```

---

## For Users (CLI Commands)

### Initialize Configuration

```bash
# First-time setup
arashi init

# Creates .arashi/config.json with defaults:
# {
#   "version": "1.0.0",
#   "repos_dir": "./repos",
#   "auto_setup": true,
#   "discovered_repos": {}
# }
```

### Add Repository

```bash
# Add a repository to configuration
arashi repo add my-app ./repos/my-app

# Configuration updated:
# {
#   "discovered_repos": {
#     "my-app": {
#       "path": "./repos/my-app",
#       "default_branch": "main"  // auto-detected
#     }
#   }
# }
```

### View Configuration

```bash
# Display current configuration
arashi config show

# Output:
# Configuration: /path/to/project/.arashi/config.json
# Version: 1.0.0
# Repos Directory: ./repos
# Auto Setup: true
# Discovered Repositories: 3
#   - my-app (./repos/my-app)
#   - frontend (./repos/frontend)
#   - backend (./repos/backend)
```

### Modify Settings

```bash
# Change repos directory
arashi config set repos_dir /absolute/path/to/repos

# Disable auto setup
arashi config set auto_setup false
```

---

## Common Patterns

### Pattern 1: Safe Configuration Modification

```typescript
// Load, modify, save pattern
async function updateReposDir(repoPath: string, newDir: string) {
  const config = await loadConfig(repoPath);
  config.repos_dir = newDir;
  await saveConfig(repoPath, config);
}
```

### Pattern 2: Check Before Initialize

```typescript
// Avoid overwriting existing config
async function safeInit(repoPath: string) {
  if (await configExists(repoPath)) {
    console.log('Configuration already exists');
    return;
  }
  
  const config = generateDefaultConfig();
  await saveConfig(repoPath, config);
  console.log('Configuration initialized');
}
```

### Pattern 3: Error Handling

```typescript
async function robustConfigLoad(repoPath: string) {
  try {
    return await loadConfig(repoPath);
  } catch (error) {
    if (error instanceof ConfigNotFoundError) {
      console.error('Run "arashi init" first');
    } else if (error instanceof ConfigParseError) {
      console.error('Config file is corrupted:', error.cause?.message);
      console.error('Fix the JSON or delete and reinitialize');
    } else if (error instanceof ConfigValidationError) {
      console.error('Config is invalid:', error.context.errors);
    }
    throw error;
  }
}
```

### Pattern 4: Conditional Repository Add

```typescript
async function addRepoIfNotExists(repoPath: string, name: string, repoConfig: RepoConfig) {
  const config = await loadConfig(repoPath);
  
  if (name in config.discovered_repos) {
    console.log(`Repository "${name}" already exists, skipping`);
    return;
  }
  
  await addRepo(repoPath, name, repoConfig);
  console.log(`Repository "${name}" added`);
}
```

---

## Troubleshooting

### Problem: Config file not found

**Error**: `ConfigNotFoundError: Configuration file not found at /path/.arashi/config.json`

**Solution**: Run initialization command or create config manually:
```bash
arashi init
```

### Problem: Malformed JSON

**Error**: `ConfigParseError: Failed to parse configuration: Unexpected token`

**Solution**: Fix JSON syntax or restore from backup:
```bash
# Validate JSON manually
cat .arashi/config.json | jq .

# Or reinitialize (loses existing config!)
rm .arashi/config.json
arashi init
```

### Problem: Missing required fields

**Error**: `ConfigValidationError: version: must be a non-empty string`

**Solution**: Add missing fields to config:
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
```

### Problem: Permission denied

**Error**: `ConfigError: Failed to save configuration: EACCES`

**Solution**: Fix file/directory permissions:
```bash
chmod 755 .arashi
chmod 644 .arashi/config.json
```

---

## Next Steps

1. **Implement the API**: Follow implementation steps above
2. **Write comprehensive tests**: Cover all success, error, and edge cases
3. **Integrate with CLI**: Add commands that use config management
4. **Document CLI usage**: User-facing documentation for commands

## Reference

- **Data Model**: See `data-model.md` for complete entity definitions
- **API Contract**: See `contracts/config-api.ts` for full TypeScript interfaces
- **Research**: See `research.md` for technical decisions and rationale
- **Feature Spec**: See `spec.md` for requirements and success criteria
