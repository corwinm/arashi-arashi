# Quick Start: Hook System

**Feature**: Hook System (001-github-issues)  
**Audience**: Developers implementing the hook system  
**Purpose**: Rapid onboarding guide for implementation

## Overview

The hook system allows arashi users to run custom shell scripts at defined lifecycle points (e.g., before/after worktree creation). Hooks are discovered in `.arashi/hooks/` directory, validated, and executed with context passed via environment variables.

**Key Principle**: Hook failures are always non-fatal. Commands continue execution even when hooks fail.

---

## Core Concepts

### 1. Lifecycle Points
Named stages where hooks can execute:
- `pre-create`: Before worktree creation
- `post-create`: After worktree creation
- `setup`: During initial configuration

### 2. Hook Discovery
- Location: `.arashi/hooks/{hookName}.sh`
- Automatic: No registration required
- Lazy: Only checked when lifecycle point is reached

### 3. Hook Context
Data passed to hooks via environment variables:
- `ARASHI_HOOK_NAME`: Hook identifier
- `ARASHI_REPO_PATH`: Repository path
- `ARASHI_{CUSTOM}`: Operation-specific data

### 4. Non-Fatal Execution
- Failures logged but don't stop commands
- Timeout enforced (5 min default)
- Output streamed in real-time

---

## Implementation Steps

### Step 1: Hook Discovery

**File**: `src/lib/hooks.ts`

```typescript
import { access } from "fs/promises";
import { join } from "path";
import { constants } from "fs";

export async function findHook(
  hookName: string,
  repoPath: string
): Promise<string | null> {
  const hookPath = join(repoPath, ".arashi", "hooks", `${hookName}.sh`);
  
  try {
    await access(hookPath, constants.F_OK);
    return hookPath;
  } catch {
    return null; // Not found is not an error
  }
}
```

**Test**:
```typescript
// tests/unit/hooks.test.ts
test("findHook returns path when hook exists", async () => {
  const hookPath = await findHook("pre-create", testRepoPath);
  expect(hookPath).toBe(`${testRepoPath}/.arashi/hooks/pre-create.sh`);
});

test("findHook returns null when hook doesn't exist", async () => {
  const hookPath = await findHook("nonexistent", testRepoPath);
  expect(hookPath).toBeNull();
});
```

---

### Step 2: Hook Validation

```typescript
import { stat } from "fs/promises";

interface ValidationResult {
  valid: boolean;
  error?: string;
}

export async function validateHook(hookPath: string): Promise<ValidationResult> {
  try {
    const stats = await stat(hookPath);
    
    if (!stats.isFile()) {
      return { valid: false, error: `Hook is not a file: ${hookPath}` };
    }
    
    // Check execute permissions on Unix
    if (process.platform !== "win32") {
      try {
        await access(hookPath, constants.X_OK);
      } catch {
        return {
          valid: false,
          error: `Hook is not executable: ${hookPath}. Run: chmod +x ${hookPath}`
        };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: `Failed to validate hook: ${error}` };
  }
}
```

**Test**:
```typescript
test("validateHook passes for executable file", async () => {
  const result = await validateHook(executableHookPath);
  expect(result.valid).toBe(true);
});

test("validateHook fails for non-executable file", async () => {
  const result = await validateHook(nonExecutableHookPath);
  expect(result.valid).toBe(false);
  expect(result.error).toContain("not executable");
});
```

---

### Step 3: Process Execution

```typescript
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

function getShellCommand(scriptPath: string): string[] {
  if (process.platform === "win32") {
    return scriptPath.endsWith(".ps1")
      ? ["powershell.exe", "-File", scriptPath]
      : ["cmd.exe", "/c", scriptPath];
  }
  return ["sh", scriptPath];
}

export async function executeHook(options: {
  hookName: string;
  scriptPath: string;
  context: HookContext;
  timeout?: number;
}): Promise<HookResult> {
  const startTime = Date.now();
  const timeout = options.timeout ?? 300000;
  
  console.log(`🪝 Executing hook: ${options.hookName}`);
  
  const proc = Bun.spawn(getShellCommand(options.scriptPath), {
    cwd: options.context.repoPath,
    env: buildEnvironment(options.context),
    stdout: "pipe",
    stderr: "pipe",
    timeout,
    killSignal: "SIGTERM",
  });
  
  // Stream output in parallel
  const [stdout, stderr] = await Promise.all([
    streamOutput(proc.stdout, `[${options.hookName}:OUT]`),
    streamOutput(proc.stderr, `[${options.hookName}:ERR]`),
  ]);
  
  await proc.exited;
  
  const duration = Date.now() - startTime;
  
  return {
    exitCode: proc.exitCode ?? -1,
    signalCode: proc.signalCode,
    killed: proc.killed,
    stdout,
    stderr,
    success: proc.exitCode === 0 && !proc.killed,
    timedOut: proc.killed && proc.signalCode === "SIGTERM",
    duration,
  };
}
```

---

### Step 4: Output Streaming

```typescript
async function streamOutput(
  stream: ReadableStream,
  prefix: string
): Promise<string> {
  const decoder = new TextDecoder();
  const lines: string[] = [];
  let buffer = "";
  
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    
    for (const line of parts) {
      console.log(`${prefix} ${line}`);
      lines.push(line);
    }
  }
  
  if (buffer) {
    console.log(`${prefix} ${buffer}`);
    lines.push(buffer);
  }
  
  return lines.join("\n");
}
```

**Test**:
```typescript
test("executeHook streams output with prefixes", async () => {
  const mockHook = createMockHook("echo 'test output'");
  const result = await executeHook({
    hookName: "test-hook",
    scriptPath: mockHook,
    context: testContext,
  });
  
  expect(result.stdout).toContain("test output");
  expect(result.success).toBe(true);
});
```

---

### Step 5: Environment Variables

```typescript
interface HookContext {
  hookName: string;
  repoPath: string;
  operationData: Record<string, string>;
}

function buildEnvironment(context: HookContext): Record<string, string> {
  const env: Record<string, string> = {
    ...process.env,
    ARASHI_HOOK_NAME: context.hookName,
    ARASHI_REPO_PATH: context.repoPath,
  };
  
  // Add operation-specific data with ARASHI_ prefix
  for (const [key, value] of Object.entries(context.operationData)) {
    env[`ARASHI_${key}`] = value;
  }
  
  return env;
}
```

**Test**:
```typescript
test("executeHook passes environment variables", async () => {
  const hookScript = `
    #!/bin/sh
    echo "Hook: $ARASHI_HOOK_NAME"
    echo "Repo: $ARASHI_REPO_PATH"
    echo "Branch: $ARASHI_BRANCH"
  `;
  
  const result = await executeHook({
    hookName: "test",
    scriptPath: createTempScript(hookScript),
    context: {
      hookName: "test",
      repoPath: "/path/to/repo",
      operationData: { BRANCH: "main" }
    }
  });
  
  expect(result.stdout).toContain("Hook: test");
  expect(result.stdout).toContain("Repo: /path/to/repo");
  expect(result.stdout).toContain("Branch: main");
});
```

---

### Step 6: High-Level API

```typescript
export async function runLifecycleHook(
  lifecyclePoint: string,
  repoPath: string,
  operationData: Record<string, string>,
  options?: { skipHooks?: boolean; timeout?: number }
): Promise<HookResult | null> {
  // Check skip flag
  if (options?.skipHooks) {
    console.log(`⏭️  Skipping hooks (--no-hooks flag)`);
    return null;
  }
  
  // Discover hook
  const hookPath = await findHook(lifecyclePoint, repoPath);
  if (!hookPath) {
    return null; // No hook found, not an error
  }
  
  // Validate hook
  const validation = await validateHook(hookPath);
  if (!validation.valid) {
    console.error(`❌ Hook validation failed: ${validation.error}`);
    return null;
  }
  
  // Execute hook
  const result = await executeHook({
    hookName: lifecyclePoint,
    scriptPath: hookPath,
    context: {
      hookName: lifecyclePoint,
      repoPath,
      operationData,
    },
    timeout: options?.timeout,
  });
  
  // Log result
  if (result.success) {
    console.log(`✅ Hook "${lifecyclePoint}" succeeded (${result.duration}ms)`);
  } else if (result.timedOut) {
    console.warn(`⏱️  Hook "${lifecyclePoint}" timed out after ${result.duration}ms`);
  } else {
    console.warn(`⚠️  Hook "${lifecyclePoint}" failed with exit code ${result.exitCode}`);
  }
  
  return result;
}
```

---

## Integration Example

### In a Command (e.g., worktree create)

```typescript
// src/commands/create.ts
import { runLifecycleHook } from "../lib/hooks";

export async function createWorktree(
  branch: string,
  repoPath: string,
  options: { noHooks?: boolean }
) {
  // Run pre-create hook
  await runLifecycleHook(
    "pre-create",
    repoPath,
    {
      BRANCH: branch,
      WORKTREE_PATH: worktreePath,
      BASE_BRANCH: "main"
    },
    { skipHooks: options.noHooks }
  );
  
  // Create worktree (main logic)
  try {
    await createWorktreeInternal(branch, repoPath);
  } catch (error) {
    console.error("Failed to create worktree:", error);
    throw error;
  }
  
  // Run post-create hook
  await runLifecycleHook(
    "post-create",
    repoPath,
    {
      BRANCH: branch,
      WORKTREE_PATH: worktreePath
    },
    { skipHooks: options.noHooks }
  );
}
```

---

## Testing Strategy

### Unit Tests
- Hook discovery (found/not found)
- Validation (executable/not executable)
- Environment variable construction
- Platform-specific shell selection

### Integration Tests
- Execute real script that succeeds
- Execute real script that fails
- Execute script with timeout
- Execute script with large output
- Skip hooks with --no-hooks flag

### Test Helpers

```typescript
// tests/helpers/hooks.ts
export function createMockHook(script: string): string {
  const tempPath = `/tmp/test-hook-${Date.now()}.sh`;
  writeFileSync(tempPath, `#!/bin/sh\n${script}`);
  chmodSync(tempPath, 0o755);
  return tempPath;
}

export function createTestContext(overrides?: Partial<HookContext>): HookContext {
  return {
    hookName: "test-hook",
    repoPath: "/tmp/test-repo",
    operationData: {},
    ...overrides,
  };
}
```

---

## Common Pitfalls

### 1. Forgetting Non-Fatal Principle
❌ **Wrong**:
```typescript
if (!result.success) {
  throw new Error("Hook failed!");
}
```

✅ **Correct**:
```typescript
if (!result.success) {
  console.warn("Hook failed, but continuing...");
}
// Command continues
```

### 2. Not Handling Missing Hooks
❌ **Wrong**:
```typescript
const hookPath = await findHook(name, repoPath);
await executeHook({ scriptPath: hookPath, ... }); // May be null!
```

✅ **Correct**:
```typescript
const hookPath = await findHook(name, repoPath);
if (hookPath) {
  await executeHook({ scriptPath: hookPath, ... });
}
```

### 3. Blocking on Output
❌ **Wrong**:
```typescript
const stdout = await proc.stdout.text(); // Buffers all output
const stderr = await proc.stderr.text();
```

✅ **Correct**:
```typescript
// Stream in real-time
const [stdout, stderr] = await Promise.all([
  streamOutput(proc.stdout, prefix),
  streamOutput(proc.stderr, prefix),
]);
```

### 4. Platform-Specific Paths
❌ **Wrong**:
```typescript
const hookPath = `${repoPath}/.arashi/hooks/${hookName}.sh`;
```

✅ **Correct**:
```typescript
const hookPath = join(repoPath, ".arashi", "hooks", `${hookName}.sh`);
```

---

## Next Steps

1. **Implement core functions** (`findHook`, `validateHook`, `executeHook`)
2. **Add unit tests** for each function
3. **Add integration tests** with real scripts
4. **Integrate into commands** (create, setup, etc.)
5. **Add `--no-hooks` flag** to CLI argument parser
6. **Update documentation** with hook usage examples

---

## Reference

- **Spec**: [spec.md](./spec.md)
- **Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/hooks-api.md](./contracts/hooks-api.md)

---

## Questions?

Refer to:
- Research document for Bun.spawn() details
- Data model for type definitions
- API contract for complete function signatures
- Feature spec for user scenarios and requirements
