## ADDED Requirements

### Requirement: Configured remove inline hooks preserve destructive-gate parity
Configured remove SHALL execute resolved repository- and workspace-owned inline `pre-remove` hooks through the same post-confirmation, pre-mutation gate as file-backed hooks. Every enabled target/location SHALL be preflighted before any worktree removal or branch deletion. Any inline ambiguity, unavailable interpreter, validation failure, timeout, or nonzero exit MUST abort all destructive operations and retain the complete evaluated outcome prefix.

#### Scenario: Inline pre-remove succeeds
- **WHEN** all resolved inline and file `pre-remove` hooks succeed after confirmation
- **THEN** remove proceeds to its existing worktree and branch operations

#### Scenario: Inline pre-remove fails
- **WHEN** a repository or workspace inline `pre-remove` fails or times out
- **THEN** no worktree is removed and no branch is deleted
- **AND** human and JSON results identify the source without revealing snippet text

#### Scenario: Preflight fails for a later target
- **WHEN** interpreter or source ambiguity preflight fails for any enabled target before pre-remove execution
- **THEN** remove performs no destructive operation for any target
- **AND** preserves actionable target/location metadata

### Requirement: Configured remove inline post hooks preserve finalization parity
After remove operations have been attempted, configured remove SHALL evaluate eligible repository and workspace inline `post-remove` locations with the same per-target scope ordering, target context, and continuation semantics as files, including when one or more removal operations fail. Inline post-hook failures MUST make the command fail without erasing earlier operation failures, hook failures, timeouts, or successful outcomes.

#### Scenario: Remove operation partially fails
- **WHEN** one target removal fails after successful pre-remove hooks
- **THEN** eligible inline/file `post-remove` hooks still run after operation attempts according to existing finalization behavior
- **AND** the final result preserves operation and hook outcomes

#### Scenario: Multiple post hooks fail differently
- **WHEN** one inline post hook times out and another hook exits nonzero
- **THEN** each per-hook reason remains distinct regardless of completion order
- **AND** neither replaces removal errors

### Requirement: Remove input and output behavior is source-neutral
Configured remove SHALL apply `--no-hook-input`, effective timeout, TTY/unavailable input, JSON-owned quiet behavior, and JSON output rules identically to inline and file sources. `--no-hook-input` and JSON SHALL provide immediate EOF; JSON-owned quiet behavior SHALL suppress human progress without changing outcomes; JSON SHALL remain non-interactive and one-document. This change MUST NOT add or advertise `--no-hooks` for remove.

#### Scenario: Remove option ownership remains unchanged
- **WHEN** remove help and the generated command contract are inspected after inline-hook support is added
- **THEN** remove advertises `--no-hook-input` and does not advertise or accept `--no-hooks`
- **AND** create remains the command that owns the existing `--no-hooks` lifecycle behavior

#### Scenario: Inline remove reads in JSON mode
- **WHEN** an inline remove hook attempts a native read under `--json`
- **THEN** it receives immediate EOF with `ARASHI_HOOK_INPUT=disabled`
- **AND** stdout contains exactly one JSON envelope

#### Scenario: JSON-owned quiet remove executes inline hook
- **WHEN** configured remove executes inline hooks with JSON-owned quiet behavior
- **THEN** human progress and spinner output are suppressed as for files
- **AND** failures, exit status, and structured outcomes remain authoritative

### Requirement: Remove acceptance covers all inline fields and file compatibility
Real temporary configured-workspace tests SHALL activate repository and workspace `pre-remove` and `post-remove`, prove per-target multiplicity and destructive/finalization boundaries, and run through the native production adapters. Existing configured and standalone file-only remove tests SHALL remain green without altered ordering, target context, or outcome behavior.

#### Scenario: All configured remove fields are activated
- **WHEN** acceptance fixtures define all repository and workspace remove lifecycle fields
- **THEN** each field is observed at its exact lifecycle boundary and cwd
- **AND** the fixture proves pre failure blocks mutation while post failure preserves attempted removal state

#### Scenario: File-only remove remains compatible
- **WHEN** no inline values are configured
- **THEN** configured and standalone file discovery, scope order, gating, finalization, and reporting remain unchanged
