## Context

Arashi is currently consumed through a terminal-first CLI, but issue #59 asks for a VS Code-native experience so developers can run common operations and manage worktrees without leaving the editor. The proposal introduces two capabilities: command integration and a worktree panel. The design must preserve existing CLI behavior, use native VS Code interaction patterns, and provide clear feedback when command execution fails.

Key constraints:
- Implementation lives in `repos/arashi-vscode`.
- The extension should reuse existing Arashi CLI functionality rather than reimplementing git/worktree logic.
- Inputs and confirmations should use native VS Code UI components.
- Worktree state should be visible and actionable from a single panel.
- Minimum extension engine should match `oil.code`: `^1.96.2`.
- The extension should remain compatible with Cursor and other VS Code forks that support standard VS Code extension APIs.

## Goals / Non-Goals

**Goals:**
- Provide VS Code commands for core Arashi flows (`init`, `add`, `create`, `switch`, `remove`) with keybinding compatibility.
- Provide a worktree explorer panel with status indicators and contextual actions (switch, remove, add repo).
- Standardize command execution, logging, and error reporting in extension code.
- Keep extension architecture maintainable and aligned with conventions from the referenced `oil.code` extension.

**Non-Goals:**
- Reimplement Arashi internals (git/worktree orchestration) inside the extension.
- Replace terminal usage for advanced or niche flags not represented in initial command UX.
- Introduce remote orchestration, cloud services, or non-VS Code editor integrations.

## Decisions

### 1) CLI-backed extension architecture

Decision: Execute Arashi operations by invoking the existing CLI from extension command handlers.

Rationale:
- Keeps one source of truth for behavior and validation.
- Reduces duplicated business logic and drift risk.
- Allows extension iterations to focus on editor UX.

Alternatives considered:
- Rebuild worktree logic directly in extension TypeScript: rejected due to high duplication and maintenance burden.
- Add a background daemon/API for editor integration first: rejected for initial scope because it adds new deployment/runtime complexity.

### 2) Central command runner and input adapters

Decision: Implement a shared command runner module that handles argument building, process execution, output capture, cancellation/timeout, and standardized error mapping. Each VS Code command uses this runner plus UI adapters (`QuickPick`, `InputBox`, modal confirmation prompts). Any command whose output is parsed by the extension must request machine-readable output via `--json`.

Rationale:
- Produces consistent UX across commands.
- Simplifies testability and future command additions.
- Enables clear user feedback through VS Code notifications and an output channel.

Alternatives considered:
- Independent per-command execution code: rejected due to duplicated error handling and inconsistent UX.

### 3) Compatibility-first API and engine target

Decision: Target the same minimum VS Code engine used by `oil.code` (`^1.96.2`) and restrict implementation to stable VS Code APIs to support Cursor and other VS Code forks.

Rationale:
- Aligns with the maintainer's proven extension baseline.
- Maximizes compatibility across VS Code-based editors.
- Avoids vendor-specific coupling that could break in forks.

Alternatives considered:
- Target newer engine and newer APIs: rejected for initial release due to reduced fork compatibility.
- Use proposed/experimental APIs: rejected because fork support is less predictable.

### 4) Worktree panel via `TreeDataProvider`

Decision: Build an Arashi worktree view using `TreeDataProvider`, backed by parsed CLI status/list output, with explicit refresh and post-command refresh hooks.

Rationale:
- Uses standard VS Code view APIs for hierarchy, actions, and context menus.
- Keeps panel state derived from authoritative CLI output.
- Supports incremental enhancement (badges, filters, repo grouping) without architectural change.

Alternatives considered:
- Custom webview panel: rejected because native tree views provide better integration and lower complexity for this use case.
- File-system-only discovery: rejected because Arashi metadata and status should remain CLI-derived.

### 5) Initial command and panel rollout strategy

Decision: Deliver commands and panel actions in phases, starting with the core command set and read-optimized panel, then adding mutating panel actions once reliability is validated. For panel mutations, require confirmation only for destructive operations (for example, remove/delete), while non-destructive actions (for example, switch) execute directly. Publish the extension to both VS Marketplace and Open VSX in the initial rollout.

Rationale:
- Reduces release risk for first extension version.
- Allows quick feedback on command UX before expanding surface area.
- Improves discoverability and installability across VS Code and VS Code forks.

Alternatives considered:
- Ship all actions and advanced configuration at once: rejected due to larger testing matrix and slower feedback loop.

## Risks / Trade-offs

- [CLI path/environment mismatch] -> Mitigation: add configurable binary path and workspace-root settings, plus startup validation with actionable errors.
- [Long-running commands can feel unresponsive] -> Mitigation: show progress notifications/spinners and stream output to a dedicated output channel.
- [CLI output format changes can break parsing] -> Mitigation: prefer machine-readable output modes where available and isolate parsers behind typed adapters.
- [Panel state can become stale] -> Mitigation: refresh after each command, expose manual refresh action, and debounce periodic refresh.
- [Cross-platform process execution differences] -> Mitigation: test on macOS/Linux/Windows shells and avoid shell-specific command composition.
- [Behavior differences across VS Code forks] -> Mitigation: stay on stable APIs, test in VS Code and Cursor, and degrade gracefully when optional features are unavailable.
- [Marketplace publishing drift across channels] -> Mitigation: automate release metadata checks and publish steps for VS Marketplace and Open VSX from the same tagged pipeline.

## Migration Plan

1. Scaffold extension project in `repos/arashi-vscode` with baseline configuration (commands, view contributions, activation events, packaging, `engines.vscode: ^1.96.2`).
2. Implement command runner + UX adapters and wire core commands.
3. Implement command JSON integration paths by adding `--json` to CLI calls that are parsed by extension logic.
4. Implement worktree `TreeDataProvider` with read-only visualization and refresh.
5. Add contextual panel actions (switch/remove/add repo) using the same runner pipeline, with confirmation only for destructive actions.
6. Validate compatibility on VS Code and Cursor.
7. Add automated tests (runner behavior, parser coverage, command registration) and manual end-to-end validation against real Arashi workspaces.
8. Publish preview release to VS Marketplace and Open VSX, gather feedback, then harden based on observed failures.

Rollback strategy:
- Disable extension commands/views by reverting extension package release; no migration of repository data is required because source of truth remains Arashi CLI + local git metadata.

## Open Questions

- Which CLI subcommands already provide stable JSON output suitable for parsing, and where do wrappers need to be introduced?
