# Configuration Management Patterns for CLI Tools

Research document covering best practices for configuration management in command-line tools.

---

## 1. JSON Validation Approaches

### Overview

Configuration validation ensures that user-provided config files are correct before the application attempts to use them. Three main approaches exist: manual validation, schema-based validation (JSON Schema), and TypeScript-first validation (Zod).

### Approach Comparison

#### Manual Validation

**Pattern:**

```typescript
interface Config {
  repositories: string[];
  setupScript?: string;
  parallel?: boolean;
}

function validateConfig(data: unknown): Config {
  if (!data || typeof data !== "object") {
    throw new Error("Config must be an object");
  }

  const config = data as Record<string, unknown>;

  // Validate repositories
  if (!Array.isArray(config.repositories)) {
    throw new Error("repositories must be an array");
  }

  for (const repo of config.repositories) {
    if (typeof repo !== "string") {
      throw new Error("Each repository must be a string path");
    }
  }

  // Validate optional fields
  if (
    config.setupScript !== undefined &&
    typeof config.setupScript !== "string"
  ) {
    throw new Error("setupScript must be a string");
  }

  if (config.parallel !== undefined && typeof config.parallel !== "boolean") {
    throw new Error("parallel must be a boolean");
  }

  return {
    repositories: config.repositories,
    setupScript: config.setupScript,
    parallel: config.parallel,
  };
}
```

**Pros:**

- No dependencies
- Full control over error messages
- Easy to understand and debug
- Smallest bundle size

**Cons:**

- Verbose and repetitive
- Easy to miss edge cases
- No automatic type inference
- Manual maintenance as config grows

---

#### JSON Schema

**Pattern:**

```typescript
import Ajv from "ajv";

const configSchema = {
  type: "object",
  required: ["repositories"],
  properties: {
    repositories: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    setupScript: { type: "string" },
    parallel: { type: "boolean" },
    timeout: {
      type: "number",
      minimum: 0,
      maximum: 300000,
    },
  },
  additionalProperties: false,
};

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(configSchema);

function validateConfig(data: unknown): Config {
  if (!validate(data)) {
    const errors = validate.errors
      ?.map((err) => `${err.instancePath} ${err.message}`)
      .join("; ");
    throw new Error(`Invalid config: ${errors}`);
  }
  return data as Config;
}
```

**Pros:**

- Industry standard (JSON Schema spec)
- Language agnostic (can validate from any language)
- Powerful validation rules (regex, ranges, formats)
- Can generate documentation from schema
- Widely understood format

**Cons:**

- Requires external library
- Separate type definitions needed for TypeScript
- Error messages can be cryptic
- Schema definition verbose
- Type safety gap between schema and TypeScript types

---

#### Zod (Recommended for TypeScript CLI tools)

**Pattern:**

```typescript
import { z } from "zod";

const ConfigSchema = z.object({
  repositories: z.array(z.string()).min(1, "At least one repository required"),
  setupScript: z.string().optional(),
  parallel: z.boolean().default(false),
  timeout: z.number().min(0).max(300000).default(30000),
  env: z.record(z.string()).optional(),
  excludePatterns: z.array(z.string()).default([]),
});

type Config = z.infer<typeof ConfigSchema>;

function validateConfig(data: unknown): Config {
  try {
    return ConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Configuration validation failed:\n${messages}`);
    }
    throw error;
  }
}
```

**Pros:**

- TypeScript-first design
- Automatic type inference (single source of truth)
- Excellent error messages
- Composable and chainable
- Built-in transformations and refinements
- Great developer experience
- Small bundle size with tree-shaking

**Cons:**

- Adds a dependency (~50KB)
- TypeScript only
- Learning curve for complex schemas

---

### Recommendation for CLI Tools

**Use Zod** for TypeScript CLI tools. The benefits outweigh the small dependency cost:

1. **Type Safety**: Single source of truth prevents drift between types and validation
2. **Developer Experience**: Excellent autocomplete and refactoring support
3. **User Experience**: Clear, actionable error messages
4. **Maintainability**: Easy to evolve schemas as requirements change

**Example: Complete validation with Zod**

```typescript
import { z } from "zod";
import { readFileSync } from "fs";

const ConfigSchema = z
  .object({
    version: z.literal("1.0.0"),
    repositories: z.array(z.string().min(1)).min(1),
    setupScript: z.string().optional(),
    parallel: z.boolean().default(false),
    env: z.record(z.string()).optional(),
    excludePatterns: z.array(z.string()).default(["node_modules", ".git"]),
  })
  .strict(); // Reject unknown properties

type Config = z.infer<typeof ConfigSchema>;

function loadConfig(path: string): Config {
  const raw = readFileSync(path, "utf-8");
  const json = JSON.parse(raw);
  return ConfigSchema.parse(json);
}
```

---

## 2. Configuration Migration

### Strategy Overview

Configuration migration allows seamless updates when config format changes between versions. The pattern uses versioned schemas and transformation functions.

### Core Pattern

```typescript
import { z } from "zod";

// Version 1.0 schema
const ConfigV1Schema = z.object({
  version: z.literal("1.0.0"),
  repositories: z.array(z.string()),
});

// Version 2.0 schema (added new fields)
const ConfigV2Schema = z.object({
  version: z.literal("2.0.0"),
  repositories: z.array(
    z.object({
      path: z.string(),
      enabled: z.boolean().default(true),
    }),
  ),
  parallel: z.boolean().default(false),
});

type ConfigV1 = z.infer<typeof ConfigV1Schema>;
type ConfigV2 = z.infer<typeof ConfigV2Schema>;

// Migration functions
function migrateV1toV2(config: ConfigV1): ConfigV2 {
  return {
    version: "2.0.0",
    repositories: config.repositories.map((path) => ({
      path,
      enabled: true,
    })),
    parallel: false,
  };
}

// Version detector
const VersionSchema = z.object({
  version: z.string(),
});

function detectVersion(data: unknown): string {
  const parsed = VersionSchema.parse(data);
  return parsed.version;
}

// Migration orchestrator
function migrateConfig(data: unknown): ConfigV2 {
  const version = detectVersion(data);

  switch (version) {
    case "1.0.0":
      const v1 = ConfigV1Schema.parse(data);
      return migrateV1toV2(v1);
    case "2.0.0":
      return ConfigV2Schema.parse(data);
    default:
      throw new Error(`Unsupported config version: ${version}`);
  }
}
```

### Automatic Migration with Backup

```typescript
import { readFileSync, writeFileSync, copyFileSync } from "fs";
import { basename } from "path";

interface MigrationOptions {
  autoMigrate: boolean;
  createBackup: boolean;
  dryRun: boolean;
}

function loadAndMigrateConfig(
  configPath: string,
  options: MigrationOptions = {
    autoMigrate: true,
    createBackup: true,
    dryRun: false,
  },
): ConfigV2 {
  const raw = readFileSync(configPath, "utf-8");
  const data = JSON.parse(raw);

  const version = detectVersion(data);
  const CURRENT_VERSION = "2.0.0";

  if (version === CURRENT_VERSION) {
    return ConfigV2Schema.parse(data);
  }

  console.log(
    `Found config version ${version}, current version is ${CURRENT_VERSION}`,
  );

  if (!options.autoMigrate) {
    throw new Error(
      `Config version ${version} is outdated. ` +
        `Please migrate to ${CURRENT_VERSION} or run with --migrate flag`,
    );
  }

  // Perform migration
  const migrated = migrateConfig(data);

  if (options.dryRun) {
    console.log("Dry run - migration would produce:");
    console.log(JSON.stringify(migrated, null, 2));
    return migrated;
  }

  // Create backup
  if (options.createBackup) {
    const backupPath = `${configPath}.backup-v${version}`;
    copyFileSync(configPath, backupPath);
    console.log(`Created backup: ${backupPath}`);
  }

  // Write migrated config
  writeFileSync(configPath, JSON.stringify(migrated, null, 2) + "\n", "utf-8");

  console.log(
    `Successfully migrated config from v${version} to v${CURRENT_VERSION}`,
  );

  return migrated;
}
```

### Migration Registry Pattern

For tools with many versions, use a registry:

```typescript
type MigrationFn<From, To> = (config: From) => To;

interface MigrationRegistry {
  [fromVersion: string]: {
    [toVersion: string]: MigrationFn<any, any>;
  };
}

const migrations: MigrationRegistry = {
  "1.0.0": {
    "2.0.0": migrateV1toV2,
  },
  "2.0.0": {
    "3.0.0": migrateV2toV3,
  },
};

function findMigrationPath(from: string, to: string): string[] {
  // BFS to find shortest migration path
  const queue: [string, string[]][] = [[from, [from]]];
  const visited = new Set<string>([from]);

  while (queue.length > 0) {
    const [current, path] = queue.shift()!;

    if (current === to) {
      return path;
    }

    const nextVersions = Object.keys(migrations[current] || {});
    for (const next of nextVersions) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([next, [...path, next]]);
      }
    }
  }

  throw new Error(`No migration path from ${from} to ${to}`);
}

function migrateConfigChained(data: unknown, targetVersion: string): any {
  const currentVersion = detectVersion(data);

  if (currentVersion === targetVersion) {
    return data;
  }

  const path = findMigrationPath(currentVersion, targetVersion);

  let config = data;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const migrate = migrations[from][to];
    config = migrate(config);
    console.log(`Migrated ${from} -> ${to}`);
  }

  return config;
}
```

### Best Practices

1. **Always version configs**: Include a `version` field as the first property
2. **Create backups**: Before writing migrated configs, save originals
3. **Test migrations**: Unit test each migration function with real data
4. **Document changes**: Keep a CHANGELOG.md of config schema changes
5. **Validate after migration**: Always validate migrated config against new schema
6. **Support dry-run**: Let users preview migrations before applying
7. **Fail fast on unknown versions**: Don't assume forward compatibility

### Security Considerations

- **Validate before and after migration**: Prevent injection through malformed configs
- **Limit backup retention**: Don't accumulate infinite backups
- **Audit migration logic**: Ensure no data loss or corruption
- **Handle secrets carefully**: If config contains secrets, preserve file permissions

---

## 3. Defaults and Override Hierarchy

### Override Hierarchy Pattern

Configuration sources should follow a clear precedence order:

```
CLI flags > Environment variables > Config file > Defaults
```

### Implementation

```typescript
import { z } from "zod";

// Base schema with all defaults
const ConfigSchema = z.object({
  repositories: z.array(z.string()).default([]),
  parallel: z.boolean().default(false),
  timeout: z.number().default(30000),
  logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),
  setupScript: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

interface CLIFlags {
  config?: string;
  parallel?: boolean;
  timeout?: number;
  logLevel?: string;
  repository?: string[];
}

function loadDefaults(): Config {
  return ConfigSchema.parse({});
}

function loadConfigFile(path?: string): Partial<Config> {
  if (!path) {
    return {};
  }

  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw);
    return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`Config file not found: ${path}`);
      return {};
    }
    throw error;
  }
}

function loadEnvVars(): Partial<Config> {
  const env: Partial<Config> = {};

  if (process.env.ARASHI_PARALLEL) {
    env.parallel = process.env.ARASHI_PARALLEL === "true";
  }

  if (process.env.ARASHI_TIMEOUT) {
    env.timeout = parseInt(process.env.ARASHI_TIMEOUT, 10);
  }

  if (process.env.ARASHI_LOG_LEVEL) {
    env.logLevel = process.env.ARASHI_LOG_LEVEL as any;
  }

  if (process.env.ARASHI_SETUP_SCRIPT) {
    env.setupScript = process.env.ARASHI_SETUP_SCRIPT;
  }

  return env;
}

function parseCLIFlags(args: CLIFlags): Partial<Config> {
  const flags: Partial<Config> = {};

  if (args.parallel !== undefined) {
    flags.parallel = args.parallel;
  }

  if (args.timeout !== undefined) {
    flags.timeout = args.timeout;
  }

  if (args.logLevel !== undefined) {
    flags.logLevel = args.logLevel as any;
  }

  if (args.repository !== undefined) {
    flags.repositories = args.repository;
  }

  return flags;
}

function mergeConfigs(...configs: Partial<Config>[]): Config {
  const merged: any = {};

  for (const config of configs) {
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
  }

  return ConfigSchema.parse(merged);
}

function resolveConfig(cliFlags: CLIFlags): Config {
  const defaults = loadDefaults();
  const fileConfig = loadConfigFile(cliFlags.config);
  const envConfig = loadEnvVars();
  const flagConfig = parseCLIFlags(cliFlags);

  return mergeConfigs(defaults, fileConfig, envConfig, flagConfig);
}
```

### Usage Example

```typescript
// User runs: arashi --parallel --timeout 60000 --config ./arashi.json

const cliFlags: CLIFlags = {
  config: "./arashi.json",
  parallel: true,
  timeout: 60000,
};

const config = resolveConfig(cliFlags);

// Result:
// {
//   repositories: [...],        // from config file
//   parallel: true,             // from CLI flag (overrides file)
//   timeout: 60000,             // from CLI flag (overrides file)
//   logLevel: 'info',           // default
//   setupScript: '...'          // from config file
// }
```

### Config File Discovery

```typescript
import { existsSync } from "fs";
import { resolve, dirname } from "path";

function findConfigFile(startDir: string = process.cwd()): string | null {
  const configNames = ["arashi.json", ".arashirc.json", ".arashirc"];

  let currentDir = resolve(startDir);
  const root = dirname(currentDir);

  while (true) {
    for (const name of configNames) {
      const configPath = resolve(currentDir, name);
      if (existsSync(configPath)) {
        return configPath;
      }
    }

    // Check package.json for "arashi" field
    const packageJsonPath = resolve(currentDir, "package.json");
    if (existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
        if (pkg.arashi) {
          return packageJsonPath; // Special marker
        }
      } catch {
        // Ignore invalid package.json
      }
    }

    if (currentDir === root) {
      break;
    }

    currentDir = dirname(currentDir);
  }

  return null;
}
```

### Best Practices

1. **Document precedence**: Clearly state override order in docs and help text
2. **Show resolved config**: Provide `--show-config` flag to display final merged config
3. **Validate merged result**: Always validate the final merged config
4. **Avoid deep merging**: Only merge top-level properties to avoid confusion
5. **Use env prefix**: Namespace environment variables (e.g., `ARASHI_*`)
6. **Make defaults explicit**: Don't rely on implicit falsy values

### Debug Output

```typescript
function showConfigDebug(
  config: Config,
  sources: {
    defaults: Config;
    file: Partial<Config>;
    env: Partial<Config>;
    flags: Partial<Config>;
  },
) {
  console.log("Configuration sources:\n");

  for (const [key, value] of Object.entries(config)) {
    let source = "default";

    if (sources.flags[key as keyof Config] !== undefined) {
      source = "CLI flag";
    } else if (sources.env[key as keyof Config] !== undefined) {
      source = "environment";
    } else if (sources.file[key as keyof Config] !== undefined) {
      source = "config file";
    }

    console.log(`  ${key}: ${JSON.stringify(value)} (${source})`);
  }
}
```

---

## 4. Repository Discovery Algorithm

### Overview

Recursively discover git repositories within a directory tree by finding `.git` files or folders.

### Basic Algorithm

```typescript
import { readdirSync, statSync, lstatSync } from "fs";
import { join, resolve } from "path";

interface RepositoryInfo {
  path: string;
  isWorktree: boolean;
  gitDirPath: string;
}

function isGitRepository(dirPath: string): {
  isRepo: boolean;
  isWorktree: boolean;
  gitDir?: string;
} {
  try {
    const gitPath = join(dirPath, ".git");
    const stats = lstatSync(gitPath);

    if (stats.isDirectory()) {
      // Standard git repository
      return { isRepo: true, isWorktree: false, gitDir: gitPath };
    }

    if (stats.isFile()) {
      // Git worktree (contains "gitdir: ..." pointer)
      const content = readFileSync(gitPath, "utf-8").trim();
      const match = content.match(/^gitdir: (.+)$/);
      if (match) {
        return { isRepo: true, isWorktree: true, gitDir: match[1] };
      }
    }
  } catch (error) {
    // .git doesn't exist
  }

  return { isRepo: false, isWorktree: false };
}

function discoverRepositories(
  rootDir: string,
  options: {
    maxDepth?: number;
    excludePatterns?: string[];
    followSymlinks?: boolean;
  } = {},
): RepositoryInfo[] {
  const {
    maxDepth = Infinity,
    excludePatterns = ["node_modules", ".git"],
    followSymlinks = false,
  } = options;

  const repos: RepositoryInfo[] = [];

  function traverse(dirPath: string, depth: number) {
    if (depth > maxDepth) {
      return;
    }

    // Check if current directory is a repository
    const repoCheck = isGitRepository(dirPath);
    if (repoCheck.isRepo) {
      repos.push({
        path: dirPath,
        isWorktree: repoCheck.isWorktree,
        gitDirPath: repoCheck.gitDir!,
      });
      // Don't traverse into repositories
      return;
    }

    // Read directory contents
    let entries: string[];
    try {
      entries = readdirSync(dirPath);
    } catch (error) {
      // Permission denied or not a directory
      return;
    }

    for (const entry of entries) {
      // Check exclusions
      if (excludePatterns.some((pattern) => entry.includes(pattern))) {
        continue;
      }

      const fullPath = join(dirPath, entry);

      let stats;
      try {
        stats = followSymlinks ? statSync(fullPath) : lstatSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isDirectory()) {
        traverse(fullPath, depth + 1);
      }
    }
  }

  traverse(resolve(rootDir), 0);
  return repos;
}
```

### Optimized Parallel Discovery

```typescript
import { readdir, stat, lstat, readFile } from "fs/promises";
import { cpus } from "os";

async function isGitRepositoryAsync(dirPath: string): Promise<{
  isRepo: boolean;
  isWorktree: boolean;
  gitDir?: string;
}> {
  try {
    const gitPath = join(dirPath, ".git");
    const stats = await lstat(gitPath);

    if (stats.isDirectory()) {
      return { isRepo: true, isWorktree: false, gitDir: gitPath };
    }

    if (stats.isFile()) {
      const content = await readFile(gitPath, "utf-8");
      const match = content.trim().match(/^gitdir: (.+)$/);
      if (match) {
        return { isRepo: true, isWorktree: true, gitDir: match[1] };
      }
    }
  } catch {
    // .git doesn't exist
  }

  return { isRepo: false, isWorktree: false };
}

async function discoverRepositoriesAsync(
  rootDir: string,
  options: {
    maxDepth?: number;
    excludePatterns?: string[];
    followSymlinks?: boolean;
    parallel?: boolean;
  } = {},
): Promise<RepositoryInfo[]> {
  const {
    maxDepth = Infinity,
    excludePatterns = ["node_modules", ".git"],
    followSymlinks = false,
    parallel = true,
  } = options;

  const repos: RepositoryInfo[] = [];
  const maxConcurrency = parallel ? cpus().length : 1;

  async function traverse(dirPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) {
      return;
    }

    const repoCheck = await isGitRepositoryAsync(dirPath);
    if (repoCheck.isRepo) {
      repos.push({
        path: dirPath,
        isWorktree: repoCheck.isWorktree,
        gitDirPath: repoCheck.gitDir!,
      });
      return;
    }

    let entries: string[];
    try {
      entries = await readdir(dirPath);
    } catch {
      return;
    }

    const filtered = entries.filter(
      (entry) => !excludePatterns.some((pattern) => entry.includes(pattern)),
    );

    // Process in batches for concurrency control
    for (let i = 0; i < filtered.length; i += maxConcurrency) {
      const batch = filtered.slice(i, i + maxConcurrency);

      await Promise.all(
        batch.map(async (entry) => {
          const fullPath = join(dirPath, entry);

          try {
            const stats = followSymlinks
              ? await stat(fullPath)
              : await lstat(fullPath);

            if (stats.isDirectory()) {
              await traverse(fullPath, depth + 1);
            }
          } catch {
            // Skip inaccessible paths
          }
        }),
      );
    }
  }

  await traverse(resolve(rootDir), 0);
  return repos;
}
```

### Glob-Based Discovery

```typescript
import { glob } from "glob";

async function discoverRepositoriesGlob(
  rootDir: string,
  options: {
    excludePatterns?: string[];
  } = {},
): Promise<string[]> {
  const { excludePatterns = ["node_modules"] } = options;

  const gitDirs = await glob("**/.git", {
    cwd: rootDir,
    absolute: true,
    ignore: excludePatterns.map((p) => `**/${p}/**`),
    dot: true,
  });

  // Extract repository paths (parent of .git)
  return gitDirs.map((gitPath) => dirname(gitPath));
}
```

### Best Practices

1. **Stop at first .git**: Don't traverse inside repositories
2. **Respect exclusions**: Honor `.gitignore` and common patterns
3. **Handle symlinks carefully**: Avoid infinite loops
4. **Limit depth**: Prevent excessive recursion
5. **Report progress**: For large trees, show progress
6. **Handle permissions**: Gracefully skip inaccessible directories
7. **Detect worktrees**: Distinguish between main repos and worktrees

### Security Considerations

- **Symlink attacks**: Don't follow symlinks by default
- **Path traversal**: Validate that discovered repos are within root
- **Resource exhaustion**: Limit max depth and concurrency
- **Permission escalation**: Don't change permissions to access dirs

### Progress Reporting

```typescript
interface DiscoveryProgress {
  directoriesScanned: number;
  repositoriesFound: number;
  currentPath: string;
}

type ProgressCallback = (progress: DiscoveryProgress) => void;

async function discoverRepositoriesWithProgress(
  rootDir: string,
  onProgress?: ProgressCallback,
): Promise<RepositoryInfo[]> {
  const repos: RepositoryInfo[] = [];
  const progress: DiscoveryProgress = {
    directoriesScanned: 0,
    repositoriesFound: 0,
    currentPath: "",
  };

  async function traverse(dirPath: string, depth: number) {
    progress.directoriesScanned++;
    progress.currentPath = dirPath;

    if (onProgress && progress.directoriesScanned % 10 === 0) {
      onProgress({ ...progress });
    }

    const repoCheck = await isGitRepositoryAsync(dirPath);
    if (repoCheck.isRepo) {
      repos.push({
        path: dirPath,
        isWorktree: repoCheck.isWorktree,
        gitDirPath: repoCheck.gitDir!,
      });
      progress.repositoriesFound++;
      if (onProgress) {
        onProgress({ ...progress });
      }
      return;
    }

    // ... continue traversal
  }

  await traverse(resolve(rootDir), 0);
  return repos;
}

// Usage
const repos = await discoverRepositoriesWithProgress(
  "/projects",
  (progress) => {
    console.log(
      `Scanned ${progress.directoriesScanned} dirs, found ${progress.repositoriesFound} repos`,
    );
    console.log(`Currently at: ${progress.currentPath}`);
  },
);
```

---

## 5. Validation Rules and Error Messages

### User-Friendly Error Messages

```typescript
import { z } from "zod";

// Custom error messages in schema
const ConfigSchema = z.object({
  repositories: z
    .array(z.string())
    .min(1, "At least one repository is required")
    .refine(
      (repos) => repos.every((r) => !r.includes("*")),
      "Repository paths cannot contain wildcards. Did you mean to use a directory?",
    ),

  timeout: z
    .number({
      required_error: "timeout is required",
      invalid_type_error: "timeout must be a number",
    })
    .min(1000, "timeout must be at least 1000ms (1 second)")
    .max(300000, "timeout cannot exceed 300000ms (5 minutes)"),

  parallel: z.boolean().default(false),

  setupScript: z
    .string()
    .optional()
    .refine(
      (script) => !script || !script.includes("rm -rf"),
      "Setup script contains potentially dangerous command",
    ),

  logLevel: z.enum(["error", "warn", "info", "debug"]).default("info"),

  env: z
    .record(z.string())
    .optional()
    .refine(
      (env) => !env || !Object.keys(env).some((k) => k.includes(" ")),
      "Environment variable names cannot contain spaces",
    ),
});

// Enhanced error formatting
function formatValidationError(error: z.ZodError): string {
  const errors = error.errors.map((err) => {
    const path = err.path.join(".");
    const location = path ? `"${path}"` : "configuration";

    switch (err.code) {
      case "invalid_type":
        return `${location}: expected ${err.expected}, got ${err.received}`;

      case "too_small":
        if (err.type === "array") {
          return `${location}: must have at least ${err.minimum} item(s)`;
        }
        return `${location}: ${err.message}`;

      case "too_big":
        if (err.type === "array") {
          return `${location}: must have at most ${err.maximum} item(s)`;
        }
        return `${location}: ${err.message}`;

      case "invalid_enum_value":
        return `${location}: must be one of [${err.options.join(", ")}]`;

      case "custom":
        return `${location}: ${err.message}`;

      default:
        return `${location}: ${err.message}`;
    }
  });

  return errors.join("\n");
}

function validateConfigWithMessages(data: unknown): Config {
  try {
    return ConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = formatValidationError(error);
      console.error("Configuration validation failed:\n");
      console.error(formatted);
      process.exit(1);
    }
    throw error;
  }
}
```

### Semantic Validation

```typescript
import { existsSync, accessSync, constants } from "fs";

// Validate after parsing
function validateConfigSemantics(config: Config): void {
  const errors: string[] = [];

  // Check repository paths exist
  for (const repo of config.repositories) {
    if (!existsSync(repo)) {
      errors.push(`Repository does not exist: ${repo}`);
    } else if (!existsSync(join(repo, ".git"))) {
      errors.push(`Not a git repository: ${repo}`);
    }
  }

  // Check setup script exists and is executable
  if (config.setupScript) {
    if (!existsSync(config.setupScript)) {
      errors.push(`Setup script not found: ${config.setupScript}`);
    } else {
      try {
        accessSync(config.setupScript, constants.X_OK);
      } catch {
        errors.push(
          `Setup script is not executable: ${config.setupScript}\n` +
            `Run: chmod +x ${config.setupScript}`,
        );
      }
    }
  }

  // Check for conflicting options
  if (config.parallel && config.timeout < 5000) {
    errors.push(
      "Warning: parallel execution with timeout < 5000ms may cause issues",
    );
  }

  if (errors.length > 0) {
    throw new Error("Configuration validation failed:\n" + errors.join("\n"));
  }
}
```

### Helpful Suggestions

```typescript
function suggestFixes(error: z.ZodError, rawData: unknown): string[] {
  const suggestions: string[] = [];

  for (const err of error.errors) {
    const path = err.path.join(".");

    if (err.code === "invalid_type" && err.expected === "array") {
      suggestions.push(
        `Did you forget to wrap "${path}" in square brackets? Try: "${path}": [${JSON.stringify((rawData as any)[path])}]`,
      );
    }

    if (err.code === "unrecognized_keys") {
      const keys = (err as any).keys.join(", ");
      suggestions.push(
        `Unknown configuration key(s): ${keys}\n` +
          `Check for typos or refer to the configuration documentation`,
      );
    }

    if (path === "repositories" && (rawData as any).repository) {
      suggestions.push(
        `Did you mean "repositories" (plural) instead of "repository"?`,
      );
    }
  }

  return suggestions;
}
```

### Validation Example Output

```text
Configuration validation failed:

  "repositories": must have at least 1 item(s)
  "timeout": expected number, got string
  "logLevel": must be one of [error, warn, info, debug]

Suggestions:
  - Did you forget to add any repositories?
  - "timeout" should be a number without quotes: "timeout": 30000
  - "logLevel" has a typo. Did you mean "info" instead of "information"?
```

---

## 6. File Locking Strategies

### Overview

File locking prevents concurrent writes to configuration files, avoiding corruption and race conditions.

### Lock File Pattern (Simple)

```typescript
import { existsSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { join } from "path";

interface LockOptions {
  timeout?: number;
  stale?: number;
}

class FileLock {
  private lockPath: string;
  private acquired: boolean = false;

  constructor(private filePath: string) {
    this.lockPath = `${filePath}.lock`;
  }

  async acquire(options: LockOptions = {}): Promise<void> {
    const { timeout = 5000, stale = 10000 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (this.tryAcquire(stale)) {
        this.acquired = true;
        return;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(
      `Failed to acquire lock for ${this.filePath} after ${timeout}ms`,
    );
  }

  private tryAcquire(stalePeriod: number): boolean {
    if (!existsSync(this.lockPath)) {
      try {
        writeFileSync(
          this.lockPath,
          JSON.stringify({
            pid: process.pid,
            timestamp: Date.now(),
          }),
          { flag: "wx" }, // Exclusive write
        );
        return true;
      } catch (error) {
        // Another process created the lock
        return false;
      }
    }

    // Check if lock is stale
    try {
      const lockData = JSON.parse(readFileSync(this.lockPath, "utf-8"));
      const age = Date.now() - lockData.timestamp;

      if (age > stalePeriod) {
        console.warn(`Removing stale lock (age: ${age}ms)`);
        unlinkSync(this.lockPath);
        return false; // Try again next iteration
      }
    } catch {
      // Corrupt lock file, remove it
      unlinkSync(this.lockPath);
      return false;
    }

    return false;
  }

  release(): void {
    if (!this.acquired) {
      return;
    }

    try {
      unlinkSync(this.lockPath);
      this.acquired = false;
    } catch (error) {
      console.warn(`Failed to release lock: ${error}`);
    }
  }

  async withLock<T>(fn: () => T | Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Usage
async function updateConfig(configPath: string, updates: Partial<Config>) {
  const lock = new FileLock(configPath);

  await lock.withLock(async () => {
    const current = JSON.parse(readFileSync(configPath, "utf-8"));
    const updated = { ...current, ...updates };
    writeFileSync(configPath, JSON.stringify(updated, null, 2));
  });
}
```

### Proper-Lockfile Library (Recommended)

```typescript
import lockfile from "proper-lockfile";
import { readFileSync, writeFileSync } from "fs";

async function updateConfigWithLockfile(
  configPath: string,
  updates: Partial<Config>,
) {
  // Acquire lock
  const release = await lockfile.lock(configPath, {
    stale: 10000,
    retries: {
      retries: 5,
      minTimeout: 100,
      maxTimeout: 1000,
    },
  });

  try {
    // Critical section
    const current = JSON.parse(readFileSync(configPath, "utf-8"));
    const updated = { ...current, ...updates };
    writeFileSync(configPath, JSON.stringify(updated, null, 2));
  } finally {
    await release();
  }
}
```

### Advisory Locking with flock (Unix)

```typescript
import { openSync, closeSync, flock } from "fs";

function updateConfigWithFlock(configPath: string, updates: Partial<Config>) {
  const fd = openSync(configPath, "r+");

  try {
    // Acquire exclusive lock
    flock(fd, "ex"); // Blocks until lock acquired

    const current = JSON.parse(readFileSync(fd, "utf-8"));
    const updated = { ...current, ...updates };

    // Truncate and write
    ftruncateSync(fd, 0);
    writeSync(fd, JSON.stringify(updated, null, 2));
  } finally {
    closeSync(fd); // Releases lock
  }
}
```

### Atomic Write Pattern

```typescript
import { writeFileSync, renameSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { randomBytes } from "crypto";

function atomicWrite(filePath: string, content: string): void {
  const dir = dirname(filePath);
  const tempPath = join(dir, `.${randomBytes(6).toString("hex")}.tmp`);

  try {
    // Write to temporary file
    writeFileSync(tempPath, content, { mode: 0o644 });

    // Atomic rename (overwrites destination)
    renameSync(tempPath, filePath);
  } catch (error) {
    // Clean up temp file on error
    try {
      unlinkSync(tempPath);
    } catch {
      // Ignore
    }
    throw error;
  }
}

async function updateConfigAtomic(
  configPath: string,
  updates: Partial<Config>,
) {
  const lock = new FileLock(configPath);

  await lock.withLock(() => {
    const current = JSON.parse(readFileSync(configPath, "utf-8"));
    const updated = { ...current, ...updates };
    atomicWrite(configPath, JSON.stringify(updated, null, 2));
  });
}
```

### Best Practices

1. **Use established libraries**: `proper-lockfile` handles edge cases
2. **Always use try-finally**: Ensure locks are released
3. **Handle stale locks**: Detect and remove abandoned locks
4. **Timeout strategy**: Don't wait forever for locks
5. **Atomic writes**: Use temp file + rename pattern
6. **Process cleanup**: Release locks on SIGINT/SIGTERM

### Signal Handling

```typescript
const activeLocks: FileLock[] = [];

function registerLock(lock: FileLock) {
  activeLocks.push(lock);
}

function unregisterLock(lock: FileLock) {
  const index = activeLocks.indexOf(lock);
  if (index > -1) {
    activeLocks.splice(index, 1);
  }
}

function setupLockCleanup() {
  const cleanup = () => {
    for (const lock of activeLocks) {
      lock.release();
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);
}

// Usage
const lock = new FileLock(configPath);
registerLock(lock);
try {
  await lock.acquire();
  // ... critical section
} finally {
  lock.release();
  unregisterLock(lock);
}
```

### Security Considerations

- **Lock file permissions**: Ensure lock files have appropriate permissions
- **Symlink attacks**: Validate lock file paths
- **PID reuse**: Don't rely solely on PID for lock ownership
- **Cleanup on crash**: Implement stale lock detection

---

## 7. Setup Script Detection

### Overview

Detect and validate setup scripts that should run before repository operations.

### Detection Algorithm

```typescript
import { existsSync, accessSync, constants, statSync } from "fs";
import { resolve } from "path";

interface SetupScriptInfo {
  path: string;
  exists: boolean;
  executable: boolean;
  type: "shell" | "node" | "python" | "other";
}

function detectSetupScript(scriptPath: string): SetupScriptInfo {
  const resolvedPath = resolve(scriptPath);

  const info: SetupScriptInfo = {
    path: resolvedPath,
    exists: false,
    executable: false,
    type: "other",
  };

  // Check existence
  if (!existsSync(resolvedPath)) {
    return info;
  }
  info.exists = true;

  // Check if it's a file
  const stats = statSync(resolvedPath);
  if (!stats.isFile()) {
    return info;
  }

  // Check executable permission
  try {
    accessSync(resolvedPath, constants.X_OK);
    info.executable = true;
  } catch {
    info.executable = false;
  }

  // Detect type by extension
  if (resolvedPath.endsWith(".sh") || resolvedPath.endsWith(".bash")) {
    info.type = "shell";
  } else if (resolvedPath.endsWith(".js") || resolvedPath.endsWith(".mjs")) {
    info.type = "node";
  } else if (resolvedPath.endsWith(".py")) {
    info.type = "python";
  }

  return info;
}
```

### Validation with User-Friendly Errors

```typescript
function validateSetupScript(scriptPath: string): void {
  const info = detectSetupScript(scriptPath);

  if (!info.exists) {
    throw new Error(
      `Setup script not found: ${scriptPath}\n\n` +
        `Please check the path in your configuration.`,
    );
  }

  if (!info.executable) {
    throw new Error(
      `Setup script is not executable: ${scriptPath}\n\n` +
        `To fix this, run:\n` +
        `  chmod +x ${scriptPath}`,
    );
  }
}
```

### Auto-Discovery Pattern

```typescript
function findSetupScript(repoPath: string): string | null {
  const candidates = [
    "setup.sh",
    "scripts/setup.sh",
    ".arashi/setup.sh",
    "setup",
    "bootstrap.sh",
    "bootstrap",
  ];

  for (const candidate of candidates) {
    const fullPath = join(repoPath, candidate);
    const info = detectSetupScript(fullPath);

    if (info.exists && info.executable) {
      return fullPath;
    }
  }

  return null;
}
```

### Execution with Safety Checks

```typescript
import { spawn } from "child_process";

interface ExecutionOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  dryRun?: boolean;
}

async function executeSetupScript(
  scriptPath: string,
  options: ExecutionOptions = {},
): Promise<{ success: boolean; output: string; error?: string }> {
  const {
    cwd = process.cwd(),
    env = {},
    timeout = 30000,
    dryRun = false,
  } = options;

  // Validate before execution
  validateSetupScript(scriptPath);

  if (dryRun) {
    console.log(`Would execute: ${scriptPath}`);
    return { success: true, output: "" };
  }

  const info = detectSetupScript(scriptPath);

  // Determine command based on script type
  let command: string;
  let args: string[];

  switch (info.type) {
    case "shell":
      command = "bash";
      args = [scriptPath];
      break;
    case "node":
      command = "node";
      args = [scriptPath];
      break;
    case "python":
      command = "python3";
      args = [scriptPath];
      break;
    default:
      // Direct execution
      command = scriptPath;
      args = [];
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      timeout,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
      process.stdout.write(data);
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
      process.stderr.write(data);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, output: stdout });
      } else {
        resolve({
          success: false,
          output: stdout,
          error: stderr || `Process exited with code ${code}`,
        });
      }
    });

    child.on("error", (error) => {
      reject(new Error(`Failed to execute setup script: ${error.message}`));
    });
  });
}
```

### Integration with Config

```typescript
const ConfigSchema = z.object({
  // ... other fields
  setupScript: z
    .string()
    .optional()
    .refine(
      (script) => {
        if (!script) return true;

        const info = detectSetupScript(script);
        return info.exists && info.executable;
      },
      (script) => {
        const info = detectSetupScript(script!);

        if (!info.exists) {
          return { message: `Setup script not found: ${script}` };
        }

        if (!info.executable) {
          return {
            message: `Setup script not executable: ${script}\nRun: chmod +x ${script}`,
          };
        }

        return { message: "Unknown error" };
      },
    ),
});
```

### Per-Repository Setup Scripts

```typescript
interface Repository {
  path: string;
  setupScript?: string;
}

function detectRepositorySetupScript(
  repoPath: string,
  globalScript?: string,
): string | null {
  // Priority:
  // 1. Repository-level script
  // 2. Global script from config

  const localScript = findSetupScript(repoPath);
  if (localScript) {
    return localScript;
  }

  if (globalScript) {
    return globalScript;
  }

  return null;
}

async function setupRepository(repo: Repository, globalScript?: string) {
  const script = detectRepositorySetupScript(repo.path, globalScript);

  if (!script) {
    console.log(`No setup script for ${repo.path}`);
    return;
  }

  console.log(`Running setup script for ${repo.path}: ${script}`);

  const result = await executeSetupScript(script, {
    cwd: repo.path,
  });

  if (!result.success) {
    throw new Error(`Setup failed for ${repo.path}: ${result.error}`);
  }
}
```

### Best Practices

1. **Check existence before execution**: Validate script exists and is executable
2. **Provide clear error messages**: Include fix commands (chmod +x)
3. **Support auto-discovery**: Look for common script names
4. **Use appropriate interpreters**: Detect script type and use proper executor
5. **Stream output**: Show script output in real-time
6. **Timeout protection**: Don't wait forever for scripts
7. **Dry-run support**: Let users preview what will execute

### Security Considerations

- **Validate script paths**: Ensure no path traversal
- **Don't auto-execute untrusted scripts**: Require explicit user configuration
- **Sanitize environment variables**: Don't pass sensitive data
- **Run with minimal permissions**: Don't escalate privileges
- **Log execution**: Audit what scripts run and when
- **Timeout enforcement**: Prevent infinite loops

---

## Summary of Recommendations

### For Immediate Implementation

1. **Use Zod for validation**: Best developer experience and type safety
2. **Implement version-based migration**: Prepare for future config changes
3. **Follow standard override hierarchy**: CLI > Env > File > Defaults
4. **Use async repository discovery**: Better performance for large trees
5. **Provide helpful error messages**: Include suggestions and fix commands
6. **Defer file locking**: Implement only when concurrent access becomes an issue
7. **Auto-discover setup scripts**: Check standard locations before failing

### Security Checklist

- [ ] Validate all user input (paths, script contents, environment variables)
- [ ] Don't follow symlinks by default in repository discovery
- [ ] Check script executability before running
- [ ] Use proper file permissions (0o644 for configs, 0o755 for scripts)
- [ ] Implement timeouts for all long-running operations
- [ ] Sanitize error messages (don't leak sensitive paths)
- [ ] Use atomic writes for config updates

### Trade-offs Summary

| Aspect               | Simple Approach        | Advanced Approach       | Recommendation                         |
| -------------------- | ---------------------- | ----------------------- | -------------------------------------- |
| Validation           | Manual checks          | Zod/JSON Schema         | **Zod** for TypeScript                 |
| Migration            | Version detection only | Full transform pipeline | Start simple, add complexity as needed |
| Repository Discovery | Sync, single-threaded  | Async, parallel         | **Async** for better UX                |
| File Locking         | None                   | proper-lockfile         | Start without, add when needed         |
| Setup Scripts        | Manual path in config  | Auto-discovery          | **Auto-discovery** with override       |

---

## Next Steps

1. Choose validation library (recommended: Zod)
2. Design initial config schema with version field
3. Implement basic config loading with override hierarchy
4. Add repository discovery algorithm
5. Create setup script detection and execution
6. Write comprehensive tests for all validation logic
7. Document configuration format and migration process
