# Implementation Plan: Nested Worktree Paths for Multi-Repo Setup

**Branch**: `001-nested-worktree-paths` | **Date**: 2026-02-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-nested-worktree-paths/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Fix worktree path calculation to support nested multi-repo structures. Currently, all worktrees are created as siblings to their source repositories, breaking the parent-child relationship in meta-repo setups. This change will:

1. Create meta-repo worktrees as siblings (unchanged behavior)
2. Create child repo worktrees inside parent worktree's `repos/` folder (new behavior)
3. Preserve existing behavior for standalone repositories (backward compatible)

The fix requires modifying the worktree path calculation logic in `repos/arashi/src/core/worktree.ts` (line 635) to detect repository type (meta-repo vs. child repo vs. standalone) and calculate the appropriate destination path.

## Technical Context

**Language/Version**: TypeScript (latest stable) with Bun (latest stable version for bundling and runtime)
**Primary Dependencies**: Bun runtime (built-in APIs only - spawn, file system, path)
**Storage**: File system (`.arashi/config.json` for configuration)
**Testing**: Bun test runner (built-in)
**Target Platform**: N/A (operates on git repositories on filesystem)
**Project Type**: Single (CLI library)
**Performance Goals**: Worktree creation for 5 repos: < 30 seconds (excluding network I/O)
**Constraints**: Cross-platform compatibility (macOS, Linux, Windows); must work with existing git worktree APIs
**Scale/Scope**: Multi-repo setups with parent meta-repo containing child repos in `repos/` folder

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Single-File Executable
**Status**: PASS - No changes to distribution method
**Justification**: This is a bug fix in path calculation logic; doesn't affect bundling or distribution.

### ✅ II. Automatic Worktree Management
**Status**: PASS - Enhances core worktree coordination
**Justification**: This fix is essential for proper worktree coordination in multi-repo setups. Child worktrees must nest inside parent worktrees to maintain repository relationships.

### ✅ III. Error Recovery & Rollback
**Status**: PASS - Existing rollback mechanisms apply
**Justification**: The change only affects path calculation. Existing rollback mechanisms in `processRepository()` and `createCoordinatedWorktrees()` will handle failures during worktree creation.

### ✅ IV. User-Centric Interface
**Status**: PASS - No UI changes required
**Justification**: Path calculation is internal; users will see worktrees appear in the correct location automatically. Existing progress indicators and error messages remain unchanged.

### ✅ V. Minimalist Configuration
**Status**: PASS - No new configuration required
**Justification**: Repository type detection uses existing information (`.arashi/config.json` presence, `repos/` folder location). No new user configuration needed.

### ✅ VI. Cross-Platform Compatibility
**Status**: PASS - Uses existing cross-platform path APIs
**Justification**: Changes use Bun's `path.join()` and relative path navigation (`../../../`), which work identically on all platforms.

### ✅ VII. Test Coverage
**Status**: REQUIRES IMPLEMENTATION - New tests needed
**Justification**: Must add integration tests covering:
- Meta-repo worktree creation (sibling path)
- Child repo worktree creation (nested path)
- Standalone repo worktree creation (backward compatibility)
- Edge cases (missing `repos/` folder, path calculation variations)

Target: >80% coverage for modified functions and new path calculation logic.

### ✅ VIII. Semantic Versioning
**Status**: PASS - Bug fix (PATCH version)
**Justification**: Pre-1.0.0, this qualifies as a bug fix (PATCH bump: 0.x.y → 0.x.(y+1)). It fixes incorrect behavior without introducing new features or breaking changes.

### ✅ IX. Hook System
**Status**: PASS - No impact on hooks
**Justification**: Hooks execute after path calculation. Changing the destination path doesn't affect hook execution, context, or environment variables.

### ✅ X. Performance Standards
**Status**: PASS - No performance impact
**Justification**: Path calculation is a simple string operation. The change replaces one path construction with another of equal complexity. No impact on worktree creation time.

**Overall**: ✅ PASS - All constitution checks pass. Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/001-nested-worktree-paths/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
repos/arashi/
├── src/
│   ├── core/
│   │   └── worktree.ts          # ✏️ MODIFY: Fix path calculation at line 635
│   ├── lib/
│   │   ├── config.ts            # 📖 READ: Understand meta-repo detection
│   │   ├── filesystem.ts        # 📖 READ: Directory creation utilities
│   │   └── git.ts               # 📖 READ: Git command execution
│   └── types.ts                 # ✏️ MODIFY: Add repository type enum if needed
│
└── tests/
    ├── integration/
    │   └── worktree-paths.test.ts  # ➕ ADD: Integration tests for nested paths
    └── unit/
        └── path-calculation.test.ts # ➕ ADD: Unit tests for path logic (if extracted)
```

**Structure Decision**: Single project layout. This is a focused bug fix affecting primarily one function in `src/core/worktree.ts`. The existing structure is appropriate; no reorganization needed.

**Key Files**:
- **Primary Change**: `repos/arashi/src/core/worktree.ts:635` - Replace simple sibling path with conditional logic
- **Supporting Logic**: May extract path calculation to separate function for testability
- **Testing**: New integration tests to verify correct path selection for all repository types

## Complexity Tracking

**No constitutional violations** - Section not applicable.

## Phase 0: Research & Investigation

### Research Questions

1. **Repository Type Detection**
   - How to reliably detect if a repo is:
     - Meta-repo (has `.arashi/config.json`)
     - Child repo (located in parent's `repos/` folder)
     - Standalone repo (neither)
   - What information is available in `RepoConfig` and `ArashiConfig`?

2. **Path Calculation Strategy**
   - Current: `join(repo.path, "..", \`${repo.name}-${branchName}\`)`
   - Meta-repo: Same (sibling) → `../<meta-repo-name>-<branch-name>/`
   - Child repo: Nested → `../../../<parent-worktree>/repos/<repo-name>/`
   - How to calculate parent worktree name from child repo path?

3. **Directory Creation**
   - When creating child worktrees, does `repos/` folder in parent worktree exist?
   - Should we create it automatically (FR-008)?
   - What if parent worktree doesn't exist yet?

4. **Edge Cases**
   - What if `repos/` folder is missing from parent worktree?
   - What if child repo is created before parent worktree?
   - What about deeply nested structures (meta-repo containing meta-repos)?
   - How do we handle repositories with custom paths outside `repos/`?

5. **Existing Code Patterns**
   - How does `processRepository()` function work?
   - Where is repository information (path, name) available?
   - Are there existing utilities for path manipulation?

### Research Outputs

See [research.md](research.md) for detailed findings.

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](data-model.md) for entity definitions.

**Key Entities**:
- Repository type classification (meta-repo, child, standalone)
- Worktree path calculation strategy per type
- Parent-child relationship tracking

### API Contracts

This is an internal library change, not an external API. No REST/GraphQL contracts needed.

**Internal Function Contract** (see [contracts/worktree-path-calculation.md](contracts/worktree-path-calculation.md)):

```typescript
/**
 * Calculate the destination path for a new worktree based on repository type.
 * 
 * @param repo - Repository configuration
 * @param branchName - Target branch name
 * @param config - Arashi configuration (for meta-repo detection)
 * @returns Absolute path where worktree should be created
 */
function calculateWorktreePath(
  repo: RepoConfig,
  branchName: string,
  config: ArashiConfig
): string
```

### Quickstart

See [quickstart.md](quickstart.md) for developer guidance on:
- Understanding the current worktree creation flow
- Where to implement the fix
- How to test the changes locally
- Example scenarios demonstrating the fix

---

## Post-Design Constitution Check

*Re-evaluation after Phase 1 design is complete*

### ✅ I. Single-File Executable
**Status**: PASS - Confirmed after design
**Justification**: Design adds only internal functions; no impact on build process or binary size. Implementation is pure TypeScript using existing dependencies.

### ✅ II. Automatic Worktree Management
**Status**: PASS - Confirmed after design
**Justification**: Design enhances worktree coordination by ensuring child repos maintain proper nested structure. This improves the core value proposition.

### ✅ III. Error Recovery & Rollback
**Status**: PASS - Confirmed after design
**Justification**: Design confirms existing rollback mechanism works with new path calculation. Operation log tracks worktree paths; rollback uses logged paths to remove worktrees regardless of location.

### ✅ IV. User-Centric Interface
**Status**: PASS - Confirmed after design
**Justification**: No UI changes. Path calculation is transparent to users; they see correct directory structure automatically.

### ✅ V. Minimalist Configuration
**Status**: PASS - Confirmed after design
**Justification**: Uses existing `repos_dir` configuration; no new config required. Repository type detection is automatic based on file markers and path analysis.

### ✅ VI. Cross-Platform Compatibility
**Status**: PASS - Confirmed after design
**Justification**: Design uses `path.sep` for splitting, `path.join()` for construction. All path operations are platform-agnostic. Tested logic works identically on Windows/Mac/Linux.

### ✅ VII. Test Coverage
**Status**: REQUIRES IMPLEMENTATION - Plan confirms >80% target
**Justification**: Design includes comprehensive test plan:
- Unit tests: `detectRepositoryType()`, `calculateWorktreePath()`, `calculateChildWorktreePath()`
- Integration tests: 3 scenarios (meta-repo, child repos, standalone)
- Coverage target: >80% of new functions

### ✅ VIII. Semantic Versioning
**Status**: PASS - Confirmed PATCH bump
**Justification**: Bug fix (not new feature or breaking change). Pre-1.0.0 version bump: PATCH increment.

### ✅ IX. Hook System
**Status**: PASS - Confirmed no impact
**Justification**: Hooks execute after path calculation. Design changes path destination but not hook execution flow or context.

### ✅ X. Performance Standards
**Status**: PASS - Confirmed within limits
**Justification**: Design analysis shows:
- Type detection: +1 file existence check (<1ms)
- Path calculation: String operations only (negligible)
- Total overhead: <5ms per repository
- Well within 30-second target for 5 repos

**Overall**: ✅ PASS - All constitution checks confirmed after design. Ready for implementation.

---

**Next Steps**: 
1. ✅ Phase 0 research completed - See [research.md](research.md)
2. ✅ Phase 1 design completed - See [data-model.md](data-model.md) and [contracts/](contracts/)
3. ✅ Post-design constitution check passed
4. **Next**: Use `/speckit.tasks` to generate implementation task breakdown
