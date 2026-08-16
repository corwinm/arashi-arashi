## ADDED Requirements

### Requirement: CLI contracts publish normalized inline-hook configuration semantics
The CLI SHALL generate deterministic `contracts/inline-lifecycle-hooks.json` with `schemaVersion: 1` from `scripts/contracts/inline-lifecycle-hooks.ts`. Its ordered payload SHALL publish workspace config version `1.0.0`, root/repository ownership paths, lifecycle order `pre-create`, `post-create`, `pre-remove`, `post-remove`, string-as-Bash shorthand, interpreter-map keys, POSIX/Windows selection and executable lookup policy, closed-key validation, exact create/remove logical naming, same-location ambiguity codes/reasons, exact current option ownership, command-specific dry-run support, file-only standalone/user-global boundary, and public non-secret source fields. The existing `contracts/cli-commands.json` SHALL remain the command/option artifact at schema version `7` and MUST NOT be repurposed as the configuration-semantics contract. Generated schema/contract artifacts SHALL pass repository-local freshness validation.

#### Scenario: CLI schema and contract agree
- **WHEN** inline-hook configuration artifacts are generated
- **THEN** both represent the same accepted locations, value normalization, interpreter vocabulary/order, validation, and source metadata
- **AND** config persistence tests prove those values are retained

#### Scenario: Contract versions remain exact
- **WHEN** inline-hook artifacts are generated from unchanged source
- **THEN** `contracts/inline-lifecycle-hooks.json` remains byte-stable at schema version `1`, config version `1.0.0`
- **AND** the command contract remains schema version `7`

#### Scenario: Invalid contract shape is introduced
- **WHEN** schema or typed contract admits a dynamic lifecycle key, unsupported interpreter, empty value, or ownership location absent from runtime
- **THEN** repository-local validation fails before release

### Requirement: Coordinated validation enforces inline-hook semantic parity
The meta-repository SHALL register a focused inline-hook coordinated checker through the existing fail-closed `contracts:check`/`contracts:check:ci` aggregate. The checker SHALL compare normalized CLI schema/contract semantics with CLI docs, canonical website guidance, generated agent-readable exports, authored skills, and extracted-package skills for ownership, lifecycle set, shorthand, interpreters/order/lookup, ambiguity classifications, create/remove parity, exact option ownership, input/timeout/JSON-owned quiet behavior, command-specific JSON/dry-run/outcomes, standalone/file compatibility, no-disclosure, and security guidance. It SHALL report stable owning-surface diagnostics and MUST NOT inspect or print real configured snippet values.

#### Scenario: All companion surfaces agree
- **WHEN** CLI contracts, docs/exports, and authored/extracted skill guidance publish the same inline-hook semantics
- **THEN** focused and aggregate coordinated validation succeed

#### Scenario: Controlled mismatch proves enforcement
- **WHEN** an out-of-repository fixture changes one ownership path, lifecycle, shorthand, interpreter order, ambiguity, parity, automation, file-only, or secrecy rule
- **THEN** the focused checker fails with a stable source-specific mismatch
- **AND** real coordinated worktrees remain unchanged

### Requirement: Stable child aggregates remain the only semantic workflow stages
Docs inline guidance SHALL be registered in the existing docs semantic aggregate, and authored/extracted skills guidance SHALL be registered in the existing skills source/package aggregates. The authoritative coordinated workflow SHALL execute docs, skills source, skills canonical package, and meta coordinated aggregates once each and SHALL NOT name feature-specific inline checker scripts unless a pre-implementation reachability RED proves existing topology insufficient.

#### Scenario: Inline checker registration is added
- **WHEN** each repository registers its focused inline checker without changing runtime, permissions, triggers, package assembly, or job topology
- **THEN** existing local and CI aggregate entrypoints execute it
- **AND** workflow YAML remains unchanged

#### Scenario: Aggregate reachability is broken
- **WHEN** registration, workflow composition, or package extraction bypasses one required focused checker
- **THEN** fail-closed registration or executable aggregate acceptance fails before merge

### Requirement: Coordinated inline-hook delivery remains child-first and archive-safe
CLI, docs, and skills changes SHALL be delivered as separate child-repository PRs with non-closing issue references and explicit cross-links. The existing proposal/meta PR SHALL remain open, SHALL own the registered meta checker and OpenSpec artifacts, and SHALL be merged last. Child PRs MUST be green and merged before OpenSpec archive/sync; final archive tasks MUST be acyclic and SHALL place the issue-closing reference only on the final meta PR.

#### Scenario: Child delivery completes
- **WHEN** implementation is ready for closeout
- **THEN** separate CLI, docs, and skills PRs have exact-head validation and are merged in dependency-safe order
- **AND** no child PR closes issue #271

#### Scenario: Change is archived
- **WHEN** every pre-archive implementation, native-platform, package, coordinated, review, and merge gate is complete
- **THEN** the existing meta branch archives/syncs the change, validates synced specs, updates the meta PR with the sole closing reference, and merges last
- **AND** no task requires archive itself to be complete before archive may begin
