## ADDED Requirements

### Requirement: Bare configured init uses non-worktree managed-path reporting
Configured init whose canonical workspace root is a bare Git repository SHALL NOT run worktree-dependent effective-ignore inspection or write ignore-file rules for managed paths resolved from that bare root.

#### Scenario: Parent default is external and unsafe
- **WHEN** configured bare init defaults `worktreesDir` to `..`
- **THEN** Arashi reports the path as an external unsafe automatic-ignore skip
- **AND** does not add `..` or an equivalent parent pattern to `.gitignore`, common `info/exclude`, or any global ignore source

#### Scenario: Bare-root subdirectory is non-applicable
- **WHEN** configured bare init resolves a repository-relative administrative path such as `reposDir` beneath the bare Git directory
- **THEN** Arashi reports that path as non-applicable to working-tree ignore rules
- **AND** does not run `git check-ignore` or write an ignore rule for it

#### Scenario: Local scope is non-mutating for bare paths
- **WHEN** configured bare init uses local ignore scope
- **THEN** Arashi reports local scope and the unsafe or non-applicable path results
- **AND** does not write the common local exclude file

#### Scenario: Tracked scope is non-mutating for bare paths
- **WHEN** configured bare init uses tracked ignore scope
- **THEN** Arashi may preserve the explicit clone-local scope preference through existing Git configuration semantics
- **AND** does not create, edit, or require a durable linked worktree for `.gitignore`

#### Scenario: None scope is non-mutating for bare paths
- **WHEN** configured bare init uses none scope
- **THEN** Arashi reports none scope and path classifications without ignore-file mutation

#### Scenario: Existing linked worktree does not change bare-init policy
- **WHEN** the bare repository has one or more usable linked worktrees
- **THEN** init invoked from the bare root does not inspect or mutate ignore files through those worktrees
- **AND** reports the same bare-root classifications as a repository without linked worktrees

#### Scenario: Committed bare repository without linked worktree succeeds
- **WHEN** a bare repository has a committed branch but no linked worktree
- **THEN** configured init completes its managed-path reporting without creating a temporary worktree

#### Scenario: Unborn bare repository succeeds
- **WHEN** a fresh bare repository has no committed branch or linked worktree
- **THEN** configured init completes its managed-path reporting without requiring a source ref or temporary worktree

#### Scenario: Bare dry-run reports without writing
- **WHEN** configured bare init previews local, tracked, or none scope under human or JSON dry-run
- **THEN** the result reports unsafe and non-applicable paths consistently
- **AND** no ignore file, preference, linked worktree, or temporary worktree is changed

### Requirement: Managed-ignore rollback retention ignores unsafe and non-applicable paths
Managed-ignore rollback SHALL use applicable safe surviving paths rather than raw resolved-path existence when deciding whether invocation-owned ignore or preference changes remain required.

#### Scenario: Pre-existing parent does not block restoration
- **WHEN** a configured path resolves through unsafe parent traversal and a later initialization step fails after applying unrelated safe managed-ignore changes
- **THEN** existence of the parent alone does not retain those changes

#### Scenario: Bare administrative path does not block restoration
- **WHEN** a bare-root path is classified non-applicable and a later step fails
- **THEN** existence of that administrative path does not act as managed-ignore residual state

#### Scenario: Applicable safe path survives
- **WHEN** an applicable safe managed path remains after incomplete cleanup
- **THEN** Arashi retains the coverage required by that surviving path

#### Scenario: All applicable state is removed
- **WHEN** downstream cleanup removes all applicable safe managed state created by the invocation
- **THEN** Arashi restores invocation-owned ignore and preference changes

#### Scenario: Restoration fails
- **WHEN** restoration of required prior state fails
- **THEN** Arashi reports both the original failure and restoration failure
- **AND** reports final observed state without claiming complete rollback
