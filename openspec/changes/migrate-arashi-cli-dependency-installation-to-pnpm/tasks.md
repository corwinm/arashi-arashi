## 1. Dependency Manager Foundation

- [ ] 1.1 Select and pin a pnpm version compatible with the CLI's supported Node versions in `repos/arashi/package.json`.
- [ ] 1.2 Generate and review `repos/arashi/pnpm-lock.yaml`, remove `repos/arashi/bun.lock`, and verify a clean frozen pnpm install including lifecycle scripts.
- [ ] 1.3 Convert package-script chaining and dependency-local executable invocation to pnpm while leaving direct Bun runtime, test, and compiler commands explicit.

## 2. Local Development Workflow

- [ ] 2.1 Update `repos/arashi/.arashi/hooks/post-create.arashi.sh` to install dependencies with pnpm and preserve expected setup/build behavior.
- [ ] 2.2 Update CLI contributor and agent guidance that instructs maintainers how to install dependencies or run package scripts.
- [ ] 2.3 Confirm end-user documentation for Bun as a supported global install/update channel remains intact and is not incorrectly treated as development-tool coupling.

## 3. CI and Release Workflows

- [ ] 3.1 Convert dependency setup, frozen installation, lockfile path filters, and caches in `repos/arashi/.github/workflows/ci.yml` to pnpm.
- [ ] 3.2 Retain Bun setup in CI only for jobs or steps that execute Bun-dependent tests, source code, or standalone compilation.
- [ ] 3.3 Convert dependency setup and local executable invocation in `repos/arashi/.github/workflows/release.yml` and `.releaserc.json` to pnpm while preserving Bun standalone compilation.
- [ ] 3.4 Verify release asset names, checksum generation, npm wrappers, direct installers, and update paths are unchanged.

## 4. Validation and Follow-up

- [ ] 4.1 From a clean dependency state, run `pnpm install --frozen-lockfile` and verify no Bun lockfile is created or required.
- [ ] 4.2 Run CLI lint, typecheck/schema checks, full tests, and local build through pnpm and record results.
- [ ] 4.3 Run available platform binary and package/install smoke checks to verify the existing distribution contract.
- [ ] 4.4 Audit workflows and scripts for remaining Bun references, classify each as runtime, test, compiler, or user-supported install-channel usage, and remove any remaining dependency-manager-only usage.
- [ ] 4.5 Create or refine follow-up work for Node production API migration, Node-compatible test migration, and a standalone-packaging evaluation covering Node SEA, `pnpm pack-app`, and other maintained alternatives.
- [ ] 4.6 Archive and sync the completed OpenSpec change after implementation PRs are reviewed and validated.
