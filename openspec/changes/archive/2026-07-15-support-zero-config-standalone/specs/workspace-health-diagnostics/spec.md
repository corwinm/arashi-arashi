## ADDED Requirements

### Requirement: Doctor diagnoses implicit standalone workspaces
`arashi doctor` SHALL treat a resolved implicit standalone repository as a valid workspace, inspect its single-repository worktree health without mutation, and distinguish standalone findings from configured-workspace configuration findings.

#### Scenario: Healthy standalone workspace
- **WHEN** the user runs `arashi doctor` in a non-bare repository with `.worktrees/`, effective ignore coverage, valid Git state, and no stale worktree metadata
- **THEN** doctor reports no blocking standalone workspace finding
- **AND** identifies the workspace mode and main repository where applicable
- **AND** creates no `.arashi/` or ignore-file changes

#### Scenario: Standalone worktrees directory is not ignored
- **WHEN** doctor resolves implicit standalone mode but Git reports no effective ignore rule for `.worktrees/`
- **THEN** doctor emits a stable managed-ignore finding that identifies `.worktrees/`
- **AND** suggests `arashi init --zero-config` or a repository-local exclude repair
- **AND** does not repair the rule

#### Scenario: Synthetic repos directory is absent
- **WHEN** doctor runs in implicit standalone mode with the in-memory `reposDir: "./repos"` compatibility value
- **THEN** managed-ignore diagnostics inspect only the standalone `.worktrees/` convention
- **AND** do not report or repair a missing ignore rule for the synthetic, unused `./repos` path

#### Scenario: Invalid persisted config exists beside worktrees
- **WHEN** `.arashi/config.json` exists but is malformed or invalid and `.worktrees/` also exists
- **THEN** doctor reports the existing configuration failure as blocking
- **AND** does not diagnose the repository as a healthy implicit workspace

#### Scenario: Standalone stale metadata exists
- **WHEN** the standalone repository has Git-prunable worktree metadata
- **THEN** doctor reports the stale worktree path and reason with existing prune guidance
- **AND** does not prune it automatically
