## ADDED Requirements

### Requirement: Remove dry-run previews inline sources without execution or disclosure
Configured `arashi remove --dry-run` SHALL use the same enabled-source resolver and platform/interpreter preflight as real remove, SHALL preview repository- and workspace-owned inline locations in the existing per-target scope order, and MUST NOT execute any hook. Each preview SHALL identify lifecycle, scope, target, `sourceKind`, source owner, selected interpreter where applicable, and file path only for file sources. It MUST NOT contain inline snippet text or fabricate success/failure execution outcomes.

#### Scenario: Inline hooks are previewed
- **WHEN** configured dry-run resolves inline repository and workspace remove hooks
- **THEN** human and JSON previews identify `inline-config`, owner, lifecycle, scope, target, and selected interpreter
- **AND** no hook process runs and no snippet appears

#### Scenario: Inline/file ambiguity is previewed as failure
- **WHEN** dry-run finds inline and file sources at the same logical remove location
- **THEN** it returns the same preflight ambiguity as real remove before any mutation
- **AND** identifies both source kinds and the file path without exposing inline text

### Requirement: Dry-run parity is proven against real planning
Automated tests SHALL compare dry-run and real enabled-source resolution for the same configured target while proving dry-run causes no worktree, branch, hook, config, or file mutation. JSON preview SHALL remain exactly one document and human preview SHALL not imply execution.

#### Scenario: Preview and real plan agree
- **WHEN** the same valid configured target is resolved for dry-run and real remove
- **THEN** lifecycle, scope, target, source-kind, owner, interpreter, and ordering plans agree
- **AND** only real remove may produce execution outcomes
