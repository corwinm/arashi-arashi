# Configuration Schema Contract

## Overview

This document defines the configuration schema, validation rules, default values, and migration strategies for the arashi-arashi project.

## Version

Contract Version: 1.0.0  
Last Updated: 2026-02-03

---

## Configuration File Location

### Primary Configuration
```
<repository-root>/.arashi/config.json
```

### Global Configuration (Optional)
```
~/.config/arashi/config.json  # Linux/macOS
%APPDATA%/arashi/config.json  # Windows
```

### Configuration Priority
1. Project configuration (`.arashi/config.json`)
2. Environment variables (prefixed with `ARASHI_`)
3. Global configuration
4. Built-in defaults

---

## Schema Version 1.0

### TypeScript Interface

```typescript
/**
 * Main configuration schema
 */
interface ArashiConfig {
  /**
   * Schema version for configuration migration
   * @example "1.0"
   */
  version: string;
  
  /**
   * Worktree configuration
   */
  worktree: WorktreeConfig;
  
  /**
   * Branch naming configuration
   */
  branch: BranchConfig;
  
  /**
   * Git configuration
   */
  git: GitConfig;
  
  /**
   * CLI behavior configuration
   */
  cli: CLIConfig;
  
  /**
   * Hooks configuration
   */
  hooks?: HooksConfig;
  
  /**
   * Custom metadata (user-defined)
   */
  metadata?: Record<string, unknown>;
}

/**
 * Worktree-specific configuration
 */
interface WorktreeConfig {
  /**
   * Base directory for worktrees (relative to repository root)
   * @default ".arashi"
   * @example ".worktrees"
   */
  baseDir: string;
  
  /**
   * Naming pattern for worktree directories
   * Available variables: {taskId}, {branch}, {timestamp}
   * @default "{taskId}"
   * @example "{taskId}-{timestamp}"
   */
  dirPattern: string;
  
  /**
   * Maximum number of active worktrees (0 = unlimited)
   * @default 0
   * @minimum 0
   */
  maxWorktrees: number;
  
  /**
   * Automatically remove worktree when branch is deleted
   * @default true
   */
  autoRemove: boolean;
  
  /**
   * Prune stale worktree references on status/list
   * @default true
   */
  autoPrune: boolean;
}

/**
 * Branch naming configuration
 */
interface BranchConfig {
  /**
   * Default base branch for new branches
   * @default "main"
   * @example "develop"
   */
  defaultBase: string;
  
  /**
   * Branch name prefix
   * @default ""
   * @example "feature/"
   */
  prefix: string;
  
  /**
   * Branch name pattern
   * Available variables: {taskId}, {prefix}, {description}
   * @default "{prefix}{taskId}"
   * @example "{prefix}{taskId}-{description}"
   */
  pattern: string;
  
  /**
   * Task ID format validation (regex)
   * @default "^[a-zA-Z0-9-_]+$"
   * @example "^[A-Z]+-\\d+$" // Jira format
   */
  taskIdFormat: string;
  
  /**
   * Automatically set upstream tracking
   * @default false
   */
  autoSetUpstream: boolean;
  
  /**
   * Remote name for upstream tracking
   * @default "origin"
   */
  upstreamRemote: string;
}

/**
 * Git operation configuration
 */
interface GitConfig {
  /**
   * Default remote name
   * @default "origin"
   */
  remote: string;
  
  /**
   * Automatically fetch before operations
   * @default true
   */
  autoFetch: boolean;
  
  /**
   * Fetch timeout in milliseconds
   * @default 30000
   * @minimum 1000
   * @maximum 300000
   */
  fetchTimeout: number;
  
  /**
   * Prune deleted remote branches on fetch
   * @default true
   */
  pruneFetch: boolean;
  
  /**
   * Require clean working tree for operations
   * @default true
   */
  requireClean: boolean;
  
  /**
   * Git command timeout in milliseconds
   * @default 30000
   * @minimum 1000
   * @maximum 300000
   */
  commandTimeout: number;
}

/**
 * CLI behavior configuration
 */
interface CLIConfig {
  /**
   * Enable colored output
   * @default true
   */
  color: boolean;
  
  /**
   * Default output format
   * @default "table"
   */
  defaultFormat: 'table' | 'json' | 'compact';
  
  /**
   * Show verbose output by default
   * @default false
   */
  verbose: boolean;
  
  /**
   * Confirm destructive operations
   * @default true
   */
  confirmDestructive: boolean;
  
  /**
   * Show git commands being executed (verbose mode)
   * @default false
   */
  showCommands: boolean;
  
  /**
   * Editor for interactive operations
   * @default process.env.EDITOR || "vim"
   */
  editor: string;
}

/**
 * Hooks configuration
 */
interface HooksConfig {
  /**
   * Hook to run before creating worktree
   * @example "npm install"
   */
  beforeCreate?: string;
  
  /**
   * Hook to run after creating worktree
   * @example "cd {path} && npm install"
   */
  afterCreate?: string;
  
  /**
   * Hook to run before removing worktree
   * @example "cd {path} && npm run cleanup"
   */
  beforeRemove?: string;
  
  /**
   * Hook to run after removing worktree
   */
  afterRemove?: string;
  
  /**
   * Hook timeout in milliseconds
   * @default 60000
   * @minimum 1000
   */
  timeout: number;
}
```

---

## JSON Schema Definition

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://arashi.dev/schemas/config/v1.json",
  "title": "Arashi Configuration",
  "description": "Configuration schema for arashi-arashi worktree manager",
  "type": "object",
  "required": ["version", "worktree", "branch", "git", "cli"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+$",
      "description": "Configuration schema version"
    },
    "worktree": {
      "type": "object",
      "required": ["baseDir", "dirPattern"],
      "properties": {
        "baseDir": {
          "type": "string",
          "minLength": 1,
          "pattern": "^[^/].*[^/]$",
          "description": "Base directory for worktrees"
        },
        "dirPattern": {
          "type": "string",
          "minLength": 1,
          "pattern": "\\{taskId\\}",
          "description": "Naming pattern for worktree directories"
        },
        "maxWorktrees": {
          "type": "integer",
          "minimum": 0,
          "default": 0,
          "description": "Maximum number of active worktrees"
        },
        "autoRemove": {
          "type": "boolean",
          "default": true,
          "description": "Auto-remove worktree when branch deleted"
        },
        "autoPrune": {
          "type": "boolean",
          "default": true,
          "description": "Auto-prune stale worktree references"
        }
      }
    },
    "branch": {
      "type": "object",
      "required": ["defaultBase", "pattern", "taskIdFormat"],
      "properties": {
        "defaultBase": {
          "type": "string",
          "minLength": 1,
          "description": "Default base branch"
        },
        "prefix": {
          "type": "string",
          "default": "",
          "description": "Branch name prefix"
        },
        "pattern": {
          "type": "string",
          "minLength": 1,
          "pattern": "\\{taskId\\}",
          "description": "Branch naming pattern"
        },
        "taskIdFormat": {
          "type": "string",
          "format": "regex",
          "description": "Task ID validation regex"
        },
        "autoSetUpstream": {
          "type": "boolean",
          "default": false,
          "description": "Automatically set upstream tracking"
        },
        "upstreamRemote": {
          "type": "string",
          "default": "origin",
          "description": "Remote for upstream tracking"
        }
      }
    },
    "git": {
      "type": "object",
      "required": ["remote"],
      "properties": {
        "remote": {
          "type": "string",
          "minLength": 1,
          "default": "origin",
          "description": "Default remote name"
        },
        "autoFetch": {
          "type": "boolean",
          "default": true,
          "description": "Auto-fetch before operations"
        },
        "fetchTimeout": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 300000,
          "default": 30000,
          "description": "Fetch timeout in milliseconds"
        },
        "pruneFetch": {
          "type": "boolean",
          "default": true,
          "description": "Prune on fetch"
        },
        "requireClean": {
          "type": "boolean",
          "default": true,
          "description": "Require clean working tree"
        },
        "commandTimeout": {
          "type": "integer",
          "minimum": 1000,
          "maximum": 300000,
          "default": 30000,
          "description": "Git command timeout"
        }
      }
    },
    "cli": {
      "type": "object",
      "properties": {
        "color": {
          "type": "boolean",
          "default": true,
          "description": "Enable colored output"
        },
        "defaultFormat": {
          "type": "string",
          "enum": ["table", "json", "compact"],
          "default": "table",
          "description": "Default output format"
        },
        "verbose": {
          "type": "boolean",
          "default": false,
          "description": "Verbose output"
        },
        "confirmDestructive": {
          "type": "boolean",
          "default": true,
          "description": "Confirm destructive operations"
        },
        "showCommands": {
          "type": "boolean",
          "default": false,
          "description": "Show git commands"
        },
        "editor": {
          "type": "string",
          "default": "vim",
          "description": "Editor for interactive operations"
        }
      }
    },
    "hooks": {
      "type": "object",
      "properties": {
        "beforeCreate": {
          "type": "string",
          "description": "Hook before creating worktree"
        },
        "afterCreate": {
          "type": "string",
          "description": "Hook after creating worktree"
        },
        "beforeRemove": {
          "type": "string",
          "description": "Hook before removing worktree"
        },
        "afterRemove": {
          "type": "string",
          "description": "Hook after removing worktree"
        },
        "timeout": {
          "type": "integer",
          "minimum": 1000,
          "default": 60000,
          "description": "Hook timeout in milliseconds"
        }
      }
    },
    "metadata": {
      "type": "object",
      "description": "Custom user-defined metadata"
    }
  }
}
```

---

## Default Configuration

### Default Values (Version 1.0)

```json
{
  "version": "1.0",
  "worktree": {
    "baseDir": ".arashi",
    "dirPattern": "{taskId}",
    "maxWorktrees": 0,
    "autoRemove": true,
    "autoPrune": true
  },
  "branch": {
    "defaultBase": "main",
    "prefix": "",
    "pattern": "{prefix}{taskId}",
    "taskIdFormat": "^[a-zA-Z0-9-_]+$",
    "autoSetUpstream": false,
    "upstreamRemote": "origin"
  },
  "git": {
    "remote": "origin",
    "autoFetch": true,
    "fetchTimeout": 30000,
    "pruneFetch": true,
    "requireClean": true,
    "commandTimeout": 30000
  },
  "cli": {
    "color": true,
    "defaultFormat": "table",
    "verbose": false,
    "confirmDestructive": true,
    "showCommands": false,
    "editor": "vim"
  }
}
```

---

## Validation Rules

### Configuration Validation Interface

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  path: string;        // JSONPath to invalid field
  message: string;     // Error message
  expected: string;    // Expected value/format
  received: unknown;   // Actual value
}

interface ValidationWarning {
  path: string;
  message: string;
  suggestion: string;
}
```

### Validation Rules

#### 1. Version Validation
```typescript
// Rule: version must be a valid semver-like string
const versionPattern = /^\d+\.\d+$/;

function validateVersion(version: string): boolean {
  return versionPattern.test(version);
}

// Error example
{
  path: "version",
  message: "Invalid version format",
  expected: "semver format (e.g., '1.0')",
  received: "v1.0"
}
```

#### 2. Path Validation
```typescript
// Rule: baseDir must not start or end with /
function validateBaseDir(baseDir: string): boolean {
  return !baseDir.startsWith('/') && !baseDir.endsWith('/');
}

// Error example
{
  path: "worktree.baseDir",
  message: "baseDir must not start or end with /",
  expected: "relative path without leading/trailing slashes",
  received: ".arashi/"
}
```

#### 3. Pattern Validation
```typescript
// Rule: patterns must contain {taskId} variable
function validatePattern(pattern: string): boolean {
  return pattern.includes('{taskId}');
}

// Error example
{
  path: "worktree.dirPattern",
  message: "Pattern must include {taskId} variable",
  expected: "pattern with {taskId}",
  received: "{branch}"
}
```

#### 4. Regex Validation
```typescript
// Rule: taskIdFormat must be valid regex
function validateRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

// Error example
{
  path: "branch.taskIdFormat",
  message: "Invalid regular expression",
  expected: "valid regex pattern",
  received: "^[a-zA-Z0-9-_+$" // missing closing bracket
}
```

#### 5. Range Validation
```typescript
// Rule: timeouts must be within acceptable range
function validateTimeout(timeout: number): boolean {
  return timeout >= 1000 && timeout <= 300000;
}

// Error example
{
  path: "git.fetchTimeout",
  message: "Timeout outside valid range",
  expected: "1000-300000 milliseconds",
  received: 500
}
```

#### 6. Enum Validation
```typescript
// Rule: defaultFormat must be one of allowed values
const allowedFormats = ['table', 'json', 'compact'];

function validateFormat(format: string): boolean {
  return allowedFormats.includes(format);
}

// Error example
{
  path: "cli.defaultFormat",
  message: "Invalid format value",
  expected: "one of: table, json, compact",
  received: "yaml"
}
```

### Warning Rules

#### 1. Default Base Branch Warning
```typescript
// Warning: if defaultBase is not 'main' or 'master'
function warnDefaultBase(defaultBase: string): ValidationWarning | null {
  if (defaultBase !== 'main' && defaultBase !== 'master') {
    return {
      path: "branch.defaultBase",
      message: "Uncommon default base branch",
      suggestion: "Verify this is correct for your repository"
    };
  }
  return null;
}
```

#### 2. Max Worktrees Warning
```typescript
// Warning: if maxWorktrees is very high
function warnMaxWorktrees(max: number): ValidationWarning | null {
  if (max > 10) {
    return {
      path: "worktree.maxWorktrees",
      message: "High maximum worktrees limit",
      suggestion: "Consider a lower limit to avoid resource issues"
    };
  }
  return null;
}
```

---

## Environment Variable Overrides

Configuration values can be overridden with environment variables:

### Variable Naming Convention
```
ARASHI_<SECTION>_<FIELD>=value
```

### Examples
```bash
# Override worktree base directory
export ARASHI_WORKTREE_BASEDIR=".worktrees"

# Override default base branch
export ARASHI_BRANCH_DEFAULTBASE="develop"

# Override auto-fetch
export ARASHI_GIT_AUTOFETCH="false"

# Override CLI color
export ARASHI_CLI_COLOR="false"

# Override fetch timeout (in milliseconds)
export ARASHI_GIT_FETCHTIMEOUT="60000"
```

### Environment Variable Processing

```typescript
function loadEnvironmentOverrides(config: ArashiConfig): ArashiConfig {
  const envPrefix = 'ARASHI_';
  
  // Process all ARASHI_* environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(envPrefix)) continue;
    
    // Parse key: ARASHI_WORKTREE_BASEDIR -> ["worktree", "baseDir"]
    const parts = key
      .slice(envPrefix.length)
      .toLowerCase()
      .split('_');
    
    // Convert camelCase: basedir -> baseDir
    const path = parts.map((part, i) => 
      i === 0 ? part : part[0].toUpperCase() + part.slice(1)
    );
    
    // Set value at path
    setConfigValue(config, path, parseEnvValue(value));
  }
  
  return config;
}

function parseEnvValue(value: string): unknown {
  // Parse boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Parse number
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  
  // Return string
  return value;
}
```

---

## Configuration Loading

### Loading Process

```typescript
async function loadConfiguration(projectRoot: string): Promise<ArashiConfig> {
  // 1. Start with defaults
  let config = getDefaultConfig();
  
  // 2. Load global config (if exists)
  const globalConfig = await loadGlobalConfig();
  if (globalConfig) {
    config = mergeConfigs(config, globalConfig);
  }
  
  // 3. Load project config (if exists)
  const projectConfig = await loadProjectConfig(projectRoot);
  if (projectConfig) {
    config = mergeConfigs(config, projectConfig);
  }
  
  // 4. Apply environment variable overrides
  config = loadEnvironmentOverrides(config);
  
  // 5. Validate final configuration
  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new ArashiError('Invalid configuration', {
      code: 'CONFIG_INVALID',
      errors: validation.errors
    });
  }
  
  // 6. Show warnings (if any)
  if (validation.warnings.length > 0) {
    showWarnings(validation.warnings);
  }
  
  return config;
}
```

### Configuration Merging

```typescript
function mergeConfigs(
  base: ArashiConfig,
  override: Partial<ArashiConfig>
): ArashiConfig {
  return {
    ...base,
    worktree: { ...base.worktree, ...override.worktree },
    branch: { ...base.branch, ...override.branch },
    git: { ...base.git, ...override.git },
    cli: { ...base.cli, ...override.cli },
    hooks: override.hooks 
      ? { ...base.hooks, ...override.hooks }
      : base.hooks,
    metadata: override.metadata
      ? { ...base.metadata, ...override.metadata }
      : base.metadata,
    version: override.version || base.version,
  };
}
```

---

## Configuration Migration

### Migration Strategy

When configuration schema versions change, automatic migration is performed:

```typescript
interface MigrationPlan {
  from: string;      // Source version
  to: string;        // Target version
  migrate: (config: unknown) => ArashiConfig;
  changes: string[]; // List of changes
}

const migrations: MigrationPlan[] = [
  // Future migrations will be added here
  // Example:
  // {
  //   from: "1.0",
  //   to: "1.1",
  //   migrate: migrateV1ToV1_1,
  //   changes: [
  //     "Added new field: worktree.template",
  //     "Deprecated: branch.autoSetUpstream (use git.autoSetUpstream)"
  //   ]
  // }
];
```

### Migration Execution

```typescript
async function migrateConfiguration(
  config: unknown,
  targetVersion: string
): Promise<ArashiConfig> {
  // Determine current version
  const currentVersion = (config as any).version || '1.0';
  
  if (currentVersion === targetVersion) {
    return config as ArashiConfig;
  }
  
  // Find migration path
  const path = findMigrationPath(currentVersion, targetVersion);
  
  if (!path) {
    throw new ArashiError(
      `No migration path from ${currentVersion} to ${targetVersion}`,
      { code: 'CONFIG_MIGRATION_FAILED' }
    );
  }
  
  // Apply migrations in sequence
  let migratedConfig = config;
  for (const migration of path) {
    console.log(`Migrating configuration: ${migration.from} → ${migration.to}`);
    migration.changes.forEach(change => console.log(`  - ${change}`));
    
    migratedConfig = migration.migrate(migratedConfig);
  }
  
  // Backup original configuration
  await backupConfiguration(config, currentVersion);
  
  // Save migrated configuration
  await saveConfiguration(migratedConfig as ArashiConfig);
  
  return migratedConfig as ArashiConfig;
}
```

### Backup Strategy

```typescript
async function backupConfiguration(
  config: unknown,
  version: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `.arashi/config.backup.${version}.${timestamp}.json`;
  
  await fs.writeFile(
    backupPath,
    JSON.stringify(config, null, 2),
    'utf8'
  );
  
  console.log(`Configuration backed up to: ${backupPath}`);
}
```

---

## Configuration Templates

### Basic Template
```json
{
  "version": "1.0",
  "worktree": {
    "baseDir": ".arashi",
    "dirPattern": "{taskId}"
  },
  "branch": {
    "defaultBase": "main",
    "prefix": "feature/",
    "pattern": "{prefix}{taskId}",
    "taskIdFormat": "^[a-zA-Z0-9-_]+$"
  },
  "git": {
    "remote": "origin"
  },
  "cli": {}
}
```

### Jira Template
```json
{
  "version": "1.0",
  "worktree": {
    "baseDir": ".worktrees",
    "dirPattern": "{taskId}"
  },
  "branch": {
    "defaultBase": "develop",
    "prefix": "feature/",
    "pattern": "{prefix}{taskId}",
    "taskIdFormat": "^[A-Z]+-\\d+$"
  },
  "git": {
    "remote": "origin",
    "autoFetch": true
  },
  "cli": {
    "confirmDestructive": true
  }
}
```

### Advanced Template
```json
{
  "version": "1.0",
  "worktree": {
    "baseDir": ".worktrees",
    "dirPattern": "{taskId}-{timestamp}",
    "maxWorktrees": 5,
    "autoRemove": true,
    "autoPrune": true
  },
  "branch": {
    "defaultBase": "develop",
    "prefix": "feature/",
    "pattern": "{prefix}{taskId}",
    "taskIdFormat": "^[A-Z]+-\\d+$",
    "autoSetUpstream": true,
    "upstreamRemote": "origin"
  },
  "git": {
    "remote": "origin",
    "autoFetch": true,
    "fetchTimeout": 60000,
    "pruneFetch": true,
    "requireClean": true
  },
  "cli": {
    "color": true,
    "defaultFormat": "table",
    "verbose": false,
    "confirmDestructive": true,
    "showCommands": true
  },
  "hooks": {
    "afterCreate": "cd {path} && npm install",
    "beforeRemove": "cd {path} && npm run cleanup",
    "timeout": 120000
  }
}
```

---

## Configuration API

### TypeScript API

```typescript
/**
 * Load configuration from project
 */
export async function loadConfig(
  projectRoot?: string
): Promise<ArashiConfig>;

/**
 * Save configuration to project
 */
export async function saveConfig(
  config: ArashiConfig,
  projectRoot?: string
): Promise<void>;

/**
 * Validate configuration
 */
export function validateConfig(
  config: unknown
): ValidationResult;

/**
 * Get default configuration
 */
export function getDefaultConfig(): ArashiConfig;

/**
 * Merge configurations (deep merge)
 */
export function mergeConfigs(
  base: ArashiConfig,
  override: Partial<ArashiConfig>
): ArashiConfig;

/**
 * Migrate configuration to target version
 */
export async function migrateConfig(
  config: unknown,
  targetVersion: string
): Promise<ArashiConfig>;

/**
 * Get configuration value by path
 */
export function getConfigValue<T = unknown>(
  config: ArashiConfig,
  path: string[]
): T | undefined;

/**
 * Set configuration value by path
 */
export function setConfigValue(
  config: ArashiConfig,
  path: string[],
  value: unknown
): void;
```

---

## Testing Requirements

### Configuration Tests

```typescript
describe('Configuration', () => {
  describe('validation', () => {
    it('should validate correct configuration', () => {});
    it('should reject invalid version format', () => {});
    it('should reject invalid patterns', () => {});
    it('should reject invalid timeouts', () => {});
    it('should show warnings for uncommon values', () => {});
  });

  describe('loading', () => {
    it('should load default configuration', () => {});
    it('should load project configuration', () => {});
    it('should load global configuration', () => {});
    it('should merge configurations correctly', () => {});
    it('should apply environment overrides', () => {});
    it('should prioritize configurations correctly', () => {});
  });

  describe('migration', () => {
    it('should migrate from v1.0 to v1.1', () => {});
    it('should backup before migration', () => {});
    it('should validate after migration', () => {});
    it('should handle missing version', () => {});
  });

  describe('templates', () => {
    it('should provide valid basic template', () => {});
    it('should provide valid jira template', () => {});
    it('should provide valid advanced template', () => {});
  });
});
```

---

## Change Log

### Version 1.0.0 (2026-02-03)
- Initial configuration schema
- JSON schema definition
- Validation rules
- Migration strategy
- Environment variable overrides
