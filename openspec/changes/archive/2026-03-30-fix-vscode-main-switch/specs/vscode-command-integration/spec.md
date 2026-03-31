## ADDED Requirements

### Requirement: Pass exact worktree identity for selected switch targets
The extension SHALL invoke `arashi switch` with explicit worktree-path targeting whenever an extension switch flow has already resolved a concrete worktree selection.

#### Scenario: Command palette switch uses exact path mode
- **WHEN** a user runs the extension switch command, chooses a specific worktree from the native picker, and the extension invokes `arashi switch`
- **THEN** the extension passes the selected worktree path using the CLI's explicit path-targeting mode instead of a fuzzy positional filter

#### Scenario: Exact path mode preserves host-specific launch overrides
- **WHEN** an extension switch flow invokes `arashi switch` for a selected worktree in VS Code, Cursor, or Kiro
- **THEN** the extension still passes the matching host-specific IDE override together with the explicit path-targeting mode
