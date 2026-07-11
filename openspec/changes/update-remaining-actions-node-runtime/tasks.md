## 1. Version and Scope Confirmation

- [x] 1.1 Re-check the latest stable majors, embedded Node runtimes, migration notes, and runner requirements for `actions/cache`, `actions/upload-artifact`, `actions/download-artifact`, `oven-sh/setup-bun`, and `azure/login`.
- [x] 1.2 Inventory every child workflow for JavaScript actions still reported as targeting Node.js 20 and record any intentional exclusions.
- [x] 1.3 Confirm project `node-version` pins, package engine declarations, already-current action references, and transient cache-service errors remain outside the workflow-reference edits.

## 2. `repos/arashi` Workflow and Automation Updates

- [x] 2.1 Update all `oven-sh/setup-bun@v1` and `actions/cache@v4` references in `.github/workflows/ci.yml` to the confirmed supported majors while preserving Bun versions, cache paths, keys, and restore keys.
- [x] 2.2 Update the paired `actions/upload-artifact@v4` and `actions/download-artifact@v4` references to confirmed supported majors while preserving artifact names, paths, and downloaded layout.
- [x] 2.3 Add recurring GitHub Actions dependency automation under `.github/`, or document and verify equivalent repository-wide coverage.
- [x] 2.4 Parse the changed YAML, review the diff for unrelated workflow changes, and run `bun run lint`, `bun run test`, and `bun run build`.
- [x] 2.5 Verify GitHub-hosted CI exercises cache restore/save and the build-artifact producer-consumer path without Node.js 20 deprecation annotations.

## 3. `repos/arashi-docs` Workflow and Automation Updates

- [x] 3.1 Update `oven-sh/setup-bun@v1` in `.github/workflows/docs-link-health.yml` and `.github/workflows/docs-validate.yml` while preserving the requested Bun version and workflow behavior.
- [x] 3.2 Add recurring GitHub Actions dependency automation under `.github/`, or document and verify equivalent repository-wide coverage.
- [x] 3.3 Parse the changed YAML, review the diff for unrelated workflow changes, and run `bun run validate`.
- [x] 3.4 Verify representative docs validation and link-health runs complete without Node.js 20 deprecation annotations.

## 4. `repos/arashi-skills` Workflow and Automation Updates

- [x] 4.1 Update `actions/upload-artifact@v4` in `.github/workflows/release-security-gate.yml` while preserving the artifact name, path, retention behavior, and security-gate semantics.
- [x] 4.2 Add recurring GitHub Actions dependency automation under `.github/`, or document and verify equivalent repository-wide coverage.
- [x] 4.3 Parse the changed YAML, review the diff for unrelated workflow changes, and run the repository's security/package validation relevant to the release gate.
- [x] 4.4 Exercise the release security-gate artifact path safely where practical, or document the validation limitation and a concrete verification plan.

## 5. `repos/arashi-vscode` Workflow and Automation Updates

- [x] 5.1 Update all `actions/cache@v4` references in `.github/workflows/ci.yml` while preserving cache paths, keys, restore keys, and matrix behavior.
- [x] 5.2 Update `azure/login@v2` in `.github/workflows/release.yml` while preserving `id-token: write`, managed-identity/OIDC inputs, and dry-run behavior.
- [x] 5.3 Add recurring GitHub Actions dependency automation under `.github/`, or document and verify equivalent repository-wide coverage.
- [x] 5.4 Parse the changed YAML, review the diff for unrelated workflow changes, and run `bun run lint`, `bun test`, `bun run build`, packaging validation, and the VS Code smoke tests relevant to CI.
- [x] 5.5 Verify cache behavior across the macOS, Ubuntu, and Windows CI matrix without Node.js 20 deprecation annotations.
- [x] 5.6 Exercise Azure login through a safe release-path plan where practical, or document the validation limitation without creating throwaway public probes.

## 6. Cross-Repository Verification and Review

- [x] 6.1 Search all child workflows again for action majors that GitHub reports as targeting Node.js 20 and verify no confirmed occurrence remains.
- [x] 6.2 Confirm cache keys and paths, artifact names and paths, Bun versions, Azure identity inputs, workflow triggers, permissions, jobs, and commands remain equivalent unless a migration note required a documented adjustment.
- [x] 6.3 Confirm each child repository has GitHub Actions dependency automation or a documented equivalent covering every workflow.
- [x] 6.4 Open separate implementation PRs for each affected child repository, reference `corwinm/arashi-arashi#201`, and cross-link the complete related PR set.
- [x] 6.5 Wait for every required and relevant GitHub-hosted check to pass and inspect representative completed-run annotations for the removed warning.
- [x] 6.6 Mark implementation tasks complete only after validation evidence exists, run `openspec validate update-remaining-actions-node-runtime`, and prepare the change for archive/sync after review.
- [x] 6.7 Refresh the pre-merge workflow inventory, update the newly added meta-repository contract workflow from `actions/checkout@v4` to `@v7`, and preserve its checkout paths and repository refs.
- [x] 6.8 Add recurring GitHub Actions dependency automation to the meta-repository and validate the contract workflow through its pull-request check.
