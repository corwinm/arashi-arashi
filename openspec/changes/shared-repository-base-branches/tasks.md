## 1. Configuration and migration contract

- [ ] 1.1 Add RED normalization tests for root `baseBranch`, `meta.baseBranch`, and `repos.<name>.baseBranch`, including invalid values, unknown keys, and exact diagnostic paths.
- [ ] 1.2 Add RED migration tests proving the legacy create key remains create-only, canonical/legacy conflicts fail, matching values are accepted with one diagnostic, and canonical root policy is shared by create/clone.
- [ ] 1.3 Implement the canonical configuration types/normalization and legacy compatibility, then regenerate the JSON schema and verify focused tests GREEN.
- [ ] 1.4 Add RED CLI tests for create/clone `--base` plus repeatable `--repo-base`, malformed/duplicate/unknown/unselected selectors, `@meta`, and standalone rejection.
- [ ] 1.5 Implement one parser/pure policy resolver with stable source vocabulary and exact precedence, then register options and regenerate completions/help metadata.

## 2. Per-repository create planning

- [ ] 2.1 Add RED unit tests for mixed meta/child requests and policy sources, global/repository CLI precedence, omitted-policy compatibility, filtering, and complete selector errors.
- [ ] 2.2 Adapt strict create-base planning to accept ordered per-repository requests while retaining local-first/origin-second resolution and captured immutable OIDs.
- [ ] 2.3 Add RED real-Git integration tests proving different repositories create target branches from different bases, moving refs remain pinned, and existing targets remain unchanged.
- [ ] 2.4 Add RED tests proving all per-repository failures aggregate before managed-ignore, conflicts, hooks, branches, worktrees, setup, or launch; implement preflight ordering.
- [ ] 2.5 Update human dry-run and JSON create results for normalized per-repository branches/sources while preserving omitted-policy result shapes.
- [ ] 2.6 Rerun existing create-base, omitted-base characterization, rollback, filtering, dry-run, JSON, standalone, and lifecycle-hook suites GREEN.

## 3. Clone base planning and execution

- [ ] 3.1 Add RED tests for normal main-workspace clone using workspace and child base branches, explicit CLI precedence, remote-default omission, exact URL/protocol preservation, and aggregated preflight failure.
- [ ] 3.2 Implement selected-set clone remote/base preflight before managed-ignore/filesystem mutation and branch-aware normal clone execution.
- [ ] 3.3 Add RED real-Git tests for coordinated clone reusing an existing target, creating a missing coordinated target from its effective base, and leaving the child checked out on the coordinated target rather than the base.
- [ ] 3.4 Implement coordinated clone target planning for available canonical sources and remote-only materialization, preserving captured ancestry and current coordinated branch alignment.
- [ ] 3.5 Add RED rollback tests proving partial clone/materialization failure removes only invocation-created destinations/target refs and preserves source/base/reused refs.
- [ ] 3.6 Add clone human/JSON result tests for effective branch/source and exact structured selector/resolution failures; implement optional policy result data without changing omitted-policy shapes.

## 4. Generated CLI and cross-repository contracts

- [ ] 4.1 Add CLI contract RED tests for canonical config paths, legacy migration, both options, selector grammar, precedence, create/clone/standalone scope, source vocabulary, clone alignment, and pre-mutation failures.
- [ ] 4.2 Update typed semantic policy and deterministic generation, increment serialized schema versions where required, and regenerate schema, completions, and command contracts.
- [ ] 4.3 Add meta-checker RED fixtures for stale create-only config, missing meta/child overrides, wrong precedence, missing clone semantics, and coordinated-target misstatements.
- [ ] 4.4 Implement normalized cross-repository comparison across CLI schema/contracts, docs exports, and packaged skill records.

## 5. Canonical documentation and exports

- [ ] 5.1 Strengthen docs semantic checks first and record RED for root/meta/child config, CLI syntax, precedence, selected-set validation, clone behavior, migration, JSON, reuse, and standalone boundaries.
- [ ] 5.2 Update canonical configuration, create, clone, workflow, and migration guidance with concise shared-default and mixed-repository examples.
- [ ] 5.3 Regenerate agent-readable Markdown exports and run focused plus full docs validation.

## 6. Packaged skill guidance

- [ ] 6.1 Add skill-package RED checks for canonical config, global/repository flags, precedence, fail-before-mutation, clone coordinated-target alignment, legacy migration, existing-target preservation, and standalone scope.
- [ ] 6.2 Update the smallest owning Arashi skill references and semantic contract records, then verify authored and extracted-package aggregates.

## 7. Final coordinated delivery

- [ ] 7.1 Run post-final-edit format, lint, typecheck, build, focused integration, full CLI, docs, skills, schema/completion/contract, and meta cross-repository gates.
- [ ] 7.2 Perform exact staged-diff self-review against issue #307 and the approved OpenSpec contract before every repository commit.
- [ ] 7.3 Commit and open cross-linked CLI, docs, and skills child PRs with exact validation evidence; omit unaffected child repositories.
- [ ] 7.4 Re-run meta validation against published child heads, commit completed OpenSpec/checker state, and open the tracking meta PR without an issue-closing keyword until archive.
- [ ] 7.5 Verify every related PR's exact-head CI, mergeability, and eligible review threads before requesting merge approval.
