# Testing Strategy for Arashi CLI

> Research document for testing a CLI tool with git dependencies using Bun's test runner

**Created**: 2026-02-03  
**Status**: Complete  
**Related**: specs/003-research-tasks

## Table of Contents

1. [Test Fixture Creation](#1-test-fixture-creation)
2. [Mocking Strategy](#2-mocking-strategy)
3. [Test Cleanup](#3-test-cleanup)
4. [Parallel Test Execution](#4-parallel-test-execution)
5. [Snapshot Testing](#5-snapshot-testing)
6. [CI/CD Testing](#6-cicd-testing)
7. [Performance Testing](#7-performance-testing)

---

## 1. Test Fixture Creation

### Overview

Creating temporary git repositories for tests requires isolated environments that can be reliably initialized and cleaned up. Bun provides the `tempDir` utility from the `harness` module specifically for this purpose.

### Recommended Pattern

**Basic Temporary Directory with Files:**

```typescript
import { test, expect } from "bun:test";
import { tempDir } from "harness";
import path from "node:path";

test("creates temp repo with files", () => {
  using dir = tempDir("arashi-test", {
    ".gitignore": "node_modules/\n*.log\n",
    "README.md": "# Test Repository\n",
    "package.json": JSON.stringify({ name: "test-repo", version: "1.0.0" }),
  });

  const dirPath = String(dir);
  expect(await Bun.file(path.join(dirPath, ".gitignore")).text()).toContain("node_modules");
});
```

**Initializing Git Repositories:**

```typescript
import { test, expect } from "bun:test";
import { tempDir, bunExe, bunEnv } from "harness";
import { $ } from "bun";

test("creates initialized git repository", async () => {
  // Create temp directory with initial files
  using dir = tempDir("arashi-git-test", {
    "README.md": "# Test Repo",
    ".gitignore": "node_modules/",
  });

  const dirPath = String(dir);

  // Initialize git repository
  await $`git init`.cwd(dirPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(dirPath).quiet();
  await $`git config user.name "Test User"`.cwd(dirPath).quiet();
  await $`git add .`.cwd(dirPath).quiet();
  await $`git commit -m "Initial commit"`.cwd(dirPath).quiet();

  // Verify git repo was created
  const result = await $`git rev-parse --git-dir`.cwd(dirPath).text();
  expect(result.trim()).toBe(".git");
});
```

**Multi-Repository Test Setup:**

```typescript
import { test, expect } from "bun:test";
import { tempDir } from "harness";
import { $ } from "bun";
import path from "node:path";

test("creates meta-repo with multiple sub-repos", async () => {
  // Create main repository
  using mainDir = tempDir("arashi-main", {
    ".arashi/config.json": JSON.stringify({
      version: "1.0.0",
      repos_dir: "repos",
      worktree_strategy: "same_branch",
      auto_setup: true,
      discovered_repos: {},
    }),
    "README.md": "# Main Repository",
  });

  const mainPath = String(mainDir);
  const reposPath = path.join(mainPath, "repos");

  // Initialize main repo
  await $`git init`.cwd(mainPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(mainPath).quiet();
  await $`git config user.name "Test User"`.cwd(mainPath).quiet();
  
  // Create repos directory
  await $`mkdir -p ${reposPath}`.quiet();

  // Create sub-repository 1
  const frontendPath = path.join(reposPath, "frontend");
  await $`mkdir -p ${frontendPath}`.quiet();
  await $`git init`.cwd(frontendPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(frontendPath).quiet();
  await $`git config user.name "Test User"`.cwd(frontendPath).quiet();
  
  using frontendFiles = tempDir("frontend-files", {
    "package.json": JSON.stringify({ name: "frontend" }),
  });
  await $`cp -r ${String(frontendFiles)}/* ${frontendPath}/`.quiet();
  await $`git add .`.cwd(frontendPath).quiet();
  await $`git commit -m "Initial frontend commit"`.cwd(frontendPath).quiet();

  // Create sub-repository 2
  const backendPath = path.join(reposPath, "backend");
  await $`mkdir -p ${backendPath}`.quiet();
  await $`git init`.cwd(backendPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(backendPath).quiet();
  await $`git config user.name "Test User"`.cwd(backendPath).quiet();
  
  using backendFiles = tempDir("backend-files", {
    "package.json": JSON.stringify({ name: "backend" }),
  });
  await $`cp -r ${String(backendFiles)}/* ${backendPath}/`.quiet();
  await $`git add .`.cwd(backendPath).quiet();
  await $`git commit -m "Initial backend commit"`.cwd(backendPath).quiet();

  // Verify structure
  expect(await Bun.file(path.join(frontendPath, ".git", "config")).exists()).toBe(true);
  expect(await Bun.file(path.join(backendPath, ".git", "config")).exists()).toBe(true);
});
```

### Best Practices for Test Fixtures

1. **Use `using` keyword**: The `using` keyword with `tempDir` ensures automatic cleanup via disposable resources
2. **Prefix test directories**: Use descriptive prefixes like `"arashi-test-"` to identify test directories
3. **Set git identity**: Always configure `user.email` and `user.name` to avoid CI failures
4. **Create minimal fixtures**: Only create the files and structure needed for the specific test
5. **Reusable fixture factories**: Create helper functions for common test setups

**Fixture Factory Example:**

```typescript
import { tempDir } from "harness";
import { $ } from "bun";
import path from "node:path";

interface GitRepoOptions {
  name: string;
  files?: Record<string, string>;
  initialCommit?: boolean;
}

async function createGitRepo(options: GitRepoOptions): Promise<string> {
  const { name, files = {}, initialCommit = true } = options;
  
  using dir = tempDir(name, files);
  const dirPath = String(dir);

  await $`git init`.cwd(dirPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(dirPath).quiet();
  await $`git config user.name "Test User"`.cwd(dirPath).quiet();

  if (initialCommit && Object.keys(files).length > 0) {
    await $`git add .`.cwd(dirPath).quiet();
    await $`git commit -m "Initial commit"`.cwd(dirPath).quiet();
  }

  return dirPath;
}

// Usage
test("uses factory to create repo", async () => {
  const repoPath = await createGitRepo({
    name: "test-repo",
    files: { "README.md": "# Test" },
    initialCommit: true,
  });

  const result = await $`git log --oneline`.cwd(repoPath).text();
  expect(result).toContain("Initial commit");
});
```

---

## 2. Mocking Strategy

### Decision: Use Real Git Commands in Isolated Repos

**Recommendation**: Use real git commands in isolated temporary repositories rather than mocking.

### Rationale

**Pros of Real Git:**
- ✅ Tests actual git behavior, not mocked approximations
- ✅ Catches real-world edge cases and git version differences
- ✅ No need to maintain complex mock implementations
- ✅ Tests verify actual integration with git binary
- ✅ More confidence in production behavior
- ✅ Simpler test code - no mock setup required

**Cons of Real Git:**
- ❌ Slightly slower tests (mitigated by parallel execution)
- ❌ Requires git binary in test environment (acceptable - it's a git tool)
- ❌ Tests may fail if git behavior changes across versions (good - we want to know!)

**When to Mock:**

Mock only for:
1. **External network calls** (GitHub API, remote git operations)
2. **User input prompts** (interactive selections)
3. **Long-running operations** in unit tests (setup scripts, npm install)
4. **System-level operations** that modify global state

### Mocking Patterns with Bun

**Mocking Modules:**

```typescript
import { test, expect, mock } from "bun:test";

// Mock an entire module
mock.module("./github-api.ts", () => ({
  fetchRepositoryInfo: mock(async (url: string) => ({
    defaultBranch: "main",
    name: "test-repo",
  })),
}));

test("uses mocked GitHub API", async () => {
  const { fetchRepositoryInfo } = await import("./github-api.ts");
  const info = await fetchRepositoryInfo("git@github.com:user/repo.git");
  expect(info.defaultBranch).toBe("main");
});
```

**Spying on Functions:**

```typescript
import { test, expect, spyOn, afterEach } from "bun:test";
import * as prompts from "./lib/prompts.ts";

afterEach(() => {
  mock.restore();
});

test("prompts user for confirmation", async () => {
  // Spy on prompt function
  const confirmSpy = spyOn(prompts, "confirm").mockResolvedValue(true);

  // Run code that uses prompts
  const result = await prompts.confirm("Continue?");

  expect(confirmSpy).toHaveBeenCalledWith("Continue?");
  expect(result).toBe(true);
});
```

**Mocking Child Process Execution (for testing CLI commands):**

```typescript
import { test, expect, mock } from "bun:test";
import { $ } from "bun";

test("mocks external command execution", async () => {
  // For unit tests where you don't want real git commands
  const execMock = mock(async (cmd: string) => {
    if (cmd.includes("git worktree list")) {
      return {
        stdout: "main /path/to/main\nfeature /path/to/feature",
        exitCode: 0,
      };
    }
    return { stdout: "", exitCode: 0 };
  });

  // Use mock in test
  const output = await execMock("git worktree list");
  expect(output.stdout).toContain("main");
});
```

### Integration Test Pattern (No Mocking)

```typescript
import { test, expect } from "bun:test";
import { tempDir } from "harness";
import { $ } from "bun";

test("creates worktree using real git", async () => {
  using dir = tempDir("arashi-worktree-test", {
    "README.md": "# Test",
  });

  const repoPath = String(dir);

  // Real git operations
  await $`git init`.cwd(repoPath).quiet();
  await $`git config user.email "test@example.com"`.cwd(repoPath).quiet();
  await $`git config user.name "Test User"`.cwd(repoPath).quiet();
  await $`git add .`.cwd(repoPath).quiet();
  await $`git commit -m "Initial commit"`.cwd(repoPath).quiet();

  // Create worktree
  const worktreePath = `${repoPath}-feature`;
  await $`git worktree add ${worktreePath} -b feature-branch`.cwd(repoPath).quiet();

  // Verify worktree exists
  const worktrees = await $`git worktree list`.cwd(repoPath).text();
  expect(worktrees).toContain(worktreePath);
  expect(worktrees).toContain("feature-branch");
});
```

---

## 3. Test Cleanup

### Recommended Pattern: afterEach Hooks

Bun's `tempDir` with the `using` keyword provides automatic cleanup, but `afterEach` hooks are still useful for resetting mocks and clearing shared state.

### Automatic Cleanup with `using`

```typescript
import { test, expect } from "bun:test";
import { tempDir } from "harness";

test("automatically cleans up temp directory", () => {
  using dir = tempDir("auto-cleanup-test", {
    "file.txt": "content",
  });

  // Directory exists during test
  const dirPath = String(dir);
  expect(await Bun.file(`${dirPath}/file.txt`).exists()).toBe(true);

  // After test completes, directory is automatically deleted
});
```

### Manual Cleanup with afterEach

```typescript
import { test, expect, afterEach, mock } from "bun:test";

afterEach(() => {
  // Restore all mocked functions
  mock.restore();
  
  // Clear all mock call history
  mock.clearAllMocks();
});

test("uses mocks that are cleaned up", () => {
  const mockFn = mock(() => "result");
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);
  
  // afterEach will clean up mock state
});

test("starts with clean mock state", () => {
  const mockFn = mock(() => "result");
  // Mock call count starts at 0 due to afterEach cleanup
  expect(mockFn).toHaveBeenCalledTimes(0);
});
```

### Cleanup for Persistent State

```typescript
import { test, expect, beforeEach, afterEach } from "bun:test";
import fs from "node:fs";
import path from "node:path";

let testArtifacts: string[] = [];

afterEach(async () => {
  // Clean up any artifacts created during test
  for (const artifact of testArtifacts) {
    if (await Bun.file(artifact).exists()) {
      await fs.promises.rm(artifact, { recursive: true, force: true });
    }
  }
  testArtifacts = [];
});

test("tracks and cleans up artifacts", async () => {
  const tempFile = path.join("/tmp", "test-artifact.txt");
  testArtifacts.push(tempFile);
  
  await Bun.write(tempFile, "test content");
  expect(await Bun.file(tempFile).exists()).toBe(true);
  
  // afterEach will clean up
});
```

### Best Practices for Cleanup

1. **Use `using` for temp directories**: Automatic cleanup via disposable resources
2. **Restore mocks in afterEach**: Prevents test interference
3. **Track artifacts**: Keep array of created resources for cleanup
4. **Fail-safe cleanup**: Use `try-catch` in cleanup code to prevent cascade failures
5. **Verify cleanup**: Add tests that verify cleanup occurs correctly

**Robust Cleanup Example:**

```typescript
import { test, expect, afterEach } from "bun:test";

let cleanupTasks: Array<() => Promise<void>> = [];

afterEach(async () => {
  // Run all cleanup tasks, even if some fail
  const results = await Promise.allSettled(
    cleanupTasks.map(task => task())
  );
  
  // Log any cleanup failures (but don't fail the test)
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.warn(`Cleanup task ${index} failed:`, result.reason);
    }
  });
  
  cleanupTasks = [];
  mock.restore();
});

test("registers cleanup tasks", async () => {
  const tempFile = "/tmp/test-file.txt";
  
  // Register cleanup
  cleanupTasks.push(async () => {
    await fs.promises.rm(tempFile, { force: true });
  });
  
  await Bun.write(tempFile, "content");
  // afterEach will clean up
});
```

---

## 4. Parallel Test Execution

### Overview

Parallel test execution significantly reduces test suite runtime but requires careful isolation to prevent tests from interfering with each other.

### Bun's Parallel Testing Capabilities

**Default Behavior:**
- Tests run sequentially by default within a file
- Multiple test files run in parallel

**Explicit Parallel Execution:**

```typescript
import { test, expect } from "bun:test";

// Run tests concurrently within the same file
test.concurrent("parallel test 1", async () => {
  await fetch("/api/endpoint1");
  expect(true).toBe(true);
});

test.concurrent("parallel test 2", async () => {
  await fetch("/api/endpoint2");
  expect(true).toBe(true);
});
```

**CLI Flags:**

```bash
# Run all tests concurrently within files
bun test --concurrent

# Limit concurrent test execution
bun test --concurrent --max-concurrency 4
```

### Ensuring Test Isolation for Parallel Execution

**Key Principle**: Each test must have its own isolated temporary directory.

**Isolated Temp Directories:**

```typescript
import { test, expect } from "bun:test";
import { tempDir } from "harness";
import { $ } from "bun";

// ✅ GOOD: Each test has its own temp directory
test.concurrent("parallel git test 1", async () => {
  using dir1 = tempDir("parallel-test-1", {
    "README.md": "# Test 1",
  });

  await $`git init`.cwd(String(dir1)).quiet();
  // Test 1 operations...
});

test.concurrent("parallel git test 2", async () => {
  using dir2 = tempDir("parallel-test-2", {
    "README.md": "# Test 2",
  });

  await $`git init`.cwd(String(dir2)).quiet();
  // Test 2 operations...
});
```

**Avoiding Shared State:**

```typescript
// ❌ BAD: Shared state between tests
let sharedCounter = 0;

test.concurrent("bad test 1", () => {
  sharedCounter++;
  expect(sharedCounter).toBe(1); // May fail due to race condition
});

test.concurrent("bad test 2", () => {
  sharedCounter++;
  expect(sharedCounter).toBe(1); // May fail due to race condition
});

// ✅ GOOD: No shared state
test.concurrent("good test 1", () => {
  const localCounter = 1;
  expect(localCounter).toBe(1);
});

test.concurrent("good test 2", () => {
  const localCounter = 1;
  expect(localCounter).toBe(1);
});
```

### Using Sequential Tests When Necessary

```typescript
import { test, expect } from "bun:test";

// Mark tests as serial when they must run sequentially
test.serial("must run first", async () => {
  // Setup that other tests depend on
});

test.serial("must run second", async () => {
  // Uses setup from previous test
});

// These can still run in parallel with each other
test.concurrent("independent test 1", async () => {});
test.concurrent("independent test 2", async () => {});
```

### Parallel Test Performance Considerations

**When to Use Parallel Tests:**
- ✅ Integration tests with isolated temp repos
- ✅ Tests that make independent API calls
- ✅ Tests with no shared state
- ✅ Long-running operations (git clone, npm install in isolated dirs)

**When to Use Sequential Tests:**
- ⚠️ Tests that modify global configuration
- ⚠️ Tests that use the same database
- ⚠️ Tests with shared file system state
- ⚠️ Tests that must run in specific order

### Test Organization for Parallelism

```
tests/
├── unit/                      # Fast, parallel-safe unit tests
│   ├── config.test.ts        # Pure functions, no side effects
│   ├── git.test.ts           # Git command wrappers with temp dirs
│   └── filesystem.test.ts    # Filesystem utilities with temp dirs
├── integration/               # Parallel integration tests
│   ├── init.test.ts          # Each test has own temp repo
│   ├── create.test.ts        # Each test has own temp repo
│   └── remove.test.ts        # Each test has own temp repo
└── e2e/                       # Sequential end-to-end tests
    └── full-workflow.test.ts  # May need sequential execution
```

**Example Test File Structure:**

```typescript
// tests/integration/create.test.ts
import { test, expect, describe } from "bun:test";
import { tempDir } from "harness";

describe("arashi create command", () => {
  // All tests can run in parallel - each has isolated state
  
  test.concurrent("creates worktree with same branch name", async () => {
    using dir = tempDir("create-test-1", {});
    // Test implementation...
  });

  test.concurrent("creates worktree with custom path", async () => {
    using dir = tempDir("create-test-2", {});
    // Test implementation...
  });

  test.concurrent("handles branch conflicts", async () => {
    using dir = tempDir("create-test-3", {});
    // Test implementation...
  });
});
```

---

## 5. Snapshot Testing

### Overview

Snapshot testing captures CLI output and compares it to saved snapshots. For CLI tools with colored output, ANSI escape codes must be stripped for reliable comparisons.

### Bun's Snapshot Testing

**Basic Snapshot Test:**

```typescript
import { test, expect } from "bun:test";

test("snapshot test", () => {
  const data = { users: [{ name: "Alice" }] };
  expect(data).toMatchSnapshot();
});
```

### Stripping ANSI Colors

Bun provides `Bun.stripANSI()` to remove ANSI escape codes from strings.

**Stripping Colors for Snapshot Testing:**

```typescript
import { test, expect } from "bun:test";
import { Bun } from "bun";

test("snapshot CLI output without colors", async () => {
  // Simulated CLI output with colors
  const coloredOutput = "\u001b[32m✓\u001b[0m Successfully created worktree\n\u001b[33m⚠\u001b[0m Warning: Branch already exists";

  // Strip ANSI codes before snapshot comparison
  const plainOutput = Bun.stripANSI(coloredOutput);

  expect(plainOutput).toMatchSnapshot();
  // Snapshot will be:
  // "✓ Successfully created worktree
  //  ⚠ Warning: Branch already exists"
});
```

### Testing CLI Commands with Snapshot Output

**Full CLI Test with Output Capture:**

```typescript
import { test, expect } from "bun:test";
import { tempDir, bunExe, bunEnv } from "harness";
import path from "node:path";

test("arashi init command output", async () => {
  using dir = tempDir("arashi-init-test", {});

  // Spawn Bun process running CLI command
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

  // Strip ANSI colors from output
  const plainStdout = Bun.stripANSI(stdout);

  // Snapshot test
  expect(plainStdout).toMatchSnapshot();

  // Assert exit code last for better error messages
  expect(exitCode).toBe(0);
});
```

### Inline Snapshots for Readability

```typescript
import { test, expect } from "bun:test";
import { normalizeBunSnapshot } from "harness";

test("inline snapshot with normalized output", async () => {
  const output = "\u001b[32m✓\u001b[0m Created .arashi/ directory";
  const plainOutput = Bun.stripANSI(output);

  expect(plainOutput).toMatchInlineSnapshot(`"✓ Created .arashi/ directory"`);
});
```

### Normalizing Output with `normalizeBunSnapshot`

For complex output that may contain file paths, `normalizeBunSnapshot` normalizes paths and other variable content.

```typescript
import { test, expect } from "bun:test";
import { tempDir, bunExe, bunEnv, normalizeBunSnapshot } from "harness";

test("normalized snapshot test", async () => {
  using dir = tempDir("normalize-test", {
    "index.ts": `console.log("Hello from", process.cwd());`,
  });

  await using proc = Bun.spawn({
    cmd: [bunExe(), "index.ts"],
    env: bunEnv,
    cwd: String(dir),
    stdout: "pipe",
  });

  const stdout = await proc.stdout.text();

  // Normalize output to replace temp dir paths
  expect(normalizeBunSnapshot(stdout, dir)).toMatchInlineSnapshot(`"Hello from [dir]"`);
});
```

### Best Practices for Snapshot Testing

1. **Strip ANSI codes**: Always use `Bun.stripANSI()` for CLI output
2. **Normalize paths**: Use `normalizeBunSnapshot()` to replace temp directory paths
3. **Use inline snapshots**: For small, readable output
4. **Use file snapshots**: For large output (e.g., full help text)
5. **Review snapshot changes**: Carefully review snapshot updates in PRs
6. **Avoid timestamps**: Strip or normalize timestamps in output
7. **Test exit codes separately**: Assert stdout/stderr before exit code

**Comprehensive CLI Test Example:**

```typescript
import { test, expect, describe } from "bun:test";
import { tempDir, bunExe, bunEnv } from "harness";

describe("arashi CLI output", () => {
  test("init command success output", async () => {
    using dir = tempDir("arashi-init-success", {});

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

    // Strip colors
    const plainStdout = Bun.stripANSI(stdout);
    const plainStderr = Bun.stripANSI(stderr);

    // Snapshot assertions
    expect(plainStdout).toMatchInlineSnapshot(`
      "✓ Detected git repository
      ✓ Created .arashi/ directory
      ✓ Generated config.json
      ✓ Created repos/ directory
      ✓ Updated .gitignore

      Arashi initialized successfully!
      Run 'arashi add <git-url>' to add repositories."
    `);

    expect(plainStderr).toBe("");
    expect(exitCode).toBe(0);
  });

  test("init command error output", async () => {
    using dir = tempDir("arashi-init-error", {});
    // Don't initialize git - should fail

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

    const plainStderr = Bun.stripANSI(stderr);

    expect(plainStderr).toMatchInlineSnapshot(`
      "✗ Error: Not a git repository
      Please run 'git init' first or run arashi in an existing git repository."
    `);

    expect(exitCode).toBe(1);
  });
});
```

---

## 6. CI/CD Testing

### Overview

Cross-platform testing ensures the CLI works correctly on all target operating systems. GitHub Actions matrix builds enable efficient parallel testing across platforms.

### GitHub Actions Matrix Strategy

**Basic Matrix Configuration:**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        bun-version: ["1.3.8"]
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: ${{ matrix.bun-version }}
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test
```

### Complete CI/CD Configuration

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Install dependencies
        run: bun install
      
      - name: Run linter
        run: bun run lint
      
      - name: Type check
        run: bun run type-check

  test:
    name: Test (${{ matrix.os }})
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
      
      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest'
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  build:
    name: Build (${{ matrix.config.os }})
    needs: [lint, test]
    strategy:
      matrix:
        config:
          - os: ubuntu-latest
            target: bun-linux-x64
            artifact: arashi-linux-x64
          - os: macos-latest
            target: bun-darwin-arm64
            artifact: arashi-macos-arm64
          - os: windows-latest
            target: bun-windows-x64
            artifact: arashi-windows-x64.exe
    runs-on: ${{ matrix.config.os }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Install dependencies
        run: bun install
      
      - name: Build binary
        run: bun build src/index.ts --compile --target=${{ matrix.config.target }} --outfile dist/${{ matrix.config.artifact }}
      
      - name: Test binary
        run: ./dist/${{ matrix.config.artifact }} --version
        shell: bash
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.config.artifact }}
          path: dist/${{ matrix.config.artifact }}
          retention-days: 30
```

### Cross-Platform Test Considerations

**Git Configuration:**

All platforms need git identity configuration in CI:

```yaml
- name: Setup Git
  run: |
    git config --global user.email "ci@example.com"
    git config --global user.name "CI Bot"
```

**Path Handling:**

Use platform-agnostic path handling in tests:

```typescript
import path from "node:path";

// ✅ GOOD: Platform-agnostic
const configPath = path.join(repoPath, ".arashi", "config.json");

// ❌ BAD: Unix-only
const configPath = `${repoPath}/.arashi/config.json`;
```

**Shell Differences:**

Windows uses different shell syntax:

```yaml
# Use bash shell explicitly on all platforms
- name: Test binary
  run: ./dist/${{ matrix.config.artifact }} --version
  shell: bash
```

### Testing Binary Artifacts

**Validate Compiled Binaries:**

```yaml
- name: Validate binary
  run: |
    # Check binary exists
    test -f ./dist/${{ matrix.config.artifact }}
    
    # Check binary is executable
    chmod +x ./dist/${{ matrix.config.artifact }}
    
    # Run version check
    ./dist/${{ matrix.config.artifact }} --version
    
    # Run simple command
    ./dist/${{ matrix.config.artifact }} --help
  shell: bash
```

### Matrix Optimization

**Conditional Jobs:**

```yaml
test:
  strategy:
    matrix:
      os: [ubuntu-latest, macos-latest, windows-latest]
      include:
        # Only run coverage on Ubuntu
        - os: ubuntu-latest
          coverage: true
  
  steps:
    - name: Run tests with coverage
      if: matrix.coverage
      run: bun test --coverage
    
    - name: Run tests without coverage
      if: "!matrix.coverage"
      run: bun test
```

**Fail-Fast Strategy:**

```yaml
strategy:
  # Don't cancel all jobs if one fails
  fail-fast: false
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
```

### Release Workflow

**`.github/workflows/release.yml`:**

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release'
        required: true
        type: string

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test
      
      - name: Update version
        run: |
          bun run version ${{ github.event.inputs.version }}
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add package.json
          git commit -m "chore: release v${{ github.event.inputs.version }}"
          git tag "v${{ github.event.inputs.version }}"
          git push origin main --tags

  build-release:
    name: Build Release (${{ matrix.config.os }})
    needs: release
    strategy:
      matrix:
        config:
          - os: ubuntu-latest
            target: bun-linux-x64
            artifact: arashi-linux-x64
          - os: macos-latest
            target: bun-darwin-arm64
            artifact: arashi-macos-arm64
          - os: windows-latest
            target: bun-windows-x64
            artifact: arashi-windows-x64.exe
    runs-on: ${{ matrix.config.os }}
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: "v${{ github.event.inputs.version }}"
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Install dependencies
        run: bun install
      
      - name: Build binary
        run: bun build src/index.ts --compile --target=${{ matrix.config.target }} --outfile dist/${{ matrix.config.artifact }}
      
      - name: Upload to release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: "v${{ github.event.inputs.version }}"
          files: dist/${{ matrix.config.artifact }}
```

---

## 7. Performance Testing

### Overview

Performance testing measures operation times to ensure Arashi meets performance goals (e.g., < 30s for 5 repos). This involves benchmarking with varying repository counts and tracking metrics over time.

### Measuring Execution Time with Bun

**High-Precision Timing:**

```typescript
import { test, expect } from "bun:test";

test("measures operation time with Bun.nanoseconds", async () => {
  const startTime = Bun.nanoseconds();

  // Perform operation
  await someOperation();

  const endTime = Bun.nanoseconds();
  const durationMs = (endTime - startTime) / 1_000_000; // Convert to milliseconds

  console.log(`Operation took ${durationMs.toFixed(2)}ms`);
  expect(durationMs).toBeLessThan(1000); // Should complete in under 1 second
});
```

**Using performance.now():**

```typescript
import { test, expect } from "bun:test";

test("measures operation time with performance.now", async () => {
  const startTime = performance.now();

  await someOperation();

  const endTime = performance.now();
  const durationMs = endTime - startTime;

  expect(durationMs).toBeLessThan(1000);
});
```

### Performance Test Suite Structure

**`tests/performance/worktree-creation.perf.test.ts`:**

```typescript
import { test, expect, describe } from "bun:test";
import { tempDir } from "harness";
import { $ } from "bun";
import path from "node:path";

describe("worktree creation performance", () => {
  // Helper to create N repositories
  async function setupMultipleRepos(count: number) {
    using mainDir = tempDir(`perf-test-${count}`, {
      ".arashi/config.json": JSON.stringify({
        version: "1.0.0",
        repos_dir: "repos",
        worktree_strategy: "same_branch",
        auto_setup: false,
        discovered_repos: {},
      }),
    });

    const mainPath = String(mainDir);
    const reposPath = path.join(mainPath, "repos");

    // Initialize main repo
    await $`git init`.cwd(mainPath).quiet();
    await $`git config user.email "perf@test.com"`.cwd(mainPath).quiet();
    await $`git config user.name "Perf Test"`.cwd(mainPath).quiet();
    await $`mkdir -p ${reposPath}`.quiet();

    // Create N sub-repositories
    for (let i = 0; i < count; i++) {
      const repoPath = path.join(reposPath, `repo-${i}`);
      await $`mkdir -p ${repoPath}`.quiet();
      await $`git init`.cwd(repoPath).quiet();
      await $`git config user.email "perf@test.com"`.cwd(repoPath).quiet();
      await $`git config user.name "Perf Test"`.cwd(repoPath).quiet();
      
      await Bun.write(
        path.join(repoPath, "README.md"),
        `# Repository ${i}`
      );
      await $`git add .`.cwd(repoPath).quiet();
      await $`git commit -m "Initial commit"`.cwd(repoPath).quiet();
    }

    return mainPath;
  }

  test("creates worktrees for 1 repo", async () => {
    const repoPath = await setupMultipleRepos(1);
    const startTime = Bun.nanoseconds();

    // Run arashi create command
    await $`bun src/index.ts create feature-test`.cwd(repoPath).quiet();

    const endTime = Bun.nanoseconds();
    const durationMs = (endTime - startTime) / 1_000_000;

    console.log(`1 repo: ${durationMs.toFixed(2)}ms`);
    expect(durationMs).toBeLessThan(5000); // Should be under 5 seconds
  });

  test("creates worktrees for 5 repos", async () => {
    const repoPath = await setupMultipleRepos(5);
    const startTime = Bun.nanoseconds();

    await $`bun src/index.ts create feature-test`.cwd(repoPath).quiet();

    const endTime = Bun.nanoseconds();
    const durationMs = (endTime - startTime) / 1_000_000;

    console.log(`5 repos: ${durationMs.toFixed(2)}ms`);
    expect(durationMs).toBeLessThan(30000); // Goal: under 30 seconds
  });

  test("creates worktrees for 10 repos", async () => {
    const repoPath = await setupMultipleRepos(10);
    const startTime = Bun.nanoseconds();

    await $`bun src/index.ts create feature-test`.cwd(repoPath).quiet();

    const endTime = Bun.nanoseconds();
    const durationMs = (endTime - startTime) / 1_000_000;

    console.log(`10 repos: ${durationMs.toFixed(2)}ms`);
    expect(durationMs).toBeLessThan(60000); // Should scale linearly
  });
});
```

### Benchmarking Best Practices

1. **Warm-up runs**: Discard first run to account for cold starts
2. **Multiple iterations**: Run tests multiple times and average results
3. **Isolate measurements**: Only measure the operation being tested
4. **Use realistic data**: Test with repo sizes similar to production
5. **Track trends**: Store benchmark results over time
6. **CI thresholds**: Fail CI if performance degrades beyond threshold

**Advanced Benchmarking Pattern:**

```typescript
import { test, describe } from "bun:test";

describe("benchmark suite", () => {
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

    // Calculate statistics
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];

    console.log(`\n${name}:`);
    console.log(`  Average: ${avg.toFixed(2)}ms`);
    console.log(`  Median:  ${median.toFixed(2)}ms`);
    console.log(`  Min:     ${min.toFixed(2)}ms`);
    console.log(`  Max:     ${max.toFixed(2)}ms`);
  }

  test("benchmark worktree creation", async () => {
    await benchmark("Create 5 worktrees", async () => {
      // Setup and operation...
    });
  });
});
```

### Performance Regression Detection in CI

**`.github/workflows/benchmark.yml`:**

```yaml
name: Benchmark

on:
  pull_request:
  push:
    branches: [main]

jobs:
  benchmark:
    name: Performance Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
      
      - name: Install dependencies
        run: bun install
      
      - name: Run benchmarks
        run: bun test tests/performance --timeout 300000
      
      - name: Store benchmark results
        uses: benchmark-action/github-action-benchmark@v1
        with:
          tool: 'customBiggerIsBetter'
          output-file-path: benchmark-results.json
          github-token: ${{ secrets.GITHUB_TOKEN }}
          auto-push: true
          alert-threshold: '150%'
          comment-on-alert: true
          fail-on-alert: true
```

### Profiling Performance Bottlenecks

**Using Bun's Built-in Profiler:**

```bash
# Run with profiler
bun --inspect src/index.ts create feature-test

# Generate CPU profile
bun --cpu-prof src/index.ts create feature-test
```

**Instrumenting Code for Profiling:**

```typescript
function profileSection(name: string) {
  const start = Bun.nanoseconds();
  return {
    end: () => {
      const duration = (Bun.nanoseconds() - start) / 1_000_000;
      console.log(`[PROFILE] ${name}: ${duration.toFixed(2)}ms`);
    },
  };
}

// Usage
async function createWorktrees() {
  const totalProfile = profileSection("Total operation");

  const fetchProfile = profileSection("Fetch repos");
  await fetchAllRepos();
  fetchProfile.end();

  const createProfile = profileSection("Create worktrees");
  await createAllWorktrees();
  createProfile.end();

  totalProfile.end();
}
```

---

## Summary

### Key Takeaways

1. **Test Fixtures**: Use `tempDir` with `using` keyword for automatic cleanup of temporary git repositories
2. **Mocking Strategy**: Prefer real git commands in isolated repos; mock only external APIs and user input
3. **Test Cleanup**: Rely on `using` for temp directories; use `afterEach` for mocks and shared state
4. **Parallel Execution**: Use `test.concurrent` with isolated temp directories for faster test runs
5. **Snapshot Testing**: Always strip ANSI codes with `Bun.stripANSI()` for reliable CLI output comparisons
6. **CI/CD**: Use GitHub Actions matrix builds to test cross-platform binaries on all target OSes
7. **Performance Testing**: Use `Bun.nanoseconds()` for precise timing; benchmark with realistic repo counts

### Test Suite Organization

```
tests/
├── unit/                          # Fast unit tests, run in parallel
│   ├── config.test.ts
│   ├── git.test.ts
│   └── filesystem.test.ts
├── integration/                   # Integration tests with real git
│   ├── init.test.ts
│   ├── create.test.ts
│   ├── remove.test.ts
│   └── setup.test.ts
├── e2e/                          # End-to-end workflow tests
│   └── full-workflow.test.ts
└── performance/                  # Performance benchmarks
    └── worktree-creation.perf.test.ts
```

### Running Tests

```bash
# Run all tests
bun test

# Run tests in parallel
bun test --concurrent

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/integration/create.test.ts

# Run tests matching pattern
bun test -t "create worktree"

# Run performance tests
bun test tests/performance
```

### CI/CD Commands

```bash
# Lint
bun run lint

# Type check
bun run type-check

# Run all tests
bun test --concurrent

# Build for current platform
bun build src/index.ts --compile --outfile dist/arashi

# Build for all platforms (requires platform-specific runners)
bun build src/index.ts --compile --target=bun-linux-x64 --outfile dist/arashi-linux-x64
bun build src/index.ts --compile --target=bun-darwin-arm64 --outfile dist/arashi-macos-arm64
bun build src/index.ts --compile --target=bun-windows-x64 --outfile dist/arashi-windows-x64.exe
```

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-03  
**Status**: Complete
