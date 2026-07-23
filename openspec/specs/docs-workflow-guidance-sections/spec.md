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
