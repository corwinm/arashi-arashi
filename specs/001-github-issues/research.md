# Research: Hook System Implementation

**Date**: 2026-02-04  
**Feature**: Hook System (001-github-issues)  
**Purpose**: Resolve technical unknowns for implementing lifecycle hooks in arashi CLI

## Research Topics

### 1. Process Spawning API in Bun

**Decision**: Use `Bun.spawn()` API

**Rationale**:
- Native Bun API optimized for Bun's runtime (better performance than Node.js compatibility layers)
- Built-in streaming support via `ReadableStream` for stdout/stderr
- Native timeout support with configurable kill signals
- Promise-based API with clean async/await patterns
- Cross-platform support (macOS, Linux, Windows)
- Simple environment variable passing via `env` option
- Rich lifecycle hooks (`onExit` callback)

**Alternatives Considered**:
1. **Node.js `child_process` module**: Compatibility layer overhead, not optimized for Bun
2. **Bun Shell (`$` template literal)**: Less control over real-time streaming, harder to implement custom prefixing
3. **`Bun.spawnSync()`**: Blocks event loop, no real-time streaming, poor UX for long-running hooks

**Implementation Approach**:

```typescript
const proc = Bun.spawn([shell, scriptPath], {
  cwd: process.cwd(),
  env: { ...process.env, ...customEnv },
  stdout: "pipe",
  stderr: "pipe",
  timeout: 300000, // 5 minutes
  killSignal: "SIGTERM",
  onExit(proc, exitCode, signalCode, error) {
    console.log(`Hook exited: code=${exitCode}`);
  },
});
```

### 2. Real-Time Output Streaming

**Decision**: Use `for await...of` with ReadableStream

**Rationale**:
- Bun.spawn returns stdout/stderr as ReadableStream when `stdout: "pipe"` is set
- AsyncIterator interface allows chunk-by-chunk processing
- Can add prefixes to each line in real-time
- No buffering delays - immediate user feedback

**Implementation Pattern**:

```typescript
async function streamOutput(stream: ReadableStream, prefix: string): Promise<string> {
  const decoder = new TextDecoder();
  let buffer = "";
  const lines: string[] = [];
  
  for await (const chunk of stream) {
    buffer += decoder.decode(chunk, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? ""; // Keep incomplete line
    
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

### 3. Timeout Enforcement

**Decision**: Use built-in `timeout` option with SIGTERM/SIGKILL fallback

**Rationale**:
- Bun.spawn has native `timeout` option (milliseconds)
- Automatically sends `killSignal` when timeout reached
- No manual timer management needed
- Graceful shutdown attempt (SIGTERM) before force kill

**Implementation Pattern**:

```typescript
const proc = Bun.spawn(command, {
  timeout: 300000, // 5 minutes
  killSignal: "SIGTERM",
});

// Optional: Force kill if SIGTERM doesn't work
const killTimer = setTimeout(() => {
  if (!proc.exited) {
    proc.kill("SIGKILL");
  }
}, timeout + 5000);

await proc.exited;
clearTimeout(killTimer);

const timedOut = proc.killed && proc.signalCode === "SIGTERM";
```

### 4. Cross-Platform Shell Execution

**Decision**: Detect platform and select appropriate shell

**Rationale**:
- Windows requires `cmd.exe` or `powershell.exe`
- Unix systems (macOS, Linux) use `sh` for maximum portability
- Bun.spawn handles platform differences in signal handling
- Environment variables work consistently across platforms

**Implementation Pattern**:

```typescript
function getShellCommand(scriptPath: string): string[] {
  switch (process.platform) {
    case "win32":
      if (scriptPath.endsWith(".ps1")) {
        return ["powershell.exe", "-File", scriptPath];
      }
      return ["cmd.exe", "/c", scriptPath];
    
    case "darwin":
    case "linux":
    default:
      return ["sh", scriptPath];
  }
}
```

**Platform Considerations**:
- **Path separators**: Use `path.resolve()` for cross-platform paths
- **Line endings**: Split on `/\r?\n/` to handle both Unix (\n) and Windows (\r\n)
- **Signals**: SIGTERM works on all platforms (Windows converts to appropriate termination)
- **Permissions**: Check execute permissions on Unix (`chmod 0o755`); Windows handles via file extension

### 5. Environment Variable Passing

**Decision**: Merge custom variables with `process.env`

**Rationale**:
- Hook scripts need access to system PATH and other environment variables
- Custom context (repo path, branch name, etc.) passed as additional variables
- Simple object merge pattern

**Implementation Pattern**:

```typescript
const proc = Bun.spawn(command, {
  env: {
    ...process.env,              // Inherit system environment
    ARASHI_REPO_PATH: repoPath,  // Custom context
    ARASHI_HOOK_NAME: hookName,
    ARASHI_BRANCH: branchName,
    // ... other context variables
  },
});
```

### 6. Error Handling Patterns

**Decision**: Non-fatal error handling with detailed logging

**Rationale**:
- Hook failures should not block arashi commands (per spec FR-007)
- Users need clear error messages for debugging
- Different error types: permission denied, timeout, non-zero exit, spawn failure

**Implementation Pattern**:

```typescript
interface HookResult {
  exitCode: number;
  signalCode: string | null;
  killed: boolean;
  stdout: string;
  stderr: string;
  success: boolean;
  timedOut?: boolean;
}

try {
  const proc = Bun.spawn(command, options);
  // ... execute and stream
  await proc.exited;
  
  return {
    exitCode: proc.exitCode ?? -1,
    signalCode: proc.signalCode,
    killed: proc.killed,
    stdout,
    stderr,
    success: proc.exitCode === 0 && !proc.killed,
    timedOut: proc.killed && proc.signalCode === "SIGTERM",
  };
} catch (error) {
  // Spawn failures (not found, permission denied, etc.)
  console.error(`Hook execution failed: ${error}`);
  return {
    exitCode: -1,
    signalCode: null,
    killed: false,
    stdout: "",
    stderr: error instanceof Error ? error.message : String(error),
    success: false,
  };
}
```

**Common Error Scenarios**:
1. **Script not found**: Catch spawn error, log clear message
2. **Permission denied**: Check file permissions before spawn, log actionable error
3. **Timeout**: Check `killed` + `signalCode === "SIGTERM"`, log timeout message
4. **Non-zero exit**: Log stderr output, mark as non-fatal failure
5. **Missing hooks directory**: Check directory existence before discovery, skip silently

### 7. Hook Discovery and Validation

**Decision**: File system scan with permission validation

**Rationale**:
- Check `.arashi/hooks/` directory for `{hookName}.sh` files
- Validate execute permissions before attempting to run
- Gracefully handle missing directory or files

**Implementation Pattern**:

```typescript
import { stat, access, readdir } from "fs/promises";
import { join } from "path";
import { constants } from "fs";

async function findHook(hookName: string, repoPath: string): Promise<string | null> {
  const hooksDir = join(repoPath, ".arashi", "hooks");
  const hookPath = join(hooksDir, `${hookName}.sh`);
  
  try {
    // Check if file exists
    await access(hookPath, constants.F_OK);
    return hookPath;
  } catch {
    // File doesn't exist - not an error, just no hook
    return null;
  }
}

async function validateHook(hookPath: string): Promise<boolean> {
  try {
    const stats = await stat(hookPath);
    
    // Check if it's a file (not directory)
    if (!stats.isFile()) {
      console.error(`Hook is not a file: ${hookPath}`);
      return false;
    }
    
    // Check execute permissions on Unix systems
    if (process.platform !== "win32") {
      try {
        await access(hookPath, constants.X_OK);
      } catch {
        console.error(`Hook is not executable: ${hookPath}`);
        console.error(`Run: chmod +x ${hookPath}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Failed to validate hook: ${error}`);
    return false;
  }
}
```

### 8. Lifecycle Point Naming

**Decision**: Use kebab-case with pre-/post- prefixes

**Rationale**:
- Consistent with Git hooks naming convention
- Clear temporal relationship (pre-X happens before, post-X happens after)
- Kebab-case is standard for shell scripts
- `.sh` extension makes file type obvious

**Naming Convention**:
- Format: `{timing}-{operation}.sh`
- Examples: `pre-worktree.sh`, `post-worktree.sh`, `pre-branch-switch.sh`
- Timing: `pre` or `post`
- Operation: Kebab-case description of the lifecycle point

**Initial Lifecycle Points** (per GitHub issue):
- `pre-create.sh`: Before worktree creation
- `post-create.sh`: After worktree creation
- `setup.sh`: During initial setup/configuration

## Summary

The hook system will be implemented using:
- **Bun.spawn()** for process execution with built-in timeout and streaming
- **ReadableStream** iteration for real-time output with prefixes
- **Platform detection** for cross-platform shell selection
- **Environment variables** for passing context to hooks
- **Non-fatal error handling** with detailed logging
- **File system validation** for hook discovery and permission checks
- **Kebab-case naming** for hook files with `.sh` extension

All technical unknowns from the Technical Context section have been resolved with concrete implementation approaches.
