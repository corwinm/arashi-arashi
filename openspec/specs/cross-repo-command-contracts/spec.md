# cross-repo-command-contracts Specification

## Purpose
Define the canonical CLI-derived command contract and the deterministic checks that keep documentation, skills guidance, and VS Code command integrations aligned across Arashi repositories.
## Requirements
### Requirement: CLI-derived command contract
The system SHALL derive canonical command paths and structural metadata from the same Commander program tree used for CLI execution, and SHALL supplement that structure with complete typed semantic metadata for companion-surface policy.

#### Scenario: Runtime command is added
- **WHEN** a registered CLI command or subcommand is added to the Commander tree
- **THEN** contract validation fails until complete semantic metadata exists for that command path

#### Scenario: Stale metadata remains
- **WHEN** semantic metadata references a command path that is no longer registered
- **THEN** contract validation reports the stale metadata and exits unsuccessfully

### Requirement: Versioned deterministic contract artifact
The CLI repository SHALL generate a versioned machine-readable command contract deterministically and SHALL provide a freshness check that fails when the checked-in artifact differs from current registration or semantic metadata.

#### Scenario: Contract is current
- **WHEN** the freshness check runs without command or policy drift
- **THEN** it exits successfully without modifying the working tree

#### Scenario: Contract is stale
- **WHEN** registration, options, or semantic metadata changed without regenerating the artifact
- **THEN** the freshness check reports the generated difference and exits unsuccessfully

### Requirement: Explicit semantic support classifications
The command contract SHALL classify JSON support and docs, skills, and VS Code expectations for each relevant command path. Conditional, unsupported, represented, or excluded classifications MUST include a non-empty reason when their meaning is not self-evident from structural metadata.

#### Scenario: Intentional companion omission
- **WHEN** a command is intentionally omitted from a companion surface
- **THEN** the contract records the omission separately from missing coverage and includes an explicit reason

#### Scenario: Unreasoned exclusion
- **WHEN** a policy marks a command excluded or conditionally supported without the required reason
- **THEN** contract validation reports invalid policy and exits unsuccessfully

### Requirement: Cross-repository drift validation
The meta-repository SHALL provide one deterministic validation command that compares the canonical CLI contract with docs command pages and index entries, structured skills coverage, and VS Code CLI mappings.

#### Scenario: All companion surfaces agree
- **WHEN** every required companion surface is present or explicitly excluded and no stale reference exists
- **THEN** the checker exits successfully and reports intentional exclusions separately from errors

#### Scenario: Required docs coverage is missing
- **WHEN** a CLI command requiring documentation lacks its canonical command page or command-index entry
- **THEN** the checker reports the missing docs coverage with a stable diagnostic and exits unsuccessfully

#### Scenario: Skills reference is stale
- **WHEN** structured skills coverage or a command-shaped skills reference names a command absent from the canonical contract
- **THEN** the checker reports the stale reference with its source path and exits unsuccessfully

#### Scenario: VS Code parity decision is missing
- **WHEN** a CLI command has neither a VS Code mapping nor an explicit reasoned representation or exclusion
- **THEN** the checker reports an unresolved parity gap and exits unsuccessfully

### Requirement: Distinguish extension-only commands
The cross-repository policy SHALL distinguish VS Code commands backed by Arashi CLI command paths from extension-only navigation and panel commands.

#### Scenario: Extension-only command is declared
- **WHEN** a contributed command performs editor navigation or panel behavior without invoking a top-level CLI command
- **THEN** the checker accepts it as extension-only and does not report it as a stale CLI mapping

#### Scenario: CLI mapping references a removed command
- **WHEN** a VS Code CLI-backed mapping references a command absent from the canonical contract
- **THEN** the checker reports an invalid mapping and exits unsuccessfully

### Requirement: Repository-local consistency gates
The CLI repository SHALL validate command-contract generation and freshness without requiring sibling repositories, and the VS Code repository SHALL validate consistency among contributed commands, activation events, internal command IDs, and runtime handlers.

#### Scenario: VS Code manifest and handlers diverge
- **WHEN** a contributed command lacks a matching activation event, command ID, or runtime handler, or a runtime command lacks its required manifest declaration
- **THEN** the VS Code test reports the mismatch and exits unsuccessfully

#### Scenario: Standalone CLI validation runs
- **WHEN** CLI CI runs in a checkout without docs, skills, or VS Code siblings
- **THEN** CLI contract unit tests and artifact freshness validation still complete independently

### Requirement: Reproducible local and CI execution
The meta-repository SHALL document how to run and update the contract check locally, and CI SHALL check out all required child repositories at explicit revisions before executing the same validation command.

#### Scenario: Maintainer updates a command
- **WHEN** a maintainer follows the documented update workflow
- **THEN** the documentation identifies how to regenerate CLI metadata, update companion policy or coverage, and run repository-local and cross-repository checks

#### Scenario: Cross-repository CI runs
- **WHEN** the authoritative workflow validates the contract
- **THEN** it reports the checked repository revisions and runs the same deterministic checker available locally

### Requirement: Command contracts classify standalone workspace support
The canonical command contract SHALL classify whether each user-facing command supports implicit standalone workspaces, requires configured workspace state, or has conditional standalone behavior, with a non-empty reason for non-obvious classifications.

#### Scenario: Zero-config init option is registered
- **WHEN** `init --zero-config` is added or changed
- **THEN** the generated CLI contract includes the option, its dry-run and JSON support, and incompatible-option policy metadata needed by companion surfaces

#### Scenario: Single-repository lifecycle command is audited
- **WHEN** a command such as create, list, status, switch, remove, prune, doctor, move, or handoff supports implicit mode
- **THEN** its contract records standalone support and required docs/skills coverage

#### Scenario: Coordination-only command is audited
- **WHEN** a command such as add, clone, or sync requires persisted child-repository configuration
- **THEN** its contract records configured-only behavior and a reason
- **AND** companion validation can distinguish intentional rejection from missing implementation

#### Scenario: Companion guidance drifts
- **WHEN** CLI standalone classifications, docs command pages/workflow links, or structured skill coverage disagree
- **THEN** repository-local or cross-repository validation reports the exact stale or missing surface and exits unsuccessfully

