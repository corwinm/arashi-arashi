## ADDED Requirements

### Requirement: Validate exactly one T3 prompt source before mutation

`aw create <branch> --t3 [task]` SHALL require exactly one nonempty prompt source: the optional inline `--t3` value or a readable UTF-8 file supplied by `--prompt-file`. `--prompt-file` SHALL require `--t3`. Arashi MUST reject missing, conflicting, empty, whitespace-only, unreadable, or invalidly encoded prompt input before hooks, managed-ignore changes, Git refs, worktrees, or external handoff dispatch.

#### Scenario: Inline prompt is accepted

- **WHEN** a user runs `aw create feature/example --t3 "Implement the accepted design"`
- **THEN** Arashi validates that inline task before workspace mutation
- **AND** uses it as the only handoff prompt source

#### Scenario: Prompt file is accepted

- **WHEN** a user runs `aw create feature/example --t3 --prompt-file task.md` and the file contains non-whitespace UTF-8 text
- **THEN** Arashi reads and validates the file before workspace mutation
- **AND** preserves its multiline content for dispatch

#### Scenario: Invalid prompt source fails early

- **WHEN** prompt sources are missing, both supplied, whitespace-only, unreadable, invalid UTF-8, or `--prompt-file` appears without `--t3`
- **THEN** Arashi returns an actionable validation error
- **AND** does not mutate workspace, Git, hook, managed-ignore, receipt, project, or thread state

### Requirement: Use an installed compatible optional bridge

T3 handoff SHALL use an already-installed `t3code` executable compatible with the documented `@bvdm/t3code-cli` 0.1.x command/result contract. Arashi SHALL NOT download or execute a moving package version implicitly, and ordinary commands without `--t3` SHALL NOT require the bridge, Node.js, a T3 server, or T3 credentials.

#### Scenario: Compatible bridge is installed

- **WHEN** `--t3` is requested and `t3code --version` reports the supported 0.1.x contract
- **THEN** Arashi accepts the prerequisite and can continue to workspace creation

#### Scenario: Bridge is missing or incompatible

- **WHEN** `--t3` is requested and the executable is missing, version output is malformed, or the reported version is outside the supported line
- **THEN** Arashi fails before workspace mutation with pinned installation and compatibility guidance

#### Scenario: Ordinary create has no T3 dependency

- **WHEN** a user runs create without `--t3`
- **THEN** Arashi does not discover, version-check, install, or invoke `t3code`

### Requirement: Dispatch to the exact created parent checkout

After successful coordinated creation and required setup, Arashi SHALL invoke the bridge with the exact created parent worktree as folder workspace, the current checkout, no UI opening, the validated prompt file, and the effective permission mode. It SHALL NOT dispatch when creation fails or ask T3 to create another worktree.

#### Scenario: Coordinated workspace handoff succeeds

- **WHEN** all selected parent and child worktrees are successfully prepared
- **THEN** Arashi passes the exact parent worktree path using `--cwd` and folder resolution
- **AND** passes `--checkout current`, `--open none`, and the validated task

#### Scenario: Workspace preparation fails

- **WHEN** coordinated creation or required setup fails or rolls back
- **THEN** Arashi reports the creation failure
- **AND** does not invoke the T3 bridge or create a handoff receipt

#### Scenario: Paths and prompts contain platform-sensitive content

- **WHEN** the exact checkout path contains spaces or the task contains multiline or shell-significant text on macOS, Linux, or Windows
- **THEN** Arashi uses direct subprocess arguments and a private prompt file without shell interpolation

### Requirement: Apply explicit permission modes

T3 handoff SHALL accept exactly `approval-required`, `auto-accept-edits`, and `full-access` for `--permission`. The effective mode SHALL be `full-access` when omitted, SHALL always be passed explicitly to the bridge, and SHALL be reported in human, JSON, and receipt results.

#### Scenario: Permission defaults to full access

- **WHEN** a user requests T3 handoff without `--permission`
- **THEN** Arashi passes `--permission full-access`
- **AND** reports `full-access` as the effective mode

#### Scenario: Explicit permission is honored

- **WHEN** a user passes one of the three accepted permission values
- **THEN** Arashi passes and reports that exact value

#### Scenario: Invalid permission fails before mutation

- **WHEN** a user supplies any other permission value
- **THEN** Arashi rejects it before workspace mutation or bridge execution

### Requirement: Preserve workspaces and classify handoff outcomes

Arashi SHALL treat workspace creation, T3 project resolution/creation, thread creation, prompt dispatch, and UI opening as distinct outcomes. A post-create handoff failure MUST preserve the successfully created workspace and return nonzero with exact-path recovery guidance. UI outcome MUST NOT redefine a successful thread dispatch.

#### Scenario: Handoff succeeds with no UI

- **WHEN** the bridge creates or resolves the project, creates a thread, and dispatches the prompt with `--open none`
- **THEN** Arashi reports successful workspace, project, thread, and dispatch stages
- **AND** reports UI mode `none` plus manual desktop/mobile selection guidance

#### Scenario: Handoff fails after creation

- **WHEN** the workspace is successfully created but bridge dispatch fails
- **THEN** Arashi preserves all successfully created worktrees
- **AND** reports creation success separately from handoff failure with an actionable retry or reconciliation path

#### Scenario: Host UI cannot navigate

- **WHEN** a future explicit UI action fails after prompt dispatch
- **THEN** Arashi retains successful project/thread/dispatch outcomes
- **AND** reports only the UI stage as failed

### Requirement: Prevent blind duplicate handoff retries

Arashi SHALL persist a private, credential-free receipt keyed to the canonical exact parent workspace before bridge dispatch. It SHALL permit automatic retry only after a definite non-dispatch failure and SHALL block retry after success, active dispatch, or indeterminate termination until the user reconciles T3 state.

#### Scenario: Definite failure is retried against the same workspace

- **WHEN** a matching receipt records a definite failed dispatch and the user reruns create for the same branch with `--conflict REUSE_EXISTING` and the same handoff intent
- **THEN** Arashi reuses the exact workspace and may attempt dispatch again without recreating it

#### Scenario: Successful dispatch is not duplicated

- **WHEN** a matching receipt records project/thread identifiers and successful dispatch
- **THEN** Arashi refuses another automatic handoff
- **AND** reports the existing identifiers and manual navigation guidance

#### Scenario: Uncertain dispatch requires reconciliation

- **WHEN** a bridge process is interrupted, returns malformed output, or otherwise might have succeeded server-side without a trustworthy response
- **THEN** Arashi records and reports an indeterminate outcome
- **AND** refuses blind retry until the user reconciles the exact workspace/project/thread in T3

#### Scenario: Receipt protects prompt content and credentials

- **WHEN** any handoff state is persisted or returned
- **THEN** it contains only a prompt digest and allowlisted identifiers/outcomes
- **AND** excludes prompt text, tokens, credentials, authenticated URLs, and raw bridge commands/output

### Requirement: Document client and environment boundaries

Canonical documentation SHALL state that the command runs on the repository/T3 host, the initiating conversation remains attached to its original workspace, connected desktop/mobile clients require the same reachable environment, and users manually select the reported project/thread. Documentation MUST label actual platform validation accurately.

#### Scenario: Mobile user initiates host-side work

- **WHEN** a user starts the workflow through a mobile client connected to the host environment
- **THEN** guidance directs host-side Arashi/T3 execution and manual selection of the reported thread
- **AND** does not claim phone-local CLI execution or automatic mobile navigation

#### Scenario: Validation evidence is platform-limited

- **WHEN** only macOS and a particular T3/bridge combination were tested end to end
- **THEN** documentation identifies that evidence exactly
- **AND** does not claim Windows, Linux, or mobile end-to-end validation from unit-level subprocess coverage
