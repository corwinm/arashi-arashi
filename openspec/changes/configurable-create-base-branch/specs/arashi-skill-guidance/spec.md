## ADDED Requirements

### Requirement: Skill guidance teaches configurable create base branches
The packaged Arashi skill SHALL teach agents to use generic `defaults.create.baseBranch` for a persistent coordinated base and `arashi create <target> --base <branch>` for a one-off override. Guidance SHALL distinguish configured and implicit standalone behavior, explain local-then-origin resolution and selected-repository preflight, and preserve existing target branches rather than implying history rewriting.

#### Scenario: Agent configures a long-running feature base
- **WHEN** an agent needs follow-up coordinated branches to start from `feature/FEAT-1234`
- **THEN** skill guidance uses `defaults.create.baseBranch` in generic create defaults
- **AND** does not place the field under editor-scoped defaults or per-repository configuration

#### Scenario: Agent selects a one-off base
- **WHEN** an agent needs a different base for one create invocation
- **THEN** guidance uses `--base <branch>` and states that it overrides configuration
- **AND** explains that the base must resolve in every effective selected repository before hooks or mutation

#### Scenario: Agent reuses a pre-created target branch
- **WHEN** an agent uses the documented manual workaround or `REUSE_EXISTING`
- **THEN** guidance explains that `--base` applies only to newly created targets
- **AND** does not claim Arashi resets, rebases, or validates ancestry of an existing target

#### Scenario: Agent uses implicit standalone mode
- **WHEN** an agent runs standalone create with an explicit base
- **THEN** guidance allows `--base` as an invocation-only option
- **AND** does not claim standalone mode loads or persists `defaults.create.baseBranch`

#### Scenario: Agent writes create hooks
- **WHEN** an agent needs target-branch context after base selection
- **THEN** guidance continues to use `ARASHI_BRANCH_NAME` for the target
- **AND** does not invent or advertise `ARASHI_BASE_BRANCH`
