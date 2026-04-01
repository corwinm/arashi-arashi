## ADDED Requirements

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
