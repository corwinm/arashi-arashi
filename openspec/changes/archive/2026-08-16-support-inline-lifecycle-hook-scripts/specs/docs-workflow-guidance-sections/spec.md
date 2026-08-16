## ADDED Requirements

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
