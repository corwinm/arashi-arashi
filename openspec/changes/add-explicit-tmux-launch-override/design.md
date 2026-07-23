## Context

The shared switch launcher already has a plain-tmux automatic branch. When strict managed-context detection sees a non-empty `TMUX`, it invokes `tmux new-window -c <worktree-path>` as an argv array and reports `mode: "tmux"`. Explicit selection currently exists for sesh, Herdr, and supported IDEs, but not for plain tmux. Switch and create each resolve overrides separately, and configuration currently exposes `sesh` and `herdr` as named launch modes but omits `tmux`.

This change crosses CLI parsing, precedence resolution, preflight validation, JSON safety, canonical documentation, and packaged skill guidance. It must preserve automatic tmux precedence, configured mode vocabularies, and every unrelated fallback when `--tmux` is absent.

## Goals / Non-Goals

**Goals:**

- Provide deterministic plain-tmux selection for switch and post-create launch in configured and standalone repositories.
- Make an explicit schema decision and keep this slice per-invocation-only, while preserving configured `auto` as the persistent way to select tmux contextually.
- Fail closed when tmux is selected without an active tmux session or alongside another explicit behavior.
- Reuse the existing argv-safe launcher and preserve structured result/error contracts.
- Keep help, schema, docs, and skill guidance synchronized.

**Non-Goals:**

- Creating or attaching a tmux server/session when `TMUX` is absent.
- Replacing sesh, changing automatic managed-context precedence, or changing tmux window naming.
- Adding VS Code UI controls for tmux.
- Rolling back successfully created worktrees when a tmux process fails after preflight.

## Decisions

### Treat plain tmux as a first-class forced launch mode

Add a `tmux` boolean to the shared launch options and resolve it before Herdr, IDE, and automatic context detection. The forced branch validates `TMUX`, then calls the same helper/path used by automatic tmux. This avoids duplicating command construction and guarantees paths with spaces or shell-significant characters remain one argv entry.

Alternative: temporarily inject or reinterpret environment detection. Rejected because it obscures explicit intent, couples precedence to environment mutation, and makes missing-context behavior harder to distinguish from automatic fallback.

### Keep configuration vocabularies unchanged in this slice

`--tmux` is a deterministic one-invocation override. `defaults.switch.mode` remains `auto | cd | launch | sesh | herdr`, and create `launchMode` remains `auto | sesh | herdr`. Configured `auto` already selects plain tmux when active tmux evidence is present, so configured projects retain a persistent contextual path without broadening legacy normalization, generated schema, docs contracts, and skill configuration surfaces as part of an explicit-flag feature.

Alternative: add first-class configured `tmux` modes now. Rejected for this slice because issue #223 primarily closes the explicit-override gap, and adding a persisted mode expands legacy switch migration and generated cross-repository contracts beyond what is needed. A later configuration proposal can add it deliberately if users need forced tmux persistence outside contextual `auto`.

### Validate conflicts and missing tmux context before mutation when determinable

Switch resolves explicit launcher conflicts and `--cd` conflicts before selection launch. Create validates mutually exclusive explicit launchers and, when explicit tmux launch is active, checks for a non-empty trimmed `TMUX` before worktree creation. Missing context receives a dedicated error code/message that tells the user to run inside tmux or choose a different launcher. No fallback is attempted.

A tmux subprocess failure after successful preflight remains a launch failure. For create, successfully created worktrees remain available, matching existing post-create launcher failure semantics.

Alternative: let create finish and fail only inside the launcher. Rejected for the cheap, deterministic missing-context case because an invalid explicit usage should not mutate repositories.

### Model explicit launcher resolution as one discriminated choice

Switch conflict collection gains `tmux`; create conflict validation counts `tmux`, `sesh`, and `herdr` and reports the complete deterministic flag list. Resolution maps the selected named mode to one shared-launcher options object. This prevents boolean combinations and precedence conditionals from drifting as launchers are added.

### Preserve JSON non-mutation

`create --json --tmux` is rejected before worktree creation using the existing structured unsupported-mode envelope. Switch JSON with explicit tmux returns the structured unsupported-mode result and never invokes tmux. Both the Commander action and lower-level exported executor enforce each JSON guard so direct callers cannot bypass non-mutation. Human-readable errors for missing tmux context remain usage errors; JSON execution emits exactly one JSON document on stdout and keeps diagnostics off stdout.

### Update command contracts while proving config contracts do not change

Canonical command help and docs are updated first; agent-readable docs exports and skill contract checks are regenerated or updated only through their owning repositories. Existing configuration type, normalization, schema, and switch-config contract tests shall prove that `tmux` was not added as a persisted mode accidentally.

## Risks / Trade-offs

- [Explicit tmux can be confused with automatic tmux detection] → Documentation distinguishes `--tmux` from configured/automatic `auto` and states that forced mode never falls back.
- [Preflight timing can diverge between switch and create] → Add focused tests proving missing explicit tmux context causes no switch launch and no create mutation.
- [Multiple boolean flags can create order-dependent errors] → Collect all explicit launcher names before resolution and reject the complete set deterministically.
- [A flag-only change can accidentally broaden persisted configuration] → Keep config sources untouched and run schema and switch-config contract tests as explicit no-change evidence.
- [Existing launch behavior regresses] → Keep automatic launcher code path unchanged and add no-flag regression coverage for tmux, Herdr, cmux, IDE, terminal, and platform fallback resolution.

## Migration Plan

1. Add the runtime flag contract and tests in `repos/arashi`, then regenerate help-derived contracts and verify config artifacts are unchanged.
2. Update canonical docs in `repos/arashi-docs` and skill references in `repos/arashi-skills` against the released CLI contract.
3. Release as a backward-compatible feature. Existing configuration and commands require no migration.
4. If rollback is required, remove the new flags; no configuration migration is required.

## Open Questions

None. The proposal resolves the schema decision in favor of a per-invocation-only first slice.
