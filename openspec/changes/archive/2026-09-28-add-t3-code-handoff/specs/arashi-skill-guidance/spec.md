## ADDED Requirements

### Requirement: Skill guides self-contained T3 workspace handoff

The authored and packaged Arashi skill SHALL route T3 handoff to focused create/workflow guidance that teaches agents to assemble a self-contained prompt with objective, accepted constraints, relevant context, and completion expectations; invoke the installed CLI's supported `aw create <branch> --t3` interface; and report the exact workspace plus project/thread and outcome. It SHALL distinguish initiating the new task from completing it and SHALL NOT infer or scrape conversation history.

#### Scenario: Agent prepares an inline handoff

- **WHEN** an agent has a concise self-contained task
- **THEN** guidance uses `aw create <branch> --t3 "<task>"`
- **AND** states that the permission defaults to explicitly passed full access and no host UI opens

#### Scenario: Agent prepares a larger handoff

- **WHEN** the task needs multiline context or detailed completion criteria
- **THEN** guidance tells the agent to create a UTF-8 task file and use `aw create <branch> --t3 --prompt-file <file>`
- **AND** includes the agreed objective, constraints, context, and completion expectations rather than chat-history scraping

#### Scenario: Agent reports the new running task

- **WHEN** handoff returns a project/thread result
- **THEN** guidance tells the agent to report the exact parent checkout, effective permission, environment/project/thread identifiers, and stage outcomes
- **AND** explains that the original conversation remains on main and the user manually selects the new thread in a connected desktop/mobile client

#### Scenario: Agent handles failed or uncertain handoff

- **WHEN** workspace creation succeeds but handoff fails or is indeterminate
- **THEN** guidance preserves the workspace, distinguishes safe retry from required reconciliation, and uses the exact reported workspace
- **AND** does not blindly create another thread or claim that a UI failure means dispatch failed
