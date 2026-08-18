## MODIFIED Requirements

### Requirement: Documentation teaches long-running coordinated base branches
Canonical create, clone, configuration, workflow, and generated agent-readable documentation SHALL teach root `baseBranch` as the shared workspace fallback, `meta.baseBranch` and `repos.<name>.baseBranch` as repository overrides, `--base` as invocation-wide override, and repeatable `--repo-base <repository=branch>` as repository-specific override. Guidance SHALL explain exact precedence, `@meta`, local-then-origin resolution, selected-set preflight, coordinated clone target alignment, existing-target reuse, legacy-key migration, structured output, and implicit standalone limits.

#### Scenario: User configures mixed integration branches
- **WHEN** a workspace's meta, API, and other children need different integration branches
- **THEN** configuration guidance shows one root fallback plus concise meta/child overrides
- **AND** does not duplicate create and clone settings

#### Scenario: User overrides one invocation
- **WHEN** the user needs one-off global and repository-specific bases
- **THEN** command guidance shows `--base` and repeatable `--repo-base` examples for create and clone
- **AND** documents selector/duplicate/selected-set validation

#### Scenario: User clones inside a coordinated worktree
- **WHEN** clone fills a missing child on an active coordinated branch
- **THEN** docs explain that effective base seeds a missing target branch
- **AND** the checked-out child remains on the coordinated target branch

#### Scenario: User has legacy create-only config
- **WHEN** docs show migration from `defaults.create.baseBranch`
- **THEN** they direct the user to root `baseBranch`
- **AND** explain that the canonical value now applies to configured create and clone

#### Scenario: Generated exports drift
- **WHEN** generated agent-readable routes are refreshed
- **THEN** they retain the same configuration, precedence, clone, migration, and safety semantics as canonical source
