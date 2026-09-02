## Context

`arashi-docs` has two execution systems: GitHub Actions validates repository changes and Netlify builds deploy previews/production. Their current command graphs overlap internally and across systems. The scheduled external-link workflow is intentionally non-blocking for pull requests, but job-level `continue-on-error` also hides its failures from maintainers.

## Goals / Non-Goals

**Goals:**

- Make every status truthful about the command it ran.
- Preserve deterministic docs validation as the required pull-request gate.
- Preserve automatic Netlify deploy previews and production publication.
- Eliminate deterministic quality-validation duplication between GitHub Actions and Netlify.
- Keep volatile network checks separate from pull-request validation.

**Non-Goals:**

- Replace Netlify or make GitHub Actions deploy the site.
- Add external-link checks to pull requests.
- Change site content, routes, redirects, or design.

## Decisions

### GitHub Actions owns deterministic quality validation

`Docs Validate` remains the pull-request/default-branch quality workflow and invokes the canonical `pnpm validate` command once. The separate semantic-registration step and no-op `publish-gate` job are removed because the canonical command already includes registration and the status does not control Netlify.

Alternative: retain the explicit registration step for visibility. Rejected because it performs the same executable check twice and the canonical validation log already names it.

### Netlify owns only deployment builds and publication

All Netlify contexts inherit one shared setup/install plus `pnpm build` command. Netlify does not repeat lint, semantic, internal-link, or accessibility validation owned by the required GitHub check, and no production/preview/branch override can reintroduce a second command graph. Build failures still stop the corresponding deployment.

Alternative: retain context-specific quality checks so an invalid preview fails before GitHub validation completes. Rejected because this preserves the cross-system duplication the change is intended to remove; GitHub remains the merge authority, while Netlify is authoritative only for buildability and publication.

### Scheduled external-link health uses final-response truth and stays isolated

For each URL, retain the inexpensive `HEAD` probe, but follow every unsuccessful `HEAD` probe—including request errors—with a bounded `GET`. The final `GET` outcome determines availability, avoiding false failures from servers that reject or abort `HEAD` while serving `GET`. Remove `continue-on-error`; the workflow remains schedule/manual-only, so a final failure is visible without blocking pull requests. Use pinned Node.js directly and skip package caching and dependency installation because the checker imports only built-in Node.js modules.

Alternative: retry only `405` and `501`. Rejected because live evidence shows a server can return `404` for `HEAD` and `200` for `GET`. Always returning success and creating an issue or notification was also rejected because it adds write permissions/state management when a truthful scheduled workflow status already provides the necessary signal.

### Regression tests validate command topology

Add deterministic HTTP tests for the `HEAD`/`GET` decision and a focused Node test that parses the workflow/config text and verifies the operational invariants: no failure suppression, no dependency installation in external health, one canonical GitHub validation call, no no-op gate, one inherited Netlify command, exactly one build, and no deterministic quality commands in Netlify. Tests assert command relationships rather than exact entire-file snapshots.

## Risks / Trade-offs

- [A docs quality check no longer runs in Netlify] → Keep every deterministic quality check in the required GitHub `pnpm validate` entrypoint and verify that pipeline on the exact PR and merge heads.
- [Removing `publish-gate` affects an undocumented external requirement] → Verify live rulesets/check requirements before removal and inspect exact-head Netlify checks on the PR.
- [Scheduled external links remain transient] → Use bounded requests, accept a URL only from a successful final response, keep the check outside PR gates, and permit manual reruns after investigation.

## Migration Plan

1. Land the docs-repository change through its required `Validate docs quality gates` check and one-build Netlify deploy preview.
2. From the reviewed implementation head, create a disposable remote branch that adds one Markdown link under the reserved `.invalid` top-level domain. Manually dispatch external-link health against that exact ref, verify the run `headSha` matches the fixture commit and the workflow fails with the checker diagnostic, then delete the disposable branch.
3. Dispatch external-link health against the exact clean implementation ref, verify its `headSha`, and verify success including the live Marketplace URL whose `HEAD`/`GET` behavior exposed the fallback gap.
4. Merge the docs PR, then bind the default-branch validation run and Netlify production deploy to the docs merge SHA before archiving the OpenSpec change or merging the meta PR. Smoke-test the public homepage, representative nested/generated routes, and install/uninstall redirects.
5. If validation, deployment, or endpoint smoke tests fail, open a revert PR for the docs merge, require its checks, merge it, and verify the revert SHA in GitHub Actions, Netlify production, and the public endpoint before continuing.
6. Only after successful production verification, archive the OpenSpec change, validate the effective specification, and deliver the meta PR at the exact merged child head.

## Open Questions

None.
