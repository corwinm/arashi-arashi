## ADDED Requirements

### Requirement: Landing page SHALL communicate Arashi's multi-repo value above the fold
The docs landing page SHALL present a primary value proposition that explains users can coordinate multiple repositories and multiple worktrees in parallel without losing context.

#### Scenario: Visitor opens the landing page
- **WHEN** a first-time visitor loads the docs landing page
- **THEN** the hero/value section states Arashi's multi-repo parallel-worktree outcome before feature-level details

### Requirement: Landing page SHALL include a canonical frontend-backend scenario
The docs landing page SHALL include one minimal scenario that names a frontend repository and a backend repository and explains concurrent work across both.

#### Scenario: Visitor scans the value section
- **WHEN** the visitor reads the primary example on the landing page
- **THEN** the example explicitly references both frontend and backend repositories as part of one workflow

### Requirement: Landing page copy MUST remain concise and action-oriented
The value section MUST use concise copy that emphasizes workflow outcome, and MUST avoid replacing the value proposition with exhaustive command reference text.

#### Scenario: Value section content is reviewed
- **WHEN** the landing-page value section is updated
- **THEN** the section still communicates the outcome in short narrative form and defers detailed command coverage to deeper documentation
