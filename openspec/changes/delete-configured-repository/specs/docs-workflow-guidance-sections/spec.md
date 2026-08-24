## ADDED Requirements

### Requirement: Canonical docs teach configured repository deletion proportionately

CLI and website documentation SHALL provide a dedicated `delete` command reference and concise configured-workspace workflow guidance. Guidance SHALL distinguish `aw delete [repository]` from branch/worktree `aw remove`, explain explicit exact-key targeting and omitted-target human-TTY checkbox multi-selection, recommend dry-run before force, explain selection/confirmation behavior in TTY/non-TTY/JSON modes, identify deleted and preserved scope, and describe per-repository partial failure/retry honestly without duplicating internal lock or field-by-field ledger implementation.

#### Scenario: User needs to delete a dependency

- **WHEN** a user opens command or configured-workspace guidance
- **THEN** they can discover both `aw delete` multi-selection and `aw delete <repository>` exact targeting with a copy-pasteable `--dry-run` then confirmed/`--force` workflow
- **AND** guidance does not instruct them to hand-edit config or manually remove Git worktrees/clone paths

#### Scenario: User distinguishes remove and delete

- **WHEN** command indexes, README, or workflow docs mention destructive operations
- **THEN** they state that `delete` removes one explicit or multiple interactively selected configured repository dependencies while `remove` removes branch worktrees
- **AND** no alias or overloaded syntax is implied

#### Scenario: User evaluates safety and force

- **WHEN** docs explain refusal or `--force`
- **THEN** they state that force bypasses confirmation and disclosed Git data-loss guards only
- **AND** path containment, symlink, topology, identity, hook ambiguity, and concurrent-config checks remain mandatory

#### Scenario: User evaluates deletion scope

- **WHEN** docs summarize the plan
- **THEN** they identify canonical clone, all owned linked worktrees/local refs, exact config entry, and canonical local repository-targeted hook files/templates as deleted
- **AND** identify unrelated config, managed-ignore policy, shared hooks, user-global hooks, remote repositories, and remote branches as preserved

#### Scenario: User encounters partial failure

- **WHEN** docs explain a failed delete after completed phases
- **THEN** they direct the user to inspect the phase ledger/surviving state and retry the exact command when reported safe
- **AND** do not claim atomic rollback or advise broad manual deletion

### Requirement: Delete docs preserve automation and secrecy contracts

Canonical JSON/automation guidance SHALL describe one-document output, non-interactive force requirements, stable plan/result and error-details locations, deterministic item/phase state, exit status, and hook-content secrecy. It SHALL direct automation to structured fields rather than human-output parsing.

#### Scenario: Automation previews deletion

- **WHEN** a user reads JSON guidance
- **THEN** it shows `aw delete <repository> --dry-run --json` and identifies `data.plan` with `data.result: null`
- **AND** explains that mutation uses `--force --json` and never prompts

#### Scenario: Automation handles partial failure

- **WHEN** a JSON delete partially fails
- **THEN** guidance identifies `error.details.plan` and `error.details.result` as the accepted scope and phase ledger
- **AND** does not recommend parsing stderr/human summaries

#### Scenario: Hook secrecy is documented

- **WHEN** docs describe hook items in plans/results
- **THEN** they state that logical identity/path/status may appear while file contents and inline command bodies never do

### Requirement: Canonical and generated delete guidance remain aligned

Maintained website pages, command indexes/navigation, generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL expose the same delete scope, safety, confirmation, JSON, preservation, and retry semantics. Generated exports SHALL be regenerated from canonical sources and checked through the stable docs semantic aggregate.

#### Scenario: Canonical delete guidance changes

- **WHEN** a maintained delete or configured-workspace page changes
- **THEN** generated agent-readable exports are regenerated
- **AND** focused freshness/semantic checks reject stale or contradictory exports

#### Scenario: Docs checker is registered

- **WHEN** focused delete guidance validation is added
- **THEN** the existing fail-closed docs aggregate and coordinated validation execute it
- **AND** no feature-specific workflow step is added absent workflow-topology change
