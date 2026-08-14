## MODIFIED Requirements

### Requirement: Cross-repository drift validation
The meta-repository SHALL provide one deterministic validation command that compares the canonical CLI command and configuration contracts with docs command pages and index entries, generated agent-readable exports, structured skills coverage and packaged guidance, and VS Code CLI mappings. For create launch configuration, the checker SHALL compare normalized semantic values derived from the CLI schema/contract rather than only checking field presence or parallel hardcoded labels. For SSH host alias remotes, the checker SHALL compare CLI help and generated command metadata plus supported URL forms, exact-preservation behavior, SSH-configuration ownership, protocol-conversion safety, and machine-local portability guidance across owning companion surfaces.

#### Scenario: All companion surfaces agree
- **WHEN** every required companion surface is present or explicitly excluded, no stale reference exists, create launch semantics match the canonical CLI contract, and SSH alias guidance matches the canonical preservation contract
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

#### Scenario: SSH alias guidance agrees
- **WHEN** cross-repository validation inspects CLI help, the generated CLI command contract, canonical add and clone docs, generated agent-readable exports, and packaged skill guidance
- **THEN** each owning surface recognizes `[user@]host:path` with an optional user and `ssh://[user@]host/path`
- **AND** each states that configured SSH URLs remain exact, SSH-to-HTTPS conversion is not automatic, and Arashi does not manage SSH configuration
- **AND** each identifies aliases as machine-local and recommends canonical remotes with local Git `insteadOf` rules when portability matters

#### Scenario: SSH alias semantic drift is rejected
- **WHEN** an out-of-repository checker fixture removes or contradicts one required SSH alias form, preservation rule, ownership boundary, conversion boundary, or portability rule
- **THEN** the focused checker exits unsuccessfully with a stable diagnostic naming the owning source and mismatched semantic
- **AND** the real coordinated worktrees remain unchanged
