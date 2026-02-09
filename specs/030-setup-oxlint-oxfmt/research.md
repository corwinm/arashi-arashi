# Research: Linter and Formatter Setup

**Date**: 2026-02-09
**Context**: Define a low-friction rollout of Oxlint and Oxfmt for local contributor workflows and pull request quality gates in the Arashi repository.

## Decisions

- **Decision**: Adopt a phased lint strictness rollout, starting with high-signal categories and progressively tightening enforcement.
  **Rationale**: This captures correctness issues quickly without overwhelming contributors with immediate style churn in an existing codebase.
  **Alternatives considered**: Enforce all lint categories from day one; rejected due to likely large migration noise and blocked contributor throughput.

- **Decision**: Provide explicit quality scripts for local and CI usage (`lint`, `lint:fix`, `lint:ci`, `format`, `format:check`) with consistent behavior.
  **Rationale**: Clear command intent reduces ambiguity, aligns local and CI outcomes, and makes onboarding easier.
  **Alternatives considered**: A single overloaded command; rejected because it mixes local and CI concerns and increases misuse risk.

- **Decision**: Pin formatter and linter versions at repository level and run the same commands in CI as documented for contributors.
  **Rationale**: Version pinning and shared command paths prevent local/CI drift and unexpected failures from upstream tool changes.
  **Alternatives considered**: Always running latest tool versions in CI; rejected because non-deterministic upgrades can destabilize pull request validation.

- **Decision**: Exclude generated, vendored, and transient artifacts through explicit ignore patterns in formatting and linting configuration.
  **Rationale**: This avoids noisy rewrites and preserves stable generated outputs while keeping source files consistently formatted.
  **Alternatives considered**: Repo-wide formatting with no exclusions; rejected because it risks touching non-source artifacts and creating unnecessary review noise.

- **Decision**: Run lint and format checks as required pull request gates with actionable failure output.
  **Rationale**: Hard fail quality gates ensure merge consistency, while clear file-level diagnostics keep remediation fast for contributors.
  **Alternatives considered**: Warning-only CI checks; rejected because non-blocking checks allow standards drift and reduce enforcement effectiveness.

- **Decision**: Keep full-repository checks as the default enforcement baseline and optionally add changed-file acceleration later if runtime targets are missed.
  **Rationale**: Full checks maximize confidence in early adoption and reduce the chance of hidden legacy violations slipping through.
  **Alternatives considered**: Changed-files-only checks by default; rejected for initial rollout because it may miss pre-existing issues affected by new rules.
