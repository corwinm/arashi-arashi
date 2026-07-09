## MODIFIED Requirements

### Requirement: Command support audit

The Arashi CLI SHALL audit every user-facing command and explicitly classify JSON behavior as supported, unsupported for a specific mode, or not applicable.

#### Scenario: Automation-relevant command has structured results
- **WHEN** a user runs an automation-relevant command such as `clone`, `create`, `doctor`, `init`, `install`, `prune`, `pull`, `setup`, `status`, `sync`, or `update` with `--json`
- **THEN** the command either returns a structured JSON success/failure envelope or documents and emits a structured unsupported-mode error for the requested mode

#### Scenario: Existing JSON command is audited
- **WHEN** a user runs an existing JSON-capable command such as `list`, `add`, or `remove` with `--json`
- **THEN** the command participates in the same envelope and stdout-isolation contract as newly supported commands
