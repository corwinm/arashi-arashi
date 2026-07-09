## ADDED Requirements

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

The system SHALL inspect configured repositories and report health findings for missing repositories, dirty worktrees, detached heads, untracked branches, upstream divergence, and default-branch drift.

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
- **WHEN** the user runs `arashi doctor` and a configured repository is detached, lacks an upstream, is ahead of its upstream, is behind its upstream, has a missing remote ref, or is behind its default branch
- **THEN** the command reports a repository finding with a stable branch-state code
- **AND** the finding identifies the affected repository and branch relationship when known
- **AND** the finding suggests an appropriate follow-up command such as `arashi status`, `arashi pull`, `arashi push`, or a Git branch command where practical

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

The system SHALL report configured lifecycle hook files that are missing, not executable when executability is required, or fail Arashi's supported hook safety validation.

#### Scenario: Configured hook file is missing
- **WHEN** the user runs `arashi doctor` and a configured hook points to a file that does not exist
- **THEN** the command reports a hook finding with a stable missing-hook code
- **AND** the finding identifies the hook name, scope, repository or workspace target, and expected path

#### Scenario: Configured hook file is not executable
- **WHEN** the user runs `arashi doctor` and a configured hook file exists but cannot be executed by Arashi's hook runner
- **THEN** the command reports a hook finding with a stable hook-permission code
- **AND** the finding suggests a command such as `chmod +x <hook-path>` when that recommendation is safe and platform-appropriate

#### Scenario: Hook validation detects unsafe or unsupported configuration
- **WHEN** the user runs `arashi doctor` and hook validation rejects a hook as unsafe or unsupported
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
