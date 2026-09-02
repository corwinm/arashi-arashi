## MODIFIED Requirements

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

## ADDED Requirements

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
