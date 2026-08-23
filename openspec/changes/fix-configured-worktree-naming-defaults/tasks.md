## 1. CLI Regression Coverage (RED)

- [x] 1.1 Add focused destination-resolver tests proving configured bare parents use `<canonical repository naming component>/<branch>` and configured non-bare parents use `<branch>` beneath the effective base.
- [x] 1.2 Add canonical-name tests proving resolved `worktreeName` wins, the bare-source fallback omits a conventional terminal `.git`, and linked-checkout/clone-directory basenames never override that authority.
- [x] 1.3 Add configured path tests for simple and slash-containing branches, default and custom `worktreesDir` bases, POSIX/Windows separators, and nested coordinated children beneath the exact same authoritative parent.
- [x] 1.4 Add human, dry-run, and single-document JSON create tests proving success uses `data.repositories[].worktreePath`, dry-run uses `data.dryRunOutcome.plannedWorktrees[]`, collision failures use `error.details.conflict`, all modes report the same resolved parent and child destinations without recalculating paths per renderer, and parent/selected-child records preserve deterministic plan order.
- [x] 1.5 Add preflight collision tests proving path or Git-registration conflicts block before managed-ignore writes, workspace/repository hooks, branch creation, `git worktree add`, directory creation, or other filesystem mutation, with no silent alternate destination; cover multiple simultaneous collisions and assert that the first record in deterministic plan order is reported.
- [x] 1.6 Add real-Git compatibility coverage that registers existing worktrees under the inverted legacy layouts and proves list, status, switch, and remove remain metadata-driven, operable, and non-migrating.
- [ ] 1.7 Exercise the corrected bare/non-bare parent and child paths through built-CLI native macOS, Linux, and Windows acceptance before merge.
- [x] 1.8 Add real-Git and resolver coverage proving the bare fallback omits a terminal `.git`, stays outside the bare Git directory, and cannot alias an adjacent repository/branch component pair.

## 2. CLI Implementation (GREEN)

- [x] 2.1 Implement the smallest shared configured destination resolver that accepts the effective base, configured topology, branch, and existing canonical `worktreeName`/configured-name component without filesystem guessing.
- [x] 2.2 Calculate and freeze one authoritative parent destination, then derive every coordinated child destination from it plus the unchanged configured child path.
- [x] 2.3 Route configured preflight, collision checks, execution, hooks/context where applicable, rollback ownership, human output, dry-run, and JSON projection through the frozen destination plan.
- [x] 2.4 Preserve standalone `.worktrees/<branch>`, slash hierarchy, custom-base-only semantics, and metadata-driven operations for existing worktrees; make focused tests pass.

## 3. CLI Validation and Child-First Delivery

- [x] 3.1 Run focused path/planner/create/output/lifecycle tests, native acceptance, and the full Arashi CLI test suite.
- [x] 3.2 Run CLI format check, lint, typecheck, generated-schema/contract freshness checks, build, and `git diff --check` after the final source edit.
- [x] 3.3 Correct stale configured path examples in `arashi-docs`, document the bare namespace, regenerate and drift-check its agent-readable exports, and run the docs validation aggregate; review CLI/skill wording and leave unaffected standalone guidance unchanged.
- [ ] 3.4 Independently review the exact child diff, address blocking findings, commit and open the child implementation PR with issue #323 linkage, verify exact-head CI on macOS/Linux/Windows, and merge the child before meta closeout.

## 4. Meta Validation and Closeout

- [ ] 4.1 Record the final merged child SHA in the meta handoff/evidence, re-run the coordinated repository revision report, and verify the meta change points to that exact child revision.
- [ ] 4.2 Run `openspec validate fix-configured-worktree-naming-defaults --strict`, meta format check, typecheck, full tests, cross-repository contract checks, and `git diff --check`.
- [ ] 4.3 Archive and sync the completed OpenSpec change only after the child merge, validate the canonical specs strictly, inspect the final meta diff, and deliver the meta PR last without rewriting issue history or migrating worktrees.
