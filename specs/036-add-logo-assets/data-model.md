# Data Model: Unified Logo Presence

**Feature**: 036-add-logo-assets  
**Date**: 2026-02-11

## Overview

This feature defines planning-level entities for maintaining one cohesive Arashi logo family across text and web surfaces, including fallback rules for constrained contexts and acceptance review evidence.

## Entities

### 1. Logo Family

**Description**: The approved set of brand treatments that represent Arashi across all required surfaces.

**Fields**:

- `logo_family_id` (string, required)
- `name` (string, required)
- `status` (enum, required): `draft` | `approved` | `active` | `superseded`
- `approved_by` (string, required)
- `approved_at` (date-time, required)
- `notes` (string, optional)

**Validation Rules**:

- Only one logo family can be `active` at a time.
- A logo family must include at least one full textual variant and one compact variant before it can be `approved`.
- Every required surface must map to a variant from the active logo family.

### 2. Logo Variant

**Description**: A specific rendering of the logo family optimized for one or more display contexts.

**Fields**:

- `variant_id` (string, required)
- `logo_family_id` (string, required)
- `variant_type` (enum, required): `full-text` | `compact-mark` | `favicon-mark`
- `character_set` (enum, required): `ascii` | `vector`
- `max_width_columns` (integer, optional)
- `max_height_lines` (integer, optional)
- `intended_surfaces` (array of enum, required): `readme` | `cli-help` | `docs-header` | `docs-favicon`
- `status` (enum, required): `draft` | `approved` | `active` | `retired`

**Validation Rules**:

- `full-text` variants for README/CLI must use `character_set=ascii`.
- `favicon-mark` variants must remain recognizable at small icon sizes.
- Width and height limits must be defined for text-rendered variants used in terminal or markdown contexts.

### 3. Display Surface

**Description**: A required product touchpoint where brand treatment appears.

**Fields**:

- `surface_id` (string, required)
- `surface_type` (enum, required): `readme` | `cli-help` | `docs-header` | `docs-favicon`
- `repository` (string, required)
- `path` (string, required)
- `supports_tty_width_detection` (boolean, required)
- `supports_full_text_variant` (boolean, required)
- `is_required` (boolean, required)

**Validation Rules**:

- Exactly four `is_required=true` surfaces must be present for this feature scope.
- Each required surface must have one approved placement rule.
- Required surface paths must be unique.

### 4. Brand Placement Rule

**Description**: The selection logic that maps a display surface to a specific logo variant.

**Fields**:

- `rule_id` (string, required)
- `surface_id` (string, required)
- `primary_variant_id` (string, required)
- `fallback_variant_id` (string, optional)
- `min_terminal_columns_for_primary` (integer, optional)
- `min_terminal_columns_for_fallback` (integer, optional)
- `non_interactive_behavior` (enum, optional): `primary` | `fallback` | `plain-text`
- `status` (enum, required): `draft` | `approved` | `active` | `deprecated`

**Validation Rules**:

- CLI help surface must define fallback behavior for constrained width or non-interactive output.
- README and docs surfaces must define deterministic primary variant selection.
- Active placement rules must point to active or approved variants in the active logo family.

### 5. Brand Verification Record

**Description**: Evidence that all required surfaces satisfy visibility, readability, and cohesion criteria.

**Fields**:

- `verification_id` (string, required)
- `run_at` (date-time, required)
- `validated_by` (string, required)
- `surface_checks` (array, required)
- `readability_pass_rate` (percentage, required)
- `cohesion_review_score` (percentage, required)
- `outcome` (enum, required): `pass` | `fail`
- `notes` (string, optional)

**Validation Rules**:

- `surface_checks` must include all required surfaces.
- `outcome=pass` requires 100% required-surface presence checks and readability pass.
- `outcome=pass` requires cohesion review score meeting or exceeding the approved threshold.

## Relationships

- One `Logo Family` contains many `Logo Variant` records.
- One `Display Surface` has one active `Brand Placement Rule`.
- One `Brand Placement Rule` references one primary and optional fallback `Logo Variant`.
- One `Brand Verification Record` summarizes checks across many `Display Surface` instances.

## State Transitions

### Logo Family

`draft -> approved -> active -> superseded`

### Logo Variant

`draft -> approved -> active -> retired`

### Brand Placement Rule

`draft -> approved -> active -> deprecated`

### Brand Verification Record

`generated -> pass` or `generated -> fail`
