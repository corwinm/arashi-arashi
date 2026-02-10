# Phase 0 Research: skills.sh Integration Repository

## Manifest and Skill Packaging

**Decision**: Use a spec-compliant `SKILL.md` with frontmatter that includes required identity fields (`name`, `description`) and explicit compatibility metadata, then organize extended instructions using `references/`, `assets/`, and `scripts/` folders.

**Rationale**: Skills tooling depends on discoverable `SKILL.md` definitions. A structured package improves discoverability, keeps prompts concise, and supports progressive disclosure for advanced workflows.

**Alternatives considered**:
- Single large markdown file with no structured assets (rejected: poor maintainability and weak context efficiency)
- Minimal metadata only (rejected: reduces discoverability quality and future portability)

## Installation Flow Behavior

**Decision**: Design installation as a non-interactive fetch/copy/symlink operation with no assumption that installer scripts execute automatically.

**Rationale**: Skills installation behavior centers on acquiring skill files, not running arbitrary setup scripts. This avoids hidden side effects and keeps first-run setup predictable.

**Alternatives considered**:
- Mandatory auto-run install hooks during add/install (rejected: not guaranteed by platform behavior)
- Fully manual post-install setup with no defaults (rejected: high onboarding friction)

## Workflow Exposure Pattern

**Decision**: Expose common Arashi workflows through explicit task-oriented command sections in `SKILL.md`, with at least three end-to-end examples.

**Rationale**: Users adopt integrations faster when each workflow maps to a clear goal, command sequence, and expected outcome.

**Alternatives considered**:
- Implicit workflow discovery only through raw command docs (rejected: slower onboarding)
- Opinionated single workflow only (rejected: does not satisfy broad use cases)

## Publication and Discoverability

**Decision**: Treat publication as optional and support public-repository discoverability via standard skills install paths; include a verification step that confirms the skill is discoverable post-release where supported.

**Rationale**: Platform listing behavior can be policy-driven and may not support all accounts equally. A conditional publication flow keeps scope realistic while preserving release readiness.

**Alternatives considered**:
- Require registry publication in all environments (rejected: may fail due to platform/account limitations)
- Omit publication guidance entirely (rejected: weak release readiness)

## Onboarding and Troubleshooting Standards

**Decision**: Use a two-phase user journey: preflight checklist first, then golden-path quickstart, followed by symptom-to-fix troubleshooting guidance.

**Rationale**: Most first-run failures come from prerequisites, auth context, or environment mismatch. Preflight plus direct remediation improves completion rates and reduces support overhead.

**Alternatives considered**:
- Quickstart only with deferred troubleshooting (rejected: pushes failures later and increases drop-off)
- FAQ-style troubleshooting (rejected: low scanability during failure)

## Validation and Reliability Gates

**Decision**: Define a three-gate validation model: preflight prerequisites, deterministic installation, and workflow execution verification, each with explicit pass/fail criteria.

**Rationale**: Separating gates improves fault isolation and provides measurable reliability signals for release readiness.

**Alternatives considered**:
- Single end-to-end smoke check only (rejected: poor diagnosis when failures occur)
- Manual verification without gate definitions (rejected: inconsistent and non-repeatable)

## Clarification Resolution

All technical context uncertainties are resolved for planning. No remaining `NEEDS CLARIFICATION` items.
