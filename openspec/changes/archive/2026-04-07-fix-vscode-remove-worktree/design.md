## Context

The VS Code extension already owns the remove confirmation UX for both command-palette and panel-triggered worktree removal. In `createCommandHandlers`, both remove entry points confirm in native VS Code UI and then call `buildRemoveArgs({ target, pathMode: true })`, but the helper currently builds only the target path and `--path`. That leaves `arashi remove` free to prompt for confirmation again, which breaks extension-driven removal because the command is launched without an interactive terminal flow for answering that prompt.

The extension also executes several commands that can take noticeable time, such as add, clone, pull, sync, switch, create, init, and remove, but it currently waits silently until success or failure notifications appear. That makes it hard to distinguish a slow operation from a stuck one.

The main constraint is preserving the existing extension contract: the editor, not the CLI, should own selection and confirmation UX for extension-driven commands. The fix should stay inside `repos/arashi-vscode/`, keep exact path targeting, avoid changing CLI behavior or command names, and keep VS Code UI APIs out of the core command logic where possible.

## Goals / Non-Goals

**Goals:**
- Make extension-driven remove flows succeed after a single native VS Code confirmation.
- Ensure both command-palette removal and panel trash-button removal invoke `arashi remove` against the exact selected worktree in forced non-interactive mode.
- Show native in-progress feedback for long-running extension command executions.
- Add regression coverage for confirmed removal, progress wrapping, and cancellation behavior.

**Non-Goals:**
- Change the Arashi CLI remove contract or introduce new CLI flags.
- Redesign VS Code notifications, tree item labels, or remove command names.
- Add new multi-step confirmation UI beyond the existing extension confirmation prompt.

## Decisions

### Decision: Treat the VS Code confirmation as the authoritative destructive-confirmation step
After the user confirms removal in the extension, the extension should invoke `arashi remove` with `--force` so the CLI does not ask for confirmation again. This keeps the destructive decision in the native VS Code UI where the user initiated the action and matches the extension's existing responsibility for collecting inputs before command execution.

Alternatives considered:
- Keep the CLI confirmation and try to surface it interactively from the extension: rejected because the current extension flow is not terminal-interactive and would remain fragile.
- Change the CLI to auto-detect extension callers: rejected because the problem is specific to extension argument construction, not the CLI contract.

### Decision: Keep remove targeting centralized in the shared remove-argument helper
Both remove entry points already resolve an exact worktree path before invocation, so the smallest correct change is to keep using the shared remove helper and extend it to build the full non-interactive argument list for extension-driven removal. This avoids duplicating `--force` wiring across handlers and keeps command-palette and panel flows aligned.

Alternatives considered:
- Append `--force` separately in each handler: rejected because it duplicates the same contract in multiple call sites.
- Introduce a separate helper just for panel removal: rejected because both entry points need identical CLI behavior.

### Decision: Cover the regression at both helper and command-handler levels
Unit coverage should verify the final remove argument list includes forced path mode, and integration coverage should verify that cancelled removals do not execute the CLI while confirmed removals do. Progress coverage should assert that long-running command handlers route execution through a shared progress wrapper. This combination protects both the argument contract and the user-visible flow.

Alternatives considered:
- Only add integration coverage: rejected because a helper-level assertion catches accidental argument regressions more directly.
- Only add unit coverage: rejected because the bug is user-visible in command-handler execution, not just argument assembly.

### Decision: Inject a shared progress runner from the extension host
The command handlers should accept a single progress-runner dependency that wraps async command execution, while the VS Code extension host supplies the concrete `window.withProgress` implementation. This keeps VS Code UI details out of the handler logic, avoids duplicating spinner code across commands, and lets tests assert progress behavior with a simple mock.

Alternatives considered:
- Call `window.withProgress` directly from each handler: rejected because it would spread UI concerns across many command flows.
- Add progress only for remove: rejected because other long-running commands already share the same stalled-looking behavior.

## Risks / Trade-offs

- [Forced remove could bypass safety if a future caller uses the helper without confirmation] -> Keep extension remove flows routed through confirmation-first handlers and cover cancellation behavior in tests.
- [Spec and implementation could drift between command-palette and panel flows] -> Reuse the same remove helper and add integration assertions for extension-triggered removal.
- [Success messaging may obscure whether the CLI was actually invoked with forced mode] -> Assert the executed command arguments directly in tests.
- [Frequent progress notifications could become noisy] -> Restrict the wrapper to command executions that can take noticeable time and reuse concise titles.

## Migration Plan

1. Update the VS Code remove argument builder so extension-driven remove invocations include `--force` together with exact path targeting.
2. Keep the current confirmation prompts in both remove handlers and continue to short-circuit when the user cancels.
3. Route long-running command executions through a shared VS Code progress-notification wrapper supplied by the extension host.
4. Add or update unit and integration tests in `repos/arashi-vscode/tests/` to verify forced invocation, progress wrapping, and cancellation behavior.
5. Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi-vscode/` when implementation begins.

Rollback is low risk because the change is confined to extension argument construction and tests.

## Open Questions

- None.
