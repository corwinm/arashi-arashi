## ADDED Requirements

### Requirement: Generated agent exports preserve configured path-budget semantics

Generated Markdown command pages and full-document agent exports SHALL preserve the canonical `worktreeNaming.maxPathLength` example, numeric/measurement semantics, deterministic shortening rule, coordinated-plan behavior, impossible-budget failure, compatibility boundaries, and repository-content limitation. Freshness validation SHALL reject missing, stale, or contradictory generated claims.

#### Scenario: Agent-readable exports are regenerated

- **WHEN** canonical configuration/create guidance changes for path budgeting
- **THEN** every maintained generated agent surface carries the same nested field and behavior
- **AND** source-versus-generated validation fails if any required semantic is removed or reversed
