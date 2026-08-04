## Context

`launchSwitchTarget` is the shared execution seam for `arashi switch`, configured/explicit post-create launch, and standalone post-create launch. It currently accepts launcher-selection booleans and lets each launcher choose its own UI disposition. That produces contradictory defaults: merged #106 deliberately opens a new Windows Terminal window, while WezTerm and unmanaged Kitty currently try tab-producing commands first, and managed integrations create their own workspace/session abstractions.

The CLI already treats launch as human-only: `switch --json` is rejected at the command action and exported executor, and `create --json` rejects interactive or resolved post-create launch before mutation. Create launcher failure after worktree creation is non-transactional and preserves created worktrees. The new disposition must preserve those boundaries, remain one-invocation state, and avoid changing configuration schemas or legacy normalization.

## Goals / Non-Goals

**Goals:**

- Make `window` the explicit shared-launcher default and `tab` an explicit one-invocation request.
- Preserve the selected application, active profile/shell when the launcher exposes it, and exact worktree directory.
- Define one testable mapping for every supported launcher family, including documented managed-session equivalents and actionable unsupported cases.
- Use the same resolution in switch, coordinated create, and standalone create.
- Reject knowable unsupported tab requests before create mutation and never downgrade a requested tab to a window.
- Keep command contracts, canonical docs, generated docs, and packaged skills semantically aligned.

**Non-Goals:**

- Persist a launch disposition in `.arashi/config.json` or editor-scoped defaults.
- Add a new configured launcher mode.
- Redefine launcher-selection precedence, workspace discovery, or parent-shell `cd` behavior beyond the interaction required by `--tab`.
- Invent tab semantics for IDE workspaces, Git Bash/Mintty, Ghostty, iTerm2, Terminal.app, or generic platform launchers without a stable, profile-preserving CLI/protocol contract.
- Roll back already-created worktrees when a supported tab launch process fails after creation.

## Decisions

### Represent disposition as a required resolved discriminant

Add a `LaunchDisposition = "window" | "tab"` value to shared launch options. Command boundaries resolve omitted `--tab` to `window`; integrations do not infer disposition from environment or command order. `LaunchSwitchResult` also reports the resolved disposition so human success output and tests can distinguish the requested outcome even when a managed integration uses an equivalent abstraction.

**Alternative considered:** Add an optional `tab?: boolean` only inside terminal-specific helpers. This would preserve the current ambiguity for managed launchers and permit future callers to omit the policy accidentally.

### Keep `--tab` CLI-only and composable with launcher selection

Register `--tab` on `switch` and `create`, but leave configuration types, normalization, generated configuration schema, `create-launch-config.json`, and switch configuration vocabulary unchanged.

`--tab` selects disposition and expresses explicit launch intent, but does not select a launcher. On switch it overrides configured or contextual parent-shell `cd` behavior so a requested tab cannot be consumed by a directory directive. It composes with automatic launcher selection and with every explicit launcher selector; the selected launcher's matrix entry decides support. It conflicts only with explicit `switch --cd` because a parent-shell directory change has no launch disposition. It is compatible with `switch --no-cd`. `--no-default-launch` bypasses configured `sesh` or Herdr selection but does not disable explicit tab intent, so automatic launcher resolution continues. IDE workspace flags remain composable selectors whose mapping returns unsupported rather than parser conflicts.

For create, `--tab` is explicit launch intent and implies launch plus switch handling. Like current explicit launcher flags, it takes precedence over `--no-launch` and `--no-switch`; those negative flags still suppress configured behavior when `--tab` is absent. `--dry-run --tab` validates deterministic option conflicts and reports intent without requiring runtime-only launcher support and without mutation.

**Alternative considered:** Make `--tab` conflict with every explicit launcher. That prevents useful, deterministic combinations such as `--tmux --tab` and obscures the distinction between selecting a launcher and selecting its disposition.

### Preserve machine-readable guard precedence

`switch --json --tab` returns the existing single `JSON_UNSUPPORTED_FOR_MODE` envelope before workspace discovery or conflict validation at both the Commander action and exported executor. `create --json --tab` does the same with create's existing `interactive-or-launch` mode before launcher-option validation or mutation. Direct exported callers enforce the same predicates. No JSON success field is added because the disposition never executes in JSON mode.

### Resolve support before mutation and execute without fallback

Introduce a pure support resolver that combines the selected or detected launcher family with the requested disposition. For create, run deterministic conflicts first, resolve configured/standalone context and effective launcher selection, honor dry-run's preview-only boundary, then validate tab support before managed-ignore reconciliation, worktree creation, or hooks. An unsupported tab request raises a stable `TAB_DISPOSITION_UNSUPPORTED` error with the selected integration and guidance.

If support is known but the launch process fails, switch reports failure without another launcher. Create preserves successful worktrees and reports partial success/actionable failure, matching existing post-create behavior. A requested tab never falls back to a window-producing command.

**Alternative considered:** Let each fallback command try tab and then continue through the existing command list. That can silently turn a failed tab request into a successful window and makes pre-mutation validation impossible.

### Use this launcher mapping

| Launcher/context | Default `window` disposition | Explicit `tab` disposition |
| --- | --- | --- |
| Windows Terminal | `wt.exe -w new new-tab`, preserving non-empty `WT_PROFILE_ID` with `-p` and exact path with `-d` | `wt.exe -w 0 new-tab` with the same profile/path handling; failure does not fall back |
| Standalone Git Bash / configured MinTTY | Existing `git-bash.exe --no-cd` path, direct detached MinTTY compatibility fallback, then safe shell fallback | Unsupported; guidance explains that the detected host exposes no stable tab target and recommends the default window or Windows Terminal |
| WezTerm | `wezterm cli spawn --new-window --cwd <path>` in the current domain, with a process-start fallback that also explicitly requests an independent window | `wezterm cli spawn --pane-id <WEZTERM_PANE> --cwd <path>` in the exact current GUI context; missing target evidence is rejected rather than guessed |
| Managed Kitty | Exact Arashi worktree session creation/focus/reuse; its managed tab is documented as the independent-session equivalent | The same exact managed Kitty tab/session contract, explicitly reported as tab-equivalent rather than a window fallback |
| Unmanaged Kitty | New Kitty OS window with exact directory | Unsupported unless managed remote-control evidence is present; do not probe an unrelated instance |
| tmux and sesh | `tmux new-window -c <path>` (and sesh connect command), documented as tmux's independent window/session equivalent | The same tmux window, explicitly documented and reported as tab-equivalent |
| cmux | Existing create-and-focus of a dedicated workspace, documented as the independent-session equivalent | Unsupported; cmux's release API exposes only a top-level workspace and no distinct child-tab operation |
| Herdr | Existing open/focus of the exact worktree workspace, documented as the independent-session equivalent | In an active Herdr workspace, `herdr tab create --workspace <HERDR_WORKSPACE_ID> --cwd <path> --label <label> --focus`; missing active workspace evidence is rejected before launch |
| VS Code / Cursor / Kiro | Existing explicit new-window workspace launch | Unsupported; editor workspaces are not terminal tabs |
| Ghostty | Linux `ghostty +new-window`; macOS 1.3+ AppleScript `new window with configuration`, preserving exact cwd and shell command | macOS 1.3+ AppleScript `new tab in <captured-window> with configuration`; Linux is unsupported and never maps to `+new-window` |
| Terminal.app | One AppleScript transaction creates a new window/tab object with exact cwd, captured current settings, and explicit current shell | `do script <argv-safe-command> in <captured-window>` with captured current settings; no target window or denied automation returns actionable unsupported/preflight failure |
| iTerm2 | One AppleScript transaction creates a window with the captured current profile and an argv-safe exact-cwd/current-shell command | `create tab with profile <captured-profile> command <argv-safe-command>` in the captured current window; no target window is unsupported |
| Generic Linux/macOS/Windows fallback | Existing independent terminal/window fallback chain | Unsupported; no generic cross-terminal tab protocol exists |

The managed Kitty and tmux/sesh rows intentionally allow the same underlying primitive for both requested dispositions because those primitives are explicitly defined as the launcher's tab-equivalent independent session. Herdr has a distinct tab-within-workspace API and therefore requires strict active-workspace evidence for `--tab`. cmux remains a default managed-session equivalent only; its workspace must not be silently reused as explicit child-tab behavior. Other abstractions remain unsupported where no stable tab target exists.

Managed Kitty detection SHALL reconcile the merged source with the canonical `kitty-worktree-sessions` predicate: any one of non-empty `KITTY_PID`, non-empty `KITTY_WINDOW_ID`, or normalized exact `TERM=xterm-kitty` selects the managed integration after higher-precedence contexts. Only weaker Kitty application evidence reaches the unmanaged row. For automatically detected IDE contexts, existing CLI availability resolution remains authoritative: an available IDE maps `tab` to unsupported, while an unavailable IDE CLI continues to terminal/platform fallback before disposition support is decided.

### Regenerate and semantically validate public contracts

Generalize the generated explicit-option policy so environment prerequisites are optional rather than inventing a fake one for `--tab`, bump the CLI command-contract schema, and add `--tab` policy for both commands with non-persisted status, JSON guard mode/precedence, create implications, negative-option compatibility, the switch `--cd` conflict, and disposition support delegated to the launcher matrix. Regenerate `contracts/cli-commands.json`; do not change configuration contracts.

Update canonical command/workflow docs and packaged skill guidance, regenerate agent-readable exports, and extend the meta checker plus deliberate-drift fixtures so missing default, unsupported-case, JSON, or non-persisted semantics fail with an owning-source diagnostic. A workflow self-test must prove the focused checker is invoked in CI.

## Risks / Trade-offs

- **Managed-session vocabulary can confuse users because Kitty/tmux may use a tab-like UI for both requests.** → Name these as documented equivalents in help/guidance and report the resolved disposition separately from the launcher mode.
- **Active terminal detection can be weak or stale.** → Reuse strict existing detectors; do not probe unrelated applications merely to satisfy `--tab`.
- **macOS terminal tab adapters require automation and careful quoting.** → Use static AppleScript source, pass cwd/profile/shell as data, capture one exact target window/profile per transaction, preflight missing targets/permissions, and cover adversarial paths without executing user-derived script source.
- **Create preflight could drift from execution selection.** → Use one pure resolver shared by preflight and execution, and add configured plus standalone non-mutation tests.
- **Generated companions can agree on stale hardcoded text.** → Compare normalized option-policy fields against the canonical CLI contract and use deliberate semantic mismatch fixtures.

## Migration Plan

1. Land the CLI implementation and generated command contract on the child branch with strict RED/GREEN coverage.
2. Land canonical docs and generated exports, then packaged skill guidance, each with repository-local checks.
3. Land the meta OpenSpec/checker updates last after child PRs are green.
4. No configuration migration is required; removing the implementation restores previous command behavior without stored-state cleanup.

## Open Questions

None.
