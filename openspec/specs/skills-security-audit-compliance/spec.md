# skills-security-audit-compliance Specification

## Purpose
TBD - created by archiving change update-skills-to-pass-security-audits. Update Purpose after archive.
## Requirements
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

### Requirement: Installation Guidance Uses Verifiable Distribution Paths
SKILLS documentation and generated skill references SHALL provide installation workflows that avoid direct execution of remote script content from network responses. Installation guidance MUST use verifiable distribution paths, including trusted package manager commands or release artifact download flows that include integrity verification steps before execution.

#### Scenario: Documentation install path is scanner-safe
- **WHEN** a contributor or user follows the documented installation commands for the Arashi skill
- **THEN** the commands do not include pipe-to-shell patterns and include a verifiable source or integrity-check step for downloaded artifacts

### Requirement: Documentation Enforces Least-Privilege Installation
Skill documentation SHALL present least-privilege installation commands as the default path. Documentation MUST NOT require privileged operations such as `sudo mv` into system directories for standard usage, and any privileged workflow MUST be explicitly isolated as optional with clear risk/trust guidance.

#### Scenario: Default install avoids privileged file moves
- **WHEN** a user follows the default installation instructions from skill references
- **THEN** the workflow installs and runs the tool without requiring administrative file moves into global system paths

### Requirement: Shell Examples Avoid Unsanitized Dynamic Composition
Skill command examples SHALL avoid unsanitized command substitution or argument interpolation sourced from untrusted repository metadata. Examples MUST use quoted variables, explicit selection steps, or equivalent safe composition patterns that prevent unintended command execution from malicious names.

#### Scenario: Repository selection example is injection-resistant
- **WHEN** documentation shows a command workflow that selects a repository or worktree from local listings
- **THEN** the example avoids unsafe inline substitution patterns and preserves shell-safe argument handling for selected values

### Requirement: Executable Artifact Guidance Includes Integrity Expectations
Any documentation step that downloads binaries, hook scripts, or other executable artifacts SHALL include integrity or provenance verification guidance before local execution. Guidance MUST define the expected trusted source and verification action so contributors can detect tampering.

#### Scenario: Downloaded executable is verified before run
- **WHEN** a documented workflow requires downloading an executable artifact
- **THEN** the workflow includes an integrity/provenance verification step and executes only after successful verification
