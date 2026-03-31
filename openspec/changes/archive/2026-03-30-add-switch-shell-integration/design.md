## Context

`arashi switch` currently resolves a worktree target and launches a new terminal or editor context rooted at that path. That behavior works well for tmux, sesh, and editor launch flows, but it cannot change the caller shell's working directory because the CLI runs in a subprocess. Issue #127 asks for explicit shell integration so `arashi switch` can optionally behave like an in-place `cd` while preserving the existing launcher-oriented workflow.

This change crosses several concerns in `repos/arashi/`: CLI command registration, config parsing, switch mode resolution, shell-specific wrapper generation, runtime directive writing, and subprocess safety. It also affects docs and skills because the feature only works when users initialize or install shell integration correctly.

## Goals / Non-Goals

**Goals:**
- Add a supported shell integration surface for generating and installing wrappers for common shells.
- Let `arashi switch` request a parent-shell directory change when invoked through an installed wrapper.
- Define a single precedence model for `switch` behavior across CLI flags, config defaults, and shell-integration availability.
- Preserve current launch-centric behavior, including existing IDE and tmux or sesh flows.
- Prevent directive coordination state from leaking into hooks or child processes.

**Non-Goals:**
- Replacing launch behavior with `cd` behavior in all cases.
- Adding arbitrary shell command execution through the directive protocol in v1.
- Achieving perfect parity with every shell-specific convenience feature used by other tools.
- Designing an interactive shell diagnostics or doctor flow beyond actionable warnings from the command itself.

## Decisions

### Decision: Use a directive-file protocol for parent-shell coordination
The CLI should communicate parent-shell actions through a wrapper-managed directive file referenced by `ARASHI_DIRECTIVE_FILE`. The wrapper creates a temporary file, exports the env var for the CLI invocation, evaluates the resulting directives in the current shell, and then removes the file. This is the only practical way to let a child process request a parent-shell `cd` without embedding shell-specific logic into the binary execution path.

Alternatives considered:
- Attempt to change directories directly from the CLI process: rejected because subprocesses cannot mutate the parent shell state.
- Print plain paths and ask the wrapper to infer semantics: rejected because it is ambiguous and harder to extend safely.
- Execute arbitrary shell snippets from the CLI: rejected because it broadens the trust surface beyond the single `cd` action needed for v1.

### Decision: Keep shell integration as a separate capability from switch target discovery
The spec surface should separate shell integration from the existing `switch-command` capability. `shell-integration` owns wrapper generation, installation, directive grammar, and safety boundaries; `switch-command` owns when switch requests `cd`, when it falls back to launching, and what diagnostics are shown. This keeps the contract clearer and avoids overloading the existing switch spec with shell-install details.

Alternatives considered:
- Put all shell behavior into `switch-command`: rejected because install/init flows are broader than a single command and deserve their own capability boundary.
- Introduce a generic runtime-protocol capability immediately: rejected because the current need is specific to shell integration and a broader abstraction would be premature.

### Decision: Resolve switch behavior through a single mode-selection step
`arashi switch` should normalize CLI flags, config defaults, and runtime shell-integration state into one resolved mode before it performs the selected action. The initial model should support `launch`, `cd`, and `auto`, with explicit `--cd` and `--no-cd` overrides. This keeps precedence deterministic and allows launch behavior to remain intact when `cd` is unavailable or not requested.

Alternatives considered:
- Let each launcher path independently decide whether to emit directives: rejected because it scatters precedence and makes fallback behavior inconsistent.
- Gate `cd` behavior only on the presence of `ARASHI_DIRECTIVE_FILE` with no explicit mode model: rejected because users also need predictable config defaults and CLI overrides.

### Decision: Restrict directive contents and scrub directive env from subprocesses
The first version should only emit a safely escaped `cd` directive and should remove `ARASHI_DIRECTIVE_FILE` from all child-process, hook, and launcher environments. This minimizes security risk and prevents accidental nested consumers from reading or mutating directive state.

Alternatives considered:
- Support command execution directives immediately: rejected because it increases security and quoting complexity with little benefit for the first release.
- Leave directive env visible to descendants: rejected because hooks or launchers could consume or overwrite the temp file unexpectedly.

### Decision: Provide explicit setup commands instead of implicit wrapper detection or installation
The CLI should expose `arashi shell init <shell>` for printing wrapper code and `arashi shell install` for updating supported shell startup files. Explicit setup makes the feature discoverable, keeps startup-file edits auditable, and gives users a non-mutating path (`init`) for manual installation or advanced shell setups.

Alternatives considered:
- Attempt installation automatically the first time `switch --cd` runs: rejected because shell startup files should not be modified unexpectedly.
- Provide only `init` and no installer: rejected because the issue explicitly calls for installation guidance and many users will want a guided path.

## Risks / Trade-offs

- [Shell startup file layouts differ across supported shells] -> Limit automatic installation to known startup files, keep `shell init` available for manual setup, and document where the installer writes changes.
- [Users invoke the binary through aliases or paths that bypass the wrapper] -> Detect the missing directive-file state and return actionable warnings that explain how to enable or re-enter integrated shell mode.
- [Mode precedence becomes hard to reason about as launch options grow] -> Centralize resolution in one switch-mode helper and cover precedence explicitly in unit tests.
- [Improper path quoting could break on spaces or quotes] -> Keep the directive grammar minimal and test shell-specific escaping for representative path edge cases.
- [Docs drift across implementation, docs, and skills repos] -> Treat docs and skills updates as part of the same implementation task list.

## Migration Plan

1. Add shell integration command plumbing, wrapper templates, and installation logic in `repos/arashi/`.
2. Add directive writing, switch mode resolution, and environment scrubbing in the switch and subprocess execution paths.
3. Update docs and skills to explain installation, `--cd` behavior, config defaults, and fallback diagnostics.
4. Validate with unit and integration tests that wrapped flows change directories, unwrapped flows warn clearly, and launcher regressions remain green.

Rollback is low risk because the change is additive. Reverting the feature removes the new commands, flags, and config paths without requiring data migration; users who installed shell init lines can delete them manually or via a later uninstall command if one is added.

## Open Questions

- Which shells should `shell install` support in the first implementation beyond the minimum accepted set of bash, zsh, and fish?
- Whether the current switch config structure should use a new `defaults.switch.mode` field exactly as proposed in the issue or a closely related name aligned with existing config parsing patterns should be confirmed during implementation.
