## Why

The published SKILLS package currently fails security audits, which blocks reliable distribution and raises risk for users consuming the artifacts. We need to close known audit findings now so release and install workflows remain trusted and unblocked.

## What Changes

- Update SKILLS package and related build/release inputs to remove or remediate security audit findings.
- Tighten dependency and artifact hygiene for skill assets so generated outputs do not include insecure or unnecessary content.
- Add or improve validation checks in CI/release flow to fail fast when security audit regressions are introduced.
- Update contributor guidance for maintaining audit-compliant SKILLS artifacts.

## Capabilities

### New Capabilities
- `skills-security-audit-compliance`: Define requirements for producing and validating SKILLS artifacts that pass security audits before release.

### Modified Capabilities
- None.

## Impact

- Affected repositories and paths related to SKILLS definitions, packaging scripts, and release/CI validation.
- Potential updates to dependency declarations, lockfiles, and generated skill artifact contents.
- Developer workflow impact: contributors must satisfy security audit checks before merging and releasing SKILLS updates.
