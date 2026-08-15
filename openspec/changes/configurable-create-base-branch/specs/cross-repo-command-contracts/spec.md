## ADDED Requirements

### Requirement: Create base-branch contracts remain synchronized across repositories
The CLI configuration schema and command contract SHALL publish normalized `defaults.create.baseBranch` and `create --base <branch>` semantics, including CLI-over-config precedence, generic-only persistence, explicit standalone support, local-then-origin resolution, selected-repository scope, new-target-only application, fail-before-hook/mutation behavior, dry-run visibility, and structured JSON reporting. Coordinated validation SHALL compare those semantics with canonical docs, generated agent-readable exports, and packaged skill guidance.

#### Scenario: CLI contracts expose create base semantics
- **WHEN** schema and command contracts are generated after the feature is registered
- **THEN** the schema accepts optional generic `defaults.create.baseBranch` and rejects editor-scoped base fields
- **AND** the command contract records `--base` precedence, persistence, standalone support, resolution order, and safety boundary

#### Scenario: Companion create-base guidance agrees
- **WHEN** the meta cross-repository checker validates the coordinated repositories
- **THEN** docs and skill guidance use the canonical field and flag
- **AND** their precedence, resolution, selected-repository, reuse, dry-run, JSON, and non-mutation semantics match the CLI contracts

#### Scenario: Deliberate create-base drift is rejected
- **WHEN** an out-of-repository fixture removes or contradicts one required create-base semantic
- **THEN** the focused checker exits unsuccessfully with a stable diagnostic naming the owning surface and mismatch
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Focused create-base validation is reachable from CI
- **WHEN** repository self-tests inspect the applicable workflow
- **THEN** they confirm CI invokes the create-base semantic checker and any required contract generation before comparison
