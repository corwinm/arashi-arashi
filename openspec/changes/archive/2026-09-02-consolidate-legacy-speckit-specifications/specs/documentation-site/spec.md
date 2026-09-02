## ADDED Requirements

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
Documentation changes merged to the default branch SHALL be validated and built before automated publication. A failed validation or publication attempt SHALL report actionable failure details and SHALL leave the last successfully published site available.

#### Scenario: Valid documentation is merged
- **WHEN** an approved default-branch change passes documentation validation and build
- **THEN** automated publication updates the public site without a manual release step

#### Scenario: Publication fails
- **WHEN** validation, build, or publication fails
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
