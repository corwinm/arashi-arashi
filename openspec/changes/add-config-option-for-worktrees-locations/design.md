## Context

Arashi currently does not expose a user-facing setting for where worktrees are created, so destination paths are effectively fixed by command behavior. This makes it difficult to support different workspace layouts, including sibling directories (`../`), repo-root placement (`.`/`./`), or managed subdirectories. The proposal requires a configurable location with consistent normalization and a safe default of `.arashi/worktrees/`.

## Goals / Non-Goals

**Goals:**
- Add a first-class config option that controls the base path used for new worktree directories.
- Support relative path inputs such as `../`, `.`, `./`, and `.arashi/worktrees` with optional trailing slashes.
- Resolve and normalize configured paths consistently before any command creates worktrees.
- Preserve a stable default (`.arashi/worktrees/`) when the option is not configured.
- Ensure default managed directories are ignored by git when appropriate.

**Non-Goals:**
- Introducing per-command/per-repo overrides for worktree location in this change.
- Redesigning repository discovery, branch naming, or worktree lifecycle behavior.
- Moving existing worktrees automatically as part of this rollout.

## Decisions

1) Add an explicit workspace-level worktree location setting
- Decision: introduce a dedicated config field for the worktree base location and normalize it to one canonical in-memory representation.
- Why: an explicit field removes hidden path logic and lets users choose a layout intentionally.
- Alternatives considered:
  - Hard-code one location forever: rejected because it blocks valid workspace layouts.
  - Infer location from repo metadata only: rejected because users need direct control.

2) Treat configured values as workspace-relative paths
- Decision: resolve configured locations relative to the workspace root and normalize path forms by trimming optional trailing slashes and collapsing dot segments.
- Why: relative paths keep configuration portable across machines and repositories.
- Alternatives considered:
  - Allow absolute paths as first-class values: rejected for now to avoid portability and security surprises.

3) Centralize destination resolution in one utility
- Decision: add a shared path-resolution utility used by all commands that create or register worktrees.
- Why: centralizing behavior avoids inconsistent handling between `add`, `create`, and related orchestration flows.
- Alternatives considered:
  - Resolve ad hoc in each command: rejected due drift risk and duplicated validation logic.

4) Keep backward compatibility while defining default behavior
- Decision: if the setting is missing, use `.arashi/worktrees/` as the default output base; initialization/setup paths should write or imply this default clearly.
- Why: this gives predictable behavior for new and existing users without requiring manual migration.
- Alternatives considered:
  - Require explicit configuration everywhere: rejected because it adds friction and breaks existing workflows.

5) Manage git ignore only for the default managed directory
- Decision: ensure `.arashi/worktrees/` is ignored when used as default managed storage; do not automatically modify ignore rules for arbitrary custom paths.
- Why: auto-updating ignore rules for custom user paths can create unexpected repository changes.
- Alternatives considered:
  - Auto-ignore every configured path: rejected because custom locations may intentionally be tracked.

## Risks / Trade-offs

- [Risk] Path normalization differences create subtle command behavior mismatches -> Mitigation: enforce one resolver with integration tests for `../`, `.`, `./`, and trailing slash variants.
- [Risk] Existing workspaces without the new setting behave unexpectedly -> Mitigation: preserve default fallback and add regression tests for omitted configuration.
- [Risk] Rejecting absolute paths may be too strict for some teams -> Mitigation: document this constraint and revisit via a follow-up change if needed.
- [Risk] Default ignore updates may conflict with existing `.gitignore` conventions -> Mitigation: implement idempotent, minimal ignore insertion with tests.

## Migration Plan

1. Introduce config parsing/validation for the new worktree location option with normalization.
2. Add shared resolver utility and migrate worktree-creating code paths to use it.
3. Apply default fallback behavior for existing configs without the new option.
4. Update setup/init flows to ensure default managed directory ignore behavior is present and idempotent.
5. Add unit/integration tests for path variants, fallback behavior, and ignore handling.

## Open Questions

- Should absolute paths be accepted later behind an explicit opt-in for advanced users?
- Should future iterations allow per-repository overrides in addition to a workspace default?
