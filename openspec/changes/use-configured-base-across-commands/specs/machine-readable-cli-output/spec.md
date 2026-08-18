## ADDED Requirements

### Requirement: JSON commands preserve configured-base roles and outcomes

Configured `status`, `pull`, `push`, `handoff`, and `doctor` JSON output SHALL represent configured-base policy without conflating it with current-branch upstream or remote-default roles. Comparison records SHALL include the logical branch, source, concrete remote/ref when known, ahead/behind counts when available, state, and machine-readable unavailable reason/details when comparison was requested but could not complete. Command-specific records SHALL additionally expose their pull, publishability, handoff, or finding outcome through the existing single-document envelope.

#### Scenario: Status JSON exposes all comparison roles

- **WHEN** configured status can evaluate upstream, configured base, and remote default
- **THEN** its repository record contains distinct structured role objects with branch, target, state, ahead, and behind values
- **AND** consumers can distinguish configured policy from upstream and remote metadata

#### Scenario: Shared base/default target remains role-complete

- **WHEN** configured base and remote default resolve to the same remote ref
- **THEN** JSON preserves both role objects and identifies their common target
- **AND** it does not imply that duplicate fetch or comparison work occurred

#### Scenario: Configured base is unavailable

- **WHEN** a configured-base comparison is requested but cannot complete
- **THEN** JSON retains the configured branch and source with unavailable state and stable reason/details
- **AND** it does not replace the record with default-branch data

#### Scenario: Pull and push JSON identify decision baselines

- **WHEN** configured pull selects a base or no-upstream configured push evaluates publishability
- **THEN** each repository outcome identifies the base source, branch, concrete target, comparison state, and mutation/skipped/failed result
- **AND** stdout remains exactly one JSON document

#### Scenario: Handoff and doctor JSON consume the same base state

- **WHEN** handoff or doctor reports a configured-base comparison
- **THEN** its structured data agrees with status for branch, target, counts, and unavailable reason
- **AND** command-specific Markdown or human diagnostics do not contaminate stdout

#### Scenario: Legacy configuration fails structurally

- **WHEN** a JSON-capable command reads configuration containing `defaults.create.baseBranch`
- **THEN** stdout contains one structured pre-mutation configuration error naming the removed path and canonical migration targets
- **AND** no repository result falsely claims inspection or mutation
