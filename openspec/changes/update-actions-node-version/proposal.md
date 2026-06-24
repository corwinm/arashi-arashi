## Why

GitHub Actions now warns that Node.js 20-based actions are deprecated and are being forced onto Node.js 24 runners, including the `actions/checkout@v4` and `actions/setup-node@v4` uses called out in issue #164. Updating the meta-repo child workflows keeps CI and release automation on supported action runtimes before the forced compatibility behavior becomes a release risk.

## What Changes

- Update GitHub-owned workflow actions that still target deprecated Node.js 20 runtimes to current major versions across all child repositories.
- Prefer the latest stable major versions verified at implementation time for `actions/checkout` and `actions/setup-node` where those actions are used.
- Review explicit workflow Node setup versions and update Node 20 pins only when needed for runtime consistency with current project support.
- Keep non-GitHub actions and project build/runtime behavior unchanged unless their own runtime support requires a follow-up change.
- Validate each affected child repository workflow after implementation using the repository's relevant CI or workflow-adjacent checks.

## Capabilities

### New Capabilities
- `github-actions-node-runtime-maintenance`: Defines expectations for keeping child repository GitHub Actions workflows on supported Node-backed action runtimes.

### Modified Capabilities
- None.

## Impact

- GitHub issue: corwinm/arashi-arashi#164.
- Affected repositories discovered during planning: `repos/arashi/`, `repos/arashi-docs/`, `repos/arashi-skills/`, and `repos/arashi-vscode/`.
- Likely affected workflow files:
  - `repos/arashi/.github/workflows/ci.yml`
  - `repos/arashi/.github/workflows/release.yml`
  - `repos/arashi-docs/.github/workflows/docs-link-health.yml`
  - `repos/arashi-docs/.github/workflows/docs-validate.yml`
  - `repos/arashi-skills/.github/workflows/release-security-gate.yml`
  - `repos/arashi-skills/.github/workflows/security-audit.yml`
  - `repos/arashi-vscode/.github/workflows/ci.yml`
  - `repos/arashi-vscode/.github/workflows/release.yml`
- No application APIs or user-facing CLI behavior should change.
- Later implementation will require separate child-repository commits/PRs for each repo that changes.
