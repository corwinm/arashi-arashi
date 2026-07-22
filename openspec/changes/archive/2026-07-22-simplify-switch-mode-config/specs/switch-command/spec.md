## ADDED Requirements

### Requirement: Configure switch behavior with one canonical mode

The system SHALL expose `defaults.switch.mode` as the single canonical configured switch choice, SHALL accept `auto`, `cd`, `launch`, `sesh`, and `herdr`, and SHALL NOT advertise `defaults.switch.launchMode` in the generated schema, maintained examples, generated agent-readable exports, or skill guidance. An absent configured mode SHALL preserve automatic launcher selection without preferring parent-shell `cd`. `defaults.create` and editor-scoped create defaults SHALL retain their independent launch fields.

#### Scenario: Automatic contextual mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `auto`
- **THEN** Arashi selects a strictly detected managed launcher context before considering parent-shell switching

#### Scenario: Parent-shell mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `cd`
- **THEN** Arashi requests parent-shell switching when shell integration is available

#### Scenario: Automatic launch mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `launch`
- **THEN** Arashi uses automatic launcher selection without preferring parent-shell switching

#### Scenario: Explicit sesh mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `sesh`
- **THEN** Arashi selects the existing explicit sesh launch behavior regardless of shell-integration availability or automatic context detection

#### Scenario: Explicit Herdr mode is configured

- **WHEN** a user configures `defaults.switch.mode` as `herdr`
- **THEN** Arashi selects the existing explicit Herdr launch behavior regardless of shell-integration availability or automatic context detection

#### Scenario: Switch mode is absent

- **WHEN** a configured or standalone repository has no `defaults.switch.mode`
- **THEN** Arashi preserves the existing built-in automatic launch behavior
- **AND** does not newly prefer parent-shell `cd`

#### Scenario: Canonical schema is generated

- **WHEN** Arashi generates its configuration schema
- **THEN** `defaults.switch.mode` enumerates `auto`, `cd`, `launch`, `sesh`, and `herdr`
- **AND** `defaults.switch.launchMode` is not a canonical schema property
- **AND** create launch configuration remains unchanged

#### Scenario: Unsupported unified mode is rejected

- **WHEN** `defaults.switch.mode` contains a value outside the supported unified mode set
- **THEN** Arashi rejects the configuration with an actionable validation error before target selection, launch, directory switching, or other workspace mutation

#### Scenario: User-facing switch contracts agree

- **WHEN** Arashi publishes the unified switch configuration model
- **THEN** CLI help and diagnostics, maintained CLI documentation, canonical documentation, generated agent-readable exports, and the Arashi skill package use the same unified mode vocabulary and legacy migration rules
- **AND** none of those canonical surfaces instruct users to compose `defaults.switch.mode` with `defaults.switch.launchMode`

### Requirement: Normalize legacy switch defaults without discarding intent

The system SHALL continue reading legacy `defaults.switch.launchMode` and `defaults.switch.launch_mode` during the compatibility window, SHALL normalize every representable legacy combination to one canonical mode, SHALL emit an actionable migration diagnostic containing the replacement mode, and SHALL reject combinations that cannot be represented without discarding configured intent. Migration diagnostics MUST NOT contaminate JSON stdout.

#### Scenario: Legacy automatic launch is normalized

- **WHEN** legacy switch defaults omit `mode` or set it to `launch` and set launch mode to `auto`
- **THEN** Arashi normalizes the configuration to unified mode `launch`

#### Scenario: Legacy explicit launcher is normalized

- **WHEN** legacy switch defaults omit `mode` or set it to `launch` and set launch mode to `sesh` or `herdr`
- **THEN** Arashi normalizes the configuration to the matching unified explicit launcher mode

#### Scenario: Legacy auto without an explicit launcher is normalized

- **WHEN** legacy switch defaults set `mode` to `auto` and omit launch mode or set it to `auto`
- **THEN** Arashi preserves unified mode `auto`

#### Scenario: Legacy auto with an explicit launcher preserves the launcher

- **WHEN** legacy switch defaults set `mode` to `auto` and launch mode to `sesh` or `herdr`
- **THEN** Arashi normalizes the configuration to the matching unified explicit launcher mode
- **AND** does not allow parent-shell availability to make the configured launcher inert

#### Scenario: Legacy cd without an explicit launcher is normalized

- **WHEN** legacy switch defaults set `mode` to `cd` and omit launch mode or set it to `auto`
- **THEN** Arashi preserves unified mode `cd`

#### Scenario: Legacy cd with an explicit fallback launcher is rejected

- **WHEN** legacy switch defaults set `mode` to `cd` and launch mode to `sesh` or `herdr`
- **THEN** Arashi rejects the configuration with an actionable error naming both configured values
- **AND** explains that the user must choose either unified `cd` or the matching unified explicit launcher mode
- **AND** does not launch, switch directories, or otherwise mutate workspace state

#### Scenario: Unified explicit mode with compatible legacy field is normalized

- **WHEN** unified `mode` is `sesh` or `herdr` and a legacy launch field is `auto` or the same explicit launcher
- **THEN** Arashi preserves the unified explicit mode
- **AND** emits one migration diagnostic identifying the redundant legacy field and exact canonical replacement

#### Scenario: Unified explicit mode conflicts with legacy launcher

- **WHEN** unified `mode` is `sesh` with legacy launch mode `herdr`, or unified `mode` is `herdr` with legacy launch mode `sesh`
- **THEN** Arashi rejects the configuration with an actionable error naming both values
- **AND** does not launch, switch directories, or otherwise mutate workspace state

#### Scenario: Equal camel-case and snake-case legacy fields are collapsed before mapping

- **WHEN** `launchMode` and `launch_mode` are both present with the same value
- **THEN** Arashi treats them as one legacy launch value
- **AND** applies the same mode-mapping acceptance or rejection rules as one occurrence of that value
- **AND** emits exactly one migration diagnostic with the exact unified replacement only when the resulting mapping is accepted

#### Scenario: Conflicting camel-case and snake-case legacy fields are rejected

- **WHEN** `launchMode` and `launch_mode` are both present with different values
- **THEN** Arashi rejects the configuration with an actionable error naming both fields and values before applying any mode mapping
- **AND** does not launch, switch directories, or otherwise mutate workspace state

#### Scenario: Legacy migration diagnostic is emitted for human output

- **WHEN** Arashi accepts a legacy switch launch field for a human-output command
- **THEN** it emits one warning identifying the deprecated field and exact unified replacement

#### Scenario: Legacy migration diagnostic preserves machine output

- **WHEN** a machine-readable command loads a configuration containing an accepted legacy switch launch field
- **THEN** stdout remains the command's single structured document
- **AND** migration information is omitted from stdout or represented only through an established structured diagnostic surface

## MODIFIED Requirements

### Requirement: Open a new terminal context at the selected worktree

The system SHALL resolve switch behavior for the selected worktree using explicit CLI flags, one configured switch mode, strict managed-context evidence, and shell-integration availability, and SHALL either launch a new terminal or editor context or request a parent-shell directory change for the selected worktree. Explicit CLI behavior SHALL take precedence over configured modes; configured non-auto modes SHALL take precedence over automatic context detection. In this capability, automatic launch behavior applies whenever resolution reaches the shared launcher without an explicit or configured launcher target, including absent or `launch` mode, contextual `auto` after managed-context detection or unavailable shell integration, `--no-cd`, configured `cd` fallback when shell integration is unavailable, and configured-launcher opt-out.

#### Scenario: Switch applies configured launch default

- **WHEN** the user runs `arashi switch` and `defaults.switch.mode` is `launch`
- **THEN** the command uses automatic terminal or editor launch behavior for the selected worktree without preferring `cd`

#### Scenario: Explicit IDE flag overrides switch default

- **WHEN** any switch mode is configured and the user passes one of `--vscode`, `--cursor`, or `--kiro`
- **THEN** the command launches the selected IDE for that invocation instead of the configured default

#### Scenario: User requests parent-shell directory switching

- **WHEN** the user runs `arashi switch --cd` and shell integration is active for the invocation
- **THEN** the command requests a parent-shell directory change for the selected worktree instead of opening a new terminal or editor context

#### Scenario: Auto mode prefers detected tmux

- **WHEN** switch mode is `auto`, active tmux evidence is present, and shell integration is active
- **THEN** Arashi uses the existing automatic tmux launch behavior instead of emitting a directory-change directive

#### Scenario: Auto mode prefers detected Herdr

- **WHEN** switch mode is `auto`, `HERDR_ENV` normalizes to the exact value `1`, no higher-precedence tmux context is active, and shell integration is active
- **THEN** Arashi uses the existing automatic Herdr launch behavior instead of emitting a directory-change directive

#### Scenario: Auto mode prefers detected cmux

- **WHEN** switch mode is `auto`, a non-empty `CMUX_WORKSPACE_ID` or `CMUX_SURFACE_ID` is present, no higher-precedence managed context is active, and shell integration is active
- **THEN** Arashi uses the existing automatic cmux launch behavior instead of emitting a directory-change directive

#### Scenario: Auto mode prefers detected integrated IDE

- **WHEN** switch mode is `auto`, validated Cursor, Kiro, or VS Code terminal evidence is present, no higher-precedence managed context is active, and shell integration is active
- **THEN** Arashi attempts the existing matching IDE launch behavior instead of emitting a directory-change directive

#### Scenario: Auto-detected IDE binary is unavailable

- **WHEN** switch mode is `auto`, a supported integrated IDE context is strictly detected, and its optional CLI is unavailable
- **THEN** Arashi continues through the existing terminal-application and platform launch fallback chain
- **AND** does not emit a parent-shell directory-change directive

#### Scenario: Auto mode ignores weak managed-context signals

- **WHEN** switch mode is `auto` and the environment contains only weak or invalid signals such as `CMUX_SOCKET_PATH` alone, a non-`1` Herdr value, or unsupported IDE text
- **THEN** Arashi does not classify those signals as an active managed context

#### Scenario: Auto mode falls back to directory switching

- **WHEN** switch mode is `auto`, no managed context is strictly detected, and shell integration is active
- **THEN** the command requests a parent-shell directory change for the selected worktree

#### Scenario: Auto mode falls back to platform launch

- **WHEN** switch mode is `auto`, no managed context is strictly detected, and shell integration is inactive
- **THEN** the command uses existing terminal-application and generic platform launch fallback behavior
- **AND** does not silently do nothing

#### Scenario: Auto platform fallback fails

- **WHEN** switch mode is `auto`, no managed context or shell integration is available, and the terminal or platform fallback cannot be executed
- **THEN** Arashi exits with an actionable launch error that identifies the selected worktree and attempted fallback or gives platform-appropriate launch guidance
- **AND** does not report a successful switch

#### Scenario: Selected managed launcher execution fails

- **WHEN** switch mode is `auto` and the selected tmux, Herdr, or cmux contract fails validation or execution, or an auto-detected IDE CLI is available but its launch process fails
- **THEN** Arashi reports the existing actionable launch failure
- **AND** does not fall through to parent-shell `cd` or another launcher

#### Scenario: User disables directory switching for one invocation

- **WHEN** the user runs `arashi switch --no-cd` and switch behavior would otherwise resolve to `cd` or contextual `auto`
- **THEN** the command skips directory switching for that invocation and uses launch behavior instead

#### Scenario: No-cd preserves a configured explicit launcher

- **WHEN** `defaults.switch.mode` is `sesh` or `herdr` and the user passes `--no-cd` without `--no-default-launch`
- **THEN** Arashi retains and invokes the matching configured explicit launcher

#### Scenario: Requested directory switching is unavailable

- **WHEN** the user runs `arashi switch --cd` but shell integration is not active
- **THEN** the command does not fail solely because directory switching is unavailable, does not launch an alternate terminal or editor context for that invocation, and shows an actionable warning explaining how to enable shell integration or rerun through the wrapper

#### Scenario: Configured cd mode is unavailable

- **WHEN** `defaults.switch.mode` is `cd` but shell integration is not active
- **THEN** the command shows an actionable warning and follows normal automatic launch resolution for the selected worktree

#### Scenario: Configured explicit launcher is opted out

- **WHEN** `defaults.switch.mode` is `sesh` or `herdr` and the user passes `--no-default-launch` without an explicit launcher flag
- **THEN** Arashi bypasses the configured launcher and uses automatic launch resolution

#### Scenario: Default-launch opt-out does not erase behavior modes

- **WHEN** `defaults.switch.mode` is `auto`, `cd`, or `launch` and the user passes `--no-default-launch`
- **THEN** Arashi preserves that configured behavior mode

#### Scenario: Conflicting launch overrides are provided

- **WHEN** the user passes more than one explicit IDE or supported launcher flag in a single invocation
- **THEN** the system exits with an error instructing the user to choose exactly one launch override

#### Scenario: Parent-shell switching conflicts with every explicit launcher

- **WHEN** the user combines `--cd` with `--sesh`, `--herdr`, `--vscode`, `--cursor`, or `--kiro`
- **THEN** Arashi rejects the conflicting switch behavior before target launch or directory switching
- **AND** instructs the user to choose either parent-shell switching or one explicit launcher

### Requirement: Prefer the active IDE when switching from a supported IDE environment

The system SHALL detect supported IDE environments and SHALL prefer the matching IDE launcher when automatic launch behavior applies and the user does not provide an explicit or configured launcher override. Configured `sesh` and `herdr` modes, plus configured `cd` while shell integration is available, SHALL remain authoritative over automatic IDE detection.

#### Scenario: Cursor environment prefers Cursor launcher

- **WHEN** automatic launch behavior applies, the user runs `arashi switch` from a Cursor-integrated environment, and no explicit or configured launcher is selected
- **THEN** the system opens the selected worktree in Cursor when the Cursor launcher is available

#### Scenario: Kiro environment prefers Kiro launcher

- **WHEN** automatic launch behavior applies, the user runs `arashi switch` from a Kiro-integrated environment, and no explicit or configured launcher is selected
- **THEN** the system opens the selected worktree in Kiro when the Kiro launcher is available

#### Scenario: Configured cd is authoritative in an IDE terminal

- **WHEN** `defaults.switch.mode` is `cd`, shell integration is active, and a supported IDE environment is detected
- **THEN** Arashi requests the configured parent-shell directory change instead of automatically launching the IDE

#### Scenario: Unsupported environment uses existing fallback behavior

- **WHEN** automatic launch behavior applies and the user runs `arashi switch` from an environment that does not match a supported IDE
- **THEN** the system uses the existing non-IDE fallback launch behavior

### Requirement: Launch selected worktrees as cmux workspaces

The system SHALL detect a cmux-managed terminal from cmux-specific workspace or surface environment identifiers and, when automatic launch behavior applies, SHALL create and focus a cmux workspace rooted at the exact selected worktree before generic Ghostty fallback behavior can run. Configured `sesh` and `herdr` modes, plus configured `cd` while shell integration is available, SHALL remain authoritative over automatic cmux detection.

#### Scenario: Switch launches a cmux workspace

- **WHEN** automatic launch behavior applies and the user runs `arashi switch <target>` from a terminal with a non-empty `CMUX_WORKSPACE_ID` or `CMUX_SURFACE_ID`
- **THEN** Arashi creates a cmux workspace with the selected worktree's absolute path as its working directory
- **AND** the new cmux workspace is focused
- **AND** the switch result reports launch mode `cmux`

#### Scenario: Worktree path is passed without shell interpolation

- **WHEN** the selected cmux worktree path contains spaces, quotes, or shell-significant characters
- **THEN** Arashi passes the complete absolute path as a distinct process argument
- **AND** cmux receives that exact path as the requested working directory

#### Scenario: Ordinary Ghostty is not treated as cmux

- **WHEN** automatic launch behavior applies and the user runs `arashi switch` with `TERM_PROGRAM=ghostty` but without a non-empty cmux workspace or surface identifier
- **THEN** Arashi preserves the ordinary Ghostty launch behavior

#### Scenario: Socket path alone does not imply active cmux context

- **WHEN** automatic launch behavior applies and `CMUX_SOCKET_PATH` is set outside a cmux-managed terminal without a non-empty cmux workspace or surface identifier
- **THEN** Arashi does not automatically select cmux launch mode

#### Scenario: Configured cd is authoritative in cmux

- **WHEN** `defaults.switch.mode` is `cd`, shell integration is active, and cmux managed-terminal identifiers are present
- **THEN** Arashi requests the configured parent-shell directory change instead of automatically creating a cmux workspace

### Requirement: Preserve explicit and nested terminal launch precedence

The system SHALL resolve explicit launcher overrides first, configured unified switch modes second, and automatic managed-context detection third. During automatic launch, active tmux SHALL retain precedence over Herdr, cmux, and integrated IDE detection; automatic cmux SHALL retain precedence over generic Ghostty behavior.

#### Scenario: Explicit IDE override wins in cmux

- **WHEN** a user in a cmux-managed terminal requests a supported explicit IDE launch flag
- **THEN** Arashi launches the requested IDE instead of creating a cmux workspace

#### Scenario: Explicit sesh retains highest terminal-session priority

- **WHEN** a user requests `--sesh` from a cmux-managed terminal with an active tmux session
- **THEN** Arashi follows the existing sesh validation and launch behavior

#### Scenario: Configured explicit launcher wins in nested contexts

- **WHEN** `defaults.switch.mode` is `sesh` or `herdr`, no explicit launcher is passed, and other managed-context signals are active
- **THEN** Arashi uses the configured explicit launcher instead of automatic context detection

#### Scenario: Nested tmux retains automatic tmux behavior

- **WHEN** automatic launch behavior applies, `TMUX` and cmux managed-terminal identifiers are both non-empty, and no explicit or configured launcher is selected
- **THEN** Arashi opens the selected worktree through the existing tmux launch behavior rather than creating a cmux workspace

### Requirement: Launch selected worktrees as Herdr workspaces

The system SHALL open and focus selected existing worktrees through Herdr without asking Herdr to create or remove Git worktrees.

#### Scenario: Explicit Herdr launch succeeds outside a managed pane

- **WHEN** the user runs `arashi switch --herdr <target>` outside a Herdr-managed pane and the Herdr CLI can reach a running default session
- **THEN** Arashi invokes `herdr worktree open` for the selected existing worktree
- **AND** the switch result reports launch mode `herdr`

#### Scenario: Herdr is automatically detected

- **WHEN** the user runs `arashi switch <target>` in `auto` or `launch` mode without an explicit or configured launcher and `HERDR_ENV` normalizes to the exact value `1`
- **THEN** Arashi opens or focuses the selected worktree through Herdr before IDE or generic terminal fallback detection

#### Scenario: Similar environment values are not Herdr signals

- **WHEN** `HERDR_ENV` is absent, empty, or normalizes to a value other than the exact string `1`
- **THEN** Arashi does not automatically select Herdr launch mode

#### Scenario: Configured Herdr mode is used

- **WHEN** `defaults.switch.mode` is `herdr`
- **THEN** Arashi uses Herdr even when the invocation is outside a Herdr-managed pane

#### Scenario: Existing workspace is reused

- **WHEN** Herdr reports that the selected checkout is already open
- **THEN** Arashi treats the focused existing workspace as a successful `herdr` launch
- **AND** repeating the switch does not require creating a duplicate workspace
- **AND** Herdr reapplies Arashi's requested label to the reused workspace

### Requirement: Preserve deterministic Herdr launch precedence

The system SHALL resolve explicit launcher flags before configured unified switch mode, configured explicit launcher modes before automatic environment detection, and automatic Herdr detection before cmux, IDE, and generic terminal fallbacks while retaining existing automatic tmux precedence. Parent-shell `cd` SHALL be considered after strict managed-context detection only in contextual `auto` mode.

#### Scenario: Explicit Herdr overrides configured and automatic modes

- **WHEN** the user passes `--herdr` and another switch or launch mode would otherwise be selected from configuration or environment
- **THEN** Arashi uses Herdr for that invocation

#### Scenario: Configured Herdr overrides automatic tmux or terminal detection

- **WHEN** `defaults.switch.mode` is `herdr` and no explicit launcher is passed
- **THEN** Arashi uses Herdr regardless of automatic tmux, cmux, IDE, or terminal signals

#### Scenario: Automatic nested tmux retains existing behavior

- **WHEN** automatic launch applies, `TMUX` is active, and `HERDR_ENV=1` but no explicit or configured launcher is selected
- **THEN** Arashi uses the existing tmux launch behavior

#### Scenario: Automatic Herdr precedes cmux and IDE detection

- **WHEN** automatic launch applies and `HERDR_ENV=1` appears with cmux or integrated IDE signals and no explicit or configured launcher is selected
- **THEN** Arashi uses Herdr after determining that automatic tmux does not apply

#### Scenario: Conflicting explicit launcher flags are rejected

- **WHEN** the user combines `--herdr` with `--sesh` or any explicit IDE launcher flag
- **THEN** Arashi exits before launch with a deterministic error instructing the user to choose exactly one launcher

#### Scenario: Herdr conflicts with parent-shell switching

- **WHEN** the user combines `--herdr` with `--cd`
- **THEN** Arashi rejects the conflicting switch behavior before launch

#### Scenario: No-cd preserves configured Herdr

- **WHEN** `defaults.switch.mode` is `herdr` and the user passes `--no-cd`
- **THEN** Arashi performs Herdr launch behavior instead of emitting a directory-change directive

#### Scenario: Default-launch opt-out bypasses configured Herdr

- **WHEN** `defaults.switch.mode` is `herdr` and the user passes `--no-default-launch` without explicit `--herdr`
- **THEN** Arashi bypasses configured Herdr and uses automatic launch resolution
