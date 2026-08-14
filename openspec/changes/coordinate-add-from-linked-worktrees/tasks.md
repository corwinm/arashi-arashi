## 1. CLI RED coverage

- [ ] 1.1 Add real-Git RED integration coverage for direct-main versus non-bare linked-parent add, proving canonical default-branch clone placement, active coordinated child worktree placement, active-only config persistence, and slash-containing branch names
- [ ] 1.2 Add real-Git RED coverage for invocation from a nested independent child and a linked parent at a custom/external worktree path, proving Git-topology root resolution without `.arashi/worktrees` substring assumptions
- [ ] 1.3 Add RED branch-resolution coverage for absent coordinated branches, matching `origin/<branch>` refs, branches checked out elsewhere, and coordinated/default branch collisions
- [ ] 1.4 Add RED preflight/non-mutation coverage for detached parent HEAD, existing canonical destination, existing active destination, duplicate configuration, invalid active configuration, concurrent Git/path conflicts, and tracked scope whose canonical destination lacks effective ignore coverage; add paired local/tracked/none scope cases proving both-destination policy
- [ ] 1.5 Add RED failure-injection coverage for clone, worktree, config-write, cleanup/restoration, and final-state observation failures, including a linked-path or worktree-metadata removal/observation failure that MUST retain the canonical common-directory owner and coordinated branch; assert reverse-order ownership rollback, pre-existing-state preservation, exact active configuration restoration, and final managed-ignore retention/restoration
- [ ] 1.6 Add RED process-level JSON and human-output coverage for exact materialization/path/branch fields, null rules in direct mode, one-document stdout isolation, structured complete/incomplete rollback including linked path and worktree-metadata state, observation failures, and role-labelled human summaries
- [ ] 1.7 Record focused RED evidence from production-loading tests and verify existing configured-bare, standalone-guard, duplicate clone fallback, `--name`, `--create-setup`, `--force`, and setup-detection regressions remain valid baselines

## 2. CLI implementation

- [ ] 2.1 Refactor the add executor to receive explicit configured workspace roots and resolve active configuration/execution plus canonical non-bare parent roles through injectable Git-topology helpers
- [ ] 2.2 Implement fail-closed branch/destination preflight and canonical clone plus active linked-worktree materialization, including remote tracking, create-from-default behavior, slash branches, and coordinated/default collision handling
- [ ] 2.3 Implement the invocation-ownership ledger and dependency-gated reverse-order config, worktree, branch, clone, and managed-ignore rollback; retain the canonical common-directory owner whenever linked path/metadata survives or cannot be observed, and emit structured final-state plus cleanup-failure records
- [ ] 2.4 Persist the existing repository config entry only in the active configuration root after materialization, retain direct-main and configured-bare paths, and compose setup detection plus duplicate clone fallback without a second persistence path
- [ ] 2.5 Implement compatible result types plus human and JSON rendering for config-relative `path`, materialization mode, absolute canonical/worktree paths, default/coordinated branches, null rules, and rollback details
- [ ] 2.6 Run all focused add/topology/rollback/output tests after the final source edit and confirm the recorded RED cases are GREEN

## 3. CLI contracts and validation

- [ ] 3.1 Add a failing generated-command/semantic-contract assertion for the new add materialization/result policy before changing contract metadata or generated artifacts
- [ ] 3.2 Update typed CLI contract metadata and regenerate deterministic command artifacts; prove a second generation is byte-stable
- [ ] 3.3 Run CLI format check, lint, typecheck, build, completion check, schema check/no-schema-drift proof, contract check, focused tests, and the complete test suite from the stable tree
- [ ] 3.4 Commit the CLI implementation, push normally, open the child PR with `Tracks corwinm/arashi-arashi#276`, and verify exact-head CI plus eligible review feedback

## 4. Canonical documentation and agent guidance

- [ ] 4.1 Strengthen the owning CLI/docs/skills semantic checkers first and record RED for stale add guidance that omits canonical versus active child placement and active-config ownership
- [ ] 4.2 Update CLI-maintained add/configuration guidance and any generated command documentation owned by the CLI repository
- [ ] 4.3 Update the website add/workflow guidance and regenerate agent-readable exports through the canonical docs pipeline without duplicating the workflow across unrelated pages
- [ ] 4.4 Update the smallest owning packaged Arashi skill reference with deterministic linked-worktree add guidance while keeping `skills/arashi/SKILL.md` minimal
- [ ] 4.5 Run each companion repository's canonical format/lint/type/build/package/export checks and the real meta cross-repository contract checker, including one controlled out-of-repository mismatch that must fail
- [ ] 4.6 Commit, push, and open separate docs and skills child PRs as required, cross-link the complete PR set with non-closing issue references, and verify exact-head CI plus eligible feedback

## 5. Coordinated acceptance and closeout preparation

- [ ] 5.1 Reproduce direct-main, linked-parent, nested-child, remote-branch, detached/conflict, JSON, and rollback acceptance with the built CLI in disposable real-Git workspaces after all child changes are stable
- [ ] 5.2 Run a final independent compliance review against current OpenSpec requirements, source, tests, generated contracts, docs, packaged skill artifacts, and complete exact artifact/source hashes; reconcile every blocker without discretionary scope expansion
- [ ] 5.3 Verify every child PR is open, non-draft, mergeable, exact-head green, fully cross-linked, and uses only non-closing issue references before requesting child-first merge approval
- [ ] 5.4 After approved child PRs merge, verify their reviewed trees on child `main`, rerun the meta contract checker against actual child default branches, complete all pre-archive evidence, and prepare the archive/sync plus sole `Closes #276` meta-PR update for execution after every checklist item is complete
