## MODIFIED Requirements

### Requirement: Versioned deterministic contract artifact

The CLI repository SHALL generate a deterministic machine-readable command contract whose schema version identifies the contract format, SHALL exclude the package release version from contract freshness, and SHALL provide a freshness check that fails when the checked-in artifact differs from current registration or semantic metadata.

#### Scenario: Contract is current

- **WHEN** the freshness check runs without command, policy, or contract-schema drift
- **THEN** it exits successfully without modifying the working tree

#### Scenario: Package release version changes

- **WHEN** the package release version changes without command, policy, or contract-schema drift
- **THEN** the generated command contract remains unchanged

#### Scenario: Contract is stale

- **WHEN** registration, options, semantic metadata, or the contract schema changed without regenerating the artifact
- **THEN** the freshness check reports the generated difference and exits unsuccessfully
