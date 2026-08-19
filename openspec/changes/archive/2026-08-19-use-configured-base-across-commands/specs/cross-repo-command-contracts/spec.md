## MODIFIED Requirements

### Requirement: Create base-branch contracts remain synchronized across repositories

The shared base-policy contract SHALL publish canonical root/meta/child configuration paths; removal and migration of `defaults.create.baseBranch`; configured and standalone scope; create/clone `--base` / `--repo-base` syntax, selectors, precedence, resolution, reuse, pre-mutation failure, and reporting; status upstream/base/default distinctions; configured pull and no-config upstream fallback; no-upstream push baseline without destination changes; handoff/doctor diagnostics; unavailable-target failure; and same-target de-duplication with role-complete structured output. CLI schema/command/JSON artifacts, canonical and generated docs exports, packaged skill records, and meta validation SHALL agree on that policy.

#### Scenario: Shared policy is synchronized

- **WHEN** CLI, docs, skills, and meta contract checks run
- **THEN** all surfaces agree on configuration paths, option syntax, precedence, per-command base semantics, role distinctions, sources, fallback, failure, de-duplication, and standalone boundaries

#### Scenario: One companion retains the removed key

- **WHEN** a schema, type, generated contract, doc, skill, or checker still accepts or recommends `defaults.create.baseBranch`
- **THEN** cross-repository validation fails with the mismatched field and repository
- **AND** canonical migration guidance identifies root or repository-specific `baseBranch`

#### Scenario: Status or diagnostics conflate branch roles

- **WHEN** a companion replaces upstream/default information with configured-base state or collapses same-target JSON roles
- **THEN** semantic validation fails before coordinated delivery

#### Scenario: Pull or push semantics drift

- **WHEN** a companion claims configured pull falls back after configured-base failure, or claims push changes its destination to configured base
- **THEN** semantic validation fails with the affected command and contract field

#### Scenario: Clone semantics drift

- **WHEN** docs or skill guidance omits workspace/per-child clone bases or claims a coordinated child is checked out on the base instead of the coordinated target
- **THEN** semantic validation fails before coordinated delivery

#### Scenario: Standalone semantics drift

- **WHEN** a companion claims persisted configured-base policy changes implicit standalone status, pull, push, handoff, or doctor
- **THEN** semantic validation fails with the affected repository and command
