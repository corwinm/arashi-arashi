## ADDED Requirements

### Requirement: Canonical hook guidance publishes the terminal-input contract
Canonical lifecycle-hook guidance SHALL document `ARASHI_HOOK_INPUT=tty|disabled|unavailable`, TTY eligibility, `--no-hook-input`, JSON precedence, immediate EOF for disabled and unavailable modes, timeout while waiting, attribution and sequential prompts, and native Bash `read`, PowerShell `Read-Host`, and cmd `set /p` examples. Source documentation and generated agent exports SHALL remain semantically identical. Guidance SHALL state that the policy is invocation-only in this slice and SHALL warn users not to enter passwords, tokens, or other secrets into hook prompts.

#### Scenario: User determines whether a hook can read input
- **WHEN** a user reads canonical hook, create, remove, standalone, or JSON automation guidance
- **THEN** the documented matrix identifies the effective input mode and stdin behavior
- **AND** JSON is unambiguously authoritative over terminal availability

#### Scenario: Native-shell examples are published safely
- **WHEN** guidance demonstrates Bash, PowerShell, or cmd input
- **THEN** each example checks `ARASHI_HOOK_INPUT` before reading
- **AND** warns against entering secrets or implying that Arashi stores answers

#### Scenario: Generated guidance drifts from source
- **WHEN** a source page and generated export disagree on mode values, option ownership, EOF, or security guidance
- **THEN** documentation validation fails before release
