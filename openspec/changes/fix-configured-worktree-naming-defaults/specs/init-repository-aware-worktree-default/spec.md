## MODIFIED Requirements

### Requirement: Bare initialized create uses the persisted sibling base

A configured bare repository initialized with the repository-aware default SHALL use the persisted parent base for subsequent create operations and SHALL place each new parent worktree at `<canonical repository naming component>-<branch>` beneath that base. The repository component SHALL use the existing resolved `worktreeName` or canonical configured-name authority rather than filesystem guessing.

#### Scenario: Created bare worktree is a repository-qualified sibling

- **WHEN** a real bare repository whose canonical repository naming component is `example` is initialized without `--worktrees-dir` and then creates `feature/auth`
- **THEN** the worktree is created at `<canonical-bare-parent>/example-feature/auth`
- **AND** no checked-out worktree is created beneath the bare Git repository

#### Scenario: Explicit bare base is used by create

- **WHEN** a bare repository is initialized with an explicit valid worktree base and then creates a branch
- **THEN** create uses the persisted explicit base rather than the parent default
- **AND** applies the same `<canonical repository naming component>-<branch>` rule beneath it
