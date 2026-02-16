# Hero Visibility Checks Contract

**Feature**: 040-fix-safari-hero-image  
**Scope**: Docs homepage hero on `repos/arashi-docs/docs/index.mdx`  
**Last Updated**: 2026-02-15

## Required Browser Profiles

| Profile ID | Browser | Platform | Viewport / Device | Required for Release |
|------------|---------|----------|-------------------|----------------------|
| safari-desktop-latest | Safari | macOS desktop | 1440x900 | yes |
| safari-mobile-latest | Safari | iOS mobile | 390x844 (iPhone 14 class) | yes |
| chrome-desktop-latest | Chrome | desktop | 1440x900 | yes |
| firefox-desktop-latest | Firefox | desktop | 1440x900 | yes |

## Required Checks Per Profile

Each required profile must pass all checks:

1. `hero-visible`: Hero media is visible on initial homepage load.
2. `hero-nonzero-height`: Hero media rendered height is greater than 0px.
3. `hero-readable-content`: Hero title, tagline, and primary action are readable and unobstructed.
4. `hero-reload-stability`: Reloading the page does not collapse hero media.

## Cross-Browser Consistency Tolerances

- Hero media remains visible and centered in all required browsers.
- Hero media sizing may vary by browser engine, but should stay within a visually acceptable range (no clipping, no collapse, and no displacement that overlaps copy/actions).
- Text and action layout must preserve the same content order and interaction affordances across Safari, Chrome, and Firefox.

## Edge-Case Checks

Required additional checks:

1. `narrow-mobile-stability`: At narrow mobile widths, hero content remains readable and media remains visible.
2. `media-failure-readability`: If hero media fails to load/render, title/tagline/actions remain usable without overlap.

## Pass/Fail Rules

- **Pass**: 100% of required checks pass in all required profiles, and edge-case checks pass.
- **Fail**: Any required check fails or cannot be verified for a required profile.

## Evidence Template

For each profile capture:

- Browser + platform
- Viewport/device context
- Pass/fail per required check
- Notes for any visual discrepancy
- Timestamp and verifier

## Execution Matrix (Current Run)

| Profile ID | hero-visible | hero-nonzero-height | hero-readable-content | hero-reload-stability | narrow-mobile-stability | media-failure-readability | Status | Notes |
|------------|--------------|---------------------|-----------------------|-----------------------|-------------------------|---------------------------|--------|-------|
| safari-desktop-latest | pending-manual | pending-manual | pending-manual | pending-manual | not-applicable | pending-manual | fail | Manual Safari desktop verification required in a macOS Safari session. |
| safari-mobile-latest | pending-manual | pending-manual | pending-manual | pending-manual | pending-manual | pending-manual | fail | Manual iOS Safari viewport/device verification required. |
| chrome-desktop-latest | pending-manual | pending-manual | pending-manual | pending-manual | not-applicable | pending-manual | fail | Browser comparison run still required for parity evidence. |
| firefox-desktop-latest | pending-manual | pending-manual | pending-manual | pending-manual | not-applicable | pending-manual | fail | Browser comparison run still required for parity evidence. |

**Overall Result**: fail (required browser-profile checks are not fully executed in this CLI environment).
