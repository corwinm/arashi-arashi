## ADDED Requirements

### Requirement: Coherent Arashi presentation narrative
The presentation SHALL provide a coherent narrative that explains the multi-repository development problem, introduces Arashi's value, describes its architecture, demonstrates representative workflows, and closes with roadmap and next-step guidance.

#### Scenario: Technical onboarding talk
- **WHEN** a presenter delivers the deck in order to a technical team unfamiliar with Arashi
- **THEN** the audience can identify the problem Arashi solves, the core coordinated-workspace model, the owning-repository rule, and the main commands used in a typical workflow

#### Scenario: Self-guided viewing
- **WHEN** a visitor opens the deployed deck without a presenter
- **THEN** the visible slide content and links provide enough context to understand the main narrative and continue into canonical documentation

### Requirement: Accurate architecture and workflow examples
The presentation SHALL use architecture diagrams and command examples that reflect the current Arashi repository model and documented CLI behavior.

#### Scenario: Architecture explanation
- **WHEN** a viewer reaches the architecture section
- **THEN** the deck distinguishes the meta-repository, coordinated worktrees, and owning child repositories and shows how one branch spans independently committed repositories

#### Scenario: Workflow demonstration
- **WHEN** a viewer reaches a usage or demo section
- **THEN** the deck shows concise, reproducible commands for inspecting a workspace, creating coordinated worktrees, and carrying work through repository-specific changes without requiring a live environment

### Requirement: Presentation-ready visual system
The presentation SHALL use a consistent Arashi-specific visual system with readable typography, accessible contrast, varied visual layouts, and a visual element on each content slide.

#### Scenario: Projected presentation
- **WHEN** the deck is rendered at a standard widescreen presentation resolution
- **THEN** titles, body text, commands, diagrams, and links remain legible without clipping, overlap, or reliance on low-contrast decoration

#### Scenario: Visual review
- **WHEN** the completed deck is reviewed slide by slide from rendered images
- **THEN** every identified overflow, collision, alignment, spacing, contrast, and placeholder-content defect is corrected and re-verified

### Requirement: Presenter guidance and resilient demos
The presentation SHALL include presenter notes for substantive slides and SHALL make any live demonstration optional by retaining the complete point in static slide content.

#### Scenario: Presenter preparation
- **WHEN** a presenter opens Slidev presenter mode
- **THEN** the notes provide the key talking point, transition, and any optional demonstration instruction needed to deliver the narrative consistently

#### Scenario: Demo unavailable
- **WHEN** a live demo cannot be run because network access or repository state is unavailable
- **THEN** the presenter can continue using the static commands and expected outcomes without losing the workflow explanation

### Requirement: Local development and validation
The presentation repository SHALL provide Bun-based commands to install dependencies, run the deck locally, validate source quality, and produce a static production build from a committed lockfile.

#### Scenario: Local authoring
- **WHEN** a contributor clones the repository, installs dependencies with Bun, and runs the documented development command
- **THEN** Slidev starts the presentation locally with hot reload

#### Scenario: Reproducible production build
- **WHEN** CI or a contributor installs from the committed lockfile and runs validation and the production build
- **THEN** the commands complete without errors and produce the static deployment artifact

### Requirement: Automated online deployment
The presentation SHALL use Netlify to create deploy previews for pull requests and automatically publish a stable production site after successful validation of changes accepted on `main`.

#### Scenario: Main branch publication
- **WHEN** a commit reaches `main` and validation succeeds
- **THEN** Netlify installs from the Bun lockfile, validates and builds the deck, and publishes the resulting static artifact to the production site

#### Scenario: Pull request quality gate
- **WHEN** a pull request changes presentation source, dependencies, or deployment configuration
- **THEN** GitHub Actions validates the source and completes the production build while Netlify publishes an isolated deploy preview without replacing the public production deck

### Requirement: Project discoverability and coordinated workspace integration
The Arashi meta-repository SHALL register the presentation repository as a managed child repository and SHALL link to both its source and its deployed deck from the project README.

#### Scenario: Coordinated repository discovery
- **WHEN** a contributor runs Arashi repository discovery or setup from the meta-repository after the change is merged
- **THEN** `arashi-presentation` is available as a configured child repository at `repos/arashi-presentation`

#### Scenario: README discovery
- **WHEN** a visitor reads the Arashi meta-repository README
- **THEN** the repository list includes clear links to the presentation source and live deck
