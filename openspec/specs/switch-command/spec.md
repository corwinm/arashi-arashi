# switch-command Specification

## Purpose

Define how `arashi switch` discovers and selects worktrees, resolves parent-shell or launcher behavior, and preserves deterministic launch semantics across configured and standalone repositories.
## Requirements
### Requirement: Discover switchable worktree targets

The system SHALL discover existing git worktrees associated with the current Arashi workspace and expose each target with its branch reference and absolute worktree path.

#### Scenario: Worktrees are available

- **WHEN** the user runs `arashi switch`
- **THEN** the system returns one candidate per discoverable worktree with branch and path metadata

#### Scenario: No worktrees are available

- **WHEN** the user runs `arashi switch` in a workspace with no switchable worktrees
- **THEN** the system exits with an error explaining that no switch targets were found

### Requirement: Filter and select a switch target

The system SHALL support selecting a target by optional filter text, SHALL support exact worktree-path selection when the caller declares path mode, and SHALL require explicit disambiguation when multiple candidates remain.

#### Scenario: Filter resolves to a single target

- **WHEN** the user runs `arashi switch <filter>` and exactly one candidate matches branch or path
- **THEN** the system selects that candidate without additional prompts

#### Scenario: Multiple matches in interactive terminal

- **WHEN** the user runs `arashi switch <filter>` in an interactive terminal and multiple candidates match
- **THEN** the system prompts the user to choose exactly one target

#### Scenario: Multiple matches in non-interactive terminal

- **WHEN** the user runs `arashi switch <filter>` in a non-interactive terminal and multiple candidates match
- **THEN** the system exits with an error instructing the user to provide a more specific filter

#### Scenario: Exact path resolves selected worktree

- **WHEN** the user runs `arashi switch --path <worktree-path>` and exactly one candidate has that normalized absolute worktree path
- **THEN** the system selects that candidate without applying fuzzy branch or substring matching

#### Scenario: Exact path does not match a worktree

- **WHEN** the user runs `arashi switch --path <worktree-path>` and no candidate has that normalized absolute worktree path
- **THEN** the system exits with an error explaining that no worktree exists at the requested path

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

### Requirement: Launch supported IDE targets explicitly

The system SHALL provide explicit CLI flags for supported IDE launchers and SHALL map each supported flag to the corresponding editor command for the selected worktree.

#### Scenario: Launch VS Code explicitly

- **WHEN** the user runs `arashi switch --vscode`
- **THEN** the system opens the selected worktree in VS Code

#### Scenario: Launch Cursor explicitly

- **WHEN** the user runs `arashi switch --cursor`
- **THEN** the system opens the selected worktree in Cursor

#### Scenario: Launch Kiro explicitly

- **WHEN** the user runs `arashi switch --kiro`
- **THEN** the system opens the selected worktree in Kiro

#### Scenario: Explicit IDE launcher is unavailable

- **WHEN** the user requests an explicit IDE launch flag and the corresponding editor CLI is unavailable
- **THEN** the system exits with an actionable error identifying the missing launcher

### Requirement: Support tmux sesh mode

The system SHALL provide a `--sesh` flag that uses sesh-based switching when running in tmux and SHALL validate prerequisites before attempting the switch.

#### Scenario: sesh mode succeeds in tmux

- **WHEN** the user runs `arashi switch --sesh` inside tmux and `sesh` is available
- **THEN** the system launches or switches to the selected worktree using sesh integration

#### Scenario: sesh mode requested outside tmux

- **WHEN** the user runs `arashi switch --sesh` outside tmux
- **THEN** the system exits with an error explaining that `--sesh` requires tmux

#### Scenario: sesh binary is unavailable

- **WHEN** the user runs `arashi switch --sesh` in tmux but `sesh` is not found
- **THEN** the system exits with an error indicating sesh is required and suggesting standard switch mode

### Requirement: Preserve existing explicit sesh behavior when directory switching is available

The system SHALL keep explicit sesh mode available even when shell integration is installed or switch defaults prefer directory switching.

#### Scenario: Explicit sesh mode bypasses directory switching

- **WHEN** the user runs `arashi switch --sesh` in an invocation where shell integration is active
- **THEN** the system uses sesh-based switching rules instead of emitting a directory-change directive

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

### Requirement: Validate cmux workspace creation before reporting success

The system SHALL use the supported structured cmux workspace-creation contract and SHALL report success only when the command exits successfully and returns a parseable non-empty workspace identifier or reference.

#### Scenario: Structured workspace creation succeeds

- **WHEN** cmux returns a successful JSON response containing a non-empty workspace identifier or reference
- **THEN** Arashi reports cmux launch success and includes the executed command in the launch result

#### Scenario: cmux CLI is unavailable

- **WHEN** Arashi detects a cmux-managed terminal but cannot execute the `cmux` CLI
- **THEN** Arashi exits with an actionable `LAUNCH_FAILED` error identifying the attempted command and selected worktree
- **AND** Arashi does not fall back to standalone Ghostty

#### Scenario: cmux socket access fails

- **WHEN** cmux rejects workspace creation because its socket is disabled, inaccessible, or disallows the caller
- **THEN** Arashi exits with an actionable `LAUNCH_FAILED` error that preserves useful cmux failure detail
- **AND** Arashi does not report a successful switch

#### Scenario: cmux returns malformed or incomplete output

- **WHEN** cmux exits successfully but stdout is not valid JSON or does not contain a non-empty workspace identifier or reference
- **THEN** Arashi exits with `LAUNCH_FAILED` and explains that the cmux response could not be validated
- **AND** Arashi does not silently use another launcher

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

### Requirement: Switch discovers implicit standalone targets

`arashi switch` SHALL discover and select worktrees belonging to the resolved standalone repository without requiring configured repository entries.

#### Scenario: Standalone worktrees are available

- **WHEN** a user runs switch in an implicit standalone workspace with linked worktrees
- **THEN** each target reports its branch and exact Git worktree path
- **AND** configured repository-name prefixes are not required for matching

#### Scenario: Invocation starts in linked worktree

- **WHEN** switch runs from a standalone linked worktree
- **THEN** target discovery uses the shared main repository worktree list
- **AND** existing launch, shell-integration, ambiguity, and explicit path behavior applies

#### Scenario: No standalone targets exist

- **WHEN** no switchable linked worktree exists
- **THEN** switch preserves its actionable no-target error without creating workspace state

### Requirement: Resolve repository source metadata for Herdr launch targets

The system SHALL use Git metadata to associate every switch target with either the absolute non-bare source/main checkout required by Herdr or an explicit unavailable-source state.

#### Scenario: Configured repository target is discovered

- **WHEN** Arashi discovers a worktree from a configured repository
- **THEN** Arashi resolves the repository's Git main worktree rather than copying its configured path
- **AND** the candidate includes the normalized absolute non-bare source checkout when one exists

#### Scenario: All-scope child target is augmented

- **WHEN** `arashi switch --all` derives a child worktree candidate from a coordinated parent worktree
- **THEN** Arashi resolves the child repository's Git main worktree independently of the coordinated linked child path

#### Scenario: Standalone target is discovered from a linked worktree

- **WHEN** switch runs in an implicit standalone linked worktree
- **THEN** each candidate uses the repository's shared main checkout as its source checkout path

#### Scenario: Repository source is bare

- **WHEN** the selected repository has no non-bare main checkout
- **THEN** the candidate records that Herdr source resolution is unavailable
- **AND** an attempted Herdr switch fails actionably before invoking Herdr or another launcher

#### Scenario: Main checkout is selected

- **WHEN** the selected target path is the repository's non-bare main checkout
- **THEN** Arashi uses that same absolute checkout for both Herdr `--cwd` and `--path`
- **AND** Herdr launch remains a supported operation

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

### Requirement: Use the structured Herdr existing-worktree contract

The system SHALL invoke Herdr with the source checkout, selected worktree, generated label, focus request, and JSON response request as distinct process arguments and SHALL validate structured success before reporting launch completion.

#### Scenario: Herdr command receives repository provenance

- **WHEN** Arashi launches a selected worktree through Herdr
- **THEN** it invokes argv equivalent to `herdr worktree open --cwd <source-checkout> --path <worktree-path> --label <repo-name>: <branch-name> --focus --json`
- **AND** it does not invoke `herdr worktree create`, `herdr worktree remove`, or generic `herdr workspace create`

#### Scenario: Paths and label contain shell-significant characters

- **WHEN** the source path, worktree path, repository name, or branch name contains spaces, quotes, or shell-significant characters
- **THEN** Arashi passes each complete value as its own argv entry without shell interpolation

#### Scenario: Structured response confirms success

- **WHEN** Herdr exits successfully and returns valid JSON with `result.type` equal to `worktree_opened`, boolean `result.already_open`, and a non-empty `result.workspace.workspace_id`
- **THEN** Arashi reports a successful `herdr` launch and retains the executed command in the launch result

#### Scenario: Herdr CLI or server is unavailable

- **WHEN** Herdr cannot be executed or cannot reach its running server/socket
- **THEN** Arashi exits with an actionable `LAUNCH_FAILED` error identifying the attempted command and selected worktree
- **AND** Arashi does not fall back to another launcher

#### Scenario: Herdr returns malformed or incomplete output

- **WHEN** Herdr exits successfully but stdout is not valid JSON, has a different result discriminator, omits boolean `result.already_open`, or omits a non-empty `result.workspace.workspace_id`
- **THEN** Arashi exits with `LAUNCH_FAILED` explaining that the Herdr response could not be validated
- **AND** Arashi does not report a successful switch or silently select another launcher

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

### Requirement: Preserve machine-readable switch restrictions

The system SHALL preserve the existing non-mutating restriction for `arashi switch --json` when Herdr support is added.

#### Scenario: JSON switch is combined with Herdr

- **WHEN** the user invokes `arashi switch --json --herdr`
- **THEN** Arashi returns the existing structured unsupported-mode error without launching Herdr or another target

### Requirement: Configure switch behavior with one canonical mode

The system SHALL expose `defaults.switch.mode` as the single canonical configured switch choice, SHALL accept `auto`, `cd`, `launch`, `sesh`, and `herdr`, and SHALL NOT advertise `defaults.switch.launchMode` in the generated schema, maintained examples, generated agent-readable exports, or skill guidance. An absent configured mode SHALL preserve automatic launcher selection without preferring parent-shell `cd`. `defaults.create` and editor-scoped create defaults SHALL retain an independent `switch` boolean and SHALL use their own canonical `launch` choice.

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
- **AND** create defaults expose their independent canonical `launch` choice without create-specific `launchMode`

#### Scenario: Unsupported unified mode is rejected

- **WHEN** `defaults.switch.mode` contains a value outside the supported unified mode set
- **THEN** Arashi rejects the configuration with an actionable validation error before target selection, launch, directory switching, or other workspace mutation

#### Scenario: User-facing switch contracts agree

- **WHEN** Arashi publishes the unified switch configuration model
- **THEN** CLI help and diagnostics, maintained CLI documentation, canonical documentation, generated agent-readable exports, and the Arashi skill package use the same unified mode vocabulary and legacy migration rules
- **AND** none of those canonical surfaces instruct users to compose `defaults.switch.mode` with `defaults.switch.launchMode`
- **AND** references to create defaults use the independent canonical create `launch` choice

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
