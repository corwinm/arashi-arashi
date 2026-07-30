## ADDED Requirements

### Requirement: Detect managed Kitty context from strict environment evidence
Arashi SHALL classify Kitty synchronously as a first-class automatic launch context only from a `KITTY_PID` or `KITTY_WINDOW_ID` value that remains non-empty after trimming, or normalized `TERM` exactly equal to `xterm-kitty`. This environment classification SHALL occur before contextual parent-shell directory switching; executable and version support SHALL be validated later without reclassifying selected Kitty as an unmanaged context.

#### Scenario: Kitty environment is selected
- **WHEN** automatic launch applies and a `KITTY_PID` or `KITTY_WINDOW_ID` remains non-empty after trimming, or normalized `TERM` is exactly `xterm-kitty`
- **THEN** Arashi selects managed Kitty after higher-precedence managed contexts and before generic terminal/platform fallback
- **AND** contextual shell integration does not cause parent-shell `cd` to replace the selected Kitty context

#### Scenario: Empty Kitty markers are ignored
- **WHEN** Kitty process/window markers are absent, empty, or whitespace-only and terminal identity does not identify Kitty
- **THEN** Arashi does not select managed Kitty from those weak values

#### Scenario: Similar terminal text is not Kitty identity
- **WHEN** process/window markers are absent and normalized `TERM` contains Kitty-like text but is not exactly `xterm-kitty`
- **THEN** Arashi does not select managed Kitty from that terminal value

### Requirement: Preflight selected Kitty support without reclassification
After strict environment detection selects managed Kitty, Arashi SHALL resolve `kitten`, parse its version, require version 0.43.0 or newer, and report successful managed reuse or creation as mode `kitty`. Preflight failure SHALL remain a managed Kitty `LAUNCH_FAILED` outcome and SHALL NOT resume context detection, parent-shell switching, or generic fallback.

#### Scenario: Selected Kitty environment is supported
- **WHEN** managed Kitty is selected, `kitten` resolves, and its parsed version is at least 0.43.0
- **THEN** Arashi proceeds to managed Kitty state inspection
- **AND** successful reuse or creation reports launch mode `kitty`

#### Scenario: Kitty version is unsupported
- **WHEN** Kitty is positively selected but `kitten` reports a version older than 0.43.0
- **THEN** Arashi fails with actionable `LAUNCH_FAILED` detail naming the minimum and detected versions
- **AND** invokes no generic fallback launcher

#### Scenario: Kitty executable or version response is unavailable
- **WHEN** Kitty is positively selected but `kitten` cannot execute or its version response cannot be validated
- **THEN** Arashi fails with actionable `LAUNCH_FAILED` detail for the version preflight phase
- **AND** does not create an ungrouped tab or standalone Kitty process

#### Scenario: macOS app bundle supplies kitten
- **WHEN** managed Kitty is selected on macOS, `kitten` is absent from inherited `PATH`, and the standard Kitty application-bundle executable exists
- **THEN** Arashi uses `/Applications/kitty.app/Contents/MacOS/kitten` for version and remote-control argv
- **AND** does not search for or attach to an arbitrary Kitty socket

### Requirement: Derive stable identity and readable session metadata
Arashi SHALL derive a versioned collision-resistant worktree identity from the canonical absolute worktree path, SHALL keep that identity separate from readable repository/branch metadata, and SHALL pass every path and metadata value as a distinct process argument.

#### Scenario: Same canonical path is launched repeatedly
- **WHEN** Arashi derives Kitty metadata for the same canonical worktree path in separate invocations
- **THEN** it produces the same full path-derived identity each time

#### Scenario: Worktree path has a filesystem alias
- **WHEN** the selected absolute path contains symlink components or a trailing separator
- **THEN** Arashi uses filesystem `realpath`, platform path normalization, and root-safe trailing-separator removal before hashing
- **AND** uses that same canonical absolute path as Kitty cwd

#### Scenario: Similar labels refer to different worktrees
- **WHEN** two worktrees have equal or similar repository/branch labels but different canonical paths
- **THEN** their collision-resistant identities differ
- **AND** each readable session name/title remains based on its own repository and branch

#### Scenario: Unsafe-looking values remain argv-safe
- **WHEN** a path, repository name, or branch contains spaces, quotes, regular-expression characters, or shell-significant characters
- **THEN** Arashi passes each complete cwd, session name, title, marker assignment, and match expression as a distinct argv value without shell interpolation
- **AND** exact reuse matching uses only the fixed-format anchored identity rather than the raw path or readable label

### Requirement: Reuse and focus an existing Kitty worktree window
Arashi SHALL inspect structured Kitty state for the exact Arashi identity before launching, SHALL deterministically select and focus an existing match, and SHALL validate its exact identity, canonical cwd, and focused state before reporting success.

#### Scenario: One live worktree window exists
- **WHEN** structured Kitty state contains one window whose `arashi_worktree_id` exactly matches the selected worktree identity and whose cwd is the canonical selected path
- **THEN** Arashi focuses that window by numeric window ID
- **AND** creates no new tab
- **AND** reports mode `kitty` only after structured state confirms the focused exact match

#### Scenario: Multiple pre-existing exact matches exist
- **WHEN** structured state contains more than one valid exact match before this invocation
- **THEN** Arashi fails with actionable duplicate-state `LAUNCH_FAILED` detail
- **AND** does not create, focus, or close any Kitty window

#### Scenario: Matched window closes before focus
- **WHEN** the selected exact match disappears before focus or post-focus validation
- **THEN** Arashi performs one bounded re-inspection
- **AND** focuses a valid replacement match when one exists or enters the single create path when none remains

#### Scenario: Existing readable metadata has drifted
- **WHEN** exactly one matching window has the expected identity and canonical cwd but a stale title or session name
- **THEN** Arashi focuses and reuses that window without creating a duplicate
- **AND** does not fail or rewrite live Kitty metadata solely because presentation text differs

### Requirement: Create and validate a live Kitty session-backed tab
When no valid exact match exists, Arashi SHALL create one Kitty tab at the exact worktree path with the stable marker, readable session name, and readable title, SHALL validate the returned window ID and structured state, and SHALL treat Kitty session assignment as live-only state.

#### Scenario: No live worktree window exists
- **WHEN** exact structured inspection finds no valid matching window
- **THEN** Arashi invokes argv equivalent to `kitten @ launch --type=tab --cwd <canonical-path> --add-to-session <readable-session> --var arashi_worktree_id=<identity> --title <readable-title>`
- **AND** validates the returned numeric window ID
- **AND** validates that exact window's marker, cwd, session name, and title before reporting mode `kitty`

#### Scenario: Structured launch response is malformed
- **WHEN** Kitty exits successfully but launch output lacks one parseable non-empty numeric window ID
- **THEN** Arashi fails with `LAUNCH_FAILED` for launch-response validation
- **AND** does not report success or invoke a fallback launcher

#### Scenario: Returned window state is inconsistent
- **WHEN** the returned window ID is absent from structured state or has a different marker, cwd, session name, or title
- **THEN** Arashi fails with actionable state-validation detail
- **AND** does not claim the selected worktree was launched

#### Scenario: Session state is not persisted by Arashi
- **WHEN** Arashi creates a managed Kitty worktree tab
- **THEN** it uses Kitty's live `--add-to-session` behavior
- **AND** does not create or modify a `.kitty-session` file

### Requirement: Serialize concurrent launch races without window cleanup
Arashi SHALL serialize the complete inspect/focus-or-launch/validate sequence with a bounded cross-process lock keyed by stable identity, SHALL recover stale locks conservatively, and SHALL never close a Kitty window as automatic duplicate cleanup.

#### Scenario: Concurrent invocations target one absent session
- **WHEN** two Arashi processes concurrently target the same identity and no marked Kitty window exists
- **THEN** one process atomically acquires the identity lock and completes launch/validation before releasing it
- **AND** the waiting process then observes and reuses the one validated window without creating a duplicate

#### Scenario: Live lock owner exceeds ordinary operation time
- **WHEN** a contender sees lock metadata naming a live owner PID even after the stale-age threshold
- **THEN** it does not steal the lock solely because of age
- **AND** fails with actionable lock-timeout detail after waiting at most 10 seconds

#### Scenario: Dead or malformed stale lock is recovered conservatively
- **WHEN** lock metadata names a dead owner PID, or malformed/unverifiable metadata is at least 30 seconds old
- **THEN** Arashi may atomically recover and acquire that identity lock
- **AND** records its own identity, PID, and creation timestamp before inspecting Kitty

#### Scenario: Owned lock is released on every outcome
- **WHEN** reuse, launch, validation, or error handling completes
- **THEN** Arashi releases the lock in `finally` only when ownership still matches the current invocation

#### Scenario: Duplicate state appears while locked
- **WHEN** structured state contains multiple exact marker matches before or after launch despite lock ownership
- **THEN** Arashi fails with actionable `LAUNCH_FAILED` duplicate-state detail
- **AND** does not launch again, select an arbitrary match, or close any Kitty window

### Requirement: Fail closed after managed Kitty selection
Once managed Kitty is positively selected, Arashi SHALL preserve actionable phase-specific failures for remote control, inspection, focus, launch, reconciliation, and validation and SHALL NOT fall through to another launcher or directory-switch behavior.

#### Scenario: Remote control is denied or unreachable
- **WHEN** Kitty rejects remote control because permission, password, socket, or controlling-terminal access is unavailable
- **THEN** Arashi reports `LAUNCH_FAILED` with useful Kitty detail and remote-control setup guidance
- **AND** does not open a generic Kitty tab, standalone Kitty window, IDE, other terminal, or parent-shell directory change

#### Scenario: Kitty state JSON is malformed
- **WHEN** a Kitty inspection command exits successfully but returns invalid JSON or invalid required candidate fields
- **THEN** Arashi reports structured-state validation failure without exposing unrelated Kitty environment state
- **AND** invokes no fallback

#### Scenario: Focus or launch process fails
- **WHEN** a managed Kitty focus, launch, or final validation command exits unsuccessfully
- **THEN** Arashi reports the selected worktree, failure phase, safe attempted argv, exit status, and useful stderr
- **AND** does not report a successful switch

### Requirement: Keep Kitty window lifecycle independent from worktree removal
Arashi SHALL NOT close, remove, or persistently rewrite Kitty sessions when removing an Arashi-managed Git worktree.

#### Scenario: Remove targets a worktree with a live Kitty session
- **WHEN** `arashi remove` removes a Git worktree that has a live Arashi-marked Kitty window
- **THEN** Arashi performs no implicit Kitty remote-control mutation
- **AND** canonical guidance explains that Kitty window/session cleanup remains manual and independent
