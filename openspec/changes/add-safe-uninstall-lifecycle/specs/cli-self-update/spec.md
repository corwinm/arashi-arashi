# cli-self-update Delta Specification

## ADDED Requirements

### Requirement: Official direct update establishes current uninstall ownership

A successful official direct-binary update or reinstall SHALL finish with a complete schema-v2 ownership ledger for the newly installed payload. A valid schema-v1 direct installation MAY be migrated only through complete staged replacement and verification of the executable payload; the migration SHALL preserve pre-existing PATH, profile, and shell state as unowned unless the current transaction itself creates an exact mutation. Update MUST NOT report success while retaining schema-v1 or partial ownership.

#### Scenario: Current v2 installation is updated

- **WHEN** direct update replaces a valid schema-v2-owned payload
- **THEN** it verifies the old ownership, stages and verifies the new complete payload, and atomically replaces the ledger with current v2 paths and hashes
- **AND** preserves created-versus-pre-existing mutation ownership accurately

#### Scenario: Historical v1 installation is updated

- **WHEN** official update safely replaces a valid historical schema-v1 direct payload
- **THEN** the replacement payload becomes schema-v2-owned only after every newly installed destination is verified
- **AND** historical PATH, profile, and shell state remains unowned and preserved

#### Scenario: Migration cannot prove a safe replacement boundary

- **WHEN** a schema-v1, manual, malformed, ambiguous, or modified installation cannot pass the official replacement collision and identity checks
- **THEN** update exits non-zero without adopting or deleting that state
- **AND** reports bounded reinstall or manual-remediation guidance
