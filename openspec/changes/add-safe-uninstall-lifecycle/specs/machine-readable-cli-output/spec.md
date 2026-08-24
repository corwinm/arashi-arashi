# machine-readable-cli-output Delta Specification

## ADDED Requirements

### Requirement: Uninstall JSON is a closed deterministic inspection-only plan

`aw uninstall --json`, `arashi uninstall --json`, and shell-uninstall JSON SHALL emit exactly one standard schema-version-1 JSON envelope on stdout, SHALL never prompt or mutate, and SHALL preserve the existing success/error discriminants. Successful inspection `data` SHALL be a closed object containing exactly:

- `channel`: one of `direct`, `npm`, `pnpm`, `yarn`, `bun`, `vite-plus`, `manual`, `legacy`, `ambiguous`, or `unsupported`;
- `mode`: the literal `json-inspection`;
- `status`: one of `planned`, `nothing-to-remove`, or `refused`;
- `invokedAs`: `aw` or `arashi`;
- `installDirectory`: a normalized absolute path string or `null`;
- `ledgerVersion`: a positive integer or `null`;
- `ownerCommand`: a command record or `null`;
- `candidateOwnerCommands`: an array of command records;
- `actions`: an array of action records;
- `warnings`: an array of warning records;
- `preservedScopes`: an array of preserved-scope values; and
- `retryCommand`: a retry-command record or `null`.

A command record SHALL contain exactly `manager`, `program`, and `args`, where `manager` is one of `npm`, `pnpm`, `yarn`, `bun`, or `vite-plus`, `program` is a non-empty executable string, and `args` is an array of strings preserving argv boundaries. A retry-command record SHALL contain exactly `program` (`aw` or `arashi`) and string-array `args`. A confidently proven package-manager channel SHALL set `ownerCommand` to its normative command and `candidateOwnerCommands` to an empty array; an ambiguous package-manager channel SHALL set `ownerCommand` to `null` and list every applicable candidate; every non-package-manager channel SHALL use `ownerCommand: null` and an empty candidate array. Direct success SHALL report ledger version `2`; legacy schema-v1 inspection SHALL report `1`; unsupported, manual, ambiguous, and package-manager channels SHALL report `null`.

An action record SHALL contain exactly `kind`, `target`, `disposition`, and `reasonCode`. `kind` SHALL be one of `payload`, `ledger`, `path`, `profile`, `shell`, `journal`, `helper`, `package-manager`, or `directory`; `target` SHALL be a normalized absolute path or `null`; and `disposition` SHALL be one of `remove`, `preserve`, `refuse`, or `defer`. `reasonCode` SHALL be one of `owned`, `installer-created`, `managed-marker`, `package-manager-owned`, `pre-existing`, `outside-scope`, `legacy-ledger`, `manual-installation`, `ambiguous-ownership`, `modified`, `malformed`, `missing-without-journal`, `journal-completed`, `deferred-self-removal`, `directory-not-empty`, or `directory-not-created`.

A warning record SHALL contain exactly `code`, `message`, and `target`, where `code` is one of `environment-broadcast-failed`, `helper-cleanup-failed`, or `journal-cleanup-retained`, `message` is a non-empty string, and `target` is a normalized absolute path or `null`. `preservedScopes` values SHALL come only from the canonical order `workspace-configuration`, `project-configuration`, `repositories`, `worktrees`, `project-files`, `git-metadata`, `unrelated-files`, `unowned-path-state`, `unowned-profile-state`; applicable entries SHALL retain that relative order.

Candidate owner commands SHALL sort by manager bytewise. Direct actions SHALL use lifecycle plan order: ledger payload order first, then ledger; path/profile/shell actions sorted by the tuple `(normalized target, kind rank)` with the secondary rank `path` before `profile` before `shell`; then journal, helper, and directory. The kind rank is mandatory when one startup file has both installer-created PATH bytes and a managed shell block. Package-manager inspection SHALL contain only its package-manager action after candidate commands. Shell-only actions SHALL sort by normalized target. Warnings SHALL sort by code then target. These channel-specific rules replace generic kind sorting. A complete non-mutating inspection SHALL use a success envelope and exit zero: `planned` means apply is eligible after consent, `nothing-to-remove` means no action is needed, and `refused` means a valid manual, legacy, ambiguous, or unsupported classification is not eligible for automatic apply. Malformed ledgers, modified owned state, unsafe filesystem/profile state, and transaction/journal inconsistencies SHALL instead use the closed error envelope and exit non-zero.

#### Scenario: Valid direct installation is inspected

- **WHEN** JSON inspection reads a valid schema-v2 direct installation
- **THEN** one success envelope reports its complete deterministic non-mutating plan using the exact fields, types, vocabularies, nullability, and ordering above
- **AND** stdout contains no prompt, progress, color, or second document

#### Scenario: Package-manager ownership is ambiguous

- **WHEN** JSON inspection cannot prove exactly one package-manager owner
- **THEN** one structured refusal reports `channel: "ambiguous"`, every exact candidate owner command in canonical order, `ownerCommand: null`, and no mutation

#### Scenario: Shell-only inspection uses the same closure

- **WHEN** shell uninstall inspects complete, absent, or malformed managed-marker state in JSON mode
- **THEN** it uses the same closed data object while limiting actions to shell targets and preserved scopes

### Requirement: Uninstall JSON errors have one closed detail schema

Every uninstall-specific error, including `JSON_UNSUPPORTED_FOR_MODE`, `UNINSTALL_OWNERSHIP_REQUIRED`, `UNINSTALL_LEGACY_LEDGER`, `UNINSTALL_LEDGER_INVALID`, `UNINSTALL_PAYLOAD_MODIFIED`, `UNINSTALL_PATH_AMBIGUOUS`, `SHELL_INTEGRATION_AMBIGUOUS`, `PACKAGE_MANAGER_AMBIGUOUS`, `CONFIRMATION_REQUIRED`, `UNINSTALL_DEFER_FAILED`, `UNINSTALL_TRANSACTION_FAILED`, and `UNINSTALL_ROLLBACK_FAILED`, SHALL retain the standard error envelope and contain `error.details.uninstall` as one closed object with exactly `operation`, `phase`, `channel`, `blockingTargets`, `candidateOwnerCommands`, `rollback`, and `retryCommand`.

`operation` SHALL be `uninstall` or `shell-uninstall`; `phase` SHALL be `discovery`, `ledger-validation`, `preflight`, `confirmation`, `handoff`, `preflighted`, `backed-up`, `profiles-removed`, `payload-removed`, `ledger-removed`, `backups-removed`, `directory-observed`, `completed`, or `null`; and `channel` SHALL use the success channel vocabulary or be `null`. `blockingTargets` SHALL be an array of records containing exactly `kind`, `target`, `state`, and `reasonCode`, using the action kind/reason vocabularies and state `present`, `absent`, `unknown`, or `not-observed`. `candidateOwnerCommands` and `retryCommand` SHALL use the success record shapes. `rollback` SHALL contain exactly `attempted`, `status`, and `observations`, where `attempted` is boolean, `status` is `not-started`, `succeeded`, or `failed`, and each observation contains exactly `kind`, `target`, and `state` using the same vocabularies. All arrays SHALL be present even when empty; nullable fields SHALL be present as `null`; target and candidate ordering SHALL match success ordering.

#### Scenario: JSON is combined with consent

- **WHEN** `--json` or `-j` is combined with `--yes` or `-y`
- **THEN** one `JSON_UNSUPPORTED_FOR_MODE` error is emitted before channel discovery or mutation
- **AND** uninstall details contain `phase: null`, `channel: null`, empty target/candidate/observation arrays, `rollback.status: "not-started"`, and `retryCommand: null`

#### Scenario: Transaction rollback is incomplete

- **WHEN** uninstall fails after mutation and one rollback observation is unknown or present unexpectedly
- **THEN** one `UNINSTALL_ROLLBACK_FAILED` envelope reports the exact phase, ordered blocking targets, `rollback.status: "failed"`, every tri-state observation, and a structured retry command
- **AND** stdout contains no profile bytes, environment values, backup contents, or second document
