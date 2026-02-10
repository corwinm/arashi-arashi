# Research: Fix create command in bare repositories

**Date**: 2026-02-09
**Context**: Enable `create` to run from bare repository roots without false config-not-found failures and without regressing normal worktree behavior.

## Decisions

- **Decision**: Detect invocation context early and branch execution logic for bare vs non-bare repository entry points.
  **Rationale**: The current failure path comes from assuming a checked-out working directory and local config file path. Explicit context detection avoids this invalid assumption.
  **Alternatives considered**: Keep a single path that always reads local files from current directory; rejected because bare repositories do not expose checked-out workspace files.

- **Decision**: Resolve workspace root for `create` using workspace discovery behavior already used by other commands, and only fall back to bare-repo specific lookup when local workspace discovery cannot succeed.
  **Rationale**: Reuse of established behavior reduces regression risk and keeps non-bare command behavior unchanged.
  **Alternatives considered**: Add a create-only configuration path flag; rejected because it increases user burden and conflicts with minimalist configuration principles.

- **Decision**: For bare repository invocation, source configuration from repository content (default-branch view) when `.arashi/config.json` is not available as a local file.
  **Rationale**: This satisfies the feature requirement that configuration remains usable from bare repositories and aligns with the workspace configuration being authoritative.
  **Alternatives considered**: Require users to always run from an existing non-bare worktree; rejected because it does not solve the reported bug and weakens bare-repo support.

- **Decision**: Run create operations in a valid non-bare worktree context associated with the target repository when invoked from bare root.
  **Rationale**: Worktree creation and repository discovery logic depend on filesystem paths that represent checked-out content.
  **Alternatives considered**: Perform all operations directly in bare root; rejected because repository discovery and relative-path semantics become ambiguous or invalid.

- **Decision**: Preserve existing rollback semantics and conflict behavior unchanged.
  **Rationale**: The issue is context resolution, not orchestration semantics; changing rollback/conflict behavior would expand scope and increase risk.
  **Alternatives considered**: Introduce new partial-success modes for bare runs; rejected due to inconsistency and higher support cost.

- **Decision**: Add targeted coverage for both success and failure flows specific to bare invocation.
  **Rationale**: The regression is environment-specific; integration coverage is required to prevent reintroduction.
  **Alternatives considered**: Unit-only tests; rejected because they would not validate end-to-end command behavior across repository contexts.
