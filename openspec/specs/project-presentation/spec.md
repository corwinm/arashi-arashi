# project-presentation Specification

## Purpose
TBD - created by archiving change initialize-arashi-presentation. Update Purpose after archive.
## Requirements
### Requirement: Coherent Arashi presentation narrative
The presentation SHALL frame Arashi as the solution to two equally important development problems: using Git worktrees for parallel work and using a meta-repository to coordinate an organization's distributed codebase. It SHALL show each solution independently, explain how they compose into coordinated multi-repository worktrees, demonstrate representative workflows, and close with roadmap and next-step guidance.

#### Scenario: Technical onboarding talk
- **WHEN** a presenter delivers the deck in order to a technical team unfamiliar with Arashi
- **THEN** the audience can identify both problems, explain Arashi's solution to each, describe when either capability is useful independently, and explain how worktrees and a meta-repository combine when parallel work spans multiple repositories

#### Scenario: Self-guided viewing
- **WHEN** a visitor opens the deployed deck without a presenter
- **THEN** the visible slide content and links provide enough context to understand the main narrative and continue into canonical documentation

### Requirement: Accurate architecture and workflow examples
The presentation SHALL use architecture diagrams and command examples that reflect the current Arashi repository model and documented CLI behavior.

#### Scenario: Worktree-first explanation
- **WHEN** a viewer reaches the core-concept section
- **THEN** the deck visually compares branch switching or duplicate clones with isolated Git worktrees and shows how Arashi creates, discovers, enters, inspects, and removes those workspaces

#### Scenario: Architecture explanation
- **WHEN** a viewer reaches the architecture section
- **THEN** the deck builds from a single repository with multiple worktrees to an optional meta-repository with coordinated child-repository worktrees, while showing that each owning repository retains independent Git history

#### Scenario: Workflow demonstration
- **WHEN** a viewer reaches a usage or demo section
- **THEN** the deck shows concise, reproducible commands for creating and managing an isolated worktree, inspecting workspace state, scaling the workflow to coordinated repositories, and carrying work through repository-specific changes without requiring a live environment

### Requirement: Two-pillar product positioning
The presentation SHALL give Git worktree management and meta-repository coordination equal narrative and visual emphasis as two distinct, composable solutions. It SHALL NOT imply that a meta-repository is required to benefit from worktree management or that worktrees are only relevant to multi-repository environments.

#### Scenario: Single-repository audience
- **WHEN** a viewer works primarily in one repository
- **THEN** the deck demonstrates a complete and valuable Arashi workflow for parallel branches or agents using isolated worktrees without requiring a multi-repository setup

#### Scenario: Multi-repository audience
- **WHEN** a viewer's organization has a product or platform distributed across several repositories
- **THEN** the deck demonstrates how a meta-repository provides a coherent workspace, planning, status, and execution surface while preserving each owning repository's independent history

#### Scenario: Combined audience
- **WHEN** a viewer needs parallel feature work across several repositories
- **THEN** the deck demonstrates how the two solutions compose into one coordinated feature workspace containing aligned worktrees for the relevant owning repositories

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
The presentation repository SHALL pin pnpm through the `packageManager` field and SHALL provide pnpm-based commands to install dependencies, run the deck locally, validate source quality, and produce a static production build from a committed `pnpm-lock.yaml`.

#### Scenario: Local authoring
- **WHEN** a contributor clones the repository, activates the pinned pnpm version through Corepack when needed, installs dependencies with pnpm, and runs the documented development command
- **THEN** Slidev starts the presentation locally with hot reload

#### Scenario: Reproducible production build
- **WHEN** CI or a contributor installs from the committed lockfile and runs validation and the production build
- **THEN** the commands complete without errors and produce the static deployment artifact

### Requirement: Automated online deployment
The presentation SHALL use Netlify to create deploy previews for pull requests and automatically publish a stable production site after successful validation of changes accepted on `main`.

#### Scenario: Main branch publication
- **WHEN** a commit reaches `main` and validation succeeds
- **THEN** Netlify installs with the pinned pnpm version and frozen lockfile, validates and builds the deck, and publishes the resulting static artifact to the production site

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

### Requirement: Presentation commands use aw
Maintained presentation slides and terminal walkthroughs SHALL use `aw` for actionable commands while retaining Arashi product branding and stable identifiers.

#### Scenario: Viewer follows a terminal example
- **WHEN** a maintained slide presents a command to copy or run
- **THEN** the executable spelling is `aw`
- **AND** product naming and package/URL identifiers remain Arashi/`arashi` as applicable

