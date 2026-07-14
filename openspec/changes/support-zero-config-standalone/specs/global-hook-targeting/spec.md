## ADDED Requirements

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
