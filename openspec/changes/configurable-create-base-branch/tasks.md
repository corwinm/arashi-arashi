## 1. Configuration and option contract

- [x] 1.1 Add and run passing characterization tests for the exact omitted-base parent-current-branch, child-detected-default, standalone-current-HEAD, conflict, output-shape, and rollback behavior before changing production code.
- [x] 1.2 Add failing configuration tests for generic `defaults.create.baseBranch`, invalid/empty values, schema acceptance, and editor-scoped rejection.
- [x] 1.3 Implement the split generic/editor create-default types and normalization, then regenerate and verify the configuration schema while keeping the characterization gate green.
- [x] 1.4 Add failing Commander/help/completion tests for `create --base <branch>` and its generated option metadata.
- [x] 1.5 Register the CLI option and regenerate shell completions while keeping the characterization gate green.

## 2. Strict base-resolution planning

- [ ] 2.1 Add focused real-Git RED tests for local-first resolution, `origin/<branch>` fallback, one-prefix normalization, invalid names, and complete missing-base diagnostics.
- [ ] 2.2 Add RED tests proving filters and interactive selection validate only the effective selected set, mixed new/reused targets all remain in that preflight set, and every selected repository failure is aggregated before conflict handling.
- [ ] 2.3 Implement a read-only strict base resolver that captures commit OIDs in a canonical-path-keyed per-repository plan without legacy default-ref fallback.
- [ ] 2.4 Build the configured preflight plan for every effective selected repository after final selection but before managed-ignore reconciliation, conflict handling, hook preflight/execution, branches, worktrees, setup, or launch.

## 3. Coordinated create execution and reuse

- [ ] 3.1 Add RED integration tests proving new parent/child targets are created from captured `resolvedOid` values while `resolvedRef` remains reporting metadata.
- [ ] 3.2 Add RED execution tests for moving refs plus mixed new/reused targets, proving captured OIDs apply only to newly created targets while existing targets receive no reset, rebase, or ancestry assertion.
- [ ] 3.3 Add RED rollback tests proving later branch/worktree/setup/hook failure removes only invocation-owned targets and preserves base refs/objects, reused targets, and pre-existing worktrees.
- [ ] 3.4 Thread the immutable canonical-path-keyed resolution plan through coordinated orchestration and create new target branches from captured OIDs.
- [ ] 3.5 Verify all new execution tests GREEN and rerun the omitted-base characterization matrix to prove detected-default resolution and fallback behavior remain unchanged.

## 4. Standalone create parity

- [ ] 4.1 Add standalone RED tests for explicit local and origin bases, missing-base failure before global hooks/mutation, existing-target reuse, and omitted-option compatibility.
- [ ] 4.2 Implement invocation-only standalone `--base` resolution without loading or persisting workspace defaults.

## 5. Human, dry-run, and JSON results

- [ ] 5.1 Add RED tests for human dry-run requested/resolved base output and zero mutation.
- [ ] 5.2 Add process-level JSON RED tests asserting exact normalized branch values, `cli | config` source and `created | reused` action vocabularies, canonical absolute paths, selected-set repository ordering, exact local-then-origin `attemptedRefs`, one-document success data, reused targets, and affected-only aggregated failures with no stdout contamination.
- [ ] 5.3 Implement the exact optional `base` result shape and `CREATE_BASE_RESOLUTION_FAILED` details from the specification, keeping normal human success concise and omitted-base shapes compatible.

## 6. CLI-generated and cross-repository contracts

- [ ] 6.1 Add CLI contract RED tests for `--base` precedence, generic-only persistence, standalone support, resolution order, reuse semantics, dry-run/JSON fields, and pre-mutation failure.
- [ ] 6.2 Update typed semantic policy, increment the generated command-contract schema version for the serialized create-base policy shape, regenerate deterministic artifacts, and run schema/completion/contract freshness checks.
- [ ] 6.3 Add meta-checker RED fixtures for missing or contradictory create-base semantics and CI reachability.
- [ ] 6.4 Implement normalized create-base comparison across CLI schema/contract, docs exports, and packaged skill records.

## 7. Canonical documentation and exports

- [ ] 7.1 Strengthen docs semantic checks first and record RED for missing config, CLI override, precedence, resolution, selected-set, reuse, dry-run/JSON, standalone, no-`ARASHI_BASE_BRANCH`, and workaround guidance.
- [ ] 7.2 Update the create command and configuration/workflow documentation with concise long-running-feature examples and the pre-created-branch workaround boundary.
- [ ] 7.3 Regenerate agent-readable Markdown routes/exports and run full docs validation.

## 8. Packaged skill guidance

- [ ] 8.1 Add skill-package RED checks for generic configuration, one-off override, fail-before-mutation handling, existing-target reuse, and standalone invocation-only scope.
- [ ] 8.2 Update the smallest owning Arashi skill references and semantic contract records, then verify source and packaged-artifact checks.

## 9. Final coordinated delivery

- [ ] 9.1 Run post-final-edit format, lint, typecheck, build, focused integration, full CLI, docs, skills, schema/completion/contract, and meta cross-repository gates.
- [ ] 9.2 Perform an exact staged-diff self-review against issue #281 and this approved contract before every repository commit.
- [ ] 9.3 Commit and open cross-linked CLI, docs, and skills child PRs with exact validation evidence; update this checklist only from verified milestones.
- [ ] 9.4 Re-run meta validation against the published child heads, commit the completed OpenSpec/checker state, and open the tracking meta PR without an issue-closing keyword until archive.
- [ ] 9.5 Verify every related PR's exact-head CI, mergeability, and eligible review threads before requesting merge approval.
