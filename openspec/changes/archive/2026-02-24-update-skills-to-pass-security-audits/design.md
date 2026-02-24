## Context

The SKILLS distribution currently fails external security audits, which blocks trusted adoption and creates release friction. The change spans skill content generation, packaging inputs, and CI/release validation, so the design must ensure audit compliance is repeatable rather than a one-time manual fix.

Constraints:
- Existing release flow and project conventions should remain intact where possible.
- Security checks must run deterministically in CI to prevent regressions.
- Documentation must clearly describe compliance expectations for contributors.

## Goals / Non-Goals

**Goals:**
- Establish a deterministic audit-compliance pipeline for SKILLS artifacts before release.
- Remove or remediate current audit findings in dependencies and packaged outputs.
- Add guardrails that fail CI/release when new findings are introduced.
- Align implementation, docs, and contributor workflow around the same security baseline.

**Non-Goals:**
- Redesigning unrelated SKILLS features or content taxonomy.
- Introducing a new package/release platform.
- Providing long-term vulnerability triage automation beyond release-time enforcement.

## Decisions

1. Define a single "security gate" step for SKILLS artifacts in CI and release validation.
   - Rationale: One canonical gate avoids drift between local checks and release checks.
   - Alternatives considered:
     - Multiple ad hoc checks across scripts (rejected: inconsistent pass/fail criteria).
     - Manual review-only process (rejected: non-repeatable and easy to bypass).

2. Treat both dependency audit results and packaged artifact contents as first-class validation targets.
   - Rationale: Passing dependency audits alone is insufficient if generated artifacts still include unsafe or unnecessary content.
   - Alternatives considered:
     - Dependency-only auditing (rejected: misses artifact-level risks).
     - Artifact-only scanning (rejected: misses vulnerable transitive dependencies).

3. Scope remediations to minimal-risk updates first (pinning, patch-level upgrades, pruning unused packages), with explicit exceptions documented.
   - Rationale: Reduces breakage risk while addressing the highest-priority audit failures quickly.
   - Alternatives considered:
     - Broad major-version upgrades immediately (rejected: higher compatibility risk).
     - Ignoring findings via blanket suppressions (rejected: reduces trust and hides risk).

4. Publish contributor guidance describing required checks and remediation workflow.
   - Rationale: Security compliance must be part of normal development, not tribal knowledge.
   - Alternatives considered:
     - CI-only enforcement without docs (rejected: causes avoidable contributor friction).

## Risks / Trade-offs

- [Risk] Audit tool output may change over time and create flaky failures -> Mitigation: pin tool/runtime versions where possible and normalize check inputs.
- [Risk] Dependency updates can introduce functional regressions -> Mitigation: keep upgrades incremental and require existing test/build checks before merge.
- [Risk] Strict gating can temporarily slow contributor velocity -> Mitigation: provide clear remediation playbook and fast local validation commands.
- [Risk] Some findings may not be immediately fixable upstream -> Mitigation: allow time-bounded, documented exceptions with owner and expiration.

## Migration Plan

1. Baseline current audit findings for SKILLS dependencies and produced artifacts.
2. Apply minimal-risk remediations and verify existing lint/test/build checks still pass.
3. Add the security gate to CI/release workflows in non-blocking mode briefly (optional) to validate signal quality.
4. Switch gate to blocking mode and require pass status for merge/release.
5. Update contributor documentation and release notes to reflect the new policy.

Rollback strategy:
- If blocking mode causes widespread false positives, temporarily revert to non-blocking while preserving audit visibility, then re-enable after rule adjustment.

## Open Questions

- Which exact audit command and threshold should be canonical for SKILLS in this repository?
- Do we need separate policies for development vs release artifact checks?
- Are any current findings acceptable as temporary exceptions, and who owns their remediation deadlines?
