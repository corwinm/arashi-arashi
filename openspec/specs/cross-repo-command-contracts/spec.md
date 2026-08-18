# cross-repo-command-contracts Specification

## Purpose

Define the canonical CLI-derived command contract and the deterministic checks that keep documentation, skills guidance, and VS Code command integrations aligned across Arashi repositories.

## Requirements

### Requirement: CLI-derived command contract

The CLI repository SHALL generate a deterministic command contract from registered commands plus typed semantic policy, including the shared base-policy configuration paths, migration, option relationships, selectors, precedence, command scope, resolution/reporting rules, and stable source vocabulary.

#### Scenario: Base option metadata is generated

- **WHEN** the command contract is generated
- **THEN** create and clone option metadata and semantic policy contain canonical `--base` and repeatable `--repo-base` behavior
- **AND** generated artifacts are byte-stable when sources are unchanged

### Requirement: Versioned deterministic contract artifact

The CLI repository SHALL generate a versioned machine-readable command contract deterministically and SHALL provide a freshness check that fails when the checked-in artifact differs from current registration or semantic metadata.

#### Scenario: Contract is current

- **WHEN** the freshness check runs without command or policy drift
- **THEN** it exits successfully without modifying the working tree

#### Scenario: Contract is stale

- **WHEN** registration, options, or semantic metadata changed without regenerating the artifact
- **THEN** the freshness check reports the generated difference and exits unsuccessfully

### Requirement: Explicit semantic support classifications

The command contract SHALL classify JSON support and docs, skills, and VS Code expectations for each relevant command path. Conditional, unsupported, represented, or excluded classifications MUST include a non-empty reason when their meaning is not self-evident from structural metadata.

#### Scenario: Intentional companion omission

- **WHEN** a command is intentionally omitted from a companion surface
- **THEN** the contract records the omission separately from missing coverage and includes an explicit reason

#### Scenario: Unreasoned exclusion

- **WHEN** a policy marks a command excluded or conditionally supported without the required reason
- **THEN** contract validation reports invalid policy and exits unsuccessfully

### Requirement: Cross-repository drift validation

The meta-repository SHALL provide one deterministic validation command that compares the canonical CLI command and configuration contracts with docs command pages and index entries, generated agent-readable exports, structured skills coverage and packaged guidance, and VS Code CLI mappings. For create launch configuration, the checker SHALL compare normalized semantic values derived from the CLI schema/contract rather than only checking field presence or parallel hardcoded labels. For SSH host alias remotes, the checker SHALL compare CLI help and generated command metadata plus supported URL forms, exact-preservation behavior, SSH-configuration ownership, protocol-conversion safety, and machine-local portability guidance across owning companion surfaces.

#### Scenario: All companion surfaces agree

- **WHEN** every required companion surface is present or explicitly excluded, no stale reference exists, create launch semantics match the canonical CLI contract, and SSH alias guidance matches the canonical preservation contract
- **THEN** the checker exits successfully and reports intentional exclusions separately from errors

#### Scenario: Required docs coverage is missing

- **WHEN** a CLI command requiring documentation lacks its canonical command page or command-index entry
- **THEN** the checker reports the missing docs coverage with a stable diagnostic and exits unsuccessfully

#### Scenario: Skills reference is stale

- **WHEN** structured skills coverage or a command-shaped skills reference names a command absent from the canonical contract
- **THEN** the checker reports the stale reference with its source path and exits unsuccessfully

#### Scenario: VS Code parity decision is missing

- **WHEN** a CLI command has neither a VS Code mapping nor an explicit reasoned representation or exclusion
- **THEN** the checker reports an unresolved parity gap and exits unsuccessfully

#### Scenario: Canonical create launch contract is compared semantically

- **WHEN** the cross-repository checker validates create configuration guidance
- **THEN** it derives or verifies canonical field `defaults.create.launch`, modes `none`, `auto`, `sesh`, and `herdr`, absent behavior `none`, independent boolean `switch`, launch-implies-switch behavior, supported editor hosts, legacy fields, and accepted/rejected migration classifications
- **AND** it compares those normalized values with canonical docs, generated exports, and packaged skill contract records

#### Scenario: Create launch vocabulary drifts

- **WHEN** a companion surface advertises a different canonical field, mode set, absent behavior, switch relationship, editor-host scope, legacy field, or migration classification than the CLI contract
- **THEN** the checker reports the exact source and semantic mismatch with a stable diagnostic
- **AND** exits unsuccessfully

#### Scenario: Controlled semantic mismatch proves enforcement

- **WHEN** validation runs against an out-of-repository fixture containing one deliberate create launch semantic mismatch
- **THEN** the checker exits unsuccessfully for that mismatch
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: SSH alias guidance agrees

- **WHEN** cross-repository validation inspects CLI help, the generated CLI command contract, canonical add and clone docs, generated agent-readable exports, and packaged skill guidance
- **THEN** each owning surface recognizes `[user@]host:path` with an optional user and `ssh://[user@]host/path`
- **AND** each states that configured SSH URLs remain exact, SSH-to-HTTPS conversion is not automatic, and Arashi does not manage SSH configuration
- **AND** each identifies aliases as machine-local and recommends canonical remotes with machine-global Git `insteadOf` rules when portability matters

#### Scenario: SSH alias semantic drift is rejected

- **WHEN** an out-of-repository checker fixture removes or contradicts one required SSH alias form, preservation rule, ownership boundary, conversion boundary, or portability rule
- **THEN** the focused checker exits unsuccessfully with a stable diagnostic naming the owning source and mismatched semantic
- **AND** the real coordinated worktrees remain unchanged

### Requirement: Distinguish extension-only commands

The cross-repository policy SHALL distinguish VS Code commands backed by Arashi CLI command paths from extension-only navigation and panel commands.

#### Scenario: Extension-only command is declared

- **WHEN** a contributed command performs editor navigation or panel behavior without invoking a top-level CLI command
- **THEN** the checker accepts it as extension-only and does not report it as a stale CLI mapping

#### Scenario: CLI mapping references a removed command

- **WHEN** a VS Code CLI-backed mapping references a command absent from the canonical contract
- **THEN** the checker reports an invalid mapping and exits unsuccessfully

### Requirement: Repository-local consistency gates

The CLI repository SHALL validate command-contract generation and freshness without requiring sibling repositories, and the VS Code repository SHALL validate consistency among contributed commands, activation events, internal command IDs, and runtime handlers.

#### Scenario: VS Code manifest and handlers diverge

- **WHEN** a contributed command lacks a matching activation event, command ID, or runtime handler, or a runtime command lacks its required manifest declaration
- **THEN** the VS Code test reports the mismatch and exits unsuccessfully

#### Scenario: Standalone CLI validation runs

- **WHEN** CLI CI runs in a checkout without docs, skills, or VS Code siblings
- **THEN** CLI contract unit tests and artifact freshness validation still complete independently

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

### Requirement: Command contracts classify standalone workspace support

The canonical command contract SHALL classify whether each user-facing command supports implicit standalone workspaces, requires configured workspace state, or has conditional standalone behavior, with a non-empty reason for non-obvious classifications.

#### Scenario: Zero-config init option is registered

- **WHEN** `init --zero-config` is added or changed
- **THEN** the generated CLI contract includes the option, its dry-run and JSON support, and incompatible-option policy metadata needed by companion surfaces

#### Scenario: Single-repository lifecycle command is audited

- **WHEN** a command such as create, list, status, switch, remove, prune, doctor, move, or handoff supports implicit mode
- **THEN** its contract records standalone support and required docs/skills coverage

#### Scenario: Coordination-only command is audited

- **WHEN** a command such as add, clone, or sync requires persisted child-repository configuration
- **THEN** its contract records configured-only behavior and a reason
- **AND** companion validation can distinguish intentional rejection from missing implementation

#### Scenario: Companion guidance drifts

- **WHEN** CLI standalone classifications, docs command pages/workflow links, or structured skill coverage disagree
- **THEN** repository-local or cross-repository validation reports the exact stale or missing surface and exits unsuccessfully

### Requirement: Tmux launch contracts remain synchronized across repositories

The system SHALL keep canonical CLI options, command help, user documentation, and packaged Arashi skill guidance aligned for explicit plain tmux selection, while preserving the existing configuration contract. The source-derived CLI contract SHALL expose typed option-policy metadata for tmux conflicts, prerequisites, create implications, JSON restrictions, and non-persisted configuration status, and the meta-repository checker SHALL enforce those semantics.

#### Scenario: CLI help exposes tmux consistently

- **WHEN** the command contract is generated or checked
- **THEN** `arashi switch --help` documents `--tmux` as forced plain tmux launch and `arashi create --help` documents `--tmux` as implying post-create launch

#### Scenario: Configuration contracts remain unchanged

- **WHEN** configuration schema and switch-config contract checks run
- **THEN** create `LaunchMode` and unified `SwitchMode` enums remain unchanged and do not include `tmux`

#### Scenario: Docs and skill contract checks use current tmux syntax

- **WHEN** cross-repository semantic contract checks inspect canonical docs and packaged skill references
- **THEN** switch/create examples, conflict sets, prerequisites, and the per-invocation-only schema decision agree with the CLI and do not describe explicit plain tmux as automatic-only

#### Scenario: Tmux option-policy metadata is generated and enforced

- **WHEN** the CLI command contract is generated after registering switch/create `--tmux`
- **THEN** its typed option policy represents each command's conflict set, `TMUX` prerequisite, create launch/switch implication, JSON restriction, and non-persisted status
- **AND** the contract schema version changes if required by the serialized shape

#### Scenario: Deliberate semantic drift fails the meta checker

- **WHEN** a checker fixture removes or changes one required tmux option-policy rule, or companion guidance contradicts that rule
- **THEN** meta-repository contract validation fails with a diagnostic identifying the owning source and mismatched tmux semantic

### Requirement: Kitty launch guidance remains synchronized across repositories

The system SHALL keep canonical CLI behavior, maintained documentation, generated agent-readable guidance, and packaged Arashi skill guidance aligned for automatic managed Kitty sessions, and the meta-repository semantic checker SHALL enforce the key runtime and ownership boundaries.

#### Scenario: Canonical Kitty guidance agrees

- **WHEN** cross-repository contract validation runs
- **THEN** canonical docs and packaged skill guidance agree that Kitty 0.43+ and permitted remote control are prerequisites
- **AND** they describe exact worktree reuse, automatic precedence, live-only sessions, fail-closed managed errors, and no remove-time Kitty mutation consistently

#### Scenario: Kitty remains auto-detected only

- **WHEN** contract validation compares CLI options/configuration with companion guidance
- **THEN** no canonical surface advertises an explicit `--kitty` flag or persistent `kitty` launch mode for this slice

#### Scenario: Deliberate Kitty semantic drift fails validation

- **WHEN** an out-of-repository fixture changes or removes one required Kitty version, remote-control, reuse, precedence, persistence, or remove-ownership semantic
- **THEN** the checker exits unsuccessfully with a diagnostic naming the owning source and mismatched Kitty contract
- **AND** the real coordinated worktrees remain unchanged

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

### Requirement: Command contracts publish normalized option conventions

The canonical CLI command contract SHALL publish structural and typed semantic metadata for command-local aliases, selector input forms, canonical-to-compatibility mappings, deprecation state, conflicts, and implications introduced by CLI option rationalization.

#### Scenario: Common aliases are generated

- **WHEN** the command contract is generated
- **THEN** every registered `--verbose`, `--force`, `--json`, `--only`, `--group`, and `--dry-run` option records the required command-local alias
- **AND** validation rejects a missing, duplicate, stale, or conceptually conflicting alias

#### Scenario: Switch policy is generated

- **WHEN** switch option policy is generated
- **THEN** it records canonical `--launch` and `--ignore-configured-launcher`, compatibility mappings from `--no-cd` and `--no-default-launch`, deprecation state, `--cd` conflicts, configured-launcher preservation/bypass, tab and explicit-launcher interactions, JSON guard precedence, and non-persisted status

#### Scenario: Handoff compatibility policy is generated

- **WHEN** handoff option policy is generated
- **THEN** it records Markdown as omitted-option default and `--markdown` as a deprecated compatibility spelling rather than an independent format selector

#### Scenario: Selector shape is generated

- **WHEN** policy is generated for a command that registers `--only` or `--group`
- **THEN** it records support for repeated and comma-separated values, explicit-empty distinction, and applicable standalone restrictions

#### Scenario: Update conflict is generated

- **WHEN** update policy is generated
- **THEN** it records `--check` and `--dry-run` as conflicting inspection modes for both human and JSON execution paths

### Requirement: Coordinated validation enforces option convention semantics

The meta-repository checker SHALL compare normalized option convention policy with canonical docs, generated agent-readable exports, and packaged skills, and SHALL fail on semantic disagreement rather than checking option presence alone.

#### Scenario: Companion surfaces agree

- **WHEN** canonical CLI policy, docs, exports, and skills use the same canonical aliases, switch names, migration spellings, conflicts, and selector forms
- **THEN** coordinated validation exits successfully

#### Scenario: Preferred guidance uses a deprecated spelling

- **WHEN** a companion surface teaches `--no-cd`, `--no-default-launch`, or `handoff --markdown` as preferred current syntax outside migration guidance
- **THEN** coordinated validation identifies the stale source and exits unsuccessfully

#### Scenario: Deliberate alias drift fails validation

- **WHEN** an out-of-repository fixture removes or changes one required alias or maps it to a different concept
- **THEN** coordinated validation exits unsuccessfully with a stable semantic mismatch diagnostic
- **AND** real worktrees remain unchanged

#### Scenario: Deliberate switch-policy drift fails validation

- **WHEN** an out-of-repository fixture changes one switch compatibility mapping, conflict, configured-launcher effect, or persistence rule
- **THEN** coordinated validation exits unsuccessfully and names the owning source and mismatched semantic

#### Scenario: Packaged artifacts are validated

- **WHEN** docs or skills are packaged for release
- **THEN** the same semantic checks run against extracted release artifacts rather than relying only on source-worktree files

### Requirement: Command contracts publish completion policy

The canonical CLI command contract SHALL publish enough typed policy to generate and validate shell completion without a handwritten command inventory, including argument choices, option conflicts, and dynamic candidate classifications that are not fully represented by Commander structure alone.

#### Scenario: Completion policy is generated

- **WHEN** the command contract is generated from the current Commander tree and typed semantic policy
- **THEN** every command path, argument, option, alias, description, declared choice, conflict, and dynamic candidate classification required by completion is represented deterministically

#### Scenario: Completion policy is incomplete

- **WHEN** a registered argument or option requires dynamic or constrained completion but lacks required typed policy
- **THEN** repository-local contract validation reports the command path and missing policy
- **AND** exits unsuccessfully

#### Scenario: Option rationalization changes an alias

- **WHEN** a canonical or compatibility option spelling changes in Commander metadata or typed option policy
- **THEN** completion generation consumes the updated contract automatically
- **AND** no independent completion alias inventory requires editing

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

### Requirement: Cross-repository hook-input semantics are validated

The meta-repository SHALL semantically compare the canonical CLI-derived command contract, lifecycle-hook runtime/docs contract, canonical website guidance, generated agent exports, and packaged Arashi skill guidance for lifecycle-hook input. Validation SHALL require `--no-hook-input` ownership by exactly create and remove, invocation-only policy, distinction from `--no-hooks` and create `--interactive`, exact `tty`/`disabled`/`unavailable` mode values, JSON precedence, immediate EOF outside TTY mode, native Bash/PowerShell/cmd coverage, and the no-secrets warning.

#### Scenario: Companion surfaces agree

- **WHEN** CLI metadata, docs, generated exports, and packaged skill guidance publish the same hook-input contract
- **THEN** semantic validation succeeds

#### Scenario: Controlled hook-input mismatch proves enforcement

- **WHEN** an out-of-repository fixture changes one mode value, option owner, precedence rule, EOF rule, native-shell family, or security warning
- **THEN** the checker reports a stable source-specific diagnostic and exits unsuccessfully
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Generated artifact is stale

- **WHEN** runtime option registration changes without regenerating the command contract or companion exports
- **THEN** freshness or semantic validation fails before merge

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

### Requirement: CLI publishes executable distribution policy separately from command aliases

The CLI repository SHALL own typed executable-entrypoint policy and deterministically generate a versioned machine-readable distribution contract without adding `aw` to Commander command paths or command-local alias metadata. The policy SHALL define canonical and alias names, npm mappings, POSIX and Windows release and installed launcher sets, shared native binary names, managed ownership markers plus ledger schema/name, canonical identity boundaries, and supported shell-wrapper and completion registration names.

#### Scenario: Distribution contract is generated

- **WHEN** executable-entrypoint policy is generated from current typed source
- **THEN** the artifact represents canonical `arashi`, alias `aw`, every supported package/release/install launcher, shared native binary routing, marker-plus-ledger ownership policy, and shell names deterministically
- **AND** repeated generation without policy changes is byte-identical and leaves the worktree unchanged

#### Scenario: Commander contract is inspected

- **WHEN** `contracts/cli-commands.json` is generated
- **THEN** `aw` is absent from top-level command paths and `aliasPaths`
- **AND** executable alias policy is available from the separate distribution contract

#### Scenario: Concrete producer drifts

- **WHEN** package metadata, wrapper assets, checksum generation, release upload metadata, retained archives, installers, shell integration, completion generation, or package-content expectations disagree with typed executable policy
- **THEN** repository-local validation identifies the owning source and mismatch and exits unsuccessfully

### Requirement: Coordinated validation enforces executable alias semantics

The meta-repository SHALL compare normalized executable-distribution policy with canonical docs, generated Markdown and LLM exports, authored/extracted skill guidance, and explicit companion exclusions. It SHALL validate identity, alias expansion, channel coverage, one-native-binary routing, collision ownership, shell integration, completion registration, manual payloads, and release verification through stable aggregate entrypoints.

#### Scenario: Coordinated alias surfaces agree

- **WHEN** CLI policy/artifacts, package and release metadata, authored docs, generated exports, authored/extracted skill guidance, and explicit VS Code/Commander exclusions represent the same executable alias contract
- **THEN** coordinated validation exits successfully
- **AND** reports that skills retain canonical `arashi` entry commands while recognizing supported shorthand `aw`, and that VS Code/Commander surfaces require no executable invocation parity

#### Scenario: Deliberate executable mismatch is rejected

- **WHEN** an out-of-repository fixture removes an alias from one distribution channel, changes “Arashi Workspace,” makes `aw` canonical, weakens collision safety, duplicates the native binary, or drops shell/completion/manual-payload coverage
- **THEN** the focused checker exits unsuccessfully with a stable diagnostic naming the owning source and semantic mismatch
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Alias checker is registered through stable aggregates

- **WHEN** focused docs or coordinated checkers are added for executable aliases
- **THEN** repository registration self-tests and dedicated executable acceptance prove they run through existing source, package, and meta aggregate entrypoints
- **AND** no feature-specific workflow step is required while workflow topology, permissions, runtime, triggers, and artifact assembly remain unchanged

### Requirement: Coordinated contracts enforce repository materialization semantics

The generated CLI configuration JSON Schema SHALL be the sole machine-readable CLI producer for direct repository `copy` and `symlink` fields; this change SHALL NOT introduce a second semantic-contract artifact. Maintained CLI guidance SHALL own configured-only scope, same-relative-path behavior, copy-before-symlink order, Git-primary source ownership, lifecycle timing, missing-source skip, no-overwrite/path-containment rules, no-fallback symbolic links, dry-run/outcome behavior, and copy-versus-symlink guidance. Coordinated validation SHALL normalize the generated schema fields and compare schema plus maintained CLI guidance with website docs, generated agent-readable exports, and authored plus extracted-package Arashi skill guidance.

#### Scenario: Companion surfaces agree

- **WHEN** registered coordinated validation runs against current child revisions
- **THEN** the generated CLI schema, maintained CLI guidance, website docs/exports, and packaged skills agree on the normalized repository materialization contract
- **AND** validation executes through the stable docs, skills source, skills package, and meta aggregates

#### Scenario: No unnamed semantic artifact is required

- **WHEN** CLI schema freshness and maintained guidance checks pass
- **THEN** companion and meta validation consume those registered producers directly
- **AND** do not require or generate an additional materialization contract file

#### Scenario: Materialization semantic drifts

- **WHEN** a controlled fixture removes or contradicts one required field, scope, ordering, source, safety, output, fallback, or guidance semantic
- **THEN** focused or coordinated validation fails with a stable diagnostic naming the owning surface and mismatch
- **AND** real coordinated worktrees remain unchanged

#### Scenario: Focused checkers are registered

- **WHEN** docs, skills, or meta repositories add materialization semantic checkers
- **THEN** each checker is registered in the existing fail-closed manifest and remains directly executable for RED/GREEN diagnostics
- **AND** existing stable aggregates execute it without a feature-specific workflow step

#### Scenario: Extracted skill package drifts

- **WHEN** authored skill guidance is correct but the canonical extracted package omits materialization guidance
- **THEN** the skills package aggregate and coordinated validation fail against the extracted artifact
- **AND** source success does not mask the package defect

#### Scenario: Authoritative workflow remains stable

- **WHEN** only registered semantic coverage changes and workflow topology, permissions, runtime, triggers, and artifact assembly are unchanged
- **THEN** authoritative workflow YAML remains feature-agnostic
- **AND** aggregate reachability tests prove the new checks execute in local and CI paths

### Requirement: Cross-repository documented-command policy

The coordinated semantic contract SHALL validate every configured repository's maintained user-facing command guidance and SHALL reject `arashi` used as a preferred or unlabeled actionable executable example while accepting Arashi product references, stable identifiers, historical records, and explicitly labeled compatibility examples.

#### Scenario: Preferred example regresses

- **WHEN** a maintained positive fixture or owned source restores `arashi status`, `arashi create`, or another `arashi` invocation as the recommended example
- **THEN** repository-local or coordinated semantic validation exits unsuccessfully with a stable source-specific diagnostic

#### Scenario: Valid identifier is present

- **WHEN** a fixture includes `npm install -g arashi`, an Arashi URL/repository, `.arashi`, `ARASHI_*`, a native binary name, or an extension identifier
- **THEN** semantic validation accepts the identifier

#### Scenario: Compatibility example is explicit

- **WHEN** guidance explicitly explains that `arashi` remains supported for existing scripts and workflows
- **THEN** semantic validation accepts the compatibility statement and any example scoped to that explanation

### Requirement: Complete configured-repository coverage

The authoritative coordinated check SHALL cover CLI, docs, presentation, skills, VS Code, and meta-owned guidance from the configured repository inventory and SHALL exclude dependencies, caches, generated intermediates not owned as published artifacts, and historical archives.

#### Scenario: Configured companion surface drifts

- **WHEN** any configured companion repository changes an owned maintained command example back to preferred `arashi`
- **THEN** the coordinated check reports that repository and source path and exits unsuccessfully
