## ADDED Requirements

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
