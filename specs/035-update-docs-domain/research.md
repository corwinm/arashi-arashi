# Research: Update Docs Domain Across Projects

**Date**: 2026-02-10  
**Feature**: 035-update-docs-domain  
**Purpose**: Resolve planning unknowns around migration scope, canonical URL policy, and regression prevention.

## 1) In-Scope Surface Inventory

### Decision

Treat the following five references as the initial migration scope:

- `repos/arashi/README.md`
- `repos/arashi-docs/README.md`
- `repos/arashi-docs/astro.config.mjs`
- `repos/arashi-docs/scripts/check-readme-link.ts`
- `repos/arashi-docs/docs/contributing/validation-troubleshooting.md`

### Rationale

- These are active, user-facing or policy-driving references to the deprecated default docs domain.
- They include the two coupled entry points (`repos/arashi/README.md` and the docs-repo URL health check) that must remain aligned.
- They cover canonical site config, maintainer guidance, and top-level discoverability.

### Alternatives considered

- Broaden scope to every `netlify` string in the workspace: rejected because many are non-URL artifacts (for example `.netlify/` ignore entries and dependency names).
- Limit scope to README links only: rejected because canonical site config and validation fallback would still drift.

## 2) Canonical URL Policy and Replacement Semantics

### Decision

Adopt `https://arashi.haphazard.dev` as the single canonical documentation domain and apply domain-only replacements that preserve existing path, query, and fragment values.

### Rationale

- A single HTTPS host avoids canonical ambiguity and inconsistent user paths.
- Domain-only replacement minimizes user-facing breakage and preserves deep links.
- Preserving URL suffix components aligns with FR-004 and reduces migration risk.

### Alternatives considered

- Allow multiple canonical hosts during steady state: rejected because it weakens consistency and invites regressions.
- Rewrite paths during domain migration: rejected because it compounds risk and expands scope beyond the requested change.

## 3) Deprecated-Domain Exception Policy

### Decision

Exclude non-URL and generated/vendor artifacts from replacement scope and treat them as documented exceptions when they contain non-target `netlify` text.

### Rationale

- Lockfiles, ignore patterns, and workflow path triggers can contain `netlify` tokens unrelated to docs-domain URLs.
- Explicit exception records preserve auditability while preventing noisy or incorrect edits.

### Alternatives considered

- Replace all `netlify` tokens unconditionally: rejected due to false-positive risk and unnecessary churn.
- Leave exceptions undocumented: rejected because FR-007 and FR-008 require explicit exception evidence.

## 4) Regression Prevention and Verification Pattern

### Decision

Use canonical URL validation as a release gate by aligning site config, README entry points, and link-health checks, and require migration evidence listing updates plus exceptions.

### Rationale

- Existing `validate:readme-link` behavior already enforces cross-repository canonical URL coupling and can be used as migration guardrail.
- Evidence-first verification gives approvers a deterministic way to confirm completeness and scope boundaries.
- Gate-based validation catches regressions before publish or release approval.

### Alternatives considered

- Manual spot checks only: rejected as insufficient for repeatable release approval.
- Rely on non-blocking external link checks: rejected because availability checks do not enforce canonical-host policy.

## Result

All initial planning unknowns are resolved:

- In-scope deprecated-domain references are identified.
- Canonical URL and replacement semantics are defined.
- Exception handling criteria are defined.
- Verification and regression-prevention approach is defined.

No unresolved `NEEDS CLARIFICATION` items remain.
