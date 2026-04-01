## ADDED Requirements

### Requirement: Landing page SHALL surface the canonical Arashi value statement
The docs landing page SHALL present Arashi's primary value using the canonical README tagline and a one-sentence summary that explains the product before readers navigate to deeper documentation.

#### Scenario: First-time visitor opens the docs site
- **WHEN** a visitor loads the landing page
- **THEN** the hero region includes the canonical tagline and a concise explanation of what Arashi helps them do

### Requirement: Docs site metadata SHALL align with landing and README messaging
The docs site SHALL expose page title and description metadata for the landing page that matches the canonical product message used in the landing page and README, adapted only as needed for metadata length.

#### Scenario: User shares the docs URL
- **WHEN** the docs home page is rendered for social preview or browser metadata
- **THEN** the title and description communicate the same product identity and purpose as the landing page and README summary

### Requirement: Landing page SHALL provide guided entry points into workflow documentation
The docs landing page SHALL include discoverable links to workflow guidance for getting started, hooks or configuration guidance, integrations, and contributor or agent workflow documentation.

#### Scenario: Visitor scans landing-page actions
- **WHEN** a visitor uses the landing page to choose a next step
- **THEN** they can navigate directly to onboarding and workflow guidance without relying on command-page discovery alone
