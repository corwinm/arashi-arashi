## ADDED Requirements

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
