## Why

Security scanners are flagging the `arashi` skill documentation for unsafe installation and command patterns, which undermines user trust and blocks clean security reports for release. We need to remediate these findings now so the published skill guidance is auditable, least-privilege, and aligned with secure supply-chain practices.

## What Changes

- Remove or replace high-risk install instructions that execute remote scripts directly (for example `curl | bash`) with verifiable installation guidance.
- Replace privileged install steps (`sudo mv` into system paths) with safer user-scoped alternatives and explicit trust boundaries.
- Update command examples that execute dynamic, unsanitized shell substitutions to safer patterns that reduce injection risk from untrusted repository names.
- Add integrity and provenance expectations for downloaded binaries and executable hooks in skill guidance.
- Update `arashi-skills` skill version metadata after the security remediations are complete.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `skills-security-audit-compliance`: Extend requirements so skill documentation and packaged guidance avoid unverifiable remote execution, unnecessary privilege escalation, and unsafe dynamic command composition.

## Impact

- Affected repo: `repos/arashi-skills` (skill manifests and reference documentation for installation and command usage).
- Potential updates to documentation examples, release/packaging validation inputs, and skill metadata versioning.
- Contributors will follow stricter documentation hygiene rules for install commands, binary verification, and shell safety.
