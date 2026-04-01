## ADDED Requirements

### Requirement: Docs SHALL explain implementation-versus-spec boundaries for agent-assisted workflows
The documentation SHALL state where implementation work belongs, where specs and planning artifacts belong, and how those locations differ when contributors use agents or spec-driven workflows.

#### Scenario: Contributor plans an agent-assisted change
- **WHEN** a contributor reads the agent or workflow guidance
- **THEN** they can tell which repository or directory should receive implementation changes and which location should receive specs or planning artifacts

### Requirement: Docs SHALL provide agent workflow guidance grounded in repository rules
The documentation SHALL provide agent-usage guidance that reflects the repository's established workflow rules, including how to use supporting context files such as AGENTS-style instructions when they exist.

#### Scenario: User looks for agent-specific guidance
- **WHEN** a user opens the agent workflow guidance
- **THEN** the docs explain the rules and decision points they need before asking an agent to plan or implement a change

### Requirement: Docs SHALL reference spec-driven workflow frameworks and next steps
The documentation SHALL include a section that introduces recommended spec-driven development workflow references and points users to the next artifact or command they should use after creating or reviewing a change proposal.

#### Scenario: User wants to continue after reading workflow guidance
- **WHEN** a user reaches the end of the agent or spec-driven workflow guidance
- **THEN** the docs provide concrete next-step references for continuing with proposal, design, tasks, or implementation work
