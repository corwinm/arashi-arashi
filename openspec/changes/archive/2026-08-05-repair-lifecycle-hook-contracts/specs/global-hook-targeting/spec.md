## MODIFIED Requirements

### Requirement: User-global hook targeting by repository name
The system SHALL support shared user-global hooks and repository-targeted user-global hooks beneath `~/.arashi/hooks/`. Shared hooks use `~/.arashi/hooks/<lifecycle><ext>` and targeted hooks use `~/.arashi/hooks/<repo>/<lifecycle><ext>`, where `<ext>` is platform-supported. If one logical location contains multiple supported native candidates, discovery MUST fail instead of selecting one.

#### Scenario: Shared global hook applies to all repositories
- **WHEN** one supported `~/.arashi/hooks/pre-remove<ext>` exists
- **THEN** the pre-remove lifecycle includes that hook for every repository where pre-remove is evaluated

#### Scenario: Repository-targeted global hook applies only to matching repository
- **WHEN** `~/.arashi/hooks/my-repo/pre-remove<ext>` exists and the lifecycle runs for `my-repo`
- **THEN** the hook is included
- **WHEN** the lifecycle runs for a different repository
- **THEN** the hook is excluded

#### Scenario: Global location has conflicting scripts
- **WHEN** a shared or targeted global location contains multiple extensions supported on the current platform
- **THEN** Arashi fails discovery before lifecycle mutation and identifies the candidates

### Requirement: Deterministic ordering within global scope
When both repository-targeted and shared user-global native hooks are discovered for the same lifecycle event, the system MUST execute the repository-targeted global hook before the shared global hook.

#### Scenario: Both global hook modes are present
- **WHEN** `~/.arashi/hooks/<repo>/<lifecycle><ext>` and `~/.arashi/hooks/<lifecycle><ext>` both exist as unambiguous native scripts for the target repository
- **THEN** the targeted global hook executes first and the shared global hook executes second

### Requirement: Scope metadata exposure for global hooks
The system SHALL expose global hook metadata through executor-owned environment variables including logical hook name, `global-repository` or `global-shared` scope, exact source path, exact execution cwd, workspace mode, canonical main root, and target identity where applicable.

#### Scenario: Global hook receives scope metadata
- **WHEN** a user-global lifecycle hook executes
- **THEN** its process receives authoritative name, scope, source, cwd, mode, and main-root values
- **AND** targeted values identify only the repository/worktree represented by that invocation

### Requirement: Standalone repositories have stable global-hook identity
Arashi SHALL use the resolved main repository root basename as the target directory name for repository-targeted native global hooks in implicit standalone mode, regardless of whether invocation starts in the main or a linked worktree.

#### Scenario: Targeted standalone hook matches
- **WHEN** `~/.arashi/hooks/<main-root-basename>/<lifecycle><ext>` exists for the current platform
- **THEN** Arashi includes it before any shared user-global hook
- **AND** executes both with authoritative scope/source/execution metadata

#### Scenario: Invocation starts in linked worktree
- **WHEN** a standalone lifecycle starts from a linked worktree whose directory basename differs from the main root
- **THEN** repository-targeted lookup still uses the main-root basename
- **AND** does not derive identity from the linked worktree or branch

#### Scenario: Targeted hook names another repository
- **WHEN** a user-global target directory does not match the standalone main-root basename
- **THEN** Arashi excludes that targeted hook from the lifecycle plan
