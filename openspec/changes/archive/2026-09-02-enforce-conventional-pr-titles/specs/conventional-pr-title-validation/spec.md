# conventional-pr-title-validation Specification

## ADDED Requirements

### Requirement: Release repositories validate pull request titles

Each Arashi repository whose `main` branch is analyzed by semantic-release SHALL report a dedicated pull-request CI outcome that validates the live pull request title as a release-compatible Conventional Commit subject.

The accepted title SHALL have a recognized release type, an optional non-empty parenthesized scope, an optional breaking-change marker `!`, the delimiter `: `, and a non-empty single-line subject. Recognized types SHALL match the repository's maintained semantic-release commit-analyzer rules.

#### Scenario: Release-compatible title

- **WHEN** a pull request title uses a recognized type and valid Conventional Commit syntax
- **THEN** the title-validation outcome passes

#### Scenario: Plain descriptive title

- **WHEN** a pull request title omits the recognized type and `: ` delimiter
- **THEN** the title-validation outcome fails with guidance showing the required syntax and recognized types

#### Scenario: Malformed or unknown title

- **WHEN** a title has an empty/invalid scope, an unknown type, a missing subject, or more than one line
- **THEN** the title-validation outcome fails without executing title content as code

### Requirement: Title changes retrigger focused validation

Title validation SHALL run when a pull request is opened, edited, reopened, or synchronized. A title-only edit SHALL NOT require or trigger the repository's full application build/test matrix solely to refresh title status.

#### Scenario: Title is corrected

- **WHEN** an invalid pull request title is edited to valid syntax
- **THEN** a new focused title-validation run evaluates the updated title

#### Scenario: Main receives a commit

- **WHEN** a commit is pushed to `main`
- **THEN** pull-request title validation is not evaluated because no pull-request title exists

### Requirement: Title validation is deterministic and locally testable

Each release repository SHALL maintain local automated tests that cover accepted and rejected syntax, verify recognized-type parity with semantic-release configuration, and verify workflow event, permission, trusted-base provenance, and input wiring. The `pull_request_target` workflow SHALL execute the validator from the exact pull request base revision with persisted checkout credentials disabled, SHALL NOT check out or execute pull-request code, and SHALL pass the title as data rather than interpolate it into executable shell source.

#### Scenario: Release type configuration changes

- **WHEN** the semantic-release recognized type set changes without an equivalent validator update
- **THEN** local contract validation fails

#### Scenario: Workflow safety, provenance, or event wiring drifts

- **WHEN** title-edit delivery, least-privilege permissions, trusted-base checkout, safe data transport, or validator invocation is removed or changed incompatibly
- **THEN** local contract validation fails
