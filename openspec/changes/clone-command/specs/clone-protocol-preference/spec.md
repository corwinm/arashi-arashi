## ADDED Requirements

### Requirement: Infer preferred clone protocol from workspace data
The system SHALL infer the user's preferred clone protocol from existing repository URL metadata and SHALL use that preference for clone operations when the preference is unambiguous.

#### Scenario: SSH preference is inferred
- **WHEN** existing configured repository URLs are consistently SSH-formatted
- **THEN** clone operations use SSH-formatted repository URLs for missing repositories

#### Scenario: HTTPS preference is inferred
- **WHEN** existing configured repository URLs are consistently HTTPS-formatted
- **THEN** clone operations use HTTPS-formatted repository URLs for missing repositories

### Requirement: Prompt when protocol preference is ambiguous or unavailable
The system SHALL prompt the user to choose SSH or HTTPS when protocol preference cannot be inferred with confidence.

#### Scenario: No existing URL data
- **WHEN** the user runs `arashi clone` and the workspace has no repository URLs from which to infer protocol
- **THEN** the command prompts the user to choose SSH or HTTPS before cloning

#### Scenario: Mixed protocol workspace
- **WHEN** existing repository URLs contain a mixed set of SSH and HTTPS formats
- **THEN** the command prompts the user to choose SSH or HTTPS before cloning

### Requirement: Apply selected protocol consistently within one run
The system SHALL apply the inferred or user-selected protocol consistently to all clone operations in the current command execution.

#### Scenario: Multiple repositories cloned in one run
- **WHEN** the user clones multiple repositories in a single command invocation
- **THEN** every clone operation in that run uses the same protocol choice
