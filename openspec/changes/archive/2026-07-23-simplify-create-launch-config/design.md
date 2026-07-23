## Context

Create currently resolves two configured values in `repos/arashi/src/commands/create.ts`: a boolean `launch` decision and a `launchMode` launcher preference. `resolveCreateDefaults()` resolves them independently and then forces `shouldSwitch` whenever launch is enabled. `repos/arashi/src/lib/config.ts` normalizes generic and editor-scoped defaults, implicitly enables launch when `launchMode` is present, and discards `launchMode` when `launch: false`; it also accepts snake-case `launch_mode` through first-defined selection without validating alias conflicts.

The same normalized `CreateCommandDefaults` type is used by terminal `defaults.create` and `defaults.editors.vscode|cursor|kiro.create`. Editor-hosted invocations deliberately use only their matching host scope and do not inherit terminal defaults. Implicit standalone create does not load configured defaults and supports only explicit invocation flags.

The shared launcher already owns automatic tmux → Herdr → cmux → integrated IDE → terminal/platform selection, strict environment evidence, subprocess argv construction, and launcher-specific failure behavior. Post-create launch occurs after successful Git worktree creation, so launcher failure preserves created worktrees. Configuration schema generation and diagnostics are owned by `src/lib/config.ts`; cross-repository contract enforcement is owned by the meta-repository.

## Goals / Non-Goals

**Goals:**

- Give every configured create scope one canonical launch choice.
- Preserve independent create switching while retaining launch-implies-switch behavior.
- Preserve explicit CLI precedence and pre-mutation launcher conflict validation.
- Preserve representable legacy create configurations with deterministic normalization and exact diagnostics while rejecting combinations that would discard one configured intent.
- Reject invalid or genuinely conflicting canonical/legacy values before repository discovery or mutation.
- Keep terminal, editor-hosted, standalone, schema, docs, generated exports, and skill guidance aligned.

**Non-Goals:**

- Change `defaults.switch.mode`, automatic launcher ordering, environment detection, or launcher protocols.
- Add explicit tmux configuration or alter #223 behavior.
- Change `--switch` / `--no-switch`, repository selection, hooks, managed-ignore reconciliation, create rollback, or move-changes behavior.
- Make editor-hosted create inherit terminal defaults.
- Add configured defaults to implicit standalone mode or broaden JSON launch support.
- Persist rewritten configuration automatically during the compatibility window.

## Decisions

### Use `launch` as the single canonical create launch choice

`CreateLaunchMode` is `"none" | "auto" | "sesh" | "herdr"`. The normalized `CreateCommandDefaults` retains `switch?: boolean` and changes `launch?: boolean` plus `launchMode?: LaunchMode` into `launch?: CreateLaunchMode`. The same type is used under terminal and every editor-hosted create scope.

`none` makes disabled launch explicit, `auto` uses the shared automatic launcher, and `sesh` / `herdr` select existing explicit launcher behavior. An absent `launch` remains equivalent to `none`, preserving the built-in explicit-flag-only behavior. The name remains `launch` because it already identifies the user decision and produces the smallest readable migration.

Alternative: rename the field to `mode`. Rejected because `defaults.create.mode` is less specific beside the independent `switch` boolean and would require replacing both existing public field names.

Alternative: retain `launchMode` and remove only the boolean. Rejected because the canonical field would keep implementation-oriented historical naming and require an additional disabled sentinel anyway.

### Resolve one configured value into existing internal execution fields

`resolveCreateDefaults()` first resolves a canonical create launch mode, then derives the existing internal `shouldLaunch` and launcher preference used by post-create execution. The public simplification does not require rewriting `launchSwitchTarget()`.

Resolution order is:

1. Reject simultaneous `--sesh` and `--herdr` before workspace discovery or mutation.
2. Explicit `--sesh` or `--herdr` selects that launcher and implies launch, even if `--no-launch` is also present, preserving current behavior.
3. Explicit `--launch` selects `auto`.
4. `--no-launch` selects `none` when no explicit launcher is present.
5. Otherwise use the matching configured canonical launch mode.
6. An absent configured launch mode resolves to `none`.

Switch resolution remains independent: explicit `--switch` / `--no-switch` overrides the configured `switch` boolean, but the final post-create switch decision is true whenever resolved launch is not `none`. Therefore a requested launch still implies selection of the newly created primary worktree and cannot be suppressed by `--no-switch`; `launch: "none"` does not suppress an independently enabled switch.

For `create --json`, Arashi resolves the matching configured launch choice after loading and validating configuration but before repository discovery or mutation. Any resolved `auto`, `sesh`, or `herdr` launch returns the existing structured unsupported-mode error; resolved `none` continues through the non-interactive JSON create path. This closes the current gap where a configured launch can otherwise be discovered only after the initial explicit-option check.

Alternative: make `--no-launch` beat explicit `--sesh` / `--herdr`. Rejected because it would reverse established CLI behavior and issue #227 explicitly preserves the explicit-command model.

### Normalize legacy configuration at each create-default scope

Canonical schema/types accept only string `launch` values and do not advertise create-specific `launchMode` or `launch_mode`. Raw runtime normalization accepts legacy booleans and launcher aliases for a bounded compatibility window at `defaults.create` and each supported `defaults.editors.<host>.create` scope.

Legacy effective-behavior mappings are:

| Legacy `launch` | Legacy launcher | Canonical `launch` |
| --- | --- | --- |
| absent | absent | absent (built-in `none`) |
| absent | `auto` | `auto` |
| absent | `sesh` / `herdr` | matching explicit mode |
| `true` | absent / `auto` | `auto` |
| `true` | `sesh` / `herdr` | matching explicit mode |
| `false` | absent | `none` |
| `false` | `auto` / `sesh` / `herdr` | reject as ambiguous |

Legacy `launch: false` plus a launcher is rejected because one canonical field cannot preserve both the explicit disabled choice and the separately authored launcher choice. The error names both values and instructs the user to choose `launch: "none"` to preserve current disabled behavior or the matching launcher mode to activate the previously inert preference.

When a canonical string and a legacy launcher alias coexist:

| Canonical `launch` | Legacy launcher | Result |
| --- | --- | --- |
| `none` | any legacy launcher | reject as conflicting |
| `auto` | `auto` | preserve `auto` |
| `auto` | `sesh` / `herdr` | reject as conflicting |
| `sesh` / `herdr` | `auto` or matching explicit launcher | preserve canonical explicit mode |
| `sesh` / `herdr` | opposite explicit launcher | reject as conflicting |

Equal camel-case and snake-case aliases collapse before mapping and emit one diagnostic only after an accepted mapping. Different alias values reject before mapping and name both fields and values. Invalid canonical strings, non-boolean/non-string launch values, invalid launcher aliases, and non-boolean `switch` values reject with scope-qualified errors rather than being silently dropped.

Accepted legacy fields produce one diagnostic per affected create-default scope with an exact replacement object/value. Diagnostics use the existing stderr warning path and never contaminate JSON stdout. Normalization is in memory only and does not rewrite the config file.

Alternative: map `launch: false` plus a legacy launcher to `none`. Rejected because that would still discard an explicitly authored launcher preference; actionable rejection lets the user preserve disabled behavior or activate the launcher intentionally.

### Keep scope precedence and standalone behavior unchanged

Terminal invocations read only `defaults.create`. Editor-hosted invocations read only `defaults.editors.<host>.create`; a missing matching host scope produces no post-create defaults instead of falling back to terminal defaults. All supported hosts use the same normalizer and vocabulary. Implicit standalone create continues to resolve only explicit flags against built-in `none` and never loads or writes configured defaults.

### Preserve launcher and post-create failure boundaries

`auto`, `sesh`, and `herdr` continue reaching the shared launcher with the same option shapes. Automatic environment detection, strict evidence, optional IDE fallback, Herdr source-checkout resolution, process argv safety, and cross-platform behavior remain unchanged. Launch runs only after successful worktree creation; any validation or process failure preserves all successful worktrees and reports creation separately from launch failure without falling back from an explicit launcher.

### Treat schema, generated artifacts, and companion guidance as one contract

Generated schema exposes `switch?: boolean` and `launch?: "none" | "auto" | "sesh" | "herdr"` for `CreateCommandDefaults`, with no canonical create `launchMode`. CLI source/content tests, the meta cross-repository checker, canonical docs/export tests, and skill package tests must fail if any surface retains the two-field authored model or disagrees on vocabulary, migration, precedence, or launch-implies-switch behavior. The VS Code extension requires no code change because it already supplies only `--editor-host`; its supported host scope consumes the normalized CLI config.

The CLI-generated schema is authoritative for the canonical field/type. Structured companion contract records SHALL compare at least: canonical field `defaults.create.launch`; modes `none|auto|sesh|herdr`; absent behavior `none`; independent boolean `switch`; launch-implies-switch; supported editor hosts `vscode|cursor|kiro`; legacy fields `launch` boolean, `launchMode`, and `launch_mode`; and accepted/rejected migration classifications. The deterministic meta checker compares normalized semantic values rather than only field presence or shared hardcoded labels, and a controlled out-of-repository mismatch must prove disagreement exits unsuccessfully.

## Risks / Trade-offs

- [The canonical schema rejects legacy booleans or launcher fields that runtime still accepts] → Document the bounded compatibility window, emit exact stderr migration guidance, and retain runtime tests until a future config-version proposal removes the reader.
- [Using the existing `launch` name with a new type can be missed during manual review] → Add source/schema/contract tests that require the exact enum and forbid canonical create `launchMode`.
- [Legacy `launch: false` plus a launcher was previously disabled but retains two authored intents] → Reject it before mutation and offer exact `none` and matching-launcher alternatives.
- [Nested defaults could continue silently dropping invalid values] → Pass scope-qualified error and diagnostic collectors through generic and editor normalizers and prove rejection before discovery/mutation in real temporary workspaces.
- [Warnings could corrupt machine output] → Route compatibility diagnostics to stderr and verify JSON stdout remains exactly one structured document.
- [Companion repositories could drift] → Update the semantic contract manifest/checker and verify it with a controlled out-of-repository mismatch.
- [Launcher refactoring could alter rollback or fallback] → Keep the executor boundary unchanged and add focused tests that assert created worktrees survive launcher validation/process failures.

## Migration Plan

1. Add failing configuration/schema tests for canonical modes, every legacy mapping, aliases, invalid/conflicting values, scope-qualified diagnostics, and JSON stdout isolation.
2. Add failing create-resolution and real temporary-workspace tests for terminal/editor scopes, explicit overrides, launch-implies-switch, disabled launch, automatic/sesh/Herdr behavior, non-mutation, failures, and argv/path safety.
3. Replace the canonical create type and normalizer, derive existing internal execution fields from one mode, and regenerate schema/contracts.
4. Add source-content checks, update authored CLI/docs/skills guidance, regenerate derived Markdown/LLM/package artifacts, and update cross-repository enforcement.
5. Release with runtime legacy acceptance. A later config-version proposal may remove boolean/launcher alias compatibility after the documented window.

Rollback requires restoring the two-field schema/resolver. Configurations already migrated to string `launch` values require the new release, so rollback guidance maps `auto|sesh|herdr` back to `launch: true` plus the corresponding `launchMode`, and maps `none` to `launch: false`.

## Open Questions

None. The canonical field is `launch`, and explicit configured tmux remains outside this change until its launcher contract is adopted.
