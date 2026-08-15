## ADDED Requirements

### Requirement: Create JSON reports requested and effective base resolution
`arashi create --json` and `arashi create --dry-run --json` SHALL include optional `base` data when a base was requested. `requestedBranch` SHALL be the normalized logical branch after removing at most one leading `origin/`; the literal prefixed spelling SHALL NOT be retained. `source` SHALL be exactly `cli` or `config`. The success `repositories` array SHALL follow effective selected-set order, and each entry SHALL contain `repositoryName`, the existing canonical absolute `repositoryPath`, `resolvedRef`, `resolvedOid`, and `targetAction` exactly `created` or `reused`. Base-resolution failure SHALL use code `CREATE_BASE_RESOLUTION_FAILED`; its details SHALL use the same normalized `requestedBranch` and `source`, and SHALL contain only affected repositories in effective selected-set order. Every failure entry SHALL use the canonical absolute path and `attemptedRefs` exactly `["refs/heads/<normalized-branch>", "refs/remotes/origin/<normalized-branch>"]` in that order. Create results SHALL omit `base` when neither CLI nor configuration requests one, and every JSON path SHALL preserve single-document stdout isolation.

#### Scenario: JSON create resolves local and remote bases
- **WHEN** JSON create resolves a requested base locally in one selected repository and from `origin` in another
- **THEN** stdout contains exactly one success envelope
- **AND** `data.base` contains `requestedBranch`, `source`, and `repositories`
- **AND** every repository entry contains `repositoryName`, `repositoryPath`, `resolvedRef`, `resolvedOid`, and `targetAction`
- **AND** `requestedBranch`, `source`, path representation, value vocabularies, and repository order match the normative requirement

#### Scenario: JSON create reuses an existing target
- **WHEN** JSON create reuses an existing target branch under `REUSE_EXISTING`
- **THEN** that repository record identifies reuse and its independently resolved requested base
- **AND** does not claim that the existing target was created from the requested base

#### Scenario: JSON base resolution fails in multiple repositories
- **WHEN** more than one selected repository lacks the requested base
- **THEN** stdout contains exactly one error envelope with code `CREATE_BASE_RESOLUTION_FAILED`
- **AND** error details contain `requestedBranch`, `source`, and `repositories`
- **AND** every failure entry contains `repositoryName`, `repositoryPath`, and `attemptedRefs`
- **AND** only affected repositories appear in selected-set order with the exact local-then-origin attempted-ref array
- **AND** no human progress or diagnostics are written to stdout
