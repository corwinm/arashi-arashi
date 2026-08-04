## ADDED Requirements

### Requirement: Apply explicit disposition to managed Kitty worktree sessions
Managed Kitty SHALL remain an identity-backed, structured worktree-session integration. Its Kitty tab/session SHALL be the documented independent-session equivalent for default disposition and the documented tab equivalent for `--tab`; neither disposition SHALL bypass exact identity lookup, duplicate detection, focus/reuse validation, locking, or sensitive-state projection.

#### Scenario: Default disposition creates or reuses managed Kitty session
- **WHEN** strict managed Kitty evidence is present and launch disposition is `window`
- **THEN** Arashi creates, focuses, or reuses the exact identity-tagged worktree tab/session
- **AND** reports disposition `window` because the managed session is Kitty's documented independent-session equivalent

#### Scenario: Explicit tab uses the same exact identity contract
- **WHEN** strict managed Kitty evidence is present and launch disposition is `tab`
- **THEN** Arashi creates, focuses, or reuses the same exact identity-tagged worktree tab/session
- **AND** reports disposition `tab` without creating a second identity or silently opening an OS window

#### Scenario: Existing managed session is focused for either disposition
- **WHEN** one valid Kitty window already carries the selected worktree identity
- **THEN** Arashi focuses and validates that existing session rather than creating a duplicate
- **AND** requested disposition does not weaken duplicate-state or focus reconciliation rules

#### Scenario: Nested higher-precedence contexts remain authoritative
- **WHEN** strict tmux, Herdr, cmux, or explicit launcher selection has higher precedence than managed Kitty
- **THEN** Arashi applies disposition to the selected higher-precedence launcher
- **AND** does not inspect or mutate Kitty state

#### Scenario: Every canonical strict marker selects managed Kitty
- **WHEN** any one of non-empty `KITTY_PID`, non-empty `KITTY_WINDOW_ID`, or normalized exact `TERM=xterm-kitty` is present
- **THEN** Arashi selects the identity-backed managed Kitty protocol after higher-precedence managed contexts
- **AND** applies the requested disposition without requiring the other Kitty markers

#### Scenario: Unmanaged Kitty remains a separate mapping
- **WHEN** terminal application evidence identifies Kitty but `KITTY_PID` and `KITTY_WINDOW_ID` are empty or absent and normalized `TERM` is not exactly `xterm-kitty`
- **THEN** Arashi does not use the identity-backed Kitty session protocol
- **AND** applies the unmanaged Kitty window or unsupported-tab mapping from the shared launch-disposition contract
