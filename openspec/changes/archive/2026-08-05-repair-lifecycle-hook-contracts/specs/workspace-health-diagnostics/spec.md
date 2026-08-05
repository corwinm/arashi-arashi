## MODIFIED Requirements

### Requirement: Doctor validates hook configuration and hook files
The system SHALL use the same platform-native lifecycle discovery, case handling, ambiguity detection, interpreter preflight, executable requirements, and safety validation as runtime hook execution. Doctor SHALL report expected `.sh` candidates on POSIX and `.ps1`, `.cmd`, or `.bat` candidates on Windows without mutating files or configuration.

#### Scenario: Configured hook file is missing
- **WHEN** the user runs `arashi doctor` and a configured lifecycle location has no script supported by the current platform
- **THEN** the command reports a hook finding with a stable missing-hook code where that hook is required
- **AND** the finding identifies the hook name, scope, repository or workspace target, and platform-native expected paths

#### Scenario: Configured POSIX hook file is not executable
- **WHEN** the user runs `arashi doctor` on POSIX and a discovered hook file exists but cannot be executed by Arashi's hook runner
- **THEN** the command reports a hook finding with a stable hook-permission code
- **AND** the finding suggests a command such as `chmod +x <hook-path>` when that recommendation is safe

#### Scenario: Native Windows hook is healthy
- **WHEN** doctor discovers exactly one supported Windows lifecycle script and its required interpreter is available
- **THEN** doctor evaluates the same candidate as runtime discovery
- **AND** does not require a POSIX executable bit or report a missing `.sh` file

#### Scenario: Windows hook location is ambiguous
- **WHEN** doctor finds multiple case-insensitive `.ps1`, `.cmd`, or `.bat` candidates for one logical lifecycle location
- **THEN** it reports the same blocking ambiguity and candidate paths as runtime preflight

#### Scenario: Hook interpreter is unavailable
- **WHEN** doctor discovers a native hook but its required system interpreter is unavailable
- **THEN** it reports a blocking `interpreter_unavailable` finding before any hook is executed

#### Scenario: Hook validation detects unsafe or unsupported configuration
- **WHEN** the user runs `arashi doctor` and shared hook validation rejects a hook as unsafe or unsupported
- **THEN** the command reports a blocking hook finding with the validation reason
- **AND** the command exits non-zero
