# Research: Fix create --dry-run

**Date**: 2026-02-08
**Context**: Ensure dry-run behavior matches create planning without side effects.

## Decisions

- **Decision**: Dry-run uses the same inputs and planning rules as real create.
  **Rationale**: Guarantees output accuracy and prevents drift between preview and execution.
  **Alternatives considered**: A separate dry-run-only planner; rejected due to divergence risk.

- **Decision**: No new dependencies or configuration required.
  **Rationale**: Preserves single-file executable constraints and minimalist configuration.
  **Alternatives considered**: Introducing a new formatting or validation library; rejected as unnecessary.

- **Decision**: Conflicts are treated as blocking with a clear blocked outcome while still listing the plan.
  **Rationale**: Aligns with user expectation to resolve issues before running create.
  **Alternatives considered**: Partial success with implicit skipping; rejected due to ambiguity.
