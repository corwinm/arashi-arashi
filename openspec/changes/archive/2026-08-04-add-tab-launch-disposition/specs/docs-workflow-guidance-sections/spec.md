## ADDED Requirements

### Requirement: Document launch disposition across canonical workflows
Canonical documentation SHALL explain that automatic launch defaults to a new window or documented independent managed session, that `--tab` is a one-invocation opt-in on switch and create, and that unsupported launchers fail without opening a window. Generated agent-readable exports SHALL be regenerated from the canonical sources.

#### Scenario: Switch documentation explains disposition
- **WHEN** a user reads the switch command or workflow reference
- **THEN** it documents default `window`, explicit `--tab`, the parent-shell conflict, IDE and managed-launcher composition, JSON rejection, standalone parity, and unsupported guidance

#### Scenario: Create documentation explains disposition
- **WHEN** a user reads the create command or defaults reference
- **THEN** it documents that `--tab` implies launch and switch handling, wins over create negative flags, remains CLI-only, permits dry-run preview, rejects JSON, and preserves worktrees on post-create process failure

#### Scenario: Launcher matrix is user-visible
- **WHEN** a user consults terminal integration guidance
- **THEN** it identifies true-tab mappings for Windows Terminal, WezTerm, Terminal.app, iTerm2, macOS Ghostty, and active-workspace Herdr; managed equivalents for Kitty, tmux/sesh, and cmux; and unsupported mappings for Git Bash/MinTTY, IDE workspaces, Linux Ghostty, unmanaged Kitty tabs, and generic platform fallbacks
- **AND** it explains that a detected multiplexer receives the tab before its containing terminal application

#### Scenario: Troubleshooting does not recommend silent fallback
- **WHEN** documentation describes `TAB_DISPOSITION_UNSUPPORTED` or supported tab execution failure
- **THEN** it recommends the default window or a tab-capable detected host as applicable
- **AND** does not claim Arashi will retry the request as a window

#### Scenario: Generated documentation remains canonical
- **WHEN** canonical documentation changes
- **THEN** agent-readable exports are regenerated rather than edited directly
- **AND** source/export freshness checks pass
