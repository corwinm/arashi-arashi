# Feature Specification: Update Docs Domain Across Projects

**Feature Branch**: `035-update-docs-domain`  
**Created**: 2026-02-10  
**Status**: Draft  
**Input**: User description: "https://github.com/corwinm/arashi-arashi/issues/86 - Update docs domain across projects. Replace the default netlify domain with https://arashi.haphazard.dev"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardize Project Documentation Links (Priority: P1)

As a project maintainer, I need every in-scope project to use one canonical documentation domain so users consistently land on the correct docs site.

**Why this priority**: This is the core business outcome: eliminating split or outdated documentation destinations across projects.

**Independent Test**: Audit each in-scope project surface for documentation URLs and confirm all deprecated default domain references are replaced by the canonical domain.

**Acceptance Scenarios**:

1. **Given** an in-scope project surface contains a URL with the deprecated default docs domain, **When** the domain update is applied, **Then** that URL uses `https://arashi.haphazard.dev`.
2. **Given** a deprecated-domain URL includes a path, query, or fragment, **When** it is updated, **Then** the same destination path/query/fragment remains intact under the canonical domain.

---

### User Story 2 - Keep Future Links Consistent (Priority: P2)

As a contributor, I need clear expectations for documentation URLs so new or edited project links continue using the canonical docs domain.

**Why this priority**: Preventing regressions keeps the migration durable and avoids reintroducing user confusion.

**Independent Test**: Add or edit representative documentation links in scope and verify review criteria require canonical-domain usage.

**Acceptance Scenarios**:

1. **Given** a contributor adds a new documentation link in an in-scope project surface, **When** the change is reviewed against the feature requirements, **Then** the link uses the canonical docs domain.
2. **Given** a contributor updates an existing docs link, **When** the update is completed, **Then** no deprecated default docs domain reference is introduced.

---

### User Story 3 - Approve Migration with Evidence (Priority: P3)

As a release approver, I need a clear migration record so I can confirm scope coverage and approve the update confidently.

**Why this priority**: Verification evidence reduces release risk and makes scope boundaries explicit.

**Independent Test**: Review the migration evidence and confirm it lists all updated references and any approved exceptions.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** the approver reviews the audit record, **Then** it includes all updated in-scope references.
2. **Given** any deprecated-domain reference cannot be updated, **When** the migration is reviewed, **Then** each exception includes an explicit reason and owner.

### Edge Cases

- A deprecated-domain link appears in multiple formats (plain text URL, markdown link, badge target) within the same project surface.
- A URL contains nested paths or anchors that must remain unchanged after domain replacement.
- A non-target external URL looks similar to the deprecated domain and must not be modified.
- A historical or immutable artifact cannot be edited and must be tracked as an approved exception.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The feature MUST define `https://arashi.haphazard.dev` as the canonical documentation domain for all in-scope projects.
- **FR-002**: The feature MUST define and publish the in-scope project surfaces that are subject to domain replacement.
- **FR-003**: The feature MUST replace every in-scope reference to the deprecated default docs domain with the canonical documentation domain.
- **FR-004**: When replacing domain-only URL components, the feature MUST preserve existing path, query, and fragment content unless an explicit exception is documented.
- **FR-005**: Each in-scope project MUST provide at least one primary documentation entry point that resolves to the canonical domain.
- **FR-006**: The feature MUST leave non-target external links unchanged.
- **FR-007**: The feature MUST produce migration evidence listing all updated references and all approved exceptions.
- **FR-008**: Any approved exception MUST include the impacted surface, reason for exception, and accountable owner.

### Key Entities *(include if feature involves data)*

- **Canonical Documentation Domain**: The official base URL used for project documentation access.
- **Documentation Reference**: Any user-visible URL that points to project documentation.
- **Project Surface**: A user-facing project artifact that can contain documentation references.
- **Migration Exception**: An approved, documented case where a deprecated-domain reference remains unchanged.

### Assumptions

- In-scope projects are all actively maintained Arashi repositories and documentation surfaces managed in this workspace.
- The deprecated domain is the previous default Netlify-hosted documentation domain currently referenced by in-scope materials.
- Some immutable or externally controlled artifacts may not be editable and can be handled through approved exceptions.
- This feature changes documentation domains only; it does not redefine documentation content structure.

### Dependencies

- Access to all in-scope project surfaces is available during the migration window.
- Stakeholders confirm `https://arashi.haphazard.dev` remains the intended long-term canonical documentation domain.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of in-scope deprecated-domain references are either updated to the canonical domain or documented as approved exceptions before release.
- **SC-002**: 100% of primary documentation entry points across in-scope projects open under the canonical domain on first click.
- **SC-003**: 0 critical broken-link findings are discovered during acceptance validation of updated documentation references.
- **SC-004**: A release approver can complete migration verification (including exceptions) in 30 minutes or less using the provided evidence.
