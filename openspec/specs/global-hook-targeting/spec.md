# global-hook-targeting Specification

## Purpose
TBD - created by archiving change expand-hooks-scope-and-options. Update Purpose after archive.
## Requirements
### Requirement: User-global hook targeting by repository name
The system SHALL support two user-global hook targeting modes under `~/.arashi/hooks/`: shared hooks at `~/.arashi/hooks/<lifecycle>.sh` that apply to all repositories, and repository-targeted hooks at `~/.arashi/hooks/<repo>/<lifecycle>.sh` that apply only when the lifecycle runs for `<repo>`.

#### Scenario: Shared global hook applies to all repositories
- **WHEN** `~/.arashi/hooks/pre-remove.sh` exists
- **THEN** the pre-remove lifecycle includes that hook for every repository where pre-remove is evaluated

#### Scenario: Repository-targeted global hook applies only to matching repository
- **WHEN** `~/.arashi/hooks/my-repo/pre-remove.sh` exists and the lifecycle runs for `my-repo`
- **THEN** the hook is included in execution
- **WHEN** the lifecycle runs for a different repository
- **THEN** the hook is not included

### Requirement: Deterministic ordering within global scope
When both repository-targeted and shared user-global hooks are discovered for the same lifecycle event, the system MUST execute the repository-targeted global hook before the shared global hook.

#### Scenario: Both global hook modes are present
- **WHEN** `~/.arashi/hooks/<repo>/<lifecycle>.sh` and `~/.arashi/hooks/<lifecycle>.sh` both exist for the target repository
- **THEN** the targeted global hook executes first and the shared global hook executes second

### Requirement: Scope metadata exposure for global hooks
The system SHALL expose hook scope metadata to global hook processes via environment variables, including at minimum a scope identifier and source script path.

#### Scenario: Global hook receives scope metadata
- **WHEN** a user-global lifecycle hook executes
- **THEN** the hook process receives environment variables describing scope and source path

### Requirement: Standalone repositories have stable global-hook identity
Arashi SHALL use the resolved main repository root basename as the repository name for targeted user-global hooks in implicit standalone mode, regardless of whether invocation starts in the main or a linked worktree.

#### Scenario: Targeted standalone hook matches
- **WHEN** `~/.arashi/hooks/<main-root-basename>/<lifecycle>.sh` exists and the lifecycle targets that standalone repository
- **THEN** Arashi includes the targeted hook before any shared user-global hook
- **AND** executes both with existing scope/source metadata

#### Scenario: Invocation starts in linked worktree
- **WHEN** a standalone lifecycle starts from a linked worktree whose directory basename differs from the main root
- **THEN** repository-targeted hook lookup still uses the main-root basename
- **AND** does not derive identity from the linked worktree path or branch name

#### Scenario: Targeted hook names another repository
- **WHEN** a user-global targeted hook directory does not match the standalone main-root basename
- **THEN** Arashi excludes that targeted hook from the lifecycle plan

