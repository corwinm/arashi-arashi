# workspace-health-diagnostics Specification

## Purpose
Define Arashi's non-mutating workspace health diagnostics so users and agents can identify configuration, repository, worktree, hook, shell, and install/update issues before attempting corrective actions.
## Requirements
### Requirement: Doctor command performs non-mutating workspace diagnostics

The system SHALL provide `arashi doctor` as a non-mutating health check for the current Arashi workspace.

#### Scenario: Doctor runs in a healthy workspace
- **WHEN** the user runs `arashi doctor` in an Arashi workspace with valid configuration, present repositories, no blocking repository failures, no stale worktree metadata, and no blocking hook problems
- **THEN** the command reports that the workspace has no blocking health findings
- **AND** the command exits successfully
- **AND** the command does not modify configuration, repositories, worktrees, hooks, shell startup files, install state, or update state

#### Scenario: Doctor is run outside a workspace
- **WHEN** the user runs `arashi doctor` outside an Arashi workspace
- **THEN** the command reports a blocking finding that no Arashi workspace was found
- **AND** the command suggests initializing or switching to an Arashi workspace where practical
- **AND** the command exits non-zero

#### Scenario: Doctor checks invalid configuration
- **WHEN** the user runs `arashi doctor` and `.arashi/config.json` is missing, unreadable, malformed, or fails supported configuration validation
- **THEN** the command reports a blocking configuration finding with a stable code
- **AND** the finding identifies the affected configuration path when available
- **AND** the command exits non-zero

### Requirement: Doctor reports repository health findings

The system SHALL inspect configured repositories and report health findings for missing repositories, dirty worktrees, detached heads, genuinely unconfigured branches, configured upstreams that Git cannot resolve because their remote fetch mapping does not populate the expected tracking namespace, upstream divergence, and default-branch drift. Doctor SHALL preserve strict Git upstream semantics for divergence.

#### Scenario: Configured child repository is missing
- **WHEN** the user runs `arashi doctor` in a workspace where a configured child repository path is absent
- **THEN** the command reports a finding with a stable missing-repository code
- **AND** the finding identifies the repository name and expected path
- **AND** the finding suggests `arashi clone` or an equivalent targeted clone command

#### Scenario: Repository has uncommitted changes
- **WHEN** the user runs `arashi doctor` and a configured repository has staged, unstaged, or untracked changes
- **THEN** the command reports a repository finding that identifies the dirty repository
- **AND** the finding summarizes the changed-file categories without requiring full file-by-file output
- **AND** the finding suggests inspecting `arashi status --verbose` or the repository's Git status

#### Scenario: Repository branch state needs attention
- **WHEN** the user runs `arashi doctor` and a configured repository is detached, genuinely lacks upstream configuration, is ahead of its strict Git upstream, is behind its strict Git upstream, has a missing remote ref, or is behind its default branch
- **THEN** the command reports a repository finding with a stable branch-state code
- **AND** the finding identifies the affected repository and branch relationship when known
- **AND** the finding suggests an appropriate follow-up command such as `arashi status`, `arashi pull`, `arashi push`, or a Git branch command where practical

#### Scenario: Bare-backed linked worktree has an unusable configured upstream
- **WHEN** doctor inspects a non-detached linked worktree backed by a bare clone
- **AND** the local branch has a non-local configured remote and `refs/heads/*` merge target
- **AND** the corresponding `refs/remotes/<remote>/<branch>` ref exists but strict `@{upstream}` resolution fails
- **AND** no positive fetch refspec for that remote maps the configured merge source to the expected remote-tracking destination
- **THEN** doctor emits warning code `REPOSITORY_UPSTREAM_TRACKING_UNAVAILABLE` instead of `REPOSITORY_NO_UPSTREAM`
- **AND** structured details identify the repository, path, local branch, configured remote, merge ref, expected remote-tracking ref, and missing-fetch-mapping reason
- **AND** on non-Windows platforms, when no positive fetch refspec either maps another source to the expected remote-tracking destination or a ref-namespace ancestor or descendant, or maps the configured merge source to another destination, and no negative or source-only or empty-destination fetch refspec matching the configured merge source, and no malformed fetch refspec, requires manual review, suggested commands, in order, add a branch-specific fetch mapping, fetch the configured remote using an option terminator, and set the local branch upstream to `<remote>/<branch>` using an option terminator before the branch operand
- **AND** human output explains why branch configuration alone is unusable
- **AND** JSON output carries the same stable finding without human-output contamination
- **AND** the topology-specific inspection performs no fetch or Git mutation beyond doctor's existing repository-status collection
- **AND** doctor does not change Git configuration, branches, or worktrees as part of reporting or remediation

#### Scenario: Existing fetch mappings conflict away from the expected destination
- **WHEN** two existing positive fetch mappings can target the same or conflicting ref namespaces
- **THEN** doctor requires manual resolution before suggesting any configuration mutation or fetch
- **AND** the conflicting configured mappings are retained as evidence

#### Scenario: Empty effective merge value requires manual resolution
- **WHEN** a multi-valued `branch.<name>.merge` configuration has an empty or invalid effective first value
- **THEN** doctor preserves all configured values as evidence and requires manual resolution
- **AND** it does not emit an upstream mutation that would merely append another ineffective value

#### Scenario: Destinationless wildcards require manual resolution
- **WHEN** a configured source-only or empty-destination fetch refspec contains a wildcard
- **THEN** doctor treats the refspec as unsafe for automatic remediation
- **AND** it does not suggest a subsequent fetch that Git would reject as an invalid refspec

#### Scenario: Multiple merge refs use Git's effective value
- **WHEN** a configured branch has multiple `branch.<name>.merge` values and strict upstream resolution fails
- **THEN** read-only topology inspection diagnoses the first configured merge value used by Git
- **AND** remediation does not target a later ineffective merge value or append a duplicate merge value

#### Scenario: Generic refresh failure retains topology diagnosis
- **WHEN** status refresh fails while updating a configured remote-tracking ref and the parsed branch relationship retains a configured-but-gone upstream label
- **AND** read-only topology inspection identifies missing or conflicting fetch coverage
- **THEN** doctor emits the topology-aware upstream finding in addition to the generic refresh warning
- **AND** a proven missing-remote-ref warning still takes precedence over topology diagnosis

#### Scenario: Conflicting fetch destination requires manual resolution
- **WHEN** the configured upstream is diagnosed as unresolvable because no positive fetch refspec maps the configured merge source to the expected remote-tracking destination
- **AND** one or more positive exact or wildcard fetch refspecs map another source to that expected destination or a ref-namespace ancestor or descendant, or map the configured merge source to another destination, or a negative or source-only or empty-destination configured fetch refspec matching the merge source, a whitespace-bearing value, or a structurally malformed or Git-refname-invalid configured fetch refspec makes automatic repair unsafe
- **THEN** the topology-aware finding details list the conflicting configured refspecs
- **AND** the finding explains that the fetch mappings require manual review
- **AND** on non-Windows platforms, its only suggested command reads all `remote.<remote>.fetch` values
- **AND** it does not recommend an automatic configuration mutation, fetch, or upstream change that could delete unrelated wildcard coverage, create a duplicate-destination or ref-namespace collision fetch failure, leave Git resolving through a pre-existing noncanonical source mapping, ignore a matching negative exclusion or source-only or empty-destination mapping, or retain a malformed refspec that makes fetch fail

#### Scenario: Windows shell dialect is ambiguous
- **WHEN** the topology-aware finding is emitted on Windows
- **THEN** it preserves the same structured evidence and explanatory diagnosis
- **AND** it explains that equivalent Git commands must be run in the user's active Windows shell
- **AND** it emits no shell-ambiguous copy-paste command strings because PowerShell, Command Prompt, and Git Bash require incompatible escaping for valid Git-derived values

#### Scenario: Bare-backed branch has no upstream configuration
- **WHEN** doctor inspects a bare-backed linked worktree whose current branch lacks a configured non-local remote or valid `refs/heads/*` merge target
- **THEN** doctor retains the generic `REPOSITORY_NO_UPSTREAM` finding
- **AND** it does not claim that a fetch mapping is the diagnosed cause

#### Scenario: Configured remote branch is missing
- **WHEN** status refresh proves that the configured remote branch does not exist
- **THEN** doctor retains `REPOSITORY_MISSING_REMOTE_REF` as the authoritative topology-aware finding
- **AND** it does not also emit `REPOSITORY_UPSTREAM_TRACKING_UNAVAILABLE` for that branch

#### Scenario: Fetch mapping already covers the configured upstream
- **WHEN** a positive exact or wildcard remote fetch refspec maps the configured merge source to the expected remote-tracking destination
- **THEN** doctor does not emit `REPOSITORY_UPSTREAM_TRACKING_UNAVAILABLE`
- **AND** any remaining strict upstream failure is handled by existing conservative repository diagnostics

#### Scenario: Repository status check fails
- **WHEN** the user runs `arashi doctor` and Git status cannot be collected for a configured repository
- **THEN** the command reports a blocking repository finding with the underlying failure message
- **AND** the command continues collecting independent diagnostics for other repositories when safe
- **AND** the final command exits non-zero

### Requirement: Doctor reports stale worktree metadata

The system SHALL inspect Git-prunable worktree metadata across the workspace and report stale metadata without pruning it.

#### Scenario: Stale worktree metadata exists
- **WHEN** the user runs `arashi doctor` and one or more configured repositories contain Git-prunable worktree records
- **THEN** the command reports a stale-worktree finding for each affected repository
- **AND** each finding includes the stale worktree path and Git prune reason when available
- **AND** the finding suggests `arashi prune --dry-run` for review and `arashi prune` for cleanup
- **AND** the command does not run a mutating prune operation

#### Scenario: Stale worktree discovery fails
- **WHEN** the user runs `arashi doctor` and stale worktree discovery fails for a repository
- **THEN** the command reports a blocking stale-worktree diagnostic finding for that repository
- **AND** the command exits non-zero after completing independent checks when safe

### Requirement: Doctor validates hook configuration and hook files
The system SHALL use the same platform-native lifecycle discovery, case handling, ambiguity detection, interpreter preflight, executable requirements, and safety validation as runtime hook execution. Doctor SHALL report expected `.sh` candidates on POSIX and `.ps1`, `.cmd`, or `.bat` candidates on Windows without mutating files or configuration.

#### Scenario: Configured hook file is missing
- **WHEN** the user runs `arashi doctor` and a configured lifecycle location has no script supported by the current platform
- **THEN** the command reports a hook finding with a stable missing-hook code where that hook is required
- **AND** the finding identifies the hook name, scope, repository or workspace target, and platform-native expected paths

#### Scenario: Configured POSIX hook file is not executable
- **WHEN** the user runs `arashi doctor` on POSIX and a discovered hook file exists but cannot be executed by Arashi's hook runner
- **THEN** the command reports a hook finding with a stable hook-permission code
- **AND** the finding suggests a command such as `chmod +x <hook-path>` when that recommendation is safe

#### Scenario: Native Windows hook is healthy
- **WHEN** doctor discovers exactly one supported Windows lifecycle script and its required interpreter is available
- **THEN** doctor evaluates the same candidate as runtime discovery
- **AND** does not require a POSIX executable bit or report a missing `.sh` file

#### Scenario: Windows hook location is ambiguous
- **WHEN** doctor finds multiple case-insensitive `.ps1`, `.cmd`, or `.bat` candidates for one logical lifecycle location
- **THEN** it reports the same blocking ambiguity and candidate paths as runtime preflight

#### Scenario: Hook interpreter is unavailable
- **WHEN** doctor discovers a native hook but its required system interpreter is unavailable
- **THEN** it reports a blocking `interpreter_unavailable` finding before any hook is executed

#### Scenario: Hook validation detects unsafe or unsupported configuration
- **WHEN** the user runs `arashi doctor` and shared hook validation rejects a hook as unsafe or unsupported
- **THEN** the command reports a blocking hook finding with the validation reason
- **AND** the command exits non-zero

### Requirement: Doctor reports shell and install/update hints conservatively

The system SHALL include shell integration and install/update channel diagnostics only when they can be detected safely without modifying user environment state.

#### Scenario: Shell integration appears unavailable
- **WHEN** the user runs `arashi doctor` in an environment where Arashi can safely determine that parent-shell integration is unavailable or not loaded
- **THEN** the command reports a non-blocking shell-integration finding
- **AND** the finding suggests `arashi shell install` or `arashi shell init <shell>` where the shell is known

#### Scenario: Shell integration status is unknown
- **WHEN** the user runs `arashi doctor` and Arashi cannot safely determine shell integration status
- **THEN** the command does not report a blocking shell finding
- **AND** any shell-related message is informational and clearly states that status is unknown

#### Scenario: Install or update channel hint is available
- **WHEN** the user runs `arashi doctor` and Arashi can safely detect an install or update channel condition relevant to workspace health
- **THEN** the command reports a non-blocking install/update finding
- **AND** the finding suggests an appropriate follow-up command such as `arashi update --dry-run`, `arashi update --yes`, or install-channel documentation where practical

### Requirement: Doctor human output is actionable and grouped

The system SHALL format default `arashi doctor` output for humans by grouping findings by severity or diagnostic category and showing actionable next steps.

#### Scenario: Human output contains findings
- **WHEN** the user runs `arashi doctor` and findings are present
- **THEN** the output groups findings by severity or category
- **AND** each finding displays its code, affected scope, message, and suggested commands when available
- **AND** blocking findings are visually distinguishable from warnings and informational hints

#### Scenario: Human output has no findings
- **WHEN** the user runs `arashi doctor` and no findings are present
- **THEN** the output states that no workspace health findings were detected
- **AND** the command exits successfully

### Requirement: Doctor JSON output is stable for automation

The system SHALL support `arashi doctor --json` with a single structured JSON document that includes stable finding codes and summary counts.

#### Scenario: Doctor JSON succeeds with no blocking findings
- **WHEN** the user runs `arashi doctor --json` and no blocking findings are present
- **THEN** stdout contains exactly one valid JSON envelope with `ok: true`, `command: "doctor"`, and `schemaVersion: 1`
- **AND** the data object includes the workspace root, checked categories, findings array, and summary counts by severity
- **AND** stdout contains no human-readable progress, spinners, colors, tables, banners, or prompts

#### Scenario: Doctor JSON reports blocking findings
- **WHEN** the user runs `arashi doctor --json` and one or more blocking findings are present
- **THEN** stdout contains exactly one valid JSON envelope with `ok: false`, `command: "doctor"`, and `schemaVersion: 1`
- **AND** the error or data details include the findings array and summary counts by severity
- **AND** the process exits non-zero

#### Scenario: Doctor finding shape is stable
- **WHEN** the user parses a finding from `arashi doctor --json`
- **THEN** each finding includes at least `code`, `severity`, `category`, `message`, and `scope`
- **AND** suggested commands, paths, repository names, and raw diagnostic details are additive structured fields rather than replacements for the stable fields

### Requirement: Doctor reports managed ignore health without mutation
The system SHALL inspect configured managed ignore state during `arashi doctor`, SHALL emit stable findings for actionable problems, and SHALL NOT repair ignore files or clone-local Git configuration.

#### Scenario: Safe managed path is not ignored
- **WHEN** doctor finds a safe configured `reposDir` or `worktreesDir` with no effective tracked, repository-local, or global ignore rule
- **THEN** doctor reports a managed-ignore finding that identifies the path and effective scope
- **AND** the finding suggests an appropriate lifecycle command or explicit ignore-scope repair
- **AND** doctor does not modify any ignore file

#### Scenario: Stored ignore scope is invalid
- **WHEN** doctor finds an unsupported clone-local Arashi ignore-scope value
- **THEN** doctor reports a stable configuration finding with a command or Git-config repair suggestion
- **AND** doctor does not replace the stored value automatically

#### Scenario: Arashi-owned rule is stale
- **WHEN** doctor finds an entry inside an Arashi-managed ignore block that no longer corresponds to a current safe configured path
- **THEN** doctor reports a non-mutating stale managed-ignore finding identifying the rule and source file
- **AND** doctor preserves the entry and unrelated user-authored rules

#### Scenario: Configured path is unsafe to auto-ignore
- **WHEN** doctor finds a managed path that resolves to repository root, an absolute location, or parent traversal
- **THEN** doctor reports that Arashi will not automatically add an ignore rule for that path
- **AND** the finding distinguishes the safety skip from a missing safe rule

#### Scenario: Managed ignore state is healthy
- **WHEN** all safe configured managed paths have effective ignore rules and any stored scope is valid
- **THEN** doctor emits no managed-ignore warning or blocking finding

### Requirement: Doctor diagnoses implicit standalone workspaces
`arashi doctor` SHALL treat a resolved implicit standalone repository as a valid workspace, inspect its single-repository worktree health without mutation, and distinguish standalone findings from configured-workspace configuration findings.

#### Scenario: Healthy standalone workspace
- **WHEN** the user runs `arashi doctor` in a non-bare repository with `.worktrees/`, effective ignore coverage, valid Git state, and no stale worktree metadata
- **THEN** doctor reports no blocking standalone workspace finding
- **AND** identifies the workspace mode and main repository where applicable
- **AND** creates no `.arashi/` or ignore-file changes

#### Scenario: Standalone worktrees directory is not ignored
- **WHEN** doctor resolves implicit standalone mode but Git reports no effective ignore rule for `.worktrees/`
- **THEN** doctor emits a stable managed-ignore finding that identifies `.worktrees/`
- **AND** suggests `arashi init --zero-config` or a repository-local exclude repair
- **AND** does not repair the rule

#### Scenario: Synthetic repos directory is absent
- **WHEN** doctor runs in implicit standalone mode with the in-memory `reposDir: "./repos"` compatibility value
- **THEN** managed-ignore diagnostics inspect only the standalone `.worktrees/` convention
- **AND** do not report or repair a missing ignore rule for the synthetic, unused `./repos` path

#### Scenario: Invalid persisted config exists beside worktrees
- **WHEN** `.arashi/config.json` exists but is malformed or invalid and `.worktrees/` also exists
- **THEN** doctor reports the existing configuration failure as blocking
- **AND** does not diagnose the repository as a healthy implicit workspace

#### Scenario: Standalone stale metadata exists
- **WHEN** the standalone repository has Git-prunable worktree metadata
- **THEN** doctor reports the stale worktree path and reason with existing prune guidance
- **AND** does not prune it automatically

### Requirement: Doctor validates inline hooks through the runtime resolver without execution
For a valid configured workspace, `arashi doctor` SHALL enumerate configured create and remove logical locations and use the same source-ambiguity, platform/interpreter selection, availability, and file validation resolver as enabled runtime and remove dry-run. Inline/file ambiguity SHALL emit blocking code `HOOK_AMBIGUOUS` with exact detail keys `hookName`, `scope`, `sourceKinds`, `sourceOwnerKind`, `sourceOwnerName`, and nullable `sourceScriptPath`; unavailable compatible interpreters SHALL emit `HOOK_INTERPRETER_UNAVAILABLE` with the same logical identity plus configured interpreter keys. Doctor MUST NOT execute snippets, create temporary scripts, mutate config/files/repositories, or expose snippet text.

#### Scenario: Healthy inline configuration is diagnosed
- **WHEN** doctor resolves an unambiguous inline hook with an available compatible interpreter
- **THEN** it reports no blocking finding for that location
- **AND** invokes no hook subprocess

#### Scenario: Inline and file conflict
- **WHEN** doctor finds both sources at one configured logical location
- **THEN** it reports the same blocking ambiguity classification and candidates as runtime
- **AND** does not include the snippet

#### Scenario: Inline interpreter is unavailable
- **WHEN** doctor resolves no compatible available interpreter for a configured inline location
- **THEN** it reports blocking `interpreter_unavailable` from the shared resolver
- **AND** does not select a terminal application, `pwsh` fallback, or unconfigured interpreter

#### Scenario: Doctor JSON remains isolated
- **WHEN** inline-hook findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with structured findings
- **AND** stdout and stderr contain no snippet text or hook output

### Requirement: Doctor preserves file-only and standalone diagnostics
When no inline configuration exists, doctor SHALL preserve existing platform-native file diagnostics. Implicit standalone doctor SHALL continue to inspect only its established user-global/file-owned hook behavior and SHALL not invent inline configuration ownership.

#### Scenario: File-only workspace is checked
- **WHEN** doctor runs in an existing file-only configured or standalone fixture
- **THEN** finding codes, paths, platform handling, non-execution, and exit behavior remain backward-compatible

### Requirement: Doctor diagnoses configured worktree materialization without mutation
For configured repositories, `arashi doctor` SHALL use the shared materialization policy and path resolver to validate Git-primary canonical source-checkout availability, source existence, normalized collisions, destination containment, current managed-worktree destination shape, broken or misdirected configured links, and available non-mutating platform capability evidence. For `copy`, doctor SHALL classify only missing destination, unsafe ancestor, and source/destination file-versus-directory kind mismatch; a present compatible-kind copy has unprovable ownership and freshness and MUST NOT be called conflicting, stale, or healthy-by-content. Doctor MUST NOT read or hash file contents, execute hooks, create temporary probe links/directories, repair links, or otherwise mutate the filesystem.

Every materialization finding SHALL use one closed record below. Entry findings SHALL use scope `materialization:<repositoryId>:<action>:<normalizedPath>` for source-only state or `materialization:<repositoryId>:<normalizedWorktreePath>:<action>:<normalizedPath>` for a managed-worktree destination; repository-wide findings SHALL use `materialization:<repositoryId>:source-checkout` or `materialization:<repositoryId>:symlink-capability`. Every record's `details` SHALL contain `repositoryId`, `action`, `path`, and `worktreePath`, using `null` where the finding is repository-wide or has no managed-worktree target. Kind mismatch additionally SHALL contain `expectedKind` and `actualKind`; unsafe ancestor additionally SHALL contain `ancestorKind`. All materialization findings SHALL use `suggestedCommands: []`: diagnostics may explain a manual check, but doctor SHALL NOT advertise a universal repair command for machine-local files or platform policy.

| Code | Severity | Category | Meaning |
| --- | --- | --- | --- |
| `MATERIALIZATION_SOURCE_CHECKOUT_UNAVAILABLE` | `error` | `repository` | No usable Git-primary non-bare checkout exists. |
| `MATERIALIZATION_SOURCE_MISSING` | `info` | `repository` | An optional configured source is absent and create would skip it. |
| `MATERIALIZATION_COPY_DESTINATION_MISSING` | `warning` | `worktree` | A managed worktree lacks the configured copy destination. |
| `MATERIALIZATION_COPY_DESTINATION_KIND_MISMATCH` | `warning` | `worktree` | Source and destination file/directory kinds differ. |
| `MATERIALIZATION_DESTINATION_ANCESTOR_UNSAFE` | `error` | `worktree` | A destination ancestor is a link, junction/reparse equivalent, or non-directory. |
| `MATERIALIZATION_SYMLINK_BROKEN` | `warning` | `worktree` | A configured managed-worktree link does not resolve. |
| `MATERIALIZATION_SYMLINK_MISDIRECTED` | `warning` | `worktree` | A configured link does not target the exact canonical source path or expected source kind. |
| `MATERIALIZATION_SYMLINK_CAPABILITY_UNAVAILABLE` | `error` | `configuration` | Non-mutating evidence proves native symbolic links cannot be created under current policy. |
| `MATERIALIZATION_SYMLINK_CAPABILITY_UNKNOWN` | `info` | `configuration` | Capability cannot be established without a forbidden mutation probe. |

Only the `error` rows SHALL contribute to doctor's blocking count and nonzero exit status; these materialization warnings and info findings SHALL preserve zero exit status when no other error exists.

#### Scenario: Materialization configuration is healthy
- **WHEN** configured sources and managed-worktree destinations satisfy the materialization contract
- **THEN** doctor emits no blocking materialization finding
- **AND** does not read configured file contents

#### Scenario: Optional source is missing
- **WHEN** a configured source path is absent from the canonical checkout
- **THEN** doctor reports `MATERIALIZATION_SOURCE_MISSING` with the exact info/repository scope and details contract
- **AND** preserves the runtime rule that create may skip that source

#### Scenario: Canonical source checkout is unavailable
- **WHEN** a repository with materialization entries lacks a usable canonical source checkout
- **THEN** doctor reports `MATERIALIZATION_SOURCE_CHECKOUT_UNAVAILABLE` as an error/repository finding and exits nonzero

#### Scenario: Managed link is broken or misdirected
- **WHEN** an existing managed worktree has a configured symlink destination that is broken or does not target the exact canonical configured source path
- **THEN** doctor reports `MATERIALIZATION_SYMLINK_BROKEN` or `MATERIALIZATION_SYMLINK_MISDIRECTED` with the exact warning/worktree scope and details contract
- **AND** does not follow the link for repair or expose source contents

#### Scenario: Destination ancestor escapes
- **WHEN** a configured destination in an existing managed worktree traverses an existing link/junction ancestor or non-directory component
- **THEN** doctor reports `MATERIALIZATION_DESTINATION_ANCESTOR_UNSAFE` as an error/worktree finding with `ancestorKind` and exits nonzero

#### Scenario: Existing copied destination has a compatible kind
- **WHEN** an existing managed worktree contains a regular file or directory matching the configured copy source kind
- **THEN** doctor does not claim ownership, content equality, freshness, or a destination conflict
- **AND** performs no content read or hash comparison

#### Scenario: Existing copied destination has the wrong kind
- **WHEN** an existing managed worktree copy destination is missing or has a different file-versus-directory kind from its source
- **THEN** doctor reports `MATERIALIZATION_COPY_DESTINATION_MISSING` or `MATERIALIZATION_COPY_DESTINATION_KIND_MISMATCH` with the exact warning/worktree details it can prove

#### Scenario: Symlink capability is proven unavailable
- **WHEN** non-mutating platform evidence proves configured symbolic links cannot be created
- **THEN** doctor reports `MATERIALIZATION_SYMLINK_CAPABILITY_UNAVAILABLE` as error/configuration and exits nonzero
- **AND** uses the repository-wide capability scope, null entry/worktree details, and no suggested command

#### Scenario: Symlink capability cannot be proven non-mutatingly
- **WHEN** current platform evidence cannot establish symbolic-link capability without creating a probe
- **THEN** doctor reports `MATERIALIZATION_SYMLINK_CAPABILITY_UNKNOWN` as info/configuration with zero exit status when no other error exists, rather than mutating state or claiming a false blocking result

#### Scenario: Doctor JSON remains isolated
- **WHEN** materialization findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with stable findings
- **AND** no file content, hash, environment value, or human progress leaks to stdout

#### Scenario: Standalone workspace is diagnosed
- **WHEN** doctor runs in implicit standalone mode
- **THEN** it does not invent repository materialization policy or findings because the feature is configured-mode only
