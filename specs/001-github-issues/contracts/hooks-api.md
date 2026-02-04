# API Contract: Hook System

**Feature**: Hook System (001-github-issues)  
**Date**: 2026-02-04  
**Purpose**: Define function signatures, types, and interfaces for the hook system module

## Module: `src/lib/hooks.ts`

### Public API

#### `findHook()`

Discovers a hook script for a given lifecycle point.

**Signature**:
```typescript
function findHook(
  hookName: string,
  repoPath: string
): Promise<string | null>
```

**Parameters**:
- `hookName` (string): Name of the lifecycle point (e.g., "pre-worktree", "post-create")
- `repoPath` (string): Absolute path to the repository

**Returns**:
- `Promise<string | null>`: Absolute path to hook script if found, null if not found

**Behavior**:
- Constructs path: `{repoPath}/.arashi/hooks/{hookName}.sh`
- Checks if file exists using `fs.access()`
- Returns path if file exists, null otherwise
- Does NOT throw errors for missing files or directories
- Does NOT validate execute permissions (that's `validateHook`'s job)

**Example**:
```typescript
const hookPath = await findHook("pre-create", "/Users/dev/project");
// Returns: "/Users/dev/project/.arashi/hooks/pre-create.sh" or null
```

**Error Handling**:
- Missing `.arashi/hooks/` directory: Returns null (not an error)
- Missing hook file: Returns null (not an error)
- File system errors: Catches and returns null

---

#### `validateHook()`

Validates that a hook script is executable and properly configured.

**Signature**:
```typescript
function validateHook(hookPath: string): Promise<ValidationResult>

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

**Parameters**:
- `hookPath` (string): Absolute path to the hook script

**Returns**:
- `Promise<ValidationResult>`: Object indicating validation status and error message if invalid

**Behavior**:
- Checks if path points to a regular file (not directory)
- On Unix systems (macOS, Linux): Checks execute permissions
- On Windows: Assumes executable based on `.sh` extension
- Returns detailed error messages for troubleshooting

**Example**:
```typescript
const result = await validateHook("/path/to/hook.sh");
if (!result.valid) {
  console.error(`Hook validation failed: ${result.error}`);
}
```

**Validation Checks**:
1. File exists (throw if not - should always exist when called)
2. Path is a regular file (not directory, symlink, etc.)
3. File has execute permissions (Unix only)

**Error Messages**:
- Not a file: `"Hook is not a regular file: {path}"`
- Not executable: `"Hook is not executable: {path}. Run: chmod +x {path}"`
- File not found: `"Hook file not found: {path}"`

---

#### `executeHook()`

Executes a hook script with provided context and returns the result.

**Signature**:
```typescript
function executeHook(options: HookExecutionOptions): Promise<HookResult>

interface HookExecutionOptions {
  hookName: string;
  scriptPath: string;
  context: HookContext;
  timeout?: number;
}

interface HookContext {
  hookName: string;
  repoPath: string;
  operationData: Record<string, string>;
}

interface HookResult {
  exitCode: number;
  signalCode: string | null;
  killed: boolean;
  stdout: string;
  stderr: string;
  success: boolean;
  timedOut: boolean;
  duration: number;
}
```

**Parameters**:
- `options.hookName` (string): Name for logging purposes
- `options.scriptPath` (string): Absolute path to hook script
- `options.context` (HookContext): Context data to pass via environment variables
- `options.timeout` (number, optional): Max execution time in ms (default: 300000)

**Returns**:
- `Promise<HookResult>`: Complete execution result including exit code and output

**Behavior**:
- Spawns hook script as separate process using `Bun.spawn()`
- Streams stdout/stderr in real-time with prefixes
- Enforces timeout and terminates process if exceeded
- Passes context via environment variables
- Logs execution start, progress, and completion
- Returns detailed result even on failure (non-throwing)

**Example**:
```typescript
const result = await executeHook({
  hookName: "pre-create",
  scriptPath: "/path/to/hook.sh",
  context: {
    hookName: "pre-create",
    repoPath: "/Users/dev/project",
    operationData: {
      BRANCH: "feature-123",
      WORKTREE_PATH: "/Users/dev/worktrees/feature-123"
    }
  },
  timeout: 300000
});

if (!result.success) {
  console.warn(`Hook failed with exit code ${result.exitCode}`);
  console.warn(`stderr: ${result.stderr}`);
}
```

**Process Lifecycle**:
1. Log execution start
2. Spawn process with platform-appropriate shell
3. Stream stdout with `[{hookName}:OUT]` prefix
4. Stream stderr with `[{hookName}:ERR]` prefix
5. Wait for process exit or timeout
6. Log execution result
7. Return `HookResult` object

**Error Handling**:
- Spawn failure: Returns `HookResult` with `exitCode: -1` and error in `stderr`
- Timeout: Sends SIGTERM, waits 5s, sends SIGKILL if needed, sets `timedOut: true`
- Non-zero exit: Returns result with `success: false`, does NOT throw

---

#### `runLifecycleHook()`

High-level function to discover, validate, and execute a hook for a lifecycle point.

**Signature**:
```typescript
function runLifecycleHook(
  lifecyclePoint: string,
  repoPath: string,
  operationData: Record<string, string>,
  options?: { skipHooks?: boolean; timeout?: number }
): Promise<HookResult | null>
```

**Parameters**:
- `lifecyclePoint` (string): Name of the lifecycle point (e.g., "pre-create")
- `repoPath` (string): Absolute path to the repository
- `operationData` (Record<string, string>): Context-specific data for the hook
- `options.skipHooks` (boolean, optional): If true, skip hook execution
- `options.timeout` (number, optional): Override default timeout

**Returns**:
- `Promise<HookResult | null>`: Execution result if hook ran, null if skipped or not found

**Behavior**:
- Orchestrates the full hook lifecycle: discover → validate → execute
- Handles all error cases gracefully
- Logs appropriate messages for each scenario
- Returns null if hook doesn't exist or is skipped (not an error)
- Always returns `HookResult` if hook executes (even on failure)

**Example**:
```typescript
const result = await runLifecycleHook(
  "pre-create",
  "/Users/dev/project",
  {
    BRANCH: "feature-123",
    WORKTREE_PATH: "/Users/dev/worktrees/feature-123"
  },
  { timeout: 300000 }
);

if (result === null) {
  // No hook to run or hooks skipped
  console.log("No pre-create hook found");
} else if (!result.success) {
  // Hook ran but failed
  console.warn(`pre-create hook failed: ${result.stderr}`);
}
// Command continues regardless
```

**Decision Flow**:
```
1. Check skipHooks flag
   ├─ true → Return null
   └─ false → Continue
2. Call findHook()
   ├─ null → Return null (no hook)
   └─ path → Continue
3. Call validateHook()
   ├─ invalid → Log error, return null
   └─ valid → Continue
4. Call executeHook()
   └─ Return HookResult (success or failure)
```

---

### Helper Functions (Internal)

#### `buildEnvironment()`

Constructs environment variables from hook context.

**Signature**:
```typescript
function buildEnvironment(context: HookContext): Record<string, string>
```

**Parameters**:
- `context` (HookContext): Hook context data

**Returns**:
- `Record<string, string>`: Complete environment variable object

**Behavior**:
- Merges `process.env` with context data
- Prefixes all context variables with `ARASHI_`
- Maps context fields to specific environment variable names

**Example**:
```typescript
const env = buildEnvironment({
  hookName: "pre-create",
  repoPath: "/Users/dev/project",
  operationData: {
    BRANCH: "feature-123",
    WORKTREE_PATH: "/path/to/worktree"
  }
});

// Result:
// {
//   ...process.env,
//   ARASHI_HOOK_NAME: "pre-create",
//   ARASHI_REPO_PATH: "/Users/dev/project",
//   ARASHI_BRANCH: "feature-123",
//   ARASHI_WORKTREE_PATH: "/path/to/worktree"
// }
```

---

#### `getShellCommand()`

Returns platform-appropriate shell command for executing scripts.

**Signature**:
```typescript
function getShellCommand(scriptPath: string): string[]
```

**Parameters**:
- `scriptPath` (string): Path to the script file

**Returns**:
- `string[]`: Array of command arguments for Bun.spawn

**Behavior**:
- Detects platform using `process.platform`
- Returns appropriate shell and arguments
- Handles `.ps1` extension for PowerShell on Windows

**Example**:
```typescript
// On macOS/Linux:
getShellCommand("/path/to/hook.sh")
// Returns: ["sh", "/path/to/hook.sh"]

// On Windows (.sh file):
getShellCommand("C:\\hooks\\hook.sh")
// Returns: ["cmd.exe", "/c", "C:\\hooks\\hook.sh"]

// On Windows (.ps1 file):
getShellCommand("C:\\hooks\\hook.ps1")
// Returns: ["powershell.exe", "-File", "C:\\hooks\\hook.ps1"]
```

**Platform Detection**:
- `win32`: Use `cmd.exe /c` or `powershell.exe -File`
- `darwin` / `linux`: Use `sh`

---

#### `streamOutput()`

Streams and prefixes output from a ReadableStream.

**Signature**:
```typescript
function streamOutput(
  stream: ReadableStream,
  prefix: string
): Promise<string>
```

**Parameters**:
- `stream` (ReadableStream): stdout or stderr stream from Bun.spawn
- `prefix` (string): Prefix to add to each line (e.g., "[hook-name:OUT]")

**Returns**:
- `Promise<string>`: Complete output as a single string

**Behavior**:
- Iterates through stream chunks using `for await...of`
- Decodes chunks using `TextDecoder`
- Splits on newlines and adds prefix to each line
- Prints lines in real-time
- Returns accumulated output

**Example**:
```typescript
const stdout = await streamOutput(
  proc.stdout,
  "[pre-create:OUT]"
);

// Console output (real-time):
// [pre-create:OUT] Starting hook...
// [pre-create:OUT] Processing...
// [pre-create:OUT] Done!

// Returns: "Starting hook...\nProcessing...\nDone!"
```

---

## Usage Examples

### Basic Hook Execution

```typescript
import { runLifecycleHook } from "./lib/hooks";

// In worktree creation command
async function createWorktree(branch: string, repoPath: string) {
  // Run pre-create hook
  const preResult = await runLifecycleHook(
    "pre-create",
    repoPath,
    {
      BRANCH: branch,
      WORKTREE_PATH: worktreePath,
      BASE_BRANCH: "main"
    }
  );

  if (preResult && !preResult.success) {
    console.warn("Pre-create hook failed, but continuing...");
  }

  // ... create worktree ...

  // Run post-create hook
  await runLifecycleHook("post-create", repoPath, {
    BRANCH: branch,
    WORKTREE_PATH: worktreePath
  });
}
```

### Manual Hook Discovery and Validation

```typescript
import { findHook, validateHook, executeHook } from "./lib/hooks";

const hookPath = await findHook("pre-create", repoPath);

if (hookPath) {
  const validation = await validateHook(hookPath);
  
  if (validation.valid) {
    const result = await executeHook({
      hookName: "pre-create",
      scriptPath: hookPath,
      context: {
        hookName: "pre-create",
        repoPath,
        operationData: { BRANCH: "main" }
      }
    });
    
    console.log(`Hook exited with code ${result.exitCode}`);
  } else {
    console.error(`Hook validation failed: ${validation.error}`);
  }
} else {
  console.log("No hook found");
}
```

### Skipping Hooks

```typescript
// Pass --no-hooks flag from CLI
const skipHooks = process.argv.includes("--no-hooks");

const result = await runLifecycleHook(
  "pre-create",
  repoPath,
  operationData,
  { skipHooks }
);

// result will be null if hooks are skipped
```

### Custom Timeout

```typescript
const result = await runLifecycleHook(
  "setup",
  repoPath,
  {},
  { timeout: 60000 } // 1 minute timeout for setup hook
);
```

---

## Type Exports

All types and interfaces should be exported for use by other modules:

```typescript
export type {
  Hook,
  HookContext,
  HookResult,
  HookExecutionOptions,
  ValidationResult,
  HookConfig,
  LifecyclePoint
};

export {
  findHook,
  validateHook,
  executeHook,
  runLifecycleHook
};
```

---

## Error Handling Strategy

### Non-Fatal Errors (Log and Continue)
- Hook file not found
- Hook validation failure (permissions, not a file)
- Hook execution failure (non-zero exit code)
- Hook timeout

### Fatal Errors (Throw)
- Invalid arguments (null hookName, empty repoPath)
- File system corruption (unexpected fs errors during validation)

### Return Values
- `null`: Hook doesn't exist or was skipped (not an error)
- `HookResult` with `success: false`: Hook ran but failed (logged, not thrown)
- `HookResult` with `success: true`: Hook succeeded

---

## Testing Contracts

### Unit Test Coverage Required

1. **`findHook()`**
   - Returns path when hook exists
   - Returns null when hook doesn't exist
   - Returns null when directory doesn't exist
   - Handles platform-specific path separators

2. **`validateHook()`**
   - Passes for executable file on Unix
   - Fails for non-executable file on Unix
   - Passes for `.sh` file on Windows
   - Fails for directory instead of file
   - Returns clear error messages

3. **`executeHook()`**
   - Successfully executes hook with exit code 0
   - Captures stdout and stderr correctly
   - Handles non-zero exit codes
   - Enforces timeout and terminates process
   - Passes environment variables correctly
   - Streams output in real-time (verify with mock)

4. **`runLifecycleHook()`**
   - Returns null when hook doesn't exist
   - Returns null when skipHooks is true
   - Returns null when validation fails
   - Returns HookResult when hook executes
   - Handles all error cases gracefully

### Integration Test Scenarios

1. Execute real shell script that succeeds
2. Execute real shell script that fails (exit 1)
3. Execute long-running script that times out
4. Execute script with large output (1000+ lines)
5. Execute script that reads environment variables
6. Skip hook execution with --no-hooks flag

---

## Dependencies

### Internal Dependencies
- `src/lib/config.ts`: For loading timeout configuration
- `src/lib/logger.ts`: For consistent logging output

### External Dependencies (Bun Built-ins)
- `Bun.spawn()`: Process spawning
- `fs/promises`: File system operations (access, stat)
- `path`: Path manipulation

### No Third-Party Dependencies
All functionality uses Bun built-in APIs only.
