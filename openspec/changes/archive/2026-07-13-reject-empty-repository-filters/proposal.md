## Why

An explicitly supplied `--only` or `--group` value containing only whitespace or commas currently normalizes to the same empty list as an omitted filter. On mutating commands such as `arashi push`, that malformed restrictive filter can therefore broaden the operation to every repository instead of failing safely.

## What Changes

- Distinguish omitted repository filters from explicitly supplied filters that normalize to no values.
- Reject explicitly empty `--only` and `--group` filters as CLI usage errors before command-specific repository operations or mutation begins.
- Preserve existing normalization for valid comma-separated and repeatable filters, including trimming, de-duplication, and omission of blank segments alongside valid values.
- Add shared filter regression coverage plus command-level coverage proving `push` cannot publish repositories when either filter is explicitly empty.
- Preserve the existing unfiltered default selection when `--only` and `--group` are omitted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repository-group-selection`: Require explicitly supplied repository-name and group filters that normalize to no values to fail safely rather than behave as omitted filters.
- `coordinated-branch-publishing`: Require `arashi push` to reject explicitly empty repository filters before evaluating or publishing repositories.

## Impact

- Shared filtering in `repos/arashi/src/lib/repo-filter.ts` and the config-backed adapter in `repos/arashi/src/lib/config/filter-repos.ts`.
- Repo-selecting command integrations that consume the shared filter result, including the `exec` path that currently pre-normalizes `--only` values.
- Unit tests for shared repository filtering and integration tests for `arashi push` human/JSON failure behavior and remote non-mutation.
- No configuration schema, dependency, docs-site, or agent-skill changes are expected because valid filter syntax and command options remain unchanged.
