## Context

Switch currently resolves two independent configured values in `src/commands/switch.ts`: `resolveSwitchBehavior()` chooses `launch`, `cd`, or `auto`, while `resolveLaunchOptions()` chooses `auto`, `sesh`, or `herdr`. Because behavior is resolved first, `auto` immediately becomes `cd` whenever a shell directive is available and the launcher phase never observes managed tmux, Herdr, cmux, or IDE context.

The shared launcher in `src/lib/switch-launcher.ts` already owns strict environment detection and the automatic order tmux → Herdr → cmux → integrated IDE → terminal application → platform fallback. Configuration normalization and schema generation are owned by `src/lib/config.ts`; current normalization also accepts snake-case `launch_mode`. The repository keeps config version `1.0.0`, so compatibility must be handled without assuming a version bump.

## Goals / Non-Goals

**Goals:**

- Give users one canonical `defaults.switch.mode` choice.
- Preserve current CLI override and conflict semantics.
- Reuse one strict managed-context detector for both auto behavior selection and actual launcher selection.
- Preserve readable legacy configurations through deterministic normalization and actionable diagnostics.
- Keep configured and standalone behavior, generated contracts, docs exports, and skill guidance aligned.

**Non-Goals:**

- Change `defaults.create` or editor-scoped create defaults.
- Add the explicit `--tmux` behavior tracked by #223.
- Change launcher subprocess protocols, Herdr source resolution, cmux validation, IDE evidence, terminal-app detection, or fallback commands.
- Add JSON launch support to `switch`.

## Decisions

### Use one canonical switch mode with internal behavior and launcher phases

`SwitchMode` becomes `"auto" | "cd" | "launch" | "sesh" | "herdr"`. The normalized `SwitchCommandDefaults` exposes only `mode`; the generated schema and new examples therefore cannot compose two public values.

The command may still derive an internal behavior (`cd` or `launch`) and an internal launcher preference (`auto`, `sesh`, or `herdr`). Keeping those phases internal avoids rewriting the shared launcher while removing the confusing public composition.

`tmux` is not added to the configured enum in this change because #223 owns the explicit tmux contract. The mode resolver should remain easy to extend when that work lands.

Alternative: retain `launchMode` and add cross-field validation. Rejected because users would still need to understand two implementation phases and common intent such as “always use Herdr” would remain verbose.

### Preserve a precise precedence algorithm

Resolution order is:

1. Validate explicit launcher conflicts and `--cd` conflicts.
2. Explicit launcher flags force launch with that launcher.
3. `--cd` requests only parent-shell switching; if unavailable it warns and does not launch.
4. `--no-cd` forces launch while retaining a configured explicit launcher unless `--no-default-launch` also opts out.
5. A configured explicit launcher mode (`sesh` or `herdr`) forces launch; `--no-default-launch` converts it to automatic `launch` for that invocation.
6. Configured `cd` requests parent-shell switching and retains its existing unavailable-shell warning plus automatic launch fallback.
7. Configured `launch`, or an absent mode, uses automatic launcher selection without preferring `cd`.
8. Configured `auto` launches when a strict managed context is detected; otherwise it uses parent-shell `cd` when available; otherwise it uses automatic launcher selection and its terminal/platform fallback.

An absent mode continues to mean `launch`, preserving the existing built-in behavior for configurations and standalone workspaces that do not opt into `auto`.

Alternative: make absent mode mean `auto`. Rejected because that would silently redirect existing shell-integrated users from generic launch behavior to `cd` when no managed context exists.

### Extract a pure managed-context detector from the shared launcher

Add a side-effect-free detector that classifies only automatic managed contexts in the established order: active tmux, exact Herdr evidence, non-empty cmux workspace/surface evidence, then supported integrated IDE evidence. `executeSwitch()` uses only the presence of this classification to decide whether `auto` enters the launch phase. `launchSwitchTarget()` uses the same detector/order to perform the selected launch, preventing detection drift.

Terminal-application signals and generic platform fallback are not managed contexts for deciding between launch and `cd`. They remain available after `auto` reaches launch because neither a managed context nor shell integration is available. A detected integrated IDE whose CLI is unavailable follows the existing optional-IDE chain into terminal-application/platform fallback and does not fall back to `cd`; once a managed launcher subprocess is invoked, or a strict tmux/Herdr/cmux contract is selected, validation or execution failure remains a launch failure and does not silently fall through to `cd` or another launcher.

Alternative: probe launcher availability before choosing launch. Rejected because existing automatic behavior treats validated environment evidence as context and owns availability/failure semantics at the launcher boundary.

### Normalize legacy two-field configurations at the config boundary

The canonical TypeScript config and generated schema remove `defaults.switch.launchMode`, but raw normalization continues reading `launchMode` and `launch_mode` during a documented compatibility window.

Mappings are:

| Legacy `mode` | Legacy `launchMode` | Unified mode |
| --- | --- | --- |
| absent | absent | absent (built-in `launch`) |
| absent | `auto` | `launch` |
| absent | `sesh` / `herdr` | matching explicit mode |
| `launch` | absent / `auto` | `launch` |
| `launch` | `sesh` / `herdr` | matching explicit mode |
| `auto` | absent / `auto` | `auto` |
| `auto` | `sesh` / `herdr` | matching explicit mode |
| `cd` | absent / `auto` | `cd` |
| `cd` | `sesh` / `herdr` | reject as ambiguous |
| `sesh` | absent / `auto` / `sesh` | `sesh` |
| `sesh` | `herdr` | reject as conflicting |
| `herdr` | absent / `auto` / `herdr` | `herdr` |
| `herdr` | `sesh` | reject as conflicting |

If both camel-case `launchMode` and snake-case `launch_mode` are present, equal values are treated as one legacy value and produce one migration diagnostic; conflicting values are rejected before mode mapping with an error naming both fields. The explicit launcher wins for legacy `auto` combinations so configured intent is not discarded merely because shell integration is active. A `cd` plus explicit launcher combination cannot be represented faithfully: current behavior uses the launcher only as an unavailable-shell or `--no-cd` fallback. A unified explicit mode plus `auto` or the same legacy explicit launcher is redundant and preserves the unified mode, while the opposite explicit launcher is conflicting. Rejected combinations raise a configuration error naming every conflicting field/value and give equivalent single-mode alternatives instead of selecting one silently.

Accepted legacy fields produce one deprecation/migration diagnostic per loaded configuration, with the computed unified replacement. Diagnostics must not contaminate JSON stdout; human commands emit them through the normal warning channel, while structured/config-health surfaces retain machine-readable separation. Canonical serialization, schema, docs, and examples emit only `mode`.

Alternative: leave the deprecated property in `SwitchCommandDefaults`. Rejected because generated schema and downstream types would continue advertising two public choices.

### Keep `--no-default-launch` as a compatibility opt-out

The flag remains supported. It bypasses only configured explicit launcher modes (`sesh` or `herdr`) and falls back to automatic `launch`; it does not suppress `cd`, `auto`, or `launch` behavior modes. This matches its current purpose rather than turning it into a broad “ignore all switch defaults” flag.

### Treat generated and companion surfaces as one contract

The CLI source type drives the schema; command help/contract checks, maintained CLI docs, canonical docs and generated agent exports, and skill references must use the same mode vocabulary and migration table. Source-content drift tests precede regeneration so generated output cannot mask stale authored guidance.

## Risks / Trade-offs

- [The schema rejects a legacy property that the runtime still accepts temporarily] → Document the compatibility window and exact replacement, emit a migration diagnostic, and keep tests proving runtime mappings until the compatibility path is intentionally removed in a future config-version change.
- [Auto behavior and launcher selection could detect contexts differently] → Export one pure detector from the launcher module and test every strict signal plus precedence collisions through both callers.
- [A warning could break machine-readable output] → Route migration diagnostics away from JSON stdout and retain the existing structured unsupported result for `switch --json`.
- [Legacy `auto` plus explicit launcher changes shell-integrated behavior] → Preserve the explicit configured launcher intentionally, warn with the exact normalized mode, and document the mapping.
- [Future #223 work adds tmux to the mode enum] → Keep mode-to-internal-launcher resolution exhaustive and localized; do not partially advertise configured tmux before its explicit launcher contract lands.
- [Companion repositories drift from the CLI schema] → Add/update focused source checks and run the canonical workspace contract checker after each companion implementation.

## Migration Plan

1. Add failing config normalization/schema tests for unified modes, all legacy mappings, ambiguous rejection, and diagnostic isolation.
2. Add failing switch tests for mode/CLI precedence and all managed-context, shell-active, shell-inactive, and fallback branches.
3. Implement the config normalizer and shared detector/resolver, then regenerate schema and command contracts.
4. Update authored CLI docs, canonical docs/export generation sources, and skill references; regenerate and validate derived artifacts.
5. Release with legacy runtime acceptance and migration diagnostics. A later config-version proposal may remove the legacy raw-field reader after the documented compatibility window.

Rollback is source-compatible: restoring the prior resolver and schema restores the two-field model. Configurations already migrated to `mode: "sesh"` or `mode: "herdr"` require the new release, so rollback guidance must restore the equivalent legacy `mode: "launch"` plus `launchMode` pair.

## Open Questions

None. Explicit configured tmux remains owned by #223 and can extend the unified mode set after its launcher contract is approved.
