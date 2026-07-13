## Context

Repository selection is implemented by two related helpers: `src/lib/repo-filter.ts` filters discovered `WorkspaceRepository` values, while `src/lib/config/filter-repos.ts` adapts the same normalization for configuration records. Both currently normalize omitted input and explicitly blank input to `[]`, then interpret an empty normalized list as no restriction. Commands validate missing repositories, unknown groups, and empty intersections after filtering, but they have no signal for an explicitly supplied filter with zero usable values. `exec` additionally pre-normalizes `--only` and converts an empty result back to `undefined`, erasing explicitness before the shared helper runs.

The failure must be caught before a command acts on its selected repositories through planning, hooks, child command execution, status reporting, or mutation. Prerequisite workspace/configuration discovery may still occur so commands can establish their normal context and output mode. Existing valid syntax remains repeatable and comma-separated, and blank segments beside valid values are currently ignored.

## Goals / Non-Goals

**Goals:**

- Preserve whether `--only` and `--group` were explicitly supplied after normalization.
- Return a shared, command-consumable validation signal when a supplied filter contains no usable values, and fail closed with no selected repositories even if a consumer has not yet formatted the error.
- Make every repo-selecting command reject that signal before operating on repositories.
- Prove with `push` integration tests that malformed restrictive filters cannot publish any remote branch.
- Preserve default all-repository selection when filters are omitted and preserve valid mixed comma/repeatable normalization.

**Non-Goals:**

- Rejecting blank comma segments when at least one valid filter value remains.
- Changing `--only`/`--group` option names, repeatability, comma-separated syntax, or unknown-filter behavior.
- Adding configuration, schema, documentation-site, or skill-package changes.
- Consolidating the two existing repository result shapes beyond the minimum shared validation behavior.

## Decisions

### Represent explicit emptiness in the shared filter result

Add an `emptyFilters` field (or equivalently explicit per-filter flags) to both shared filter result shapes. A filter is explicitly empty when its raw argument is not `undefined` but `normalizeFilterList(...)` returns no values. Omitted filters remain distinguishable because their raw arguments are `undefined`. When `emptyFilters` is non-empty, the filter helper returns no selected repositories regardless of the other filter, so malformed restrictive input cannot broaden selection even if a caller fails to format the error.

This keeps normalization pure and lets commands preserve their existing error/output conventions, including JSON envelopes. Throwing directly from `normalizeFilterList()` was rejected because normalization is reused in different command contexts and a thrown generic error would bypass structured result handling.

### Treat only all-blank input as invalid

Inputs such as `","`, `"  "`, repeated blank values, or arrays containing only those values are invalid. Inputs such as `"arashi,"` continue to normalize to `["arashi"]`. This targets accidental broadening without turning harmless separators around valid values into a breaking syntax change.

Rejecting every blank segment was considered but would change established comma-list normalization more broadly than required by the safety issue.

### Validate before consuming the selected repositories

Each consumer of the shared filter helpers checks the complete accumulated `emptyFilters` list before missing repositories, unknown groups, empty intersection, or command-specific repository work. The error identifies the offending option (`--only`, `--group`, or both) and exits through the command's usage-error path. JSON-capable commands emit one JSON error envelope whose structured details identify the invalid filters. This ordering makes malformed input deterministic, gives explicit emptiness precedence even when the other filter is valid or independently invalid, and ensures no selected repository is acted upon or mutated.

For `exec`, remove or bypass the local `normalizeOnlyFilters()` conversion and pass the raw Commander option values into the shared helper so explicit emptiness is not lost.

### Use shared unit coverage plus push mutation-boundary coverage

Unit tests cover omitted, only-blank, comma-only, repeated blank, mixed valid/blank, both-empty-filter, and one-empty/one-valid-or-invalid cases on the shared helper. Focused command tests cover all seven consumers (`create`, `exec`, `pull`, `push`, `setup`, `status`, and `sync`) so each error path is exercised. Push integration tests exercise `arashi push --only ,` and `arashi push --group ,` (including JSON where appropriate), assert a non-zero usage exit and clear error, and verify no candidate remote branch was created. Existing unfiltered push tests continue proving omitted filters retain normal selection.

`push` is the command-level regression target because it is the highest-risk externally mutating consumer named in the issue; shared helper tests and auditing all consumers cover the broader command surface without duplicating expensive integration fixtures for every command.

## Risks / Trade-offs

- [A consumer forgets to check the new result field] → Make the helper itself fail closed with no selection, enumerate and test all seven current consumers, and keep the result field required in TypeScript for consistent error formatting.
- [A command pre-normalizes input and erases explicitness] → Remove the known `exec` conversion and search for all normalization wrappers before implementation is considered complete.
- [Errors differ across commands] → Require identification of the invalid option and preserve each command's established human/JSON usage-error mechanism rather than introducing a new global error framework.
- [Remote non-mutation test gives a false positive] → Prepare publishable commits on candidate repositories before invoking malformed filters, then assert their feature refs are absent from the bare remotes.
