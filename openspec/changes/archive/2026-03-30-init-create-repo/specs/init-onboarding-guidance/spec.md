## ADDED Requirements

### Requirement: Getting-started docs SHALL explain valid init starting locations
The getting-started documentation SHALL explain that `arashi init` can be run from an existing repository root or from a non-repository parent directory when the user wants Arashi to create the repository during setup.

#### Scenario: New user follows getting-started guide
- **WHEN** a user reads the getting-started documentation before running `arashi init`
- **THEN** the guide clearly states where to run the command for both existing-repository and new-repository workflows

### Requirement: Onboarding guidance SHALL show current-dir and child-dir bootstrap examples
The documented `init` workflow SHALL include examples showing that `.` initializes the current directory and that a simple child directory name creates a new repository below the current working directory.

#### Scenario: User needs bootstrap target examples
- **WHEN** a user reads the onboarding guidance for bootstrap setup
- **THEN** the guidance includes one example using `.` and one example using a child directory name such as `my-arashi-repo`

### Requirement: Skill guidance MUST match documented init bootstrap behavior
The Arashi skill references and tutorials MUST describe the same init bootstrap workflow and target semantics as the getting-started documentation.

#### Scenario: User follows Arashi skill guidance
- **WHEN** a user reads the Arashi skill tutorial, workflow guide, or cheatsheet for `arashi init`
- **THEN** the guidance matches the documented explanation of where to run the command and how repository-target input behaves
