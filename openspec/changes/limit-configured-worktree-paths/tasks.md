## 1. Specification and CLI RED coverage

- [x] 1.1 Add config normalization and generated-schema tests for optional integer `worktreeNaming.maxPathLength`, exact bounds, omission preservation, unknown keys, wrong types, fractions, and out-of-range values; record RED.
- [x] 1.2 Add pure planner tests for unchanged under-budget paths, stable shortening, Unicode-safe UTF-16 budgeting, distinct generated namespace hashes, preserved deliberate aliases, and custom roots; record RED.
- [x] 1.3 Add coordinated-plan tests for parent-selected and child-only selection, longest-child sizing, unchanged child-relative paths, deterministic order, and one authoritative parent; record RED.
- [x] 1.4 Add process-level human/JSON/dry-run tests for exact fitted paths and `WORKTREE_PATH_LENGTH_EXCEEDED` details plus pre-mutation canaries; record RED.
- [x] 1.5 Extend native platform coverage, including real Windows configured creation beneath a long root/branch within the configured budget; record RED on the missing feature.

## 2. CLI implementation and verification

- [x] 2.1 Implement config typing, strict normalization, omission-preserving serialization, and generated schema support.
- [x] 2.2 Implement UTF-16-safe readable-prefix plus first-eight-hex SHA-256 shortening from the portable unshortened generated namespace.
- [x] 2.3 Apply fitting once at the authoritative complete configured plan boundary, including child-only selection and direct parent calculation.
- [x] 2.4 Add structured overflow error handling and route exact fitted paths through existing human, dry-run, JSON, hooks, collision, materialization, execution, and rollback consumers.
- [x] 2.5 Prove the regression tests bite against the old planner, then run schema, format, lint, typecheck, build, focused, full, and native-local gates.

## 3. Documentation and packaged guidance

- [x] 3.1 Add focused website/export checker RED coverage for exact nested config, optional behavior, budget scope, hash shortening, coordinated sizing, standalone/existing-worktree boundaries, and repository-content limitation.
- [x] 3.2 Update canonical website guidance, regenerate exports, prove deliberate drift rejection, and run full docs validation.
- [x] 3.3 Add focused packaged-skill checker RED coverage with `--skill-root`, then update the smallest workspace/create reference without expanding routing-only `SKILL.md`.
- [x] 3.4 Prove source and extracted-package GREEN plus controlled semantic drift rejection, archive determinism/membership, and full skills security/validation.
- [x] 3.5 Extend the coordinated meta checker for CLI schema/docs/export/skill parity and prove out-of-repository mismatch fixtures fail.

## 4. Review and delivery

- [x] 4.1 Perform independent CLI spec/code/security review, reconcile verified findings, and run final child gates.
- [x] 4.2 Commit, push, and open cross-linked non-closing CLI, docs, and skills PRs referencing `corwinm/arashi-arashi#333`; verify exact base/head/files and live CI/review threads.
- [x] 4.3 Update the meta proposal with implementation evidence and child PRs, run strict OpenSpec/coordinated validation, commit/push, and open the non-closing meta PR.
- [ ] 4.4 Merge child PRs only after exact-head approval and explicit merge authorization, then sync/archive the change on the exact meta head.
- [ ] 4.5 Merge the final meta PR with the sole `Closes #333` reference only after exact-head gates, verify issue closure, and clean branches/worktrees.
