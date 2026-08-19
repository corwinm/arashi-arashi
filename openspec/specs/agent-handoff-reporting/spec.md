# agent-handoff-reporting Specification

## Purpose
Define non-mutating Markdown and JSON handoff reports that preserve coordinated workspace state, caller-supplied context, validation evidence, remaining work, risks, and suggested next commands for humans and agents.
## Requirements
### Requirement: Generate Markdown handoff reports

The system SHALL provide an `arashi handoff` command that generates a Markdown handoff report for the current configured coordinated workspace or implicit standalone workspace without mutating repository state.

#### Scenario: Markdown report summarizes configured workspace state
- **WHEN** a user runs `arashi handoff` from a configured coordinated workspace
- **THEN** Arashi prints a Markdown report to stdout
- **AND** the report identifies the current workspace path and coordinated branch
- **AND** the report includes a per-repository status summary derived from Arashi workspace inspection
- **AND** the command does not stage, commit, push, delete, or otherwise mutate repository state

#### Scenario: Markdown report summarizes standalone workspace state
- **WHEN** a user runs `arashi handoff` from an implicit standalone workspace
- **THEN** Arashi prints a Markdown report that identifies standalone mode, the main repository root, current branch, and linked worktree state
- **AND** the report does not imply that configured child repositories or coordinated workspace configuration exist
- **AND** the command does not create `.arashi/`, write ignore state, or otherwise mutate repository state

#### Scenario: Command runs from a child repository
- **WHEN** a user runs `arashi handoff` from inside a managed child repository worktree
- **THEN** Arashi resolves the containing coordinated workspace
- **AND** the report identifies the workspace anchor and current child repository context
- **AND** the report includes status for the managed repositories in that coordinated workspace

#### Scenario: Command runs from a standalone linked worktree
- **WHEN** a user runs `arashi handoff` from a linked worktree belonging to an implicit standalone workspace
- **THEN** Arashi resolves the main repository through Git
- **AND** the report identifies the caller worktree and shared standalone workspace

#### Scenario: Workspace cannot be resolved
- **WHEN** a user runs `arashi handoff` outside both configured and implicit standalone Arashi workspaces
- **THEN** Arashi exits non-zero
- **AND** the output explains how to initialize configured mode or prepare zero-config standalone mode where applicable
- **AND** no report with misleading repository state is emitted

### Requirement: Include caller-supplied handoff context

The system SHALL let users add explicit handoff context for links, validation evidence, remaining work, risks, blockers, and suggested next commands that Arashi cannot reliably infer.

#### Scenario: User supplies related links
- **WHEN** a user runs `arashi handoff --link https://github.com/corwinm/arashi-arashi/issues/186 --link https://github.com/corwinm/arashi/pull/123`
- **THEN** the Markdown report includes a related links section containing each supplied link
- **AND** the links are preserved exactly as user-supplied Markdown-compatible text or URLs

#### Scenario: User supplies validation evidence
- **WHEN** a user runs `arashi handoff --validation "bun run test — passed" --validation "openspec validate add-agent-handoff-report — passed"`
- **THEN** the report includes a validation section listing each supplied validation entry
- **AND** the report does not claim that Arashi re-ran those commands unless it actually did so

#### Scenario: User supplies remaining work and risks
- **WHEN** a user runs `arashi handoff --todo "finish docs PR" --risk "Windows CI not watched yet"`
- **THEN** the report includes remaining-work and risks-or-blockers sections
- **AND** each supplied item is represented as a checklist item or bullet suitable for handoff consumption

#### Scenario: User supplies next commands
- **WHEN** a user runs `arashi handoff --next-command "arashi status" --next-command "gh pr checks 123 --repo corwinm/arashi"`
- **THEN** the report includes suggested next commands in a copyable command block or command list
- **AND** the command strings are not executed by `arashi handoff`

### Requirement: Report touched and dirty repositories

The system SHALL highlight repositories that need attention by using Arashi status data to identify dirty, missing, divergent, or otherwise non-clean repositories.

#### Scenario: Repository has uncommitted changes
- **WHEN** a managed repository has working-tree changes and the user runs `arashi handoff`
- **THEN** the report identifies that repository as dirty or touched
- **AND** the report includes enough status detail for the next worker to know that local changes remain uncommitted

#### Scenario: All repositories are clean
- **WHEN** every managed repository in the coordinated workspace is clean
- **THEN** the report states that all managed repositories are clean
- **AND** clean repositories may be summarized rather than expanded in full detail

#### Scenario: Repository has branch or remote drift
- **WHEN** a managed repository is ahead, behind, missing an upstream branch, or otherwise divergent according to Arashi status inspection
- **THEN** the report identifies the affected repository and drift state
- **AND** the suggested next steps include a conservative status or pull/push investigation command rather than implying the state is safe

### Requirement: Document and teach handoff workflow

The system SHALL document the handoff report command and teach agents and humans when to create handoff reports during coordinated multi-repo work.

#### Scenario: User reads command documentation
- **WHEN** a user opens the Arashi command documentation
- **THEN** `arashi handoff` is documented with Markdown and JSON examples
- **AND** the documentation explains the supported context flags for links, validations, todos, risks, and next commands
- **AND** the documentation states that the command is non-mutating and does not run validation commands automatically

#### Scenario: User reads agent workflow guidance
- **WHEN** a user reads Arashi's agent or multi-repo workflow documentation
- **THEN** the guidance explains that handoff reports are useful before pausing, switching agents, requesting review, or leaving dirty coordinated work
- **AND** it shows an example handoff command that includes related issue or PR links, validation results, remaining tasks, and next commands

#### Scenario: Agent consults skill guidance
- **WHEN** an agent reads the Arashi skill package
- **THEN** the guidance instructs the agent to generate or update a handoff report when pausing non-trivial multi-repo work
- **AND** it cautions the agent to include validation evidence and unresolved blockers explicitly rather than implying unverified completion

### Requirement: Explicit Markdown spelling is deprecated without changing default output
`arashi handoff` SHALL continue to emit Markdown by default and SHALL treat `--markdown` as a deprecated compatibility spelling throughout Arashi 1.x rather than as a distinct output mode. Removal MUST occur no earlier than Arashi 2.0 through a separately approved breaking-change issue.

#### Scenario: Handoff defaults to Markdown
- **WHEN** a user runs `arashi handoff` without a format option
- **THEN** Arashi emits the existing non-mutating Markdown report
- **AND** no explicit Markdown flag is required

#### Scenario: Deprecated Markdown spelling remains compatible
- **WHEN** a user runs `arashi handoff --markdown` during Arashi 1.x
- **THEN** Arashi emits the same report, exit code, and side effects as `arashi handoff`
- **AND** preferred help and examples do not teach `--markdown`

#### Scenario: JSON and deprecated Markdown are combined
- **WHEN** a user runs `arashi handoff --json --markdown`
- **THEN** the existing JSON selection remains authoritative throughout Arashi 1.x
- **AND** stdout contains exactly one valid JSON envelope with no human deprecation text

#### Scenario: Migration guidance is published
- **WHEN** users read release notes or command migration guidance
- **THEN** the guidance tells them to omit `--markdown` because Markdown is the default
- **AND** identifies Arashi 2.0 as the earliest removal boundary and the separately approved breaking-change issue required for eventual removal

### Requirement: Handoff reports configured-base state separately

Configured-workspace handoff Markdown and JSON SHALL include each present repository's effective configured-base branch, source, concrete remote/ref, ahead/behind state when available, and unavailable reason when requested comparison cannot complete. Handoff SHALL retain current-branch upstream state and remote-default state as separate relationships. Standalone handoff SHALL remain unchanged.

#### Scenario: Repository is behind its configured base

- **WHEN** a configured repository's current branch is behind its refreshed configured base
- **THEN** handoff Markdown names the base and lag in the per-repository status
- **AND** handoff JSON includes the structured configured-base comparison
- **AND** upstream and dirty-state information remain present

#### Scenario: Configured base is unavailable

- **WHEN** status cannot refresh, resolve, or compare a configured base
- **THEN** handoff Markdown records an explicit warning naming the base
- **AND** handoff JSON records the branch, unavailable state, and machine-readable reason/details
- **AND** neither format substitutes the remote default as the configured base

#### Scenario: Base and default differ

- **WHEN** configured base is `origin/develop` and remote default is `origin/main`
- **THEN** handoff retains both relationships and their independent lag/unavailable state

#### Scenario: Base and default are the same target

- **WHEN** configured base and remote default resolve to the same remote ref
- **THEN** handoff Markdown avoids duplicate diagnostics and may use a combined `Base/default` label
- **AND** handoff JSON preserves separate role records that identify their shared target

#### Scenario: Standalone handoff runs

- **WHEN** handoff runs in implicit standalone mode
- **THEN** its established repository/upstream/default report remains unchanged
- **AND** it does not invent configured-base policy

