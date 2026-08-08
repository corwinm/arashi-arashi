## ADDED Requirements

### Requirement: Cross-repository hook-input semantics are validated
The meta-repository SHALL semantically compare the canonical CLI-derived command contract, lifecycle-hook runtime/docs contract, canonical website guidance, generated agent exports, and packaged Arashi skill guidance for lifecycle-hook input. Validation SHALL require `--no-hook-input` ownership by exactly create and remove, invocation-only policy, distinction from `--no-hooks` and create `--interactive`, exact `tty`/`disabled`/`unavailable` mode values, JSON precedence, immediate EOF outside TTY mode, native Bash/PowerShell/cmd coverage, and the no-secrets warning.

#### Scenario: Companion surfaces agree
- **WHEN** CLI metadata, docs, generated exports, and packaged skill guidance publish the same hook-input contract
- **THEN** semantic validation succeeds

#### Scenario: Controlled hook-input mismatch proves enforcement
- **WHEN** an out-of-repository fixture changes one mode value, option owner, precedence rule, EOF rule, native-shell family, or security warning
- **THEN** the checker reports a stable source-specific diagnostic and exits unsuccessfully
- **AND** the real coordinated worktrees remain unchanged

#### Scenario: Generated artifact is stale
- **WHEN** runtime option registration changes without regenerating the command contract or companion exports
- **THEN** freshness or semantic validation fails before merge
