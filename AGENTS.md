# arashi-arashi Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-03

## 🚨 IMPORTANT: Implementation Location

**All code implementation must be done in the respective project in the `repos/` folder.**

- **Specifications**: Remain in `specs/` directory of config-mgmt repo
- **Implementation**: Goes in the project repo (e.g., `repos/arashi/` for arashi project)
- **Tests**: Go with the implementation in the project repo
- **Documentation**: Project-specific docs in project repo; specs in config-mgmt

### Example Structure

```
config-mgmt/
├── specs/
│   └── 006-config-management/    # Specification stays here
│       ├── spec.md
│       ├── plan.md
│       └── ...
└── repos/
    └── arashi/                    # Implementation goes here
        ├── src/
        │   └── lib/
        │       └── config.ts      # ✓ Implementation
        └── tests/
            ├── unit/
            │   └── config.test.ts # ✓ Tests
            └── integration/
                └── config-integration.test.ts
```

**Why?** This separates planning (specs) from implementation (project code), allowing each project repo to maintain its own codebase independently while specifications remain centralized for planning.

## Active Technologies
- TypeScript + Bun (latest stable version for bundling and runtime) (003-research-tasks)
- Markdown (CommonMark specification) + None (pure documentation) (004-design-issues)
- File system (specs/001-git-worktree-manager/ directory) (004-design-issues)
- TypeScript + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path) (005-git-utility-lib)
- N/A (library layer - operates on git repositories on filesystem) (005-git-utility-lib)
- TypeScript + Bun (latest stable version) + Bun runtime (built-in APIs only - file system, path utilities) (006-config-management)
- File system (`.arashi/config.json`) (006-config-management)
- TypeScript (latest stable) + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path) (007-filesystem-utilities)
- N/A (library layer - operates on filesystem directly) (007-filesystem-utilities)
- TypeScript (latest stable) + Bun (latest stable version) + chalk (colors), ora (spinners) (008-logger-utilities)
- N/A (output-only utility library) (008-logger-utilities)
- TypeScript (latest stable) + Bun (latest stable version) + @inquirer/prompts (confirm, select, checkbox, input) (009-prompt-utilities)
- N/A (input-only utility library) (009-prompt-utilities)
- File system (hook scripts in `.arashi/hooks/` directory, timeout configuration in `.arashi/config.json`) (010-github-issues)
- TypeScript (latest stable) with Bun (latest stable version for bundling and runtime) (013-worktree-orchestration)
- Operation log maintained in memory during execution, configuration read from `.arashi/config.json` (013-worktree-orchestration)
- In-memory operation log during execution (no persistence), optional future enhancement to persist logs for audit trail (012-rollback-mechanism)
- No persistent storage required (discovery results in-memory), reads configuration from `.arashi/config.json` (011-repository-management)
- YAML (GitHub Actions workflow configuration) (014-ci-workflow)
- GitHub Actions artifact storage for compiled binaries (014-ci-workflow)
- TypeScript (latest stable) with Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path) (015-init-command)
- File system (`.arashi/config.json` for configuration, `.arashi/hooks/` for hook templates) (015-init-command)
- File system (`.arashi/config.json` for configuration) (016-nested-worktree-paths)
- File system (`.arashi/config.json` for configuration, git worktree metadata from `.git/worktrees/`) (017-list-command)
- TypeScript (latest stable) with Bun (latest stable version for bundling and runtime) + commander (CLI framework), chalk (colored output), ora (spinners), @inquirer/prompts (user prompts) (018-add-command)
- File system (`.arashi/config.json` for workspace configuration) (018-add-command)
- YAML (GitHub Actions workflow syntax v2) (019-release-workflow)
- GitHub repository (tags, releases, artifacts), npm registry (019-release-workflow)
- File system (`.arashi/config.json` for workspace configuration, git metadata from `.git/worktrees/`) (020-status-command)
- TypeScript (latest stable) with Bun (latest stable version for bundling and runtime) + commander (CLI framework), chalk (colored output), ora (spinners), @inquirer/prompts (user prompts), Bun runtime (built-in APIs - spawn, file system, path) (021-remove-command)
- TypeScript (latest stable) + Bun (latest stable) + commander, chalk, ora, @inquirer/prompts (023-fix-remove-confirmation)
- File system (`.arashi/config.json`, git metadata, worktree directories) (023-fix-remove-confirmation)
- TypeScript 5.9 + Bun (latest stable) + commander, chalk, ora, @inquirer/prompts (024-fix-remove-grouping)
- File system (`.git/worktrees`, worktree paths), `.arashi/config.json` (024-fix-remove-grouping)
- TypeScript 5.9 + Bun runtime, commander, chalk, ora, @inquirer/prompts (025-pull-command)
- Workspace configuration in `.arashi/config.json`, repository metadata on disk (025-pull-command)
- TypeScript 5.9 with Bun (latest stable) + commander, chalk, ora, @inquirer/prompts (026-sync-command)
- File system (`.arashi/config.json`, git metadata) (026-sync-command)
- File system (`.arashi/config.json`, `.arashi/hooks/`, git worktree metadata) (027-rework-hooks)

- Markdown documentation (N/A - no code implementation) + Git 2.5+ (subject of research) (002-git-worktree-research)

## Project Structure

```text
src/
tests/
```

## Commands

# Add commands for Markdown documentation (N/A - no code implementation)

## Code Style

Markdown documentation (N/A - no code implementation): Follow standard conventions

## Recent Changes
- 027-rework-hooks: Added TypeScript 5.9 + Bun runtime, commander, chalk, ora, @inquirer/prompts
- 026-sync-command: Added TypeScript 5.9 with Bun (latest stable) + commander, chalk, ora, @inquirer/prompts
- 025-pull-command: Added TypeScript 5.9 + Bun runtime, commander, chalk, ora, @inquirer/prompts


<!-- MANUAL ADDITIONS START -->

## Pre-Commit Quality Checks

Before committing and pushing code changes, **ALWAYS** run the following checks to ensure CI will pass:

### 1. Linting (Required)

**Run linting before every commit:**

```bash
# For arashi repo
cd repos/arashi
bun run lint
```

This runs TypeScript type checking (`tsc --noEmit`) to catch type errors before CI. If linting fails:
- Fix all TypeScript errors
- Re-run `bun run lint` to verify fixes
- Only commit when linting passes with no errors

### 2. Tests (Required)

**Run tests to ensure no regressions:**

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/integration/init.test.ts
```

All tests must pass before committing.

### 3. Build (Recommended)

**Verify the build succeeds:**

```bash
bun run build
```

This ensures the code compiles correctly for distribution.

### Pre-Commit Checklist

- [ ] `bun run lint` passes with no errors ✅ **REQUIRED**
- [ ] `bun test` passes with all tests green ✅ **REQUIRED**
- [ ] `bun run build` succeeds ✅ **RECOMMENDED**
- [ ] Changes are focused and related
- [ ] Commit message is clear and descriptive

**Why?** Running these checks locally catches issues before CI runs, saving time and preventing failed builds in pull requests.

## Testing Best Practices

When writing tests, follow these guidelines to ensure meaningful test coverage:

### ❌ Avoid Placeholder Assertions

**Bad:**
```typescript
test("function does not throw", () => {
  someFunction();
  expect(true).toBe(true); // ❌ This tests nothing!
});
```

**Good:**
```typescript
test("function does not throw", () => {
  expect(() => {
    someFunction();
  }).not.toThrow(); // ✓ Explicitly verifies no error
});

// Or verify specific behavior:
test("function returns expected result", () => {
  const result = someFunction();
  expect(result).toBeDefined();
  expect(result.property).toBe("expected value");
});
```

### Test What You Can Verify

Each test should verify specific, observable behavior:

- **Function calls complete**: Use `expect(() => {}).not.toThrow()`
- **Return values**: Test actual returned values/types
- **State changes**: Verify objects/properties are modified correctly
- **Side effects**: Check file creation, console output, etc.
- **Error cases**: Use `expect(() => {}).toThrow(ErrorType)`

### Example: Testing Functions with Side Effects

```typescript
test("spinner operations complete without errors", () => {
  const s = spinner("Loading...");
  
  expect(() => {
    s.start();
    s.succeed("Done!");
  }).not.toThrow();
  
  // Verify observable state if available
  expect(s.text).toBe("Loading...");
});
```

### When Tests Are Difficult

If a function is hard to test meaningfully:
1. **Refactor for testability** - Extract logic that can be tested
2. **Test integration points** - Verify the inputs/outputs of the system
3. **Use mocks/spies** - Verify the right functions were called
4. **Document limitations** - Explain why certain aspects aren't testable

### Constitutional Compliance

Remember: Constitution Principle VII requires >80% test coverage with tests that cover:
- Core logic and utility functions
- Edge cases and error scenarios  
- Integration between components

Placeholder assertions like `expect(true).toBe(true)` don't contribute to meaningful coverage.

<!-- MANUAL ADDITIONS END -->
