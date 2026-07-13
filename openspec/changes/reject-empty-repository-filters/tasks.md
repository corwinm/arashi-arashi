## 1. Shared Filter Regression Tests

- [ ] 1.1 Add failing unit cases for omitted filters, whitespace/comma-only `--only`, whitespace/comma-only `--group`, both explicitly empty filters, one empty filter paired with a valid or independently invalid filter, repeated blank values, and blank segments alongside valid values.
- [ ] 1.2 Add coverage for both workspace-repository and config-record filter adapters so explicit-empty metadata, fail-closed selection, and default selection remain consistent.

## 2. Shared Filter Validation

- [ ] 2.1 Extend the shared repository filter result to report every explicitly supplied filter that normalized to no usable values, return no selected repositories whenever that list is non-empty, and preserve existing normalized filter arrays.
- [ ] 2.2 Propagate the explicit-empty result through the config-backed repository filter adapter without changing valid selection, missing-repository, unknown-group, or empty-intersection semantics.

## 3. Command Safety Integration

- [ ] 3.1 Update and add focused rejection coverage for all workspace-repository consumers (`create`, `exec`, `pull`, `push`, and `setup`) so each checks explicitly empty filters before missing/unknown/intersection handling and before command-specific repository work.
- [ ] 3.2 Remove or bypass `exec` pre-normalization that converts an explicitly empty `--only` value to `undefined`, then add focused coverage for the preserved shared validation path.
- [ ] 3.3 Update and add focused rejection coverage for both config-record consumers (`status` and `sync`), including one-document JSON error details where supported and no status/sync operation on selected repositories.
- [ ] 3.4 Add `push` integration regressions for comma-only `--only` and `--group` values, asserting non-zero usage errors, clear option identification, one-document JSON error output with structured invalid-filter details, and no remote branch mutation.

## 4. Validation

- [ ] 4.1 Run focused shared-filter, command, and push tests and confirm the new regressions pass.
- [ ] 4.2 Run `pnpm run lint`, `pnpm run test`, and `pnpm run build` in `repos/arashi`.
- [ ] 4.3 Re-scan repo-selecting commands for local normalization or unchecked shared filter results and confirm no docs, schema, skill, or dependency updates are required.
