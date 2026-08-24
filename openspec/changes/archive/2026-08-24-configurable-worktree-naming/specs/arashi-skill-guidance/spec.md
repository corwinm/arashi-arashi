## ADDED Requirements

### Requirement: Detailed skill references explain configured worktree naming

The packaged Arashi skill SHALL keep `skills/arashi/SKILL.md` limited to routing and place configured `worktreeNaming` guidance in the smallest workspace/create reference. Detailed guidance SHALL define both closed fields, omission/default/preserve compatibility, exact representative destination styles, unchanged Git branch identity, direct JSON-authoring scope, deterministic no-suffix collisions, metadata-driven existing-worktree behavior, coordinated child placement, and unchanged standalone behavior. Source and extracted-package validation MUST enforce the same contract.

#### Scenario: Agent needs configured naming guidance

- **WHEN** an agent follows the skill's workspace or create references
- **THEN** the smallest owning reference provides the exact nested config shape, closed values, defaults, examples, and safety boundaries
- **AND** the routing-only skill entry point does not duplicate the manual

#### Scenario: Packaged guidance is validated

- **WHEN** maintainers run source and extracted-package skill checks
- **THEN** both copies must agree on naming values, defaults, representative paths, JSON-authored scope, branch identity, collisions, compatibility, and standalone isolation
- **AND** a drifted or missing required claim fails validation
