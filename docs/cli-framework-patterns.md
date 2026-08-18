# CLI Framework Patterns for Arashi

This document provides comprehensive patterns and best practices for building the Arashi CLI tool using modern JavaScript/TypeScript CLI frameworks.

---

## Table of Contents

1. [Commander.js Patterns](#1-commanderjs-patterns)
2. [@inquirer/prompts Patterns](#2-inquirerprompts-patterns)
3. [ora Spinner Patterns](#3-ora-spinner-patterns)
4. [chalk Color Scheme](#4-chalk-color-scheme)
5. [CLI Error Handling](#5-cli-error-handling)
6. [Configuration Loading](#6-configuration-loading)
7. [Bun Compilation](#7-bun-compilation)

---

## 1. Commander.js Patterns

### Recommended Version

- **Package**: `commander` (latest stable)
- **High source reputation**, 193 code snippets, benchmark score 88.7

### Command Structure with Subcommands

Commander.js provides a robust API for structuring CLI commands with subcommands, options, and arguments.

#### Basic Command Setup

```typescript
import { Command } from "commander";

const program = new Command();

program
  .name("arashi")
  .description("CLI for managing Git worktrees")
  .version("1.0.0");

// Simple command
program
  .command("list")
  .description("List all worktrees")
  .action(() => {
    console.log("Listing worktrees...");
  });

program.parse();
```

#### Commands with Options and Arguments

```typescript
import { Command, Argument } from "commander";

program
  .command("create")
  .description("Create a new worktree")
  .argument("<branch>", "Branch name for the worktree")
  .argument("[path]", "Path for the worktree (optional)")
  .option("-f, --force", "Force creation even if worktree exists")
  .option("-b, --new-branch <name>", "Create a new branch")
  .action((branch, path, options) => {
    console.log(`Creating worktree for branch: ${branch}`);
    if (path) console.log(`Path: ${path}`);
    if (options.force) console.log("Force mode enabled");
    if (options.newBranch) console.log(`New branch: ${options.newBranch}`);
  });
```

#### Custom Option Parsing

```typescript
function parseInteger(value: string) {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new commander.InvalidArgumentError("Not a number.");
  }
  return parsed;
}

function collect(value: string, previous: string[]) {
  return previous.concat([value]);
}

program
  .command("config")
  .option("-t, --timeout <seconds>", "Timeout in seconds", parseInteger)
  .option("-e, --exclude <pattern>", "Exclude patterns", collect, [])
  .action((options) => {
    if (options.timeout) console.log(`Timeout: ${options.timeout}s`);
    if (options.exclude.length > 0)
      console.log(`Excludes: ${options.exclude.join(", ")}`);
  });
```

#### Accessing Command Context

```typescript
program
  .command("remove")
  .argument("<name>", "Worktree name to remove")
  .option("-d, --debug", "Enable debug mode")
  .action((name, options, command) => {
    if (options.debug) {
      console.error(`Called ${command.name()} with options`, options);
    }
    console.log(`Removing worktree: ${name}`);
  });
```

### Best Practices

1. **Use descriptive names**: Command names should be clear and action-oriented (`create`, `list`, `remove`)
2. **Provide help text**: Always include `.description()` for commands and options
3. **Validate arguments**: Use custom parsers for type validation and error handling
4. **Use option defaults**: Set sensible defaults with `.option('-x, --example <value>', 'desc', defaultValue)`
5. **Follow conventions**: Use single-dash for short options (`-f`) and double-dash for long (`--force`)
6. **Group related options**: Use `.option()` chaining for related configuration

### Common Pitfalls to Avoid

- Don't forget to call `program.parse()` at the end
- Avoid overly complex option names (keep them short and memorable)
- Don't use both required options and required arguments (confusing UX)
- Remember that action handlers receive arguments first, then options
- Use `process.exit(code)` explicitly in action handlers for proper exit codes

---

## 2. @inquirer/prompts Patterns

### Recommended Version

- **Package**: `@inquirer/prompts` (modern modular version)
- **High source reputation**, 322 code snippets, benchmark score 76.4

The modern `@inquirer/prompts` package provides individual prompt types that can be imported separately.

### Select Prompt (Single Choice)

```typescript
import { select, Separator } from "@inquirer/prompts";

const worktree = await select({
  message: "Select a worktree to switch to",
  choices: [
    {
      name: "main",
      value: "main",
      description: "Main development branch",
    },
    {
      name: "feature/new-ui",
      value: "feature/new-ui",
      description: "New UI implementation",
    },
    new Separator("--- Archived ---"),
    {
      name: "hotfix/urgent",
      value: "hotfix/urgent",
      disabled: "(Already active)",
    },
  ],
  pageSize: 10,
  loop: true, // Wrap around at edges
});

console.log(`Switched to: ${worktree}`);
```

### Checkbox Prompt (Multi-Select)

```typescript
import { checkbox, Separator } from "@inquirer/prompts";

const selected = await checkbox({
  message: "Select worktrees to remove",
  choices: [
    { name: "feature/old-feature", value: "feature/old-feature" },
    { name: "bugfix/fixed-bug", value: "bugfix/fixed-bug" },
    new Separator(),
    {
      name: "main",
      value: "main",
      disabled: "(Cannot remove main worktree)",
    },
  ],
});

console.log(`Removing: ${selected.join(", ")}`);
```

### Confirm Prompt

```typescript
import { confirm } from "@inquirer/prompts";

const shouldDelete = await confirm({
  message: "Are you sure you want to delete this worktree?",
  default: false,
});

if (shouldDelete) {
  console.log("Deleting worktree...");
} else {
  console.log("Cancelled");
  process.exit(2); // User abort
}
```

### Input Prompt

```typescript
import { input } from "@inquirer/prompts";

const branchName = await input({
  message: "Enter the new branch name",
  default: "feature/new-feature",
  validate: (value: string) => {
    if (value.length < 3) {
      return "Branch name must be at least 3 characters";
    }
    if (!/^[a-zA-Z0-9/_-]+$/.test(value)) {
      return "Branch name contains invalid characters";
    }
    return true;
  },
});

console.log(`Creating branch: ${branchName}`);
```

### Password Prompt

```typescript
import { password } from "@inquirer/prompts";

const apiKey = await password({
  message: "Enter your API key",
  mask: "*",
});
```

### Best Practices

1. **Provide descriptions**: Help users understand their choices
2. **Use separators**: Group related options with `new Separator()`
3. **Validate input**: Always validate user input with the `validate` function
4. **Set sensible defaults**: Use `default` to suggest common choices
5. **Disable invalid options**: Use `disabled` to show unavailable choices with reasons
6. **Enable pagination**: Use `pageSize` for long lists (default is 7)
7. **Enable looping**: Set `loop: true` for better UX with long lists

### Common Pitfalls to Avoid

- Don't use synchronous prompts (always `await`)
- Remember that checkbox returns an array, even with one selection
- Validate function must return `true` or an error string
- Disabled choices should include a reason in parentheses
- Don't forget to handle user cancellation (Ctrl+C throws an error)

---

## 3. ora Spinner Patterns

### Recommended Version

- **Package**: `ora` (latest stable)
- **High source reputation**, 28 code snippets, benchmark score 85

ora provides elegant terminal spinners for long-running operations.

### Basic Spinner Usage

```typescript
import ora from "ora";

const spinner = ora("Loading worktrees").start();

// Simulate async work
setTimeout(() => {
  spinner.text = "Fetching remote branches";
}, 1000);

setTimeout(() => {
  spinner.succeed("Worktrees loaded successfully");
}, 2000);
```

### Success/Failure States

```typescript
import ora from "ora";

async function createWorktree(branch: string) {
  const spinner = ora(`Creating worktree for ${branch}`).start();

  try {
    // Simulate worktree creation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    spinner.succeed(`Worktree created: ${branch}`);
    // Output: ✔ Worktree created: feature/new-ui
  } catch (error) {
    spinner.fail(`Failed to create worktree: ${error.message}`);
    // Output: ✖ Failed to create worktree: ...
    throw error;
  }
}
```

### Multi-Step Operations

```typescript
import ora from "ora";

async function setupWorktree(branch: string) {
  const spinner = ora("Starting worktree setup").start();

  try {
    spinner.text = "Step 1/3: Validating branch";
    await validateBranch(branch);

    spinner.text = "Step 2/3: Creating worktree directory";
    await createDirectory();

    spinner.text = "Step 3/3: Checking out branch";
    await checkoutBranch(branch);

    spinner.succeed("Worktree setup complete");
    return { success: true };
  } catch (error) {
    spinner.fail(`Setup failed: ${error.message}`);
    throw error;
  }
}
```

### Warning and Info States

```typescript
import ora from "ora";

const spinner1 = ora("Checking for updates").start();
setTimeout(() => {
  spinner1.warn("No updates available");
  // Output: ⚠ No updates available
}, 1000);

const spinner2 = ora("Scanning files").start();
setTimeout(() => {
  spinner2.info("Found 42 files");
  // Output: ℹ Found 42 files
}, 1000);
```

### Promise Integration (oraPromise)

```typescript
import { oraPromise } from "ora";

const fetchData = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ count: 100 }), 2000);
  });

await oraPromise(fetchData(), {
  text: "Fetching worktree data",
  successText: "Data fetched successfully",
  failText: "Failed to fetch data",
});

// With dynamic success text based on result
await oraPromise(fetchData(), {
  text: "Loading worktrees",
  successText: (result) => `Loaded ${result.count} worktrees`,
  failText: (error) => `Error: ${error.message}`,
});
```

### Best Practices

1. **Update text during operations**: Keep users informed with `spinner.text = 'new message'`
2. **Always stop the spinner**: Use `.succeed()`, `.fail()`, `.warn()`, or `.info()`
3. **Use try-catch**: Always wrap spinner operations in try-catch blocks
4. **Provide context**: Include specific details in success/failure messages
5. **Use appropriate states**: Match the state to the outcome (succeed/fail/warn/info)
6. **Keep text concise**: Spinner text should be short and action-oriented

### Common Pitfalls to Avoid

- Don't forget to stop the spinner (it will keep running)
- Don't use console.log while spinner is active (causes visual glitches)
- Remember that fail/succeed/warn/info automatically stops the spinner
- Don't create multiple spinners running simultaneously
- Use oraPromise for simple promise-based operations (cleaner code)

---

## 4. chalk Color Scheme

### Recommended Version

- **Package**: `chalk` (latest stable, v5+ for ESM)
- **High source reputation**, 54 code snippets, benchmark score 86.7

### Recommended Color Scheme for CLI Output

Create a consistent color palette for your CLI application:

```typescript
import chalk from "chalk";

// Define semantic color functions
export const colors = {
  // Status colors
  success: chalk.green,
  error: chalk.bold.red,
  warning: chalk.hex("#FFA500"), // Orange
  info: chalk.blue,

  // UI elements
  highlight: chalk.cyan,
  dim: chalk.gray,
  muted: chalk.dim,

  // Special emphasis
  bold: chalk.bold,
  underline: chalk.underline,

  // Code/technical
  code: chalk.bgBlack.green,
  path: chalk.cyan,
  branch: chalk.yellow,

  // Contextual
  primary: chalk.blue,
  secondary: chalk.magenta,
};

// Usage
console.log(colors.success("✓ Worktree created successfully"));
console.log(colors.error("✗ Failed to create worktree"));
console.log(colors.warning("⚠ Worktree already exists"));
console.log(colors.info("ℹ Fetching remote branches..."));
console.log(colors.path("/Users/dev/projects/worktree"));
console.log(colors.branch("feature/new-ui"));
```

### Log Level Styling

```typescript
import chalk from "chalk";

const logLevels = {
  fatal: chalk.bgRed.white.bold,
  error: chalk.red.bold,
  warn: chalk.yellow,
  info: chalk.blue,
  debug: chalk.gray,
  trace: chalk.dim,
};

function log(level: keyof typeof logLevels, message: string) {
  const timestamp = new Date().toISOString();
  const styledLevel = logLevels[level](`[${level.toUpperCase()}]`);
  console.log(`${chalk.dim(timestamp)} ${styledLevel} ${message}`);
}

// Usage
log("info", "Application started");
log("warn", "Memory usage high");
log("error", "Connection failed");
```

### Decorative Elements

```typescript
import chalk from "chalk";

function formatHeader(title: string) {
  const border = chalk.cyan("═".repeat(title.length + 4));
  return `${border}\n  ${chalk.bold.cyan(title)}\n${border}`;
}

console.log(formatHeader("Arashi CLI"));

// Section dividers
console.log(chalk.dim("─".repeat(50)));

// Lists
console.log(chalk.green("✓"), "Task completed");
console.log(chalk.red("✗"), "Task failed");
console.log(chalk.blue("➜"), "Running task");
```

### Conditional Styling (Terminal Support)

```typescript
import chalk, { supportsColor, supportsColorStderr } from "chalk";

function logWithColor(message: string) {
  if (supportsColor && supportsColor.has256) {
    console.log(chalk.ansi256(201)(message)); // 256-color mode
  } else if (supportsColor) {
    console.log(chalk.magenta(message)); // Basic color mode
  } else {
    console.log(message); // No color support
  }
}

// Check color support
if (supportsColor) {
  console.log("Color level:", supportsColor.level);
  console.log("Has 256 colors:", supportsColor.has256);
  console.log("Has 16m colors:", supportsColor.has16m);
}
```

### Best Practices

1. **Define semantic colors**: Create a color palette file that all modules import
2. **Use consistent symbols**: Stick to standard icons (✓, ✗, ⚠, ℹ, ➜)
3. **Respect NO_COLOR**: Check `supportsColor` for terminal compatibility
4. **Don't overuse colors**: Too many colors reduce readability
5. **Test without colors**: Ensure your CLI works when `NO_COLOR=1` is set
6. **Use bold for emphasis**: Reserve bold for important status messages
7. **Mute decorative elements**: Use `.dim()` for borders, timestamps, etc.

### Environment Variables

- `FORCE_COLOR=0` - Disable colors
- `FORCE_COLOR=1` - Force basic colors (level 1)
- `FORCE_COLOR=2` - Force 256 colors (level 2)
- `FORCE_COLOR=3` - Force truecolor (level 3)
- `NO_COLOR` - Disable colors (any value)

### Common Pitfalls to Avoid

- Don't nest too many styles (performance impact)
- Remember that `chalk` doesn't work in non-terminal environments by default
- Use `chalkStderr` for error output to respect stderr color settings
- Don't hardcode ANSI codes directly (use chalk for cross-platform support)
- Test on both light and dark terminal themes

---

## 5. CLI Error Handling

### Exit Codes

Standard exit codes for CLI applications:

```typescript
export const ExitCode = {
  Success: 0, // Command completed successfully
  Error: 1, // General error
  UserAbort: 2, // User cancelled operation (Ctrl+C)
  InvalidArgs: 3, // Invalid command-line arguments
  NotFound: 4, // Resource not found
  PermissionDenied: 5, // Permission issues
} as const;
```

### Error Formatting Pattern

```typescript
import chalk from "chalk";
import { ExitCode } from "./exit-codes";

class CLIError extends Error {
  constructor(
    message: string,
    public exitCode: number = ExitCode.Error,
    public details?: string,
  ) {
    super(message);
    this.name = "CLIError";
  }
}

function formatError(error: Error | CLIError): void {
  console.error();
  console.error(chalk.red.bold("Error:"), error.message);

  if (error instanceof CLIError && error.details) {
    console.error(chalk.dim(error.details));
  }

  if (process.env.DEBUG) {
    console.error();
    console.error(chalk.dim("Stack trace:"));
    console.error(chalk.dim(error.stack));
  }

  console.error();
}

function handleError(error: Error | CLIError): never {
  formatError(error);

  const exitCode = error instanceof CLIError ? error.exitCode : ExitCode.Error;

  process.exit(exitCode);
}

// Usage
try {
  // Your CLI logic
  throw new CLIError(
    "Worktree not found",
    ExitCode.NotFound,
    'Run "aw list" to see available worktrees',
  );
} catch (error) {
  handleError(error as Error);
}
```

### User Abort Handling

```typescript
import { confirm } from "@inquirer/prompts";
import { ExitCode } from "./exit-codes";

async function promptWithAbort<T>(promptFn: () => Promise<T>): Promise<T> {
  try {
    return await promptFn();
  } catch (error) {
    if (error.name === "ExitPromptError") {
      // User pressed Ctrl+C
      console.log(); // Add newline after ^C
      process.exit(ExitCode.UserAbort);
    }
    throw error;
  }
}

// Usage
const shouldDelete = await promptWithAbort(() =>
  confirm({ message: "Delete worktree?" }),
);
```

### Validation Errors

```typescript
import chalk from "chalk";

function validateBranchName(name: string): void {
  const errors: string[] = [];

  if (name.length < 3) {
    errors.push("Branch name must be at least 3 characters");
  }

  if (!/^[a-zA-Z0-9/_-]+$/.test(name)) {
    errors.push("Branch name contains invalid characters");
  }

  if (name.startsWith("/") || name.endsWith("/")) {
    errors.push('Branch name cannot start or end with "/"');
  }

  if (errors.length > 0) {
    throw new CLIError(
      "Invalid branch name",
      ExitCode.InvalidArgs,
      errors.map((e) => `  ${chalk.red("•")} ${e}`).join("\n"),
    );
  }
}

// Usage
try {
  validateBranchName(branchName);
} catch (error) {
  handleError(error as CLIError);
}
```

### Best Practices

1. **Use specific exit codes**: Don't use exit code 1 for everything
2. **Format errors consistently**: Use a standard error formatting function
3. **Provide actionable messages**: Tell users how to fix the problem
4. **Show details conditionally**: Use `DEBUG` environment variable for verbose output
5. **Handle Ctrl+C gracefully**: Exit with code 2 and clean up resources
6. **Log to stderr**: Use `console.error()` for all error output
7. **Add context**: Include relevant details (file paths, command used, etc.)

### Common Pitfalls to Avoid

- Don't exit with code 0 on errors
- Don't print stack traces by default (use DEBUG flag)
- Remember to clean up resources before exiting (files, processes, etc.)
- Don't swallow errors silently
- Always exit after printing errors (don't continue execution)
- Handle both synchronous and asynchronous errors

---

## 6. Configuration Loading

### Search Paths Pattern

Standard pattern for loading configuration files:

```typescript
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

interface Config {
  defaultPath?: string;
  excludePatterns?: string[];
  autoSync?: boolean;
  [key: string]: unknown;
}

const CONFIG_FILE_NAMES = [".arashirc", ".arashirc.json", "arashi.config.json"];

const SEARCH_PATHS = [
  process.cwd(), // Current directory
  join(process.cwd(), ".arashi"), // .arashi subdirectory
  join(homedir(), ".config", "arashi"), // XDG config
  join(homedir(), ".arashi"), // Home directory
  "/etc/arashi", // System-wide config
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

async function loadConfig(): Promise<Config> {
  const configPath = await findConfigFile();

  if (!configPath) {
    return {}; // Return default config
  }

  try {
    const content = await readFile(configPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Failed to parse config file at ${configPath}: ${error.message}`,
    );
  }
}

// Usage
const config = await loadConfig();
```

### Merging with Defaults

```typescript
const DEFAULT_CONFIG: Config = {
  defaultPath: "~/worktrees",
  excludePatterns: ["node_modules", ".git"],
  autoSync: true,
  maxWorktrees: 10,
};

async function getConfig(): Promise<Config> {
  const userConfig = await loadConfig();
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
  };
}

// Usage
const config = await getConfig();
console.log("Default path:", config.defaultPath);
```

### Environment Variable Overrides

```typescript
function applyEnvOverrides(config: Config): Config {
  return {
    ...config,
    defaultPath: process.env.ARASHI_DEFAULT_PATH || config.defaultPath,
    autoSync:
      process.env.ARASHI_AUTO_SYNC === "true"
        ? true
        : process.env.ARASHI_AUTO_SYNC === "false"
          ? false
          : config.autoSync,
  };
}

async function getConfig(): Promise<Config> {
  const userConfig = await loadConfig();
  const merged = { ...DEFAULT_CONFIG, ...userConfig };
  return applyEnvOverrides(merged);
}
```

### Config Validation

```typescript
import chalk from "chalk";

function validateConfig(config: Config): void {
  const errors: string[] = [];

  if (config.maxWorktrees && config.maxWorktrees < 1) {
    errors.push("maxWorktrees must be at least 1");
  }

  if (
    config.defaultPath &&
    !config.defaultPath.startsWith("/") &&
    !config.defaultPath.startsWith("~")
  ) {
    errors.push("defaultPath must be an absolute path or start with ~");
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid configuration:\n${errors.map((e) => `  ${chalk.red("•")} ${e}`).join("\n")}`,
    );
  }
}

async function getConfig(): Promise<Config> {
  const config = await loadConfig();
  validateConfig(config);
  return config;
}
```

### Best Practices

1. **Use standard locations**: Follow XDG Base Directory specification
2. **Prioritize correctly**: CWD > User home > System-wide
3. **Provide defaults**: Always have sensible default values
4. **Allow env overrides**: Environment variables should take precedence
5. **Validate configuration**: Catch invalid config early
6. **Document config options**: Provide a sample config file
7. **Use JSON/TOML**: Prefer human-readable formats

### Common Pitfalls to Avoid

- Don't fail if config file is missing (use defaults)
- Don't search too many locations (slows down startup)
- Remember to expand `~` in file paths
- Don't merge arrays (replace them instead)
- Handle JSON parse errors gracefully
- Don't log sensitive config values (API keys, tokens)

---

## 7. Bun Compilation

### Basic Compilation

Bun's `--compile` flag creates standalone executables from TypeScript/JavaScript files:

```bash
# Compile for current platform
bun build ./cli.ts --compile --outfile arashi

# The output is a single executable
./arashi
```

### Cross-Platform Compilation

Compile for different platforms:

```bash
# Linux x64
bun build --compile --target=bun-linux-x64 ./cli.ts --outfile arashi

# Linux ARM64 (Raspberry Pi, Graviton)
bun build --compile --target=bun-linux-arm64 ./cli.ts --outfile arashi

# Windows x64
bun build --compile --target=bun-windows-x64 ./cli.ts --outfile arashi.exe

# macOS ARM64 (Apple Silicon)
bun build --compile --target=bun-darwin-arm64 ./cli.ts --outfile arashi

# macOS x64 (Intel)
bun build --compile --target=bun-darwin-x64 ./cli.ts --outfile arashi
```

### Production Build Configuration

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

- `--minify`: Reduces code size (saves megabytes for large apps)
- `--sourcemap`: Embeds compressed sourcemaps for better error messages
- `--bytecode`: Pre-compiles to bytecode for faster startup (2x faster for large apps)
- `--target`: Cross-compile to specific platform

### Build Script (TypeScript)

```typescript
// build.ts
await Bun.build({
  entrypoints: ["./src/cli.ts"],
  compile: {
    target: "bun-linux-x64",
    outfile: "./dist/arashi",
  },
  minify: true,
  sourcemap: "linked",
  bytecode: true,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.VERSION": JSON.stringify("1.0.0"),
  },
});
```

### Build-Time Constants

```bash
bun build \
  --compile \
  --define BUILD_VERSION='"1.0.0"' \
  --define BUILD_TIME='"2024-01-15T10:30:00Z"' \
  ./cli.ts \
  --outfile arashi
```

```typescript
// cli.ts - these are replaced at build time
declare const BUILD_VERSION: string;
declare const BUILD_TIME: string;

console.log(`Arashi CLI v${BUILD_VERSION}`);
console.log(`Built: ${BUILD_TIME}`);
```

### Embedding Assets

```typescript
// Import assets with type: "file"
import icon from "./assets/icon.png" with { type: "file" };
import config from "./default-config.json" with { type: "file" };

// Read embedded files at runtime
import { file } from "bun";

const iconData = await file(icon).arrayBuffer();
const configData = await file(config).json();
```

Compile with embedded assets:

```bash
# Embed specific files
bun build --compile ./cli.ts ./assets/**/*.png --outfile arashi

# Or use glob patterns
bun build --compile ./cli.ts './assets/**/*' --outfile arashi
```

### Embedding SQLite Databases

```typescript
import db from "./data.db" with { type: "sqlite", embed: "true" };

// Database is embedded and read-only in the executable
const result = db.query("SELECT * FROM worktrees").all();
```

### Platform-Specific Targets

Available targets:

```typescript
type Target =
  | "bun-darwin-x64" // macOS Intel
  | "bun-darwin-x64-baseline" // macOS Intel (pre-2013 CPUs)
  | "bun-darwin-arm64" // macOS Apple Silicon
  | "bun-linux-x64" // Linux x64
  | "bun-linux-x64-baseline" // Linux x64 (pre-2013 CPUs)
  | "bun-linux-x64-modern" // Linux x64 (2013+ CPUs)
  | "bun-linux-arm64" // Linux ARM64
  | "bun-windows-x64" // Windows x64
  | "bun-windows-x64-baseline" // Windows x64 (pre-2013 CPUs)
  | "bun-windows-x64-modern"; // Windows x64 (2013+ CPUs)
```

**Note:** Use `-baseline` for maximum compatibility, `-modern` for better performance (requires AVX2).

### Config File Loading

By default, compiled executables:

- ✅ Load `.env` and `bunfig.toml` at runtime
- ❌ Do NOT load `tsconfig.json` and `package.json`

To enable runtime config loading:

```bash
# Enable tsconfig.json loading
bun build --compile --compile-autoload-tsconfig ./cli.ts --outfile arashi

# Enable package.json loading
bun build --compile --compile-autoload-package-json ./cli.ts --outfile arashi

# Disable .env loading (for deterministic builds)
bun build --compile --no-compile-autoload-dotenv ./cli.ts --outfile arashi
```

### Best Practices

1. **Use bytecode compilation**: Significantly faster startup for large apps
2. **Enable minification**: Reduces executable size
3. **Include sourcemaps**: Better debugging in production
4. **Set build-time constants**: Version numbers, build dates, feature flags
5. **Embed assets**: Include static files (images, configs, databases)
6. **Cross-compile**: Build for all target platforms from a single machine
7. **Disable unnecessary configs**: Don't load tsconfig.json at runtime

### Common Pitfalls to Avoid

- Don't use dynamic imports with non-embedded files (they won't exist at runtime)
- Remember to disable `.env` loading for deterministic builds
- Embedded databases are read-only (changes are lost on exit)
- Use `-baseline` targets if you see "Illegal instruction" errors
- Code-sign on macOS to avoid Gatekeeper warnings
- Test executables on target platforms (cross-compilation doesn't guarantee it works)
- Don't forget `.exe` extension for Windows (Bun adds it automatically)

### Multi-Platform Build Script

```typescript
// build-all.ts
const targets = [
  "bun-linux-x64",
  "bun-linux-arm64",
  "bun-darwin-arm64",
  "bun-darwin-x64",
  "bun-windows-x64",
] as const;

for (const target of targets) {
  const isWindows = target.includes("windows");
  const ext = isWindows ? ".exe" : "";
  const outfile = `./dist/arashi-${target}${ext}`;

  console.log(`Building for ${target}...`);

  await Bun.build({
    entrypoints: ["./src/cli.ts"],
    compile: {
      target,
      outfile,
    },
    minify: true,
    sourcemap: "linked",
    bytecode: true,
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  });

  console.log(`✓ Built: ${outfile}`);
}
```

---

## Summary

This document provides comprehensive patterns for building the Arashi CLI tool using:

1. **Commander.js** - Command-line argument parsing with subcommands and options
2. **@inquirer/prompts** - Interactive prompts (select, checkbox, confirm, input)
3. **ora** - Elegant spinners for long-running operations
4. **chalk** - Consistent color scheme for CLI output
5. **Error handling** - Standardized exit codes and error formatting
6. **Configuration** - Multi-location config file loading with validation
7. **Bun compilation** - Cross-platform executable generation

All patterns follow modern best practices and include common pitfalls to avoid.
