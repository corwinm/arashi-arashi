## Why

Arashi's docs now have a stable, fail-closed semantic validation entrypoint, but the skills and coordinating meta workflows still enumerate feature-specific checker scripts. Each new skills or cross-repository semantic contract therefore churns workflow YAML, risks source/package validation drift, and can require avoidable GitHub `workflow` scope during coordinated merges.

## What Changes

- Add explicit, deterministic aggregate validation entrypoints in `arashi-skills` for authored source guidance and extracted release-shaped skill packages.
- Add a fail-closed registration guard that rejects omitted, stale, duplicate, malformed, or nondeterministically ordered maintained guidance checkers while preserving focused checker commands for TDD and diagnostics.
- Add the equivalent fail-closed registration contract for the meta repository's maintained `check-*-contracts.ts` entrypoints, and make both local and CI meta aggregates consume it.
- Make authoritative skills CI invoke stable aggregate entrypoints instead of enumerating feature-specific checker scripts in workflow YAML.
- Make the meta-repository's authoritative coordinated workflow invoke the stable docs and skills aggregates plus the coordinated contract checker, without naming feature-specific child checkers.
- Define one canonical skills release-archive producer and member policy, while keeping semantic package validation scoped to its extracted `skills/arashi` subtree.
- Preserve per-checker diagnostics, single-owner docs generation, clean-checkout generation/package-boundary validation, executable focused-checker acceptance, documented local validation, and workflow path-trigger reachability.
- Remove superseded feature-specific workflow steps after equivalent-or-stronger aggregate reachability is proven.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arashi-skill-guidance`: Require explicit fail-closed checker registration and stable source/extracted-package aggregate commands while preserving focused validation.
- `cross-repo-command-contracts`: Require fail-closed meta checker registration and authoritative local/CI composition of stable child and coordinated aggregates without feature-specific workflow registration.

## Impact

- **Meta repository:** OpenSpec artifacts, `.github/workflows/cross-repo-command-contracts.yml`, coordinated checker manifest/runner, package scripts, local-validation documentation, contract runner/tests, and workflow-reachability fixtures.
- **Skills repository:** aggregate runner/manifest/registration self-test, focused guidance self-tests, canonical release-archive producer/member policy, release workflow, package validation path, and contributor commands.
- **Docs repository:** no new product behavior; the existing `validate:semantic-docs` aggregate remains the child contract consumed by meta validation.
- **Dependencies and public APIs:** no runtime dependency, CLI behavior, configuration schema, or user-facing command changes. CI registration moves from workflow YAML into ordinary versioned manifests/runners.
