## ADDED Requirements

### Requirement: Init SHALL offer repository bootstrap outside git repo
The `arashi init` command SHALL detect when it is run from a directory that is not already a git repository and SHALL offer an interactive repository-creation workflow instead of failing immediately.

#### Scenario: Non-repository directory starts bootstrap flow
- **WHEN** a user runs `arashi init` from a directory that is not a git repository
- **THEN** the command prompts for repository creation before Arashi workspace setup continues

#### Scenario: User declines repository creation
- **WHEN** the command offers repository creation and the user declines
- **THEN** the command exits without creating `.git`, `.arashi`, or managed repository directories in that location

### Requirement: Init SHALL support current-directory repository creation
The bootstrap workflow SHALL accept `.` as the repository target and SHALL initialize a git repository in the current working directory before continuing Arashi initialization there.

#### Scenario: Current directory target selected
- **WHEN** the user enters `.` as the bootstrap target
- **THEN** the command initializes a git repository in the current working directory and writes Arashi workspace files relative to that directory

### Requirement: Init SHALL support child-directory repository creation
The bootstrap workflow SHALL accept a simple child directory name and SHALL create and initialize that child directory as a git repository before continuing Arashi initialization in the child root.

#### Scenario: Child directory target selected
- **WHEN** the user enters `my-arashi-repo` as the bootstrap target
- **THEN** the command creates `<cwd>/my-arashi-repo`, initializes git there, and writes Arashi workspace files relative to the child directory

### Requirement: Bootstrap target MUST be constrained to supported forms
The bootstrap workflow MUST accept only `.` or a simple child directory name, and MUST reject absolute paths, parent traversal, or nested multi-segment paths.

#### Scenario: Unsupported target rejected
- **WHEN** the user enters `../repo`, `/tmp/repo`, or `foo/bar` as the bootstrap target
- **THEN** the command reports that the target must be `.` or a direct child directory name and does not initialize a repository at the invalid path

### Requirement: Bootstrapped repositories SHALL use standard init workflow
After repository bootstrap succeeds, `arashi init` SHALL apply the same configuration, hook template creation, `.gitignore` updates, and repository discovery behavior that it applies when started inside an existing git repository.

#### Scenario: Standard init continues after bootstrap
- **WHEN** repository creation succeeds and `arashi init` continues
- **THEN** the resolved repository root contains the standard Arashi configuration, hooks, ignore entries, and repository discovery results for the supplied init options
