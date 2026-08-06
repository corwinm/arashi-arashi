# cli-option-conventions Specification

## Purpose
TBD - created by archiving change rationalize-cli-flags. Update Purpose after archive.
## Requirements
### Requirement: Common CLI concepts use consistent command-local aliases
The Arashi CLI SHALL expose a consistent short alias wherever a command registers one of the canonical common long options: `-v/--verbose`, `-f/--force`, `-j/--json`, `-o/--only`, `-g/--group`, and `-n/--dry-run`. Long options SHALL remain canonical and behaviorally unchanged, and aliases SHALL resolve through the exact same validation and execution path as their long form.

#### Scenario: Existing verbose and force concepts gain missing aliases
- **WHEN** a user views help for a command that registers `--verbose` or `--force`, including `init`
- **THEN** the command displays `-v, --verbose` or `-f, --force` respectively
- **AND** the short and long forms produce identical values, output, exit behavior, and side effects

#### Scenario: JSON alias is consistent
- **WHEN** a command registers `--json`
- **THEN** the same command registers `-j` for that option
- **AND** `exec --jobs` remains long-only so `-j` has no second meaning within `exec`

#### Scenario: Repository selector aliases are consistent
- **WHEN** a command registers `--only` or `--group`
- **THEN** that command registers `-o` or `-g` respectively
- **AND** aliases preserve the same fail-closed selection semantics and value normalization as the long options

#### Scenario: Dry-run alias is consistent
- **WHEN** a command registers `--dry-run`
- **THEN** that command registers `-n` for dry-run
- **AND** command-local `add -n/--name` remains unchanged because `add` does not register `--dry-run`

#### Scenario: Command-local collisions are rejected
- **WHEN** generated option validation finds duplicate short aliases within one command path or an alias mapped to a different concept than the policy above
- **THEN** validation exits unsuccessfully with the command path and colliding options

### Requirement: Deprecated option spellings preserve behavior during migration
Arashi SHALL keep approved compatibility spellings parseable throughout the 1.x release line, SHALL hide them from preferred examples and ordinary help where supported, and SHALL map them to the same semantic intent as their canonical replacement. Removal MUST occur no earlier than Arashi 2.0 and MUST require a separately approved breaking-change issue.

#### Scenario: Legacy and canonical spellings are equivalent
- **WHEN** a user invokes a compatibility spelling or its canonical replacement with otherwise identical arguments and environment
- **THEN** Arashi produces the same selected behavior, output contract, exit code, and side effects

#### Scenario: Canonical and legacy synonyms are combined
- **WHEN** a user supplies both spellings that represent the same semantic intent
- **THEN** Arashi treats the combination as redundant but compatible
- **AND** does not report a false conflict

#### Scenario: Deprecated spelling is not taught as preferred usage
- **WHEN** help, canonical docs, generated agent-readable exports, packaged skills, or release notes present recommended syntax
- **THEN** they present the canonical spelling
- **AND** migration guidance identifies the compatibility spelling and replacement explicitly

### Requirement: Complete option policy remains auditable
The CLI SHALL provide a deterministic checked-in audit of every registered command path and option, including long name, short alias, hidden/deprecated state, value shape, and semantic policy needed to detect future drift.

#### Scenario: Registered option changes
- **WHEN** a command option, alias, deprecation state, conflict, implication, or selector shape changes without updating canonical policy
- **THEN** repository-local validation reports the exact command path and mismatch
- **AND** exits unsuccessfully

#### Scenario: Audit is current
- **WHEN** the constructed Commander tree and semantic policy agree with the checked-in artifact
- **THEN** audit validation exits successfully without modifying files

