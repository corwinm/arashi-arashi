## ADDED Requirements

### Requirement: Remove dry-run previews standalone operations
`arashi remove --dry-run` SHALL plan removals for worktrees and branches of the resolved standalone repository without requiring or writing configured workspace state.

#### Scenario: Standalone target resolves
- **WHEN** a user previews removal of a branch or worktree in an implicit standalone workspace
- **THEN** the plan identifies exact `.worktrees/<branch>` paths, branch actions, dirty blockers, applicable user-global hook previews, effective options, and totals
- **AND** no worktree, branch, hook, ignore file, or config is mutated

#### Scenario: Preview runs from linked worktree
- **WHEN** standalone remove dry-run starts in a linked worktree
- **THEN** Arashi plans against the shared main repository worktree set
- **AND** preserves existing protection for the active or main worktree

#### Scenario: Explicit target is missing in JSON mode
- **WHEN** standalone remove dry-run JSON mode would require interactive selection
- **THEN** Arashi returns the existing structured explicit-target error without prompting or mutation
