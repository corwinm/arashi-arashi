## ADDED Requirements

### Requirement: Packaged skill teaches safe configured repository deletion

The authored and packaged Arashi skill SHALL teach delete in the smallest configured-workspace/reference file while keeping `skills/arashi/SKILL.md` a minimal router. Guidance SHALL direct agents to inspect installed `aw delete --help`, select an exact configured key, run dry-run first, distinguish delete from remove, and require explicit user intent before `--force` automation.

#### Scenario: Agent is asked to delete a dependency

- **WHEN** an agent receives an explicit request to remove one configured repository dependency
- **THEN** it uses `aw delete <repository> --dry-run` to review exact scope before a mutating invocation
- **AND** does not hand-edit config, broad-delete paths/hooks, or substitute `aw remove`

#### Scenario: Agent lacks explicit destructive intent

- **WHEN** a user asks to inspect, detach, clean, or remove a worktree without clearly requesting repository dependency deletion
- **THEN** skill guidance does not infer permission to run mutating delete
- **AND** routes branch/worktree cleanup to the appropriate existing command/help

#### Scenario: Agent automates a confirmed deletion

- **WHEN** the user has accepted the exact plan or explicitly requested non-interactive deletion
- **THEN** guidance permits `aw delete <repository> --force`
- **AND** states that force cannot bypass structural, identity, hook-ambiguity, or concurrent-config safeguards

### Requirement: Skill guidance preserves deletion scope and recovery honesty

Skill guidance SHALL identify canonical clone, all owned linked worktrees/local refs, exact repository config entry, and canonical local repository-targeted hook files/templates as deletion scope. It SHALL identify unrelated config, managed-ignore policy, shared/user-global hooks, and remotes as preserved. It SHALL teach agents to respect phase-ledger partial failure and safe retry guidance without claiming rollback.

#### Scenario: Agent reviews the plan

- **WHEN** dry-run lists paths, refs, hooks, warnings, or preserved global guidance
- **THEN** the agent compares the plan with the requested repository and reports material data-loss blockers
- **AND** never requests or prints hook contents/inline command bodies

#### Scenario: Agent encounters dirty or unpublished work

- **WHEN** delete reports Git data-loss blockers
- **THEN** guidance tells the agent to preserve/publish/clean the work or obtain explicit acceptance before force
- **AND** does not treat ignored files or local refs as disposable automatically

#### Scenario: Agent encounters partial failure

- **WHEN** delete reports `DELETE_PARTIAL_FAILURE`
- **THEN** guidance follows completed/surviving state and the command's exact safe-retry indication
- **AND** does not rerun broad manual cleanup or claim the repository was fully deleted

### Requirement: Authored and extracted-package delete guidance is aggregate-checked

A focused delete guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate authored source plus the extracted canonical release package. Maintainer checker/fixture records SHALL remain outside the installable skill tree.

#### Scenario: Authored guidance drifts

- **WHEN** source guidance loses or contradicts exact-key targeting, preview/force sequence, remove distinction, structural safety, preserved scope, JSON secrecy, or partial-failure behavior
- **THEN** the focused checker and source aggregate fail with the owning reference

#### Scenario: Packaged guidance drifts

- **WHEN** extracted skill content differs from authored canonical delete guidance
- **THEN** the package aggregate fails against the extracted `skills/arashi` subtree
- **AND** source success does not mask the package defect

#### Scenario: Stable aggregates execute the checker

- **WHEN** the checker is registered without workflow-topology changes
- **THEN** existing source/package and coordinated aggregates execute it
- **AND** no feature-specific workflow step is required
