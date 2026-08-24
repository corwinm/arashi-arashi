## 1. CLI Configuration and Schema Regression Coverage (RED)

- [x] 1.1 Add focused config-loader tests that fail until optional root `worktreeNaming` accepts only `style: default | branch | repo-branch` and `branchSlashes: preserve | flatten`, normalizes omitted nested fields to compatibility behavior without persisting them, and rejects `null`, arrays, unknown members, wrong types, and unsupported enum values.
- [x] 1.2 Add generated-schema freshness assertions that fail until `worktreeNaming` and both closed enums are emitted from the typed configuration model, while existing configs with the object omitted remain valid.
- [x] 1.3 Add configured-create process tests that fail until each invalid naming shape/value returns the established human and one-document JSON invalid-configuration result before planning, managed-ignore writes, hooks, branches, directories, worktrees, Git registrations, or config migration.

## 2. Destination Policy and Lifecycle Regression Coverage (RED)

- [x] 2.1 Add focused resolver tests that fail until omitted policy and explicit `default` plus `preserve` match the corrected #323 bare `<repository>/<branch>` and non-bare `<branch>` defaults for simple and slash branches.
- [x] 2.2 Add a complete style × slash-policy × bare/non-bare table test that fails until `branch`, `repo-branch`, `preserve`, and `flatten` produce the normative component mappings while every Git operation receives the original slash-containing branch name.
- [x] 2.3 Add canonical repository-identity and custom-root tests that fail until resolved `worktreeName` remains authoritative, the documented bare `.git` fallback normalization remains intact, `worktreesDir` changes only the base, and lexical plus canonical/symlink-resolved destinations remain within the effective configured root.
- [x] 2.4 Add coordinated parent/child and hook-context tests that fail until one immutable parent-first plan supplies every child and hook destination at the unchanged configured child path, including child-only selection, and no child, hook preflight, renderer, or executor independently reapplies naming policy.
- [x] 2.5 Add real-Git preflight tests that fail until slash-flattened versus literal-hyphen aliases, wrong-branch registrations, existing files/directories, and simultaneous parent/child collisions report the deterministic first `WORKTREE_DESTINATION_COLLISION` before hooks, ignore writes, branch creation, directories, or registrations, without alternate names.
- [x] 2.6 Add human, human dry-run, JSON dry-run, JSON success, JSON collision, and execution parity tests that fail until all renderers consume the same policy-specific plan while preserving established JSON fields, order, null/omission rules, exact `branchName`, stdout isolation, and invalid-config-versus-collision distinction.
- [x] 2.7 Add metadata-driven compatibility tests proving list, status, switch, remove, and JSON reporting retain exact registered paths for existing worktrees created under prior or different naming policies without renaming or migration; record this as characterization if it already passes without production changes.
- [x] 2.8 Add standalone tests proving implicit `.worktrees/<branch>` placement, natural slash hierarchy, linked-worktree root authority, and configless behavior remain unchanged without consulting configured naming policy.
- [x] 2.9 Extend native macOS/Linux/Windows acceptance so pre-implementation runs fail for the missing configured policy contract across bare/non-bare defaults, all styles, both slash policies, exact Git branch identity, coordinated children, custom roots, collision preflight, output parity, standalone isolation, and existing-worktree compatibility; do not substitute injected platform flags for native Windows evidence.
- [x] 2.10 Add configured-bare init/create tests that fail until omitted/`default` uses the persisted sibling base with `<repository>/<branch>`, explicit `branch` and `repo-branch` use that same persisted base with their selected naming, and an explicit init base changes only the base.

## 3. CLI Implementation (GREEN)

- [x] 3.1 Add typed `WorktreeNamingConfig` fields, strict normalization/validation, omission-preserving persistence, and generated JSON Schema support without adding a config migration or interactive `aw configure` descriptors.
- [x] 3.2 Implement one pure policy mapper that splits Git branch names on literal `/`, applies preserve/flatten to the filesystem representation, composes default/branch/repo-branch components from canonical repository authority, and leaves the Git branch value untouched.
- [x] 3.3 Apply the normalized policy only at the existing authoritative configured destination-plan boundary, retain parent-first deterministic order, pass the exact parent path to children, and enforce containment before any mutation.
- [x] 3.4 Reuse the frozen policy-specific plan for collision preflight, hooks/context, materialization, human output, dry-run, JSON, execution, and rollback while preserving exact live registered-worktree reuse and structured first-conflict behavior.
- [x] 3.5 Run every focused RED suite to GREEN, then run `pnpm run schema:check`, formatter, lint, typecheck/build, and the complete CLI test suite with no new warnings or unrelated changes.

## 4. Documentation and Packaged Guidance (RED → GREEN)

- [x] 4.1 Before authored guidance changes, add CLI-maintained-docs, website-docs, packaged-skill, generated-export, and meta coordinated regression checks that fail until both closed fields, compatibility defaults, exact style/slash examples, configured-only scope, unchanged Git branches, deterministic collisions, existing-worktree behavior, and standalone isolation agree across concrete artifacts.
- [x] 4.2 Prove the coordinated checker RED with deliberate out-of-repository mismatches in enum values, defaults, and representative destination examples, while leaving every real worktree unchanged.
- [x] 4.3 Update maintained CLI README/config/create guidance and examples, then run its focused content checks alongside schema freshness and the complete CLI validation boundary.
- [x] 4.4 Update authored `repos/arashi-docs` configuration/create guidance, regenerate public Markdown and agent-readable exports, and run docs format/lint/type/build plus export freshness validation.
- [x] 4.5 Update `repos/arashi-skills` workspace/create guidance, build/extract the package, and run source plus extracted-package validation so generated or packaged content cannot drift while correct standalone guidance remains unchanged.
- [x] 4.6 Run every focused companion check to GREEN and execute the unchanged canonical meta aggregate against every final CLI/docs/skills artifact.

## 5. Child Review, CI, and Merge

- [x] 5.1 Perform a read-only staged-diff audit of the CLI against every normative scenario and sibling destination-planning call site, reconcile concrete findings, commit the verified CLI slice, push without history rewriting, and open the CLI child PR with `Tracks corwinm/arashi-arashi#322`.
- [x] 5.2 Perform separate staged-diff audits, verified commits, pushes, and cross-linked non-closing PRs for docs and packaged guidance; do not publish untouched child repositories.
- [x] 5.3 Verify each child PR's exact head, complete relevant local gates, native CI matrix, eligible-author feedback surfaces, and unresolved GraphQL review threads; address only independently reproduced approved-contract blockers in a bounded correction cycle.
- [x] 5.4 Immediately before each child merge, run the atomic exact-head/CI/review-thread guard, merge children one at a time, verify returned merge SHAs and branch deletion, and record the merged child SHAs in the coordinated proposal branch.

## 6. Coordinated Finalization and Archive

- [x] 6.1 Refresh the meta branch against current `main`, verify merged child trees contain the reviewed surfaces, rerun strict OpenSpec validation plus coordinated schema/docs/skills checks against actual child `main`, and reconcile all proposal task evidence without prematurely checking archive/merge work.
- [x] 6.2 Update the original proposal PR with the complete child PR/SHA set and final implementation evidence, perform one bounded exact-head semantic review of the complete OpenSpec artifact manifest, and require exact manifest identity plus green meta CI and zero eligible unresolved threads.
- [ ] 6.3 Archive and sync `configurable-worktree-naming` only after all pre-archive tasks are complete, validate the canonical specs and archive diff, commit/push the archive on the same meta PR, and rerun exact-head meta gates.
- [ ] 6.4 Merge the final meta PR with the only `Closes #322` reference after the atomic live guard, verify the returned merge SHA and issue closure, then remove the coordinated worktree/branches with `aw remove` and confirm all base repositories are clean and synchronized.
