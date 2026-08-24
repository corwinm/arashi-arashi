## ADDED Requirements

### Requirement: Canonical guidance documents configured worktree naming policy

The documentation site SHALL provide discoverable authored configuration and create guidance for root `worktreeNaming.style` values `current`, `branch`, and `repo-branch` and `worktreeNaming.branchSlashes` values `preserve` and `flatten`. Guidance MUST define omission and explicit compatibility defaults, configured-only scope, direct `.arashi/config.json` authoring for this initial slice, exact bare/non-bare and slash examples, unchanged Git branch identity, deterministic collision behavior without alternate names, metadata-driven existing-worktree compatibility, coordinated child placement, and unchanged standalone behavior.

#### Scenario: User authors naming configuration

- **WHEN** a user reads canonical configuration guidance
- **THEN** it shows the exact nested JSON shape and closed values
- **AND** explains that omitted fields mean `current` and `preserve` without automatic persistence
- **AND** states that the initial slice is edited directly in `.arashi/config.json` rather than through interactive `aw configure`

#### Scenario: User compares exact destination styles

- **WHEN** a user reads configured create guidance for repository `example` and branch `feature/auth`
- **THEN** examples distinguish bare current `example/feature/auth`, bare current flatten `example/feature-auth`, branch preserve `feature/auth`, branch flatten `feature-auth`, repo-branch preserve `example-feature/auth`, and repo-branch flatten `example-feature-auth`
- **AND** explain that Git still receives branch `feature/auth`

#### Scenario: User encounters a naming collision or existing worktree

- **WHEN** guidance explains flattened aliases, policy changes, coordinated children, or standalone worktrees
- **THEN** it states that collisions fail at the exact destination without suffixes, existing registered paths are not renamed, child paths stay beneath the planned parent, and standalone remains `.worktrees/<branch>` with natural slash hierarchy
