## ADDED Requirements

### Requirement: Docs SHALL provide a standalone agent bootstrap workflow
The agent/spec workflow guidance SHALL be useful as a standalone bootstrap document for coding agents working in Arashi meta-repositories.

#### Scenario: Agent opens the workflow guidance first
- **WHEN** an agent reads the agent/spec workflow page without prior human navigation context
- **THEN** the page explains the safe starting sequence, including inspecting workspace state, identifying the owning child repository, and separating implementation work from shared planning context

### Requirement: Agent workflow guidance SHALL state repository ownership rules
The agent/spec workflow guidance SHALL clearly explain that implementation, tests, and repo-specific docs belong in the owning child repository under `repos/<project>/`, while shared context, OpenSpec planning, and cross-repo coordination belong in the meta-repo.

#### Scenario: Change affects a child repository
- **WHEN** an agent uses the workflow guidance to plan a change that affects `repos/arashi-docs`, `repos/arashi`, `repos/arashi-skills`, or `repos/arashi-vscode`
- **THEN** the guidance directs implementation changes to the affected child repository and coordination/spec artifacts to the meta-repo

### Requirement: Agent workflow guidance SHALL cover validation and handoff expectations
The agent/spec workflow guidance SHALL tell agents to validate each affected repository before handoff and to use focused, cross-linked PRs for multi-repository work.

#### Scenario: Agent prepares work for review
- **WHEN** an agent finishes implementing a change described by the workflow guidance
- **THEN** it knows to run the relevant validation in each affected repository and prepare focused PRs that reference related PRs and the originating issue or change context

### Requirement: Key command docs SHALL include concise agent notes
The command documentation SHALL include short agent-facing notes for automation-critical commands where agent safety expectations differ from ordinary human usage.

#### Scenario: Agent reads a key command page
- **WHEN** an agent opens the docs for commands such as `status`, `create`, `pull`, `sync`, `remove`, or `shell`
- **THEN** the page includes concise notes explaining when an agent should use that command and what safety or validation expectations apply

### Requirement: Packaged Arashi skills SHALL be audited for alignment
The implementation SHALL audit `repos/arashi-skills` and update the Arashi skill content when the docs changes introduce new canonical agent entrypoints, workflow wording, or command guidance that should be available to agents using packaged skills.

#### Scenario: New docs entrypoints are useful to skill users
- **WHEN** the docs implementation adds agent-readable URLs or changes recommended agent workflow guidance
- **THEN** the implementation checks `repos/arashi-skills` for stale or missing guidance and includes companion skill updates when needed
