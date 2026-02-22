## ADDED Requirements

### Requirement: Clone missing configured repositories
The system SHALL provide an `arashi clone` command that discovers configured repositories missing from the local workspace and limits clone candidates to those missing repositories.

#### Scenario: Missing repositories are discovered
- **WHEN** the user runs `arashi clone` and one or more configured repositories are not present locally
- **THEN** the command returns those missing repositories as clone candidates

#### Scenario: No repositories are missing
- **WHEN** the user runs `arashi clone` and all configured repositories are already present locally
- **THEN** the command exits successfully with a message indicating there are no repositories to clone

### Requirement: Interactive selection is the default clone mode
The system SHALL run in interactive selection mode by default and SHALL allow the user to select one or more missing repositories to clone.

#### Scenario: Interactive clone selection
- **WHEN** the user runs `arashi clone` in an interactive terminal with multiple missing repositories
- **THEN** the command prompts for repository selection before executing clone operations

### Requirement: Clone all missing repositories non-interactively
The system SHALL support a non-interactive `--all` mode that clones every missing configured repository without presenting a selection prompt.

#### Scenario: Clone all mode
- **WHEN** the user runs `arashi clone --all`
- **THEN** the command clones all missing configured repositories and does not ask for interactive selection

### Requirement: Clone command reports per-repository outcomes
The system SHALL report clone success or failure for each selected repository and SHALL continue attempting remaining selected repositories when one clone fails.

#### Scenario: One repository clone fails
- **WHEN** the command processes multiple selected repositories and one clone operation fails
- **THEN** the command reports the failure for that repository and continues cloning remaining selected repositories
