## Context

Arashi centralizes post-selection launch behavior in `launchSwitchTarget`. Both `arashi switch` and `arashi create --launch` call this helper, which currently prioritizes explicit sesh, explicit IDE launchers, active tmux, detected IDEs, detected terminal apps, and platform fallbacks. cmux is Ghostty-based and exports `TERM_PROGRAM=ghostty`, so the current terminal-app detection treats a cmux terminal as standalone Ghostty.

cmux-managed terminals export `CMUX_WORKSPACE_ID` and `CMUX_SURFACE_ID`. The current cmux release exposes a structured namespaced command that can create a workspace at an explicit directory, focus it atomically, and return JSON: `cmux workspace create --cwd <path> --focus true --json`. The integration must remain shell-safe by passing the worktree path as a process argument, not interpolating it into a shell command.

## Goals / Non-Goals

**Goals:**

- Detect active cmux terminal sessions without confusing ordinary Ghostty or a manually configured socket with active cmux context.
- Open and focus an exact Arashi worktree in a new cmux workspace through the shared launcher.
- Reuse the same behavior for `switch` and post-create launch flows.
- Return a distinct `cmux` launch mode and fail with actionable context when cmux launch cannot complete.
- Preserve current explicit IDE, tmux/sesh, and terminal fallback precedence.
- Document and test the external cmux contract Arashi relies on.

**Non-Goals:**

- Add an explicit `--cmux` flag or a new configuration value in the first release.
- Manage cmux workspace lifecycle after launch, including closing workspaces when Arashi worktrees are removed.
- Name, color, group, split, or seed commands in newly created cmux workspaces.
- Connect directly to the cmux Unix socket or add a cmux client dependency.
- Emulate multiple historical cmux CLI contracts through legacy create-then-select fallbacks.

## Decisions

### Detect cmux from managed-terminal identifiers

Add a focused cmux detector that returns true when `CMUX_WORKSPACE_ID` or `CMUX_SURFACE_ID` is a non-empty string. Do not detect cmux from `TERM_PROGRAM=ghostty` or `CMUX_SOCKET_PATH` alone: Ghostty is shared by both products, and a socket path can be exported by an external process that is not running inside a cmux surface.

**Alternative considered:** Probe the default socket or run `cmux ping`. This could classify unrelated local processes as active cmux terminals when the socket uses `allowAll`, changing Arashi launch behavior outside cmux.

### Use the modern atomic workspace-create command

Invoke cmux as an argv array equivalent to:

```text
cmux workspace create --cwd <absolute-worktree-path> --focus true --json
```

Run the process with the worktree as `cwd` as an additional consistency measure, while treating `--cwd` as the authoritative workspace directory. Parse stdout as JSON and require a non-empty workspace identifier or reference before reporting success. Return launch mode `cmux` and the executed argv through the existing launcher result.

The implementation and docs will define the required contract rather than attempt a legacy `new-workspace` plus `select-workspace` fallback. The contract is verified against cmux v0.64.18, the current release during proposal research. If an installed cmux lacks the namespaced command or flags, Arashi reports that the installed cmux must be updated.

**Alternatives considered:**

- Use legacy `cmux new-workspace` and parse `OK workspace:...`. Current cmux intentionally does not honor JSON output for the legacy alias, making parsing less stable.
- Create and then select using two commands. This can leave an unfocused partial workspace if response parsing or selection fails and adds compatibility branches to a small first integration.
- Use the Unix socket directly. That duplicates cmux transport and access-mode behavior and creates protocol maintenance work that the bundled CLI already owns.

### Keep cmux automatic and preserve launcher precedence

Insert cmux launch after active tmux handling and before detected IDE/terminal-app fallback handling. Existing explicit sesh and explicit IDE flags remain higher priority. A tmux session nested inside cmux therefore continues to open a tmux window, while a normal cmux terminal opens a cmux workspace before it can be classified as Ghostty.

No explicit `--cmux` option is added initially because the active cmux environment is unambiguous and both target commands already use automatic terminal detection. An explicit override can be proposed later if users need to launch cmux from outside a managed terminal.

### Treat detected cmux failures as terminal launch failures

Once the invocation is identified as cmux-managed, failure to execute cmux, a non-zero exit, malformed JSON, or a response without a workspace identifier results in `LAUNCH_FAILED` with the attempted command, worktree path, and useful stderr/stdout detail. Arashi does not silently fall back to standalone Ghostty because that would leave the user's intended terminal workflow and could falsely report the requested integration as successful.

### Keep documentation in canonical user and agent surfaces

Update the switch and create documentation, plus a focused terminal workflow page if needed, with automatic detection, exact cmux contract, minimum verified release, and socket/access troubleshooting. Regenerate and smoke-check agent-readable docs exports. Update the smallest relevant `arashi-skills` command/workflow reference rather than expanding the top-level skill unless routing changes.

## Risks / Trade-offs

- **cmux changes its CLI or JSON response shape** → Keep parsing limited to documented identifier fields, cover representative refs/UUIDs in tests, identify the verified version in docs, and emit raw sanitized failure detail.
- **Older cmux installations cannot run the namespaced command** → Fail explicitly with update guidance instead of maintaining an ambiguous legacy parser.
- **Nested tmux users expect cmux instead of tmux** → Preserve existing tmux precedence and document it; an explicit override can be evaluated separately.
- **A partially created workspace exists even when output validation fails** → Atomic create/focus minimizes the window, but Arashi cannot safely close an unidentified workspace; report the failure clearly without claiming success.
- **Environment variables are present but the socket is disabled or ancestry access fails** → Surface cmux stderr/actionable socket access guidance and do not fall back.

## Migration Plan

1. Add tests that capture current cmux misclassification and expected command behavior before implementation.
2. Add cmux detection, launch mode typing, structured command execution, and response validation in the shared launcher.
3. Update switch/create consumers and regression tests.
4. Update docs and skill references, then run CLI, docs, and skills validation.
5. Release as an additive behavior change. Rollback is removal of the cmux detector/branch; existing launcher behavior remains otherwise unchanged.

## Open Questions

None for the initial implementation. An explicit `--cmux` override, workspace naming, and remove-time cmux cleanup remain possible follow-up features.
