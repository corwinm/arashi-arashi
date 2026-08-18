## ADDED Requirements

### Requirement: Doctor reports configured-base lag and unavailability distinctly

For configured repositories, `arashi doctor` SHALL consume the shared configured-base comparison and emit stable, non-mutating findings distinct from upstream and remote-default findings. A behind-base finding SHALL name the actual selected remote base ref and provide practical status/pull guidance. An unavailable-base finding SHALL preserve the failure reason and MUST NOT recommend silently using an upstream or default instead. Standalone doctor SHALL remain unchanged.

#### Scenario: Repository is behind configured base

- **WHEN** a configured repository is behind its refreshed configured base
- **THEN** doctor emits stable warning code `REPOSITORY_CONFIGURED_BASE_BEHIND`
- **AND** the finding names the repository, current branch, configured-base source, remote, ref, and behind count
- **AND** guidance uses the actual remote base and recommends inspecting status or running the configured pull workflow

#### Scenario: Configured base cannot be evaluated

- **WHEN** a configured base cannot be resolved, refreshed, or compared
- **THEN** doctor emits stable warning code `REPOSITORY_CONFIGURED_BASE_UNAVAILABLE`
- **AND** structured details retain the logical branch, selected remote/ref when known, and machine-readable unavailable reason
- **AND** guidance requires inspection/manual action rather than substituting upstream/default behavior

#### Scenario: Base differs from default

- **WHEN** configured base and remote default resolve to different refs and each has an actionable state
- **THEN** doctor retains distinct configured-base and default-branch findings
- **AND** each finding names its own relationship and target

#### Scenario: Base and default share a target

- **WHEN** configured base and remote default resolve to the same remote ref and produce the same actionable state
- **THEN** doctor emits no duplicate human finding or suggested command
- **AND** the retained or combined structured finding identifies both roles and their shared target
- **AND** the underlying target is fetched and compared only once by shared status collection

#### Scenario: Detached or missing repository is diagnosed

- **WHEN** a configured repository is detached or its configured path is missing
- **THEN** doctor preserves established detached/missing findings
- **AND** does not emit a misleading configured-base lag finding or fetch a missing path
- **AND** structured state can identify why configured-base comparison was not performed

#### Scenario: Doctor JSON reports base findings

- **WHEN** configured-base findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with stable finding codes and details
- **AND** no human output contaminates stdout

#### Scenario: Standalone doctor runs

- **WHEN** doctor runs in implicit standalone mode
- **THEN** it preserves established diagnostics without configured-base findings
