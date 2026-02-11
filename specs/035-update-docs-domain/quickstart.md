# Quickstart: Update Docs Domain Across Projects

**Feature**: 035-update-docs-domain  
**Audience**: Maintainers updating canonical documentation links across repositories  
**Last Updated**: 2026-02-10

## Goal

Migrate all in-scope deprecated documentation-domain references to `https://arashi.haphazard.dev`, preserve deep-link semantics, and produce release-ready verification evidence.

## Prerequisites

- Workspace includes synchronized repositories under `repos/`.
- You can edit and validate these in-scope surfaces:
  - `repos/arashi/README.md`
  - `repos/arashi-docs/README.md`
  - `repos/arashi-docs/astro.config.mjs`
  - `repos/arashi-docs/scripts/check-readme-link.ts`
  - `repos/arashi-docs/docs/contributing/validation-troubleshooting.md`
- You can run docs validation checks in `repos/arashi-docs`.

## Step 1: Confirm Canonical Domain Policy

1. Confirm the approved canonical docs domain is `https://arashi.haphazard.dev`.
2. Confirm all in-scope projects/surfaces for this migration window.
3. Define any known immutable or external artifacts that may require exception handling.

## Step 2: Audit Current References

1. Inventory target-domain references in all in-scope surfaces.
2. Classify each finding as:
   - target-domain reference to replace,
   - non-target reference to keep,
   - candidate exception.
3. Record baseline counts for release evidence.

## Step 3: Apply Domain Updates

1. Replace deprecated docs-domain references with `https://arashi.haphazard.dev`.
2. Preserve existing path/query/fragment components for domain-only replacements.
3. Leave non-target external URLs unchanged.

## Step 4: Handle Exceptions Explicitly

1. For each unreplaced target reference, create an exception record.
2. Include impacted surface, reason, and accountable owner.
3. Ensure exception approvals are captured before release approval.

## Step 5: Validate Canonical Consistency

1. Run docs quality gates and README-link health checks in `repos/arashi-docs`.
2. Verify primary documentation entry points in scope resolve to the canonical domain on first click.
3. Confirm no critical broken-link findings remain.

## Step 6: Produce Migration Evidence

1. Publish an evidence record listing:
   - all updated target references,
   - all approved exceptions,
   - validation results.
2. Confirm that `updated + approved exceptions = total target references`.
3. Share evidence with release approver for final sign-off.

## Expected Outcome

All in-scope documentation entry points consistently use `https://arashi.haphazard.dev`, deprecated-domain references are removed or explicitly excepted, and release approval can be completed quickly from a single audit trail.
