## Why

Configured `arashi init` currently persists `.arashi/worktrees` in both normal and bare Git repositories. In a bare repository that puts checked-out worktrees beneath Git storage, while Arashi's existing bare-create path strategy and configurable parent-relative locations already support the more natural sibling layout.

## What Changes

- Detect whether the resolved configured-init workspace is bare, canonicalize a bare invocation to Git's absolute repository directory, and select the omitted `--worktrees-dir` default from that repository type.
- Persist `..` for bare repositories and retain `.arashi/worktrees` for non-bare repositories; an explicit `--worktrees-dir` remains authoritative in either repository type.
- Carry the same resolved value through dry-run human output, ordinary success output, preference-only and standard single-envelope JSON results, configuration persistence, rollback decisions, and subsequent create-path calculation.
- Treat managed paths resolved from a bare root as outside Git worktree ignore semantics: report the parent default as external/unsafe, report bare-root subdirectories as non-applicable, and do not run worktree-dependent ignore inspection or write `.gitignore`/local-exclude rules from bare init under `local`, `tracked`, or `none` scope.
- Preserve existing-config/`--force`, path normalization, non-bare bootstrap and dry-run bootstrap, zero-config, JSON isolation, and rollback behavior; unsafe or non-applicable paths do not act as residual-state guards.
- Explain the repository-aware default in CLI help and initialization/configuration documentation.

## Capabilities

### New Capabilities

- `init-repository-aware-worktree-default`: Defines repository-type detection, omitted-versus-explicit precedence, persistence, preview behavior, subsequent bare create placement, and user-facing guidance for configured initialization.

### Modified Capabilities

- `configurable-worktree-location`: Distinguishes initialization-time repository-aware defaults from the legacy fallback used when an existing configuration omits `worktreesDir`, while preserving shared path normalization and create-path resolution.
- `managed-git-ignore-reconciliation`: Requires configured bare init to treat the parent-directory worktree default as an unsafe managed path and preserve ignore and rollback safety.
- `machine-readable-cli-output`: Requires configured init dry-run and success JSON to expose the repository-aware resolved worktree location without human-output leakage.

## Impact

- CLI implementation and tests in `repos/arashi`, primarily `src/commands/init.ts`, bare/create path integration coverage, init integration coverage, CLI help, generated command contracts, and init/configuration docs.
- Canonical OpenSpec requirements for initialization defaults, configurable worktree locations, managed ignore safety, and init JSON output.
- Companion documentation in `repos/arashi-docs`; `repos/arashi-skills` guidance and the cross-repository contract surface require review for semantic drift.
- No configuration schema shape change and no dependency change.
