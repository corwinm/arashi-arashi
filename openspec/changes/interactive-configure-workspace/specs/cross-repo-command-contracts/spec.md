## ADDED Requirements

### Requirement: Command contracts publish configure semantics

The canonical CLI command contract SHALL register `configure` and publish typed semantic policy for configured-workspace ownership, TTY-only mutation, sanitized non-mutating `--json` inspection, explicit supported scope and descriptor sets, configured/effective state, keep/edit/clear actions, exact serialized confirmation preview, separate active-file planning, one concurrency-checked save, and cancellation behavior. Companion classifications SHALL require docs and skills coverage and record the reason for VS Code representation or exclusion.

#### Scenario: Configure contract is generated

- **WHEN** CLI command contracts are regenerated
- **THEN** `configure` and its JSON option appear with normalized configure policy
- **AND** freshness validation is deterministic

#### Scenario: Unsupported mutation is advertised

- **WHEN** a companion surface claims JSON, non-TTY, or broad set/unset invocation mutates configuration
- **THEN** semantic validation identifies the owning source and mismatch
- **AND** exits unsuccessfully

### Requirement: Coordinated validation enforces configure guidance

The meta-repository SHALL compare CLI configure policy with canonical docs, generated agent-readable exports, authored skill guidance, and extracted-package guidance through stable registered aggregates. Validation SHALL compare normalized scope, state, mutation, preview, active-file, invocation, and secrecy semantics rather than command-name presence alone.

#### Scenario: Companion surfaces agree

- **WHEN** canonical CLI, docs, exports, and packaged skill surfaces publish the same configure semantics
- **THEN** coordinated contract validation succeeds
- **AND** reports exact participating child revisions

#### Scenario: Controlled configure mismatch proves enforcement

- **WHEN** an out-of-repository fixture removes or contradicts one required configure scope, state label, action, preview, transaction, invocation, or secrecy rule
- **THEN** the focused or aggregate checker exits unsuccessfully with a stable owning-source diagnostic
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Stable aggregates remain authoritative

- **WHEN** configure-focused checkers are registered in docs, skills, or meta repositories
- **THEN** existing stable source, extracted-package, and coordinated aggregate entrypoints execute them
- **AND** no feature-specific authoritative workflow stage is required unless workflow topology changes
