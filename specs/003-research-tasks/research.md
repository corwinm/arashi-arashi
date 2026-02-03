# Arashi CLI Technical Research

**Project**: Arashi - Git Worktree Management Tool  
**Created**: Tue Feb 03 2026  
**Status**: Complete  
**Version**: 1.0

## Overview

This document consolidates comprehensive technical research for building the Arashi CLI tool. It covers four critical areas:

1. **CLI Framework Patterns** - Modern JavaScript/TypeScript CLI development patterns using Commander.js, Inquirer, ora, and chalk
2. **Error Handling & Rollback Architecture** - Transaction patterns, operation logging, and error recovery for multi-repository git operations
3. **Configuration Management Patterns** - JSON validation, migration strategies, and configuration file handling
4. **Testing Strategy** - Test fixture creation, mocking approaches, and CI/CD testing for CLI tools

These research findings inform the implementation of Arashi's core features: worktree management, multi-repository operations, configuration handling, and robust error recovery.

---

## 1. CLI Framework Patterns

### 1.1 Commander.js Command Structure

**Recommended Version**: `commander` (latest stable)
- High source reputation, 193 code snippets, benchmark score 88.7

#### Basic Command Setup

```typescript
import { Command } from 'commander';

const program = new Command();

program
  .name('arashi')
  .description('CLI for managing Git worktrees')
  .version('1.0.0');

// Simple command
program
  .command('list')
  .description('List all worktrees')
  .action(() => {
    console.log('Listing worktrees...');
  });

program.parse();
```

#### Commands with Options and Arguments

```typescript
import { Command, Argument } from 'commander';

program
  .command('create')
  .description('Create a new worktree')
  .argument('<branch>', 'Branch name for the worktree')
  .argument('[path]', 'Path for the worktree (optional)')
  .option('-f, --force', 'Force creation even if worktree exists')
  .option('-b, --new-branch <name>', 'Create a new branch')
  .action((branch, path, options) => {
    console.log(`Creating worktree for branch: ${branch}`);
    if (path) console.log(`Path: ${path}`);
    if (options.force) console.log('Force mode enabled');
    if (options.newBranch) console.log(`New branch: ${options.newBranch}`);
  });
```

#### Best Practices

1. **Use descriptive names**: Command names should be clear and action-oriented (`create`, `list`, `remove`)
2. **Provide help text**: Always include `.description()` for commands and options
3. **Validate arguments**: Use custom parsers for type validation and error handling
4. **Use option defaults**: Set sensible defaults with `.option('-x, --example <value>', 'desc', defaultValue)`
5. **Follow conventions**: Use single-dash for short options (`-f`) and double-dash for long (`--force`)

#### Common Pitfalls

- Don't forget to call `program.parse()` at the end
- Avoid overly complex option names (keep them short and memorable)
- Don't use both required options and required arguments (confusing UX)
- Remember that action handlers receive arguments first, then options
- Use `process.exit(code)` explicitly in action handlers for proper exit codes

### 1.2 @inquirer/prompts Interactive Patterns

**Recommended Version**: `@inquirer/prompts` (modern modular version)
- High source reputation, 322 code snippets, benchmark score 76.4

#### Select Prompt (Single Choice)

```typescript
import { select, Separator } from '@inquirer/prompts';

const worktree = await select({
  message: 'Select a worktree to switch to',
  choices: [
    {
      name: 'main',
      value: 'main',
      description: 'Main development branch',
    },
    {
      name: 'feature/new-ui',
      value: 'feature/new-ui',
      description: 'New UI implementation',
    },
    new Separator('--- Archived ---'),
    {
      name: 'hotfix/urgent',
      value: 'hotfix/urgent',
      disabled: '(Already active)',
    },
  ],
  pageSize: 10,
  loop: true,
});
```

#### Confirm Prompt

```typescript
import { confirm } from '@inquirer/prompts';

const shouldDelete = await confirm({
  message: 'Are you sure you want to delete this worktree?',
  default: false,
});

if (shouldDelete) {
  console.log('Deleting worktree...');
} else {
  console.log('Cancelled');
  process.exit(2); // User abort
}
```

#### Input Prompt with Validation

```typescript
import { input } from '@inquirer/prompts';

const branchName = await input({
  message: 'Enter the new branch name',
  default: 'feature/new-feature',
  validate: (value: string) => {
    if (value.length < 3) {
      return 'Branch name must be at least 3 characters';
    }
    if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
      return 'Branch name contains invalid characters';
    }
    return true;
  },
});
```

#### Best Practices

1. **Provide descriptions**: Help users understand their choices
2. **Use separators**: Group related options with `new Separator()`
3. **Validate input**: Always validate user input with the `validate` function
4. **Set sensible defaults**: Use `default` to suggest common choices
5. **Disable invalid options**: Use `disabled` to show unavailable choices with reasons

### 1.3 ora Spinner Patterns

**Recommended Version**: `ora` (latest stable)
- High source reputation, 28 code snippets, benchmark score 85

#### Multi-Step Operations

```typescript
import ora from 'ora';

async function setupWorktree(branch: string) {
  const spinner = ora('Starting worktree setup').start();

  try {
    spinner.text = 'Step 1/3: Validating branch';
    await validateBranch(branch);

    spinner.text = 'Step 2/3: Creating worktree directory';
    await createDirectory();

    spinner.text = 'Step 3/3: Checking out branch';
    await checkoutBranch(branch);

    spinner.succeed('Worktree setup complete');
    return { success: true };

  } catch (error) {
    spinner.fail(`Setup failed: ${error.message}`);
    throw error;
  }
}
```

#### Best Practices

1. **Update text during operations**: Keep users informed with `spinner.text = 'new message'`
2. **Always stop the spinner**: Use `.succeed()`, `.fail()`, `.warn()`, or `.info()`
3. **Use try-catch**: Always wrap spinner operations in try-catch blocks
4. **Provide context**: Include specific details in success/failure messages

### 1.4 chalk Color Scheme

**Recommended Version**: `chalk` (latest stable, v5+ for ESM)
- High source reputation, 54 code snippets, benchmark score 86.7

#### Semantic Color Functions

```typescript
import chalk from 'chalk';

export const colors = {
  // Status colors
  success: chalk.green,
  error: chalk.bold.red,
  warning: chalk.hex('#FFA500'), // Orange
  info: chalk.blue,
  
  // UI elements
  highlight: chalk.cyan,
  dim: chalk.gray,
  muted: chalk.dim,
  
  // Code/technical
  code: chalk.bgBlack.green,
  path: chalk.cyan,
  branch: chalk.yellow,
  
  // Contextual
  primary: chalk.blue,
  secondary: chalk.magenta,
};

// Usage
console.log(colors.success('✓ Worktree created successfully'));
console.log(colors.error('✗ Failed to create worktree'));
console.log(colors.warning('⚠ Worktree already exists'));
```

#### Best Practices

1. **Define semantic colors**: Create a color palette file that all modules import
2. **Use consistent symbols**: Stick to standard icons (✓, ✗, ⚠, ℹ, ➜)
3. **Respect NO_COLOR**: Check `supportsColor` for terminal compatibility
4. **Don't overuse colors**: Too many colors reduce readability
5. **Mute decorative elements**: Use `.dim()` for borders, timestamps, etc.

### 1.5 CLI Error Handling

#### Exit Codes

```typescript
export const ExitCode = {
  Success: 0,
  Error: 1,
  UserAbort: 2,
  InvalidArgs: 3,
  NotFound: 4,
  PermissionDenied: 5,
} as const;
```

#### Error Formatting Pattern

```typescript
class CLIError extends Error {
  constructor(
    message: string,
    public exitCode: number = ExitCode.Error,
    public details?: string
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

function formatError(error: Error | CLIError): void {
  console.error();
  console.error(chalk.red.bold('Error:'), error.message);
  
  if (error instanceof CLIError && error.details) {
    console.error(chalk.dim(error.details));
  }
  
  if (process.env.DEBUG) {
    console.error();
    console.error(chalk.dim('Stack trace:'));
    console.error(chalk.dim(error.stack));
  }
  
  console.error();
}

function handleError(error: Error | CLIError): never {
  formatError(error);
  
  const exitCode = error instanceof CLIError 
    ? error.exitCode 
    : ExitCode.Error;
  
  process.exit(exitCode);
}
```

#### Best Practices

1. **Use specific exit codes**: Don't use exit code 1 for everything
2. **Format errors consistently**: Use a standard error formatting function
3. **Provide actionable messages**: Tell users how to fix the problem
4. **Show details conditionally**: Use `DEBUG` environment variable for verbose output
5. **Handle Ctrl+C gracefully**: Exit with code 2 and clean up resources
6. **Log to stderr**: Use `console.error()` for all error output

### 1.6 Configuration Loading

#### Search Paths Pattern

```typescript
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

interface Config {
  defaultPath?: string;
  excludePatterns?: string[];
  autoSync?: boolean;
  [key: string]: unknown;
}

const CONFIG_FILE_NAMES = [
  '.arashirc',
  '.arashirc.json',
  'arashi.config.json',
];

const SEARCH_PATHS = [
  process.cwd(),                           // Current directory
  join(process.cwd(), '.arashi'),          // .arashi subdirectory
  join(homedir(), '.config', 'arashi'),    // XDG config
  join(homedir(), '.arashi'),              // Home directory
  '/etc/arashi',                           // System-wide config
];

async function findConfigFile(): Promise<string | null> {
  for (const dir of SEARCH_PATHS) {
    for (const fileName of CONFIG_FILE_NAMES) {
      const configPath = join(dir, fileName);
      if (existsSync(configPath)) {
        return configPath;
      }
    }
  }
  return null;
}
```

#### Best Practices

1. **Use standard locations**: Follow XDG Base Directory specification
2. **Prioritize correctly**: CWD > User home > System-wide
3. **Provide defaults**: Always have sensible default values
4. **Allow env overrides**: Environment variables should take precedence
5. **Validate configuration**: Catch invalid config early

### 1.7 Bun Compilation

#### Cross-Platform Compilation

```bash
# Linux x64
bun build --compile --target=bun-linux-x64 ./cli.ts --outfile arashi

# macOS ARM64 (Apple Silicon)
bun build --compile --target=bun-darwin-arm64 ./cli.ts --outfile arashi

# Windows x64
bun build --compile --target=bun-windows-x64 ./cli.ts --outfile arashi.exe
```

#### Production Build

```bash
bun build \
  --compile \
  --minify \
  --sourcemap \
  --bytecode \
  --target=bun-linux-x64 \
  ./cli.ts \
  --outfile arashi
```

**Flags explained:**
- `--minify`: Reduces code size
- `--sourcemap`: Embeds compressed sourcemaps for better error messages
- `--bytecode`: Pre-compiles to bytecode for faster startup
- `--target`: Cross-compile to specific platform

#### Best Practices

1. **Use bytecode compilation**: Significantly faster startup for large apps
2. **Enable minification**: Reduces executable size
3. **Include sourcemaps**: Better debugging in production
4. **Set build-time constants**: Version numbers, build dates, feature flags
5. **Cross-compile**: Build for all target platforms from a single machine

---

## 2. Error Handling & Rollback Architecture

### 2.1 Transaction/Rollback Patterns

#### Core Pattern: Operation Log with Compensating Actions

```typescript
interface Operation {
  description: string;
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
}

class TransactionManager {
  private completedOperations: Array<() => Promise<void>> = [];
  private operationDescriptions: string[] = [];

  async executeWithRollback(
    description: string,
    operation: () => Promise<void>,
    rollback: () => Promise<void>
  ): Promise<void> {
    try {
      await operation();
      this.completedOperations.push(rollback);
      this.operationDescriptions.push(description);
    } catch (error) {
      throw error;
    }
  }

  async rollback(): Promise<void> {
    const errors: Error[] = [];
    
    // Execute rollbacks in reverse order (LIFO)
    while (this.completedOperations.length > 0) {
      const rollbackFn = this.completedOperations.pop()!;
      const description = this.operationDescriptions.pop()!;
      
      try {
        console.error(`Rolling back: ${description}`);
        await rollbackFn();
      } catch (error) {
        errors.push(new Error(
          `Failed to rollback "${description}": ${error.message}`
        ));
      }
    }

    if (errors.length > 0) {
      throw new AggregateError(
        errors,
        `Rollback completed with ${errors.length} error(s)`
      );
    }
  }

  clear(): void {
    this.completedOperations = [];
    this.operationDescriptions = [];
  }
}
```

#### Usage Example

```typescript
async function createWorktreeForRepos(repos: string[]): Promise<void> {
  const txn = new TransactionManager();

  try {
    for (const repoPath of repos) {
      const worktreePath = `${repoPath}-feature`;
      
      // Step 1: Create directory
      await txn.executeWithRollback(
        `Create directory ${worktreePath}`,
        async () => {
          await fs.mkdir(worktreePath, { recursive: true });
        },
        async () => {
          await fs.rm(worktreePath, { recursive: true, force: true });
        }
      );

      // Step 2: Create git worktree
      await txn.executeWithRollback(
        `Create worktree at ${worktreePath}`,
        async () => {
          await execGit(['worktree', 'add', worktreePath, '-b', 'feature'], {
            cwd: repoPath
          });
        },
        async () => {
          await execGit(['worktree', 'remove', '--force', worktreePath], {
            cwd: repoPath
          });
        }
      );
    }

    txn.clear();
    console.log('All worktrees created successfully');
  } catch (error) {
    console.error('Operation failed, rolling back...');
    await txn.rollback();
    throw error;
  }
}
```

#### Best Practices

1. **Always execute rollbacks in reverse order (LIFO)**: The last operation completed should be rolled back first
2. **Make rollback operations idempotent**: Rollback functions should safely handle the case where the state already matches the desired rollback state
3. **Continue rollback even if individual steps fail**: Use try-catch within the rollback loop
4. **Use descriptive operation names**: Operation descriptions help with debugging
5. **Clear the operation log on success**: Prevent accidental rollback of successful operations

### 2.2 Operation Log Structure

```typescript
interface OperationLogEntry {
  id: string;
  timestamp: Date;
  type: OperationType;
  description: string;
  state: 'pending' | 'completed' | 'failed' | 'rolled_back';
  metadata: OperationMetadata;
  error?: Error;
}

enum OperationType {
  CREATE_DIRECTORY = 'create_directory',
  CREATE_WORKTREE = 'create_worktree',
  CREATE_BRANCH = 'create_branch',
  RUN_SCRIPT = 'run_script',
  MODIFY_FILE = 'modify_file',
  GIT_COMMAND = 'git_command',
}

interface WorktreeMetadata {
  type: 'worktree';
  repoPath: string;
  worktreePath: string;
  branch: string;
  wasNewBranch: boolean;
}
```

#### Operation Log Manager

```typescript
class OperationLog {
  private entries: OperationLogEntry[] = [];
  private currentTxnId: string = crypto.randomUUID();

  add(
    type: OperationType,
    description: string,
    metadata: OperationMetadata
  ): string {
    const entry: OperationLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      description,
      state: 'pending',
      metadata,
    };

    this.entries.push(entry);
    return entry.id;
  }

  markCompleted(id: string): void {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.state = 'completed';
    }
  }

  getCompletedOperations(): OperationLogEntry[] {
    return this.entries
      .filter(e => e.state === 'completed')
      .reverse();
  }

  async persist(path: string): Promise<void> {
    const data = JSON.stringify({
      transactionId: this.currentTxnId,
      startTime: this.entries[0]?.timestamp,
      entries: this.entries,
    }, null, 2);
    
    await fs.writeFile(path, data, 'utf-8');
  }
}
```

### 2.3 Rollback Strategies by Operation Type

#### Worktree Created

```typescript
async function rollbackWorktreeCreation(
  metadata: WorktreeMetadata
): Promise<void> {
  const { repoPath, worktreePath, branch, wasNewBranch } = metadata;

  try {
    // Step 1: Remove worktree
    await execGit(['worktree', 'remove', '--force', worktreePath], {
      cwd: repoPath
    });
  } catch (error) {
    if (!error.message.includes('not a working tree')) {
      throw error;
    }
  }

  // Step 2: Delete branch if we created it
  if (wasNewBranch) {
    try {
      await execGit(['branch', '-D', branch], {
        cwd: repoPath
      });
    } catch (error) {
      if (!error.message.includes('not found')) {
        console.warn(`Could not delete branch ${branch}: ${error.message}`);
      }
    }
  }

  // Step 3: Clean up directory
  try {
    await fs.rm(worktreePath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Could not delete directory ${worktreePath}: ${error.message}`);
    }
  }
}
```

### 2.4 Timeout Handling

#### Process Group Termination

```typescript
import { spawn, ChildProcess } from 'node:child_process';

interface ProcessOptions {
  timeout?: number;
  cwd?: string;
  env?: Record<string, string>;
  killSignal?: NodeJS.Signals;
}

interface ProcessResult {
  exitCode: number;
  signal: string | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

async function runProcessWithTimeout(
  command: string,
  args: string[],
  options: ProcessOptions = {}
): Promise<ProcessResult> {
  const {
    timeout = 30000,
    cwd = process.cwd(),
    env = process.env,
    killSignal = 'SIGTERM',
  } = options;

  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let timeoutId: NodeJS.Timeout;

    const child = spawn(command, args, {
      cwd,
      env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        killProcessGroup(child, killSignal);
      }, timeout);
    }

    child.on('exit', (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);

      resolve({
        exitCode: code ?? -1,
        signal,
        stdout,
        stderr,
        timedOut,
      });
    });

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}

function killProcessGroup(
  child: ChildProcess,
  signal: NodeJS.Signals = 'SIGTERM'
): void {
  if (process.platform === 'win32') {
    try {
      spawn('taskkill', ['/pid', child.pid!.toString(), '/f', '/t'], {
        detached: true,
        stdio: 'ignore',
      });
    } catch (error) {
      console.error('Failed to kill process tree:', error);
    }
  } else {
    try {
      process.kill(-child.pid!, signal);
    } catch (error) {
      if (error.code !== 'ESRCH') {
        console.error('Failed to kill process group:', error);
      }
    }
  }
}
```

### 2.5 Signal Handling

#### Graceful Shutdown

```typescript
class GracefulShutdown {
  private shutdownHandlers: Array<() => Promise<void>> = [];
  private isShuttingDown = false;

  onShutdown(handler: () => Promise<void>): void {
    this.shutdownHandlers.push(handler);
  }

  setup(): void {
    process.on('SIGINT', this.handleSignal.bind(this, 'SIGINT'));
    process.on('SIGTERM', this.handleSignal.bind(this, 'SIGTERM'));

    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.shutdown(1);
    });
  }

  private async handleSignal(signal: 'SIGINT' | 'SIGTERM'): Promise<void> {
    if (this.isShuttingDown) {
      console.log('\nForce shutdown requested');
      process.exit(1);
    }

    console.log(`\n${signal} received, shutting down gracefully...`);
    await this.shutdown(0);
  }

  private async shutdown(exitCode: number): Promise<void> {
    this.isShuttingDown = true;

    const handlers = [...this.shutdownHandlers].reverse();

    for (const handler of handlers) {
      try {
        await Promise.race([
          handler(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Shutdown handler timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.error('Error during shutdown:', error);
      }
    }

    console.log('Shutdown complete');
    process.exit(exitCode);
  }
}
```

---

## 3. Configuration Management Patterns

### 3.1 JSON Validation with Zod

**Recommendation**: Use Zod for TypeScript CLI tools.

```typescript
import { z } from 'zod';

const ConfigSchema = z.object({
  repositories: z.array(z.string()).min(1, 'At least one repository required'),
  setupScript: z.string().optional(),
  parallel: z.boolean().default(false),
  timeout: z.number().min(0).max(300000).default(30000),
  env: z.record(z.string()).optional(),
  excludePatterns: z.array(z.string()).default([])
});

type Config = z.infer<typeof ConfigSchema>;

function validateConfig(data: unknown): Config {
  try {
    return ConfigSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      throw new Error(`Configuration validation failed:\n${messages}`);
    }
    throw error;
  }
}
```

#### Benefits of Zod

1. **Type Safety**: Single source of truth prevents drift between types and validation
2. **Developer Experience**: Excellent autocomplete and refactoring support
3. **User Experience**: Clear, actionable error messages
4. **Maintainability**: Easy to evolve schemas as requirements change

### 3.2 Configuration Migration

#### Versioned Schemas

```typescript
// Version 1.0 schema
const ConfigV1Schema = z.object({
  version: z.literal('1.0.0'),
  repositories: z.array(z.string())
});

// Version 2.0 schema
const ConfigV2Schema = z.object({
  version: z.literal('2.0.0'),
  repositories: z.array(z.object({
    path: z.string(),
    enabled: z.boolean().default(true)
  })),
  parallel: z.boolean().default(false)
});

type ConfigV1 = z.infer<typeof ConfigV1Schema>;
type ConfigV2 = z.infer<typeof ConfigV2Schema>;

function migrateV1toV2(config: ConfigV1): ConfigV2 {
  return {
    version: '2.0.0',
    repositories: config.repositories.map(path => ({
      path,
      enabled: true
    })),
    parallel: false
  };
}
```

#### Automatic Migration with Backup

```typescript
function loadAndMigrateConfig(
  configPath: string,
  options: {
    autoMigrate: boolean;
    createBackup: boolean;
    dryRun: boolean;
  } = {
    autoMigrate: true,
    createBackup: true,
    dryRun: false
  }
): ConfigV2 {
  const raw = readFileSync(configPath, 'utf-8');
  const data = JSON.parse(raw);
  
  const version = detectVersion(data);
  const CURRENT_VERSION = '2.0.0';
  
  if (version === CURRENT_VERSION) {
    return ConfigV2Schema.parse(data);
  }
  
  console.log(`Found config version ${version}, current version is ${CURRENT_VERSION}`);
  
  if (!options.autoMigrate) {
    throw new Error(
      `Config version ${version} is outdated. ` +
      `Please migrate to ${CURRENT_VERSION} or run with --migrate flag`
    );
  }
  
  const migrated = migrateConfig(data);
  
  if (options.dryRun) {
    console.log('Dry run - migration would produce:');
    console.log(JSON.stringify(migrated, null, 2));
    return migrated;
  }
  
  if (options.createBackup) {
    const backupPath = `${configPath}.backup-v${version}`;
    copyFileSync(configPath, backupPath);
    console.log(`Created backup: ${backupPath}`);
  }
  
  writeFileSync(
    configPath,
    JSON.stringify(migrated, null, 2) + '\n',
    'utf-8'
  );
  
  console.log(`Successfully migrated config from v${version} to v${CURRENT_VERSION}`);
  
  return migrated;
}
```

### 3.3 Defaults and Override Hierarchy

**Override order**: CLI flags > Environment variables > Config file > Defaults

```typescript
function resolveConfig(cliFlags: CLIFlags): Config {
  const defaults = loadDefaults();
  const fileConfig = loadConfigFile(cliFlags.config);
  const envConfig = loadEnvVars();
  const flagConfig = parseCLIFlags(cliFlags);
  
  return mergeConfigs(defaults, fileConfig, envConfig, flagConfig);
}

function loadEnvVars(): Partial<Config> {
  const env: Partial<Config> = {};
  
  if (process.env.ARASHI_PARALLEL) {
    env.parallel = process.env.ARASHI_PARALLEL === 'true';
  }
  
  if (process.env.ARASHI_TIMEOUT) {
    env.timeout = parseInt(process.env.ARASHI_TIMEOUT, 10);
  }
  
  return env;
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
```

### 3.4 Repository Discovery Algorithm

```typescript
import { readdirSync, lstatSync } from 'fs';
import { join, resolve } from 'path';

interface RepositoryInfo {
  path: string;
  isWorktree: boolean;
  gitDirPath: string;
}

function isGitRepository(dirPath: string): { 
  isRepo: boolean; 
  isWorktree: boolean; 
  gitDir?: string 
} {
  try {
    const gitPath = join(dirPath, '.git');
    const stats = lstatSync(gitPath);
    
    if (stats.isDirectory()) {
      return { isRepo: true, isWorktree: false, gitDir: gitPath };
    }
    
    if (stats.isFile()) {
      const content = readFileSync(gitPath, 'utf-8').trim();
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
  } = {}
): RepositoryInfo[] {
  const {
    maxDepth = Infinity,
    excludePatterns = ['node_modules', '.git'],
    followSymlinks = false
  } = options;
  
  const repos: RepositoryInfo[] = [];
  
  function traverse(dirPath: string, depth: number) {
    if (depth > maxDepth) {
      return;
    }
    
    const repoCheck = isGitRepository(dirPath);
    if (repoCheck.isRepo) {
      repos.push({
        path: dirPath,
        isWorktree: repoCheck.isWorktree,
        gitDirPath: repoCheck.gitDir!
      });
      return;
    }
    
    let entries: string[];
    try {
      entries = readdirSync(dirPath);
    } catch (error) {
      return;
    }
    
    for (const entry of entries) {
      if (excludePatterns.some(pattern => entry.includes(pattern))) {
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

#### Best Practices

1. **Stop at first .git**: Don't traverse inside repositories
2. **Respect exclusions**: Honor `.gitignore` and common patterns
3. **Handle symlinks carefully**: Avoid infinite loops
4. **Limit depth**: Prevent excessive recursion
5. **Report progress**: For large trees, show progress
6. **Handle permissions**: Gracefully skip inaccessible directories

---

## 4. Testing Strategy

### 4.1 Test Fixture Creation

#### Using Bun's tempDir

```typescript
import { test, expect } from "bun:test";
import { tempDir } from "harness";
import { $ } from "bun";

test("creates initialized git repository", async () => {
  using dir = tempDir("arashi-git-test", {
    "README.md": "# Test Repo",
    ".gitignore": "node_modules/",
  });

  const dirPath = String(dir);

  await $`git init`.cwd(dirPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(dirPath).quiet();
  await $`git config user.name "Test User"`.cwd(dirPath).quiet();
  await $`git add .`.cwd(dirPath).quiet();
  await $`git commit -m "Initial commit"`.cwd(dirPath).quiet();

  const result = await $`git rev-parse --git-dir`.cwd(dirPath).text();
  expect(result.trim()).toBe(".git");
});
```

#### Best Practices

1. **Use `using` keyword**: Ensures automatic cleanup via disposable resources
2. **Prefix test directories**: Use descriptive prefixes like `"arashi-test-"`
3. **Set git identity**: Always configure `user.email` and `user.name`
4. **Create minimal fixtures**: Only create files needed for the test
5. **Reusable fixture factories**: Create helper functions for common setups

### 4.2 Mocking Strategy

**Recommendation**: Use real git commands in isolated temporary repositories rather than mocking.

#### Rationale

**Pros of Real Git:**
- Tests actual git behavior, not mocked approximations
- Catches real-world edge cases and git version differences
- No need to maintain complex mock implementations
- More confidence in production behavior

**When to Mock:**
- External network calls (GitHub API, remote git operations)
- User input prompts (interactive selections)
- Long-running operations in unit tests
- System-level operations that modify global state

#### Integration Test Pattern (No Mocking)

```typescript
test("creates worktree using real git", async () => {
  using dir = tempDir("arashi-worktree-test", {
    "README.md": "# Test",
  });

  const repoPath = String(dir);

  await $`git init`.cwd(repoPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(repoPath).quiet();
  await $`git config user.name "Test User"`.cwd(repoPath).quiet();
  await $`git add .`.cwd(repoPath).quiet();
  await $`git commit -m "Initial commit"`.cwd(repoPath).quiet();

  const worktreePath = `${repoPath}-feature`;
  await $`git worktree add ${worktreePath} -b feature-branch`.cwd(repoPath).quiet();

  const worktrees = await $`git worktree list`.cwd(repoPath).text();
  expect(worktrees).toContain(worktreePath);
  expect(worktrees).toContain("feature-branch");
});
```

### 4.3 Test Cleanup

#### Automatic Cleanup with `using`

```typescript
test("automatically cleans up temp directory", () => {
  using dir = tempDir("auto-cleanup-test", {
    "file.txt": "content",
  });

  const dirPath = String(dir);
  expect(await Bun.file(`${dirPath}/file.txt`).exists()).toBe(true);

  // After test completes, directory is automatically deleted
});
```

#### Manual Cleanup with afterEach

```typescript
import { afterEach, mock } from "bun:test";

afterEach(() => {
  mock.restore();
  mock.clearAllMocks();
});
```

### 4.4 Parallel Test Execution

#### Explicit Parallel Tests

```typescript
test.concurrent("parallel test 1", async () => {
  using dir1 = tempDir("parallel-test-1", {
    "README.md": "# Test 1",
  });

  await $`git init`.cwd(String(dir1)).quiet();
  // Test operations...
});

test.concurrent("parallel test 2", async () => {
  using dir2 = tempDir("parallel-test-2", {
    "README.md": "# Test 2",
  });

  await $`git init`.cwd(String(dir2)).quiet();
  // Test operations...
});
```

#### Key Principles

1. Each test must have its own isolated temporary directory
2. Avoid shared state between tests
3. Use `test.concurrent` for independent tests
4. Use `test.serial` when tests must run sequentially

### 4.5 Snapshot Testing

#### Stripping ANSI Colors

```typescript
import { Bun } from "bun";

test("snapshot CLI output without colors", async () => {
  const coloredOutput = "\u001b[32m✓\u001b[0m Successfully created worktree";
  const plainOutput = Bun.stripANSI(coloredOutput);

  expect(plainOutput).toMatchSnapshot();
});
```

#### Testing CLI Commands

```typescript
test("arashi init command output", async () => {
  using dir = tempDir("arashi-init-test", {});

  await using proc = Bun.spawn({
    cmd: [bunExe(), "src/index.ts", "init"],
    env: bunEnv,
    cwd: String(dir),
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    proc.stdout.text(),
    proc.stderr.text(),
    proc.exited,
  ]);

  const plainStdout = Bun.stripANSI(stdout);
  expect(plainStdout).toMatchSnapshot();
  expect(exitCode).toBe(0);
});
```

### 4.6 CI/CD Testing

#### GitHub Actions Matrix

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Setup Git
        run: |
          git config --global user.email "ci@example.com"
          git config --global user.name "CI Bot"
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test --concurrent
```

### 4.7 Performance Testing

#### Measuring Execution Time

```typescript
test("measures operation time", async () => {
  const startTime = Bun.nanoseconds();

  await someOperation();

  const endTime = Bun.nanoseconds();
  const durationMs = (endTime - startTime) / 1_000_000;

  console.log(`Operation took ${durationMs.toFixed(2)}ms`);
  expect(durationMs).toBeLessThan(1000);
});
```

#### Benchmark Pattern

```typescript
async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 5
): Promise<void> {
  const times: number[] = [];

  // Warm-up run
  await fn();

  // Benchmark runs
  for (let i = 0; i < iterations; i++) {
    const start = Bun.nanoseconds();
    await fn();
    const end = Bun.nanoseconds();
    times.push((end - start) / 1_000_000);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

  console.log(`${name}:`);
  console.log(`  Average: ${avg.toFixed(2)}ms`);
  console.log(`  Median:  ${median.toFixed(2)}ms`);
}
```

---

## 5. Integration Points

### 5.1 CLI → Configuration

Commander.js commands load and validate configuration using Zod schemas:

```typescript
program
  .command('create')
  .option('-c, --config <path>', 'Config file path')
  .action(async (options) => {
    const config = await resolveConfig({ config: options.config });
    
    // Validate configuration
    const validated = ConfigSchema.parse(config);
    
    // Use validated config
    await createWorktrees(validated.repositories);
  });
```

### 5.2 Configuration → Repository Discovery

Configuration drives repository discovery with validation and defaults:

```typescript
const config = await resolveConfig(cliFlags);

const repos = discoverRepositories(config.reposDir, {
  maxDepth: config.maxDepth,
  excludePatterns: config.excludePatterns,
});

// Validate discovered repos
for (const repo of repos) {
  validateRepository(repo.path);
}
```

### 5.3 Error Handling → CLI Output

Transaction errors are formatted for CLI display:

```typescript
try {
  const txn = new TransactionManager();
  await performOperations(txn);
  txn.clear();
} catch (error) {
  console.error(colors.error('✗ Operation failed'));
  
  if (error instanceof AggregateError) {
    console.error(colors.dim('\nRollback errors:'));
    error.errors.forEach(e => console.error(colors.dim(`  - ${e.message}`)));
  }
  
  await txn.rollback();
  process.exit(ExitCode.Error);
}
```

### 5.4 Testing → All Components

Tests validate integration of all components:

```typescript
test("full workflow: init, create, remove", async () => {
  using dir = tempDir("full-workflow", {});
  
  // Initialize repository
  await $`git init`.cwd(String(dir)).quiet();
  
  // Run CLI commands
  await $`bun src/index.ts init`.cwd(String(dir)).quiet();
  await $`bun src/index.ts create feature-test`.cwd(String(dir)).quiet();
  
  // Verify worktrees
  const worktrees = await $`git worktree list`.cwd(String(dir)).text();
  expect(worktrees).toContain("feature-test");
  
  // Clean up
  await $`bun src/index.ts remove feature-test`.cwd(String(dir)).quiet();
});
```

---

## 6. References

### Documentation
- **Git Worktree**: https://git-scm.com/docs/git-worktree
- **Commander.js**: https://github.com/tj/commander.js
- **Inquirer.js**: https://github.com/SBoudrias/Inquirer.js
- **Zod**: https://zod.dev
- **Bun Test Runner**: https://bun.sh/docs/cli/test

### Best Practices
- **CLI Guidelines**: https://clig.dev
- **Error Handling**: Transaction patterns and ACID principles
- **Configuration**: XDG Base Directory specification
- **Testing**: Test Driven Development (TDD) principles

---

**Document Version**: 1.0  
**Last Updated**: Tue Feb 03 2026  
**Status**: Complete
