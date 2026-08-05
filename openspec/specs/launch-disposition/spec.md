# launch-disposition Specification

## Purpose

Define how Arashi resolves window versus tab launch intent across managed contexts, terminal adapters, command boundaries, and pre-mutation capability checks without silently falling back to a different disposition.

## Requirements

### Requirement: Resolve an explicit shared launch disposition

The system SHALL resolve every shared worktree launch to exactly one disposition: `window` when no disposition override is present, or `tab` when the user passes `--tab`. The resolved disposition SHALL be carried through launcher selection and execution and SHALL NOT be inferred independently by terminal-specific fallback order.

#### Scenario: Launch disposition is omitted

- **WHEN** switch or post-create launch reaches the shared launcher without `--tab`
- **THEN** Arashi resolves disposition `window`
- **AND** opens a new window or the selected managed launcher's documented independent-session equivalent

#### Scenario: Tab disposition is requested

- **WHEN** switch or post-create launch reaches the shared launcher with `--tab`
- **THEN** Arashi resolves disposition `tab`
- **AND** uses only the selected launcher's true tab or documented tab-equivalent mapping

#### Scenario: Result distinguishes launcher and disposition

- **WHEN** any supported launch succeeds
- **THEN** the launch result identifies both the existing launcher mode and resolved `window` or `tab` disposition
- **AND** human success output does not describe a tab request as a window fallback

### Requirement: Map terminal applications without silent disposition fallback

The system SHALL preserve the strictly detected terminal application, active profile or shell when that application exposes it, and exact selected worktree directory. A requested tab SHALL use only the integration's tab mapping and MUST NOT retry a window-producing command.

#### Scenario: Windows Terminal opens a new window by default

- **WHEN** `WT_SESSION` is non-empty and disposition is `window`
- **THEN** Arashi invokes `wt.exe -w new new-tab`
- **AND** includes non-empty `WT_PROFILE_ID` with `-p` and the exact worktree path with `-d`

#### Scenario: Windows Terminal opens an active-window tab

- **WHEN** `WT_SESSION` is non-empty and disposition is `tab`
- **THEN** Arashi invokes `wt.exe -w 0 new-tab`
- **AND** includes non-empty `WT_PROFILE_ID` with `-p` and the exact worktree path with `-d`
- **AND** does not try Git Bash, MinTTY, or command-shell window fallback if that invocation fails

#### Scenario: Standalone Git Bash or MinTTY rejects tab disposition

- **WHEN** an MSYS Bash session is detected outside Windows Terminal and disposition is `tab`
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED` before launching a process
- **AND** guidance recommends the default new window or running inside Windows Terminal

#### Scenario: Standalone Git Bash or MinTTY opens an independent window by default

- **WHEN** an MSYS Bash session is detected outside Windows Terminal and disposition is `window`
- **THEN** Arashi preserves the static PowerShell-backed `git-bash.exe --no-cd` and direct detached MinTTY compatibility sequence
- **AND** transfers exact cwd through the existing data-safe environment contract

#### Scenario: WezTerm opens a new window by default

- **WHEN** WezTerm is detected and disposition is `window`
- **THEN** Arashi invokes `wezterm cli spawn --new-window --cwd <exact-worktree-path>` in the detected domain
- **AND** any process-start fallback also explicitly requests an independent window

#### Scenario: WezTerm opens a tab explicitly

- **WHEN** WezTerm is detected with non-empty `WEZTERM_PANE` and disposition is `tab`
- **THEN** Arashi invokes only `wezterm cli spawn --pane-id <pane-id> --cwd <exact-worktree-path>`
- **AND** never retries `--new-window` or process-start fallback

#### Scenario: WezTerm tab requires exact GUI context

- **WHEN** WezTerm is selected for disposition `tab` without non-empty `WEZTERM_PANE`
- **THEN** Arashi returns actionable `TAB_DISPOSITION_UNSUPPORTED` guidance before invoking WezTerm

#### Scenario: Unmanaged Kitty opens a new OS window by default

- **WHEN** Kitty application evidence is detected, `KITTY_PID` and `KITTY_WINDOW_ID` are empty or absent, normalized `TERM` is not exactly `xterm-kitty`, and disposition is `window`
- **THEN** Arashi opens a new Kitty OS window at the exact worktree path
- **AND** does not prefer a remote-control tab command

#### Scenario: Unmanaged Kitty rejects tab disposition

- **WHEN** Kitty application evidence is detected, `KITTY_PID` and `KITTY_WINDOW_ID` are empty or absent, normalized `TERM` is not exactly `xterm-kitty`, and disposition is `tab`
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED`
- **AND** does not probe or launch into an unrelated Kitty instance

#### Scenario: macOS Ghostty creates a true tab

- **WHEN** Ghostty 1.3 or newer is detected on macOS with a captured target window and disposition is `tab`
- **THEN** Arashi uses Ghostty's AppleScript `new tab in <window> with configuration` API
- **AND** the surface configuration receives the exact cwd and current shell command as data

#### Scenario: Ghostty opens an independent window by default

- **WHEN** Ghostty is selected with disposition `window`
- **THEN** Linux uses `ghostty +new-window`, macOS 1.3 or newer uses `new window with configuration`, and older macOS versions preserve the existing explicit independent-process window mapping
- **AND** the adapter preserves exact cwd and current shell command without relying on application windowing preferences

#### Scenario: Linux Ghostty rejects tab disposition

- **WHEN** Ghostty is detected on Linux and disposition is `tab`
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED`
- **AND** does not invoke `ghostty +new-window`

#### Scenario: Terminal.app rejects tab disposition before mutation

- **WHEN** Terminal.app is selected with disposition `tab`
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED` before invoking Terminal AppleScript or any window-producing fallback
- **AND** switch does not execute a command in the existing selected tab or emit a directory directive
- **AND** post-create flows reject before managed-ignore reconciliation, worktree creation, or hooks
- **AND** human guidance says the user can press Command-T, then run `arashi switch --cd` in the new tab when shell integration is active
- **AND** human guidance identifies `arashi switch --no-cd --no-default-launch` as the launch-forcing alternative and promises a new Terminal window only when automatic launcher resolution selects Terminal.app

#### Scenario: Terminal.app opens a new window by default

- **WHEN** Terminal.app is selected with disposition `window`
- **THEN** one static AppleScript transaction creates a new Terminal window/tab object
- **AND** preserves exact cwd, current shell, and captured current settings when available, otherwise Terminal's default settings, as data

#### Scenario: iTerm2 creates a true tab

- **WHEN** iTerm2 is selected with disposition `tab` and an exact current window/profile target is available
- **THEN** one static AppleScript transaction creates a tab in that captured window with the captured profile
- **AND** passes an argv-safe exact-cwd/current-shell command as data rather than interpolating it into AppleScript source

#### Scenario: iTerm2 opens a new window by default

- **WHEN** iTerm2 is selected with disposition `window`
- **THEN** one static AppleScript transaction creates a new window with the captured current profile when available, otherwise iTerm2's default profile
- **AND** passes an argv-safe exact-cwd/current-shell command as data

#### Scenario: Supported macOS tab target or version is unavailable

- **WHEN** iTerm2 or macOS Ghostty is selected for `tab` without the required target or supported API version
- **THEN** Arashi returns application-specific `TAB_DISPOSITION_UNSUPPORTED` before opening a new application window
- **AND** never maps the request to the default window operation

#### Scenario: macOS automation preflight is denied or fails

- **WHEN** a source-backed macOS tab adapter is selected but its read-only automation preflight fails
- **THEN** Arashi reports actionable `LAUNCH_FAILED` before create mutation or switch launch
- **AND** never maps the request to the default window operation

#### Scenario: Generic platform fallback rejects tab disposition

- **WHEN** launcher resolution reaches a generic macOS, Linux, or Windows fallback and disposition is `tab`
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED`
- **AND** does not invoke any window-producing fallback command

#### Scenario: Generic platform fallback remains independently windowed by default

- **WHEN** launcher resolution reaches the generic macOS, Linux, or Windows fallback with disposition `window`
- **THEN** Arashi preserves the existing platform-specific independent process/window sequence
- **AND** passes the exact worktree path through argv-safe or static environment-backed operations

### Requirement: Define managed-context disposition equivalents

The system SHALL select a strict managed context before its containing terminal application, and SHALL document and enforce whether each managed launcher provides an independent-session equivalent, a tab-equivalent, or no tab mapping. An equivalent mapping MAY use the same underlying primitive for both dispositions only when the contract explicitly identifies it as both an independent session and an in-session tab-equivalent.

#### Scenario: Managed multiplexer outranks containing terminal

- **WHEN** `--tab` runs inside a strictly detected tmux, Herdr, or cmux context that is itself hosted by a tab-capable terminal such as Ghostty
- **THEN** Arashi applies the selected multiplexer’s tab mapping
- **AND** does not invoke the containing terminal’s native tab API

#### Scenario: Managed Kitty preserves exact worktree session identity

- **WHEN** managed Kitty is selected with either disposition
- **THEN** Arashi creates, focuses, or reuses the exact identity-tagged worktree session through the existing structured validation contract
- **AND** identifies its Kitty tab/session as the documented independent-session and tab equivalent

#### Scenario: tmux window is an explicit equivalent

- **WHEN** tmux or sesh is selected with either disposition
- **THEN** Arashi creates the existing tmux window rooted at the exact worktree
- **AND** identifies the tmux window as the managed independent-session and tab equivalent

#### Scenario: cmux workspace is its in-session tab equivalent

- **WHEN** cmux is selected with either disposition
- **THEN** Arashi creates and focuses the exact worktree workspace through the existing structured cmux contract
- **AND** validates the structured response before reporting the workspace as cmux's independent-session and in-session vertical-tab equivalent
- **AND** does not fall through to standalone Ghostty

#### Scenario: Herdr creates a tab in the active workspace

- **WHEN** Herdr is selected with disposition `tab` and `HERDR_WORKSPACE_ID` is non-empty after trimming
- **THEN** Arashi invokes `herdr tab create --workspace <workspace-id> --cwd <exact-worktree-path> --label <worktree-label> --focus`
- **AND** validates non-empty tab and root-pane identifiers in the structured response before reporting success
- **AND** does not require a non-bare source checkout because it is opening the existing worktree directory inside the active workspace

#### Scenario: Herdr tab requires active workspace evidence

- **WHEN** Herdr is selected with disposition `tab` and `HERDR_WORKSPACE_ID` is absent or empty after trimming
- **THEN** Arashi returns actionable `TAB_DISPOSITION_UNSUPPORTED` guidance before invoking Herdr
- **AND** does not open a worktree workspace or fall through to another launcher

#### Scenario: Herdr opens the worktree workspace by default

- **WHEN** Herdr is selected with disposition `window`
- **THEN** Arashi preserves the existing exact worktree open/focus protocol and structured validation
- **AND** reports the Herdr workspace as the independent managed-session equivalent

#### Scenario: IDE workspace launch rejects terminal tab disposition

- **WHEN** VS Code, Cursor, or Kiro is selected explicitly or automatically and disposition is `tab`
- **THEN** Arashi returns `TAB_DISPOSITION_UNSUPPORTED`
- **AND** does not reinterpret an editor workspace or reuse-window option as a terminal tab

#### Scenario: IDE launch opens a workspace window by default

- **WHEN** VS Code, Cursor, or Kiro is selected and available with disposition `window`
- **THEN** Arashi preserves the existing explicit `--new-window <exact-worktree-path>` mapping

#### Scenario: Unavailable automatically detected IDE preserves fallback

- **WHEN** an IDE environment is auto-detected for disposition `tab` but its CLI is unavailable
- **THEN** Arashi preserves the canonical IDE-unavailable behavior and continues to strictly detected terminal or platform fallback resolution
- **AND** applies the resulting launcher's tab mapping rather than rejecting solely from IDE environment evidence

### Requirement: Preserve failure and argv safety boundaries

The system SHALL pass worktree paths as distinct process arguments or through an existing static environment-backed protocol, SHALL strip shell-directive state from launched children, and SHALL distinguish unsupported disposition from supported-launch execution failure.

#### Scenario: Supported tab path contains shell-significant characters

- **WHEN** a tab-capable launcher receives a worktree path containing spaces, quotes, or shell-significant characters
- **THEN** the launcher receives the exact path without shell interpolation

#### Scenario: Supported tab execution fails

- **WHEN** a selected tab-capable launcher returns non-zero or violates its structured response contract
- **THEN** Arashi reports the existing actionable launch failure with launcher, path, and attempted command details
- **AND** does not try another launcher or the default window disposition

#### Scenario: Tab support is knowably absent

- **WHEN** the resolved launcher has no tab or documented tab-equivalent mapping
- **THEN** Arashi reports stable code `TAB_DISPOSITION_UNSUPPORTED`
- **AND** does not invoke that launcher

### Requirement: Explicit create tab disposition overrides configured launch defaults

The system SHALL treat `arashi create --tab` as explicit automatic launch intent, SHALL bypass configured generic or editor-scoped `sesh` and `herdr` create launch defaults, and SHALL preserve an explicit `--tmux`, `--sesh`, or `--herdr` launcher supplied in the same invocation. This behavior SHALL NOT add a persisted launch-disposition setting or expand the create configuration vocabulary.

#### Scenario: Create tab bypasses a configured launcher

- **GIVEN** the applicable generic or editor-scoped create default selects `sesh` or `herdr`
- **WHEN** the user runs `arashi create <branch> --tab` without an explicit launcher selector
- **THEN** Arashi uses automatic contextual launcher resolution with disposition `tab`
- **AND** the configured explicit launcher is not invoked

#### Scenario: Create tab preserves an explicit launcher

- **GIVEN** the applicable create default selects a different launcher
- **WHEN** the user runs `arashi create <branch> --tab` with exactly one of `--tmux`, `--sesh`, or `--herdr`
- **THEN** Arashi uses the explicitly selected launcher with disposition `tab`

#### Scenario: Create tab remains an ephemeral override

- **WHEN** the user runs `arashi create <branch> --tab`
- **THEN** `--tab` implies launch and switch and remains authoritative over `--no-launch` and `--no-switch`
- **AND** Arashi does not add, persist, or normalize a tab/disposition configuration field

### Requirement: Preserve Windows executable resolution across path-key casing

The system SHALL treat Windows environment-variable names case-insensitively when preparing child-process environments and SHALL provide the inherited executable search path under the canonical Windows key `Path`. This normalization SHALL preserve the exact path value and every unrelated defined environment value.

#### Scenario: Git Bash supplies uppercase PATH

- **WHEN** a Windows launch inherits an environment containing uppercase `PATH` and no `Path` key
- **THEN** Arashi supplies the same value to Bun under `Path`
- **AND** removes the case-variant duplicate `PATH` key from the child environment

#### Scenario: Windows path casing is already canonical

- **WHEN** a Windows launch inherits `Path`
- **THEN** Arashi preserves that exact value under `Path`

#### Scenario: Non-Windows path casing is preserved

- **WHEN** a non-Windows launch inherits uppercase `PATH`
- **THEN** Arashi preserves the existing key casing and exact value

#### Scenario: Windows Terminal tab resolves from Git Bash

- **WHEN** Arashi runs inside a Windows Terminal Git Bash profile with non-empty `WT_SESSION`, uppercase `PATH`, and disposition `tab`
- **THEN** the detached process runner resolves and starts `wt.exe`
- **AND** preserves `-w 0 new-tab`, the non-empty active profile, and exact selected worktree path as separate arguments
- **AND** does not invoke a fallback launcher if startup fails
