## Context

The CLI repository currently uses one tool, Bun, for four distinct concerns: dependency resolution, package-script orchestration, TypeScript/test execution, and cross-platform standalone compilation. Issue #155 ultimately seeks to remove Bun, but replacing all four concerns at once would couple a low-risk package-manager migration to unresolved standalone-packaging decisions and broad runtime/test rewrites.

The current release contract produces macOS arm64, Linux x64, and Windows x64 executables, checksums, npm wrappers, and direct-installer assets. This first slice must not disturb that contract.

## Goals / Non-Goals

**Goals:**

- Make pnpm the authoritative dependency installer and lockfile owner for `corwinm/arashi`.
- Make package scripts, CI, releases, and coordinated-worktree setup consistently invoke dependency-local tools through pnpm.
- Preserve frozen, reproducible installs and cache behavior.
- Clearly expose the remaining intentional Bun runtime/compiler/test boundary.

**Non-Goals:**

- Replacing production `Bun.file`, `Bun.write`, `Bun.spawn`, or `Bun.$` usage.
- Migrating `bun:test` to Vitest or another framework.
- Replacing `bun build --compile`, choosing Node SEA/`pnpm pack-app`, or changing release target coverage.
- Removing Bun as a supported end-user package-manager installation channel.
- Migrating the meta-repo, docs, or VS Code extension in this change.

## Decisions

### Use a pinned pnpm release through `packageManager`

`package.json` will declare an exact pnpm version and `pnpm-lock.yaml` will replace `bun.lock`. CI and release workflows will activate the declared package manager through Corepack or the repository-standard pnpm setup action and install with `--frozen-lockfile`.

**Alternative considered:** keep Bun's lockfile while using pnpm only in CI. Rejected because two authoritative resolvers would make local and CI dependency graphs diverge.

### Separate orchestration commands from retained Bun commands

Scripts that invoke other package scripts or dependency-local executables will use pnpm. Scripts that genuinely require Bun—the test runner, source execution where Bun APIs remain, and standalone compilation—will invoke Bun explicitly until follow-up migrations replace those capabilities.

**Alternative considered:** rename every `bun` token immediately. Rejected because `pnpm run test` cannot make `bun:test` Node-compatible and pnpm cannot replace `bun build --compile` by itself.

### Preserve Bun setup only in jobs that execute Bun

Workflow steps will install dependencies with pnpm. Bun setup remains only where a subsequent command actually runs Bun for tests, source execution, or compilation. Cache keys and dependency invalidation will use `pnpm-lock.yaml`.

### Keep standalone packaging evaluation separate

A later packaging spike will compare Node SEA, `pnpm pack-app`, and other maintained options against current target assets, installer/update compatibility, checksums, startup behavior, native OS build requirements, and signing/notarization needs. The first slice creates no dependency on an immature packaging choice.

## Risks / Trade-offs

- **Two tools remain temporarily present** → Name the boundary in scripts and contributor guidance; pnpm owns dependencies while Bun temporarily owns runtime/test/compiler functions.
- **Lockfile conversion can resolve different transitive versions** → Review the pnpm lock diff, run full lint/test/build/schema checks, and verify package metadata plus release smoke behavior.
- **Lifecycle scripts can differ between package managers** → Verify Husky setup and any package build scripts on a clean frozen install.
- **CI jobs may accidentally omit Bun while still invoking it** → Audit each workflow command after conversion and keep narrowly scoped Bun setup steps where required.
- **The change may be interpreted as completing issue #155** → Proposal and PR wording will use `Tracks #155` and explicitly list follow-up runtime, test, and packaging work.

## Migration Plan

1. Pin pnpm, generate `pnpm-lock.yaml`, and remove `bun.lock` in the CLI repository.
2. Convert package-script orchestration and dependency-local executable invocation to pnpm while retaining direct Bun runtime/test/compiler commands.
3. Convert the CLI post-create hook and contributor dependency-install commands.
4. Convert CI and release dependency setup/cache behavior to pnpm; retain Bun setup only where executed.
5. Validate from a clean install with frozen lockfile, then run lint, typecheck/schema checks, tests, local build, and available platform/release smoke checks.
6. Roll back by restoring `bun.lock`, the Bun `packageManager` declaration, and prior workflow/hook commands if dependency resolution or release validation regresses.

## Open Questions

- Which exact pnpm version should be pinned based on the current supported Node release and repository policy at implementation time?
- Should follow-up runtime and test migrations be separate changes, or combined once the shared Node subprocess adapter is proven?
- Which standalone packaging candidate first meets the current release matrix and installer contract well enough for a production spike?
