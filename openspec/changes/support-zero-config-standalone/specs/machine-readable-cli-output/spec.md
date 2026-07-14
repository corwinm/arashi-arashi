## ADDED Requirements

### Requirement: JSON-capable commands identify standalone workspace context
Commands that support `--json` in implicit standalone mode SHALL include stable additive workspace metadata without changing the existing envelope schema version or stdout-isolation contract.

#### Scenario: Standalone command succeeds in JSON mode
- **WHEN** a JSON-capable lifecycle command succeeds in an implicit standalone workspace
- **THEN** stdout contains exactly one JSON envelope
- **AND** command data identifies standalone mode, the main repository root, and `.worktrees` base where relevant
- **AND** no human discovery, progress, warning, or bootstrap text is mixed into stdout

#### Scenario: Invalid persisted config blocks fallback
- **WHEN** `.arashi/config.json` exists but is invalid and a JSON-capable command is invoked beside `.worktrees/`
- **THEN** stdout contains exactly one JSON error envelope preserving the configuration failure
- **AND** error details do not claim standalone fallback

#### Scenario: Configured workspace takes precedence
- **WHEN** valid configuration and `.worktrees/` both exist
- **THEN** JSON workspace metadata identifies configured mode and configured paths
- **AND** does not identify the invocation as implicit standalone

### Requirement: Zero-config bootstrap reports structured plans and results
`arashi init --zero-config --json` and its dry-run variant SHALL report directory and ignore-source actions through the standard single-document JSON envelope.

#### Scenario: Dry-run plans directory and exclude changes
- **WHEN** a user runs `arashi init --zero-config --dry-run --json` in an eligible repository that needs both actions
- **THEN** data identifies `dryRun: true`, main repository root, planned `.worktrees/` creation, planned repository-local exclude target and rule, and unchanged final state
- **AND** no filesystem or Git configuration mutation occurs

#### Scenario: Existing effective rule is reported
- **WHEN** zero-config bootstrap finds a tracked, repository-local, or global rule that already ignores `.worktrees/`
- **THEN** data identifies the effective source and unchanged ignore action
- **AND** does not claim that Arashi wrote another source

#### Scenario: Bootstrap succeeds
- **WHEN** zero-config bootstrap applies one or more changes
- **THEN** data reports attempted and final changed state for the directory and local exclude separately
- **AND** stdout remains exactly one JSON document

#### Scenario: Incompatible option fails before mutation
- **WHEN** `--zero-config` is combined with an incompatible initialization option in JSON mode
- **THEN** stdout contains one structured usage-error envelope identifying the conflicting option
- **AND** error details report that no zero-config action was applied

#### Scenario: Bootstrap rollback completes
- **WHEN** bootstrap mutates local state, later fails, and restores prior state
- **THEN** error details report attempted and restored actions plus final unchanged state
- **AND** preserve both the original failure and any restoration warning

### Requirement: Standalone create reports ignore blockers structurally
Standalone create and dry-run JSON results SHALL expose effective ignore safety before worktree mutation.

#### Scenario: Dry-run is blocked by unignored destination
- **WHEN** a user runs `arashi create <branch> --dry-run --json` and the exact normalized `.worktrees/<branch>` destination is not effectively ignored
- **THEN** stdout contains one structured blocked/error envelope identifying the exact destination, the missing effective source, and repair commands
- **AND** data or error details confirm that no branch, worktree, ignore, or config mutation occurred

#### Scenario: Create uses an existing effective rule
- **WHEN** standalone create JSON mode succeeds because a tracked, local, or global rule effectively ignores the exact destination
- **THEN** data identifies the effective source and created `.worktrees/<branch>` path
- **AND** does not report configured child repositories or a repository-name path prefix

## MODIFIED Requirements

### Requirement: Handoff JSON results

The Arashi CLI SHALL provide structured JSON results for `arashi handoff --json` from configured coordinated or implicit standalone workspaces using the standard single-document JSON envelope and stdout-isolation contract.

#### Scenario: Configured handoff JSON succeeds
- **WHEN** a user runs `arashi handoff --json` from a configured coordinated workspace
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "handoff"`
- **AND** the data object includes configured workspace metadata, effective options, per-repository status records, caller-supplied links, validations, todos, risks, next commands, and aggregate status totals
- **AND** no Markdown report, progress text, prompts, or color control sequences are mixed into stdout

#### Scenario: Standalone handoff JSON succeeds
- **WHEN** a user runs `arashi handoff --json` from an implicit standalone workspace
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true` and `command: "handoff"`
- **AND** data identifies standalone mode, main repository root, caller worktree, branch, and worktree status without inventing configured child repositories

#### Scenario: Handoff JSON preserves supplied context
- **WHEN** a user runs `arashi handoff --json --link <link> --validation <entry> --todo <item> --risk <item> --next-command <command>`
- **THEN** the JSON payload preserves each supplied value in structured arrays
- **AND** the payload distinguishes user-supplied validation evidence from commands that Arashi itself executed

#### Scenario: Handoff JSON reports workspace resolution errors
- **WHEN** a user runs `arashi handoff --json` outside configured and implicit standalone Arashi workspaces
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false` and `command: "handoff"`
- **AND** the structured error explains configured initialization and zero-config standalone preparation where applicable
- **AND** the process exits non-zero

#### Scenario: Handoff JSON remains non-interactive and non-mutating
- **WHEN** a user runs `arashi handoff --json` in a dirty configured or standalone workspace
- **THEN** the command does not prompt for confirmation
- **AND** the command does not stage, commit, push, delete, create config, write ignore state, write report files, or run validation commands
- **AND** dirty repository details are represented in the JSON payload for automation to inspect
