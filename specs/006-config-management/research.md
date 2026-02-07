# Research: Configuration Management

**Feature**: 006-config-management  
**Date**: 2026-02-03  
**Status**: Complete

## Purpose

This document consolidates research findings and technical decisions for the configuration management feature. Since all technical context was clear from the specification and existing project standards, this research focuses on best practices and implementation patterns.

## Research Findings

### 1. Configuration File Format: JSON

**Decision**: Use JSON for `.arashi/config.json`

**Rationale**:
- Native support in all JavaScript runtimes (Bun, Node.js)
- Human-readable and widely understood
- Built-in parsing and stringification
- Schema validation straightforward with TypeScript interfaces
- Pretty-printing support via `JSON.stringify(obj, null, 2)`

**Alternatives Considered**:
- **YAML**: More human-friendly but requires external parser, adds dependency (violates single-file principle)
- **TOML**: Good for configuration but less common in JS ecosystem, requires parser library
- **JavaScript**: Allows comments and logic but security risk, harder to validate

**Implementation Notes**:
- Use `JSON.parse()` for reading (built-in, fast)
- Use `JSON.stringify(obj, null, 2)` for writing (2-space indentation for readability)
- Wrap in try-catch for detailed error messages

---

### 2. File I/O Strategy: Synchronous Operations

**Decision**: Use synchronous file operations (Bun.file().text(), Bun.write())

**Rationale**:
- Configuration operations are infrequent (startup, explicit saves)
- Synchronous code is simpler and more reliable for atomic operations
- Avoids race conditions with async operations
- Performance impact negligible (< 100ms for 100 repos per SC-002)
- Error handling is straightforward

**Alternatives Considered**:
- **Async file I/O**: More "modern" but adds complexity for no benefit in this use case
- **Streaming**: Overkill for small config files (< 1MB typical)

**Implementation Notes**:
```typescript
// Reading
const text = await Bun.file(configPath).text();
const config = JSON.parse(text);

// Writing
await Bun.write(configPath, JSON.stringify(config, null, 2));
```

---

### 3. Error Handling: Detailed Messages with Context

**Decision**: Provide specific error messages with actionable guidance

**Rationale**:
- Aligns with Constitution Principle IV (User-Centric Interface)
- Reduces support burden
- Faster debugging for developers
- Meets SC-003 requirement

**Error Categories**:
1. **File Not Found**: Suggest running init or check path
2. **Parse Error**: Include JSON parse error details (line/column if available)
3. **Validation Error**: List specific missing/invalid fields
4. **Permission Error**: Indicate file system permission issue
5. **Write Error**: Disk full, read-only filesystem details

**Implementation Pattern**:
```typescript
class ConfigError extends Error {
  constructor(message: string, public cause?: Error, public context?: any) {
    super(message);
    this.name = 'ConfigError';
  }
}

// Usage
throw new ConfigError(
  'Configuration file not found at /path/.arashi/config.json. Run "arashi init" to create it.',
  undefined,
  { path: configPath }
);
```

---

### 4. Validation Strategy: Schema-Based with TypeScript

**Decision**: Use TypeScript interfaces + runtime validation function

**Rationale**:
- Type safety during development
- Runtime validation for loaded JSON
- No external validation library needed
- Clear validation error messages

**Implementation Approach**:
```typescript
interface Config {
  version: string;
  repos_dir: string;
  auto_setup: boolean;
  discovered_repos: Record<string, RepoConfig>;
}

function validateConfig(data: any): Config {
  const errors: string[] = [];
  
  if (typeof data.version !== 'string') {
    errors.push('version: must be a string');
  }
  if (typeof data.repos_dir !== 'string') {
    errors.push('repos_dir: must be a string');
  }
  if (typeof data.auto_setup !== 'boolean') {
    errors.push('auto_setup: must be a boolean');
  }
  // ... validate discovered_repos
  
  if (errors.length > 0) {
    throw new ConfigError(
      `Configuration validation failed:\n${errors.join('\n')}`,
      undefined,
      { errors }
    );
  }
  
  return data as Config;
}
```

---

### 5. Default Configuration: Sensible Defaults

**Decision**: Generate minimal default config with standard values

**Default Values**:
```json
{
  "version": "1.0.0",
  "repos_dir": "./repos",
  "auto_setup": true,
  "discovered_repos": {}
}
```

**Rationale**:
- `version`: "1.0.0" - Initial release version, enables future migrations
- `repos_dir`: "./repos" - Standard convention, relative to config location
- `auto_setup`: true - Optimize for ease of use (automatic discovery enabled)
- `discovered_repos`: {} - Empty initially, populated by discovery or manual add

**Alternatives Considered**:
- Absolute paths for repos_dir: Too rigid, breaks portability
- No version field: Makes future migrations harder
- auto_setup: false: Requires more manual setup, worse UX

---

### 6. Repository Management: Immutable Updates

**Decision**: Load → Modify → Save pattern (no in-place editing)

**Rationale**:
- Safer: atomic file writes (all-or-nothing)
- Simpler: no complex file locking needed
- Testable: pure functions easier to test
- Consistent: same pattern for all modifications

**Implementation Pattern**:
```typescript
// Add repository
export async function addRepo(repoPath: string, name: string, repoConfig: RepoConfig) {
  const config = await loadConfig(repoPath);
  config.discovered_repos[name] = repoConfig;
  await saveConfig(repoPath, config);
}

// Remove repository
export async function removeRepo(repoPath: string, name: string) {
  const config = await loadConfig(repoPath);
  delete config.discovered_repos[name];
  await saveConfig(repoPath, config);
}
```

---

### 7. Forward Compatibility: Preserve Unknown Fields

**Decision**: Don't strip unknown fields from loaded config

**Rationale**:
- Future versions may add new fields
- Third-party tools may add custom metadata
- Prevents data loss during version transitions
- TypeScript interfaces define minimum required, not maximum allowed

**Implementation**:
```typescript
// Validation checks required fields exist and have correct types
// But doesn't error on extra fields
function validateConfig(data: any): Config {
  // Check required fields...
  // Return data as Config (extra fields preserved)
  return data as Config;
}
```

---

### 8. Path Handling: Cross-Platform Compatibility

**Decision**: Use Bun's path utilities, normalize all paths

**Best Practices**:
- Use `path.join()` for path construction
- Use `path.resolve()` for absolute paths
- Use `path.normalize()` to handle different separators
- Store relative paths when possible for portability

**Implementation Notes**:
```typescript
import { join, resolve, dirname } from 'path';

export function getConfigPath(repoPath: string): string {
  return join(repoPath, '.arashi', 'config.json');
}

export async function saveConfig(repoPath: string, config: Config) {
  const configPath = getConfigPath(repoPath);
  const configDir = dirname(configPath);
  
  // Ensure directory exists
  await mkdir(configDir, { recursive: true });
  
  await Bun.write(configPath, JSON.stringify(config, null, 2));
}
```

---

## Performance Considerations

### Load Time Optimization
- Use Bun.file() for efficient file reading
- Parse JSON in single pass
- Cache config in memory if called repeatedly (implementation detail)

### File Size Management
- JSON pretty-printing adds ~20-30% overhead vs minified
- Acceptable tradeoff: 100 repos ≈ 50KB → 65KB (well under 1MB)
- No compression needed at this scale

### Validation Performance
- Simple type checks: O(n) where n = number of fields
- Fast enough for startup (microseconds)
- No regex or complex parsing needed

---

## Testing Strategy

### Unit Tests (tests/unit/config.test.ts)
- `generateDefaultConfig()`: returns correct structure
- `validateConfig()`: catches all required field errors
- `validateConfig()`: accepts valid config
- `validateConfig()`: preserves unknown fields
- `getConfigPath()`: constructs correct path
- Error message formatting

### Integration Tests (tests/integration/config-integration.test.ts)
- `loadConfig()`: reads valid file
- `loadConfig()`: throws on missing file with helpful message
- `loadConfig()`: throws on malformed JSON with parse details
- `loadConfig()`: throws on invalid config with validation errors
- `saveConfig()`: writes pretty-printed JSON
- `saveConfig()`: creates directory if missing
- `saveConfig()`: handles permission errors
- `configExists()`: detects existing file
- `configExists()`: returns false for missing file
- `addRepo()`: adds to discovered_repos
- `addRepo()`: handles duplicate names (overwrite or error - TBD in tasks)
- `removeRepo()`: removes from discovered_repos
- `removeRepo()`: handles non-existent repo (error or silent - TBD in tasks)
- Round-trip: save + load preserves data

### Test Fixtures (tests/fixtures/)
- `valid-config.json`: Complete valid configuration
- `invalid-json.json`: Malformed JSON (syntax error)
- `missing-version.json`: Missing required field
- `missing-repos-dir.json`: Missing required field
- `extra-fields.json`: Valid config with unknown fields (forward compat test)

---

## Open Questions for Task Breakdown

1. **Duplicate repository names**: Should `addRepo()` overwrite existing or throw error?
   - **Recommendation**: Throw error for safety, require explicit update function
   
2. **Remove non-existent repo**: Should `removeRepo()` error or succeed silently?
   - **Recommendation**: Succeed silently (idempotent operation)

3. **Concurrent access**: How to handle multiple processes modifying config?
   - **Recommendation**: Document as unsupported for v1, consider file locking in future

4. **Config migration**: How to handle version mismatches?
   - **Recommendation**: Warn if version differs, but don't block (forward compatible)

5. **Validation strictness**: Validate discovered_repos structure?
   - **Recommendation**: Yes - validate each repo entry has required fields

---

## Summary

All technical decisions are clear and aligned with project constitution. Key patterns:
- Synchronous file I/O for reliability
- Detailed error messages for better UX
- TypeScript interfaces + runtime validation
- Immutable update pattern (load → modify → save)
- Forward compatibility via unknown field preservation
- Cross-platform path handling

Ready to proceed to Phase 1 (Data Model & Contracts).
