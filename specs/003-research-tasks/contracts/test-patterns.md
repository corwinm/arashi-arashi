# Test Patterns Contract

## Overview

This document defines testing patterns, fixture interfaces, cleanup strategies, snapshot conventions, and CI/CD configurations for the arashi-arashi project.

## Version

Contract Version: 1.0.0  
Last Updated: 2026-02-03

---

## Testing Philosophy

1. **Comprehensive**: Test all code paths and edge cases
2. **Isolated**: Tests should not depend on each other
3. **Fast**: Unit tests should run in milliseconds
4. **Reliable**: Tests should be deterministic
5. **Maintainable**: Tests should be easy to understand and update

---

## Test Structure

### Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── cli/                # CLI command tests
│   ├── git/                # Git operations tests
│   ├── config/             # Configuration tests
│   ├── error/              # Error handling tests
│   └── utils/              # Utility function tests
├── integration/            # Integration tests
│   ├── workflows/          # Complete workflow tests
│   ├── git-integration/    # Real git command tests
│   └── filesystem/         # Filesystem interaction tests
├── e2e/                    # End-to-end tests
│   └── cli-scenarios/      # Full CLI scenario tests
├── fixtures/               # Test fixtures and data
│   ├── configs/            # Sample configurations
│   ├── repositories/       # Git repository templates
│   └── mocks/              # Mock data
└── helpers/                # Test helper functions
    ├── git-setup.ts        # Git test setup
    ├── cleanup.ts          # Cleanup utilities
    └── assertions.ts       # Custom assertions
```

---

## Test Fixtures

### Fixture Interface

```typescript
/**
 * Test fixture interface
 * 
 * Provides isolated test environment with automatic cleanup
 */
interface TestFixture {
  /**
   * Unique fixture ID
   */
  id: string;
  
  /**
   * Fixture root directory
   */
  root: string;
  
  /**
   * Git repository (if fixture includes git)
   */
  repo?: GitRepository;
  
  /**
   * Cleanup function
   */
  cleanup: () => Promise<void>;
  
  /**
   * Get absolute path within fixture
   */
  resolve: (...paths: string[]) => string;
  
  /**
   * Write file to fixture
   */
  writeFile: (path: string, content: string) => Promise<void>;
  
  /**
   * Read file from fixture
   */
  readFile: (path: string) => Promise<string>;
  
  /**
   * Check if file exists
   */
  exists: (path: string) => Promise<boolean>;
}

/**
 * Git repository fixture
 */
interface GitRepository {
  /**
   * Repository root path
   */
  root: string;
  
  /**
   * Create a commit
   */
  commit: (message: string, files?: Record<string, string>) => Promise<string>;
  
  /**
   * Create a branch
   */
  branch: (name: string, base?: string) => Promise<void>;
  
  /**
   * Checkout branch
   */
  checkout: (branch: string) => Promise<void>;
  
  /**
   * Create a tag
   */
  tag: (name: string, message?: string) => Promise<void>;
  
  /**
   * Get current branch
   */
  getCurrentBranch: () => Promise<string>;
  
  /**
   * Get commit history
   */
  getLog: (options?: GitLogOptions) => Promise<GitCommit[]>;
  
  /**
   * Add remote
   */
  addRemote: (name: string, url: string) => Promise<void>;
  
  /**
   * Execute git command
   */
  exec: (args: string[]) => Promise<{ stdout: string; stderr: string }>;
}

interface GitLogOptions {
  maxCount?: number;
  branch?: string;
}

interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
}
```

### Fixture Factory

```typescript
/**
 * Create test fixture
 */
async function createFixture(
  options: FixtureOptions = {}
): Promise<TestFixture> {
  const {
    git = false,
    config = false,
    files = {},
    branches = [],
    commits = [],
  } = options;

  // Create temporary directory
  const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const root = path.join(os.tmpdir(), 'arashi-tests', id);
  await fs.ensureDir(root);

  // Initialize git if requested
  let repo: GitRepository | undefined;
  if (git) {
    repo = await initGitRepository(root, { branches, commits });
  }

  // Create config if requested
  if (config) {
    await createDefaultConfig(root);
  }

  // Create initial files
  for (const [filePath, content] of Object.entries(files)) {
    await fs.outputFile(path.join(root, filePath), content);
  }

  // Cleanup function
  const cleanup = async () => {
    await fs.remove(root);
  };

  // Helper functions
  const resolve = (...paths: string[]) => path.join(root, ...paths);
  
  const writeFile = async (filePath: string, content: string) => {
    await fs.outputFile(resolve(filePath), content);
  };
  
  const readFile = async (filePath: string) => {
    return fs.readFile(resolve(filePath), 'utf8');
  };
  
  const exists = async (filePath: string) => {
    return fs.pathExists(resolve(filePath));
  };

  return {
    id,
    root,
    repo,
    cleanup,
    resolve,
    writeFile,
    readFile,
    exists,
  };
}

interface FixtureOptions {
  git?: boolean;
  config?: boolean;
  files?: Record<string, string>;
  branches?: string[];
  commits?: CommitOptions[];
}

interface CommitOptions {
  message: string;
  files?: Record<string, string>;
  branch?: string;
}
```

### Git Repository Setup

```typescript
/**
 * Initialize git repository for testing
 */
async function initGitRepository(
  root: string,
  options: GitRepoOptions = {}
): Promise<GitRepository> {
  const { branches = [], commits = [] } = options;

  // Initialize git
  await execGit(root, ['init']);
  await execGit(root, ['config', 'user.name', 'Test User']);
  await execGit(root, ['config', 'user.email', 'test@example.com']);

  // Create initial commit
  await fs.writeFile(path.join(root, 'README.md'), '# Test Repository');
  await execGit(root, ['add', 'README.md']);
  await execGit(root, ['commit', '-m', 'Initial commit']);

  // Create branches
  for (const branch of branches) {
    await execGit(root, ['branch', branch]);
  }

  // Create commits
  for (const commit of commits) {
    if (commit.branch) {
      await execGit(root, ['checkout', commit.branch]);
    }
    
    if (commit.files) {
      for (const [filePath, content] of Object.entries(commit.files)) {
        await fs.outputFile(path.join(root, filePath), content);
        await execGit(root, ['add', filePath]);
      }
    }
    
    await execGit(root, ['commit', '-m', commit.message, '--allow-empty']);
  }

  // Return to main branch
  await execGit(root, ['checkout', 'main']).catch(() => 
    execGit(root, ['checkout', 'master'])
  );

  // Repository helper functions
  const commit = async (
    message: string,
    files?: Record<string, string>
  ): Promise<string> => {
    if (files) {
      for (const [filePath, content] of Object.entries(files)) {
        await fs.outputFile(path.join(root, filePath), content);
        await execGit(root, ['add', filePath]);
      }
    }
    
    await execGit(root, ['commit', '-m', message, '--allow-empty']);
    const result = await execGit(root, ['rev-parse', 'HEAD']);
    return result.stdout.trim();
  };

  const branch = async (name: string, base?: string): Promise<void> => {
    const args = ['branch', name];
    if (base) args.push(base);
    await execGit(root, args);
  };

  const checkout = async (branchName: string): Promise<void> => {
    await execGit(root, ['checkout', branchName]);
  };

  const tag = async (name: string, message?: string): Promise<void> => {
    const args = ['tag', name];
    if (message) args.push('-m', message);
    await execGit(root, args);
  };

  const getCurrentBranch = async (): Promise<string> => {
    const result = await execGit(root, ['branch', '--show-current']);
    return result.stdout.trim();
  };

  const getLog = async (options: GitLogOptions = {}): Promise<GitCommit[]> => {
    const { maxCount = 10, branch } = options;
    
    const args = [
      'log',
      `--max-count=${maxCount}`,
      '--format=%H|%s|%an|%ai',
    ];
    
    if (branch) args.push(branch);
    
    const result = await execGit(root, args);
    
    return result.stdout
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => {
        const [hash, message, author, date] = line.split('|');
        return { hash, message, author, date: new Date(date) };
      });
  };

  const addRemote = async (name: string, url: string): Promise<void> => {
    await execGit(root, ['remote', 'add', name, url]);
  };

  const exec = async (args: string[]) => {
    return execGit(root, args);
  };

  return {
    root,
    commit,
    branch,
    checkout,
    tag,
    getCurrentBranch,
    getLog,
    addRemote,
    exec,
  };
}

interface GitRepoOptions {
  branches?: string[];
  commits?: CommitOptions[];
}

/**
 * Execute git command
 */
async function execGit(
  cwd: string,
  args: string[]
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', data => {
      stdout += data.toString();
    });

    child.stderr?.on('data', data => {
      stderr += data.toString();
    });

    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Git command failed: ${args.join(' ')}\n${stderr}`));
      }
    });
  });
}
```

---

## Test Cleanup Patterns

### Automatic Cleanup

```typescript
/**
 * Cleanup manager for tests
 */
class CleanupManager {
  private cleanupFns: Array<() => Promise<void>> = [];

  /**
   * Register cleanup function
   */
  register(fn: () => Promise<void>): void {
    this.cleanupFns.push(fn);
  }

  /**
   * Execute all cleanup functions
   */
  async cleanup(): Promise<void> {
    const errors: Error[] = [];

    // Execute in reverse order (LIFO)
    for (const fn of this.cleanupFns.reverse()) {
      try {
        await fn();
      } catch (error) {
        errors.push(error as Error);
      }
    }

    this.cleanupFns = [];

    if (errors.length > 0) {
      throw new Error(
        `Cleanup failed:\n${errors.map(e => e.message).join('\n')}`
      );
    }
  }

  /**
   * Reset cleanup functions
   */
  reset(): void {
    this.cleanupFns = [];
  }
}

/**
 * Global cleanup manager instance
 */
export const cleanupManager = new CleanupManager();
```

### Test Hooks

```typescript
/**
 * Setup test environment with automatic cleanup
 */
export function setupTest() {
  let fixture: TestFixture | undefined;

  beforeEach(async () => {
    // Reset cleanup manager
    cleanupManager.reset();
  });

  afterEach(async () => {
    // Cleanup fixture
    if (fixture) {
      await fixture.cleanup();
      fixture = undefined;
    }

    // Run registered cleanup functions
    await cleanupManager.cleanup();
  });

  return {
    /**
     * Create fixture for current test
     */
    createFixture: async (options?: FixtureOptions) => {
      fixture = await createFixture(options);
      return fixture;
    },
    
    /**
     * Register cleanup function
     */
    onCleanup: (fn: () => Promise<void>) => {
      cleanupManager.register(fn);
    },
  };
}
```

### Usage Example

```typescript
describe('worktree operations', () => {
  const test = setupTest();

  it('should create worktree', async () => {
    const fixture = await test.createFixture({ git: true, config: true });
    
    // Test code here
    await createWorktree(
      fixture.resolve('.arashi/123'),
      'feature/123',
      { base: 'main' }
    );
    
    // Verify
    expect(await fixture.exists('.arashi/123')).toBe(true);
    
    // Automatic cleanup happens in afterEach
  });
});
```

---

## Mock Patterns

### Git Command Mocking

```typescript
/**
 * Mock git command execution
 */
export function mockGitCommand(
  command: string,
  output: MockGitOutput
): jest.SpyInstance {
  const mock = jest.spyOn(gitModule, 'executeGitCommand');
  
  mock.mockImplementation(async (args: string[]) => {
    const cmd = args.join(' ');
    
    if (cmd.includes(command)) {
      if (output.error) {
        throw new Error(output.error);
      }
      
      return {
        stdout: output.stdout || '',
        stderr: output.stderr || '',
        exitCode: output.exitCode || 0,
        command: cmd,
        duration: output.duration || 10,
      };
    }
    
    // Default fallback
    return {
      stdout: '',
      stderr: '',
      exitCode: 0,
      command: cmd,
      duration: 10,
    };
  });
  
  return mock;
}

interface MockGitOutput {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  duration?: number;
  error?: string;
}

/**
 * Example usage
 */
describe('listWorktrees', () => {
  it('should parse worktree list output', async () => {
    mockGitCommand('worktree list', {
      stdout: `
worktree /path/to/repo
HEAD abc123
branch refs/heads/main

worktree /path/to/worktree
HEAD def456
branch refs/heads/feature/123
      `.trim(),
    });
    
    const worktrees = await listWorktrees();
    
    expect(worktrees).toHaveLength(2);
    expect(worktrees[0].branch).toBe('main');
    expect(worktrees[1].branch).toBe('feature/123');
  });
});
```

### File System Mocking

```typescript
/**
 * Mock file system operations
 */
export function mockFileSystem(
  files: Record<string, string | null>
): void {
  jest.spyOn(fs, 'readFile').mockImplementation(async (filePath: string) => {
    const content = files[filePath];
    if (content === null) {
      throw new Error('ENOENT: file not found');
    }
    return content || '';
  });

  jest.spyOn(fs, 'pathExists').mockImplementation(async (filePath: string) => {
    return filePath in files && files[filePath] !== null;
  });
}

/**
 * Example usage
 */
describe('loadConfig', () => {
  it('should load configuration from file', async () => {
    mockFileSystem({
      '.arashi/config.json': JSON.stringify({
        version: '1.0',
        worktree: { baseDir: '.arashi' },
      }),
    });
    
    const config = await loadConfig();
    
    expect(config.version).toBe('1.0');
    expect(config.worktree.baseDir).toBe('.arashi');
  });
});
```

---

## Snapshot Testing

### Snapshot Conventions

```typescript
/**
 * Test snapshot for CLI output
 */
describe('CLI output', () => {
  it('should format status table correctly', async () => {
    const output = formatStatusTable([
      {
        taskId: '123',
        branch: 'feature/123',
        path: '.arashi/123',
        status: 'clean',
        ahead: 0,
        behind: 0,
        uncommittedChanges: 0,
        untrackedFiles: 0,
      },
    ]);
    
    // Snapshot the output
    expect(output).toMatchSnapshot();
  });

  it('should format error message correctly', () => {
    const error = new ArashiError('Test error', {
      code: ErrorCode.BRANCH_EXISTS,
      details: { branch: 'feature/123' },
      suggestions: ['Use --force', 'Choose different name'],
    });
    
    // Snapshot the formatted error
    expect(error.format({ colors: false })).toMatchSnapshot();
  });
});
```

### Snapshot Naming

Snapshots should be named descriptively:

```typescript
// Good: Descriptive test name
it('should format worktree status with uncommitted changes', () => {
  // Snapshot: should format worktree status with uncommitted changes 1
});

// Bad: Generic test name
it('should work', () => {
  // Snapshot: should work 1 (unclear what is being tested)
});
```

### Inline Snapshots

For small, important outputs, use inline snapshots:

```typescript
describe('error codes', () => {
  it('should return correct exit code for branch exists', () => {
    const error = ErrorFactory.branchExists('feature/123');
    
    expect(error.exitCode).toMatchInlineSnapshot(`2`);
    expect(error.code).toMatchInlineSnapshot(`"BRANCH_EXISTS"`);
  });
});
```

---

## CI/CD Configuration

### Test Matrix

```typescript
/**
 * Test matrix configuration
 */
interface TestMatrix {
  /**
   * Node.js versions to test
   */
  nodeVersions: string[];
  
  /**
   * Operating systems to test
   */
  platforms: Platform[];
  
  /**
   * Git versions to test
   */
  gitVersions: string[];
}

interface Platform {
  os: 'ubuntu' | 'macos' | 'windows';
  version: string;
}

/**
 * Recommended test matrix
 */
export const testMatrix: TestMatrix = {
  nodeVersions: ['18.x', '20.x', '22.x'],
  platforms: [
    { os: 'ubuntu', version: 'latest' },
    { os: 'macos', version: 'latest' },
    { os: 'windows', version: 'latest' },
  ],
  gitVersions: ['2.5.0', '2.30.0', 'latest'],
};
```

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    name: Test (Node ${{ matrix.node }} on ${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    
    strategy:
      fail-fast: false
      matrix:
        node: [18.x, 20.x, 22.x]
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Upload coverage
        if: matrix.os == 'ubuntu-latest' && matrix.node == '20.x'
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  test-git-versions:
    name: Test Git ${{ matrix.git-version }}
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        git-version: ['2.5.0', '2.30.0', '2.43.0']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup specific Git version
        run: |
          # Install specific git version
          # (implementation depends on version)
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run git integration tests
        run: npm run test:git

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20.x
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
```

### NPM Scripts

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "jest --testPathPattern=tests/e2e",
    "test:git": "jest --testPathPattern=tests/integration/git",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

---

## Test Coverage Requirements

### Coverage Thresholds

```typescript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/cli/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/git/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### Coverage Reports

Generate multiple coverage report formats:

```json
{
  "jest": {
    "coverageReporters": [
      "text",
      "text-summary",
      "lcov",
      "html",
      "json"
    ]
  }
}
```

---

## Custom Assertions

### Arashi-Specific Assertions

```typescript
/**
 * Custom Jest matchers for arashi
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeArashiError(code: ErrorCode): R;
      toHaveWorktree(path: string): R;
      toHaveBranch(name: string): R;
      toBeValidConfig(): R;
    }
  }
}

/**
 * Expect error to be ArashiError with specific code
 */
export function toBeArashiError(
  received: unknown,
  expected: ErrorCode
): jest.CustomMatcherResult {
  const pass =
    received instanceof ArashiError &&
    received.code === expected;

  return {
    pass,
    message: () =>
      pass
        ? `Expected error not to be ArashiError with code ${expected}`
        : `Expected error to be ArashiError with code ${expected}, ` +
          `but got ${received instanceof ArashiError ? received.code : typeof received}`,
  };
}

/**
 * Expect repository to have worktree at path
 */
export function toHaveWorktree(
  received: string,
  expected: string
): jest.CustomMatcherResult {
  const worktrees = listWorktreesSync(received);
  const pass = worktrees.some(w => w.path === expected);

  return {
    pass,
    message: () =>
      pass
        ? `Expected repository not to have worktree at ${expected}`
        : `Expected repository to have worktree at ${expected}`,
  };
}

/**
 * Register custom matchers
 */
expect.extend({
  toBeArashiError,
  toHaveWorktree,
  toHaveBranch,
  toBeValidConfig,
});
```

### Usage Example

```typescript
describe('error handling', () => {
  it('should throw BRANCH_EXISTS error', async () => {
    await expect(
      createBranch('existing-branch')
    ).rejects.toBeArashiError(ErrorCode.BRANCH_EXISTS);
  });
});
```

---

## Performance Testing

### Benchmark Tests

```typescript
/**
 * Benchmark test helper
 */
async function benchmark(
  name: string,
  fn: () => Promise<void>,
  options: BenchmarkOptions = {}
): Promise<BenchmarkResult> {
  const { iterations = 100, warmup = 10 } = options;

  // Warmup
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  // Measure
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  // Calculate statistics
  const sorted = times.sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const p99 = sorted[Math.floor(sorted.length * 0.99)];

  return {
    name,
    iterations,
    mean,
    median,
    min,
    max,
    p95,
    p99,
  };
}

interface BenchmarkOptions {
  iterations?: number;
  warmup?: number;
}

interface BenchmarkResult {
  name: string;
  iterations: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

/**
 * Example benchmark test
 */
describe('performance', () => {
  it('should list worktrees quickly', async () => {
    const fixture = await createFixture({ git: true });
    
    // Create some worktrees
    for (let i = 0; i < 10; i++) {
      await createWorktree(
        fixture.resolve(`.arashi/${i}`),
        `feature/${i}`,
        { base: 'main' }
      );
    }

    const result = await benchmark(
      'listWorktrees',
      () => listWorktrees({ cwd: fixture.root }),
      { iterations: 100 }
    );

    // Assert performance
    expect(result.mean).toBeLessThan(100); // < 100ms
    expect(result.p95).toBeLessThan(150);  // < 150ms at p95
    
    console.log('Benchmark result:', result);
  });
});
```

---

## Test Documentation

### Test Description Format

```typescript
// Format: should <action> <expected_result> [when <condition>]

// Good examples:
it('should create worktree when branch does not exist', () => {});
it('should throw error when branch already exists', () => {});
it('should rollback on failure', () => {});

// Bad examples:
it('creates worktree', () => {}); // Missing "should"
it('test worktree creation', () => {}); // Not descriptive
it('works', () => {}); // Too vague
```

### Test Organization

```typescript
describe('Component/Module', () => {
  describe('method/function', () => {
    // Success cases
    it('should succeed when input is valid', () => {});
    it('should return expected output', () => {});
    
    // Error cases
    it('should throw error when input is invalid', () => {});
    it('should handle edge case', () => {});
    
    // Integration cases
    it('should work with other components', () => {});
  });
});
```

---

## Change Log

### Version 1.0.0 (2026-02-03)
- Initial test patterns contract
- Fixture interfaces defined
- Cleanup patterns established
- Snapshot conventions documented
- CI/CD matrix configured
- Custom assertions provided
