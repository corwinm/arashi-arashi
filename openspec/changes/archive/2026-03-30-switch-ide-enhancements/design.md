## Context

This change spans the Arashi CLI, the VS Code extension, and the companion docs/skills repositories. The CLI already supports config-driven switch launch behavior and some VS Code-aware behavior, but it does not expose explicit IDE-targeting flags for the set of supported editors requested in issue `#128`. The extension already invokes Arashi commands and renders worktree state, but it needs to distinguish its host editor, align switch invocations with that host, and treat sibling worktrees as part of the same initialized workspace experience.

The main constraint is consistency across layers: a user-triggered switch from the CLI, from a VS Code terminal, or from the extension UI should resolve to the same launch target precedence and workspace interpretation. The extension should continue relying on machine-readable CLI responses where it parses Arashi state, while docs and skills need to stay synchronized with the shipped behavior.

## Goals / Non-Goals

**Goals:**
- Add explicit per-invocation IDE launch overrides for `arashi switch`.
- Define a single precedence order for launch target resolution across config defaults, explicit flags, and editor-environment detection.
- Make the extension detect its current host editor and pass the matching switch override automatically.
- Surface sibling worktrees in the extension and prevent misleading `init` suggestions when the current window is already a sibling of an initialized workspace.
- Document the new behavior in user docs and skills guidance.

**Non-Goals:**
- Redesign all switch launch modes or replace existing terminal/sesh behaviors.
- Add support for arbitrary editor executables beyond the explicitly requested IDEs.
- Introduce a new persistent configuration model for editor detection.
- Rework the extension UI beyond the changes required to show sibling worktrees and adjust guidance.

## Decisions

### Decision: Model launch target selection as a single resolved switch mode
The CLI should normalize config defaults, explicit IDE flags, and environment detection into one resolved launch target before execution. This keeps validation and precedence in one place and prevents the command implementation from branching independently in multiple layers.

Alternatives considered:
- Apply flag handling directly inside each launcher path: rejected because it scatters precedence logic and makes extension alignment harder.
- Let the extension decide all launch targets itself: rejected because CLI users still need the same behavior and validation.

### Decision: Use explicit IDE flags only as overrides, not new persisted defaults
The new `--vscode`, `--cursor`, and `--kiro` flags should override any configured switch default for the current invocation only. Persisted defaults should remain in existing workspace configuration so this change extends behavior without introducing another configuration surface.

Alternatives considered:
- Add new stored editor preference fields immediately: rejected because the issue asks for override behavior, not new configuration shape.
- Ignore configured defaults when editor context is detected: rejected because explicit configuration should remain authoritative unless the user overrides it.

### Decision: Detect editor host in the extension and pass through the matching CLI flag
The extension should infer its host editor using stable VS Code APIs and pass the corresponding switch flag when invoking `arashi switch`. This keeps the CLI as the source of switch behavior while allowing compatible IDEs to route to their own launcher automatically.

Alternatives considered:
- Depend only on terminal environment detection inside the CLI: rejected because extension-triggered commands may not inherit the same terminal context.
- Fork extension behavior per editor build: rejected because the existing compatibility model is one extension running across VS Code-compatible hosts.

### Decision: Treat sibling worktrees as discoverable context in the panel and workspace guidance flow
The extension should include sibling worktrees in the panel data it renders and evaluate whether the current window belongs to a sibling of an initialized workspace before showing `init` guidance. This addresses the misleading setup experience without requiring users to re-initialize related worktrees.

Alternatives considered:
- Keep the panel limited to the current workspace root only: rejected because it hides relevant sibling state and causes the incorrect `init` prompt noted in the issue.
- Suppress `init` guidance heuristically without sibling discovery: rejected because it would be brittle and hard to explain.

## Risks / Trade-offs

- [Editor detection differs between terminal-launched and extension-launched flows] -> Centralize launch-target resolution rules and cover both invocation paths in implementation tests.
- [Supported IDE CLIs may not be installed even when their environment is detected] -> Fail with actionable errors only for explicit IDE overrides; retain existing fallback behavior for implicit detection when possible.
- [Sibling discovery could surface worktrees outside the intended Arashi workspace context] -> Scope sibling detection to the same underlying repository/worktree family and label entries clearly in the panel.
- [Docs and skills drift from behavior across multiple repos] -> Include docs and skills updates in the same implementation change set and verify examples reference the new flags.

## Migration Plan

1. Add CLI launch-target parsing and detection updates in `repos/arashi/`.
2. Update extension command execution and panel/workspace detection in `repos/arashi-vscode/`.
3. Refresh docs and skills in `repos/arashi-docs/` and `repos/arashi-skills/`.
4. Validate CLI and extension behavior manually and with automated tests before release.

Rollback is low risk because the feature is additive. Reverting the change can remove the new flags and extension detection behavior without requiring data migration.

## Open Questions

- Whether Kiro exposes a stable host-identification signal through the same VS Code APIs as Cursor and VS Code should be verified during implementation.
- Whether sibling worktree discovery can reuse an existing Arashi JSON command unchanged or needs a small CLI output expansion should be determined once the extension data flow is inspected.
