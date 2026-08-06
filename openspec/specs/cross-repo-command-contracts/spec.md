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

The meta-repository SHALL provide one deterministic validation command that compares the canonical CLI command and configuration contracts with docs command pages and index entries, generated agent-readable exports, structured skills coverage and packaged guidance, and VS Code CLI mappings. For create launch configuration, the checker SHALL compare normalized semantic values derived from the CLI schema/contract rather than only checking field presence or parallel hardcoded labels.

#### Scenario: All companion surfaces agree

- **WHEN** every required companion surface is present or explicitly excluded, no stale reference exists, and create launch semantics match the canonical CLI contract
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

#### Scenario: Canonical create launch contract is compared semantically

- **WHEN** the cross-repository checker validates create configuration guidance
- **THEN** it derives or verifies canonical field `defaults.create.launch`, modes `none`, `auto`, `sesh`, and `herdr`, absent behavior `none`, independent boolean `switch`, launch-implies-switch behavior, supported editor hosts, legacy fields, and accepted/rejected migration classifications
- **AND** it compares those normalized values with canonical docs, generated exports, and packaged skill contract records

#### Scenario: Create launch vocabulary drifts

- **WHEN** a companion surface advertises a different canonical field, mode set, absent behavior, switch relationship, editor-host scope, legacy field, or migration classification than the CLI contract
- **THEN** the checker reports the exact source and semantic mismatch with a stable diagnostic
- **AND** exits unsuccessfully

#### Scenario: Controlled semantic mismatch proves enforcement

- **WHEN** validation runs against an out-of-repository fixture containing one deliberate create launch semantic mismatch
- **THEN** the checker exits unsuccessfully for that mismatch
- **AND** the real coordinated worktrees remain unchanged

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

### Requirement: Tmux launch contracts remain synchronized across repositories

The system SHALL keep canonical CLI options, command help, user documentation, and packaged Arashi skill guidance aligned for explicit plain tmux selection, while preserving the existing configuration contract. The source-derived CLI contract SHALL expose typed option-policy metadata for tmux conflicts, prerequisites, create implications, JSON restrictions, and non-persisted configuration status, and the meta-repository checker SHALL enforce those semantics.

#### Scenario: CLI help exposes tmux consistently

- **WHEN** the command contract is generated or checked
- **THEN** `arashi switch --help` documents `--tmux` as forced plain tmux launch and `arashi create --help` documents `--tmux` as implying post-create launch

#### Scenario: Configuration contracts remain unchanged

- **WHEN** configuration schema and switch-config contract checks run
- **THEN** create `LaunchMode` and unified `SwitchMode` enums remain unchanged and do not include `tmux`

#### Scenario: Docs and skill contract checks use current tmux syntax

- **WHEN** cross-repository semantic contract checks inspect canonical docs and packaged skill references
- **THEN** switch/create examples, conflict sets, prerequisites, and the per-invocation-only schema decision agree with the CLI and do not describe explicit plain tmux as automatic-only

#### Scenario: Tmux option-policy metadata is generated and enforced

- **WHEN** the CLI command contract is generated after registering switch/create `--tmux`
- **THEN** its typed option policy represents each command's conflict set, `TMUX` prerequisite, create launch/switch implication, JSON restriction, and non-persisted status
- **AND** the contract schema version changes if required by the serialized shape

#### Scenario: Deliberate semantic drift fails the meta checker

- **WHEN** a checker fixture removes or changes one required tmux option-policy rule, or companion guidance contradicts that rule
- **THEN** meta-repository contract validation fails with a diagnostic identifying the owning source and mismatched tmux semantic

### Requirement: Kitty launch guidance remains synchronized across repositories
The system SHALL keep canonical CLI behavior, maintained documentation, generated agent-readable guidance, and packaged Arashi skill guidance aligned for automatic managed Kitty sessions, and the meta-repository semantic checker SHALL enforce the key runtime and ownership boundaries.

#### Scenario: Canonical Kitty guidance agrees
- **WHEN** cross-repository contract validation runs
- **THEN** canonical docs and packaged skill guidance agree that Kitty 0.43+ and permitted remote control are prerequisites
- **AND** they describe exact worktree reuse, automatic precedence, live-only sessions, fail-closed managed errors, and no remove-time Kitty mutation consistently

#### Scenario: Kitty remains auto-detected only
- **WHEN** contract validation compares CLI options/configuration with companion guidance
- **THEN** no canonical surface advertises an explicit `--kitty` flag or persistent `kitty` launch mode for this slice

#### Scenario: Deliberate Kitty semantic drift fails validation
- **WHEN** an out-of-repository fixture changes or removes one required Kitty version, remote-control, reuse, precedence, persistence, or remove-ownership semantic
- **THEN** the checker exits unsuccessfully with a diagnostic naming the owning source and mismatched Kitty contract
- **AND** the real coordinated worktrees remain unchanged

### Requirement: Publish launch-disposition option policy semantically
The canonical CLI command contract SHALL publish typed `--tab` option policy for switch and create, and coordinated validation SHALL compare its normalized semantics with canonical docs, generated agent-readable exports, and packaged skill guidance rather than checking option presence alone.

#### Scenario: Switch tab policy is generated
- **WHEN** the CLI command contract is generated after registering `switch --tab`
- **THEN** its option policy records non-persisted status, switch JSON mode and guard precedence, compatibility with `--no-cd`, `--no-default-launch`, and explicit launcher selectors, conflict with `--cd`, and launcher-matrix support resolution

#### Scenario: Create tab policy is generated
- **WHEN** the CLI command contract is generated after registering `create --tab`
- **THEN** its option policy records non-persisted status, implication of launch and switch, compatibility and precedence with `--no-launch` and `--no-switch`, create JSON mode and guard precedence, dry-run preview behavior, and launcher-matrix support resolution

#### Scenario: Configuration contracts remain unchanged
- **WHEN** command and configuration contracts are validated together
- **THEN** `--tab` exists only in command option policy
- **AND** switch and create configuration contracts expose no persisted disposition field or `tab` mode

#### Scenario: Command contract schema represents options without environment prerequisites
- **WHEN** `--tab` semantic policy is serialized
- **THEN** the command-contract schema version is incremented
- **AND** the explicit-option policy shape allows an omitted environment prerequisite while preserving the existing non-empty environment contract for `--tmux`
- **AND** no synthetic environment variable is assigned to `--tab`

#### Scenario: Companion guidance agrees with canonical policy
- **WHEN** the meta cross-repository checker validates launch-disposition guidance
- **THEN** it compares the default disposition, CLI-only status, command-specific implications/conflicts, JSON restrictions, unsupported no-fallback behavior, and managed-equivalent vocabulary against the canonical command contract

#### Scenario: Deliberate semantic mismatch is rejected
- **WHEN** an out-of-repository fixture removes or contradicts one required `--tab` semantic field in docs or skills
- **THEN** the focused checker exits unsuccessfully with an owning-source diagnostic
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Focused validation is reachable from CI
- **WHEN** repository self-tests inspect the applicable workflow
- **THEN** they confirm that CI invokes the focused launch-disposition checker rather than only an aggregate command that omits it

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
