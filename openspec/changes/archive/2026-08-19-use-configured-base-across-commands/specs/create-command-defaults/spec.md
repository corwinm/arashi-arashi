## MODIFIED Requirements

### Requirement: Resolve create defaults from configuration and CLI

The system SHALL resolve `arashi create` launch/switch behavior from CLI flags, invocation context, and supported create defaults while resolving branch ancestry from the shared repository base policy. `defaults.create` SHALL control only create launch and switch behavior and MUST NOT accept a `baseBranch` property. Explicit `--base` and `--repo-base` values SHALL participate in shared create/clone base-policy precedence. Editor-scoped create defaults SHALL continue to control only switch and launch behavior.

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

- **WHEN** configuration places `baseBranch` under `defaults.create`
- **THEN** Arashi rejects the removed property before repository discovery, hooks, or Git mutation
- **AND** directs the user to root `baseBranch`, or to a repository override when repository-specific behavior is intended

#### Scenario: Remaining create defaults continue to work

- **WHEN** `defaults.create` contains supported switch, launch, editor, terminal, or disposition settings without `baseBranch`
- **THEN** Arashi normalizes and applies those settings under their existing precedence and safety boundaries
