# Data Model: Documentation Site Repository Initialization

**Feature**: 034-init-docs-site  
**Date**: 2026-02-10

## Overview

This feature defines planning-level entities for initializing and operating a separate documentation site repository with automated publication and README discoverability.

## Entities

### 1. Documentation Site Repository

**Description**: The dedicated source-of-truth repository for documentation content, site configuration, and publication workflows.

**Fields**:
- `repository_name` (string, required)
- `default_branch` (string, required)
- `visibility` (enum, required): `public` | `internal` | `private`
- `deployment_provider` (enum, required): `netlify`
- `production_site_url` (string, required)
- `initialization_state` (enum, required): `not-initialized` | `initialized` | `published`
- `owner_group` (string, required)
- `contribution_policy_ref` (string, required)

**Validation Rules**:
- Repository MUST be separate from product implementation repositories.
- Repository MUST contain baseline documentation structure before first publication.
- Ownership and maintenance expectations MUST be explicitly documented.
- `production_site_url` MUST be the canonical URL used by README documentation links.

### 2. Documentation Section

**Description**: A top-level documentation grouping shown in site navigation.

**Fields**:
- `section_id` (string, required)
- `title` (string, required)
- `order` (integer, required)
- `visibility` (enum, required): `visible` | `hidden`
- `required` (boolean, required)

**Validation Rules**:
- Required sections MUST include onboarding/getting started, reference, and contributing guidance.
- Navigation order MUST be deterministic and consistent across builds.
- Hidden sections MUST not be linked from primary navigation.

### 3. Documentation Page

**Description**: A publishable user-facing page belonging to a section.

**Fields**:
- `page_id` (string, required)
- `section_id` (string, required)
- `title` (string, required)
- `path` (string, required)
- `summary` (string, optional)
- `status` (enum, required): `draft` | `review` | `approved` | `published`
- `last_updated_at` (date-time, required)

**Validation Rules**:
- Every page MUST map to exactly one section.
- Page paths MUST be unique within the site.
- Only `approved` pages can move to `published` during release.

### 4. Publication Run

**Description**: A tracked attempt to validate and publish documentation changes.

**Fields**:
- `run_id` (string, required)
- `source_revision` (string, required)
- `trigger_type` (enum, required): `merge` | `manual` | `scheduled`
- `deployment_environment` (enum, required): `preview` | `production`
- `validation_result` (enum, required): `pass` | `fail`
- `publish_result` (enum, required): `succeeded` | `failed` | `not-attempted`
- `started_at` (date-time, required)
- `completed_at` (date-time, optional)
- `failure_summary` (string, optional)

**Validation Rules**:
- Publication MUST be blocked when `validation_result=fail`.
- Failed runs MUST store actionable failure details.
- A successful run MUST identify the active live revision.

### 5. Live Site Version

**Description**: The currently served documentation revision and rollback target metadata.

**Fields**:
- `active_revision` (string, required)
- `previous_revision` (string, optional)
- `activated_at` (date-time, required)
- `availability_state` (enum, required): `healthy` | `degraded`

**Validation Rules**:
- On publication failure, `active_revision` MUST remain unchanged.
- `previous_revision` MUST be retained for rollback/audit visibility.

### 6. README Documentation Link

**Description**: The canonical documentation URL referenced from the main project README.

**Fields**:
- `source_path` (string, required)
- `display_label` (string, required)
- `target_url` (string, required)
- `placement_area` (enum, required): `header` | `quick-links` | `getting-started`
- `health_status` (enum, required): `reachable` | `unreachable`
- `last_verified_at` (date-time, required)

**Validation Rules**:
- Link MUST be visible in the README and point to the canonical live site URL.
- Link health MUST be validated in CI before merge.
- Unreachable link state MUST block publication of README link changes.

## Relationships

- One `Documentation Site Repository` contains many `Documentation Section` records.
- One `Documentation Section` contains many `Documentation Page` records.
- One `Documentation Site Repository` has many `Publication Run` records.
- One `Publication Run` updates at most one `Live Site Version` activation.
- One `README Documentation Link` references one active `Live Site Version` URL endpoint.

## State Transitions

### Documentation Site Repository

`not-initialized -> initialized -> published`

### Documentation Page

`draft -> review -> approved -> published`

or

`review -> draft` (if changes requested)

### Publication Run

`pass + succeeded` (new live revision)

or

`fail + not-attempted`

or

`pass + failed` (live revision unchanged, failure logged)

### README Documentation Link

`reachable <-> unreachable` (based on health verification outcome)
