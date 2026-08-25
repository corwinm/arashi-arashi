# cross-repo-command-contracts Delta Specification

## ADDED Requirements

### Requirement: CLI producer publishes conservative uninstall semantics

The typed CLI command-contract producer SHALL publish `uninstall` and `shell uninstall` discovered from the live command tree, including both executable-name parity, descriptions, `--dry-run`/`-n`, `--yes`/`-y`, destructive-consent semantics, workspace independence, and the explicit absence of uninstall JSON and force support. Generated consumers SHALL NOT infer broader transaction or machine-output behavior.

#### Scenario: Command contract is generated

- **WHEN** the CLI contract producer inspects the current command tree
- **THEN** both uninstall command paths and their exact MVP options appear deterministically
- **AND** generated contract freshness fails if implementation and contract drift

#### Scenario: Companion repository consumes command inventory

- **WHEN** documentation generation reads the versioned CLI contract
- **THEN** it can list and link the new commands without duplicating a separate authored option inventory
