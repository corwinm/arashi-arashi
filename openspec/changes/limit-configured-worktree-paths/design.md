## Context

Arashi already derives one authoritative configured parent destination and appends unchanged configured child paths. `worktreeNaming.style` and `branchSlashes` control the generated parent-relative namespace, while existing registrations and standalone worktrees remain outside that prospective policy.

Issue #333 adds an opt-in full-destination budget. The planner knows the resolved worktree base, generated parent namespace, complete selected child topology, and deterministic plan order, making it the only boundary that can shorten once and keep all consumers consistent.

## Goals / Non-Goals

**Goals:**

- Accept one optional positive integer budget without changing omitted behavior.
- Count paths consistently with Windows path APIs while remaining deterministic on every host.
- Keep readable names while making shortened results stable and collision-resistant.
- Fit one parent namespace against every selected coordinated destination.
- Fail before any mutation when fixed topology cannot fit.
- Preserve existing output shapes except for one explicit structured overflow error.

**Non-Goals:**

- Guaranteeing repository-internal file paths fit.
- Scanning tracked files or recommending a machine-specific value.
- Automatically enabling Windows/Git long paths or selecting a Windows-only default.
- Per-repository budgets, folder-component limits, arbitrary templates, or interactive `aw configure` support.
- Changing standalone placement, existing worktrees, child-relative paths, or Git branch names.

## Decisions

### 1. Add one opt-in full-destination budget

`WorktreeNamingConfig` gains `maxPathLength?: number`. Validation accepts only integers from 1 through 2,147,483,647. Omission remains exact current behavior and is not persisted automatically.

The value applies to the absolute path of every selected configured worktree. A component-only limit is rejected because it cannot account for the workspace root, `worktreesDir`, preserved branch hierarchy, or coordinated child paths. The schema exposes the same integer bounds.

### 2. Count UTF-16 code units

Path length is measured with JavaScript string length after absolute host-path resolution. This counts UTF-16 code units, matching the unit used by Windows wide-character path interfaces. The same configured workspace can therefore make a host-local shortening decision, which is appropriate because absolute roots and path limits are host-local.

Prefix truncation iterates Unicode code points while accumulating UTF-16 units so it never splits a surrogate pair. Path separators each consume one unit.

### 3. Shorten only the generated parent-relative namespace

The planner first derives the ordinary unshortened parent-relative namespace using the existing style/slash policy. It computes the available parent length from the configured absolute limit and the longest selected child suffix. If every selected destination already fits, all paths remain byte-for-byte unchanged.

When shortening is required:

1. Normalize the unshortened generated namespace to `/` separators as the hash source.
2. Compute SHA-256 and retain the first eight lowercase hexadecimal characters.
3. Reserve nine UTF-16 units for `-<hash>`.
4. Retain as much leading generated namespace as fits without splitting a Unicode scalar value, remove trailing separators/hyphens from that prefix, and append `-<hash>` to its final retained component.
5. Convert the fitted portable namespace back to host separators and resolve it beneath the unchanged worktree base.

The hash source is the ordinary generated namespace, not the Git branch alone. Repository/style differences that produce distinct ordinary destinations therefore remain distinct after shortening. Existing deliberate aliases that already produce the same ordinary destination remain ordinary destination collisions; the budget does not redefine naming policy.

**Alternative considered:** hash the branch alone. Rejected because repository-prefixed styles could alias across repositories.

### 4. Fit the complete coordinated plan once

`calculateWorktreePathPlan` remains authoritative. It identifies the parent candidate even when the parent is filtered out, determines the maximum selected child suffix, fits one parent namespace, and then emits parent-first/selected-child records using that exact parent.

Direct single-parent calculation applies the same helper with no child suffix. Children never shorten independently and their configured relative paths remain unchanged.

If fewer than nine units remain for the generated namespace, the planner reports the first ordered destination that cannot fit with code `WORKTREE_PATH_LENGTH_EXCEEDED`. Exact JSON details are:

```json
{
  "repositoryName": "api",
  "worktreePath": "/unshortened/planned/path",
  "maxPathLength": 180,
  "minimumPathLength": 192
}
```

`minimumPathLength` is the shortest collision-resistant absolute destination possible with the fixed base/child topology and nine-unit suffix. The human message identifies the repository, configured limit, and minimum required value and suggests a shorter workspace/worktrees/child path or a larger budget.

### 5. Preserve lifecycle and metadata boundaries

Planning and overflow validation happen before managed-ignore reconciliation, hooks, branch creation, directory creation, or Git mutation. Human preview, dry-run JSON, success JSON, hook contexts, collision checks, materialization, execution, and rollback consume the same fitted records.

Existing worktrees remain Git-metadata-authoritative and are never renamed. Standalone remains `.worktrees/<branch>` and ignores configured naming. The setting reserves path space only at the worktree root; documentation must not claim that repository-internal files are guaranteed to fit.

### 6. Validate source/package/documentation parity

CLI config/schema tests own accepted shape and numeric bounds. Planner and process tests own exact unchanged, shortened, coordinated, overflow, output, and pre-mutation behavior. Native Windows acceptance creates a configured worktree under a long root/branch and verifies every planned root respects the budget.

Docs and packaged skill guidance receive focused checker-first updates. Cross-repository validation compares the exact nested example, field semantics, deterministic hash rule, configured-only scope, and repository-content limitation.

## Risks / Trade-offs

- **Eight hex characters are finite** → collisions remain possible in theory but provide a stable 32-bit namespace; actual destination collision preflight still rejects occupancy and no silent alternate is selected.
- **Host absolute roots differ** → shortening may differ by host, which follows the host-local absolute budget; Git branch identity and existing metadata remain exact.
- **Preserved hierarchy may be cut mid-hierarchy** → only the leading hierarchy that fits remains, followed by the hash in the final retained component; the result stays contained and deterministic.
- **Very small values are syntactically valid but unusable in a given topology** → planning returns the actionable minimum rather than imposing an arbitrary global minimum unrelated to the actual base.
- **Repository files can still exceed downstream limits** → guidance states this limitation and avoids false guarantees.

## Migration Plan

1. Add failing CLI config/schema, pure planner, process-output, non-mutation, and native tests.
2. Implement typed validation, deterministic fitting, authoritative coordinated planning, and structured overflow errors.
3. Add focused docs and packaged-guidance checkers before changing prose, then regenerate exports/packages.
4. Run full child and coordinated validation, open cross-linked child PRs, and verify exact heads/CI/reviews.
5. Merge children only after approval, sync/archive the OpenSpec change on the meta PR, and close #333 from the final coordinated merge.

Rollback is a normal code/docs revert. No persisted default, config migration, branch rewrite, or existing-worktree move requires data rollback.
