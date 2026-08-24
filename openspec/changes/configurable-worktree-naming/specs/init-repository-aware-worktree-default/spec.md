## MODIFIED Requirements

### Requirement: Bare initialized create uses the persisted sibling base

A configured bare repository initialized with the repository-aware default SHALL use the persisted parent base for subsequent create operations and SHALL apply the effective root `worktreeNaming` policy beneath that base. Omitted policy or explicit `style: "current"` plus `branchSlashes: "preserve"` SHALL place each new parent worktree at `<canonical repository naming component>/<branch>`. Explicit `branch` and `repo-branch` styles and `flatten` SHALL change only the naming components beneath the persisted base according to the configured naming contract. The repository component, when selected, SHALL use the existing resolved `worktreeName` or canonical configured-name authority, omitting a conventional terminal `.git` suffix from the fallback bare source name rather than otherwise guessing from the filesystem. The requested Git branch SHALL remain unchanged.

#### Scenario: Created bare worktree is a repository-qualified sibling

- **WHEN** a real bare repository whose canonical repository naming component is `example` is initialized without `--worktrees-dir` and then creates `feature/auth` with omitted naming policy or explicit `current` and `preserve`
- **THEN** the worktree is created at `<canonical-bare-parent>/example/feature/auth`
- **AND** the Git branch remains `feature/auth`
- **AND** no checked-out worktree is created beneath the bare Git repository

#### Scenario: Explicit bare base is used by create

- **WHEN** a bare repository is initialized with an explicit valid worktree base and then creates a branch under any supported configured naming policy
- **THEN** create uses the persisted explicit base rather than the parent default
- **AND** applies the selected current/branch/repo-branch and preserve/flatten components beneath it without changing the base or Git branch
