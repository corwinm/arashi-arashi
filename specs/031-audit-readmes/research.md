# Research: Audit README Documentation

**Date**: 2026-02-09  
**Feature**: 031-audit-readmes  
**Purpose**: Resolve planning unknowns and document implementation-facing decisions for README auditing.

## 1) README Status Badges and Header Layout

### Decision

Use a minimal badge set in README headers: npm package version, CI status, and license. Optionally include one additional non-vanity badge only if it is auto-updated and directly actionable.

### Rationale

- These badges provide immediate trust signals for adoption and contribution decisions.
- The required set aligns with issue acceptance criteria and avoids badge clutter.
- Auto-updated badge sources reduce documentation drift risk compared with static status text.

### Alternatives considered

- No badges: simpler layout but weaker at-a-glance project health signal.
- Large badge wall: higher visual noise and higher stale-link risk.
- Static/manual badges: easiest to add but highest risk of stale information.

## 2) Contribution Guide Placement and Naming

### Decision

Use `CONTRIBUTING.md` as the canonical contribution guide filename and keep README contribution text as a concise pointer to that file.

### Rationale

- `CONTRIBUTING.md` is the standard convention used by Git hosting platforms and contributors.
- A dedicated file allows richer contributor guidance without bloating README onboarding content.
- A single canonical document reduces contradictory guidance across entry points.

### Alternatives considered

- Keep full contribution content in README only: less maintainable as guidance grows.
- Non-standard filename (`CONTRIBUTE.md`, custom docs path): reduced discoverability.
- Multiple contribution guides per repo area: increases drift and ambiguity.

## 3) Spec-Driven Framework Support Matrix

### Decision

Adopt a four-level support taxonomy for framework entries: `Native`, `Supported with modifications`, `Experimental`, `Not supported`. Include required frameworks (Spec-Kit, OpenSpec, Kiro) plus additional mainstream options (BDD and Specification by Example).

### Rationale

- The taxonomy provides clear expectations while still allowing nuanced caveats.
- Required frameworks from issue scope are covered and comparable.
- Additional frameworks broaden usefulness for evaluators deciding workflow fit.

### Alternatives considered

- Binary supported/not-supported labels: too coarse for real-world compatibility.
- Free-form support prose: flexible but inconsistent and harder to compare.
- Excluding additional frameworks: meets minimum requirement but reduces decision value.

## 4) Documentation Audit Method for Accuracy

### Decision

Use claim-based auditing: break README statements into verifiable claims and validate each against concrete repository artifacts (source behavior, command surface, workflows, package metadata, and docs links).

### Rationale

- Claim-level verification is more objective than section-level editorial review.
- It supports repeatable acceptance checks and easier future re-audits.
- It catches both explicit inaccuracies and omission gaps.

### Alternatives considered

- Page-level narrative review only: faster but too subjective.
- Full rewrite approach: expensive and unnecessary for targeted correction scope.
- Periodic ad-hoc sweeps: inconsistent and hard to measure.

## 5) Link and Reference Validation Strategy

### Decision

Validate README links in three categories: internal anchors, same-repository file links, and external links (badges/docs). Treat broken links as release-blocking for this feature scope.

### Rationale

- Link breakage is one of the highest-impact documentation failures for onboarding.
- Multi-repo references are especially prone to drift and require explicit checks.
- This supports FR-007 and FR-011 with measurable verification.

### Alternatives considered

- Manual spot checks only: misses regressions and edge links.
- External-link-only checks: leaves most markdown navigation failures undetected.
- Non-blocking broken links: faster merges but poor user experience.

## Result

All planning unknowns are resolved with explicit decisions. No unresolved `NEEDS CLARIFICATION` items remain.
