# Phase 0 Research: Pull Command

## Decision 1: Configuration source

- **Decision**: Use the existing workspace configuration file as the single source of repository scope.
- **Rationale**: Matches the minimalist configuration principle and avoids introducing new configuration paths.
- **Alternatives considered**: Auto-discovery only; rejected because the spec requires a subset filter that relies on configured identifiers.

## Decision 2: Failure handling and rollback

- **Decision**: Attempt the update, then revert on conflict or error and mark the repository for manual update.
- **Rationale**: Aligns with the constitution's rollback principle and the clarified acceptance scenario.
- **Alternatives considered**: Pre-check and skip dirty repositories; rejected because it prevents valid fast-forward pulls and contradicts the clarified behavior.

## Decision 3: Result reporting and exit status

- **Decision**: Always emit per-repository results and exit non-zero if any repository fails or needs manual update.
- **Rationale**: Provides clear diagnostics for users and supports automation/CI usage.
- **Alternatives considered**: Always exit zero; rejected because failures would be harder to detect in scripts.
