## MODIFIED Requirements

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
