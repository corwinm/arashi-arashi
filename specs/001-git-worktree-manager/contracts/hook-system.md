# Hook System Design

**Feature**: 001-git-worktree-manager  
**Document**: [D6] #12  
**Created**: 2026-02-03  
**Status**: Draft  
**Dependencies**: D2 (Type System - HookContext, HookResult)

## Purpose

This document defines the lifecycle hook system for Arashi, enabling users to customize behavior at key points during worktree operations. Hooks provide extensibility without bloating the core CLI.

## Scope

**In Scope**:
- Hook discovery mechanism
- Hook validation (permissions, existence)
- Hook execution order and timing
- Environment variable context passing
- Hook output capture and display
- Timeout and failure handling
- `--no-hooks` flag behavior

**Out of Scope**:
- Hook script implementation examples (see D7 Quickstart)
- CLI command implementations (see D3)
- Worktree orchestration (see D5)

---

## Hook Types

Arashi supports three types of hooks:

| Hook | Timing | Purpose | Location |
|------|--------|---------|----------|
| `pre-create` | Before worktree creation | Validation, setup preparation | `.arashi/hooks/pre-create.sh` |
| `post-create` | After worktree creation | Post-creation automation | `.arashi/hooks/post-create.sh` |
| `setup` | Per-repository setup | Install dependencies, build | `<repo>/.arashi-setup.sh` |

### Hook Execution Flow

```
┌─────────────────────────────────────────────────────────┐
│              arashi create <branch>                      │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   pre-create.sh  │  (Global hook)
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Worktree Creation│  (Core operations)
              │   - Main repo    │
              │   - Sub-repos    │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  post-create.sh  │  (Global hook)
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │  setup.sh        │  (Per-repository)
              │  - repo1         │
              │  - repo2         │
              │  - repo3         │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │      Success     │
              └──────────────────┘
```

---

## Hook Discovery

### Discovery Mechanism

Arashi searches for hooks at well-known paths relative to the project root.

```typescript
/**
 * Discover available hooks
 * 
 * @param projectRoot - Arashi project root (contains .arashi/)
 * @returns Map of hook types to hook paths
 */
async function discoverHooks(projectRoot: string): Promise<Map<HookType, string>> {
  const hooks = new Map<HookType, string>();

  // Global hooks in .arashi/hooks/
  const globalHooksDir = path.join(projectRoot, '.arashi', 'hooks');

  const hookPaths = {
    'pre-create': path.join(globalHooksDir, 'pre-create.sh'),
    'post-create': path.join(globalHooksDir, 'post-create.sh'),
  };

  for (const [hookType, hookPath] of Object.entries(hookPaths)) {
    if (await fileExists(hookPath)) {
      hooks.set(hookType as HookType, hookPath);
    }
  }

  return hooks;
}
```

**Hook Paths**:
- **Global hooks**: `.arashi/hooks/<hook-type>.sh`
- **Repository setup**: `<repos_dir>/<repo>/.arashi-setup.sh`

**Discovery Timing**:
- Global hooks: Discovered once at command start
- Setup scripts: Discovered per repository (already tracked in `discovered_repos`)

### Setup Script Discovery

Setup scripts are discovered during `arashi init` and `arashi add`:

```typescript
async function discoverRepoSetupScript(repoPath: string): Promise<boolean> {
  const setupPath = path.join(repoPath, '.arashi-setup.sh');
  return await fileExists(setupPath);
}
```

**Stored in Config**:
```json
{
  "discovered_repos": {
    "backend": {
      "has_setup_script": true,
      ...
    }
  }
}
```

---

## Hook Validation

### Validation Steps

Before executing a hook, validate:
1. Hook file exists
2. Hook file is executable (+x permission)
3. Hook file is a shell script (.sh extension)

```typescript
/**
 * Validate a hook before execution
 * 
 * @param hookPath - Path to hook script
 * @returns Validation result
 */
async function validateHook(hookPath: string): Promise<HookValidation> {
  const validation: HookValidation = {
    valid: true,
    errors: [],
  };

  // 1. Check file exists
  if (!await fileExists(hookPath)) {
    validation.valid = false;
    validation.errors.push(`Hook not found: ${hookPath}`);
    return validation;
  }

  // 2. Check execute permission
  try {
    const stats = await fs.stat(hookPath);
    const isExecutable = (stats.mode & 0o111) !== 0; // Check any execute bit

    if (!isExecutable) {
      validation.valid = false;
      validation.errors.push(
        `Hook not executable: ${hookPath}\n` +
        `  Run: chmod +x ${hookPath}`
      );
    }
  } catch (error) {
    validation.valid = false;
    validation.errors.push(`Failed to check permissions: ${error.message}`);
  }

  // 3. Check .sh extension
  if (!hookPath.endsWith('.sh')) {
    validation.valid = false;
    validation.errors.push(
      `Hook must be a shell script (.sh): ${hookPath}`
    );
  }

  return validation;
}
```

#### HookValidation Type

```typescript
interface HookValidation {
  /** Whether hook is valid */
  valid: boolean;

  /** Validation error messages */
  errors: string[];
}
```

**Validation Failure Behavior**:
- Log validation errors as warnings
- Skip hook execution
- Continue with remaining operations (non-fatal)

---

## Hook Execution

### Execute Single Hook

```typescript
/**
 * Execute a hook script
 * 
 * @param hookPath - Path to hook script
 * @param context - Hook execution context
 * @param options - Execution options
 * @returns Hook execution result
 */
async function executeHook(
  hookPath: string,
  context: HookContext,
  options: HookExecutionOptions = {}
): Promise<HookResult> {
  const startTime = Date.now();
  const hookType = path.basename(hookPath, '.sh') as HookType;

  // 1. Validate hook
  const validation = await validateHook(hookPath);
  if (!validation.valid) {
    return {
      hook: hookType,
      success: false,
      exit_code: -1,
      output: validation.errors.join('\n'),
      duration_ms: Date.now() - startTime,
    };
  }

  // 2. Build environment
  const env = buildHookEnvironment(context);

  // 3. Execute hook with timeout
  const timeout = options.timeout || 300000; // 5 minutes default

  try {
    const proc = Bun.spawn([hookPath], {
      cwd: context.repos_dir,
      env,
      stdout: 'pipe',
      stderr: 'pipe',
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      proc.kill();
    }, timeout);

    // Stream output if verbose
    if (options.verbose) {
      streamOutput(proc.stdout, `[${hookType}]`);
      streamOutput(proc.stderr, `[${hookType}]`);
    }

    // Wait for completion
    const exitCode = await proc.exited;
    clearTimeout(timeoutId);

    // Collect output
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const output = `${stdout}\n${stderr}`.trim();

    return {
      hook: hookType,
      success: exitCode === 0,
      exit_code: exitCode,
      output,
      duration_ms: Date.now() - startTime,
    };

  } catch (error) {
    return {
      hook: hookType,
      success: false,
      exit_code: -1,
      output: error.message,
      duration_ms: Date.now() - startTime,
    };
  }
}
```

#### HookExecutionOptions

```typescript
interface HookExecutionOptions {
  /** Timeout in milliseconds (default: 300000 = 5 minutes) */
  timeout?: number;

  /** Stream output to console during execution */
  verbose?: boolean;
}
```

---

## Environment Variables

### Hook Context

Arashi passes context to hooks via environment variables.

```typescript
/**
 * Build environment variables for hook execution
 * 
 * @param context - Hook context
 * @returns Environment variables
 */
function buildHookEnvironment(context: HookContext): Record<string, string> {
  const env = { ...process.env };

  // Arashi-specific variables
  env.ARASHI_COMMAND = context.command;
  env.ARASHI_REPOS_DIR = context.repos_dir;
  env.ARASHI_REPO_LIST = context.repo_list;

  // Optional context (may be undefined)
  if (context.branch) {
    env.ARASHI_BRANCH = context.branch;
  }

  if (context.worktree_path) {
    env.ARASHI_WORKTREE_PATH = context.worktree_path;
  }

  return env;
}
```

### Environment Variable Reference

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `ARASHI_COMMAND` | string | Command being executed | `"create"`, `"remove"`, `"setup"` |
| `ARASHI_BRANCH` | string? | Target branch name (if applicable) | `"feature-auth"` |
| `ARASHI_WORKTREE_PATH` | string? | Worktree base path (if applicable) | `"/Users/dev/feature-auth"` |
| `ARASHI_REPOS_DIR` | string | Absolute path to repos directory | `"/Users/dev/project/repos"` |
| `ARASHI_REPO_LIST` | string | Comma-separated list of repository names | `"backend,frontend,docs"` |

### Example Hook Script

```bash
#!/usr/bin/env bash
# .arashi/hooks/pre-create.sh

set -e

echo "Running pre-create hook"
echo "Command: $ARASHI_COMMAND"
echo "Branch: $ARASHI_BRANCH"
echo "Repos: $ARASHI_REPO_LIST"

# Example: Check for uncommitted changes in main repos
cd "$ARASHI_REPOS_DIR"
for repo in ${ARASHI_REPO_LIST//,/ }; do
  echo "Checking $repo for uncommitted changes..."
  cd "$repo"
  if ! git diff-index --quiet HEAD --; then
    echo "Warning: $repo has uncommitted changes"
  fi
  cd "$ARASHI_REPOS_DIR"
done

echo "Pre-create hook completed"
```

---

## Hook Execution Order

### Global Hook Execution

For `arashi create <branch>`:

```typescript
async function executeCreateWithHooks(
  branch: string,
  config: ArashiConfig,
  options: CreateOptions
): Promise<void> {
  // Skip all hooks if --no-hooks flag
  if (options.no_hooks) {
    return executeCreate(branch, config, options);
  }

  const projectRoot = await findGitRoot();
  const hooks = await discoverHooks(projectRoot);

  // Build hook context
  const context: HookContext = {
    command: 'create',
    branch,
    worktree_path: options.path || `../${branch}`,
    repos_dir: path.join(projectRoot, config.repos_dir),
    repo_list: Object.keys(config.discovered_repos).join(','),
  };

  // 1. Execute pre-create hook
  if (hooks.has('pre-create')) {
    const result = await executeHook(
      hooks.get('pre-create')!,
      context,
      { verbose: options.verbose }
    );
    logHookResult(result);

    // Pre-create failure is non-fatal (warn but continue)
    if (!result.success) {
      console.warn(`⚠ pre-create hook failed (exit code ${result.exit_code})`);
      console.warn(`  Continuing with worktree creation...`);
    }
  }

  // 2. Execute core worktree creation
  await executeCreate(branch, config, options);

  // 3. Execute post-create hook
  if (hooks.has('post-create')) {
    const result = await executeHook(
      hooks.get('post-create')!,
      context,
      { verbose: options.verbose }
    );
    logHookResult(result);

    // Post-create failure is non-fatal
    if (!result.success) {
      console.warn(`⚠ post-create hook failed (exit code ${result.exit_code})`);
    }
  }

  // 4. Setup scripts executed by orchestration (see D5)
}
```

### Setup Script Execution

Setup scripts (`.arashi-setup.sh`) are executed per repository after worktree creation. See D5 (Worktree Orchestration) for detailed setup execution logic.

**Key Points**:
- Executed in worktree directory
- Sequential or parallel (based on `--parallel` flag)
- Non-fatal failures (warn but continue)
- Same environment variables as global hooks

---

## Timeout and Failure Handling

### Timeout Behavior

Hooks are terminated if they exceed the timeout.

```typescript
const DEFAULT_HOOK_TIMEOUT = 300000; // 5 minutes

async function executeHookWithTimeout(
  hookPath: string,
  context: HookContext,
  timeout: number = DEFAULT_HOOK_TIMEOUT
): Promise<HookResult> {
  const proc = Bun.spawn([hookPath], { /* ... */ });

  // Kill process after timeout
  const timeoutId = setTimeout(() => {
    proc.kill('SIGTERM');
    
    // Force kill after 5 seconds
    setTimeout(() => {
      proc.kill('SIGKILL');
    }, 5000);
  }, timeout);

  try {
    const exitCode = await proc.exited;
    clearTimeout(timeoutId);
    return { /* result */ };
  } catch (error) {
    return {
      hook: hookType,
      success: false,
      exit_code: -1,
      output: `Hook timed out after ${timeout}ms`,
      duration_ms: timeout,
    };
  }
}
```

**Timeout Handling**:
1. Send SIGTERM (graceful shutdown)
2. Wait 5 seconds
3. Send SIGKILL (force kill)
4. Log timeout error
5. Continue with remaining operations

---

### Failure Handling

All hook failures are **non-fatal** (warn but continue).

**Rationale**:
- Hooks are user customizations, not core requirements
- Hook failures shouldn't break core functionality
- User can fix and re-run manually

**Failure Types**:

| Failure Type | Behavior | User Message |
|--------------|----------|--------------|
| Validation failed | Skip hook, log warning | "Hook not executable" |
| Timeout | Kill process, log warning | "Hook timed out after 5m" |
| Non-zero exit | Log warning with output | "Hook failed (exit code 1)" |
| Script not found | Skip hook, no warning | (Silent - hook is optional) |

**Example Output**:
```
Running pre-create hook...
✗ pre-create hook failed (exit code 1, 2.3s)
  Output:
    Error: API server not running
    Please start the API server before creating worktrees
  
⚠ Continuing with worktree creation...
```

---

## Output Capture and Display

### Output Streaming

Hook output can be streamed to console in verbose mode.

```typescript
async function streamOutput(
  stream: ReadableStream<Uint8Array>,
  prefix: string
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.trim()) {
        console.log(`${prefix} ${line}`);
      }
    }
  }
}
```

**Output Modes**:

1. **Default Mode** (not verbose):
   - Show hook status (✓ success, ✗ failure)
   - Show duration
   - Show output only on failure

2. **Verbose Mode** (`-v` flag):
   - Stream output live with prefix
   - Show all output (stdout + stderr)
   - Show duration and exit code

**Example (Default)**:
```
Running pre-create hook...
✓ pre-create hook completed (1.2s)

Creating worktrees...
```

**Example (Verbose)**:
```
Running pre-create hook...
[pre-create] Checking repository status...
[pre-create] ✓ backend: clean
[pre-create] ✓ frontend: clean
[pre-create] All checks passed
✓ pre-create hook completed (1.2s)
```

---

## --no-hooks Flag

### Behavior

The `--no-hooks` flag skips all hook execution.

```typescript
interface CreateOptions {
  // ... other options ...
  
  /** Skip all hook execution (default: false) */
  no_hooks?: boolean;
}
```

**Usage**:
```bash
# Skip all hooks
arashi create feature-auth --no-hooks

# Skip hooks and setup
arashi create feature-auth --no-hooks --no-setup
```

**When to Use**:
- Hook scripts are broken/failing
- Testing core functionality
- CI/CD environments (no interactive prompts)
- Quick worktree creation

**What Gets Skipped**:
- `pre-create.sh`
- `post-create.sh`
- `.arashi-setup.sh` (if `--no-setup` also provided)

**Note**: `--no-hooks` does NOT skip setup scripts. Use `--no-setup` for that.

---

## Hook Discovery Summary

### Discovery Algorithm

1. **Global Hooks**:
   - Search: `.arashi/hooks/pre-create.sh`, `.arashi/hooks/post-create.sh`
   - Timing: Once at command start
   - Validation: Check existence, execute permission

2. **Setup Scripts**:
   - Search: `<repos_dir>/<repo>/.arashi-setup.sh`
   - Timing: During `arashi init` and `arashi add`
   - Cached: Stored in `config.json` `discovered_repos[].has_setup_script`

### Hook Lifecycle

```
Command Start
     │
     ▼
Discover Hooks (.arashi/hooks/*.sh)
     │
     ▼
Validate Hooks (executable, .sh extension)
     │
     ▼
Execute pre-create (if exists, not skipped)
     │
     ▼
Core Operations (worktree creation)
     │
     ▼
Execute post-create (if exists, not skipped)
     │
     ▼
Execute setup scripts (if has_setup_script=true, not skipped)
     │
     ▼
Command Complete
```

---

## Design Decisions

### Decision: Non-Fatal Hook Failures

**Choice**: Hook failures are warnings, not errors

**Rationale**:
- Hooks are optional user customizations
- Core functionality should not depend on hooks
- User can fix and re-run manually
- Better UX (doesn't break workflows)

**Alternatives Considered**:
- Fatal failures: Rejected (breaks users with faulty hooks)
- Silent failures: Rejected (user won't know hooks failed)

**Consequences**:
- Users must check hook output for failures
- Core operations always complete (unless core error)

---

### Decision: Environment Variables for Context

**Choice**: Pass context via environment variables (not arguments)

**Rationale**:
- Shell-agnostic (works with bash, zsh, fish)
- Standard pattern (npm, git, docker use env vars)
- Easy to access in scripts (`$ARASHI_BRANCH`)
- No need for complex argument parsing

**Alternatives Considered**:
- CLI arguments: Rejected (requires parsing in hook)
- JSON file: Rejected (requires jq or similar)
- stdin: Rejected (harder to access)

**Consequences**:
- Limited to string data (no nested objects)
- Environment variable names must be stable (part of API)

---

### Decision: 5-Minute Default Timeout

**Choice**: Timeout hooks after 5 minutes (300 seconds)

**Rationale**:
- Most hooks complete in seconds
- Allows for slow operations (npm install, docker build)
- Prevents infinite loops/hangs
- Can be increased in future if needed

**Alternatives Considered**:
- No timeout: Rejected (risk of infinite hangs)
- 1 minute: Rejected (too short for complex setups)
- Configurable: Deferred (can add in future)

**Consequences**:
- Very slow operations may timeout
- Users must optimize hook scripts

---

### Decision: Execute Permission Required

**Choice**: Hooks must have +x execute permission

**Rationale**:
- Security: Prevents accidental execution of non-scripts
- Explicit intent: User must consciously enable hook
- POSIX standard for executable files

**Alternatives Considered**:
- Execute all .sh files: Rejected (security risk)
- Check shebang only: Rejected (insufficient)

**Consequences**:
- Users must remember `chmod +x`
- Clear error message if permission missing

---

### Decision: Shell Scripts Only (.sh)

**Choice**: Hooks must be shell scripts with .sh extension

**Rationale**:
- Universal: Shell available on all platforms
- Simple: No additional runtime dependencies
- Flexible: Can invoke any language from shell

**Alternatives Considered**:
- Support multiple languages: Rejected (complexity, dependencies)
- Platform-specific (.bat, .ps1): Rejected (cross-platform goal)

**Consequences**:
- Non-shell hooks must be wrapped in .sh script
- Consistent shebang needed for cross-platform (#!/usr/bin/env bash)

---

## Implementation Notes

### Hook Script Best Practices

**Shebang**:
```bash
#!/usr/bin/env bash
# Use env to find bash (more portable)
```

**Error Handling**:
```bash
set -e  # Exit on error
set -u  # Error on undefined variable
set -o pipefail  # Error on pipe failure
```

**Logging**:
```bash
echo "Starting operation..."
echo "✓ Step completed"
echo "✗ Step failed" >&2  # stderr for errors
```

**Exit Codes**:
```bash
exit 0  # Success
exit 1  # General error
exit 2  # User abort (reserved for Arashi)
```

### Cross-Platform Considerations

**Line Endings**:
- Use LF (Unix) line endings, not CRLF (Windows)
- Git can handle: `.gitattributes` with `*.sh text eol=lf`

**Path Separators**:
- Use forward slashes in hooks (works on Windows)
- Bun normalizes paths automatically

**Shell Availability**:
- Windows: Requires Git Bash or WSL
- macOS/Linux: bash is standard

---

## References

- **GitHub Issue**: #12 (D6 Hook System Design)
- **Related Documents**:
  - D2: Type System (HookContext, HookResult, HookType)
  - D3: CLI Commands (--no-hooks flag)
  - D5: Worktree Orchestration (setup script execution)
- **External Resources**:
  - [Git Hooks](https://git-scm.com/docs/githooks)
  - [npm Scripts](https://docs.npmjs.com/cli/v9/using-npm/scripts)
  - [Docker ENTRYPOINT](https://docs.docker.com/engine/reference/builder/#entrypoint)
- **Constitution Principles**:
  - Extensibility: Hooks provide customization without bloating core
  - User control: Hooks are optional, can be disabled
  - Cross-platform: Shell scripts work on all platforms
