# Quickstart: Safari Hero Image Visibility

**Feature**: 040-fix-safari-hero-image  
**Audience**: Maintainers fixing docs homepage hero rendering issues in Safari  
**Last Updated**: 2026-02-15

## Goal

Ensure the docs homepage hero image renders with non-zero height in Safari while preserving cross-browser layout quality and readable fallback behavior.

## Prerequisites

- Workspace has synchronized repositories in `repos/`.
- You can edit and validate `repos/arashi-docs`.
- Safari desktop and Safari mobile verification environments are available.

## Step 1: Update Hero Media Sizing Contract

1. Open `repos/arashi-docs/docs/index.mdx`.
2. Keep hero content browser-neutral while adding stable media hooks:
   - `hero-media-shell`
   - `hero-media-frame`
   - `hero-media-svg`
3. Ensure inline SVG carries explicit intrinsic semantics (`viewBox`, `width`, `height`, `preserveAspectRatio`).

## Step 2: Stabilize Hero Layout Behavior

1. Open `repos/arashi-docs/src/styles/theme.css`.
2. Add shared hero-media baseline rules:
   - Force deterministic media wrapper display (`.hero > .hero-html.sl-flex { display: block; }`).
   - Reserve non-zero media geometry via `aspect-ratio` and `min-height`.
   - Preserve responsive width behavior and readable fallback spacing.
   - Keep desktop hero visual balance by constraining media width/height (`width: min(100%, 23rem)`, `min-height: clamp(12rem, 20vw, 20rem)`).
3. Verify desktop and narrow-viewport spacing/alignment remain visually stable.

## Step 3: Validation Template (Required Profiles)

Use this template for every verification run:

| Profile ID | Browser/Platform | Viewport | hero-visible | hero-nonzero-height | hero-readable-content | hero-reload-stability | narrow-mobile-stability | media-failure-readability | Verifier | Timestamp | Notes |
|------------|------------------|----------|--------------|---------------------|-----------------------|-----------------------|-------------------------|---------------------------|----------|-----------|-------|
| safari-desktop-latest | Safari macOS | 1440x900 | pending | pending | pending | pending | n/a | pending | pending | pending | Manual run required |
| safari-mobile-latest | Safari iOS | 390x844 | pending | pending | pending | pending | pending | pending | pending | pending | Manual run required |
| chrome-desktop-latest | Chrome desktop | 1440x900 | pending | pending | pending | pending | n/a | pending | pending | pending | Manual run required |
| firefox-desktop-latest | Firefox desktop | 1440x900 | pending | pending | pending | pending | n/a | pending | pending | pending | Manual run required |

## Step 4: Automated Quality Gates

Executed from `repos/arashi-docs`:

| Command | Result | Notes |
|---------|--------|-------|
| `bun run lint` | pass | `markdownlint` completed with no errors. |
| `bun run validate` | pass | Includes lint, build, internal links, a11y smoke, docs-domain, and README link checks. |
| `bun run build` | pass | Astro check + static build completed successfully. |

Run timestamp: 2026-02-15 16:07 local.

## Step 5: Browser Acceptance Results

Current execution status in this CLI session:

| Profile ID | Result | Notes |
|------------|--------|-------|
| safari-desktop-latest | pending-manual | Requires Safari desktop verification outside CLI runtime. |
| safari-mobile-latest | pending-manual | Requires iOS Safari viewport/device verification outside CLI runtime. |
| chrome-desktop-latest | pending-manual | Cross-browser comparison still required. |
| firefox-desktop-latest | pending-manual | Cross-browser comparison still required. |

## Step 6: Edge-Case Outcomes

| Check | Result | Notes |
|-------|--------|-------|
| Reload stability in Safari | pending-manual | Must verify in Safari desktop and Safari mobile sessions. |
| Narrow mobile viewport stability | pending-manual | Must verify in Safari mobile viewport/device. |
| Media-failure readability | pending-manual | Simulate blocked/failed hero media and verify readability. |

## Expected Outcome

Safari users should consistently see a non-zero-height hero media region, with cross-browser layout parity and readable hero content preserved if media is unavailable.

## Release Readiness

Status: blocked pending manual browser acceptance execution for required profiles.

To clear release readiness:

1. Complete Safari desktop and Safari mobile checks.
2. Complete Chrome and Firefox comparison checks.
3. Update this file and `contracts/hero-visibility-checks.md` with final pass/fail evidence.
