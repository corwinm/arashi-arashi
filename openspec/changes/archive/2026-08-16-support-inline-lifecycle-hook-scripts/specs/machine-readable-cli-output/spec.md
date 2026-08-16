## ADDED Requirements

### Requirement: Lifecycle records identify source kind and owner without disclosure
Every public create/remove hook outcome record SHALL add `sourceKind`, `sourceOwnerKind`, and `sourceOwnerName`. `sourceKind` SHALL be `file` or `inline-config`; `sourceOwnerKind` SHALL be `workspace`, `repository`, or `user-global`; and `sourceOwnerName` SHALL be the canonical repository name for repository-owned locations and `null` otherwise. Existing `sourceScriptPath` SHALL be the absolute path for a file and `null` for inline config. No outcome field, message, warning, error, or diagnostic SHALL contain or derive inline snippet text. Existing success `data.hookOutcomes` and failure `error.details.hookOutcomes` locations, status/reason vocabulary, duration rules, ordering, and fail-fast evaluated-prefix behavior SHALL remain unchanged.

#### Scenario: Inline hook succeeds
- **WHEN** JSON create or remove executes a repository-owned inline hook successfully
- **THEN** its outcome has `sourceKind: "inline-config"`, `sourceOwnerKind: "repository"`, canonical `sourceOwnerName`, and `sourceScriptPath: null`
- **AND** contains no snippet text

#### Scenario: File hook succeeds
- **WHEN** JSON create or remove executes an existing file hook
- **THEN** its outcome has `sourceKind: "file"`, accurate owner metadata, and its absolute `sourceScriptPath`
- **AND** all pre-existing record fields retain their meanings

#### Scenario: Inline failure is preserved at canonical location
- **WHEN** an inline hook fails, times out, or fails preflight and the command fails
- **THEN** the evaluated records appear at `error.details.hookOutcomes` with the exact classified reason
- **AND** stdout remains one JSON document with no human or snippet disclosure

### Requirement: Disabled, quiet, input, and timeout JSON behavior is source-neutral
JSON create SHALL apply its existing `--no-hooks`; JSON create/remove SHALL apply existing `--no-hook-input`, timeout, JSON-owned quiet/progress isolation, and immediate-EOF behavior equally to inline and file sources. Remove MUST NOT acquire `--no-hooks`. No source-neutral policy SHALL add a second JSON document or human hook output to stdout.

#### Scenario: JSON create disables hooks
- **WHEN** JSON create uses `--no-hooks`
- **THEN** no inline/file source is discovered, preflighted, or executed after configuration validation
- **AND** the existing disabled result representation is preserved

#### Scenario: JSON inline hook reads or times out
- **WHEN** an inline hook reads stdin or exceeds the timeout under JSON execution
- **THEN** stdin is immediate EOF and timeout classification remains exact where applicable
- **AND** only the final structured envelope is written to stdout

### Requirement: Inline dry-run JSON preserves each command's existing preview surface
Remove dry-run JSON SHALL describe applicable inline/file plans with source-kind, owner, logical lifecycle, scope, target, selected interpreter, and file path where applicable, while omitting snippet text. It MUST NOT execute hooks or fabricate success/failure outcome records. Configured-create dry-run JSON SHALL preserve its existing no-hook-discovery behavior, empty `hookOutcomes`, and absence of a hook-preview surface for both inline and file configuration.

#### Scenario: Remove dry-run JSON previews inline hook
- **WHEN** `arashi remove --dry-run --json` resolves an inline source
- **THEN** its existing hook preview contains only the normative non-secret metadata
- **AND** no execution outcome or process is produced

#### Scenario: Configured-create dry-run remains source-neutral by omission
- **WHEN** `arashi create --dry-run --json` loads valid inline or file hook configuration
- **THEN** it performs no hook discovery or interpreter preflight and returns the existing empty `hookOutcomes`
- **AND** it does not add a hook-preview field or fabricate source metadata

### Requirement: Configuration and ambiguity failures remain structured and pre-mutation
Invalid inline configuration SHALL use the existing canonical JSON configuration failure. Same-location ambiguity SHALL map to `reasonCode: "validation_failed"`; unavailable interpreter preflight SHALL map to `reasonCode: "interpreter_unavailable"`. Configured-create command failure SHALL retain code `CREATE_FAILED`, configured-remove preflight failure SHALL retain `HOOK_CONFIGURATION_INVALID`, and both SHALL expose structured hook details containing logical source metadata and any file path but no snippet. These failures MUST precede hook discovery for invalid configuration and lifecycle mutation for resolver failures.

#### Scenario: Invalid inline value fails in JSON mode
- **WHEN** a JSON command loads an empty, unknown, unsupported, or wrong-typed inline value
- **THEN** stdout contains one canonical configuration error envelope
- **AND** no discovery, mutation, prompt, or snippet disclosure occurs

#### Scenario: Inline/file ambiguity fails in JSON mode
- **WHEN** enabled JSON create/remove finds a same-location collision
- **THEN** stdout contains one structured failure identifying scope, owner, source kinds, and file path
- **AND** no lifecycle mutation occurs
