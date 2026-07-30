## ADDED Requirements

### Requirement: Reuse Kitty-aware launch behavior after create
The system SHALL use the shared managed Kitty worktree-session launcher for resolved automatic post-create launch, SHALL report mode `kitty` on validated success, and SHALL keep explicit/configured `sesh` and `herdr` choices authoritative over automatic Kitty detection.

#### Scenario: Explicit automatic post-create launch uses Kitty
- **WHEN** a user runs `arashi create <branch> --launch` from a supported Kitty context and worktree creation succeeds
- **THEN** Arashi creates or reuses and focuses the managed Kitty session for the newly created primary worktree
- **AND** the create launch result reports mode `kitty`

#### Scenario: Configured automatic post-create launch uses Kitty
- **WHEN** the matching create-default scope sets canonical `launch` to `auto`, creation succeeds, and automatic precedence resolves to Kitty
- **THEN** Arashi uses the same managed Kitty identity, reuse, creation, validation, and failure contract as `arashi switch`

#### Scenario: Explicit or configured named launcher bypasses Kitty
- **WHEN** resolved create launch is explicit/configured `sesh` or `herdr` and Kitty environment evidence is present
- **THEN** Arashi invokes the named launcher instead of managed Kitty

#### Scenario: Post-create Kitty launch fails
- **WHEN** worktree creation succeeds but managed Kitty preflight, remote control, focus, launch, reconciliation, or validation fails
- **THEN** Arashi preserves every successfully created worktree
- **AND** reports completed creation separately from the actionable Kitty launch failure
- **AND** does not invoke another launcher or roll back Git worktrees
