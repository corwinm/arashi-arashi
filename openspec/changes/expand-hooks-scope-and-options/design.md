## Context

Arashi currently evaluates lifecycle hook scripts only from the workspace root at `.arashi/hooks/<lifecycle>.sh`. Issue `#104` requires expanding this model so hooks can also live in child repositories and in a user-level global location, while preserving predictable ordering and execution behavior.

This is a cross-cutting change because hook resolution is shared by command flows and must remain consistent across lifecycle entry points (starting with remove hooks and then any other lifecycle integrations that use the same resolver).

## Goals / Non-Goals

**Goals:**
- Resolve hook candidates from three scopes: repository-local, workspace-root, and user-global.
- Execute hooks in deterministic order: repository scope, then workspace-root scope, then user-global scope.
- Run each hook process in the repository context it targets so relative script logic behaves correctly.
- Support user-global hooks that apply either to all repositories or to specific repository names.
- Preserve existing workspace-root hook behavior as a compatibility baseline.

**Non-Goals:**
- Introducing a new hook scripting language or non-shell hook runtime.
- Adding remote hook distribution or package management for hook scripts.
- Reworking lifecycle hook names or existing remove lifecycle semantics beyond scope/ordering updates.

## Decisions

### Decision: Unified hook resolution pipeline

Implement a single resolver that returns an ordered execution plan for a given lifecycle event and repository target. The plan includes script path, effective scope, target repository name, and working directory.

Rationale:
- Keeps command handlers simple and consistent.
- Centralizes ordering and filtering logic so behavior does not diverge by command.

Alternatives considered:
- Inline scope checks in each command: rejected because it duplicates logic and increases drift risk.

### Decision: Scope locations and global targeting convention

Use the following discovery locations:
- Repository-local: `<workspace>/repos/<repo>/.arashi/hooks/<lifecycle>.sh`
- Workspace-root: `<workspace>/.arashi/hooks/<lifecycle>.sh`
- User-global (all repos): `~/.arashi/hooks/<lifecycle>.sh`
- User-global (repo-specific): `~/.arashi/hooks/<repo>/<lifecycle>.sh`

Rationale:
- Satisfies the issue requirement to keep global hooks under `~/.arashi/hooks/`.
- Repo-specific global targeting is explicit and file-system based, requiring no new configuration schema.

Alternatives considered:
- File-name encoding (`<repo>.<lifecycle>.sh`): rejected because parsing and escaping repo names is less robust.
- Config-driven targeting in `~/.arashi/config.json`: rejected to avoid introducing a second global contract before validating demand.

### Decision: Failure and timeout handling across multiple hooks

Lifecycle semantics remain strict:
- `pre-*` hooks: stop execution at first failure/timeout and abort destructive operations.
- `post-*` hooks: attempt all discovered hooks; report any failures and return non-zero.

Rationale:
- Preserves existing safety behavior while extending to multi-scope execution.

Alternatives considered:
- Best-effort `pre-*` execution with warning only: rejected because it weakens precondition guarantees.

### Decision: Observable scope metadata in hook environment

Extend hook environment variables with scope metadata (for example `ARASHI_HOOK_SCOPE`, `ARASHI_HOOK_SOURCE_PATH`, and existing repo context variables).

Rationale:
- Enables scripts to branch behavior based on where they were discovered.
- Improves troubleshooting for users with layered hook setups.

Alternatives considered:
- Keep existing environment only: rejected because scope-aware behavior becomes difficult to implement/debug.

## Risks / Trade-offs

- [Risk] Additional path probes per lifecycle invocation could increase command latency in large workspaces. -> Mitigation: short-circuit checks and avoid recursive scans; test with multi-repo fixtures.
- [Risk] User-global hooks can introduce non-reproducible behavior across developer machines. -> Mitigation: document precedence clearly and expose executed hook paths in output/debug logs.
- [Risk] Running hooks in repository context may change assumptions in existing root-level scripts. -> Mitigation: preserve root-level hooks and include migration guidance with context variables.
- [Risk] Repo-specific global naming collisions or unexpected repo names. -> Mitigation: rely on exact repo directory name matching and document normalization rules.

## Migration Plan

1. Add resolver + execution-plan support behind existing hook invocation utilities.
2. Update remove lifecycle invocation to consume multi-scope execution plans.
3. Add tests for ordering, context, failures, and repo-specific global targeting.
4. Update docs/skills examples for new hook locations and precedence.
5. Rollback strategy: retain prior single-scope fallback path in code until release validation is complete.

## Open Questions

- Should user-global repo matching be case-sensitive on all platforms, or normalized per OS filesystem behavior?
- Should command output always print all executed hooks, or only when verbose/debug mode is enabled?
