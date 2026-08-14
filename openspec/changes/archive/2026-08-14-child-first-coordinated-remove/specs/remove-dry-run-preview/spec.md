## MODIFIED Requirements

### Requirement: Remove dry-run preview mode
The system SHALL provide `arashi remove --dry-run` as a non-mutating preview mode that resolves the requested removal target and reports the operations that would be attempted without removing worktrees, deleting branches, detaching worktrees, or executing lifecycle hooks. In configured mode, the preview SHALL use the same dependency-safe worktree plan as real execution, with every targeted descendant worktree operation before its targeted ancestor operation.

#### Scenario: Branch-targeted dry-run preserves worktrees and branches
- **WHEN** a user runs `arashi remove <branch> --dry-run`
- **THEN** the command reports the worktrees and local branches that would be removed for `<branch>`
- **AND** no worktree directory is removed
- **AND** no local branch is deleted

#### Scenario: Path-targeted dry-run previews selected worktree
- **WHEN** a user runs `arashi remove <worktree-path> --dry-run --path`
- **THEN** the command reports the matching non-main worktree removal and associated branch deletion plan
- **AND** the target worktree remains present after the command exits

#### Scenario: Dry-run with both keep flags is a no-op preview
- **WHEN** a user runs `arashi remove <branch> --dry-run --keep-worktrees --keep-branches`
- **THEN** the command reports that no destructive operations would be performed
- **AND** the command exits successfully without mutation

#### Scenario: Configured nested dry-run expands descendants and is child-first
- **WHEN** a configured dry-run targets a coordinated parent worktree by branch or exact path and configured child worktrees are nested beneath it
- **THEN** human and JSON operation output includes those descendants even when they use different branches or were not the exact path argument
- **AND** every nested child `worktree_remove` appears before the parent `worktree_remove`
- **AND** the preview remains non-mutating
- **AND** a subsequent real invocation derives the same worktree operation order
