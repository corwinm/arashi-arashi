# documentation-site Specification

## Purpose

TBD - created by archiving change consolidate-legacy-speckit-specifications. Update Purpose after archive.

## Requirements

### Requirement: Arashi maintains one public documentation source and canonical domain

Arashi SHALL maintain user documentation in the dedicated `arashi-docs` repository, publish it at `https://arashi.haphazard.dev`, and expose a visible working documentation link from the CLI README. Active project surfaces SHALL NOT present the superseded Netlify hostname as canonical.

#### Scenario: User follows documentation from the CLI README

- **WHEN** a user selects the README documentation link
- **THEN** the user reaches the public documentation landing page at the canonical domain

#### Scenario: Canonical domain is validated

- **WHEN** maintained documentation and onboarding surfaces are checked
- **THEN** canonical links use `https://arashi.haphazard.dev`
- **AND** superseded hostnames are rejected outside intentional historical records

### Requirement: Default-branch documentation publication is validated and recoverable

Documentation changes proposed for the default branch SHALL pass deterministic documentation validation before merge. GitHub Actions SHALL be the sole quality-validation authority and SHALL execute the canonical deterministic validation pipeline once without duplicate semantic-registration work or no-op publication statuses. Every Netlify deployment context SHALL inherit one build-only command and SHALL NOT repeat GitHub-owned lint, semantic, internal-link, or accessibility checks. A failed validation, build, or publication attempt SHALL report actionable failure details and SHALL leave the last successfully published site available.

#### Scenario: Pull request validation runs

- **WHEN** a pull request proposes a documentation or pipeline change
- **THEN** GitHub Actions runs the canonical deterministic documentation validation once
- **AND** the result does not claim to gate or verify a Netlify publication that it does not control

#### Scenario: Netlify deployment context runs

- **WHEN** Netlify creates a production, deploy-preview, or branch deployment
- **THEN** the context inherits the shared command and produces the static site with one build
- **AND** it does not rerun GitHub-owned deterministic quality validation

#### Scenario: Valid documentation is merged

- **WHEN** an approved default-branch change passes documentation validation and build
- **THEN** Netlify runs one production build and automatically updates the public site without a manual release step

#### Scenario: Validation or publication fails

- **WHEN** deterministic validation, a Netlify build, or publication fails
- **THEN** maintainers receive a failed status with diagnostic details
- **AND** the previously published site remains available

### Requirement: Product branding uses one adaptable logo family

The CLI README, CLI help, documentation site branding, favicon, and editor marketplace icon SHALL use one recognizable Arashi logo family with full textual and compact treatments selected to remain readable in each surface.

#### Scenario: Full treatment does not fit

- **WHEN** a target surface cannot render the full textual logo without obscuring content or breaking layout
- **THEN** it uses the compact treatment from the same logo family

### Requirement: Landing hero media remains usable across supported browsers

The documentation landing-page hero media SHALL render with stable non-zero dimensions in supported Safari, Chrome, and Firefox desktop/mobile contexts, SHALL preserve the existing content hierarchy, and SHALL leave hero text and actions readable when the image is unavailable.

#### Scenario: Safari renders the landing page

- **WHEN** a supported Safari desktop or mobile browser loads or reloads the landing page
- **THEN** the hero image remains visible with non-zero rendered dimensions

#### Scenario: Hero image fails to load

- **WHEN** the hero image is unavailable or delayed
- **THEN** hero text and actions remain readable, stable, and unobscured

### Requirement: External documentation links have truthful non-blocking health reports

Network-dependent external-link validation SHALL run separately from pull-request merge gates on a schedule and by manual dispatch. The checker SHALL retry every unsuccessful `HEAD` probe, including request errors, with a bounded `GET` request and SHALL use the final outcome to determine availability. The workflow SHALL report a failed conclusion when its checker exits unsuccessfully and SHALL avoid installing documentation dependencies that the checker does not use.

#### Scenario: A server rejects HEAD but serves GET

- **WHEN** an external documentation URL returns an unsuccessful response to `HEAD` and a successful response to the bounded `GET` fallback
- **THEN** the checker accepts the URL as available

#### Scenario: Both request methods fail

- **WHEN** an external documentation URL returns unsuccessful responses to both `HEAD` and the bounded `GET` fallback
- **THEN** the checker reports the final `GET` status as the failure reason

#### Scenario: An external link is unavailable

- **WHEN** the scheduled or manually dispatched checker receives a terminal failure after its required request sequence
- **THEN** the workflow concludes with failure and identifies the link and source document
- **AND** the result does not block an unrelated pull request merge

#### Scenario: External-link health is executed

- **WHEN** scheduled or manual external-link validation starts
- **THEN** it uses the pinned Node.js runtime and invokes the built-in-only checker directly
- **AND** it does not restore a package cache or install the documentation dependency tree
