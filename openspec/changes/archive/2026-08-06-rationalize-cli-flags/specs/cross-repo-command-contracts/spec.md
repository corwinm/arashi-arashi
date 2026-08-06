## ADDED Requirements

### Requirement: Command contracts publish normalized option conventions
The canonical CLI command contract SHALL publish structural and typed semantic metadata for command-local aliases, selector input forms, canonical-to-compatibility mappings, deprecation state, conflicts, and implications introduced by CLI option rationalization.

#### Scenario: Common aliases are generated
- **WHEN** the command contract is generated
- **THEN** every registered `--verbose`, `--force`, `--json`, `--only`, `--group`, and `--dry-run` option records the required command-local alias
- **AND** validation rejects a missing, duplicate, stale, or conceptually conflicting alias

#### Scenario: Switch policy is generated
- **WHEN** switch option policy is generated
- **THEN** it records canonical `--launch` and `--ignore-configured-launcher`, compatibility mappings from `--no-cd` and `--no-default-launch`, deprecation state, `--cd` conflicts, configured-launcher preservation/bypass, tab and explicit-launcher interactions, JSON guard precedence, and non-persisted status

#### Scenario: Handoff compatibility policy is generated
- **WHEN** handoff option policy is generated
- **THEN** it records Markdown as omitted-option default and `--markdown` as a deprecated compatibility spelling rather than an independent format selector

#### Scenario: Selector shape is generated
- **WHEN** policy is generated for a command that registers `--only` or `--group`
- **THEN** it records support for repeated and comma-separated values, explicit-empty distinction, and applicable standalone restrictions

#### Scenario: Update conflict is generated
- **WHEN** update policy is generated
- **THEN** it records `--check` and `--dry-run` as conflicting inspection modes for both human and JSON execution paths

### Requirement: Coordinated validation enforces option convention semantics
The meta-repository checker SHALL compare normalized option convention policy with canonical docs, generated agent-readable exports, and packaged skills, and SHALL fail on semantic disagreement rather than checking option presence alone.

#### Scenario: Companion surfaces agree
- **WHEN** canonical CLI policy, docs, exports, and skills use the same canonical aliases, switch names, migration spellings, conflicts, and selector forms
- **THEN** coordinated validation exits successfully

#### Scenario: Preferred guidance uses a deprecated spelling
- **WHEN** a companion surface teaches `--no-cd`, `--no-default-launch`, or `handoff --markdown` as preferred current syntax outside migration guidance
- **THEN** coordinated validation identifies the stale source and exits unsuccessfully

#### Scenario: Deliberate alias drift fails validation
- **WHEN** an out-of-repository fixture removes or changes one required alias or maps it to a different concept
- **THEN** coordinated validation exits unsuccessfully with a stable semantic mismatch diagnostic
- **AND** real worktrees remain unchanged

#### Scenario: Deliberate switch-policy drift fails validation
- **WHEN** an out-of-repository fixture changes one switch compatibility mapping, conflict, configured-launcher effect, or persistence rule
- **THEN** coordinated validation exits unsuccessfully and names the owning source and mismatched semantic

#### Scenario: Packaged artifacts are validated
- **WHEN** docs or skills are packaged for release
- **THEN** the same semantic checks run against extracted release artifacts rather than relying only on source-worktree files
