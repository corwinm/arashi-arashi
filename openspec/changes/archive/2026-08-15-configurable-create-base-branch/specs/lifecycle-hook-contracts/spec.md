## ADDED Requirements

### Requirement: Requested create bases are preflighted before lifecycle hooks
Configured and standalone create SHALL complete strict resolution of every requested explicit or configured base before discovering or executing create hooks and before any create mutation. A resolution failure MUST produce no hook outcome that claims execution.

#### Scenario: Configured base is missing before workspace hook
- **WHEN** `defaults.create.baseBranch` cannot be resolved in a selected repository
- **THEN** Arashi fails before workspace `pre-create` or any repository create hook executes
- **AND** no branch, worktree, managed-ignore, setup, or launch mutation occurs

#### Scenario: Standalone explicit base is missing before global hook
- **WHEN** standalone create receives `--base` that cannot be resolved
- **THEN** Arashi fails before user-global `pre-create` executes
- **AND** no standalone destination or branch is created

#### Scenario: Hook context remains target-oriented
- **WHEN** any create hook executes after successful base preflight
- **THEN** `ARASHI_BRANCH_NAME` remains the requested target branch
- **AND** Arashi does not introduce or advertise `ARASHI_BASE_BRANCH`
