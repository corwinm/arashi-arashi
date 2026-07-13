## Context

Bun currently fills several roles across Arashi repositories: dependency resolver, package-script runner, test framework, TypeScript runtime, bundler, and standalone executable compiler. These roles are separable. pnpm and Vitest are production-ready for dependency management and Node-based testing now, while replacing the CLI's standalone compiler still needs a dedicated evaluation against the existing release contract.

Current repository boundaries:

- `arashi-arashi`: Bun dependency management plus Bun-based contract scripts/tests.
- `arashi`: Bun dependency management, production runtime APIs, `bun:test`, and standalone compilation.
- `arashi-docs`: primarily Bun dependency management and TypeScript script execution; no significant Bun test suite.
- `arashi-vscode`: Bun dependency management, `bun:test`, Bun compilation, and a Bun build API in the extension integration-test helper.
- `arashi-skills`: no JavaScript package manager.

## Goals / Non-Goals

**Goals:**

- Make pnpm authoritative across every Arashi repository that installs JavaScript dependencies.
- Replace `bun:test` with Vitest in the meta-repository, CLI, and VS Code extension.
- Remove Bun runtime APIs from tests, fixtures, and test-only build helpers.
- Preserve current test coverage, integration behavior, and platform matrices.
- Isolate any remaining Bun usage to production runtime or compilation paths that require separate migration work.

**Non-Goals:**

- Selecting or deploying the CLI's final standalone executable packager.
- Changing release asset names, direct installers, update behavior, or supported end-user installation channels.
- Removing Bun as a supported way for users to install the published Arashi npm package.
- Rewriting production CLI Bun APIs unless a production helper must become Node-compatible to allow Node-based integration testing.
- Migrating `arashi-skills`, which has no package-manager dependency.

## Decisions

### Use pinned pnpm versions and per-repository lockfiles

Each affected repository will declare an exact pnpm version through `packageManager`, commit `pnpm-lock.yaml`, and use frozen installs. CI, release, Netlify, and worktree hooks will follow the owning repository's declaration.

**Alternative considered:** keep Bun lockfiles while invoking pnpm in selected jobs. Rejected because dual authoritative resolvers make local, CI, and release dependency graphs diverge.

### Standardize tests on Vitest

Vitest provides Node-native TypeScript test execution with familiar Jest-like assertions, lifecycle hooks, mocking, filtering, and coverage integration. Existing suites will import from `vitest`; configuration will preserve current include patterns, serial/concurrent assumptions, timeouts, and environment.

**Alternative considered:** Node's built-in test runner. It has fewer migration conveniences for the existing `bun:test` mocking and matcher surface, so Vitest is the lower-risk transition for these suites.

### Replace Bun APIs in tests with Node APIs, not shims

Test code and helpers will use `node:fs/promises`, `node:child_process`, temporary-directory APIs, and shared Node-compatible helpers. Vitest APIs will replace Bun mock and lifecycle APIs. A `bun:test` compatibility layer is explicitly avoided because it would retain conceptual and tooling coupling.

### Decouple extension test bundling from Bun

The VS Code integration test helper currently imports Bun's build API. It will use the same Node-compatible bundler selected for extension builds—preferably esbuild or an existing project-compatible equivalent—so the extension-host test suite can run without Bun. This does not require changing user-visible extension behavior.

### Allow narrow production refactoring where integration tests require it

Some CLI integration tests execute TypeScript source that currently depends on Bun. The implementation may either test a Node-compatible bundled build or migrate shared filesystem/process helpers needed by the tested path. Any production refactoring must preserve behavior and stay limited to enabling Node execution; full standalone packaging remains separate.

### Keep standalone compilation separate

A later packaging spike will compare Node SEA, `pnpm pack-app`, and other maintained options against current assets, native OS build requirements, installers, updates, checksums, startup behavior, and signing/notarization needs. Bun may remain installed only in jobs that still compile standalone binaries.

## Risks / Trade-offs

- **Large test surface across three repositories** → Migrate repository by repository with focused parity checks and separate child PRs.
- **Bun and Vitest mocks differ** → Port behavior explicitly, verify mock restoration and module isolation, and avoid mechanical import-only changes.
- **Subprocess timing can expose flakes** → Preserve timeout intent, use event-based readiness, and validate macOS/Linux/Windows CI before considering migration complete.
- **Node execution may expose production Bun APIs during integration tests** → Bundle for Node or migrate the minimum shared production adapters needed; do not silently run migrated tests through Bun.
- **pnpm lifecycle policy differs from Bun** → Review required build/lifecycle scripts and configure approvals explicitly rather than broadly enabling all dependency scripts.
- **Temporary Bun compiler remains** → Keep compiler setup isolated and track full removal under issue #155 rather than claiming completion.

## Migration Plan

1. Convert `arashi-docs` to pnpm and Node-compatible TypeScript script execution; validate the full docs pipeline and Netlify configuration.
2. Convert `arashi-arashi` to pnpm/Vitest and port its contract scripts/tests to Node-compatible APIs.
3. Convert `arashi-vscode` to pnpm/Vitest, replace its Bun test-build helper with a Node-compatible bundler, and validate the extension-host matrix.
4. Convert `arashi` to pnpm/Vitest, port tests/helpers, and establish a Node-compatible test execution target while retaining Bun standalone compilation only where necessary.
5. Update meta-repository worktree hooks after each child repository declares its package manager.
6. Audit every remaining Bun reference and classify it as production runtime, standalone compiler, historical documentation, or supported end-user install channel.
7. Open focused, cross-linked child PRs and retain the meta/OpenSpec PR for final archive/sync.

Rollback is per repository: restore its Bun lockfile, manifest declaration, test imports/configuration, and workflow commands if parity or platform validation fails before merge.

## Open Questions

- The CLI integration suite directly executes erasable TypeScript with Node 24.
- Can the VS Code extension's production build and integration-test build move to one esbuild configuration in this change, eliminating Bun compilation there entirely?
- Which exact pnpm and Vitest versions best match each repository's supported Node version at implementation time?
