# Quickstart: Audit README Documentation

**Feature**: 031-audit-readmes  
**Audience**: Maintainers updating documentation across specs and implementation repositories  
**Last Updated**: 2026-02-09

## Goal

Update README and contribution documentation so it reflects current implementation, exposes key trust badges, and includes a clear spec-driven framework support matrix.

## Prerequisites

- Local workspace contains synced repositories under `repos/`.
- You can inspect these files:
  - `README.md`
  - `repos/arashi/README.md`
  - `repos/arashi/CONTRIBUTING.md`
  - `repos/arashi/package.json`
  - `repos/arashi/.github/workflows/ci.yml`
  - `repos/arashi/LICENSE`

## Step 1: Build the Claim Inventory

1. For each README in scope, list user-facing claims by section:
   - capabilities
   - installation/usage
   - command availability
   - project status statements
   - contribution flow
2. Assign each claim an ID and target evidence file.

## Step 2: Verify and Classify Claims

For each claim, mark one status:
- `verified`
- `outdated`
- `missing-context`
- `cannot-verify`

Then resolve all `outdated`, `missing-context`, and `cannot-verify` claims by updating content or removing invalid statements.

## Step 3: Normalize Contribution Guidance

1. Ensure contribution guidance lives in `CONTRIBUTING.md` (canonical location per repo).
2. Replace long README contribution blocks with a concise pointer to that file.
3. Remove conflicting contribution instructions from other entry points.

## Step 4: Add/Validate Header Badges

For each primary README:
- include npm version badge (if package is published/applicable)
- include CI status badge
- include license badge
- ensure each badge target link resolves and is relevant

## Step 5: Add Spec-Driven Framework Support Matrix

1. Add a section/table listing framework name, support level, and caveats.
2. Include required entries: Spec-Kit, OpenSpec, Kiro.
3. Include at least one additional common framework.
4. Use support taxonomy:
   - Native
   - Supported with modifications
   - Experimental
   - Not supported

## Step 6: Final Validation

Complete all checks before implementation handoff:

- No claim contradicts current repository behavior.
- No broken links in README badges or key navigation links.
- Contribution instructions are discoverable from README in one click.
- Framework table has >=4 entries with caveats where applicable.
- Terminology is consistent across README and contribution docs.

## Expected Outcome

Documentation is accurate, discoverable, and easier to trust for both evaluators and contributors, with explicit transparency about framework support and current project status.

## Feature Handoff Notes

- Root and implementation READMEs were normalized to current repository state.
- Canonical contribution files are now the one-step destination from both primary READMEs.
- Badge coverage is standardized to npm, CI, and license with applicability caveats documented in root README.
- Framework support matrix now includes required entries (Spec-Kit, OpenSpec, Kiro) plus additional frameworks and caveats.

## Verification Summary

- Claim/evidence mapping completed in `claim-inventory.md` and `evidence-map.md`.
- Link and badge validation checks recorded as PASS in `validation-checklist.md`.
- Final audit state: verified, with zero unresolved major/critical findings.
