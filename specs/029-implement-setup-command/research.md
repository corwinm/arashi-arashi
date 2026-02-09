# Research: Setup Command

**Date**: 2026-02-09
**Context**: Define a setup command that executes setup tasks across main and sub-repositories with filtering, visibility, timeout handling, and clear outcomes.

## Decisions

- **Decision**: Use workspace-config-driven repository discovery and apply a validated `--only` filter before execution.
  **Rationale**: Existing command patterns already normalize repository scope and fail fast when a requested repository is unknown, preventing silent omissions.
  **Alternatives considered**: Filesystem-only discovery; rejected because it can drift from configured workspace intent and produce inconsistent command behavior.

- **Decision**: Execute setup tasks sequentially, with main repository setup first, then sub-repositories.
  **Rationale**: Sequential execution preserves deterministic logs, respects dependency ordering expectations, and aligns with current mutating command behavior.
  **Alternatives considered**: Parallel execution of all repositories; rejected for initial delivery due to higher risk of noisy output, contention, and harder failure interpretation.

- **Decision**: Reuse existing timeout execution pattern and classify outcomes per repository as success, skipped, failed, or timed-out.
  **Rationale**: The existing timeout runner and result classification patterns support consistent CLI behavior, predictable summaries, and actionable remediation.
  **Alternatives considered**: Command-specific timeout implementation; rejected to avoid duplicated logic and inconsistent timeout behavior.

- **Decision**: Preserve existing CLI UX conventions: progress indicators during run, elapsed time per repository, optional verbose output, and final aggregated summary.
  **Rationale**: This matches proven output patterns from similar commands and keeps user expectations consistent across the CLI.
  **Alternatives considered**: JSON-only or spinner-only output model; rejected because it weakens usability in normal interactive workflows.

- **Decision**: Add integration-first test coverage using existing workspace/repo helper patterns, including failure and timeout simulation.
  **Rationale**: The command behavior is orchestration-heavy, so integration tests best validate repository filtering, ordering, output, and error classification.
  **Alternatives considered**: Unit-only testing; rejected because it cannot fully verify multi-repository execution semantics.
