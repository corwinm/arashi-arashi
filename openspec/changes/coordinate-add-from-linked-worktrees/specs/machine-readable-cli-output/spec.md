## ADDED Requirements

### Requirement: Add JSON results identify canonical and active materialization roles

`arashi add --json` SHALL preserve the standard single-document JSON envelope and existing config-relative repository path while reporting deterministic canonical clone, linked worktree, default branch, and coordinated branch roles.

#### Scenario: Coordinated linked add JSON succeeds

- **WHEN** `arashi add --json` succeeds from a configured non-bare linked parent worktree
- **THEN** stdout contains exactly one valid envelope with `ok: true` and `command: "add"`
- **AND** `data.repository.path` contains the config-relative child repository path
- **AND** `data.repository.materialization` is `"coordinated-worktree"`
- **AND** `data.repository.canonicalPath` contains the normalized absolute canonical clone path
- **AND** `data.repository.worktreePath` contains the normalized absolute active child worktree path
- **AND** `data.repository.defaultBranch` contains the detected child default branch
- **AND** `data.repository.coordinatedBranch` contains the active parent branch
- **AND** `data.repository.setupScript` is the config-relative setup-script path or `null` and `setupScriptCreated` remains boolean
- **AND** stdout contains no spinner, prompt, warning prose, or human summary

#### Scenario: Direct add JSON succeeds

- **WHEN** `arashi add --json` succeeds without creating a linked child worktree
- **THEN** `data.repository.materialization` is `"clone"`
- **AND** `data.repository.canonicalPath` contains the normalized absolute clone path
- **AND** `data.repository.worktreePath` is `null`
- **AND** `data.repository.coordinatedBranch` is `null`
- **AND** the existing repository name, Git URL, config-relative `path`, default branch, setup script, setup-created, and managed-ignore fields remain available

#### Scenario: Coordinated add JSON fails and rolls back completely

- **WHEN** coordinated `arashi add --json` fails after one or more mutations and rollback completes
- **THEN** stdout contains exactly one valid envelope with `ok: false` and `command: "add"`
- **AND** `error.details.phase` is the original failing phase, one of `"clone"`, `"branch"`, `"worktree"`, or `"config"`
- **AND** `error.details.rollback.complete` is `true` and `error.details.rollback.failures` is an empty array
- **AND** `error.details.rollback.finalState.canonical` is `{ path: <normalized absolute canonical path>, exists: <boolean or null> }`
- **AND** `error.details.rollback.finalState.worktree` is `{ path: <normalized absolute active path>, exists: <boolean or null>, metadataPresent: <boolean or null> }` in coordinated mode
- **AND** `error.details.rollback.finalState.coordinatedBranch` is `{ name: <branch>, exists: <boolean or null>, createdByInvocation: <boolean> }`
- **AND** `error.details.rollback.finalState.configEntryPresent` is boolean or `null`
- **AND** `error.details.rollback.finalState.managedIgnore` is `{ changed: <boolean>, restored: <boolean or null> }`, where `restored` is `null` when no invocation-owned ignore change existed
- **AND** any `null` observation is paired with an ordered `final-state-observe` failure record
- **AND** no human cleanup guidance is written to stdout

#### Scenario: Coordinated add JSON reports incomplete rollback

- **WHEN** coordinated `arashi add --json` cannot remove or restore one or more invocation-owned resources
- **THEN** the same error envelope preserves the original failing `error.details.phase` and sets `error.details.rollback.complete` to `false`
- **AND** `error.details.rollback.failures` contains ordered `{ phase, message }` records for every failed cleanup/restoration/observation operation, where `phase` is one of `"worktree-remove"`, `"branch-delete"`, `"clone-remove"`, `"config-restore"`, `"managed-ignore-restore"`, or `"final-state-observe"`
- **AND** `error.details.rollback.finalState` uses the same exact canonical, worktree, coordinated-branch, config-entry, and managed-ignore object fields to report surviving state
- **AND** the process exits non-zero without emitting a second JSON document
