# Data Model: Update Docs Domain Across Projects

**Feature**: 035-update-docs-domain  
**Date**: 2026-02-10

## Overview

This feature defines planning-level entities for replacing deprecated documentation-domain references with a canonical domain across multiple project surfaces, while preserving URL semantics and maintaining auditable exception handling.

## Entities

### 1. Canonical Documentation Domain

**Description**: The single approved base domain for user-facing project documentation links.

**Fields**:

- `domain_id` (string, required)
- `base_url` (string, required)
- `status` (enum, required): `proposed` | `approved` | `active`
- `effective_date` (date, required)
- `approved_by` (string, required)

**Validation Rules**:

- `base_url` MUST use HTTPS.
- Only one record can be `active` at a time.
- All in-scope documentation references MUST resolve under the active `base_url` unless explicitly excepted.

### 2. Project Surface

**Description**: A user-facing artifact that can contain documentation references.

**Fields**:

- `surface_id` (string, required)
- `repository` (string, required)
- `path` (string, required)
- `surface_type` (enum, required): `readme` | `site-config` | `contributor-doc` | `validation-script` | `workflow`
- `in_scope` (boolean, required)
- `owner` (string, required)

**Validation Rules**:

- Every `in_scope=true` surface MUST be represented in migration evidence.
- Each surface MUST have one accountable owner.
- Surface path MUST be unique within the migration scope.

### 3. Documentation Reference

**Description**: A concrete URL occurrence within a project surface.

**Fields**:

- `reference_id` (string, required)
- `surface_id` (string, required)
- `current_url` (string, required)
- `normalized_url` (string, required)
- `classification` (enum, required): `target-domain` | `non-target` | `candidate-exception`
- `migration_status` (enum, required): `detected` | `updated` | `validated` | `excepted`
- `path_query_fragment_preserved` (boolean, required)

**Validation Rules**:

- `classification=target-domain` references MUST end in `updated` or `excepted`.
- Domain-only replacements MUST keep path/query/fragment intact when `migration_status=updated`.
- `classification=non-target` references MUST remain unchanged.

### 4. Migration Exception

**Description**: A justified, approved case where a target-domain reference is not replaced.

**Fields**:

- `exception_id` (string, required)
- `reference_id` (string, required)
- `reason` (string, required)
- `owner` (string, required)
- `approved_at` (date-time, required)
- `status` (enum, required): `proposed` | `approved` | `rejected`

**Validation Rules**:

- Every exception MUST include a clear reason and accountable owner.
- Only `approved` exceptions can satisfy closure for unreplaced target references.
- Rejected exceptions MUST return the related reference to `detected` status.

### 5. Migration Evidence Record

**Description**: Release-facing proof that migration scope was completed and verified.

**Fields**:

- `evidence_id` (string, required)
- `generated_at` (date-time, required)
- `generated_by` (string, required)
- `total_target_references` (integer, required)
- `updated_references` (integer, required)
- `approved_exceptions` (integer, required)
- `validation_outcome` (enum, required): `pass` | `fail`
- `approver` (string, optional)

**Validation Rules**:

- `updated_references + approved_exceptions` MUST equal `total_target_references` for a passing release gate.
- `validation_outcome=pass` requires zero critical broken-link findings.
- Evidence MUST be available for release approval review.

## Relationships

- One `Canonical Documentation Domain` applies to many `Project Surface` records.
- One `Project Surface` contains many `Documentation Reference` records.
- One `Documentation Reference` can have zero or one `Migration Exception`.
- One `Migration Evidence Record` summarizes many `Documentation Reference` updates and `Migration Exception` decisions.

## State Transitions

### Canonical Documentation Domain

`proposed -> approved -> active`

### Documentation Reference

`detected -> updated -> validated`

or

`detected -> excepted` (with approved exception)

### Migration Exception

`proposed -> approved`

or

`proposed -> rejected`
