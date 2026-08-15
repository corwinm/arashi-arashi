## ADDED Requirements

### Requirement: Authoritative coordinated validation composes stable child aggregates
The meta-repository SHALL compose stable repository-owned semantic validation entrypoints for docs and skills with the coordinated contract checker. The authoritative workflow SHALL NOT name feature-specific child checker scripts when the workflow topology, permissions, runtime, trigger paths, and artifact assembly are unchanged.

#### Scenario: Registered child checker is added
- **WHEN** a docs or skills repository adds a maintained checker to its fail-closed registry
- **THEN** the authoritative coordinated workflow executes that checker through the stable child aggregate
- **AND** no feature-specific meta workflow step is required

#### Scenario: Coordinated validation runs locally and in CI
- **WHEN** maintainers run the documented coordinated validation path or authoritative CI executes it
- **THEN** both paths use the stable docs semantic aggregate, skills source aggregate, skills extracted-package aggregate, and coordinated contract aggregate
- **AND** CI owns each child stage exactly once, uses explicit skip mode only to avoid rerunning those already-proven stages inside the meta aggregate, and reports the exact checked child revisions

#### Scenario: Stable child stage is omitted
- **WHEN** workflow-composition validation removes or bypasses one required stable child aggregate or the coordinated aggregate
- **THEN** validation reports the missing stage by repository and mode
- **AND** exits unsuccessfully

#### Scenario: Coordinated trigger inputs remain reachable
- **WHEN** the authoritative meta workflow is migrated to stable child aggregates
- **THEN** its pull-request path filters continue to include meta checker/test/config/workflow inputs
- **AND** include each child repository's checker, manifest or runner, canonical guidance, generated-contract, package-boundary, and workflow inputs used by coordinated validation

### Requirement: Coordinated contract checkers use fail-closed registration
The meta-repository SHALL register every maintained coordinated checker as a unique repository-relative identity matching `scripts/check-<basename>-contracts.ts`, with lowercase ASCII alphanumeric basenames and internal hyphens in ascending bytewise UTF-8 order. The registry SHALL reject omitted, stale, duplicate, malformed, escaping, symlinked, or unsorted entries. Both `contracts:check` and `contracts:check:ci` SHALL execute the same registry-backed meta aggregate and SHALL run registration before any coordinated checker; CI skip mode SHALL NOT bypass registration.

#### Scenario: Maintained coordinated checker is omitted
- **WHEN** a maintained `scripts/check-*-contracts.ts` entrypoint exists outside the explicit registry
- **THEN** local and CI meta aggregates identify the omitted checker during preflight
- **AND** exit unsuccessfully before executing coordinated checkers

#### Scenario: Coordinated registry is invalid
- **WHEN** the registry contains a missing, duplicate, malformed, escaping, symlinked, or noncanonically ordered identity
- **THEN** local and CI meta aggregates report every registration defect
- **AND** exit unsuccessfully before coordinated checker execution

#### Scenario: Local and CI modes consume one registry
- **WHEN** maintainers run `contracts:check` or CI runs `contracts:check:ci`
- **THEN** both modes execute the same registered coordinated checker set in deterministic order
- **AND** only child-aggregate execution policy differs between full local and prevalidated CI modes

### Requirement: Aggregate reachability is proven executably without repeated fixture fan-out
The meta-repository SHALL include dedicated acceptance tests proving that registered focused docs and skills checkers execute through their stable aggregates and that child failures propagate. Ordinary coordinated semantic mutation fixtures MAY skip repeated focused subprocess execution only after those dedicated acceptance tests and authoritative child aggregate stages remain reachable.

#### Scenario: Registered focused checker fails through aggregate
- **WHEN** a dedicated fixture replaces or mutates one registered checker so it exits unsuccessfully
- **THEN** the owning aggregate exits unsuccessfully
- **AND** the diagnostic identifies the failing checker

#### Scenario: Ordinary contract mutation fixture runs
- **WHEN** a fixture is testing normalized cross-repository semantics rather than child aggregate execution
- **THEN** it may use the explicit CI skip mode for repeated focused subprocesses
- **AND** still validates the coordinated semantic mismatch

#### Scenario: Skip mode becomes the only execution path
- **WHEN** workflow or test mutation removes all executable source or package aggregate acceptance while retaining only skipped focused execution
- **THEN** workflow-reachability or aggregate acceptance validation fails
- **AND** the coordinated gate cannot pass

## MODIFIED Requirements

### Requirement: Reproducible local and CI execution
The meta-repository SHALL document how to regenerate contract inputs and execute a complete coordinated validation path locally. The documented local path and authoritative CI SHALL contain the same semantic stage set: docs aggregate, skills source aggregate, canonical extracted-package aggregate, and registry-backed meta aggregate. CI SHALL check out all required child repositories at explicit revisions, execute each child aggregate once, and use the meta aggregate's explicit prevalidated-child mode only to avoid duplicate execution. Automated alignment validation SHALL fail if documentation, package scripts or coordinator, and authoritative workflow omit, duplicate, or rename a stable stage inconsistently.

#### Scenario: Maintainer updates a command
- **WHEN** a maintainer follows the documented update workflow
- **THEN** the documentation identifies how to regenerate CLI metadata, update companion policy or coverage, create the canonical skills archive, and run repository-local and complete cross-repository checks
- **AND** the documented semantic stage set matches authoritative CI

#### Scenario: Cross-repository CI runs
- **WHEN** the authoritative workflow validates the contract
- **THEN** it reports checked repository revisions and executes the same deterministic semantic stage set available locally
- **AND** docs generation occurs only inside the docs aggregate while child aggregates and the meta aggregate each execute exactly once

#### Scenario: Local and CI stage sets drift
- **WHEN** documentation, a package script or coordinator, or authoritative workflow omits, duplicates, or changes one stable semantic stage without updating the others
- **THEN** alignment validation reports the differing owner and stage
- **AND** exits unsuccessfully

### Requirement: Publish launch-disposition option policy semantically
The canonical CLI command contract SHALL publish typed `--tab` option policy for switch and create, and coordinated validation SHALL compare its normalized semantics with canonical docs, generated agent-readable exports, and packaged skill guidance rather than checking option presence alone.

#### Scenario: Switch tab policy is generated
- **WHEN** the CLI command contract is generated after registering `switch --tab`
- **THEN** its option policy records non-persisted status, switch JSON mode and guard precedence, compatibility with `--no-cd`, `--no-default-launch`, and explicit launcher selectors, conflict with `--cd`, and launcher-matrix support resolution

#### Scenario: Create tab policy is generated
- **WHEN** the CLI command contract is generated after registering `create --tab`
- **THEN** its option policy records non-persisted status, implication of launch and switch, compatibility and precedence with `--no-launch` and `--no-switch`, create JSON mode and guard precedence, dry-run preview behavior, and launcher-matrix support resolution

#### Scenario: Configuration contracts remain unchanged
- **WHEN** command and configuration contracts are validated together
- **THEN** `--tab` exists only in command option policy
- **AND** switch and create configuration contracts expose no persisted disposition field or `tab` mode

#### Scenario: Command contract schema represents options without environment prerequisites
- **WHEN** `--tab` semantic policy is serialized
- **THEN** the command-contract schema version is incremented
- **AND** the explicit-option policy shape allows an omitted environment prerequisite while preserving the existing non-empty environment contract for `--tmux`
- **AND** no synthetic environment variable is assigned to `--tab`

#### Scenario: Companion guidance agrees with canonical policy
- **WHEN** the meta cross-repository checker validates launch-disposition guidance
- **THEN** it compares the default disposition, CLI-only status, command-specific implications/conflicts, JSON restrictions, unsupported no-fallback behavior, and managed-equivalent vocabulary against the canonical command contract

#### Scenario: Deliberate semantic mismatch is rejected
- **WHEN** an out-of-repository fixture removes or contradicts one required `--tab` semantic field in docs or skills
- **THEN** the focused checker exits unsuccessfully with an owning-source diagnostic
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Focused validation is reachable from CI
- **WHEN** repository self-tests inspect the applicable workflow and semantic registries
- **THEN** they confirm that CI invokes the stable source and extracted-package aggregates
- **AND** dedicated executable acceptance proves the registered launch-disposition checker runs through those aggregates

### Requirement: Coordinated validation enforces completion synchronization
The meta-repository checker SHALL compare canonical completion policy and generated artifacts with maintained README and shell-command documentation, generated agent-readable exports, and packaged Arashi skill guidance. The checker SHALL distinguish intentional VS Code exclusion from missing CLI, docs, or skill coverage for the `completion` command.

#### Scenario: Completion surfaces agree
- **WHEN** the CLI contract, generated shell artifacts, maintained docs, generated exports, and packaged skill guidance describe the same supported shells, command shape, activation syntax, wrapper separation, safety boundaries, and dynamic candidate classes
- **THEN** coordinated validation exits successfully

#### Scenario: Completion guidance drifts
- **WHEN** a companion surface advertises a different shell set, public command path, installation behavior, candidate scope, or output/safety contract
- **THEN** coordinated validation reports the owning source and semantic mismatch
- **AND** exits unsuccessfully

#### Scenario: Deliberate completion mismatch proves enforcement
- **WHEN** an out-of-repository fixture removes or changes one required completion semantic or generated artifact identity
- **THEN** the focused checker exits unsuccessfully for that mismatch
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Completion validation is reachable from CI
- **WHEN** repository self-tests inspect the authoritative coordinated workflow and semantic registries
- **THEN** they confirm CI generates or verifies the CLI completion artifacts and invokes the stable docs and skills aggregates
- **AND** dedicated executable acceptance proves the registered completion checkers run through those aggregates

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
- **WHEN** repository self-tests inspect the applicable workflow and semantic registries
- **THEN** they confirm CI invokes the stable docs and skills aggregates and any required contract generation before comparison
- **AND** dedicated executable acceptance proves the registered create-base checkers run through those aggregates
