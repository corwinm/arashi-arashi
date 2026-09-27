# Manual advisory cross-repository integration

## Why

Issue #377 replaces per-child cross-repository merge gates with a manually dispatched assessment of merged source. Comparing each proposed child with sibling defaults creates a merge-order cycle. The approved policy retains semantic detection and immutable evidence, not distributed pre-merge approval.

## What Changes

- Make the meta integration workflow manual-only, read-only and advisory; validate upstream `main` revisions, with the coordinator bound to the dispatched main commit.
- Remove automatic callers in all five children, direct meta integration triggers, obsolete required statuses and invocation-only wiring.
- Preserve automatic meta-local checker tests, typecheck and formatting without child checkouts; preserve ordinary child quality and release/package checks.
- Retain complete revision artifacts, semantic/package aggregates and honest failures; document the post-merge assessment and safe rollout.

## Capabilities

### Modified Capabilities

- `cross-repo-command-contracts`: revise invocation, revision provenance, evidence and CI ownership without weakening semantic validation.

## Impact

Meta workflow, resolver/workflow tests, child-dependent test partitioning, docs and five child caller cleanups; separately authorized live ruleset edits during rollout. No product command changes. Implementation requires independent semantic and architecture approval at the exact design commit.

## Non-goals

No GitHub App, proposed-set input manifests, matching-branch selection, status fan-out, schedules, notification services, automatic merge/release/cleanup, or published-version compatibility expansion. Revision manifests remain output evidence, not distributed approval inputs.
