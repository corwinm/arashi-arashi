## ADDED Requirements

### Requirement: Zero-config ignore handling remains local and convention-specific
Arashi SHALL reuse Git-effective ignore inspection for the standalone `.worktrees/` convention while keeping passive discovery and explicit zero-config bootstrap separate from configured-workspace managed-ignore scope preferences and owned blocks.

#### Scenario: Passive standalone discovery does not repair ignore state
- **WHEN** Arashi discovers an implicit standalone workspace for a read-only or cleanup command
- **THEN** Arashi does not add, remove, or reconcile ignore entries
- **AND** commands whose contracts include ignore-health details report the effective source or missing coverage without mutation

#### Scenario: Explicit bootstrap needs a rule
- **WHEN** `arashi init --zero-config` finds no effective tracked, repository-local, or global rule for a deterministic `.worktrees/` descendant using `git check-ignore --no-index`
- **THEN** it adds the literal `.worktrees/` rule only to the common repository's local exclude file resolved through Git
- **AND** verifies the same descendant is effectively ignored after the write
- **AND** does not create an Arashi-managed block or store `arashi.ignoreScope`

#### Scenario: Local rule is defeated by a higher-precedence pattern
- **WHEN** the deterministic descendant remains unignored after the repository-local rule is added
- **THEN** zero-config bootstrap restores the prior exclude content and reports the effective conflict
- **AND** does not claim successful ignore preparation

#### Scenario: Existing effective rule wins
- **WHEN** Git reports that the deterministic `.worktrees/` descendant is already ignored by any effective source
- **THEN** zero-config bootstrap preserves the source and content unchanged
- **AND** does not duplicate the rule in repository-local excludes

#### Scenario: Configured workspace reconciliation is unaffected
- **WHEN** a valid `.arashi/config.json` exists
- **THEN** configured lifecycle commands continue using configured `reposDir`, `worktreesDir`, owned-block reconciliation, and clone-local scope semantics
- **AND** zero-config bootstrap semantics do not replace or weaken that contract
