## MODIFIED Requirements

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
- **AND** human guidance identifies `arashi switch --launch --ignore-configured-launcher` as the launch-forcing alternative and promises a new Terminal window only when automatic launcher resolution selects Terminal.app

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
