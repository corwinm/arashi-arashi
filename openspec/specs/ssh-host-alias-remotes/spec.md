# ssh-host-alias-remotes Specification

## Purpose
Define how Arashi accepts, preserves, and documents opaque Git SSH host-alias remotes across add and clone while retaining existing protocol-inference and command-safety boundaries.

## Requirements
### Requirement: Add accepts supported SSH host alias remotes
The system SHALL accept Git SSH remotes in `ssh://[user@]host/path` and `[user@]host:path` forms, including SCP-style host aliases without an explicit user, and SHALL treat the host token as opaque.

#### Scenario: SCP-style alias includes an explicit user
- **WHEN** the user runs `arashi add git@work-github:acme/api.git`
- **THEN** Arashi accepts the URL as an SSH remote
- **AND** derives `api` as the default repository name

#### Scenario: SCP-style alias omits the user
- **WHEN** the user runs `arashi add work-github:acme/api.git`
- **THEN** Arashi accepts the URL as an SSH remote
- **AND** derives `api` as the default repository name

#### Scenario: SSH scheme uses an alias
- **WHEN** the user runs `arashi add ssh://git@work-github/acme/api.git`
- **THEN** Arashi accepts the URL as an SSH remote
- **AND** derives `api` as the default repository name

#### Scenario: SSH scheme omits the user
- **WHEN** the user runs `arashi add ssh://work-github/acme/api.git`
- **THEN** Arashi accepts the URL as an SSH remote
- **AND** derives `api` as the default repository name

#### Scenario: SSH scheme includes an explicit port
- **WHEN** the user runs `arashi add ssh://git@work-github:2222/acme/api.git`
- **THEN** Arashi accepts the URL as an SSH remote
- **AND** preserves the exact `work-github:2222` authority

#### Scenario: Explicit repository name overrides derivation
- **WHEN** the user adds any supported SSH alias remote with `--name service-api`
- **THEN** Arashi uses `service-api` as the configured repository name
- **AND** preserves the supplied remote URL

### Requirement: SCP-style recognition remains unambiguous with local paths
The system MUST require a non-empty SCP host and path and MUST NOT classify Windows drive syntax, whitespace-bearing values, or malformed colon strings as SSH remotes.

#### Scenario: Windows drive path is not treated as an alias remote
- **WHEN** URL validation receives either `C:\work\api.git` or `C:/work/api.git`
- **THEN** Arashi does not classify either Windows drive form as an SCP-style SSH remote
- **AND** platform-independent parser tests enforce both cases

#### Scenario: Alias remote uses a single repository segment
- **WHEN** URL validation receives `work-github:api.git`
- **THEN** Arashi accepts it as an SCP-style SSH remote
- **AND** derives `api` as the default repository name

#### Scenario: Alias remote lacks a repository path
- **WHEN** URL validation receives `work-github:`
- **THEN** Arashi rejects it as an unsupported Git URL form

#### Scenario: Alias remote contains whitespace
- **WHEN** URL validation receives `work github:acme/api.git`
- **THEN** Arashi rejects it as an unsupported Git URL form

### Requirement: SSH hosts remain opaque and URLs remain exact
The system MUST delegate SSH host resolution and authentication to Git/OpenSSH and MUST NOT read or resolve SSH configuration. `add` SHALL trim outer whitespace once and SHALL use that same normalized URL for Git argv, result output, and configuration persistence. `clone` SHALL preserve an already-configured SSH URL byte-for-byte whenever protocol conversion is unnecessary or forbidden.

#### Scenario: Add stores an alias remote
- **WHEN** `arashi add` successfully clones `ssh://deploy@work.example/acme/api.git`
- **THEN** the persisted `gitUrl` is exactly `ssh://deploy@work.example/acme/api.git`
- **AND** Arashi does not replace the alias, username, scheme, path, or suffix

#### Scenario: Add receives outer whitespace
- **WHEN** the add argument contains outer whitespace around `git@work-github:acme/api.git`
- **THEN** Arashi trims the outer whitespace once
- **AND** passes, returns, and persists exactly `git@work-github:acme/api.git`

#### Scenario: Existing SSH preference matches an alias URL
- **WHEN** clone protocol preference is SSH
- **AND** a selected configured repository already has an SSH alias URL
- **THEN** Arashi uses that configured value byte-for-byte rather than trimming or reconstructing it

#### Scenario: Omitted-user alias contributes to protocol inference
- **WHEN** configured repository metadata contains `work-github:acme/api.git`
- **AND** all other recognized configured URLs are SSH URLs
- **THEN** clone protocol inference classifies the omitted-user alias as SSH
- **AND** returns the unambiguous SSH preference without prompting

#### Scenario: SSH configuration remains outside Arashi ownership
- **WHEN** Arashi validates, adds, or clones an SSH alias remote
- **THEN** it does not read, invoke, edit, or persist data from SSH configuration
- **AND** it does not perform an independent SSH connectivity probe

### Requirement: Protocol preference cannot fabricate an HTTPS alias URL
The system MUST preserve every configured SSH URL when HTTPS is inferred or selected because an SSH host token has no trustworthy automatic HTTPS mapping. HTTPS-to-SSH conversion MAY retain the existing conventional `git@host:path.git` transformation for configured HTTPS URLs.

#### Scenario: HTTPS is selected in a mixed workspace
- **WHEN** the user selects HTTPS for a clone run containing `git@work-github:acme/api.git`
- **THEN** Arashi clones that repository with `git@work-github:acme/api.git`
- **AND** does not construct `https://work-github/acme/api.git`

#### Scenario: HTTPS source is converted to SSH
- **WHEN** SSH is inferred or selected for `https://github.example/acme/api.git`
- **THEN** Arashi may clone with `git@github.example:acme/api.git`

#### Scenario: Mixed run remains mixed for safety
- **WHEN** HTTPS is selected for a run containing both HTTPS and SSH configured URLs
- **THEN** HTTPS URLs remain HTTPS
- **AND** SSH URLs remain exact SSH URLs
- **AND** user-facing protocol-selection guidance does not promise that SSH sources will be rewritten

#### Scenario: Non-convertible URI schemes do not imply SSH
- **WHEN** clone protocol inference receives `file://` or `git://` configured URLs
- **THEN** those URLs do not contribute an SSH protocol preference
- **AND** they do not turn an otherwise HTTPS-only selection into a mixed-protocol prompt

### Requirement: Alias failures preserve existing command safety boundaries
The system SHALL report the affected repository and underlying Git failure when an alias cannot be resolved or authenticated, while preserving the existing add rollback and clone per-repository partial-success contracts.

#### Scenario: Add cannot clone an alias remote
- **WHEN** Git fails while `arashi add` clones an unavailable SSH alias
- **THEN** Arashi reports the add failure with the repository context
- **AND** applies the existing documented rollback boundary to configuration, clone, setup, and managed-ignore state

#### Scenario: One alias clone fails in a multi-repository run
- **WHEN** `arashi clone` processes multiple selected repositories
- **AND** Git fails for one SSH alias remote
- **THEN** Arashi reports that repository in the failed results
- **AND** continues processing the remaining selected repositories
- **AND** preserves the existing human and JSON output envelopes

### Requirement: Guidance explains portability and Git-native rewriting
Canonical user and agent guidance SHALL explain that SSH aliases are machine-local, that every machine using a stored alias must define compatible SSH routing, and that portable shared configuration SHOULD use canonical remotes with machine-global Git `url.<base>.insteadOf` rewriting (for example, `git config --global` or `~/.gitconfig`) when per-developer routing is required. Repository-local `.git/config` MUST NOT be presented as sufficient because it is unavailable before the repository is cloned.

#### Scenario: User reviews add or clone guidance
- **WHEN** maintained documentation describes SSH alias support
- **THEN** it shows supported explicit-user, omitted-user, and `ssh://` forms
- **AND** states that Arashi does not manage or resolve SSH configuration

#### Scenario: Team needs portable committed configuration
- **WHEN** maintained guidance discusses shared Arashi configuration
- **THEN** it recommends a canonical committed remote plus a machine-global Git `insteadOf` rule as the portable alternative
- **AND** does not imply that Arashi synchronizes aliases, keys, or SSH settings

### Requirement: CLI help and generated command contracts identify alias syntax
The `add` command help and source-derived generated CLI command contract SHALL identify `[user@]host:path` with an optional user and `ssh://[user@]host/path` as supported SSH forms.

#### Scenario: User inspects add help
- **WHEN** the user runs `arashi add --help`
- **THEN** the Git URL argument guidance identifies SCP-style SSH remotes with an optional user
- **AND** does not imply that only `git@host:path` is supported

#### Scenario: CLI command contract is generated
- **WHEN** the deterministic CLI command contract is generated from the Commander program
- **THEN** the `add` positional argument description includes the optional-user SCP syntax
- **AND** contract freshness fails if generated metadata does not match current help
