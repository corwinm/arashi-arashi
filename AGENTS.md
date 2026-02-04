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
│   └── 001-config-management/    # Specification stays here
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
- TypeScript + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path) (001-git-utility-lib)
- N/A (library layer - operates on git repositories on filesystem) (001-git-utility-lib)
- TypeScript + Bun (latest stable version) + Bun runtime (built-in APIs only - file system, path utilities) (001-config-management)
- File system (`.arashi/config.json`) (001-config-management)
- TypeScript (latest stable) + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path) (005-filesystem-utilities)
- N/A (library layer - operates on filesystem directly) (005-filesystem-utilities)
- TypeScript (latest stable) + Bun (latest stable version) + chalk (colors), ora (spinners) (006-logger-utilities)
- N/A (output-only utility library) (006-logger-utilities)
- TypeScript (latest stable) + Bun (latest stable version) + @inquirer/prompts (confirm, select, checkbox, input) (007-prompt-utilities)
- N/A (input-only utility library) (007-prompt-utilities)

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
- 007-prompt-utilities: Added TypeScript (latest stable) + Bun (latest stable version) + @inquirer/prompts (confirm, select, checkbox, input)
- 006-logger-utilities: Added TypeScript (latest stable) + Bun (latest stable version) + chalk (colors), ora (spinners)
- 005-filesystem-utilities: Added TypeScript (latest stable) + Bun (latest stable version for bundling and runtime) + Bun runtime (built-in APIs only - spawn, file system, path)


<!-- MANUAL ADDITIONS START -->

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
