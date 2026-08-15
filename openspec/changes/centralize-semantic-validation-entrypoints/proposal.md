## Why

Arashi's docs now have a stable, fail-closed semantic validation entrypoint, but the skills and coordinating meta workflows still enumerate feature-specific checker scripts. Each new skills or cross-repository semantic contract therefore churns workflow YAML, risks source/package validation drift, and can require avoidable GitHub `workflow` scope during coordinated merges.

## What Changes

- Add explicit, deterministic aggregate validation entrypoints in `arashi-skills` for authored source guidance and extracted release-shaped skill packages.
- Add a fail-closed registration guard that rejects omitted, stale, duplicate, malformed, or nondeterministically ordered maintained guidance checkers while preserving focused checker commands for TDD and diagnostics.
- Make authoritative skills CI invoke stable aggregate entrypoints instead of enumerating feature-specific checker scripts in workflow YAML.
- Make the meta-repository's authoritative coordinated workflow invoke the stable docs and skills aggregates plus the coordinated contract checker, without naming feature-specific child checkers.
- Preserve per-checker diagnostics, clean-checkout generation/package-boundary validation, executable focused-checker acceptance, and workflow path-trigger reachability.
- Remove superseded feature-specific workflow steps after equivalent-or-stronger aggregate reachability is proven.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arashi-skill-guidance`: Require explicit fail-closed checker registration and stable source/extracted-package aggregate commands while preserving focused validation.
- `cross-repo-command-contracts`: Require authoritative local and CI validation to compose stable child aggregates and coordinated contracts without feature-specific workflow registration.

## Impact

- **Meta repository:** OpenSpec artifacts, `.github/workflows/cross-repo-command-contracts.yml`, package scripts, contract runner/tests, and workflow-reachability fixtures.
- **Skills repository:** aggregate runner/manifest/registration self-test, focused guidance self-tests, release workflow, package validation path, and contributor commands.
- **Docs repository:** no new product behavior; the existing `validate:semantic-docs` aggregate remains the child contract consumed by meta validation.
- **Dependencies and public APIs:** no runtime dependency, CLI behavior, configuration schema, or user-facing command changes. CI registration moves from workflow YAML into ordinary versioned manifests/runners.
