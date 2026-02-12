# Research: Install Script and Onboarding Instructions

**Date**: 2026-02-11  
**Feature**: 038-add-install-script  
**Purpose**: Resolve planning decisions for installer behavior, dual-method onboarding content, and cross-surface consistency.

## 1) One-Command curl Install Behavior

### Decision

Use a thin, one-command curl installer as an official direct-install path, with default latest-stable install and optional version pinning.

### Rationale

- One-command bootstrap aligns with issue intent and reduces first-run friction.
- Latest-by-default supports simple onboarding, while pinned version support enables reproducible team/CI workflows.
- A thin script minimizes maintenance and keeps canonical install behavior tied to release assets.

### Alternatives considered

- Latest-only installer: rejected due to weaker reproducibility for teams.
- Pinned-only installer: rejected due to higher friction for first-time users.
- npm-only onboarding: rejected because the feature explicitly requires curl and npm options.

## 2) Installer Integrity and Reliability

### Decision

Installer flow should include strict download behavior, platform-aware asset selection, and checksum verification before final placement.

### Rationale

- Integrity checks reduce tampering risk for curl-based installation.
- Platform detection with explicit unsupported-matrix messaging prevents ambiguous failures.
- Atomic replacement and rerunnable behavior improve reliability for retries and automation.

### Alternatives considered

- No checksum verification: rejected due to weaker supply-chain posture.
- API-only release resolution: rejected as unnecessary complexity for baseline onboarding.
- Always reinstall on every run: rejected due to avoidable drift and bandwidth cost.

## 3) Canonical Placement of Install Instructions

### Decision

Use `repos/arashi-docs/docs/getting-started/index.md` as canonical onboarding detail for dual install paths, with `repos/arashi-docs/docs/index.md` hero exposing both methods at first glance and routing users to complete guidance.

### Rationale

- Getting Started already owns first-run setup and keeps detailed instructions in one maintained location.
- Landing hero visibility satisfies discoverability requirement while preserving concise splash layout.
- This keeps onboarding consistent with docs navigation conventions and avoids fragmented guidance.

### Alternatives considered

- Put full install instructions only in splash hero: rejected because hero content becomes crowded and harder to maintain.
- Keep install details only in README: rejected because docs site is the primary guided onboarding surface.
- Add separate new install page immediately: deferred because current Getting Started page can absorb scope without extra navigation overhead.

## 4) Multi-Surface Consistency Model

### Decision

Treat install commands and expected outcomes as a governed content contract across three surfaces: `repos/arashi/README.md`, `repos/arashi-docs/docs/getting-started/index.md`, and `repos/arashi-docs/docs/index.md` hero.

### Rationale

- The same user can enter from GitHub README or docs site; drift between surfaces creates failed installs and support load.
- Contract-style validation criteria make acceptance repeatable and auditable.
- Consistency directly supports FR-006 and SC-003.

### Alternatives considered

- Informal/manual spot checks only: rejected due to high drift risk over time.
- Single-source only (remove one entry point): rejected because both README and docs are intentional acquisition surfaces.

## 5) Fallback and Troubleshooting Expectations

### Decision

Document explicit fallback guidance: if curl path fails, users can use npm path; if npm prerequisites are missing, users can use curl path or platform-specific manual route where needed.

### Rationale

- Dual-path fallbacks maximize successful installs in varied environments.
- Clear prerequisite and troubleshooting guidance reduces first-run confusion.
- Matches requested behavior for common failures and no-account onboarding.

### Alternatives considered

- One fallback path only: rejected because it does not cover users with constrained environments.
- Long troubleshooting guide only in deep docs: rejected because first-run onboarding needs immediate actionable recovery steps.

## 6) Release Integration for Installer Artifacts

### Decision

Keep installer logic aligned with semantic-release output and ensure install-related artifacts (binary mapping and integrity metadata) are published in the same release flow as binaries.

### Rationale

- Existing release automation is already the single source of version truth.
- Publishing installer artifacts with binaries prevents version skew.
- Improves trust and consistency for both curl and npm users.

### Alternatives considered

- Separate post-release artifact generation: rejected due to additional failure modes and drift.
- Manual artifact publishing: rejected due to repeatability and auditability concerns.

## Result

All Phase 0 unknowns are resolved:

- Installer mode, integrity strategy, and platform behavior are defined.
- Canonical docs and hero placement strategy for dual install options is defined.
- Cross-surface consistency and fallback policies are defined.
- Release integration expectations for installer-related assets are defined.

No unresolved `NEEDS CLARIFICATION` items remain.
