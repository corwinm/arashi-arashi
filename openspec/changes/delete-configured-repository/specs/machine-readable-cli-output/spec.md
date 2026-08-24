## ADDED Requirements

### Requirement: Delete JSON uses one closed sanitized payload contract

`aw delete <repository> --json` and `--dry-run --json` SHALL use the standard schema-version-1 single-document envelope. A successful delete `data` object SHALL contain exactly `workspace`, `repositoryKey`, `dryRun`, `force`, `confirmation`, `plan`, and `result`. `workspace` SHALL contain exactly `mode`, `repositoriesBase`, `workspaceRoot`, and `worktreesBase`. `repositoryKey` SHALL be the exact configured key; `dryRun` and `force` SHALL be booleans; `confirmation` SHALL be `not-required`, `confirmed`, `declined`, or `required`. JSON SHALL use only `not-required` or `required` because it never prompts.

The closed delete payload type SHALL be reused in delete-specific `error.details`: all seven fields are present, `workspace` may be `null` only when configured workspace resolution failed, `plan` may be `null` only when no complete plan exists, and `result` may be `null` only when execution never created a ledger. The existing standalone `CONFIGURED_WORKSPACE_REQUIRED` error SHALL retain its canonical exact details `{command: "delete", mode: "standalone"}` rather than pretending a configured workspace payload exists. Canonical CLI parse errors retain their existing standard details.

#### Scenario: JSON dry-run succeeds

- **WHEN** a user runs `aw delete api --dry-run --json`
- **THEN** stdout contains exactly one success envelope whose `data` has only the seven closed fields
- **AND** `confirmation` is `not-required`, `plan` is complete, `result` is `null`, and no prompt/progress/human summary is emitted

#### Scenario: Clean JSON mutation omits force

- **WHEN** a clean plan is produced for `aw delete api --json` without `--force`
- **THEN** stdout contains exactly one `DELETE_CONFIRMATION_REQUIRED` error envelope
- **AND** `error.details` has the exact seven-field delete payload with `confirmation: "required"`, complete `plan`, and `result: null`

#### Scenario: Planning fails after configured context exists

- **WHEN** topology, path, hook, Git inspection, or config validation fails before a complete plan exists
- **THEN** one delete-specific error envelope contains the exact seven-field details with `plan: null` and `result: null`
- **AND** no open-ended diagnostic fields or secret source content are appended

#### Scenario: Partial mutation fails

- **WHEN** irreversible work completes before a later phase fails
- **THEN** one `DELETE_PARTIAL_FAILURE` envelope contains the exact seven-field details with the accepted plan and complete result ledger
- **AND** no second JSON document or human output is written to stdout

### Requirement: Delete plans are exact deterministic records

A delete `plan` SHALL contain exactly `id`, `items`, and `warnings`. `id` SHALL be a lowercase 64-hex SHA-256 over the canonical closed projected plan plus non-secret authority digests. `items` SHALL be ordered deterministically and `warnings` SHALL be deduplicated bytewise-sorted strings. Repeated planning over byte/identity-equivalent state SHALL return the same `id`, item IDs/order, and warnings.

#### Scenario: Repeated dry-runs inspect unchanged state

- **WHEN** two JSON dry-runs inspect identical config/Git/filesystem/hook state
- **THEN** their plan objects are byte-equivalent after standard envelope timing fields are excluded

#### Scenario: Authority state changes

- **WHEN** exact config bytes, path identity, worktree registration, ref OID, hook metadata, or receipt state changes
- **THEN** revalidation cannot silently reuse the previous plan identity

### Requirement: Delete items have one exact common projection

Every delete plan/result item SHALL contain exactly `id`, `kind`, `ownership`, `path`, `ref`, `oid`, `planned`, `completed`, `state`, `reasonCode`, and `message`. `kind` SHALL be `resume-receipt`, `canonical-clone`, `linked-worktree`, `worktree-metadata`, `local-ref`, `config-entry`, `workspace-hook`, or `preserved-global-hook`; `ownership` SHALL be `delete` or `preserve`; `path`, `ref`, `oid`, `reasonCode`, and `message` SHALL be strings or `null`; a non-null `oid` SHALL be the full immutable Git object ID. `planned` and `completed` SHALL be booleans. `state` SHALL be `planned`, `completed`, `preserved`, `blocked`, `failed`, or `not-started`. No additional or omitted fields are allowed.

#### Scenario: Owned worktree is planned

- **WHEN** dry-run includes an owned linked worktree
- **THEN** its item has delete ownership, normalized absolute path, nullable ref/OID as applicable, `planned: true`, `completed: false`, `state: "planned"`, and null reason/message when unblocked

#### Scenario: Resume receipt is planned

- **WHEN** a mutating plan may require durable retry provenance
- **THEN** one `resume-receipt` item exposes the exact transaction-receipt path without receipt/config contents

#### Scenario: Preserved global hook is reported

- **WHEN** a repository-specific user-global hook path exists
- **THEN** its item has preserve ownership, `planned: false`, `completed: false`, and `state: "preserved"`
- **AND** path/logical ref may be exposed but bytes are never exposed

#### Scenario: Local branch, stash, or detached commit has no path

- **WHEN** a branch, stash, or detached checked-out commit is represented
- **THEN** `path` is `null`, `ref` is the complete canonical ref/detached identity, and `oid` is the full planned commit ID
- **AND** names containing `/` remain unchanged

#### Scenario: Local tag preserves object and peeled identities

- **WHEN** a local tag is represented
- **THEN** one `local-ref` item uses `ref: "refs/tags/<name>"` with the tag ref's exact object OID
- **AND** one adjacent `local-ref` item uses `ref: "refs/tags/<name>^{}"` with the peeled commit OID; lightweight tags retain both deterministic records even when the OIDs are equal

#### Scenario: Result records failure

- **WHEN** one planned item fails
- **THEN** it retains the same identity/kind/ownership/path/ref/OID and item position as the plan
- **AND** `completed` is false, `state` is `failed`, and reason/message are sanitized strings

### Requirement: Delete item and warning ordering is deterministic

Delete items SHALL be ordered by phase. Linked worktrees SHALL be deepest physical descendant first with normalized-path bytewise ties; refs, hooks, and receipt/config records SHALL use canonical bytewise identity order within their phase. Warnings SHALL be deduplicated and bytewise sorted. Plan and result SHALL retain the same item IDs and order; execution SHALL NOT append an undisclosed destructive target.

#### Scenario: Result is compared with the accepted plan

- **WHEN** mutating execution returns a result
- **THEN** every result item corresponds to the same-position plan item
- **AND** changed targets cause invalidation rather than item insertion

### Requirement: Delete results, phases, errors, and retry are closed

A delete `result` SHALL contain exactly `items`, `phases`, `retry`, and `warnings`. `warnings` SHALL be deduplicated bytewise-sorted strings. Every phase SHALL contain exactly `name`, `state`, `itemIds`, `error`, `startedOrder`, and `completedOrder`. Phase `name` SHALL be one of `provenance`, `worktrees`, `metadata`, `canonical-clone`, `workspace-hooks`, `configuration`, or `verification`; phases SHALL occur in that exact order. Phase `state` SHALL be `not-started`, `started`, `completed`, or `failed`; `itemIds` SHALL be ordered strings; `error` SHALL be `null` or contain exactly string `code` and `message`; order fields SHALL be non-negative integers or `null`.

`retry` SHALL contain exactly `safe`, `argv`, and `guidance`. `safe` SHALL be boolean; `argv` SHALL be an array of literal strings or `null`; `guidance` SHALL be sanitized prose. A safe human retry vector SHALL be exactly `["aw", "delete", repositoryKey, "--force"]`; a safe JSON retry vector SHALL be exactly `["aw", "delete", repositoryKey, "--force", "--json"]`. No shell-interpolated retry command string is permitted.

#### Scenario: All phases complete

- **WHEN** deletion and receipt cleanup succeed
- **THEN** every phase is `completed`, non-applicable phases have empty `itemIds`, all delete-owned lifecycle items are completed, and retry is not required

#### Scenario: Phase failure blocks dependents

- **WHEN** a worktree phase fails
- **THEN** that phase is failed and later phases remain not-started with null order fields
- **AND** retry is safe only when the exact durable receipt remains valid/current

#### Scenario: Receipt persistence becomes unsafe

- **WHEN** receipt creation/update is malformed, ambiguous, permission-unsafe, or fails after irreversible work
- **THEN** `retry.safe` is false, `argv` is null, and guidance requires manual inspection

#### Scenario: No-mutation failure occurs

- **WHEN** revalidation or provenance creation fails before irreversible work
- **THEN** no owned destructive item is completed and the specific error is used rather than partial failure

### Requirement: Delete error precedence and exit vocabulary are stable

After canonical CLI parsing, delete SHALL apply this precedence: configured workspace/config loading; exact configured-key lookup; topology/path/hook/Git inspection; complete plan construction; Git-loss refusal; dry-run success; confirmation requirement/prompt; post-lock invalidation or concurrent change; execution failure; partial failure after irreversible completion. It SHALL use existing `CONFIGURED_WORKSPACE_REQUIRED` for standalone refusal and delete-specific `DELETE_REPOSITORY_NOT_FOUND`, `DELETE_CONFIG_INVALID`, `DELETE_TOPOLOGY_INVALID`, `DELETE_PATH_UNSAFE`, `DELETE_HOOK_AMBIGUOUS`, `DELETE_GIT_DATA_LOSS`, `DELETE_CONFIRMATION_REQUIRED`, `DELETE_CANCELLED`, `DELETE_CONCURRENT_CHANGE`, `DELETE_EXECUTION_FAILED`, or `DELETE_PARTIAL_FAILURE`.

Successful dry-run, mutation, and receipt-proven idempotent completion SHALL exit `0`. Decline/cancel and clean non-interactive missing confirmation SHALL exit `2`. Every other listed failure SHALL exit `1`. `DELETE_PARTIAL_FAILURE` SHALL replace the initiating code whenever any irreversible item completed.

#### Scenario: Configuration is invalid before key lookup

- **WHEN** active configured state exists but cannot be parsed/validated
- **THEN** delete returns `DELETE_CONFIG_INVALID` exit `1` before key-not-found, plan, Git-loss, or confirmation handling

#### Scenario: Exact key is absent

- **WHEN** valid active configuration lacks the key and no valid receipt proves a completed config-removal phase
- **THEN** delete returns `DELETE_REPOSITORY_NOT_FOUND` exit `1` without destructive discovery/mutation

#### Scenario: Dirty mutation omits force

- **WHEN** a TTY, non-TTY, or JSON mutation plan has Git-loss blockers and omits `--force`
- **THEN** delete returns `DELETE_GIT_DATA_LOSS` exit `1` before prompt/confirmation-required handling
- **AND** the complete blocked plan is present when JSON details are available

#### Scenario: Dirty dry-run omits force

- **WHEN** JSON dry-run has Git-loss blockers and omits `--force`
- **THEN** it succeeds exit `0` with the complete blocked plan and no result/mutation

#### Scenario: Clean JSON mutation omits force

- **WHEN** a clean JSON mutation omits `--force`
- **THEN** delete returns `DELETE_CONFIRMATION_REQUIRED` exit `2`

#### Scenario: TTY user declines

- **WHEN** a clean TTY plan is declined or cancelled
- **THEN** delete records `DELETE_CANCELLED`, exits `2`, and leaves all state unchanged

#### Scenario: Concurrent state invalidates execution

- **WHEN** exact config/Git/filesystem/hook/receipt identity changes after confirmation and before irreversible work
- **THEN** delete returns `DELETE_CONCURRENT_CHANGE` exit `1` with no completed destructive item

#### Scenario: Unexpected executor failure occurs before irreversible work

- **WHEN** execution fails after provenance setup but before a destructive target completes
- **THEN** delete returns `DELETE_EXECUTION_FAILED` exit `1` and removes the receipt when safely possible

#### Scenario: Irreversible work precedes failure

- **WHEN** any destructive target completes before a later failure
- **THEN** delete returns `DELETE_PARTIAL_FAILURE` exit `1` with the exact plan/result and truthful safe/unsafe retry

### Requirement: Delete JSON is sanitized and stdout-isolated

Delete JSON SHALL expose paths, refs/OIDs, lifecycle names, receipt path/state, phase/error codes, and sanitized warnings needed for automation. It SHALL NOT expose hook contents, inline hook commands, inline environments, config bytes, receipt bytes, commit messages/bodies, credentials, or shell snippets. Spinner/progress/prompt/human summary output SHALL be suppressed in JSON mode; diagnostics SHALL remain inside the one envelope.

#### Scenario: Secret canaries exist

- **WHEN** config, hook, inline environment, commit, or receipt fixtures contain unique secret canaries
- **THEN** success, refusal, planning failure, concurrent failure, partial failure, stdout, stderr, and retry guidance omit every canary
