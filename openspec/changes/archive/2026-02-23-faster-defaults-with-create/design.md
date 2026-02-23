## Context

`arashi create` and `arashi switch` already support interactive and flag-driven flows, but users still need to repeatedly pass launch options to reach their preferred working environment. The change introduces config-driven defaults so common post-create/post-switch actions happen automatically while preserving explicit CLI control for one-off runs.

The implementation must work across existing workspace setups that use `.arashi/config.json`, keep current behavior unchanged when defaults are not configured, and remain compatible with existing shell/editor launch integrations.

## Goals / Non-Goals

**Goals:**
- Allow users to configure default `create` actions: auto-switch and optional shell/editor command execution.
- Add one-off opt-out flags so CLI invocation can bypass configured defaults without editing config.
- Extend equivalent default launch behavior to `switch`.
- Define deterministic precedence between config defaults and CLI flags.
- Keep default behavior backward compatible for users with no new config entries.

**Non-Goals:**
- Redesigning the entire command option surface for `create` and `switch`.
- Adding new terminal/editor integrations beyond existing launch mechanisms.
- Introducing persistent state outside `.arashi/config.json`.
- Implementing workflow automation beyond create/switch (for example `pull`, `sync`, or `remove`).

## Decisions

### 1) Add command-scoped default settings in config
Use command-scoped config sections for `create` and `switch` defaults (for example, switch-after-create and launch command defaults). This keeps behavior explicit and avoids coupling unrelated commands.

**Alternatives considered:**
- Single global default launch block for all commands: rejected because different commands need different default semantics.
- Per-repository defaults only: rejected because users asked for ergonomic workspace-level defaults.

### 2) Precedence model: explicit CLI flag > explicit opt-out flag > config default > built-in default
Resolution order is deterministic. If a user passes a positive flag, it wins. If a user passes an opt-out flag, it disables that default for the invocation. If neither is passed, config defaults apply. If config is absent, existing built-in behavior remains.

**Alternatives considered:**
- Config default overriding explicit flags: rejected because CLI should be authoritative for one-off actions.
- Implicit inference from command combinations: rejected due to ambiguity and surprising behavior.

### 3) Introduce explicit opt-out flags for default-driven behavior
Add invocation-level negation flags (e.g., `--no-switch`, `--no-sh` or equivalent final naming in spec implementation) where defaults could otherwise trigger actions. This makes default automation reversible per command run.

**Alternatives considered:**
- One blanket `--no-defaults` only: rejected because users often want to disable just one action.
- No negation flags: rejected because config defaults would become hard to bypass.

### 4) Reuse existing launch execution path for switch/create
Default launch behavior should flow through the same shell/editor execution pathway already used by explicit options. This minimizes divergence, keeps telemetry/logging consistent, and reduces test matrix complexity.

**Alternatives considered:**
- Separate default-only execution path: rejected due to duplication and drift risk.

## Risks / Trade-offs

- [Flag naming collision or ambiguity] -> Mitigate by defining canonical names in specs and adding parser tests for conflict/error cases.
- [Unexpected behavior for users upgrading with pre-existing config patterns] -> Mitigate with strict backward-compatibility defaults and docs examples for migration.
- [Cross-command inconsistency between create and switch] -> Mitigate by implementing a shared default-resolution utility and validating with integration tests.
- [Platform-specific shell launch edge cases] -> Mitigate by reusing existing launch path and expanding tests for command invocation composition.

## Migration Plan

1. Extend config schema and parser to recognize new default fields while treating missing fields as no-op.
2. Update `create` option resolution to merge CLI flags and config defaults with defined precedence.
3. Update `switch` option resolution to apply equivalent default launch semantics.
4. Add unit/integration tests for config defaults, opt-out flags, and precedence behavior.
5. Update command help and user docs with examples and opt-out usage.
6. Rollback strategy: remove new config keys or disable defaults; behavior falls back to current explicit-flag-only flow.

## Open Questions

- Final flag names: should command-specific opt-outs be `--no-switch`/`--no-sh`, a unified `--no-defaults`, or both?
- Should `switch` support opt-out for launch only, or also a broader default-bypass flag for future extension?
- Should invalid config default combinations fail fast or warn and ignore invalid portions?
