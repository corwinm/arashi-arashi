## ADDED Requirements

### Requirement: Command contracts publish completion policy
The canonical CLI command contract SHALL publish enough typed policy to generate and validate shell completion without a handwritten command inventory, including argument choices, option conflicts, and dynamic candidate classifications that are not fully represented by Commander structure alone.

#### Scenario: Completion policy is generated
- **WHEN** the command contract is generated from the current Commander tree and typed semantic policy
- **THEN** every command path, argument, option, alias, description, declared choice, conflict, and dynamic candidate classification required by completion is represented deterministically

#### Scenario: Completion policy is incomplete
- **WHEN** a registered argument or option requires dynamic or constrained completion but lacks required typed policy
- **THEN** repository-local contract validation reports the command path and missing policy
- **AND** exits unsuccessfully

#### Scenario: Option rationalization changes an alias
- **WHEN** a canonical or compatibility option spelling changes in Commander metadata or typed option policy
- **THEN** completion generation consumes the updated contract automatically
- **AND** no independent completion alias inventory requires editing

### Requirement: Coordinated validation enforces completion synchronization
The meta-repository checker SHALL compare canonical completion policy and generated artifacts with maintained README and shell-command documentation, generated agent-readable exports, and packaged Arashi skill guidance. The checker SHALL distinguish intentional VS Code exclusion from missing CLI, docs, or skill coverage for the `completion` command.

#### Scenario: Completion surfaces agree
- **WHEN** the CLI contract, generated shell artifacts, maintained docs, generated exports, and packaged skill guidance describe the same supported shells, command shape, activation syntax, wrapper separation, safety boundaries, and dynamic candidate classes
- **THEN** coordinated validation exits successfully

#### Scenario: Completion guidance drifts
- **WHEN** a companion surface advertises a different shell set, public command path, installation behavior, candidate scope, or output/safety contract
- **THEN** coordinated validation reports the owning source and semantic mismatch
- **AND** exits unsuccessfully

#### Scenario: Deliberate completion mismatch proves enforcement
- **WHEN** an out-of-repository fixture removes or changes one required completion semantic or generated artifact identity
- **THEN** the focused checker exits unsuccessfully for that mismatch
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Completion validation is reachable from CI
- **WHEN** repository self-tests inspect the authoritative coordinated workflow
- **THEN** they confirm CI generates or verifies the CLI completion artifacts and invokes the focused cross-repository completion checker
