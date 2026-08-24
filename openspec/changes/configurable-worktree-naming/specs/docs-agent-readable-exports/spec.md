## ADDED Requirements

### Requirement: Agent-readable exports preserve configured naming guidance

Generated Markdown command pages and full-document agent-readable exports SHALL preserve the canonical authored `worktreeNaming` contract without stale topology examples or omitted safety qualifications. Generation and freshness checks MUST fail when closed values, compatibility defaults, exact representative destinations, unchanged Git branch identity, configured-only JSON-authored scope, collision behavior, existing-worktree compatibility, coordinated child placement, or standalone isolation drift from authored guidance.

#### Scenario: Agent reads generated configuration or create guidance

- **WHEN** generated command Markdown or the full agent-readable export contains configured worktree naming guidance
- **THEN** it exposes both closed fields, their compatibility defaults, and exact current/branch/repo-branch preserve/flatten examples
- **AND** retains the canonical safety and compatibility qualifications

#### Scenario: Generated export drifts from authored guidance

- **WHEN** generation or freshness validation observes a missing or contradictory naming-policy value, default, destination example, or safety qualification
- **THEN** validation fails deterministically rather than publishing stale agent guidance
