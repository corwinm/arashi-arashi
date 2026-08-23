# docs-workflow-guidance-sections Specification

## Purpose

Define documentation requirements for discoverable workflow guidance covering hooks, configuration, integrations, and onboarding cross-links.

## Requirements

### Requirement: Docs SHALL provide dedicated workflow guidance for hooks, configuration, and integrations

The documentation SHALL provide dedicated, discoverable guidance for hooks, configuration options, and integrations instead of requiring users to infer those workflows only from command-reference pages.

#### Scenario: User needs workflow-specific guidance

- **WHEN** a user wants to learn how Arashi supports hooks, configuration defaults, or integrations
- **THEN** the docs navigation or primary onboarding flow leads them to a focused workflow page or section for that topic

### Requirement: Integration guidance SHALL cover supported editor and terminal workflows

The integrations guidance SHALL describe how Arashi fits with VSCode, tmux, and tmux plus sesh workflows, and SHALL link to the relevant command documentation for setup details and constraints.

#### Scenario: User evaluates integration options

- **WHEN** a user opens the integrations guidance
- **THEN** they can compare VSCode, tmux, and tmux plus sesh workflows and follow links to the detailed command documentation they need

### Requirement: Onboarding content SHALL cross-link to workflow guidance

The landing page, getting-started flow, and top-level README SHALL point users to hooks, configuration, and integration guidance as next-step documentation after initial installation and workspace setup.

#### Scenario: User completes first setup steps

- **WHEN** a user finishes reading install or first-workflow instructions
- **THEN** the docs and README offer explicit next links to the relevant workflow guidance sections

### Requirement: Canonical guidance distinguishes explicit plain tmux from sesh

The documentation SHALL teach explicit plain-tmux switching and post-create launch, distinguish `--tmux` from `--sesh`, and state prerequisite, precedence, conflict, JSON, standalone, configuration-decision, and failure behavior.

#### Scenario: Switch and create references document plain tmux

- **WHEN** a user reads the canonical switch or create command reference
- **THEN** the page provides copy-pasteable `--tmux` syntax and states that selected tmux never falls back when context or launch fails

#### Scenario: Tmux and sesh workflow explains the choice

- **WHEN** a user reads the tmux and sesh workflow guide
- **THEN** the guide explains that `--tmux` opens a plain tmux window while `--sesh` requires the sesh binary and uses sesh session integration

#### Scenario: Configuration decision is explicit

- **WHEN** a configured-workspace user reads tmux guidance
- **THEN** the documentation states that `--tmux` is per-invocation-only and configured `auto` already chooses tmux inside an active tmux session

#### Scenario: Standalone guidance remains accurate

- **WHEN** a zero-config user follows tmux workflow guidance
- **THEN** the documentation confirms that explicit tmux works without adopting workspace configuration

#### Scenario: Agent-readable exports include the updated contract

- **WHEN** documentation validation regenerates or checks agent-readable exports
- **THEN** the exported switch, create, and tmux workflow guidance contains the same tmux syntax and semantics as the canonical pages

### Requirement: Documentation provides a discoverable managed Kitty workflow

The documentation SHALL provide dedicated, discoverable guidance for Arashi's automatic managed Kitty worktree sessions and SHALL keep command references, integration navigation, troubleshooting, and agent-readable exports aligned.

#### Scenario: User evaluates Kitty integration

- **WHEN** a user opens integrations or terminal workflow guidance
- **THEN** they can discover a focused Kitty workflow explaining Kitty 0.43+, permitted remote control, automatic precedence, exact live-session reuse, and readable worktree labels
- **AND** can follow links to the relevant switch and create command references

#### Scenario: User configures or troubleshoots remote control

- **WHEN** managed Kitty version, executable, permission, password, socket, focus, launch, lock, duplicate-state, or validation handling fails
- **THEN** canonical guidance explains the actionable prerequisite or recovery boundary
- **AND** does not recommend weakening Kitty security policy, inventing environment markers, attaching to an arbitrary socket, or retrying through another launcher

#### Scenario: User asks about persistence or removal

- **WHEN** a user needs Kitty session restoration or removes an Arashi worktree with a live Kitty window
- **THEN** documentation states that this slice uses temporary live sessions, does not write `.kitty-session` files, and does not close Kitty windows during `arashi remove`

#### Scenario: Agent-readable exports include Kitty guidance

- **WHEN** documentation validation regenerates or checks agent-readable exports
- **THEN** exported switch, create, configuration, and Kitty workflow guidance contains the same version, precedence, reuse, failure, persistence, and ownership semantics as canonical pages

### Requirement: Document launch disposition across canonical workflows

Canonical documentation SHALL explain that automatic launch defaults to a new window or documented independent managed session, that `--tab` is a one-invocation opt-in on switch and create, and that unsupported launchers fail without opening a window. Generated agent-readable exports SHALL be regenerated from the canonical sources.

#### Scenario: Switch documentation explains disposition

- **WHEN** a user reads the switch command or workflow reference
- **THEN** it documents default `window`, explicit `--tab`, the parent-shell conflict, IDE and managed-launcher composition, JSON rejection, standalone parity, and unsupported guidance

#### Scenario: Create documentation explains disposition

- **WHEN** a user reads the create command or defaults reference
- **THEN** it documents that `--tab` implies launch and switch handling, wins over create negative flags, remains CLI-only, permits dry-run preview, rejects JSON, and preserves worktrees on post-create process failure

#### Scenario: Launcher matrix is user-visible

- **WHEN** a user consults terminal integration guidance
- **THEN** it identifies true-tab mappings for Windows Terminal, WezTerm, Terminal.app, iTerm2, macOS Ghostty, and active-workspace Herdr; managed equivalents for Kitty, tmux/sesh, and cmux; and unsupported mappings for Git Bash/MinTTY, IDE workspaces, Linux Ghostty, unmanaged Kitty tabs, and generic platform fallbacks
- **AND** it explains that a detected multiplexer receives the tab before its containing terminal application

#### Scenario: Troubleshooting does not recommend silent fallback

- **WHEN** documentation describes `TAB_DISPOSITION_UNSUPPORTED` or supported tab execution failure
- **THEN** it recommends the default window or a tab-capable detected host as applicable
- **AND** does not claim Arashi will retry the request as a window

#### Scenario: Generated documentation remains canonical

- **WHEN** canonical documentation changes
- **THEN** agent-readable exports are regenerated rather than edited directly
- **AND** source/export freshness checks pass

### Requirement: Canonical hook guidance publishes the normative lifecycle matrix

The documentation SHALL provide one discoverable hooks workflow that distinguishes configured and standalone modes and defines each supported lifecycle's discovery locations, platform extensions, invocation multiplicity, mutation timing, cwd, environment context, timeout, failure/rollback/finalization behavior, and human/JSON outcome semantics.

#### Scenario: User compares configured create scopes

- **WHEN** a user reads create-hook guidance
- **THEN** it distinguishes workspace pre/post hooks from repository-specific pre/post hooks
- **AND** accurately states that `pre-create.<repo>` runs after that repository worktree is materialized

#### Scenario: User compares standalone scopes

- **WHEN** a user reads standalone hook guidance
- **THEN** it documents targeted and shared user-global create/remove hooks
- **AND** states that configless repository-local/workspace hooks remain inactive

#### Scenario: User develops Windows hooks

- **WHEN** a Windows user reads lifecycle guidance
- **THEN** it documents supported native extensions, activation commands, ambiguity failure, and absence of implicit Bash execution

### Requirement: Hook environment guidance is scope-correct

Canonical documentation SHALL publish a scope-aware environment table separating common executor metadata, configured create targets, standalone targets, per-target remove scalars, and structured aggregate remove context. It MUST use `ARASHI_BRANCH_NAME` and MUST NOT advertise `ARASHI_BRANCH` or `ARASHI_BASE_BRANCH` as runtime values.

#### Scenario: User writes a workspace create hook

- **WHEN** a user follows the workspace pre/post-create example
- **THEN** the script uses only context available to one workspace-level invocation
- **AND** does not branch on a child repository or require one child worktree path

#### Scenario: User writes a multi-target remove hook

- **WHEN** a user needs command-wide remove cleanup
- **THEN** guidance uses `ARASHI_REMOVE_TARGETS_JSON`
- **AND** labels comma-separated compatibility aggregates as lossy and non-canonical

#### Scenario: User relies on compatibility fields

- **WHEN** documentation lists legacy repository/worktree or comma-separated remove fields
- **THEN** it states they remain supported throughout 1.x
- **AND** says removal can occur no earlier than 2.0 through a separately approved breaking-change proposal

### Requirement: Hook activation and setup examples are safe and executable

Documentation SHALL show one-to-one lifecycle example activation, explicit POSIX executable mode, native Windows lifecycle activation, and the POSIX `.arashi/setup.sh.example` setup path. It SHALL state that this change does not introduce a native Windows setup example and SHALL NOT recommend copying multiple examples to one filename or setting Git `core.hooksPath` to the Arashi lifecycle directory.

#### Scenario: POSIX user activates one hook

- **WHEN** a POSIX user copies the documented command verbatim
- **THEN** exactly one chosen example becomes an executable active hook

#### Scenario: User activates setup

- **WHEN** a POSIX user follows setup-example guidance
- **THEN** `.arashi/setup.sh.example` becomes `.arashi/setup.sh`
- **AND** guidance relies on setup cwd rather than lifecycle-hook variables

### Requirement: Recommended setup code follows repository package provenance

Node setup examples SHALL instruct users to follow the committed `packageManager` and lockfile rather than infer npm from `package.json`. Coordinated pnpm examples SHALL set `CI=true` with syntax native to the documented shell, use pinned Corepack pnpm, and avoid selecting an ancestor workspace; Python examples SHALL bind pip to the activated interpreter.

#### Scenario: Coordinated pnpm child is provisioned

- **WHEN** a pnpm child worktree is nested beneath a different ancestor pnpm workspace
- **THEN** the recommended hook sets `CI=true` using native syntax and runs `corepack pnpm --ignore-workspace install --frozen-lockfile`
- **AND** POSIX, PowerShell, and command-script examples use their own environment-assignment forms

#### Scenario: Python virtual environment is provisioned

- **WHEN** a pip-based example installs requirements
- **THEN** it creates/activates the virtual environment and invokes `python -m pip`

### Requirement: Canonical and generated hook guidance remain semantically identical

Hook aliases, lifecycle timing, activation, timeout, platform, package-manager, and failure claims SHALL be checked from canonical docs through generated Markdown/LLM exports rather than maintained as unaudited prose copies.

#### Scenario: Canonical hook guidance changes

- **WHEN** hook guidance is updated
- **THEN** generated routes and `llms-full.txt` are regenerated from canonical sources
- **AND** focused freshness/semantic checks reject stale aliases or behavior claims

### Requirement: Canonical hook guidance publishes the terminal-input contract

Canonical lifecycle-hook guidance SHALL document `ARASHI_HOOK_INPUT=tty|disabled|unavailable`, TTY eligibility, `--no-hook-input`, JSON precedence, immediate EOF for disabled and unavailable modes, timeout while waiting, attribution and sequential prompts, and native Bash `read`, PowerShell `Read-Host`, and cmd `set /p` examples. Source documentation and generated agent exports SHALL remain semantically identical. Guidance SHALL state that the policy is invocation-only in this slice and SHALL warn users not to enter passwords, tokens, or other secrets into hook prompts.

#### Scenario: User determines whether a hook can read input

- **WHEN** a user reads canonical hook, create, remove, standalone, or JSON automation guidance
- **THEN** the documented matrix identifies the effective input mode and stdin behavior
- **AND** JSON is unambiguously authoritative over terminal availability

#### Scenario: Native-shell examples are published safely

- **WHEN** guidance demonstrates Bash, PowerShell, or cmd input
- **THEN** each example checks `ARASHI_HOOK_INPUT` before reading
- **AND** warns against entering secrets or implying that Arashi stores answers

#### Scenario: Generated guidance drifts from source

- **WHEN** a source page and generated export disagree on mode values, option ownership, EOF, or security guidance
- **THEN** documentation validation fails before release

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

### Requirement: Canonical hook guidance explains inline configuration safely

Canonical hooks and configuration guidance SHALL document root `hooks.scripts.<lifecycle>` workspace ownership and `repos.<name>.hooks.<lifecycle>` repository ownership for all four lifecycles, string-as-Bash shorthand, supported interpreter maps, deterministic POSIX/Windows selection, availability failure, and same-location inline/file ambiguity. It SHALL distinguish short reviewable inline commands from substantial native files, state that user-global/standalone hooks remain file-only, and MUST NOT teach encoded lifecycle/repository keys, external script paths, terminal selection, or inline secrets.

#### Scenario: User chooses inline or file source

- **WHEN** a user reads hook workflow guidance
- **THEN** it recommends inline config for short reviewable commands and native files for substantial scripts
- **AND** explains that only one source may claim one logical location

#### Scenario: User configures ownership

- **WHEN** a user follows workspace and repository examples
- **THEN** all examples use root `hooks.scripts` or `repos.<name>.hooks`
- **AND** no example uses `pre-create.<repo>` as a config key

#### Scenario: User evaluates portability

- **WHEN** guidance shows an interpreter map
- **THEN** it documents POSIX Bash and Windows PowerShell → cmd → Bash selection/availability
- **AND** states that snippets are non-portable unless compatible variants are supplied

### Requirement: Inline guidance preserves lifecycle and execution policy

Canonical guidance SHALL state that inline sources occupy existing lifecycle locations and preserve exact create/remove timing, cwd, per-target multiplicity, ordering, create-only `--no-hooks`, shared `--no-hook-input`, effective timeout, TTY/immediate-EOF behavior, JSON-owned quiet/isolation, command-specific dry-run behavior, create rollback, pre-remove destructive gating, post-remove finalization, and outcome semantics. It SHALL state that remove does not gain `--no-hooks`, remove dry-run preserves source-aware previews, and configured-create dry-run preserves no hook discovery, an empty ledger, and no preview surface. Environment examples SHALL use `$ARASHI_*` for Bash, `$env:ARASHI_*` for PowerShell, and `%ARASHI_*%` for cmd, SHALL omit `ARASHI_HOOK_SOURCE_PATH` expectations for inline sources, and SHALL compose multiple commands fail-fast so a later success cannot mask an earlier failure.

#### Scenario: User writes native variants

- **WHEN** documentation shows equivalent Bash, PowerShell, and cmd snippets
- **THEN** each uses shell-native environment syntax and fail-fast composition
- **AND** does not embed secrets

#### Scenario: User previews or automates hooks

- **WHEN** a user reads dry-run or JSON guidance
- **THEN** it explains non-execution, source-kind/owner previews, one-document stdout, immediate EOF, and no snippet disclosure

### Requirement: Canonical and generated inline guidance remain aligned

CLI-maintained hook/configuration documentation, website canonical pages, generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL publish the same normalized inline-hook ownership, value, interpreter, ambiguity, lifecycle, security, and automation semantics. Generated exports SHALL be regenerated from canonical sources and checked through the existing stable docs semantic aggregate rather than edited as independent prose.

#### Scenario: Canonical inline guidance changes

- **WHEN** inline-hook docs are updated
- **THEN** generated agent-readable exports are regenerated
- **AND** focused semantic/freshness checks reject stale ownership, selection, ambiguity, lifecycle, or no-disclosure claims

### Requirement: Public docs explain repository file materialization proportionately

Canonical website configuration and create-workflow guidance SHALL explain direct repository `copy` and `symlink` arrays, identical relative source/destination paths, canonical source checkout ownership, copy-before-symlink timing between repository pre/post-create, visible missing-source skips, no-overwrite/path-safety behavior, dry-run/doctor discovery, and configured-only scope. Public prose SHALL remain outcome-oriented and SHALL route exhaustive rollback and diagnostic schemas to contracts rather than duplicating implementation internals.

#### Scenario: User copies local configuration

- **WHEN** a user follows configuration guidance for independently mutable `.env` or local settings
- **THEN** docs recommend `copy` and show a concise direct-array example
- **AND** explain that a missing machine-local source skips visibly

#### Scenario: User shares cache state

- **WHEN** a user follows guidance for intentionally shared state
- **THEN** docs explain `symlink`, shared mutation, platform capability, and no-fallback behavior
- **AND** do not imply hard links or Windows junctions

#### Scenario: User considers dependency directories

- **WHEN** docs discuss `node_modules` or equivalent dependencies
- **THEN** they recommend content-addressed package-manager stores and per-worktree installs for normal use
- **AND** label symlinked dependency trees advanced and risky

#### Scenario: User needs unsupported flexibility

- **WHEN** the required setup needs remapping, globs, external sources, conditions, interpolation, or generated values
- **THEN** docs route the user to lifecycle hooks
- **AND** do not expand the first-class schema beyond its constrained contract

### Requirement: Docs materialization semantics use stable aggregate validation

A focused docs semantic checker SHALL be directly executable and registered under the existing fail-closed docs aggregate. It SHALL validate maintained Markdown and generated exports for canonical field names, lifecycle/source ownership, safety/fallback boundaries, configured-only scope, and copy-versus-symlink guidance.

#### Scenario: Maintained docs drift

- **WHEN** canonical prose or generated exports contradict one protected materialization semantic
- **THEN** the focused checker and docs aggregate fail with an owning-path diagnostic

#### Scenario: Checker is added

- **WHEN** materialization coverage is registered without workflow topology changes
- **THEN** existing docs aggregate and coordinated validation execute it
- **AND** authoritative workflow YAML does not add a feature-specific checker step

### Requirement: Public docs explain optional add onboarding proportionately

Canonical website onboarding, add-command, and configuration guidance SHALL explain that eligible human `aw add` invocations offer one default-no repository setup flow for canonical direct `copy`, `symlink`, and repository lifecycle hooks before final mutation. Hook guidance SHALL offer an exclusive inline command or editable active native script per lifecycle, explain that generated scripts are installed at exact canonical filenames as safe no-ops with runtime-ready permissions and require no rename/chmod activation, and distinguish active-configuration-root repository-specific create paths from runtime-resolved configured-target remove paths, including the active child worktree in linked mode. Guidance SHALL distinguish top-level decline from cancellation, state that automation/non-TTY/`--json`/`--force` preserve minimal add, explain that suggestions are unselected and content-free, route exhaustive field, rollback, and security semantics to their owning references, and route later supported existing-workspace changes to `aw configure` without claiming add edits existing entries.

#### Scenario: User onboards a repository

- **WHEN** a user follows maintained add or onboarding guidance
- **THEN** the user can tell when the optional prompt appears and which repository-owned sections it can configure
- **AND** the guidance does not imply workspace-root configuration, automatic selection, inferred commands, or existing-entry editing through add

#### Scenario: User chooses copy or symlink

- **WHEN** docs describe ignored local-path suggestions and manual entry
- **THEN** they preserve canonical same-relative-path, source ownership, validation, copy-versus-symlink, dependency-sharing, and no-fallback guidance
- **AND** state that Arashi never reads or displays candidate contents

#### Scenario: User configures hooks

- **WHEN** docs describe lifecycle-hook onboarding
- **THEN** they list canonical repository lifecycles and the exclusive inline-or-file choice
- **AND** inline guidance uses canonical Bash/platform variants and user-supplied commands
- **AND** file guidance describes exact active paths, safe no-op scaffolds, no-overwrite behavior, immediate executable readiness, and manual editing without rename/chmod activation
- **AND** summaries identify inline lifecycle/interpreter presence or generated-script lifecycle/path/executable state without bodies or generated contents

#### Scenario: User needs later configuration changes

- **WHEN** guidance discusses updating an already registered repository or another supported workspace setting
- **THEN** it directs the user to `aw configure` rather than claiming `add` edits existing entries
- **AND** preserves direct JSON guidance for unsupported fields

### Requirement: Docs onboarding semantics use stable aggregate validation

A focused docs semantic checker SHALL be directly executable and registered under the existing fail-closed docs aggregate. It SHALL validate maintained Markdown and generated exports for prompt eligibility, default-no/minimal decline, canonical repository field/action scope, unselected content-free suggestions, exclusive inline-or-file hooks, exact active paths, safe no-op content, runtime-ready permissions/no manual activation, no-overwrite/rollback ownership, user-supplied inline commands, sanitized summaries, one config save, cancellation, and #316 scope separation.

#### Scenario: Maintained onboarding docs drift

- **WHEN** canonical prose or generated exports contradict one protected onboarding semantic
- **THEN** the focused checker and docs aggregate fail with an owning-path diagnostic
- **AND** no feature-specific workflow step is required

### Requirement: Public configuration guidance owns the configure workflow

Canonical website guidance SHALL explain proportionately that `aw configure` inspects supported existing-workspace settings, distinguishes configured from effective values, and applies confirmed interactive changes. One owning command or configuration page SHALL describe explicit scope selection, keep/edit/clear, exact JSON preview, separate active-file planning, TTY editing, and non-mutating JSON inspection without duplicating implementation internals across discovery surfaces.

#### Scenario: User needs to change supported configuration

- **WHEN** a user reads canonical configuration guidance
- **THEN** the guidance directs them to `aw configure` and identifies the supported scope families
- **AND** preserves direct JSON guidance for unsupported fields rather than calling the command a generic schema editor

#### Scenario: User needs automation

- **WHEN** a user reads invocation guidance
- **THEN** it states that `--json` is inspection-only and interactive editing requires a TTY
- **AND** does not advertise broad non-interactive set or unset flags
