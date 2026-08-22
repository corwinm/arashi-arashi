## MODIFIED Requirements

### Requirement: Inline source text disclosure is narrowly bounded

Configured inline text MUST remain only in the persisted canonical configuration, the in-memory executable plan and interpreter argument used for execution, visible plaintext entry in the interactive `aw configure` prompt, and the exact final serialized complete-candidate preview shown immediately before configure confirmation. Every other human output, quiet output, JSON envelope, hook outcome, dry-run preview, doctor finding, selection or list view, retry diagnostic, cancellation message, error, log, debug datum, environment metadata, active-file plan, and persisted derived state MUST NOT contain, quote, hash, truncate, or otherwise derive the snippet. Public projections SHALL identify `sourceKind: "inline-config"`, source owner metadata, lifecycle, scope, interpreter presence, and non-secret target context; an inline source path SHALL be `null` or omitted according to the owning public schema.

#### Scenario: Inline execution fails

- **WHEN** an inline hook exits nonzero or times out
- **THEN** human and JSON diagnostics identify the logical source and failure classification
- **AND** do not contain the configured command text

#### Scenario: Ambiguity and doctor are non-secret

- **WHEN** ambiguity or interpreter unavailability is reported by runtime, dry-run, or doctor
- **THEN** each surface exposes only non-secret source metadata
- **AND** no derived representation of the inline snippet appears

#### Scenario: Configure collects visible inline text

- **WHEN** an eligible TTY `aw configure` interaction explicitly selects inline command entry
- **THEN** the owning prompt states that the entered text is visible plaintext
- **AND** the text is retained only in the in-memory complete candidate
- **AND** subsequent selection, retry, diagnostic, or cancellation output does not repeat or derive the text

#### Scenario: Configure shows the exact final candidate

- **WHEN** a changed complete candidate containing inline command text reaches final confirmation
- **THEN** the confirmation includes the exact serialized JSON bytes that one successful save would persist, including that inline text
- **AND** the separate active-file plan remains body-free
- **AND** declining or interrupting confirmation produces no mutation and does not repeat the inline text in cancellation output

#### Scenario: Configure JSON inspection is non-secret

- **WHEN** `aw configure --json` inspects configuration containing inline commands
- **THEN** the single structured document reports lifecycle, source kind, and interpreter presence without command bodies or any derived representation
- **AND** stdout and stderr contain no inline command text
