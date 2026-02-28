## ADDED Requirements

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
