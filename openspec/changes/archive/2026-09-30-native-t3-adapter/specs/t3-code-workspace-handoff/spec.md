## MODIFIED Requirements

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

### Requirement: Dispatch to the exact created parent checkout

After successful coordinated creation and required setup, Arashi SHALL dispatch through official interfaces with the exact created parent worktree as folder workspace, the current checkout, no UI opening, the validated prompt, and the effective permission mode. It SHALL NOT dispatch when creation fails or ask T3 to create another worktree.

#### Scenario: Coordinated workspace handoff succeeds

- **WHEN** all selected parent and child worktrees are successfully prepared
- **THEN** Arashi uses the exact canonical parent path as project workspaceRoot
- **AND** sets worktreePath to null, opens no UI, and submits the validated task

#### Scenario: Existing project uses an equivalent physical path

- **WHEN** a live project root identifies the exact parent checkout through different casing, separators, or a filesystem alias
- **THEN** Arashi reuses the physical matching project instead of creating another
- **AND** refuses ambiguous multiple matches

#### Scenario: Workspace preparation fails

- **WHEN** coordinated creation or required setup fails or rolls back
- **THEN** Arashi reports the creation failure
- **AND** does not dispatch to T3 or create a handoff receipt

#### Scenario: Paths and prompts contain platform-sensitive content

- **WHEN** the exact checkout path contains spaces or the task contains multiline or shell-significant text on macOS, Linux, or Windows
- **THEN** Arashi uses direct official CLI arguments for authentication and authenticated HTTP bodies for task text without shell interpolation

### Requirement: Apply explicit permission modes

T3 handoff SHALL accept exactly `approval-required`, `auto-accept-edits`, and `full-access` for `--permission`. The effective mode SHALL be `full-access` when omitted, SHALL always be passed explicitly to T3, and SHALL be reported in human, JSON, and receipt results.

#### Scenario: Permission defaults to full access

- **WHEN** a user requests T3 handoff without `--permission`
- **THEN** Arashi sets runtimeMode to full-access
- **AND** reports `full-access` as the effective mode

#### Scenario: Explicit permission is honored

- **WHEN** a user passes one of the three accepted permission values
- **THEN** Arashi passes and reports that exact value

#### Scenario: Invalid permission fails before mutation

- **WHEN** a user supplies any other permission value
- **THEN** Arashi rejects it before workspace mutation or T3 execution

### Requirement: Preserve workspaces and classify handoff outcomes

Arashi SHALL treat workspace creation, T3 project resolution/creation, thread creation, prompt dispatch, and UI opening as distinct outcomes. A post-create handoff failure MUST preserve the successfully created workspace and return nonzero with exact-path recovery guidance. UI outcome MUST NOT redefine a successful thread dispatch.

#### Scenario: Handoff succeeds with no UI

- **WHEN** the adapter creates or resolves the project, creates a thread, and dispatches the prompt with UI mode none
- **THEN** Arashi reports successful workspace, project, thread, and dispatch stages
- **AND** reports UI mode `none` plus manual desktop/mobile selection guidance

#### Scenario: Handoff fails after creation

- **WHEN** the workspace is successfully created but native dispatch fails
- **THEN** Arashi preserves all successfully created worktrees
- **AND** reports creation success separately from handoff failure with an actionable retry or reconciliation path

#### Scenario: Host UI cannot navigate

- **WHEN** a future explicit UI action fails after prompt dispatch
- **THEN** Arashi retains successful project/thread/dispatch outcomes
- **AND** reports only the UI stage as failed

### Requirement: Prevent blind duplicate handoff retries

Arashi SHALL persist a private, credential-free receipt keyed to the canonical exact parent workspace before native dispatch. It SHALL reconcile recorded project/thread identifiers before retry and permit task submission only after a definite non-dispatch failure and SHALL block retry after success, active dispatch, or indeterminate termination until acceptance is proven from recorded message identifiers or the user reconciles T3 state.

#### Scenario: Definite failure is retried against the same workspace

- **WHEN** a matching receipt records a definite failed dispatch and the user reruns create for the same branch with `--conflict REUSE_EXISTING` and the same handoff intent
- **THEN** Arashi reuses the exact workspace and may attempt dispatch again without recreating it

#### Scenario: Successful dispatch is not duplicated

- **WHEN** a matching receipt records project/thread identifiers and successful dispatch
- **THEN** Arashi refuses another automatic handoff
- **AND** reports the existing identifiers and manual navigation guidance

#### Scenario: Uncertain dispatch requires reconciliation

- **WHEN** a native request is interrupted, returns malformed output, or otherwise might have succeeded server-side without a trustworthy response
- **THEN** Arashi records and reports an indeterminate outcome
- **AND** refuses blind retry until the user reconciles the exact workspace/project/thread in T3

#### Scenario: Receipt protects prompt content and credentials

- **WHEN** any handoff state is persisted or returned
- **THEN** it contains only a prompt digest and allowlisted identifiers/outcomes
- **AND** excludes prompt text, tokens, credentials, authenticated URLs, and raw transport commands/output

### Requirement: Document client and environment boundaries

Canonical documentation SHALL state that the command runs on the repository/T3 host, the initiating conversation remains attached to its original workspace, connected desktop/mobile clients require the same reachable environment, and users manually select the reported project/thread. Documentation MUST label actual platform validation accurately.

#### Scenario: Mobile user initiates host-side work

- **WHEN** a user starts the workflow through a mobile client connected to the host environment
- **THEN** guidance directs host-side Arashi/T3 execution and manual selection of the reported thread
- **AND** does not claim phone-local CLI execution or automatic mobile navigation

#### Scenario: Validation evidence is platform-limited

- **WHEN** only macOS and a particular T3 combination were tested end to end
- **THEN** documentation identifies that evidence exactly
- **AND** does not claim Windows, Linux, or mobile end-to-end validation from unit-level subprocess coverage

## ADDED Requirements

### Requirement: Use a compatible native official T3 adapter

T3 handoff SHALL accept stable official T3 releases >=0.0.43 with matching CLI/server versions, negotiated orchestration protocol 1, and required authentication/catalog capabilities through a native adapter. Acceptance SHALL NOT depend on an exact patch whitelist. Prerelease, malformed, older, mismatched, or incompatible components SHALL fail closed. CLI/server identity and versions SHALL be rechecked before dispatch authentication. Arashi SHALL verify the selected local environment and required installed official CLI, authenticate through official session mechanisms, and check scopes/catalog/snapshot before workspace mutation where feasible. Arashi SHALL NOT download runtime components, invoke the third-party bridge, or access private databases or credential stores. Ordinary commands SHALL NOT require T3.

#### Scenario: Official environment is compatible

- **WHEN** the selected local environment and installed official CLI report matching stable versions >=0.0.43 and protocol 1
- **THEN** Arashi verifies authenticated capabilities before workspace mutation

#### Scenario: Newer stable release is compatible

- **WHEN** matching newer stable CLI/server components expose protocol 1 and required authentication/catalog/snapshot interfaces
- **THEN** Arashi accepts the release without adding it to a patch whitelist

#### Scenario: Component versions change during preparation

- **WHEN** the installed CLI or selected server version changes after preflight
- **THEN** Arashi rechecks compatibility before issuing a dispatch session
- **AND** mismatched or changed components block remote mutation while preserving the prepared workspace

#### Scenario: Prerequisites fail

- **WHEN** discovery, authentication, reachability, or compatibility cannot be verified
- **THEN** Arashi fails before workspace mutation with selection/restart/version guidance
- **AND** does not guess another profile or download a component

#### Scenario: Dry-run avoids authentication mutation

- **WHEN** create with `--t3` is invoked with `--dry-run`
- **THEN** Arashi checks CLI version and read-only environment metadata without issuing or revoking a session
- **AND** defers authenticated capability checks to actual execution and creates no receipt, project, thread, or task

#### Scenario: Ordinary create has no T3 dependency

- **WHEN** create is invoked without `--t3`
- **THEN** no T3 discovery, authentication, or invocation occurs

### Requirement: Resolve supported model preferences explicitly

Arashi SHALL resolve `defaults.t3` per field using explicit CLI > workspace > user settings, followed by T3 project/server selections and unambiguous catalog defaults. Provider routing SHALL use a configured instance. Model and effort SHALL be validated against the official catalog without hardcoded model fallback. Bridge preferences SHALL require explicit migration and SHALL NOT be silently read.

#### Scenario: Personal choices override T3 defaults

- **WHEN** explicit or authored model/effort choices are supplied
- **THEN** supported choices determine the effective selection and are reported without secrets

#### Scenario: Selection is unsupported or ambiguous

- **WHEN** the selected provider/model/effort cannot be resolved from supported catalog entries
- **THEN** Arashi fails with explicit selection guidance and does not submit a task

### Requirement: Reconcile native partial success and retain legacy receipt protection

Native receipts SHALL persist known environment/project/thread/message identifiers before requests and a submission marker before task dispatch. Retries SHALL reconcile these identifiers. An uncertain submission SHALL only confirm acceptance, never blindly repeat it. Bridge-era receipts SHALL block native redispatch until manually reconciled. Cleanup and receipt failure SHALL retain proven remote success.

#### Scenario: Task acceptance response is lost

- **WHEN** the server accepts the task but the request times out
- **THEN** a retry reads the saved thread/message identifiers to confirm acceptance
- **AND** no second task is submitted

#### Scenario: Partial project or thread creation is retried

- **WHEN** preparation fails after project or thread creation
- **THEN** retries locate the saved identifiers before continuing

#### Scenario: Bridge-era receipt exists

- **WHEN** any valid version-1 receipt belongs to the exact checkout
- **THEN** native dispatch is blocked until manual reconciliation

## REMOVED Requirements

### Requirement: Use an installed compatible optional bridge

**Reason**: The native adapter replaces third-party bridge dispatch with supported official T3 interfaces and explicit version/capability negotiation.

**Migration**: Install the matching official T3 CLI and use `defaults.t3` or explicit selection flags. Migrate chosen preferences explicitly; existing bridge-era receipts continue blocking duplicate dispatch until manually reconciled.
