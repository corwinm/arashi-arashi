## 1. Pre-Implementation RED Coverage

- [ ] 1.1 Add focused tests for upstream diagnosis covering absent branch configuration, local-dot remotes, malformed merge refs, missing expected tracking refs, missing/incompatible fetch mappings, and exact/wildcard mappings that already cover the configured upstream; run them against unchanged production code and record the expected RED.
- [ ] 1.2 Add doctor finding-classification tests that require `REPOSITORY_UPSTREAM_TRACKING_UNAVAILABLE` with exact structured details and ordered remediation while preserving generic `REPOSITORY_NO_UPSTREAM` and missing-remote-ref precedence; run them against unchanged production code and record the expected RED.
- [ ] 1.3 Add a real-Git CLI fixture for a bare clone with a linked `main` worktree whose branch remote/merge and expected tracking ref exist without a covering fetch refspec; require human and JSON diagnosis plus preservation of Git configuration, branches, and worktrees, and record RED caused by the current generic finding without treating the existing status refresh as ref-non-mutating.

## 2. CLI Implementation

- [ ] 2.1 Implement the conservative read-only upstream-configuration inspector and positive exact/wildcard fetch-refspec coverage matching without changing the public status branch shape; use dependency sentinels to prove the new inspector performs no fetch or Git mutation.
- [ ] 2.2 Integrate doctor-only diagnosis for non-detached repositories with null strict upstreams, retaining missing-remote-ref precedence and conservative generic fallback.
- [ ] 2.3 Emit the stable topology-aware finding, structured evidence, explanatory human message, and ordered branch-specific fetch/fetch/set-upstream remediation without adding mutation to the topology-specific inspection path.
- [ ] 2.4 Run the focused helper, finding, and real-Git CLI tests to GREEN, then perform a sabotage run that restores the old classification and proves the new regression test fails before restoring GREEN.

## 3. Companion and Contract Audit

- [ ] 3.1 Audit CLI maintained docs, generated command contracts, JSON fixtures, public docs, and packaged skill guidance for enumerated doctor finding codes or remediation promises; document why untouched surfaces remain valid.
- [ ] 3.2 If an audited maintained/generated surface requires an update, add or strengthen its focused drift test and record RED before changing authored content or regenerating artifacts.
- [ ] 3.3 Apply only evidence-required companion updates, regenerate deterministic artifacts through their canonical producers, and run source plus packaged checks where applicable.

## 4. Validation and Delivery

- [ ] 4.1 Run the Arashi CLI's focused tests, complete test suite, lint, typecheck/build, format check, generated-artifact freshness checks, and `git diff --check` after the final source edit.
- [ ] 4.2 Perform a read-only staged-diff review against the approved OpenSpec contract and surrounding status/doctor call sites; reconcile concrete supported-path findings before committing.
- [ ] 4.3 Commit and push the verified CLI change, open the child PR with a non-closing reference to `corwinm/arashi-arashi#293`, and verify exact-head CI plus all eligible review surfaces.
- [ ] 4.4 Update the meta proposal PR with the child PR link, complete all verified task checkboxes, rerun strict OpenSpec validation and the final stable-hash semantic review, and verify the child PR is merged before OpenSpec archive closeout.
