# Research: Documentation Site Repository Initialization

**Date**: 2026-02-10  
**Feature**: 034-init-docs-site  
**Purpose**: Resolve planning unknowns for documentation repository setup, publishing, and contributor workflow.

## 1) Deployment Platform Selection

### Decision

Use Netlify as the initial hosting platform, with production deployment from the default branch and deploy previews for pull requests.

### Rationale

- Built-in deploy previews improve documentation review quality before merge.
- Rollback to a previous successful deploy is straightforward and fast.
- Hosting, CDN delivery, and TLS are managed with low operational burden.
- Works well with static documentation sites and supports continuous deployment from repository changes.

### Alternatives considered

- GitHub Pages: simple and low-cost, but weaker preview and rollback ergonomics for this workflow.
- Vercel: excellent performance and preview UX, but adds similar vendor governance complexity without stronger fit for this scope.

## 2) Minimum Publication Validation Gate Set

### Decision

Block publication on these checks: deterministic install, documentation build/type checks, internal link/anchor integrity, markdown/content lint baseline, and accessibility smoke checks on critical pages. Treat external link checks as non-blocking initially and enforce them in scheduled maintenance runs.

### Rationale

- Build and type/content validation prevent publishing broken documentation output.
- Internal links are a high-impact failure mode for user navigation and must be blocking.
- Linting keeps contributor output consistent and reduces editorial drift.
- Accessibility smoke checks catch severe regressions early with low maintenance cost.
- External links are prone to transient network failures; scheduled checks reduce false negatives while preserving quality.

### Alternatives considered

- Lighter checks (build-only + internal links): faster but misses quality and accessibility regressions.
- Heavier checks (full crawl a11y, visual regression, blocking external link checks): stronger coverage but higher flake and maintenance burden for initial scope.

## 3) Initial Information Architecture for Astro + Starlight

### Decision

Use curated top-level navigation with mostly auto-generated internals: landing page, getting started, guides, command/reference, concepts, and contributing.

### Rationale

- Matches primary user journeys: onboarding first, command lookup second.
- Scales content while minimizing manual sidebar maintenance.
- Keeps contributor guidance directly discoverable from the docs site.
- Supports incremental growth without reworking top-level navigation.

### Alternatives considered

- Fully auto-generated navigation: low setup, but poorer long-term discoverability.
- Fully manual navigation: high control, but high maintenance overhead.
- Strict Diataxis naming as primary menu: methodologically clean, but less intuitive for initial CLI audience labeling.

## 4) Main README to Docs Site Integration Pattern

### Decision

Use one canonical documentation URL as the README entry point, place it near the top of README for discoverability, and protect it with CI link health checks plus post-deploy smoke checks.

### Rationale

- Stable entry point avoids drift when repository internals evolve.
- Top-of-README placement improves documentation discoverability.
- Health checks prevent stale or broken links from becoming the primary user path.
- Smoke checks align README promises with actual site availability.

### Alternatives considered

- Link only to repository markdown files: simpler, but weaker navigation and onboarding UX.
- Link directly to provider-specific ephemeral URLs: quick setup, but brittle under path or provider changes.
- Keep docs only inside the main repo: simpler ownership, but conflicts with requirement for separate documentation repository.

## Result

All planning unknowns from Technical Context are resolved:

- Publish validation gate scope is now defined.
- Initial deployment platform choice is made (Netlify).
- Initial documentation information architecture is defined.
- README integration and link resilience policy is defined.

No unresolved `NEEDS CLARIFICATION` items remain.
