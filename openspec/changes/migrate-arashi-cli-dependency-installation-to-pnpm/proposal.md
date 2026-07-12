## Why

Arashi currently uses Bun for dependency installation, source execution, tests, and standalone binary compilation, which makes replacing the compiler for issue #155 an unnecessarily all-or-nothing migration. Moving dependency management to pnpm first reduces Bun coupling immediately, establishes the intended Node ecosystem workflow, and leaves the existing production binaries intact while Node SEA, `pnpm pack-app`, and other packaging alternatives mature.

## What Changes

- Make pnpm the declared dependency manager for the Arashi CLI repository and commit a pnpm lockfile.
- Use pnpm for frozen dependency installation, package-script orchestration, local executable invocation, CI caching, release dependency setup, and coordinated-worktree setup.
- Retain Bun temporarily where it is still the actual runtime, test framework, or standalone executable compiler.
- Document the temporary boundary so pnpm-based installation is not mistaken for complete Bun removal.
- Preserve the current npm package, direct installers, standalone release assets, checksums, and supported update paths.
- Defer production `Bun.*` API replacement, test-framework migration, and standalone-packager selection to later changes.

## Capabilities

### New Capabilities

- `cli-dependency-management`: Defines reproducible pnpm-based dependency installation and script orchestration for the Arashi CLI while allowing explicitly retained build/runtime tools during migration.

### Modified Capabilities

<!-- No existing user-facing capability requirements change in this first migration slice. -->

## Impact

- Affected repository: `corwinm/arashi`.
- Expected paths include `package.json`, the dependency lockfile, CI and release workflows, the Arashi post-create hook, and contributor guidance that describes development dependency installation.
- Bun remains required temporarily for source/test execution and `bun build --compile`; the CLI's runtime behavior and release artifact contract do not change.
- Follow-up work can independently migrate production filesystem/process APIs to Node, port tests to a Node-compatible framework, and evaluate production-ready standalone packaging alternatives for issue #155.
