# Quickstart: Documentation Site Repository Initialization

**Feature**: 034-init-docs-site  
**Audience**: Maintainers creating and operating the dedicated documentation site repository  
**Last Updated**: 2026-02-10

## Goal

Stand up a dedicated documentation site repository with a clear landing page, baseline information architecture, automated publication, and a reliable README entry link from the main project repository.

## Prerequisites

- Workspace includes synchronized repositories under `repos/`.
- You have permission to update:
  - `repos/arashi-docs/`
  - `repos/arashi/README.md`
- CI can run documentation validation and publication workflows.

## Step 1: Initialize the Documentation Repository Baseline

1. Create or confirm the dedicated documentation repository (`repos/arashi-docs`).
2. Add baseline documentation structure:
   - landing page
   - getting started section
   - command/reference section
   - contribution section
3. Confirm top-level navigation exposes all baseline sections from the landing page.

## Step 2: Define Contribution and Maintenance Policy

1. Document owners and review expectations.
2. Document how contributors add new pages without breaking information architecture rules.
3. Ensure contribution guidance is discoverable from both docs navigation and repository root conventions.

## Step 3: Configure Validation Gates

Set publication-blocking checks to require:

- deterministic dependency install
- documentation build/type checks
- internal link and anchor validation
- markdown/content lint baseline
- accessibility smoke checks on key pages

Configure external link checks as non-blocking in publication but required on a scheduled maintenance job.

## Step 4: Configure Automated Publication

1. Configure Netlify to deploy production updates automatically from the default branch.
2. Enable deploy previews for pull requests so reviewers can validate content before merge.
3. Ensure failed production deploy attempts keep the last successful live version active.
4. Record deploy status and actionable failure details for maintainers.

## Step 5: Add Main README Documentation Entry Link

1. Add a visible `Documentation` link near the top of `repos/arashi/README.md`.
2. Point the link to the canonical live documentation URL.
3. Add CI checks that fail if the README documentation link is stale or unreachable.

## Step 6: Validate End-to-End Behavior

1. Merge a valid docs update and confirm publication completes within the target window.
2. Intentionally trigger a validation failure and confirm publication is blocked.
3. Intentionally trigger a publish failure after validation and confirm last successful live content remains available.
4. Verify a first-time contributor can add a page by following the documented workflow.

## Validation Outcomes (2026-02-10)

- `bun run lint`: pass
- `bun run validate:links:internal`: pass
- `bun run validate:build`: pass (Astro check + static build completed)
- `bun run validate:a11y`: pass (critical page smoke checks)
- `bun run validate:links:external`: pass (1 external link checked)
- `bun run validate:readme-link`: pass with warning (canonical Netlify URL currently returns `404` before first production publish)

## Expected Outcome

Users can find and access project documentation from the main README immediately, maintainers can publish updates automatically with clear failure visibility, and contributors can extend documentation using a stable documented process.
