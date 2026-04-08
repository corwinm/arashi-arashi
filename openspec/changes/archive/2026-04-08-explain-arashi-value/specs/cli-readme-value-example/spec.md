## ADDED Requirements

### Requirement: CLI README SHALL include a value-focused multi-repo example section
The CLI README SHALL include a dedicated section that explains Arashi's value through a minimal frontend-and-backend multi-repo workflow.

#### Scenario: User reads README onboarding content
- **WHEN** a user reads the top-level README for understanding what Arashi does
- **THEN** the README contains a concise value-focused example section describing parallel multi-repo worktrees

### Requirement: README example SHALL mirror the landing-page workflow narrative
The README example SHALL use the same canonical workflow narrative as the docs landing page, including setup context and switch-while-other-worktree-active outcome.

#### Scenario: Docs and README are compared
- **WHEN** maintainers compare landing-page and README example content
- **THEN** both sources present the same workflow story and outcome without contradictory framing

### Requirement: README SHALL provide static visual support for the example
The README SHALL include static visual assets or frame sequence that reinforce the minimal workflow in environments where landing-page animation is not available.

#### Scenario: README is rendered on GitHub
- **WHEN** the README is viewed in a markdown renderer without interactive animation
- **THEN** the example still includes visual context that communicates the workflow steps
