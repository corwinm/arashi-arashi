## Why

Arashi currently sends every planned change through the complete OpenSpec artifact and archive workflow. That protects consequential product contracts, but duplicates issue, pull-request, test, and CI records for routine maintenance and straightforward changes.

## What Changes

- Select one of three tracks during issue triage: direct implementation, lightweight OpenSpec, or full OpenSpec.
- Reserve OpenSpec for changes to durable product contracts; cross-repository scope alone is not sufficient.
- Add a project-local lightweight OpenSpec schema containing only a proposal and capability deltas.
- Keep full OpenSpec for unresolved design choices, destructive or migratory behavior, security-sensitive work, and difficult-to-reverse changes.
- Keep implementation tasks and transient evidence in issues, pull requests, tests, and CI unless they establish a durable contract.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `specification-workflow`: Define proportional specification tracks and their artifact and delivery requirements.
- `meta-repo-readme-openspec-guidance`: Present OpenSpec as a selective contract workflow rather than a mandatory path for every change.

## Impact

- Root contributor and agent guidance
- `docs/implementation-workflow.md`
- Project-local OpenSpec schema configuration
- Focused workflow contract tests
- Existing active and archived OpenSpec changes remain valid
