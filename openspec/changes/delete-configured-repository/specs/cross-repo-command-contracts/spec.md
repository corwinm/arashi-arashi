## ADDED Requirements

### Requirement: Command contracts publish configured repository deletion policy

The canonical CLI-derived command contract SHALL register `delete`, its exact configured-repository argument, `-f`/`--force`, `-n`/`--dry-run`, and `-j`/`--json`, configured-only support, exact error/confirmation precedence and exits, structural-versus-overridable safety boundaries, closed JSON plan/result/item/phase/retry vocabulary, receipt-backed retry classification, completion candidate class, and docs/skills/VS Code companion decisions. The checked-in CLI command artifact SHALL remain deterministically generated and freshness-checked; executable-distribution identity SHALL remain unchanged because adding a Commander command does not add an executable.

#### Scenario: Delete contract is generated

- **WHEN** CLI command-contract generation runs
- **THEN** `delete` appears once with the exact argument/options/aliases and typed semantic policy
- **AND** the policy distinguishes dry-run, JSON non-interactivity, force implications, stable error/ledger vocabulary, and standalone rejection

#### Scenario: Remove contract remains unchanged in meaning

- **WHEN** delete metadata is added
- **THEN** remove remains classified as branch/worktree removal
- **AND** no compatibility mapping aliases remove to configured repository deletion

#### Scenario: Generated artifact is stale

- **WHEN** delete registration or typed policy changes without regenerating the checked-in contract/completion artifacts
- **THEN** repository-local freshness validation fails with the owning source and difference

### Requirement: Companion coverage for delete is explicit and enforced

Coordinated validation SHALL require a dedicated CLI command-list page, CLI README/help coverage, canonical website command page and workflow/index coverage, generated agent-readable exports, and structured packaged-skill guidance for delete. It SHALL require an explicit reasoned VS Code exclusion unless an approved editor integration is separately introduced.

#### Scenario: All companion surfaces agree

- **WHEN** CLI, docs, exports, skills, and meta validation describe delete
- **THEN** they agree on exact-key targeting, configured-only scope, preview-before-force workflow, non-overridable structural safety, data-loss disclosure, preserved global/shared/ignore state, partial failure/retry honesty, and remove distinction
- **AND** validation exits successfully

#### Scenario: Dedicated CLI command page is missing

- **WHEN** delete is registered without its dedicated CLI command-list documentation page or command index entry
- **THEN** coordinated validation reports the missing canonical surface and exits unsuccessfully

#### Scenario: Website export is stale

- **WHEN** canonical delete documentation changes without regenerated Markdown/LLM exports
- **THEN** docs freshness/semantic validation identifies the stale export and exits unsuccessfully

#### Scenario: Packaged skill drifts

- **WHEN** authored or extracted packaged guidance recommends manual config/path deletion, broad hook globs, force as a structural bypass, or `aw remove` for repository deletion
- **THEN** source/package semantic validation reports the owning reference and exits unsuccessfully

#### Scenario: VS Code parity decision is inspected

- **WHEN** coordinated command coverage validates delete
- **THEN** the contract records delete as intentionally excluded from VS Code with a non-empty destructive-UI rationale
- **AND** missing both a mapping and exclusion remains an error

### Requirement: Coordinated deletion semantics use stable aggregate validation

Focused delete semantic checkers SHALL be directly executable and registered through the existing fail-closed CLI/docs/skills/meta aggregates. Source and extracted-package checks SHALL compare normalized command/output/safety policy rather than independent phrase presence. Existing aggregate workflow topology SHALL be reused when triggers, permissions, runtime, and artifact assembly do not change.

#### Scenario: Focused checker is registered

- **WHEN** a delete semantic checker is added to an owning repository
- **THEN** its existing stable aggregate executes it in source and package modes where applicable
- **AND** no feature-specific workflow step is required

#### Scenario: Deliberate semantic mismatch proves enforcement

- **WHEN** an out-of-repository fixture changes one exact-key, confirmation, force, structural safety, JSON field/vocabulary, preservation, or retry semantic
- **THEN** the owning focused checker and coordinated aggregate fail with a stable source-specific diagnostic
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Local and CI stage sets remain aligned

- **WHEN** maintainers run the documented coordinated validation or authoritative CI runs
- **THEN** both paths execute the same stable docs source/export, skills source/extracted-package, CLI contract, and meta aggregate stages exactly once according to existing prevalidated-child policy
