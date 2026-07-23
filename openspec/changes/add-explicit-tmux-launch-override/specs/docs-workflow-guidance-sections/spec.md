## ADDED Requirements

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
