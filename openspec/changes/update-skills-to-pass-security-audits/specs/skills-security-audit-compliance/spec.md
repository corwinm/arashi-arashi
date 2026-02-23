## ADDED Requirements

### Requirement: Security Gate Blocks Non-Compliant Releases
The SKILLS build and release workflow SHALL execute a canonical security audit gate before a release artifact is published. The workflow MUST fail and block publication when the gate reports unresolved findings above the configured policy threshold.

#### Scenario: Release is blocked on failing audit gate
- **WHEN** a release workflow run evaluates SKILLS artifacts and the audit gate reports policy-violating findings
- **THEN** the workflow fails before publishing artifacts and records the failed gate result in job output

### Requirement: Dependency Findings Are Remediated or Explicitly Excepted
The SKILLS project SHALL remediate dependency vulnerabilities identified by the canonical audit process before release. If a finding cannot be remediated immediately, the project MUST record a time-bounded exception with owner, rationale, and expiration, and the gate MUST enforce that expired exceptions fail validation.

#### Scenario: Expired exception fails validation
- **WHEN** the security gate evaluates findings that are covered only by an exception past its expiration date
- **THEN** the gate fails with a message identifying the expired exception and required remediation owner

### Requirement: Packaged Skill Artifacts Meet Content Hygiene Rules
Generated and packaged SKILLS artifacts SHALL be validated for content hygiene as part of the same security gate. The validation MUST confirm that packaged outputs exclude disallowed files or insecure payload content defined by repository policy.

#### Scenario: Artifact includes disallowed content
- **WHEN** artifact validation detects a file or payload pattern that is disallowed by SKILLS packaging policy
- **THEN** the security gate fails and reports the disallowed content location for remediation

### Requirement: Contributors Have a Documented Security Compliance Workflow
The repository SHALL provide contributor-facing guidance that defines required local and CI checks for SKILLS security compliance, including remediation expectations and exception policy. The documented workflow MUST match the canonical gate used by CI and release pipelines.

#### Scenario: Contributor follows documented checks before PR
- **WHEN** a contributor runs the documented compliance steps before opening a pull request
- **THEN** the same class of audit failures enforced in CI is detected locally with actionable remediation guidance
