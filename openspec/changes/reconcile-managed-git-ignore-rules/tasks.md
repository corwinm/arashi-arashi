## 1. Shared Managed Ignore Model

- [ ] 1.1 Add failing unit tests for managed-path normalization, deduplication, safe repository-relative classification, and unsafe root/absolute/parent-traversal skips.
- [ ] 1.2 Add failing Git-backed tests for effective tracked, repository-local, and global ignore discovery, including source details and linked-worktree common-directory resolution.
- [ ] 1.3 Implement typed managed-ignore inspect and plan helpers that derive candidates from configured `reposDir` and `worktreesDir` and use Git as the effective-ignore authority.
- [ ] 1.4 Add failing tests for local/tracked/none scope resolution, invalid stored values, clone-local preference persistence, local-default reset, and existing-rule precedence.
- [ ] 1.5 Implement repository-local exclude resolution, `arashi.ignoreScope` local Git config handling, Arashi-owned tracked/local blocks, stale-owned-rule cleanup, user-content preservation, idempotency, and reversible apply/restore results.
- [ ] 1.6 Add Windows/path-separator and repeated-reconciliation coverage for the shared module.

## 2. Init Ignore Scope

- [ ] 2.1 Add failing command and integration tests for `arashi init --ignore-scope local|tracked|none`, explicit/stored/default precedence, existing-workspace local reset without reinitialization, unknown values, existing effective rules, and no global Git mutation.
- [ ] 2.2 Integrate managed-ignore planning into init before managed directory creation and replace the command-specific `.gitignore` updater.
- [ ] 2.3 Register tracked/local preference and ignore-file changes with init dry-run and rollback handling, including downstream failure restoration.
- [ ] 2.4 Extend init human and JSON results with selected scope, effective sources, planned/applied rules, warnings, unsafe skips, and changed state while preserving JSON stdout isolation.
- [ ] 2.5 Regenerate and validate CLI command contract/schema artifacts affected by the new init option and structured fields.

## 3. Lifecycle Reconciliation

- [ ] 3.1 Add failing pull integration tests for fresh clones, parent included/excluded by filters, post-parent config reload, filter reevaluation after renamed/removed repos or groups, changed `reposDir`/`worktreesDir`, new missing children, child partial failure, parent rollback, and final-state reconciliation.
- [ ] 3.2 Restructure pull so a selected parent runs first, successful parent updates trigger config reload and filter reevaluation, failed/excluded parents preserve the pre-pull snapshot, resulting paths reconcile before child pulls, and missing children receive clone guidance without implicit cloning.
- [ ] 3.3 Add failing clone integration tests proving reconciliation occurs before repository materialization for local, tracked, none, existing-rule, unsafe-path, failure, and JSON cases.
- [ ] 3.4 Integrate the shared reconciliation plan with clone mutation, warnings, JSON results, and rollback.
- [ ] 3.5 Add failing add integration tests proving reconciliation precedes config and clone materialization and participates in success, failure rollback, local/tracked/none, existing-rule, unsafe-path, and JSON results.
- [ ] 3.6 Integrate the shared reconciliation plan with add config/clone mutation, human output, JSON results, and rollback.
- [ ] 3.7 Add failing create integration tests proving reconciliation occurs before parent or child worktree creation for local, tracked, none, existing-rule, unsafe-path, dry-run, rollback, linked-worktree, and JSON cases.
- [ ] 3.8 Integrate the shared reconciliation plan with create planning/mutation, human output, JSON results, and rollback.
- [ ] 3.9 Add cross-command idempotency coverage showing init, pull, clone, add, and create share one rule/source model without duplicate writes or headings.

## 4. Diagnostics and Automation Contracts

- [ ] 4.1 Add failing doctor tests for unignored safe paths, stale Arashi-owned rules, invalid stored scope, unsafe configured paths, healthy effective tracked/local/global state, stable finding codes, and strict non-mutation.
- [ ] 4.2 Implement managed-ignore doctor inspection, severity/category mapping, source and path details, and actionable repair suggestions.
- [ ] 4.3 Add JSON envelope tests for managed-ignore results and warnings across init, pull, clone, add, create, and doctor, including exact single-document stdout assertions.
- [ ] 4.4 Update typed JSON result models and command annotations without changing the existing envelope schema version or leaking human output.

## 5. Documentation and Skills

- [ ] 5.1 Update CLI-owned init documentation/help examples for local default, tracked opt-in, none scope, effective-rule precedence, and global-config non-mutation.
- [ ] 5.2 Update `arashi-docs` Getting Started, configuration workflow guidance, and `init`, `pull`, `clone`, `add`, and `create` command pages with lifecycle reconciliation behavior and the distinction from zero-config issue #212.
- [ ] 5.3 Update automation/agent guidance and `arashi-skills` instructions so agents expect clone-local reconciliation, understand tracked/none preferences, and do not modify global Git configuration.
- [ ] 5.4 Regenerate docs command indexes, Markdown routes, `llms-full.txt`, and related agent-readable outputs; verify the new option and lifecycle guidance appear in generated content.
- [ ] 5.5 Update cross-repository command/docs/skills contract expectations for the new init option and affected command guidance.

## 6. Validation and Delivery

- [ ] 6.1 Run focused managed-ignore, init, pull, clone, add, create, doctor, JSON, Windows/path, rollback, and contract tests in `corwinm/arashi`.
- [ ] 6.2 Run full CLI validation with `pnpm run lint`, `pnpm run test`, `pnpm run build`, schema freshness, command-contract freshness, package smoke checks, and Git diff checks.
- [ ] 6.3 Run `pnpm validate` and generated-route/content smoke checks in `corwinm/arashi-docs`.
- [ ] 6.4 Run the `arashi-skills` security gate, self-test, packaging-boundary checks, and cross-repository coverage validation.
- [ ] 6.5 Open focused cross-linked CLI, docs, and skills PRs plus the meta/OpenSpec PR, record exact validation evidence, and keep the meta PR as the sole eventual closing-keyword owner for issue #213.
