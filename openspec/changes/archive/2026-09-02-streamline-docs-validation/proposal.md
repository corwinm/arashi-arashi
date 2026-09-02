## Why

The documentation pipeline currently repeats validation and builds across GitHub Actions and Netlify, increasing runtime without adding coverage. Its scheduled external-link workflow also converts real checker failures into successful runs, so maintainers cannot trust a green status.

## What Changes

- Make scheduled and manually dispatched external-link failures visible while keeping the network-dependent check outside pull-request gates.
- Retry unsuccessful external-link `HEAD` probes with bounded `GET` requests so servers with incomplete `HEAD` support do not produce false failures.
- Run external-link health directly on pinned Node.js without installing the documentation dependency tree.
- Remove duplicate semantic-registration execution from GitHub Actions.
- Make GitHub Actions the sole quality-validation authority and give every Netlify deployment context one inherited build-only path.
- Remove the no-op GitHub Actions publish-gate status.
- Add deterministic workflow/config tests that reject duplicate-build and false-green drift.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `documentation-site`: Define truthful failure reporting and separate GitHub validation from Netlify build/publication responsibilities.

## Impact

- `arashi-docs/.github/workflows/docs-validate.yml`
- `arashi-docs/.github/workflows/docs-link-health.yml`
- `arashi-docs/netlify.toml`
- `arashi-docs/package.json`, `scripts/check-external-links.ts`, and focused request/workflow/config regression tests
- GitHub Actions status topology and Netlify build commands; no user-facing documentation content or production URL changes
