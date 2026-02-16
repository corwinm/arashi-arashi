# Data Model: Safari Hero Image Visibility

**Feature**: 040-fix-safari-hero-image  
**Date**: 2026-02-15

## Overview

This feature defines planning-level entities for homepage hero media rendering behavior, browser-specific layout outcomes, and acceptance verification records.

## Entities

### 1. Hero Section

**Description**: The splash hero content block shown on the docs homepage.

**Fields**:

- `hero_id` (string, required)
- `page_path` (string, required)
- `title` (string, required)
- `tagline` (string, required)
- `primary_action_link` (string, required)
- `status` (enum, required): `draft` | `active` | `deprecated`

**Validation Rules**:

- `page_path` must resolve to the docs homepage.
- Hero title, tagline, and primary action must remain present after media updates.

### 2. Hero Media Asset

**Description**: The visual media associated with the hero section.

**Fields**:

- `asset_id` (string, required)
- `hero_id` (string, required)
- `asset_type` (enum, required): `inline-svg` | `image-file`
- `has_intrinsic_dimensions` (boolean, required)
- `has_defined_aspect_ratio` (boolean, required)
- `fallback_mode` (enum, required): `show-placeholder` | `hide-media-keep-content`
- `status` (enum, required): `draft` | `approved` | `active` | `retired`

**Validation Rules**:

- Active hero media must have deterministic sizing (`has_intrinsic_dimensions=true` or `has_defined_aspect_ratio=true`).
- Hero media updates must not remove hero textual content readability.

### 3. Browser Render Profile

**Description**: A browser and viewport test target used to validate hero rendering outcomes.

**Fields**:

- `profile_id` (string, required)
- `browser_family` (enum, required): `safari` | `chrome` | `firefox`
- `platform` (enum, required): `desktop` | `mobile`
- `viewport_label` (string, required)
- `is_required_for_release` (boolean, required)

**Validation Rules**:

- At least one required Safari desktop profile and one required Safari mobile profile must exist.
- At least one required non-Safari profile must exist to detect regressions.

### 4. Hero Render Verification

**Description**: Verification evidence for a single browser render profile.

**Fields**:

- `verification_id` (string, required)
- `hero_id` (string, required)
- `profile_id` (string, required)
- `hero_visible` (boolean, required)
- `hero_height_px` (number, required)
- `text_readability_pass` (boolean, required)
- `checked_at` (date-time, required)
- `checked_by` (string, required)
- `notes` (string, optional)

**Validation Rules**:

- `hero_visible` must be `true` for all required profiles before release.
- `hero_height_px` must be greater than 0 for all required profiles.
- `text_readability_pass` must be `true` for all required profiles.

## Relationships

- One `Hero Section` has one active `Hero Media Asset`.
- One `Hero Section` has many `Hero Render Verification` records.
- One `Browser Render Profile` can be referenced by many `Hero Render Verification` records.

## State Transitions

### Hero Media Asset

`draft -> approved -> active -> retired`

### Hero Render Verification

`recorded -> accepted` or `recorded -> rejected`
