## RENAMED Requirements

- FROM: `### Requirement: Child repositories SHALL invoke authoritative cross-repository validation`
- TO: `### Requirement: Child repositories SHALL retain local gates without automatic integration callers`

## MODIFIED Requirements

### Requirement: Repository-local consistency gates

The CLI repository SHALL validate command-contract generation and freshness without requiring sibling repositories, and the VS Code repository SHALL validate consistency among contributed commands, activation events, internal command IDs, and runtime handlers. All five children SHALL retain their repository-local quality and release/package validation. Automatic meta pull-request and main-push CI SHALL run checker tests, typecheck and formatting without live child checkouts or child network reads, using tracked deterministic fixtures and real meta checkers. Tests requiring actual child implementations SHALL remain in an explicit manual integration suite and SHALL fail, not skip, when required children are absent.

#### Scenario: VS Code manifest and handlers diverge

- **WHEN** a contributed command lacks a matching activation event, command ID, or runtime handler, or a runtime command lacks its required manifest declaration
- **THEN** the VS Code test reports the mismatch and exits unsuccessfully

#### Scenario: Standalone CLI validation runs

- **WHEN** CLI CI runs in a checkout without docs, skills, or VS Code siblings
- **THEN** CLI contract unit tests and artifact freshness validation still complete independently

#### Scenario: Meta checkout has no children

- **WHEN** automatic meta-local CI runs in a clean checkout without `repos/`
- **THEN** all default checker tests, typecheck and formatting execute without fetching children
- **AND** fixture-based positive and negative checker coverage remains active

#### Scenario: Child implementation acceptance is partitioned

- **WHEN** a test requires actual child aggregate, archive or guidance implementations
- **THEN** it remains executable in the explicit manual integration suite after the revision-evidence gate
- **AND** missing children fail that suite instead of silently skipping coverage


### Requirement: Reproducible local and CI execution

The meta-repository SHALL document how to regenerate contract inputs and execute a complete coordinated validation path locally. The documented local path and authoritative manual integration CI SHALL contain the same semantic stage set: docs aggregate, skills source aggregate, canonical extracted-package aggregate, and registry-backed meta aggregate. Manual integration CI SHALL check out all required child repositories at explicit revisions, execute each child aggregate once, and use the meta aggregate's explicit prevalidated-child mode only to avoid duplicate execution. Automated alignment validation SHALL fail if documentation, package scripts or coordinator, and authoritative workflow omit, duplicate, or rename a stable stage inconsistently.

#### Scenario: Maintainer updates a command

- **WHEN** a maintainer follows the documented update workflow
- **THEN** the documentation identifies how to regenerate CLI metadata, update companion policy or coverage, create the canonical skills archive, and run repository-local and complete cross-repository checks
- **AND** the documented semantic stage set matches authoritative manual integration CI

#### Scenario: Cross-repository CI runs

- **WHEN** the authoritative workflow validates the contract
- **THEN** it reports checked repository revisions and executes the same deterministic semantic stage set available locally
- **AND** docs generation occurs only inside the docs aggregate while child aggregates and the meta aggregate each execute exactly once

#### Scenario: Local and CI stage sets drift

- **WHEN** documentation, a package script or coordinator, or authoritative workflow omits, duplicates, or changes one stable semantic stage without updating the others
- **THEN** alignment validation reports the differing owner and stage
- **AND** exits unsuccessfully

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

#### Scenario: Checker changes retain automatic local coverage

- **WHEN** a meta checker, test, registry, configuration, workflow or documentation changes in a pull request or on main
- **THEN** automatic meta-local tests, typecheck and formatting remain reachable
- **AND** the cross-repository semantic stage set runs only on explicit manual dispatch

### Requirement: Child repositories SHALL retain local gates without automatic integration callers

All five participating children SHALL remove automatic cross-repository integration callers and invocation-only helpers/configuration, caller-enforcement tests and stale maintained references. Useful structured contracts, repository-local semantic validators, retained fixtures and release/package checks SHALL remain. Integration SHALL NOT be a required merge status in any participating repository; unrelated protections SHALL remain unchanged. Every child SHALL have a reviewed cleanup diff or an explicit no-change finding.

#### Scenario: Child pull request or main push runs

- **WHEN** a child pull request is opened/updated or a commit reaches its main branch
- **THEN** ordinary child-local quality/release workflows retain their intended coverage
- **AND** no workflow automatically invokes the cross-repository integration suite

#### Scenario: Required-status and caller retirement is staged

- **WHEN** maintainers roll out the migration
- **THEN** they inventory applicable repository and organization protections and remove only authorized obsolete integration requirements with exact-target readback before deleting callers
- **AND** all five child caller deletions land before the meta reusable interface is removed
- **AND** an unchangeable inherited requirement stops rollout rather than stranding PRs or bypassing protections

#### Scenario: Cleanup encounters shared contract inputs

- **WHEN** an artifact serves both integration and retained local or release checks
- **THEN** consumer tracing preserves it and its needed fixtures
- **AND** final audits find no active caller or required-status references to retired wiring

### Requirement: Cross-repository CI SHALL bind validation to immutable revisions

Before repository checkout or semantic execution, authoritative integration CI SHALL accept only a `workflow_dispatch` in `corwinm/arashi-arashi` on `refs/heads/main` with the executing workflow repository/ref bound to that upstream main invocation and its full lowercase 40-character workflow commit SHA equal to the dispatch event SHA. The meta source SHALL be that upstream repository at the dispatch SHA, not a fresh main lookup. CI SHALL resolve each of the five fixed upstream child `refs/heads/main` refs exactly once to a validated canonical source and full lowercase 40-character commit SHA before checkout. Every checkout SHALL use only its resolved source/SHA with credentials not persisted. Branches, tags, default checkout, PR merge refs, matching branches, forks and proposed revision overrides SHALL NOT be checkout selections. The workflow SHALL use read-only contents permission without inherited secrets, release credentials or write tokens.

#### Scenario: Manual main snapshot is resolved

- **WHEN** a valid upstream main dispatch starts
- **THEN** meta resolves to the equal workflow/event SHA and each child resolves once from its upstream main
- **AND** subsequent main movement does not change any selected checkout SHA
- **AND** the result describes that recorded snapshot, not atomic or continually fresh main state

#### Scenario: Invocation or resolution is invalid

- **WHEN** the event is not dispatch, the ref is non-main, the workflow repository/ref is wrong, workflow/event SHA is malformed or mismatched, a child source is unexpected, or child main resolution fails or yields a malformed SHA
- **THEN** validation fails before repository checkout and semantic execution
- **AND** it reports inability to validate without branch fallback or fabricated evidence

#### Scenario: Workflow is rerun

- **WHEN** a historical run is rerun
- **THEN** its coordinator remains bound to its original workflow/event SHA
- **AND** a fresh coordinator assessment requires a new main dispatch

### Requirement: Cross-repository CI SHALL publish durable complete revision evidence

Authoritative integration CI SHALL generate a schema-versioned deterministic JSON manifest after verifying all checkout HEADs equal their resolved SHAs. It SHALL record the dispatch event/ref, coordinator workflow repository/ref/SHA, triggering meta logical/source repository and revision, and exactly one logical/source/SHA entry per repository in canonical order: meta, CLI, docs, skills, VS Code, presentation. It SHALL validate completeness and attribution, append the JSON to the job summary, upload identical JSON under `cross-repo-revisions` with missing files treated as errors, require a non-empty valid SHA-256 artifact-archive digest and append the digest with its archive meaning to the summary. This entire evidence gate SHALL precede semantic execution.

#### Scenario: Complete evidence is published

- **WHEN** the evidence gate succeeds
- **THEN** all six repository entries have full SHAs and correct canonical attribution and order
- **AND** dispatch/coordinator provenance matches the invocation
- **AND** identical JSON is available in summary and artifact with the identified archive digest

#### Scenario: Semantic validation fails after evidence publication

- **WHEN** a later semantic stage detects drift
- **THEN** the run remains unsuccessful and its already-published revision artifact remains available
- **AND** the report identifies drift without converting the run into a merge requirement

#### Scenario: Evidence is invalid or unavailable

- **WHEN** a checkout differs from its resolved SHA, a repository entry is missing/extra/duplicated/out of order, attribution or provenance differs, a SHA is malformed, the manifest is missing, upload fails, the digest is missing/malformed, or evidence is log-only
- **THEN** validation fails before semantic execution and reports inability to validate
- **AND** partial resolution or failed checkouts are never represented as complete checked revision evidence

### Requirement: Direct meta validation SHALL remain available

The authoritative integration workflow SHALL expose only manual dispatch, with the main-only invocation and immutable evidence policy above, and SHALL NOT expose reusable calls, revision-selection inputs, automatic PR/push triggers or schedules. Automatic meta-local tests/typecheck/formatting SHALL remain separate. Maintainers SHALL dispatch after coordinated changes land and on demand for diagnosis, inspect the completed run and revision artifact, and report actual semantic drift separately from execution/infrastructure inability to validate. Either failure SHALL remain unsuccessful without requiring the integration status for merges. No status fan-out, notification service, automatic merge, release or cleanup SHALL be introduced.

#### Scenario: Maintainer assesses merged sources

- **WHEN** a maintainer dispatches the workflow on upstream main after coordinated changes land or for diagnosis
- **THEN** the same complete semantic and package stage set validates exact main revisions
- **AND** delivery evidence records the resulting run and artifact rather than treating dispatch acceptance as successful validation

#### Scenario: Meta pull request or main push occurs

- **WHEN** meta receives a pull request update or main push
- **THEN** automatic meta-local quality checks run without live children
- **AND** cross-repository integration does not run automatically

#### Scenario: Manual assessment fails

- **WHEN** semantic drift, build/setup failure or infrastructure failure occurs
- **THEN** the workflow preserves a failed outcome and reports known failure categories without misclassifying an unknown nonzero exit as proven drift
- **AND** the advisory result does not automatically block merges or cause merge, release or cleanup actions
