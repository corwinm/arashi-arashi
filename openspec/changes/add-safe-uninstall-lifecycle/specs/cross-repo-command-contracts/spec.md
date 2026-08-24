# cross-repo-command-contracts Delta Specification

## ADDED Requirements

### Requirement: Coordinated contracts classify uninstall semantics and companions

The CLI-derived command contract SHALL include `uninstall` and `shell uninstall` with typed installation-channel, ownership-ledger, consent, dry-run, JSON-inspection, conflict, preservation, package-manager delegation, completion, docs, skills, and intentional VS Code exclusion policy. The meta coordinated checker SHALL compare those normalized semantics with maintained CLI docs, website command/workflow pages and generated exports, packaged skill guidance, completion artifacts, hosted uninstall routes, and release validation ownership.

#### Scenario: Canonical uninstall contract is generated

- **WHEN** the CLI contract generator runs after both commands are registered
- **THEN** the checked-in artifact contains deterministic typed policy for each uninstall path and no handwritten command inventory is needed

#### Scenario: Companion semantic drifts

- **WHEN** a controlled fixture changes or removes an uninstall channel, safety boundary, option relation, command spelling, route, or companion classification
- **THEN** repository-local or coordinated semantic validation exits unsuccessfully and identifies the owning source and mismatched surface

#### Scenario: VS Code remains intentionally excluded

- **WHEN** coordinated validation audits uninstall coverage
- **THEN** the contract records a non-empty reason that destructive product and shell lifecycle removal remain CLI-only
- **AND** the checker does not require a VS Code command mapping

#### Scenario: Stable aggregates reach focused uninstall checks

- **WHEN** authoritative local and CI aggregate entrypoints run
- **THEN** registered CLI, docs, skills, package-boundary, route, and meta uninstall checks execute without a feature-specific workflow step
- **AND** a controlled child failure propagates through the aggregate
