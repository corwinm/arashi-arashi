## MODIFIED Requirements

### Requirement: Register core Arashi commands in VS Code
The extension SHALL register VS Code commands for supported core Arashi workflows and SHALL make command-palette actions available for keybinding assignment. Every canonical CLI command SHALL have a machine-checkable extension policy state that maps it to one or more CLI-backed VS Code commands, identifies an equivalent panel or editor representation, or records an intentional exclusion with an explicit reason. The extension MAY represent `arashi list` through the worktree panel and refresh command instead of a separate command-palette entry.

#### Scenario: Supported core commands are discoverable
- **WHEN** the extension activates in a supported editor
- **THEN** each CLI workflow classified as command-palette supported appears in the command palette and can be bound to a keybinding

#### Scenario: List command is represented by the worktree panel
- **WHEN** a user needs to inspect Arashi worktrees from VS Code
- **THEN** the extension provides the worktree panel and refresh command as the declared list-style representation without requiring a separate `Arashi: List` command-palette entry

#### Scenario: New CLI command lacks a parity decision
- **WHEN** the canonical CLI contract adds a command without a VS Code mapping, equivalent representation, or reasoned exclusion
- **THEN** contract validation reports an unresolved extension parity gap

#### Scenario: Intentional extension gap is recorded
- **WHEN** a CLI workflow is unsuitable for extension exposure
- **THEN** extension policy records the exclusion and its reason so validation reports it separately from missing support
