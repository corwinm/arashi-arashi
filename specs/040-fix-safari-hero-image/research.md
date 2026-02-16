# Research: Safari Hero Image Visibility

**Date**: 2026-02-15  
**Feature**: 040-fix-safari-hero-image  
**Purpose**: Resolve rendering, compatibility, and validation decisions for Safari hero-image collapse on the docs homepage.

## 1) Safari Hero Rendering Contract

### Decision

Adopt an explicit sizing contract for the hero media so Safari does not infer a zero-height render:

- Ensure hero media has clear intrinsic dimensions.
- Keep responsive behavior through width-constrained scaling and preserved aspect ratio.
- Avoid wrapper layout behavior that can trigger Safari flex/SVG intrinsic-size collapse.

### Rationale

- Safari can resolve inline SVG height to zero in specific flex/intrinsic sizing combinations where Chromium still renders correctly.
- A deterministic sizing contract removes browser ambiguity and keeps behavior stable across reload/cached styles.
- This approach fixes root layout semantics rather than masking the bug with arbitrary minimum heights.

### Alternatives considered

- Add only wrapper minimum height: rejected as brittle and not ratio-aware.
- Keep current inline SVG with only `viewBox`: rejected because Safari remains unreliable.
- Replace hero media with file-only image immediately: viable but less flexible than fixing current pattern; kept as fallback path.

## 2) Hero Media Pattern for Starlight Splash Pages

### Decision

Use a resilience-first hero media policy:

- Prefer file-based hero image configuration for default stability.
- If inline HTML/SVG is used, require explicit intrinsic sizing semantics.
- Keep hero text/actions readable and layout-stable even when media fails to load.

### Rationale

- File-based hero media is generally more predictable for browser layout reservation and cross-browser consistency.
- Explicit sizing for inline SVG prevents zero-height outcomes on Safari and mobile browsers.
- Separating textual content usability from media availability protects core homepage readability.

### Alternatives considered

- Inline SVG everywhere: rejected due to higher risk of browser-specific sizing regressions.
- CSS background-only hero: rejected because content semantics/accessibility are weaker.
- Media-dependent text layout: rejected because content readability degrades when media fails.

## 3) Cross-Browser Validation Strategy

### Decision

Adopt a hybrid validation model:

- Keep existing automated docs validation/build checks as required gates.
- Add deterministic browser verification for Safari desktop + Safari mobile and non-Safari smoke checks.
- Use explicit acceptance checks for hero visibility, non-zero height, and unchanged readability.

### Rationale

- This feature is a browser-specific rendering bug, so visual acceptance checks are essential.
- Existing automated validation catches broad regressions; targeted browser checks confirm Safari behavior.
- Combining deterministic checks with lightweight manual QA gives strong confidence without excessive process overhead.

### Alternatives considered

- Manual-only verification: rejected due to inconsistent repeatability.
- Automation-only visual snapshots: rejected as insufficient for full Safari-device confidence in this workflow.
- Single-browser checks: rejected because they miss cross-browser regressions introduced by Safari fixes.

## Result

All planning unknowns for this feature are resolved. No `NEEDS CLARIFICATION` items remain.
