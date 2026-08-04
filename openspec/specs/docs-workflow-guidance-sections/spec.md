# docs-workflow-guidance-sections Specification

## Purpose

Define documentation requirements for discoverable workflow guidance covering hooks, configuration, integrations, and onboarding cross-links.
## Requirements
### Requirement: Docs SHALL provide dedicated workflow guidance for hooks, configuration, and integrations

The documentation SHALL provide dedicated, discoverable guidance for hooks, configuration options, and integrations instead of requiring users to infer those workflows only from command-reference pages.

#### Scenario: User needs workflow-specific guidance

- **WHEN** a user wants to learn how Arashi supports hooks, configuration defaults, or integrations
- **THEN** the docs navigation or primary onboarding flow leads them to a focused workflow page or section for that topic

### Requirement: Integration guidance SHALL cover supported editor and terminal workflows

The integrations guidance SHALL describe how Arashi fits with VSCode, tmux, and tmux plus sesh workflows, and SHALL link to the relevant command documentation for setup details and constraints.

#### Scenario: User evaluates integration options

- **WHEN** a user opens the integrations guidance
- **THEN** they can compare VSCode, tmux, and tmux plus sesh workflows and follow links to the detailed command documentation they need

### Requirement: Onboarding content SHALL cross-link to workflow guidance

The landing page, getting-started flow, and top-level README SHALL point users to hooks, configuration, and integration guidance as next-step documentation after initial installation and workspace setup.

#### Scenario: User completes first setup steps

- **WHEN** a user finishes reading install or first-workflow instructions
- **THEN** the docs and README offer explicit next links to the relevant workflow guidance sections

### Requirement: Canonical guidance distinguishes explicit plain tmux from sesh

The documentation SHALL teach explicit plain-tmux switching and post-create launch, distinguish `--tmux` from `--sesh`, and state prerequisite, precedence, conflict, JSON, standalone, configuration-decision, and failure behavior.

#### Scenario: Switch and create references document plain tmux

- **WHEN** a user reads the canonical switch or create command reference
- **THEN** the page provides copy-pasteable `--tmux` syntax and states that selected tmux never falls back when context or launch fails

#### Scenario: Tmux and sesh workflow explains the choice

- **WHEN** a user reads the tmux and sesh workflow guide
- **THEN** the guide explains that `--tmux` opens a plain tmux window while `--sesh` requires the sesh binary and uses sesh session integration

#### Scenario: Configuration decision is explicit

- **WHEN** a configured-workspace user reads tmux guidance
- **THEN** the documentation states that `--tmux` is per-invocation-only and configured `auto` already chooses tmux inside an active tmux session

#### Scenario: Standalone guidance remains accurate

- **WHEN** a zero-config user follows tmux workflow guidance
- **THEN** the documentation confirms that explicit tmux works without adopting workspace configuration

#### Scenario: Agent-readable exports include the updated contract

- **WHEN** documentation validation regenerates or checks agent-readable exports
- **THEN** the exported switch, create, and tmux workflow guidance contains the same tmux syntax and semantics as the canonical pages

### Requirement: Documentation provides a discoverable managed Kitty workflow
The documentation SHALL provide dedicated, discoverable guidance for Arashi's automatic managed Kitty worktree sessions and SHALL keep command references, integration navigation, troubleshooting, and agent-readable exports aligned.

#### Scenario: User evaluates Kitty integration
- **WHEN** a user opens integrations or terminal workflow guidance
- **THEN** they can discover a focused Kitty workflow explaining Kitty 0.43+, permitted remote control, automatic precedence, exact live-session reuse, and readable worktree labels
- **AND** can follow links to the relevant switch and create command references

#### Scenario: User configures or troubleshoots remote control
- **WHEN** managed Kitty version, executable, permission, password, socket, focus, launch, lock, duplicate-state, or validation handling fails
- **THEN** canonical guidance explains the actionable prerequisite or recovery boundary
- **AND** does not recommend weakening Kitty security policy, inventing environment markers, attaching to an arbitrary socket, or retrying through another launcher

#### Scenario: User asks about persistence or removal
- **WHEN** a user needs Kitty session restoration or removes an Arashi worktree with a live Kitty window
- **THEN** documentation states that this slice uses temporary live sessions, does not write `.kitty-session` files, and does not close Kitty windows during `arashi remove`

#### Scenario: Agent-readable exports include Kitty guidance
- **WHEN** documentation validation regenerates or checks agent-readable exports
- **THEN** exported switch, create, configuration, and Kitty workflow guidance contains the same version, precedence, reuse, failure, persistence, and ownership semantics as canonical pages

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
