## MODIFIED Requirements

### Requirement: Create base-branch contracts remain synchronized across repositories
The shared base-policy contract SHALL publish root/meta/child configuration paths, legacy migration, configured and standalone scope, `--base`/`--repo-base` syntax, selector vocabulary, precedence, local-then-origin resolution, create/clone application, pre-mutation failure, reuse semantics, dry-run/JSON reporting, and prohibited hook aliases. CLI schema/command artifacts, canonical docs exports, packaged skill records, and meta validation SHALL agree on that policy.

#### Scenario: Shared policy is synchronized
- **WHEN** CLI, docs, skills, and meta contract checks run
- **THEN** all surfaces agree on configuration paths, option syntax, precedence, create/clone semantics, selectors, sources, and failure boundaries

#### Scenario: One companion keeps create-only semantics
- **WHEN** a companion artifact still recommends only `defaults.create.baseBranch` or one branch shared by every repository
- **THEN** cross-repository validation fails with the mismatched field and repository

#### Scenario: Clone semantics drift
- **WHEN** docs or skill guidance omits workspace/per-child clone bases or claims a coordinated child is checked out on the base instead of the coordinated target
- **THEN** semantic validation fails before coordinated delivery

### Requirement: CLI-derived command contract
The CLI repository SHALL generate a deterministic command contract from registered commands plus typed semantic policy, including the shared base-policy configuration paths, migration, option relationships, selectors, precedence, command scope, resolution/reporting rules, and stable source vocabulary.

#### Scenario: Base option metadata is generated
- **WHEN** the command contract is generated
- **THEN** create and clone option metadata and semantic policy contain canonical `--base` and repeatable `--repo-base` behavior
- **AND** generated artifacts are byte-stable when sources are unchanged
