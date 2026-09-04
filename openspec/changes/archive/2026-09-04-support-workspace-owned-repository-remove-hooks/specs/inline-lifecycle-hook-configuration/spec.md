## MODIFIED Requirements

### Requirement: Inline and file sources fail closed at one logical location

An inline definition SHALL be an alternative source for one existing configured logical scope/lifecycle, not an additional hook. Root inline create hooks conflict with corresponding workspace create files; repository inline create hooks conflict with corresponding repository-specific workspace filenames; root inline remove hooks conflict with corresponding workspace remove files; and repository inline remove hooks conflict with both workspace-owned repository-specific and compatible repository-local remove files. The two repository native remove forms also conflict with each other. If multiple sources claim one location, runtime, dry-run, and doctor MUST fail before lifecycle mutation, identify lifecycle, scope, owner, source kinds, and every native candidate path, and MUST NOT select or execute any source. Hooks at different scopes SHALL continue to compose in established order.

#### Scenario: Workspace location is ambiguous

- **WHEN** root inline `pre-remove` and workspace `pre-remove` file both claim configured workspace scope
- **THEN** resolution fails before removal mutation and identifies both source kinds
- **AND** neither executes

#### Scenario: Repository create location is ambiguous

- **WHEN** `repos.api.hooks.post-create` and workspace `post-create.api` file both exist
- **THEN** resolution fails before create mutation and identifies repository `api` and the file path
- **AND** does not disclose inline value

#### Scenario: Repository remove inline conflicts with workspace-owned file

- **WHEN** `repos.api.hooks.pre-remove` and `.arashi/hooks/pre-remove.api<ext>` both exist
- **THEN** runtime, dry-run, and doctor reject the repository location before mutation
- **AND** expose no inline text

#### Scenario: Repository remove native forms conflict

- **WHEN** `.arashi/hooks/pre-remove.api<ext>` and `repos/api/.arashi/hooks/pre-remove<ext>` both exist
- **THEN** runtime, dry-run, and doctor reject the repository location and identify both paths

#### Scenario: Different scopes compose

- **WHEN** one valid repository source and file-backed workspace or user-global hooks exist
- **THEN** all remain eligible in established scope order
