# Data Model: Audit README Documentation

**Feature**: 031-audit-readmes  
**Date**: 2026-02-09

## Overview

This feature is documentation-focused. Data is represented as markdown content entities and validation records rather than application runtime models.

## Entities

### 1. Documentation Asset

**Description**: A top-level markdown file that provides project-facing guidance.

**Fields**:
- `path` (string, required): Repository-relative file path (for example, `README.md`, `repos/arashi/README.md`, `repos/arashi/CONTRIBUTING.md`)
- `asset_type` (enum, required): `readme` | `contributing`
- `owner_repo` (enum, required): `specs-repo` | `implementation-repo` | `skills-repo`
- `last_reviewed_at` (date-time, required)
- `audit_status` (enum, required): `not-reviewed` | `in-review` | `verified` | `needs-update`

**Validation Rules**:
- `path` must exist at review time.
- Each repository in scope must have at least one `readme` asset.
- If `asset_type=contributing`, filename must follow canonical convention `CONTRIBUTING.md`.

### 2. Documentation Claim

**Description**: An atomic statement in documentation that can be verified against implementation evidence.

**Fields**:
- `claim_id` (string, required): Unique identifier (e.g., `CLM-001`)
- `asset_path` (string, required): Source `Documentation Asset`
- `section` (string, required): Section heading where claim appears
- `claim_text` (string, required)
- `claim_type` (enum, required): `capability` | `installation` | `workflow` | `status` | `link-reference`
- `verification_state` (enum, required): `verified` | `outdated` | `missing-context` | `cannot-verify`
- `evidence_ref` (string, required): Path or URL to supporting source

**Validation Rules**:
- Every in-scope claim must map to one evidence reference.
- `verification_state=verified` requires evidence accessible and current.
- `cannot-verify` cannot remain at feature completion.

### 3. Badge Definition

**Description**: A status badge shown in README header.

**Fields**:
- `badge_type` (enum, required): `npm` | `ci` | `license` | `optional`
- `display_label` (string, required)
- `image_url` (string, required)
- `target_url` (string, required)
- `applicable` (boolean, required)
- `validation_state` (enum, required): `valid` | `broken-target` | `missing`

**Validation Rules**:
- Required badge types (`npm`, `ci`, `license`) must exist when `applicable=true`.
- `target_url` must resolve to a valid destination.
- Badge ordering places required badges before optional badges.

### 4. Framework Support Entry

**Description**: A single row in the spec-driven framework support section.

**Fields**:
- `framework_name` (string, required)
- `support_level` (enum, required): `Native` | `Supported with modifications` | `Experimental` | `Not supported`
- `scope_summary` (string, required)
- `caveats` (string, optional)
- `evidence_or_note` (string, required)

**Validation Rules**:
- Required frameworks `Spec-Kit`, `OpenSpec`, and `Kiro` must be present.
- At least one additional widely used framework must be included.
- Entries with non-native support levels must include caveats.

### 5. Audit Finding

**Description**: A recorded discrepancy discovered during documentation audit.

**Fields**:
- `finding_id` (string, required)
- `claim_id` (string, required)
- `severity` (enum, required): `critical` | `major` | `minor`
- `issue_summary` (string, required)
- `recommended_action` (enum, required): `update` | `remove` | `add-context`
- `resolution_status` (enum, required): `open` | `resolved`

**Validation Rules**:
- All `critical` and `major` findings must be `resolved` before completion.
- Each resolved finding must map to a concrete content change.

## Relationships

- One `Documentation Asset` contains many `Documentation Claim` records.
- One `Documentation Claim` can produce zero or more `Audit Finding` records.
- One `Documentation Asset` can include many `Badge Definition` entries.
- One README `Documentation Asset` includes many `Framework Support Entry` records.

## State Transitions

### Documentation Asset

`not-reviewed -> in-review -> verified`

or

`not-reviewed -> in-review -> needs-update -> verified`

### Documentation Claim

`cannot-verify | outdated | missing-context -> verified`

### Audit Finding

`open -> resolved`
