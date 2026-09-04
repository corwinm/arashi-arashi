## MODIFIED Requirements

### Requirement: Remove command lifecycle hooks

The system SHALL support configured remove hooks named `pre-remove` and `post-remove` for each target repository. Repository scope SHALL accept exactly one source from repository-owned inline configuration, a workspace-owned repository-specific native file (`.arashi/hooks/<hook-name>.<repo><ext>`), or the compatible repository-local native file (`repos/<repo>/.arashi/hooks/<hook-name><ext>`). Workspace scope SHALL retain `.arashi/hooks/<hook-name><ext>` or root inline configuration, and user-global shared/targeted locations SHALL remain file-only. `<ext>` SHALL be `.sh` on POSIX and `.ps1`, `.cmd`, or `.bat` on Windows. Multiple supported native candidates or multiple claims on one logical location MUST fail discovery before any hook or removal mutation.

#### Scenario: Remove hooks are configured across scopes

- **WHEN** a user removes a target with one valid repository source plus workspace and user-global sources
- **THEN** the command evaluates and executes each discovered hook at its lifecycle point in established scope order

#### Scenario: Workspace-owned repository script is selected

- **WHEN** `.arashi/hooks/pre-remove.<repo><ext>` is the only source claiming repository pre-remove for target `<repo>`
- **THEN** it is selected with repository scope and owner `<repo>`
- **AND** executes from `<repo>`'s configured source checkout with plain hook name `pre-remove`

#### Scenario: Compatible repository-local script remains selected

- **WHEN** `repos/<repo>/.arashi/hooks/pre-remove<ext>` is the only source claiming repository pre-remove
- **THEN** existing repository-scope discovery and execution remain unchanged

#### Scenario: Remove hooks are not configured

- **WHEN** a user runs `arashi remove` and one or more logical locations have no source
- **THEN** the command skips missing hooks without failing solely because they are absent

#### Scenario: Repository location has competing native forms

- **WHEN** workspace-owned repository-specific and repository-local native files claim the same target lifecycle
- **THEN** discovery fails before hook execution, worktree removal, or branch deletion
- **AND** diagnostics identify every candidate path without reading file contents

#### Scenario: Remove hook location is ambiguous on Windows

- **WHEN** one remove hook directory contains more than one case-insensitive `.ps1`, `.cmd`, or `.bat` candidate for the same logical hook
- **THEN** discovery fails before worktree or branch mutation and identifies every candidate
