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
- **AND** suggested commands, in order, add a branch-specific fetch mapping, fetch the configured remote, and set the local branch upstream to `<remote>/<branch>`
- **AND** human output explains why branch configuration alone is unusable
- **AND** JSON output carries the same stable finding without human-output contamination
- **AND** the topology-specific inspection performs no fetch or Git mutation beyond doctor's existing repository-status collection
- **AND** doctor does not change Git configuration, branches, or worktrees as part of reporting or remediation

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
