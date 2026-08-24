# executable-aliases Delta Specification

## ADDED Requirements

### Requirement: Canonical and alias payloads share v2 uninstall ownership

Official direct installations SHALL treat the canonical executable, native binary, every canonical wrapper, and every `aw` alias wrapper as one schema-v2-owned payload. The ledger SHALL record every installed payload destination and SHA-256 hash, selected install directory, release, channel, and exact installer-created PATH/profile/shell mutations. The ledger itself is derived transactional metadata outside the payload array, and a deferred uninstall helper is transient verified execution state staged only when uninstall begins; neither is an install-time hashed payload destination. Alias marker or historical schema-v1 evidence alone SHALL NOT authorize update or deletion. Full uninstall invoked through either executable name MUST plan, confirm, remove, roll back, retry, and report equivalent state.

#### Scenario: Fresh POSIX install records complete payload

- **WHEN** the official POSIX installer installs `arashi.bin`, `arashi`, and `aw`
- **THEN** schema v2 records all three normalized destinations and hashes in one installation
- **AND** neither canonical nor alias payload is represented only by a marker

#### Scenario: Fresh Windows install records complete payload

- **WHEN** the official Windows installer installs the native executable plus canonical and alias shell wrappers
- **THEN** schema v2 records every installed destination and hash as one payload
- **AND** records only PATH/profile/shell mutations created by that transaction

#### Scenario: Legacy alias ledger is presented for uninstall

- **WHEN** either entrypoint finds only schema-v1 alias ownership
- **THEN** uninstall refuses before mutation with reinstall or migration guidance
- **AND** does not adopt or delete canonical or alias files

#### Scenario: Alias payload was modified

- **WHEN** any recorded `aw`, `aw.ps1`, or `aw.bat` hash differs from schema v2
- **THEN** whole-installation preflight fails before any canonical or alias deletion
- **AND** all destinations remain unchanged

#### Scenario: Uninstall is invoked through both names

- **WHEN** equivalent valid direct-install fixtures run `aw uninstall --dry-run` and `arashi uninstall --dry-run`
- **THEN** both report the same payload, mutations, preserved state, errors, and recovery contract
- **AND** confirmed acceptance proves equivalent deferred full removal through each name
