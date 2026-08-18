## MODIFIED Requirements

### Requirement: Documentation teaches long-running coordinated base branches

Canonical configuration, workflow, affected command, generated reference, and agent-readable documentation SHALL teach root `baseBranch` as the configured workspace fallback and `meta.baseBranch` / `repos.<name>.baseBranch` as repository overrides. Guidance SHALL distinguish current-branch upstream, configured base, and remote default; explain configured-base use by create, clone, status, pull, push fallback, handoff, and doctor; document applicable `--base` / repeatable `--repo-base <repository=branch>` precedence for create and clone; and state that standalone behavior is unchanged. Documentation MUST identify `defaults.create.baseBranch` as removed and provide actionable canonical migration guidance rather than compatibility examples.

#### Scenario: User configures mixed integration branches

- **WHEN** a workspace's meta, API, and other children need different integration branches
- **THEN** configuration guidance shows one root fallback plus concise meta/child overrides
- **AND** does not duplicate base values under create defaults
- **AND** explains that status, pull, push fallback, handoff, and doctor consume the same persisted policy

#### Scenario: User overrides one create or clone invocation

- **WHEN** the user needs one-off global and repository-specific bases for create or clone
- **THEN** command guidance shows `--base` and repeatable `--repo-base` examples
- **AND** documents selector, duplicate, selected-set, and fail-before-mutation validation
- **AND** does not imply that diagnostic commands accept or persist those invocation overrides

#### Scenario: User reads status and pull guidance

- **WHEN** a feature branch tracks a different upstream from configured base
- **THEN** docs explain that status retains upstream, base, and default comparisons
- **AND** configured pull incorporates the remote base while unconfigured pull preserves upstream behavior
- **AND** an unavailable configured base fails explicitly without silent fallback

#### Scenario: User reads push and diagnostic guidance

- **WHEN** docs describe push, handoff, or doctor
- **THEN** push uses configured base only for no-upstream publishability and never as a destination
- **AND** handoff and doctor report configured-base state separately from default state
- **AND** same-target base/default work and human diagnostics are de-duplicated without losing structured roles

#### Scenario: User clones inside a coordinated worktree

- **WHEN** clone fills a missing child on an active coordinated branch
- **THEN** docs explain that effective base seeds a missing target branch
- **AND** the checked-out child remains on the coordinated target branch

#### Scenario: User has removed create-only config

- **WHEN** docs mention `defaults.create.baseBranch`
- **THEN** they state that the property is unsupported and validation fails before workspace work
- **AND** direct workspace-wide migration to root `baseBranch` and repository-specific migration to meta/child overrides
- **AND** do not present legacy acceptance or deprecation-diagnostic behavior as current

#### Scenario: Standalone workflow is documented

- **WHEN** docs describe implicit standalone commands
- **THEN** they preserve existing standalone upstream/default behavior
- **AND** do not claim persisted configured-base policy applies

#### Scenario: Generated exports drift

- **WHEN** generated reference or agent-readable routes are refreshed
- **THEN** they retain the same configuration, precedence, command-role, failure, de-duplication, migration, and standalone semantics as canonical source
