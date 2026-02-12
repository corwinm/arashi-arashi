# Data Model: Install Script and Onboarding Instructions

**Feature**: 038-add-install-script  
**Date**: 2026-02-11

## Overview

This feature defines planning-level entities for managing two official installation methods, publishing consistent onboarding guidance across landing/docs/README surfaces, and validating first-run installation outcomes.

## Entities

### 1. Installation Method

**Description**: A user-selectable official installation path (curl script or npm) with command format, prerequisites, and expected verification behavior.

**Fields**:

- `method_id` (string, required)
- `method_type` (enum, required): `curl-script` | `npm-global`
- `display_name` (string, required)
- `command_template` (string, required)
- `prerequisites` (array of string, required)
- `verification_command` (string, required)
- `troubleshooting_reference` (string, required)
- `status` (enum, required): `draft` | `approved` | `active` | `deprecated`

**Validation Rules**:

- Exactly one active `curl-script` method and one active `npm-global` method must exist for this feature scope.
- `command_template` must be copy-ready and executable as a single command.
- `verification_command` must confirm an installed state observable by end users.

### 2. Installation Guidance Surface

**Description**: A public-facing content surface where installation instructions are displayed.

**Fields**:

- `surface_id` (string, required)
- `surface_type` (enum, required): `readme` | `docs-getting-started` | `docs-landing-hero`
- `repository` (string, required)
- `path` (string, required)
- `method_ids` (array of string, required)
- `includes_prerequisites` (boolean, required)
- `includes_verification` (boolean, required)
- `includes_troubleshooting` (boolean, required)
- `includes_next_step` (boolean, required)
- `status` (enum, required): `draft` | `approved` | `active` | `superseded`

**Validation Rules**:

- All three required surfaces must include both installation methods.
- `docs-landing-hero` must present both method commands at first view.
- At least one canonical detailed surface (`docs-getting-started`) must include prerequisites, verification, troubleshooting, and next-step guidance.

### 3. Install Script Release Binding

**Description**: Mapping between the curl installer behavior and release artifacts used to complete installation.

**Fields**:

- `binding_id` (string, required)
- `default_version_policy` (enum, required): `latest-stable` | `pinned-required`
- `supports_version_pin` (boolean, required)
- `platform_asset_map` (array, required)
- `integrity_policy` (enum, required): `checksum-required` | `checksum-optional`
- `fallback_method_id` (string, required)
- `status` (enum, required): `draft` | `approved` | `active` | `retired`

**Validation Rules**:

- Every supported platform in scope must map to a release asset.
- `integrity_policy` must not be weaker than `checksum-required` when method type is `curl-script`.
- `fallback_method_id` must reference the active npm method.

### 4. First-Run Outcome

**Description**: Observable result of a first-time installation attempt, used to track success criteria and support quality checks.

**Fields**:

- `outcome_id` (string, required)
- `method_id` (string, required)
- `surface_id` (string, required)
- `started_at` (date-time, required)
- `completed_at` (date-time, optional)
- `duration_seconds` (integer, optional)
- `verification_passed` (boolean, required)
- `failure_category` (enum, optional): `missing-prerequisite` | `permission` | `network` | `unsupported-platform` | `other`
- `resolved_with_fallback` (boolean, required)
- `next_step_completed` (boolean, required)

**Validation Rules**:

- Successful outcomes require `verification_passed=true` and populated `completed_at`.
- `duration_seconds` is required for successful outcomes used in KPI calculation.
- If `resolved_with_fallback=true`, outcome must reference a different method than initial attempted method.

## Relationships

- One `Installation Method` can appear on many `Installation Guidance Surface` records.
- One `Install Script Release Binding` references one primary curl method and one fallback npm method.
- One `First-Run Outcome` references one `Installation Method` and one `Installation Guidance Surface`.
- Each required guidance surface must reference both active installation methods.

## State Transitions

### Installation Method

`draft -> approved -> active -> deprecated`

### Installation Guidance Surface

`draft -> approved -> active -> superseded`

### Install Script Release Binding

`draft -> approved -> active -> retired`

### First-Run Outcome

`started -> verified` or `started -> failed` or `started -> fallback-completed`
