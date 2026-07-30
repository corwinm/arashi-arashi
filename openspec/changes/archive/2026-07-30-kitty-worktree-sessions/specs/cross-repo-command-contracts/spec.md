## ADDED Requirements

### Requirement: Kitty launch guidance remains synchronized across repositories
The system SHALL keep canonical CLI behavior, maintained documentation, generated agent-readable guidance, and packaged Arashi skill guidance aligned for automatic managed Kitty sessions, and the meta-repository semantic checker SHALL enforce the key runtime and ownership boundaries.

#### Scenario: Canonical Kitty guidance agrees
- **WHEN** cross-repository contract validation runs
- **THEN** canonical docs and packaged skill guidance agree that Kitty 0.43+ and permitted remote control are prerequisites
- **AND** they describe exact worktree reuse, automatic precedence, live-only sessions, fail-closed managed errors, and no remove-time Kitty mutation consistently

#### Scenario: Kitty remains auto-detected only
- **WHEN** contract validation compares CLI options/configuration with companion guidance
- **THEN** no canonical surface advertises an explicit `--kitty` flag or persistent `kitty` launch mode for this slice

#### Scenario: Deliberate Kitty semantic drift fails validation
- **WHEN** an out-of-repository fixture changes or removes one required Kitty version, remote-control, reuse, precedence, persistence, or remove-ownership semantic
- **THEN** the checker exits unsuccessfully with a diagnostic naming the owning source and mismatched Kitty contract
- **AND** the real coordinated worktrees remain unchanged
