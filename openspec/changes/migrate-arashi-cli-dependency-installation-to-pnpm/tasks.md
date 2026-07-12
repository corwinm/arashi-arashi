## 1. Package Manager Foundation

- [x] 1.1 Select and pin pnpm versions compatible with each affected repository's supported Node runtime.
- [x] 1.2 Generate and review `pnpm-lock.yaml` in `arashi-arashi`, `arashi`, `arashi-docs`, and `arashi-vscode`; remove each `bun.lock`; verify clean frozen installs and required lifecycle scripts.
- [x] 1.3 Convert package-script chaining and dependency-local executable invocation to pnpm while leaving only genuinely retained production Bun compiler/runtime commands explicit.
- [x] 1.4 Update meta-repository coordinated-worktree hooks so each affected repository installs dependencies with pnpm.

## 2. Meta-Repository Test Migration

- [x] 2.1 Add Vitest configuration and convert `arashi-arashi` test scripts and dependencies from `bun:test` to Vitest.
- [x] 2.2 Port command-contract scripts, tests, and helpers from Bun runtime APIs to Node filesystem and subprocess APIs.
- [x] 2.3 Convert the cross-repository command-contract workflow to Node, pnpm, and Vitest with no Bun setup.
- [x] 2.4 Run the complete contract test and typecheck/check pipeline and verify the canonical JSON contract remains unchanged.

## 3. Docs Package Manager Migration

- [x] 3.1 Convert `arashi-docs` scripts and TypeScript script execution to pnpm and Node-compatible tooling.
- [x] 3.2 Convert docs validation/link-health workflows and Netlify dependency setup/cache configuration to pnpm.
- [x] 3.3 Update docs contributor/agent guidance for pnpm while preserving user-facing Bun installation-channel documentation.
- [x] 3.4 Run the full docs validation, generated Markdown/LLM export smoke checks, and local/deploy build checks.

## 4. VS Code Extension Test Migration

- [x] 4.1 Add Vitest configuration and convert all `arashi-vscode` unit and integration tests from `bun:test` to Vitest.
- [x] 4.2 Port test helpers and the VS Code integration build helper from Bun APIs to Node APIs and a Node-compatible bundler.
- [x] 4.3 Convert extension CI/release dependency setup, lockfile filters, caches, script orchestration, and local executable invocation to pnpm.
- [x] 4.4 Verify lint, unit tests, build/package smoke tests, and real VS Code extension-host tests on macOS, Ubuntu, and Windows without Bun-dependent test execution.

## 5. CLI Test Migration

- [x] 5.1 Add Vitest configuration and convert CLI unit tests from `bun:test` imports, lifecycle hooks, mocks, and assertions.
- [x] 5.2 Port CLI test fixtures/helpers from `Bun.file`, `Bun.write`, `Bun.spawn`, and `Bun.spawnSync` to Node-compatible APIs while preserving cleanup, output, timeout, and Windows behavior.
- [x] 5.3 Convert CLI integration tests to invoke a Node-compatible test target rather than executing TypeScript through Bun.
- [x] 5.4 Refactor the minimum shared production filesystem/process adapters required for Node-based integration execution, with focused parity tests.
- [x] 5.5 Convert CLI CI/release dependency setup, lockfile filters, caches, and orchestration to pnpm; isolate retained Bun setup to standalone compilation.
- [x] 5.6 Run lint, typecheck/schema checks, the full Vitest suite, package/install smoke tests, and standalone binary builds across the supported platform matrix.

## 6. Audit and Closeout

- [x] 6.1 Search all tracked files for Bun references and classify each remaining reference as production runtime, standalone compiler, historical record, or supported end-user installation channel.
- [x] 6.2 Confirm no affected test, fixture, helper, test workflow, or test job imports `bun:test`, uses Bun runtime APIs, or installs Bun solely to run tests.
- [x] 6.3 Open focused cross-linked implementation PRs for each affected child repository and update this meta/OpenSpec PR with the complete related-PR set.
- [x] 6.4 Create or refine follow-up work for remaining production CLI Bun APIs and standalone packaging evaluation covering Node SEA, `pnpm pack-app`, and other maintained alternatives.
- [ ] 6.5 Archive and sync the completed OpenSpec change after all implementation PRs are reviewed and validated.
