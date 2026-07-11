## Why

GitHub is forcing several older JavaScript actions in Arashi workflows from their deprecated Node.js 20 runtime onto Node.js 24. Issue #201 follows #164 by moving every remaining affected action to a release designed and tested for Node.js 24, while preserving existing CI, release, cache, artifact, Bun setup, and Azure OIDC behavior.

## What Changes

- Inventory all workflows in the four Arashi child repositories for actions that GitHub reports as targeting Node.js 20.
- Update affected `actions/cache`, `actions/upload-artifact`, `actions/download-artifact`, `oven-sh/setup-bun`, and `azure/login` references to current supported stable majors verified at implementation time.
- Preserve cache keys and paths, artifact names and paths, Bun versions, workflow triggers and permissions, and Azure managed-identity/OIDC inputs.
- Validate each affected child repository independently and confirm representative completed GitHub Actions runs no longer emit the Node.js 20 deprecation annotation.
- Add or document GitHub Actions dependency automation coverage in each child repository so future action runtime-major drift is surfaced earlier.
- Generalize the existing multi-repository traceability requirement so it applies to this and future action-runtime maintenance sweeps rather than only issue #164.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `github-actions-node-runtime-maintenance`: Make coordinated sweep traceability reusable and require action dependency-automation coverage or an explicit documented alternative.

## Impact

- GitHub issue: `corwinm/arashi-arashi#201`.
- Affected repositories discovered during planning: `repos/arashi/`, `repos/arashi-docs/`, `repos/arashi-skills/`, and `repos/arashi-vscode/`.
- Affected workflow files:
  - `repos/arashi/.github/workflows/ci.yml`
  - `repos/arashi-docs/.github/workflows/docs-link-health.yml`
  - `repos/arashi-docs/.github/workflows/docs-validate.yml`
  - `repos/arashi-skills/.github/workflows/release-security-gate.yml`
  - `repos/arashi-vscode/.github/workflows/ci.yml`
  - `repos/arashi-vscode/.github/workflows/release.yml`
- Dependency automation configuration may be added in each child repository; no current child repository has a Dependabot configuration.
- No application API, CLI behavior, package engine declaration, explicit project Node version, cache contract, artifact contract, Bun version, or Azure identity configuration should change.
- Each affected child repository requires its own implementation commit, PR, validation evidence, and cross-links to the related work.
