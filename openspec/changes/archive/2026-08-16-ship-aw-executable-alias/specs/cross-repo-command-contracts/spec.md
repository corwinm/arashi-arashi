## ADDED Requirements

### Requirement: CLI publishes executable distribution policy separately from command aliases

The CLI repository SHALL own typed executable-entrypoint policy and deterministically generate a versioned machine-readable distribution contract without adding `aw` to Commander command paths or command-local alias metadata. The policy SHALL define canonical and alias names, npm mappings, POSIX and Windows release and installed launcher sets, shared native binary names, managed ownership markers plus ledger schema/name, canonical identity boundaries, and supported shell-wrapper and completion registration names.

#### Scenario: Distribution contract is generated

- **WHEN** executable-entrypoint policy is generated from current typed source
- **THEN** the artifact represents canonical `arashi`, alias `aw`, every supported package/release/install launcher, shared native binary routing, marker-plus-ledger ownership policy, and shell names deterministically
- **AND** repeated generation without policy changes is byte-identical and leaves the worktree unchanged

#### Scenario: Commander contract is inspected

- **WHEN** `contracts/cli-commands.json` is generated
- **THEN** `aw` is absent from top-level command paths and `aliasPaths`
- **AND** executable alias policy is available from the separate distribution contract

#### Scenario: Concrete producer drifts

- **WHEN** package metadata, wrapper assets, checksum generation, release upload metadata, retained archives, installers, shell integration, completion generation, or package-content expectations disagree with typed executable policy
- **THEN** repository-local validation identifies the owning source and mismatch and exits unsuccessfully

### Requirement: Coordinated validation enforces executable alias semantics

The meta-repository SHALL compare normalized executable-distribution policy with canonical docs, generated Markdown and LLM exports, authored/extracted skill guidance, and explicit companion exclusions. It SHALL validate identity, alias expansion, channel coverage, one-native-binary routing, collision ownership, shell integration, completion registration, manual payloads, and release verification through stable aggregate entrypoints.

#### Scenario: Coordinated alias surfaces agree

- **WHEN** CLI policy/artifacts, package and release metadata, authored docs, generated exports, authored/extracted skill guidance, and explicit VS Code/Commander exclusions represent the same executable alias contract
- **THEN** coordinated validation exits successfully
- **AND** reports that skills retain canonical `arashi` entry commands while recognizing supported shorthand `aw`, and that VS Code/Commander surfaces require no executable invocation parity

#### Scenario: Deliberate executable mismatch is rejected

- **WHEN** an out-of-repository fixture removes an alias from one distribution channel, changes “Arashi Workspace,” makes `aw` canonical, weakens collision safety, duplicates the native binary, or drops shell/completion/manual-payload coverage
- **THEN** the focused checker exits unsuccessfully with a stable diagnostic naming the owning source and semantic mismatch
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Alias checker is registered through stable aggregates

- **WHEN** focused docs or coordinated checkers are added for executable aliases
- **THEN** repository registration self-tests and dedicated executable acceptance prove they run through existing source, package, and meta aggregate entrypoints
- **AND** no feature-specific workflow step is required while workflow topology, permissions, runtime, triggers, and artifact assembly remain unchanged
