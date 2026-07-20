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
The system SHALL resolve switch behavior for the selected worktree using CLI flags, configured switch defaults, and shell-integration availability, and SHALL either launch a new terminal or editor context or request a parent-shell directory change for the selected worktree.

#### Scenario: Switch applies configured launch default
- **WHEN** the user runs `arashi switch` and switch behavior is configured with a `launch` default
- **THEN** the command launches the configured terminal or editor behavior for the selected worktree

#### Scenario: Explicit IDE flag overrides switch default
- **WHEN** switch launch defaults are configured and the user passes one of `--vscode`, `--cursor`, or `--kiro`
- **THEN** the command launches the selected IDE for that invocation instead of the configured default

#### Scenario: User requests parent-shell directory switching
- **WHEN** the user runs `arashi switch --cd` and shell integration is active for the invocation
- **THEN** the command requests a parent-shell directory change for the selected worktree instead of opening a new terminal or editor context

#### Scenario: Auto mode prefers directory switching when integration is active
- **WHEN** the user runs `arashi switch` with switch behavior configured as `auto` and shell integration is active
- **THEN** the command requests a parent-shell directory change for the selected worktree

#### Scenario: Auto mode falls back to launch behavior when integration is inactive
- **WHEN** the user runs `arashi switch` with switch behavior configured as `auto` and shell integration is not active
- **THEN** the command preserves the existing launch behavior for the selected worktree

#### Scenario: User disables directory switching for one invocation
- **WHEN** the user runs `arashi switch --no-cd` and switch behavior would otherwise resolve to `cd` or `auto`
- **THEN** the command skips directory switching for that invocation and uses launch behavior instead

#### Scenario: Requested directory switching is unavailable
- **WHEN** the user runs `arashi switch --cd` but shell integration is not active
- **THEN** the command does not fail solely because directory switching is unavailable, does not launch an alternate terminal or editor context for that invocation, and shows an actionable warning explaining how to enable shell integration or rerun through the wrapper

#### Scenario: Configured cd mode is unavailable
- **WHEN** switch behavior resolves to configured `cd` mode but shell integration is not active
- **THEN** the command shows an actionable warning and follows normal launch resolution for the selected worktree

#### Scenario: Conflicting launch overrides are provided
- **WHEN** the user passes more than one explicit IDE launch flag in a single invocation
- **THEN** the system exits with an error instructing the user to choose exactly one launch override

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
The system SHALL detect supported IDE environments and SHALL prefer the matching IDE launcher when the user does not provide an explicit launch override.

#### Scenario: Cursor environment prefers Cursor launcher
- **WHEN** the user runs `arashi switch` from a Cursor-integrated environment and no explicit launch override is provided
- **THEN** the system opens the selected worktree in Cursor when the Cursor launcher is available

#### Scenario: Kiro environment prefers Kiro launcher
- **WHEN** the user runs `arashi switch` from a Kiro-integrated environment and no explicit launch override is provided
- **THEN** the system opens the selected worktree in Kiro when the Kiro launcher is available

#### Scenario: Unsupported environment uses existing fallback behavior
- **WHEN** the user runs `arashi switch` from an environment that does not match a supported IDE
- **THEN** the system uses the existing non-IDE fallback launch behavior

### Requirement: Launch selected worktrees as cmux workspaces
The system SHALL detect a cmux-managed terminal from cmux-specific workspace or surface environment identifiers and SHALL create and focus a cmux workspace rooted at the exact selected worktree before generic Ghostty fallback behavior can run.

#### Scenario: Switch launches a cmux workspace
- **WHEN** the user runs `arashi switch <target>` from a terminal with a non-empty `CMUX_WORKSPACE_ID` or `CMUX_SURFACE_ID`
- **THEN** Arashi creates a cmux workspace with the selected worktree's absolute path as its working directory
- **AND** the new cmux workspace is focused
- **AND** the switch result reports launch mode `cmux`

#### Scenario: Worktree path is passed without shell interpolation
- **WHEN** the selected cmux worktree path contains spaces, quotes, or shell-significant characters
- **THEN** Arashi passes the complete absolute path as a distinct process argument
- **AND** cmux receives that exact path as the requested working directory

#### Scenario: Ordinary Ghostty is not treated as cmux
- **WHEN** the user runs `arashi switch` with `TERM_PROGRAM=ghostty` but without a non-empty cmux workspace or surface identifier
- **THEN** Arashi preserves the ordinary Ghostty launch behavior

#### Scenario: Socket path alone does not imply active cmux context
- **WHEN** `CMUX_SOCKET_PATH` is set outside a cmux-managed terminal without a non-empty cmux workspace or surface identifier
- **THEN** Arashi does not automatically select cmux launch mode

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
The system SHALL preserve explicit sesh and IDE launch overrides and SHALL preserve active tmux handling ahead of automatic cmux detection.

#### Scenario: Explicit IDE override wins in cmux
- **WHEN** a user in a cmux-managed terminal requests a supported explicit IDE launch flag
- **THEN** Arashi launches the requested IDE instead of creating a cmux workspace

#### Scenario: Explicit sesh retains highest terminal-session priority
- **WHEN** a user requests `--sesh` from a cmux-managed terminal with an active tmux session
- **THEN** Arashi follows the existing sesh validation and launch behavior

#### Scenario: Nested tmux retains tmux behavior
- **WHEN** `TMUX` and cmux managed-terminal identifiers are both non-empty and no explicit launch override is provided
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
- **WHEN** the user runs `arashi switch <target>` without an explicit or configured launcher and `HERDR_ENV` normalizes to the exact value `1`
- **THEN** Arashi opens or focuses the selected worktree through Herdr before IDE or generic terminal fallback detection

#### Scenario: Similar environment values are not Herdr signals
- **WHEN** `HERDR_ENV` is absent, empty, or normalizes to a value other than the exact string `1`
- **THEN** Arashi does not automatically select Herdr launch mode

#### Scenario: Configured Herdr launch mode is used
- **WHEN** `defaults.switch.launchMode` is `herdr` and launch behavior is selected
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
The system SHALL resolve explicit launcher flags before configured launch mode, configured launch mode before automatic environment detection, and automatic Herdr detection before IDE and generic terminal fallbacks while retaining existing automatic tmux precedence.

#### Scenario: Explicit Herdr overrides configured and automatic modes
- **WHEN** the user passes `--herdr` and another launch mode would otherwise be selected from configuration or environment
- **THEN** Arashi uses Herdr for that invocation

#### Scenario: Configured Herdr overrides automatic tmux or terminal detection
- **WHEN** launch mode is configured as `herdr` and no explicit launcher is passed
- **THEN** Arashi uses Herdr regardless of automatic tmux, cmux, IDE, or terminal signals

#### Scenario: Automatic nested tmux retains existing behavior
- **WHEN** `TMUX` is active and `HERDR_ENV=1` but no explicit or configured launcher is selected
- **THEN** Arashi uses the existing tmux launch behavior

#### Scenario: Automatic Herdr precedes cmux and IDE detection
- **WHEN** `HERDR_ENV=1` appears with cmux or integrated IDE signals and no explicit or configured launcher is selected
- **THEN** Arashi uses Herdr after determining that automatic tmux does not apply

#### Scenario: Conflicting explicit launcher flags are rejected
- **WHEN** the user combines `--herdr` with `--sesh` or any explicit IDE launcher flag
- **THEN** Arashi exits before launch with a deterministic error instructing the user to choose exactly one launcher

#### Scenario: Herdr conflicts with parent-shell switching
- **WHEN** the user combines `--herdr` with `--cd`
- **THEN** Arashi rejects the conflicting switch behavior before launch

#### Scenario: No-cd forces configured Herdr launch
- **WHEN** configured switch mode would select parent-shell directory switching, configured launch mode is `herdr`, and the user passes `--no-cd`
- **THEN** Arashi performs Herdr launch behavior instead of emitting a directory-change directive

#### Scenario: Default-launch opt-out bypasses configured Herdr
- **WHEN** configured launch mode is `herdr` and the user passes `--no-default-launch` without explicit `--herdr`
- **THEN** Arashi bypasses the configured Herdr mode and uses automatic launch resolution

### Requirement: Preserve machine-readable switch restrictions
The system SHALL preserve the existing non-mutating restriction for `arashi switch --json` when Herdr support is added.

#### Scenario: JSON switch is combined with Herdr
- **WHEN** the user invokes `arashi switch --json --herdr`
- **THEN** Arashi returns the existing structured unsupported-mode error without launching Herdr or another target
