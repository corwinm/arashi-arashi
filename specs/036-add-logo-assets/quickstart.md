# Quickstart: Unified Logo Presence

**Feature**: 036-add-logo-assets  
**Audience**: Maintainers implementing logo consistency across CLI and docs surfaces  
**Last Updated**: 2026-02-11

## Goal

Apply one cohesive Arashi logo family across the required four surfaces:

1. README top section
2. CLI help output
3. Docs site visible branding
4. Docs site favicon

## Prerequisites

- Workspace has synchronized repositories in `repos/`.
- You can edit in-scope repositories:
  - `repos/arashi`
  - `repos/arashi-docs`
- You can run quality gates in both repositories.

## Step 1: Define Logo Family Assets

1. Finalize one full textual logo and one compact icon treatment.
2. Confirm text-rendered variants remain readable in monochrome output and common monospace fonts.
3. Confirm a compact icon treatment exists for favicon usage and constrained surfaces.

## Step 2: Apply README Placement

1. Update the top of the in-scope README surface in `repos/arashi`.
2. Ensure logo appears before primary descriptive content.
3. Verify rendering in standard markdown views.

## Step 3: Apply CLI Help Placement

1. Update CLI help output in `repos/arashi` to include logo treatment.
2. Apply fallback rules so narrow or non-interactive contexts remain readable.
3. Verify command descriptions and usage text remain fully scannable.

## Step 4: Apply Docs Site Branding and Favicon

1. Update docs-site visible branding in `repos/arashi-docs` to use the same logo family.
2. Add/update favicon assets with compact icon treatment.
3. Ensure browser tab icon clearly matches the same brand family.

## Step 5: Validate Required Surfaces

1. Verify logo presence and readability on all four required surfaces.
2. Verify CLI help behavior at common terminal widths (120, 100, 80, 60 columns).
3. Verify docs favicon appearance in desktop and mobile browser contexts.

## Step 6: Run Quality Gates

In `repos/arashi`:

1. `bun run lint`
2. `bun test`
3. `bun run build`

In `repos/arashi-docs`:

1. `bun run validate`
2. `bun run build`

## Step 7: Record Acceptance Evidence

1. Capture verification notes for each required surface.
2. Confirm readability and brand coherence expectations are met.
3. Capture reviewer feedback and final sign-off.

## Expected Outcome

Arashi branding appears consistently and readably across README, CLI help, docs header, and docs favicon, with fallback behavior that avoids broken presentation in constrained contexts.

## Acceptance Evidence (2026-02-11)

### README Header Logo Verification

- Surface: `repos/arashi/README.md`
- Check: Full text logo appears before `# Arashi` heading in markdown renderers.
- Outcome: Pass

### Four-Surface Consolidated Verification

| Surface | Evidence | Outcome |
|---------|----------|---------|
| README top logo | Full text logo block present above heading in `repos/arashi/README.md`. | Pass |
| CLI help logo | `arashi -h` uses full/compact/plain variants based on width and interaction context. | Pass |
| Docs header logo | Starlight config references `src/assets/arashi-logo.svg` and renders branded header logo. | Pass |
| Docs favicon | `public/favicon.svg` and `public/favicon.ico` configured in docs head links. | Pass |

### CLI Width and Context Matrix

| Context | Expected Variant | Outcome |
|---------|------------------|---------|
| Interactive, 120 columns | Full | Pass |
| Interactive, 100 columns | Full | Pass |
| Interactive, 80 columns | Compact | Pass |
| Interactive, 60 columns | Compact | Pass |
| Non-interactive (piped) | Plain `arashi` | Pass |
