## MODIFIED Requirements

### Requirement: Resolve create defaults from configuration and CLI
The system SHALL resolve `arashi create` launch/switch behavior from CLI flags, invocation context, and create defaults while resolving branch ancestry from the shared repository base policy. `defaults.create` SHALL control only create launch and switch behavior. Explicit `--base` and `--repo-base` values SHALL participate in the shared base-policy precedence. Editor-scoped create defaults SHALL continue to control only switch and launch behavior.

#### Scenario: Terminal invocation applies generic create defaults
- **WHEN** a terminal create runs with generic launch/switch defaults and shared base policy
- **THEN** the command applies configured launch/switch defaults
- **AND** independently resolves each selected repository's effective base from shared policy

#### Scenario: Editor-hosted invocation applies host-specific create defaults
- **WHEN** a supported editor-hosted create has matching editor defaults
- **THEN** the command applies host-specific switch and launch behavior
- **AND** branch ancestry remains governed by host-independent shared base policy

#### Scenario: CLI flags override corresponding configuration
- **WHEN** create receives explicit launch, switch, invocation-wide base, or repository-base flags
- **THEN** each explicit value overrides only its corresponding configured behavior under documented precedence

#### Scenario: Create-only defaults cannot own a base
- **WHEN** canonical configuration places `baseBranch` under `defaults.create`
- **THEN** Arashi treats it only as deprecated migration input
- **AND** directs the user to root `baseBranch`

### Requirement: Preserve current behavior when defaults are absent
The system MUST preserve existing create behavior when shared/repository base policy and explicit base flags are absent, and editor-hosted invocations MUST fall back to no post-create defaults when no host-specific create defaults are configured.

#### Scenario: Terminal workspace has no create or base settings
- **WHEN** terminal create runs with no new create defaults or base policy
- **THEN** command behavior matches current explicit-flag-only behavior
- **AND** the configured parent retains the invoking parent branch as its start point
- **AND** configured children retain their detected-default resolver and fallback behavior

#### Scenario: Editor host has no matching create defaults
- **WHEN** editor-hosted create has no matching host defaults
- **THEN** it performs no post-create switch or launch unless explicitly requested
- **AND** shared base policy, when present, remains authoritative because it is host-independent

### Requirement: Implicit standalone create has no persisted command defaults
`arashi create` in implicit standalone mode SHALL resolve behavior from explicit invocation flags and built-in defaults without loading or persisting configured create/editor defaults or shared base policy. Explicit `--base` SHALL remain available as invocation-only ancestry input, while `--repo-base` SHALL be rejected.

#### Scenario: Standalone create has no explicit overrides
- **WHEN** a user runs create in implicit standalone mode with no explicit behavior or base flags
- **THEN** Arashi uses existing built-in standalone behavior and creates no config

#### Scenario: Standalone create receives explicit base
- **WHEN** standalone create receives `--base <branch>`
- **THEN** Arashi uses it only for that invocation

#### Scenario: Standalone create receives repository base
- **WHEN** standalone create receives `--repo-base <repository=branch>`
- **THEN** Arashi rejects the configured-workspace-only option before mutation
