# Research: Rework Hooks

## Decision 1: Reuse existing hook locations and execution model

**Decision**: Continue to use the existing `.arashi/hooks/` directory for global hooks and run hooks in the repo context using the established execution model and environment variable conventions.

**Rationale**: Prior specs and implementation already define hook discovery and execution behavior, reducing user retraining and preserving compatibility with current workflows.

**Alternatives considered**:
- Introduce a new hook directory structure or config-based hook registry.
- Centralize all hooks in a per-repo config file rather than file naming conventions.

## Decision 2: Add repo-specific hooks via filename scoping

**Decision**: Introduce repo-specific hook files using `pre-create.<child-repo>.sh` and `post-create.<child-repo>.sh` naming conventions under the hooks directory.

**Rationale**: Filename scoping matches existing hook patterns, is easy to discover, and avoids new configuration surfaces.

**Alternatives considered**:
- Per-repo subdirectories (e.g., `.arashi/hooks/<repo>/pre-create.sh`).
- Config entries for per-repo hooks with explicit paths.

## Decision 3: Failure policy stops operation and skips global post-create

**Decision**: Any hook failure stops the create operation immediately and the global post-create hook does not run.

**Rationale**: This aligns with rollback requirements and avoids finalization on a partially failed operation.

**Alternatives considered**:
- Continue on failure with warnings and run global post-create.
- Stop creating additional worktrees but still run global post-create.
