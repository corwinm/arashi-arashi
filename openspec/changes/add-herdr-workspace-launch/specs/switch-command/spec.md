## ADDED Requirements

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
