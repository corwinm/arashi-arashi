# arashi-skill-guidance Specification

## Purpose

Define how the Arashi skill package keeps its top-level skill guidance minimal while directing detailed workflow instructions to reference files and canonical docs.
## Requirements
### Requirement: Minimal skill entry point

The Arashi skill package SHALL keep `skills/arashi/SKILL.md` focused on skill routing, universal operating rules, and links to detailed references rather than duplicating workflow manuals, command-family details, canonical-doc indexes, or exhaustive command parameters.

#### Scenario: Agent opens the skill

- **WHEN** an agent reads `skills/arashi/SKILL.md`
- **THEN** the skill identifies when to use Arashi guidance, the non-negotiable operating rules, and where to find detailed references
- **AND** it does not embed exhaustive workflow, command-family, migration, launcher, or flag documentation

#### Scenario: Agent chooses detailed guidance

- **WHEN** an agent needs command, workflow, hook, shortcut, prerequisite, or troubleshooting detail
- **THEN** `SKILL.md` routes the agent to the smallest reference that owns that task
- **AND** does not require the agent to read unrelated command families first

### Requirement: CLI help as parameter source of truth

The Arashi skill guidance SHALL direct agents to use `arashi --help` and `arashi <command> --help` to discover current command parameters before advising on non-trivial flags or options.

#### Scenario: Agent needs command flags

- **WHEN** an agent needs to recommend flags for an Arashi command
- **THEN** the guidance instructs the agent to inspect the installed CLI help output instead of relying on memorized or duplicated flag lists

### Requirement: Linked detailed references

The Arashi skill package SHALL keep operational instructions discoverable through linked, task-scoped reference files and canonical website links while excluding maintainer-only release and publication policy from the installed operating surface.

#### Scenario: User needs workflow details

- **WHEN** a user asks for detailed Arashi command, workflow, troubleshooting, shortcut, hook, prerequisite, or security guidance
- **THEN** the skill points the agent to the smallest appropriate installed reference and, where useful, canonical website documentation

#### Scenario: Maintainer prepares a skill release

- **WHEN** a maintainer needs release tagging, marketplace publication, repository security-gate, or release-evidence instructions
- **THEN** installed operational routing does not present that policy as Arashi usage guidance
- **AND** repository-level `docs/publication.md` remains its owner

### Requirement: Contributor guidance alignment

The Arashi skill package SHALL align contributor guidance with the minimal entry point model by treating `SKILL.md` as the place for routing and policy changes, while detailed procedural updates belong in reference files.

#### Scenario: Contributor updates procedural guidance

- **WHEN** a contributor changes detailed workflow, command, troubleshooting, or shortcut instructions
- **THEN** repository guidance directs them to update the smallest affected reference first and only update `SKILL.md` when routing, policy, or reference links change

### Requirement: Skill guidance distinguishes standalone and configured workflows

The Arashi skill package SHALL direct agents to use zero-config standalone mode for a normal one-repository `.worktrees/` workflow and configured mode for child-repository coordination or persisted customization.

#### Scenario: Agent manages one repository

- **WHEN** an agent needs Arashi worktree lifecycle behavior for a non-bare repository without `.arashi/config.json`
- **THEN** the skill guidance explains `arashi init --zero-config` and the manual root `.worktrees/` plus repository-local exclude setup
- **AND** cautions that passive discovery does not repair missing ignore coverage

#### Scenario: Agent needs configured capabilities

- **WHEN** an agent needs child repositories, groups, hooks, defaults, custom managed paths, or coordinated commands
- **THEN** the skill directs the agent to ordinary `arashi init` and configured workspace references
- **AND** does not recommend zero-config mode as equivalent

#### Scenario: Agent encounters an unignored convention

- **WHEN** standalone `create` reports that the exact planned `.worktrees/<branch>` destination is not ignored
- **THEN** the skill recommends `arashi init --zero-config` or a repository-local exclude rule
- **AND** does not instruct the agent to modify global Git configuration or tracked `.gitignore` automatically

### Requirement: Arashi skill guides deterministic explicit plain tmux launch

The Arashi skill SHALL provide concise, command-accurate guidance for selecting plain tmux explicitly and SHALL route detailed behavior to the canonical tmux and sesh documentation.

#### Scenario: Session shortcuts include plain tmux commands

- **WHEN** an agent consults the session shortcut guidance
- **THEN** it can distinguish and use `arashi switch --tmux <target>`, `arashi create <branch> --tmux`, and the existing `--sesh` flow

#### Scenario: Skill guidance states tmux safety rules

- **WHEN** an agent chooses explicit plain tmux launch
- **THEN** the skill states that active tmux context is required, explicit launchers are mutually exclusive, `--cd` conflicts on switch, and selected tmux does not fall back

#### Scenario: Skill guidance preserves configuration vocabulary

- **WHEN** an agent needs persistent contextual tmux behavior
- **THEN** the skill directs it to configured `auto` and does not claim that `tmux` is a valid persisted create or switch mode

#### Scenario: Skill validation follows CLI help

- **WHEN** skill package checks compare documented optional flags with CLI help or maintained contracts
- **THEN** `--tmux` is accepted for switch and create and stale automatic-only guidance fails validation

### Requirement: Arashi skill guides safe managed Kitty reuse

The Arashi skill package SHALL provide concise command-accurate guidance for automatic managed Kitty worktree sessions in the smallest affected reference files and SHALL route detailed setup and troubleshooting to canonical documentation rather than expanding the minimal skill entry point unnecessarily.

#### Scenario: Agent operates inside Kitty

- **WHEN** an agent uses automatic `arashi switch` or post-create launch in a positively detected Kitty context
- **THEN** skill guidance explains Kitty 0.43+, permitted remote control, exact worktree reuse, nested tmux and higher-precedence launchers, and first-class `kitty` launch results

#### Scenario: Managed Kitty fails

- **WHEN** Arashi returns `LAUNCH_FAILED` after selecting Kitty
- **THEN** the skill tells the agent to preserve the actionable failure and inspect Kitty version/remote-control/duplicate-state guidance
- **AND** does not invent Kitty environment markers, silently retry another terminal, close ambiguous Kitty windows, or roll back successfully created worktrees

#### Scenario: Agent considers Kitty persistence or configuration

- **WHEN** an agent needs persistent session restoration, remove-time cleanup, or explicit/configured Kitty selection
- **THEN** skill guidance states those behaviors are outside this slice
- **AND** does not claim `kitty` is a valid explicit flag or persisted create/switch mode

#### Scenario: Packaged guidance is validated

- **WHEN** skill source and extracted-package contract checks run
- **THEN** Kitty version, precedence, reuse, failure, persistence, and ownership semantics match canonical CLI/docs evidence
- **AND** maintainer-only semantic manifests remain outside the installable skill directory

### Requirement: Teach agents deterministic launch disposition

The packaged Arashi skill SHALL teach agents to use the default independent context unless a user explicitly requests `--tab`, SHALL distinguish launcher selection from disposition, and SHALL preserve command-specific safety, JSON, and non-mutation boundaries.

#### Scenario: Agent uses switch tab disposition

- **WHEN** an agent needs to open an existing worktree in a tab
- **THEN** skill guidance uses `arashi switch --tab`
- **AND** explains `--cd` and IDE incompatibility, managed launcher mappings, standalone parity, and unsupported no-fallback behavior

#### Scenario: Agent uses create tab disposition

- **WHEN** an agent needs a created worktree opened in a tab
- **THEN** skill guidance uses `arashi create <branch> --tab`
- **AND** explains implied launch/switch handling, negative-flag precedence, pre-mutation unsupported rejection, dry-run preview, and post-create failure preservation

#### Scenario: Agent does not persist tab disposition

- **WHEN** an agent configures Arashi defaults
- **THEN** skill guidance does not add a disposition field or `tab` configuration value
- **AND** identifies `--tab` as CLI-only invocation context

#### Scenario: Agent handles unsupported tab honestly

- **WHEN** a selected launcher lacks a tab or documented equivalent
- **THEN** skill guidance treats `TAB_DISPOSITION_UNSUPPORTED` as a request mismatch
- **AND** does not retry a window unless the user chooses the default disposition

#### Scenario: Packaged skill matches authored guidance

- **WHEN** the skill package is built and extracted
- **THEN** the packaged artifact contains the same launch-disposition semantics as the authored source
- **AND** package-boundary and cross-repository checks reject stale or missing guidance

### Requirement: Packaged Arashi skill teaches the canonical hook contract

The Arashi skill package SHALL keep detailed hook guidance in its smallest linked reference/tutorial files and SHALL align activation, scope, lifecycle timing, cwd, environment, terminal-input availability, timeout, failure, standalone/configured, platform, and package-manager behavior with the installed CLI and canonical website guidance. It SHALL teach `ARASHI_HOOK_INPUT=tty|disabled|unavailable`, `--no-hook-input`, JSON precedence, immediate EOF, native Bash/PowerShell/cmd reads, invocation-only policy, and the prohibition on entering secrets without claiming that answers or persistent input policy are stored.

#### Scenario: Agent activates a POSIX hook

- **WHEN** an agent follows packaged hook activation guidance
- **THEN** it activates exactly one example and establishes executable mode
- **AND** does not copy multiple templates to one filename

#### Scenario: Agent selects an environment variable

- **WHEN** an agent writes create or remove hook logic
- **THEN** the skill uses `ARASHI_BRANCH_NAME` and scope-valid target values
- **AND** does not recommend `ARASHI_BRANCH` or `ARASHI_BASE_BRANCH`

#### Scenario: Agent encounters a compatibility field

- **WHEN** an agent maintains a hook using documented legacy repository/worktree or comma-separated remove fields
- **THEN** the skill identifies the field as supported through 1.x but non-canonical
- **AND** does not predict removal before a separately approved 2.0-or-later change

#### Scenario: Agent manages a standalone hook

- **WHEN** an agent operates in zero-config standalone mode
- **THEN** guidance uses platform-supported targeted/shared user-global hooks
- **AND** does not activate configless local `.arashi/hooks`

#### Scenario: Agent provisions a coordinated pnpm child

- **WHEN** an agent recommends dependency setup for a nested coordinated pnpm worktree
- **THEN** guidance honors the package's pinned Corepack pnpm and committed lockfile
- **AND** prevents accidental selection of the ancestor workspace

#### Scenario: Agent writes an interactive lifecycle hook

- **WHEN** an agent follows packaged guidance for a native shell read
- **THEN** it checks the effective input mode, preserves JSON and EOF safety, and uses the correct native primitive
- **AND** it does not request secrets, claim answer persistence, or invent a `hooks.input` configuration field

### Requirement: Authored and packaged hook guidance is contract-checked

The skill repository SHALL validate hook guidance in authored sources and an extracted installable package against one maintained semantic contract. Maintainer-only semantic fixtures SHALL remain outside the installable skill directory.

#### Scenario: Packaged hook guidance drifts

- **WHEN** an authored or packaged reference contains stale aliases, unsafe activation, incorrect timing/failure claims, or unsupported platform guidance
- **THEN** validation fails before publication

#### Scenario: Skill package is extracted

- **WHEN** package-boundary tests inspect the installable artifact
- **THEN** it contains the canonical linked hook guidance
- **AND** excludes maintainer-only semantic records/checkers

### Requirement: Skill guidance uses canonical rationalized CLI options

The packaged Arashi skill guidance SHALL use canonical switch behavior names and consistent common aliases where concise examples benefit from them, SHALL not teach deprecated spellings as preferred workflow, and SHALL continue to direct agents to installed CLI help as the parameter source of truth.

#### Scenario: Agent needs generic launch rather than parent-shell cd

- **WHEN** an agent needs to open a selected worktree without changing the current parent shell and without choosing a specific launcher
- **THEN** skill guidance uses `arashi switch --launch`
- **AND** explains that configured `sesh` or Herdr remains selected unless `--ignore-configured-launcher` is also supplied

#### Scenario: Agent needs automatic launcher resolution

- **WHEN** an agent needs to bypass a configured named launcher for one switch invocation
- **THEN** guidance uses `--ignore-configured-launcher`
- **AND** does not imply that this option independently forces or prevents parent-shell `cd`

#### Scenario: Deprecated spellings appear only in migration guidance

- **WHEN** packaged guidance mentions `--no-cd`, `--no-default-launch`, or `handoff --markdown`
- **THEN** it labels the spelling as deprecated compatibility syntax and shows the canonical migration
- **AND** ordinary examples omit the deprecated spelling

#### Scenario: Agent uses common aliases

- **WHEN** shortcut guidance uses `-v`, `-f`, `-j`, `-o`, `-g`, or `-n`
- **THEN** each alias matches a registered option on that exact command path
- **AND** detailed or consequential examples may retain canonical long forms for clarity

#### Scenario: Packaged guidance drifts

- **WHEN** extracted skill content disagrees with canonical alias, switch, conflict, selector, or migration policy
- **THEN** package validation exits unsuccessfully with the mismatched reference

### Requirement: Skill guidance teaches configurable create base branches

The packaged Arashi skill SHALL teach shared repository base policy across configured create, clone, status, pull, push fallback, handoff, and doctor: root `baseBranch`, `meta.baseBranch`, and `repos.<name>.baseBranch`, plus create/clone invocation-wide `--base` and repeatable `--repo-base <repository=branch>`. Guidance SHALL distinguish upstream, configured base, and remote default; explain precedence, resolution, selected-set preflight, target reuse, failure without silent fallback, same-target de-duplication, removal of `defaults.create.baseBranch`, and unchanged standalone scope.

#### Scenario: Agent configures mixed repository bases

- **WHEN** meta and child repositories use different integration branches
- **THEN** skill guidance uses a root fallback plus only necessary meta/child overrides
- **AND** does not duplicate values under create defaults

#### Scenario: Agent selects one-off bases

- **WHEN** an agent needs an invocation-wide base and one repository exception for create or clone
- **THEN** guidance uses `--base` plus `--repo-base`
- **AND** states complete command-applicable precedence and fail-before-mutation boundaries

#### Scenario: Agent evaluates and updates feature branches

- **WHEN** a feature branch upstream differs from its configured base
- **THEN** guidance keeps upstream, base, and remote-default status distinct
- **AND** uses configured pull to incorporate the remote base
- **AND** does not silently fall back if that base is unavailable

#### Scenario: Agent publishes a no-upstream branch

- **WHEN** an agent uses coordinated push on a branch without an upstream
- **THEN** guidance treats configured base only as the publishability baseline
- **AND** preserves `--set-upstream` and the current-branch push destination
- **AND** avoids manufacturing a branch whose commits are only base commits

#### Scenario: Agent interprets diagnostics

- **WHEN** configured base and remote default differ or share a target
- **THEN** guidance preserves both semantic roles
- **AND** expects separate diagnostics when different and de-duplicated human work when identical

#### Scenario: Agent clones a missing coordinated child

- **WHEN** clone runs in a coordinated worktree
- **THEN** guidance preserves the coordinated target branch and treats effective base only as its creation point

#### Scenario: Agent reuses a target branch

- **WHEN** create or coordinated clone finds an existing target
- **THEN** guidance does not claim Arashi resets, rebases, or validates its ancestry against the base

#### Scenario: Agent encounters removed configuration

- **WHEN** an agent encounters `defaults.create.baseBranch`
- **THEN** it treats the property as unsupported rather than accepted compatibility input
- **AND** migrates a workspace-wide value to root `baseBranch` or a repository-specific value to the owning override before running workspace commands

#### Scenario: Agent uses implicit standalone mode

- **WHEN** an agent runs standalone commands
- **THEN** guidance permits established invocation-only create `--base` behavior
- **AND** does not invent persisted configured-base policy or changed pull/push/diagnostic semantics

#### Scenario: Agent writes hooks

- **WHEN** an agent needs target-branch context after policy resolution
- **THEN** guidance continues to use `ARASHI_BRANCH_NAME`
- **AND** does not invent or advertise `ARASHI_BASE_BRANCH`

### Requirement: Skills semantic guidance uses stable fail-closed aggregates

The skill repository SHALL provide stable aggregate validation entrypoints for authored source guidance and the extracted `skills/arashi` subtree of a canonical release archive. Every aggregate invocation SHALL execute registration validation as a mandatory preflight before any child checker. Maintained checker identities SHALL be unique repository-relative paths matching `scripts/<basename>-guidance-selftest.mjs`, where the basename uses lowercase ASCII alphanumerics and internal hyphens, and SHALL appear in ascending bytewise UTF-8 order. Identities SHALL NOT be absolute, contain `.` or `..` segments, use non-portable separators, escape the repository, resolve through a symlink, or name anything other than a regular maintained checker file.

#### Scenario: Maintained checker is registered

- **WHEN** a contributor adds a maintained guidance checker and registers its canonical identity in the explicit manifest
- **THEN** source and package aggregates first confirm exact set equality between the manifest and maintained checker inventory
- **AND** execute the checker in deterministic manifest order

#### Scenario: Maintained checker is omitted

- **WHEN** a maintained guidance checker exists but is absent from the explicit manifest
- **THEN** both source and package aggregate preflights report the omitted checker by path
- **AND** exit unsuccessfully before executing any child checker

#### Scenario: Registration is stale or ambiguous

- **WHEN** the manifest names a missing checker, repeats an entry, uses an invalid or escaping identity, resolves through a symlink, or is not in canonical bytewise order
- **THEN** both aggregate preflights report every registration defect
- **AND** exit unsuccessfully before executing any child checker

#### Scenario: Contributor diagnoses registration directly

- **WHEN** a contributor invokes the focused registration guard
- **THEN** it applies the same preflight contract used by both aggregates
- **AND** reports registration defects without executing semantic children

### Requirement: Skills aggregate execution preserves focused diagnostics

The skills semantic aggregate SHALL execute each registered checker as a child process, identify the checker before execution, preserve its diagnostic output, and report startup, signal, and nonzero-exit failures with checker identities. It SHALL attempt every registered checker after a successful preflight so one failure does not hide independent failures. Every registered checker SHALL remain directly executable for focused TDD and diagnostics.

#### Scenario: All source checkers pass

- **WHEN** the source aggregate runs against the authored skill tree and every registered checker succeeds
- **THEN** it reports each checker in deterministic order
- **AND** exits successfully with the completed checker count

#### Scenario: Registered checkers fail independently

- **WHEN** one or more registered checkers cannot start, receive a signal, or exit unsuccessfully
- **THEN** the aggregate preserves their output and reports each failure class with its checker identity
- **AND** exits unsuccessfully without reporting a false aggregate success

#### Scenario: Contributor runs one focused checker

- **WHEN** a contributor invokes a registered checker directly during RED/GREEN development
- **THEN** the checker validates its maintained semantic domain through its existing source or `--skill-root` interface
- **AND** does not require a feature-specific workflow step or meta-repository path to prove reachability

### Requirement: Extracted package validation uses the canonical release artifact

The skills repository SHALL define one canonical release-archive producer or producer-owned member policy shared by pull-request, tag-release, and coordinated meta validation. The archive SHALL contain only the top-level members `skills/`, `README.md`, `LICENSE`, and `security/`, and SHALL exclude maintainer tooling, mutation fixtures, AppleDouble metadata, and other undeclared members. Package semantic validation SHALL use the same registered checker set as source validation and pass the extracted canonical archive's `skills/arashi` subtree to every checker through `--skill-root`; it SHALL NOT substitute authored source.

#### Scenario: Canonical release package agrees with source contracts

- **WHEN** the canonical release archive is created, its exact membership is verified, and it is extracted
- **THEN** every registered checker validates the extracted `skills/arashi` subtree
- **AND** the aggregate exits successfully only after registration and all package checks pass

#### Scenario: Extracted package drifts while source remains correct

- **WHEN** a required semantic is removed from the extracted package copy but remains present in authored source
- **THEN** package aggregate validation fails for the checker that owns that semantic
- **AND** source-tree correctness does not mask the package defect

#### Scenario: Maintainer tooling or undeclared content leaks

- **WHEN** archive membership contains `scripts/`, `contracts/`, checker fixtures, platform metadata, or any undeclared top-level member
- **THEN** package-boundary validation identifies the forbidden member
- **AND** the archive is rejected before it is treated as release-shaped

#### Scenario: Package producers drift

- **WHEN** pull-request, tag-release, or coordinated meta validation bypasses the canonical producer or member policy
- **THEN** workflow-composition or package-boundary validation fails
- **AND** no weaker `skills/`-only fixture can satisfy release-package acceptance

### Requirement: Skills workflows invoke stable semantic entrypoints

Authoritative skills pull-request and release workflows SHALL invoke one stable source aggregate and one stable canonical-package aggregate instead of separately invoking registration or enumerating feature-specific guidance checker scripts. Aggregate registration preflight SHALL remain mandatory. The workflows SHALL preserve their existing trigger scope; this change SHALL NOT narrow an unfiltered pull-request workflow or add an inapplicable path filter to a tag-release workflow.

#### Scenario: New checker is added without workflow topology change

- **WHEN** a contributor adds and registers a semantic checker without changing runtime, permissions, triggers, package assembly, or job topology
- **THEN** authoritative workflows execute it through both stable aggregates
- **AND** no feature-specific workflow YAML step is required

#### Scenario: Workflow bypasses an aggregate or canonical artifact stage

- **WHEN** workflow-composition validation finds that source aggregate validation, canonical package creation/membership/extraction, or package aggregate validation is unreachable or duplicated
- **THEN** validation identifies the missing or duplicated stable stage
- **AND** exits unsuccessfully

#### Scenario: Existing skills trigger scope is preserved

- **WHEN** authoritative skills workflows are migrated to aggregate commands
- **THEN** the pull-request workflow remains eligible for the same changes as before
- **AND** the tag-release workflow remains eligible for the same release tags as before

### Requirement: Packaged skill teaches safe inline lifecycle configuration

The Arashi skill SHALL teach inline lifecycle hooks in the smallest linked hook/configuration references while keeping `SKILL.md` a minimal router. Guidance SHALL use root `hooks.scripts.<lifecycle>` for workspace ownership and `repos.<name>.hooks.<lifecycle>` for repository ownership, cover all four lifecycles, string-as-Bash shorthand, `bash`/`powershell`/`cmd` maps, deterministic platform selection, same-location ambiguity, and file-only standalone/user-global behavior. It SHALL direct agents to installed CLI help/schema and MUST NOT recommend dynamic repository lifecycle keys, terminal selection, external script paths, or secrets in snippets.

#### Scenario: Agent configures a short hook

- **WHEN** an agent follows packaged guidance for a short workspace or repository command
- **THEN** it uses the canonical owner location and supported value shape
- **AND** does not create a second source at the same logical location

#### Scenario: Agent needs a substantial script

- **WHEN** automation is substantial, reusable, or needs independent tooling
- **THEN** the skill recommends a native hook file rather than an oversized inline value

### Requirement: Skill guidance preserves runtime and secrecy contracts

Authored and packaged guidance SHALL state that inline hooks preserve lifecycle timing, cwd, target multiplicity, scope order, timeout, create-only `--no-hooks`, shared `--no-hook-input`, TTY/EOF, JSON-owned quiet behavior, command-specific JSON/dry-run behavior, failure, rollback/finalization, and outcomes. It SHALL state that remove does not gain `--no-hooks`, remove dry-run retains source-aware previews, and configured-create dry-run retains no hook discovery, an empty ledger, and no preview surface. It SHALL teach shell-native environment syntax and fail-fast composition and SHALL state that outcomes, previews, diagnostics, and logs identify source kind/owner without snippet text. It SHALL warn that inline config is executable code and secrets MUST NOT be embedded or entered as hook input.

#### Scenario: Agent writes portable variants

- **WHEN** an agent configures Bash, PowerShell, and cmd entries
- **THEN** guidance uses `$ARASHI_*`, `$env:ARASHI_*`, and `%ARASHI_*%` respectively
- **AND** explains deterministic host selection and interpreter-unavailable failure

#### Scenario: Agent handles automation output

- **WHEN** an agent uses JSON or dry-run with inline hooks
- **THEN** guidance expects one-document/non-executing behavior and non-secret source metadata
- **AND** never instructs the agent to inspect or print snippet text from outcomes

### Requirement: Authored and extracted-package inline guidance is aggregate-checked

A focused inline-hook guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate both authored source and the extracted canonical release archive through the stable source and package aggregates. Maintainer fixtures/checkers MUST remain outside the installable skill tree.

#### Scenario: Authored guidance drifts

- **WHEN** source guidance loses or contradicts ownership, interpreter, ambiguity, lifecycle, no-disclosure, or security semantics
- **THEN** the focused checker and source aggregate fail with the owning reference

#### Scenario: Packaged guidance drifts

- **WHEN** the canonical extracted package omits required inline-hook guidance while authored source remains correct
- **THEN** the package aggregate fails against the extracted `skills/arashi` subtree
- **AND** source success does not mask the package defect

#### Scenario: Checker is registered

- **WHEN** the inline checker is added without changing workflow topology
- **THEN** existing stable source/package aggregates execute it through canonical registration
- **AND** no feature-specific workflow step is required

### Requirement: Packaged skill recognizes the supported executable alias without forking command guidance

The authored and packaged Arashi skill SHALL identify `aw` as the supported “Arashi Workspace” shorthand provided by supported installations while retaining canonical `arashi` entry commands, help discovery, examples, product identity, configuration, and environment-variable vocabulary. Alias guidance SHALL live in the smallest linked installation/tutorial reference rather than expanding the minimal `SKILL.md` routing surface or duplicating workflows with `aw` spellings.

#### Scenario: Agent verifies or discovers commands

- **WHEN** an agent reads skill entry commands or needs current command parameters
- **THEN** the skill continues to use `arashi --version`, `arashi --help`, and `arashi <command> --help` as canonical discovery commands
- **AND** does not present `aw` as a separate product, subcommand vocabulary, or preferred replacement

#### Scenario: Agent reads installation guidance

- **WHEN** an agent follows the smallest linked installation or tutorial reference
- **THEN** it learns that supported npm and direct installations provide equivalent canonical `arashi` and shorthand `aw` executable names
- **AND** it is directed to canonical docs for channel-specific collision, shell integration, completion, update, and manual-install behavior

#### Scenario: Authored or extracted guidance drifts

- **WHEN** the focused skill semantic checker runs against authored source or the extracted canonical release archive
- **THEN** it rejects missing/incorrect alias expansion, claims that `aw` is a separate command vocabulary, non-canonical entry/help commands, or alias guidance absent from either package boundary
- **AND** it remains registered through the stable source and package aggregates without feature-specific workflow steps

### Requirement: Packaged skill teaches safe repository worktree materialization

The authored and packaged Arashi skill SHALL teach configured repository `copy` and `symlink` fields in the smallest linked configuration/create references while keeping `SKILL.md` a minimal router. Guidance SHALL state that paths are same-relative-path and canonical-source-checkout owned, copy entries precede symlink entries between repository pre/post-create, missing sources skip visibly, destinations never overwrite or escape, `--no-hooks` does not disable materialization, and symbolic links never fall back to copies, hard links, or junctions.

#### Scenario: Agent needs independent local configuration

- **WHEN** an agent needs `.env` or local configuration to be independently mutable in each worktree
- **THEN** skill guidance recommends repository `copy`
- **AND** does not require a shell hook for the supported same-path case

#### Scenario: Agent needs intentionally shared state

- **WHEN** an agent needs state intentionally shared with the canonical checkout
- **THEN** skill guidance allows repository `symlink`
- **AND** explains shared mutation, platform capability, exact-target, and no-fallback risks

#### Scenario: Agent considers shared dependencies

- **WHEN** an agent considers symlinking `node_modules` or an equivalent dependency tree
- **THEN** guidance recommends package-manager content-addressed stores and per-worktree installs for normal use
- **AND** labels shared dependency trees advanced and risky because branches, lockfiles, runtimes, native modules, and install scripts may diverge or mutate shared state

#### Scenario: Agent needs custom mapping or conditions

- **WHEN** an agent needs globs, remapping, external sources, interpolation, required entries, or conditional behavior
- **THEN** the skill routes the agent to lifecycle hooks
- **AND** does not invent unsupported materialization fields

#### Scenario: Agent operates standalone

- **WHEN** an agent uses implicit zero-config standalone mode
- **THEN** guidance does not claim that repository materialization configuration is available there

### Requirement: Authored and extracted materialization guidance is aggregate-checked

A focused materialization guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate both authored source and the extracted canonical release archive through stable source and package aggregates. Maintainer contracts and fixtures MUST remain outside the installable skill tree.

#### Scenario: Authored guidance drifts

- **WHEN** source guidance loses or contradicts field shape, source ownership, lifecycle timing, safety, fallback, or copy-versus-symlink advice
- **THEN** the focused checker and source aggregate fail with the owning reference

#### Scenario: Packaged guidance drifts

- **WHEN** the canonical extracted package omits required materialization guidance while source remains correct
- **THEN** the package aggregate fails against extracted `skills/arashi`
- **AND** no feature-specific workflow step is required

### Requirement: Task-scoped command references

The installed Arashi skill SHALL route command guidance by user task so a narrow command request does not require loading the full command surface, while every focused command reference remains self-contained for its declared scope.

#### Scenario: Agent needs one command family

- **WHEN** an agent needs setup/update, workspace/repository, automation, create, switch/launch, or remove/maintenance guidance
- **THEN** the command router identifies one focused reference for that family
- **AND** that reference provides the applicable prerequisites, copy-pasteable commands, user-visible precedence, expected outcomes, safety boundaries, and recovery links

#### Scenario: Agent needs adjacent command behavior

- **WHEN** a task crosses two command families
- **THEN** the owning reference links directly to the adjacent focused reference
- **AND** the agent does not need to load every command family

### Requirement: Installed guidance has clear content ownership

The installed Arashi skill SHALL assign one primary owner to each detailed operational concept and SHALL use concise links rather than repeating the same contract across the tutorial, workflows, commands, shortcuts, hooks, and troubleshooting references.

#### Scenario: Agent follows the tutorial

- **WHEN** an agent opens the end-to-end tutorial
- **THEN** it completes one successful configured journey, presents an explicit standalone choice, verifies the outcome, and links optional setup, shortcut, hook, and recovery detail
- **AND** it does not concatenate full copies of those references

#### Scenario: Agent chooses a workflow

- **WHEN** an agent opens workflow guidance
- **THEN** it selects a mode by goal and follows a lifecycle sequence
- **AND** launcher implementation contracts and exhaustive command details remain in their owning surfaces

#### Scenario: Agent troubleshoots a failure

- **WHEN** an agent opens troubleshooting guidance
- **THEN** each entry provides a symptom, first diagnostic, likely recovery, and detailed link
- **AND** does not duplicate complete launcher, ignore, or command contracts

### Requirement: Prerequisites are capability-conditional

The installed Arashi skill SHALL distinguish universal operating prerequisites from requirements that apply only to installation channels, network operations, optional integrations, or repository-maintainer validation.

#### Scenario: Agent uses an installed standalone binary locally

- **WHEN** an agent performs a local Arashi operation with an already-installed standalone binary
- **THEN** the guidance requires Git and the applicable repository state
- **AND** does not claim that Node, npm, or GitHub network access is universally required

#### Scenario: Agent installs, updates, or validates the skill repository

- **WHEN** the task uses a package-manager installation channel, remote operation, optional integration, or maintainer validation command
- **THEN** the guidance states the corresponding Node, package-manager, network, or integration prerequisite in that task's scope

### Requirement: Installed guidance excludes implementation and historical sediment

The installed skill SHALL describe supported user-visible operation without teaching internal executor ownership, exhaustive adapter implementation matrices, stale issue/PR-specific examples, obsolete release-specific workarounds, or hard-coded historical release tags as current guidance.

#### Scenario: Agent operates a supported command

- **WHEN** an agent reads current command guidance
- **THEN** it receives current syntax, behavior, failure classification, safety boundaries, and recovery information
- **AND** internal Commander/exported-executor enforcement details and historical delivery examples are absent unless required to operate the command safely

#### Scenario: Agent encounters deprecated compatibility guidance

- **WHEN** a deprecated spelling or configuration form remains supported
- **THEN** it appears only in a bounded migration section with the canonical replacement and compatibility boundary
- **AND** it is not presented as preferred current usage

### Requirement: Skill reduction preserves semantic coverage

The installed-skill reduction SHALL preserve all approved command, standalone/configured, launcher, hook, JSON, ignore, and package-boundary semantic domains in authored source and the canonical extracted release artifact.

#### Scenario: Authored skill is validated

- **WHEN** the complete registered source guidance aggregate runs
- **THEN** every existing semantic domain passes against the reorganized installed content

#### Scenario: Canonical release artifact is validated

- **WHEN** the canonical skill archive is created and extracted
- **THEN** every package-capable semantic checker passes against the extracted `skills/arashi` subtree
- **AND** all intended focused references are present while maintainer-only scripts and contracts remain absent

#### Scenario: Reduction effectiveness is measured

- **WHEN** implementation validation is complete
- **THEN** the change reports before/after installed character counts and representative task-context sizes
- **AND** demonstrates materially smaller narrow-task loads without counting removed safety or recovery semantics as success

### Requirement: Authored and packaged skills teach aw

Installed Arashi skill routing, tutorials, command references, troubleshooting, prerequisites, shortcuts, and cheatsheets SHALL use `aw` for actionable CLI commands while preserving Arashi product and machine identifiers. Source and extracted-package semantic checks SHALL enforce the same policy.

#### Scenario: Agent follows installed skill guidance

- **WHEN** an agent copies an actionable command from the installed skill package
- **THEN** the executable spelling is `aw`
- **AND** any required package, URL, `.arashi`, `ARASHI_*`, or native identifier remains unchanged

#### Scenario: Packaged artifact is checked

- **WHEN** the canonical skill archive is created and extracted
- **THEN** the extracted guidance passes the same primary-spelling checks as source
- **AND** repeated archive creation from unchanged inputs is deterministic

### Requirement: Packaged skill teaches optional repository onboarding during add

The authored and packaged Arashi skill SHALL teach eligible human `aw add` onboarding in the focused workspace/repository command reference while routing copy/symlink and hook details to their existing configuration/create and hook references. Guidance SHALL preserve default-no minimal add, non-interactive/JSON/force suppression, canonical repository ownership, unselected content-free suggestions, manual path validation and dependency warnings, exclusive inline-or-executable-file hook choice, exact active paths, safe no-op scaffolds, runtime-ready permissions without rename/chmod activation, no overwrite, user-supplied inline commands, sanitized inline/script summaries, one final config save, transaction-owned script rollback, and the boundary that existing-entry editing belongs to `aw configure` rather than add.

#### Scenario: Agent adds a repository interactively

- **WHEN** an agent follows installed guidance for an eligible human add invocation
- **THEN** it can explain or operate the optional section checklist and final confirmation without selecting values on the user's behalf
- **AND** it does not configure workspace hooks, unsupported fields, or existing entries through add

#### Scenario: Agent handles local-file suggestions

- **WHEN** the checkout contains suggested ignored local paths
- **THEN** skill guidance treats them as unselected path names only and preserves canonical copy-versus-symlink advice
- **AND** instructs the agent not to read or disclose contents

#### Scenario: Agent handles hook input

- **WHEN** the user selects repository hooks
- **THEN** the agent offers one inline command or editable active native script per lifecycle
- **AND** requires user-supplied inline commands in canonical lifecycle/interpreter shapes
- **AND** explains the exact active path, safe no-op scaffold, and immediate executable readiness without rename/chmod activation
- **AND** never repeats hook or generated-script bodies in summaries, diagnostics, or reports

#### Scenario: Agent needs to edit existing config

- **WHEN** the requested task is to inspect or update an already registered repository or supported workspace setting
- **THEN** the skill does not misuse `aw add` and instead routes the user to `aw configure`
- **AND** retains direct-config guidance for unsupported canonical fields

### Requirement: Authored and extracted onboarding guidance is aggregate-checked

A focused onboarding guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate both authored source and the extracted canonical release archive through stable source and package aggregates. Maintainer contracts and fixtures MUST remain outside the installable skill tree.

#### Scenario: Authored or packaged onboarding guidance drifts

- **WHEN** source or extracted guidance loses or contradicts prompt eligibility, field/action scope, suggestion secrecy, exclusive inline/file choice, exact active path/no-op/executable semantics, no-overwrite ownership, user command ownership, sanitized summary, persistence, cancellation, or #316 boundaries
- **THEN** the owning source/package aggregate fails with a stable diagnostic
- **AND** no feature-specific workflow step is required

### Requirement: Packaged skill guidance routes supported edits through configure

The authored and extracted Arashi skill SHALL direct agents to use `aw configure` for supported existing-workspace inspection and human-confirmed edits, list the supported scope families, distinguish persisted from effective state, and preserve direct config editing for unsupported canonical fields. Guidance SHALL state that interactive editing requires a TTY and `--json` is sanitized inspection only.

#### Scenario: Agent needs to inspect configuration

- **WHEN** an agent follows packaged workspace command guidance
- **THEN** it can use `aw configure --json` for stable non-mutating supported-field inspection
- **AND** knows that inline command bodies are intentionally omitted

#### Scenario: Agent needs to change configuration

- **WHEN** a supported interactive edit is appropriate
- **THEN** guidance routes the user to `aw configure` and its final confirmation
- **AND** does not invent non-interactive setters or describe the command as schema-derived

#### Scenario: Release package is validated

- **WHEN** the canonical skill archive is built and extracted
- **THEN** source and package aggregates enforce the same configure guidance
- **AND** stale or missing packaged guidance fails before publication

### Requirement: Detailed skill references explain configured worktree naming

The packaged Arashi skill SHALL keep `skills/arashi/SKILL.md` limited to routing and place configured `worktreeNaming` guidance in the smallest workspace/create reference. Detailed guidance SHALL define both closed fields, omission/default/preserve compatibility, exact representative destination styles, unchanged Git branch identity, direct JSON-authoring scope, deterministic no-suffix collisions, metadata-driven existing-worktree behavior, coordinated child placement, and unchanged standalone behavior. Source and extracted-package validation MUST enforce the same contract.

#### Scenario: Agent needs configured naming guidance

- **WHEN** an agent follows the skill's workspace or create references
- **THEN** the smallest owning reference provides the exact nested config shape, closed values, defaults, examples, and safety boundaries
- **AND** the routing-only skill entry point does not duplicate the manual

#### Scenario: Packaged guidance is validated

- **WHEN** maintainers run source and extracted-package skill checks
- **THEN** both copies must agree on naming values, defaults, representative paths, JSON-authored scope, branch identity, collisions, compatibility, and standalone isolation
- **AND** a drifted or missing required claim fails validation

### Requirement: Packaged skill teaches safe configured repository deletion

The authored and packaged Arashi skill SHALL teach delete in the smallest configured-workspace/reference file while keeping `skills/arashi/SKILL.md` a minimal router. Guidance SHALL direct agents to inspect installed `aw delete --help`, select an exact configured key, run dry-run first, distinguish delete from remove, and require explicit user intent before `--force` automation.

#### Scenario: Agent is asked to delete a dependency

- **WHEN** an agent receives an explicit request to remove one or more configured repository dependencies
- **THEN** it uses `aw delete <repository> --dry-run` to review exact scope before a mutating invocation
- **AND** does not hand-edit config, broad-delete paths/hooks, or substitute `aw remove`

#### Scenario: Human wants to choose repositories interactively

- **WHEN** the user asks to choose one or more configured dependencies rather than naming an exact key
- **THEN** guidance uses human-TTY `aw delete` and explains the checkbox multi-select plus combined preview/confirmation
- **AND** agents do not use omitted-target JSON/non-TTY invocation or infer a default repository

#### Scenario: Agent lacks explicit destructive intent

- **WHEN** a user asks to inspect, detach, clean, or remove a worktree without clearly requesting repository dependency deletion
- **THEN** skill guidance does not infer permission to run mutating delete
- **AND** routes branch/worktree cleanup to the appropriate existing command/help

#### Scenario: Agent automates a confirmed deletion

- **WHEN** the user has accepted the exact plan or explicitly requested non-interactive deletion
- **THEN** guidance permits `aw delete <repository> --force`
- **AND** states that force cannot bypass structural, identity, hook-ambiguity, or concurrent-config safeguards

### Requirement: Skill guidance preserves deletion scope and recovery honesty

Skill guidance SHALL identify canonical clone, all owned linked worktrees/local refs, exact repository config entry, and canonical local repository-targeted hook files/templates as deletion scope. It SHALL identify unrelated config, managed-ignore policy, shared/user-global hooks, and remotes as preserved. It SHALL teach agents to respect phase-ledger partial failure and safe retry guidance without claiming rollback.

#### Scenario: Agent reviews the plan

- **WHEN** dry-run lists paths, refs, hooks, warnings, or preserved global guidance
- **THEN** the agent compares the plan with the requested repository and reports material data-loss blockers
- **AND** never requests or prints hook contents/inline command bodies

#### Scenario: Agent encounters dirty or unpublished work

- **WHEN** delete reports Git data-loss blockers
- **THEN** guidance tells the agent to preserve/publish/clean the work or obtain explicit acceptance before force
- **AND** does not treat ignored files or local refs as disposable automatically

#### Scenario: Agent encounters partial failure

- **WHEN** delete reports `DELETE_PARTIAL_FAILURE`
- **THEN** guidance follows completed/surviving state and the command's exact safe-retry indication
- **AND** does not rerun broad manual cleanup or claim the repository was fully deleted

### Requirement: Authored and extracted-package delete guidance is aggregate-checked

A focused delete guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate authored source plus the extracted canonical release package. Maintainer checker/fixture records SHALL remain outside the installable skill tree.

#### Scenario: Authored guidance drifts

- **WHEN** source guidance loses or contradicts exact-key targeting, preview/force sequence, remove distinction, structural safety, preserved scope, JSON secrecy, or partial-failure behavior
- **THEN** the focused checker and source aggregate fail with the owning reference

#### Scenario: Packaged guidance drifts

- **WHEN** extracted skill content differs from authored canonical delete guidance
- **THEN** the package aggregate fails against the extracted `skills/arashi` subtree
- **AND** source success does not mask the package defect

#### Scenario: Stable aggregates execute the checker

- **WHEN** the checker is registered without workflow-topology changes
- **THEN** existing source/package and coordinated aggregates execute it
- **AND** no feature-specific workflow step is required
