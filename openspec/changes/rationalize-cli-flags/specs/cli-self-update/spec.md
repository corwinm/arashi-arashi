## MODIFIED Requirements

### Requirement: Safe check and dry-run modes
The update command SHALL support distinct non-mutating modes for update inspection and SHALL reject a single invocation that requests both `--check` and `--dry-run` before release lookup, installer planning, package-manager execution, binary replacement, or other mutation.

#### Scenario: Check mode reports no update
- **WHEN** a user runs `arashi update --check` and no newer version is available
- **THEN** the command reports that Arashi is current and does not modify the installation

#### Scenario: Check mode reports available update
- **WHEN** a user runs `arashi update --check` and a newer version is available
- **THEN** the command reports the available version and does not modify the installation

#### Scenario: Dry run reports planned update
- **WHEN** a user runs `arashi update --dry-run` and a newer version is available for a supported install method
- **THEN** the command prints the package-manager command and binary refresh steps it would run without executing them

#### Scenario: Human check and dry run conflict
- **WHEN** a user runs `arashi update --check --dry-run` without JSON mode
- **THEN** Arashi exits non-zero with an actionable usage error explaining that exactly one inspection mode may be selected
- **AND** it performs no network lookup, installer planning, package-manager execution, binary replacement, or other mutation

#### Scenario: JSON check and dry run conflict
- **WHEN** a user runs `arashi update --json --check --dry-run`
- **THEN** stdout contains exactly one structured error envelope identifying both conflicting options
- **AND** no human output is mixed into stdout
- **AND** it performs no network lookup, installer planning, package-manager execution, binary replacement, or other mutation

#### Scenario: npm entrypoint enforces the conflict
- **WHEN** an npm-managed invocation reaches the wrapper-intercepted update path with `--check --dry-run` or `--check -n`
- **THEN** it rejects the conflict before delegated update work
- **AND** its human or JSON result matches the compiled command contract

#### Scenario: Direct binary enforces the conflict
- **WHEN** a direct-binary invocation reaches the native Commander update path with `--check --dry-run`
- **THEN** it rejects the same conflict before update work
- **AND** does not silently choose check precedence
