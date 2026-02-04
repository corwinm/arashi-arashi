# Data Model: Hook System

**Feature**: Hook System (001-github-issues)  
**Date**: 2026-02-04  
**Purpose**: Define entities, types, and data structures for the hook system

## Entity Definitions

### Hook

**Description**: A shell script file located in `.arashi/hooks/` that executes automatically at defined lifecycle points in arashi's execution.

**Attributes**:
- `name` (string): Name of the lifecycle point (e.g., "pre-worktree", "post-create")
- `scriptPath` (string): Absolute path to the hook script file
- `lifecycle` (LifecyclePoint): The lifecycle point where this hook executes

**Validation Rules**:
- Script file must exist at `{repoPath}/.arashi/hooks/{name}.sh`
- Script must have execute permissions (Unix systems)
- Script name must match defined lifecycle point names
- Script must use `.sh` extension

**State Transitions**:
1. **Discovered**: Hook file found in `.arashi/hooks/` directory
2. **Validated**: Script permissions and existence verified
3. **Executing**: Hook process spawned and running
4. **Completed**: Hook exited with status code (success or failure)
5. **Skipped**: Hook not executed due to `--no-hooks` flag or validation failure

**Relationships**:
- One Hook belongs to one LifecyclePoint
- One Hook produces one HookResult when executed
- One Hook receives one HookContext during execution

---

### HookContext

**Description**: Information provided to hook scripts via environment variables, including repository path, hook name, and operation-specific data.

**Attributes**:
- `hookName` (string): Name of the executing hook (e.g., "pre-worktree")
- `repoPath` (string): Absolute path to the repository
- `operationData` (Record<string, string>): Lifecycle-specific context data

**Validation Rules**:
- All values must be serializable to environment variable format (strings)
- Required fields: `hookName`, `repoPath`
- Optional fields depend on lifecycle point context

**Environment Variable Mapping**:
- `ARASHI_HOOK_NAME` ← `hookName`
- `ARASHI_REPO_PATH` ← `repoPath`
- Custom variables from `operationData` with `ARASHI_` prefix

**Example Context by Lifecycle Point**:

```typescript
// Pre-worktree hook context
{
  hookName: "pre-worktree",
  repoPath: "/Users/dev/project",
  operationData: {
    BRANCH: "feature-123",
    WORKTREE_PATH: "/Users/dev/project-worktrees/feature-123",
    BASE_BRANCH: "main"
  }
}

// Post-create hook context
{
  hookName: "post-create",
  repoPath: "/Users/dev/project",
  operationData: {
    BRANCH: "feature-123",
    WORKTREE_PATH: "/Users/dev/project-worktrees/feature-123",
    CREATED_FROM: "main"
  }
}
```

---

### LifecyclePoint

**Description**: A named stage in arashi's execution where hooks can be triggered.

**Attributes**:
- `name` (string): Unique identifier for the lifecycle point
- `timing` (Timing): Whether hook runs before or after the operation
- `operation` (string): The arashi operation this lifecycle point belongs to

**Enum Values** (Initial Set):
- `pre-create`: Before worktree creation
- `post-create`: After worktree creation
- `setup`: During initial arashi configuration

**Validation Rules**:
- Name must be unique across all lifecycle points
- Name must follow kebab-case convention
- Timing must be "pre" or "post" (or "during" for setup-type hooks)

**Future Extensibility**:
Additional lifecycle points can be added as arashi evolves:
- `pre-remove`: Before worktree removal
- `post-remove`: After worktree removal
- `pre-switch`: Before branch switch
- `post-switch`: After branch switch

---

### HookResult

**Description**: The outcome of a hook execution, including exit code, output, and execution metadata.

**Attributes**:
- `exitCode` (number): Process exit code (0 = success, non-zero = failure)
- `signalCode` (string | null): Signal that terminated the process (e.g., "SIGTERM")
- `killed` (boolean): Whether process was forcibly terminated
- `stdout` (string): Complete stdout output from hook
- `stderr` (string): Complete stderr output from hook
- `success` (boolean): Whether hook succeeded (exitCode === 0 && !killed)
- `timedOut` (boolean): Whether hook was terminated due to timeout
- `duration` (number): Execution time in milliseconds

**Validation Rules**:
- `exitCode` must be an integer
- `success` is computed: `exitCode === 0 && !killed`
- `timedOut` is computed: `killed && signalCode === "SIGTERM"`
- `duration` must be non-negative

**State Interpretations**:
1. **Success**: `success === true`, `exitCode === 0`, `!killed`
2. **Failure**: `success === false`, `exitCode !== 0`, `!killed`
3. **Timeout**: `timedOut === true`, `killed === true`, `signalCode === "SIGTERM"`
4. **Killed**: `killed === true`, `signalCode === "SIGKILL"` (forced termination)

---

### HookConfig

**Description**: Configuration for hook execution behavior, typically loaded from `.arashi/config.json`.

**Attributes**:
- `timeout` (number): Maximum execution time in milliseconds (default: 300000)
- `enabled` (boolean): Whether hooks are enabled globally (default: true)
- `allowedHooks` (string[] | null): Whitelist of allowed hooks (null = all allowed)
- `blockedHooks` (string[]): Blacklist of blocked hooks (default: empty)

**Validation Rules**:
- `timeout` must be positive integer
- `timeout` minimum: 1000ms (1 second)
- `timeout` maximum: 3600000ms (60 minutes)
- `allowedHooks` and `blockedHooks` cannot both be non-empty

**Default Configuration**:

```json
{
  "hooks": {
    "timeout": 300000,
    "enabled": true,
    "allowedHooks": null,
    "blockedHooks": []
  }
}
```

**Configuration Priority** (highest to lowest):
1. Command-line flag (`--no-hooks`)
2. Hook-specific timeout in config
3. Global timeout in config
4. Hardcoded default (300000ms)

---

## Type Definitions

### TypeScript Interfaces

```typescript
// Core hook types
export interface Hook {
  name: string;
  scriptPath: string;
  lifecycle: LifecyclePoint;
}

export interface HookContext {
  hookName: string;
  repoPath: string;
  operationData: Record<string, string>;
}

export interface LifecyclePoint {
  name: string;
  timing: "pre" | "post" | "during";
  operation: string;
}

export interface HookResult {
  exitCode: number;
  signalCode: string | null;
  killed: boolean;
  stdout: string;
  stderr: string;
  success: boolean;
  timedOut: boolean;
  duration: number;
}

export interface HookConfig {
  timeout: number;
  enabled: boolean;
  allowedHooks: string[] | null;
  blockedHooks: string[];
}

// Execution options
export interface HookExecutionOptions {
  hookName: string;
  scriptPath: string;
  context: HookContext;
  timeout?: number;
  skipHooks?: boolean;
}

// Hook discovery result
export interface DiscoveredHook {
  name: string;
  path: string;
  exists: boolean;
  executable: boolean;
  validationError?: string;
}
```

## Data Flow

### Hook Execution Flow

```
1. Command Execution
   ↓
2. Reach Lifecycle Point
   ↓
3. Check --no-hooks flag → Skip if true
   ↓
4. Discover Hook (findHook)
   ↓
5. Hook Found? → Skip if false
   ↓
6. Validate Hook (validateHook)
   ↓
7. Valid? → Skip if false
   ↓
8. Build HookContext
   ↓
9. Execute Hook (executeHook)
   ↓
10. Stream Output (real-time)
    ↓
11. Wait for Exit/Timeout
    ↓
12. Create HookResult
    ↓
13. Log Result
    ↓
14. Continue Command (non-fatal)
```

### Environment Variable Construction

```typescript
function buildEnvironment(context: HookContext): Record<string, string> {
  return {
    ...process.env,                           // Inherit system environment
    ARASHI_HOOK_NAME: context.hookName,       // Hook identifier
    ARASHI_REPO_PATH: context.repoPath,       // Repository path
    ...Object.entries(context.operationData)  // Operation-specific data
      .reduce((acc, [key, value]) => ({
        ...acc,
        [`ARASHI_${key}`]: value
      }), {}),
  };
}
```

## Validation Scenarios

### Hook Discovery Validation

| Scenario | Condition | Action |
|----------|-----------|--------|
| Directory missing | `.arashi/hooks/` doesn't exist | Skip silently (no error) |
| Hook file missing | `{name}.sh` not found | Skip silently (no error) |
| Hook is directory | Path exists but is directory | Log error, skip hook |
| Not executable | File lacks execute permissions (Unix) | Log error with fix suggestion, skip hook |
| Valid hook | File exists and executable | Proceed to execution |

### Hook Execution Validation

| Scenario | Condition | Action |
|----------|-----------|--------|
| Spawn fails | Script not found or permission denied | Log error, return failure result |
| Exits with 0 | Normal success | Log success, continue command |
| Exits non-zero | Hook reported failure | Log warning with stderr, continue command |
| Timeout | Exceeds configured timeout | Send SIGTERM, log timeout, continue command |
| Killed (SIGTERM) | Process doesn't respond to SIGTERM | Send SIGKILL after 5s grace period |

### Configuration Validation

| Scenario | Condition | Action |
|----------|-----------|--------|
| Invalid timeout | < 1000 or > 3600000 | Use default (300000ms) |
| Conflicting lists | Both allowedHooks and blockedHooks set | Error: invalid configuration |
| Missing config | No hooks section in config | Use all defaults |
| Malformed JSON | Config file invalid | Log warning, use defaults |

## Relationships Diagram

```
┌─────────────────┐
│ HookConfig      │
│ (from config)   │
└────────┬────────┘
         │
         │ configures
         ↓
┌─────────────────┐        ┌──────────────────┐
│ Hook            │───────→│ LifecyclePoint   │
│ (discovered)    │ maps   │ (pre-create, etc)│
└────────┬────────┘        └──────────────────┘
         │
         │ executes with
         ↓
┌─────────────────┐        ┌──────────────────┐
│ HookContext     │───────→│ Environment      │
│ (runtime data)  │ becomes│ Variables        │
└─────────────────┘        └──────────────────┘
         │
         │ produces
         ↓
┌─────────────────┐
│ HookResult      │
│ (execution      │
│  outcome)       │
└─────────────────┘
```

## Notes

- All hook operations are non-fatal - failures never block command execution
- Hook discovery is lazy - only occurs when lifecycle point is reached
- Output streaming is real-time to provide immediate feedback
- Timeout enforcement uses graceful shutdown (SIGTERM → SIGKILL)
- Cross-platform compatibility handled via platform detection
