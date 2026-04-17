## Context

The CLI already supports workspace-scoped `defaults.create` settings, and the VS Code extension already detects which editor host it is running in for switch flows. Today, extension-driven `arashi create` invocations do not identify that host to the CLI, so the CLI resolves the same post-create defaults it would use for a terminal invocation.

That creates a mismatch between intent and behavior. Terminal defaults are often chosen to open a new shell or editor window after create, while an extension flow is already running inside an editor and usually wants to stay in that context unless the workspace explicitly configures otherwise. The fix needs to preserve current terminal behavior, avoid surprising extra launches from the extension, and fit into the existing `.arashi/config.json` defaults model without introducing a second unrelated configuration system.

## Goals / Non-Goals

**Goals:**
- Let the CLI resolve create defaults differently for editor-hosted invocations than for terminal invocations.
- Add a config shape for editor-specific create overrides that can be keyed by supported editor host.
- Make the VS Code extension pass its detected host when invoking `arashi create`.
- Define deterministic precedence so explicit CLI flags still win and editor-hosted create falls back to no defaults when no editor override exists.

**Non-Goals:**
- Redesigning the existing `create` CLI flag surface beyond the minimum host-context input needed for extension calls.
- Changing switch-command host override behavior, which already has explicit editor flags.
- Adding editor-specific defaults for unrelated commands unless they are required to support create.
- Changing terminal invocation behavior for workspaces that already rely on `defaults.create`.

## Decisions

### 1) Add host-scoped create overrides under the existing defaults tree
Extend the config structure under `defaults` with an editor-scoped section keyed by supported hosts, for example `defaults.editors.vscode.create`. Reusing the current defaults tree keeps create behavior discoverable in one place and lets the CLI normalize one config model instead of merging separate top-level concepts.

**Alternatives considered:**
- Add a new top-level `editorDefaults` block: rejected because it splits closely related create-default behavior across two config roots.
- Store extension-only settings inside the VS Code extension config: rejected because the desired behavior is workspace-specific and should travel with `.arashi/config.json`.

### 2) Pass editor host explicitly from extension to CLI create invocations
Add a dedicated create invocation input for editor host context, such as a hidden or internal `--editor-host <host>` argument. The extension already resolves `vscode`, `cursor`, or `kiro`, so it can pass that context directly instead of relying on ambient environment detection.

**Alternatives considered:**
- Infer host from environment variables in the CLI: rejected because subprocess environments vary and the extension already has a more reliable host signal.
- Reuse `--vscode` or similar launch flags for create context: rejected because those flags express launch behavior, not config-resolution context.

### 3) Use no-default fallback for editor-hosted create when no editor override exists
When `arashi create` is invoked with an editor host, resolution order becomes: explicit positive flags, explicit opt-out flags, host-specific create defaults, then no post-create defaults. Generic `defaults.create` continues to apply to terminal invocations only.

This matches the issue's intent: extension-driven create should either override the generic defaults or behave as if no defaults were configured. It also avoids duplicate editor launches and other terminal-oriented post-create actions when the extension did not ask for them.

**Alternatives considered:**
- Fall back from host-specific defaults to generic `defaults.create`: rejected because it preserves the current surprising behavior for extension-driven create.
- Always disable defaults for extension flows with no config support: rejected because users explicitly asked for configurable editor or extension defaults.

### 4) Reuse existing create-default resolution and extension argument builders
Implement the change by extending the current create-default resolution path in the CLI and the existing `buildCreateArgs` logic in the extension. This keeps the change localized to the code that already owns default resolution and command invocation, which minimizes regression risk and keeps tests focused.

**Alternatives considered:**
- Add a separate extension-only create command in the CLI: rejected because it would duplicate the existing create flow.
- Hardcode `--no-switch --no-launch` in the extension: rejected because it blocks editor-specific defaults and pushes policy into the wrong layer.

## Risks / Trade-offs

- [Config shape becomes harder to understand] -> Mitigate by keeping editor overrides nested under the existing `defaults` tree and documenting precedence with examples.
- [CLI host-context argument leaks into general user-facing docs] -> Mitigate by treating it as extension-oriented plumbing and exposing only the behavior contract in user docs.
- [Editor-specific fallback surprises users who expected generic defaults to carry over] -> Mitigate by documenting that editor-hosted create is intentionally isolated from terminal defaults unless the workspace opts in.
- [Host list grows over time] -> Mitigate by centralizing the supported host enum already shared by the extension and CLI.

## Migration Plan

1. Extend CLI config types, normalization, and schema generation to support editor-scoped create defaults.
2. Add create invocation support for editor-host context and update default-resolution logic to branch on that context.
3. Update the VS Code extension create flow to pass the detected editor host when available.
4. Add CLI and extension tests for terminal precedence, editor override precedence, and no-default fallback behavior.
5. Update user-facing config guidance with examples for generic create defaults versus editor-specific create defaults.
6. Rollback strategy: remove the new editor-scoped config entries and stop passing editor-host context; terminal behavior remains unchanged.

## Open Questions

- Final config key naming: should the nested section be `defaults.editors`, `defaults.extension`, or another host-scoped label?
- Should unknown editor-host values be rejected at argument-parse time or ignored as "no host context"?
- Do we want to expose the host-context argument in CLI help, or keep it as an internal extension-facing contract?
