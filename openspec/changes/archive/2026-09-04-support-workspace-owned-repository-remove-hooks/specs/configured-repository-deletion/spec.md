## MODIFIED Requirements

### Requirement: Deletion scope is complete and minimal

The plan SHALL include the selected child's canonical clone, all owned linked worktrees and stale owned registrations including coordinated descendants under other parent worktrees, child-local branch/tag/stash/detached-commit refs that cease to exist, the temporary resume-receipt path, the complete active `repos.<repository>` entry, and only exact canonical workspace-root `pre-create.<repository>`, `post-create.<repository>`, `pre-remove.<repository>`, and `post-remove.<repository>` active files/templates. It SHALL preserve all unrelated configuration, managed-ignore policy, shared hooks, compatible repository-local hook content outside existing clone/worktree ownership, and user-global hooks.

#### Scenario: Complete repository entry is planned

- **WHEN** the selected entry contains `gitUrl`, `path`, `baseBranch`, `groups`, `copy`, `symlink`, and inline `hooks`
- **THEN** one config-entry item plans removal of the complete `repos.<repository>` value
- **AND** no field in another repository, `meta`, defaults, root groups, or shared hook configuration is planned

#### Scenario: Coordinated descendants exist

- **WHEN** the child clone owns worktrees nested beneath several linked parent worktrees, including branch names containing `/`
- **THEN** every registered child worktree is present exactly once in the plan
- **AND** worktree removal order is deepest physical descendant first with deterministic normalized-path ties

#### Scenario: Stale owned worktree metadata exists

- **WHEN** the selected child common directory contains a stale registration whose filesystem path is exactly absent
- **THEN** the plan includes one owned worktree-metadata item for that registration
- **AND** cleanup occurs only after filesystem removal for present owned worktrees succeeds

#### Scenario: Repository-local hooks exist inside the child

- **WHEN** the child repository contains `.arashi/hooks` files
- **THEN** those files are covered only by canonical clone/worktree ownership
- **AND** no separate path broadening is needed to remove them

#### Scenario: Workspace-targeted hook files exist

- **WHEN** canonical discovery finds exact active native files for logical names `pre-create.<repository>`, `post-create.<repository>`, `pre-remove.<repository>`, or `post-remove.<repository>`, or a concrete inert template formed only by appending `.example` to one exact active candidate path
- **THEN** each exact path is planned as a workspace-hook item
- **AND** hook contents are not read or emitted

#### Scenario: Concrete and generic templates coexist

- **WHEN** one concrete exact-key create/remove template or its exact native Windows equivalent coexists with a literal generic `<repo>` or `REPO` template
- **THEN** only the concrete exact-key template is planned
- **AND** every generic placeholder template is preserved

#### Scenario: Shared and global hooks exist

- **WHEN** workspace-shared or user-global repository-targeted hook paths exist
- **THEN** shared hooks are excluded and repository-targeted user-global paths are reported as preserved-global-hook guidance
- **AND** no user-global file is removed

#### Scenario: Managed ignore state exists

- **WHEN** managed-ignore policy covers `reposDir` or `worktreesDir`
- **THEN** deletion preserves the policy and every owning tracked/local preference file
- **AND** no ignore reconciliation is performed merely because the selected or last repository is deleted
